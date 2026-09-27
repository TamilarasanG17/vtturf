import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { locationAPI } from "../../api/services.js";

export default function LocationSelector() {
  const [locations, setLocations] = useState([]);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    locationAPI
      .getAll()
      .then(({ data }) => setLocations(data.locations))
      .catch(() => setLocations([]));
  }, []);

  const filtered = locations.filter((loc) =>
    loc.name.toLowerCase().includes(query.toLowerCase())
  );
  const visible = showAll ? filtered : filtered.slice(0, 18);

  return (
    <section id="locations" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Choose Your Location</h2>
        <p className="mt-2 text-slate-500">Select a city to see available turfs near you</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city..."
          className="input-field mx-auto mt-4 max-w-xs"
        />
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {visible.map((loc, i) => (
          <motion.button
            key={loc._id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/turfs?location=${encodeURIComponent(loc.name)}`)}
            className="card flex flex-col items-center gap-1 px-3 py-4 text-sm font-semibold text-ink-800 hover:border-turf-300 hover:text-turf-700"
          >
            📍 {loc.name}
          </motion.button>
        ))}
      </div>

      {!showAll && filtered.length > 18 && (
        <div className="mt-6 text-center">
          <button onClick={() => setShowAll(true)} className="btn-outline">
            View All Locations ({filtered.length})
          </button>
        </div>
      )}
    </section>
  );
}
