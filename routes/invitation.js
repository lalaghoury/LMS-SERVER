const express = require("express");
const studentController = require("../controllers/studentController.js");
const { requireSignin } = require("../middlewares/authMiddleware.js");
const router = express.Router();

// User Routes

// @route GET api/batches/all to get all batches
// router.get("/all", requireSignin, studentController.getAllBatches);

// @route GET api/batches/get-single/:id to get a  single Batch
// router.get("/get-single/:id", requireSignin, studentController.getABatchById);

// @route POST api/batches/new for batch
router.post("/:batchId", requireSignin, studentController.addStudentsByEmail);

// @route POST api/batches/new for batch
router.post("/:batchId/verify-invite/:inviteCode", requireSignin, studentController.verifyInviteCode);

// @route PUT api/batches/single/update/:id for user
// router.put("/update/:id", requireSignin, studentController.updateABatch);

// @route DELETE api/batches/:id for user
// router.delete("/delete/:id", requireSignin, studentController.deleteABatch);

module.exports = router;
