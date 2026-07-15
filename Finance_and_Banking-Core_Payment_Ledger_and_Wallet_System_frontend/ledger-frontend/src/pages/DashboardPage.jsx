import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import {
  FaWallet,
  FaPaperPlane,
  FaHistory,
  FaBell,
  FaArrowUp,
  FaArrowDown,
  FaArrowRight,
  FaRegCopy,
  FaExclamationCircle,
} from "react-icons/fa";
import { formatCurrency } from "../utils/currency";

// Helper to format relative time
const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  if (isNaN(diffMs) || diffMs < 0) return "Just now";
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

// Notification helper styling
const getNotificationStyles = (type) => {
  switch (type) {
    case "SUCCESS":
      return { border: "border-green-100 bg-green-50/50", text: "text-green-700", dot: "bg-green-500" };
    case "WARNING":
      return { border: "border-yellow-100 bg-yellow-50/50", text: "text-yellow-700", dot: "bg-yellow-500" };
    case "ERROR":
      return { border: "border-red-100 bg-red-50/50", text: "text-red-700", dot: "bg-red-500" };
    case "INFO":
    default:
      return { border: "border-blue-100 bg-blue-50/50", text: "text-blue-700", dot: "bg-blue-500" };
  }
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [wallet, setWallet] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [walletRes, transRes, notifRes] = await Promise.all([
        axiosInstance.get("/wallet/me"),
        axiosInstance.get("/wallet/transactions"),
        axiosInstance.get("/notifications"),
      ]);
      setWallet(walletRes.data);
      // Get latest 5 transactions
      setRecentTransactions(transRes.data.slice(0, 5));
      // Get latest 5 notifications
      setRecentNotifications(notifRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenNotificationsModal = () => {
    window.dispatchEvent(new Event("open-notifications"));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[92%] px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Welcome Skeleton */}
        <div className="space-y-2">
          <div className="h-9 w-64 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-5 w-96 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        {/* Dashboard Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Balance Card Skeleton */}
            <div className="h-44 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div className="h-4 w-24 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-10 w-48 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-10 w-full bg-slate-200 rounded-xl animate-pulse" />
            </div>
            {/* Quick Action Skeleton */}
            <div className="h-28 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3">
              <div className="h-4 w-32 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-11 w-full bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>

          <div className="space-y-6">
            {/* Recent Transactions Skeleton */}
            <div className="h-96 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div className="h-5 w-40 bg-slate-200 rounded-md animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-slate-200 rounded-md animate-pulse" />
                        <div className="h-3 w-16 bg-slate-200 rounded-md animate-pulse" />
                      </div>
                    </div>
                    <div className="h-5 w-16 bg-slate-200 rounded-md animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
        <h2 className="text-xl font-bold text-slate-800">Error Loading Dashboard</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-200 transition-all duration-200"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[92%] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Hello, <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{user?.username || "User"}</span> 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Monitor your ledger wallet account and manage secure instant transfers.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Balance & Quick Actions */}
        <div className="space-y-8">
          {/* Balance Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-6 text-white shadow-xl shadow-blue-100">
            {/* Background design accents */}
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />
            <div className="absolute right-10 top-2 h-20 w-20 rounded-full bg-blue-400/20 blur-md" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                  <FaWallet className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                  Available Balance
                </span>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${
                wallet?.status === "ACTIVE" 
                  ? "bg-emerald-500/20 text-emerald-100 ring-emerald-400/30" 
                  : "bg-rose-500/20 text-rose-100 ring-rose-400/30"
              }`}>
                {wallet?.status || "INACTIVE"}
              </span>
            </div>

            <div className="mt-6">
              <h2 className="text-4xl font-extrabold tracking-tight">
                {formatCurrency(wallet?.balance, wallet?.currency)}
              </h2>
              <p className="text-xs text-blue-100/70 mt-1 font-medium">
                Currency: {wallet?.currency || "INR"}
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex">
              <button
                onClick={() => navigate("/account")}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-50 active:scale-[0.98] transition-all duration-150 shadow-md shadow-blue-800/10"
              >
                View Account
                <FaArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/transfer")}
                className="flex-1 flex flex-col items-center justify-center gap-2.5 py-4 border border-blue-100 bg-blue-50/30 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 group text-center"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 group-hover:scale-105 transition-transform duration-200">
                  <FaPaperPlane size={16} />
                </div>
                <span className="text-sm font-semibold text-blue-700">
                  Send Money
                </span>
              </button>

              <button
                onClick={() => navigate("/account")}
                className="flex-1 flex flex-col items-center justify-center gap-2.5 py-4 border border-slate-100 bg-slate-50/20 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all duration-200 group text-center"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 border border-slate-200 group-hover:scale-105 transition-transform duration-200">
                  <FaWallet size={16} />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Deposit / Withdraw
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Recent Transactions & Notifications */}
        <div className="space-y-8">
          {/* Recent Transactions Card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-100">
                  <FaHistory className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Recent Transactions</h3>
              </div>
              <button
                onClick={() => navigate("/transactions")}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
              >
                View All
                <FaArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 flex-1">
              {recentTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-2xl mb-2">📑</div>
                  <h4 className="text-sm font-semibold text-slate-700">No transactions yet</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Transactions will appear here once recorded.</p>
                </div>
              ) : (
                recentTransactions.map((tx) => {
                  const isCredit = tx.entryType === "CREDIT";
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-3.5 group">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isCredit ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}>
                          {isCredit ? <FaArrowDown className="w-3.5 h-3.5" /> : <FaArrowUp className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {tx.description || (isCredit ? "Received Funds" : "Sent Funds")}
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                          {isCredit ? "+" : "-"}{formatCurrency(tx.amount, wallet?.currency)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Bal: {formatCurrency(tx.balanceAfter, wallet?.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Notifications Card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-100">
                  <FaBell className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Notifications</h3>
              </div>
              <button
                onClick={handleOpenNotificationsModal}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
              >
                View All
                <FaArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 flex-1 space-y-1">
              {recentNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-2xl mb-2">📭</div>
                  <h4 className="text-sm font-semibold text-slate-700">No notifications yet</h4>
                  <p className="text-xs text-slate-400 mt-0.5">You're all caught up!</p>
                </div>
              ) : (
                recentNotifications.map((notif) => {
                  const style = getNotificationStyles(notif.type);
                  return (
                    <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-2xl border border-transparent transition-all hover:bg-slate-50 ${
                      !notif.isRead ? "bg-blue-50/10" : ""
                    }`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${style.dot} mt-1.5 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <p className={`text-sm font-bold truncate ${notif.isRead ? "text-slate-700" : "text-slate-900"}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-semibold flex-shrink-0">
                            {getRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{notif.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;