import React, { useState } from "react";
import { Bell, User, Settings, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const InstructorNavbar = ({ pageTitle }) => {
  const [showBell, setShowBell] = useState(false);

  const quickNotifications = [
    { id: 1, type: "assignment", text: "New Student: Alex Rivera assigned to you", time: "2m ago", priority: "high" },
    { id: 2, type: "schedule", text: "Admin updated your weekly work block", time: "1h ago", priority: "normal" },
    { id: 3, type: "system", text: "Urgent: Marystown Branch registration", time: "3h ago", priority: "high" },
    { id: 4, type: "finance", text: "Expense #902 Approved by Admin", time: "5h ago", priority: "normal" },
    { id: 5, type: "test", text: "Yuki Tanaka ready for Mock Test", time: "1d ago", priority: "normal" },
  ];

  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-50">
      <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase italic tracking-tight">
        {pageTitle} <span className="text-teal-500">Hub</span>
      </h1>

      <div className="flex items-center gap-4">
        {/* BELL NOTIFICATION SYSTEM */}
        <div className="relative">
          <button 
            onClick={() => setShowBell(!showBell)}
            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl relative hover:scale-105 transition-all active:scale-95"
          >
            <Bell size={20} className="text-slate-600 dark:text-slate-300" />
            <span className="absolute top-2.5 right-2.5 size-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          {showBell && (
            <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Activity</span>
                <Link to="/instructor/notifications" onClick={() => setShowBell(false)} className="text-[9px] font-black text-indigo-600 uppercase hover:underline">View All</Link>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {quickNotifications.map(n => (
                  <div key={n.id} className="p-4 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="flex gap-3">
                      <div className={`mt-1 size-2 rounded-full shrink-0 ${n.priority === 'high' ? 'bg-rose-500 animate-pulse' : 'bg-teal-500'}`} />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors leading-tight">{n.text}</p>
                        <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-2" />
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-800 dark:text-white leading-none mb-1 uppercase tracking-tighter italic">Instructor ID</p>
            <p className="text-[9px] font-bold text-teal-500 uppercase tracking-widest leading-none">INST-8829-NL</p>
          </div>
          <div className="size-11 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-teal-500/20 italic">
            NS
          </div>
        </div>
      </div>
    </header>
  );
};

export default InstructorNavbar;