import React from "react";

const TransactionRow = ({ transaction }) => {
  const isCredit = transaction.type === "CREDIT";

  const formattedDate = transaction.timestamp
    ? new Date(transaction.timestamp).toLocaleString()
    : "-";

  return (
    <tr>
      <td style={{ padding: "12px" }}>
        <span
          style={{
            backgroundColor: isCredit ? "#dcfce7" : "#fee2e2",
            color: isCredit ? "#166534" : "#991b1b",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {transaction.type}
        </span>
      </td>

      <td style={{ padding: "12px" }}>
        {transaction.description || "-"}
      </td>

      <td style={{ padding: "12px" }}>
        {formattedDate}
      </td>

      <td
        style={{
          padding: "12px",
          fontWeight: "bold",
          color: isCredit ? "green" : "red",
        }}
      >
        {isCredit ? "+" : "-"}₹{transaction.amount}
      </td>
    </tr>
  );
};

export default TransactionRow;