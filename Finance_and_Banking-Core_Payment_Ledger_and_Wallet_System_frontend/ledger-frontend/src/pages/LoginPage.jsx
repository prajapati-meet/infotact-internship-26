// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");
//     setLoading(true);

//     try {
//       await login(email, password);
//       navigate("/dashboard");
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//         "Invalid email or password."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         background: "#f4f7fc",
//         fontFamily: "Arial, sans-serif",
//       }}
//     >
//       <div
//         style={{
//           width: "400px",
//           background: "#fff",
//           padding: "35px",
//           borderRadius: "12px",
//           boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
//         }}
//       >
//         <h2
//           style={{
//             textAlign: "center",
//             marginBottom: "8px",
//             color: "#333",
//           }}
//         >
//           Welcome Back
//         </h2>

//         <p
//           style={{
//             textAlign: "center",
//             color: "#777",
//             marginBottom: "25px",
//           }}
//         >
//           Login to your account
//         </p>

//         {error && (
//           <div
//             style={{
//               background: "#fee2e2",
//               color: "#b91c1c",
//               padding: "10px",
//               borderRadius: "6px",
//               marginBottom: "20px",
//               textAlign: "center",
//             }}
//           >
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div style={{ marginBottom: "18px" }}>
//             <label
//               style={{
//                 display: "block",
//                 marginBottom: "6px",
//                 fontWeight: "bold",
//               }}
//             >
//               Email
//             </label>

//             <input
//               type="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               style={{
//                 width: "100%",
//                 padding: "12px",
//                 border: "1px solid #ccc",
//                 borderRadius: "8px",
//                 fontSize: "15px",
//                 boxSizing: "border-box",
//               }}
//             />
//           </div>

//           <div style={{ marginBottom: "22px" }}>
//             <label
//               style={{
//                 display: "block",
//                 marginBottom: "6px",
//                 fontWeight: "bold",
//               }}
//             >
//               Password
//             </label>

//             <input
//               type="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               style={{
//                 width: "100%",
//                 padding: "12px",
//                 border: "1px solid #ccc",
//                 borderRadius: "8px",
//                 fontSize: "15px",
//                 boxSizing: "border-box",
//               }}
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             style={{
//               width: "100%",
//               padding: "12px",
//               backgroundColor: loading ? "#94a3b8" : "#2563eb",
//               color: "#fff",
//               border: "none",
//               borderRadius: "8px",
//               fontSize: "16px",
//               fontWeight: "bold",
//               cursor: loading ? "not-allowed" : "pointer",
//             }}
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <p
//           style={{
//             marginTop: "20px",
//             textAlign: "center",
//             color: "#555",
//           }}
//         >
//           Don't have an account?{" "}
//           <Link
//             to="/register"
//             style={{
//               color: "#2563eb",
//               fontWeight: "bold",
//               textDecoration: "none",
//             }}
//           >
//             Register
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid email or password."
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
          <h1
            style={{
              color: "#fff",
              textAlign: "center",
              marginBottom: "10px",
              fontSize: "34px",
            }}
          >
            Welcome Back
          </h1>

          <p
            style={{
              textAlign: "center",
              color: "#9ca3af",
              marginBottom: "35px",
            }}
          >
            Login to continue
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
            {/* Email */}

            <div style={inputContainer}>
              <FaEnvelope
                style={{
                  color: "#fff",
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
                  color: "#fff",
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
                    color: "#fff",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <FaEye
                  onClick={() => setShowPassword(true)}
                  style={{
                    color: "#fff",
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
                background:
                  "linear-gradient(to right,#2563eb,#3b82f6)",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "10px",
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p
            style={{
              color: "#9ca3af",
              textAlign: "center",
              marginTop: "25px",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#60a5fa",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;