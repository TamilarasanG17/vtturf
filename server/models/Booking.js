const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    turfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Turf",
      required: true,
    },
    turfName: {
      type: String,
      required: true,
    },
    turfImage: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    // Stored as YYYY-MM-DD for reliable equality checks/indexing
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String, // "18:00"
      required: true,
    },
    endTime: {
      type: String, // "20:00"
      required: true,
    },
    // The exact slot strings booked, e.g. ["18:00-19:00", "19:00-20:00"]
    slots: {
      type: [String],
      required: true,
    },
    duration: {
      type: Number, // in hours
      required: true,
    },
    members: {
      type: Number,
      required: true,
      min: 1,
    },
    baseAmount: {
      type: Number,
      required: true,
    },
    additionalAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["UPI", "CARD", "CASH"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    transactionId: {
      type: String,
    },
    bookingStatus: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "CONFIRMED",
    },
    qrCode: {
      type: String, // data URL / base64 PNG
    },
    cancellationReason: {
      type: String,
    },
  },
  { timestamps: true }
);

// Prevents two bookings from claiming the same turf+date+slot at the database level.
// Combined with an application-level check in the controller, this protects against
// race conditions from simultaneous booking attempts.
bookingSchema.index(
  { turfId: 1, date: 1, slots: 1 },
  {
    unique: true,
    partialFilterExpression: { bookingStatus: "CONFIRMED" },
  }
);

bookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
