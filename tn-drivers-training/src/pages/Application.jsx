import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ApplicationModal from '../components/ApplicationReviewModal';
import Pagination from '../components/Pagination';
import { 
  Search, ScanEye, MapPin, Mail, Trash2, 
  AlertCircle
} from 'lucide-react';

const Applications = () => {
  // 1. STATE MANAGEMENT
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState(null);
  const [branches, setBranches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({ last_page: 1, total: 0 });

  // 2. FETCH LOCATIONS
  const fetchLocations = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://127.0.0.1:8000/api/locations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data) {
        setBranches(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return 18;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get priority based on age
  const getPriority = (age) => {
    if (age < 18) return 'Normal';
    return 'High';
  };

  // 3. FETCH APPLICATIONS
  const fetchApplications = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const params = new URLSearchParams({
        status: 'pending',
        page: pageNumber
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (locationFilter !== 'All') {
        params.append('location', locationFilter);
      }

      const response = await axios.get(`http://127.0.0.1:8000/api/students?${params}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      if (response.data && response.data.success) {
        const rawData = response.data.data;
        
        setPaginationMeta({
          last_page: response.data.meta?.last_page || 1,
          total: response.data.meta?.total || 0,
        });
        setCurrentPage(response.data.meta?.current_page || 1);

        const mappedData = rawData.map(item => {
          const age = calculateAge(item.dob);
          const priority = getPriority(age);
          
          let locationName = item.province_name_text || 'N/A';
          
          return {
            id: `APP-${String(item.id).padStart(3, '0')}`,
            db_id: item.id,
            date: new Date(item.created_at).toLocaleDateString() + ' ' + new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            name: item.user?.name || 'Unknown Student',
            email: item.user?.email || 'N/A',
            mobile: item.user?.phone || 'N/A',
            location: locationName,
            priority: priority,
            status: item.user?.status || 'pending',
          };
        });
        
        setApplications(mappedData);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, locationFilter]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchApplications(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, locationFilter, fetchApplications]);

  // 4. DELETE FUNCTION
  const handleDelete = async (db_id, studentName, e) => {
    e?.stopPropagation();
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationMeta.last_page) {
      fetchApplications(newPage);
    }
  };

  // Calculate items per page from total and last_page
  const itemsPerPage = paginationMeta.total > 0 && paginationMeta.last_page > 0 
    ? Math.ceil(paginationMeta.total / paginationMeta.last_page) 
    : 2;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors w-full">
      
      {/* HEADER SECTION */}
      <header className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
              Application <span className="text-teal-600 dark:text-teal-400">Management</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
              Manage student enrollment and branch assignments.
            </p>
          </div>

          {/* FILTER BAR */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2 sm:gap-3 flex-1">
              
              {/* Branch Filter */}
              <select 
                value={locationFilter} 
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
              >
                <option value="All">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.province_name}</option>
                ))}
              </select>

              {/* Total Count Badge */}
              <div className="hidden md:flex items-center px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                  {paginationMeta.total} Pending Applications
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 overflow-x-hidden">
        <div className="max-w-[1800px] mx-auto">
          
          {/* MOBILE VIEW */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
                <p className="text-sm text-slate-500 mt-2">Loading applications...</p>
              </div>
            ) : applications.map((app) => (
              <div key={app.id} className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
                {app.priority === 'High' && <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-2xl" />}
                
                <div className="flex justify-between items-start gap-2 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate">{app.name}</h3>
                    <p className="text-[10px] sm:text-xs font-mono text-slate-400 mt-1 uppercase">{app.id} • {app.date}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    app.priority === 'High' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                  }`}>
                    {app.priority}
                  </span>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <Mail size={14} className="text-teal-500 shrink-0" /> 
                    <span className="truncate">{app.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <MapPin size={14} className="text-teal-500 shrink-0" /> 
                    <span className="truncate">{app.location}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedApp(app)} 
                    className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <ScanEye size={16} /> Review
                  </button>
                  <button 
                    onClick={(e) => handleDelete(app.db_id, app.name, e)} 
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] lg:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    <th className="px-4 lg:px-6 py-4">ID & Date</th>
                    <th className="px-4 lg:px-6 py-4">Student</th>
                    <th className="px-4 lg:px-6 py-4">Location</th>
                    <th className="px-4 lg:px-6 py-4">Priority</th>
                    <th className="px-4 lg:px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
                        <p className="text-sm text-slate-500 mt-2">Loading applications...</p>
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No pending applications found</td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 lg:px-6 py-4 lg:py-5">
                          <div className="text-sm font-bold text-slate-800 dark:text-white">{app.id}</div>
                          <div className="text-[11px] text-slate-400 mt-1">{app.date}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 lg:py-5">
                          <div className="text-sm lg:text-base font-semibold text-slate-800 dark:text-white">{app.name}</div>
                          <div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">{app.email}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 lg:py-5">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <MapPin size={14} className="text-teal-500 shrink-0" />
                            <span className="truncate max-w-[150px]">{app.location}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 lg:py-5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] w-20 justify-center font-bold uppercase ${
                            app.priority === 'High' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30' 
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                          }`}>
                            {app.priority}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 lg:py-5 text-right">
                          <div className="flex items-center justify-end gap-1 lg:gap-3">
                            <button 
                              onClick={() => setSelectedApp(app)} 
                              className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all"
                              title="Review Application"
                            >
                              <ScanEye size={20} />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(app.db_id, app.name, e)} 
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              title="Delete Application"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && applications.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <AlertCircle className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">No pending applications found.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setLocationFilter('All');
                }}
                className="mt-4 text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* PAGINATION - Under the table */}
      {!loading && paginationMeta.total > 0 && paginationMeta.last_page > 1 && (
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex justify-center">
            <Pagination 
              currentPage={currentPage}
              totalItems={paginationMeta.total}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      {/* Application Review Modal */}
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