# Online Turf Booking — Backend (Server)

MERN-stack backend for the Online Turf Booking Application: JWT + OTP authentication, turf listings, availability-safe booking, automatic pricing, mock payments, PDF ticket + QR code generation, email delivery, and reviews.

**Note:** This app has no admin panel/role. Turf data is managed entirely through the seed script (`npm run seed`) — see below.

## 1. Requirements

- Node.js 18+
- MongoDB (local or Atlas)
- An SMTP account for Nodemailer (e.g. a Gmail account with an **App Password**, or any SMTP provider)

## 2. Setup

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env`:

- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string
- `EMAIL_USER` / `EMAIL_PASSWORD` — SMTP credentials for OTP + ticket emails

## 3. Seed the database

```bash
npm run seed
```

This inserts ~150 Tamil Nadu locations and 60+ demo turfs across 20 cities. Run `npm run seed:fresh` to wipe and re-seed locations/turfs. To add, edit, or remove turfs later, edit `seed/turfs.js` (or insert directly into MongoDB) and re-run the seed script.

## 4. Run

```bash
npm run dev     # nodemon, auto-restart
npm start       # production
```

API runs at `http://localhost:5000/api`. Health check: `GET /api/health`.

## 5. Key API routes

```
/api/auth/register            /api/auth/verify-register-otp
/api/auth/login                /api/auth/verify-login-otp
/api/auth/forgot-password      /api/auth/verify-forgot-otp
/api/auth/reset-password       /api/auth/resend-otp

/api/turfs                     /api/turfs/location/:location
/api/turfs/:id                 /api/turfs/:id/availability?date=YYYY-MM-DD

/api/bookings                  (POST - create, server verifies price & availability)
/api/bookings/check-availability
/api/bookings/my-bookings?tab=upcoming|completed|cancelled
/api/bookings/:id/ticket       (PDF download)
/api/bookings/:id/cancel
/api/bookings/verify?token=... (public QR verification)

/api/reviews                   (POST - create a review)
/api/reviews/turf/:turfId      (GET - all reviews for a turf)
/api/reviews/eligible/:turfId  (GET - current user's reviewable bookings for a turf)
```

## 6. Design notes / security decisions

- **Passwords** are hashed with bcrypt (never returned in API responses — `toSafeObject()` strips them).
- **OTPs** are hashed before storage, expire via a MongoDB TTL index, are rate-limited on resend, and lock out after `OTP_MAX_ATTEMPTS` wrong attempts.
- **Booking amounts are always recalculated server-side** from the turf's current price — the frontend's total is never trusted.
- **Double-booking protection** is enforced at two layers: an application-level availability check, and a MongoDB partial unique index on `(turfId, date, slots)` that rejects race-condition conflicts from simultaneous requests.
- **QR codes** encode only a signed booking reference (HMAC-SHA256), not raw customer data.
- **Reviews**: a user can only review a turf via a completed booking of theirs; `/api/reviews/eligible/:turfId` tells the frontend which (if any) of the user's bookings for that turf are still reviewable, powering the "Write a Review" button on the turf details page.
- **Payments** are mocked (`Payment.provider = "MOCK"`). Swap `bookingController.createBooking`'s payment section for a real gateway call + webhook verification when you're ready to go live — keep verification server-side.

## 7. Not yet built

This is the backend only. See `client/README.md` for the frontend.
