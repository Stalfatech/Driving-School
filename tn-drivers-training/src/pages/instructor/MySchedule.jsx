
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Pagination from '../../components/Pagination';
import axios from 'axios';
import { 
  CheckCircle, Clock, MapPin, ScanEye, 
  Search, CalendarDays, Edit3, X, 
  RotateCcw, History, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, UserPlus, Award, Save, Loader2, Briefcase, Edit2,
  Calendar, ChevronDown, PlusCircle, Trash2, AlertCircle, Star  
} from "lucide-react";
import InstructorStudentDetail from "../../components/instructor/InstructorStudentDetail";
import TestResultModal from "../../components/instructor/TestResultModal";

const API_BASE = "http://localhost:8000/api/instructor";

// Helper functions
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};

const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTimeAMPM = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHour = h % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const InstructorSchedule = () => {
  // --- PAGINATION STATES ---
  const [bookPage, setBookPage] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 10;

  // --- VIEW MODES ---
  const [dashboardMode, setDashboardMode] = useState("list");
  
  // --- CALENDAR STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateAssignments, setSelectedDateAssignments] = useState([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // --- OTHER STATES ---
  const [activeTab, setActiveTab] = useState("active");
  const [query, setQuery] = useState("");
  const [scheduleDateFilter, setScheduleDateFilter] = useState(""); 
  const [historyDateFilter, setHistoryDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDutyShift, setSelectedDutyShift] = useState("");
  
  const [dutyShifts, setDutyShifts] = useState([]);
  const [studentPool, setStudentPool] = useState([]);
  const [allManifest, setAllManifest] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [fullStudentData, setFullStudentData] = useState([]); 
  const [instructorLocation, setInstructorLocation] = useState("St. John's");
  const [loading, setLoading] = useState(true);
  const [conflictError, setConflictError] = useState(null);
  const [saving, setSaving] = useState(false);
  
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
  const [checkingConflict, setCheckingConflict] = useState(false);
  
  // Test related states
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testResultModal, setTestResultModal] = useState(null);
  const [savingTestResult, setSavingTestResult] = useState(false);
  const [testEligibleStudents, setTestEligibleStudents] = useState([]);
  const [testFormData, setTestFormData] = useState({
    student_id: '',
    test_type: '',
    date: '',
    start_time: '',
    end_time: '',
    pickup_location: ''
  });
  const [schedulingTest, setSchedulingTest] = useState(false);
  
  const [formData, setFormData] = useState({ 
    date: "", 
    startTime: "", 
    endTime: "",
    pickupLocation: ""
  });

  const token = localStorage.getItem('access_token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // --- CALENDAR HELPERS ---
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentDate]);

  const getAssignmentsForDate = (dateStr) => {
    if (!allManifest.length) return [];
    return allManifest.filter(a => a.date === dateStr && !a.attendance);
  };

  // --- FETCH FUNCTIONS ---
  const fetchDutyShifts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/my-duties`, config);
      const data = res.data.data || res.data || [];
      setDutyShifts(data);
      
      if (data.length > 0 && !selectedDutyShift) {
        const firstShift = data[0];
        setSelectedDutyShift(String(firstShift.id));
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

  const fetchTestEligibleStudents = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/test-eligible-students`, config);
      if (res.data.success) {
        setTestEligibleStudents(res.data.data);
      }
    } catch (error) {
      console.error("Fetch test eligible students error:", error);
    }
  }, []);

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

  // Check for time slot conflict (Instructor-specific endpoint)
  const checkConflict = async (date, startTime, endTime, assignmentId = null) => {
    if (!selectedDutyShift) return false;
    setCheckingConflict(true);
    try {
      const payload = {
        schedule_id: selectedDutyShift,
        date: date,
        start_time: startTime,
        end_time: endTime
      };
      if (assignmentId) {
        payload.assignment_id = assignmentId;
      }
      const res = await axios.post(`${API_BASE}/check-conflict`, payload, config);
      return res.data.has_conflict;
    } catch (error) {
      console.error("Conflict check error:", error);
      return false;
    } finally {
      setCheckingConflict(false);
    }
  };

  // --- INITIAL LOAD ---
// --- INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchDutyShifts();
      await fetchAllManifest();
      await fetchAllHistory();
      
      // ADD THIS BLOCK: Fetch the rich student dictionary in the background
      try {
        const res = await axios.get(`${API_BASE}/my-students`, config);
        setFullStudentData(res.data.data || res.data || []);
      } catch (e) {
        console.error("Failed to load rich student data", e);
      }

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

  // Reset page numbers
  useEffect(() => setBookPage(1), [query, studentPool]);
  useEffect(() => setActivePage(1), [scheduleDateFilter, allManifest, query]);
  useEffect(() => setHistoryPage(1), [historyDateFilter, allHistory, query]);

  // --- HANDLERS ---
  const handleDutyShiftChange = (shiftId) => {
    const newShift = dutyShifts.find(shift => String(shift.id) === String(shiftId));
    if (newShift) {
      setSelectedDutyShift(String(newShift.id));
      setFormData({
        date: formatDateForInput(newShift.start_date),
        startTime: newShift.start_time,
        endTime: newShift.end_time,
        pickupLocation: ""
      });
      if (newShift.location?.name) {
        setInstructorLocation(newShift.location.name);
      }
      fetchAllManifest();
      fetchAllHistory();
      fetchAvailableStudents();
    }
  };

  // Helper to format the raw backend student object for the detail modal
  const handleViewStudent = (rawStudent) => {
    if (!rawStudent) return;
    
    // Find the enriched student data from the background dictionary
    const enrichedStudent = fullStudentData.find(s => String(s.id) === String(rawStudent.id)) || {};
    
    const formattedStudent = {
      id: rawStudent.id,
      studentId: `STU-${String(rawStudent.id).padStart(3, '0')}`,
      name: rawStudent.user?.name || rawStudent.name || enrichedStudent.name || 'Unknown',
      email: rawStudent.user?.email || rawStudent.email || enrichedStudent.email || '',
      phone: rawStudent.user?.phone || rawStudent.phone || enrichedStudent.phone || '',
      
      // ✅ FIX: Grab package and progress from the enriched dictionary
      package: enrichedStudent.package?.package_name || enrichedStudent.package?.name || rawStudent.package?.package_name || 'Standard Package',
      progress: enrichedStudent.progress ?? rawStudent.progress ?? 0,
      
      // Address info
      street_address: rawStudent.street_address || enrichedStudent.street_address || '',
      city: rawStudent.city || enrichedStudent.city || '',
      province: rawStudent.province || enrichedStudent.province || '',
      postal_code: rawStudent.postal_code || enrichedStudent.postal_code || ''
    };
    
    setViewingStudent(formattedStudent);
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
    
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setConflictError("Please fill all required fields.");
      setTimeout(() => setConflictError(null), 5000);
      return;
    }
    
    const hasConflict = await checkConflict(formData.date, formData.startTime, formData.endTime, editingSession.id);
    if (hasConflict) {
      setConflictError("Time slot conflicts with another session! Please choose a different time.");
      setTimeout(() => setConflictError(null), 5000);
      return;
    }
    
    setSaving(true);
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
      setSaving(false);
      await fetchAllManifest();
      await fetchAllHistory();
      alert("Session updated successfully!");
    } catch (error) {
      setSaving(false);
      alert("Error updating session: " + (error.response?.data?.message || error.message));
    }
  };

  const confirmSchedule = async (student) => {
    if (!formData.date) {
      setConflictError("Please select a date.");
      setTimeout(() => setConflictError(null), 5000);
      return;
    }
    if (!formData.startTime) {
      setConflictError("Please select start time.");
      setTimeout(() => setConflictError(null), 5000);
      return;
    }
    if (!formData.endTime) {
      setConflictError("Please select end time.");
      setTimeout(() => setConflictError(null), 5000);
      return;
    }
    
    const hasConflict = await checkConflict(formData.date, formData.startTime, formData.endTime);
    if (hasConflict) {
      setConflictError("Time slot conflicts with an existing session! Please choose a different time.");
      setTimeout(() => setConflictError(null), 5000);
      return;
    }
    
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/assignments`, {
        schedule_id: selectedDutyShift,
        student_id: student.id,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        student_location: formData.pickupLocation || student.pickup || "Main Office"
      }, config);
      
      setSelectedForSchedule(null);
      setShowAssignmentModal(false);
      setSaving(false);
      
      setFormData({
        date: currentShift ? formatDateForInput(currentShift.start_date) : "",
        startTime: currentShift?.start_time || "09:00",
        endTime: currentShift?.end_time || "10:00",
        pickupLocation: ""
      });
      
      await fetchAvailableStudents();
      await fetchAllManifest();
      await fetchAllHistory();
      
      alert("Session scheduled successfully!");
    } catch (error) {
      setSaving(false);
      const errorMsg = error.response?.data?.message || "Error scheduling session";
      if (errorMsg.toLowerCase().includes("conflict") || errorMsg.toLowerCase().includes("already")) {
        setConflictError(errorMsg);
        setTimeout(() => setConflictError(null), 5000);
      } else {
        alert(errorMsg);
      }
    }
  };

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    const assignments = getAssignmentsForDate(dateStr);
    setSelectedDateAssignments(assignments);
    setShowAssignmentModal(true);
  };

  const handleScheduleTest = async () => {
    if (!testFormData.student_id) {
      setConflictError("Please select a student.");
      setTimeout(() => setConflictError(null), 5000);
      return;
    }
    if (!testFormData.test_type.trim()) {
      setConflictError("Please enter the test type.");
      setTimeout(() => setConflictError(null), 5000);
      return;
    }
    if (!testFormData.date) {
      setConflictError("Please select a date.");
      setTimeout(() => setConflictError(null), 5000);
      return;
    }
    if (!testFormData.start_time || !testFormData.end_time) {
      setConflictError("Please select start and end time.");
      setTimeout(() => setConflictError(null), 5000);
      return;
    }

    setSchedulingTest(true);
    try {
      await axios.post(`${API_BASE}/schedule-test`, {
        student_id: testFormData.student_id,
        test_type: testFormData.test_type.trim(),
        date: testFormData.date,
        start_time: testFormData.start_time,
        end_time: testFormData.end_time,
        pickup_location: testFormData.pickup_location
      }, config);

      alert("Test scheduled successfully!");
      setTestModalOpen(false);
      setTestFormData({
        student_id: '',
        test_type: '',
        date: '',
        start_time: '',
        end_time: '',
        pickup_location: ''
      });
      await fetchAllManifest();
      await fetchAllHistory();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to schedule test");
    } finally {
      setSchedulingTest(false);
    }
  };

  const handleSaveTestResult = async (resultData) => {
    setSavingTestResult(true);
    try {
      await axios.post(`${API_BASE}/assignments/${testResultModal.id}/attendance`, { status: "present" }, config);
      await axios.post(`${API_BASE}/test-result/${testResultModal.id}`, {
        score: resultData.score,
        result: resultData.result,
        remarks: resultData.remarks
      }, config);

      alert("Test results saved successfully!");
      setTestResultModal(null);
      await fetchAllManifest();
      await fetchAllHistory();
      await fetchTestEligibleStudents();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save test results");
    } finally {
      setSavingTestResult(false);
    }
  };

  const handleMarkPresent = async (session) => {
    if (session.is_test && !session.test_result) {
      setTestResultModal(session);
      return;
    }
    
    if (!window.confirm("Mark student as PRESENT?")) return;
    try {
      await axios.post(`${API_BASE}/assignments/${session.id}/attendance`, { status: "present" }, config);
      await fetchAllManifest();
      await fetchAllHistory();
      alert("Student marked as present!");
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
      alert("Student marked as absent!");
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

  // Generate time slots for a day
  const generateTimeSlots = () => {
    if (!currentShift) return [];
    const slots = [];
    let current = currentShift.start_time;
    const end = currentShift.end_time;
    
    while (timeToMinutes(current) < timeToMinutes(end)) {
      const nextHour = Math.floor((timeToMinutes(current) + 60) / 60);
      const nextMin = (timeToMinutes(current) + 60) % 60;
      const nextTime = `${String(nextHour).padStart(2, '0')}:${String(nextMin).padStart(2, '0')}`;
      
      slots.push({ start: current, end: nextTime });
      current = nextTime;
    }
    return slots;
  };

  // --- FILTERS & PAGINATION ---
  const availableStudents = studentPool.filter(s => {
    const matchesSearch = (s.name || s.user?.name || "").toLowerCase().includes(query.toLowerCase());
    return matchesSearch;
  });

  const activeList = allManifest.filter(s => {
    const matchesDuty = selectedDutyShift ? String(s.schedule_id) === String(selectedDutyShift) : true;
    const matchesDate = scheduleDateFilter === "" || formatDateForInput(s.date) === scheduleDateFilter;
    const matchesSearch = (s.student?.user?.name || s.student?.name || "").toLowerCase().includes(query.toLowerCase());
    return !s.attendance && matchesDuty && matchesDate && matchesSearch;
  });

  const historyList = allHistory.filter(s => {
    const matchesDuty = selectedDutyShift ? String(s.schedule_id) === String(selectedDutyShift) : true;
    const matchesSearch = (s.student?.user?.name || s.student?.name || "").toLowerCase().includes(query.toLowerCase());
    return s.attendance && matchesDuty && matchesSearch;
  });

  // Separate test sessions for Tests tab
  const pendingTests = allManifest.filter(s => s.is_test && !s.attendance);
  const completedTests = allManifest.filter(s => s.is_test && s.attendance);

  const currentStudents = availableStudents.slice((bookPage - 1) * itemsPerPage, bookPage * itemsPerPage);
  const bookTotalPages = Math.ceil(availableStudents.length / itemsPerPage);
  const activePaginated = activeList.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);
  const activeTotalPages = Math.ceil(activeList.length / itemsPerPage);
  const historyPaginated = historyList.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);
  const historyTotalPages = Math.ceil(historyList.length / itemsPerPage);

  const currentShift = dutyShifts.find(shift => String(shift.id) === String(selectedDutyShift));

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
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-full md:w-auto text-center md:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
                My <span className="text-teal-600 dark:text-teal-400">Schedules</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-800 dark:text-slate-400 mt-1 font-medium">
                Manage your daily lessons and student sessions at <span className="text-teal-600 font-semibold">{currentShift?.location?.name || instructorLocation}</span>
              </p>
            </div>
          </div>

          {/* Duty Shift Selector */}
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
                      {formatTimeAMPM(currentShift.start_time)} - {formatTimeAMPM(currentShift.end_time)}
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

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center">
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
              <button 
                onClick={() => setDashboardMode("list")} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${dashboardMode === 'list' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                <CalendarDays size={16} /> List View
              </button>
              <button 
                onClick={() => setDashboardMode("calendar")} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${dashboardMode === 'calendar' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                <Calendar size={16} /> Calendar View
              </button>
            </div>
          </div>

          {/* Calendar View */}
          {dashboardMode === "calendar" && currentShift && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Calendar size={18} className="text-teal-500"/> Schedule Calendar
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-bold w-32 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center py-2 text-xs font-bold text-slate-500">{day}</div>
                  ))}
                  {calendarDays.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="h-24 bg-slate-50 dark:bg-slate-800/30 rounded-lg"></div>;
                    
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayAssignments = getAssignmentsForDate(dateStr);
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;
                    
                    return (
                      <div 
                        key={day} 
                        onClick={() => handleDateSelect(dateStr)}
                        className={`min-h-24 p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md ${isToday ? 'border-teal-500 bg-teal-50/30 dark:bg-teal-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-teal-300'}`}
                      >
                        <div className="text-right mb-1">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isToday ? 'bg-teal-500 text-white' : 'text-slate-600'}`}>{day}</span>
                        </div>
                        <div className="space-y-1">
                          {dayAssignments.slice(0, 2).map(assignment => (
                            <div key={assignment.id} className="text-[10px] p-1 bg-teal-100 dark:bg-teal-900/30 rounded truncate" title={assignment.student?.user?.name}>
                              {formatTimeAMPM(assignment.start_time)} - {assignment.student?.user?.name?.split(' ')[0]}
                            </div>
                          ))}
                          {dayAssignments.length > 2 && (
                            <div className="text-[10px] text-center text-slate-400">+{dayAssignments.length - 2} more</div>
                          )}
                          {dayAssignments.length === 0 && (
                            <div className="text-[10px] text-center text-slate-400 p-1">Available</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* List View with Tabs */}
          {dashboardMode === "list" && (
            <>
              {/* TAB NAVIGATION */}
              <div className="flex justify-center sm:justify-start overflow-x-auto">
                <div className="flex gap-1 sm:gap-2 bg-white dark:bg-slate-900 p-1 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
                  {[
                    { id: "book", label: "Add Sessions", icon: <UserPlus size={12} className="sm:w-4 sm:h-4" /> },
                    { id: "tests", label: "Tests", icon: <Award size={12} className="sm:w-4 sm:h-4" /> },
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
                      <span className="xs:hidden">{tab.id === "book" ? "Add" : tab.id === "tests" ? "Tests" : tab.id === "active" ? "Active" : "History"}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* --- BOOKING TAB --- */}
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
                  
                  {/* Date and Time Selection for Booking */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date</label>
                      <input 
                        type="date" 
                        min={currentShift?.start_date ? formatDateForInput(currentShift.start_date) : ""}
                        max={currentShift?.end_date ? formatDateForInput(currentShift.end_date) : ""}
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Time</label>
                      <input 
                        type="time" 
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Time</label>
                      <input 
                        type="time" 
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      />
                    </div>
                  </div>
                  
                  {conflictError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm flex items-center gap-2">
                      <AlertCircle size={16} /> {conflictError}
                    </div>
                  )}

                  <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Student</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Location</th>
                            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {currentStudents.length > 0 ? (
                            currentStudents.map(student => (
                              <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 font-bold text-sm">
                                      {(student.user?.name || student.name || 'S').charAt(0)}
                                    </div>
                                    <span className="font-medium">{student.user?.name || student.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {student.pickup || student.street_address || 'Main Office'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button 
                                    onClick={() => confirmSchedule(student)}
                                    disabled={saving || checkingConflict}
                                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                  >
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : "Schedule"}
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="px-4 py-8 text-center text-slate-500">
                                No students available for this duty shift
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {bookTotalPages > 1 && (
                      <Pagination currentPage={bookPage} totalPages={bookTotalPages} onPageChange={setBookPage} />
                    )}
                  </div>
                </div>
              )}

              {/* --- TESTS TAB --- */}
              {activeTab === "tests" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button 
                      onClick={() => { fetchTestEligibleStudents(); setTestModalOpen(true); }}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Award size={18} /> Schedule New Test
                    </button>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                      <Clock size={16} className="text-amber-500" /> Pending Tests
                    </h3>
                    <div className="space-y-3">
                      {pendingTests.length > 0 ? (
                        pendingTests.map(session => (
                          <div key={session.id} className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-[10px] font-bold uppercase">
                                    {session.test_type}
                                  </span>
                                  <span className="text-xs text-slate-500">Attempt #{session.test_attempt}</span>
                                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 rounded-full text-[10px] font-bold">
                                    Awaiting Results
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-white">{session.student?.user?.name}</h4>
                                <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
                                  <span className="flex items-center gap-1"><CalendarIcon size={14} /> {formatDisplayDate(session.date)}</span>
                                  <span className="flex items-center gap-1"><Clock size={14} /> {formatTimeAMPM(session.start_time)} - {formatTimeAMPM(session.end_time)}</span>
                                  <span className="flex items-center gap-1"><MapPin size={14} /> {session.student_location}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setTestResultModal(session)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle size={14} /> Enter Results
                                </button>
                                <button 
                                  onClick={() => handleMarkAbsent(session.id)}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                                >
                                  <X size={14} /> Absent
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed">
                          <p className="text-slate-500 text-sm">No pending tests</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 mt-6">
                      <CheckCircle size={16} className="text-green-500" /> Completed Tests
                    </h3>
                    <div className="space-y-3">
                      {completedTests.length > 0 ? (
                        completedTests.map(session => (
                          <div key={session.id} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-[10px] font-bold uppercase">
                                    {session.test_type}
                                  </span>
                                  <span className="text-xs text-slate-500">Attempt #{session.test_attempt}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${session.test_result === 'Pass' ? 'bg-green-100 text-green-700' : session.test_result === 'Fail' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {session.test_result || 'Result Pending'}
                                  </span>
                                  {session.test_score && (
                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[10px] font-bold">
                                      Score: {session.test_score}%
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-white">{session.student?.user?.name}</h4>
                                <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
                                  <span className="flex items-center gap-1"><CalendarIcon size={14} /> {formatDisplayDate(session.date)}</span>
                                  <span className="flex items-center gap-1"><Clock size={14} /> {formatTimeAMPM(session.start_time)} - {formatTimeAMPM(session.end_time)}</span>
                                </div>
                                {session.evaluation?.instructor_remarks && (
                                  <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                                    <p className="text-xs font-semibold text-slate-500">Remarks:</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{session.evaluation.instructor_remarks}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setTestResultModal(session)}
                                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                                >
                                  <Edit3 size={14} /> Edit Results
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed">
                          <p className="text-slate-500 text-sm">No completed tests</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- ACTIVE ROSTER TAB --- */}
              {activeTab === "active" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <input 
                      type="date" 
                      value={scheduleDateFilter} 
                      onChange={(e) => setScheduleDateFilter(e.target.value)} 
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      placeholder="Filter by date"
                    />
                    <input 
                      type="text" 
                      placeholder="Search student..." 
                      value={query} 
                      onChange={(e) => setQuery(e.target.value)} 
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                    {scheduleDateFilter && (
                      <button onClick={() => setScheduleDateFilter("")} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">Clear</button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {activePaginated.filter(s => !s.is_test).length > 0 ? (
                      activePaginated.filter(s => !s.is_test).map(session => (
                        <div key={session.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-white">{session.student?.user?.name}</h4>
                            <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
                              <span className="flex items-center gap-1"><CalendarIcon size={14} /> {formatDisplayDate(session.date)}</span>
                              <span className="flex items-center gap-1"><Clock size={14} /> {formatTimeAMPM(session.start_time)} - {formatTimeAMPM(session.end_time)}</span>
                              <span className="flex items-center gap-1"><MapPin size={14} /> {session.student_location}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => handleMarkPresent(session)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
                              <CheckCircle size={14} /> Present
                            </button>
                            <button onClick={() => handleMarkAbsent(session.id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
                              <X size={14} /> Absent
                            </button>
                            <button onClick={() => startEdit(session)} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
                              <Edit3 size={14} /> Edit
                            </button>
                            <button onClick={() => handleViewStudent(session.student)} className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
                              <ScanEye size={14} /> View
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <Clock size={48} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500">No active sessions found</p>
                      </div>
                    )}
                  </div>
                  {activeTotalPages > 1 && (
                    <Pagination currentPage={activePage} totalPages={activeTotalPages} onPageChange={setActivePage} />
                  )}
                </div>
              )}

              {/* --- HISTORY TAB --- */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <input 
                      type="date" 
                      value={historyDateFilter} 
                      onChange={(e) => setHistoryDateFilter(e.target.value)} 
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                    <input 
                      type="text" 
                      placeholder="Search student..." 
                      value={query} 
                      onChange={(e) => setQuery(e.target.value)} 
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {historyPaginated.length > 0 ? (
                      historyPaginated.map(session => {
                        const attendanceStatus = session.attendance?.status?.toLowerCase();
                        const isPresent = attendanceStatus === 'present';
                        const isAbsent = attendanceStatus === 'absent';
                        
                        return (
                          <div key={session.id} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h4 className="font-bold text-slate-800 dark:text-white">{session.student?.user?.name}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                                  isPresent ? 'bg-green-100 text-green-700' : 
                                  isAbsent ? 'bg-red-100 text-red-700' : 
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {isPresent ? <CheckCircle size={10} /> : isAbsent ? <X size={10} /> : <AlertCircle size={10} />}
                                  {session.attendance?.status || 'Pending'}
                                </span>
                                {session.evaluation && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 flex items-center gap-1">
                                    <Star size={10} /> Score: {session.evaluation.score}%
                                  </span>
                                )}
                                {session.is_test && session.test_result && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${session.test_result === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    Test: {session.test_result}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><CalendarIcon size={14} /> {formatDisplayDate(session.date)}</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> {formatTimeAMPM(session.start_time)} - {formatTimeAMPM(session.end_time)}</span>
                                <span className="flex items-center gap-1"><MapPin size={14} /> {session.student_location}</span>
                              </div>
                              {session.evaluation?.instructor_remarks && (
                                <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                                  <p className="text-xs font-semibold text-slate-500">Instructor Remarks:</p>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{session.evaluation.instructor_remarks}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {isPresent && !session.is_test && (
                                <button 
                                  onClick={() => openEvaluationModal(session)} 
                                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                                >
                                  {session.evaluation ? <Edit2 size={14} /> : <Award size={14} />}
                                  {session.evaluation ? 'Edit Evaluation' : 'Add Evaluation'}
                                </button>
                              )}
                              {!session.evaluation && isPresent && !session.is_test && (
                                <button onClick={() => handleRestore(session.id)} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
                                  <RotateCcw size={14} /> Restore
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <History size={48} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500">No history found</p>
                      </div>
                    )}
                  </div>
                  {historyTotalPages > 1 && (
                    <Pagination currentPage={historyPage} totalPages={historyTotalPages} onPageChange={setHistoryPage} />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Edit Session</h3>
            <div className="space-y-3">
              <input 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                min={currentShift?.start_date ? formatDateForInput(currentShift.start_date) : ""}
                max={currentShift?.end_date ? formatDateForInput(currentShift.end_date) : ""}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700" 
              />
              <input 
                type="time" 
                value={formData.startTime} 
                onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700" 
              />
              <input 
                type="time" 
                value={formData.endTime} 
                onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700" 
              />
              <input 
                type="text" 
                placeholder="Pickup Location" 
                value={formData.pickupLocation} 
                onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})} 
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700" 
              />
              {conflictError && <div className="text-red-600 text-sm p-2 bg-red-50 rounded">{conflictError}</div>}
              <div className="flex gap-3 mt-4">
                <button onClick={() => setEditingSession(null)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={handleUpdate} disabled={saving} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      {evaluationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-50/50 to-transparent dark:from-teal-900/10">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Award className="text-teal-600" size={22} />
                  {evaluationModal.evaluation ? "Edit Lesson Evaluation" : "Add Lesson Evaluation"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {evaluationModal.evaluation ? "Update the student's performance assessment" : "Record the student's driving lesson performance"}
                </p>
              </div>
              <button 
                onClick={() => setEvaluationModal(null)} 
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <UserPlus size={20} className="text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Student</h4>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                      {evaluationModal.student?.user?.name || evaluationModal.student?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Lesson Type
                  </label>
                  <span className="text-xs text-slate-400">(optional)</span>
                </div>
                <input 
                  type="text"
                  value={evaluationForm.test_type}
                  onChange={(e) => setEvaluationForm({...evaluationForm, test_type: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="e.g., City Driving, Highway Practice, Parallel Parking, Night Driving"
                />
                <p className="text-xs text-slate-400 mt-1">Specify what type of driving lesson was conducted</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Performance Score
                  </label>
                  <span className="text-red-500 text-sm">*</span>
                </div>
                
                <div className="space-y-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="1"
                    value={evaluationForm.score} 
                    onChange={(e) => setEvaluationForm({...evaluationForm, score: parseInt(e.target.value)})} 
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Score</p>
                      <p className={`text-3xl font-bold ${
                        evaluationForm.score >= 90 ? 'text-green-600' :
                        evaluationForm.score >= 75 ? 'text-teal-600' :
                        evaluationForm.score >= 60 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {evaluationForm.score}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Grade</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-white">
                        {evaluationForm.score >= 90 ? 'A+' :
                         evaluationForm.score >= 85 ? 'A' :
                         evaluationForm.score >= 80 ? 'A-' :
                         evaluationForm.score >= 75 ? 'B+' :
                         evaluationForm.score >= 70 ? 'B' :
                         evaluationForm.score >= 65 ? 'C+' :
                         evaluationForm.score >= 60 ? 'C' :
                         evaluationForm.score >= 55 ? 'D+' :
                         evaluationForm.score >= 50 ? 'D' : 'F'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Performance</p>
                      <p className={`text-sm font-bold ${
                        evaluationForm.score >= 90 ? 'text-green-600' :
                        evaluationForm.score >= 75 ? 'text-teal-600' :
                        evaluationForm.score >= 60 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {evaluationForm.score >= 90 ? 'Excellent' :
                         evaluationForm.score >= 75 ? 'Good' :
                         evaluationForm.score >= 60 ? 'Satisfactory' :
                         evaluationForm.score < 50 ? 'Very Poor' : 'Needs Improvement'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Instructor Remarks
                  </label>
                  <span className="text-red-500 text-sm">*</span>
                </div>
                <textarea 
                  rows={4}
                  value={evaluationForm.remarks}
                  onChange={(e) => setEvaluationForm({...evaluationForm, remarks: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                  placeholder="Provide detailed feedback about the student's performance..."
                />
                <p className="text-xs text-slate-400 mt-1">Include strengths, areas for improvement, and specific observations</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Quick feedback templates:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Good control of vehicle, needs more highway practice",
                    "Excellent parallel parking, confident driver",
                    "Needs improvement on shoulder checks and mirror usage",
                    "Great progress, ready for next level",
                    "Struggling with clutch control, needs more practice"
                  ].map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => setEvaluationForm({...evaluationForm, remarks: template})}
                      className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"
                    >
                      {template.length > 40 ? template.substring(0, 40) + "..." : template}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <button 
                onClick={() => setEvaluationModal(null)} 
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-white dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEvaluation}
                disabled={savingEvaluation || !evaluationForm.remarks}
                className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingEvaluation ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {savingEvaluation ? "Saving..." : (evaluationModal.evaluation ? "Update Evaluation" : "Save Evaluation")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Assignment Modal */}
      {showAssignmentModal && selectedDate && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-lg max-h-[80vh] flex flex-col rounded-xl shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Schedule for {formatDisplayDate(selectedDate)}</h3>
              <button onClick={() => setShowAssignmentModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold">Student</label>
                  <select 
                    className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                    onChange={(e) => {
                      const student = studentPool.find(s => s.id.toString() === e.target.value);
                      setSelectedForSchedule(student);
                    }}
                    value={selectedForSchedule?.id || ''}
                  >
                    <option value="">Select a student</option>
                    {studentPool.map(s => (
                      <option key={s.id} value={s.id}>{s.user?.name || s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold">Start Time</label>
                  <input 
                    type="time" 
                    value={formData.startTime} 
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                    className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700" 
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">End Time</label>
                  <input 
                    type="time" 
                    value={formData.endTime} 
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                    className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700" 
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Pickup Location</label>
                  <input 
                    type="text" 
                    value={formData.pickupLocation} 
                    onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})} 
                    className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700" 
                    placeholder="Enter pickup location" 
                  />
                </div>
                {conflictError && <div className="text-red-600 text-sm p-2 bg-red-50 rounded">{conflictError}</div>}
                <button 
                  onClick={() => selectedForSchedule && confirmSchedule(selectedForSchedule)}
                  disabled={!selectedForSchedule || saving}
                  className="w-full mt-4 py-2 bg-teal-600 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Confirm Assignment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Test Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-md md:max-w-2xl rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Schedule Test</h3>
              <button onClick={() => setTestModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Select Student <span className="text-red-500">*</span></label>
                <select 
                  className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                  value={testFormData.student_id}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedStudent = testEligibleStudents.find(s => s.id.toString() === selectedId);
                    setTestFormData({
                      ...testFormData, 
                      student_id: selectedId,
                      pickup_location: selectedStudent?.address || ''
                    });
                  }}
                >
                  <option value="">-- Select Student --</option>
                  {testEligibleStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.address?.substring(0, 60)}... (Attempts: {s.test_attempts_count})
                    </option>
                  ))}
                </select>
                {testFormData.student_id && (
                  <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs text-slate-600">
                    <span className="font-semibold">Address:</span> {testEligibleStudents.find(s => s.id.toString() === testFormData.student_id)?.address}
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-semibold text-slate-700">Test Type <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="e.g., Road Test, Highway Test ,Must include Test. "
                  value={testFormData.test_type}
                  onChange={(e) => setTestFormData({...testFormData, test_type: e.target.value})}
                />
                <p className="text-xs text-slate-400 mt-1">You can enter any test type </p>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-slate-700">Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  min={currentShift?.start_date ? formatDateForInput(currentShift.start_date) : ""}
                  max={currentShift?.end_date ? formatDateForInput(currentShift.end_date) : ""}
                  value={testFormData.date}
                  onChange={(e) => setTestFormData({...testFormData, date: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Start Time <span className="text-red-500">*</span></label>
                  <input 
                    type="time" 
                    className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    value={testFormData.start_time}
                    onChange={(e) => setTestFormData({...testFormData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">End Time <span className="text-red-500">*</span></label>
                  <input 
                    type="time" 
                    className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    value={testFormData.end_time}
                    onChange={(e) => setTestFormData({...testFormData, end_time: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-slate-700">Pickup Location</label>
                <input 
                  type="text" 
                  className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  value={testFormData.pickup_location}
                  onChange={(e) => setTestFormData({...testFormData, pickup_location: e.target.value})}
                  placeholder="Test Center (optional)"
                />
                <p className="text-xs text-slate-400 mt-1">Auto-filled with student's address. You can modify if needed.</p>
              </div>
              
              {conflictError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {conflictError}
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => {
                    setTestModalOpen(false);
                    setTestFormData({
                      student_id: '',
                      test_type: '',
                      date: '',
                      start_time: '',
                      end_time: '',
                      pickup_location: ''
                    });
                    setConflictError(null);
                  }} 
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleScheduleTest} 
                  disabled={schedulingTest} 
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {schedulingTest ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}
                  {schedulingTest ? "Scheduling..." : "Schedule Test"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Result Modal */}
      {testResultModal && (
        <TestResultModal 
          test={testResultModal}
          onClose={() => setTestResultModal(null)}
          onSave={handleSaveTestResult}
          saving={savingTestResult}
        />
      )}

      {viewingStudent && (
        <InstructorStudentDetail student={viewingStudent} onClose={() => setViewingStudent(null)} />
      )}
    </div>
  );
};

export default InstructorSchedule;