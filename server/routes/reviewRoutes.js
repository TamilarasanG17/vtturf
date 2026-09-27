const express = require("express");
const router = express.Router();
const review = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.get("/turf/:turfId", review.getTurfReviews);
router.get("/eligible/:turfId", protect, review.getEligibleBookings);
router.post("/", protect, review.createReview);

module.exports = router;
