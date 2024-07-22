const express = require("express");
const router = express.Router();
const submissionsController = require("../controllers/submissionsController.js");
const {
  requireSignin,
  isStudent,
  isTeacherOrOwner,
} = require("../middlewares/authMiddleware");

router.get(
  "/teaching/all/:batchId/:assignmentId",
  requireSignin,
  isTeacherOrOwner,
  submissionsController.getAllSubmissionsOfAnAssignment
);

router.get(
  "/enrolled/single/:batchId/:assignmentId/:submissionId",
  requireSignin,
  isStudent,
  submissionsController.getASingleSubmissionOfAnAssignment
);

router.get(
  "/teaching/single/:batchId/:assignmentId/:submissionId",
  requireSignin,
  isTeacherOrOwner,
  submissionsController.getASingleSubmissionOfAnAssignment
);

router.put(
  "/update/:batchId/:assignmentId/:submissionId",
  requireSignin,
  isTeacherOrOwner,
  submissionsController.updateGrade
);

module.exports = router;
