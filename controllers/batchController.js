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
  getAllBatchesAsTeacherOrOwner: async (req, res) => {
    try {
      const query = {
        $or: [{ owner: req.user._id }, { teachers: req.user._id }],
      };

      const batches = await BatchModel.find(query)
        .populate({
          path: "owner",
          select: "name _id",
        })
        .populate({ path: "teachers", select: "name _id" })
        .populate({
          path: "owner",
          select: "name _id",
        })
        .populate({ path: "students", select: "name _id" });

      res.json({
        batches,
        success: true,
        message: "All batches fetched in which you are owner or teacher",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error, message: "Failed to get all batches", success: false });
    }
  },
  getAllBatchesAsStudent: async (req, res) => {
    try {
      const query = { students: { $in: [req.user._id] } };

      const batches = await BatchModel.find(query)
        .populate({
          path: "owner",
          select: "name _id",
        })
        .populate({ path: "teachers", select: "name _id" })
        .populate({
          path: "owner",
          select: "name _id",
        })
        .populate({ path: "students", select: "name _id" });

      res.json({
        batches,
        success: true,
        message: "All batches fetched in which you are enrolled",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error, message: "Failed to get all batches", success: false });
    }
  },
  getABatchByIdAsTeacherOrOwner: async (req, res) => {
    try {
      const batch = req.batch;

      if (!batch) {
        return res
          .status(404)
          .json({ message: "Batch not found", success: false });
      }

      res.json({ batch, success: true, message: "Batch fetched successfully" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error, message: "Failed to get batch", success: false });
    }
  },
  getABatchByIdAsStudent: async (req, res) => {
    try {
      const batch = req.batch;

      if (!batch) {
        return res
          .status(404)
          .json({ message: "Batch not found", success: false });
      }

      res.json({ batch, success: true, message: "Batch fetched successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ error, message: "Failed to get batch", success: false });
    }
  },
  getABatchById: async (req, res) => {
    try {
      console.log("req.user._id", req.user._id);
      const batch = await BatchModel.findById(req.params.batchId)
        .populate({
          path: "owner",
          select: "name _id",
        })
        .populate({ path: "teachers", select: "name _id" })
        .populate({ path: "students", select: "name _id" });

      if (!batch) {
        return res
          .status(404)
          .json({ message: "Batch not found", success: false });
      }

      const isStudentEnrolled = batch.students.some(
        (student) => student._id.toString() === req.user._id.toString()
      );

      const isTeacher = batch.teachers.some(
        (teacher) => teacher._id.toString() === req.user._id.toString()
      );

      const isOwner = batch.owner._id.toString() === req.user._id.toString();

      if (!isStudentEnrolled && !isTeacher && !isOwner) {
        return res
          .status(401)
          .json({ message: "Cannot access batch details", success: false });
      }

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
};
