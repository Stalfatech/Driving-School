import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Bell, Info, AlertTriangle, CheckCircle, Mail, 
  X, Loader2, Calendar, Clock, Filter, 
  CheckCheck, Trash2, UserPlus, DollarSign, 
  RefreshCw, Shield, AlertCircle, UserCheck
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

const InstructorNotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Auto-clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
      setMessage({ type: 'error', text: 'Failed to load notifications' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(currentPage);
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_BASE}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Update local state
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, is_read: true, read_at: 'Just now' } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
        setMessage({ type: 'success', text: 'Notification marked as read' });
      }
    } catch (error) {
      console.error("Mark as read error:", error);
      setMessage({ type: 'error', text: 'Failed to mark as read' });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_BASE}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true, read_at: 'Just now' })));
        setUnreadCount(0);
        setMessage({ type: 'success', text: 'All notifications marked as read' });
      }
    } catch (error) {
      console.error("Mark all as read error:", error);
      setMessage({ type: 'error', text: 'Failed to mark all as read' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notification?')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.delete(`${API_BASE}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setNotifications(notifications.filter(n => n.id !== id));
        setTotalItems(prev => prev - 1);
        setUnreadCount(response.data.unread_count);
        setMessage({ type: 'success', text: 'Notification deleted' });
      }
    } catch (error) {
      console.error("Delete notification error:", error);
      setMessage({ type: 'error', text: 'Failed to delete notification' });
    }
  };

  const getNotificationIcon = (type, data) => {
    if (type.includes('StudentAssigned')) {
      return <UserPlus size={20} className="text-blue-500" />;
    } else if (type.includes('PaymentReceived')) {
      return <DollarSign size={20} className="text-green-500" />;
    } else if (type.includes('WelcomeStudent')) {
      return <UserCheck size={20} className="text-purple-500" />;
    } else if (type.includes('InstructorChanged')) {
      return <RefreshCw size={20} className="text-orange-500" />;
    } else if (type.includes('Expense')) {
      return <AlertCircle size={20} className="text-amber-500" />;
    } else {
      return <Bell size={20} className="text-indigo-500" />;
    }
  };

  const getNotificationColor = (type) => {
    if (type.includes('StudentAssigned')) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800';
    if (type.includes('PaymentReceived')) return 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800';
    if (type.includes('WelcomeStudent')) return 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800';
    if (type.includes('InstructorChanged')) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800';
    if (type.includes('Expense')) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800';
    return 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800';
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-white dark:from-gray-950 dark:to-slate-900 min-h-screen">
      
      <main className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        
        {/* Header with Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black italic uppercase text-slate-800 dark:text-white">
              Notifications <span className="text-indigo-600">& Alerts</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
              Stay updated with your teaching activities
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Unread Badge */}
            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                {unreadCount} Unread
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className={`text-slate-600 dark:text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <CheckCheck size={14} />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
          {[
            { key: 'all', label: 'All', icon: <Bell size={14} /> },
            { key: 'unread', label: 'Unread', icon: <Bell size={14} className="text-indigo-500" /> },
            { key: 'read', label: 'Read', icon: <CheckCheck size={14} /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                filter === tab.key
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-slate-500 font-bold">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
              <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg mb-2">No notifications found</p>
              <p className="text-sm text-slate-400">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  !notification.is_read 
                    ? 'border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/20' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-500/30'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type, notification.data)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">
                            {notification.type.split('\\').pop()?.replace('Notification', '') || 'SYSTEM'}
                          </span>
                          {!notification.is_read && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full text-[8px] font-black uppercase">
                              New
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-[9px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {notification.created_at}
                          </span>
                          {notification.read_at && (
                            <span className="flex items-center gap-1 text-green-500">
                              <CheckCheck size={10} />
                              Read
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="font-bold text-slate-800 dark:text-slate-200 mb-3">
                        {notification.message}
                      </p>

                      {/* Additional Data */}
                      {notification.data && Object.keys(notification.data).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(notification.data).map(([key, value]) => {
                            if (key !== 'message' && key !== 'type' && value) {
                              return (
                                <div key={key} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[8px] font-mono text-slate-600 dark:text-slate-300">
                                  <span className="font-black uppercase mr-1">{key}:</span>
                                  <span>{String(value)}</span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2 mt-2">
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
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
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
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => fetchNotifications(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {currentPage} of {totalPages} • {totalItems} total
            </span>
            <button
              onClick={() => fetchNotifications(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default InstructorNotificationPage;