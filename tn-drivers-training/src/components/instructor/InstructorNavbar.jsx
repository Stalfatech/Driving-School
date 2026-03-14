
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Home, Menu, X, Clock } from "lucide-react";
import ProfileModal from "../ProfileModal";

const InstructorNavbar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Format dynamic title based on path
  const pageTitle = location.pathname === "/instructor" 
    ? "Dashboard" 
    : location.pathname.split("/").pop().replace(/-/g, " ");

  const dateStr = currentTime.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const timeStr = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "IN";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        
        {/* LEFT SECTION */}
        <div className="flex items-center gap-4">
          {/* MOBILE TOGGLE BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="lg:hidden p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:text-teal transition-all active:scale-90"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Home size={16} className="text-teal shrink-0" />
              <h1 className="text-base md:text-lg font-black uppercase italic text-slate-800 dark:text-white tracking-tight leading-none">
                {pageTitle}
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 mt-1">
              <Clock size={10} className="text-slate-400" />
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black">
                {dateStr} • {timeStr}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - Removed notification bell */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Profile Info - Clickable to open profile modal */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 pr-3 py-1.5 rounded-2xl transition-all group"
          >
            <div className="text-right hidden md:block leading-tight">
              <p className="text-xs font-black text-slate-800 dark:text-white">
                {user?.name || "Instructor"}
              </p>
              <p className="text-[9px] text-teal font-black uppercase tracking-widest">
                Burin Branch
              </p>
            </div>
            <div className="relative group cursor-pointer">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt="profile"
                  className="w-9 h-9 md:w-10 md:h-10 rounded-xl object-cover border-2 border-slate-100 dark:border-slate-700 shadow-sm group-hover:border-teal transition-all"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=008B8B&color=fff`;
                  }}
                />
              ) : (
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-linear-to-br from-teal to-teal-600 flex items-center justify-center text-white font-black text-sm border-2 border-slate-100 dark:border-slate-700 shadow-sm group-hover:border-teal transition-all">
                  {getInitials(user?.name)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-background-dark rounded-full"></div>
            </div>
          </button>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default InstructorNavbar;