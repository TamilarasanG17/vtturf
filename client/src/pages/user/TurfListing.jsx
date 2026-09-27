import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import TurfCard from "../../components/turf/TurfCard.jsx";
import { SkeletonCard, EmptyState } from "../../components/common/UI.jsx";
import { turfAPI, locationAPI } from "../../api/services.js";

const FACILITY_OPTIONS = ["Parking", "Changing Room", "Flood Lights", "Washroom", "Seating Area", "Cafeteria"];

export default function TurfListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [turfs, setTurfs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    sport: "",
    facilities: [],
  });

  useEffect(() => {
    locationAPI.getAll().then(({ data }) => setLocations(data.locations)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {
      search: filters.search || undefined,
      location: filters.location || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      minRating: filters.minRating || undefined,
      sport: filters.sport || undefined,
      facilities: filters.facilities.length ? filters.facilities.join(",") : undefined,
      limit: 24,
    };
    turfAPI
      .getAll(params)
      .then(({ data }) => setTurfs(data.turfs))
      .catch(() => setTurfs([]))
      .finally(() => setLoading(false));

    const next = new URLSearchParams();
    if (filters.search) next.set("search", filters.search);
    if (filters.location) next.set("location", filters.location);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const toggleFacility = (f) =>
    setFilters((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x) => x !== f)
        : [...prev.facilities, f],
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">
          {filters.location ? `Turfs in ${filters.location}` : "All Turfs"}
        </h1>
        <p className="mt-1 text-slate-500">{turfs.length} turf{turfs.length !== 1 ? "s" : ""} found</p>
      </motion.div>

      {/* Search + filter toggle */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search turf name, city, district..."
          className="input-field flex-1"
        />
        <select
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="input-field sm:max-w-xs"
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc._id} value={loc.name}>{loc.name}</option>
          ))}
        </select>
        <button onClick={() => setShowFilters((s) => !s)} className="btn-outline whitespace-nowrap">
          {showFilters ? "Hide Filters" : "Filters"}
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 grid grid-cols-1 gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 sm:grid-cols-4"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Min Price</label>
            <input type="number" className="input-field" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Max Price</label>
            <input type="number" className="input-field" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Min Rating</label>
            <select className="input-field" value={filters.minRating} onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}>
              <option value="">Any</option>
              {[4, 3, 2].map((r) => <option key={r} value={r}>{r}+ ⭐</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Sport</label>
            <select className="input-field" value={filters.sport} onChange={(e) => setFilters({ ...filters, sport: e.target.value })}>
              <option value="">Any</option>
              <option value="Football">Football</option>
              <option value="Cricket">Cricket</option>
            </select>
          </div>
          <div className="sm:col-span-4">
            <label className="mb-2 block text-xs font-semibold text-slate-500">Facilities</label>
            <div className="flex flex-wrap gap-2">
              {FACILITY_OPTIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => toggleFacility(f)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    filters.facilities.includes(f)
                      ? "border-turf-600 bg-turf-600 text-white"
                      : "border-slate-200 text-slate-600 hover:border-turf-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : turfs.length === 0 ? (
          <EmptyState icon="🔍" title="No turfs found" subtitle="Try adjusting your search or filters." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {turfs.map((turf, i) => <TurfCard key={turf._id} turf={turf} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
