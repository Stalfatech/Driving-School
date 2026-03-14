

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ApplicationModal from '../components/ApplicationReviewModal';
import { 
  Search, MapPin, ChevronRight, 
  Trash2, Plus, ChevronLeft, Calendar, User, Hash
} from 'lucide-react';

const Applications = () => {
  // 1. STATE MANAGEMENT
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({ last_page: 1, total: 0 });
  const [branches, setBranches] = useState([]);

  // 2. FETCH LOCATIONS
  const fetchOnboardingData = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://127.0.0.1:8000/api/students/onboarding-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.locations) {
        setBranches(response.data.locations);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  }, []);

  useEffect(() => {
    fetchOnboardingData();
  }, [fetchOnboardingData]);

  // 3. FETCH APPLICATIONS
  const fetchApplications = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const params = new URLSearchParams({
        status: 'pending',
        search: searchTerm,
        location: locationFilter,
        page: pageNumber 
      });

      const response = await axios.get(`http://127.0.0.1:8000/api/students?${params}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      if (response.data && response.data.success) {
        const rawData = response.data.data;
        setPaginationMeta({
          last_page: response.data.meta.last_page,
          total: response.data.meta.total
        });
        setCurrentPage(response.data.meta.current_page);

        const mappedData = rawData.map(item => ({
          id: `APP-${String(item.id).padStart(3, '0')}`,
          db_id: item.id,
          date: new Date(item.created_at).toLocaleDateString() + ' ' + new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          name: item.user?.name || 'Unknown Student',
          email: item.user?.email || 'N/A',
          mobile: item.user?.phone || 'N/A',
          location: item.province_name_text || 'N/A',
          status: item.user?.status || 'pending',
        }));
        setApplications(mappedData);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, locationFilter]);

  // 4. DELETE FUNCTION
  const handleDelete = async (db_id, studentName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the application for "${studentName}"?`);
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`http://127.0.0.1:8000/api/students/${db_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchApplications(currentPage);
      } catch (error) {
        alert("Failed to delete application.");
      }
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApplications(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, locationFilter, fetchApplications]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationMeta.last_page) {
      fetchApplications(newPage);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-background-dark transition-colors">
      <header className="px-4 md:px-8 pt-6 md:pt-8 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white uppercase italic">Pending Approvals</h1>
            <p className="text-xs md:text-sm text-slate-500 italic">Reviewing students awaiting account activation</p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 mb-6">
          <div className="flex gap-2 flex-1">
            <div className="group relative w-full md:w-80">
                <select 
                  value={locationFilter} 
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm dark:text-white outline-none focus:ring-2 focus:ring-teal cursor-pointer"
                >
                  <option value="All">All Locations / Provinces</option>
                  {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.province_name}</option>
                  ))}
                </select>
            </div>
            <div className="hidden md:flex items-center px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
               <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{paginationMeta.total} Total Found</span>
            </div>
          </div>

          {/* SEARCH BOX: Much bigger max-width */}
          <div className="relative w-full md:max-w-3xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Student Name or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-[#008B8B]/50 shadow-sm"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 md:px-8 pb-32 overflow-y-auto custom-scrollbar">
        {loading ? (
            <div className="flex justify-center py-20 text-[#008B8B] animate-pulse font-bold italic uppercase tracking-widest">Fetching from server...</div>
        ) : (
          <>
            {/* DESKTOP TABLE: Visible only on md and up */}
            <div className="hidden md:block bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr className="text-[11px] font-bold uppercase tracking-widest">
                      <th className="p-5">Application ID</th>
                      <th className="p-5">Student Details</th>
                      <th className="p-5">Location</th>
                      <th className="p-5">Date Submitted</th>
                      <th className="p-5 text-right">Actions</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                      <td className="p-5">
                          <div className="font-bold text-slate-900 dark:text-white leading-none mb-1">{app.id}</div>
                          <div className="text-[9px] font-black text-[#008B8B] uppercase tracking-widest">Pending Review</div>
                      </td>
                      <td className="p-5">
                          <div className="font-semibold text-slate-900 dark:text-white leading-tight">{app.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{app.email}</div>
                      </td>
                      <td className="p-5">
                          <div className="flex items-center gap-1.5 text-sm dark:text-slate-300">
                          <MapPin size={14} className="text-slate-400 shrink-0" />
                          {app.location}
                          </div>
                      </td>
                      <td className="p-5">
                          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">{app.date}</div>
                      </td>
                      <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                              <button onClick={() => setSelectedApp(app)} className="p-2 hover:bg-[#008B8B]/10 text-[#008B8B] rounded-lg font-bold text-xs flex items-center gap-2">
                                  Review <ChevronRight size={18} />
                              </button>
                              <button onClick={() => handleDelete(app.db_id, app.name)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg">
                                  <Trash2 size={18} />
                              </button>
                          </div>
                      </td>
                      </tr>
                  ))}
                  </tbody>
              </table>
            </div>

            {/* MOBILE LIST: Visible only on screens smaller than md */}
            <div className="md:hidden space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-[#008B8B]/10 text-[#008B8B] text-[10px] font-bold rounded-bl-xl uppercase tracking-widest">
                    Pending
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <User size={20} className="text-[#008B8B]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{app.name}</h3>
                      <p className="text-xs text-slate-500">{app.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5 text-[12px]">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 font-medium flex items-center gap-1"><Hash size={12}/> ID</span>
                      <span className="font-bold dark:text-slate-200">{app.id}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 font-medium flex items-center gap-1"><MapPin size={12}/> Location</span>
                      <span className="font-bold dark:text-slate-200 truncate">{app.location}</span>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <span className="text-slate-400 font-medium flex items-center gap-1"><Calendar size={12}/> Date Submitted</span>
                      <span className="font-bold dark:text-slate-200">{app.date}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedApp(app)}
                      className="flex-1 bg-[#008B8B] text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    >
                      Review Application <ChevronRight size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(app.db_id, app.name)}
                      className="px-3 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {applications.length === 0 && (
                <div className="py-20 text-center text-slate-400 italic text-sm">No applications found.</div>
            )}
          </>
        )}
      </div>

      {/* PAGINATION: Fixed to Bottom Center */}
      {!loading && paginationMeta.last_page > 1 && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center items-center gap-4 py-6 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm"
            >
                <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium dark:text-slate-400">Page</span>
                <span className="px-4 py-1.5 bg-[#008B8B] text-white rounded-lg text-sm font-bold shadow-lg shadow-[#008B8B]/20">
                    {currentPage}
                </span>
                <span className="text-xs font-medium dark:text-slate-400">of {paginationMeta.last_page}</span>
            </div>

            <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === paginationMeta.last_page}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      )}

      {selectedApp && (
        <ApplicationModal
          studentId={selectedApp.db_id}
          onClose={() => {
            setSelectedApp(null);
            fetchApplications(currentPage);
          }}
          onRefresh={() => fetchApplications(currentPage)}
        />
      )}
    </div>
  );
};

export default Applications;