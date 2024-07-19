const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const { requireSignin } = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/:batchId/new",
  requireSignin,
  upload.array("files", 10),
  assignmentController.createAssignment
);

router.post(
  "/hand-in/:batchId/:assignmentId",
  requireSignin,
  upload.array("files", 10),
  assignmentController.handInAsignment
);

router.get(
  "/get-single/:assignmentId",
  requireSignin,
  assignmentController.getAssignmentById
);

router.get(
  "/submitted/:batchId/:assignmentId",
  requireSignin,
  assignmentController.getSubmittedAssignmentByBatchId
);

router.get(
  "/:batchId/all",
  requireSignin,
  assignmentController.getAllAssignmentsByBatchId
);

router.get(
  "/submissions/:id",
  requireSignin,
  assignmentController.getAssignmentSubmissionsByAssignmentId
);

module.exports = router;
