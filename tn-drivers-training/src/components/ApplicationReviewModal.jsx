import React, { useState } from 'react';
import { 
  X, BarChart, ChevronDown, UserPlus, 
  MapPin, ShieldCheck, Mail, Calendar, Send
} from 'lucide-react';

// --- Instructor Database matches the client's city requirements ---
const instructorsByLocation = {
  "Burin": ["Capt. John Miller", "Sarah Pierce"],
  "Grand Falls": ["Robert Squires", "Linda Walsh"],
  "Marystown": ["Kevin Butler", "Michelle King"],
  "St. John’s / Mount Pearl": ["Alex Mercer", "Brittany Snow", "Chris Pike"],
  "Surrey, BC": ["Navdeep Singh", "Harprit Kaur"],
  "Vancouver, BC": ["Michael Scott", "Jim Halpert"]
};

const ApplicationModal = ({ app, onClose, onStatusChange }) => {
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("Full GDL Program");
  
  if (!app) return null;

  const availableInstructors = instructorsByLocation[app.location] || [];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Responsive Modal Card */}
      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          
         {/* 1. Header */}
         <div className="p-6 md:p-8 pb-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start shrink-0">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Review Application</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs md:text-sm">
                Lead: <span className="text-slate-900 dark:text-slate-200 font-medium">{app.name}</span> <span className="text-teal">({app.id})</span>
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
              <X size={20} />
            </button>
         </div>

         {/* 2. Content Body (Scrollable) */}
         <div className="p-6 md:p-8 pt-6 space-y-6 overflow-y-auto custom-scrollbar">
            
            {/* DOB & Permit Info (Age Check Section) */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">DOB (Age Check)</label>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
                     <Calendar size={14} className="text-teal" />
                     {app.dob}
                  </div>
               </div>
               <div className="space-y-1 border-l border-slate-200 dark:border-slate-700 pl-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Permit Number</label>
                  <p className="text-teal font-mono font-bold text-sm tracking-tight">{app.permitNumber}</p>
               </div>
            </div>

            {/* Experience & Email Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Experience Level</label>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-medium">
                     <BarChart size={14} className="text-teal" />
                     {app.experience}
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">City / Province</label>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-medium">
                     <MapPin size={14} className="text-teal" />
                     {app.location}
                  </div>
               </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Selection Section */}
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Training Package</label>
                  <div className="relative">
                    <select 
                      value={selectedPackage}
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:ring-2 focus:ring-teal/20 outline-none"
                    >
                        <option>Full GDL Program</option>
                        <option>Basic 10hr Training</option>
                        <option>Advanced Road Test Prep</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assign Instructor ({app.location})</label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      value={selectedInstructor}
                      onChange={(e) => setSelectedInstructor(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm dark:text-white focus:ring-2 focus:ring-teal/20 outline-none"
                    >
                      <option value="">Select Instructor...</option>
                      {availableInstructors.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
               </div>
            </div>
         </div>

         {/* 3. Footer Actions (Standard Specifications) */}
         <div className="p-6 bg-slate-50 dark:bg-slate-900/40 flex flex-col gap-3 shrink-0">
            <button 
                onClick={() => onStatusChange(app.id, 'Approved')}
                disabled={!selectedInstructor}
                className="w-full py-3 bg-navy hover:bg-[#002855] disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-navy/20 transition-all flex items-center justify-center gap-2"
            >
               <Send size={16} /> Approve & Send Welcome Email
            </button>
            <button 
                onClick={() => onStatusChange(app.id, 'Rejected')}
                className="w-full py-2 text-rose-500 hover:text-rose-600 font-bold text-sm transition-colors"
            >
               Reject Application
            </button>
         </div>
      </div>
    </div>
  );
};
export default ApplicationModal;