const Batch = require("../models/Batch");
const Submissions = require("../models/Submissions");
const Assignments = require("../models/Assignments");

module.exports = {
  getInitialChartData: async (req, res) => {
    try {
      const userId = req.user._id;

      const batches = await Batch.find({
        $or: [{ owner: userId }, { teachers: { $in: [userId] } }],
      });

      const batchIds = batches.map((batch) => batch._id);

      const assignments = await Assignments.find({
        batchId: { $in: batchIds },
      });

      const assignmentIds = assignments.map((assignment) => assignment._id);

      const submissions = await Submissions.find({
        batchId: { $in: batchIds },
        assignmentId: { $in: assignmentIds },
      });

      res.status(200).json({
        success: true,
        batches,
        assignments,
        submissions,
      });
    } catch (error) {
      console.log("🚀 ~ getInitialChartData: ~ error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving data",
        error: error.message,
      });
    }
  },
};
