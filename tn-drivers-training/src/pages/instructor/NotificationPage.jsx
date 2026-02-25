import React from "react";
import { Bell, Info, AlertTriangle, CheckCircle, Mail } from "lucide-react";

export default function NotificationPage() {
  const logs = [
    { id: 1, type: "PRIORITY", msg: "Urgent: New Marystown Lead assigned. Action needed within 2 hours.", date: "Feb 23, 2026", time: "10:15 AM" },
    { id: 2, type: "SCHEDULE", msg: "Admin has modified your work block for the week of March 1st.", date: "Feb 22, 2026", time: "04:30 PM" },
    { id: 3, type: "FINANCE", msg: "Fuel expense (ID: 9021) for Vehicle V-102 has been approved.", date: "Feb 21, 2026", time: "09:00 AM" },
  ];

  return (
    <div className="flex-1 bg-slate-50 dark:bg-gray-950 min-h-screen">
      
      <main className="p-8 max-w-5xl mx-auto space-y-6">
        <header>
          <h2 className="text-3xl font-black italic uppercase text-slate-800 dark:text-white">History <span className="text-indigo-600">& Alerts</span></h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Audit trail of system communications</p>
        </header>

        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-6 group hover:border-indigo-500/30 transition-all">
              <div className={`p-4 rounded-2xl shrink-0 ${log.type === 'PRIORITY' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                {log.type === 'PRIORITY' ? <AlertTriangle size={24}/> : <Info size={24}/>}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{log.type} ALERT</span>
                   <span className="text-[9px] font-black text-slate-300 uppercase">{log.date} • {log.time}</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{log.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}