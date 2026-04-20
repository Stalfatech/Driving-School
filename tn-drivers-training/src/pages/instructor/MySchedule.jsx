import React, { useState, useEffect, useCallback } from 'react';
import Pagination from '../../components/Pagination';
import axios from 'axios';
import { 
  CheckCircle, Clock, MapPin, ScanEye, 
  Search, CalendarDays, Edit3, X, 
  RotateCcw, History, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, UserPlus, Award, Save, Loader2, Briefcase, Edit2
} from "lucide-react";
import InstructorStudentDetail from "../../components/instructor/InstructorStudentDetail";

const API_BASE = "http://localhost:8000/api/instructor";

// Helper: format ISO date to YYYY-MM-DD for input
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};

// Helper: format date for display (Mar 24, 2026)
const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
};

const InstructorSchedule = () => {
  // --- PAGINATION STATES ---
  const [bookPage, setBookPage] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 10;

  // --- OTHER STATES ---
  const [activeTab, setActiveTab] = useState("active");
  const [query, setQuery] = useState("");
  const [scheduleDateFilter, setScheduleDateFilter] = useState(""); 
  const [historyDateFilter, setHistoryDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDutyShift, setSelectedDutyShift] = useState("");
  const [filterDutyShift, setFilterDutyShift] = useState("");
  
  const [dutyShifts, setDutyShifts] = useState([]);
  const [studentPool, setStudentPool] = useState([]);
  const [allManifest, setAllManifest] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [instructorLocation, setInstructorLocation] = useState("St. John's");
  const [loading, setLoading] = useState(true);
  
  const [editingSession, setEditingSession] = useState(null);
  const [selectedForSchedule, setSelectedForSchedule] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [evaluationModal, setEvaluationModal] = useState(null);
  const [evaluationForm, setEvaluationForm] = useState({
    score: 85,
    remarks: "",
    test_type: "Driving Assessment"
  });
  const [savingEvaluation, setSavingEvaluation] = useState(false);
  
  const [formData, setFormData] = useState({ 
    date: "", 
    startTime: "", 
    endTime: "",
    pickupLocation: ""
  });

  const token = localStorage.getItem('access_token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // --- FETCH FUNCTIONS (same as yours, unchanged) ---
  const fetchDutyShifts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/my-duties`, config);
      const data = res.data.data || res.data || [];
      setDutyShifts(data);
      
      if (data.length > 0 && !selectedDutyShift) {
        const firstShift = data[0];
        setSelectedDutyShift(String(firstShift.id));
        setFilterDutyShift(String(firstShift.id));
        setFormData({
          date: formatDateForInput(firstShift.start_date),
          startTime: firstShift.start_time,
          endTime: firstShift.end_time,
          pickupLocation: ""
        });
        if (firstShift.location?.name) {
          setInstructorLocation(firstShift.location.name);
        }
      }
    } catch (error) {
      console.error("Duty shifts fetch error:", error);
    }
  }, [selectedDutyShift]);

  const fetchAvailableStudents = useCallback(async () => {
    if (!selectedDutyShift) return;
    try {
      const res = await axios.get(`${API_BASE}/students?schedule_id=${selectedDutyShift}`, config);
      const students = res.data.data || res.data || [];
      setStudentPool(students);
    } catch (error) {
      console.error("Available students fetch error:", error);
    }
  }, [selectedDutyShift]);

  const fetchAllManifest = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/manifest`, config);
      const data = res.data.data || res.data || [];
      setAllManifest(data);
    } catch (error) {
      console.error("Manifest fetch error:", error);
    }
  }, []);

  const fetchAllHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/history?date=${historyDateFilter}`, config);
      const data = res.data.data || res.data || [];
      setAllHistory(data);
    } catch (error) {
      console.error("History fetch error:", error);
    }
  }, [historyDateFilter]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchDutyShifts();
      await fetchAllManifest();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedDutyShift && activeTab === "book") {
      fetchAvailableStudents();
    }
  }, [selectedDutyShift, activeTab, fetchAvailableStudents]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchAllHistory();
    }
  }, [historyDateFilter, activeTab, fetchAllHistory]);

  // Reset page numbers when filters change
  useEffect(() => setBookPage(1), [query, studentPool]);
  useEffect(() => setActivePage(1), [scheduleDateFilter, filterDutyShift, allManifest, query]);
  useEffect(() => setHistoryPage(1), [historyDateFilter, filterDutyShift, allHistory, query]);

  // --- HANDLERS (your existing handlers, unchanged) ---
  const handleDutyShiftChange = (shiftId) => {
    const newShift = dutyShifts.find(shift => String(shift.id) === String(shiftId));
    if (newShift) {
      setSelectedDutyShift(String(newShift.id));
      setFilterDutyShift(String(newShift.id));
      setFormData({
        date: formatDateForInput(newShift.start_date),
        startTime: newShift.start_time,
        endTime: newShift.end_time,
        pickupLocation: ""
      });
      if (newShift.location?.name) {
        setInstructorLocation(newShift.location.name);
      }
    }
  };

  const startEdit = (session) => {
    setEditingSession(session);
    setFormData({
      date: formatDateForInput(session.date),
      startTime: session.start_time,
      endTime: session.end_time,
      pickupLocation: session.student_location || ""
    });
  };

  const handleUpdate = async () => {
    if (!editingSession) return;
    try {
      await axios.put(`${API_BASE}/assignments/${editingSession.id}`, {
        schedule_id: selectedDutyShift,
        student_id: editingSession.student_id,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        student_location: formData.pickupLocation
      }, config);
      
      setEditingSession(null);
      await fetchAllManifest();
      alert("Session updated successfully!");
    } catch (error) {
      alert("Error updating session: " + (error.response?.data?.message || error.message));
    }
  };

  const confirmSchedule = async (student) => {
    try {
      await axios.post(`${API_BASE}/assignments`, {
        schedule_id: selectedDutyShift,
        student_id: student.id,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        student_location: formData.pickupLocation || student.pickup
      }, config);
      
      setSelectedForSchedule(null);
      await fetchAvailableStudents();
      await fetchAllManifest();
      alert("Session scheduled successfully!");
    } catch (error) {
      alert("Error scheduling session: " + (error.response?.data?.message || error.message));
    }
  };

  const handleMarkPresent = async (sessionId) => {
    if (!window.confirm("Mark student as PRESENT?")) return;
    try {
      await axios.post(`${API_BASE}/assignments/${sessionId}/attendance`, { status: "present" }, config);
      await fetchAllManifest();
      await fetchAllHistory();
    } catch (error) {
      alert("Error marking attendance: " + error.message);
    }
  };

  const handleMarkAbsent = async (sessionId) => {
    if (!window.confirm("Mark student as ABSENT?")) return;
    try {
      await axios.post(`${API_BASE}/assignments/${sessionId}/attendance`, { status: "absent" }, config);
      await fetchAllManifest();
      await fetchAllHistory();
    } catch (error) {
      alert("Error marking attendance: " + error.message);
    }
  };

  const handleRestore = async (sessionId) => {
    if (!window.confirm("Restore this session to active roster?")) return;
    try {
      await axios.delete(`${API_BASE}/assignments/${sessionId}/attendance`, config);
      await fetchAllHistory();
      await fetchAllManifest();
      alert("Session restored to active roster!");
    } catch (error) {
      alert("Error restoring session: " + (error.response?.data?.message || error.message));
    }
  };

  const openEvaluationModal = (session) => {
    setEvaluationModal(session);
    if (session.evaluation) {
      setEvaluationForm({
        score: session.evaluation.score,
        remarks: session.evaluation.instructor_remarks || session.evaluation.remarks || "",
        test_type: session.evaluation.test_type || "Driving Assessment"
      });
    } else {
      setEvaluationForm({
        score: 85,
        remarks: "",
        test_type: "Driving Assessment"
      });
    }
  };

  const handleSaveEvaluation = async () => {
    if (!evaluationModal) return;
    setSavingEvaluation(true);
    
    try {
      await axios.post(`${API_BASE}/assignments/${evaluationModal.id}/evaluation`, {
        score: evaluationForm.score,
        remarks: evaluationForm.remarks,
        test_type: evaluationForm.test_type
      }, config);
      
      setSavingEvaluation(false);
      setEvaluationModal(null);
      await fetchAllHistory();
      await fetchAllManifest();
      alert("Evaluation saved successfully!");
    } catch (error) {
      setSavingEvaluation(false);
      alert("Error saving evaluation: " + (error.response?.data?.message || error.message));
    }
  };

  const currentShift = dutyShifts.find(shift => String(shift.id) === String(selectedDutyShift));
  
  // --- FILTERS & PAGINATION ---
  const availableStudents = studentPool.filter(s => {
    const matchesSearch = (s.name || s.user?.name || "").toLowerCase().includes(query.toLowerCase());
    return matchesSearch;
  });

  const activeList = allManifest.filter(s => {
    const matchesDuty = filterDutyShift ? String(s.schedule_id) === String(filterDutyShift) : true;
    const matchesDate = scheduleDateFilter === "" || formatDateForInput(s.date) === scheduleDateFilter;
    const matchesSearch = (s.student?.user?.name || s.student?.name || "").toLowerCase().includes(query.toLowerCase());
    return !s.attendance && matchesDuty && matchesDate && matchesSearch;
  });

  const historyList = allHistory.filter(s => {
    const matchesDuty = filterDutyShift ? String(s.schedule_id) === String(filterDutyShift) : true;
    const matchesSearch = (s.student?.user?.name || s.student?.name || "").toLowerCase().includes(query.toLowerCase());
    return s.attendance && matchesDuty && matchesSearch;
  });

  // Paginated slices
  const currentStudents = availableStudents.slice((bookPage - 1) * itemsPerPage, bookPage * itemsPerPage);
  const bookTotalPages = Math.ceil(availableStudents.length / itemsPerPage);

  const activePaginated = activeList.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);
  const activeTotalPages = Math.ceil(activeList.length / itemsPerPage);

  const historyPaginated = historyList.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);
  const historyTotalPages = Math.ceil(historyList.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 min-h-screen">
        <Loader2 size={48} className="animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      <div className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 overflow-y-auto">
        <div className="max-w-[1920px] mx-auto space-y-4 sm:space-y-6">
          
          {/* HEADER () */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-full md:w-auto text-center md:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
                My <span className="text-teal-600 dark:text-teal-400">Schedules</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-800 dark:text-slate-400 mt-1 font-medium">
                Manage your daily lessons and student sessions at <span className="text-teal-600 font-semibold">{currentShift?.location?.name || instructorLocation}</span>
              </p>
            </div>
            <div className="flex justify-center md:justify-end w-full md:w-auto">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <CalendarIcon size={16} className="sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
  <div className="p-4 sm:p-5 md:p-6">
    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
        <Briefcase size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-teal-600 dark:text-teal-400" />
      </div>
      <div>
        <h3 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Active Duty Shift</h3>
        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select your current shift assignment</p>
      </div>
    </div>
    
    {/* Wrapper for horizontal scroll on very small screens */}
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <select 
        value={selectedDutyShift} 
        onChange={(e) => handleDutyShiftChange(e.target.value)}
        className="w-full px-3 sm:px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[10px] sm:text-sm lg:text-md font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
      >
        {dutyShifts.map(shift => (
          <option key={shift.id} value={shift.id} className="truncate">
            {shift.task_description} ({formatDisplayDate(shift.start_date)} - {formatDisplayDate(shift.end_date)}) • {shift.start_time} - {shift.end_time}
          </option>
        ))}
      </select>
    </div>
    
    {currentShift && (
      <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-slate-200 dark:border-slate-700">
          <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-900">Period</p>
          <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
            {formatDisplayDate(currentShift.start_date)} - {formatDisplayDate(currentShift.end_date)}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-slate-200 dark:border-slate-700">
          <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-900">Daily Hours</p>
          <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
            {currentShift.start_time} - {currentShift.end_time}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-slate-200 dark:border-slate-700">
          <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-900">Location</p>
          <p className="text-xs sm:text-sm font-medium text-teal-600 mt-1">
            {currentShift.location?.name || instructorLocation}
          </p>
        </div>
      </div>
    )}
  </div>
</div>

          {/* TAB NAVIGATION  */}
          <div className="flex justify-center sm:justify-start overflow-x-auto">
            <div className="flex gap-1 sm:gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
              {[
                { id: "book", label: "Add Sessions", icon: <UserPlus size={12} className="sm:w-4 sm:h-4" /> },
                { id: "active", label: "Active Roster", icon: <Clock size={12} className="sm:w-4 sm:h-4" /> },
                { id: "history", label: "History", icon: <History size={12} className="sm:w-4 sm:h-4" /> }
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className={`flex-1 sm:flex-none px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap ${
                    activeTab === tab.id 
                      ? "bg-teal-600 text-white shadow-sm" 
                      : "text-slate-600 dark:text-slate-400 hover:text-teal-600"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span className="xs:hidden">{tab.id === "book" ? "Add" : tab.id === "active" ? "Active" : "History"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* --- BOOKING TAB  --- */}
          {activeTab === "book" && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900 dark:text-white w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="w-full pl-8 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-black dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                />
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left table-auto">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-400 w-[40%]">Student</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-400 w-[35%]">Location</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-400 w-[25%]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentStudents.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                                {(s.name || s.user?.name || "S").charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                                  {s.name || s.user?.name}
                                </p>
                                <p className="text-[10px] sm:text-xs text-slate-700 truncate">
                                  {s.email || s.user?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <MapPin size={10} className="sm:w-3 sm:h-3 text-teal-500 flex-shrink-0" />
                              <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-400 truncate">
                                {s.pickup || `${s.street_address || ''} ${s.city || ''}`.trim() || "Main Office"}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right">
                            <button 
                              onClick={() => { 
                                setSelectedForSchedule(s); 
                                setFormData({ 
                                  date: currentShift ? formatDateForInput(currentShift.start_date) : "", 
                                  startTime: currentShift?.start_time || "", 
                                  endTime: currentShift?.end_time || "",
                                  pickupLocation: s.pickup || `${s.street_address || ''} ${s.city || ''}`.trim()
                                }); 
                              }} 
                              className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] sm:text-xs font-semibold transition-all whitespace-nowrap"
                            >
                              Schedule
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {currentStudents.map(s => (
                    <div key={s.id} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {(s.name || s.user?.name || "S").charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {s.name || s.user?.name}
                          </p>
                          <p className="text-xs text-slate-800 truncate">
                            {s.email || s.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-400">
                        <MapPin size={14} className="text-teal-500 flex-shrink-0" />
                        <span className="truncate">{s.pickup || `${s.street_address || ''} ${s.city || ''}`.trim() || "Main Office"}</span>
                      </div>
                      <button 
                        onClick={() => { 
                          setSelectedForSchedule(s); 
                          setFormData({ 
                            date: currentShift ? formatDateForInput(currentShift.start_date) : "", 
                            startTime: currentShift?.start_time || "", 
                            endTime: currentShift?.end_time || "",
                            pickupLocation: s.pickup || `${s.street_address || ''} ${s.city || ''}`.trim()
                          }); 
                        }} 
                        className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        Schedule Session
                      </button>
                    </div>
                  ))}
                </div>

                {availableStudents.length === 0 && (
                  <div className="py-8 sm:py-12 text-center">
                    <UserPlus size={32} className="sm:w-12 sm:h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-slate-500">No students available to schedule</p>
                  </div>
                )}

                {/* Pagination component */}
                {bookTotalPages > 1 && (
                  <Pagination
                    currentPage={bookPage}
                    totalPages={bookTotalPages}
                    onPageChange={setBookPage}
                  />
                )}
              </div>
            </div>
          )}

          {/* --- ACTIVE TAB --- */}
          {activeTab === "active" && (
            <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="sm:w-4 sm:h-4 text-teal-500" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Active Sessions</h3>
                </div>
                <input 
                  type="date" 
                  value={scheduleDateFilter} 
                  onChange={(e) => setScheduleDateFilter(e.target.value)} 
                  className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500/20 w-full sm:w-auto" 
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                {activePaginated.length > 0 ? (
                  activePaginated.map(s => (
                    <div key={s.id} className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group">
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                          <Clock size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate max-w-[150px] sm:max-w-none">
                            {s.student?.user?.name || s.student?.name}
                          </p>
                          <p className="text-[10px] sm:text-xs font-medium text-teal-600 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} className="sm:w-3 sm:h-3" /> 
                            <span className="truncate max-w-[100px] sm:max-w-none">{s.student_location}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="text-left sm:text-right min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px] sm:max-w-none">
                            {s.start_time} - {s.end_time}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-500">{formatDisplayDate(s.date)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleMarkPresent(s.id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all" title="Mark Present">
                            <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button onClick={() => handleMarkAbsent(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Mark Absent">
                            <X size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button onClick={() => startEdit(s)} className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all" title="Edit Session">
                            <Edit3 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button onClick={() => setViewingStudent(s.student)} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all" title="View Student">
                            <ScanEye size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 sm:py-12 text-center bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800">
                    <Clock size={32} className="sm:w-12 sm:h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-slate-500">No active sessions found</p>
                  </div>
                )}
              </div>
              {activeTotalPages > 1 && (
                <Pagination
                  currentPage={activePage}
                  totalPages={activeTotalPages}
                  onPageChange={setActivePage}
                />
              )}
            </div>
          )}

          {/* --- HISTORY TAB  --- */}
          {activeTab === "history" && (
            <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2">
                  <History size={14} className="sm:w-4 sm:h-4 text-teal-500" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Completed Sessions</h3>
                </div>
                <input 
                  type="date" 
                  value={historyDateFilter} 
                  onChange={(e) => setHistoryDateFilter(e.target.value)} 
                  className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500/20 w-full sm:w-auto" 
                />
              </div>
              
              {historyPaginated.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {historyPaginated.map(s => {
                    const attendanceStatus = s.attendance?.status?.toLowerCase();
                    return (
                      <div key={s.id} className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-all">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white truncate">
                            {s.student?.user?.name || s.student?.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                            <p className="text-[10px] sm:text-xs text-slate-500">{formatDisplayDate(s.date)} • {s.start_time} - {s.end_time}</p>
                            <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1">
                              <MapPin size={10} className="sm:w-3 sm:h-3" /> 
                              <span className="truncate max-w-[80px] sm:max-w-none">{s.student_location}</span>
                            </p>
                            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold ${
                              attendanceStatus === 'present' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {attendanceStatus === 'present' ? 'Present' : 'Absent'}
                            </span>
                            {s.evaluation && (
                              <span className="px-1.5 sm:px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 rounded-full text-[8px] sm:text-[9px] font-bold">
                                Score: {s.evaluation.score}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {attendanceStatus === 'present' && (
                            <button 
                              onClick={() => openEvaluationModal(s)} 
                              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] sm:text-xs font-semibold transition-all flex items-center gap-1"
                            >
                              {s.evaluation ? <Edit2 size={10} className="sm:w-3 sm:h-3" /> : <Award size={10} className="sm:w-3 sm:h-3" />}
                              <span className="hidden xs:inline">{s.evaluation ? "Edit" : "Add"} Evaluation</span>
                              <span className="xs:hidden">{s.evaluation ? "Edit" : "Add"}</span>
                            </button>
                          )}
                          <button 
  onClick={() => !s.evaluation && handleRestore(s.id)} 
  disabled={!!s.evaluation}
  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all flex items-center gap-1 ${
    s.evaluation 
      ? 'bg-gray-400 cursor-not-allowed opacity-50' 
      : 'bg-amber-600 hover:bg-amber-700 text-white'
  }`}
  title={s.evaluation ? "Cannot restore – evaluation already added" : "Restore session"}
>
  <RotateCcw size={10} className="sm:w-3 sm:h-3" />
  <span className="hidden xs:inline">Restore</span>
</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 sm:py-12 text-center bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800">
                  <History size={32} className="sm:w-12 sm:h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm text-slate-500">No completed sessions found</p>
                </div>
              )}
              {historyTotalPages > 1 && (
                <Pagination
                  currentPage={historyPage}
                  totalPages={historyTotalPages}
                  onPageChange={setHistoryPage}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODALS () */}
      {(selectedForSchedule || editingSession) && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                {editingSession ? "Reschedule Session" : "Assign Session"}
              </h3>
              <button 
                onClick={() => { setSelectedForSchedule(null); setEditingSession(null); }} 
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors dark:text-white hover:text-red-500"
              >
                <X size={16} className="sm:w-5 sm:h-5 " />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-white  uppercase tracking-wider">Session Date</label>
                <input 
                  type="date" 
                  min={currentShift ? formatDateForInput(currentShift.start_date) : ""} 
                  max={currentShift ? formatDateForInput(currentShift.end_date) : ""} 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  className="w-full px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Start Time</label>
                  <input 
                    type="time" 
                    value={formData.startTime} 
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                    className="w-full px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm dark:text-white font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">End Time</label>
                  <input 
                    type="time" 
                    value={formData.endTime} 
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                    className="w-full px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium outline-none dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Pickup Location</label>
                <input 
                  type="text" 
                  value={formData.pickupLocation} 
                  onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})} 
                  className="w-full px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:text-white dark:border-slate-700 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="Enter pickup location"
                />
              </div>
              <button 
                onClick={editingSession ? handleUpdate : () => confirmSchedule(selectedForSchedule)} 
                className="w-full py-2 sm:py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-teal-500/20 mt-2"
              >
                {editingSession ? "Confirm Update" : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {evaluationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-teal-600 dark:text-teal-400">
                  {evaluationModal.evaluation ? "Edit Evaluation" : "Add Evaluation"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate max-w-[200px] sm:max-w-none">
                  {evaluationModal.student?.user?.name || evaluationModal.student?.name}
                </p>
              </div>
              <button 
                onClick={() => setEvaluationModal(null)} 
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Assessment Type</label>
                <input 
                  type="text"
                  value={evaluationForm.test_type}
                  onChange={(e) => setEvaluationForm({...evaluationForm, test_type: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="e.g., Parallel Parking, Highway Driving"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Score (0-100)</label>
                <div className="flex items-center gap-2 sm:gap-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="100"
                    value={evaluationForm.score}
                    onChange={(e) => setEvaluationForm({...evaluationForm, score: parseInt(e.target.value)})}
                    className="flex-1 accent-teal-600 h-2"
                  />
                  <span className="text-xl sm:text-2xl font-bold text-teal-600 w-12 sm:w-16 text-center">
                    {evaluationForm.score}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Instructor Remarks</label>
                <textarea 
                  rows={3}
                  value={evaluationForm.remarks}
                  onChange={(e) => setEvaluationForm({...evaluationForm, remarks: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                  placeholder="Add your feedback about the student's performance..."
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2">
                <button 
                  onClick={() => setEvaluationModal(null)} 
                  className="flex-1 px-3 sm:px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEvaluation}
                  disabled={savingEvaluation}
                  className="flex-1 px-3 sm:px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingEvaluation ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  {savingEvaluation ? "Saving..." : "Save Evaluation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingStudent && (
        <InstructorStudentDetail 
          student={viewingStudent} 
          onClose={() => setViewingStudent(null)} 
        />
      )}
    </div>
  );
};

export default InstructorSchedule;