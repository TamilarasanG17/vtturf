import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { bookingAPI, reviewAPI } from "../../api/services.js";
import { LoadingSpinner, StatusBadge } from "../../components/common/UI.jsx";
import { alertConfirm, alertError, alertSuccess, alertWarning } from "../../utils/alerts.js";
import { getErrorMessage } from "../../api/axios.js";
import { saveBlobResponse } from "../../utils/download.js";

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    bookingAPI
      .getById(id)
      .then(({ data }) => setBooking(data.booking))
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading your ticket..." />;
  if (!booking) return <div className="py-16 text-center text-slate-500">Booking not found.</div>;

  const isPast = new Date(booking.date) < new Date(new Date().toDateString());
  const isCompleted = booking.bookingStatus === "COMPLETED" || (booking.bookingStatus === "CONFIRMED" && isPast);
  const isCancellable = booking.bookingStatus === "CONFIRMED" && !isPast;

  const handleCancel = async () => {
    const confirmed = await alertConfirm("Cancel this booking?", "This action cannot be undone.", "Yes, Cancel");
    if (!confirmed) return;
    try {
      const { data } = await bookingAPI.cancel(id);
      setBooking(data.booking);
      alertSuccess("Booking cancelled", "Your booking has been cancelled.");
    } catch (err) {
      alertError("Could not cancel", getErrorMessage(err));
    }
  };

  const handleDownload = async () => {
    try {
      const res = await bookingAPI.downloadTicket(id);
      saveBlobResponse(res, `${booking.bookingId}-ticket.pdf`);
    } catch (err) {
      alertError("Download failed", getErrorMessage(err));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await reviewAPI.create({ bookingId: id, rating: review.rating, comment: review.comment });
      await alertSuccess("Thank you!", "Your review has been submitted.");
      setReviewSubmitted(true);
    } catch (err) {
      alertWarning("Could not submit review", getErrorMessage(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card overflow-hidden">
        {booking.bookingStatus === "CONFIRMED" && (
          <div className="bg-turf-600 py-3 text-center font-semibold text-white">Booking Confirmed ✓</div>
        )}
        {booking.bookingStatus === "CANCELLED" && (
          <div className="bg-red-500 py-3 text-center font-semibold text-white">Booking Cancelled</div>
        )}
        {booking.bookingStatus === "COMPLETED" && (
          <div className="bg-blue-500 py-3 text-center font-semibold text-white">Booking Completed</div>
        )}

        <img src={`https://vtturf.onrender.com${booking.turfImage}`} alt={booking.turfName} className="h-48 w-full object-cover" />

        <div className="space-y-4 p-4 sm:p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-ink-900">{booking.turfName}</h2>
            <p className="text-sm text-slate-500">📍 {booking.location}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <Row label="Booking ID" value={booking.bookingId} bold />
            <Row label="Customer" value={booking.customerName} />
            <Row label="Email" value={booking.customerEmail} />
            <Row label="Date" value={booking.date} />
            <Row label="Time" value={`${booking.startTime} - ${booking.endTime}`} />
            <Row label="Members" value={booking.members} />
            <Row label="Amount" value={`₹${booking.totalAmount}`} bold />
            <Row label="Payment" value={<StatusBadge status={booking.paymentStatus} />} />
            <Row label="Status" value={<StatusBadge status={booking.bookingStatus} />} />
          </div>

          {booking.qrCode && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <img src={booking.qrCode} alt="Booking QR Code" className="h-40 w-40" />
              <p className="text-xs text-slate-400">Scan to verify booking</p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <button onClick={handleDownload} className="btn-primary flex-1">
              Download PDF
            </button>
            {isCancellable && (
              <button onClick={handleCancel} className="flex-1 rounded-xl border border-red-200 py-2.5 font-semibold text-red-600 hover:bg-red-50">
                Cancel Booking
              </button>
            )}
          </div>

          <Link to="/my-bookings" className="block text-center text-xs text-slate-400 hover:text-turf-600">
            ← Back to My Bookings
          </Link>
        </div>
      </motion.div>

      {/* Review form for completed bookings */}
      {isCompleted && !reviewSubmitted && (
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          onSubmit={handleReviewSubmit}
          className="card mt-6 space-y-3 p-4 sm:p-6"
        >
          <h3 className="font-bold text-ink-900">Rate your experience</h3>
          <div className="flex gap-1 text-2xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setReview({ ...review, rating: star })}
                className={star <= review.rating ? "text-turf-500" : "text-slate-200"}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={review.comment}
            onChange={(e) => setReview({ ...review, comment: e.target.value })}
            placeholder="Share your experience (optional)"
            rows={3}
            className="input-field"
          />
          <button type="submit" disabled={submittingReview} className="btn-outline">
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </motion.form>
      )}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
      <span className="flex-shrink-0 text-slate-500">{label}</span>
      <span className={`min-w-0 break-words text-right ${bold ? "font-bold text-ink-900" : "text-ink-800"}`}>
        {value}
      </span>
    </div>
  );
}
