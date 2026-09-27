import { Routes, Route } from "react-router-dom";

import PublicLayout from "./components/layout/PublicLayout.jsx";
import { ProtectedRoute, GuestRoute } from "./components/common/RouteGuards.jsx";

import Home from "./pages/user/Home.jsx";
import TurfListing from "./pages/user/TurfListing.jsx";
import TurfDetails from "./pages/user/TurfDetails.jsx";
import Booking from "./pages/user/Booking.jsx";
import MyBookings from "./pages/user/MyBookings.jsx";
import BookingDetails from "./pages/user/BookingDetails.jsx";

import Register from "./pages/auth/Register.jsx";
import Login from "./pages/auth/Login.jsx";
import VerifyOTP from "./pages/auth/VerifyOTP.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/turfs" element={<TurfListing />} />
        <Route path="/turfs/:id" element={<TurfDetails />} />

        {/* Guest-only auth pages */}
        <Route element={<GuestRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>
        {/* OTP/reset pages are reachable mid-flow regardless of guest/auth state */}
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Authenticated user routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-bookings/:id" element={<BookingDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
