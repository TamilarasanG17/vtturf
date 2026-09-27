const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter, otpLimiter } = require("../middleware/rateLimiters");

router.post("/register", authLimiter, auth.register);
router.post("/verify-register-otp", otpLimiter, auth.verifyRegisterOTP);
router.post("/login", authLimiter, auth.login);
router.post("/verify-login-otp", otpLimiter, auth.verifyLoginOTP);
router.post("/forgot-password", authLimiter, auth.forgotPassword);
router.post("/verify-forgot-otp", otpLimiter, auth.verifyForgotOTP);
router.post("/reset-password", authLimiter, auth.resetPassword);
router.post("/resend-otp", otpLimiter, auth.resendOTP);
router.get("/me", protect, auth.getMe);

module.exports = router;
