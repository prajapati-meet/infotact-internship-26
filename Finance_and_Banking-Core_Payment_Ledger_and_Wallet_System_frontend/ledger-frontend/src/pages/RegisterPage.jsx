import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser,FaEnvelope,FaLock,FaEye,FaEyeSlash,} from "react-icons/fa";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      console.log({
        username,
        email,
        password,
      });

      // TODO: API Call

      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Please try again.");
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
    marginBottom: "20px",
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
              <FaUser
                style={{
                  color: "#ffffff",
                  fontSize: "20px",
                }}
              />

              <input
                type="text"
                placeholder="Enter your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div style={inputContainer}>
              <FaEnvelope
                style={{
                  color: "#ffffff",
                  fontSize: "20px",
                }}
              />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={inputContainer}>
              <FaLock
                style={{
                  color: "#ffffff",
                  fontSize: "20px",
                }}
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
              />

              {showPassword ? (
                <FaEyeSlash
                  onClick={() => setShowPassword(false)}
                  style={{
                    color: "#ffffff",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <FaEye
                  onClick={() => setShowPassword(true)}
                  style={{
                    color: "#ffffff",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                />
              )}
            </div>

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