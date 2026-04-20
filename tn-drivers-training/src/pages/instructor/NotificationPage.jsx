import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Bell, Info, AlertTriangle, CheckCircle, Mail,
  X, Loader2, Calendar, Clock, Filter,
  CheckCheck, Trash2, UserPlus, DollarSign,
  RefreshCw, Shield, AlertCircle, UserCheck,
  MapPin, ArrowRight
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

// ─── Helper: Extract the real payload (handles nested API response) ─────────
const getPayload = (notificationData) => {
  if (!notificationData) return {};
  // If there's a nested 'data' field, use it; otherwise return the object itself
  return notificationData.data || notificationData;
};

// ─── Helper to parse "08:00 AM - 09:00 AM" into { start, end } ─────────────
const parseTimeRange = (timeStr) => {
  if (!timeStr || !timeStr.includes(" - ")) return { start: timeStr, end: null };
  const [start, end] = timeStr.split(" - ");
  return { start, end };
};

// ─── Format date for display ────────────────────────────────────────────────
const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
};

const formatDisplayDateTime = (timestamp) => {
  if (!timestamp) return "";
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timestamp;
  }
};

// ─── Type‑aware detail renderer ─────────────────────────────────────────────
const NotificationDetails = ({ data }) => {
  const payload = getPayload(data);
  const slug = payload.type || payload.notification_type || "";

  // Student Reschedule Request (for instructors)
  if (slug === "student_reschedule_request") {
    const currentTimes = parseTimeRange(payload.current_time);
    const requestedTimes = parseTimeRange(payload.requested_time);

    return (
      <div className="mt-3 space-y-3">
        {/* Student & Location */}
        <div className="flex flex-wrap gap-2">
          {payload.student_name && (
            <div className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
              Student:{" "}
              <span className="font-semibold text-slate-800 dark:text-white">
                {payload.student_name}
              </span>
            </div>
          )}
          {payload.pickup_location && (
            <div className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <MapPin size={10} />
              <span className="font-semibold text-slate-800 dark:text-white">
                {payload.pickup_location}
              </span>
            </div>
          )}
        </div>

        {/* Current Date & Time */}
        {payload.current_date && (
          <div className="flex items-center gap-2 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
            <Calendar size={11} className="text-slate-400 flex-shrink-0" />
            <span className="text-slate-500">Current:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatDisplayDate(payload.current_date)}
            </span>
            {currentTimes.start && (
              <>
                <Clock size={11} className="text-slate-400 ml-1" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {currentTimes.start}
                </span>
                {currentTimes.end && (
                  <>
                    <span className="text-slate-400">→</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {currentTimes.end}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Requested Date & Time (highlighted) */}
        {payload.requested_date && (
          <div className="flex items-center gap-2 text-xs px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <Calendar size={11} className="text-orange-500 flex-shrink-0" />
            <span className="text-orange-600 dark:text-orange-400">Requested:</span>
            <span className="font-semibold text-orange-700 dark:text-orange-300">
              {formatDisplayDate(payload.requested_date)}
            </span>
            {requestedTimes.start && (
              <>
                <Clock size={11} className="text-orange-500 ml-1" />
                <span className="font-semibold text-orange-700 dark:text-orange-300">
                  {requestedTimes.start}
                </span>
                {requestedTimes.end && (
                  <>
                    <span className="text-orange-500">→</span>
                    <span className="font-semibold text-orange-700 dark:text-orange-300">
                      {requestedTimes.end}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Reason */}
        {payload.reason && payload.reason !== "No reason provided" && (
          <div className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
            Reason: <span className="text-slate-800 dark:text-white">{payload.reason}</span>
          </div>
        )}
      </div>
    );
  }

  // Student Assigned (instructor_assignment)
  if (slug === "instructor_assignment" || data.type?.includes("StudentAssigned")) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {payload.student_name && (
          <div className="px-2 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-400">
            Student: <span className="font-semibold">{payload.student_name}</span>
          </div>
        )}
        {payload.package_name && (
          <div className="px-2 py-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800 text-xs text-teal-700 dark:text-teal-400 font-semibold">
            📦 {payload.package_name}
          </div>
        )}
      </div>
    );
  }

  // Payment Received (for completeness)
  if (slug === "payment_received") {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {payload.amount != null && (
          <div className="px-2 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg text-xs text-green-700 dark:text-green-400">
            Amount: ${Number(payload.amount).toFixed(2)}
          </div>
        )}
        {payload.transaction_id && (
          <div className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
            TXN: {payload.transaction_id}
          </div>
        )}
      </div>
    );
  }

  // Default: show any extra fields (fallback)
  const extraFields = Object.entries(payload).filter(
    ([key]) => !["type", "message", "title"].includes(key)
  );
  if (extraFields.length > 0) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {extraFields.map(([key, value]) => (
          <div
            key={key}
            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400"
          >
            <span className="font-semibold mr-1">
              {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:
            </span>
            <span>{String(value)}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

// ─── Main Component ─────────────────────────────────────────────────────────
const InstructorNotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const itemsPerPage = 6;

  // Auto-clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams({
        page,
        per_page: itemsPerPage,
        ...(filter !== "all" && { filter }),
      });

      const response = await axios.get(`${API_BASE}/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unread_count);
        setCurrentPage(response.data.meta.current_page);
        setTotalPages(response.data.meta.last_page);
        setTotalItems(response.data.meta.total);
      }
    } catch (error) {
      console.error("Fetch notifications error:", error);
      setMessage({ type: "error", text: "Failed to load notifications" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, [filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(currentPage);
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${API_BASE}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, is_read: true, read_at: "Just now" } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setMessage({ type: "success", text: "Notification marked as read" });
      }
    } catch (error) {
      console.error("Mark as read error:", error);
      setMessage({ type: "error", text: "Failed to mark as read" });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${API_BASE}/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true, read_at: "Just now" }))
        );
        setUnreadCount(0);
        setMessage({ type: "success", text: "All notifications marked as read" });
      }
    } catch (error) {
      console.error("Mark all as read error:", error);
      setMessage({ type: "error", text: "Failed to mark all as read" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.delete(`${API_BASE}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const deletedNotification = notifications.find((n) => n.id === id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setTotalItems((prev) => prev - 1);
        if (!deletedNotification?.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        setMessage({ type: "success", text: "Notification deleted" });
        if (notifications.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      }
    } catch (error) {
      console.error("Delete notification error:", error);
      setMessage({ type: "error", text: "Failed to delete notification" });
    }
  };

  const getNotificationIcon = (type, data) => {
    const payload = getPayload(data);
    const slug = payload.type || payload.notification_type || "";

    if (slug === "student_reschedule_request") return <RefreshCw size={18} className="text-orange-500" />;
    if (slug === "instructor_assignment" || type.includes("StudentAssigned"))
      return <UserPlus size={18} className="text-blue-500" />;
    if (slug === "payment_received") return <DollarSign size={18} className="text-green-500" />;
    if (slug === "student_welcome") return <UserCheck size={18} className="text-purple-500" />;
    if (slug === "instructor_reassigned") return <RefreshCw size={18} className="text-amber-500" />;

    return <Bell size={18} className="text-indigo-500" />;
  };

  const getTypeLabel = (type, data) => {
    const payload = getPayload(data);
    const slug = payload.type || payload.notification_type || "";

    const labels = {
      student_reschedule_request: "Reschedule Request",
      instructor_assignment: "New Student Assignment",
      payment_received: "Payment Received",
      student_welcome: "Student Welcome",
      instructor_reassigned: "Instructor Change",
    };
    if (labels[slug]) return labels[slug];
    // Fallback: clean the class name
    return type.split("\\").pop().replace("Notification", "").replace(/([A-Z])/g, " $1").trim() || "System";
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      {/* HEADER */}
      <header className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
              Notifications <span className="text-teal-600 dark:text-teal-400">&amp; Alerts</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-400 mt-1.5 font-medium">
              Stay updated with your teaching activities and student assignments
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Unread Badge */}
            <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {unreadCount} Unread
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-all"
              title="Refresh"
            >
              <RefreshCw
                size={18}
                className={`text-slate-600 dark:text-slate-400 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>

            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
              >
                <CheckCheck size={14} />
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 overflow-x-hidden">
        <div className="max-w-[1800px] mx-auto">
          {/* Message Alert */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
              }`}
            >
              {message.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: "all", label: "All Notifications", icon: <Bell size={14} />, count: totalItems },
              { key: "unread", label: "Unread", icon: <Bell size={14} />, count: unreadCount },
              { key: "read", label: "Read", icon: <CheckCheck size={14} />, count: totalItems - unreadCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  filter === tab.key
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-teal-600 border border-slate-200 dark:border-slate-800"
                }`}
              >
                {tab.icon}
                {tab.label}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    filter === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={48} />
              <p className="text-sm font-semibold text-slate-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <Bell size={56} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No notifications found</p>
              <p className="text-sm text-slate-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const payload = getPayload(notification.data);
                const displayMessage =
                  notification.message !== "New notification"
                    ? notification.message
                    : payload.message || "New notification";

                return (
                  <div
                    key={notification.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all hover:shadow-md ${
                      !notification.is_read
                        ? "border-teal-300 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-950/20"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          {getNotificationIcon(notification.type, notification.data)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                                {getTypeLabel(notification.type, notification.data)}
                              </span>
                              {!notification.is_read && (
                                <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-[9px] font-bold uppercase">
                                  New
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDisplayDateTime(notification.created_at_timestamp || notification.created_at)}
                              </span>
                              {notification.read_at && (
                                <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                                  <CheckCheck size={12} />
                                  Read
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {displayMessage}
                          </p>

                          {/* Type-specific details */}
                          <NotificationDetails data={notification.data} />

                          {/* Action Buttons */}
                          <div className="flex justify-end gap-2 mt-3">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1.5 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <CheckCheck size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-8 mt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => fetchNotifications(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <span className="text-sm text-slate-500">
                Page{" "}
                <span className="font-bold text-slate-700 dark:text-white">{currentPage}</span> of {totalPages}
              </span>
              <button
                onClick={() => fetchNotifications(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InstructorNotificationPage;