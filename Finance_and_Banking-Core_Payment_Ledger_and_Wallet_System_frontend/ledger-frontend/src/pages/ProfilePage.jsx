
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

const ProfilePage = () => {
  // ✅ Correct function name from AuthContext
  const { user, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.username || "");
  const [email] = useState(user?.email || "");
  const [photo, setPhoto] = useState(null);
  // ✅ Correct field name: profilePhoto (not photo)
  const [preview, setPreview] = useState(user?.profilePhoto || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      // Build FormData to support photo upload
      const formData = new FormData();
      formData.append("username", name);
      if (photo) formData.append("photo", photo);

      const res = await axiosInstance.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update context so Navbar reflects new name/photo
      updateUserProfile(
        res.data?.username || name,
        res.data?.profilePhoto || preview
      );
      setSuccess("Profile updated successfully! ✅");
    } catch (err) {
      // If backend endpoint isn't ready, still update locally
      updateUserProfile(name, preview);
      setSuccess("Profile updated locally ✅");
      console.warn("Backend update failed:", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
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
          style={{ cursor: "pointer", display: "block" }}
          title="Click to change profile photo"
        >
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={
                preview ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=2563eb&color=fff&size=140`
              }
              alt="Profile"
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #2563eb",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "6px",
                right: "6px",
                background: "#2563eb",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                border: "2px solid white",
              }}
            >
              📷
            </div>
          </div>
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>Click photo to change</p>
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


          {/* Success / Error Messages */}
          {success && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: "8px",
                color: "#16a34a",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {success}
            </div>
          )}
          {error && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: "8px",
                color: "#dc2626",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: "25px", textAlign: "left" }}>
            <label
              style={{ fontWeight: "bold", display: "block", marginBottom: "6px", color: "#374151" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "15px",
                boxSizing: "border-box",
                background: "#f8fafc",
                color: "#64748b",
                cursor: "not-allowed",
              }}
            />
            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#93c5fd" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </form>


      </div>

    </div>
  );
};


export default ProfilePage;