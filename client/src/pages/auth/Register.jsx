import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import { authAPI } from "../../api/services.js";
import { getErrorMessage } from "../../api/axios.js";
import { alertError, alertSuccess } from "../../utils/alerts.js";

const initialForm = { username: "", email: "", password: "", confirmPassword: "" };

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return alertError("Password mismatch", "Password and Confirm Password must match.");
    }

    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      await alertSuccess("OTP sent!", data.message);
      navigate("/verify-otp", { state: { email: form.email, type: "REGISTER" } });
    } catch (err) {
      alertError("Registration failed", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join KickBoxTurfs to book football & cricket turfs"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-turf-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            minLength={3}
            className="input-field"
            placeholder="e.g. tamilarasan"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            className="input-field"
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Re-enter password"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Sending OTP..." : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
}
