import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BookingCard from "../../components/booking/BookingCard.jsx";
import { EmptyState, LoadingSpinner } from "../../components/common/UI.jsx";
import { bookingAPI } from "../../api/services.js";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function MyBookings() {
  const [tab, setTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    bookingAPI
      .getMyBookings(tab)
      .then(({ data }) => setBookings(data.bookings))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const handleCancelled = (bookingId) => {
    setBookings((prev) => prev.filter((b) => b._id !== bookingId));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-ink-900 sm:text-3xl">
        My Bookings
      </motion.h1>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200 xs:gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative flex-shrink-0 px-3 py-2.5 text-sm font-semibold transition xs:px-4 ${
              tab === t.key ? "text-turf-700" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t.label}
            {tab === t.key && (
              <motion.div layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-turf-600" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <LoadingSpinner label="Loading your bookings..." />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon="📅"
            title={`No ${tab} bookings`}
            subtitle={tab === "upcoming" ? "Book a turf to see it here." : ""}
          />
        ) : (
          bookings.map((b, i) => (
            <BookingCard key={b._id} booking={b} index={i} onCancelled={handleCancelled} />
          ))
        )}
      </div>
    </div>
  );
}
