// const nodemailer = require("nodemailer");

// let transporter;

// function getTransporter() {
//   if (transporter) return transporter;

//   transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: Number(process.env.EMAIL_PORT) || 587,
//     secure: Number(process.env.EMAIL_PORT) === 465,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   return transporter;
// }

// /**
//  * Sends an email. Attachments follow Nodemailer's format:
//  * [{ filename, content, contentType }]
//  */
// async function sendEmail({ to, subject, html, attachments = [] }) {
//   const mailer = getTransporter();

//   const info = await mailer.sendMail({
//     from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
//     to,
//     subject,
//     html,
//     attachments,
//   });

//   return info;
// }

// function otpEmailTemplate({ username = "there", otp, purpose }) {
//   const purposeText = {
//     REGISTER: "verify your new account",
//     LOGIN: "log in to your account",
//     FORGOT_PASSWORD: "reset your password",
//   }[purpose] || "verify your request";

//   return `
//   <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
//     <h2 style="color: #16a34a; margin-bottom: 4px;">Online Turf Booking</h2>
//     <p>Hi ${username},</p>
//     <p>Use the code below to ${purposeText}. This code expires in ${process.env.OTP_EXPIRES_MINUTES || 5} minutes.</p>
//     <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f0fdf4; color: #15803d; padding: 16px; text-align: center; border-radius: 8px; margin: 16px 0;">
//       ${otp}
//     </div>
//     <p style="color: #6b7280; font-size: 13px;">If you did not request this, you can safely ignore this email.</p>
//   </div>`;
// }

// function bookingConfirmationTemplate({ booking }) {
//   return `
//   <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
//     <h2 style="color: #16a34a;">Booking Confirmed ✓</h2>
//     <p>Hi ${booking.customerName},</p>
//     <p>Your turf booking is confirmed. Your ticket (PDF) with a QR code is attached to this email.</p>
//     <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
//       <tr><td style="padding: 6px 0; color:#6b7280;">Booking ID</td><td style="padding: 6px 0; font-weight:bold;">${booking.bookingId}</td></tr>
//       <tr><td style="padding: 6px 0; color:#6b7280;">Turf</td><td style="padding: 6px 0;">${booking.turfName}</td></tr>
//       <tr><td style="padding: 6px 0; color:#6b7280;">Location</td><td style="padding: 6px 0;">${booking.location}</td></tr>
//       <tr><td style="padding: 6px 0; color:#6b7280;">Date</td><td style="padding: 6px 0;">${booking.date}</td></tr>
//       <tr><td style="padding: 6px 0; color:#6b7280;">Time</td><td style="padding: 6px 0;">${booking.startTime} - ${booking.endTime}</td></tr>
//       <tr><td style="padding: 6px 0; color:#6b7280;">Amount Paid</td><td style="padding: 6px 0; font-weight:bold;">₹${booking.totalAmount}</td></tr>
//       <tr><td style="padding: 6px 0; color:#6b7280;">Payment Status</td><td style="padding: 6px 0;">${booking.paymentStatus}</td></tr>
//     </table>
//   </div>`;
// }

// module.exports = { sendEmail, otpEmailTemplate, bookingConfirmationTemplate };

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email using Resend.
 * Attachments follow Resend format:
 * [{ filename, content, contentType }]
 */
async function sendEmail({ to, subject, html, attachments = [] }) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject,
    html,
    attachments,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error(error.message || "Failed to send email");
  }

  return data;
}

function otpEmailTemplate({ username = "there", otp, purpose }) {
  const purposeText = {
    REGISTER: "verify your new account",
    LOGIN: "log in to your account",
    FORGOT_PASSWORD: "reset your password",
  }[purpose] || "verify your request";

  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
    <h2 style="color: #16a34a; margin-bottom: 4px;">Online Turf Booking</h2>
    <p>Hi ${username},</p>
    <p>Use the code below to ${purposeText}. This code expires in ${process.env.OTP_EXPIRES_MINUTES || 5} minutes.</p>

    <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f0fdf4; color: #15803d; padding: 16px; text-align: center; border-radius: 8px; margin: 16px 0;">
      ${otp}
    </div>

    <p style="color: #6b7280; font-size: 13px;">
      If you did not request this, you can safely ignore this email.
    </p>
  </div>`;
}

function bookingConfirmationTemplate({ booking }) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
    <h2 style="color: #16a34a;">Booking Confirmed ✓</h2>

    <p>Hi ${booking.customerName},</p>

    <p>
      Your turf booking is confirmed. Your ticket (PDF) with a QR code is attached to this email.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
      <tr>
        <td style="padding: 6px 0; color:#6b7280;">Booking ID</td>
        <td style="padding: 6px 0; font-weight:bold;">${booking.bookingId}</td>
      </tr>

      <tr>
        <td style="padding: 6px 0; color:#6b7280;">Turf</td>
        <td style="padding: 6px 0;">${booking.turfName}</td>
      </tr>

      <tr>
        <td style="padding: 6px 0; color:#6b7280;">Location</td>
        <td style="padding: 6px 0;">${booking.location}</td>
      </tr>

      <tr>
        <td style="padding: 6px 0; color:#6b7280;">Date</td>
        <td style="padding: 6px 0;">${booking.date}</td>
      </tr>

      <tr>
        <td style="padding: 6px 0; color:#6b7280;">Time</td>
        <td style="padding: 6px 0;">
          ${booking.startTime} - ${booking.endTime}
        </td>
      </tr>

      <tr>
        <td style="padding: 6px 0; color:#6b7280;">Amount Paid</td>
        <td style="padding: 6px 0; font-weight:bold;">
          ₹${booking.totalAmount}
        </td>
      </tr>

      <tr>
        <td style="padding: 6px 0; color:#6b7280;">Payment Status</td>
        <td style="padding: 6px 0;">
          ${booking.paymentStatus}
        </td>
      </tr>
    </table>
  </div>`;
}

module.exports = {
  sendEmail,
  otpEmailTemplate,
  bookingConfirmationTemplate,
};
