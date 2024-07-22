const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const {
  requireSignin,
  isStudent,
  isTeacherOrOwner,
} = require("../middlewares/authMiddleware");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/teaching/:batchId/new",
  requireSignin,
  isTeacherOrOwner,
  upload.array("files", 10),
  assignmentController.createAssignment
);

router.post(
  "/hand-in/:batchId/:assignmentId",
  requireSignin,
  isStudent,
  upload.array("files", 10),
  assignmentController.handInAsignment
);

router.get(
  "/enrolled/get-single/:batchId/:assignmentId",
  requireSignin,
  isStudent,
  assignmentController.getAssignmentById
);

router.get(
  "/teaching/get-single/:batchId/:assignmentId",
  requireSignin,
  isTeacherOrOwner,
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
