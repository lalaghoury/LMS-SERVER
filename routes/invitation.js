const express = require("express");
const studentController = require("../controllers/studentController.js");
const { requireSignin } = require("../middlewares/authMiddleware.js");
const router = express.Router();

router.post("/send-by-email/:batchId", requireSignin, studentController.addStudentsByEmail);

router.post("/verify-invite/:batchId/:inviteCode", requireSignin, studentController.verifyInviteCode);

router.post("/generate-invite/:batchId", requireSignin, studentController.generateInviteCode);

router.post("/join/:inviteCode", requireSignin,  studentController.joinBatchByCode);



module.exports = router;
