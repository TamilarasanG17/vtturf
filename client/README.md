# Online Turf Booking — Frontend (Client)

React + Vite + Tailwind CSS + Framer Motion frontend for the Online Turf Booking Application ("KickBoxTurfs"), talking to the Express backend in `../server`.

**Note:** There is no admin panel in this app. Turf data is managed via the backend's seed script.

## 1. Setup

```bash
cd client
npm install
npm run dev
```

Runs at `http://localhost:5173`. The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000` (the backend) — see `vite.config.js`. Make sure the backend is running first (`cd ../server && npm run dev`) and has been seeded (`npm run seed`).

## 2. What's included

- **Auth**: Register → 4-digit OTP → Login → 4-digit OTP; Forgot Password → OTP → Reset. Auth pages use a split-screen layout — a full-height turf image + brand/quote on the left on desktop, the form centered on the right; single column on mobile.
- **Home**: hero + search, location picker (from DB), popular/featured turfs, about, testimonials
- **Turf listing**: search + filters (price, rating, sport, facilities), location-based routing
- **Turf details**: image gallery, facilities, date + time-slot picker (live availability), reviews, and a **"Write a Review" button** for users with a completed, unreviewed booking for that turf
- **Booking**: responsive layout (turf image left / form right on desktop, stacked on mobile), manual name/email entry, automatic price calculation, SweetAlert2 confirmation dialog
- **My Bookings**: Upcoming / Completed / Cancelled tabs, ticket view, PDF download (authenticated blob download, not a plain link), cancel
- **Reviews**: star rating + comment, available both from the turf details page (via the eligible-bookings check) and from the booking ticket page
- **Framer Motion** throughout: scroll-triggered fades, staggered card entrances, hover/tap micro-interactions, animated mobile menu, tab underline transitions. Respects `prefers-reduced-motion`.
- **SweetAlert2** for every success/error/warning/confirmation — no native `alert()`/`confirm()` anywhere.
- **Responsive down to ~280px wide**: a custom `xs` (380px) Tailwind breakpoint steps up padding/typography/OTP-box sizing between the smallest phones and `sm` (640px); global `overflow-x: hidden` guards against any residual horizontal scroll.

## 3. Environment

No `.env` needed for local dev (the Vite proxy handles API routing). For a production build pointed at a deployed backend, either:
- Serve the built `client/dist` from the same origin as the API, or
- Add an `.env` with `VITE_API_URL` and update `src/api/axios.js`'s `baseURL` accordingly, plus configure CORS (`CLIENT_URL`) on the backend.

## 4. Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```

## 5. Notes

- Authenticated file downloads (ticket PDFs) go through `axios` with `responseType: "blob"` and a manually-triggered save — a plain `<a href>`/`window.open()` would not carry the JWT and would 401.
- Booking totals are computed client-side for display only; the backend always recalculates and is the source of truth.
