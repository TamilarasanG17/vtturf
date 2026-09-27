import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { turfAPI, bookingAPI } from "../../api/services.js";
import { LoadingSpinner } from "../../components/common/UI.jsx";
import { alertBookingConfirmation, alertError, alertSuccess, alertWarning } from "../../utils/alerts.js";
import { getErrorMessage } from "../../api/axios.js";

function formatSlotRange(slots) {
  if (slots.length === 0) return "";
  const sorted = [...slots].sort();
  const start = sorted[0].split("-")[0];
  const end = sorted[sorted.length - 1].split("-")[1];
  return `${start} - ${end}`;
}

export default function Booking() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { date, slots } = location.state || {};

  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    members: 10,
    paymentType: "UPI",
  });

  useEffect(() => {
    turfAPI
      .getById(id)
      .then(({ data }) => setTurf(data.turf))
      .catch(() => setTurf(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (!date || !slots || slots.length === 0) {
    return <Navigate to={`/turfs/${id}`} replace />;
  }

  if (loading) return <LoadingSpinner label="Preparing your booking..." />;
  if (!turf) return null;

  const duration = slots.length;
  const baseAmount = turf.pricePerHour * duration;
  const extraMembers = Math.max(0, Number(form.members || 0) - (turf.baseMembersIncluded || 10));
  const additionalAmount = extraMembers * (turf.additionalMemberFee || 0);
  const totalAmount = baseAmount + additionalAmount;
  const timeRange = formatSlotRange(slots);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.customerEmail.trim()) {
      return alertWarning("Missing details", "Please enter all required fields.");
    }
    if (!form.members || form.members < 1) {
      return alertWarning("Invalid members", "Please enter a valid number of members.");
    }

    const confirmed = await alertBookingConfirmation({
      turfName: turf.name,
      location: turf.location,
      date,
      time: timeRange,
      name: form.customerName,
      email: form.customerEmail,
      members: form.members,
      totalAmount,
      paymentType: form.paymentType,
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const { data } = await bookingAPI.create({
        turfId: id,
        date,
        slots,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        members: Number(form.members),
        paymentType: form.paymentType,
      });
      await alertSuccess("Booking confirmed!", `Your booking ID is ${data.booking.bookingId}.`);
      navigate(`/my-bookings/${data.booking._id}`);
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.toLowerCase().includes("already booked")) {
        alertWarning("Slot already booked", "This time slot is already booked. Please select another slot.");
        navigate(`/turfs/${id}`);
      } else {
        alertError("Booking failed", message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Turf image - left on desktop, top on mobile */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <div className="overflow-hidden rounded-2xl">
            <img src={turf.images[0]} alt={turf.name} className="h-56 w-full object-cover sm:h-72" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-ink-900">{turf.name}</h2>
          <p className="text-sm text-slate-500">📍 {turf.location}</p>

          <div className="card mt-6 space-y-2 p-4 text-sm sm:p-5">
            <div className="flex flex-wrap justify-between gap-x-2"><span className="text-slate-500">Date</span><span className="font-medium">{date}</span></div>
            <div className="flex flex-wrap justify-between gap-x-2"><span className="text-slate-500">Time</span><span className="font-medium">{timeRange}</span></div>
            <div className="flex flex-wrap justify-between gap-x-2"><span className="text-slate-500">Duration</span><span className="font-medium">{duration} hour(s)</span></div>
            <div className="my-2 border-t border-dashed" />
            <div className="flex flex-wrap justify-between gap-x-2"><span className="text-slate-500">Base Amount</span><span>₹{baseAmount}</span></div>
            <div className="flex flex-wrap justify-between gap-x-2"><span className="text-slate-500">Additional Member Fee</span><span>₹{additionalAmount}</span></div>
            <div className="flex flex-wrap justify-between gap-x-2 text-base font-bold text-turf-700"><span>Total</span><span>₹{totalAmount}</span></div>
          </div>
        </motion.div>

        {/* Booking form - right on desktop, bottom on mobile */}
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="card space-y-4 p-4 sm:p-6"
        >
          <h3 className="font-bold text-ink-900">Customer Information</h3>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Name</label>
            <input
              required
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="input-field"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Email</label>
            <input
              type="email"
              required
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              className="input-field"
              placeholder="Ticket will be sent here"
            />
          </div>

          <h3 className="pt-2 font-bold text-ink-900">Booking Information</h3>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Number of Members</label>
            <input
              type="number"
              min={1}
              required
              value={form.members}
              onChange={(e) => setForm({ ...form, members: e.target.value })}
              className="input-field"
            />
            <p className="mt-1 text-xs text-slate-400">
              First {turf.baseMembersIncluded || 10} included; ₹{turf.additionalMemberFee || 0} per extra member.
            </p>
          </div>

          <h3 className="pt-2 font-bold text-ink-900">Payment</h3>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Payment Type</label>
            <select
              value={form.paymentType}
              onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
              className="input-field"
            >
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="CASH">Cash</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-turf-50 px-4 py-3">
            <span className="text-sm font-medium text-turf-800">Total Amount</span>
            <span className="text-xl font-bold text-turf-700">₹{totalAmount}</span>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Confirming Booking..." : "Book Now"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
