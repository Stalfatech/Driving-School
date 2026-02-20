import React, { useState, useEffect, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import StudentDetailView from "../components/StudentDetailView";

// --- UPDATED LOCATIONS & CANADIAN GDL DUMMY DATA ---
const locations = ["Burin", "Grand Falls", "Marystown", "St. John's / Mount Pearl"];
const licenseClasses = ["Class 7 L", "Class 7 N", "Class 5", "Class 1"];
const paymentStatuses = ["Paid", "Balance Due", "Overdue"];

const generateStudents = () => {
  return Array.from({ length: 120 }, (_, i) => {
    const id = i + 1;
    const hoursLogged = Math.floor(Math.random() * 13); // 0 to 12 hours
    const monthsCompleted = Math.floor(Math.random() * 12);
    
    return {
      id: id,
      name: ["Alex Rivera", "Sam Chen", "Jordan Smith", "Maria Garcia", "Yuki Tanaka"][i % 5] + ` ${id}`,
      instructor: ["John Doe", "Jane Smith", "Sarah Connor"][i % 3],
      location: locations[i % locations.length],
      licenseClass: licenseClasses[i % licenseClasses.length],
      
      // Screen 3 Specs: GDL & CRM Tracking
      hoursLogged: hoursLogged,
      totalRequiredHours: 12,
      paymentStatus: paymentStatuses[i % paymentStatuses.length],
      balanceCAD: (Math.random() * 450).toFixed(2),
      
      // GDL Countdown Logic
      gdlEligibilityMonths: 12 - monthsCompleted,
      progress: Math.floor((hoursLogged / 12) * 100),
      status: i % 5 === 0 ? "Pending" : "Active",
      email: `student${id}@drive-academy.ca`,
    };
  });
};

const MASTER_DATA = generateStudents();

export default function StudentPage() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;

  const [viewStudent, setViewStudent] = useState(null);

  // --- STABLE SEARCH CALLBACK ---
  // This prevents the search effect from resetting the page when you navigate
  const handleSearch = useCallback((val) => {
    setQuery(val);
    setPage(1);
  }, []);

  const fetchStudents = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = MASTER_DATA.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase())
      );
      if (locationFilter) filtered = filtered.filter((s) => s.location === locationFilter);
      
      const start = (page - 1) * limit;
      setStudents(filtered.slice(start, start + limit));
      setTotal(filtered.length);
      setLoading(false);
    }, 400);
  }, [page, query, locationFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-6 mb-8 md:mb-12 text-center lg:text-left">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-white tracking-tight leading-tight">
              Network <span className="text-indigo-600">Students</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Managing <span className="text-indigo-600 font-bold">{total}</span> system records.
            </p>
          </div>

          <select
            className="w-full lg:w-auto px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 shadow-sm outline-none transition-all"
            value={locationFilter}
            onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </header>

        {/* Search */}
        <div className="mb-8 md:mb-12 flex justify-center">
          <div className="w-full max-w-2xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {loading ? (
          <div className="py-32 text-center space-y-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-[10px]">Accessing Database...</p>
          </div>
        ) : (
          <div className="w-full">
            {/* --- DESKTOP TABLE --- */}
            <div className="hidden md:block w-full bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
              <table className="w-full table-fixed text-left">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
                    <th className="w-[28%] px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Student Name</th>
                    <th className="w-[18%] px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest">License Class</th>
                    <th className="w-[24%] px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Hours Logged</th>
                    <th className="w-[15%] px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Payment</th>
                    <th className="w-[15%] px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                  {students.map((s) => (
                    <tr 
                      key={s.id} 
                      onClick={() => setViewStudent(s)}
                      className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all cursor-pointer"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                            {s.name.charAt(0)}
                          </div>
                          <div className="min-w-0 truncate">
                            <div className="font-bold text-gray-800 dark:text-white truncate">{s.name}</div>
                            <div className="text-[10px] text-gray-400 font-semibold uppercase truncate">{s.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-black tracking-tight uppercase">
                          {s.licenseClass}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[10px] font-bold text-gray-400">
                            <span>{s.hoursLogged} / 12 HOURS</span>
                            <span className="text-indigo-600">{s.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${s.hoursLogged >= 12 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${s.progress}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                          s.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                          s.paymentStatus === 'Overdue' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                          'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          <span className={`h-1 w-1 rounded-full mr-1.5 ${s.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                          {s.paymentStatus}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="p-2 inline-block text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white rounded-xl transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- MOBILE CARDS --- */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {students.map((s) => (
                <div 
                  key={s.id} 
                  onClick={() => setViewStudent(s)}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-lg active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">{s.name.charAt(0)}</div>
                      <div className="max-w-[120px]">
                        <div className="font-bold text-gray-900 dark:text-white truncate">{s.name}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">{s.licenseClass}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${
                      s.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>{s.paymentStatus}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                      <span>Hours Logged</span>
                      <span className="text-indigo-600">{s.hoursLogged}/12</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: `${s.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center mt-12 pb-8">
          <Pagination currentPage={page} totalItems={total} itemsPerPage={limit} onPageChange={setPage} />
        </div>
      </div>

      {viewStudent && <StudentDetailView student={viewStudent} onClose={() => setViewStudent(null)} />}
    </div>
  );
}