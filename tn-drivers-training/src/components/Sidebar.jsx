import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

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

  const handleLogout = () => {
    console.log("User logged out");
    navigate("/login");
    setIsOpen(false);
  };

  const menuItems = [
    { name: "Dashboard", icon: "dashboard", path: "/" },
    { name: "Applications", icon: "assignment", path: "/applications" },
    { name: "Students", icon: "group", path: "/students" },
    { name: "Instructors", icon: "badge", path: "/instructors" },
    { name: "fleet", icon: "directions_car", path: "/fleet" },
    { name: "Packages", icon: "inventory_2", path: "/packages" },
    { name: "Schedule", icon: "calendar_today", path: "/schedule" },
    // { name: "Attendance", icon: "fact_check", path: "/attendance" },
    // { name: "Tests", icon: "quiz", path: "/tests" },
    { name: "Payments", icon: "payments", path: "/payments" },
    { name: "Expenses", icon: "receipt_long", path: "/finances" },
  ];


  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          flex flex-col
          overflow-y-auto
          transition-transform duration-300 transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:relative md:flex
        `}
      >
        {/* LOGO */}
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 brand-gradient rounded-lg flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined">
              all_inclusive
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-navy dark:text-white leading-tight">
              Terra Nova
            </h2>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-teal">
              Drivers Training
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="px-3 space-y-1 pb-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `${
                  isActive
                    ? "active-nav text-white"
                    : "text-slate-500 dark:text-slate-400 hover:bg-teal/5"
                } flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all duration-300`
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
        <div className="px-3 pb-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
          {/* Appearance Toggle */}
          <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-teal/5 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-[20px] text-slate-500 dark:text-cyan">
                {darkMode ? "dark_mode" : "light_mode"}
              </span>
              <span className="text-[14px] text-slate-500 dark:text-slate-400">
                Appearance
              </span>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                darkMode ? "bg-teal" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  darkMode ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {/* SETTINGS - Updated to use NavLink */}
          <NavLink 
            to="/settings"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `${
                isActive
                  ? "active-nav text-white shadow-lg"
                  : "text-slate-500 dark:text-slate-400 hover:bg-teal/5"
              } flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-300`
            }
          >
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
            <span className="text-[14px]">Settings</span>
          </NavLink>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center space-x-3 px-4 py-2 rounded-lg
                       bg-red-100 dark:bg-red-900/30
                       text-red-600 dark:text-red-400
                       hover:bg-red-200 dark:hover:bg-red-900/50
                       transition-all duration-300 font-semibold"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
            <span className="text-[14px]">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;