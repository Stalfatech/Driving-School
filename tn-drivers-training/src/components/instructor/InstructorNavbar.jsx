import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Home, Menu, X, Clock } from "lucide-react";

const InstructorNavbar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

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

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
      
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        {/* MOBILE TOGGLE BUTTON: Fixed z-index and explicit click handler */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="lg:hidden p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:text-[#008B8B] transition-all active:scale-90"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Home size={16} className="text-[#008B8B] shrink-0" />
            <h1 className="text-base md:text-lg font-black uppercase italic text-slate-800 dark:text-white tracking-tight leading-none">
              {pageTitle}
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 mt-1">
            <Clock size={10} className="text-slate-400" />
            <p className="text-[9px] uppercase tracking-[0.1em] text-slate-400 font-black">
              {dateStr} • {timeStr}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl text-slate-400 hover:text-[#008B8B] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0f172a] group-hover:animate-ping"></span>
        </button>

        {/* Profile Info */}
        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden md:block leading-tight">
            <p className="text-xs font-black text-slate-800 dark:text-white">Marc-André</p>
            <p className="text-[9px] text-[#008B8B] font-black uppercase tracking-widest">Burin Branch</p>
          </div>
          <div className="relative group cursor-pointer">
            <img
              src="https://i.pravatar.cc/150?u=instructor1"
              alt="profile"
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl object-cover border-2 border-slate-100 dark:border-slate-700 shadow-sm group-hover:border-[#008B8B] transition-all"
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0f172a] rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default InstructorNavbar;