import React from "react";
import { 
  Users, ClipboardCheck, Award, Clock, MapPin, 
  ChevronRight, Activity, AlertCircle, Calendar, ShieldCheck
} from "lucide-react";

// REMOVED: InstructorNavbar import to fix the "double navbar" issue

const InstructorDashboard = () => {
  const instructorLocation = "Burin"; 

  return (
    // REMOVED: flex-1 and min-h-screen here as they are now handled by the Layout
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. DASHBOARD HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic leading-none">
          Instructor <span className="text-[#008B8B]">Hub</span>
        </h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
          Terra Nova Training Systems • <span className="text-[#008B8B] font-bold">{instructorLocation} Branch</span>
        </p>
      </div>

      {/* 2. METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard title="Total Students" value="18" icon={<Users />} color="teal" sub={`${instructorLocation} Area`} />
        <MetricCard title="Tests Logged" value="42" icon={<ClipboardCheck />} color="indigo" sub="Monthly Total" />
        <MetricCard title="Pass Rate" value="94%" icon={<Award />} color="emerald" sub="Above Average" />
        <MetricCard title="Hours" value="156" icon={<Activity />} color="orange" sub="Behind the wheel" />
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        
        <div className="lg:col-span-2 space-y-6">
          {/* ADMIN DIRECTIVE BLOCK */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-500" /> Admin Assignment: This Week
            </h2>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start relative z-10">
              <div className="bg-indigo-600 text-white p-6 rounded-[2rem] w-full md:w-56 text-center shadow-2xl hover:scale-105 transition-transform duration-500">
                <p className="text-[10px] font-black uppercase opacity-60 mb-2 text-indigo-100">Primary Region</p>
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4">{instructorLocation}</h3>
                <div className="h-px bg-white/20 my-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Feb 20 - Feb 27</p>
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Priority Tasking</span>
                  <h4 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">Winter Road Prep & Parallel Parking</h4>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Prioritize the 4 new registrations from <span className="text-indigo-500 font-bold">{instructorLocation}</span>. 
                  Fleet vehicle <span className="underline decoration-indigo-500 underline-offset-4">V-882</span> is ready for your block.
                </p>
              </div>
            </div>
            <Clock className="absolute -right-8 -bottom-8 size-48 text-indigo-50 dark:text-slate-800/10 opacity-50 group-hover:rotate-12 transition-transform duration-1000" />
          </div>

          {/* SCHEDULE CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[#008B8B]" />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Today's Agenda: {instructorLocation}</h2>
              </div>
              <button className="text-[10px] font-black text-[#008B8B] uppercase tracking-widest hover:underline transition-all active:scale-95">Full Weekly Schedule</button>
            </div>
            <div className="p-4 md:p-6 space-y-3">
              <ScheduleRow time="10:00 AM" student="Sam Chen" task="Highway Merging" status="Upcoming" location={instructorLocation} />
              <ScheduleRow time="01:30 PM" student="Yuki Tanaka" task="Mock Road Test" status="High Priority" location={instructorLocation} />
              <ScheduleRow time="03:45 PM" student="Alex Rivera" task="City Traffic" status="Upcoming" location={instructorLocation} />
            </div>
          </div>
        </div>

        {/* SIDEBAR ALERTS */}
        <div className="space-y-6">
          <div className="bg-rose-500 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group hover:shadow-rose-500/20 transition-all active:scale-[0.98] cursor-pointer">
            <AlertCircle className="absolute -right-4 -top-4 size-32 opacity-10 group-hover:rotate-12 transition-transform duration-500" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Priority Action Required</p>
            <h3 className="text-xl font-black italic uppercase leading-tight mb-4">{instructorLocation} Alert</h3>
            <p className="text-xs font-bold opacity-90 leading-relaxed mb-8 italic">
              "A new student has registered in your {instructorLocation} branch. Immediate contact required."
            </p>
            <button className="w-full py-4 bg-white text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl">
              Claim Student Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const MetricCard = ({ title, value, icon, color, sub }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className={`size-12 rounded-2xl flex items-center justify-center bg-${color}-500/10 text-${color}-600 mb-5 group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon, { size: 22 })}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-none mb-2 tracking-tighter">{value}</h3>
    <p className="text-[9px] font-bold text-slate-400 italic uppercase tracking-tighter">{sub}</p>
  </div>
);

const ScheduleRow = ({ time, student, task, status, location }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-transparent hover:border-[#008B8B]/30 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group gap-4">
    <div className="flex items-center gap-6">
      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 w-16 uppercase">{time}</span>
      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#008B8B] transition-colors">{student}</p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic">{task} • <span className="text-[#008B8B] font-bold">{location}</span></p>
      </div>
    </div>
    <span className={`text-[8px] self-start sm:self-center font-black uppercase px-3 py-1.5 rounded-full ${status === 'High Priority' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}>
      {status}
    </span>
  </div>
);

export default InstructorDashboard;