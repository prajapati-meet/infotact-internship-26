import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=3b82f6&color=fff&name=User";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  // ✅ Hooks must be called BEFORE any conditional return
  if (!isAuthenticated) return null;

  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate("/login");
  };

  const handleProfile = () => {
    setShowMenu(false);
    navigate("/profile");
  };

  const avatarSrc = user?.photo || user?.profilePhoto || DEFAULT_AVATAR;

  const navLinkStyle = {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "15px",
    padding: "6px 12px",
    borderRadius: "8px",
    transition: "background 0.2s",
  };

  const adminLinkStyle = {
    ...navLinkStyle,
    background: "rgba(239,68,68,0.25)",
    border: "1px solid rgba(239,68,68,0.4)",
    color: "#fca5a5",
  };

  return (
    <nav
      style={{
        background: "linear-gradient(90deg,#0f172a,#1e3a8a,#2563eb)",
        padding: "14px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <Link
        to="/dashboard"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
          color: "#fff",
          fontSize: "24px",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "28px" }}>💳</span>
        Ledger
      </Link>

      {/* Navigation Links */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Link to="/dashboard" style={navLinkStyle}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          Dashboard
        </Link>

        <Link to="/transfer" style={navLinkStyle}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          Send Money
        </Link>

        <Link to="/transactions" style={navLinkStyle}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          Transactions
        </Link>

        {/* Admin-only link */}
        {isAdmin && (
          <Link to="/admin" style={adminLinkStyle}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.4)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.25)"}
          >
            🛡️ Admin Panel
          </Link>
        )}
      </div>

      {/* User Section with Dropdown */}
      <div style={{ position: "relative" }}>
        {/* Avatar + Username button — toggles dropdown */}
        <div
          onClick={() => setShowMenu(!showMenu)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 14px",
            borderRadius: "30px",
            background: "rgba(255,255,255,0.15)",
            cursor: "pointer",
            transition: "0.3s",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
        >
          <img
            src={avatarSrc}
            alt="profile"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid white",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
            <span style={{ color: "#fff", fontWeight: "700", fontSize: "14px" }}>
              {user?.username || "User"}
            </span>
            {isAdmin && (
              <span style={{ color: "#fca5a5", fontWeight: "600", fontSize: "11px" }}>
                Admin
              </span>
            )}
          </div>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", marginLeft: "2px" }}>▼</span>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            {/* Backdrop to close on outside click */}
            <div
              onClick={() => setShowMenu(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 999,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "56px",
                width: "260px",
                background: "white",
                color: "black",
                borderRadius: "16px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                overflow: "hidden",
                zIndex: 1000,
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {/* Profile Header */}
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
                }}
              >
                <img
                  src={avatarSrc}
                  alt="profile"
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid rgba(255,255,255,0.3)",
                    margin: "0 auto",
                    display: "block",
                  }}
                />
                <h4 style={{ margin: "10px 0 2px", color: "#fff", fontSize: "15px", fontWeight: "700" }}>
                  {user?.username || "User"}
                </h4>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                  {user?.email || ""}
                </p>
                {isAdmin && (
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "8px",
                      padding: "2px 10px",
                      background: "rgba(239,68,68,0.3)",
                      border: "1px solid rgba(239,68,68,0.5)",
                      borderRadius: "999px",
                      color: "#fca5a5",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    🛡️ ADMIN
                  </span>
                )}
              </div>

              {/* Menu Items */}
              <div style={{ padding: "8px 0" }}>
                <button
                  onClick={handleProfile}
                  style={{
                    width: "100%",
                    padding: "11px 20px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#334155",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  ✏️ Edit Profile
                </button>

                <button
                  onClick={() => { setShowMenu(false); navigate("/transactions"); }}
                  style={{
                    width: "100%",
                    padding: "11px 20px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#334155",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  📊 Transactions
                </button>

                {isAdmin && (
                  <button
                    onClick={() => { setShowMenu(false); navigate("/admin"); }}
                    style={{
                      width: "100%",
                      padding: "11px 20px",
                      border: "none",
                      background: "rgba(239,68,68,0.05)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      borderTop: "1px solid rgba(239,68,68,0.1)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.05)"}
                  >
                    🛡️ Admin Control Panel
                  </button>
                )}

                <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0" }} />

                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "11px 20px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;