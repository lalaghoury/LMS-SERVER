const Batch = require("../models/Batch");

module.exports = {
  getBatchAsStudent: async (batchId, user) => {
    return await Batch.findOne({
      _id: batchId,
      students: { $in: [user._id] },
    });
  },

  getBatchAsTeacherOrOwner: async (batchId, user) => {
    return await Batch.findOne({
      _id: batchId,
      $or: [{ owner: user._id }, { teachers: { $in: [user._id] } }],
    });
  },
};
