import { motion } from "framer-motion";

export function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-turf-200 border-t-turf-600" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-40 w-full bg-slate-200" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-200" />
        <div className="h-3 w-1/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export function EmptyState({ icon = "🏟️", title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white/60 py-16 text-center"
    >
      <span className="text-4xl">{icon}</span>
      <p className="font-semibold text-ink-800">{title}</p>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </motion.div>
  );
}

const STATUS_STYLES = {
  CONFIRMED: "bg-turf-100 text-turf-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-600",
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-turf-100 text-turf-700",
  FAILED: "bg-red-100 text-red-600",
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
