import React, { useState, useEffect, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import StudentDetailView from "../components/StudentDetailView";

const locations = ["Burin", "Grand Falls", "Marystown", "St. John's / Mount Pearl"];
const paymentStatuses = ["Paid", "Balance Due", "Overdue"];

const generateStudents = () => {
  return Array.from({ length: 120 }, (_, i) => {
    const id = i + 1;
    const hoursLogged = Math.floor(Math.random() * 13);
    const monthsCompleted = Math.floor(Math.random() * 12);
    const status = paymentStatuses[i % paymentStatuses.length];
    
    return {
      id: id,
      name: ["Alex Rivera", "Sam Chen", "Jordan Smith", "Maria Garcia", "Yuki Tanaka"][i % 5] + ` ${id}`,
      instructor: ["John Doe", "Jane Smith", "Sarah Connor"][i % 3],
      location: locations[i % locations.length],
      licenseClass: ["Class 7 L", "Class 7 N", "Class 5", "Class 1"][i % 4],
      hoursLogged: hoursLogged,
      totalRequiredHours: 12,
      paymentStatus: status,
      balanceCAD: status === "Paid" ? 0 : parseFloat((Math.random() * 800 + 100).toFixed(2)),
      gdlEligibilityMonths: 12 - monthsCompleted,
      progress: Math.floor((hoursLogged / 12) * 100),
      status: "Active",
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
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;
  const [viewStudent, setViewStudent] = useState(null);

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
      if (paymentFilter) filtered = filtered.filter((s) => s.paymentStatus === paymentFilter);

      if (paymentFilter !== "Paid" && paymentFilter !== "") {
        filtered.sort((a, b) => b.balanceCAD - a.balanceCAD);
      }
      
      const start = (page - 1) * limit;
      setStudents(filtered.slice(start, start + limit));
      setTotal(filtered.length);
      setLoading(false);
    }, 400);
  }, [page, query, locationFilter, paymentFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-6 mb-12 text-center lg:text-left">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-white tracking-tight">
              Network <span className="text-indigo-600">Students</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Managing <span className="text-indigo-600 font-bold">{total}</span> records
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <select
              className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 text-sm font-semibold bg-white dark:bg-gray-900 shadow-sm outline-none"
              value={locationFilter}
              onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Regions</option>
              {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>

            <select
              className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 text-sm font-semibold bg-white dark:bg-gray-900 shadow-sm outline-none"
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Payment Status</option>
              {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </header>

        <div className="mb-12 flex justify-center"><div className="w-full max-w-2xl"><SearchBar onSearch={handleSearch} /></div></div>

        {loading ? (
          <div className="py-32 text-center animate-pulse">
            <p className="text-gray-400 font-bold uppercase text-[10px]">Filtering Database...</p>
          </div>
        ) : (
          <div className="w-full">
            {/* --- DESKTOP VIEW (TABLE) --- */}
            <div className="hidden md:block bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <table className="w-full table-fixed text-left">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
                    <th className="w-[30%] px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Student</th>
                    <th className="w-[20%] px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Region</th>
                    <th className="w-[20%] px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Balance</th>
                    <th className="w-[15%] px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Status</th>
                    <th className="w-[15%] px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {students.map((s) => (
                    <tr key={s.id} onClick={() => setViewStudent(s)} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 cursor-pointer">
                      <td className="px-8 py-5 flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">{s.name.charAt(0)}</div>
                          <div className="font-bold text-gray-800 dark:text-white truncate">{s.name}</div>
                      </td>
                      <td className="px-8 py-5 text-gray-500 text-xs font-semibold">{s.location}</td>
                      <td className="px-8 py-5 font-bold text-indigo-600">${s.balanceCAD}</td>
                      <td className="px-8 py-5">
                         <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase ${s.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{s.paymentStatus}</span>
                      </td>
                      <td className="px-8 py-5 text-right"><button className="text-indigo-600 font-bold text-xs uppercase">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- MOBILE VIEW (CARDS) --- */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {students.map((s) => (
                <div 
                  key={s.id} 
                  onClick={() => setViewStudent(s)}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-md active:scale-95 transition-transform"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">{s.name.charAt(0)}</div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{s.name}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">{s.location}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${s.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {s.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Balance Due</span>
                    <span className="text-sm font-black text-indigo-600">${s.balanceCAD}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center mt-12 pb-10">
          <Pagination currentPage={page} totalItems={total} itemsPerPage={limit} onPageChange={setPage} />
        </div>
      </div>
      {viewStudent && <StudentDetailView student={viewStudent} onClose={() => setViewStudent(null)} />}
    </div>
  );
}