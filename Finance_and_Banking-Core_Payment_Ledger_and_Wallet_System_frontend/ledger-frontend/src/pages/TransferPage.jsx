import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  FaWallet,
  FaRegStickyNote,
  FaPaperPlane,
  FaExclamationCircle,
  FaCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";
import { formatCurrency, getCurrencySymbol } from "../utils/currency";


const TransferPage = () => {
  const navigate = useNavigate();

  const [receiverWalletId, setReceiverWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [balance, setBalance] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalanceAndCurrency = async () => {
      try {
        const response = await axiosInstance.get("/wallet/me");
        setBalance(response.data.balance);
        setCurrency(response.data.currency || "INR");
      } catch (err) {
        console.error("Could not fetch balance for transfer header", err);
      }
    };
    fetchBalanceAndCurrency();
  }, []);

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
        `Transfer successful! Updated Balance: ${formatCurrency(response.data.senderBalanceAfter, currency)}`
      );

      setReceiverWalletId("");
      setAmount("");
      setDescription("");

      // Update current balance state in real-time
      setBalance(response.data.senderBalanceAfter);
      
      // Dispatch event to update navbar notifications count and dropdown
      window.dispatchEvent(new Event("notification-updated"));

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Transfer failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="card" style={{ width: "100%", maxWidth: "500px" }}>
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
            <FaPaperPlane size={24} style={{ marginLeft: "-2px" }} />
          </div>
          <h1 className="card-title">Transfer Money</h1>
          <p className="card-subtitle">Send money securely to another wallet account</p>
        </div>

        {balance !== null && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--color-primary-light)",
            border: "1px solid #bfdbfe",
            borderRadius: "10px",
            padding: "12px 18px",
            marginBottom: "24px",
            fontSize: "14px",
            color: "var(--color-text-main)",
            fontWeight: "500"
          }}>
            <span>Available Balance:</span>
            <span style={{ fontWeight: "700", color: "var(--color-primary)", fontSize: "16px" }}>
              {formatCurrency(balance, currency)}
            </span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <FaExclamationCircle className="alert-icon" />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <FaCheckCircle className="alert-icon" />
            <div>{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Receiver Wallet ID */}
          <div className="form-group">
            <label className="form-label">Receiver Wallet ID</label>
            <div className="input-group">
              <span className="input-icon">
                <FaWallet />
              </span>
              <input
                type="text"
                placeholder="Enter 36-character wallet address"
                value={receiverWalletId}
                onChange={(e) => setReceiverWalletId(e.target.value)}
                className="input-control"
                required
              />
            </div>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Amount ({currency})</label>
            <div className="input-group">
              <span className="input-icon" style={{ fontSize: "14px", fontWeight: "bold" }}>
                {getCurrencySymbol(currency)}
              </span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
                className="input-control"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <div className="textarea-group">
              <span className="input-icon">
                <FaRegStickyNote />
              </span>
              <textarea
                placeholder="What is this transfer for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-control"
                rows="3"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
            style={{ marginTop: "8px", height: "52px" }}
          >
            <FaPaperPlane size={14} />
            {loading ? "Processing..." : "Send Money"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link
            to="/dashboard"
            style={{
              color: "var(--color-text-muted)",
              fontWeight: "600",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => e.target.style.color = "var(--color-primary)"}
            onMouseLeave={(e) => e.target.style.color = "var(--color-text-muted)"}
          >
            <FaArrowLeft size={12} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TransferPage;