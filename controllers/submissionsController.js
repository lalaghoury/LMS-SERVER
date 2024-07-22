const Batch = require("../models/Batch");
const Submissions = require("../models/Submissions");

module.exports = {
  getAllSubmissionsOfAnAssignment: async (req, res) => {
    try {
      const { batchId, assignmentId } = req.params;

      const batch = req.batch;
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      const submissions = await Submissions.find({
        batchId: batchId,
        assignmentId: assignmentId,
      })
        .populate("studentId", "name _id email avatar")
        .populate({
          path: "assignmentId",
          select: "title _id attachments instructions",
          populate: { path: "teacherId", select: "name _id email avatar" },
        });

      res.status(200).json({
        success: true,
        submissions,
        message: "Submissions retrieved successfully",
      });
    } catch (error) {
      console.log("🚀 ~ getAllSubmissionsOfAnAssignment: ~ error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving submissions",
        error: error.message,
      });
    }
  },

  getASingleSubmissionOfAnAssignment: async (req, res) => {
    try {
      const { batchId, assignmentId, submissionId } = req.params;

      const batch = req.batch;
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      const submission = await Submissions.findOne({
        batchId: batchId,
        assignmentId: assignmentId,
        _id: submissionId,
      })
        .populate("studentId", "name _id email avatar")
        .populate({
          path: "assignmentId",
          select: "title _id attachments instructions",
          populate: { path: "teacherId", select: "name _id email avatar" },
        });

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }

      res.status(200).json({
        success: true,
        submission,
        message: "Submission retrieved successfully",
      });
    } catch (error) {
      console.log("🚀 ~ getASingleSubmissionOfAnAssignment: ~ error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get submission",
        error: error.message,
      });
    }
  },

  updateGrade: async (req, res) => {
    try {
      const { batchId, assignmentId, submissionId } = req.params;
      const { grade } = req.body;

      const submission = await Submissions.findOne({
        batchId: batchId,
        assignmentId: assignmentId,
        _id: submissionId,
      });
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }
      await Submissions.findOneAndUpdate(
        { _id: submissionId },
        { $set: { grade } }
      );

      submission.grade = grade;
      await submission.save();

      res.status(200).json({
        success: true,
        submission,
        message: "Submission's grade updated successfully",
      });
    } catch (error) {
      console.log("🚀 ~ updateGrade: ~ error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get submission",
        error: error.message,
      });
    }
  },
};
