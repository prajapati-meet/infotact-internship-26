import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const email = location.state?.email;
  const username = location.state?.username;
  const password = location.state?.password;

  // Redirect if user comes directly to this page
  if (!email) {
    navigate("/register", { replace: true });
    return null;
  }

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

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

      const { accessToken, username, email: returnedEmail } =
        response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("username", username);
      localStorage.setItem("email", returnedEmail);

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
    setError("");
    setSuccess("");
    setResendLoading(true);

    try {
      await axiosInstance.post("/auth/register/initiate", {
        username,
        email,
        password,
      });

      setSuccess("OTP has been sent again.");
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f7fc",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 5px 15px rgba(0,0,0,.1)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>
          Verify OTP
        </h2>

        <p style={{ textAlign: "center", color: "#666" }}>
          Enter the OTP sent to
          <br />
          <strong>{email}</strong>
        </p>

        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              color: "green",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <input
            type="text"
            value={otp}
            onChange={handleOtpChange}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              fontSize: "18px",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
            }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          onClick={handleResendOtp}
          disabled={resendLoading}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
          }}
        >
          {resendLoading
            ? "Resending..."
            : "Resend OTP"}
        </button>

        <div style={{ textAlign: "center" }}>
          <Link to="/register">
            Back to Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;