
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { 
  MapPin, Calendar as CalendarIcon, Search, X, 
  Clock, AlertCircle, CheckCircle2, Edit3, Trash2, 
  Users, ArrowLeft, UserPlus, History, PlusCircle, Save,
  CalendarDays, Check, Loader2, Calendar as CalendarViewIcon, CalendarX, ChevronRight, LayoutGrid
} from "lucide-react";
import Pagination from "../components/Pagination";

const API_URL = "http://127.0.0.1:8000/api";

const Schedule = () => {
  // --- 1. STATES ---
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allLocations, setAllLocations] = useState([]);
  const [blockAssignments, setBlockAssignments] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  
  const token = localStorage.getItem("access_token");
  
  // Premium UI States
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [errors, setErrors] = useState({});

  // View & Navigation
  const [viewMode, setViewMode] = useState("dashboard"); // 'dashboard' | 'manage'
  const [dashboardMode, setDashboardMode] = useState("cards"); // 'cards' | 'calendar'
  const [activeSubTab, setActiveSubTab] = useState("block-calendar");
  const [explorerMode, setExplorerMode] = useState("grid"); // 'grid' | 'timeline'
  
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState("All Places");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [activeBlockId, setActiveBlockId] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Master Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayRoster, setSelectedDayRoster] = useState(null);

  // Block Calendar States (Browser Tabs System)
  const [activeDateTab, setActiveDateTab] = useState(""); 
  const [sessionDateFilter, setSessionDateFilter] = useState("");

  // Modal states
  const [isNewDutyModalOpen, setIsNewDutyModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedForSession, setSelectedForSession] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDutyId, setEditingDutyId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isMultiAssignModalOpen, setIsMultiAssignModalOpen] = useState(false);

  // Form data
  const [newDutyData, setNewDutyData] = useState({
    task_description: "",
    start_date: "",
    end_date: "",
    start_time: "08:00",
    end_time: "17:00",
  });

  const [formData, setFormData] = useState({ 
    date: "", 
    startTime: "09:00", 
    endTime: "10:00", 
    location: "", 
    blockId: "",
    assignmentId: null
  });

  const [multiAssignData, setMultiAssignData] = useState({
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    location: ""
  });

  // --- PREMIUM UI HELPERS ---
  const showNotification = (type, message) => {
    setNotification({ type, message });
    if (type !== 'success') {
      setTimeout(() => setNotification(null), 5000);
    } else {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTimeAMPM = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getDatesInRange = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return [];
    const dates = [];
    let curr = new Date(startDateStr + 'T12:00:00'); 
    const end = new Date(endDateStr + 'T12:00:00');
    
    while (curr <= end) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  // --- 2. API CALLS ---
  const fetchBlockAssignments = async (blockId) => {
    if (!blockId) {
      setBlockAssignments([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/admin/assignments/block/${blockId}`, { headers: { Authorization: `Bearer ${token}` } });
      setBlockAssignments(res.data);
    } catch (err) { setBlockAssignments([]); }
  };

  const fetchAllData = async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const locRes = await axios.get(`${API_URL}/locations`, { headers });
      const locationsList = locRes.data.data || [];
      setAllLocations(locationsList);

      const [dutyRes, instRes] = await Promise.all([
        axios.get(`${API_URL}/admin/all-duties`, { headers }),
        axios.get(`${API_URL}/instructors`, { headers })
      ]);

      const dutiesRaw = dutyRes.data || [];
      const allInstRaw = instRes.data.data || instRes.data || [];
      
      const transformed = allInstRaw.map(inst => {
        const instDuties = dutiesRaw.filter(d => d.instructor_id === inst.id);
        const matchedLocation = locationsList.find(loc => loc.province_name.toLowerCase() === inst.assigned_location?.toLowerCase());

        return {
          id: inst.id,
          name: inst.user?.name || `Instructor #${inst.id}`,
          place: inst.assigned_location || "Unassigned",
          location_id: matchedLocation ? matchedLocation.id : (inst.car?.location_id || null),
          workBlocks: instDuties.map(duty => ({
            id: duty.id,
            task: duty.task_description || "Driving Session",
            start: duty.start_date ? duty.start_date.split('T')[0] : "",
            end: duty.end_date ? duty.end_date.split('T')[0] : duty.start_date?.split('T')[0],
            startTime: duty.start_time || "08:00",
            endTime: duty.end_time || "17:00",
            location_id: duty.location_id
          }))
        };
      });
      setInstructors(transformed);
    } catch (error) { 
      showNotification('error', 'Failed to load scheduling data.');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const fetchRelevantStudents = async () => {
      if (!activeBlockId || !selectedInstructor) { 
        setAvailableStudents([]); return; 
      }
      try {
        const res = await axios.get(`${API_URL}/students/by-duty`, {
          params: { instructor_id: selectedInstructor.id, schedule_id: activeBlockId },
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableStudents(res.data);
      } catch (err) { setAvailableStudents([]); }
    };
    fetchRelevantStudents();
  }, [activeBlockId, selectedInstructor]);

  useEffect(() => {
    if (activeBlockId) {
      fetchBlockAssignments(activeBlockId);
    }
  }, [activeBlockId]);

  useEffect(() => { fetchAllData(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPlace]);

  // --- 3. HANDLERS FOR DUTY BLOCKS ---
  const handleAddDuty = () => {
    setIsEditMode(false);
    setEditingDutyId(null);
    setErrors({});
    setNewDutyData({ task_description: "", start_date: sessionDateFilter || "", end_date: sessionDateFilter || "", start_time: "08:00", end_time: "17:00" });
    setIsNewDutyModalOpen(true);
  };

  const handleEditDuty = (block) => {
    setIsEditMode(true);
    setEditingDutyId(block.id);
    setErrors({});
    setNewDutyData({ task_description: block.task, start_date: block.start, end_date: block.end, start_time: block.startTime, end_time: block.endTime });
    setIsNewDutyModalOpen(true);
  };

  const handleSaveDuty = async () => {
    setErrors({});
    let frontendErrors = {};
    if (!newDutyData.task_description.trim()) frontendErrors.task_description = ["Task description is required."];
    if (!newDutyData.start_date) frontendErrors.start_date = ["Start date is required."];
    if (!newDutyData.end_date) frontendErrors.end_date = ["End date is required."];
    if (newDutyData.start_date && newDutyData.end_date && newDutyData.start_date > newDutyData.end_date) {
      frontendErrors.end_date = ["End date cannot be before start date."];
    }
    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors); showNotification('warning', 'Please fix the highlighted errors.'); return;
    }

    setSaving(true);
    const payload = { ...newDutyData, instructor_id: selectedInstructor.id, location_id: selectedInstructor.location_id };
    
    try {
      if (isEditMode) await axios.put(`${API_URL}/admin/duty/${editingDutyId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      else await axios.post(`${API_URL}/admin/duty`, payload, { headers: { Authorization: `Bearer ${token}` } });

      await fetchAllData(); 
      setInstructors(prev => {
        const updated = prev.find(ins => ins.id === selectedInstructor.id);
        if (updated) setSelectedInstructor(updated); return prev;
      });
      setIsNewDutyModalOpen(false); setIsEditMode(false);
      showNotification('success', isEditMode ? "Duty block updated successfully!" : "Duty block created successfully!");
    } catch (err) { showNotification('error', err.response?.data?.message || "Failed to save duty block."); } 
    finally { setSaving(false); }
  };

  const handleDeleteDuty = (id) => {
    setConfirmDialog({
      title: "Deactivate Duty Block", message: "Are you sure you want to deactivate this duty block? Student assignments will be preserved.",
      type: "danger", actionText: "Yes, Deactivate", onConfirm: () => executeDeleteDuty(id)
    });
  };

  const executeDeleteDuty = async (id) => {
    setConfirmDialog(null);
    try {
        await axios.delete(`${API_URL}/admin/duty/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setSelectedInstructor(prev => ({ ...prev, workBlocks: prev.workBlocks.filter(block => block.id !== id) }));
        fetchAllData(); showNotification('success', "Duty block deactivated successfully!");
        if (activeBlockId === id.toString()) {
          setActiveBlockId("");
          setExplorerMode("grid");
        }
    } catch (err) { showNotification('error', "Failed to deactivate duty block."); }
  };

  // --- 4. HANDLERS FOR ASSIGNMENTS (ANTI-DOUBLE BOOKING) ---
  const handleAssignStudent = (student, prefilledDate = "", prefilledStartTime = "", prefilledEndTime = "") => {
    if (!activeBlockId) { showNotification('warning', "Please select a duty block first"); return; }
    setErrors({}); setSelectedForSession(student); setEditingAssignment(null);
    
    const selectedBlock = selectedInstructor.workBlocks.find(b => String(b.id) === String(activeBlockId));
    const defaultDate = prefilledDate || activeDateTab || sessionDateFilter || selectedBlock?.start || "";

    setFormData({
      date: defaultDate,
      startTime: prefilledStartTime || selectedBlock?.startTime || "09:00",
      endTime: prefilledEndTime || selectedBlock?.endTime || "10:00",
      location: student ? student.street_address : "",
      blockId: activeBlockId,
      assignmentId: null
    });
    setIsAssignModalOpen(true);
  };

  const handleEditAssignment = (assignment) => {
    setErrors({}); setEditingAssignment(assignment); setSelectedForSession(assignment.student);
    setFormData({
      date: assignment.date, startTime: assignment.start_time, endTime: assignment.end_time,
      location: assignment.student_location, blockId: activeBlockId, assignmentId: assignment.id
    });
    setIsAssignModalOpen(true);
  };

  const handleDeleteAssignment = (assignmentId) => {
    setConfirmDialog({
      title: "Remove Assignment", message: "Are you sure you want to remove this student from the time slot?",
      type: "danger", actionText: "Yes, Remove", onConfirm: () => executeDeleteAssignment(assignmentId)
    });
  };

  const executeDeleteAssignment = async (assignmentId) => {
    setConfirmDialog(null);
    try {
      await axios.delete(`${API_URL}/assignments/${assignmentId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchBlockAssignments(activeBlockId); showNotification('success', 'Student assignment removed.');
    } catch (err) { showNotification('error', "Failed to remove assignment."); }
  };

  const handleSaveAssignment = async () => {
    setErrors({});
    let frontendErrors = {};
    if (!selectedForSession) frontendErrors.student = ["Please select a student."];
    if (!formData.date) frontendErrors.date = ["Date is required."];
    if (!formData.startTime) frontendErrors.startTime = ["Start time is required."];
    if (!formData.endTime) frontendErrors.endTime = ["End time is required."];
    if (formData.startTime >= formData.endTime) frontendErrors.endTime = ["End time must be after start time."];

    if (Object.keys(frontendErrors).length > 0 && !frontendErrors.student) {
      setErrors(frontendErrors); showNotification('warning', 'Please fix the highlighted validation errors.'); return;
    } else if (frontendErrors.student) {
      showNotification('warning', 'You must select a student first.'); return;
    }

    if (formData.date && formData.startTime && formData.endTime) {
      const newStart = timeToMinutes(formData.startTime);
      const newEnd = timeToMinutes(formData.endTime);
      const hasOverlap = blockAssignments.some(assignment => {
        if (editingAssignment && assignment.id === editingAssignment.id) return false;
        if (assignment.date === formData.date) {
          const existStart = timeToMinutes(assignment.start_time);
          const existEnd = timeToMinutes(assignment.end_time);
          return (newStart < existEnd && newEnd > existStart);
        }
        return false;
      });
      if (hasOverlap) { showNotification('error', 'Time Slot Unavailable: Conflicts with an existing student session on this date.'); return; }
    }

    setSaving(true);
    const isEditing = !!formData.assignmentId;
    const endpoint = isEditing ? `${API_URL}/assignments/${formData.assignmentId}` : `${API_URL}/assignments/book`;
    const method = isEditing ? 'put' : 'post';

    const payload = {
      schedule_id: formData.blockId, student_id: selectedForSession.id, instructor_id: selectedInstructor?.id,
      date: formData.date, start_time: formData.startTime, end_time: formData.endTime, student_location: formData.location
    };

    try {
      await axios[method](endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });
      showNotification('success', isEditing ? "Booking Updated Successfully!" : "Student Assigned Successfully!");
      await fetchBlockAssignments(activeBlockId);
      setIsAssignModalOpen(false); setSelectedForSession(null); setEditingAssignment(null);
    } catch (err) { showNotification('error', err.response?.data?.message || "Error saving session."); } 
    finally { setSaving(false); }
  };

  // --- 5. MULTI ASSIGN HANDLERS ---
  const handleSelectAll = () => {
    if (selectAll) setSelectedStudents([]);
    else setSelectedStudents(filteredAvailableStudents.map(s => s.id));
    setSelectAll(!selectAll);
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]);
  };

  const handleMultiAssign = async () => {
    if (selectedStudents.length === 0) { showNotification('warning', "Please select at least one student."); return; }
    setErrors({}); let fErrors = {};
    if (!multiAssignData.date) fErrors.date = ["Date is required."];
    if (!multiAssignData.startTime) fErrors.startTime = ["Start time is required."];
    if (!multiAssignData.endTime) fErrors.endTime = ["End time is required."];
    if (Object.keys(fErrors).length > 0) { setErrors(fErrors); showNotification('warning', 'Please fix the highlighted errors.'); return; }

    setSaving(true);
    try {
      const promises = selectedStudents.map(studentId => axios.post(`${API_URL}/assignments/book`, {
        schedule_id: activeBlockId, student_id: studentId, instructor_id: selectedInstructor?.id,
        date: multiAssignData.date, start_time: multiAssignData.startTime, end_time: multiAssignData.endTime, student_location: multiAssignData.location
      }, { headers: { Authorization: `Bearer ${token}` } }));
      await Promise.all(promises);
      showNotification('success', `${selectedStudents.length} student(s) assigned successfully!`);
      setSelectedStudents([]); setSelectAll(false); setIsMultiAssignModalOpen(false);
      await fetchBlockAssignments(activeBlockId);
    } catch (err) { showNotification('error', "Error assigning students."); } 
    finally { setSaving(false); }
  };

  // --- 6. FILTERS & MEMO ---
  const dynamicPlaces = useMemo(() => ["All Places", ...allLocations.map(l => l.province_name)], [allLocations]);
  
  const instructorsList = useMemo(() => instructors.filter(ins => 
    (selectedPlace === "All Places" || ins.place === selectedPlace) && 
    ins.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [selectedPlace, searchQuery, instructors]);

  const paginatedInstructors = useMemo(() => instructorsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [instructorsList, currentPage]);

  const blockAssignmentsForBlock = useMemo(() => activeBlockId ? blockAssignments.filter(a => a.schedule_id === parseInt(activeBlockId)) : [], [blockAssignments, activeBlockId]);
  
  const studentsNotYetAssigned = useMemo(() => {
    const assignedStudentIds = blockAssignments.map(a => a.student_id);
    return availableStudents.filter(s => !assignedStudentIds.includes(s.id));
  }, [availableStudents, blockAssignments]);
  
  const filteredAvailableStudents = useMemo(() => studentsNotYetAssigned.filter(s => (s.user?.name || s.name || "").toLowerCase().includes(studentSearch.toLowerCase())), [studentsNotYetAssigned, studentSearch]);

  const filteredActiveSessions = useMemo(() => {
    const active = blockAssignmentsForBlock.filter(a => !a.attendance);
    return sessionDateFilter ? active.filter(s => s.date === sessionDateFilter) : active;
  }, [blockAssignmentsForBlock, sessionDateFilter]);

  const filteredHistorySessions = useMemo(() => {
    const history = blockAssignmentsForBlock.filter(a => a.attendance);
    return sessionDateFilter ? history.filter(s => s.date === sessionDateFilter) : history;
  }, [blockAssignmentsForBlock, sessionDateFilter]);

  // --- 7. MASTER CALENDAR LOGIC ---
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear(); const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month); const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentDate]);

  const getInstructorsOnDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return instructorsList.filter(inst => inst.workBlocks.some(block => dateStr >= block.start && dateStr <= block.end));
  };

  const getTodayString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const instructorsWorkingToday = useMemo(() => {
    const todayStr = getTodayString();
    return instructorsList.filter(inst => inst.workBlocks.some(block => todayStr >= block.start && todayStr <= block.end));
  }, [instructorsList]);

  // --- 8. STANDARDIZED LIST TIMELINE LOGIC ---
  const currentActiveBlock = useMemo(() => {
    if (!activeBlockId || !selectedInstructor) return null;
    return selectedInstructor.workBlocks.find(b => String(b.id) === String(activeBlockId));
  }, [activeBlockId, selectedInstructor]);

  const dutyRangeDays = useMemo(() => {
    if (!currentActiveBlock || !currentActiveBlock.start || !currentActiveBlock.end) return [];
    return getDatesInRange(currentActiveBlock.start, currentActiveBlock.end);
  }, [currentActiveBlock]);

  // Generate the sequential chunks of Booked vs Empty time slots
  const dailyScheduleChunks = useMemo(() => {
    if (!currentActiveBlock || !activeDateTab) return [];
    
    const dayAssignments = blockAssignmentsForBlock
      .filter(a => a.date === activeDateTab)
      .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
      
    const dutyStart = currentActiveBlock.startTime;
    const dutyEnd = currentActiveBlock.endTime;

    const chunks = [];
    let currentTime = dutyStart;

    dayAssignments.forEach(assignment => {
      if (timeToMinutes(currentTime) < timeToMinutes(assignment.start_time)) {
         chunks.push({ type: 'empty', start: currentTime, end: assignment.start_time });
      }
      chunks.push({ type: 'booked', assignment: assignment, start: assignment.start_time, end: assignment.end_time });
      
      const nextTime = Math.max(timeToMinutes(currentTime), timeToMinutes(assignment.end_time));
      const h = Math.floor(nextTime / 60).toString().padStart(2, '0');
      const m = (nextTime % 60).toString().padStart(2, '0');
      currentTime = `${h}:${m}`;
    });

    if (timeToMinutes(currentTime) < timeToMinutes(dutyEnd)) {
      chunks.push({ type: 'empty', start: currentTime, end: dutyEnd });
    }
    return chunks;
  }, [currentActiveBlock, activeDateTab, blockAssignmentsForBlock]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={48} />
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Loading Schedule Data...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-x-hidden relative max-w-[100vw]">
      
      {/* NOTIFICATION BANNER & CONFIRM DIALOG */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : notification.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{notification.message}</span>
          {notification.type !== 'success' && <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-75"><X size={16}/></button>}
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 m-4">
            <h3 className={`text-lg font-bold flex items-center gap-2 ${confirmDialog.type === 'danger' ? 'text-rose-600' : 'text-emerald-600'}`}>
              <AlertCircle size={20} /> {confirmDialog.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm font-medium">{confirmDialog.message}</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDialog(null)} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors">Cancel</button>
              <button onClick={confirmDialog.onConfirm} className={`flex-1 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg ${confirmDialog.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}>{confirmDialog.actionText}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-full overflow-x-hidden min-w-0">
        <div className="max-w-[1920px] mx-auto w-full min-w-0">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 min-w-0 w-full">
            <div className="w-full text-left min-w-0">
              {viewMode === "manage" && (
                <button onClick={() => { setViewMode("dashboard"); setActiveBlockId(""); setSelectedInstructor(null); setSessionDateFilter(""); setExplorerMode("grid"); }} className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm mb-3 hover:gap-1.5 transition-all">
                  <ArrowLeft size={16}/> Back to Dashboard
                </button>
              )}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-800 dark:text-white break-words truncate">
                Duty <span className="text-teal-600 dark:text-teal-400">{viewMode === "dashboard" ? "Dispatch" : "Management"}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium break-words">
                {viewMode === "dashboard" ? "High-level overview of instructor availability" : "Configure duty blocks and explicitly map student timelines"}
              </p>
            </div>
          </div>

          {/* FULL WIDTH SEARCH (DASHBOARD ONLY) */}
          {viewMode === "dashboard" && (
            <div className="w-full mb-6 sm:mb-8 relative animate-in fade-in duration-300 min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text" placeholder="Search instructors by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm sm:text-base font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm min-w-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          {/* DASHBOARD VIEW (CARDS vs CALENDAR) */}
          {viewMode === "dashboard" ? (
            <div className="animate-in fade-in duration-300 w-full min-w-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 min-w-0 w-full">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {dynamicPlaces.map((place) => (
                    <button key={place} onClick={() => setSelectedPlace(place)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${selectedPlace === place ? "bg-teal-600 text-white shadow-sm" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-teal-600"}`}>{place}</button>
                  ))}
                </div>
                
                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto shrink-0 shadow-inner">
                  <button onClick={() => setDashboardMode("cards")} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${dashboardMode === 'cards' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}><LayoutGrid size={16} /> Cards</button>
                  <button onClick={() => setDashboardMode("calendar")} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${dashboardMode === 'calendar' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}><CalendarViewIcon size={16} /> Calendar</button>
                </div>
              </div>

              {dashboardMode === "cards" ? (
                <div className="w-full min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
                    {paginatedInstructors.map((ins) => {
                      const hasBlocks = ins.workBlocks && ins.workBlocks.length > 0;
                      const blockCount = hasBlocks ? ins.workBlocks.length : 0;
                      const activeSessionsCount = blockAssignments.filter(a => ins.workBlocks.some(b => b.id === a.schedule_id) && !a.attendance).length;
                      return (
                        <div key={ins.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 mx-auto w-full min-w-0">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-2 flex-wrap min-w-0">
                              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 ${hasBlocks ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                                {blockCount} Block{blockCount !== 1 ? 's' : ''}
                              </span>
                              {activeSessionsCount > 0 && <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">{activeSessionsCount} Active</span>}
                            </div>
                            <button onClick={() => { setSelectedInstructor(ins); setViewMode("manage"); setExplorerMode("grid"); }} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shrink-0 ml-2">
                              Manage
                            </button>
                          </div>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg shrink-0">{ins.name.charAt(0)}</div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-teal-600 transition-colors truncate">{ins.name}</h3>
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={12} className="text-teal-500 shrink-0" /> <span className="truncate">{ins.place}</span></p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {instructorsList.length > itemsPerPage && (
                    <div className="flex justify-center pt-8 pb-4">
                      <Pagination currentPage={currentPage} totalItems={instructorsList.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in duration-300 w-full min-w-0">
                  <div className="w-full xl:w-80 flex-shrink-0 min-w-0">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm xl:sticky xl:top-6 flex flex-col xl:h-[700px] w-full min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div> Today's Roster
                      </h3>
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex xl:flex-col gap-3 overflow-x-auto xl:overflow-x-hidden snap-x pb-4 xl:pb-0 w-full min-w-0">
                        {instructorsWorkingToday.length > 0 ? instructorsWorkingToday.map(ins => (
                            <div key={ins.id} onClick={() => { setSelectedInstructor(ins); setSessionDateFilter(getTodayString()); setViewMode("manage"); setExplorerMode("grid"); }} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-teal-300 cursor-pointer transition-colors flex items-center gap-3 shrink-0 min-w-[200px] xl:min-w-0 snap-start">
                              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm shrink-0">{ins.name.charAt(0)}</div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{ins.name}</p>
                                <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5 truncate"><MapPin size={10} className="text-teal-500 shrink-0"/> <span className="truncate">{ins.place}</span></p>
                              </div>
                            </div>
                          )) : (
                          <div className="text-center py-10 w-full shrink-0"><Users size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2"/><p className="text-sm text-slate-500 font-medium">No instructors assigned today</p></div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden xl:h-[700px] min-w-0">
                    <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 w-full min-w-0">
                      <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm sm:text-base shrink-0"><CalendarIcon size={18} className="text-teal-500"/> Schedule Overview</h3>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors shadow-sm"><ArrowLeft size={16} /></button>
                        <span className="text-xs sm:text-sm font-bold w-24 sm:w-36 text-center uppercase tracking-wider text-slate-700 dark:text-slate-300">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors shadow-sm"><ChevronRight size={16} /></button>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 flex-1 bg-slate-50/50 dark:bg-slate-950/50 overflow-x-auto custom-scrollbar w-full min-w-0">
                      <div className="grid grid-cols-7 gap-px min-w-[600px] sm:min-w-full bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => <div key={dayName} className="bg-white dark:bg-slate-900 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{dayName}</div>)}
                        {calendarDays.map((day, idx) => {
                          if (!day) return <div key={`empty-${idx}`} className="bg-slate-50 dark:bg-slate-900/50 h-[100px] lg:h-[110px]"></div>;
                          const workingInsts = getInstructorsOnDay(day);
                          const isToday = getTodayString() === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          return (
                            <div key={`day-${day}`} onClick={() => {
                              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                              const wInsts = workingInsts.map(ins => ({ ...ins, activeBlocksForDay: ins.workBlocks.filter(block => dateStr >= block.start && dateStr <= block.end) }));
                              setSelectedDayRoster({ dateStr, day, instructors: wInsts });
                            }} className={`bg-white dark:bg-slate-900 h-[100px] lg:h-[110px] p-2 flex flex-col transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 group ${isToday ? "ring-2 ring-inset ring-teal-500/50 bg-teal-50/30 dark:bg-teal-900/10 z-10" : ""}`}>
                              <div className="flex justify-end mb-2"><span className={`text-[10px] sm:text-sm font-bold w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${isToday ? "bg-teal-600 text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-teal-600"}`}>{day}</span></div>
                              <div className="mt-auto flex justify-center pb-1">
                                {workingInsts.length > 0 && (
                                   <div className="w-full bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-800 rounded sm:rounded-lg py-0.5 sm:py-1 px-1 flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm group-hover:bg-teal-100 dark:group-hover:bg-teal-900/60 transition-colors min-w-0">
                                      <Users size={10} className="shrink-0 hidden sm:block" />
                                      <span className="text-[9px] sm:text-[10px] md:text-xs font-bold truncate">{workingInsts.length} Duty</span>
                                   </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* MANAGEMENT VIEW (DRILL DOWN WITH TIMELINE TABS) */
            <div className="space-y-6 animate-in fade-in duration-300 w-full min-w-0 max-w-full">
              
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
                <div className="xl:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col w-full min-w-0">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 min-w-0 w-full">
                     <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 shadow-sm border border-teal-200 dark:border-teal-800">{selectedInstructor?.name.charAt(0)}</div>
                     <div className="min-w-0 flex-1 w-full">
                       <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white truncate">{selectedInstructor?.name}</h2>
                       <p className="text-xs sm:text-sm font-medium text-slate-500 flex items-center gap-1 mt-1 truncate"><MapPin size={14} className="text-teal-500 shrink-0"/> <span className="truncate">{selectedInstructor?.place}</span></p>
                     </div>
                  </div>
                  <div className="mt-auto">
                    <button onClick={handleAddDuty} className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all flex items-center justify-center gap-2"><PlusCircle size={16} /> Add Duty Block</button>
                  </div>
                </div>

                <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-center w-full min-w-0 max-w-full">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2"><CalendarViewIcon size={16} className="text-teal-500"/> Active Duty Block Selection</h3>
                   </div>
                   {selectedInstructor?.workBlocks.length > 0 ? (
                     <div className="space-y-4 w-full min-w-0">
                        <select value={activeBlockId} onChange={(e) => { setActiveBlockId(e.target.value); setExplorerMode("grid"); }} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer text-slate-900 dark:text-white truncate">
                          <option value="">Select a block to manage...</option>
                          {selectedInstructor?.workBlocks?.map(block => (
                            <option key={block.id} value={block.id}>{block.task} ({block.start} to {block.end}) • {formatTimeAMPM(block.startTime)} - {formatTimeAMPM(block.endTime)}</option>
                          ))}
                        </select>
                        {currentActiveBlock && (
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                            <button onClick={() => handleEditDuty(currentActiveBlock)} className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 rounded-lg transition-colors border border-amber-200 dark:border-amber-900/30 whitespace-nowrap"><Edit3 size={14} /> Edit Settings</button>
                            <button onClick={() => handleDeleteDuty(currentActiveBlock.id)} className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-red-200 dark:border-red-900/30 whitespace-nowrap"><Trash2 size={14} /> Deactivate</button>
                          </div>
                        )}
                     </div>
                   ) : (
                      <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <CalendarDays size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        <p className="text-xs sm:text-sm font-medium text-slate-500">No duty blocks configured yet.</p>
                      </div>
                   )}
                </div>
              </div>

              {activeBlockId && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col w-full min-w-0 max-w-full">
                  
                  <div className="border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full min-w-0">
                    <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto w-full xl:w-auto scrollbar-hide shadow-sm max-w-full min-w-0">
                      {[
                        { id: "block-calendar", label: "Schedule Explorer", icon: <CalendarViewIcon size={14}/> },
                        { id: "assign", label: "Students Pool", icon: <UserPlus size={14}/> }, 
                        { id: "active", label: "Active Sessions", icon: <Clock size={14}/> },
                        { id: "history", label: "History", icon: <History size={14}/> }
                      ].map(tab => (
                        <button 
                          key={tab.id} onClick={() => setActiveSubTab(tab.id)} 
                          className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap shrink-0 ${activeSubTab === tab.id ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-teal-600 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                        >
                          {tab.icon} <span className="hidden xs:inline">{tab.label}</span>
                          <span className="xs:hidden">{tab.id === "block-calendar" ? "Explorer" : tab.id === "assign" ? "Students" : tab.id === "active" ? "Active" : "History"}</span>
                        </button>
                      ))}
                    </div>

                    {activeSubTab !== "block-calendar" && (
                      <div className="flex items-center w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all max-w-full min-w-0">
                        <CalendarIcon size={14} className="text-teal-500 mr-2 shrink-0"/>
                        <input type="date" value={sessionDateFilter} onChange={e => setSessionDateFilter(e.target.value)} className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-transparent outline-none w-full sm:w-auto cursor-pointer min-w-0" />
                        {sessionDateFilter && <button onClick={() => setSessionDateFilter("")} className="ml-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors shrink-0"><X size={12}/></button>}
                      </div>
                    )}
                  </div>

                  {/* TAB: BLOCK CALENDAR */}
                  {activeSubTab === "block-calendar" && currentActiveBlock && (
                    <div className="flex flex-col bg-white dark:bg-slate-900 animate-in fade-in duration-300 min-h-[400px] w-full min-w-0">
                      
                      {explorerMode === "grid" ? (
                        <div className="p-4 sm:p-6 w-full min-w-0">
                          <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 min-w-0">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                              <CalendarDays size={18} className="text-teal-500"/> Duty Range Explorer
                            </h3>
                            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                              Click on any highlighted day to view and assign time slots.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4 w-full min-w-0">
                            {dutyRangeDays.length > 0 ? dutyRangeDays.map((dateStr) => {
                              const dateObj = new Date(dateStr + 'T12:00:00');
                              const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                              const dayOfMonth = dateObj.getDate();
                              const isToday = getTodayString() === dateStr;
                              const dayAssignments = blockAssignmentsForBlock.filter(a => a.date === dateStr);
                              const assignmentCount = dayAssignments.length;

                              return (
                                <div 
                                  key={dateStr} 
                                  onClick={() => { setActiveDateTab(dateStr); setExplorerMode("timeline"); }}
                                  className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:shadow-md cursor-pointer rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center transition-all group ${isToday ? "ring-2 ring-inset ring-teal-500 bg-teal-50/30 dark:bg-teal-900/10" : ""}`}
                                >
                                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>{dayOfWeek}</span>
                                  <span className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 ${isToday ? 'text-teal-600 dark:text-teal-400' : 'text-slate-800 dark:text-white'}`}>{dayOfMonth}</span>
                                  {assignmentCount > 0 ? (
                                    <span className="px-2 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[9px] sm:text-[10px] font-bold rounded-full w-full text-center truncate">
                                      {assignmentCount} Session{assignmentCount !== 1 ? 's' : ''}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-teal-500 text-[9px] sm:text-[10px] font-bold rounded-full w-full text-center transition-colors truncate">+ Open Day</span>
                                  )}
                                </div>
                              );
                            }) : (
                              <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <p className="text-sm font-medium text-slate-500">Invalid duty dates or block is empty.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col flex-1 animate-in slide-in-from-right-4 duration-300 w-full min-w-0">
                          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 w-full min-w-0">
                             <button onClick={() => setExplorerMode("grid")} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-sm w-full sm:w-auto justify-center shrink-0">
                               <ArrowLeft size={14}/> Back to Calendar Grid
                             </button>
                             <button 
                               onClick={() => {
                                 if (filteredAvailableStudents.length === 0) {
                                   showNotification('warning', 'Please ensure you have available students to assign first.');
                                   setActiveSubTab('assign'); return;
                                 }
                                 handleAssignStudent(null, activeDateTab);
                               }}
                               className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
                             >
                               <PlusCircle size={14} /> Schedule Custom Time
                             </button>
                          </div>

                          {/* BROWSER-STYLE DATE TABS */}
                          <div className="w-full overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50">
                            <div className="flex overflow-x-auto custom-scrollbar hide-scrollbar pt-2 px-2 w-full max-w-full">
                              {dutyRangeDays.map(dateStr => {
                                 const d = new Date(dateStr + 'T12:00:00');
                                 const dayStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                 const isActive = activeDateTab === dateStr;
                                 return (
                                   <button key={dateStr} onClick={() => setActiveDateTab(dateStr)} className={`px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-t border-x rounded-t-xl transition-all whitespace-nowrap -mb-px flex items-center gap-2 shrink-0 ${isActive ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-teal-600 dark:text-teal-400 z-10 shadow-[0_-2px_10px_-5px_rgba(0,0,0,0.1)]' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}>
                                     {getTodayString() === dateStr && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>}
                                     {dayStr}
                                   </button>
                                 );
                              })}
                            </div>
                          </div>

                          {/* THE STANDARDIZED LIST TIMELINE */}
                          <div className="p-3 sm:p-6 bg-white dark:bg-slate-950/30 overflow-y-auto w-full min-w-0" style={{ maxHeight: '600px' }}>
                            <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 w-full min-w-0">
                               {(() => {
                                  const dayAssignments = blockAssignmentsForBlock.filter(a => a.date === activeDateTab).sort((a,b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
                                  const dutyStart = currentActiveBlock.startTime;
                                  const dutyEnd = currentActiveBlock.endTime;
                                  
                                  const chunks = [];
                                  let currentTime = dutyStart;

                                  dayAssignments.forEach(assignment => {
                                    if (timeToMinutes(currentTime) < timeToMinutes(assignment.start_time)) {
                                       chunks.push({ type: 'empty', start: currentTime, end: assignment.start_time });
                                    }
                                    chunks.push({ type: 'booked', assignment: assignment, start: assignment.start_time, end: assignment.end_time });
                                    
                                    const nextTime = Math.max(timeToMinutes(currentTime), timeToMinutes(assignment.end_time));
                                    const h = Math.floor(nextTime / 60).toString().padStart(2, '0');
                                    const m = (nextTime % 60).toString().padStart(2, '0');
                                    currentTime = `${h}:${m}`;
                                  });

                                  if (timeToMinutes(currentTime) < timeToMinutes(dutyEnd)) {
                                    chunks.push({ type: 'empty', start: currentTime, end: dutyEnd });
                                  }

                                  if (chunks.length === 0) return <p className="text-center text-slate-500 py-10 text-sm">Invalid duty block configuration.</p>;

                                  return chunks.map((chunk, idx) => (
                                    <div key={idx} className={`flex flex-col sm:flex-row border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md w-full min-w-0 ${chunk.type === 'empty' ? 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                                       
                                       <div className={`w-full sm:w-48 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 flex flex-row sm:flex-col justify-center items-center shrink-0 gap-2 sm:gap-0 ${chunk.type === 'empty' ? 'bg-slate-100/50 dark:bg-slate-800/30' : 'bg-teal-50/50 dark:bg-teal-900/10'}`}>
                                          <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">{formatTimeAMPM(chunk.start)}</span>
                                          <div className="w-4 h-px sm:w-px sm:h-6 bg-slate-300 dark:bg-slate-700 sm:my-1 shrink-0"></div>
                                          <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">{formatTimeAMPM(chunk.end)}</span>
                                       </div>

                                       <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0 w-full">
                                          {chunk.type === 'empty' ? (
                                             <>
                                               <div className="min-w-0 w-full sm:w-auto">
                                                 <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Available Time Slot</p>
                                                 <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">This slot is open for booking.</p>
                                               </div>
                                               <button 
                                                  onClick={() => {
                                                    if (filteredAvailableStudents.length === 0) {
                                                      showNotification('warning', 'Please ensure you have available students to assign first.');
                                                      setActiveSubTab('assign'); return;
                                                    }
                                                    handleAssignStudent(null, activeDateTab, chunk.start, chunk.end);
                                                  }} 
                                                  className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
                                               >
                                                 <PlusCircle size={14}/> Assign Student
                                               </button>
                                             </>
                                          ) : (
                                             <>
                                               <div className="min-w-0 flex-1 w-full">
                                                  <div className="flex items-center gap-2 mb-1.5 min-w-0">
                                                     <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 ${chunk.assignment.attendance ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400'}`}>
                                                       {chunk.assignment.attendance ? 'Completed' : 'Active'}
                                                     </span>
                                                  </div>
                                                  <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-white truncate">{chunk.assignment.student?.user?.name || 'Unknown Student'}</p>
                                                  <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                                                     <MapPin size={12} className="text-teal-500 shrink-0"/> <span className="truncate">{chunk.assignment.student_location}</span>
                                                  </p>
                                               </div>
                                               <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                                                  <button onClick={() => handleEditAssignment(chunk.assignment)} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 rounded-lg transition-colors border border-amber-200 dark:border-amber-900/30 shadow-sm flex items-center justify-center gap-1.5"><Edit3 size={14}/> Edit</button>
                                                  <button onClick={() => handleDeleteAssignment(chunk.assignment.id)} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-red-200 dark:border-red-900/30 shadow-sm flex items-center justify-center gap-1.5"><Trash2 size={14}/> Remove</button>
                                               </div>
                                             </>
                                          )}
                                       </div>
                                    </div>
                                  ));
                               })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: ASSIGN (Student Pool) */}
                  {activeSubTab === "assign" && (
                    <div className="space-y-4 p-4 sm:p-6 bg-white dark:bg-slate-900 animate-in fade-in duration-300 w-full min-w-0">
                      <div className="flex flex-col sm:flex-row gap-3 min-w-0 w-full">
                        <div className="relative flex-1 min-w-0">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input type="text" placeholder="Search available students..." className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 truncate" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
                          {studentSearch && <button onClick={() => setStudentSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-white hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md text-slate-500 transition-colors shadow-sm shrink-0"><X size={14} /></button>}
                        </div>
                        {filteredAvailableStudents.length > 0 && <button onClick={() => setIsMultiAssignModalOpen(true)} className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm w-full sm:w-auto shrink-0"><Users size={14}/> Multi-Assign</button>}
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-w-0 w-full">
                        <div className="hidden sm:block overflow-x-auto min-w-0 w-full custom-scrollbar">
                          <table className="w-full text-left min-w-[500px]">
                            <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                              <tr className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                {filteredAvailableStudents.length > 0 && <th className="px-4 sm:px-6 py-3 sm:py-4 w-12"><input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"/></th>}
                                <th className="px-4 sm:px-6 py-3 sm:py-4">Student</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4">Location</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                              {filteredAvailableStudents.map(s => {
                                const alreadyAssigned = blockAssignments.some(a => a.student_id === s.id && a.schedule_id === parseInt(activeBlockId));
                                return (
                                  <tr key={s.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    {filteredAvailableStudents.length > 0 && <td className="px-4 sm:px-6 py-3 sm:py-4"><input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => handleSelectStudent(s.id)} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"/></td>}
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 max-w-[150px]"><span className="text-sm font-bold text-slate-800 dark:text-white truncate block">{s.user?.name || s.name}</span></td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 max-w-[200px]"><div className="flex items-center gap-2 min-w-0"><MapPin size={14} className="text-teal-500 flex-shrink-0" /><span className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">{s.location || s.street_address || 'Unspecified'}</span></div></td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                                      {alreadyAssigned ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500"><CheckCircle2 size={14} /> Assigned</span> : <button onClick={() => handleAssignStudent(s)} className="px-4 py-2 rounded-lg text-xs font-bold transition-all bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-md whitespace-nowrap">Assign</button>}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 w-full min-w-0">
                          {filteredAvailableStudents.length > 0 ? (
                            filteredAvailableStudents.map(s => {
                              const alreadyAssigned = blockAssignments.some(a => a.student_id === s.id && a.schedule_id === parseInt(activeBlockId));
                              return (
                                <div key={s.id} className="p-4 space-y-3 w-full min-w-0">
                                  <div className="flex justify-between items-start gap-3 w-full min-w-0">
                                    <div className="flex-1 min-w-0 w-full">
                                      <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{s.user?.name || s.name}</h4>
                                      <div className="flex items-center gap-1.5 mt-1.5 min-w-0"><MapPin size={12} className="text-teal-500 shrink-0" /><span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{s.location || s.street_address || 'Unspecified'}</span></div>
                                    </div>
                                    {alreadyAssigned ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0"><CheckCircle2 size={12} /> Assigned</span> : <button onClick={() => handleAssignStudent(s)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-teal-600 hover:bg-teal-700 text-white shadow-sm shrink-0">Assign</button>}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="py-12 text-center w-full min-w-0"><Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" /><p className="text-sm font-medium text-slate-500">No students available for this block</p></div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: ACTIVE */}
                  {activeSubTab === "active" && (
                    <div className="space-y-3 p-4 sm:p-6 bg-white dark:bg-slate-900 animate-in fade-in duration-300 min-w-0 w-full">
                      {filteredActiveSessions.length > 0 ? (
                        filteredActiveSessions.map(session => (
                          <div key={session.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md hover:border-teal-200 transition-all min-w-0 w-full">
                            <div className="flex-1 w-full min-w-0">
                              <div className="flex items-center justify-between sm:justify-start gap-3 mb-2 w-full min-w-0">
                                <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate">{session.student?.user?.name}</h4>
                                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 whitespace-nowrap shrink-0">Active</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 min-w-0 w-full">
                                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 rounded shadow-sm border border-slate-100 dark:border-slate-700 shrink-0"><CalendarIcon size={12} className="text-teal-500"/> {session.date}</span>
                                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 rounded shadow-sm border border-slate-100 dark:border-slate-700 shrink-0"><Clock size={12} className="text-teal-500"/> {formatTimeAMPM(session.start_time)} - {formatTimeAMPM(session.end_time)}</span>
                                <span className="flex items-center gap-1.5 truncate text-slate-600 dark:text-slate-300 min-w-0"><MapPin size={12} className="text-teal-500 shrink-0"/> <span className="truncate">{session.student_location}</span></span>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto shrink-0">
                              <button onClick={() => handleEditAssignment(session)} className="flex-1 sm:flex-none p-2 flex justify-center text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors border border-amber-100 dark:border-amber-900/30" title="Edit Session"><Edit3 size={16} /></button>
                              <button onClick={() => handleDeleteAssignment(session.id)} className="flex-1 sm:flex-none p-2 flex justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-100 dark:border-red-900/30" title="Remove Assignment"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 min-w-0 w-full">
                          <CalendarX size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-sm font-medium text-slate-500 px-4">{sessionDateFilter ? `No active sessions scheduled for ${sessionDateFilter}` : "No active sessions for this block"}</p>
                          {sessionDateFilter && <button onClick={() => setSessionDateFilter("")} className="mt-2 text-xs font-bold text-teal-600 hover:underline">Clear Date Filter</button>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: HISTORY */}
                  {activeSubTab === "history" && (
                    <div className="space-y-3 p-4 sm:p-6 bg-white dark:bg-slate-900 animate-in fade-in duration-300 min-w-0 w-full">
                      {filteredHistorySessions.length > 0 ? (
                        filteredHistorySessions.map(session => (
                          <div key={session.id} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 opacity-75 hover:opacity-100 transition-opacity min-w-0 w-full">
                            <div className="flex-1 w-full min-w-0">
                              <div className="flex items-center justify-between sm:justify-start gap-3 mb-2 min-w-0 w-full">
                                <h4 className="text-sm sm:text-base font-bold text-slate-600 dark:text-slate-400 truncate flex-1">{session.student?.user?.name}</h4>
                                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-500 whitespace-nowrap shrink-0">Completed</span>
                              </div>
                              <p className="text-[11px] sm:text-xs font-bold text-slate-500 flex flex-wrap items-center gap-3 min-w-0 w-full">
                                <span className="flex items-center gap-1 whitespace-nowrap"><CalendarIcon size={12}/> {session.date}</span>
                                <span className="flex items-center gap-1 whitespace-nowrap"><Clock size={12}/> {formatTimeAMPM(session.start_time)} - {formatTimeAMPM(session.end_time)}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-teal-600 shrink-0 self-end sm:self-center"><CheckCircle2 size={18} /></div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 min-w-0 w-full">
                          <History size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-sm font-medium text-slate-500 px-4">{sessionDateFilter ? `No history records for ${sessionDateFilter}` : "No history for this block"}</p>
                          {sessionDateFilter && <button onClick={() => setSessionDateFilter("")} className="mt-2 text-xs font-bold text-teal-600 hover:underline">Clear Date Filter</button>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DAILY ROSTER MODAL (From Master Calendar) */}
      {selectedDayRoster && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0">
              <div className="min-w-0 pr-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 truncate"><CalendarDays size={18} className="text-teal-500 shrink-0"/> Daily Roster</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 truncate">{new Date(selectedDayRoster.dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button onClick={() => setSelectedDayRoster(null)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar w-full min-w-0">
              {selectedDayRoster.instructors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
                  {selectedDayRoster.instructors.map(ins => (
                    <button 
                      key={ins.id}
                      onClick={() => {
                        setSelectedDayRoster(null); setSelectedInstructor(ins);
                        if (ins.activeBlocksForDay.length > 0) setActiveBlockId(ins.activeBlocksForDay[0].id.toString());
                        setActiveDateTab(selectedDayRoster.dateStr); 
                        setExplorerMode("timeline");
                        setViewMode("manage");
                      }}
                      className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex justify-between items-center group shadow-sm min-w-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm sm:text-lg shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                          {ins.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate">{ins.name}</p>
                          <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5 truncate"><MapPin size={10} className="text-teal-500 shrink-0"/> <span className="truncate">{ins.place}</span></p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-teal-500 shrink-0 transition-colors ml-2" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center w-full min-w-0"><Users size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" /><p className="text-sm font-medium text-slate-500">No instructors assigned on this date.</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT DUTY BLOCK */}
      {isNewDutyModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{isEditMode ? 'Edit' : 'Add'} <span className="text-teal-600 dark:text-teal-400">Duty Block</span></h2>
                <p className="text-xs sm:text-sm md:text-md font-medium text-slate-600 dark:text-slate-400 mt-1">{isEditMode ? 'Modify existing duty block details' : 'Create a new duty block for instructor'}</p>
              </div>
              <button onClick={() => setIsNewDutyModalOpen(false)} disabled={saving} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              <div className="space-y-5 sm:space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1"><div className="w-1 h-4 bg-teal-500 rounded-full mr-1"></div> Task Description {!newDutyData.task_description && <span className="text-red-500 animate-pulse">*</span>}</label>
                  <input type="text" name="task_description" placeholder="e.g., City Driving, Highway Practice" className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 ${errors.task_description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} value={newDutyData.task_description} onChange={(e) => handleInputChange(e, setNewDutyData)} disabled={saving} />
                  {errors.task_description && <p className="text-[10px] text-red-500 font-['Sora'] font-medium mt-0.5 ml-1">{errors.task_description[0]}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2"><div className="w-1 h-4 bg-teal-500 rounded-full"></div> Date Range</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">Start Date {!newDutyData.start_date && <span className="text-red-500 animate-pulse">*</span>}</label>
                      <input type="date" name="start_date" className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium text-slate-900 dark:text-white outline-none transition-all ${errors.start_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} value={newDutyData.start_date} onChange={(e) => handleInputChange(e, setNewDutyData)} disabled={saving} />
                      {errors.start_date && <p className="text-[10px] text-red-500 font-['Sora'] font-medium mt-0.5 ml-1">{errors.start_date[0]}</p>}
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">End Date {!newDutyData.end_date && <span className="text-red-500 animate-pulse">*</span>}</label>
                      <input type="date" name="end_date" className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium text-slate-900 dark:text-white outline-none transition-all ${errors.end_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} value={newDutyData.end_date} onChange={(e) => handleInputChange(e, setNewDutyData)} disabled={saving} />
                      {errors.end_date && <p className="text-[10px] text-red-500 font-['Sora'] font-medium mt-0.5 ml-1">{errors.end_date[0]}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2"><div className="w-1 h-4 bg-teal-500 rounded-full"></div> Time Range</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">Start Time</label>
                      <input type="time" name="start_time" className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" value={newDutyData.start_time} onChange={(e) => handleInputChange(e, setNewDutyData)} disabled={saving} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">End Time</label>
                      <input type="time" name="end_time" className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" value={newDutyData.end_time} onChange={(e) => handleInputChange(e, setNewDutyData)} disabled={saving} />
                    </div>
                  </div>
                </div>

                {newDutyData.task_description && newDutyData.start_date && newDutyData.end_date && (
                  <div className="mt-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3"><CalendarDays size={14} className="text-teal-500" /><span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Block Preview</span></div>
                    <div className="space-y-2">
                      <p className="text-base font-bold text-slate-800 dark:text-white">{newDutyData.task_description}</p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300"><span className="font-bold text-slate-700 dark:text-slate-200">Dates:</span> {newDutyData.start_date} to {newDutyData.end_date}</p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300"><span className="font-bold text-slate-700 dark:text-slate-200">Hours:</span> {formatTimeAMPM(newDutyData.start_time)} - {formatTimeAMPM(newDutyData.end_time)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button onClick={() => setIsNewDutyModalOpen(false)} disabled={saving} className="flex-1 px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50">Cancel</button>
              <button onClick={handleSaveDuty} disabled={saving} className="flex-1 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 disabled:opacity-70 disabled:cursor-not-allowed">
                {saving ? <><Loader2 size={16} className="animate-spin"/> Saving...</> : <><Save size={16}/> {isEditMode ? "Update Block" : "Create Block"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MULTI-ASSIGN STUDENTS */}
      {isMultiAssignModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-md flex flex-col rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Multi-<span className="text-teal-600 dark:text-teal-400">Assign</span></h3>
              <button onClick={() => { setIsMultiAssignModalOpen(false); setErrors({}); setMultiAssignData({ date: "", startTime: "09:00", endTime: "10:00", location: "" }); }} disabled={saving} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-100 dark:border-teal-900">
                <p className="text-sm font-semibold text-center text-teal-800 dark:text-slate-300">Assigning to <span className="font-bold text-teal-600 dark:text-teal-400">{selectedStudents.length}</span> selected student(s)</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">Session Date {!multiAssignData.date && <span className="text-red-500 animate-pulse">*</span>}</label>
                  <input type="date" name="date" className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium outline-none transition-all text-slate-900 dark:text-white ${errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} value={multiAssignData.date} onChange={(e) => handleInputChange(e, setMultiAssignData)} disabled={saving} />
                  {errors.date && <p className="text-[10px] text-red-500 font-['Sora'] font-medium mt-0.5 ml-1">{errors.date[0]}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">Start Time {!multiAssignData.startTime && <span className="text-red-500 animate-pulse">*</span>}</label>
                    <input type="time" name="startTime" className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium outline-none transition-all text-slate-900 dark:text-white ${errors.startTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} value={multiAssignData.startTime} onChange={(e) => handleInputChange(e, setMultiAssignData)} disabled={saving} />
                    {errors.startTime && <p className="text-[10px] text-red-500 font-['Sora'] font-medium mt-0.5 ml-1">{errors.startTime[0]}</p>}
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">End Time {!multiAssignData.endTime && <span className="text-red-500 animate-pulse">*</span>}</label>
                    <input type="time" name="endTime" className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium outline-none transition-all text-slate-900 dark:text-white ${errors.endTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} value={multiAssignData.endTime} onChange={(e) => handleInputChange(e, setMultiAssignData)} disabled={saving} />
                    {errors.endTime && <p className="text-[10px] text-red-500 font-['Sora'] font-medium mt-0.5 ml-1">{errors.endTime[0]}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="text-[13px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">Pickup Location (Optional)</label>
                  <input type="text" name="location" placeholder="Same location for all students" className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white" value={multiAssignData.location} onChange={(e) => handleInputChange(e, setMultiAssignData)} disabled={saving} />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 px-6 py-5 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900">
              <button onClick={() => setIsMultiAssignModalOpen(false)} disabled={saving} className="flex-1 px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50">Cancel</button>
              <button onClick={handleMultiAssign} disabled={saving} className="flex-1 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all flex justify-center items-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-70 disabled:cursor-not-allowed">{saving ? <Loader2 size={16} className="animate-spin" /> : "Assign All"}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN/EDIT SINGLE STUDENT SESSION */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{editingAssignment ? "Edit" : "Assign"} <span className="text-teal-600 dark:text-teal-400">Student Session</span></h2>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{editingAssignment ? "Modify existing session details" : "Assign a student to this time slot"}</p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} disabled={saving} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              <div className="space-y-5 sm:space-y-6">
                
                {!selectedForSession && !editingAssignment ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1"><div className="w-1 h-4 bg-teal-500 rounded-full mr-1"></div> Select Student {!selectedForSession && <span className="text-red-500 animate-pulse">*</span>}</label>
                    <select 
                      className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium outline-none transition-all text-slate-900 dark:text-white ${errors.student ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} 
                      onChange={(e) => {
                        const s = filteredAvailableStudents.find(st => st.id.toString() === e.target.value);
                        setSelectedForSession(s); setFormData(prev => ({...prev, location: s ? s.street_address : ""}));
                        if(errors.student) setErrors(prev => ({...prev, student: null}));
                      }}
                      value={selectedForSession?.id || ""}
                    >
                      <option value="">-- Choose a student from the pool --</option>
                      {filteredAvailableStudents.map(s => <option key={s.id} value={s.id}>{s.user?.name || s.name}</option>)}
                    </select>
                    {errors.student && <p className="text-[10px] text-red-500 font-['Sora'] font-medium mt-0.5 ml-1">{errors.student[0]}</p>}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-lg flex-shrink-0">{(selectedForSession?.user?.name || selectedForSession?.name || 'S').charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-teal-600 dark:text-teal-500 uppercase tracking-wider">Student</p>
                        <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5 truncate">{selectedForSession?.user?.name || selectedForSession?.name}</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1"><MapPin size={12} className="text-teal-500" /> <span className="truncate">{selectedForSession?.location || selectedForSession?.street_address}</span></p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2"><div className="w-1 h-4 bg-teal-500 rounded-full"></div> Session Date</label>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">Select Date {!formData.date && <span className="text-red-500 animate-pulse">*</span>}</label>
                      <input type="date" name="date" className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium outline-none transition-all text-slate-900 dark:text-white ${errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} value={formData.date} onChange={(e) => handleInputChange(e, setFormData)} disabled={saving} />
                      {errors.date && <p className="text-[10px] text-red-500 font-['Sora'] font-medium mt-0.5 ml-1">{errors.date[0]}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2"><div className="w-1 h-4 bg-teal-500 rounded-full"></div> Time Slot</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">Start Time {!formData.startTime && <span className="text-red-500 animate-pulse">*</span>}</label>
                      <input type="time" name="startTime" className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium outline-none transition-all text-slate-900 dark:text-white ${errors.startTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} value={formData.startTime} onChange={(e) => handleInputChange(e, setFormData)} disabled={saving} />
                      {errors.startTime && <p className="text-[10px] text-red-500 font-['Sora'] font-medium mt-0.5 ml-1">{errors.startTime[0]}</p>}
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">End Time {!formData.endTime && <span className="text-red-500 animate-pulse">*</span>}</label>
                      <input type="time" name="endTime" className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium outline-none transition-all text-slate-900 dark:text-white ${errors.endTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} value={formData.endTime} onChange={(e) => handleInputChange(e, setFormData)} disabled={saving} />
                      {errors.endTime && <p className="text-[10px] text-red-500 font-['Sora'] font-medium mt-0.5 ml-1">{errors.endTime[0]}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2"><div className="w-1 h-4 bg-teal-500 rounded-full"></div> Pickup Location</label>
                  <input type="text" name="location" placeholder="Enter custom pickup address (defaults to student address)" className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white" value={formData.location} onChange={(e) => handleInputChange(e, setFormData)} disabled={saving} />
                </div>

                {selectedForSession && formData.date && formData.startTime && formData.endTime && (
                  <div className="mt-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3"><Clock size={14} className="text-teal-500" /><span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Session Preview</span></div>
                    <div className="space-y-2">
                      <p className="text-base font-bold text-slate-800 dark:text-white">{selectedForSession.user?.name || selectedForSession.name}</p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300"><span className="font-bold text-slate-700 dark:text-slate-200">Date:</span> {formData.date}</p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300"><span className="font-bold text-slate-700 dark:text-slate-200">Time:</span> {formatTimeAMPM(formData.startTime)} - {formatTimeAMPM(formData.endTime)}</p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300"><span className="font-bold text-slate-700 dark:text-slate-200">Location:</span> {formData.location || selectedForSession.street_address || "Not specified"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button onClick={() => { setIsAssignModalOpen(false); setErrors({}); setSelectedForSession(null); setEditingAssignment(null); setFormData({ date: "", startTime: "09:00", endTime: "10:00", location: "", blockId: "", assignmentId: null }); }} disabled={saving} className="flex-1 px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50">Cancel</button>
              <button onClick={handleSaveAssignment} disabled={saving} className="flex-1 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed">
                {saving ? <><Loader2 size={16} className="animate-spin"/> Saving...</> : <><Check size={16}/> {editingAssignment ? "Update Session" : "Confirm Assignment"}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;