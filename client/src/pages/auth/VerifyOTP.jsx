import { useEffect, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout.jsx";
import OTPInput from "../../components/common/OTPInput.jsx";
import { authAPI } from "../../api/services.js";
import { getErrorMessage } from "../../api/axios.js";
import { alertError, alertSuccess } from "../../utils/alerts.js";
import { useAuth } from "../../context/AuthContext.jsx";

const VERIFY_FN = {
  REGISTER: authAPI.verifyRegisterOTP,
  LOGIN: authAPI.verifyLoginOTP,
  FORGOT_PASSWORD: authAPI.verifyForgotOTP,
};

const TITLES = {
  REGISTER: "Verify your email",
  LOGIN: "Verify it's you",
  FORGOT_PASSWORD: "Verify your email",
};

const RESEND_COOLDOWN = 60;

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { email, type } = location.state || {};

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!email || !type || !VERIFY_FN[type]) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 4) {
      return alertError("Invalid OTP", "Please enter the full 4-digit code.");
    }

    setLoading(true);
    try {
      const { data } = await VERIFY_FN[type]({ email, otp });

      if (type === "REGISTER") {
        await alertSuccess("Registration successful!", "You can now log in.");
        navigate("/login");
      } else if (type === "LOGIN") {
        login(data.token, data.user);
        await alertSuccess("Login successful!", `Welcome back, ${data.user.username}.`);
        navigate("/");
      } else if (type === "FORGOT_PASSWORD") {
        navigate("/reset-password", { state: { resetToken: data.resetToken } });
      }
    } catch (err) {
      alertError("Verification failed", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authAPI.resendOTP({ email, type });
      await alertSuccess("OTP resent", `A new code was sent to ${email}.`);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      alertError("Could not resend OTP", getErrorMessage(err));
    }
  };

  return (
    <AuthLayout title={TITLES[type]} subtitle={`Enter the 4-digit code sent to ${email}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <OTPInput value={otp} onChange={setOtp} />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-slate-500">
        {cooldown > 0 ? (
          <span>Resend OTP in {cooldown}s</span>
        ) : (
          <button onClick={handleResend} className="font-semibold text-turf-700">
            Resend OTP
          </button>
        )}
      </div>
    </AuthLayout>
  );
}
