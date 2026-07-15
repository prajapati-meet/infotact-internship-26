import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import {
  FaShieldAlt,
  FaKey,
  FaArrowLeft,
  FaRedo,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const username = location.state?.username;
  const password = location.state?.password;

  if (!email) {
    navigate("/register", { replace: true });
    return null;
  }

  const { verifyLogin } = useAuth();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(
        "/auth/register/verify",
        {
          email,
          otp,
        }
      );

      const {
        accessToken,
        username,
        email: returnedEmail,
        role,
        profilePhoto,
      } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("username", username);
      localStorage.setItem("email", returnedEmail);
      localStorage.setItem("role", role || "USER");
      localStorage.setItem("profilePhoto", profilePhoto || "");

      verifyLogin(username, returnedEmail, role || "USER", profilePhoto || "");

      setSuccess("Registration completed successfully.");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      await axiosInstance.post(`/auth/register/resend-otp?email=${encodeURIComponent(email)}`);
      setSuccess("OTP has been sent again.");
      setCooldown(60);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to resend OTP."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card card">
        <div className="card-header" style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              backgroundColor: "var(--color-primary-light)",
              color: "var(--color-primary)",
              marginBottom: "16px",
            }}
          >
            <FaShieldAlt size={28} />
          </div>
          <h1 className="card-title">Verify OTP</h1>
          <p className="card-subtitle">
            Enter the 6-digit verification code sent to
            <br />
            <strong style={{ color: "var(--color-text-main)" }}>{email}</strong>
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <FaExclamationCircle className="alert-icon" />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <FaCheckCircle className="alert-icon" />
            <div>{success}</div>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label" style={{ textAlign: "center" }}>Verification Code</label>
            <div className="input-group">
              <span className="input-icon">
                <FaKey />
              </span>
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                maxLength={6}
                className="input-control input-control-otp"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
            style={{ height: "52px" }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          onClick={handleResendOtp}
          disabled={resendLoading || cooldown > 0}
          className="btn btn-secondary btn-block"
          style={{ marginTop: "12px", height: "52px" }}
        >
          <FaRedo size={12} />
          {resendLoading ? "Resending..." : cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
        </button>

        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
          }}
        >
          <Link
            to="/register"
            style={{
              color: "var(--color-primary)",
              fontWeight: "600",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <FaArrowLeft size={12} />
            Back to Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;