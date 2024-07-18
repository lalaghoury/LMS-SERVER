const express = require("express");
const router = express.Router();
const {
  signIn,
  signOut,
  signUp,
  sendVerificationLink,
  verified,
  callbackSignin,
  resetPassword,
} = require("../controllers/authController");
const { requireSignin } = require("../middlewares/authMiddleware");
require("../strategies/local-strategy");
require("../strategies/google-strategy.js");
require("../strategies/discord-strategy.js");
const passport = require("passport");

// Passport Routes
router.post(
  "/sign-in",
  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(404).json({
          success: false,
          message: err.message,
        });
      }
      if (!user) {
        return res.status(404).json({
          success: false,
          message: info.message,
        });
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  signIn
);
router.get("/google", passport.authenticate("google", { session: false }));
router.get("/discord", passport.authenticate("discord", { session: false }));

// Passport Callback Routes
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        return res.redirect(
          `${process.env.CLIENT_URL}/auth/sign-in?error=${encodeURIComponent(
            err.message
          )}`
        );
      }
      if (!user) {
        return res.redirect(
          `${process.env.CLIENT_URL}/auth/sign-in?error=${encodeURIComponent(
            info.message
          )}`
        );
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  callbackSignin
);

router.get(
  "/discord/callback",
  (req, res, next) => {
    passport.authenticate("discord", (err, user, info) => {
      if (err) {
        return res.redirect(
          `${process.env.CLIENT_URL}/auth/sign-in?error=${encodeURIComponent(
            err.message
          )}`
        );
      }
      if (!user) {
        return res.redirect(
          `${process.env.CLIENT_URL}/auth/sign-in?error=${encodeURIComponent(
            info.message
          )}`
        );
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  callbackSignin
);

// Euphoria-Backend\routes\auth.js
router.post("/sign-up", signUp);
router.post("/sign-out", signOut);
router.post("/send-verification-link", sendVerificationLink);
router.post("/reset-password/:resetToken", resetPassword);
router.get("/login/failed", (req, res) => {
  res.redirect(
    `${process.env.CLIENT_URL}/auth/sign-in?error=${encodeURIComponent(
      "Log in failure"
    )}`
  );
});

// Euphoria-Backend\routes\auth.js~Verified
router.get("/verify", requireSignin, verified);

module.exports = router;
