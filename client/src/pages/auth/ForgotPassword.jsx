import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import { authAPI } from "../../api/services.js";
import { getErrorMessage } from "../../api/axios.js";
import { alertError, alertSuccess } from "../../utils/alerts.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword({ email });
      await alertSuccess("OTP sent", data.message);
      navigate("/verify-otp", { state: { email, type: "FORGOT_PASSWORD" } });
    } catch (err) {
      alertError("Request failed", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset code"
      footer={
        <Link to="/login" className="font-semibold text-turf-700">
          ← Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@example.com"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
    </AuthLayout>
  );
}
