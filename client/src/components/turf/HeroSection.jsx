import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search ? `/turfs?search=${encodeURIComponent(search)}` : "/turfs");
  };

  return (
    <section className="relative overflow-hidden bg-ink-900">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1600&q=70"
          alt="Football turf at night"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/70 to-ink-900/30" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center sm:py-32">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-extrabold leading-tight text-white xs:text-4xl sm:text-5xl lg:text-6xl"
        >
          Book Your Turf.
          <br />
          <span className="text-turf-400">Play. Book. Enjoy.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-4 max-w-xl text-slate-300"
        >
          Find and book the best football & cricket turfs across Tamil Nadu, in just a few taps.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleSearch}
          className="mt-8 flex w-full max-w-lg flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search turf name, city, district..."
            className="flex-1 rounded-xl border-none px-4 py-3 text-sm text-ink-900 outline-none"
          />
          <button type="submit" className="btn-primary sm:px-6">
            Search Turf
          </button>
        </motion.form>

        <motion.a
          href="#locations"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-6 text-sm font-medium text-turf-300 underline-offset-4 hover:underline"
        >
          Or select a location ↓
        </motion.a>
      </div>
    </section>
  );
}
