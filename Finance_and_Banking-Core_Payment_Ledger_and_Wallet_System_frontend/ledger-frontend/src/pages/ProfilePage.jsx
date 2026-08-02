
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(user?.photo || "");


  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    updateUser({
      username: name,
      email: email,
      photo: preview,
    });

    alert("Profile updated successfully!");
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #2563eb, #4f46e5)",
        padding: "20px",
      }}
    >

      <div
        style={{
          width: "420px",
          background: "#fff",
          borderRadius: "15px",
          padding: "35px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >

        <h2
          style={{
            color:"#1e293b",
            marginBottom:"20px",
          }}
        >
          My Profile
        </h2>


        <input
          type="file"
          id="profileImage"
          accept="image/*"
          onChange={handlePhotoChange}
          style={{
            display:"none",
          }}
        />


        <label
          htmlFor="profileImage"
          style={{
            cursor:"pointer",
          }}
        >

          <img
            src={
              preview ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEfqUIfDHrnkNbLq_Bii2vjQTerXisaIplzhaguNNte_cGIqMRTYflkzo&"
            }
            alt="Profile"
            style={{
              width:"140px",
              height:"140px",
              borderRadius:"50%",
              objectFit:"cover",
              // border:"4px solid #2563eb",
            }}
          />

        </label>
        <form onSubmit={handleSubmit}>

          <div
            style={{
              marginTop:"20px",
              marginBottom:"18px",
              textAlign:"left",
            }}
          >

            <label
              style={{
                fontWeight:"bold",
                display:"block",
                marginBottom:"6px",
              }}
            >
              Name
            </label>


            <input
              type="text"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              style={{
                width:"100%",
                padding:"12px",
                borderRadius:"8px",
                border:"1px solid #ccc",
                fontSize:"15px",
                boxSizing:"border-box",
              }}
            />

          </div>


          <div
            style={{
              marginBottom:"25px",
              textAlign:"left",
            }}
          >

            <label
              style={{
                fontWeight:"bold",
                display:"block",
                marginBottom:"6px",
              }}
            >
              Email
            </label>


            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              style={{
                width:"100%",
                padding:"12px",
                borderRadius:"8px",
                border:"1px solid #ccc",
                fontSize:"15px",
                boxSizing:"border-box",
              }}
            />

          </div>

          <button
            type="submit"
            style={{
              width:"100%",
              padding:"14px",
              background:"#2563eb",
              color:"#fff",
              border:"none",
              borderRadius:"8px",
              fontSize:"16px",
              fontWeight:"bold",
              cursor:"pointer",
            }}
          >
            Update Profile
          </button>
        </form>


      </div>

    </div>
  );
};


export default ProfilePage;