import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-ink-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-white">
            🏟️ VTTurfs
          </p>
          <p className="mt-3 text-sm text-slate-400">
            Book football & cricket turfs across Tamil Nadu in a few taps. Play. Book. Enjoy.
          </p>
        </div>

        <div>
          <p className="mb-3 font-semibold text-white">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-turf-400">Home</Link></li>
            <li><Link to="/turfs" className="hover:text-turf-400">All Turfs</Link></li>
            <li><Link to="/my-bookings" className="hover:text-turf-400">My Bookings</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold text-white">Account</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-turf-400">Login</Link></li>
            <li><Link to="/register" className="hover:text-turf-400">Sign Up</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold text-white">Contact</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>support@vturfs.com</li>
            <li>Madurai, Tamil Nadu</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} VTTurfs. All rights reserved.
      </div>
    </footer>
  );
}
