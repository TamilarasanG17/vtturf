import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";
import { alertConfirm } from "../../utils/alerts.js";

const links = [
  { to: "/", label: "Home" },
  { to: "/turfs", label: "Turfs" },
  { to: "/my-bookings", label: "My Bookings" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmed = await alertConfirm("Log out?", "You'll need to log in again to book turfs.", "Log out");
    if (confirmed) {
      logout();
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 xs:px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-1.5 text-base font-extrabold text-turf-700 xs:text-lg sm:text-xl">
          <span className="flex-shrink-0 text-xl xs:text-2xl">🏟️</span>
          <span className="truncate">
            VT<span className="text-ink-900">Turfs</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition hover:text-turf-600 ${
                  isActive ? "text-turf-700" : "text-ink-700"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-500">Hi, {user?.username}</span>
              <button onClick={handleLogout} className="btn-outline !px-4 !py-2 text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline !px-4 !py-2 text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-ink-800 xs:h-10 xs:w-10 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <motion.span animate={{ rotate: open ? 90 : 0 }} className="text-xl xs:text-2xl">
            {open ? "✕" : "☰"}
          </motion.span>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive ? "bg-turf-50 text-turf-700" : "text-ink-700"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="btn-outline text-sm">
                    Logout
                  </button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="btn-outline text-sm">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
