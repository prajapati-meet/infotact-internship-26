import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import {
  FaCreditCard,
  FaSignOutAlt,
  FaBell,
  FaCheck,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaTimes,
} from "react-icons/fa";

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

// Notification type styling mapping
const getNotificationStyles = (type) => {
  switch (type) {
    case "SUCCESS":
      return {
        bg: "bg-green-50 text-green-700 border-green-100",
        icon: <FaCheckCircle className="text-green-500 w-4 h-4 mt-0.5 flex-shrink-0" />,
        dot: "bg-green-500",
      };
    case "WARNING":
      return {
        bg: "bg-yellow-50 text-yellow-700 border-yellow-100",
        icon: <FaExclamationTriangle className="text-yellow-500 w-4 h-4 mt-0.5 flex-shrink-0" />,
        dot: "bg-yellow-500",
      };
    case "ERROR":
      return {
        bg: "bg-red-50 text-red-700 border-red-100",
        icon: <FaTimesCircle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />,
        dot: "bg-red-500",
      };
    case "INFO":
    default:
      return {
        bg: "bg-blue-50 text-blue-700 border-blue-100",
        icon: <FaInfoCircle className="text-blue-500 w-4 h-4 mt-0.5 flex-shrink-0" />,
        dot: "bg-blue-500",
      };
  }
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  
  const isAdminPage = location.pathname === "/admin";
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  // Fetch notifications and unread count
  const fetchNotificationsData = async () => {
    if (!isAuthenticated) return;
    try {
      const [notifResponse, countResponse] = await Promise.all([
        axiosInstance.get("/notifications"),
        axiosInstance.get("/notifications/unread/count"),
      ]);
      setNotifications(notifResponse.data);
      setUnreadCount(countResponse.data.count);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificationsData();
      
      // Auto-poll notifications every 10 seconds for real-time feel
      const interval = setInterval(fetchNotificationsData, 10000);
      
      // Listen to local update events
      const handleUpdate = () => {
        fetchNotificationsData();
      };
      window.addEventListener("notification-updated", handleUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener("notification-updated", handleUpdate);
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleOpen = () => setIsModalOpen(true);
    window.addEventListener("open-notifications", handleOpen);
    return () => {
      window.removeEventListener("open-notifications", handleOpen);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const latest5 = notifications.slice(0, 5);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-200">
        <div className="mx-auto max-w-[92%] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center gap-2">
              <NavLink to={isAdminPage ? "/admin" : "/dashboard"} className="flex items-center gap-2 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 group-hover:scale-105 transition-transform duration-200">
                  <FaCreditCard size={20} />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                  Ledger
                </span>
              </NavLink>
            </div>

            {/* Middle Nav Links */}
            {!isAdminPage ? (
              <div className="hidden md:flex items-center space-x-6">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                        : "text-slate-600 hover:text-blue-600"
                    }`
                  }
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/transactions"
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                        : "text-slate-600 hover:text-blue-600"
                    }`
                  }
                >
                  Transactions
                </NavLink>

                <NavLink
                  to="/transfer"
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                        : "text-slate-600 hover:text-blue-600"
                    }`
                  }
                >
                  Send Money
                </NavLink>

                <NavLink
                  to="/account"
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                        : "text-slate-600 hover:text-blue-600"
                    }`
                  }
                >
                  Account
                </NavLink>

                {user?.role === "ADMIN" && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `px-3 py-2 text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                          : "text-slate-600 hover:text-blue-600"
                      }`
                    }
                  >
                    Admin
                  </NavLink>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center">
                <span className="text-sm font-bold text-slate-800 bg-slate-100 px-4 py-2 rounded-xl select-none">
                  Admin Control Panel
                </span>
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Notification Bell with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all duration-200 focus:outline-none"
                  aria-label="Notifications"
                >
                  <FaBell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Card */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 focus:outline-none z-50">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 pb-3">
                      <span className="font-bold text-slate-800">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[350px] overflow-y-auto py-1">
                      {latest5.length === 0 ? (
                        <div className="py-8 text-center text-sm text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        latest5.map((notif) => {
                          const style = getNotificationStyles(notif.type);
                          return (
                            <div
                              key={notif.id}
                              onClick={(e) => !notif.isRead && handleMarkAsRead(notif.id, e)}
                              className={`flex items-start gap-3 p-3 my-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                                notif.isRead
                                  ? "border-transparent hover:bg-slate-50 bg-white"
                                  : "border-blue-50 bg-blue-50/20 hover:bg-blue-50/30"
                              }`}
                            >
                              <div className="mt-0.5">{style.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`text-sm font-semibold truncate ${notif.isRead ? "text-slate-700" : "text-slate-900"}`}>
                                    {notif.title}
                                  </p>
                                  {!notif.isRead && (
                                    <span className={`h-2 w-2 rounded-full ${style.dot} flex-shrink-0`} />
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                                  {getRelativeTime(notif.createdAt)}
                                </span>
                              </div>
                              {!notif.isRead && (
                                <button
                                  onClick={(e) => handleMarkAsRead(notif.id, e)}
                                  className="p-1 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100/50 mt-0.5"
                                  title="Mark as read"
                                >
                                  <FaCheck className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-2 px-2">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsModalOpen(true);
                        }}
                        className="w-full py-2.5 text-center text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-slate-50 rounded-xl transition-all duration-200"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-3">
                <div
                  onClick={() => navigate("/account")}
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                  title="View Profile Details"
                >
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt="Profile"
                      className="h-9 w-9 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-600 font-bold text-sm select-none">
                      {user?.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-semibold text-slate-700">
                    {user?.username || "User"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-red-600 hover:border-red-100 transition-all duration-200 focus:outline-none"
                >
                  <FaSignOutAlt size={13} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        {!isAdminPage ? (
          <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-white px-2 py-1.5 w-full">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-all ${
                  isActive ? "text-blue-600" : "text-slate-500 hover:text-blue-500"
                }`
              }
            >
              <span className="text-base mb-0.5">🏠</span>
              Dashboard
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-all ${
                  isActive ? "text-blue-600" : "text-slate-500 hover:text-blue-500"
                }`
              }
            >
              <span className="text-base mb-0.5">📊</span>
              Transactions
            </NavLink>
            <NavLink
              to="/transfer"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-all ${
                  isActive ? "text-blue-600" : "text-slate-500 hover:text-blue-500"
                }`
              }
            >
              <span className="text-base mb-0.5">💸</span>
              Send Money
            </NavLink>
            <NavLink
              to="/account"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-all ${
                  isActive ? "text-blue-600" : "text-slate-500 hover:text-blue-500"
                }`
              }
            >
              <span className="text-base mb-0.5">👤</span>
              Account
            </NavLink>
            {user?.role === "ADMIN" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-all ${
                    isActive ? "text-blue-600" : "text-slate-500 hover:text-blue-500"
                  }`
                }
              >
                <span className="text-base mb-0.5">🔑</span>
                Admin
              </NavLink>
            )}
          </div>
        ) : (
          <div className="md:hidden flex items-center justify-center border-t border-slate-100 bg-white px-2 py-3 w-full">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider select-none">
              Admin Control Panel
            </span>
          </div>
        )}
      </nav>

      {/* Notifications History Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔔</span>
                <h3 className="text-lg font-bold text-slate-800">Notification History</h3>
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {notifications.length} Total
                </span>
              </div>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-6 space-y-3">
              {notifications.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-2xl mb-4">
                    📭
                  </div>
                  <h4 className="text-base font-semibold text-slate-700">No notifications yet</h4>
                  <p className="text-sm text-slate-400 mt-1">
                    System messages and transaction updates will be logged here.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const style = getNotificationStyles(notif.type);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                        notif.isRead
                          ? "border-slate-100 hover:bg-slate-50 bg-white"
                          : "border-blue-100 bg-blue-50/10 hover:bg-blue-50/20"
                      }`}
                    >
                      <div className="mt-1 p-2 rounded-lg bg-white shadow-sm border border-slate-100">{style.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`font-bold text-sm ${notif.isRead ? "text-slate-700" : "text-slate-900"}`}>
                            {notif.title}
                          </h4>
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-slate-400">
                            {getRelativeTime(notif.createdAt)}
                          </span>
                          {!notif.isRead ? (
                            <button
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                              <FaCheck className="w-2.5 h-2.5" />
                              Mark as read
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-full select-none">
                              <FaCheck className="w-2 h-2 text-slate-400" /> Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-sm font-semibold border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;