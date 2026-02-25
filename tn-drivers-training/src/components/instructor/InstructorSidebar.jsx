import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, CalendarDays, 
  ReceiptIndianRupee, Bell, LogOut, Sun, Moon, 
  ChevronLeft, Command
} from "lucide-react";

const InstructorSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    navigate("/login");
    setIsOpen(false);
  };

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/instructor" },
    { name: "My Students", icon: <Users size={20} />, path: "/instructor/students" },
    { name: "Schedule", icon: <CalendarDays size={20} />, path: "/instructor/schedule" },
    { name: "My Expenses", icon: <ReceiptIndianRupee size={20} />, path: "/instructor/expenses" },
    { name: "Notifications", icon: <Bell size={20} />, path: "/instructor/notifications" },
  ];

  return (
    <>
      {/* 1. MOBILE OVERLAY (Backdrop) */}
      <div
        className={`
          fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden 
          transition-opacity duration-300
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
        onClick={() => setIsOpen(false)}
      />

      {/* 2. SIDEBAR CONTAINER */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-[70] w-72 
          bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800
          flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:h-screen
        `}
      >
        {/* LOGO SECTION & MOBILE CLOSE BUTTON */}
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#008B8B] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#008B8B]/20">
              <Command size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-slate-800 dark:text-white uppercase italic leading-none">
                Terra <span className="text-[#008B8B]">Nova</span>
              </h2>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mt-1">
                Instructor
              </p>
            </div>
          </div>
          
          {/* Only visible on mobile to close the drawer */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="px-4 space-y-1.5 flex-1 overflow-y-auto mt-4 scrollbar-hide">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/instructor"}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 group
                ${isActive
                    ? "bg-[#008B8B] text-white shadow-xl shadow-[#008B8B]/20"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              <span className="shrink-0 transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              <span className="text-[13px] uppercase tracking-wider italic">
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* BOTTOM UTILITY SECTION */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          
          {/* THEME TOGGLE CARD */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] p-2 flex items-center justify-between">
            <button
              onClick={() => setDarkMode(false)}
              className={`flex-1 flex items-center justify-center py-2 rounded-xl transition-all ${!darkMode ? "bg-white text-orange-500 shadow-sm" : "text-slate-400"}`}
            >
              <Sun size={16} />
            </button>
            <button
              onClick={() => setDarkMode(true)}
              className={`flex-1 flex items-center justify-center py-2 rounded-xl transition-all ${darkMode ? "bg-[#1e293b] text-indigo-400 shadow-sm" : "text-slate-400"}`}
            >
              <Moon size={16} />
            </button>
          </div>

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
          >
            <LogOut size={16} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default InstructorSidebar;