import React from "react";
import { Users, ClipboardCheck, Award, Clock, MapPin, ChevronRight, Activity,AlertCircle } from "lucide-react";
import InstructorNavbar from "../../components/instructor/InstructorNavbar";

const InstructorDashboard = () => {
  return (
    <div className="flex-1 bg-slate-50 dark:bg-gray-950 min-h-screen">
      <InstructorNavbar pageTitle="Dashboard" />
      
      <main className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
        
        {/* 1. METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Active Students" value="18" icon={<Users />} color="teal" sub="Across 2 Branches" />
          <MetricCard title="Tests Logged" value="42" icon={<ClipboardCheck />} color="indigo" sub="This Month" />
          <MetricCard title="Success Rate" value="92%" icon={<Award />} color="emerald" sub="Upper Quartile" />
          <MetricCard title="Hours Logged" value="156" icon={<Activity />} color="orange" sub="Monthly Total" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* 2. ADMIN DIRECTIVE (Weekly Work Block) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Admin Assignment: This Week</h2>
              <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                <div className="bg-indigo-600 text-white p-6 rounded-4xl w-full md:w-56 text-center shadow-2xl">
                  <p className="text-[10px] font-black uppercase opacity-60 mb-2">Location Focus</p>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4">Burin Peninsula</h3>
                  <div className="h-px bg-white/20 my-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Feb 20 - Feb 27</p>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Main Tasking</span>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">City Traffic & Parallel Parking Evaluations</h4>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Please prioritize the 4 new registrations from Marystown. Fleet vehicle V-882 is assigned for your use during this block.</p>
                </div>
              </div>
              <Clock className="absolute -right-8 -bottom-8 size-48 text-indigo-50 dark:text-slate-800 opacity-50" />
            </div>

            {/* UPCOMING AGENDA */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
               <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                 <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Today's Schedule</h2>
                 <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Full Agenda</button>
               </div>
               <div className="p-4 space-y-3">
                 <ScheduleRow time="10:00 AM" student="Sam Chen" task="Highway Merging" status="Upcoming" />
                 <ScheduleRow time="01:30 PM" student="Yuki Tanaka" task="Mock Road Test" status="High Priority" />
               </div>
            </div>
          </div>

          {/* 3. SIDEBAR ALERTS (Urgent/Marystown) */}
          <div className="space-y-6">
            <div className="bg-rose-500 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
               <AlertCircle className="absolute -right-4 -top-4 size-32 opacity-10 group-hover:rotate-12 transition-transform duration-500" />
               <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Priority Action Required</p>
               <h3 className="text-xl font-black italic uppercase leading-tight mb-4">Marystown Registration Alert</h3>
               <p className="text-xs font-bold opacity-90 leading-relaxed mb-6">A new student has registered in your Marystown branch. Immediate contact required to confirm pickup location.</p>
               <button className="w-full py-4 bg-white text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">Claim Student Now</button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// Helper Components
const MetricCard = ({ title, value, icon, color, sub }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl hover:translate-y-[-4px] transition-all">
    <div className={`size-12 rounded-2xl flex items-center justify-center bg-${color}-500/10 text-${color}-600 mb-5`}>
      {React.cloneElement(icon, { size: 22 })}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-none mb-2">{value}</h3>
    <p className="text-[9px] font-bold text-slate-400 italic uppercase tracking-tighter">{sub}</p>
  </div>
);

const ScheduleRow = ({ time, student, task, status }) => (
  <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-transparent hover:border-teal-500/20 transition-all cursor-pointer group">
    <div className="flex items-center gap-6">
      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 w-16 uppercase">{time}</span>
      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-white">{student}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">{task}</p>
      </div>
    </div>
    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded ${status === 'High Priority' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-700'}`}>
      {status}
    </span>
  </div>
);

export default InstructorDashboard;