const validator = require("validator");

function isValidEmail(email) {
  return typeof email === "string" && validator.isEmail(email);
}

// At least 8 chars, one uppercase, one lowercase, one number
function isStrongPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

function isValidOTPFormat(otp) {
  return typeof otp === "string" && /^\d{4}$/.test(otp);
}

module.exports = { isValidEmail, isStrongPassword, isValidOTPFormat };
