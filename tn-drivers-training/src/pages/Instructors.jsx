
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import InstructorDetailModal from '../components/InstructorDetailModal';
import InstructorRegistrationModal from '../components/InstructorRegistrationModal';
import { 
  Search, Eye, Plus, CheckCircle, Download, Loader2, UserCheck, UserX
} from 'lucide-react';

const Instructors = () => {
  // --- STATE ---
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [statusFilter, setStatusFilter] = useState('active'); // active or inactive
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

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

  const handleActivate = async (instructor) => {
  try {
    const token = localStorage.getItem('access_token');
    
    await axios.post(`http://127.0.0.1:8000/api/instructors/update/${instructor.id}`, 
      { 
        _method: 'PUT', // Method spoofing for Laravel
        status: 'active' 
      },
      { headers: { Authorization: `Bearer ${token}` }}
    );

    alert("Instructor account has been restored!");
    fetchInstructors(); 
  } catch (err) {
    console.error("Activation Error:", err.response);
    alert(err.response?.data?.message || "Activation failed");
  }
};

  // --- FILTERS (Supports Location, Search, and Status simultaneously) ---
  const filteredInstructors = instructors.filter(ins => {
    const matchesLocation = locationFilter === 'All Locations' || ins.assigned_location === locationFilter;
    const matchesStatus = ins.user?.status === statusFilter;
    const matchesSearch = 
      ins.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ins.id.toString().includes(searchTerm);
    
    return matchesLocation && matchesStatus && matchesSearch;
  });

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-slate-200 transition-colors duration-300 font-['Lexend']">
      
      {/* HEADER / FILTERS */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-md px-4 md:px-8 py-4 sticky top-0 z-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 max-w-7xl mx-auto">
          
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            {/* SEARCH */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
                placeholder="Search name or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* LOCATION SELECT */}
            <select 
              value={locationFilter} 
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none cursor-pointer"
            >
              <option>All Locations</option>
              <option value="Burin">Burin</option>
              <option value="Marystown">Marystown</option>
              <option value="St. John’s">St. John’s</option>
            </select>

            {/* STATUS TOGGLE FILTER */}
            <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setStatusFilter('active')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${statusFilter === 'active' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}
              >
                <UserCheck size={14} /> Active
              </button>
              <button 
                onClick={() => setStatusFilter('inactive')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${statusFilter === 'inactive' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' : 'text-slate-400'}`}
              >
                <UserX size={14} /> Inactive
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsRegModalOpen(true)} 
              className="flex items-center gap-2 bg-[#2563eb] px-6 py-2.5 text-white rounded-xl shadow-lg active:scale-95 text-sm font-bold transition-all"
            >
              <Plus size={20} /> New Instructor
            </button>
          </div>
        </div>
      </header>

      {/* MAIN TABLE */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-5">Instructor Information</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5">Current Status</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
  {filteredInstructors.map((ins) => (
    <tr key={ins.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all duration-200">
      
      {/* 1. Instructor Info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-black text-sm border border-blue-100 dark:border-blue-800">
            {ins.user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{ins.user?.name}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-bold">ID: #{ins.id}</p>
          </div>
        </div>
      </td>

      {/* 2. Location */}
      <td className="px-6 py-4">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{ins.assigned_location}</span>
      </td>

      {/* 3. Current Status (Conditional) */}
      <td className="px-6 py-4">
        {statusFilter === 'active' ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500"></span>
            Active
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100">
            <span className="size-1.5 rounded-full bg-rose-500"></span>
            Blocked
          </div>
        )}
      </td>
      
      {/* 4. Actions (Hover Only) */}
      <td className="px-6 py-4 text-right">
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex justify-end">
          {statusFilter === 'active' ? (
            <button 
              onClick={() => setSelectedInstructor(ins)} 
              className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white shadow-sm"
              title="View Details"
            >
              <Eye size={18} />
            </button>
          ) : (
            <button 
              onClick={() => handleActivate(ins)} 
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-200 active:scale-95 transition-all hover:bg-emerald-700"
            >
              <CheckCircle size={14} /> UnBlock
            </button>
          )}
        </div>
      </td>
    </tr>
  ))}
</tbody>
          </table>
          
          {filteredInstructors.length === 0 && (
            <div className="py-20 text-center">
              <div className="size-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Search size={32} />
              </div>
              <p className="text-slate-400 text-sm font-medium italic">No {statusFilter} instructors found.</p>
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      <InstructorRegistrationModal 
        isOpen={isRegModalOpen} 
        onClose={() => setIsRegModalOpen(false)} 
        onRefresh={fetchInstructors} 
      />
      
      {selectedInstructor && (
        <InstructorDetailModal
            instructor={selectedInstructor}
            allInstructors={instructors}
            onClose={() => setSelectedInstructor(null)}
            onUpdate={fetchInstructors}
        />
      )}
    </div>
  );
};

export default Instructors;