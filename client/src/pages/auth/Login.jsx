import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import { authAPI } from "../../api/services.js";
import { getErrorMessage } from "../../api/axios.js";
import { alertError, alertSuccess } from "../../utils/alerts.js";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      await alertSuccess("OTP sent!", data.message);
      navigate("/verify-otp", { state: { email: form.email, type: "LOGIN" } });
    } catch (err) {
      alertError("Login failed", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to book your next turf"
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-semibold text-turf-700">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-ink-700">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-turf-700">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-field"
            placeholder="Your password"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}
