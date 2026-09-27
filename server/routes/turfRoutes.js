const express = require("express");
const router = express.Router();
const turf = require("../controllers/turfController");

// All turf routes are public read-only endpoints.
// Turf data is managed via the seed script (see /server/seed) since there is
// no admin panel in this application.
router.get("/", turf.getTurfs);
router.get("/location/:location", turf.getTurfsByLocation);
router.get("/:id", turf.getTurfById);
router.get("/:id/availability", turf.getAvailability);

module.exports = router;
