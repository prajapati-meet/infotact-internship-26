const TransactionRow = ({ transaction }) => {
  const isCredit = transaction.type === "CREDIT";

  const formattedDate = transaction.timestamp
    ? new Date(transaction.timestamp).toLocaleString()
    : "-";

  return (
    <tr
      style={{
        borderBottom: "1px solid #374151",
      }}
    >
      <td style={{ padding: "18px", color: "#fff" }}>
        <span
          style={{
            backgroundColor: isCredit ? "#14532d" : "#7f1d1d",
            color: isCredit ? "#86efac" : "#fca5a5",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          {transaction.type}
        </span>
      </td>

      <td
        style={{
          padding: "18px",
          color: "#e5e7eb",
        }}
      >
        {transaction.description || "-"}
      </td>

      <td
        style={{
          padding: "18px",
          color: "#9ca3af",
        }}
      >
        {formattedDate}
      </td>

      <td
        style={{
          padding: "18px",
          textAlign: "right",
          fontWeight: "bold",
          fontSize: "16px",
          color: isCredit ? "#22c55e" : "#ef4444",
        }}
      >
        {isCredit ? "+" : "-"} ₹{transaction.amount}
      </td>
    </tr>
  );
};

export default TransactionRow;