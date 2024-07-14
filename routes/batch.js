const express = require("express");
const batchController = require("../controllers/batchController.js");
const { requireSignin } = require("../middlewares/authMiddleware.js");
const router = express.Router();

// User Routes

// @route GET api/batches/all to get all batches
router.get("/all", requireSignin, batchController.getAllBatches);

// @route GET api/batches/get-single/:id to get a  single Batch
router.get("/get-single/:id", requireSignin, batchController.getABatchById);

// @route POST api/batches/new for batch
router.post("/new", requireSignin, batchController.createABatch);

// @route PUT api/batches/single/update/:id for user
router.put("/update/:id", requireSignin, batchController.updateABatch);

// @route DELETE api/batches/:id for user
router.delete("/delete/:id", requireSignin, batchController.deleteABatch);

module.exports = router;
