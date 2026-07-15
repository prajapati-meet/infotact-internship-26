import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaHistory,
  FaSearch,
  FaEye,
  FaBan,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Search & Pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal & Actions
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { user, type: 'enable' | 'disable' }
  const [actionLoading, setActionLoading] = useState(false);

  // Notification banners
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await axiosInstance.get("/admin/stats");
      setStats(response.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load statistics.");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axiosInstance.get(
        `/admin/users?search=${encodeURIComponent(search)}&page=${page}&size=5`
      );
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load user records.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0); // Reset page on new search query
  };

  const handleOpenConfirm = (user, type) => {
    setConfirmAction({ user, type });
  };

  const handleExecuteAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    const { user, type } = confirmAction;
    const url = `/admin/users/${user.id}/${type}`;
    try {
      await axiosInstance.put(url);
      setSuccessMsg(`Account for ${user.username} has been ${type}d successfully!`);
      setConfirmAction(null);
      // Refresh statistics and user records
      fetchStats();
      fetchUsers();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || `Failed to ${type} user account.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Status badge style mapping
  const getStatusBadge = (status, enabled) => {
    if (!enabled) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
          DISABLED
        </span>
      );
    }
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            ACTIVE
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
            PENDING
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
            SUSPENDED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-[92%] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          System monitoring, transactions volume, and user account management control panel.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-green-50 border border-green-100 text-green-800 text-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <FaCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" />
          <div className="flex-1">
            <p className="font-semibold">Success</p>
            <p className="text-green-700/90 mt-0.5">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-green-800 hover:text-green-950 font-bold p-1">×</button>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-800 text-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <FaExclamationTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold">Operation Error</p>
            <p className="text-red-700/90 mt-0.5">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-red-800 hover:text-red-950 font-bold p-1">×</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FaUsers size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {loadingStats ? "..." : stats?.totalUsers ?? 0}
            </h3>
          </div>
        </div>

        {/* Active Users */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <FaUserCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Users</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {loadingStats ? "..." : stats?.activeUsers ?? 0}
            </h3>
          </div>
        </div>

        {/* Disabled Users */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <FaUserSlash size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disabled Users</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {loadingStats ? "..." : stats?.disabledUsers ?? 0}
            </h3>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <FaHistory size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transactions</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {loadingStats ? "..." : stats?.totalTransactions ?? 0}
            </h3>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 self-start">User Records</h3>
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <span className="absolute left-3.5 top-3 text-slate-400">
              <FaSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Search username or email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-medium text-slate-700 transition-all text-sm placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle px-6">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4">Profile</th>
                  <th className="py-4">Username</th>
                  <th className="py-4">Email</th>
                  <th className="py-4 text-right">Wallet Balance</th>
                  <th className="py-4 text-center">Status</th>
                  <th className="py-4 text-center">Transactions</th>
                  <th className="py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Fetching database records...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                      No user accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  users.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Avatar */}
                      <td className="py-4">
                        {item.profilePhoto ? (
                          <img
                            src={item.profilePhoto}
                            alt={item.username}
                            className="h-10 w-10 rounded-2xl object-cover border border-slate-100"
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 font-bold text-sm select-none">
                            {item.username?.substring(0, 2).toUpperCase() || "US"}
                          </div>
                        )}
                      </td>
                      {/* Name */}
                      <td className="py-4 font-semibold text-slate-800 text-sm">{item.username}</td>
                      {/* Email */}
                      <td className="py-4 text-slate-500 font-medium text-sm">{item.email}</td>
                      {/* Balance */}
                      <td className="py-4 text-right font-bold text-slate-800 text-sm">
                        ₹{Number(item.walletBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      {/* Status */}
                      <td className="py-4 text-center">{getStatusBadge(item.accountStatus, item.enabled)}</td>
                      {/* Tx count */}
                      <td className="py-4 text-center font-bold text-slate-700 text-sm">{item.totalTransactions}</td>
                      {/* Actions */}
                      <td className="py-4 text-center">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => setSelectedUser(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="View Details"
                          >
                            <FaEye size={14} />
                          </button>
                          
                          {item.enabled ? (
                            <button
                              onClick={() => handleOpenConfirm(item, "disable")}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title="Disable Account"
                            >
                              <FaBan size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenConfirm(item, "enable")}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                              title="Enable Account"
                            >
                              <FaCheckCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            <span className="text-xs font-semibold text-slate-400">
              Showing page {page + 1} of {totalPages} ({totalElements} users)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
              >
                <FaArrowLeft size={10} /> Previous
              </button>
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
              >
                Next <FaArrowRight size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">User Specifications</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all focus:outline-none"
              >
                <FaTimes size={16} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                {selectedUser.profilePhoto ? (
                  <img
                    src={selectedUser.profilePhoto}
                    alt={selectedUser.username}
                    className="h-16 w-16 rounded-3xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 font-bold text-xl select-none">
                    {selectedUser.username?.substring(0, 2).toUpperCase() || "US"}
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-extrabold text-slate-800">{selectedUser.username}</h4>
                  <p className="text-sm text-slate-500 font-medium">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account ID</p>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-0.5 truncate" title={selectedUser.id}>
                    {selectedUser.id}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Access Status</p>
                  <p className="mt-0.5">{getStatusBadge(selectedUser.accountStatus, selectedUser.enabled)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wallet Balance</p>
                  <p className="text-sm font-extrabold text-blue-600 mt-0.5">
                    ₹{Number(selectedUser.walletBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Actions Recorded</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">
                    {selectedUser.totalTransactions} transactions
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 text-sm font-semibold border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Confirmation Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div className={`p-1.5 rounded-lg text-white ${confirmAction.type === "disable" ? "bg-rose-500" : "bg-emerald-500"}`}>
                <FaExclamationTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {confirmAction.type === "disable" ? "Disable User Account" : "Re-Enable User Account"}
              </h3>
            </div>
            
            {/* Confirmation Body */}
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to <strong>{confirmAction.type}</strong> the account for{" "}
                <span className="font-semibold text-slate-800">{confirmAction.user.username}</span>?
              </p>
              {confirmAction.type === "disable" ? (
                <p className="text-xs text-rose-500 font-semibold mt-3 bg-rose-50 p-3 rounded-xl border border-rose-100">
                  ⚠️ Note: Once disabled, the user will be blocked from logging in, depositing, withdrawing, or sending funds.
                </p>
              ) : (
                <p className="text-xs text-emerald-600 font-semibold mt-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  ℹ️ Note: This will restore full login, transfer, deposit, and withdrawal access to the user account.
                </p>
              )}
            </div>

            {/* Confirmation Footer */}
            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex gap-3 justify-end">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteAction}
                className={`px-5 py-2 text-white font-bold rounded-xl transition-all shadow-md text-sm ${
                  confirmAction.type === "disable"
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-100"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                }`}
              >
                {actionLoading ? "Processing..." : confirmAction.type === "disable" ? "Disable Account" : "Enable Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
