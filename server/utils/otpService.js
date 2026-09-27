const OTP = require("../models/OTP");
const AppError = require("./AppError");
const generateOTP = require("./generateOTP");
const { sendEmail, otpEmailTemplate } = require("./sendEmail");

const EXPIRES_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES) || 5;
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS) || 5;
const RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;

/**
 * Creates (or replaces) an OTP for a given email + type, emails it to the user,
 * and stores any payload needed to complete the flow once verified.
 */
async function createAndSendOTP({ email, type, payload = {}, username }) {
  const existing = await OTP.findOne({ email, type }).sort({ createdAt: -1 });

  if (existing) {
    const secondsSinceLastSend = (Date.now() - existing.lastSentAt.getTime()) / 1000;
    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSend);
      throw new AppError(`Please wait ${wait}s before requesting another OTP.`, 429);
    }
    // Invalidate any previous unconsumed OTP of this type
    await OTP.deleteMany({ email, type });
  }

  const otp = generateOTP();
  const otpHash = await OTP.hashOTP(otp);

  await OTP.create({
    email,
    otpHash,
    type,
    payload,
    attempts: 0,
    consumed: false,
    expiresAt: new Date(Date.now() + EXPIRES_MINUTES * 60 * 1000),
    lastSentAt: new Date(),
  });

  await sendEmail({
    to: email,
    subject: "Your Online Turf Booking verification code",
    html: otpEmailTemplate({ username, otp, purpose: type }),
  });

  return true;
}

/**
 * Verifies a submitted OTP. Throws AppError with a client-safe message on failure.
 * Returns the OTP document's payload on success and marks it consumed.
 */
async function verifyOTP({ email, type, otp }) {
  const otpDoc = await OTP.findOne({ email, type }).sort({ createdAt: -1 });

  if (!otpDoc) {
    throw new AppError("OTP has expired or does not exist. Please request a new one.", 400);
  }

  if (otpDoc.consumed) {
    throw new AppError("This OTP has already been used. Please request a new one.", 400);
  }

  if (otpDoc.expiresAt.getTime() < Date.now()) {
    await OTP.deleteOne({ _id: otpDoc._id });
    throw new AppError("OTP has expired. Please request a new one.", 400);
  }

  if (otpDoc.attempts >= MAX_ATTEMPTS) {
    await OTP.deleteOne({ _id: otpDoc._id });
    throw new AppError("Too many incorrect attempts. Please request a new OTP.", 429);
  }

  const isMatch = await otpDoc.compareOTP(otp);
  if (!isMatch) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    const remaining = MAX_ATTEMPTS - otpDoc.attempts;
    throw new AppError(
      `Invalid OTP. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : "No attempts remaining."}`,
      400
    );
  }

  otpDoc.consumed = true;
  await otpDoc.save();

  return otpDoc.payload;
}

module.exports = { createAndSendOTP, verifyOTP };
