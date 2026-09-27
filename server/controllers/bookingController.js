const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Booking = require("../models/Booking");
const Turf = require("../models/Turf");
const Payment = require("../models/Payment");
const { generateBookingQR, verifyVerificationToken } = require("../utils/generateQR");
const { generateBookingPDF } = require("../utils/generatePDF");
const { sendEmail, bookingConfirmationTemplate } = require("../utils/sendEmail");
const { sortSlots, areSlotsContiguous, isDateInPast, parseSlot, todayStr } = require("../utils/slotHelpers");

function generateBookingId() {
  const rand = crypto.randomInt(10000, 99999);
  return `VT${rand}`;
}

/* ------------------------ Availability check ------------------------ */

exports.checkAvailability = catchAsync(async (req, res, next) => {
  const { turfId, date, slots } = req.body;
  if (!turfId || !date || !Array.isArray(slots) || slots.length === 0) {
    return next(new AppError("turfId, date, and at least one slot are required.", 400));
  }

  const existing = await Booking.find({
    turfId,
    date,
    slots: { $in: slots },
    bookingStatus: "CONFIRMED",
  }).select("slots");

  const conflicting = new Set(existing.flatMap((b) => b.slots));
  const unavailable = slots.filter((s) => conflicting.has(s));

  res.status(200).json({
    success: true,
    available: unavailable.length === 0,
    unavailableSlots: unavailable,
  });
});

/* ---------------------------- Create booking --------------------------- */

exports.createBooking = catchAsync(async (req, res, next) => {
  const { turfId, date, slots, customerName, customerEmail, members, paymentType } = req.body;

  if (!turfId || !date || !Array.isArray(slots) || slots.length === 0) {
    return next(new AppError("Turf, date, and at least one time slot are required.", 400));
  }
  if (!customerName || !customerEmail) {
    return next(new AppError("Name and email are required.", 400));
  }
  if (!members || members < 1) {
    return next(new AppError("Please enter a valid number of members.", 400));
  }
  if (!["UPI", "CARD", "CASH"].includes(paymentType)) {
    return next(new AppError("Please select a valid payment type.", 400));
  }
  if (isDateInPast(date)) {
    return next(new AppError("Cannot book a turf for a past date.", 400));
  }

  const turf = await Turf.findById(turfId);
  if (!turf || turf.status !== "ACTIVE") {
    return next(new AppError("This turf is not available for booking.", 404));
  }

  const sorted = sortSlots(slots);

  const invalidSlot = sorted.find((s) => !turf.availableTimings.includes(s));
  if (invalidSlot) {
    return next(new AppError(`"${invalidSlot}" is not a valid time slot for this turf.`, 400));
  }
  if (!areSlotsContiguous(sorted)) {
    return next(new AppError("Selected time slots must be consecutive.", 400));
  }

  // --- Backend is the source of truth for availability - never trust the frontend ---
  const conflicts = await Booking.find({
    turfId,
    date,
    slots: { $in: sorted },
    bookingStatus: "CONFIRMED",
  }).select("_id");

  if (conflicts.length > 0) {
    return next(new AppError("This time slot is already booked. Please select another slot.", 409));
  }

  // --- Backend is the source of truth for pricing - never trust the frontend ---
  const duration = sorted.length;
  const baseAmount = turf.pricePerHour * duration;
  const extraMembers = Math.max(0, Number(members) - (turf.baseMembersIncluded || 10));
  const additionalAmount = extraMembers * (turf.additionalMemberFee || 0);
  const totalAmount = baseAmount + additionalAmount;

  const bookingId = generateBookingId();
  const transactionId = `TXN${Date.now()}${crypto.randomInt(100, 999)}`;

  // Demo/mock payment: in a real integration this would be verified via a
  // payment gateway webhook before the booking is marked PAID.
  const paymentStatus = "PAID";

  let booking;
  try {
    booking = await Booking.create({
      bookingId,
      userId: req.user._id,
      customerName,
      customerEmail: customerEmail.toLowerCase().trim(),
      turfId: turf._id,
      turfName: turf.name,
      turfImage: turf.images[0],
      location: turf.location,
      date,
      startTime: parseSlot(sorted[0]).start,
      endTime: parseSlot(sorted[sorted.length - 1]).end,
      slots: sorted,
      duration,
      members,
      baseAmount,
      additionalAmount,
      totalAmount,
      paymentType,
      paymentStatus,
      transactionId,
      bookingStatus: "CONFIRMED",
    });
  } catch (err) {
    // Duplicate key on the (turfId, date, slots) unique index = race condition loss
    if (err.code === 11000) {
      return next(new AppError("This time slot is already booked. Please select another slot.", 409));
    }
    throw err;
  }

  await Payment.create({
    bookingId: booking._id,
    amount: totalAmount,
    paymentType,
    transactionId,
    status: "SUCCESS",
    provider: "MOCK",
  });

  // Generate QR + attach to booking
  const { dataUrl } = await generateBookingQR(booking.bookingId);
  booking.qrCode = dataUrl;
  await booking.save();

  // Best-effort: PDF + email should never block the booking response
  sendTicketEmail(booking, turf).catch((err) =>
    console.error(`Failed to send ticket email for ${booking.bookingId}:`, err.message)
  );

  res.status(201).json({
    success: true,
    message: "Booking confirmed.",
    booking,
  });
});

async function sendTicketEmail(booking, turf) {
  const pdfBuffer = await generateBookingPDF(booking, turf);
  await sendEmail({
    to: booking.customerEmail,
    subject: `Booking Confirmed - ${booking.bookingId}`,
    html: bookingConfirmationTemplate({ booking }),
    attachments: [
      {
        filename: `${booking.bookingId}-ticket.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

/* ------------------------------ Read ------------------------------ */

exports.getMyBookings = catchAsync(async (req, res) => {
  const { tab = "upcoming" } = req.query;
  const today = todayStr();

  const filter = { userId: req.user._id };

  if (tab === "cancelled") {
    filter.bookingStatus = "CANCELLED";
  } else if (tab === "completed") {
    filter.$or = [
      { bookingStatus: "COMPLETED" },
      { bookingStatus: "CONFIRMED", date: { $lt: today } },
    ];
  } else {
    filter.bookingStatus = "CONFIRMED";
    filter.date = { $gte: today };
  }

  const bookings = await Booking.find(filter).sort({ date: -1, startTime: -1 });

  res.status(200).json({ success: true, count: bookings.length, bookings });
});

exports.getBookingById = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError("Booking not found.", 404));

  const isOwner = booking.userId.toString() === req.user._id.toString();
  if (!isOwner) {
    return next(new AppError("You do not have permission to view this booking.", 403));
  }

  res.status(200).json({ success: true, booking });
});

exports.downloadTicket = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError("Booking not found.", 404));

  const isOwner = booking.userId.toString() === req.user._id.toString();
  if (!isOwner) {
    return next(new AppError("You do not have permission to access this ticket.", 403));
  }

  const turf = await Turf.findById(booking.turfId);
  const pdfBuffer = await generateBookingPDF(booking, turf);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${booking.bookingId}-ticket.pdf"`,
  });
  res.send(pdfBuffer);
});

/* ----------------------------- Cancel ----------------------------- */

exports.cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError("Booking not found.", 404));

  const isOwner = booking.userId.toString() === req.user._id.toString();
  if (!isOwner) {
    return next(new AppError("You do not have permission to cancel this booking.", 403));
  }

  if (booking.bookingStatus !== "CONFIRMED") {
    return next(new AppError("Only confirmed bookings can be cancelled.", 400));
  }
  if (isDateInPast(booking.date)) {
    return next(new AppError("Past bookings cannot be cancelled.", 400));
  }

  booking.bookingStatus = "CANCELLED";
  booking.cancellationReason = req.body.reason || "Cancelled by user";
  await booking.save();

  res.status(200).json({ success: true, message: "Booking cancelled successfully.", booking });
});

/* --------------------------- QR verification (public) --------------------------- */

exports.verifyBookingQR = catchAsync(async (req, res, next) => {
  const { token } = req.query;
  const bookingId = verifyVerificationToken(token);
  if (!bookingId) return next(new AppError("Invalid or tampered QR code.", 400));

  const booking = await Booking.findOne({ bookingId });
  if (!booking) return next(new AppError("Booking not found.", 404));

  res.status(200).json({
    success: true,
    booking: {
      bookingId: booking.bookingId,
      turfName: booking.turfName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
    },
  });
});
