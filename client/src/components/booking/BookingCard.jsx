import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { StatusBadge } from "../common/UI.jsx";
import { bookingAPI } from "../../api/services.js";
import { alertConfirm, alertError, alertSuccess } from "../../utils/alerts.js";
import { getErrorMessage } from "../../api/axios.js";
import { saveBlobResponse } from "../../utils/download.js";

export default function BookingCard({ booking, index = 0, onCancelled }) {
  const isCancellable = booking.bookingStatus === "CONFIRMED";

  const handleCancel = async () => {
    const confirmed = await alertConfirm(
      "Cancel this booking?",
      `${booking.turfName} on ${booking.date} at ${booking.startTime}`,
      "Yes, Cancel"
    );
    if (!confirmed) return;
    try {
      await bookingAPI.cancel(booking._id);
      await alertSuccess("Booking cancelled", "Your booking has been cancelled.");
      onCancelled?.(booking._id);
    } catch (err) {
      alertError("Could not cancel", getErrorMessage(err));
    }
  };

  const handleDownload = async () => {
    try {
      const res = await bookingAPI.downloadTicket(booking._id);
      saveBlobResponse(res, `${booking.bookingId}-ticket.pdf`);
    } catch (err) {
      alertError("Download failed", getErrorMessage(err));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className="card flex flex-col gap-4 p-4 sm:flex-row"
    >
      <img src={`https://vtturf.onrender.com${booking.turfImage}`} alt={booking.turfName} className="h-32 w-full flex-shrink-0 rounded-xl object-cover sm:w-40" />
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 font-bold text-ink-900">{booking.turfName}</h3>
            <StatusBadge status={booking.bookingStatus} />
          </div>
          <p className="text-sm text-slate-500">📍 {booking.location}</p>
          <p className="mt-1 text-sm text-slate-600">
            {booking.date} · {booking.startTime} - {booking.endTime}
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="font-semibold text-turf-700">₹{booking.totalAmount}</span>
            <StatusBadge status={booking.paymentStatus} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/my-bookings/${booking._id}`} className="btn-outline !px-3 !py-1.5 text-xs">
            View Ticket
          </Link>
          <button onClick={handleDownload} className="btn-outline !px-3 !py-1.5 text-xs">
            Download PDF
          </button>
          {isCancellable && (
            <button onClick={handleCancel} className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
