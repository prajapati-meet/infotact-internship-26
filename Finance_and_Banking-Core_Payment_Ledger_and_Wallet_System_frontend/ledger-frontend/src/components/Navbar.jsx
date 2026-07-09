import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {

  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate("/login");
  };


  const handleProfile = () => {
    setShowMenu(false);
    navigate("/profile");
  };



  return (

    <nav
      style={{
        background: "linear-gradient(90deg,#0f172a,#1e3a8a,#2563eb)",
        padding: "16px 40px",
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
          fontSize: "28px",
          fontWeight: "bold",
        }}
      >
        <span style={{ fontSize: "30px" }}>💳</span>
        Ledger
      </Link>

      {/* Navigation Links */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "30px",
        }}
      >
        <Link
          to="/dashboard"
          style={{
            color: "#fff",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "17px",
            transition: "0.3s",
          }}
        >
          Dashboard
        </Link>


        <Link
          to="/transfer"
          style={{
            color: "#fff",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "17px",
            transition: "0.3s",
          }}
        >
          Send Money
        </Link>

      {/* User Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "#3b82f6",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          {user?.username?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <span
          style={{
            color: "#fff",
            fontWeight: "600",
            fontSize: "16px",
          }}
        >
          {user?.username || "User"}
        </span>

      </div>
 <div
        style={{
          position:"relative",
        }}
      >
 <div
          onClick={() => setShowMenu(!showMenu)}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "30px",
            background: "#ef4444",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#dc2626";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#ef4444";
          }}
        >

  <img src={
              user?.photo || defaultProfile
            }
            alt="profile"
            style={{
              width:"45px",
              height:"45px",
              borderRadius:"50%",
              objectFit:"cover",
              border:"2px solid white",
            }}
          />


          <span>
            {
              isAuthenticated
              ? user?.username
              : "Login"
            }
          </span>


        </div>
 { showMenu && (
  <div  style={{
                position:"absolute",
                right:0,
                top:"60px",
                width:"250px",
                background:"white",
                color:"black",
                borderRadius:"10px",
                boxShadow:"0 5px 15px rgba(0,0,0,0.3)",
                overflow:"hidden",
                zIndex:1000,
              }}

            >


            {
              isAuthenticated ? (

                <>
                    <div style={{
                      padding:"20px",
                      textAlign:"center",
                    }}
                  >
                    <img
                      src={
                        user?.photo || defaultProfile
                      }
                      alt="profile"
                      style={{
                        width:"100px",
                        height:"100px",
                        borderRadius:"50%",
                        objectFit:"cover",
                      }}
                    />



                    <h4
                      style={{
                        margin:"10px 0 5px",
                      }}
                    >
                      {user?.username || "User"}
                    </h4>



                    <p
                      style={{
                        margin:0,
                        color:"gray",
                        fontSize:"14px",
                      }}
                    >
                      {user?.email || "email"}
                    </p>


                  </div>
<button onClick={handleProfile}
                  style={{
                      width:"100%",
                      padding:"12px",
                      border:"none",
                      background:"white",
                      cursor:"pointer",
                      textAlign:"left",
                      fontSize:"15px",
                    }}

                  >

                    ✏️ Edit Profile

                  </button>
                   <button onClick={handleLogout}

                    style={{
                      width:"100%",
                      padding:"12px",
                      border:"none",
                      background:"#ef4444",
                      color:"white",
                      cursor:"pointer",
                      fontSize:"15px",
                    }}

                  >

                    🚪 Logout

                  </button>
                </>
                   ) : (
             <button onClick={() => navigate("/login")}

                  style={{
                    width:"100%",
                    padding:"12px",
                    border:"none",
                    background:"white",
                    cursor:"pointer",
                  }}

                >

                  🔑 Login

                </button>

              )

            }
            </div>

          )
        }

      </div>
    </nav>

  );

}


export default Navbar;