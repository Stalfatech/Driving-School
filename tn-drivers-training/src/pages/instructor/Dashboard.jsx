
//08/04

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, ClipboardCheck, CheckCircle, Clock, MapPin,
  ChevronRight, Calendar, Car, Loader2, AlertCircle,
  Star, Bell, DollarSign, TrendingUp, Sparkles,
  ShieldCheck, Zap, Award, BookOpen, Target, Activity,
  BarChart3, PieChart, CalendarDays, UserCheck, GraduationCap,
  ArrowUpRight
} from "lucide-react";
import axios from "axios";

// ================= API CONFIG =================
const API_URL = "http://localhost:8000/api";

// ================= STYLES =================
const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: 'none',
  borderRadius: '12px',
  fontSize: '13px',
  color: '#ffffff',
  padding: '8px 12px',
  boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
};

// ================= KPI CARD =================
const MetricCard = ({ title, value, icon, colorClass, sub, growth }) => {
  const isPositiveGrowth = growth && growth > 0;
  
  return (
    <div className="group relative overflow-hidden bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-transparent to-emerald-50 dark:from-teal-900/20 dark:via-transparent dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute -inset-1 bg-gradient-to-r from-teal-200/30 to-emerald-200/30 dark:from-teal-500/10 dark:to-emerald-500/10 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${colorClass} shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
              {React.cloneElement(icon, { size: 18, strokeWidth: 1.8 })}
            </div>
          </div>
          {growth !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[0.55rem] sm:text-xs font-bold font-mono transition-all duration-300 group-hover:scale-105 ${
              isPositiveGrowth 
                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
            }`}>
              {isPositiveGrowth ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
              {isPositiveGrowth ? '+' : ''}{growth}%
            </div>
          )}
        </div>
        
        <p className="text-[0.6rem] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {title}
        </p>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-emerald-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
          {value}
        </h3>
        {sub && (
          <p className="text-[0.55rem] sm:text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors">
            {sub}
          </p>
        )}
      </div>
      
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles size={10} className="text-teal-400/60" />
      </div>
    </div>
  );
};

// ================= SCHEDULE ROW =================
const ScheduleRow = ({ time, student, task, status, location }) => (
  <div className="group relative overflow-hidden p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 xs:gap-3">
      <div className="flex items-start xs:items-center gap-3">
        <div className="relative">
          <span className="relative text-[10px] sm:text-xs md:text-md font-mono font-bold text-teal-600 dark:text-teal-400 shrink-0 w-[88px] sm:w-24 pt-0.5 xs:pt-0 group-hover:scale-[1.2] transition-colors">
            {time}
          </span>
        </div>
        <div className="hidden xs:block h-7 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs sm:text-sm lg:text-md font-semibold text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
            {student}
          </p>
          <p className="text-[10px] sm:text-xs md:text-md font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {task} • <span className="text-teal-500 font-semibold group-hover:text-teal-600 transition-colors">{location}</span>
          </p>
        </div>
      </div>
      <span className={`self-start xs:self-center shrink-0 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-1 rounded-full transition-all duration-300 group-hover:scale-105 ${
        status === "Completed"
          ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
          : status === "High Priority"
          ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 group-hover:border-teal-300"
      }`}>
        {status}
      </span>
    </div>
  </div>
);

// ================= CHART CARD =================
const ChartCard = ({ title, icon, children }) => {
  return (
    <div className="group relative overflow-hidden bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-transparent to-emerald-50/30 dark:from-teal-900/10 dark:via-transparent dark:to-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="p-1 sm:p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/30 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50 transition-all duration-300 group-hover:scale-110">
            {React.cloneElement(icon, { size: 12, className: "text-teal-600 group-hover:text-teal-500 transition-colors" })}
          </div>
          <h2 className="text-[0.65rem] sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
};

// ================= MAIN DASHBOARD =================
const InstructorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    instructor: { name: '', location: '' },
    metrics: { total_students: 0, tests_logged: 0, pass_rate: 0, completed_students: 0 },
    today_sessions: [],
    upcoming_sessions: [],
    recent_students: [],
    assigned_car: null
  });

  const token = localStorage.getItem('access_token');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/instructor/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={40} />
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ================= ERROR STATE =================
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center px-4">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
          <p className="text-sm font-medium text-red-600 mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="px-6 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-all">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { instructor, metrics, today_sessions, upcoming_sessions, recent_students, assigned_car } = dashboardData;

  // Map API pass_rate to completion_rate for display
  const completionRate = metrics.pass_rate;

  return (
    <div className="w-full min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors overflow-x-hidden">
      <div className="mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        
        {/* ================= HEADER ================= */}
        <header className="rounded-2xl bg-gradient-to-r from-teal-600/10 via-emerald-600/5 to-teal-600/10 dark:from-teal-500/5 dark:via-emerald-500/5 p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-2">
              <ShieldCheck className="text-teal-500 transition-all duration-300 hover:scale-110 hover:rotate-12" size={24} />
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                <span className="text-slate-800 dark:text-white">Welcome back, </span>
                <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">{instructor.name}</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm md:text-base font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-center lg:justify-start gap-2">
              <Zap size={12} className="text-teal-500 transition-all duration-300 hover:scale-110" />
              Terra Nova Training Systems • <span className="text-teal-600 font-semibold">{instructor.location}</span>
            </p>
          </div>
        </header>

        {/* ================= KPI GRID ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <MetricCard 
            title="Total Students" 
            value={metrics.total_students} 
            icon={<Users />} 
            colorClass="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
            sub="Active Students"
            // growth omitted (API doesn't provide)
          />
          <MetricCard 
            title="Tests Logged" 
            value={metrics.tests_logged} 
            icon={<ClipboardCheck />} 
            colorClass="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
            sub="All Time"
          />
          <MetricCard 
            title="Progres Rate" 
            value={`${completionRate}%`} 
            icon={<Award />} 
            colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
            sub={completionRate >= 80 ? "Excellent Progress" : "Keep Improving"}
          />
          <MetricCard 
    title="Completed Students" 
    value={metrics.completed_students} 
    icon={<Award />} 
    colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
    sub="Reached 100% progress"
/>
        </div>

        {/* ================= ASSIGNED CAR SECTION ================= */}
        {assigned_car && (
          <div className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-slate-600 rounded-2xl p-4 sm:p-5 shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Car size={20} className="text-white" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wider mb-0.5">Assigned Vehicle</p>
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">
                    {assigned_car.car_name} • {assigned_car.number_plate}
                  </h3>
                  <p className="text-xs md:text-md lg:text-lg font-medium text-white/80 mt-0.5">Odometer: {assigned_car.odometer.toLocaleString()} KM</p>
                </div>
              </div>
              <Link
                to="/instructor/expenses"
                className="shrink-0 px-3 sm:px-4 py-2 bg-white text-teal-600 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg group-hover:bg-slate-50"
              >
                View Details
              </Link>
            </div>
          </div>
        )}

        {/* ================= MAIN CONTENT GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* LEFT COLUMN - Sessions */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            
            {/* Today's Agenda */}
            <ChartCard title="Today's Agenda" icon={<CalendarDays />}>
              <div className="space-y-2">
                {today_sessions.length > 0 ? (
                  today_sessions.map((s, i) => (
                    <ScheduleRow 
                      key={i} 
                      time={`${s.start_time} – ${s.end_time}`} 
                      student={s.student_name} 
                      task={s.task} 
                      status={s.status} 
                      location={s.location} 
                    />
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <Clock size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-xs sm:text-sm text-slate-500">No sessions today</p>
                  </div>
                )}
              </div>
            </ChartCard>

            {/* Upcoming Sessions */}
            <ChartCard title="Upcoming Sessions" icon={<Calendar />}>
              <div className="space-y-2">
                {upcoming_sessions.length > 0 ? (
                  upcoming_sessions.map((s, i) => (
                    <ScheduleRow 
                      key={i} 
                      time={`${s.date} • ${s.start_time}`} 
                      student={s.student_name} 
                      task={s.task} 
                      status="Scheduled" 
                      location={s.location} 
                    />
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <Calendar size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-xs sm:text-sm text-slate-500">No upcoming sessions</p>
                  </div>
                )}
              </div>
            </ChartCard>
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="space-y-4 sm:space-y-6">

            {/* Recent Students */}
            <ChartCard title="Recent Students" icon={<Users />}>
              <div className="space-y-1">
                {recent_students.length > 0 ? (
                  recent_students.map((student, i) => (
                    <div key={i} className="group/student relative overflow-hidden p-2.5 sm:p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-300 cursor-pointer hover:scale-[1.02]">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl blur-md opacity-0 group-hover/student:opacity-50 transition-opacity duration-300"></div>
                            <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs sm:text-sm group-hover/student:scale-110 transition-transform duration-300">
                              {student.name.charAt(0)}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white truncate group-hover/student:text-teal-600 dark:group-hover/student:text-teal-400 transition-colors">
                              {student.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-12 sm:w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500 group-hover/student:w-full" 
                                  style={{ width: `${student.progress}%` }}
                                />
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-mono font-semibold text-slate-500 group-hover/student:text-teal-600 transition-colors">
                                {student.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 opacity-0 group-hover/student:opacity-100 transition-all duration-300 group-hover/student:translate-x-1" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <Users size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-xs sm:text-sm text-slate-500">No students yet</p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link to="/instructor/students" className="group/btn relative block text-center text-[10px] sm:text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors overflow-hidden">
                  <span className="relative z-10 inline-flex items-center gap-1">
                    View All Students
                    <ArrowUpRight size={10} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </span>
                  <div className="absolute bottom-0 left-0 w-full h-px bg-teal-600 scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300"></div>
                </Link>
              </div>
            </ChartCard>

            {/* Quick Actions */}
            <ChartCard title="Quick Actions" icon={<Zap />}>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { to: "/instructor/schedule",      icon: <Calendar size={14} />,   label: "Mark Attendance",    color: "teal" },
                  { to: "/instructor/expenses",      icon: <DollarSign size={14} />, label: "Submit Expense",     color: "amber" },
                  { to: "/instructor/students",      icon: <Users size={14} />,      label: "View Students",      color: "indigo" },
                  { to: "/instructor/notifications", icon: <Bell size={14} />,       label: "Notifications",      color: "purple" },
                ].map(({ to, icon, label, color }) => {
                  const colorClasses = {
                    teal: "bg-teal-50 dark:bg-teal-900/30 text-teal-600 hover:bg-teal-600",
                    amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-600",
                    indigo: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 hover:bg-indigo-600",
                    purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 hover:bg-purple-600"
                  };
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`group/action flex items-center gap-2 sm:gap-3 py-2.5 px-3 sm:px-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] sm:text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg ${colorClasses[color]} hover:text-white`}
                    >
                      <span className="shrink-0 transition-transform duration-300 group-hover/action:scale-110">{icon}</span>
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;