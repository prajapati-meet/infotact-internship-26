import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import {
  FaShieldAlt,
  FaKey,
  FaArrowLeft,
  FaRedo,
} from "react-icons/fa";

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const email = location.state?.email;
  const username = location.state?.username;
  const password = location.state?.password;

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

      const {
        accessToken,
        username,
        email: returnedEmail,
      } = response.data;

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

  const inputContainer = {
    display: "flex",
    alignItems: "center",
    background: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "40px",
    height: "65px",
    padding: "0 20px",
    marginBottom: "25px",
  };

  const inputStyle = {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: "22px",
    textAlign: "center",
    letterSpacing: "10px",
    marginLeft: "15px",
  };

  return (
    <>
      <style>{`
        input::placeholder{
          color:#9ca3af;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "430px",
            maxWidth: "90%",
            background: "#111827",
            borderRadius: "25px",
            padding: "40px",
            boxShadow: "0 15px 40px rgba(0,0,0,.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "15px",
            }}
          >
            <FaShieldAlt size={55} color="#60a5fa" />
          </div>

          <h2
            style={{
              color: "#fff",
              textAlign: "center",
              marginBottom: "25px",
            }}
          >
            Verify OTP
          </h2>

          <p
            style={{
              textAlign: "center",
              color: "#9ca3af",
              marginBottom: "35px",
              lineHeight: "1.6",
            }}
          >
            Enter the 6-digit OTP sent to
            <br />
            <strong style={{ color: "#fff" }}>{email}</strong>
          </p>

          {error && (
            <div
              style={{
                background: "#7f1d1d",
                color: "#fff",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: "#14532d",
                color: "#fff",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div style={inputContainer}>
              <FaKey color="#fff" size={20} />

              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                maxLength={6}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "60px",
                border: "none",
                borderRadius: "35px",
                background:
                  "linear-gradient(to right,#2563eb,#3b82f6)",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
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
              height: "60px",
              border: "1px solid #3b82f6",
              borderRadius: "35px",
              background: "transparent",
              color: "#60a5fa",
              fontSize: "17px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <FaRedo />
            {resendLoading ? "Resending..." : "Resend OTP"}
          </button>

          <div
            style={{
              textAlign: "center",
              marginTop: "25px",
            }}
          >
            <Link
              to="/register"
              style={{
                color: "#60a5fa",
                textDecoration: "none",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaArrowLeft />
              Back to Register
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default OtpVerificationPage;