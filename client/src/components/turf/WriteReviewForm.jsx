import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { reviewAPI } from "../../api/services.js";
import { alertError, alertSuccess } from "../../utils/alerts.js";
import { getErrorMessage } from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function WriteReviewForm({ turfId, onSubmitted }) {
  const { isAuthenticated } = useAuth();
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchEligibility = () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    reviewAPI
      .getEligibleBookings(turfId)
      .then(({ data }) => {
        setEligibleBookings(data.bookings || []);
        setSelectedBookingId(data.bookings?.[0]?._id || "");
      })
      .catch(() => setEligibleBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchEligibility, [turfId, isAuthenticated]);

  if (!isAuthenticated || loading || eligibleBookings.length === 0) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reviewAPI.create({ bookingId: selectedBookingId, rating, comment });
      await alertSuccess("Thank you!", "Your review has been submitted.");
      setComment("");
      setRating(5);
      setOpen(false);
      fetchEligibility();
      onSubmitted?.();
    } catch (err) {
      alertError("Could not submit review", getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-4">
      {!open ? (
        <button onClick={() => setOpen(true)} className="btn-outline w-full sm:w-auto">
          ✍️ Write a Review
        </button>
      ) : (
        <AnimatePresence>
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="card space-y-3 overflow-hidden p-4"
          >
            <h4 className="font-semibold text-ink-900">Rate your experience</h4>

            {eligibleBookings.length > 1 && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Which booking?</label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="input-field"
                >
                  {eligibleBookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.date} · {b.startTime} - {b.endTime}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-1 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={star <= rating ? "text-turf-500" : "text-slate-200"}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience (optional)"
              rows={3}
              className="input-field"
            />

            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-outline flex-1">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </motion.form>
        </AnimatePresence>
      )}
    </div>
  );
}
