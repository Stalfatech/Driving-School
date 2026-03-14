import React, { useState, useEffect } from "react";
import { 
  Users, ClipboardCheck, Award, Clock, MapPin, 
  ChevronRight, Activity, Calendar, Car, Phone, Mail,
  Loader2, AlertCircle
} from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

const InstructorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    todaySessions: [],
    upcomingSessions: [],
    testsLogged: 0,
    passRate: 0,
    totalHours: 0,
    assignedCar: null,
    instructorName: '',
    instructorLocation: '',
    recentStudents: []
  });

  const token = localStorage.getItem('access_token');

  // Create axios instance with auth headers
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all required data in parallel
      const [
        userRes,
        myStudentsRes,
        manifestRes,
        historyRes,
        assignedCarRes
      ] = await Promise.all([
        api.get('/user').catch(err => {
          console.error("Error fetching user:", err);
          return { data: { name: 'Instructor' } };
        }),
        api.get('/instructor/my-students').catch(err => {
          console.error("Error fetching students:", err);
          return { data: { data: [] } };
        }),
        api.get('/instructor/manifest').catch(err => {
          console.error("Error fetching manifest:", err);
          return { data: [] };
        }),
        api.get('/instructor/history').catch(err => {
          console.error("Error fetching history:", err);
          return { data: [] };
        }),
        api.get('/my-assigned-car').catch(err => {
          console.error("Error fetching assigned car:", err);
          return { data: { data: null } };
        })
      ]);

      // Process user data
      const userData = userRes.data;
      const instructorName = userData.name || 'Instructor';
      
      // Process students data
      const students = myStudentsRes.data?.data || myStudentsRes.data || [];
      const totalStudents = students.length;
      
      // Process manifest (upcoming sessions)
      const manifest = manifestRes.data || [];
      
      // Process history for tests and pass rate
      const history = historyRes.data || [];
      const testsLogged = history.length;
      
      // Calculate pass rate (present sessions)
      const passedTests = history.filter(s => s.attendance?.status === 'present').length;
      const passRate = testsLogged > 0 ? Math.round((passedTests / testsLogged) * 100) : 0;
      
      // Calculate total hours (assuming each session is 1 hour)
      const totalHours = history.length;
      
      // Get today's sessions
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = manifest.filter(s => s.date === today);
      
      // Get upcoming sessions (future dates)
      const upcomingSessions = manifest.filter(s => s.date > today).slice(0, 5);
      
      // Get recent students (last 5)
      const recentStudents = students.slice(0, 5).map(s => ({
        id: s.id,
        name: s.name || s.user?.name || 'Student',
        email: s.email || s.user?.email || '',
        progress: s.progress || 0
      }));

      // Process assigned car
      const assignedCar = assignedCarRes.data?.data || null;

      setDashboardData({
        totalStudents,
        todaySessions,
        upcomingSessions,
        testsLogged,
        passRate,
        totalHours,
        assignedCar,
        instructorName,
        instructorLocation: students[0]?.location || 'Main Branch',
        recentStudents
      });

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-gray-950 min-h-screen font-['Lexend']">
        <div className="max-w-7xl mx-auto p-4 md:p-10 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-gray-950 min-h-screen font-['Lexend']">
        <div className="max-w-7xl mx-auto p-4 md:p-10 flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <p className="text-sm font-medium text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. DASHBOARD HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic leading-none">
          Welcome back, <span className="text-[#008B8B]">{dashboardData.instructorName}</span>
        </h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
          Terra Nova Training Systems • <span className="text-[#008B8B] font-bold">{dashboardData.instructorLocation}</span>
        </p>
      </div>

      {/* 2. METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard 
          title="Total Students" 
          value={dashboardData.totalStudents} 
          icon={<Users />} 
          color="teal" 
          sub="Active Students" 
        />
        <MetricCard 
          title="Tests Logged" 
          value={dashboardData.testsLogged} 
          icon={<ClipboardCheck />} 
          color="indigo" 
          sub="All Time" 
        />
        <MetricCard 
          title="Pass Rate" 
          value={`${dashboardData.passRate}%`} 
          icon={<Award />} 
          color="emerald" 
          sub={dashboardData.passRate >= 80 ? 'Excellent' : 'Room for Improvement'} 
        />
        <MetricCard 
          title="Hours" 
          value={dashboardData.totalHours} 
          icon={<Activity />} 
          color="orange" 
          sub="Behind the wheel" 
        />
      </div>

      {/* 3. ASSIGNED CAR SECTION */}
      {dashboardData.assignedCar && (
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-[2.5rem] text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Car size={32} className="opacity-80" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Assigned Vehicle</p>
                <h3 className="text-xl font-bold">{dashboardData.assignedCar.car_name} • {dashboardData.assignedCar.number_plate}</h3>
                <p className="text-sm opacity-80 mt-1">Odometer: {dashboardData.assignedCar.odometer} KM</p>
              </div>
            </div>
            <Link 
              to="/instructor/expenses" 
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      {/* 4. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* TODAY'S AGENDA */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[#008B8B]" />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Today's Agenda</h2>
              </div>
              <Link 
                to="/instructor/schedule" 
                className="text-[10px] font-black text-[#008B8B] uppercase tracking-widest hover:underline transition-all active:scale-95"
              >
                Full Schedule
              </Link>
            </div>
            <div className="p-4 md:p-6 space-y-3">
              {dashboardData.todaySessions.length > 0 ? (
                dashboardData.todaySessions.map((session, index) => (
                  <ScheduleRow 
                    key={index}
                    time={session.start_time || 'TBD'}
                    student={session.student?.user?.name || 'Student'}
                    task={session.schedule?.task_description || 'Driving Lesson'}
                    status={session.attendance ? 'Completed' : 'Upcoming'}
                    location={dashboardData.instructorLocation}
                  />
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-400 text-sm">No sessions scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* UPCOMING SESSIONS */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Upcoming Sessions</h2>
            </div>
            <div className="p-4 md:p-6 space-y-3">
              {dashboardData.upcomingSessions.length > 0 ? (
                dashboardData.upcomingSessions.map((session, index) => (
                  <ScheduleRow 
                    key={index}
                    time={`${session.date} ${session.start_time || ''}`}
                    student={session.student?.user?.name || 'Student'}
                    task={session.schedule?.task_description || 'Driving Lesson'}
                    status="Scheduled"
                    location={dashboardData.instructorLocation}
                  />
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-400 text-sm">No upcoming sessions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR - RECENT STUDENTS */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Users size={14} className="text-[#008B8B]" /> Recent Students
            </h2>
            <div className="space-y-4">
              {dashboardData.recentStudents.length > 0 ? (
                dashboardData.recentStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{student.name}</p>
                        <p className="text-[9px] text-slate-400">Progress: {student.progress}%</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No students assigned yet</p>
              )}
            </div>
            <Link 
              to="/instructor/students" 
              className="mt-6 w-full py-3 bg-slate-50 dark:bg-slate-800 text-[#008B8B] rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#008B8B] hover:text-white transition-all flex items-center justify-center gap-2"
            >
              View All Students <ChevronRight size={12} />
            </Link>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 p-6 rounded-[2.5rem] border border-indigo-200 dark:border-indigo-800">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                to="/instructor/schedule"
                className="block w-full py-3 px-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all"
              >
                📅 Mark Attendance
              </Link>
              <Link 
                to="/instructor/expenses"
                className="block w-full py-3 px-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all"
              >
                💰 Submit Expense
              </Link>
              <Link 
                to="/instructor/students"
                className="block w-full py-3 px-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all"
              >
                👥 View Students
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const MetricCard = ({ title, value, icon, color, sub }) => {
  const colorClasses = {
    teal: 'text-teal-600 bg-teal-500/10',
    indigo: 'text-indigo-600 bg-indigo-500/10',
    emerald: 'text-emerald-600 bg-emerald-500/10',
    orange: 'text-orange-600 bg-orange-500/10'
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClasses[color]} mb-5 group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-none mb-2 tracking-tighter">{value}</h3>
      <p className="text-[9px] font-bold text-slate-400 italic uppercase tracking-tighter">{sub}</p>
    </div>
  );
};

const ScheduleRow = ({ time, student, task, status, location }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-transparent hover:border-[#008B8B]/30 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group gap-4">
    <div className="flex items-center gap-6">
      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 w-20 uppercase truncate">{time}</span>
      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#008B8B] transition-colors">{student}</p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter italic">
          {task} • <span className="text-[#008B8B] font-bold">{location}</span>
        </p>
      </div>
    </div>
    <span className={`text-[8px] self-start sm:self-center font-black uppercase px-3 py-1.5 rounded-full ${
      status === 'High Priority' 
        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
        : status === 'Completed'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'
    }`}>
      {status}
    </span>
  </div>
);

export default InstructorDashboard;