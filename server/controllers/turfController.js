const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Turf = require("../models/Turf");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

/* ---------------------------- Public ---------------------------- */

exports.getTurfs = catchAsync(async (req, res) => {
  const { location, search, minPrice, maxPrice, minRating, facilities, sport, page = 1, limit = 12 } =
    req.query;

  const filter = { status: "ACTIVE" };

  if (location) filter.location = { $regex: `^${location}$`, $options: "i" };
  if (sport) filter.sports = sport;
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (minPrice || maxPrice) {
    filter.pricePerHour = {};
    if (minPrice) filter.pricePerHour.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerHour.$lte = Number(maxPrice);
  }
  if (facilities) {
    const facilityList = Array.isArray(facilities) ? facilities : facilities.split(",");
    filter.facilities = { $all: facilityList };
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { district: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [turfs, total] = await Promise.all([
    Turf.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Turf.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: turfs.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    turfs,
  });
});

exports.getTurfsByLocation = catchAsync(async (req, res) => {
  const turfs = await Turf.find({
    location: { $regex: `^${req.params.location}$`, $options: "i" },
    status: "ACTIVE",
  }).sort({ rating: -1 });

  res.status(200).json({ success: true, count: turfs.length, turfs });
});

exports.getTurfById = catchAsync(async (req, res, next) => {
  const turf = await Turf.findById(req.params.id);
  if (!turf) return next(new AppError("Turf not found.", 404));

  const reviews = await Review.find({ turfId: turf._id })
    .populate("userId", "username")
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({ success: true, turf, reviews });
});

// Returns which of the turf's daily slot template entries are already booked for a given date
exports.getAvailability = catchAsync(async (req, res, next) => {
  const { date } = req.query;
  if (!date) return next(new AppError("A date is required.", 400));

  const turf = await Turf.findById(req.params.id);
  if (!turf) return next(new AppError("Turf not found.", 404));

  const bookings = await Booking.find({
    turfId: turf._id,
    date,
    bookingStatus: "CONFIRMED",
  }).select("slots");

  const bookedSlots = new Set(bookings.flatMap((b) => b.slots));

  const slots = turf.availableTimings.map((slot) => ({
    slot,
    booked: bookedSlots.has(slot),
  }));

  res.status(200).json({ success: true, date, slots });
});

