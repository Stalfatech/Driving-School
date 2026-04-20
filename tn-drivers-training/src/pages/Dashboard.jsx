import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, BarChart, Bar, LabelList
} from "recharts";
import { 
  Users, UserCheck, GraduationCap, DollarSign, FileText, Clock,ScanEye, Eye, 
  Package, TrendingUp, TrendingDown, ChevronDown, ChevronUp, 
  MapPin, Calendar, Star, Award, ArrowUpRight, Sparkles,
  ShieldCheck, Zap, Globe, Target, Briefcase, BookOpen, Loader2, AlertTriangle
} from "lucide-react";
import axios from "axios";
import ApplicationReviewModal from "../components/ApplicationReviewModal";

const API_URL = "http://localhost:8000/api";

// ================= STYLES & CONSTANTS =================
const PACKAGE_COLORS = ["#2A9D8F", "#6366F1", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: 'none',
  borderRadius: '12px',
  fontSize: '13px',
  color: '#ffffff',
  padding: '8px 12px',
  boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
};

// ================= HELPER FUNCTIONS =================
const formatCurrency = (value) => {
  if (!value && value !== 0) return '$0';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value}`;
};

// Calculate age from date of birth
const calculateAge = (dob) => {
  if (!dob) return 18; // Default age if not provided
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const getPriority = (age) => {
  if (age < 18) return { 
    label: "Normal", 
    color: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    width: "w-35"
  };
  return { 
    label: "High Priority", 
    color: "bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800",
    width: "w-35"
  };
};

// Get initials from name
const getInitials = (name) => {
  if (!name) return '?';
  if (typeof name === 'string') {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  return '?';
};

// ================= MOBILE APPLICATION CARD =================
const MobileApplicationCard = ({ app, priority, onView }) => {
  return (
    <div className="group p-5 border-b border-slate-100 dark:border-slate-800 transition-all duration-300 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-transparent dark:hover:from-teal-900/20">
  <div className="flex flex-col items-center text-center">
    {/* Avatar */}
    <div className="relative mb-3">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/30 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-110 transition-transform duration-300">
        {getInitials(app.name)}
      </div>
    </div>
    
    {/* Name */}
    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors text-base mb-1">
      {app.name}
    </h3>
    
    {/* Date */}
    <div className="flex items-center justify-center gap-2 mb-2">
      <Calendar size={12} className="text-slate-400 group-hover:text-teal-500 transition-colors" />
      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
        {app.registered_at}
      </span>
    </div>
    
    {/* Package */}
    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
      {app.package || 'No Package Found'}
    </p>
    
    {/* Priority Badge */}
    <div className="mb-4">
      <span className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase ${priority.color}`}>
        {priority.label}
      </span>
    </div>
    
    {/* Action Button */}
    <button
      onClick={onView}
      className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 hover:scale-105 flex items-center justify-center gap-2"
    >
      <Eye size={14} />
      Review Application
    </button>
  </div>
</div>
  );
};

// ================= KPI CARD WITH HOVER EFFECTS =================
const KpiCard = ({ title, value, growth, icon, subtitle }) => {
  const isPositiveGrowth = growth && growth > 0;
  
  return (
    <div className="group relative overflow-hidden bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-transparent to-emerald-50 dark:from-teal-900/20 dark:via-transparent dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute -inset-1 bg-gradient-to-r from-teal-200/30 to-emerald-200/30 dark:from-teal-500/10 dark:to-emerald-500/10 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
      
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center mb-2 sm:mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/60 dark:to-teal-800/40 text-teal-600 dark:text-teal-400 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
              {React.cloneElement(icon, { size: 18, strokeWidth: 1.8 })}
            </div>
          </div>
        </div>
        
        <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {title}
        </p>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-emerald-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
          {value}
        </h3>
        
        {growth && (
          <div className={`flex items-center justify-center gap-1 mt-2 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[0.55rem] sm:text-xs font-bold font-mono transition-all duration-300 group-hover:scale-105 ${
            isPositiveGrowth 
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 group-hover:bg-green-200 dark:group-hover:bg-green-900/60'
              : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 group-hover:bg-red-200 dark:group-hover:bg-red-900/60'
          }`}>
            {isPositiveGrowth ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isPositiveGrowth ? '+' : ''}{growth}%
          </div>
        )}
        
        {subtitle && (
          <p className="text-[0.55rem] sm:text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors">
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles size={10} className="text-teal-400/60" />
      </div>
    </div>
  );
};

// ================= CHART CARD WITH HOVER EFFECTS =================
const ChartCard = ({ title, icon, children }) => {
  return (
    <div className="group relative overflow-hidden bg-white dark:bg-slate-900 p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-transparent to-emerald-50/30 dark:from-teal-900/10 dark:via-transparent dark:to-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 sm:mb-5">
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

// ================= MAIN DASHBOARD COMPONENT =================
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem('access_token');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const dashboardData = response.data.data;
        
        const formattedData = {
          summary: {
            total_students: dashboardData.summary?.total_students || 0,
            active_students: dashboardData.summary?.active_students || 0,
            total_instructors: dashboardData.summary?.total_instructors || 0,
            total_revenue: dashboardData.summary?.total_revenue || 0,
            total_expenses: dashboardData.summary?.total_expenses || 0,
            net_income: dashboardData.summary?.net_income || 0,
          },
          monthly_financials: Array.isArray(dashboardData.monthly_financials) 
            ? dashboardData.monthly_financials
            : [],
          package_popularity: Array.isArray(dashboardData.package_popularity)
            ? dashboardData.package_popularity
            : [],
          location_distribution: Array.isArray(dashboardData.location_distribution)
            ? dashboardData.location_distribution
            : [],
          recent_registrations: Array.isArray(dashboardData.recent_registrations)
            ? dashboardData.recent_registrations
            : [],
        };

        setData(formattedData);
      } else {
        setError("API returned unsuccessful response");
      }
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

  const handleViewApplication = (app) => {
    console.log("Opening modal for student:", app);
    // Make sure we're passing the correct ID
    setSelectedStudentId(app.id);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={48} />
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-sm font-medium text-red-600 mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="px-6 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-all">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const monthlyFinancials = data.monthly_financials || [];
  const packagePopularity = data.package_popularity || [];
  const locationDistribution = data.location_distribution || [];
  const recentApplications = data.recent_registrations || [];

  return (
    <>
      <div className="w-full min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors overflow-x-hidden">
        <div className="mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          
          {/* ================= HEADER ================= */}
          <header className="rounded-2xl bg-gradient-to-r from-teal-600/10 via-emerald-600/5 to-teal-600/10 dark:from-teal-500/5 dark:via-emerald-500/5 p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-2">
                <ShieldCheck className="text-teal-500 transition-all duration-300 hover:scale-110 hover:rotate-12" size={24} />
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                  <span className="text-slate-800 dark:text-white">Admin</span>
                  <span className="text-teal-600 dark:text-teal-400 ml-2 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Dashboard</span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm md:text-base font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-center lg:justify-start gap-2">
                <Zap size={12} className="text-teal-500 transition-all duration-300 hover:scale-110" />
                Real-time visibility into school operations
              </p>
            </div>
          </header>

          {/* ================= KPI GRID ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <KpiCard 
              title="Total Students" 
              value={data.summary?.total_students?.toLocaleString() || 0} 
              icon={<Users />} 
            />
            <KpiCard 
              title="Active Students" 
              value={data.summary?.active_students?.toLocaleString() || 0} 
              icon={<UserCheck />} 
            />
            <KpiCard 
              title="Instructors" 
              value={data.summary?.total_instructors || 0} 
              icon={<GraduationCap />} 
            />
            <KpiCard
              title="Revenue"
              value={formatCurrency(data.summary?.total_revenue || 0)}
              icon={<DollarSign />}
            />
          </div>

          {/* ================= CHARTS SECTION ================= */}
          <div className="space-y-4 sm:space-y-6">
            
            {/* Financial Line Chart */}
            <ChartCard title="Financial Health (Revenue vs Expenses)" icon={<TrendingUp />}>
              <div className="h-48 sm:h-56 md:h-64 lg:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyFinancials}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), undefined]}
                      contentStyle={tooltipStyle}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#2A9D8F" strokeWidth={2.5} dot={{ r: 3, fill: "#2A9D8F" }} name="Revenue" />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2, fill: "#EF4444" }} name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4 sm:mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/20 transition-all duration-300 hover:scale-105 hover:bg-teal-100 dark:hover:bg-teal-900/40">
                  <TrendingUp size={10} className="text-teal-500" />
                  <span className="text-[0.6rem] sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Net Profit: <span className="font-bold text-teal-600">{formatCurrency(data.summary?.net_income || 0)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 transition-all duration-300 hover:scale-105 hover:bg-red-100 dark:hover:bg-red-900/40">
                  <TrendingDown size={10} className="text-red-500" />
                  <span className="text-[0.6rem] sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Expenses: <span className="font-bold text-red-600">{formatCurrency(data.summary?.total_expenses || 0)}</span>
                  </span>
                </div>
              </div>
            </ChartCard>

            {/* Two column charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              
              {/* Package Popularity Chart */}
              {/* Package Popularity Chart */}
<ChartCard title="Package Popularity" icon={<Package />}>
  <div className="h-40 sm:h-48 md:h-52 w-full">
    {packagePopularity && packagePopularity.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={packagePopularity.filter(p => p.students > 0)} 
            innerRadius={40} 
            outerRadius={60} 
            paddingAngle={3} 
            dataKey="students"
            label={({ package_name, percent }) => percent > 0.08 ? `${package_name?.split(' ')[0]} (${(percent * 100).toFixed(0)}%)` : ''}
            labelLine={false}
          >
            {packagePopularity.filter(p => p.students > 0).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PACKAGE_COLORS[index % PACKAGE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [`${value} Students`, props.payload?.package_name || 'Package']}
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '12px',
              fontSize: '13px',
              color: '#ffffff',
              padding: '8px 12px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
            }}
            itemStyle={{
              color: '#ffffff',
              fontSize: '12px'
            }}
            labelStyle={{
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <div className="h-full flex items-center justify-center">
        <p className="text-xs sm:text-sm text-slate-400">No package data available</p>
      </div>
    )}
  </div>
  
  {/* Legend */}
  {packagePopularity && packagePopularity.length > 0 && (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-4 sm:mt-5 pt-2">
      {packagePopularity.map((pkg, index) => (
        <div key={pkg.package_name} className="flex items-center gap-2 group/legend transition-all duration-300 hover:translate-x-1">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 group-hover/legend:scale-110" style={{ backgroundColor: pkg.students > 0 ? PACKAGE_COLORS[index % PACKAGE_COLORS.length] : '#cbd5e1' }}></div>
          <span className="text-[0.65rem] sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate group-hover/legend:text-teal-600 dark:group-hover/legend:text-teal-400 transition-colors">
            {pkg.package_name}: <span className="font-bold text-slate-800 dark:text-white">{pkg.students}</span>
          </span>
        </div>
      ))}
    </div>
  )}
</ChartCard>

              {/* Students by Location Chart */}
              <ChartCard title="Students by Location" icon={<Globe />}>
                <div className="h-40 sm:h-48 md:h-52 w-full">
                  {locationDistribution && locationDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={locationDistribution} 
                        layout="vertical" 
                        margin={{ left: 0, right: 20 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="location" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          width={70} 
                          tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }}
                        />
                        <Tooltip 
                          formatter={(value) => [value, 'Students']}
                          contentStyle={tooltipStyle}
                          cursor={false}
                        />
                        <Bar 
                          dataKey="students" 
                          fill="#2A9D8F" 
                          radius={[0, 6, 6, 0]}
                          activeBar={false}
                          isAnimationActive={true}
                        >
                          <LabelList 
                            dataKey="students" 
                            position="right" 
                            fill="#2A9D8F" 
                            style={{ fontSize: '9px', fontWeight: 700 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs sm:text-sm text-slate-400">No location data available</p>
                    </div>
                  )}
                </div>
              </ChartCard>
            </div>
          </div>

          {/* ================= RECENT REGISTRATIONS ================= */}
          {recentApplications && recentApplications.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md transition-all duration-500 hover:shadow-2xl overflow-hidden">
              <div className="p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={14} className="text-teal-500 transition-all duration-300 hover:scale-110" />
                    <p className="text-xs sm:text-lg font-bold text-slate-800 dark:text-white">
                      Recent Registrations
                    </p>
                  </div>
                  <p className="text-[0.55rem] sm:text-xs md:text-sm font-soro text-slate-700 dark:text-slate-400">
                    Student registration applications - Priority based on age
                  </p>
                </div>
                <Link
                  to="/students"
                  className="group/btn relative px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[0.6rem] sm:text-xs font-bold uppercase tracking-wider overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-1">
                    View All
                    <ArrowUpRight size={10} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr className="text-[0.55rem] sm:text-xs md:text-smfont-soro font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="px-4 sm:px-5 py-3 sm:py-4 text-left">ID</th>
                      <th className="px-4 sm:px-5 py-3 sm:py-4 text-left">Date</th>
                      <th className="px-4 sm:px-5 py-3 sm:py-4 text-left">Student Name</th>
                      <th className="px-4 sm:px-5 py-3 sm:py-4 text-left">Package</th>
                      <th className="px-4 sm:px-5 py-3 sm:py-4 text-left">Priority</th>
                      <th className="px-4 sm:px-5 py-3 sm:py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentApplications.map((app) => {
                      // Calculate age from DOB using frontend logic
                      const age = calculateAge(app.dob);
                      const priority = getPriority(age);
                      
                      return (
                        <tr key={app.id} className="group/row transition-all duration-300 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-transparent dark:hover:from-teal-900/20">
                          <td className="px-4 sm:px-5 py-3 sm:py-4 align-middle">
                            <span className="text-[0.65rem] sm:text-sm font-soro font-bold text-teal-600 dark:text-teal-400 group-hover/row:text-teal-500 transition-colors">
                              #{app.id}
                            </span>
                          </td>
                          <td className="px-4 sm:px-5 py-3 sm:py-4 align-middle">
                            <span className="text-[0.65rem] sm:text-sm font-soro text-slate-700 dark:text-slate-400">
                              {app.registered_at}
                            </span>
                          </td>
                          <td className="px-4 sm:px-5 py-3 sm:py-4 align-middle">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl blur-md opacity-0 group-hover/row:opacity-50 transition-opacity duration-300"></div>
                                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/30 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-[0.6rem] sm:text-xs shadow-md group-hover/row:scale-110 transition-transform duration-300">
                                  {getInitials(app.name)}
                                </div>
                              </div>
                              <span className="text-[0.7rem] sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover/row:text-teal-600 dark:group-hover/row:text-teal-400 transition-colors">
                                {app.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-5 py-3 sm:py-4 align-middle">
                            <span className="text-[0.65rem] sm:text-sm text-slate-600 dark:text-slate-300">
                              {app.package || 'No Package Found '}
                            </span>
                          </td>
                          <td className=" sm:px-5 py-3 sm:py-4 align-middle">
                            <span className={`inline-flex items-center justify-center  px-2 sm:px-3 py-1 rounded-full text-[0.55rem] sm:text-xs font-soro font-bold uppercase tracking-wider transition-all duration-300 group-hover/row:scale-105 ${priority.color} ${priority.width}`}>
                              {priority.label}
                            </span>
                          </td>
                          <td className="px-2 sm:px-5 py-3 sm:py-4 text-right align-middle">
                            <button
                              onClick={() => handleViewApplication(app)}
                              className="group/btn inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5   text-teal-700 dark:text-teal-300 rounded-lg text-[0.6rem] sm:text-xs font-semibold transition-all duration-300   hover:scale-105"
                            >
                              <ScanEye size={23} className="hover:text-teal-500 text-teal-300 dark:text-white" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {recentApplications.map((app) => {
                  const age = calculateAge(app.dob);
                  const priority = getPriority(age);
                  return (
                    <MobileApplicationCard 
                      key={app.id}
                      app={app}
                      priority={priority}
                      onView={() => handleViewApplication(app)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Review Modal - FIXED: Added studentId prop */}
      {isModalOpen && selectedStudentId && (
        <ApplicationReviewModal 
          studentId={selectedStudentId}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStudentId(null);
          }}
          onRefresh={() => {
            fetchDashboardData();
          }}
        />
      )}
    </>
  );
};

export default Dashboard;