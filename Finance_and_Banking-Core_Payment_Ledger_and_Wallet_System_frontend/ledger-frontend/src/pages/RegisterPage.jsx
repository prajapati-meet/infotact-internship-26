import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
  FaUserPlus,
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
        state: { email, username, password },
      });
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
        const firstError = Object.values(err.response.data.errors)[0];
        setError(firstError || "Validation failed.");
      } else {
        setError(
          err.response?.data?.message || "Registration failed."
        );
      }
    } finally {
      setLoading(false);
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
            <FaUserPlus size={28} />
          </div>
          <h1 className="card-title">Create Account</h1>
          <p className="card-subtitle">Register to manage your payment ledger</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <FaExclamationCircle className="alert-icon" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-group">
              <span className="input-icon">
                <FaUser />
              </span>
              <input
                type="text"
                placeholder="Enter your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-control"
                required
              />
            </div>
            {fieldErrors.username && (
              <p style={{ color: "var(--color-danger)", fontSize: "13px", marginTop: "6px" }}>
                {fieldErrors.username}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <span className="input-icon">
                <FaEnvelope />
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-control"
                required
              />
            </div>
            {fieldErrors.email && (
              <p style={{ color: "var(--color-danger)", fontSize: "13px", marginTop: "6px" }}>
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-icon">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-control"
                required
              />
              <span
                className="input-icon"
                style={{ cursor: "pointer", marginLeft: "8px" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {fieldErrors.password && (
              <p style={{ color: "var(--color-danger)", fontSize: "13px", marginTop: "6px" }}>
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
            style={{ marginTop: "8px", height: "52px" }}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p
          style={{
            color: "var(--color-text-light)",
            textAlign: "center",
            marginTop: "24px",
            fontSize: "14px",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--color-primary)",
              fontWeight: "600",
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;