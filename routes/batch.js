const express = require("express");
const batchController = require("../controllers/batchController.js");
const { requireSignin } = require("../middlewares/authMiddleware.js");
const router = express.Router();

// User Routes

// @route GET api/batches/all to get all batches
router.get(
  "/teaching/all",
  requireSignin,
  batchController.getAllBatchesAsTeacherOrOwner
);

// @route GET api/batches/all to get all batches
router.get(
  "/enrolled/all",
  requireSignin,
  batchController.getAllBatchesAsStudent
);

router.get(
  "/enrolled/:batchId",
  requireSignin,
  batchController.getAllBatchesAsStudent
);

router.get(
  "/teaching/:batchId",
  requireSignin,
  batchController.getABatchByIdAsTeacherOrOwner
);

// @route GET api/batches/get-single/:id to get a  single Batch
router.get(
  "/get-single/:batchId",
  requireSignin,
  batchController.getABatchByIdAsStudent
);

// @route GET api/batches/:batchId/students/all for user

// @route POST api/batches/new for batch
router.post("/new", requireSignin, batchController.createABatch);

// @route PUT api/batches/single/update/:id for user
router.put("/update/:id", requireSignin, batchController.updateABatch);

// @route DELETE api/batches/:id for user
router.delete("/delete/:id", requireSignin, batchController.deleteABatch);

module.exports = router;
