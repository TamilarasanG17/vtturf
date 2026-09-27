const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const User = require("../models/User");

// Verifies the JWT and attaches the authenticated user to req.user.
const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please log in to continue.", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired session. Please log in again.", 401));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError("The user belonging to this session no longer exists.", 401));
  }

  req.user = user;
  next();
});

module.exports = { protect };
