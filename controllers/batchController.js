const BatchModel = require("../models/Batch");

function removeNullUndefined(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

module.exports = {
  getAllBatches: async (req, res) => {
    try {
      const batches = await BatchModel.find();
      res.json({ batches, success: true, message: "All batches fetched" });
    } catch (error) {
      res
        .status(500)
        .json({ error, message: "Failed to get all batches", success: false });
    }
  },
  getABatchById: async (req, res) => {
    try {
      const batch = await BatchModel.findById(req.params.id).populate({
        path: "owner",
        select: "name _id",
      });
      res.json({ batch, success: true, message: "Batch fetched" });
    } catch (error) {
      res
        .status(500)
        .json({ error, message: "Failed to get batch", success: false });
    }
  },
  updateABatch: async (req, res) => {
    const filteredObj = removeNullUndefined(req.body);

    try {
      const batch = await BatchModel.findByIdAndUpdate(req.params.id, {
        ...filteredObj,
      });

      if (!batch) {
        return res
          .status(404)
          .json({ message: "Batch not found", success: false });
      }

      res.json({ batch, success: true, message: "Batch updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ error, message: "Failed to update batch", success: false });
    }
  },
  deleteABatch: async (req, res) => {
    try {
      const batch = await BatchModel.findByIdAndDelete(req.params.id);
      res.json({ batch, success: true, message: "Batch deleted Successfully" });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        message: "Failed to delete batch",
        success: false,
      });
    }
  },
  createABatch: async (req, res) => {
    const filteredObj = removeNullUndefined(req.body);
    try {
      const batch = await BatchModel.create({
        ...filteredObj,
        owner: req.user._id,
      });
      res.json({ batch, success: true, message: "Batch created successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ error, message: "Failed to create batch", success: false });
    }
  },
};
