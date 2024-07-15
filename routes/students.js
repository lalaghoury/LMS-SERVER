// server\routes\students.js
const express = require("express");
const studentController = require("../controllers/studentController.js");
const { requireSignin } = require("../middlewares/authMiddleware");
const router = express.Router();

// Add Student
router.post("/add", requireSignin, studentController.addStudent);

// Delete Student
router.delete("/delete/:id", requireSignin, studentController.deleteStudent);

// Add Students By Sending Email To Them
router.post(
    "/add-by-email",
    requireSignin,
    studentController.addStudentsByEmail
);

module.exports = router;
