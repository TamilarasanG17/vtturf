const QRCode = require("qrcode");
const crypto = require("crypto");

/**
 * Builds a signed verification token so the QR payload can be validated
 * so anyone with the QR/verification link can confirm a booking's validity
 * without exposing raw customer data inside the QR code itself.
 */
function buildVerificationToken(bookingId) {
  const secret = process.env.JWT_SECRET;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(bookingId)
    .digest("hex")
    .slice(0, 16);
  return `${bookingId}.${signature}`;
}

function verifyVerificationToken(token) {
  const [bookingId, signature] = String(token).split(".");
  if (!bookingId || !signature) return null;
  const expected = buildVerificationToken(bookingId).split(".")[1];
  return signature === expected ? bookingId : null;
}

/**
 * Generates a QR code (as a base64 PNG data URL) that encodes only a
 * verification URL containing the booking ID and a signature - no PII.
 */
async function generateBookingQR(bookingId) {
  const token = buildVerificationToken(bookingId);
  const baseUrl = process.env.QR_VERIFY_BASE_URL || "http://localhost:5173/verify-booking";
  const verifyUrl = `${baseUrl}?token=${encodeURIComponent(token)}`;

  const dataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 300,
  });

  return { dataUrl, verifyUrl, token };
}

module.exports = { generateBookingQR, buildVerificationToken, verifyVerificationToken };
