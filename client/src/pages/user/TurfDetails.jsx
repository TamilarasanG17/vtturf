import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { turfAPI, reviewAPI } from "../../api/services.js";
import { LoadingSpinner, EmptyState } from "../../components/common/UI.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { alertWarning } from "../../utils/alerts.js";
import WriteReviewForm from "../../components/turf/WriteReviewForm.jsx";

function nextDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDateISO(d) {
  return d.toISOString().slice(0, 10);
}

const FACILITY_ICONS = {
  Parking: "🅿️",
  "Changing Room": "🚪",
  "Drinking Water": "💧",
  "Flood Lights": "💡",
  Washroom: "🚻",
  "Seating Area": "🪑",
  Cafeteria: "☕",
  "First Aid": "🩹",
};

export default function TurfDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [turf, setTurf] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  const dates = useMemo(() => nextDays(10), []);
  const [selectedDate, setSelectedDate] = useState(formatDateISO(dates[0]));
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    turfAPI
      .getById(id)
      .then(({ data }) => {
        setTurf(data.turf);
        setReviews(data.reviews || []);
      })
      .catch(() => setTurf(null))
      .finally(() => setLoading(false));
  }, [id]);

  const refetchReviews = () => {
    reviewAPI
      .getByTurf(id)
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => {});

    turfAPI
      .getById(id)
      .then(({ data }) => setTurf(data.turf))
      .catch(() => {});
  };

  useEffect(() => {
    if (!id) return;

    setSlotsLoading(true);
    setSelectedSlots([]);

    turfAPI
      .getAvailability(id, selectedDate)
      .then(({ data }) => setSlots(data.slots))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [id, selectedDate]);

  const toggleSlot = (slot) => {
    if (slot.booked) return;

    setSelectedSlots((prev) =>
      prev.includes(slot.slot)
        ? prev.filter((s) => s !== slot.slot)
        : [...prev, slot.slot]
    );
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      alertWarning(
        "Please log in",
        "You need an account to book a turf."
      );
      return navigate("/login");
    }

    if (selectedSlots.length === 0) {
      return alertWarning(
        "Please select a time",
        "Choose at least one time slot to continue."
      );
    }

    navigate(`/booking/${id}`, {
      state: {
        date: selectedDate,
        slots: selectedSlots,
      },
    });
  };

  if (loading) {
    return <LoadingSpinner label="Loading turf details..." />;
  }

  if (!turf) {
    return <EmptyState icon="🚫" title="Turf not found" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Gallery */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-hidden rounded-2xl"
      >
        <img
          src={`https://vtturf.onrender.com${turf.images?.[activeImage]}`}
          alt={turf.name}
          className="h-72 w-full object-cover sm:h-96"
        />
      </motion.div>

      {/* Image Thumbnails */}
      {turf.images?.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {turf.images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActiveImage(i)}
              className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                activeImage === i
                  ? "border-turf-600"
                  : "border-transparent"
              }`}
            >
              <img
                src={`https://vtturf.onrender.com${img}`}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Main Content */}
        <div className="lg:col-span-2">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">
              {turf.name}
            </h1>

            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span>📍 {turf.location}</span>

              <span>
                ⭐ {turf.rating?.toFixed(1) || "New"} ({turf.numReviews} reviews)
              </span>
            </p>

            <p className="mt-4 text-slate-600">
              {turf.description}
            </p>

            {/* Facilities */}
            <div className="mt-6">
              <h3 className="mb-2 font-semibold text-ink-800">
                Facilities
              </h3>

              <div className="flex flex-wrap gap-2">
                {turf.facilities.map((f) => (
                  <span
                    key={f}
                    className="rounded-full bg-turf-50 px-3 py-1.5 text-sm text-turf-700"
                  >
                    {FACILITY_ICONS[f] || "✅"} {f}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Date Selection */}
          <div className="mt-8">
            <h3 className="mb-3 font-semibold text-ink-800">
              Select Date
            </h3>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => {
                const iso = formatDateISO(d);
                const isActive = iso === selectedDate;

                return (
                  <button
                    key={iso}
                    onClick={() => setSelectedDate(iso)}
                    className={`flex-shrink-0 rounded-xl border px-4 py-2 text-center text-sm transition ${
                      isActive
                        ? "border-turf-600 bg-turf-600 text-white"
                        : "border-slate-200 text-ink-700 hover:border-turf-300"
                    }`}
                  >
                    <div className="font-semibold">
                      {d.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>

                    <div className="text-xs opacity-80">
                      {d.toLocaleDateString("en-IN", {
                        weekday: "short",
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          <div className="mt-6">
            <h3 className="mb-3 font-semibold text-ink-800">
              Available Slots
            </h3>

            {slotsLoading ? (
              <LoadingSpinner label="Checking availability..." />
            ) : slots.length === 0 ? (
              <EmptyState
                icon="🕒"
                title="No slots configured for this turf"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slots.map((s) => {
                  const isSelected = selectedSlots.includes(s.slot);

                  return (
                    <button
                      key={s.slot}
                      disabled={s.booked}
                      onClick={() => toggleSlot(s)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        s.booked
                          ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400 line-through"
                          : isSelected
                          ? "border-turf-600 bg-turf-600 text-white"
                          : "border-slate-200 text-ink-700 hover:border-turf-300"
                      }`}
                    >
                      {s.slot} {s.booked && "· BOOKED"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="mt-10">
            <h3 className="mb-3 font-semibold text-ink-800">
              Reviews
            </h3>

            <WriteReviewForm
              turfId={id}
              onSubmitted={refetchReviews}
            />

            {reviews.length === 0 ? (
              <EmptyState
                icon="⭐"
                title="No reviews available"
                subtitle="Be the first to review this turf."
              />
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r._id} className="card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                      <p className="font-semibold text-ink-800">
                        {r.userId?.username || "Player"}
                      </p>

                      <p className="text-turf-600">
                        {"★".repeat(r.rating)}
                        {"☆".repeat(5 - r.rating)}
                      </p>
                    </div>

                    {r.comment && (
                      <p className="mt-1 text-sm text-slate-600">
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Booking Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.1,
          }}
        >
          <div className="card sticky top-24 p-5">

            <p className="text-2xl font-bold text-turf-700">
              ₹{turf.pricePerHour}

              <span className="text-sm font-normal text-slate-400">
                {" "}
                / hour
              </span>
            </p>

            <div className="mt-3 space-y-1 text-sm text-slate-500">
              <p>
                Date:{" "}
                <span className="font-medium text-ink-800">
                  {selectedDate}
                </span>
              </p>

              <p>
                Slots:{" "}
                <span className="font-medium text-ink-800">
                  {selectedSlots.length || "—"}
                </span>
              </p>
            </div>

            <button
              onClick={handleBookNow}
              className="btn-primary mt-4 w-full"
            >
              Book Now
            </button>

            <Link
              to="/turfs"
              className="mt-3 block text-center text-xs text-slate-400 hover:text-turf-600"
            >
              ← Back to all turfs
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
