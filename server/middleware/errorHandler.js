const AppError = require("../utils/AppError");

function handleCastError(err) {
  return new AppError(`Invalid value for field "${err.path}"`, 400);
}

function handleDuplicateKeyError(err) {
  // Duplicate booking slot, duplicate email, duplicate transactionId, etc.
  const fields = Object.keys(err.keyPattern || {});
  if (fields.includes("slots") || fields.includes("turfId")) {
    return new AppError("This time slot is already booked. Please select another slot.", 409);
  }
  if (fields.includes("email")) {
    return new AppError("An account with this email already exists.", 409);
  }
  if (fields.includes("bookingId")) {
    return new AppError("This booking already exists.", 409);
  }
  return new AppError("A record with these details already exists.", 409);
}

function handleValidationError(err) {
  const message = Object.values(err.errors)
    .map((e) => e.message)
    .join(". ");
  return new AppError(message, 400);
}

function handleJWTError() {
  return new AppError("Invalid session. Please log in again.", 401);
}

function handleJWTExpired() {
  return new AppError("Your session has expired. Please log in again.", 401);
}

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  let error = Object.create(err);
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || "error";

  if (err.name === "CastError") error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === "ValidationError") error = handleValidationError(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpired();

  // Never leak stack traces or internal errors to the client
  const isOperational = error.isOperational;
  const responseMessage = isOperational ? error.message : "Something went wrong. Please try again.";

  if (!isOperational) {
    console.error("UNEXPECTED ERROR:", err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: responseMessage,
  });
};
