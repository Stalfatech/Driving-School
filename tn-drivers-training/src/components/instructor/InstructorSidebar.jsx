
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

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
    { name: "Dashboard", icon: "dashboard", path: "/instructor" },
    { name: "My Students", icon: "group", path: "/instructor/students" },
    { name: "Schedule", icon: "calendar_today", path: "/instructor/schedule" },
    { name: "My Expenses", icon: "receipt_long", path: "/instructor/expenses" },
    { name: "Notifications", icon: "notifications", path: "/instructor/notifications" },
  ];

  return (
    <>
      {/* MOBILE OVERLAY: Only shows when sidebar is open on md/sm screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[50] w-64 bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:h-screen sticky top-0
        `}
      >
        {/* LOGO SECTION */}
        <div className="p-6 flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined">all_inclusive</span>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white leading-tight italic">
              Terra Nova
            </h2>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-teal-500">
              Instructor Portal
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="px-3 space-y-1 pb-4 flex-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/instructor"}
              onClick={() => setIsOpen(false)} // Auto-close on mobile after click
              className={({ isActive }) =>
                `${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                    : "text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800"
                } flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200`
              }
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              <span className="text-[14px]">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* BOTTOM SECTION */}
        <div className="px-3 pb-6 border-t border-slate-100 dark:border-slate-800 shrink-0 pt-4">
          <div className="flex items-center justify-between px-4 py-2 mb-2">
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-[20px] text-slate-400 dark:text-indigo-400">
                {darkMode ? "dark_mode" : "light_mode"}
              </span>
              <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Dark Mode</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-5 flex items-center rounded-full p-1 transition-all duration-300 ${
                darkMode ? "bg-indigo-600" : "bg-slate-300"
              }`}
            >
              <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform duration-300 ${darkMode ? "translate-x-5" : ""}`} />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all font-bold text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default InstructorSidebar;