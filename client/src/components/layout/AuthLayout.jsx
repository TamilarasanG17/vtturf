import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const QUOTE = {
  text: "Booking a turf used to mean phone calls and guesswork. Now I pick a slot and I'm done in a minute.",
  author: "Arun K.",
};

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Left panel: full-height image + brand, desktop only */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=70"
          alt="Football turf"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/50 to-ink-900/20" />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-white">
            🏟️ VT<span className="text-turf-400">Turfs</span>
          </Link>

          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold leading-snug text-white xl:text-4xl"
            >
              Play. Book.
              <br />
              Enjoy.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-3 max-w-sm text-sm text-slate-200"
            >
              Real-time slot availability, instant confirmation, and a digital ticket with a QR
              code for every game.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 max-w-sm rounded-2xl bg-white/10 p-4 backdrop-blur"
            >
              <p className="text-turf-400">★★★★★</p>
              <p className="mt-2 text-sm italic text-slate-100">&ldquo;{QUOTE.text}&rdquo;</p>
              <p className="mt-2 text-xs font-semibold text-white">{QUOTE.author}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-turf-50 via-white to-slate-50 px-3 py-8 xs:px-5 sm:px-8 lg:bg-none">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-[22rem] sm:max-w-sm"
        >
          <Link
            to="/"
            className="mb-5 flex items-center justify-center gap-1.5 text-lg font-extrabold text-turf-700 sm:mb-6 sm:text-xl lg:hidden"
          >
            🏟️ VTTurfs
          </Link>
          <h1 className="text-center text-xl font-bold text-ink-900 sm:text-2xl">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-center text-xs text-slate-500 sm:text-sm">{subtitle}</p>
          )}
          <div className="mt-5 sm:mt-6">{children}</div>
          {footer && <div className="mt-5 text-center text-xs text-slate-500 sm:mt-6 sm:text-sm">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}
