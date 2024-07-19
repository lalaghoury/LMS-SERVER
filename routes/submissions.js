const express = require("express");
const router = express.Router();
const submissionsController = require("../controllers/submissionsController.js");
const { requireSignin } = require("../middlewares/authMiddleware");

router.get(
  "/all/:batchId/:assignmentId",
  requireSignin,
  submissionsController.getAllSubmissionsOfAnAssignment
);

router.get(
  "/single/:batchId/:assignmentId/:submissionId",
  requireSignin,
  submissionsController.getASingleSubmissionOfAnAssignment
);

module.exports = router;
