import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import TransactionRow from "../components/TransactionRow";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [walletResponse, transactionResponse] = await Promise.all([
          axiosInstance.get("/wallet/me"),
          axiosInstance.get("/wallet/transactions"),
        ]);

        setWallet(walletResponse.data);
        setTransactions(transactionResponse.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "40px" }}>
        Loading...
      </h2>
    );
  }

  if (error) {
    return (
      <h2 style={{ color: "red", textAlign: "center", marginTop: "40px" }}>
        {error}
      </h2>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Dashboard</h1>

      <h3>Welcome, {user?.username}</h3>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <h2>Wallet Details</h2>

        <p>
          <strong>Balance:</strong> ₹{wallet?.balance}
        </p>

        <p>
          <strong>Status:</strong> {wallet?.status}
        </p>
      </div>

      <div style={{ marginBottom: "25px" }}>
        <button
          onClick={() => navigate("/send-money")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            cursor: "pointer",
          }}
        >
          Send Money
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <h2>Transaction History</h2>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                Type
              </th>
              <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                Description
              </th>
              <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                Date
              </th>
              <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DashboardPage;