const catchAsync = require("../utils/catchAsync");
const Location = require("../models/Location");

exports.getLocations = catchAsync(async (req, res) => {
  const { search } = req.query;
  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { district: { $regex: search, $options: "i" } },
    ];
  }

  const locations = await Location.find(filter).sort({ name: 1 }).limit(500);

  res.status(200).json({ success: true, count: locations.length, locations });
});

exports.getDistricts = catchAsync(async (req, res) => {
  const districts = await Location.distinct("district", { isActive: true });
  res.status(200).json({ success: true, districts: districts.sort() });
});
