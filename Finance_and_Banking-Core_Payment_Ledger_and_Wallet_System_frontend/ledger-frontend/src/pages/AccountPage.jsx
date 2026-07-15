import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import {
  FaWallet,
  FaUser,
  FaEnvelope,
  FaCopy,
  FaCheck,
  FaExclamationCircle,
  FaArrowDown,
  FaArrowUp,
  FaPlus,
  FaMinus,
  FaInfoCircle,
} from "react-icons/fa";
import { formatCurrency, getCurrencySymbol } from "../utils/currency";

const AccountPage = () => {
  const { user, updateUserProfile } = useAuth();
  
  const [wallet, setWallet] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  
  // Transaction Modal state
  const [txType, setTxType] = useState(null); // 'DEPOSIT' or 'WITHDRAW'
  const [txAmount, setTxAmount] = useState("");
  const [txDesc, setTxDesc] = useState("");
  const [txLoading, setTxLoading] = useState(false);
  const [txSuccess, setTxSuccess] = useState("");
  const [txError, setTxError] = useState("");

  const fetchWalletDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("/wallet/me");
      setWallet(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load wallet details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Keep username and profile photo in sync with global state changes
    if (user) {
      setNewUsername(user.username);
      setProfilePhoto(user.profilePhoto || "");
    }
  }, [user]);

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setProfileError("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!newUsername || newUsername.trim().length < 3) {
      setProfileError("Username must be at least 3 characters long.");
      return;
    }

    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const response = await axiosInstance.put("/users/profile", {
        username: newUsername,
        profilePhoto: profilePhoto,
      });

      // Update AuthContext (this updates everywhere instantly without refresh)
      updateUserProfile(response.data.username, response.data.profilePhoto);
      setProfileSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setProfileError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    setTxLoading(true);
    setTxError("");
    setTxSuccess("");

    const url = txType === "DEPOSIT" ? "/wallet/deposit" : "/wallet/withdraw";
    try {
      const response = await axiosInstance.post(url, {
        amount: Number(txAmount),
        description: txDesc || `${txType === "DEPOSIT" ? "Deposit" : "Withdrawal"} of funds`,
      });
      
      setTxSuccess(
        `${txType === "DEPOSIT" ? "Deposit" : "Withdrawal"} successful! New balance: ${formatCurrency(response.data.senderBalanceAfter, wallet?.currency)}`
      );
      
      // Update local wallet state
      setWallet((prev) => ({ ...prev, balance: response.data.senderBalanceAfter }));
      
      // Clear inputs
      setTxAmount("");
      setTxDesc("");
      
      // Trigger notification updates in navbar
      window.dispatchEvent(new Event("notification-updated"));

      // Close modal after 2 seconds
      setTimeout(() => {
        setTxType(null);
        setTxSuccess("");
      }, 2000);
    } catch (err) {
      console.error(err);
      setTxError(err.response?.data?.message || "Transaction failed.");
    } finally {
      setTxLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[92%] px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-white rounded-3xl border border-slate-100 p-6 animate-pulse" />
          <div className="md:col-span-2 h-64 bg-white rounded-3xl border border-slate-100 p-6 animate-pulse" />
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
        <h2 className="text-xl font-bold text-slate-800">Error Loading Account</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">{error}</p>
        <button
          onClick={fetchWalletDetails}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  const walletId = wallet?.id || wallet?.walletId;

  return (
    <div className="mx-auto max-w-[92%] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Account
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Manage your personal details, ledger wallet, and direct transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Profile Info Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col items-center">
            {/* Banner/Toasts for Profile actions */}
            {profileError && (
              <div className="w-full mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs">
                <FaExclamationCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}
            {profileSuccess && (
              <div className="w-full mb-4 flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs">
                <FaCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {/* Profile Photo with Upload overlay */}
            <div className="relative group h-24 w-24 mb-4 select-none cursor-pointer">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="h-24 w-24 rounded-3xl object-cover border-2 border-blue-100 shadow-sm shadow-blue-100"
                />
              ) : (
                <div className="h-24 w-24 flex items-center justify-center rounded-3xl bg-blue-50 border-2 border-blue-100 text-blue-600 font-bold text-3xl shadow-sm shadow-blue-100">
                  {user?.username?.substring(0, 2).toUpperCase() || "US"}
                </div>
              )}
              
              <label
                htmlFor="profile-upload"
                className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-[10px] font-bold"
              >
                <span>📷</span>
                <span>Change Photo</span>
              </label>
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={profileLoading}
              />
            </div>

            {!editMode ? (
              <>
                <h2 className="text-xl font-extrabold text-slate-800">
                  {user?.username || "User"}
                </h2>
                <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">
                  Ledger Member
                </p>

                <div className="w-full mt-6 space-y-4 border-t border-slate-100 pt-5 text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-500">
                      <FaUser className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Username</p>
                      <p className="text-sm font-semibold text-slate-700">{user?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-500">
                      <FaEnvelope className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-500">
                      <FaInfoCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Member Since</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {wallet?.createdAt ? new Date(wallet.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditMode(true);
                      setNewUsername(user?.username || "");
                      setProfileError("");
                      setProfileSuccess("");
                    }}
                    className="w-full mt-2 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm rounded-xl transition-all duration-150"
                  >
                    Edit Profile Details
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleProfileSubmit} className="w-full space-y-4 text-left border-t border-slate-100 pt-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    disabled={profileLoading}
                    placeholder="Enter username"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-medium text-slate-800 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Email (Read-Only)
                  </label>
                  <input
                    type="email"
                    readOnly
                    value={user?.email || ""}
                    className="w-full px-4 py-2 border border-slate-100 bg-slate-50 rounded-xl text-slate-400 font-medium text-sm select-none focus:outline-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={profileLoading}
                    onClick={() => {
                      setEditMode(false);
                      setNewUsername(user?.username || "");
                      setProfilePhoto(user?.profilePhoto || "");
                      setProfileError("");
                    }}
                    className="flex-1 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-xs shadow-md shadow-blue-100"
                  >
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Wallet details card */}
        <div className="lg:col-span-8 space-y-6">
          {/* Detailed Wallet Card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <FaWallet className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Ledger Wallet</h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
                wallet?.status === "ACTIVE" 
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" 
                  : "bg-rose-50 text-rose-700 ring-rose-600/20"
              }`}>
                {wallet?.status || "INACTIVE"}
              </span>
            </div>

            {/* Balance Panel */}
            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ledger Balance</p>
                <h2 className="text-3xl font-extrabold text-blue-600 mt-1 tracking-tight">
                  {formatCurrency(wallet?.balance, wallet?.currency)}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Default Currency: {wallet?.currency || "INR"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setTxType("DEPOSIT");
                    setTxError("");
                    setTxSuccess("");
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all duration-150"
                >
                  <FaPlus className="w-3.5 h-3.5" />
                  Deposit
                </button>
                <button
                  onClick={() => {
                    setTxType("WITHDRAW");
                    setTxError("");
                    setTxSuccess("");
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
                >
                  <FaMinus className="w-3.5 h-3.5" />
                  Withdraw
                </button>
              </div>
            </div>

            {/* Wallet Address panel */}
            {walletId && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wallet ID</h4>
                <div className="flex items-center gap-2 max-w-full">
                  <code className="flex-1 block truncate text-xs font-mono font-bold bg-slate-50 text-slate-800 border border-slate-200 px-3.5 py-3 rounded-xl select-all select-none">
                    {walletId}
                  </code>
                  <button
                    onClick={() => handleCopy(walletId)}
                    className="flex h-11 w-11 items-center justify-center bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-600 rounded-xl hover:scale-105 active:scale-95 transition-all duration-150"
                    title="Copy Wallet ID"
                  >
                    {copied ? <FaCheck className="w-4 h-4 text-emerald-600" /> : <FaCopy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Provide this unique Wallet ID to other users to receive instant, direct ledger transfers.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Modal (Deposit/Withdraw) */}
      {txType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg text-white ${txType === "DEPOSIT" ? "bg-emerald-600" : "bg-blue-600"}`}>
                  {txType === "DEPOSIT" ? <FaArrowDown className="w-3.5 h-3.5" /> : <FaArrowUp className="w-3.5 h-3.5" />}
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {txType === "DEPOSIT" ? "Deposit Funds" : "Withdraw Funds"}
                </h3>
              </div>
              <button
                onClick={() => setTxType(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all focus:outline-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
              {txError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                  <FaExclamationCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{txError}</span>
                </div>
              )}

              {txSuccess && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">
                  <FaCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                  <span>{txSuccess}</span>
                </div>
              )}

              {/* Amount input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Amount ({wallet?.currency || "INR"})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 font-bold">{getCurrencySymbol(wallet?.currency)}</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full pl-7 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder={txType === "DEPOSIT" ? "Self deposit via bank transfer" : "Withdrawal to bank account"}
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-medium text-slate-800 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setTxType(null)}
                  className="flex-1 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={txLoading || !!txSuccess}
                  className={`flex-1 py-2.5 text-white font-bold rounded-xl transition-all shadow-md text-sm ${
                    txType === "DEPOSIT" 
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" 
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                  }`}
                >
                  {txLoading ? "Processing..." : txType === "DEPOSIT" ? "Confirm Deposit" : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
