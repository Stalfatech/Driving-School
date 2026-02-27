import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, Clock, MapPin, Eye, 
  Search, CalendarDays, Edit3, X, 
  RotateCcw, History, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Send, ShieldCheck, Timer, Lock
} from "lucide-react";
import InstructorStudentDetail from "../../components/instructor/InstructorStudentDetail";

const InstructorSchedule = () => {
  // --- 1. STATES ---
  const [activeTab, setActiveTab] = useState("book"); 
  const [query, setQuery] = useState("");
  const [filterArea, setFilterArea] = useState("All Areas");
  const [scheduleDateFilter, setScheduleDateFilter] = useState(""); 
  const [historyDateFilter, setHistoryDateFilter] = useState("");
  
  // ROSTER STATUS: Draft -> Pending -> Approved
  const [rosterStatus, setRosterStatus] = useState("Draft"); 

  // MODAL & UI STATES
  const [editingSession, setEditingSession] = useState(null);
  const [selectedForSchedule, setSelectedForSchedule] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const adminAssignment = {
    startDate: "2026-03-01",
    endDate: "2026-03-07",
    task: "Parallel Parking & Reverse Gear",
  };

  const burinAreas = ["All Areas", "Burin Bay Arm", "Burin Heritage", "Salt Pond", "Epworth"];

  const [studentPool] = useState([
    { id: 'STU-101', name: "Alex Rivera", area: "Burin Heritage", pickup: "Heritage Museum", email: "alex@drive.com", progress: 65, licenseClass: "Class 5 GDL" },
    { id: 'STU-102', name: "Sam Chen", area: "Salt Pond", pickup: "Main Gate", email: "sam@drive.com", progress: 30, licenseClass: "Class 7" },
    { id: 'STU-104', name: "Muhammed Salman", area: "Salt Pond", pickup: "Residence Lot 4", email: "salman@tech.com", progress: 40, licenseClass: "Class 5" },
  ]);

  const [scheduledStudents, setScheduledStudents] = useState([]);
  const [formData, setFormData] = useState({ date: adminAssignment.startDate, startTime: "09:00", endTime: "10:00" });

  // --- 2. DUMMY AUTO-APPROVAL LOGIC ---
  useEffect(() => {
    if (rosterStatus === "Pending") {
      const timer = setTimeout(() => {
        setRosterStatus("Approved");
        setActiveTab("active"); 
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [rosterStatus]);

  // --- 3. LOGIC: FILTERS & SCOPE FIX ---
  const availableStudents = useMemo(() => {
    return studentPool.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(query.toLowerCase());
      const matchesArea = filterArea === "All Areas" || s.area === filterArea;
      const isAlreadyScheduled = scheduledStudents.find(ss => ss.id === s.id && ss.status === 'Active');
      return matchesSearch && matchesArea && !isAlreadyScheduled;
    });
  }, [query, filterArea, scheduledStudents, studentPool]);

  // FIX: Define currentStudents here so it's globally available to the render
  const currentStudents = useMemo(() => {
    return availableStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [availableStudents, currentPage]);

  const activeList = scheduledStudents.filter(s => s.status === 'Active' && (scheduleDateFilter === "" || s.date === scheduleDateFilter));
  const historyList = scheduledStudents.filter(s => s.status === 'Completed' && (historyDateFilter === "" || s.date === historyDateFilter));

  // --- 4. HANDLERS ---
  const handleRequestApproval = () => {
    if (scheduledStudents.length === 0) return alert("Please assign students first.");
    setRosterStatus("Pending");
  };

  const startEdit = (session) => {
    if (rosterStatus === "Pending") return;
    setEditingSession(session);
    const times = session.timeSlot.split(" - ");
    setFormData({ date: session.date, startTime: times[0], endTime: times[1] });
  };

  const handleUpdate = () => {
    setScheduledStudents(prev => prev.map(s => 
      s.id === editingSession.id ? { ...s, date: formData.date, timeSlot: `${formData.startTime} - ${formData.endTime}` } : s
    ));
    setEditingSession(null);
  };

  const confirmSchedule = (student) => {
    const newEntry = { ...student, ...formData, id: Date.now(), timeSlot: `${formData.startTime} - ${formData.endTime}`, status: "Active" };
    setScheduledStudents([newEntry, ...scheduledStudents]);
    setSelectedForSchedule(null);
  };

  const toggleStatus = (id) => {
    if (rosterStatus !== "Approved") return;
    setScheduledStudents(prev => prev.map(item => item.id === id ? { ...item, status: item.status === 'Completed' ? 'Active' : 'Completed' } : item));
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-gray-950 min-h-screen font-['Lexend'] transition-colors duration-300 pb-20 text-slate-900 dark:text-white">
      <main className="p-4 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* APPROVAL STATUS BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-all duration-500 ${rosterStatus === "Approved" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-indigo-50 text-indigo-600 dark:bg-slate-800"}`}>
              {rosterStatus === "Draft" && <Clock size={24} />}
              {rosterStatus === "Pending" && <Timer size={24} className="animate-spin" />}
              {rosterStatus === "Approved" && <ShieldCheck size={24} />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Workflow Status</p>
              <h4 className="text-lg font-black uppercase italic tracking-tighter">
                {rosterStatus === "Draft" && "Drafting Your Manifest"}
                {rosterStatus === "Pending" && "Awaiting Admin Approval..."}
                {rosterStatus === "Approved" && "Admin Approved"}
              </h4>
            </div>
          </div>

          {rosterStatus === "Draft" && (
            <button onClick={handleRequestApproval} className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl active:scale-95">
              <Send size={16}/> Request Approval
            </button>
          )}
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 w-full md:w-fit gap-1.5 overflow-hidden">
          {["book", "active", "history"].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`flex-1 md:flex-none px-8 py-3.5 rounded-xl md:rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-indigo-600 dark:hover:bg-slate-800"}`}
            >
              {tab === "book" ? "Add Sessions" : tab === "active" ? "Active Roster" : "History"}
            </button>
          ))}
        </div>

        {/* --- BOOKING TAB --- */}
        {activeTab === "book" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <input type="text" placeholder="Search learners..." className="flex-1 px-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold text-sm text-slate-800 dark:text-white" value={query} onChange={(e) => setQuery(e.target.value)} />
              <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="px-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-white outline-none">
                {burinAreas.map(area => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-100">
                <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                  {currentStudents.map(s => (
                    <tr key={s.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all">
                      <td className="px-8 py-5 flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">{s.name.charAt(0)}</div>
                        <span className="text-sm font-bold uppercase">{s.name}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {rosterStatus === "Draft" ? (
                           <button onClick={() => { setSelectedForSchedule(s); setFormData({ ...formData, date: adminAssignment.startDate }); }} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-indigo-700 transition-all shadow-md active:scale-95">Schedule</button>
                        ) : (
                           <div className="inline-flex items-center gap-2 text-slate-300 dark:text-slate-700 font-black text-[9px] uppercase"><Lock size={12}/> Locked</div>
                        )}
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
               <div className="flex items-center gap-3">
                  <CalendarIcon className="text-indigo-600" size={24}/>
                  <h3 className="text-sm font-black uppercase italic tracking-tighter">Current Manifest</h3>
               </div>
               <input type="date" value={scheduleDateFilter} onChange={(e) => setScheduleDateFilter(e.target.value)} className="w-full md:w-auto px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-white outline-none" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {activeList.map(s => (
                <div key={s.id} className={`bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 group relative transition-all duration-500 ${rosterStatus === 'Approved' ? 'border-emerald-200 dark:border-emerald-900/30' : 'border-slate-100 dark:border-slate-800'}`}>
                  
                  {rosterStatus === "Pending" && (
                    <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-950/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                       <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
                          <Timer size={14} className="text-amber-500 animate-spin" />
                          <span className="text-[9px] font-black uppercase text-slate-400">Locking for approval...</span>
                       </div>
                    </div>
                  )}

                  <div className="flex items-center gap-5">
                    <div className={`size-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${rosterStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'} dark:bg-slate-800`}>
                      <Clock size={24}/>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                         <p className="font-black uppercase italic tracking-tighter text-slate-800 dark:text-white text-lg sm:text-xl leading-none">{s.name}</p>
                         {rosterStatus === "Approved" && <ShieldCheck size={16} className="text-emerald-500 animate-in zoom-in" />}
                      </div>
                      <p className="text-[10px] font-bold text-teal-600 uppercase flex items-center gap-1"><MapPin size={12}/> {s.pickup}</p>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-row items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-none border-slate-100 dark:border-slate-800">
                    <div className="text-left md:text-right">
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200 leading-none mb-1">{s.timeSlot}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewingStudent(s)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all active:scale-90 shadow-sm"><Eye size={18}/></button>
                      <button 
                        onClick={() => startEdit(s)} 
                        disabled={rosterStatus === "Pending"}
                        className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl transition-all hover:scale-110 disabled:opacity-20 shadow-sm active:scale-90"
                      >
                        <Edit3 size={18}/>
                      </button>
                      <button 
                        onClick={() => toggleStatus(s.id)} 
                        disabled={rosterStatus !== "Approved"}
                        className={`p-3 rounded-xl transition-all shadow-md ${rosterStatus === 'Approved' ? 'bg-emerald-500 text-white hover:scale-110 active:scale-95' : 'bg-slate-100 text-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-50'}`}
                      >
                        <CheckCircle size={18}/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- HISTORY TAB --- */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300 text-slate-800 dark:text-white">
            <div className="grid grid-cols-1 gap-3">
              {historyList.map(s => (
                <div key={s.id} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between opacity-60">
                  <div>
                    <p className="font-black uppercase text-sm leading-none mb-1">{s.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{s.date} • {s.timeSlot}</p>
                  </div>
                  <button onClick={() => toggleStatus(s.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95">
                    <RotateCcw size={14}/> Restore
                  </button>
                </div>
              ))}
              {historyList.length === 0 && <p className="text-center py-10 text-slate-400 italic">No completed sessions recorded.</p>}
            </div>
          </div>
        )}
      </main>

      {/* MODAL (SCHEDULE & EDIT) */}
      {(selectedForSchedule || editingSession) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-4xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 text-slate-800 dark:text-white">
            <div className="flex justify-between items-start mb-8">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter">{editingSession ? "Modify Timing" : "Assign Session"}</h3>
               <button onClick={() => { setSelectedForSchedule(null); setEditingSession(null); }} className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full"><X size={24}/></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Session Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Start Time</label>
                  <input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-800 dark:text-white outline-none border border-slate-100 dark:border-slate-700 focus:border-indigo-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">End Time</label>
                  <input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-800 dark:text-white outline-none border border-slate-100 dark:border-slate-700 focus:border-indigo-500" />
                </div>
              </div>
              <button 
                onClick={editingSession ? handleUpdate : () => confirmSchedule(selectedForSchedule)} 
                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 hover:bg-indigo-700"
              >
                {editingSession ? "Save Changes" : "Confirm Booking"}
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