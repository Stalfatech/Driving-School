

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import StudentDetailView from "../components/StudentDetailView";
import { Ban, CheckCircle, Eye, Loader2, MapPin, Filter, Users } from "lucide-react";

const API_BASE = "http://localhost:8000/api";

const StudentPage = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // --- Filter & Pagination State ---
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All"); 
  const [statusFilter, setStatusFilter] = useState("");        
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const limit = 10; 

  // --- Meta Data ---
  const [availableLocations, setAvailableLocations] = useState([]);
  const [viewStudent, setViewStudent] = useState(null);

  /**
   * 1. Fetch Locations for Filter Dropdown
   * Hits: GET /students/onboarding-data (Inside Admin Middleware)
   */
  const fetchMetaData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_BASE}/students/onboarding-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableLocations(res.data.locations || []);
    } catch (err) {
      console.error("Meta fetch failed. Verify Admin login.", err);
    }
  };

  /**
   * 2. Main Student Fetch
   * Hits: GET /admin/students/list (Your NEW Admin Route)
   */
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_BASE}/admin/students/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: query,
          location: locationFilter === "All" ? "" : locationFilter,
          // FIX: Ensuring status is sent as lowercase ('active', 'pending')
          status: statusFilter ? statusFilter.toLowerCase() : "",
          page: page
        }
      });

      if (res.data.success) {
        setStudents(res.data.data);
        setTotal(res.data.meta.total);
        setLastPage(res.data.meta.last_page);
      }
    } catch (err) {
      console.error("Student list fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [page, query, locationFilter, statusFilter]);

  // Initial loads
  useEffect(() => { fetchMetaData(); }, []);
  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  /**
   * 3. Handle Actions
   */
  const handleSearch = (val) => {
    setQuery(val);
    setPage(1);
  };

  const toggleStatus = async (id, currentStatus) => {
      alert(`Action triggered for Student ID: ${id}. Current status: ${currentStatus}`);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-6 mb-12">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-gray-800 dark:text-white tracking-tighter italic uppercase leading-none">
              Network <span className="text-indigo-600">Students</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">
              Active Directory: <span className="text-indigo-600">{total} Profiles Syncing</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Region Select (Numeric IDs) */}
            <div className="relative group">
               <select
                className="appearance-none pl-10 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 text-sm font-bold bg-white dark:bg-gray-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-all"
                value={locationFilter}
                onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
              >
                <option value="All">All Regions</option>
                {availableLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.province_name}</option>
                ))}
              </select>
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
            </div>

            {/* Status Select */}
            <div className="relative group">
                <select
                className="appearance-none pl-10 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 text-sm font-bold bg-white dark:bg-gray-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-all"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Blocked</option>
                </select>
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
            </div>
          </div>
        </header>

        {/* SEARCH BAR */}
        <div className="mb-12 max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* DATA TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
          {loading ? (
             <div className="py-32 text-center">
                <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={40} />
                <p className="text-gray-400 font-black uppercase text-[10px] italic tracking-widest">Accessing Secure Records...</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/40 border-b dark:border-gray-800 italic text-center">
                    <th className="px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest text-left">Student Identity</th>
                    <th className="px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Hub</th>
                    <th className="px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Access</th>
                    <th className="px-8 py-6 font-bold text-gray-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {students.map((s) => (
                    <tr key={s.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                      <td className="px-8 py-5 flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white uppercase italic shadow-lg shadow-indigo-600/20">
                            {s.user?.name?.charAt(0) || <Users size={16}/>}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 dark:text-white uppercase italic tracking-tight leading-none mb-1">
                            {s.user?.name || "Missing Name"}
                          </div>
                          <div className="text-[10px] text-gray-400 lowercase font-medium">
                            {s.user?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center text-gray-500 text-xs font-bold uppercase italic tracking-tighter">
                        {s.province_name_text || "Unassigned"}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none ${
                            s.user?.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 
                            s.user?.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {s.user?.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setViewStudent(s)} 
                                className="p-3 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-2xl transition-all"
                            >
                                <Eye size={18} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && students.length === 0 && (
            <div className="py-24 text-center">
                <p className="text-gray-400 font-black uppercase text-xs italic tracking-[0.2em]">Zero records match the current filters</p>
                <button 
                    onClick={() => { setLocationFilter("All"); setStatusFilter(""); setQuery(""); }}
                    className="mt-4 text-indigo-600 text-[10px] font-black uppercase underline tracking-widest font-sans"
                >
                    Clear All Filters
                </button>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center mt-12 pb-20">
          <Pagination 
            currentPage={page} 
            totalItems={total} 
            itemsPerPage={limit} 
            onPageChange={setPage} 
          />
        </div>
      </div>

      {/* DETAIL VIEW MODAL */}
      {/* {viewStudent && (
        <StudentDetailView 
          student={{
            ...viewStudent, 
            name: viewStudent.user?.name, 
            email: viewStudent.user?.email,
            status: viewStudent.user?.status,
            province: viewStudent.province_name_text
          }} 
          onClose={() => setViewStudent(null)} 
        />
      )} */}
    {viewStudent && (
  <StudentDetailView 
    studentId={viewStudent.id}  // Change from student={...} to studentId={viewStudent.id}
    onClose={() => setViewStudent(null)} 
  />
)}

    </div>
  );
};

export default StudentPage;