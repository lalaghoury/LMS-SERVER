const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const { requireSignin } = require("../middlewares/authMiddleware");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/new",
  requireSignin,
  upload.array('files', 10),
  assignmentController.createAssignment
);
router.put(
  "/:id",
  requireSignin,
  assignmentController.updateAssignment
);
router.delete(
  "/:id",
  requireSignin,
  assignmentController.deleteAssignment
);
router.get(
  "/:id",
  requireSignin,
  assignmentController.getAssignmentById
);
router.get(
  "/course/:courseId",
  requireSignin,
  assignmentController.getAssignmentsByCourseId
);
router.get(
  "/submissions/:id",
  requireSignin,
  assignmentController.getAssignmentSubmissionsByAssignmentId
);

module.exports = router;
