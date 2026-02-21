import React, { useState } from 'react';
import ApplicationModal from '../components/ApplicationReviewModal';
import { 
  Search, MapPin, Filter, MoreHorizontal, ChevronRight, 
  Trash2, UserPlus, Mail, Phone, Calendar, AlertCircle 
} from 'lucide-react';

const initialApplications = [
  { 
    id: "APP-001", 
    date: "2026-02-19 14:20", 
    name: "James Harrison", 
    email: "james.h@example.com",
    mobile: "(555) 123-4567",
    location: "Burin",
    cityPostal: "A0E 1E0",
    priority: "High",
    status: "New",
    experience: "Beginner",
    dob: "2005-09-12",
    permitNumber: "BC-6623-HARR"
  },
  { 
    id: "APP-002", 
    date: "2026-02-18 09:15", 
    name: "Sarah Williams", 
    email: "s.williams@example.com",
    mobile: "(555) 987-6543",
    location: "St. John’s / Mount Pearl",
    cityPostal: "A1A 1A1",
    priority: "Normal",
    status: "Review",
    experience: "Intermediate",
    dob: "2004-08-22",
    permitNumber: "BC-5521-WILL"
  }
];

const Applications = () => {
  const [applications, setApplications] = useState(initialApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All'); // Location state
  const [selectedApp, setSelectedApp] = useState(null);

  // Updated filtering logic to include branch locations
  const filteredApps = applications.filter(app => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = app.name.toLowerCase().includes(term) || 
                          app.cityPostal.toLowerCase().includes(term) ||
                          app.location.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || app.priority === priorityFilter;
    const matchesLocation = locationFilter === 'All' || app.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesLocation;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors overflow-hidden">
      
      {/* 1. ADAPTIVE HEADER */}
      <header className="px-4 md:px-8 pt-6 md:pt-8 pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Lead Management</h1>
        <p className="text-xs md:text-sm text-slate-500 mb-6">Pipeline: Inquiry → Enrollment</p>

        {/* Filter Bar - Wraps on mobile */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 mb-6">
          <div className="grid grid-cols-2 md:flex gap-2 flex-1">
            {/* Location Filter - Added your specific branches */}
            <select 
              value={locationFilter} 
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm dark:text-white outline-none focus:ring-2 focus:ring-[#008B8B]/50"
            >
              <option value="All">All Branches</option>
              <option value="Burin">Burin</option>
              <option value="Grand Falls">Grand Falls</option>
              <option value="Marystown">Marystown</option>
              <option value="St. John’s / Mount Pearl">St. John’s / Mount Pearl</option>
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm dark:text-white outline-none focus:ring-2 focus:ring-[#008B8B]/50"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Review">Review</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="hidden md:block px-3 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm dark:text-white outline-none focus:ring-2 focus:ring-[#008B8B]/50"
            >
              <option value="All">All Priority</option>
              <option value="High">High Priority</option>
              <option value="Normal">Normal</option>
            </select>
          </div>

          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Name or Postal Code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm dark:text-white outline-none focus:ring-2 focus:ring-[#008B8B]/50"
            />
          </div>
        </div>
      </header>

      {/* 2. RESPONSIVE TABLE CONTAINER */}
      <div className="flex-1 px-4 md:px-8 pb-8 overflow-y-auto custom-scrollbar">
        
        {/* MOBILE VIEW: Card List */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredApps.map((app) => (
            <div key={app.id} className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all">
              {app.priority === 'High' && <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />}
              
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-bold dark:text-white">{app.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">ID: {app.id} • {app.date}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                  app.priority === 'High' ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {app.priority}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Mail size={14} className="text-[#008B8B]" /> {app.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <MapPin size={14} className="text-[#008B8B]" /> {app.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setSelectedApp(app)}
                  className="py-2.5 bg-[#008B8B] hover:bg-[#007373] text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Review
                </button>
                <button className="py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all active:scale-95">
                  Assign
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW: Table */}
        <div className="hidden md:block bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-[#1f2937]/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr className="text-[11px] font-bold uppercase tracking-widest">
                <th className="p-5">ID & Date</th>
                <th className="p-5">Student Details</th>
                <th className="p-5">Location</th>
                <th className="p-5">Priority</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="p-5">
                    <div className="font-bold text-slate-900 dark:text-white leading-none mb-1">{app.id}</div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-tight">{app.date}</div>
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
                    <div className="text-[10px] text-slate-400 pl-5">{app.cityPostal}</div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                      app.priority === 'High' 
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {app.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button onClick={() => setSelectedApp(app)} className="p-2 hover:bg-[#008B8B]/10 text-[#008B8B] rounded-lg transition-colors" title="Review Profile"><ChevronRight size={18} /></button>
                      <button className="p-2 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredApps.length === 0 && (
            <div className="py-20 text-center text-slate-400 dark:text-slate-500 italic text-sm">
              No applications found for these filters.
            </div>
          )}
        </div>
      </div>

      {selectedApp && (
        <ApplicationModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
};

export default Applications;