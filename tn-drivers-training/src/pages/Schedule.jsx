import React, { useState, useMemo, useEffect } from "react";
import { 
  MapPin, Calendar as CalendarIcon, Search, X, 
  Clock, AlertCircle, CheckCircle2, Edit3, Trash2, 
  UserPlus, History, Settings2, PlusCircle, Save, ArrowLeft,
  CalendarDays, Repeat, ArrowRightLeft
} from "lucide-react";

import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";

const Schedule = () => {
  // --- 1. DATA ---
  const places = ["All Places", "Burin", "Grand Falls", "Marystown", "St. John's", "Mount Pearl"];
  const residentAreas = ["All Areas", "Burin Bay Arm", "Burin Heritage", "Salt Pond", "Epworth", "Marystown", "St. John's"];

  const [instructors, setInstructors] = useState([
    { 
      id: 1, 
      name: "John Doe", 
      place: "St. John's", 
      workBlocks: [
        { id: 'b1', task: "City Driving", start: "2026-03-01", end: "2026-03-15", startTime: "09:00", endTime: "17:00", location: "Downtown Hub" },
      ]
    },
    { 
      id: 2, 
      name: "Jane Smith", 
      place: "Marystown", 
      workBlocks: [
        { id: 'b2', task: "Parking Drills", start: "2026-02-01", end: "2026-02-28", startTime: "08:00", endTime: "12:00", location: "Community Lot" }
      ]
    }
  ]);

  const [studentPool] = useState([
    { id: 'S1', name: "Muhammed Salman", area: "Burin Heritage", pickup: "Residence Lot 4" },
    { id: 'S2', name: "Alex Rivera", area: "Burin Heritage", pickup: "Heritage Museum" },
    { id: 'S3', name: "Sam Chen", area: "St. John's", pickup: "Main Gate" },
  ]);

  const [sessions, setSessions] = useState([]);
  
  // --- TRANSFER STATE ---
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({ fromId: null, toId: "", blockId: "", returnDate: "" });

  // --- EXISTING STATES ---
  const [viewMode, setViewMode] = useState("instructors"); 
  const [activeSubTab, setActiveSubTab] = useState("assign"); 
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState("All Places");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("All Areas");
  const [activeBlockId, setActiveBlockId] = useState("");
  const [isWorkBlockModalOpen, setIsWorkBlockModalOpen] = useState(false);
  const [selectedForSession, setSelectedForSession] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [formData, setFormData] = useState({ date: "", startTime: "09:00", endTime: "10:00", location: "", blockId: "" });

  // --- 3. LOGIC ---

  // AUTO-REVERT LOGIC: Checks if temporary transfer has expired
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSessions(prev => prev.map(s => {
      if (s.isTransferred && s.returnDate && today > s.returnDate) {
        return { ...s, instructorId: s.originalInstructorId, isTransferred: false, returnDate: null };
      }
      return s;
    }));
  }, []);

  const handleTransferSubmit = () => {
    const { fromId, toId, blockId, returnDate } = transferData;
    if (!toId || !blockId) return;

    setSessions(prev => prev.map(s => {
      if (s.instructorId === fromId && s.blockId === blockId) {
        return { 
          ...s, 
          instructorId: parseInt(toId), 
          originalInstructorId: fromId, 
          isTransferred: true, 
          returnDate: returnDate 
        };
      }
      return s;
    }));
    setIsTransferModalOpen(false);
    alert("Shift and students transferred successfully.");
  };

  const isBlockExpired = (endDate) => {
    if (!endDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(endDate) < today;
  };

  const getInstructorStatus = (blocks) => {
    if (!blocks || blocks.length === 0) return "No Schedule";
    const hasActive = blocks.some(b => !isBlockExpired(b.end));
    return hasActive ? "Active" : "Expired";
  };

  useEffect(() => {
    if (selectedInstructor?.workBlocks?.length > 0) {
      setActiveBlockId(selectedInstructor.workBlocks[0].id);
    }
  }, [selectedInstructor]);

  const activeBlock = useMemo(() => {
    return selectedInstructor?.workBlocks?.find(b => b.id === activeBlockId) || null;
  }, [selectedInstructor, activeBlockId]);

  const instructorsList = useMemo(() => {
    return instructors
      .filter(ins => (selectedPlace === "All Places" || ins.place === selectedPlace) && ins.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [selectedPlace, searchQuery, instructors, currentPage]);

  const filteredStudents = studentPool.filter(s => 
    (s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.area.toLowerCase().includes(studentSearch.toLowerCase())) &&
    (areaFilter === "All Areas" || s.area === areaFilter)
  );

  const activeSessions = sessions.filter(s => 
    s.instructorId === selectedInstructor?.id && s.status === "Active"
  );

  const historySessions = sessions.filter(s => 
    s.instructorId === selectedInstructor?.id && s.status === "Completed"
  );

  const handleSaveSession = () => {
    if (editingSession) {
      setSessions(prev => prev.map(s => s.id === editingSession.id ? { ...s, ...formData, timeSlot: `${formData.startTime} - ${formData.endTime}` } : s));
      setEditingSession(null);
    } else {
      const newEntry = { 
        ...selectedForSession, 
        ...formData, 
        id: Date.now(), 
        instructorId: selectedInstructor.id, 
        status: "Active",
        timeSlot: `${formData.startTime} - ${formData.endTime}`,
        task: activeBlock?.task || "General Training",
        blockId: activeBlockId // Vital for transfers
      };
      setSessions([...sessions, newEntry]);
      setSelectedForSession(null);
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-10 bg-slate-50 dark:bg-[#020617] min-h-screen font-['Lexend'] pb-20 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-center lg:text-left w-full">
            {viewMode === "manage" && (
              <button onClick={() => setViewMode("instructors")} className="flex items-center gap-2 text-indigo-600 font-black uppercase text-[10px] tracking-widest mb-4 hover:gap-3 transition-all">
                <ArrowLeft size={14}/> Back to instructors 
              </button>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase italic leading-none">
              Duty <span className="text-indigo-600">{viewMode === "instructors" ? "Fleet" : "Audit"}</span>
            </h1>
          </div>
          {viewMode === "instructors" && <div className="w-full lg:max-w-md"><SearchBar onSearch={setSearchQuery} /></div>}
        </div>

        {viewMode === "instructors" ? (
          <>
            {/* PLACES FILTER */}
            <div className="flex flex-wrap justify-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              {places.map((place) => (
                <button key={place} onClick={() => setSelectedPlace(place)} className={`px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${selectedPlace === place ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-indigo-600"}`}>{place}</button>
              ))}
            </div>

            {/* INSTRUCTOR GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructorsList.map((ins) => {
                const status = getInstructorStatus(ins.workBlocks);
                const isExpired = status === "Expired" || status === "No Schedule";

                return (
                  <div key={ins.id} className={`group bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-xl hover:shadow-2xl transition-all relative overflow-hidden ${isExpired ? "border-rose-200 dark:border-rose-900/50" : "border-slate-100 dark:border-slate-800"}`}>
                    
                    {isExpired && <div className="absolute top-0 right-0 p-3"><AlertCircle className="text-rose-500 animate-pulse" size={20}/></div>}

                    <div className="flex justify-between items-start mb-6">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${isExpired ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40" : "bg-teal-100 text-teal-600 dark:bg-teal-900/40"}`}>
                          <CalendarDays size={10}/> {status}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setTransferData({...transferData, fromId: ins.id}); setIsTransferModalOpen(true); }}
                          className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
                          title="Transfer Block"
                        >
                          <Repeat size={14}/>
                        </button>
                        <button onClick={() => { setSelectedInstructor(ins); setViewMode("manage"); }} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg flex items-center gap-2 transition-transform active:scale-95">
                          <Settings2 size={14}/> Manage
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setSelectedInstructor(ins); setIsWorkBlockModalOpen(true); }}>
                      <div className={`size-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${isExpired ? "bg-rose-500 text-white" : "bg-indigo-600 text-white"}`}>{ins.name.charAt(0)}</div>
                      <div>
                        <h3 className="font-black text-lg truncate">{ins.name}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={10}/> {ins.place}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex justify-between text-[8px] font-black uppercase mb-2">
                        <span className="text-slate-400">Schedule Health</span>
                        <span className={isExpired ? "text-rose-500" : "text-teal-500"}>{isExpired ? "Requires Update" : "Current"}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${isExpired ? "w-full bg-rose-500" : "w-full bg-teal-500"}`}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center pt-8"><Pagination currentPage={currentPage} totalItems={instructors.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} /></div>
          </>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {/* SUB TABS */}
            <div className="flex flex-wrap bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 w-fit gap-1.5">
              {[
                { id: "assign", label: "Assign", icon: <UserPlus size={14}/> }, 
                { id: "active", label: "Active", icon: <Clock size={14}/> },
                { id: "history", label: "History", icon: <History size={14}/> }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeSubTab === tab.id ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-indigo-600"}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* 1. ASSIGNMENT VIEW */}
            {activeSubTab === "assign" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-indigo-600 ml-2 italic">Target Dispatch Block</label>
                    <select 
                      value={activeBlockId} 
                      onChange={(e) => setActiveBlockId(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 font-bold text-xs outline-none border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                    >
                      {selectedInstructor?.workBlocks?.map(block => (
                        <option key={block.id} value={block.id}>
                          {block.task} — {block.location} ({block.startTime})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Search Learner</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                      <input type="text" placeholder="Name or area..." className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold text-sm" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Resident Area</label>
                    <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="px-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs outline-none border border-slate-100 dark:border-slate-700">
                      {residentAreas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <tr><th className="px-6 py-5">Learner</th><th className="px-6 py-5">Address</th><th className="px-6 py-5 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {filteredStudents.map(s => (
                        <tr key={s.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                          <td className="px-6 py-5 font-bold uppercase text-sm">{s.name}</td>
                          <td className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase">{s.area}</td>
                          <td className="px-6 py-5 text-right">
                             <button 
                               onClick={() => { 
                                 setSelectedForSession(s); 
                                 setFormData({
                                   date: activeBlock?.start || "",
                                   startTime: activeBlock?.startTime || "09:00",
                                   endTime: activeBlock?.endTime || "10:00",
                                   location: activeBlock?.location || s.pickup,
                                   blockId: activeBlockId
                                 }); 
                               }}
                               className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 flex items-center gap-2 ml-auto"
                             >
                               <UserPlus size={12}/> Assign to {activeBlock?.task || 'Shift'}
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. ACTIVE ROSTER */}
            {activeSubTab === "active" && (
              <div className="grid grid-cols-1 gap-4">
                {activeSessions.map(slot => (
                  <div key={slot.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg flex justify-between items-center relative">
                    {slot.isTransferred && (
                      <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-amber-500 text-white text-[8px] font-black uppercase rounded-full shadow-lg flex items-center gap-1">
                        <ArrowRightLeft size={10}/> Temporary Transfer
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600"><Clock size={20}/></div>
                      <div>
                        <p className="text-base font-black uppercase italic">{slot.name}</p>
                        <p className="text-[10px] font-bold text-teal-600 uppercase flex items-center gap-1">
                          <MapPin size={10}/>{slot.location} 
                          <span className="text-slate-300 mx-1">•</span> 
                          <span className="text-indigo-500 italic">{slot.task}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-black">{slot.timeSlot}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{slot.date}</p>
                        </div>
                        <div className="flex gap-2 border-l border-slate-100 dark:border-slate-800 pl-6">
                            <button onClick={() => { setEditingSession(slot); setFormData({...slot, startTime: slot.timeSlot.split(' - ')[0], endTime: slot.timeSlot.split(' - ')[1]}); }} className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Edit3 size={16}/></button>
                            <button onClick={() => setSessions(prev => prev.filter(s => s.id !== slot.id))} className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* HISTORY SUBTAB REMAINS SAME... */}
            {activeSubTab === "history" && (
              <div className="grid grid-cols-1 gap-4">
                {historySessions.map(slot => (
                  <div key={slot.id} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center opacity-70">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="text-teal-500" size={20}/>
                      <div>
                        <p className="text-base font-black uppercase italic">{slot.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Instructor Finalized: {slot.task} on {slot.date}</p>
                      </div>
                    </div>
                    <span className="px-4 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-full text-[8px] font-black uppercase tracking-widest">Completed</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* TRANSFER MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 font-['Lexend']">
           <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-4xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-black uppercase italic mb-6">Bulk <span className="text-indigo-600">Transfer</span></h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Select Block to Transfer</label>
                  <select 
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs outline-none"
                    onChange={(e) => setTransferData({...transferData, blockId: e.target.value})}
                  >
                    <option value="">Select a Shift...</option>
                    {instructors.find(i => i.id === transferData.fromId)?.workBlocks.map(b => (
                      <option key={b.id} value={b.id}>{b.task} ({b.start})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Recipient Instructor</label>
                  <select 
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs outline-none"
                    onChange={(e) => setTransferData({...transferData, toId: e.target.value})}
                  >
                    <option value="">Select Receiver...</option>
                    {instructors.filter(i => i.id !== transferData.fromId).map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Auto-Return Date (Temporary)</label>
                  <input 
                    type="date" 
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-xs outline-none"
                    onChange={(e) => setTransferData({...transferData, returnDate: e.target.value})}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button onClick={() => setIsTransferModalOpen(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">Cancel</button>
                  <button onClick={handleTransferSubmit} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg">Confirm Transfer</button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* SESSION MODAL AND WORK BLOCK MODAL REMAIN THE SAME... */}
      {(selectedForSession || editingSession) && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800">
            <h3 className="text-2xl font-black uppercase italic mb-8">{editingSession ? "Edit" : "Assign"} <span className="text-indigo-600">Session</span></h3>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-4">
                 <p className="text-[8px] font-black uppercase text-indigo-600 mb-1">Applying to Shift</p>
                 <p className="text-xs font-bold">{activeBlock?.task || 'General'}</p>
              </div>
              <div className="space-y-1">
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white border-none" />
                <input type="text" placeholder="Pickup Point" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm mt-2 text-slate-900 dark:text-white border-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white border-none" />
                <input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white border-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setSelectedForSession(null); setEditingSession(null); }} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                <button onClick={handleSaveSession} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">Save Session</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isWorkBlockModalOpen && (
        <WorkBlockModal 
          instructor={selectedInstructor} 
          onClose={() => setIsWorkBlockModalOpen(false)} 
          onSave={(updatedBlocks) => { 
            setInstructors(prev => prev.map(i => i.id === selectedInstructor.id ? {...i, workBlocks: updatedBlocks} : i)); 
            setIsWorkBlockModalOpen(false); 
          }} 
        />
      )}
    </div>
  );
};

const WorkBlockModal = ({ instructor, onClose, onSave }) => {
  const [blocks, setBlocks] = useState(
    instructor.workBlocks?.length > 0 
    ? instructor.workBlocks 
    : [{ id: Date.now(), task: "City Traffic Navigation", start: "", end: "", startTime: "09:00", endTime: "17:00", location: instructor.place }]
  );

  const addBlock = () => setBlocks([...blocks, { id: Date.now(), task: "City Traffic Navigation", start: "", end: "", startTime: "09:00", endTime: "17:00", location: instructor.place }]);
  const updateBlock = (id, field, value) => setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  const removeBlock = (id) => blocks.length > 1 && setBlocks(blocks.filter(b => b.id !== id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 font-['Lexend']">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <h2 className="text-xl font-black uppercase italic">Master <span className="text-indigo-600">Schedule</span></h2>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {blocks.map((block, idx) => (
            <div key={block.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 relative">
              <div className="flex justify-between">
                <span className="text-[10px] font-black uppercase text-indigo-500">Block #{idx + 1}</span>
                <button onClick={() => removeBlock(block.id)}><Trash2 size={14} className="text-rose-500"/></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select value={block.task} onChange={(e) => updateBlock(block.id, "task", e.target.value)} className="p-3 bg-white dark:bg-slate-900 rounded-xl font-bold text-xs border-none outline-none">
                    <option>City Traffic Navigation</option>
                    <option>Parking Section Handling</option>
                    <option>Highway Entry/Exit Drills</option>
                    <option>Weekend Intensive</option>
                </select>
                <input type="text" placeholder="Location Name" value={block.location} onChange={(e) => updateBlock(block.id, "location", e.target.value)} className="p-3 bg-white dark:bg-slate-900 rounded-xl font-bold text-xs border-none outline-none" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input type="date" value={block.start} onChange={(e) => updateBlock(block.id, "start", e.target.value)} className="p-3 bg-white dark:bg-slate-900 rounded-xl font-bold text-[10px] border-none outline-none" />
                <input type="date" value={block.end} onChange={(e) => updateBlock(block.id, "end", e.target.value)} className="p-3 bg-white dark:bg-slate-900 rounded-xl font-bold text-[10px] border-none outline-none" />
                <input type="time" value={block.startTime} onChange={(e) => updateBlock(block.id, "startTime", e.target.value)} className="p-3 bg-white dark:bg-slate-900 rounded-xl font-bold text-[10px] border-none outline-none" />
                <input type="time" value={block.endTime} onChange={(e) => updateBlock(block.id, "endTime", e.target.value)} className="p-3 bg-white dark:bg-slate-900 rounded-xl font-bold text-[10px] border-none outline-none" />
              </div>
            </div>
          ))}
          <button onClick={addBlock} className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-indigo-500 transition-all flex items-center justify-center gap-2">
            <PlusCircle size={14}/> Add New Shift
          </button>
        </div>
        <div className="p-6">
          <button onClick={() => onSave(blocks)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
            <Save size={16}/> Confirm Master Dispatch
          </button>
        </div>
      </div>
    </div>
  );
};

export default Schedule;