const express = require("express");
const studentController = require("../controllers/studentController.js");
const { requireSignin, isTeacherOrOwner, isStudent } = require("../middlewares/authMiddleware.js");
const router = express.Router();

router.post("/send-by-email/:batchId", requireSignin, isTeacherOrOwner,  studentController.addStudentsByEmail);

router.post("/verify-invite/:batchId/:inviteCode", requireSignin, studentController.verifyInviteCode);

router.post("/generate-invite/:batchId", requireSignin, isTeacherOrOwner, studentController.generateInviteCode);

router.post("/join/:inviteCode", requireSignin,  studentController.joinBatchByCode);



module.exports = router;
