const express = require("express");
const batchController = require("../controllers/batchController.js");
const {
  requireSignin,
  isTeacherOrOwner,
  isStudent,
  isOwner,
} = require("../middlewares/authMiddleware.js");
const router = express.Router();

// Teaching Routes
router.get(
  "/teaching/all",
  requireSignin,
  isTeacherOrOwner,
  batchController.getAllBatchesAsTeacherOrOwner
);

router.get(
  "/teaching/:batchId",
  requireSignin,
  isTeacherOrOwner,
  batchController.getABatchByIdAsTeacherOrOwner
);

// Enrolled Routes

router.get(
  "/enrolled/all",
  requireSignin,
  isStudent,
  batchController.getAllBatchesAsStudent
);

router.get(
  "/enrolled/:batchId",
  requireSignin,
  isStudent,
  batchController.getABatchByIdAsStudent
);

router.get(
  "/get-single/:batchId",
  requireSignin,
  batchController.getABatchByIdAsStudent
);

router.post("/new", requireSignin, batchController.createABatch);

router.put("/update/:id", requireSignin, batchController.updateABatch);

router.delete("/delete/:id", requireSignin, batchController.deleteABatch);

module.exports = router;
