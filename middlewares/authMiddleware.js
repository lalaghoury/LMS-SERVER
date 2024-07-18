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

const isTeacherOrOwnerOfBatch = async (req, res, next) => {
  try {
    const user = req.user;

    const batch = Batch.findById(req.params.batchId);

    if (!batch) {
      return res.status(401).json({
        message: "Batch not found. Please login again.",
        success: false,
      });
    }

    const isTeacherOrOwner =
      batch.teachers.some((t) => t.toString() === user._id.toString()) ||
      user._id.toString() === batch.owner.toString();

    if (!isTeacherOrOwner) {
      return res.status(401).json({
        message: "You are not authorized to perform this action",
        success: false,
      });
    }

    req.isTeacherOrOwnerOfBatch = isTeacherOrOwner;

    next();
  } catch (error) {
    console.error("Error in isTeacherOrOwnerOfBatch middleware:", error);
    return res.status(401).json({
      message: "Please login to continue",
    });
  }
};

const isStudentOfBatch = async (req, res, next) => {
  try {
    const user = req.user;

    const batch = Batch.findOne({ _id: req.params.batchId });

    if (!batch) {
      return res.status(401).json({
        message: "Batch not found. Please try again.",
        success: false,
      });
    }

    const isTeacherOrOwner =
      batch.teachers.some((t) => t.toString() === user._id.toString()) ||
      user._id.toString() === batch.owner.toString();

    if (!isTeacherOrOwner) {
      return res.status(401).json({
        message: "You are not authorized to perform this action",
        success: false,
      });
    }

    req.isTeacherOrOwnerOfBatch = isTeacherOrOwner;

    next();
  } catch (error) {
    console.error("Error in isTeacherOrOwnerOfBatch middleware:", error);
    return res.status(401).json({
      message: "Please login to continue",
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
  isTeacherOrOwnerOfBatch,
  isStudentOfBatch,
};
