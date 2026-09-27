import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-6xl">🏟️</p>
        <h1 className="mt-4 text-3xl font-bold text-ink-900">Page Not Found</h1>
        <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
