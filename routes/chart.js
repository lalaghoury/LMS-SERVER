const express = require("express");
const { requireSignin } = require("../middlewares/authMiddleware.js");
const chartController = require("../controllers/chartController.js");
const router = express.Router();

router.get("/initialize", requireSignin, chartController.getInitialChartData);

module.exports = router;
