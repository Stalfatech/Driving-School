


import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProfileModal from "./ProfileModal";
import NotificationModal from "./NotificationModal";
import { Bell, Home } from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

const Navbar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE}/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error("Fetch user error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setUnreadCount(response.data.unread_count);
        }
      } catch (error) {
        console.error("Fetch unread count error:", error);
        // Fallback to dummy data if API fails
        setUnreadCount(3);
      }
    };

    fetchUnreadCount();
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitle =
    location.pathname === "/"
      ? "Dashboard"
      : location.pathname.replace("/", "").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  const dateStr = currentTime.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "A";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-300"
          >
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300 text-xl">
              {isOpen ? "close" : "menu"}
            </span>
          </button>

          {/* PAGE TITLE SECTION */}
          <div className="flex items-center gap-2">
             <div className="w-7 h-7 md:w-8 md:h-8 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
               <Home className="w-4 h-4 md:w-4.5 md:h-4.5 text-teal-600 dark:text-teal-400" strokeWidth={1.8} />
             </div>
             <div>
               <h1 className="text-[0.95rem] sm:text-[1.3rem] md:text-[1.5rem] font-semibold tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
                 {pageTitle}
               </h1>
               <div className="hidden sm:flex items-center gap-1.5 text-[0.75rem] md:text-[1rem] lg:text-[1.1rem] text-slate-500 dark:text-slate-400 font-mono tracking-wide">                 
                 <span>{dateStr}</span>
                 <span className="text-slate-400">•</span>
                 <span>{timeStr}</span>
               </div>
             </div>
           </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
              title="View Notifications"
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" strokeWidth={1.7} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Optional: Show unread count badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {/* Profile Section */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
            title="Profile Settings"
          >
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:border-teal-300 transition-colors"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${user?.name}&background=008B8B&color=fff&size=32`;
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium text-sm border border-slate-200 dark:border-slate-700 group-hover:border-teal-300 transition-colors">
                {loading ? "..." : getInitials(user?.name)}
              </div>
            )}
            <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {loading ? "Loading..." : (user?.name?.split(' ')[0] || 'Admin')}
            </span>
          </button>
        </div>
      </header>

      {/* MODALS */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showNotifications && <NotificationModal onClose={() => setShowNotifications(false)} />}
    </>
  );
};

export default Navbar;