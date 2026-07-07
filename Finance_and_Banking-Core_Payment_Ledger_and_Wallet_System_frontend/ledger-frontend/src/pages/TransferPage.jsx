import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  FaWallet,
  FaMoneyBillWave,
  FaRegStickyNote,
  FaPaperPlane,
} from "react-icons/fa";

const TransferPage = () => {
  const navigate = useNavigate();

  const [receiverWalletId, setReceiverWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const idempotencyKey = crypto.randomUUID();

      const response = await axiosInstance.post(
        "/transfer",
        {
          receiverWalletId,
          amount: Number(amount),
          description,
        },
        {
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
        }
      );

      setSuccess(
        `Transfer successful! Updated Balance: ₹${response.data.balance}`
      );

      setReceiverWalletId("");
      setAmount("");
      setDescription("");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Transfer failed.");
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
    fontSize: "16px",
    marginLeft: "15px",
  };

  return (
    <>
      <style>{`
        input::placeholder,
        textarea::placeholder{
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
            width: "450px",
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
            Transfer Money
          </h1>

          <p
            style={{
              color: "#9ca3af",
              textAlign: "center",
              marginBottom: "35px",
            }}
          >
            Send money securely to another wallet
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

          {success && (
            <div
              style={{
                background: "#14532d",
                color: "#fff",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={inputContainer}>
              <FaWallet color="#fff" size={20} />

              <input
                type="text"
                placeholder="Receiver Wallet ID"
                value={receiverWalletId}
                onChange={(e) =>
                  setReceiverWalletId(e.target.value)
                }
                style={inputStyle}
                required
              />
            </div>

            <div style={inputContainer}>
              <FaMoneyBillWave color="#fff" size={20} />

              <input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
                style={inputStyle}
                required
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                background: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "20px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <FaRegStickyNote
                color="#fff"
                size={20}
                style={{ marginTop: "8px" }}
              />

              <textarea
                rows="4"
                placeholder="Transaction Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  flex: 1,
                  marginLeft: "15px",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  resize: "none",
                  fontSize: "16px",
                }}
              />
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
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaPaperPlane />
              {loading ? "Sending..." : "Send Money"}
            </button>
          </form>

          <p
            style={{
              color: "#9ca3af",
              textAlign: "center",
              marginTop: "25px",
            }}
          >
            <Link
              to="/dashboard"
              style={{
                color: "#60a5fa",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              ← Back to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default TransferPage;