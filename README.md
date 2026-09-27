# KickBoxTurfs — Online Turf Booking Application

Full MERN-stack turf (football/cricket) booking platform.

```
online-turf-booking/
├── client/   React + Vite + Tailwind + Framer Motion frontend
└── server/   Node/Express + MongoDB backend
```

## Quick start

```bash
# 1. Backend
cd server
npm install
cp .env.example .env    # fill in MONGO_URI, JWT_SECRET, EMAIL_*, ADMIN_REGISTRATION_CODE
npm run seed             # seeds Tamil Nadu locations + demo turfs + admin account
npm run dev               # http://localhost:5000

# 2. Frontend (separate terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

See `server/README.md` and `client/README.md` for full details, API reference, and design notes.

## What's built

- User auth with JWT + 4-digit email OTP (register, login, forgot password) — split-screen auth pages (image left / form right on desktop)
- Location-based turf discovery, search & filters, live slot availability
- Booking flow with server-verified pricing and double-booking protection (DB-level unique index + app-level check)
- Mock payment flow, PDF ticket generation with embedded turf image + signed QR code, emailed automatically via Nodemailer
- My Bookings (upcoming/completed/cancelled); reviews restricted to completed bookings, with a "Write a Review" entry point on both the turf details page and the booking ticket page
- Tamil Nadu seed data: ~150 locations across 28 districts, 60+ demo turfs across 20 cities
- Framer Motion animations throughout; fully responsive down to ~280px wide (the booking page in particular: turf image left / form right on desktop, stacked on mobile)
- No admin panel/role — turf data is managed via the backend seed script

## Not included / next steps

- A real payment gateway integration (currently mocked, as requested)
- A way to manage turfs without editing the seed script or DB directly
- Production deployment config (Docker, CI/CD, hosting-specific env setup)
- Automated test suite
