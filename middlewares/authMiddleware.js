require("dotenv").config();
const JWT = require("jsonwebtoken");
const User = require("../models/User");
const Batch = require("../models/Batch");

const requireSignin = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader?.split(" ")[1]) {
      token = authHeader?.split(" ")[1];
    } else {
      token = req.cookies.auth;
    }

    if (!token) {
      return res.status(401).send("Access denied. No token provided.");
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decode?.userId);

    if (!user || user.status !== "active") {
      return res.status(401).json({
        message: "Profile not found. Please login again.",
        success: false,
      });
    }

    req.user = { ...user._doc, userId: user._id };

    next();
  } catch (error) {
    console.error("Error in requireSignin middleware:", error);
    return res.status(401).json({
      message: "Please login to continue",
    });
  }
};

const isTeacherOrOwner = async (req, res, next) => {
  try {
    const batchId = req.params.batchId || req.body.batchId;
    if (!batchId) {
      return next();
    }

    const user = req.user;

    const batch = await Batch.findOne({
      _id: batchId,
      $or: [{ owner: user._id }, { teachers: { $in: [user._id] } }],
    })
      .populate("owner", "name _id email avatar")
      .populate("teachers", "name _id email avatar")
      .populate("students", "name _id email avatar");

    if (!batch) {
      return res.status(401).json({
        message: "You are not authorized to perform this action",
        success: false,
      });
    }

    req.batch = batch;

    next();
  } catch (error) {
    console.error("Error in isTeacherOrOwner middleware:", error);
    return res.status(401).json({
      message: "Please login to continue",
      success: false,
      error: error.message,
    });
  }
};

const isStudent = async (req, res, next) => {
  try {
    const batchId = req.params.batchId || req.body.batchId;
    if (!batchId) {
      return next();
    }

    const user = req.user;

    const batch = await Batch.findOne({
      _id: batchId,
      students: { $in: [user._id] },
    });

    if (!batch) {
      return res.status(401).json({
        message: "You are not authorized to perform this action",
        success: false,
      });
    }

    req.batch = batch;

    next();
  } catch (error) {
    console.error("Error in isStudent middleware:", error);
    return res.status(401).json({
      message: "Please login to continue",
      success: false,
      error: error.message,
    });
  }
};

const isOwner = async (req, res, next) => {
  try {
    const batchId = req.params.batchId || req.body.batchId;
    if (!batchId) {
      return next();
    }

    const user = req.user;

    const batch = await Batch.findOne({
      _id: batchId,
      owner: user._id,
    });

    if (!batch) {
      return res.status(401).json({
        message: "You are not authorized to perform this action",
        success: false,
      });
    }

    req.batch = batch;

    next();
  } catch (error) {
    console.error("Error in isOwner middleware:", error);
    return res.status(401).json({
      message: "Please login to continue",
      success: false,
      error: error.message,
    });
  }
};

const SignToken = (userId) => {
  return JWT.sign(
    {
      userId,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = {
  requireSignin,
  SignToken,
  isTeacherOrOwner,
  isStudent,
  isOwner,
};
