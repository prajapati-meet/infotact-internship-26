import { getCurrencySymbol } from "../utils/currency";

const TransactionRow = ({ transaction, currency = "INR" }) => {
  const isCredit = transaction.type === "CREDIT";

  const formattedDate = transaction.timestamp
    ? new Date(transaction.timestamp).toLocaleString()
    : "-";

  return (
    <tr>
      <td style={{ padding: "18px 24px" }}>
        <span className={`badge ${isCredit ? "badge-success" : "badge-danger"}`}>
          {transaction.type}
        </span>
      </td>

      <td style={{ padding: "18px 24px", color: "var(--color-text-main)", fontWeight: "500" }}>
        {transaction.description || "-"}
      </td>

      <td style={{ padding: "18px 24px", color: "var(--color-text-light)" }}>
        {formattedDate}
      </td>

      <td
        style={{
          padding: "18px 24px",
          textAlign: "right",
          fontWeight: "700",
          fontSize: "16px",
          color: isCredit ? "var(--color-success)" : "var(--color-danger)",
        }}
      >
        {isCredit ? "+" : "-"} {getCurrencySymbol(currency)}{transaction.amount}
      </td>
    </tr>
  );
};

export default TransactionRow;