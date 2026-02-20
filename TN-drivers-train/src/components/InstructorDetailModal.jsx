import React, { useState } from 'react';
import { X, User, Phone, MapPin, GraduationCap, Car, ChevronDown } from 'lucide-react';

const InstructorDetailModal = ({ instructor, onClose }) => {
  // Local state for vehicle assignment
  const [assignedVehicle, setAssignedVehicle] = useState(instructor.plate || "");

  // Mock mentoring list
  const students = [
    { name: "Emily Davis", status: "In Progress", package: "Full GDL" },
    { name: "Michael Chen", status: "Road Test Prep", package: "Basic 10hr" }
  ];

  // Mock Vehicle List for Dropdown
  const availableVehicles = [
    { model: "Toyota Corolla", plate: "V-882" },
    { model: "Honda Civic", plate: "V-104" },
    { model: "Mazda 3", plate: "V-229" }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
            <User className="text-[#008B8B]"/> Instructor Profile
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X size={20}/>
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Instructor Identity */}
          <div className="flex gap-4 items-center">
            <div className="size-16 rounded-full bg-[#008B8B] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#008B8B]/20">
              {instructor.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold dark:text-white">{instructor.name}</h3>
              <p className="text-xs text-slate-500 font-mono tracking-tight uppercase">ID: {instructor.id}</p>
            </div>
          </div>

          {/* Contact & Location Info */}
          <div className="grid grid-cols-2 gap-4 text-sm border-t dark:border-slate-700 pt-4">
             <div>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Mobile</p>
                <p className="font-semibold dark:text-slate-200">{instructor.contact || instructor.phone}</p>
             </div>
             <div>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Base Location</p>
                <p className="font-semibold dark:text-slate-200">{instructor.location}</p>
             </div>
          </div>

          {/* NEW: Vehicle Assignment Dropdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2 border-b dark:border-slate-700 pb-2 dark:text-white">
              <Car size={16} className="text-[#008B8B]"/> Assigned Vehicle
            </h4>
            <div className="relative">
              <select 
                value={assignedVehicle}
                onChange={(e) => setAssignedVehicle(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-[#008B8B]/50 outline-none transition-all"
              >
                <option value="">Select a vehicle...</option>
                {availableVehicles.map((v) => (
                  <option key={v.plate} value={v.plate}>
                    {v.model} ({v.plate})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Mentoring List */}
          <div className="space-y-3">
             <h4 className="text-sm font-bold flex items-center gap-2 border-b dark:border-slate-700 pb-2 dark:text-white">
               <GraduationCap size={16} className="text-[#008B8B]"/> Current Mentoring List
             </h4>
             <div className="space-y-2">
                {students.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-[#0f172a] p-3 rounded-xl border dark:border-slate-700">
                    <span className="text-sm font-bold dark:text-white">{s.name}</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-bold uppercase">
                      {s.status}
                    </span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              console.log("Updating vehicle to:", assignedVehicle);
              onClose();
            }}
            className="flex-1 py-2.5 bg-[#008B8B] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#008B8B]/20 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetailModal;