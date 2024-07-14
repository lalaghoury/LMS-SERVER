require("dotenv").config();
const JWT = require("jsonwebtoken");
const User = require("../models/User");

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

const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.auth;

    if (!token) {
      return res.status(401).send("Access denied. No token provided.");
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decode?.userId);

    if (!user) {
      return res.status(401).json({
        message: "Profile not found. Please login again.",
        success: false,
      });
    } else if (user.role !== "admin" || user.status !== "active") {
      return res.status(401).json({
        message: "You are not authorized to access this resource.",
        success: false,
      });
    }

    req.user = { ...user._doc, userId: user._id };

    next();
  } catch (error) {
    res
      .status(401)
      .send({ success: false, message: "Unauthorized", error: error.message });
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

const notRequireSignin = async (req, res, next) => {
  try {
    const token = req?.cookies?.auth;

    if (token) {
      const decode = JWT.verify(token, process.env.JWT_SECRET_KEY);

      const user = await User.findById(decode?.userId);

      if (!user || user.status !== "active") {
        return res.status(401).json({
          message: "Profile not found. Please login again.",
          success: false,
        });
      }

      req.user = { ...user._doc, userId: user._id };
    }

    next();
  } catch (error) {
    console.error("Error in requireSignin middleware:", error);
    return res.status(401).json({
      message: "Please login to continue",
    });
  }
};

module.exports = { requireSignin, isAdmin, SignToken, notRequireSignin };
