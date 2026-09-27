import api from "./axios";

/* -------------------------------- Auth -------------------------------- */

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  verifyRegisterOTP: (data) => api.post("/auth/verify-register-otp", data),
  login: (data) => api.post("/auth/login", data),
  verifyLoginOTP: (data) => api.post("/auth/verify-login-otp", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  verifyForgotOTP: (data) => api.post("/auth/verify-forgot-otp", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  resendOTP: (data) => api.post("/auth/resend-otp", data),
  getMe: () => api.get("/auth/me"),
};

/* -------------------------------- Turfs -------------------------------- */

export const turfAPI = {
  getAll: (params) => api.get("/turfs", { params }),
  getByLocation: (location) => api.get(`/turfs/location/${encodeURIComponent(location)}`),
  getById: (id) => api.get(`/turfs/${id}`),
  getAvailability: (id, date) => api.get(`/turfs/${id}/availability`, { params: { date } }),
};

/* ------------------------------ Locations ------------------------------ */

export const locationAPI = {
  getAll: (search) => api.get("/locations", { params: search ? { search } : {} }),
  getDistricts: () => api.get("/locations/districts"),
};

/* ------------------------------- Bookings ------------------------------- */

export const bookingAPI = {
  checkAvailability: (data) => api.post("/bookings/check-availability", data),
  create: (data) => api.post("/bookings", data),
  getMyBookings: (tab) => api.get("/bookings/my-bookings", { params: { tab } }),
  getById: (id) => api.get(`/bookings/${id}`),
  // Ticket download requires auth, so it must go through the axios instance
  // (which attaches the Bearer token) rather than a plain <a href> or window.open.
  downloadTicket: (id) => api.get(`/bookings/${id}/ticket`, { responseType: "blob" }),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  verifyByToken: (token) => api.get("/bookings/verify", { params: { token } }),
};

/* -------------------------------- Reviews -------------------------------- */

export const reviewAPI = {
  create: (data) => api.post("/reviews", data),
  getByTurf: (turfId) => api.get(`/reviews/turf/${turfId}`),
  getEligibleBookings: (turfId) => api.get(`/reviews/eligible/${turfId}`),
};
