const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Turf = require("../models/Turf");
const { isDateInPast } = require("../utils/slotHelpers");

exports.createReview = catchAsync(async (req, res, next) => {
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating) {
    return next(new AppError("Booking and rating are required.", 400));
  }
  if (rating < 1 || rating > 5) {
    return next(new AppError("Rating must be between 1 and 5.", 400));
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) return next(new AppError("Booking not found.", 404));

  if (booking.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only review turfs you have booked.", 403));
  }

  const isCompleted =
    booking.bookingStatus === "COMPLETED" ||
    (booking.bookingStatus === "CONFIRMED" && isDateInPast(booking.date));

  if (!isCompleted) {
    return next(new AppError("You can only review a turf after your booking is completed.", 400));
  }

  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    return next(new AppError("You have already reviewed this booking.", 409));
  }

  const review = await Review.create({
    userId: req.user._id,
    bookingId,
    turfId: booking.turfId,
    rating,
    comment,
  });

  // Recalculate the turf's aggregate rating
  const stats = await Review.aggregate([
    { $match: { turfId: booking.turfId } },
    { $group: { _id: "$turfId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Turf.findByIdAndUpdate(booking.turfId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count,
    });
  }

  res.status(201).json({ success: true, message: "Review submitted successfully.", review });
});

exports.getTurfReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ turfId: req.params.turfId })
    .populate("userId", "username")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: reviews.length, reviews });
});

// Returns the current user's bookings for a turf that are eligible to be
// reviewed right now (completed, and not already reviewed) - powers the
// "Write a Review" action on the turf details page.
exports.getEligibleBookings = catchAsync(async (req, res) => {
  const { turfId } = req.params;

  const bookings = await Booking.find({
    userId: req.user._id,
    turfId,
    bookingStatus: { $in: ["CONFIRMED", "COMPLETED"] },
  }).sort({ date: -1 });

  const eligible = bookings.filter(
    (b) => b.bookingStatus === "COMPLETED" || (b.bookingStatus === "CONFIRMED" && isDateInPast(b.date))
  );

  if (eligible.length === 0) {
    return res.status(200).json({ success: true, bookings: [] });
  }

  const reviewedBookingIds = new Set(
    (await Review.find({ bookingId: { $in: eligible.map((b) => b._id) } }).select("bookingId")).map((r) =>
      r.bookingId.toString()
    )
  );

  const unreviewed = eligible.filter((b) => !reviewedBookingIds.has(b._id.toString()));

  res.status(200).json({
    success: true,
    bookings: unreviewed.map((b) => ({
      _id: b._id,
      bookingId: b.bookingId,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
    })),
  });
});
