const { s3 } = require("../config/awsConfig");
const Assignments = require("../models/Assignments");
const BatchModel = require("../models/Batch");
const Submissions = require("../models/Submissions");

const assignmentController = {
  createAssignment: async (req, res) => {
    try {
      const { batchId } = req.params;
      const query = {
        $or: [{ teachers: req.user._id }, { owner: req.user._id }],
        _id: batchId,
      };

      const batch = await BatchModel.findOne(query);
      if (!batch) {
        return res
          .status(404)
          .json({ message: "Batch not found", success: false });
      }

      const { title, instructions, students } = req.body;
      const files = req.files;

      const uploadResults = await Promise.all(
        files.map((file) => {
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
          };
          return s3.upload(params).promise();
        })
      );

      const attachments = uploadResults.map((result) => ({
        url: result.Location,
        fileName: files.find((file) => result.Key.includes(file.originalname))
          .originalname,
        mimeType: files.find((file) => result.Key.includes(file.originalname))
          .mimetype,
      }));

      const newAssignment = new Assignments({
        title,
        instructions,
        attachments,
        students,
        teacherId: req.user._id,
        batchId,
      });

      const savedAssignment = await newAssignment.save();

      batch.assignments.push(savedAssignment._id);
      await batch.save();

      return res.status(201).json({
        success: true,
        message: "Assignment created successfully",
        assignment: savedAssignment,
      });
    } catch (error) {
      console.log("🚀 ~ createAssignment: ~ error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create assignment",
        error: error.message,
      });
    }
  },

  getAllAssignmentsByBatchId: async (req, res) => {
    try {
      const { batchId } = req.params;
      const assignments = await Assignments.find({ batchId })
        .populate("teacherId", "name _id email avatar")
        .populate("students", "name _id email avatar");

      if (!assignments) {
        return res.status(404).json({
          success: false,
          message: "Assignments not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Assignments fetched successfully",
        assignments,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch assignments",
        error: error.message,
      });
    }
  },

  getAssignmentById: async (req, res) => {
    try {
      const { assignmentId } = req.params;

      const assignment = await Assignments.findById(assignmentId)
        .populate("teacherId", "name _id email avatar")
        .populate("students", "name _id email avatar")
        .populate("batchId", "title")
        .populate("submissions");

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      const isSubmitted = assignment.submissions.some((submission) => {
        return submission.studentId.toString() === req.user._id.toString();
      });

      return res.status(200).json({
        success: true,
        message: "Assignment retrieved successfully",
        assignment,
        isSubmitted,
      });
    } catch (error) {
      console.log("🚀 ~ getAssignmentById: ~ error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get assignment by id",
        error: error.message,
      });
    }
  },

  getSubmittedAssignmentByBatchId: async (req, res) => {
    try {
      const { assignmentId } = req.params;

      const query = {
        assignmentId,
        studentId: req.user._id,
      };

      const submission = await Submissions.findOne(query)
        .populate({
          path: "assignmentId",
          select: "title instructions attachments",
          populate: { path: "teacherId", select: "name _id email avatar" },
        })
        .populate("studentId", "name _id email avatar");

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "You have not submitted any assignment found for this batch",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Submitted assignment retrieved successfully",
        submission,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to get submitted assignments by batch id",
        error: error.message,
      });
    }
  },

  getAssignmentSubmissionsByAssignmentId: async (req, res) => {
    try {
      const { id } = req.params;

      const submissions = await Submission.find({ assignmentId: id });

      if (!submissions.length) {
        return res.status(404).json({
          success: false,
          message: "No assignments found for this course",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Assignments retrieved successfully",
        data: submissions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to get assignments by course id",
        error: error.message,
      });
    }
  },

  handInAsignment: async (req, res) => {
    try {
      const { assignmentId, batchId } = req.params;
      const { files } = req;
      const assignment = await Assignments.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      if (
        assignment.submissions.some(
          (submission) =>
            submission.studentId.toString() === req.user._id.toString()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "You have already submitted this assignment",
        });
      }

      const uploadResults = await Promise.all(
        files.map((file) => {
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
          };
          return s3.upload(params).promise();
        })
      );

      const attachments = uploadResults.map((result) => ({
        url: result.Location,
        fileName: files.find((file) => result.Key.includes(file.originalname))
          .originalname,
        mimeType: files.find((file) => result.Key.includes(file.originalname))
          .mimetype,
      }));

      const submission = new Submissions({
        assignmentId,
        studentId: req.user._id,
        attachments,
        batchId,
      });

      await submission.save();
      assignment.submissions.push(submission._id);
      await assignment.save();

      return res.status(201).json({
        success: true,
        message: "Submission created successfully",
        assignment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create submission",
        error: error.message,
      });
    }
  },
};

module.exports = assignmentController;
