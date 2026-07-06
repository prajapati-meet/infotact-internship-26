import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);


const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setError("");
  setFieldErrors({});

  try {
    const response = await register(username, email, password);

    console.log(response.data); // Should print the OtpResponse

    // Navigate to OTP verification page
    navigate("/verify-otp", {
      state: { email },
    });
  } catch (err) {
    console.error(err);

    setError(
      err.response?.data?.message || "Registration failed."
    );
  } finally {
    setLoading(false);
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
    marginBottom: "10px",
  };

  const inputStyle = {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: "17px",
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
          background: "linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)",
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
          <h1
            style={{
              color: "#fff",
              textAlign: "center",
              marginBottom: "10px",
              fontSize: "34px",
            }}
          >
            Create Account
          </h1>

          <p
            style={{
              textAlign: "center",
              color: "#9ca3af",
              marginBottom: "35px",
            }}
          >
            Register to continue
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

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={inputContainer}>
              <FaUser color="#fff" size={20} />

              <input
                type="text"
                placeholder="Enter your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            {fieldErrors.username && (
              <p style={{ color: "#ef4444", marginBottom: "15px" }}>
                {fieldErrors.username}
              </p>
            )}

            {/* Email */}
            <div style={inputContainer}>
              <FaEnvelope color="#fff" size={20} />

              <input
                type="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            {fieldErrors.email && (
              <p style={{ color: "#ef4444", marginBottom: "15px" }}>
                {fieldErrors.email}
              </p>
            )}

            {/* Password */}
            <div style={inputContainer}>
              <FaLock color="#fff" size={20} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />

              {showPassword ? (
                <FaEyeSlash
                  color="#fff"
                  size={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <FaEye
                  color="#fff"
                  size={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            {fieldErrors.password && (
              <p style={{ color: "#ef4444", marginBottom: "15px" }}>
                {fieldErrors.password}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "60px",
                border: "none",
                borderRadius: "35px",
                background: "linear-gradient(to right,#2563eb,#3b82f6)",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "10px",
              }}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p
            style={{
              color: "#9ca3af",
              textAlign: "center",
              marginTop: "25px",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#60a5fa",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;