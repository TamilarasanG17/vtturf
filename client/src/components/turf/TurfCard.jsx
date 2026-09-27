import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function TurfCard({ turf, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.4) }}
      whileHover={{ y: -8 }}
      className="card group overflow-hidden"
    >
      <Link to={`/turfs/${turf._id}`}>
        <div className="relative h-44 w-full overflow-hidden">
          <motion.img
            src={turf.images?.[0]}
            alt={turf.name}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-turf-700 shadow">
            ⭐ {turf.rating?.toFixed(1) || "New"}
          </span>
        </div>
        <div className="space-y-1.5 p-4">
          <h3 className="truncate font-bold text-ink-900">{turf.name}</h3>
          <p className="flex items-center gap-1 text-sm text-slate-500">📍 {turf.location}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <p className="font-bold text-turf-700">
              ₹{turf.pricePerHour}
              <span className="text-xs font-normal text-slate-400"> / hour</span>
            </p>
            <span className="rounded-lg bg-turf-50 px-2.5 py-1.5 text-xs font-semibold text-turf-700 transition group-hover:bg-turf-600 group-hover:text-white">
              View Details
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
