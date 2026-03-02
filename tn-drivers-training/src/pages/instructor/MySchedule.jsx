
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, MapPin, Eye, 
  Search, CalendarDays, Edit3, X, 
  RotateCcw, History, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, UserPlus, Briefcase
} from "lucide-react";
import InstructorStudentDetail from "../../components/instructor/InstructorStudentDetail";

const InstructorSchedule = () => {
  // --- STATES ---
  const [activeTab, setActiveTab] = useState("active"); 
  const [query, setQuery] = useState("");
  const [filterArea, setFilterArea] = useState("All Areas");
  const [scheduleDateFilter, setScheduleDateFilter] = useState(""); 
  const [historyDateFilter, setHistoryDateFilter] = useState("");
  
  // MODAL STATES
  const [editingSession, setEditingSession] = useState(null);
  const [selectedForSchedule, setSelectedForSchedule] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- NEW: WORK BLOCKS (Normally fetched from Admin) ---
  const [workBlocks] = useState([
    { id: 'b1', task: "Parallel Parking & Reverse Gear", startDate: "2026-03-01", endDate: "2026-03-07", startTime: "09:00", endTime: "12:00", location: "Burin Training Hub" },
    { id: 'b2', task: "Highway Merging", startDate: "2026-03-08", endDate: "2026-03-14", startTime: "13:00", endTime: "17:00", location: "Marystown Bypass" },
  ]);
  
  const [selectedBlockId, setSelectedBlockId] = useState(workBlocks[0].id);

  const burinAreas = ["All Areas", "Burin Bay Arm", "Burin Heritage", "Salt Pond", "Epworth"];

  const [studentPool] = useState([
    { id: 'STU-101', name: "Alex Rivera", area: "Burin Heritage", pickup: "Heritage Museum", email: "alex@drive.com", progress: 65, licenseClass: "Class 5 GDL", balanceCAD: 150, evaluations: [] },
    { id: 'STU-102', name: "Sam Chen", area: "Salt Pond", pickup: "Main Gate", email: "sam@drive.com", progress: 30, licenseClass: "Class 7", balanceCAD: 200, evaluations: [] },
    { id: 'STU-104', name: "Muhammed Salman", area: "Salt Pond", pickup: "Residence Lot 4", email: "salman@tech.com", progress: 40, licenseClass: "Class 5", balanceCAD: 0, evaluations: [] },
  ]);

  const [scheduledStudents, setScheduledStudents] = useState([]);
  
  // Find the active block object based on selection
  const activeBlock = workBlocks.find(b => b.id === selectedBlockId);

  const [formData, setFormData] = useState({ 
    date: activeBlock?.startDate || "", 
    startTime: activeBlock?.startTime || "09:00", 
    endTime: activeBlock?.endTime || "10:00" 
  });

  // Update form defaults whenever the selected block changes
  useEffect(() => {
    if (activeBlock) {
      setFormData({
        date: activeBlock.startDate,
        startTime: activeBlock.startTime,
        endTime: activeBlock.endTime
      });
    }
  }, [selectedBlockId]);

  // --- LOGIC: FILTERS ---
  const availableStudents = studentPool.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(query.toLowerCase());
    const matchesArea = filterArea === "All Areas" || s.area === filterArea;
    const isAlreadyScheduled = scheduledStudents.find(ss => ss.id === s.id && ss.status === 'Active');
    return matchesSearch && matchesArea && !isAlreadyScheduled;
  });

  const activeList = scheduledStudents.filter(s => s.status === 'Active' && (scheduleDateFilter === "" || s.date === scheduleDateFilter));
  const historyList = scheduledStudents.filter(s => s.status === 'Completed' && (historyDateFilter === "" || s.date === historyDateFilter));

  const currentStudents = availableStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- HANDLERS ---
  const startEdit = (session) => {
    setEditingSession(session);
    const times = session.timeSlot.split(" - ");
    setFormData({
      date: session.date,
      startTime: times[0],
      endTime: times[1]
    });
  };

  const handleUpdate = () => {
    setScheduledStudents(prev => prev.map(s => 
      s.id === editingSession.id 
      ? { ...s, date: formData.date, timeSlot: `${formData.startTime} - ${formData.endTime}` } 
      : s
    ));
    setEditingSession(null);
  };

  const confirmSchedule = (student) => {
    const newEntry = { 
        ...student, 
        ...formData, 
        id: Date.now(), 
        timeSlot: `${formData.startTime} - ${formData.endTime}`, 
        status: "Active",
        blockId: selectedBlockId,
        task: activeBlock.task // Keep track of what they are learning
    };
    setScheduledStudents([newEntry, ...scheduledStudents]);
    setSelectedForSchedule(null);
  };

  const toggleStatus = (id) => {
    setScheduledStudents(prev => prev.map(item => item.id === id ? { ...item, status: item.status === 'Completed' ? 'Active' : 'Completed' } : item));
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-gray-950 min-h-screen font-['Lexend'] transition-colors duration-300 pb-20">
      <main className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* TAB NAVIGATION */}
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 w-full md:w-fit gap-1.5 overflow-hidden">
          {["book", "active", "history"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 md:flex-none px-3 md:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-indigo-600 dark:hover:bg-slate-800"}`}>
              {tab === "book" ? "Add Sessions" : tab === "active" ? "Active Roster" : "History"}
            </button>
          ))}
        </div>

        {/* --- BOOKING TAB --- */}
        {activeTab === "book" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* WORK BLOCK SELECTOR */}
            <div className="bg-indigo-600 p-6 rounded-4xl text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Briefcase size={24}/>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 leading-none mb-1">Active Dispatch Block</p>
                        <select 
                            value={selectedBlockId} 
                            onChange={(e) => setSelectedBlockId(e.target.value)}
                            className="bg-transparent font-black text-xl italic outline-none cursor-pointer"
                        >
                            {workBlocks.map(block => (
                                <option key={block.id} value={block.id} className="text-slate-900">{block.task}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-8 border-l border-white/20 pl-8">
                    <div>
                        <p className="text-[8px] font-black uppercase opacity-60 mb-1 tracking-widest">Valid Period</p>
                        <p className="text-xs font-bold uppercase tracking-tighter">{activeBlock.startDate} - {activeBlock.endDate}</p>
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-[8px] font-black uppercase opacity-60 mb-1 tracking-widest">Region</p>
                        <p className="text-xs font-bold uppercase tracking-tighter flex items-center gap-1"><MapPin size={10}/> {activeBlock.location}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input type="text" placeholder="Search learners..." className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold text-sm text-slate-800 dark:text-white" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="px-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-white outline-none">
                {burinAreas.map(area => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                  {currentStudents.map(s => (
                    <tr key={s.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all">
                      <td className="px-8 py-6 flex items-center gap-4 text-slate-800 dark:text-slate-100">
                        <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">{s.name.charAt(0)}</div>
                        <div>
                            <span className="text-sm font-bold block leading-none">{s.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{s.area}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => setSelectedForSchedule(s)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 ml-auto">
                           <UserPlus size={14}/> Schedule
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- ACTIVE TAB --- */}
        {activeTab === "active" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 text-slate-800 dark:text-white">
                   <CalendarIcon className="text-indigo-600" size={24}/>
                   <h3 className="text-sm font-black uppercase italic tracking-tighter">Current Manifest</h3>
                </div>
                <input type="date" value={scheduleDateFilter} onChange={(e) => setScheduleDateFilter(e.target.value)} className="w-full md:w-auto px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-white outline-none" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {activeList.map(s => (
                <div key={s.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 group relative">
                  <div className="flex items-center gap-5">
                    <div className="size-14 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <Clock size={24}/>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black uppercase italic tracking-tighter text-slate-800 dark:text-white text-xl leading-none">{s.name}</p>
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 text-[8px] font-black uppercase rounded-md tracking-tighter">{s.task}</span>
                      </div>
                      <p className="text-[10px] font-bold text-teal-600 uppercase flex items-center gap-1"><MapPin size={12}/> {s.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <div className="text-left md:text-right">
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200 leading-none mb-1">{s.timeSlot}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.date}</p>
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-100 dark:border-slate-800 pl-6">
                      <button onClick={() => setViewingStudent(s)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all hover:scale-110"><Eye size={18}/></button>
                      <button onClick={() => startEdit(s)} className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl transition-all hover:scale-110"><Edit3 size={18}/></button>
                      <button onClick={() => toggleStatus(s.id)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-teal-500 rounded-xl transition-all hover:scale-110"><CheckCircle size={18}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- HISTORY TAB (SIMILAR TO ORIGINAL) --- */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300 text-slate-800 dark:text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
               <div className="flex items-center gap-3 text-teal-600"><History size={24}/><h3 className="text-sm font-black uppercase italic tracking-tighter">Completed</h3></div>
               <input type="date" value={historyDateFilter} onChange={(e) => setHistoryDateFilter(e.target.value)} className="w-full md:w-auto px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs dark:text-white outline-none" />
            </div>
            {historyList.map(s => (
              <div key={s.id} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between opacity-60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black uppercase text-sm leading-none">{s.name}</p>
                    <span className="text-[8px] font-bold text-slate-400 tracking-tighter uppercase">{s.task}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{s.date} • {s.timeSlot}</p>
                </div>
                <button onClick={() => toggleStatus(s.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2">
                  <RotateCcw size={14}/> Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- REUSABLE MODAL --- */}
      {(selectedForSchedule || editingSession) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Lexend']">
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-4xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6 text-slate-800 dark:text-white">
               <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">{editingSession ? "Reschedule" : "Assign Session"}</h3>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1">BLOCK: {activeBlock.task}</p>
               </div>
               <button onClick={() => { setSelectedForSchedule(null); setEditingSession(null); }} className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full"><X size={24}/></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Session Date</label>
                <input type="date" min={activeBlock.startDate} max={activeBlock.endDate} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">From</label>
                  <input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-800 dark:text-white outline-none border border-slate-100 dark:border-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">To</label>
                  <input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-800 dark:text-white outline-none border border-slate-100 dark:border-slate-700" />
                </div>
              </div>
              <button 
                onClick={editingSession ? handleUpdate : () => confirmSchedule(selectedForSchedule)} 
                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl transition-all active:scale-95"
              >
                {editingSession ? "Confirm Update" : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingStudent && <InstructorStudentDetail student={viewingStudent} onClose={() => setViewingStudent(null)} />}
    </div>
  );
};

export default InstructorSchedule;