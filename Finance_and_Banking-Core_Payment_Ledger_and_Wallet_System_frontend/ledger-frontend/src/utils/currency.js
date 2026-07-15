export const getCurrencySymbol = (currency) => {
  if (currency === "USD") return "$";
  return "₹"; // Default to INR
};

export const formatCurrency = (amount, currency = "INR") => {
  if (amount == null) return "0.00";
  const num = Number(amount);
  const symbol = getCurrencySymbol(currency);
  const locale = currency === "USD" ? "en-US" : "en-IN";
  return `${symbol}${num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
