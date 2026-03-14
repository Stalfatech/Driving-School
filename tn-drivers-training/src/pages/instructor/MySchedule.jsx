
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, MapPin, Eye, Search, X, Briefcase, UserPlus, Loader2, Calendar as CalendarIcon, User as UserIcon, UserX, History, Edit3 } from "lucide-react";
import InstructorStudentDetail from "../../components/instructor/InstructorStudentDetail";

const API_BASE = "http://localhost:8000/api/instructor";

const InstructorSchedule = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("book");
  const [loading, setLoading] = useState(true);
  const [dutyBlocks, setDutyBlocks] = useState([]);
  const [manifest, setManifest] = useState([]);
  const [studentPool, setStudentPool] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [selectedForSchedule, setSelectedForSchedule] = useState(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [filterBlockId, setFilterBlockId] = useState("");
  useEffect(() => {
    if (dutyBlocks.length > 0 && !filterBlockId) {
        setFilterBlockId(String(dutyBlocks[0].id));
    }
}, [dutyBlocks]);
  const [evaluationData, setEvaluationData] = useState({
    assignmentId: null,
    score: '',
    remarks: '',
    test_type:'',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    student_location: ''
  });

  // --- 1. DATA FETCHING ---
  const fetchGlobalData = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [blocksRes, manifestRes] = await Promise.all([
        axios.get(`${API_BASE}/my-duties`, config),
        axios.get(`${API_BASE}/manifest`, config)
      ]);
      const blocksData = blocksRes.data.data || blocksRes.data || [];
      setDutyBlocks(blocksData);
      setManifest(manifestRes.data.data || manifestRes.data || []);
      if (blocksData.length > 0 && !selectedBlockId) {
        setSelectedBlockId(String(blocksData[0].id));
      }
    } catch (error) {
      console.error("Global fetch error:", error);
    }
  }, [selectedBlockId]);

  const fetchAvailableStudents = useCallback(async () => {
    if (!selectedBlockId) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_BASE}/students?schedule_id=${selectedBlockId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentPool(res.data.data || res.data || []);
    } catch (err) {
      console.error("Student fetch error:", err);
    }
  }, [selectedBlockId]);

  const fetchHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_BASE}/history?date=${historyDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceHistory(res.data.data || res.data || []);
    } catch (err) {
      console.error("History fetch error:", err);
    }
  }, [historyDate]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchGlobalData();
      setLoading(false);
    };
    init();
  }, [fetchGlobalData]);

  useEffect(() => {
    if (activeTab === "book") fetchAvailableStudents();
    if (activeTab === "history") fetchHistory();
  }, [selectedBlockId, activeTab, historyDate, fetchAvailableStudents, fetchHistory]);

  // --- 2. ACTIONS ---
  // const handleSaveSession = async () => {
  //   try {
  //     const token = localStorage.getItem('access_token');
  //     const config = { headers: { Authorization: `Bearer ${token}` } };
      
  //     const payload = {
  //       schedule_id: selectedBlockId,
  //       student_id: selectedForSchedule.id,
  //       date: evaluationData.date,
  //       start_time: evaluationData.startTime,
  //       end_time: evaluationData.endTime,
  //       student_location: evaluationData.student_location
  //     };
      
  //     await axios.post(`${API_BASE}/assignments`, payload, config);
  //     alert("Booking confirmed!");
      
  //     setSelectedForSchedule(null);
  //     fetchGlobalData();
  //   } catch (err) {
  //     alert(err.response?.data?.error || "Operation failed");
  //   }
  // };


  // const hhandli new 

  const handleSaveSession = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    const payload = {
      schedule_id: selectedBlockId, // This must be sent
      student_id: selectedForSchedule.id,
      date: evaluationData.date,
      start_time: evaluationData.startTime,
      end_time: evaluationData.endTime,
      student_location: evaluationData.student_location
    };

    if (editingAssignmentId) {
      // THE URL MUST MATCH THE ROUTE IN API.PHP
      // Note: If your API_BASE ends in /instructor, the URL is /instructor/assignments/ID
      await axios.put(`${API_BASE}/assignments/${editingAssignmentId}`, payload, config);
      alert("Booking updated!");
    } else {
      await axios.post(`${API_BASE}/assignments`, payload, config);
      alert("Booking confirmed!");
    }

    // Reset states
    setSelectedForSchedule(null);
    setEditingAssignmentId(null);
        await fetchGlobalData(); 
    await fetchAvailableStudents();
  } catch (err) {
    console.error(err.response);
    alert(err.response?.data?.message || "Operation failed");
  }
};

  const handleFinalize = async (assignmentId) => {
    if (!window.confirm("Mark student as PRESENT?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_BASE}/assignments/${assignmentId}/attendance`,
        { status: "present" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvaluationData(prev => ({ ...prev, assignmentId }));
      fetchGlobalData();
    } catch (err) {
      alert("Error updating attendance");
    }
  };

  const handleMarkAbsent = async (assignmentId) => {
    if (!window.confirm("Mark student as ABSENT?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_BASE}/assignments/${assignmentId}/attendance`,
        { status: "absent" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchGlobalData();
    } catch (err) {
      alert("Error updating attendance");
    }
  };

  const handleEvaluationSubmit = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_BASE}/assignments/${evaluationData.assignmentId}/evaluation`,
        {
          score: evaluationData.score,
          remarks: evaluationData.remarks,
          test_type: evaluationData.test_type,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Evaluation submitted!");
      setEvaluationData({ assignmentId: null, score: '', remarks: '', test_type:'', date: new Date().toISOString().split('T')[0], startTime: '', endTime: '', student_location: '' });
      fetchGlobalData();
      fetchHistory();
    } catch (err) {
      alert("Error submitting evaluation");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  return (
    <div className="flex-1 bg-slate-50 dark:bg-gray-950 min-h-screen font-['Lexend'] pb-20 text-slate-900 dark:text-slate-100">
      <main className="p-4 md:p-10 max-w-7xl mx-auto space-y-8">
        {/* TABS */}
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 w-full md:w-fit gap-1.5">
          {["book", "active", "history"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 md:flex-none px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-indigo-600"}`}>
              {tab === "book" ? "Add Sessions" : tab === "active" ? "Active Manifest" : "History"}
            </button>
          ))}
        </div>

        {/* BOOKING TAB */}
        {activeTab === "book" && (
          <div className="space-y-6">
            <div className="bg-indigo-600 p-6 rounded-4xl text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><Briefcase size={24}/></div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Select Duty Shift</p>
                  <select value={selectedBlockId} onChange={(e) => setSelectedBlockId(e.target.value)} className="bg-transparent font-black text-xl italic outline-none cursor-pointer text-white w-full">
                    {dutyBlocks.map(block => (
                      <option key={block.id} value={block.id} className="text-slate-900"> {block.location?.name || 'Local'} - {block.task_description} </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input type="text" placeholder="Search students..." className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold shadow-sm" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-xl overflow-hidden">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {studentPool.filter(s => s.name?.toLowerCase().includes(query.toLowerCase())).map(s => (
                    <tr key={s.id} className="hover:bg-indigo-50/30 transition-all">
                      <td className="px-8 py-6 flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">{s.name?.charAt(0)}</div>
                        <div>
                          <span className="text-sm font-bold block">{s.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{s.street_address}, {s.city}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
<button onClick={() => {
    setEditingAssignmentId(null);
    setSelectedForSchedule(s);
    // NEW: Pre-fill location with student's address
    setEvaluationData({
        ...evaluationData,
        student_location: `${s.street_address || ''} ${s.city || ''}`.trim() || "Main Office",
        date: new Date().toISOString().split('T')[0] // Reset to today
    });
}} className="...">
    <UserPlus size={14}/> Book Slot
</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* ACTIVE MANIFEST TAB */}
{activeTab === "active" && (
  <div className="space-y-6">
    {/* 1. DUTY SHIFT FILTER (Mirrors Booking Tab) */}
    <div className="bg-indigo-600 p-6 rounded-4xl text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><Briefcase size={24}/></div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Filter By Duty Shift</p>
          <select 
            value={filterBlockId} 
            onChange={(e) => setFilterBlockId(e.target.value)} 
            className="bg-transparent font-black text-xl italic outline-none cursor-pointer text-white w-full"
          >
            <option value="all" className="text-slate-900 font-sans">All Duty Shifts</option>
            {dutyBlocks.map(block => (
              <option key={block.id} value={block.id} className="text-slate-900 font-sans"> 
                {block.location?.name || 'Local'} - {block.task_description} 
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>

    {/* 2. SEARCH BAR */}
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
      <input 
        type="text" 
        placeholder="Filter student name..." 
        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold shadow-sm" 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
      />
    </div>

    {/* 3. LIST */}
    <div className="space-y-4">
      {manifest
        .filter(item => {
            // Filter by selected Block
            const matchesBlock = filterBlockId === "all" || String(item.schedule_id) === String(filterBlockId);
            // Filter by Search Query
            const name = item.student?.user?.name || item.student?.name || "";
            const matchesSearch = name.toLowerCase().includes(query.toLowerCase());
            return matchesBlock && matchesSearch;
        })
        .map(item => (
        <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4 flex-1">
            <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-indigo-600 flex items-center justify-center font-black"> 
                {(item.student?.user?.name || item.student?.name || "S")[0]} 
            </div>
            <div>
              <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">
                {item.student?.user?.name || item.student?.name || "Unknown Student"}
              </h4>
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase"><Clock size={12}/> {item.start_time} - {item.end_time}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><MapPin size={12}/> {item.student_location}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><CalendarIcon size={12}/> {item.date}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!item.attendance && (
              <>
                <button onClick={() => handleFinalize(item.id)} className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Present"><CheckCircle size={20}/></button>
                <button onClick={() => handleMarkAbsent(item.id)} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Absent"><UserX size={20}/></button>
                
                {/* EDIT BUTTON */}
                <button 
                    onClick={() => {
                        setEditingAssignmentId(item.id);
                        setSelectedBlockId(String(item.schedule_id)); // Ensure correct block is selected
                        setSelectedForSchedule(item.student);
                        setEvaluationData({
                            ...evaluationData,
                            date: item.date,
                            startTime: item.start_time,
                            endTime: item.end_time,
                            student_location: item.student_location
                        });
                    }} 
                    className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" 
                    title="Edit Session"
                >
                    <Edit3 size={20}/>
                </button>
              </>
            )}
            <button onClick={() => setViewingStudent(item.student)} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:text-indigo-600 transition-all"><Eye size={20}/></button>
          </div>
        </div>
      ))}
      {manifest.length === 0 && <p className="text-center py-10 text-slate-400 font-bold">No sessions found.</p>}
    </div>
  </div>
)}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl border dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><History size={20}/></div>
                <h3 className="font-black uppercase italic text-slate-800 dark:text-white">Attendance Logs</h3>
              </div>
              <input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl font-bold text-xs p-3 outline-none ring-indigo-500 focus:ring-2" />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Student</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Date & Time</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {attendanceHistory.map(log => (
                    <tr key={log.id}>
                      <td className="px-6 py-5 font-bold text-sm">{log.student?.user?.name || log.student?.name}</td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.date}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{log.start_time} - {log.end_time}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.attendance?.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                            {log.attendance?.status || 'No Record'}
                          </span>
                          {log.attendance?.status === 'present' && (
                            <button onClick={() => setEvaluationData(prev => ({ ...prev, assignmentId: log.id, score: log.evaluation?.score || '', remarks: log.evaluation?.instructor_remarks || '',test_type:log.evaluation?.test_type ||'' }))} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2" >
                              <Edit3 size={14}/>
                              <span className="text-[9px] font-black uppercase">Evaluate</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ASSIGN SESSION */}
{selectedForSchedule && !editingAssignmentId && (
  <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-2xl w-full max-w-lg border dark:border-slate-800 animate-in zoom-in-95">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-2xl font-black uppercase italic text-slate-800 dark:text-white">Assign Session</h3>
          <p className="text-indigo-600 font-bold">{selectedForSchedule.name}</p>
        </div>
        <button onClick={() => setSelectedForSchedule(null)} className="text-slate-400 hover:text-rose-500"><X size={24}/></button>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Session Date</label>
          <input type="date" value={evaluationData.date} onChange={(e) => setEvaluationData({...evaluationData, date: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold border dark:border-slate-700" />
        </div>
        
        <div className="flex gap-4">
            <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Start Time</label>
                <input type="time" onChange={(e) => setEvaluationData({...evaluationData, startTime: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold border dark:border-slate-700" />
            </div>
            <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">End Time</label>
                <input type="time" onChange={(e) => setEvaluationData({...evaluationData, endTime: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold border dark:border-slate-700" />
            </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pickup Location</label>
          {/* This value is now defaulted from the button click above */}
          <input 
            type="text" 
            value={evaluationData.student_location} 
            onChange={(e) => setEvaluationData({...evaluationData, student_location: e.target.value})} 
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold border dark:border-slate-700 focus:border-indigo-600 outline-none" 
          />
        </div>

        <button onClick={handleSaveSession} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">
            Confirm Booking
        </button>
      </div>
    </div>
  </div>
)}
      {/* MODAL: EVALUATION */}
      {evaluationData.assignmentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-2xl w-full max-w-lg border dark:border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-black uppercase italic text-slate-800 dark:text-white">Add Evaluation</h3>
              <button onClick={() => setEvaluationData(prev => ({ ...prev, assignmentId: null }))} className="text-slate-400 hover:text-rose-500"><X size={24}/></button>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Score</label>
                <input type="number" value={evaluationData.score} onChange={(e) => setEvaluationData({ ...evaluationData, score: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold outline-none border dark:border-slate-700 focus:border-indigo-600" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Remarks</label>
                <textarea value={evaluationData.remarks} onChange={(e) => setEvaluationData({ ...evaluationData, remarks: e.target.value })} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold outline-none border dark:border-slate-700 focus:border-indigo-600 h-24 resize-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Test Type</label>
                <textarea value={evaluationData.test_type} onChange={(e) => setEvaluationData({ ...evaluationData, test_type: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold outline-none border dark:border-slate-700 focus:border-indigo-600 h-24 resize-none text-sm" />
</div>
              <button onClick={handleEvaluationSubmit} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">Submit Evaluation</button>
            </div>
          </div>
        </div>
      )}
      {/* ASSIGN / EDIT SESSION MODAL */}
{selectedForSchedule && (
  <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-2xl w-full max-w-lg border dark:border-slate-800 animate-in zoom-in-95">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-2xl font-black uppercase italic text-slate-800 dark:text-white">
            {editingAssignmentId ? "Update Session" : "Assign Session"}
          </h3>
          <p className="text-indigo-600 font-bold">
            {selectedForSchedule.user?.name || selectedForSchedule.name}
          </p>
        </div>
        <button onClick={() => {
            setSelectedForSchedule(null);
            setEditingAssignmentId(null);
        }} className="text-slate-400 hover:text-rose-500"><X size={24}/></button>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Session Date</label>
          <input type="date" value={evaluationData.date} onChange={(e) => setEvaluationData({...evaluationData, date: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold border dark:border-slate-700" />
        </div>
        
        <div className="flex gap-4">
            <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Start Time</label>
                <input 
                    type="time" 
                    value={evaluationData.startTime} 
                    onChange={(e) => setEvaluationData({...evaluationData, startTime: e.target.value})} 
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold border dark:border-slate-700" 
                />
            </div>
            <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">End Time</label>
                <input 
                    type="time" 
                    value={evaluationData.endTime} 
                    onChange={(e) => setEvaluationData({...evaluationData, endTime: e.target.value})} 
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold border dark:border-slate-700" 
                />
            </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pickup Location</label>
          <input 
            type="text" 
            value={evaluationData.student_location} 
            onChange={(e) => setEvaluationData({...evaluationData, student_location: e.target.value})} 
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold border dark:border-slate-700 focus:border-indigo-600 outline-none" 
          />
        </div>

        <button onClick={handleSaveSession} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">
            {editingAssignmentId ? "Save Changes" : "Confirm Booking"}
        </button>
      </div>
    </div>
  </div>
)}

      {viewingStudent && (
        <InstructorStudentDetail student={viewingStudent} onClose={() => setViewingStudent(null)} />
      )}
    </div>
  );
};

export default InstructorSchedule;
