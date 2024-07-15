const Invitations = require("../models/Invitations");
const User = require("../models/User");
const Batch = require("../models/Batch");
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

  // Add Students By Sending Email To Them
  addStudentsByEmail: async (req, res) => {
    try {
      const { emails } = req.body;

      const users = await User.find({ email: { $in: emails } });
      const unregisteredEmails = emails.filter(
        (email) => !users.some((user) => user.email === email)
      );

      if (unregisteredEmails.length > 0) {
        const baseUrl = `/dashboard/batches/${req.params.batchId}/invite`;
        const invitations = unregisteredEmails.map((email) => {
          const inviteCode = crypto.randomBytes(20).toString("hex");
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
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

      await Promise.all(
        users.map((user) =>
          sendEmail(
            user.email,
            "Invitation",
            `You are invited to join the batch. Please accept the invite.`,
            `
          <p style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; padding: 1rem; background-color: #f5f5f5; border: 1px solid #ccc; border-radius: 0.25rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); max-width: 400px;">Click here: <a style="text-decoration: none; color: #4CAF50; background-color: #f5f5f5; padding: 14px 20px; margin: 8px 0; border: none; display: inline-block; cursor: pointer; width: 100%;" href="http://${process.env.CLIENT_URL}/dashboard/batches/${req.params.batchId}/invitations/${user._id}" target="_blank">here</a> to accept the invite.</p>
        `
          )
        )
      );

      res.json({
        success: true,
        message: "Students added successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to add students",
        error: error.message,
      });
    }
  },

  verifyInviteCode: async (req, res) => {
    try {
      const { inviteCode, batchId } = req.params;
      const invitation = await Invitations.findOne({ inviteCode });
      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation not found",
        });
      }
      if (invitation.expiresAt < Date.now()) {
        return res.status(404).json({
          success: false,
          message: "Invitation expired",
        });
      }

      const batch = await Batch.findByIdAndUpdate(batchId, {
        $addToSet: { students: req.user._id },
      });

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      res.json({
        success: true,
        message: "Invitation verified successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to verify invitation",
        error: error.message,
      });
    }
  },
};

module.exports = studentController;
