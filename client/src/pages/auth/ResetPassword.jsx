import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import { authAPI } from "../../api/services.js";
import { getErrorMessage } from "../../api/axios.js";
import { alertError, alertSuccess } from "../../utils/alerts.js";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = location.state?.resetToken;

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  if (!resetToken) return <Navigate to="/forgot-password" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return alertError("Password mismatch", "Passwords do not match.");
    }
    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword({ resetToken, ...form });
      await alertSuccess("Password updated!", data.message);
      navigate("/login");
    } catch (err) {
      alertError("Reset failed", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password for your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">New Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="input-field"
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Confirm Password</label>
          <input
            type="password"
            required
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="input-field"
            placeholder="Re-enter new password"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </AuthLayout>
  );
}
