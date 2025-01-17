const Invitations = require("../models/Invitations");
const User = require("../models/User");
const Batch = require("../models/Batch");
const Blocklist = require("../models/Blocklist");
const { sendEmail } = require("../config/nodemailerConfig");
const crypto = require("node:crypto");

const studentController = {
  // Create Student
  addStudent: async (req, res) => {
    try {
      const newStudent = new Student(req.body);
      const savedStudent = await newStudent.save();
      res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: savedStudent,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create student",
        error: error.message,
      });
    }
  },

  // Delete Student
  deleteStudent: async (req, res) => {
    try {
      const deletedStudent = await Student.findByIdAndDelete(req.params.id);
      if (!deletedStudent) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }
      res.json({
        success: true,
        message: "Student deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete student",
        error: error.message,
      });
    }
  },

  //getAllStudentsOfABatch
  getAllStudentsOfABatch: async (req, res) => {
    try {
      const batch = req.batch;

      res.json({
        students: batch.students,
        success: true,
        message: "Students fetched",
      });
    } catch (error) {
      res.json({
        success: false,
        message: "Failed to get students",
        erroe: error.message,
      });
    }
  },

  //getAllBlockedStudentsOfABatch
  getAllBlockedStudentsOfABatch: async (req, res) => {
    try {
      const batch = req.batch;

      const blockedStudents = await Blocklist.find({ batchId: batch._id })
        .populate("blockedUser", "name _id email avatar")
        .populate("blockedBy", "name _id");

      res.json({
        students: blockedStudents,
        success: true,
        message: "Blocked Students fetched successfully",
      });
    } catch (error) {
      res.json({
        success: false,
        message: "Failed to get blocked students",
        erroe: error.message,
      });
    }
  },

  //getInviteCode
  generateInviteCode: async (req, res) => {
    try {
      const query = {
        $or: [{ teachers: req.user._id }, { owner: req.user._id }],
        _id: req.params.batchId,
      };

      const batch = await Batch.findOne(query);
      if (!batch) {
        return res.status(404).json({
          message: "You do not have access to invite students",
          success: false,
        });
      }

      const baseUrl = `/batches/${req.params.batchId}/invite`;

      const inviteCode = `${crypto
        .randomBytes(20)
        .toString("hex")}_${Date.now()}`;

      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 1000)
      );

      const invitation = new Invitations({
        inviteCode,
        expiresAt,
        MadeBy: req.user._id,
      });

      await invitation.save();

      res.json({
        success: true,
        message: "Invite code created successfully",
        inviteCode: `${process.env.CLIENT_URL}${baseUrl}/${invitation.inviteCode}`,
      });
    } catch (error) {
      res.json({
        success: false,
        message: "Failed to create invite code",
        error: error.message,
      });
    }
  },

  // Add Students By Sending Email To Them
  addStudentsByEmail: async (req, res) => {
    try {
      const query = {
        $or: [{ teachers: req.user._id }, { owner: req.user._id }],
        _id: req.params.batchId,
      };
      const isTeacherOrOwnerOfBatch = await Batch.findOne(query);

      if (!isTeacherOrOwnerOfBatch) {
        return res.status(404).json({
          message: "You do not have access to invite students",
          success: false,
        });
      }

      const emails = req.body;

      const users = await User.find({ email: { $in: emails } });
      const unregisteredEmails = emails.filter(
        (email) => !users.some((user) => user.email === email)
      );

      if (unregisteredEmails.length > 0) {
        const baseUrl = `/batches/${req.params.batchId}/invite`;
        const invitations = unregisteredEmails.map((email) => {
          const inviteCode =
            crypto.randomBytes(20).toString("hex") + `_${Date.now()}`;
          const expiresAt = new Date(
            Date.now() + 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 1000)
          );
          return {
            email,
            inviteCode,
            expiresAt,
            MadeBy: req.user._id,
          };
        });

        await Invitations.insertMany(invitations);

        await Promise.all(
          invitations.map((invitation) =>
            sendEmail(
              invitation.email,
              "Invitation",
              `You are invited to join the batch. Please create an account and accept the invite.`,
              `
            <p style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; padding: 1rem; background-color: #f5f5f5; border: 1px solid #ccc; border-radius: 0.25rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); max-width: 400px;">Click here: <a style="text-decoration: none; color: #4CAF50; background-color: #f5f5f5; padding: 14px 20px; margin: 8px 0; border: none; display: inline-block; cursor: pointer; width: 100%;" href="http://${process.env.CLIENT_URL}/auth/sign-up/?redirectUrl=${baseUrl}/${invitation.inviteCode}" target="_blank">here</a> to create an account and accept the invite.</p>
          `
            )
          )
        );
      }

      if (users.length > 0) {
        await Promise.all(
          users.map((user) =>
            sendEmail(
              user.email,
              "Invitation",
              `You are invited to join the batch. Please accept the invite.`,
              `
          <p style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; padding: 1rem; background-color: #f5f5f5; border: 1px solid #ccc; border-radius: 0.25rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); max-width: 400px;">Click here: <a style="text-decoration: none; color: #4CAF50; background-color: #f5f5f5; padding: 14px 20px; margin: 8px 0; border: none; display: inline-block; cursor: pointer; width: 100%;" href="http://${process.env.CLIENT_URL}/batches/${req.params.batchId}/invite/${user._id}" target="_blank">here</a> to accept the invite.</p>
        `
            )
          )
        );
      }

      res.json({
        success: true,
        message: "Students added successfully",
      });
    } catch (error) {
      console.log("🚀 ~ addStudentsByEmail: ~ error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add students",
        error: error.message,
      });
    }
  },

  verifyInviteCode: async (req, res) => {
    try {
      const { batchId, inviteCode } = req.params;
      const invitation = await Invitations.findOne({ inviteCode });
      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invalid Invitation code",
        });
      }

      if (invitation.expiresAt < Date.now()) {
        return res.status(404).json({
          success: false,
          message: "Opps! Invitation code expired",
        });
      }

      const batch = await Batch.findById(batchId)
        .populate("students", "_id name email avatar")
        .populate("owner", "_id name email avatar")
        .populate("teachers", "_id name email avatar");

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      if (batch.owner._id.toString() === req.user._id.toString()) {
        return res.status(401).json({
          success: false,
          message: "You cannot join your own batch",
        });
      }

      const isAlreadyEnrolled = batch.students.some(
        (student) => student._id.toString() === req.user._id.toString()
      );

      if (isAlreadyEnrolled) {
        return res.status(404).json({
          success: false,
          message: "You are already enrolled in this batch",
        });
      }

      await Batch.findOneAndUpdate(
        { _id: batchId },
        {
          $push: {
            students: req.user._id,
          },
        }
      );

      res.json({
        success: true,
        message: "Invitation verified successfully",
      });
    } catch (error) {
      console.log("🚀 ~ verifyInviteCode: ~ error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify invitation",
        error: error.message,
      });
    }
  },

  // joinBatchByCode
  joinBatchByCode: async (req, res) => {
    try {
      const { inviteCode } = req.params;

      const inviteType = inviteCode.includes("_teacherInvite_")
        ? "batchTeacherCode"
        : "batchCode";

      const batch = await Batch.findOne({ [inviteType]: inviteCode })
        .populate({
          path: "owner",
          select: "name _id",
        })
        .populate({ path: "teachers", select: "name _id" })
        .populate({ path: "students", select: "name _id" });

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      const isMatch = inviteCode === batch[inviteType];
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid invite code",
        });
      }

      const user = req.user;

      if (batch.owner._id.toString() === user._id.toString()) {
        return res.status(401).json({
          success: false,
          message: "You cannot join your own batch",
        });
      }

      if (inviteType === "batchCode") {
        const isAlreadyTeacher = batch.teachers.some(
          (t) => t._id.toString() === user._id.toString()
        );
        if (isAlreadyTeacher) {
          return res.status(401).json({
            success: false,
            message: "You are already a Teacher in the batch",
          });
        }

        const isAlreadyEnrolled = batch.students.some(
          (s) => s._id.toString() === user._id.toString()
        );
        if (isAlreadyEnrolled) {
          return res.status(401).json({
            success: false,
            message: "User already enrolled in the batch",
          });
        }

        batch.students.push(user._id);
      } else {
        const isAlreadyEnrolled = batch.students.some(
          (s) => s._id.toString() === user._id.toString()
        );
        if (isAlreadyEnrolled) {
          return res.status(401).json({
            success: false,
            message: "User already enrolled as student in the batch",
          });
        }

        const isAlreadyTeacher = batch.teachers.some(
          (t) => t._id.toString() === user._id.toString()
        );
        if (isAlreadyTeacher) {
          return res.status(401).json({
            success: false,
            message: "You are already a Teacher in the batch",
          });
        }

        batch.teachers.push(user._id);
      }

      await batch.save();

      res.json({
        success: true,
        message: `You have been added to ${
          inviteType === "batchCode" ? "students" : "teachers"
        } successfully`,
        batch,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to accept invite code",
        error: error.message,
      });
    }
  },

  // blockStudent
  blockStudent: async (req, res) => {
    try {
      const { batchId, studentId } = req.params;
      const userId = req.user._id;
      const batch = req.batch;

      const isStudentInBatch = batch.students.some(
        (student) => student._id.toString() === studentId.toString()
      );
      if (!isStudentInBatch) {
        return res.status(404).json({
          success: false,
          message: "Student does not exist in the batch",
        });
      }

      const student = await User.findById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      const alreadyBlocked = await Blocklist.findOne({
        batchId,
        blockedUser: studentId,
      }).populate("blockedBy", "name");
      if (alreadyBlocked) {
        return res.status(404).json({
          success: false,
          message: `Student already blocked by ${alreadyBlocked.blockedBy.name}`,
        });
      }

      await Blocklist.create({
        batchId,
        blockedBy: userId,
        blockedUser: studentId,
        note:
          req.body.note ||
          `${student.name} blocked by ${
            req.user.name
          } at ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}`,
      });

      batch.students = batch.students.filter(
        (s) => s._id.toString() !== studentId.toString()
      );
      await batch.save();

      res.json({
        success: true,
        message: "Student blocked successfully",
        studentId, // I am giving this studentId to the frontend in order to remove the student from the state of redux
      });
    } catch (error) {
      console.log("🚀 ~ blockStudent: ~ error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to block student",
        error: error.message,
      });
    }
  },

  // unBlockUser
  unBlockUser: async (req, res) => {
    try {
      const { batchId, studentId } = req.params;
      const batch = req.batch;

      const IsBlocked = await Blocklist.findOne({
        batchId,
        blockedUser: studentId,
      });
      if (!IsBlocked) {
        return res.status(404).json({
          success: false,
          message: "Student is not blocked",
        });
      }

      const isStudentInBatch = batch.students.some(
        (student) => student._id.toString() === studentId.toString()
      );
      if (isStudentInBatch) {
        return res.status(404).json({
          success: false,
          message: "Student already exist in the batch",
        });
      }

      await Blocklist.findByIdAndDelete(IsBlocked._id);
      batch.students.push(studentId);
      await batch.save();
      res.json({
        success: true,
        message: "Student unblocked successfully",
        studentId,
        students: batch.students,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to unblock student",
        error: error.message,
      });
    }
  },
};

module.exports = studentController;
