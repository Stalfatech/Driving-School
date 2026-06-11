
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Bell, CheckCheck, Trash2, X, 
  UserPlus, CreditCard, RefreshCw, AlertCircle,
  Calendar, User, DollarSign, Clock, AlertTriangle, MapPin
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

// ─── Helper: Extract the real payload (handles nested API response) ─────────
const getPayload = (notificationData) => {
  if (!notificationData) return {};
  // If there's a nested 'data' field, use it; otherwise return the object itself
  return notificationData.data || notificationData;
};

// ─── Format date for display ────────────────────────────────────────────────
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

// ─── Parse time range helper ────────────────────────────────────────────────
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

const NotificationModal = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Custom Alerts & Dialogs
  const [toast, setToast] = useState({ type: '', message: '' });
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Approve modal state (For Package Requests)
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem('access_token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  const fetchNotifications = async (page = 1, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page, 
        per_page: 10, 
        ...(filter !== 'all' && { filter }) 
      });
      
      const response = await axios.get(`${API_BASE}/notifications?${params}`, config);

      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unread_count);
        setCurrentPage(response.data.meta.current_page);
        setTotalPages(response.data.meta.last_page);
        setTotalItems(response.data.meta.total);
      }
    } catch (error) { 
      console.error("Fetch Notifications Error:", error); 
      showToast('error', 'Failed to load notifications');
    } finally { 
      if (!silent) setLoading(false); 
    }
  };

  const fetchInstructorsByLocation = async (locationId) => {
    try {
      const response = await axios.get(`${API_BASE}/instructors/by-location`, { ...config, params: { location_id: locationId } });
      setInstructors(response.data.data || []);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { 
    fetchNotifications(); 
  }, [filter]);

  // --- ACTIONS ---
  const handleMarkAsRead = async (id) => {
    try {
      await axios.post(`${API_BASE}/notifications/${id}/read`, {}, config);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read_at: 'Just now' } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      showToast('success', 'Notification marked as read');
    } catch (error) { 
      console.error(error);
      showToast('error', 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.post(`${API_BASE}/notifications/read-all`, {}, config);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: 'Just now' })));
      setUnreadCount(0);
      showToast('success', 'All notifications marked as read.');
    } catch (error) { 
      console.error(error);
      showToast('error', 'Failed to mark all as read');
    }
  };

  const executeDelete = async (id) => {
    setConfirmDialog(null);
    try {
      await axios.delete(`${API_BASE}/notifications/${id}`, config);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotalItems(prev => prev - 1);
      showToast('success', 'Notification deleted.');
    } catch (error) { 
      showToast('error', 'Failed to delete notification.'); 
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({
      title: "Delete Notification",
      message: "Are you sure you want to remove this notification?",
      type: "danger",
      actionText: "Delete",
      onConfirm: () => executeDelete(id)
    });
  };

  // --- PACKAGE REQUEST LOGIC ---
  const executeRejectPackage = async (notification) => {
    setConfirmDialog(null);
    setProcessing(true);
    try {
      const payload = getPayload(notification.data);
      const requestId = payload.request_id;
      
      await axios.post(`${API_BASE}/package-requests/${requestId}/reject`, { admin_notes: "Rejected via notification" }, config);
      
      // Mark as read after rejection
      await axios.post(`${API_BASE}/notifications/${notification.id}/read`, {}, config);
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, is_read: true, read_at: 'Just now' } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      showToast('success', 'Package request rejected successfully.');
      
      // Refresh to get updated status
      setTimeout(() => fetchNotifications(currentPage, true), 500);
    } catch (error) { 
      showToast('error', "Rejection failed. Please try again."); 
    } finally { 
      setProcessing(false); 
    }
  };

  const handleRejectPackageClick = (notification) => {
    setConfirmDialog({
      title: "Reject Package Request",
      message: "Are you sure you want to reject this package request?",
      type: "warning",
      actionText: "Reject Request",
      onConfirm: () => executeRejectPackage(notification)
    });
  };

  const openApproveModal = (notification) => {
    const payload = getPayload(notification.data);
    setSelectedNotification({ ...notification, data: payload });
    fetchInstructorsByLocation(payload.location_id);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedInstructor) { 
      showToast('warning', "Please select an instructor"); 
      return; 
    }
    
    setProcessing(true);
    try {
      await axios.post(`${API_BASE}/package-requests/${selectedNotification.data.request_id}/approve`, 
        { instructor_id: selectedInstructor }, 
        config
      );
      
      // Mark as read after approval
      await axios.post(`${API_BASE}/notifications/${selectedNotification.id}/read`, {}, config);
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === selectedNotification.id ? { ...n, is_read: true, read_at: 'Just now' } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      setShowApproveModal(false);
      setSelectedNotification(null);
      setSelectedInstructor('');
      showToast('success', "Package request approved successfully!");
      
      // Refresh to get updated status
      setTimeout(() => fetchNotifications(currentPage, true), 500);
    } catch (error) {
      showToast('error', "Approval failed. Please try again.");    
    } finally { 
      setProcessing(false); 
    }
  };

  // --- RESCHEDULE REQUEST LOGIC ---
  const handleApproveReschedule = async (notification) => {
    const payload = getPayload(notification.data);
    const requestId = payload.request_id || payload.assignment_id || payload.id;
    
    if (!requestId) { 
      showToast('error', 'Error: Missing Request ID.'); 
      return; 
    }

    setProcessing(true);
    try {
      const response = await axios.post(`${API_BASE}/admin/reschedule/${requestId}/approve`, {}, config);
      
      // Mark as read after approval
      await axios.post(`${API_BASE}/notifications/${notification.id}/read`, {}, config);
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, is_read: true, read_at: 'Just now' } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      showToast('success', response.data.message || "Reschedule request approved!");
      
      // Refresh to get updated status
      setTimeout(() => fetchNotifications(currentPage, true), 500);
    } catch (error) {
      showToast('error', error.response?.data?.message || "Approval failed. Conflict may exist.");
    } finally { 
      setProcessing(false); 
    }
  };

  const executeRejectReschedule = async (notification) => {
    setConfirmDialog(null);
    setProcessing(true);
    try {
      const payload = getPayload(notification.data);
      const requestId = payload.request_id || payload.assignment_id || payload.id;
      if (!requestId) return;

      const response = await axios.post(`${API_BASE}/admin/reschedule/${requestId}/reject`, {}, config);
      
      // Mark as read after rejection
      await axios.post(`${API_BASE}/notifications/${notification.id}/read`, {}, config);
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, is_read: true, read_at: 'Just now' } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      showToast('success', response.data.message || "Reschedule request rejected.");
      
      // Refresh to get updated status
      setTimeout(() => fetchNotifications(currentPage, true), 500);
    } catch (error) { 
      showToast('error', "Rejection failed. Please try again."); 
    } finally { 
      setProcessing(false); 
    }
  };

  const handleRejectRescheduleClick = (notification) => {
    setConfirmDialog({
      title: "Reject Reschedule",
      message: "Are you sure you want to reject this reschedule request?",
      type: "warning",
      actionText: "Reject Reschedule",
      onConfirm: () => executeRejectReschedule(notification)
    });
  };

  // Helper function to check if notification should show action buttons
  const shouldShowActionButtons = (notification) => {
    // Only show buttons for unread notifications
    if (notification.is_read) return false;
    
    const payload = getPayload(notification.data);
    const notifType = notification.type || "";
    const isRescheduleRequest = notifType.includes('reschedule_request') || 
                                notifType.includes('ADMIN_RESCHEDULE_REQUEST_ALERT') || 
                                (payload.notification_type && payload.notification_type.includes('reschedule'));
    const isPackageRequest = notifType.includes('NewPackageRequestNotification') || 
                            notifType === 'new_package_request' ||
                            payload.type === 'new_package_request';
    
    // For reschedule requests, check if already processed
    if (isRescheduleRequest) {
      const status = payload.request_status || payload.status;
      if (status === 'approved' || status === 'rejected') return false;
    }
    
    // For package requests, check if already processed
    if (isPackageRequest) {
      const status = payload.request_status;
      if (status === 'approved' || status === 'rejected') return false;
    }
    
    return true;
  };

  // Get request status for badge display
  const getRequestStatus = (notification) => {
    const payload = getPayload(notification.data);
    const notifType = notification.type || "";
    const isRescheduleRequest = notifType.includes('reschedule_request') || 
                                notifType.includes('ADMIN_RESCHEDULE_REQUEST_ALERT') ||
                                (payload.notification_type && payload.notification_type.includes('reschedule'));
    const isPackageRequest = notifType.includes('NewPackageRequestNotification') || 
                            notifType === 'new_package_request' ||
                            payload.type === 'new_package_request';
    
    if (isRescheduleRequest) {
      return payload.request_status || payload.status;
    }
    
    if (isPackageRequest) {
      return payload.request_status;
    }
    
    return null;
  };

  // --- UI FORMATTING HELPERS ---
  const getNotificationIcon = (type, data) => {
    const payload = getPayload(data);
    const slug = payload.type || payload.notification_type || "";
    
    if (slug.includes("reschedule") || type.includes("reschedule")) 
      return <RefreshCw size={18} className="text-orange-500" />;
    if (slug.includes("StudentAssigned") || type.includes("StudentAssigned")) 
      return <UserPlus size={18} className="text-blue-500" />;
    if (slug.includes("PaymentReceived")) 
      return <DollarSign size={18} className="text-green-500" />;
    if (slug === "new_package_request" || type.includes("NewPackageRequestNotification")) 
      return <Bell size={18} className="text-teal-500" />;
    
    return <Bell size={18} className="text-slate-500" />;
  };

  const getIconColorClass = (type, data) => {
    const payload = getPayload(data);
    const slug = payload.type || payload.notification_type || "";
    
    if (slug.includes("reschedule") || type.includes("reschedule")) 
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-600";
    if (slug.includes("StudentAssigned") || type.includes("StudentAssigned")) 
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600";
    if (slug === "new_package_request" || type.includes("NewPackageRequestNotification")) 
      return "bg-teal-100 dark:bg-teal-900/30 text-teal-600";
    
    return "bg-slate-100 dark:bg-slate-800 text-slate-600";
  };

  const getTypeLabel = (type, data) => {
    const payload = getPayload(data);
    const slug = payload.type || payload.notification_type || "";
    
    const labels = {
      'student_reschedule_request': 'Reschedule Request',
      'admin_reschedule_request': 'Reschedule Request',
      'new_package_request': 'Package Request',
      'NewPackageRequestNotification': 'Package Request',
    };
    
    if (labels[slug]) return labels[slug];
    if (type.includes("reschedule")) return "Reschedule Request";
    if (type.includes("Package")) return "Package Request";
    
    return "Notification";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl bg-white dark:bg-slate-950 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
        
        {/* IN-APP TOAST NOTIFICATION BANNER */}
        {toast.message && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold text-white transition-all animate-in slide-in-from-top-2 ${
            toast.type === 'success' ? 'bg-teal-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-amber-500'
          }`}>
            {toast.type === 'success' ? <CheckCheck size={18} /> : <AlertTriangle size={18} />}
            {toast.message}
          </div>
        )}

        {/* CUSTOM CONFIRM DIALOG */}
        {confirmDialog && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${confirmDialog.type === 'danger' ? 'text-red-600' : 'text-amber-600'}`}>
                <AlertCircle size={20} /> {confirmDialog.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">{confirmDialog.message}</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setConfirmDialog(null)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200">Cancel</button>
                <button onClick={confirmDialog.onConfirm} className={`flex-1 py-2.5 text-white rounded-lg text-sm font-bold shadow-md ${confirmDialog.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
                  {confirmDialog.actionText}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Bell size={18} className="text-teal-600 dark:text-teal-400 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Notifications</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread • {totalItems} total</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="p-1.5 sm:p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors" title="Mark all as read">
                <CheckCheck size={18} />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <X size={18} className="text-slate-400 hover:text-red-500" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 sm:px-6 py-2 sm:py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-x-auto shrink-0">
          <div className="flex gap-2 min-w-max">
            {[
              { key: 'all', label: 'All', count: totalItems },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: totalItems - unreadCount }
            ].map((tab) => (
              <button 
                key={tab.key} 
                onClick={() => { setFilter(tab.key); setCurrentPage(1); }} 
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                  filter === tab.key 
                    ? 'bg-teal-600 text-white shadow-sm' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-teal-600 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  filter === tab.key 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
              <p className="text-sm text-slate-500 mt-4">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center">
              <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="font-bold text-slate-500">No notifications found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((notification) => {
                const payload = getPayload(notification.data);
                const notifType = notification.type || "";
                const isPackageRequest = notifType.includes('NewPackageRequestNotification') || 
                                        notifType === 'new_package_request' ||
                                        payload.type === 'new_package_request';
                const isRescheduleRequest = notifType.includes('reschedule_request') || 
                                           notifType.includes('ADMIN_RESCHEDULE_REQUEST_ALERT') ||
                                           (payload.notification_type && payload.notification_type.includes('reschedule'));
                
                const showButtons = shouldShowActionButtons(notification);
                const requestStatus = getRequestStatus(notification);
                const displayMessage = notification.message || payload.message || "New notification";

                return (
                  <div 
                    key={notification.id} 
                    className={`p-4 sm:p-5 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/30 ${
                      !notification.is_read 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-teal-500' 
                        : 'bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColorClass(notifType, notification.data)}`}>
                        {getNotificationIcon(notifType, notification.data)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                          <div className="flex-1">
                            {/* Type Badge */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                                {getTypeLabel(notifType, notification.data)}
                              </span>
                              {!notification.is_read && (
                                <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-[9px] font-bold uppercase">
                                  New
                                </span>
                              )}
                            </div>
                            
                            <p className={`text-sm sm:text-base font-semibold ${notification.is_read ? 'text-slate-700 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                              {displayMessage}
                            </p>
                            
                            {/* Request Details */}
                            {isRescheduleRequest && payload.requested_date && (
                              <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  {payload.student_name && (
                                    <div className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                                      Student: <span className="font-semibold text-slate-800 dark:text-white">{payload.student_name}</span>
                                    </div>
                                  )}
                                  {payload.instructor_name && (
                                    <div className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                                      Instructor: <span className="font-semibold text-slate-800 dark:text-white">{payload.instructor_name}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                  <Calendar size={11} className="text-orange-500 flex-shrink-0" />
                                  <span className="text-orange-600 dark:text-orange-400">Requested:</span>
                                  <span className="font-semibold text-orange-700 dark:text-orange-300">
                                    {formatDisplayDate(payload.requested_date)}
                                  </span>
                                  {payload.requested_time && (
                                    <>
                                      <Clock size={11} className="text-orange-500 ml-1" />
                                      <span className="font-semibold text-orange-700 dark:text-orange-300">
                                        {payload.requested_time}
                                      </span>
                                    </>
                                  )}
                                </div>
                                
                                {payload.reason && payload.reason !== "No reason provided" && (
                                  <div className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                                    Reason: <span className="text-slate-800 dark:text-white">{payload.reason}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {isPackageRequest && (
                              <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  {payload.student_name && (
                                    <div className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                                      Student: <span className="font-semibold text-slate-800 dark:text-white">{payload.student_name}</span>
                                    </div>
                                  )}
                                  {payload.package_name && (
                                    <div className="px-2 py-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800 text-xs text-teal-700 dark:text-teal-400">
                                      📦 {payload.package_name}
                                    </div>
                                  )}
                                  {payload.location && (
                                    <div className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                      <MapPin size={10} />
                                      <span className="font-semibold text-slate-800 dark:text-white">{payload.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            {showButtons && (
                              <div className="flex gap-2 mt-3">
                                {isPackageRequest && (
                                  <>
                                    <button 
                                      onClick={() => openApproveModal(notification)} 
                                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors"
                                    >
                                      Approve Request
                                    </button>
                                    <button 
                                      onClick={() => handleRejectPackageClick(notification)} 
                                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                
                                {isRescheduleRequest && (
                                  <>
                                    <button 
                                      disabled={processing}
                                      onClick={() => handleApproveReschedule(notification)} 
                                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1"
                                    >
                                      <CheckCheck size={14} /> Approve Reschedule
                                    </button>
                                    <button 
                                      disabled={processing}
                                      onClick={() => handleRejectRescheduleClick(notification)} 
                                      className="px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                                    >
                                      <X size={14} /> Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Status Badge for Processed Requests */}
                            {requestStatus && (requestStatus === 'approved' || requestStatus === 'rejected') && (
                              <div className="mt-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                  requestStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {requestStatus === 'approved' ? '✓ Approved' : '✗ Rejected'}
                                </span>
                              </div>
                            )}

                            {/* Timestamp */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={12} /> {formatDisplayDateTime(notification.created_at_timestamp || notification.created_at)}
                              </span>
                              {notification.read_at && (
                                <span className="text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1">
                                  <CheckCheck size={12} /> Read
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Icons */}
                          <div className="flex items-center gap-1 flex-shrink-0 self-start sm:self-auto">
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
                              onClick={() => handleDeleteClick(notification.id)} 
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
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <button 
              onClick={() => fetchNotifications(currentPage - 1)} 
              disabled={currentPage === 1} 
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-teal-600 disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Page <span className="font-bold text-slate-700 dark:text-white">{currentPage}</span> of {totalPages}
            </span>
            <button 
              onClick={() => fetchNotifications(currentPage + 1)} 
              disabled={currentPage === totalPages} 
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-teal-600 disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Approve Modal for Package Requests */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Assign Instructor</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select an instructor to assign to this student.</p>
            <select 
              value={selectedInstructor} 
              onChange={(e) => setSelectedInstructor(e.target.value)} 
              className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm mb-5 focus:ring-2 focus:ring-teal-500"
            >
              <option value="">-- Select Instructor --</option>
              {instructors.map(ins => (
                <option key={ins.id} value={ins.id}>{ins.user?.name || ins.name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => { setShowApproveModal(false); setSelectedNotification(null); setSelectedInstructor(''); }} 
                className="px-4 py-2 border rounded-lg text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmApprove} 
                disabled={processing} 
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {processing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationModal;