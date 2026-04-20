import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Bell, CheckCheck, Trash2, X, 
  UserPlus, CreditCard, RefreshCw, AlertCircle,
  Calendar, User, DollarSign, MessageCircle, Mail, Clock
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

const NotificationModal = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Approve modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams({
        page,
        per_page: 10,
        ...(filter !== 'all' && { filter })
      });

      const response = await axios.get(`${API_BASE}/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch instructors filtered by location
  const fetchInstructorsByLocation = async (locationId) => {
  console.log("Fetching instructors for location ID:", locationId);
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_BASE}/instructors/by-location`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { location_id: locationId }
    });
    console.log("API response:", response.data);
    setInstructors(response.data.data || []);
  } catch (error) {
    console.error("Error fetching instructors", error);
  }
};

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_BASE}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true, read_at: 'Just now' } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_BASE}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.map(n => ({ ...n, is_read: true, read_at: 'Just now' })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_BASE}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.filter(n => n.id !== id));
      setTotalItems(prev => prev - 1);
    } catch (error) {
      console.error("Delete notification error:", error);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm("Reject this package request?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_BASE}/package-requests/${requestId}/reject`,
        { admin_notes: "Rejected via notification" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications(currentPage);
    } catch (error) {
      console.error("Rejection error:", error);
      alert("Rejection failed. Please try again.");
    }
  };

  // Open the approve modal and load instructors for the request's location
  const openApproveModal = (requestId, locationId) => {
    setSelectedRequestId(requestId);
    setSelectedLocationId(locationId);
    fetchInstructorsByLocation(locationId);
    setShowApproveModal(true);
  };

  // Confirm approval with the selected instructor
  const confirmApprove = async () => {
    if (!selectedInstructor) {
      alert("Please select an instructor");
      return;
    }
    setProcessing(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_BASE}/package-requests/${selectedRequestId}/approve`,
        { instructor_id: selectedInstructor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications(currentPage);
      setShowApproveModal(false);
      setSelectedRequestId(null);
      setSelectedInstructor('');
      alert("Package request approved successfully!");
    } catch (error) {
      console.error("Approval error:", error);
alert(error.response?.data?.error || error.response?.data?.message || "Approval failed. Please try again.");    } finally {
      setProcessing(false);
    }
  };

  const getNotificationIcon = (type, data) => {
    if (type === "StudentAssigned" || type.includes("StudentAssigned")) {
      return <UserPlus size={18} className="text-blue-500" />;
    } else if (type === "PaymentReceived" || type.includes("PaymentReceived")) {
      return <DollarSign size={18} className="text-green-500" />;
    } else if (type === "WelcomeStudent" || type.includes("WelcomeStudent")) {
      return <User size={18} className="text-purple-500" />;
    } else if (type === "InstructorChanged" || type.includes("InstructorChanged")) {
      return <RefreshCw size={18} className="text-orange-500" />;
    } else if (type === "LessonReminder" || type.includes("LessonReminder")) {
      return <Calendar size={18} className="text-indigo-500" />;
    } else if (type === "InvoiceGenerated" || type.includes("InvoiceGenerated")) {
      return <CreditCard size={18} className="text-amber-500" />;
    } else if (type === "new_package_request") {
      return <Bell size={18} className="text-teal-500" />;
    } else {
      return <Bell size={18} className="text-gray-500" />;
    }
  };

  const getNotificationColor = (isRead, type) => {
    if (!isRead) {
      return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-teal-500';
    }
    return 'bg-white dark:bg-slate-900';
  };

  const getIconColorClass = (type) => {
    if (type === "StudentAssigned" || type.includes("StudentAssigned")) {
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600";
    } else if (type === "PaymentReceived" || type.includes("PaymentReceived")) {
      return "bg-green-100 dark:bg-green-900/30 text-green-600";
    } else if (type === "WelcomeStudent" || type.includes("WelcomeStudent")) {
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-600";
    } else if (type === "InstructorChanged" || type.includes("InstructorChanged")) {
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-600";
    } else if (type === "LessonReminder" || type.includes("LessonReminder")) {
      return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600";
    } else if (type === "InvoiceGenerated" || type.includes("InvoiceGenerated")) {
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-600";
    } else if (type === "new_package_request") {
      return "bg-teal-100 dark:bg-teal-900/30 text-teal-600";
    }
    return "bg-gray-100 dark:bg-gray-800 text-gray-600";
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-0 sm:p-4">
      {/* Responsive Modal Container */}
      <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl bg-white dark:bg-slate-950 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 sm:slide-in-from-right sm:w-full sm:max-w-2xl lg:max-w-4xl xl:max-w-7xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Bell size={18} className="text-teal-600 dark:text-teal-400 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
                Notifications
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-800 dark:text-slate-400">
                {unreadCount} unread • {totalItems} total
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-1.5 sm:p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                title="Mark all as read"
              >
                <CheckCheck size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px] text-slate-400 hover:text-red-500" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 sm:px-6 py-2 sm:py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'read', label: 'Read' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:text-teal-600 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="h-[calc(100vh-200px)] sm:max-h-[50vh] lg:max-h-[55vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
              <p className="text-md text-slate-800 dark:text-slate-300 mt-4">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center">
              <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-bold text-base sm:text-lg">No notifications found</p>
              <p className="text-md sm:text-sm text-slate-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 sm:p-5 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/30 ${getNotificationColor(notification.is_read, notification.type)}`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColorClass(notification.type)} bg-opacity-100 dark:bg-opacity-20`}>
                      {getNotificationIcon(notification.type, notification.data)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1">
                          <p className={`text-sm md:text-md lg:text-lg xl:text-xl font-semibold ${notification.is_read ? 'text-slate-900 dark:text-slate-300' : 'text-slate-800 dark:text-white'}`}>
                            {notification.message}
                          </p>
                          {notification.data && Object.keys(notification.data).length > 0 && (
                            <div className="mt-2 text-xs text-slate-900 dark:text-slate-400 space-y-1">
                              {Object.entries(notification.data).map(([key, value]) => {
                                if (key !== 'message' && key !== 'type' && key !== 'request_id' && key !== 'location_id') {
                                  const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                  return (
                                    <div key={key} className="flex flex-wrap items-center gap-2">
                                      <span className="text-[10px] sm:text-[14px] xl:text-[16px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{formattedKey}:</span>
                                      <span className="text-xs sm:text-sm lg:text-lg font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">{String(value)}</span>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                            <span className="text-[11px] sm:text-[16px] text-slate-400 flex items-center gap-1">
                              <Clock size={14} />
                              {formatTime(notification.created_at_timestamp || notification.created_at)}
                            </span>
                            {notification.read_at && (
                              <span className="text-[11px] sm:text-[16px] text-teal-600 dark:text-teal-400 flex items-center gap-1">
                                <CheckCheck size={14} />
                                Read {notification.read_at}
                              </span>
                            )}
                          </div>
                          {/* Approve/Reject buttons for new package request */}
                          {(notification.type === 'App\\Notifications\\NewPackageRequestNotification' || notification.type.includes('NewPackageRequestNotification')) && notification.data?.request_id && notification.data?.request_status === 'pending' &&  (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => openApproveModal(notification.data.request_id, notification.data.location_id)}
                                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(notification.data.request_id)}
                                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )} 

{/* Show status badge if already approved/rejected */}
{(notification.type === 'App\\Notifications\\NewPackageRequestNotification' || notification.type.includes('NewPackageRequestNotification')) 
  && notification.data?.request_id 
  && notification.data?.request_status !== 'pending' && (
  <div className="mt-3">
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      notification.data?.request_status === 'approved' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {notification.data?.request_status === 'approved' ? '✓ Approved' : '✗ Rejected'}
    </span>
  </div>
)}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0 self-start sm:self-auto">
                          {!notification.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1.5 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <CheckCheck size={12} className="sm:w-[14px] sm:h-[14px]" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={12} className="sm:w-[14px] sm:h-[14px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button
              onClick={() => {
                if (currentPage > 1) {
                  fetchNotifications(currentPage - 1);
                }
              }}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Page <span className="font-bold text-slate-700 dark:text-white">{currentPage}</span> of {totalPages}
            </span>
            <button
              onClick={() => {
                if (currentPage < totalPages) {
                  fetchNotifications(currentPage + 1);
                }
              }}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Approve Modal (Select Instructor) */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Approve Package Request</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select an instructor to assign to this student:</p>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Select Instructor --</option>
                {instructors.map(ins => (
                  <option key={ins.id} value={ins.id}>
                    {ins.user?.name || ins.name || `Instructor #${ins.id}`}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedRequestId(null);
                    setSelectedInstructor('');
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprove}
                  disabled={processing}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Confirm Approval"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationModal;






