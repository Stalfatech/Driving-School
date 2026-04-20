

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProfileModal from "../ProfileModal";
import {  Home, Clock } from "lucide-react";

const InstructorNavbar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Simulate unread count for instructor (you can replace with API call)
  useEffect(() => {
    // Fetch unread notifications count from API
    // For now using mock data
    setUnreadCount(3);
  }, []);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get page title without "instructor/" prefix
  const getPageTitle = () => {
    const path = location.pathname;
    const cleanPath = path.replace(/^\/instructor/, "");
    
    if (cleanPath === "" || cleanPath === "/") return "Dashboard";
    
    return cleanPath
      .replace(/^\//, "")
      .replace(/-/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const pageTitle = getPageTitle();

  const dateStr = currentTime.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "IN";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <header className="relative flex items-center justify-between px-4 md:px-6 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
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
                <Clock size={12} className="text-slate-400" />
                <span>{dateStr}</span>
                <span className="text-slate-400">•</span>
                <span>{timeStr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2 sm:gap-3">
         

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
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:border-teal-300 transition-colors"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${user?.name || 'Instructor'}&background=008B8B&color=fff&rounded=true&size=32`;
                }}
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs border border-slate-200 dark:border-slate-700 group-hover:border-teal-300 transition-colors">
                {getInitials(user?.name)}
              </div>
            )}
            <span className="text-[0.7rem] sm:text-[0.75rem] font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {user?.name?.split(' ')[0] || "Instructor"}
            </span>
          </button>
        </div>
      </header>

      {/* PROFILE MODAL */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default InstructorNavbar;