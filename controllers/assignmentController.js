const { s3 } = require("../config/awsConfig");
const Assignments = require("../models/Assignments");

const assignmentController = {
  createAssignment: async (req, res) => {
    try {
      const { title, instructions, courseId, teacherId, students } = req.body;
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
        courseId,
        teacherId,
        students,
      });

      console.log("🚀 ~ createAssignment: ~ newAssignment:", newAssignment)
      const savedAssignment = await newAssignment.save();

      return res.status(201).json({
        success: true,
        message: "Assignment created successfully",
        data: savedAssignment,
      });
    } catch (error) {
      console.log("🚀 ~ createAssignment: ~ error:", error)
      return res.status(500).json({
        success: false,
        message: "Failed to create assignment",
        error: error.message,
      });
    }
  },

  updateAssignment: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, instructions, attachment, courseId, teacherId } = req.body;

      const updatedAssignment = await Assignment.findByIdAndUpdate(id, {
        title,
        instructions,
        attachment,
        courseId,
        teacherId,
      });

      if (!updatedAssignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Assignment updated successfully",
        data: updatedAssignment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update assignment",
        error: error.message,
      });
    }
  },

  deleteAssignment: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedAssignment = await Assignment.findByIdAndDelete(id);

      if (!deletedAssignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Assignment deleted successfully",
        data: deletedAssignment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete assignment",
        error: error.message,
      });
    }
  },

  getAssignmentById: async (req, res) => {
    try {
      const { id } = req.params;

      const assignment = await Assignment.findById(id).populate(
        "teacherId",
        "name"
      );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Assignment retrieved successfully",
        data: assignment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to get assignment by id",
        error: error.message,
      });
    }
  },

  getAssignmentsByCourseId: async (req, res) => {
    try {
      const { courseId } = req.params;

      const assignments = await Assignment.find({ courseId })
        .populate("teacherId", "name")
        .populate("students", "name");

      if (!assignments.length) {
        return res.status(404).json({
          success: false,
          message: "No assignments found for this course",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Assignments retrieved successfully",
        data: assignments,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to get assignments by course id",
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
};

module.exports = assignmentController;
