import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  FaSearch,
  FaFilter,
  FaHistory,
  FaArrowDown,
  FaArrowUp,
  FaCalendarAlt,
  FaCoins,
  FaUndo,
  FaChevronDown,
  FaChevronUp,
  FaExclamationCircle,
} from "react-icons/fa";
import { formatCurrency, getCurrencySymbol } from "../utils/currency";


const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter States
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL, CREDIT, DEBIT
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  
  // Sort State
  const [sortBy, setSortBy] = useState("NEWEST"); // NEWEST, OLDEST, AMOUNT_DESC, AMOUNT_ASC

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 5, 10, 25, 50

  // Expanded row ID
  const [expandedRow, setExpandedRow] = useState(null);

  const [wallet, setWallet] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const [transResponse, walletResponse] = await Promise.all([
        axiosInstance.get("/wallet/transactions"),
        axiosInstance.get("/wallet/me")
      ]);
      setTransactions(transResponse.data);
      setWallet(walletResponse.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setSortBy("NEWEST");
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredTransactions = transactions
    .filter((tx) => {
      // 1. Search filter (Description & Reference ID)
      const query = search.toLowerCase();
      const descMatch = tx.description ? tx.description.toLowerCase().includes(query) : false;
      const refMatch = tx.referenceId ? tx.referenceId.toLowerCase().includes(query) : false;
      if (search && !descMatch && !refMatch) return false;

      // 2. Type filter
      if (typeFilter !== "ALL" && tx.entryType !== typeFilter) return false;

      // 3. Date range filter
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const txDate = new Date(tx.createdAt);
        if (txDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const txDate = new Date(tx.createdAt);
        if (txDate > end) return false;
      }

      // 4. Amount filter
      if (minAmount && Number(tx.amount) < Number(minAmount)) return false;
      if (maxAmount && Number(tx.amount) > Number(maxAmount)) return false;

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      if (sortBy === "NEWEST") return dateB - dateA;
      if (sortBy === "OLDEST") return dateA - dateB;
      if (sortBy === "AMOUNT_DESC") return Number(b.amount) - Number(a.amount);
      if (sortBy === "AMOUNT_ASC") return Number(a.amount) - Number(b.amount);
      return 0;
    });

  // Pagination Logic
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setExpandedRow(null);
  };

  const handleRowClick = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[92%] px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-16 bg-white rounded-3xl border border-slate-100 p-4 animate-pulse" />
        <div className="h-96 bg-white rounded-3xl border border-slate-100 p-6 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-full border border-red-100">
            <FaExclamationCircle className="w-10 h-10" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Error Loading Transactions</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">{error}</p>
        <button
          onClick={fetchTransactions}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[92%] px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Transactions Ledger
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          View your full transaction history, audit balances, and search or filter records.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-1">
          <FaFilter className="text-slate-400 w-3.5 h-3.5" />
          <h3 className="text-sm font-bold text-slate-700">Filters & Search</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3.5 text-slate-300 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search description or reference..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-medium text-sm transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Type Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transaction Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-medium text-sm text-slate-700 transition-all"
            >
              <option value="ALL">All Transactions</option>
              <option value="CREDIT">Credits (Received)</option>
              <option value="DEBIT">Debits (Sent/Withdrawn)</option>
            </select>
          </div>

          {/* Sort By Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sort By Date & Amount</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-medium text-sm text-slate-700 transition-all"
            >
              <option value="NEWEST">Date: Newest First</option>
              <option value="OLDEST">Date: Oldest First</option>
              <option value="AMOUNT_DESC">Amount: Highest First</option>
              <option value="AMOUNT_ASC">Amount: Lowest First</option>
            </select>
          </div>

          {/* Preset / Reset Button wrapper */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-2 px-4 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <FaUndo className="w-3 h-3" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters (Dates & Amounts) */}
        <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">From Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3.5 text-slate-300 w-3 h-3" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-medium text-sm text-slate-700 transition-all"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">To Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3.5 text-slate-300 w-3 h-3" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-medium text-sm text-slate-700 transition-all"
              />
            </div>
          </div>

          {/* Min Amount */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Min Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">{getCurrencySymbol(wallet?.currency)}</span>
              <input
                type="number"
                placeholder="Min Amount"
                value={minAmount}
                onChange={(e) => {
                  setMinAmount(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-medium text-sm transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Max Amount */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Max Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">{getCurrencySymbol(wallet?.currency)}</span>
              <input
                type="number"
                placeholder="Max Amount"
                value={maxAmount}
                onChange={(e) => {
                  setMaxAmount(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-medium text-sm transition-all placeholder:text-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Table Card */}
      <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-100">
              <FaHistory className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Ledger Statement</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {totalItems} Matches
            </span>

            {/* Page Size Select */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-slate-200 rounded-lg bg-white text-xs font-semibold text-slate-600 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {totalItems === 0 ? (
          <div className="py-20 text-center">
            <div className="text-3xl mb-3">🗃️</div>
            <h4 className="text-base font-semibold text-slate-700">No matching transactions found</h4>
            <p className="text-sm text-slate-400 mt-1">Try tweaking your search term or filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Type</th>
                  <th scope="col" className="px-6 py-4">Description</th>
                  <th scope="col" className="px-6 py-4">Date</th>
                  <th scope="col" className="px-6 py-4 text-right">Amount</th>
                  <th scope="col" className="px-6 py-4 text-center">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 border-t border-slate-100 font-medium">
                {currentItems.map((tx) => {
                  const isCredit = tx.entryType === "CREDIT";
                  const isExpanded = expandedRow === tx.id;
                  return (
                    <>
                      <tr
                        key={tx.id}
                        onClick={() => handleRowClick(tx.id)}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${
                            isCredit 
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" 
                              : "bg-rose-50 text-rose-700 ring-rose-600/20"
                          }`}>
                            {tx.entryType}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {tx.description || "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : "-"}
                        </td>
                        <td className={`px-6 py-4 text-right font-extrabold whitespace-nowrap text-base ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                          {isCredit ? "+" : "-"}{formatCurrency(tx.amount, wallet?.currency)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                            {isExpanded ? <FaChevronUp className="w-3.5 h-3.5" /> : <FaChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                      {/* Expanded View */}
                      {isExpanded && (
                        <tr className="bg-slate-50/30">
                          <td colSpan={5} className="px-6 py-5 border-t border-slate-100">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
                              <div className="space-y-1">
                                <p className="font-bold text-slate-400 uppercase tracking-wider">Transaction ID / Ref</p>
                                <p className="font-mono font-semibold text-slate-800 select-all word-break break-all">
                                  {tx.referenceId || "N/A"}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="font-bold text-slate-400 uppercase tracking-wider">Balance Audit</p>
                                <div className="space-y-0.5 font-semibold text-slate-700">
                                  <p>Before: {formatCurrency(tx.balanceBefore, wallet?.currency)}</p>
                                  <p className="text-slate-900">After: {formatCurrency(tx.balanceAfter, wallet?.currency)}</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="font-bold text-slate-400 uppercase tracking-wider">Detailed Timestamp</p>
                                <p className="font-semibold text-slate-700">
                                  {tx.createdAt ? new Date(tx.createdAt).toString() : "-"}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-semibold">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
            </div>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-xl bg-white font-bold text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              
              {/* Simple page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    currentPage === p
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-xl bg-white font-bold text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
