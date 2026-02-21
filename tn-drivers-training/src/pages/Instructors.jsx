import React, { useState } from 'react';
import InstructorDetailModal from '../components/InstructorDetailModal';
import { 
  Search, BadgeCheck, AlertTriangle, UserPlus, 
  Eye, MapPin, RefreshCcw, Car, Download, Plus, X, Phone, User
} from 'lucide-react';

const Instructors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);

  const [instructors, setInstructors] = useState([
    { 
      id: "INST-9821", 
      name: "Jean Dupont", 
      contact: "709-555-0123", 
      expiry: "2026-03-10", 
      vehicle: "Toyota Corolla", 
      plate: "V-882", 
      success: 92, 
      location: "Burin",
      status: "Active" 
    },
    { 
      id: "INST-4432", 
      name: "Sarah Miller", 
      contact: "709-555-4432", 
      expiry: "2026-05-20", 
      vehicle: "Honda Civic", 
      plate: "V-104", 
      success: 88, 
      location: "St. John’s / Mount Pearl",
      status: "Inactive" 
    }
  ]);

  const isExpiringSoon = (dateStr) => {
    const expiry = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diffDays < 30;
  };

  const toggleStatus = (id) => {
    setInstructors(prev => prev.map(ins => 
      ins.id === id ? { ...ins, status: ins.status === "Active" ? "Inactive" : "Active" } : ins
    ));
  };

  const filteredInstructors = instructors.filter(ins => {
    const matchesLocation = locationFilter === 'All Locations' || ins.location === locationFilter;
    const matchesSearch = ins.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ins.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLocation && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 transition-colors duration-300">
      
      {/* 1. ADAPTIVE HEADER */}
      <header className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md px-4 md:px-8 py-4 sticky top-0 z-40 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#008B8B]/50" 
              placeholder="Search name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
          >
            <option>All Locations</option>
            <option>Burin</option>
            <option>Grand Falls</option>
            <option>Marystown</option>
            <option>St. John’s / Mount Pearl</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-[#008B8B] font-bold text-xs uppercase tracking-widest transition-colors">
              <Download size={16} /> Export
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#008B8B] px-6 py-2 text-white rounded-xl shadow-lg shadow-[#008B8B]/20 transition-transform active:scale-95 text-sm font-bold">
              <Plus size={20} /> <span className="sm:inline">New Instructor</span>
            </button>
        </div>
      </header>

      <main className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Instructors Management</h1>
            <p className="text-sm text-slate-500">Track certifications, status, and assign students.</p>
          </div>
        </div>

        {/* 2. ADAPTIVE CONTENT: Card Grid for Mobile / Table for Desktop */}
        <section className="rounded-2xl overflow-hidden">
          
          {/* MOBILE VIEW: Card List (Hidden on md and up) */}
          <div className="grid grid-cols-1 gap-4 md:hidden pb-10">
            {filteredInstructors.map((ins) => (
              <div key={ins.id} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                {isExpiringSoon(ins.expiry) && (
                  <div className="absolute top-0 right-0 p-2 text-rose-500 animate-pulse">
                    <AlertTriangle size={18} />
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="size-12 rounded-full bg-[#008B8B] flex items-center justify-center font-bold text-white text-lg">
                    {ins.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold dark:text-white">{ins.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{ins.id} • {ins.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 border-y border-slate-100 dark:border-slate-800 py-3">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400">Cert Expiry</p>
                    <p className={`text-xs font-bold ${isExpiringSoon(ins.expiry) ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                      {ins.expiry}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400">Success Rate</p>
                    <p className="text-xs font-bold dark:text-white">{ins.success}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-5">
                   <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Car size={14} className="text-[#008B8B]" /> {ins.vehicle}
                   </div>
                   <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                      ins.status === "Active" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400"
                    }`}>
                      {ins.status}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setSelectedInstructor(ins)} className="flex-1 flex items-center justify-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"><Eye size={18} className="text-sky-500" /></button>
                  <button onClick={() => toggleStatus(ins.id)} className="flex-1 flex items-center justify-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"><RefreshCcw size={18} className="text-amber-500" /></button>
                  <button onClick={() => {setAssignTarget(ins); setIsAssignModalOpen(true);}} className="flex-[2] flex items-center justify-center bg-[#008B8B] text-white rounded-xl text-xs font-bold">Assign</button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: Standard Table (Hidden on small screens) */}
          <div className="hidden md:block bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1f2937]">
              <h6 className="m-0 font-bold text-[#008B8B]">Staff Tracking</h6>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-[#1f2937] text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Instructor Details</th>
                    <th className="px-6 py-4">Cert. Expiry</th>
                    <th className="px-6 py-4">Assigned Vehicle</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Success Rate</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredInstructors.map((ins) => (
                    <tr key={ins.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-[#008B8B] flex items-center justify-center font-bold text-white text-sm">
                            {ins.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{ins.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">ID: {ins.id} • {ins.contact}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`flex items-center gap-2 text-xs font-bold ${isExpiringSoon(ins.expiry) ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'}`}>
                          {isExpiringSoon(ins.expiry) && <AlertTriangle size={14} className="animate-pulse" />}
                          {ins.expiry}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Car size={14} className="text-[#008B8B]" /> {ins.vehicle}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 mt-1 uppercase">
                          {ins.plate}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                          ins.status === "Active" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400"
                        }`}>
                          {ins.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#008B8B] h-full" style={{ width: `${ins.success}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-white">{ins.success}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedInstructor(ins)} className="p-2 bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-200" title="View"><Eye size={16} /></button>
                          <button onClick={() => toggleStatus(ins.id)} className="p-2 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200" title="Toggle Status"><RefreshCcw size={16} /></button>
                          <button onClick={() => {setAssignTarget(ins); setIsAssignModalOpen(true);}} className="px-3 py-1.5 bg-[#008B8B] text-white rounded-lg text-xs font-bold transition-transform active:scale-95">Assign</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* 3. ASSIGNMENT MODAL (Already Responsive) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAssignModalOpen(false)} />
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h5 className="text-lg font-bold text-slate-900 dark:text-white">Student Assignment</h5>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Assigning student to <span className="text-[#008B8B] font-bold">{assignTarget?.name}</span>.</p>
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-2 tracking-widest">Select Student</label>
                <select className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white">
                   <option>Search student list...</option>
                   <option>James Harrison (Burin)</option>
                   <option>Sarah Williams (St. John's)</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-[#111827] flex gap-3">
              <button onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-2 text-slate-500 dark:text-slate-400 font-bold text-sm">Cancel</button>
              <button className="flex-1 py-2 bg-[#008B8B] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#008B8B]/20 transition-all active:scale-95">Confirm Assignment</button>
            </div>
          </div>
        </div>
      )}

      {selectedInstructor && (
        <InstructorDetailModal instructor={selectedInstructor} onClose={() => setSelectedInstructor(null)} />
      )}
    </div>
  );
};

export default Instructors;
