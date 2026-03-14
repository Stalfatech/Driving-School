import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, BarChart, Bar, LabelList
} from "recharts";
import { Users, UserCheck, GraduationCap, DollarSign, Loader2, TrendingUp, TrendingDown, Package } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('access_token');

  // Fetch real dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log("Fetching dashboard data...");
      
      // Fetch all required data in parallel
      const [
        studentsRes,
        instructorsRes,
        paymentsRes,
        packagesRes,
        expenseStatsRes,
        allPaymentsRes
      ] = await Promise.all([
        axios.get(`${API_URL}/students`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
          console.error("Error fetching students:", err);
          return { data: { data: [] } };
        }),
        axios.get(`${API_URL}/instructors`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
          console.error("Error fetching instructors:", err);
          return { data: { data: [] } };
        }),
        axios.get(`${API_URL}/payments/stats`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
          console.error("Error fetching payments stats:", err);
          return { data: { data: { total_revenue: 0, monthly: [] } } };
        }),
        axios.get(`${API_URL}/packages`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
          console.error("Error fetching packages:", err);
          return { data: { data: [] } };
        }),
        axios.get(`${API_URL}/admin/expenses/stats`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
          console.error("Error fetching expense stats:", err);
          return { data: { data: { total_approved: 0, monthly: [] } } };
        }),
        axios.get(`${API_URL}/payments`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => {
          console.error("Error fetching all payments:", err);
          return { data: { data: [] } };
        })
      ]);

      // Process students data
      const students = studentsRes.data?.data || studentsRes.data || [];
      const activeStudents = students.filter(s => s.user?.status === 'active').length;
      
      // Process instructors data
      const instructors = instructorsRes.data?.data || instructorsRes.data || [];
      
      // Process packages data
      const packages = packagesRes.data?.data || packagesRes.data || [];
      
      // Process payments stats
      const paymentsStats = paymentsRes.data?.data || { total_revenue: 0, monthly: [] };
      const totalRevenue = paymentsStats.total_revenue || 0;
      
      // Get all payments for monthly breakdown
      const allPayments = allPaymentsRes.data?.data || allPaymentsRes.data || [];
      const successfulPayments = allPayments.filter(p => p.status === 'succeeded');
      
      // Process expense stats (only approved expenses)
      const expenseStats = expenseStatsRes.data?.data || { total_approved: 0, monthly: [] };
      const totalApprovedExpenses = expenseStats.total_approved || 0;
      const monthlyExpenses = expenseStats.monthly || [];
      
      // Create monthly revenue data from actual payments
      const months = [];
      const now = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Generate last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        const month = monthNames[monthIndex];
        
        // Calculate revenue for this month from successful payments
        const monthRevenue = successfulPayments
          .filter(p => {
            const pDate = new Date(p.created_at);
            return pDate.getMonth() === monthIndex && pDate.getFullYear() === year;
          })
          .reduce((sum, p) => sum + (p.amount || 0), 0);
        
        // Find expense for this month
        const expenseItem = monthlyExpenses.find(e => e.month === month);
        
        months.push({
          month,
          revenue: monthRevenue,
          expenses: expenseItem?.amount || 0
        });
      }

      // Process region distribution (students by location)
      const regionMap = {};
      students.forEach(s => {
        let location = 'Unknown';
        if (s.location?.name) location = s.location.name;
        else if (s.location?.province_name) location = s.location.province_name;
        else if (s.province_name_text) location = s.province_name_text;
        else if (s.province) {
          // Try to find location name
          const loc = studentsRes.data?.locations?.find(l => l.id === s.province);
          location = loc?.name || loc?.province_name || `Location ${s.province}`;
        }
        
        regionMap[location] = (regionMap[location] || 0) + 1;
      });
      
      const regionDistribution = Object.entries(regionMap)
        .map(([region, count]) => ({ region, students: count }))
        .sort((a, b) => b.students - a.students)
        .slice(0, 5);

      // Calculate package popularity
      const packageCounts = {};
      students.forEach(s => {
        const packageName = s.package?.package_name || 'No Package';
        packageCounts[packageName] = (packageCounts[packageName] || 0) + 1;
      });

      const packagePopularity = Object.entries(packageCounts)
        .map(([name, count]) => ({ 
          name: name.length > 15 ? name.substring(0, 12) + '...' : name, 
          students: count 
        }))
        .sort((a, b) => b.students - a.students)
        .slice(0, 5); // Top 5 packages

      // Calculate package revenue
      const packageRevenue = {};
      successfulPayments.forEach(p => {
        const packageName = p.enrolment?.package?.package_name || 'Unknown';
        packageRevenue[packageName] = (packageRevenue[packageName] || 0) + (p.amount || 0);
      });

      const packageRevenueData = Object.entries(packageRevenue)
        .map(([name, amount]) => ({ 
          name: name.length > 15 ? name.substring(0, 12) + '...' : name, 
          revenue: amount 
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Recent activity - get the most recent student registrations
      const recentActivity = students
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5)
        .map(s => ({
          id: s.id,
          name: s.user?.name || 'Unknown',
          initials: (s.user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          status: s.user?.status || 'pending',
          phase: s.package?.package_name || 'Not Enrolled',
          date: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'
        }));

      const dashboardData = {
        summary: {
          totalStudents: students.length,
          activeStudents,
          instructors: instructors.length,
          revenue: totalRevenue,
          expenses: totalApprovedExpenses,
          netIncome: totalRevenue - totalApprovedExpenses
        },
        financialHealth: months,
        packagePopularity,
        packageRevenue: packageRevenueData,
        regionDistribution,
        recentActivity,
        packages: packages
      };

      console.log("Final dashboard data:", dashboardData);
      setData(dashboardData);

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
      <div className="w-full min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const PACKAGE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  // Format currency for display
  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

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

        {/* KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 justify-items-center">
          <KpiCard title="Total Students" value={data.summary.totalStudents} icon={<Users />} />
          <KpiCard title="Active Students" value={data.summary.activeStudents} icon={<UserCheck />} />
          <KpiCard title="Instructors" value={data.summary.instructors} icon={<GraduationCap />} />
          <KpiCard
            title="Total Revenue"
            value={formatCurrency(data.summary.revenue)}
            icon={<DollarSign />}
          />
        </div>

        {/* CHARTS */}
        <div className="space-y-6">

          {/* Financial Line Chart - Revenue vs Expenses */}
          <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 text-center lg:text-left">
              Revenue vs Expenses (Last 6 Months)
            </h2>
            <div className="h-62.5 md:h-87.5 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.financialHealth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={4} dot={{ r: 4 }} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Net Profit: <span className="font-bold text-green-600">{formatCurrency(data.summary.netIncome)}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown size={14} className="text-red-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Expenses: <span className="font-bold text-red-600">{formatCurrency(data.summary.expenses)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">

            {/* Pie Chart - Package Popularity */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center">
              <div className="flex items-center gap-2 mb-6">
                <Package size={18} className="text-indigo-600" />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Package Popularity
                </h2>
              </div>
              <div className="h-55 w-full">
                {data.packagePopularity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={data.packagePopularity} 
                        innerRadius={50} 
                        outerRadius={80} 
                        paddingAngle={4} 
                        dataKey="students"
                        label={({ name, percent }) => percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                      >
                        {data.packagePopularity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PACKAGE_COLORS[index % PACKAGE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Students']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400 text-sm">No package data available</p>
                  </div>
                )}
              </div>
              
              {/* Legend Indicators */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                {data.packagePopularity.map((pkg, index) => (
                  <div key={pkg.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PACKAGE_COLORS[index % PACKAGE_COLORS.length] }}></div>
                    <span className="text-[9px] font-medium text-gray-600 dark:text-gray-300">
                      {pkg.name}: {pkg.students}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart - Students by Location */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 text-center">
                Students by Location
              </h2>
              <div className="h-55 w-full">
                {data.regionDistribution.length > 0 ? (
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
                        formatter={(value) => [value, 'Students']}
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: 'none', 
                          borderRadius: '12px', 
                          color: '#fff',
                          fontSize: '12px' 
                        }}
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
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400 text-sm">No location data available</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

    

        {/* RECENT STUDENT REGISTRATIONS */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">
              Recent Registrations
            </h2>
            <Link
              to="/admin/students/list"
              className="px-6 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
            >
              View All Students
            </Link>
          </div>

          <div className="w-full">
            <table className="w-full text-left">
              <thead className="hidden sm:table-header-group bg-gray-50/50 dark:bg-gray-800/30 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 sm:px-10 py-5">Student</th>
                  <th className="px-6 sm:px-10 py-5">Package</th>
                  <th className="px-6 sm:px-10 py-5 text-right">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                {data.recentActivity.map((s) => (
                  <tr key={s.id} className="flex flex-col sm:table-row hover:bg-indigo-50/20 transition-colors p-6 sm:p-0">
                    <td className="sm:px-10 sm:py-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                        {s.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-white">
                          {s.name}
                        </span>
                        {/* Mobile Only Status */}
                        <span className="sm:hidden px-2 py-0.5 mt-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-500 w-fit">
                          {s.status}
                        </span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 sm:px-10 py-5">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        {s.phase}
                      </span>
                    </td>
                    <td className="sm:px-10 sm:py-5 sm:text-right text-gray-400 font-bold text-xs mt-2 sm:mt-0">
                      <span className="sm:hidden text-[9px] uppercase tracking-widest mr-2 text-gray-300">Date:</span>
                      {s.date}
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

const KpiCard = ({ title, value, icon }) => (
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
    </div>
  </div>
);

export default Dashboard;