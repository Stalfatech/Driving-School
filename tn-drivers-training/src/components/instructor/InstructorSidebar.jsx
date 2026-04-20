






import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/instructor";

const InstructorSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Theme Sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Call logout API
      await axios.post(`http://localhost:8000/api/logout`, {}, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Redirect to login
      navigate("/login");
      
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API fails, clear local storage and redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      navigate("/login");
    } finally {
      setLoggingOut(false);
      setIsOpen(false);
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: "⊞", path: "/instructor", section: "Main" },
    { name: "My Students", icon: "👤", path: "/instructor/students", section: "Main" },
    { name: "Schedule", icon: "📅", path: "/instructor/schedule", section: "Main" },
    { name: "My Expenses", icon: "🧾", path: "/instructor/expenses", section: "Finance" },
    { name: "Notifications", icon: "🔔", path: "/instructor/notifications", section: "System" },
  ];

  // Group menu items by section
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR - White background, clean design */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-[220px] bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          flex flex-col
          overflow-y-auto
          transition-transform duration-300 transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:relative md:flex
          shadow-[3px_0_16px_rgba(0,0,0,0.08)]
        `}
      >
        {/* HEADER with logo */}
        <div className="border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="w-54.5 h-15 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-white dark:bg-white shadow-md">
            <img 
              src="/logo.webp" 
              alt="Terra Nova Logo" 
              className="w-70 h-20 object-contain p-1"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://ui-avatars.com/api/?name=TN&background=008B8B&color=fff&size=40";
              }}
            />
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:rotate-90 mr-3"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION with sections */}
        <nav className="flex-1 overflow-y-auto px-2">
          {Object.entries(groupedItems).map(([section, items]) => (
            <div key={section}>
              <div className="text-[0.90rem] font-soro font-semibold tracking-[0.20rem] uppercase text-slate-400 dark:text-slate-500 px-3 pt-4 pb-1.5">
                {section}
              </div>
              {items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/instructor"}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 my-0.5 rounded-md font-medium text-[1rem] transition-all duration-200
                    ${isActive 
                      ? "bg-teal-500 text-white shadow-sm font-semibold" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400 hover:pl-4"
                    }`
                  }
                >
                  <span className="text-[0.82rem] w-4 text-center flex-shrink-0">
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap">{item.name}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* BOTTOM SECTION */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 pb-4 px-2">
          {/* Appearance Toggle */}
          <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors group">
            <div className="flex items-center gap-2.5">
              <span className="text-[1rem] text-slate-500 dark:text-slate-400">
                {darkMode ? "🌙" : "☀️"}
              </span>
              <span className="text-[1rem] font-medium text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                Appearance
              </span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all duration-300 ${
                darkMode ? "bg-teal-500" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${
                  darkMode ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
      
          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-md
                       bg-red-50 dark:bg-red-900/20
                       text-red-600 dark:text-red-400
                       hover:bg-red-100 dark:hover:bg-red-900/40
                       transition-all duration-200 font-medium text-[0.78rem]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-[1rem] w-4 text-center">
              {loggingOut ? "⏳" : "↪"}
            </span>
            <span className="text-xs md:text-lg">{loggingOut ? "Logging out..." : "LogOut"}</span>
            {loggingOut && (
              <div className="ml-auto w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default InstructorSidebar;