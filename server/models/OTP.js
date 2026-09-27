const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const OTP_TYPES = ["REGISTER", "LOGIN", "FORGOT_PASSWORD"];

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: OTP_TYPES,
      required: true,
    },
    // Arbitrary payload needed to finish the flow once OTP is verified
    // (e.g. hashed password + username for REGISTER before the User exists)
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    attempts: {
      type: Number,
      default: 0,
    },
    consumed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// TTL index: MongoDB automatically removes documents once expiresAt passes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1, type: 1 });

otpSchema.statics.hashOTP = async function (otp) {
  return bcrypt.hash(otp, 10);
};

otpSchema.methods.compareOTP = async function (candidateOTP) {
  return bcrypt.compare(candidateOTP, this.otpHash);
};

module.exports = mongoose.model("OTP", otpSchema);
module.exports.OTP_TYPES = OTP_TYPES;
