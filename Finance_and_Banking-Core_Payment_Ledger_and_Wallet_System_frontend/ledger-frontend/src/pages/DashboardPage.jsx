import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import TransactionRow from "../components/TransactionRow";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
        console.error(err);
        setError(
          err.response?.data?.message || "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

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
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: "#fff",
            marginBottom: "10px",
            fontSize: "38px",
          }}
        >
          Dashboard
        </h1>

        <p
          style={{
            color: "#cbd5e1",
            marginBottom: "30px",
            fontSize: "18px",
          }}
        >
          Welcome back,
          <span
            style={{
              color: "#60a5fa",
              fontWeight: "bold",
              marginLeft: "6px",
            }}
          >
            {user?.username}
          </span>
        </p>

        <div
          style={{
            background: "#111827",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 15px 35px rgba(0,0,0,.35)",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ color: "#fff", marginBottom: "25px" }}>
            💳 Wallet
          </h2>

          <h1
            style={{
              color: "#60a5fa",
              fontSize: "45px",
              margin: 0,
            }}
          >
            ₹{wallet?.balance}
          </h1>

          <p
            style={{
              color: "#9ca3af",
              marginTop: "12px",
              fontSize: "17px",
            }}
          >
            Status:
            <span
              style={{
                color: "#22c55e",
                marginLeft: "8px",
                fontWeight: "bold",
              }}
            >
              {wallet?.status}
            </span>
          </p>
        </div>

        <button
          onClick={() => navigate("/transfer")}
          style={{
            background: "linear-gradient(to right,#2563eb,#3b82f6)",
            border: "none",
            color: "#fff",
            padding: "15px 30px",
            borderRadius: "35px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "17px",
            marginBottom: "35px",
          }}
        >
          Send Money
        </button>

        <div
          style={{
            background: "#111827",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 15px 35px rgba(0,0,0,.35)",
          }}
        >
          <h2
            style={{
              color: "#fff",
              marginBottom: "25px",
            }}
          >
            Transaction History
          </h2>

          {transactions.length === 0 ? (
            <p style={{ color: "#9ca3af" }}>
              No transactions found.
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                color: "#fff",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #374151",
                  }}
                >
                  <th style={{ padding: "15px", textAlign: "left" }}>
                    Type
                  </th>
                  <th style={{ padding: "15px", textAlign: "left" }}>
                    Description
                  </th>
                  <th style={{ padding: "15px", textAlign: "left" }}>
                    Date
                  </th>
                  <th style={{ padding: "15px", textAlign: "right" }}>
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
      </div>
    </div>
  );
};

export default DashboardPage;