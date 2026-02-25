import React, { useState } from "react";
import { 
  X, Mail, CheckCircle, XCircle, Save, 
  Clock, Edit2, Check, Calendar, FileText, 
  MapPin, History, Plus
} from "lucide-react";

export default function InstructorStudentDetail({ student, onClose }) {
  const [activeTab, setActiveTab] = useState("Overview");
  
  // --- 1. STUDENT & TRAINING STATE ---
  const [progress, setProgress] = useState(student.progress || 0);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  
  // --- 2. SKILL EVALUATIONS ---
  const [evaluations, setEvaluations] = useState([
    { id: 1, title: "Lane Discipline", score: 4, remark: "Maintains position well, but needs quicker mirror checks." },
    { id: 2, title: "Parallel Parking", score: 3, remark: "Good understanding of steps, work on curb distance." }
  ]);
  const [editingEvalId, setEditingEvalId] = useState(null);
  const [tempEval, setTempEval] = useState({ score: 0, remark: "" });

  // Evaluation Title Dropdown Options
  const evaluationOptions = [
    "Mirror Checks", 
    "Lane Discipline", 
    "Parallel Parking", 
    "Highway Merging", 
    "Blind Spot Observation", 
    "Emergency Braking",
    "Intersection Safety"
  ];
  const [newEval, setNewEval] = useState({ title: evaluationOptions[0], score: 5, remark: "" });

  // --- 3. ATTENDANCE & SESSIONS ---
  const [sessions, setSessions] = useState([
    { id: 101, date: "2026-02-25", time: "10:00 AM", pickup: "Student Residence", session: "Highway Merging Prep", status: "Upcoming", notes: "" },
    { id: 102, date: "2026-02-28", time: "02:30 PM", pickup: "Downtown Library", session: "Mock Road Test", status: "Upcoming", notes: "" },
    { id: 103, date: "2026-02-20", time: "09:00 AM", pickup: "Student Residence", session: "Intersection Safety", status: "Completed", attendance: "Present", notes: "Excellent spatial awareness." },
  ]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [editFields, setEditFields] = useState({ notes: "" });

  // --- HANDLERS ---
  const handleSaveEvalEdit = (id) => {
    setEvaluations(prev => prev.map(ev => 
      ev.id === id ? { ...ev, score: tempEval.score, remark: tempEval.remark } : ev
    ));
    setEditingEvalId(null);
  };

  const handleAddNewEval = (e) => {
    e.preventDefault();
    setEvaluations([...evaluations, { ...newEval, id: Date.now() }]);
    setNewEval({ title: evaluationOptions[0], score: 5, remark: "" });
    setActiveTab("Overview");
  };

  const markAttendance = (id, status) => {
    setSessions(prev => prev.map(s => 
      s.id === id ? { ...s, status: "Completed", attendance: status } : s
    ));
  };

  const saveSessionDetails = (id) => {
    setSessions(prev => prev.map(s => 
      s.id === id ? { ...s, notes: editFields.notes } : s
    ));
    setActiveSessionId(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 font-['Lexend']">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[92vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800">
        
        {/* HEADER */}
        <header className="p-10 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-8">
            <div className="size-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-xl">{student.name.charAt(0)}</div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="px-4 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">{student.licenseClass || "Class 7 L"}</span>
                <span className="px-4 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">{student.paymentStatus || "Paid"}</span>
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{student.name}</h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                <Mail size={14} className="text-indigo-500" />
                <span className="dark:text-slate-300">{student.email}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"><X size={28} /></button>
        </header>

        {/* NAVIGATION */}
        <nav className="flex px-12 border-b border-slate-50 dark:border-slate-800 gap-12 bg-slate-50/30 dark:bg-slate-950/20">
          {["Overview", "Attendance and History", "Skill Evaluation"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-6 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? "text-indigo-600" : "text-slate-400 dark:text-slate-500"}`}>
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
            </button>
          ))}
        </nav>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          
          {/* 1. OVERVIEW */}
          {activeTab === "Overview" && (
            <div className="space-y-12 animate-in fade-in duration-300">
              <section className="bg-indigo-50/50 dark:bg-indigo-900/10 p-10 rounded-[3rem] border border-indigo-100/50 flex items-center justify-between">
                <div className="flex-1 max-w-xl">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase mb-4 tracking-widest">Training Progress</h4>
                  <div className="flex items-end gap-4 mb-4">
                    <span className="text-6xl font-black text-slate-800 dark:text-white">{progress}%</span>
                    <button onClick={() => setIsEditingProgress(!isEditingProgress)} className="mb-2 p-2 bg-white dark:bg-slate-800 rounded-lg text-indigo-600 shadow-sm">{isEditingProgress ? <Check size={16}/> : <Edit2 size={16}/>}</button>
                  </div>
                  {isEditingProgress ? <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(e.target.value)} className="w-full accent-indigo-600 h-2 bg-white dark:bg-slate-700 rounded-full appearance-none cursor-pointer" /> : <div className="w-full bg-white dark:bg-slate-800 h-2.5 rounded-full overflow-hidden"><div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${progress}%` }} /></div>}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {evaluations.map((ev) => (
                  <div key={ev.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 group relative">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xl font-black text-slate-800 dark:text-white">{ev.title}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-indigo-600">{ev.score}<span className="text-sm text-slate-300">/5</span></span>
                        <button onClick={() => { setEditingEvalId(ev.id); setTempEval({ score: ev.score, remark: ev.remark }); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-indigo-600"><Edit2 size={14}/></button>
                      </div>
                    </div>
                    {editingEvalId === ev.id ? (
                      <div className="space-y-4">
                        <input type="number" min="1" max="5" value={tempEval.score} onChange={(e) => setTempEval({...tempEval, score: parseInt(e.target.value)})} className="w-full p-3 rounded-xl border border-indigo-100 bg-slate-50 dark:bg-slate-900 font-bold text-indigo-600 dark:text-white outline-none" />
                        <textarea value={tempEval.remark} onChange={(e) => setTempEval({...tempEval, remark: e.target.value})} className="w-full p-4 rounded-xl border border-indigo-100 bg-slate-50 dark:bg-slate-900 text-sm dark:text-white outline-none" rows={3} />
                        <button onClick={() => handleSaveEvalEdit(ev.id)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Update Assessment</button>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((step) => <div key={step} className={`h-2 flex-1 rounded-full ${step <= ev.score ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-700'}`} />)}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black text-indigo-600 uppercase mb-2 tracking-widest">• Instructor Remarks</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{ev.remark}"</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. ATTENDANCE & HISTORY */}
          {activeTab === "Attendance and History" && (
            <div className="space-y-12 animate-in slide-in-from-left-4">
              <section className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                  <Calendar className="text-indigo-600" size={20}/>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upcoming Sessions</h3>
                </div>
                <div className="grid gap-4">
                  {sessions.filter(s => s.status === "Upcoming").map(s => (
                    <div key={s.id} className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-indigo-50 dark:border-slate-800 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900 text-indigo-600 flex items-center justify-center font-black">#{s.id}</div>
                        <div className="space-y-1">
                          <p className="text-lg font-black text-slate-800 dark:text-white uppercase">{s.session}</p>
                          <div className="flex gap-4 items-center">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500"><Clock size={14}/> {s.date} @ {s.time}</span>
                            <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-500"><MapPin size={14}/> {s.pickup}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <button onClick={() => markAttendance(s.id, "Present")} className="px-6 py-3 bg-teal-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Mark Present</button>
                         <button onClick={() => markAttendance(s.id, "Absent")} className="px-6 py-3 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Mark Absent</button>
                         <button onClick={() => { setActiveSessionId(s.id); setEditFields({ notes: s.notes }); }} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-400 hover:text-indigo-600"><FileText size={20}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                  <History className="text-slate-400" size={20}/>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed Sessions</h3>
                </div>
                <div className="grid gap-4 opacity-75">
                  {sessions.filter(s => s.status === "Completed").map(s => (
                    <div key={s.id} className="p-8 bg-slate-50/50 dark:bg-slate-900/20 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`size-14 rounded-2xl flex items-center justify-center font-black ${s.attendance === 'Present' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'}`}>
                          {s.attendance === 'Present' ? <CheckCircle size={24}/> : <XCircle size={24}/>}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white uppercase">{s.session}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.date} • {s.pickup} • {s.attendance}</p>
                        </div>
                      </div>
                      <div className="max-w-md text-right"><p className="text-xs text-slate-400 italic">"{s.notes || "No notes recorded."}"</p></div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* 3. SKILL EVALUATION FORM */}
          {activeTab === "Skill Evaluation" && (
            <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4">
              <form onSubmit={handleAddNewEval} className="bg-slate-50 dark:bg-slate-800/30 p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 space-y-8 shadow-sm">
                <div className="text-center space-y-2 mb-8">
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white">New Evaluation</h3>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Add a new skill assessment category</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category Title</label>
                  {/* TITLE DROPDOWN */}
                  <select 
                    value={newEval.title} 
                    onChange={(e) => setNewEval({...newEval, title: e.target.value})} 
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer"
                  >
                    {evaluationOptions.map(option => (
                      <option key={option} value={option} className="font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-900">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Score (1-5)</label>
                    <input 
                      type="number" min="1" max="5" 
                      value={newEval.score} 
                      onChange={(e) => setNewEval({...newEval, score: parseInt(e.target.value)})} 
                      className="w-full p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-black text-xl outline-none" 
                    />
                  </div>
                  <div className="flex items-end pb-4">
                     <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map(b => <div key={b} className={`h-2 w-8 rounded-full ${b <= newEval.score ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />)}
                     </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Instructor Remarks</label>
                  <textarea 
                    rows={4} 
                    value={newEval.remark} 
                    onChange={(e) => setNewEval({...newEval, remark: e.target.value})} 
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm outline-none" 
                    placeholder="Feedback..." required 
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl">Save New Evaluation</button>
              </form>
            </div>
          )}
        </div>

        {/* SESSION DETAIL MODAL */}
        {activeSessionId && (
          <div className="absolute inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl w-full max-w-lg border border-indigo-100">
               <h3 className="text-xl font-black uppercase italic mb-6 text-slate-800 dark:text-white">Edit Session Details</h3>
               <div className="space-y-6">
                 <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Pickup Location (Read Only)</label>
                   <div className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-300 italic">
                     {sessions.find(s => s.id === activeSessionId)?.pickup}
                   </div>
                 </div>
                 <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Instructor Remarks</label>
                   <textarea 
                    value={editFields.notes} 
                    onChange={(e) => setEditFields({...editFields, notes: e.target.value})} 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none text-sm font-medium text-slate-800 dark:text-white" 
                    rows={4} 
                    placeholder="Session feedback..." 
                  />
                 </div>
               </div>
               <div className="flex gap-4 mt-8">
                 <button onClick={() => setActiveSessionId(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                 <button onClick={() => saveSessionDetails(activeSessionId)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Save Session Notes</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}