const mongoose = require("mongoose");

const turfSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one turf image is required",
      },
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    additionalMemberFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    baseMembersIncluded: {
      type: Number,
      default: 10,
    },
    facilities: {
      type: [String],
      default: [],
    },
    sports: {
      type: [String],
      enum: ["Football", "Cricket"],
      default: ["Football"],
    },
    availableTimings: {
      // e.g. ["06:00-07:00", "07:00-08:00", ...] - the turf's daily slot template
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

turfSchema.index({ location: 1, status: 1 });
turfSchema.index({ name: "text", location: "text", district: "text" });

module.exports = mongoose.model("Turf", turfSchema);
