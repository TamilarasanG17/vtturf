const express = require("express");
const router = express.Router();
const location = require("../controllers/locationController");

router.get("/", location.getLocations);
router.get("/districts", location.getDistricts);

module.exports = router;
