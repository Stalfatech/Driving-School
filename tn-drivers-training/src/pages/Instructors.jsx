
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InstructorDetailModal from '../components/InstructorDetailModal';
import InstructorRegistrationModal from '../components/InstructorRegistrationModal';
import Pagination from '../components/Pagination';
import { 
  Search, ScanEye, MapPin, Mail, Phone, Calendar, 
  Trash2, UserPlus, Download, Plus, ChevronRight, AlertCircle,
  Loader2, UserCheck, UserX, Car
} from 'lucide-react';
 
const Instructors = () => {
  // --- STATE ---
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
 
  // --- API CALLS ---
  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/instructors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstructors(response.data.data || response.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchInstructors();
  }, []);
 
  // After fetchInstructors completes, if a modal is open, sync the selected instructor
  // with the freshly fetched data so the modal reflects the latest state
  const fetchInstructorsAndSync = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/instructors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fresh = response.data.data || response.data;
      setInstructors(fresh);
 
      // If a modal is currently open, update selectedInstructor with fresh data
      if (selectedInstructor) {
        const updated = fresh.find(i => i.id === selectedInstructor.id);
        if (updated) setSelectedInstructor(updated);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };
 
  const handleToggleBlockStatus = async (instructorId) => {
    // Called from modal's onToggleBlock — just re-fetch and sync
    await fetchInstructorsAndSync();
  };
 
  const handleDeleteInstructor = async (id) => {
    // Called from modal's onDelete — re-fetch list
    await fetchInstructors();
  };
 
  // Helper function to get vehicle display text
  const getVehicleDisplay = (instructor) => {
    if (instructor.car) {
      if (instructor.car.car_name) return `${instructor.car.car_name} • ${instructor.car.number_plate || 'N/A'}`;
      if (instructor.car.name) return `${instructor.car.name} • ${instructor.car.plate || instructor.car.number_plate || 'N/A'}`;
      if (typeof instructor.car === 'string') return `${instructor.car} • ${instructor.plate || instructor.number_plate || 'N/A'}`;
    }
    const vehicleName = instructor.vehicle_details?.vehicle_name || instructor.vehicle || instructor.car_name || 'No vehicle';
    const plateNumber = instructor.vehicle_details?.plate_number || instructor.plate || instructor.number_plate || 'N/A';
    return `${vehicleName} • ${plateNumber}`;
  };
 
  // Get unique locations from instructors
  const locations = ['All', ...new Set(instructors.map(ins => ins.assigned_location).filter(Boolean))];
 
  // Filter instructors
  const filteredInstructors = instructors.filter(ins => {
    const matchesLocation = locationFilter === 'All' || ins.assigned_location === locationFilter;
    const matchesStatus = statusFilter === 'All' || ins.user?.status === statusFilter;
    const matchesSearch = 
      ins.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ins.id.toString().includes(searchTerm) ||
      ins.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLocation && matchesStatus && matchesSearch;
  });
const [exporting, setExporting] = useState(false);
  const handleExport = async () => {
  setExporting(true);
  try {
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams();

    // Pass current filters to the backend so the export matches what you see
    if (locationFilter !== 'All') params.append('location', locationFilter);
    if (statusFilter !== 'All') params.append('status', statusFilter);
    if (searchTerm) params.append('search', searchTerm);

    const response = await axios.get(`http://127.0.0.1:8000/api/instructors/export?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `instructors_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export error:", error);
    alert("Failed to export instructors. Please try again.");
  } finally {
    setExporting(false);
  }
};
 
  // Pagination logic
  const totalItems = filteredInstructors.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInstructors = filteredInstructors.slice(startIndex, startIndex + itemsPerPage);
 
  const handlePageChange = (page) => setCurrentPage(page);
 
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-teal-600" size={40} />
    </div>
  );
 
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      
      {/* HEADER */}
      <header className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
              Instructor <span className="text-teal-600 dark:text-teal-400">Management</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Manage instructor profiles, performance metrics, and student assignments
            </p>
          </div>
          <div className="flex justify-end w-full md:w-auto">
            <button 
              onClick={() => setIsRegModalOpen(true)} 
              className="w-full md:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[0.8rem] font-medium text-slate-900 dark:text-white hover:bg-teal-600 hover:text-white dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> New Instructor
            </button>
          </div>
        </div>
 
        {/* Filter Bar */}
        <div className="flex flex-col w-full lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2 sm:gap-3 flex-1">
            <div className="group relative w-full">
              <select 
                value={locationFilter} 
                onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
                ))}
              </select>
            </div>
 
            <div className="group relative w-full">
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
              >
                <option value="All">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Blocked</option>
              </select>
            </div>
          </div>
 
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Name, ID or Email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
            />
          </div>
        </div>
      </header>
 
      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 overflow-x-hidden">
        <div className="max-w-[1800px] mx-auto">
          
          {/* MOBILE VIEW (Cards) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {paginatedInstructors.map((ins) => (
              <div key={ins.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all">
                {ins.user?.status !== 'active' && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />}
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      ins.user?.status !== 'active'
                        ? 'bg-slate-400 dark:bg-slate-600 text-white' 
                        : 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                    }`}>
                      {ins.user?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">{ins.user?.name}</h3>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">ID: #{ins.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                    ins.user?.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {ins.user?.status === 'active' ? 'Active' : 'Blocked'}
                  </span>
                </div>
 
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Mail size={16} className="text-teal-500 shrink-0" /> 
                    <span className="truncate">{ins.user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin size={16} className="text-teal-500 shrink-0" /> 
                    <span>{ins.assigned_location || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Phone size={16} className="text-teal-500 shrink-0" /> 
                    <span>{ins.user?.phone || ins.user?.contact || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Car size={16} className="text-teal-500 shrink-0" /> 
                    <span className="truncate">{getVehicleDisplay(ins)}</span>
                  </div>
                </div>
 
                {/* Always show View Details — manage block/unblock from inside modal */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedInstructor(ins)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <ScanEye size={18} /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
 
          {/* DESKTOP VIEW (Table) */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Instructor Details</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Location</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Contact & Vehicle</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedInstructors.map((ins) => (
                    <tr key={ins.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                            ins.user?.status !== 'active'
                              ? 'bg-slate-400 dark:bg-slate-600' 
                              : 'bg-teal-500'
                          }`}>
                            {ins.user?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-base font-bold text-slate-800 dark:text-white">{ins.user?.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{ins.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <MapPin size={14} className="text-teal-500" /> {ins.assigned_location || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {ins.user?.phone || ins.user?.contact || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider flex items-center gap-1">
                          <Car size={12} className="text-teal-500" />
                          {getVehicleDisplay(ins)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          ins.user?.status === 'active' 
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${ins.user?.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                          {ins.user?.status === 'active' ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {/* Always ScanEye — block/unblock/delete is managed inside the modal */}
                        <button 
                          onClick={() => setSelectedInstructor(ins)}
                          className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all"
                          title="View Details"
                        >
                          <ScanEye size={22} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
 
          {filteredInstructors.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <AlertCircle className="mx-auto text-slate-300 mb-4" size={56} />
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No instructors found matching your filters.</p>
              <button 
                onClick={() => {
                  setLocationFilter("All");
                  setStatusFilter("All");
                  setSearchTerm("");
                  setCurrentPage(1);
                }} 
                className="mt-4 text-teal-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>
 
      {/* Pagination and Export Button Section */}
      {(totalItems > itemsPerPage || filteredInstructors.length > 0) && (
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          {totalItems > itemsPerPage && (
            <div className="flex justify-center py-4">
              <Pagination 
                currentPage={currentPage} 
                totalItems={totalItems} 
                itemsPerPage={itemsPerPage} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button 
  onClick={handleExport}
  disabled={exporting}
  className="w-full sm:w-auto px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[0.85rem] font-medium text-slate-900 dark:text-white hover:bg-teal-600 hover:text-white dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
>
  {exporting ? (
    <>
      <Loader2 size={18} className="animate-spin" />
      Exporting...
    </>
  ) : (
    <>
      <Download size={18} /> Export Instructors List
    </>
  )}
</button>
          </div>
        </div>
      )}
 
      {/* MODALS */}
      <InstructorRegistrationModal 
        isOpen={isRegModalOpen} 
        onClose={() => setIsRegModalOpen(false)} 
        onRefresh={fetchInstructors} 
      />
      
      {selectedInstructor && (
        <InstructorDetailModal
          instructor={selectedInstructor}
          allInstructors={instructors.filter(i => i.id !== selectedInstructor.id)}
          onClose={() => setSelectedInstructor(null)}
          onUpdate={fetchInstructorsAndSync}
          onToggleBlock={handleToggleBlockStatus}
          onDelete={handleDeleteInstructor}
        />
      )}
    </div>
  );
};
 
export default Instructors;