import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {

  const navigate = useNavigate();

  const { isAuthenticated, user, logout } = useAuth();

  const [showMenu, setShowMenu] = useState(false);


  const defaultProfile =
     "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEfqUIfDHrnkNbLq_Bii2vjQTerXisaIplzhaguNNte_cGIqMRTYflkzo&"



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
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        padding:"15px 30px",
        background:"#1e293b",
        color:"white",
      }}
    >
  <h2>  💳 Ledger  </h2>

      <div
        style={{
          display:"flex",
          gap:"25px",
        }}
      >

        <Link
          to="/dashboard"
          style={{
            color:"white",
            textDecoration:"none",
          }}
        >
          Dashboard
        </Link>


        <Link
          to="/transfer"
          style={{
            color:"white",
            textDecoration:"none",
          }}
        >
          Send Money
        </Link>


      </div>
 <div
        style={{
          position:"relative",
        }}
      >
 <div
          onClick={() => setShowMenu(!showMenu)}
          style={{
            display:"flex",
            alignItems:"center",
            gap:"10px",
            cursor:"pointer",
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