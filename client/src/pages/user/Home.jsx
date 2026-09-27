import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HeroSection from "../../components/turf/HeroSection.jsx";
import LocationSelector from "../../components/turf/LocationSelector.jsx";
import TurfCard from "../../components/turf/TurfCard.jsx";
import { SkeletonCard, EmptyState } from "../../components/common/UI.jsx";
import { turfAPI } from "../../api/services.js";

const TESTIMONIALS = [
  {
    name: "Arun K.",
    quote: "Booking a turf used to mean phone calls and guesswork. Now I pick a slot and I'm done in a minute.",
  },
  {
    name: "Priya S.",
    quote: "Loved getting the PDF ticket with the QR code instantly — made checking in at the turf effortless.",
  },
  {
    name: "Karthik R.",
    quote: "Great range of turfs across the city with honest pricing shown upfront. No surprises at checkout.",
  },
];

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    turfAPI
      .getAll({ limit: 8 })
      .then(({ data }) => {
        const turfs = data.turfs || [];
        setPopular([...turfs].sort((a, b) => b.rating - a.rating).slice(0, 4));
        setFeatured(turfs.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <HeroSection />
      <LocationSelector />

      {/* Popular Turfs */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading title="Popular Turfs" subtitle="Loved by players across Tamil Nadu" />
        <TurfGrid loading={loading} turfs={popular} />
      </section>

      {/* Featured Turfs */}
      <section className="bg-turf-50/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Featured Turfs" subtitle="Hand-picked grounds with top amenities" />
          <TurfGrid loading={loading} turfs={featured} />
          <div className="mt-8 text-center">
            <Link to="/turfs" className="btn-primary">
              Browse All Turfs
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Why VTTurfs?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            We connect players with verified, well-maintained football and cricket turfs across Tamil Nadu.
            Real-time slot availability, instant confirmation, and a digital ticket with a QR code mean less
            waiting and more playing.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: "⚡", label: "Instant Booking", desc: "Real-time slots, no waiting on calls" },
              { icon: "🎟️", label: "Digital Tickets", desc: "PDF ticket with QR code, straight to your inbox" },
              { icon: "🔒", label: "Secure & Verified", desc: "OTP-secured accounts and verified turf listings" },
            ].map((f) => (
              <div key={f.label} className="card p-4 sm:p-6">
                <p className="text-3xl">{f.icon}</p>
                <p className="mt-3 font-bold text-ink-900">{f.label}</p>
                <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Reviews / Testimonials */}
      <section className="bg-ink-900 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="What Players Say" subtitle="" dark />
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl bg-white/5 p-4 text-slate-200 sm:p-6"
              >
                <p className="text-turf-400">★★★★★</p>
                <p className="mt-3 text-sm italic">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-white">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ title, subtitle, dark = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <h2 className={`text-2xl font-bold sm:text-3xl ${dark ? "text-white" : "text-ink-900"}`}>{title}</h2>
      {subtitle && <p className={`mt-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>{subtitle}</p>}
    </motion.div>
  );
}

function TurfGrid({ loading, turfs }) {
  if (loading) {
    return (
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  if (turfs.length === 0) {
    return <div className="mt-8"><EmptyState icon="🏟️" title="No turfs found" subtitle="Check back soon." /></div>;
  }
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {turfs.map((turf, i) => (
        <TurfCard key={turf._id} turf={turf} index={i} />
      ))}
    </div>
  );
}
