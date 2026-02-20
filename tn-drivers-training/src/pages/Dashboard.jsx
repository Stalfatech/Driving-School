
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, BarChart, Bar, LabelList
} from "recharts";
import { Users, UserCheck, GraduationCap, DollarSign, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState(null);

  const dummyData = {
    summary: { totalStudents: 1284, activeStudents: 342, instructors: 28, revenue: 85000 },
    financialHealth: [
      { month: "Jan", income: 12000, expenses: 4000 },
      { month: "Feb", income: 15000, expenses: 5500 },
      { month: "Mar", income: 18000, expenses: 6000 },
      { month: "Apr", income: 22000, expenses: 8000 },
      { month: "May", income: 25000, expenses: 7500 },
      { month: "Jun", income: 30000, expenses: 9000 },
    ],
    todaySessions: [
      { name: "Done", value: 14 },
      { name: "Plan", value: 22 },
      { name: "Lost", value: 3 },
    ],
    regionDistribution: [
      { region: "BURIN", students: 210 },
      { region: "Grand Falls", students: 180 },
      { region: "Marystown", students: 320 },
      { region: "St. John's", students: 250 },
    ],
    priorityAlert: { studentName: "Liam Murphy", location: "St. John's", isActive: true },
    recentLogins: [
      { id: 1, name: "Sarah Jenkins", initials: "SJ", status: "Active", phase: "Class 7 N", lastActive: "2m ago" },
      { id: 2, name: "Michael Kim", initials: "MK", status: "Active", phase: "Class 7 L", lastActive: "14m ago" },
      { id: 3, name: "Linda Wu", initials: "LW", status: "Pending", phase: "Enrollment", lastActive: "1h ago" },
    ],
  };

  useEffect(() => { setData(dummyData); }, []);
  if (!data) return null;

  const PIECOLORS = ["#22c55e", "#6366f1", "#ef4444"];

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 transition-colors font-sans">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">

        {/* ================= HEADER ================= */}
        <header className="text-center lg:text-left space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tight uppercase italic">
            School <span className="text-indigo-600">Overview</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">
            Real-time visibility into school health.
          </p>
        </header>

        {/* Priority Alert Banner */}
        {data.priorityAlert.isActive && (
          <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/20 p-4 rounded-4xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="bg-red-500 p-2.5 rounded-xl text-white shadow-lg animate-pulse">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">
                  Priority Alert
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {data.priorityAlert.studentName} ({data.priorityAlert.location})
                </p>
              </div>
            </div>
            <button className="w-full md:w-auto px-10 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
              Call Now
            </button>
          </div>
        )}

        {/* KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 justify-items-center">
          <KpiCard title="Students" value={data.summary.totalStudents} growth={12} icon={<Users />} />
          <KpiCard title="Active" value={data.summary.activeStudents} growth={5} icon={<UserCheck />} />
          <KpiCard title="Instructors" value={data.summary.instructors} icon={<GraduationCap />} />
          <KpiCard
            title="Revenue"
            value={`$${(data.summary.revenue / 1000).toFixed(1)}K`}
            growth={8}
            icon={<DollarSign />}
          />
        </div>

        {/* CHARTS */}
        <div className="space-y-6">

          {/* Financial Line Chart */}
          <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 text-center lg:text-left">
              Financial Health (Income/Exp)
            </h2>
            <div className="h-62.5 md:h-87.5 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.financialHealth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={4} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">


            {/* Pie Chart */}
<div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center">
  <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
    Today's Dispatch
  </h2>
  <div className="h-55 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie 
          data={data.todaySessions} 
          innerRadius={60} 
          outerRadius={85} 
          paddingAngle={8} 
          dataKey="value"
        >
          <Cell fill="#22c55e" /> {/* Done */}
          <Cell fill="#6366f1" /> {/* Plan */}
          <Cell fill="#ef4444" /> {/* Lost */}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
  
  {/* Legend Indicators */}
  <div className="flex gap-4 mt-4">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
      <span className="text-[10px] font-bold text-gray-500 uppercase">Done</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-[#6366f1]"></div>
      <span className="text-[10px] font-bold text-gray-500 uppercase">Plan</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
      <span className="text-[10px] font-bold text-gray-500 uppercase">Lost</span>
    </div>
  </div>
</div>

{/* bar chart */}

            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center">
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 text-center">
                    Market Reach
                  </h2>
                  <div className="h-55 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.regionDistribution} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="region" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          width={80} 
                  
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                        />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: 'none', 
                            borderRadius: '12px', 
                            color: '#fff',
                            fontSize: '12px' 
                          }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="students" fill="#6366f1" radius={[0, 10, 10, 0]}>
                          <LabelList 
                            dataKey="students" 
                            position="right" 
                            fill="#94a3b8" 
                            style={{ fontSize: '10px', fontWeight: 'bold' }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>





          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
              Recent Activity
            </h2>
            <Link
              to="/students"
              className="px-6 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
            >
              View All
            </Link>
          </div>

          <div className="w-full">
            <table className="w-full text-left">
              <thead className="hidden sm:table-header-group bg-gray-50/50 dark:bg-gray-800/30 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 sm:px-10 py-5">Student</th>
                  <th className="px-6 sm:px-10 py-5">GDL Status</th>
                  <th className="px-6 sm:px-10 py-5 text-right">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                {data.recentLogins.map((s) => (
                  <tr key={s.id} className="flex flex-col sm:table-row hover:bg-indigo-50/20 transition-colors p-6 sm:p-0">
                    <td className="sm:px-10 sm:py-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                        {s.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-white">
                          {s.name}
                        </span>
                        {/* Mobile Only Phase Label */}
                        <span className="sm:hidden px-2 py-0.5 mt-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-500 w-fit">
                          {s.phase}
                        </span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 sm:px-10 py-5">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        {s.phase}
                      </span>
                    </td>
                    <td className="sm:px-10 sm:py-5 sm:text-right text-gray-400 font-bold text-xs mt-2 sm:mt-0">
                      <span className="sm:hidden text-[9px] uppercase tracking-widest mr-2 text-gray-300">Last Sync:</span>
                      {s.lastActive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

const KpiCard = ({ title, value, growth, icon }) => (
  <div className="w-full bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col items-center text-center lg:items-start lg:text-left transition-all hover:translate-y-2 hover:shadow-2xl">
    <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-3xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 mb-8 shadow-inner">
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">
      {title}
    </p>
    <div className="flex flex-col lg:flex-row items-center lg:items-end gap-2">
      <h2 className="text-3xl md:text-5xl font-black text-gray-800 dark:text-white leading-none tracking-tighter">
        {value}
      </h2>
      {growth && (
        <span className="text-[10px] font-black bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl uppercase tracking-widest">
          +{growth}%
        </span>
      )}
    </div>
  </div>
);

export default Dashboard;