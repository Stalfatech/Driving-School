import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, CalendarDays, ReceiptText, BellDot, LogOut } from "lucide-react";

const InstructorSidebar = () => {
  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20}/>, path: "/instructor" },
    { name: "My Students", icon: <Users size={20}/>, path: "/instructor/students" },
    { name: "My Schedule", icon: <CalendarDays size={20}/>, path: "/instructor/schedule" },
    { name: "My Expenses", icon: <ReceiptText size={20}/>, path: "/instructor/expenses" },
    { name: "Notifications", icon: <BellDot size={20}/>, path: "/instructor/notifications" },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 h-screen flex flex-col p-6 sticky top-0">
      <div className="mb-12 px-2 flex items-center gap-3">
        <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
           <span className="font-black italic">TN</span>
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">Terra Nova</h2>
          <p className="text-[9px] font-bold text-teal-500 uppercase tracking-widest leading-none">Field Operations</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all
              ${isActive 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-x-2" 
                : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600"}
            `}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <button className="flex items-center gap-3 px-4 py-3.5 text-rose-500 font-bold text-sm hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 mt-auto">
        <LogOut size={20} />
        Logout System
      </button>
    </aside>
  );
};

export default InstructorSidebar;