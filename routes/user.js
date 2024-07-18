const express = require("express");
const userController = require("../controllers/userController");
const { requireSignin } = require("../middlewares/authMiddleware");
const router = express.Router();

// Admin Routes

// User Routes

// @route GET api/users/get-user (without Id) for user
router.get("/get-user", requireSignin, userController.getUserWithAuth);

// @route PUT api/users/single/update/:id for user
router.put("/single/update/:id", requireSignin, userController.updateUser);

// @route PUT api/users/single/update/password/:id for user
router.put(
  "/single/update/password/:id",
  requireSignin,
  userController.updateUserPassword
);

// @route DELETE api/users/:id for user
router.delete("/delete/:id", requireSignin, userController.deleteUser);

module.exports = router;
