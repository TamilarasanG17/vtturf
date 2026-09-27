const express = require("express");
const router = express.Router();
const booking = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");

router.get("/verify", booking.verifyBookingQR); // public: scan QR to verify
router.post("/check-availability", protect, booking.checkAvailability);
router.post("/", protect, booking.createBooking);
router.get("/my-bookings", protect, booking.getMyBookings);
router.get("/:id", protect, booking.getBookingById);
router.get("/:id/ticket", protect, booking.downloadTicket);
router.patch("/:id/cancel", protect, booking.cancelBooking);

module.exports = router;
