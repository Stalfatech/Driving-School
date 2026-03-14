import React, { useState, useEffect } from "react";
import { useLocation , Link} from "react-router-dom";
import ProfileModal from "./ProfileModal";
import NotificationModal from "./NotificationModal";
import { Bell, Home, User as UserIcon } from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

const Navbar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null); // Add user state
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
      : location.pathname.replace("/", "").replace("-", " ");

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
      <header className="relative flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-md">

        {/* LEFT SECTION */}
        <div className="flex items-center space-x-3 md:space-x-6">
          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-teal/10 transition-all duration-300"
          >
            <span className="material-symbols-outlined text-navy dark:text-white">
              {isOpen ? "close" : "menu"}
            </span>
          </button>

          {/* BRAND / PAGE TITLE */}
          <div className="flex items-center space-x-1 md:space-x-2">
            <Home className="w-5 h-5 md:w-6 md:h-6 text-teal-500" />
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold capitalize tracking-tight text-navy dark:text-white truncate max-w-37.5 sm:max-w-50 md:max-w-75">
              {pageTitle}
            </h1>
          </div>
          
          {/* Current Date & Time */}
          <div className="hidden sm:block text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-300 ml-4">
            {dateStr}, {timeStr}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 sm:p-3 md:p-3 rounded-full hover:bg-teal/10 transition-all duration-300 shadow-sm"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 text-slate-600 dark:text-slate-300" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Profile Section */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 md:p-2 rounded-full hover:bg-teal/10 transition-all duration-300 shadow-sm"
          >
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="profile"
                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-teal-400"
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm border-2 border-teal-400">
                {getInitials(user?.name)}
              </div>
            )}
            <span className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 truncate max-w-15 sm:max-w-25 md:max-w-30">
              {loading ? "..." : (user?.name || 'Admin')}
            </span>
          </button>
        </div>
      </header>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showNotifications && (
        <NotificationModal onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
};

export default Navbar;