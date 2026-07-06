import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth;

 
  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        backgroundColor: "#1e293b",
        color: "#fff",
      }}
    >
     
      <h2>💳 Ledger</h2>

      
      <div style={{ display: "flex", gap: "20px" }}>
        <Link
          to="/dashboard"
          style={{ color: "#fff", textDecoration: "none" }}
        >
          Dashboard
        </Link>

        <Link
          to="/transfer"
          style={{ color: "#fff", textDecoration: "none" }}
        >
          Send Money
        </Link>
      </div>

      
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <span>Welcome, {user?.username || "User"}</span>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;