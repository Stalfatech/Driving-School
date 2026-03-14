import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Bell, CheckCheck, Trash2, X, 
  UserPlus, CreditCard, RefreshCw, AlertCircle,
  Calendar, User, DollarSign, MessageCircle
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

const NotificationModal = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

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

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_BASE}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
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
    if (!confirm('Delete this notification?')) return;
    
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

  const getNotificationIcon = (type, data) => {
    if (type.includes('StudentAssigned')) {
      return <UserPlus size={18} className="text-blue-500" />;
    } else if (type.includes('PaymentReceived')) {
      return <DollarSign size={18} className="text-green-500" />;
    } else if (type.includes('WelcomeStudent')) {
      return <User size={18} className="text-purple-500" />;
    } else if (type.includes('InstructorChanged')) {
      return <RefreshCw size={18} className="text-orange-500" />;
    } else {
      return <Bell size={18} className="text-gray-500" />;
    }
  };

  const getNotificationColor = (isRead) => {
    return isRead ? 'bg-gray-50 dark:bg-gray-800/30' : 'bg-blue-50 dark:bg-blue-900/10';
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-end p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in slide-in-from-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <Bell size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                Notifications
              </h2>
              <p className="text-xs text-gray-500">
                {unreadCount} unread • {totalItems} total
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                title="Mark all as read"
              >
                <CheckCheck size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-800">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center">
              <Bell size={40} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 font-bold">No notifications found</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 border-b border-gray-100 dark:border-gray-800 transition-colors ${getNotificationColor(notification.is_read)}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="h-10 w-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center flex-shrink-0">
                    {getNotificationIcon(notification.type, notification.data)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          {notification.message}
                        </p>
                        {notification.data && (
                          <div className="mt-2 text-xs text-gray-500 space-y-1">
                            {Object.entries(notification.data).map(([key, value]) => {
                              if (key !== 'message' && key !== 'type') {
                                return (
                                  <div key={key} className="flex items-center gap-2">
                                    <span className="font-mono text-[9px] uppercase text-gray-400">{key}:</span>
                                    <span className="text-gray-600 dark:text-gray-300">{String(value)}</span>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[9px] text-gray-400 flex items-center gap-1">
                            <Calendar size={10} />
                            {notification.created_at}
                          </span>
                          {notification.read_at && (
                            <span className="text-[9px] text-green-500 flex items-center gap-1">
                              <CheckCheck size={10} />
                              Read {notification.read_at}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCheck size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => fetchNotifications(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-xs font-black uppercase tracking-wider text-gray-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => fetchNotifications(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-xs font-black uppercase tracking-wider text-gray-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;