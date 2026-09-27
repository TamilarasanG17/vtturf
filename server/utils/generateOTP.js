const crypto = require("crypto");

// Generates a cryptographically random 4-digit OTP as a zero-padded string, e.g. "0492"
function generateOTP() {
  const num = crypto.randomInt(0, 10000);
  return num.toString().padStart(4, "0");
}

module.exports = generateOTP;
