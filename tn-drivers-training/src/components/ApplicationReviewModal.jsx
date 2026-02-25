import React, { useState, useMemo } from 'react';
import { 
  X, BarChart, ChevronDown, UserPlus, 
  MapPin, ShieldCheck, Calendar, Send, CreditCard, Award
} from 'lucide-react';

// --- Instructor Database (Filtered by Location) ---
const instructorsByLocation = {
  "Burin": ["Capt. John Miller", "Sarah Pierce"],
  "Grand Falls": ["Robert Squires", "Linda Walsh"],
  "Marystown": ["Kevin Butler", "Michelle King"],
  "St. John’s / Mount Pearl": ["Alex Mercer", "Brittany Snow", "Chris Pike"],
  "Surrey, BC": ["Navdeep Singh", "Harprit Kaur"],
  "Vancouver, BC": ["Michael Scott", "Jim Halpert"]
};

// --- Package Pricing ---
const packages = {
  "Full GDL Program": 850.00,
  "Basic 10hr Training": 550.00,
  "Advanced Road Test Prep": 250.00
};

// --- Regional Tax Mapping ---
const locationTaxRates = {
  "Burin": { name: "HST", rate: 0.15 },
  "Grand Falls": { name: "HST", rate: 0.15 },
  "Marystown": { name: "HST", rate: 0.15 },
  "St. John’s / Mount Pearl": { name: "HST", rate: 0.15 },
  "Surrey, BC": { name: "GST+PST", rate: 0.12 },
  "Vancouver, BC": { name: "GST+PST", rate: 0.12 }
};

const ApplicationModal = ({ app, onClose, onStatusChange }) => {
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("Full GDL Program");
  
  if (!app) return null;

  // Logic to only show instructors for the application's location
  const availableInstructors = instructorsByLocation[app.location] || [];

  // Dynamic Billing Calculation
  const invoice = useMemo(() => {
    const basePrice = packages[selectedPackage] || 0;
    const taxConfig = locationTaxRates[app.location] || { name: "GST", rate: 0.05 };
    const taxAmount = basePrice * taxConfig.rate;
    const total = basePrice + taxAmount;

    return {
      subtotal: basePrice,
      taxName: taxConfig.name,
      taxRate: (taxConfig.rate * 100).toFixed(0) + "%",
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2)
    };
  }, [selectedPackage, app.location]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
        
        {/* 1. HEADER (Now includes Location) */}
        <div className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic leading-none">
              Review <span className="text-[#008B8B]">Application</span>
            </h2>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#008B8B]/10 text-[#008B8B] rounded-lg text-[10px] font-black uppercase tracking-widest">
                <MapPin size={12} /> {app.location}
              </span>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">ID: {app.id}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* 2. SCROLLABLE BODY */}
        <div className="p-8 space-y-8 overflow-y-auto scrollbar-hide">
          
          {/* VIEW FIELDS: DOB, Permit, Experience, Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">DOB (Age Check)</label>
              <p className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Calendar size={14} className="text-[#008B8B]" /> {app.dob || "1998-05-12"}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Permit Number</label>
              <p className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <ShieldCheck size={14} className="text-[#008B8B]" /> {app.permitNumber || "NF-22019"}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">City/Branch</label>
              <p className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm uppercase">
                <MapPin size={14} className="text-[#008B8B]" /> {app.location}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Experience Level</label>
              <p className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm uppercase">
                <Award size={14} className="text-[#008B8B]" /> {app.experience || "Beginner"}
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

          {/* SELECTORS */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={14} className="text-[#008B8B]"/> Select Training Package
              </label>
              <div className="relative">
                <select 
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold dark:text-white focus:ring-2 focus:ring-[#008B8B]/20 outline-none cursor-pointer"
                >
                  {Object.keys(packages).map(pkg => <option key={pkg}>{pkg}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* DYNAMIC BILLING PREVIEW */}
            <div className="bg-[#1e293b] p-6 rounded-[2rem] border border-slate-700 space-y-3 relative overflow-hidden group">
               <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <span>Base Rate</span>
                  <span className="text-white font-mono">${invoice.subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <span>{invoice.taxName} ({invoice.taxRate})</span>
                  <span className="text-white font-mono">+ ${invoice.taxAmount}</span>
               </div>
               <div className="h-px bg-slate-700 w-full" />
               <div className="flex justify-between items-center relative z-10">
                  <span className="text-[#008B8B] font-black text-xs uppercase tracking-[0.2em]">Final Total</span>
                  <span className="text-white text-3xl font-black italic">${invoice.total} <span className="text-[10px] opacity-40 not-italic uppercase font-bold ml-1">CAD</span></span>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserPlus size={14} className="text-[#008B8B]"/> Assign Local Instructor
              </label>
              <div className="relative">
                <select 
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold dark:text-white focus:ring-2 focus:ring-[#008B8B]/20 outline-none cursor-pointer"
                >
                  <option value="">Choose Instructor from {app.location}...</option>
                  {availableInstructors.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
              {availableInstructors.length === 0 && (
                <p className="text-[10px] text-rose-500 font-bold uppercase mt-1 px-2">No instructors available in this region.</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. FOOTER ACTIONS */}
        <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t dark:border-slate-800 flex flex-col gap-3 shrink-0">
          <button 
            onClick={() => onStatusChange(app.id, 'Approved', { package: selectedPackage, total: invoice.total, instructor: selectedInstructor })}
            disabled={!selectedInstructor}
            className="w-full py-4 bg-[#008B8B] hover:bg-teal-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[#008B8B]/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Send size={16} /> Approve & Send Welcome Email
          </button>
          
          <button 
            onClick={() => onStatusChange(app.id, 'Rejected')}
            className="w-full py-3 text-rose-500 hover:text-rose-600 font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
          >
            Reject Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;