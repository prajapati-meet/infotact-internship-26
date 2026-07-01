// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axiosInstance from "../api/axiosInstance";
// import TransactionRow from "../components/TransactionRow";
// import { useAuth } from "../context/AuthContext";
//
// const DashboardPage = () => {
//   const navigate = useNavigate();
//
//
//   const { user, logout } = useAuth();
//
//   const user = {
//     username: "User",
//   };
//
//   const logout = () => {
//     navigate("/login");
//   };
//
//   const [wallet, setWallet] = useState(null);
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError("");
//
//       try {
//         const [walletRes, transactionRes] = await Promise.all([
//           axiosInstance.get("/wallet/me"),
//           axiosInstance.get("/wallet/transactions"),
//         ]);
//
//         setWallet(walletRes.data);
//         setTransactions(transactionRes.data);
//       } catch (err) {
//         setError(
//           err.response?.data?.message ||
//             "Failed to load dashboard."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     fetchData();
//   }, []);
//
//   if (loading) {
//     return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
//   }
//
//   if (error) {
//     return (
//       <h2 style={{ color: "red", textAlign: "center" }}>
//         {error}
//       </h2>
//     );
//   }
//
//   return (
//     <div
//       style={{
//         maxWidth: "900px",
//         margin: "40px auto",
//         padding: "20px",
//         fontFamily: "Arial",
//       }}
//     >
//       <h1>Dashboard</h1>
//
//       <h3>Welcome, {user.username}</h3>
//
//       <div
//         style={{
//           border: "1px solid #ddd",
//           borderRadius: "8px",
//           padding: "20px",
//           marginBottom: "25px",
//         }}
//       >
//         <h2>Wallet Details</h2>
//
//         <p>
//           <strong>Balance:</strong> ₹
//           {wallet?.balance ?? 0}
//         </p>
//
//         <p>
//           <strong>Status:</strong>{" "}
//           {wallet?.status ?? "N/A"}
//         </p>
//       </div>
//
//       <div
//         style={{
//           display: "flex",
//           gap: "15px",
//           marginBottom: "25px",
//         }}
//       >
//         <button
//           onClick={() => navigate("/send-money")}
//           style={{
//             padding: "10px 20px",
//             cursor: "pointer",
//           }}
//         >
//           Send Money
//         </button>
//
//         <button
//           onClick={logout}
//           style={{
//             padding: "10px 20px",
//             cursor: "pointer",
//           }}
//         >
//           Logout
//         </button>
//       </div>
//
//       <h2>Transaction History</h2>
//
//       {transactions.length === 0 ? (
//         <p>No transactions found.</p>
//       ) : (
//         <table
//           style={{
//             width: "100%",
//             borderCollapse: "collapse",
//           }}
//         >
//           <thead>
//             <tr>
//               <th>Date</th>
//               <th>Type</th>
//               <th>Amount</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//
//           <tbody>
//             {transactions.map((transaction) => (
//               <TransactionRow
//                 key={transaction.id}
//                 transaction={transaction}
//               />
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };
//
// export default DashboardPage;




import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState({
    balance: 5000,
    status: "ACTIVE",
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);

      // Dummy transactions
      setTransactions([
        {
          id: 1,
          type: "Credit",
          amount: 1000,
          status: "SUCCESS",
        },
        {
          id: 2,
          type: "Debit",
          amount: 250,
          status: "SUCCESS",
        },
      ]);
    }, 1000);
  }, []);

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  if (error) {
    return (
      <h2 style={{ color: "red", textAlign: "center" }}>
        {error}
      </h2>
    );
  }

  return (
    <div
      style={{
        width: "800px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1>Dashboard</h1>

      <h3>Welcome, User</h3>

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2>Wallet</h2>

        <p>
          <strong>Balance:</strong> ₹{wallet.balance}
        </p>

        <p>
          <strong>Status:</strong> {wallet.status}
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/send-money")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
          }}
        >
          Send Money
        </button>

        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "10px 20px",
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
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.type}</td>
                <td>₹{transaction.amount}</td>
                <td>{transaction.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DashboardPage;