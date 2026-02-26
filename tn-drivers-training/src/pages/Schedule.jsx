import React, { useState, useMemo } from "react";
import { 
  MapPin, Calendar as CalendarIcon, Search, X, 
  Clock, AlertCircle, CheckCircle2, Edit3, Trash2, 
  Users, ChevronRight, ArrowLeft, UserPlus, 
  Filter, History, Settings2
} from "lucide-react";

import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";

const Schedule = () => {
  // --- 1. DATA ---
  const places = ["All Places", "Burin", "Grand Falls", "Marystown", "St. John's", "Mount Pearl"];
  const residentAreas = ["All Areas", "Burin Bay Arm", "Burin Heritage", "Salt Pond", "Epworth", "Marystown", "St. John's"];

  const [instructors, setInstructors] = useState([
    { id: 1, name: "John Doe", place: "St. John's", currentTask: "City Driving", load: "High", startDate: "2026-03-01", endDate: "2026-03-15" },
    { id: 2, name: "Jane Smith", place: "Marystown", currentTask: "Parking Drills", load: "Medium", startDate: "2026-03-01", endDate: "2026-03-07" },
    { id: 3, name: "Sarah Connor", place: "Burin", currentTask: "Unassigned", load: "Low", startDate: null, endDate: null },
    { id: 4, name: "Mike Ross", place: "Grand Falls", currentTask: "Mock Road Test", load: "High", startDate: "2026-03-05", endDate: "2026-03-20" },
  ]);

  const [studentPool] = useState([
    { id: 'S1', name: "Muhammed Salman", area: "burin loc1", pickup: "Residence Lot 4", email: "salman@tech.com", progress: 40 },
    { id: 'S2', name: "Alex Rivera", area: "Burin Heritage", pickup: "Heritage Museum", email: "alex@drive.com", progress: 65 },
    { id: 'S3', name: "Sam Chen", area: "buurin loc2", pickup: "Main Gate", email: "sam@drive.com", progress: 30 },
    { id: 'S4', name: "Yuki Tanaka", area: "Salt Pond", pickup: "Epworth Well", email: "yuki@global.com", progress: 90 },
    { id: 'S5', name: "Jordan Lee", area: "burin heritage ", pickup: "Downtown Mall", email: "jordan@example.com", progress: 15 },
  ]);

  const [sessions, setSessions] = useState([
    { id: 1001, instructorId: 2, name: "Muhammed Salman", area: "Marystown", date: "2026-03-02", timeSlot: "09:00 - 10:00", pickup: "Residence Lot 4", status: "Active" },
  ]);

  // --- 2. STATES ---
  const [viewMode, setViewMode] = useState("instructors"); 
  const [activeSubTab, setActiveSubTab] = useState("assign"); 
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState("All Places");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("All Areas");
  const [dateFilter, setDateFilter] = useState("");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedForSession, setSelectedForSession] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [formData, setFormData] = useState({ date: "", startTime: "09:00", endTime: "10:00" });

  // --- 3. LOGIC ---
  const getTaskStatus = (endDate) => {
    if (!endDate) return { label: "Idle", color: "text-slate-400 bg-slate-100 dark:bg-slate-800", icon: <Clock size={10}/> };
    if (new Date() > new Date(endDate)) return { label: "Expired", color: "text-rose-600 bg-rose-100 dark:bg-rose-900/20", icon: <AlertCircle size={10}/> };
    return { label: "Assigned", color: "text-teal-600 bg-teal-100 dark:bg-teal-900/20", icon: <CheckCircle2 size={10}/> };
  };

  const instructorsList = useMemo(() => {
    const filtered = instructors.filter((ins) => {
      const matchesPlace = selectedPlace === "All Places" || ins.place === selectedPlace;
      const matchesSearch = ins.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlace && matchesSearch;
    });
    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [selectedPlace, searchQuery, instructors, currentPage]);

  const filteredStudents = studentPool.filter(s => 
    (s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.area.toLowerCase().includes(studentSearch.toLowerCase())) &&
    (areaFilter === "All Areas" || s.area === areaFilter)
  );

  const activeSessions = sessions.filter(s => 
    s.instructorId === selectedInstructor?.id && s.status === "Active" && (dateFilter === "" || s.date === dateFilter)
  );

  const historySessions = sessions.filter(s => 
    s.instructorId === selectedInstructor?.id && s.status === "Completed" && (dateFilter === "" || s.date === dateFilter)
  );

  const handleSaveSession = () => {
    if (editingSession) {
      setSessions(prev => prev.map(s => s.id === editingSession.id ? { ...s, ...formData, timeSlot: `${formData.startTime} - ${formData.endTime}` } : s));
      setEditingSession(null);
    } else {
      const newEntry = { ...selectedForSession, ...formData, id: Date.now(), instructorId: selectedInstructor.id, status: "Active", timeSlot: `${formData.startTime} - ${formData.endTime}` };
      setSessions([...sessions, newEntry]);
      setSelectedForSession(null);
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-10 bg-slate-50 dark:bg-[#020617] min-h-screen font-['Lexend'] transition-colors duration-300 pb-20 text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-center lg:text-left w-full">
            {viewMode === "manage" && (
              <button onClick={() => setViewMode("instructors")} className="flex items-center gap-2 text-indigo-600 font-black uppercase text-[10px] tracking-widest mb-4 hover:gap-3 transition-all active:scale-95">
                <ArrowLeft size={14}/> Back to Instructors
              </button>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase italic leading-none">
              Duty <span className="text-indigo-600">{viewMode === "instructors" ? "Dispatch" : "Audit"}</span>
            </h1>
          </div>
          {viewMode === "instructors" && <div className="w-full lg:max-w-md"><SearchBar onSearch={setSearchQuery} /></div>}
        </div>

        {viewMode === "instructors" ? (
          <>
            <div className="flex flex-wrap justify-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              {places.map((place) => (
                <button key={place} onClick={() => setSelectedPlace(place)} className={`px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${selectedPlace === place ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-indigo-600"}`}>{place}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {instructorsList.map((ins) => {
                const status = getTaskStatus(ins.endDate);
                return (
                  <div key={ins.id} className="group bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl transition-all hover:border-indigo-500 relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${status.color}`}>{status.icon} {status.label}</div>
                      <button onClick={() => { setSelectedInstructor(ins); setViewMode("manage"); }} className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 shadow-lg flex items-center gap-2">
                        <Settings2 size={14}/> Manage
                      </button>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-5 cursor-pointer" onClick={() => { setSelectedInstructor(ins); setIsAssignModalOpen(true); }}>
                      <div className="size-12 sm:size-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shrink-0">{ins.name.charAt(0)}</div>
                      <div className="overflow-hidden">
                        <h3 className="font-black text-base sm:text-lg truncate">{ins.name}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{ins.place}</p>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                       <p className="text-[9px] font-black text-indigo-600 uppercase mb-2 italic truncate">{ins.currentTask}</p>
                       <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <span>{ins.startDate || "---"}</span>
                          <ChevronRight size={12} className="text-slate-300"/>
                          <span>{ins.endDate || "---"}</span>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center pt-8 w-full">
              <Pagination currentPage={currentPage} totalItems={instructors.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>
          </>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-wrap bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 w-full sm:w-fit gap-1.5">
              {[{ id: "assign", label: "Assign", icon: <UserPlus size={14}/> }, { id: "active", label: "Active", icon: <Clock size={14}/> }, { id: "history", label: "History", icon: <History size={14}/> }].map(tab => (
                <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${activeSubTab === tab.id ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-indigo-600"}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {activeSubTab === "assign" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold text-sm text-slate-800 dark:text-white" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
                  </div>
                  <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs outline-none border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white">
                    {residentAreas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-x-auto">
                  <table className="w-full text-left min-w-112.5">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr><th className="px-6 py-5 text-slate-900 dark:text-white">Learner</th><th className="px-6 py-5 text-slate-900 dark:text-white">Address</th><th className="px-6 py-5 text-right text-slate-900 dark:text-white">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {filteredStudents.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-indigo-900/10">
                          <td className="px-6 py-5 font-bold uppercase text-xs sm:text-sm text-slate-900 dark:text-white">{s.name}</td>
                          <td className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase">{s.area}</td>
                          <td className="px-6 py-5 text-right">
                            <button onClick={() => { setSelectedForSession(s); setFormData({...formData, date: selectedInstructor.startDate || ""}) }} className="px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700">Assign</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(activeSubTab === "active" || activeSubTab === "history") && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm gap-4">
                   <h3 className="text-xs sm:text-sm font-black uppercase italic tracking-tighter text-indigo-600">{activeSubTab === "active" ? "Roster" : "Logs"}</h3>
                   <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-white border-none outline-none" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {(activeSubTab === "active" ? activeSessions : historySessions).map(slot => (
                    <div key={slot.id} className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 shrink-0"><Clock size={20}/></div>
                        <div className="overflow-hidden">
                          <p className="text-base font-black uppercase italic truncate text-slate-900 dark:text-white">{slot.name}</p>
                          <p className="text-[10px] font-bold text-teal-600 uppercase truncate"><MapPin size={10} className="inline mr-1"/>{slot.pickup}</p>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-none border-slate-100 dark:border-slate-800">
                        <div className="text-left sm:text-right mr-4 sm:mr-0">
                          <p className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-200">{slot.timeSlot}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{slot.date}</p>
                        </div>
                        <div className="flex gap-2">
                          {activeSubTab === "active" && (
                            <>
                              <button onClick={() => { setEditingSession(slot); setFormData({date: slot.date, startTime: slot.timeSlot.split(' - ')[0], endTime: slot.timeSlot.split(' - ')[1]})}} className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl active:scale-90"><Edit3 size={18}/></button>
                              <button onClick={() => setSessions(prev => prev.filter(s => s.id !== slot.id))} className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-xl active:scale-90"><Trash2 size={18}/></button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(activeSubTab === "active" ? activeSessions : historySessions).length === 0 && (
                    <div className="py-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest italic border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">No manifests found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* REUSABLE MODAL (SCHEDULE & EDIT) */}
      {(selectedForSession || editingSession) && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-4xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 text-slate-800 dark:text-white">
            <div className="flex justify-between items-start mb-6 sm:mb-8">
               <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter">{editingSession ? "Reschedule" : "Assign Slot"}</h3>
               <button onClick={() => { setSelectedForSession(null); setEditingSession(null); }} className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full"><X size={24}/></button>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Session Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm dark:text-white border border-slate-100 dark:border-slate-700 outline-none text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white border-none" />
                <input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white border-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setSelectedForSession(null); setEditingSession(null); }} className="flex-1 py-3.5 text-[10px] font-black uppercase text-slate-400 hover:text-rose-500">Discard</button>
                <button onClick={handleSaveSession} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TASK ASSIGNMENT MODAL (WORK BLOCK) */}
      {isAssignModalOpen && (
        <Modal instructor={selectedInstructor} onClose={() => setIsAssignModalOpen(false)} onSave={(updatedData) => { setInstructors(prev => prev.map(i => i.id === selectedInstructor.id ? {...i, ...updatedData} : i)); setIsAssignModalOpen(false); }} />
      )}
    </div>
  );
};

const Modal = ({ instructor, onClose, onSave }) => {
  const [task, setTask] = useState(instructor.currentTask || "Parking Section Handling");
  const [start, setStart] = useState(instructor.startDate || "");
  const [end, setEnd] = useState(instructor.endDate || "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 text-slate-800 dark:text-white">
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <h2 className="text-lg sm:text-xl font-black uppercase italic tracking-tight">Assign <span className="text-indigo-600">Work Block</span></h2>
          <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-rose-500" /></button>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <select value={task} onChange={(e) => setTask(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-sm outline-none text-slate-900 dark:text-white border-none">
            <option>Parking Section Handling</option><option>City Traffic Navigation</option><option>Highway Entry/Exit Drills</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white border-none" />
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs text-slate-900 dark:text-white border-none" />
          </div>
          <button onClick={() => onSave({ currentTask: task, startDate: start, endDate: end })} className="w-full py-4 sm:py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95">Confirm Dispatch</button>
        </div>
      </div>
    </div>
  );
};

export default Schedule;