const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const User = require("../models/User");
const { createAndSendOTP, verifyOTP } = require("../utils/otpService");
const generateToken = require("../utils/generateToken");
const { isValidEmail, isStrongPassword } = require("../utils/validators");

const PASSWORD_RULES_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.";

function signResetToken(email) {
  return jwt.sign({ email, purpose: "password_reset" }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });
}

function verifyResetToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== "password_reset") return null;
    return decoded.email;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  REGISTRATION                                                       */
/* ------------------------------------------------------------------ */

exports.register = catchAsync(async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return next(new AppError("All fields are required.", 400));
  }
  if (!isValidEmail(email)) {
    return next(new AppError("Please provide a valid email address.", 400));
  }
  if (!isStrongPassword(password)) {
    return next(new AppError(PASSWORD_RULES_MESSAGE, 400));
  }
  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match.", 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser && existingUser.isVerified) {
    return next(new AppError("An account with this email already exists.", 409));
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await createAndSendOTP({
    email: normalizedEmail,
    type: "REGISTER",
    username,
    payload: { username, passwordHash },
  });

  res.status(200).json({
    success: true,
    message: `OTP sent to ${normalizedEmail}. Please verify to complete registration.`,
  });
});

exports.verifyRegisterOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) return next(new AppError("Email and OTP are required.", 400));

  const normalizedEmail = email.toLowerCase().trim();
  const payload = await verifyOTP({ email: normalizedEmail, type: "REGISTER", otp });

  const user = await User.findOne({ email: normalizedEmail });
  if (user && user.isVerified) {
    return next(new AppError("An account with this email already exists.", 409));
  }

  if (user) {
    // A previous registration attempt existed but was never verified; finish it.
    // Update directly (bypassing the pre-save hash hook since passwordHash is already hashed).
    await User.updateOne(
      { _id: user._id },
      { username: payload.username, password: payload.passwordHash, isVerified: true }
    );
  } else {
    await User.create({
      username: payload.username,
      email: normalizedEmail,
      password: payload.passwordHash,
      isVerified: true,
    });
  }

  res.status(201).json({
    success: true,
    message: "Registration successful. You can now log in.",
  });
});

/* ------------------------------------------------------------------ */
/*  RESEND OTP (generic)                                               */
/* ------------------------------------------------------------------ */

exports.resendOTP = catchAsync(async (req, res, next) => {
  const { email, type } = req.body;
  const allowedTypes = ["REGISTER", "LOGIN", "FORGOT_PASSWORD"];

  if (!email || !allowedTypes.includes(type)) {
    return next(new AppError("A valid email and OTP type are required.", 400));
  }

  const OTP = require("../models/OTP");
  const existing = await OTP.findOne({ email: email.toLowerCase().trim(), type }).sort({
    createdAt: -1,
  });

  if (!existing) {
    return next(
      new AppError("No pending request found for this email. Please start over.", 400)
    );
  }

  await createAndSendOTP({
    email: email.toLowerCase().trim(),
    type,
    payload: existing.payload,
  });

  res.status(200).json({ success: true, message: "OTP resent successfully." });
});

/* ------------------------------------------------------------------ */
/*  LOGIN                                                               */
/* ------------------------------------------------------------------ */

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Email and password are required.", 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password.", 401));
  }
  if (!user.isVerified) {
    return next(new AppError("Please verify your email before logging in.", 403));
  }

  await createAndSendOTP({
    email: normalizedEmail,
    type: "LOGIN",
    username: user.username,
    payload: { userId: user._id.toString() },
  });

  res.status(200).json({
    success: true,
    message: `OTP sent to ${normalizedEmail}.`,
  });
});

exports.verifyLoginOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) return next(new AppError("Email and OTP are required.", 400));

  const normalizedEmail = email.toLowerCase().trim();
  const payload = await verifyOTP({ email: normalizedEmail, type: "LOGIN", otp });

  const user = await User.findById(payload.userId);
  if (!user) return next(new AppError("Account not found.", 404));

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    token,
    user: user.toSafeObject(),
  });
});

/* ------------------------------------------------------------------ */
/*  FORGOT PASSWORD                                                    */
/* ------------------------------------------------------------------ */

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return next(new AppError("Please provide a valid email address.", 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  // Avoid leaking which emails are registered
  if (!user) {
    return res.status(200).json({
      success: true,
      message: `If an account exists for ${normalizedEmail}, an OTP has been sent.`,
    });
  }

  await createAndSendOTP({
    email: normalizedEmail,
    type: "FORGOT_PASSWORD",
    username: user.username,
    payload: { userId: user._id.toString() },
  });

  res.status(200).json({
    success: true,
    message: `If an account exists for ${normalizedEmail}, an OTP has been sent.`,
  });
});

exports.verifyForgotOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) return next(new AppError("Email and OTP are required.", 400));

  const normalizedEmail = email.toLowerCase().trim();
  await verifyOTP({ email: normalizedEmail, type: "FORGOT_PASSWORD", otp });

  const resetToken = signResetToken(normalizedEmail);

  res.status(200).json({
    success: true,
    message: "OTP verified. You may now reset your password.",
    resetToken,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  if (!resetToken || !newPassword || !confirmPassword) {
    return next(new AppError("All fields are required.", 400));
  }
  if (newPassword !== confirmPassword) {
    return next(new AppError("Passwords do not match.", 400));
  }
  if (!isStrongPassword(newPassword)) {
    return next(new AppError(PASSWORD_RULES_MESSAGE, 400));
  }

  const email = verifyResetToken(resetToken);
  if (!email) {
    return next(new AppError("Reset session expired. Please start over.", 400));
  }

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Account not found.", 404));

  user.password = newPassword; // pre-save hook will hash it
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully. Please log in.",
  });
});

/* ------------------------------------------------------------------ */
/*  CURRENT USER                                                       */
/* ------------------------------------------------------------------ */

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});
