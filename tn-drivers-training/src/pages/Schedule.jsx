import React, { useState, useMemo, useCallback } from "react";
import { 
  MapPin, 
  Briefcase, 
  Calendar as CalendarIcon, 
  Plus, 
  Search,
  X,
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";

const Schedule = () => {
  // 1. DATA DEFINITIONS (Define these first to avoid ReferenceErrors)
  const places = ["All Places", "Burin", "Grand Falls", "Marystown", "St. John's", "Mount Pearl"];

  const [instructors, setInstructors] = useState([
    { id: 1, name: "John Doe", place: "St. John's", currentTask: "City Driving", load: "High", startDate: "2026-02-01", endDate: "2026-02-15" },
    { id: 2, name: "Jane Smith", place: "Marystown", currentTask: "Unassigned", load: "Low", startDate: null, endDate: null },
    { id: 3, name: "Sarah Connor", place: "Burin", currentTask: "Parking Drills", load: "Medium", startDate: "2026-01-10", endDate: "2026-01-30" },
    { id: 4, name: "Mike Ross", place: "Grand Falls", currentTask: "Theory Class", load: "Medium", startDate: "2026-02-10", endDate: "2026-03-10" },
    { id: 5, name: "Harvey Specter", place: "St. John's", currentTask: "Mock Test", load: "Low", startDate: "2026-02-18", endDate: "2026-02-25" },
    { id: 6, name: "Donna Paulsen", place: "Mount Pearl", currentTask: "Admin", load: "High", startDate: "2026-02-01", endDate: "2026-02-28" },
  ]);

  // 2. STATE
  const [selectedPlace, setSelectedPlace] = useState("All Places");
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // 3. LOGIC: TASK STATUS & EXPIRY
  const getTaskStatus = (endDate) => {
    if (!endDate) return { label: "Idle", color: "text-slate-400 bg-slate-100", icon: <Clock size={10}/> };
    
    const today = new Date();
    const expiryDate = new Date(endDate);
    
    if (today > expiryDate) {
      return { label: "Expired", color: "text-red-600 bg-red-100 dark:bg-red-900/20", icon: <AlertCircle size={10}/> };
    }
    return { label: "Assigned", color: "text-green-600 bg-green-100 dark:bg-green-900/20", icon: <CheckCircle2 size={10}/> };
  };

  // 4. LOGIC: SEARCH & FILTER (useCallback fixes the Pagination snap-back bug)
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1); 
  }, []);

  const filteredInstructors = useMemo(() => {
    return instructors.filter((ins) => {
      const matchesPlace = selectedPlace === "All Places" || ins.place === selectedPlace;
      const matchesSearch = ins.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ins.currentTask.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlace && matchesSearch;
    });
  }, [selectedPlace, searchQuery, instructors]);

  // 5. PAGINATION SLICING
  const totalItems = filteredInstructors.length;
  const currentInstructors = filteredInstructors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-3 sm:p-6 lg:p-10 bg-slate-50 dark:bg-[#020617] min-h-screen font-sans transition-colors overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Duty <span className="text-indigo-600">Dispatch</span>
            </h1>
            <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mt-2">
              Staff Timelines & Tasking
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* REGION FILTER */}
        <div className="flex flex-wrap justify-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          {places.map((place) => (
            <button
              key={place}
              onClick={() => { setSelectedPlace(place); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedPlace === place 
                ? "bg-indigo-600 text-white shadow-lg" 
                : "text-slate-400 hover:text-indigo-600"
              }`}
            >
              {place}
            </button>
          ))}
        </div>

        {/* INSTRUCTOR GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentInstructors.map((ins) => {
            const status = getTaskStatus(ins.endDate);
            return (
              <div 
                key={ins.id}
                onClick={() => { setSelectedInstructor(ins); setIsAssignModalOpen(true); }}
                className="group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl hover:translate-y-2 transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Status Badges */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${status.color}`}>
                    {status.icon} {status.label}
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${ins.load === 'Low' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {ins.load} Load
                  </span>
                </div>

                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black text-xl">
                    {ins.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">{ins.name}</h3>
                    <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <MapPin size={10} className="text-indigo-500" /> {ins.place}
                    </div>
                  </div>
                </div>

                {/* TIMELINE SECTION */}
                <div className="mt-8 space-y-3 relative z-10 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-slate-400">Current Assignment</span>
                    <span className="text-[10px] font-black text-indigo-600 uppercase italic">{ins.currentTask}</span>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    {ins.startDate ? (
                      <div className="flex items-center justify-between text-[10px] font-black text-slate-500 dark:text-slate-400">
                         <div className="flex flex-col">
                            <span className="text-[7px] uppercase opacity-60">From</span>
                            {ins.startDate}
                         </div>
                         <div className="h-0.5 w-8 bg-indigo-200"></div>
                         <div className="flex flex-col text-right">
                            <span className="text-[7px] uppercase opacity-60">To</span>
                            {ins.endDate}
                         </div>
                      </div>
                    ) : (
                      <div className="text-center py-1 text-[9px] font-black text-slate-400 uppercase italic">
                        No active timeline
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 dark:bg-indigo-900/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center pt-8">
          <Pagination 
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* TASK ASSIGNMENT MODAL (Logic included to update state) */}
      {isAssignModalOpen && (
        <Modal 
          instructor={selectedInstructor} 
          onClose={() => setIsAssignModalOpen(false)}
          onSave={(updatedData) => {
             setInstructors(prev => prev.map(i => i.id === selectedInstructor.id ? {...i, ...updatedData} : i));
             setIsAssignModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Internal Modal Component for brevity
const Modal = ({ instructor, onClose, onSave }) => {
  const [task, setTask] = useState("Parking Section Handling");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Assign <span className="text-indigo-600">Work Block</span></h2>
          <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-red-500" /></button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Work Category</label>
            <select value={task} onChange={(e) => setTask(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold text-sm outline-none dark:text-white">
              <option>Parking Section Handling</option>
              <option>City Traffic Navigation</option>
              <option>Highway Entry/Exit Drills</option>
              <option>Mock Road Test Simulation</option>
            </select>
            
            <div className="grid grid-cols-2 gap-4">
              <input type="date" onChange={(e) => setStart(e.target.value)} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold text-xs dark:text-white" />
              <input type="date" onChange={(e) => setEnd(e.target.value)} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold text-xs dark:text-white" />
            </div>
          </div>
          <button 
            onClick={() => onSave({ currentTask: task, startDate: start, endDate: end })}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:translate-y-0.5 transition-all"
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Schedule;