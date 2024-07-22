// server\routes\students.js
const express = require("express");
const studentController = require("../controllers/studentController.js");
const {
  requireSignin,
  isTeacherOrOwner,
} = require("../middlewares/authMiddleware");
const router = express.Router();

// Add Student
router.post("/add", requireSignin, studentController.addStudent);

// Delete Student
router.delete("/delete/:id", requireSignin, studentController.deleteStudent);

// Add Students By Sending Email To Them
router.post(
  "/add-by-email",
  requireSignin,
  isTeacherOrOwner,
  studentController.addStudentsByEmail
);

// @route GET api/batches/students/:batchId/all for user
router.get(
  "/:batchId/all",
  requireSignin,
  isTeacherOrOwner,
  studentController.getAllStudentsOfABatch
);

// @route GET api/batches/students/:batchId/blocked/all for getting all blocked students
router.get(
  "/:batchId/blocked/all",
  requireSignin,
  isTeacherOrOwner,
  studentController.getAllBlockedStudentsOfABatch
);

// @route POST api/batches/students/:batchId/block for user
router.post(
  "/:batchId/:studentId/block",
  requireSignin,
  isTeacherOrOwner,
  studentController.blockStudent
);

// @route POST api/batches/students/:batchId/unblock for user
router.post(
  "/:batchId/:studentId/unblock",
  requireSignin,
  isTeacherOrOwner,
  studentController.unBlockUser
);

module.exports = router;
