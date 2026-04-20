
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { 
  MapPin, Calendar as CalendarIcon, Search, X, 
  Clock, AlertCircle, CheckCircle2, Edit3, Trash2, 
  Users, ChevronRight, ArrowLeft, UserPlus, 
  Filter, History, Settings2, PlusCircle, Save,
  CalendarDays
} from "lucide-react";

import Pagination from "../components/Pagination";

const API_URL = "http://localhost:8000/api";

const Schedule = () => {
  // --- 1. STATES ---
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allLocations, setAllLocations] = useState([]);
  const [blockAssignments, setBlockAssignments] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  
  const userRole = localStorage.getItem("user_role"); 
  const token = localStorage.getItem("access_token");
  
  // View & Navigation
  const [viewMode, setViewMode] = useState("instructors");
  const [activeSubTab, setActiveSubTab] = useState("assign");
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState("All Places");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [activeBlockId, setActiveBlockId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal states
  const [isNewDutyModalOpen, setIsNewDutyModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedForSession, setSelectedForSession] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDutyId, setEditingDutyId] = useState(null);

  // Multi-select state
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isMultiAssignModalOpen, setIsMultiAssignModalOpen] = useState(false);

  // Form data for duty block
  const [newDutyData, setNewDutyData] = useState({
    task_description: "",
    start_date: "",
    end_date: "",
    start_time: "08:00",
    end_time: "17:00",
  });

  // Form data for assignment
  const [formData, setFormData] = useState({ 
    date: "", 
    startTime: "09:00", 
    endTime: "10:00", 
    location: "", 
    blockId: "",
    assignmentId: null
  });

  // Multi-assignment form data
  const [multiAssignData, setMultiAssignData] = useState({
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    location: ""
  });

  // --- 2. API CALLS ---

  const fetchBlockAssignments = async (blockId) => {
    if (!blockId) {
      setBlockAssignments([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/admin/assignments/block/${blockId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlockAssignments(res.data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setBlockAssignments([]);
    }
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
        const matchedLocation = locationsList.find(
          loc => loc.province_name.toLowerCase() === inst.assigned_location?.toLowerCase()
        );

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
      console.error("API Error:", error); 
    }
    finally { 
      setLoading(false); 
    }
  };

  // Fetch students when block changes
  useEffect(() => {
    const fetchRelevantStudents = async () => {
      if (!activeBlockId || !selectedInstructor) { 
        setAvailableStudents([]); 
        return; 
      }
      
      try {
        const res = await axios.get(`${API_URL}/students/by-duty`, {
          params: { 
            instructor_id: selectedInstructor.id, 
            schedule_id: activeBlockId
          },
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableStudents(res.data);
      } catch (err) { 
        console.error("Error fetching students:", err);
        setAvailableStudents([]);
      }
    };
    fetchRelevantStudents();
  }, [activeBlockId, selectedInstructor]);

  // Fetch assignments when block changes
  useEffect(() => {
    if (activeBlockId) {
      fetchBlockAssignments(activeBlockId);
    }
  }, [activeBlockId]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPlace]);

  // --- 3. HANDLERS FOR DUTY BLOCKS ---

  const handleAddDuty = () => {
    setIsEditMode(false);
    setEditingDutyId(null);
    setNewDutyData({
      task_description: "",
      start_date: "",
      end_date: "",
      start_time: "08:00",
      end_time: "17:00",
    });
    setIsNewDutyModalOpen(true);
  };

  const handleEditDuty = (block) => {
    setIsEditMode(true);
    setEditingDutyId(block.id);
    setNewDutyData({
      task_description: block.task,
      start_date: block.start,
      end_date: block.end,
      start_time: block.startTime,
      end_time: block.endTime,
    });
    setIsNewDutyModalOpen(true);
  };

  const handleSaveDuty = async () => {
    if (!newDutyData.task_description || !newDutyData.start_date || !newDutyData.end_date) {
      alert("Please fill all fields");
      return;
    }

    const payload = { 
      ...newDutyData, 
      instructor_id: selectedInstructor.id, 
      location_id: selectedInstructor.location_id 
    };
    
    try {
      if (isEditMode) {
        await axios.put(`${API_URL}/admin/duty/${editingDutyId}`, payload, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      } else {
        await axios.post(`${API_URL}/admin/duty`, payload, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      }

      await fetchAllData(); 

      setInstructors(prevInstructors => {
        const updatedInstructor = prevInstructors.find(ins => ins.id === selectedInstructor.id);
        if (updatedInstructor) {
          setSelectedInstructor(updatedInstructor);
        }
        return prevInstructors;
      });
      
      setIsNewDutyModalOpen(false);
      setIsEditMode(false);
      alert(isEditMode ? "Duty updated!" : "Duty created!");
    } catch (err) { 
      alert("Duty action failed."); 
    }
  };

  
  const handleDeleteDuty = async (id) => {
    if (!window.confirm("Deactivate this duty block? Student data will be preserved.")) return;

    try {
        await axios.delete(`${API_URL}/admin/duty/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setSelectedInstructor(prev => ({
            ...prev,
            workBlocks: prev.workBlocks.filter(block => block.id !== id)
        }));

        fetchAllData();
        alert("Duty block deactivated!");
    } catch (err) {
        alert("Failed to deactivate duty.");
    }
};

  // --- 4. HANDLERS FOR ASSIGNMENTS ---

  const handleAssignStudent = (student) => {
    if (!activeBlockId) {
      alert("Please select a duty block first");
      return;
    }
    
    setSelectedForSession(student);
    setEditingAssignment(null);
    const selectedBlock = selectedInstructor.workBlocks.find(b => String(b.id) === String(activeBlockId));
    setFormData({
      date: selectedBlock?.start || "",
      startTime: selectedBlock?.startTime || "09:00",
      endTime: selectedBlock?.endTime || "10:00",
      location: student.street_address || "",
      blockId: activeBlockId,
      assignmentId: null
    });
    setIsAssignModalOpen(true);
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setSelectedForSession(assignment.student);
    setFormData({
      date: assignment.date,
      startTime: assignment.start_time,
      endTime: assignment.end_time,
      location: assignment.student_location,
      blockId: activeBlockId,
      assignmentId: assignment.id
    });
    setIsAssignModalOpen(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm("Remove this student from the block?")) return;
    try {
      await axios.delete(`${API_URL}/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlockAssignments(activeBlockId);
    } catch (err) { alert("Failed to delete assignment."); }
  };

  const handleSaveAssignment = async () => {
    if (!formData.date) {
      alert("Please select a date");
      return;
    }

    const isEditing = !!formData.assignmentId;
    
    const endpoint = isEditing 
      ? `${API_URL}/assignments/${formData.assignmentId}` 
      : `${API_URL}/assignments/book`;

    const method = isEditing ? 'put' : 'post';

    const payload = {
      schedule_id: formData.blockId,
      student_id: selectedForSession.id,
      instructor_id: selectedInstructor?.id,
      date: formData.date,
      start_time: formData.startTime,
      end_time: formData.endTime,
      student_location: formData.location
    };

    try {
      await axios[method](endpoint, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      alert(isEditing ? "Booking Updated!" : "Student Assigned!");
      setSelectedForSession(null);
      setEditingAssignment(null);
      
      await fetchBlockAssignments(activeBlockId);
      
      setFormData({ date: "", startTime: "09:00", endTime: "10:00", location: "", blockId: "", assignmentId: null });
      setIsAssignModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving session.");
    }
  };

  // Multi-assign handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      const allStudentIds = filteredAvailableStudents.map(s => s.id);
      setSelectedStudents(allStudentIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleMultiAssign = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    if (!multiAssignData.date || !multiAssignData.startTime || !multiAssignData.endTime) {
      alert("Please fill in all session details.");
      return;
    }

    try {
      const promises = selectedStudents.map(studentId => {
        const payload = {
          schedule_id: activeBlockId,
          student_id: studentId,
          instructor_id: selectedInstructor?.id,
          date: multiAssignData.date,
          start_time: multiAssignData.startTime,
          end_time: multiAssignData.endTime,
          student_location: multiAssignData.location
        };
        return axios.post(`${API_URL}/assignments/book`, payload, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      });

      await Promise.all(promises);
      
      alert(`${selectedStudents.length} student(s) assigned successfully!`);
      
      setSelectedStudents([]);
      setSelectAll(false);
      setIsMultiAssignModalOpen(false);
      
      await fetchBlockAssignments(activeBlockId);
      
      setMultiAssignData({
        date: "",
        startTime: "09:00",
        endTime: "10:00",
        location: ""
      });
    } catch (err) {
      alert("Error assigning students: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    setSelectedStudents([]);
    setSelectAll(false);
  }, [activeBlockId]);

  // --- 5. FILTERS & MEMO ---

  const dynamicPlaces = useMemo(() => ["All Places", ...allLocations.map(l => l.province_name)], [allLocations]);
  
  const instructorsList = useMemo(() => {
    return instructors.filter(ins => 
      (selectedPlace === "All Places" || ins.place === selectedPlace) && 
      ins.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedPlace, searchQuery, instructors]);
  
  const paginatedInstructors = instructorsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const blockAssignmentsForBlock = useMemo(() => {
    if (!activeBlockId) return [];
    return blockAssignments.filter(a => a.schedule_id === parseInt(activeBlockId));
  }, [blockAssignments, activeBlockId]);

  const studentsNotYetAssigned = useMemo(() => {
    const assignedStudentIds = blockAssignments.map(a => a.student_id);
    return availableStudents.filter(s => !assignedStudentIds.includes(s.id));
  }, [availableStudents, blockAssignments]);

  const filteredAvailableStudents = useMemo(() => {
    return studentsNotYetAssigned.filter(s => 
      (s.user?.name || s.name || "").toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [studentsNotYetAssigned, studentSearch]);

  const activeSessions = useMemo(() => {
    return blockAssignmentsForBlock.filter(a => !a.attendance);
  }, [blockAssignmentsForBlock]);

  const historySessions = useMemo(() => {
    return blockAssignmentsForBlock.filter(a => a.attendance);
  }, [blockAssignmentsForBlock]);

  const selectedBlock = useMemo(() => {
    if (!activeBlockId || !selectedInstructor) return null;
    return selectedInstructor.workBlocks.find(b => b.id === parseInt(activeBlockId));
  }, [activeBlockId, selectedInstructor]);

  if (loading) return <div className="p-20 text-center text-slate-400">Loading schedule data...</div>;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-[1920px] mx-auto">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-auto text-center md:text-left">
              {viewMode === "manage" && (
                <button 
                  onClick={() => { 
                    setViewMode("instructors"); 
                    setActiveBlockId(""); 
                    setSelectedInstructor(null);
                  }} 
                  className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm mb-3 hover:gap-3 transition-all"
                >
                  <ArrowLeft size={16}/> Back to instructors
                </button>
              )}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
                Duty <span className="text-teal-600 dark:text-teal-400">{viewMode === "instructors" ? "Dispatch" : "Management"}</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                {viewMode === "instructors" ? "Manage instructor schedules and assignments" : "Configure duty blocks and student sessions"}
              </p>
            </div>
            {viewMode === "instructors" && (
              <div className="relative w-full md:w-auto md:min-w-[300px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
                />
              </div>
            )}
          </div>

          {viewMode === "instructors" ? (
            <>
              {/* Location Filters */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                {dynamicPlaces.map((place) => (
                  <button 
                    key={place} 
                    onClick={() => setSelectedPlace(place)} 
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      selectedPlace === place 
                        ? "bg-teal-600 text-white shadow-sm" 
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-teal-600 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {place}
                  </button>
                ))}
              </div>

              {/* Instructor Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedInstructors.map((ins) => {
                  const hasBlocks = ins.workBlocks && ins.workBlocks.length > 0;
                  const blockCount = hasBlocks ? ins.workBlocks.length : 0;
                  const activeSessionsCount = blockAssignments.filter(a => 
                    ins.workBlocks.some(b => b.id === a.schedule_id) && !a.attendance
                  ).length;

                  return (
                    <div key={ins.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 mx-auto w-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-2 flex-wrap">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            hasBlocks 
                              ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}>
                            {blockCount} Block{blockCount !== 1 ? 's' : ''}
                          </span>
                          {activeSessionsCount > 0 && (
                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                              {activeSessionsCount} Active
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => { setSelectedInstructor(ins); setViewMode("manage"); }} 
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-all"
                        >
                          Manage
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {ins.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-teal-600 transition-colors truncate">
                            {ins.name}
                          </h3>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={12} className="text-teal-500 flex-shrink-0" /> 
                            <span className="truncate">{ins.place}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination */}
              {instructorsList.length > itemsPerPage && (
                <div className="flex justify-center pt-8 pb-4">
                  <Pagination 
                    currentPage={currentPage} 
                    totalItems={instructorsList.length} 
                    itemsPerPage={itemsPerPage} 
                    onPageChange={setCurrentPage} 
                  />
                </div>
              )}
            </>
          ) : (
            /* MANAGEMENT VIEW */
            <div className="space-y-6">
              
              {/* ADD DUTY BLOCK BUTTON */}
              <div className="flex justify-center md:justify-end">
                <button 
                  onClick={handleAddDuty}
                  className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-teal-600 hover:text-white dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle size={16} /> Add Duty Block
                </button>
              </div>

              {/* DUTY BLOCKS LIST */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider text-center md:text-left">
                  Duty Blocks
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedInstructor?.workBlocks.map(block => (
                    <div key={block.id} className={`group relative p-4 rounded-xl border transition-all duration-300 w-full ${
                      activeBlockId === block.id.toString() 
                        ? "bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700 shadow-md" 
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md"
                    }`}>
                      <div className="flex-1 cursor-pointer" onClick={() => setActiveBlockId(block.id.toString())}>
                        <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-1 truncate">{block.task}</h4>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                          {block.start} - {block.end}
                        </p>
                        <p className="text-xs font-mono text-slate-400 mt-1">
                          {block.startTime} - {block.endTime}
                        </p>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleEditDuty(block)} className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteDuty(block.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedInstructor?.workBlocks.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <CalendarDays size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm text-slate-500">No duty blocks scheduled.</p>
                      <button 
                        onClick={handleAddDuty}
                        className="mt-3 text-teal-600 font-medium text-sm hover:underline"
                      >
                        Click here to create one
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* DUTY BLOCK SELECTOR DROPDOWN */}
              {selectedInstructor?.workBlocks.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <label className="text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider block mb-2 text-center md:text-left">
                    Select Duty Block to Manage Assignments
                  </label>
                  <select 
                    value={activeBlockId} 
                    onChange={(e) => setActiveBlockId(e.target.value)} 
                    className="w-full px-3 sm:px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                  >
                    <option value="">Choose a block to manage assignments...</option>
                    {selectedInstructor?.workBlocks?.map(block => (
                      <option key={block.id} value={block.id} className="text-xs sm:text-sm">
                        {block.task} ({block.start}) • {block.startTime}-{block.endTime}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Only show tabs and assignment section if a block is selected */}
              {activeBlockId && (
                <>
                  {/* Tabs */}
                  <div className="relative">
                    <div className="flex justify-center md:justify-start">
                      <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto w-full sm:w-auto scrollbar-hide">
                        {[
                          { id: "assign", label: "Assign Students", icon: <UserPlus size={14}/> }, 
                          { id: "active", label: "Active Sessions", icon: <Clock size={14}/> },
                          { id: "history", label: "History", icon: <History size={14}/> }
                        ].map(tab => (
                          <button 
                            key={tab.id} 
                            onClick={() => setActiveSubTab(tab.id)} 
                            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap ${
                              activeSubTab === tab.id 
                                ? "bg-teal-600 text-white shadow-sm" 
                                : "text-slate-600 dark:text-slate-400 hover:text-teal-600"
                            }`}
                          >
                            {tab.icon} 
                            <span className="hidden xs:inline">{tab.label}</span>
                            <span className="xs:hidden">
                              {tab.id === "assign" ? "Assign" : tab.id === "active" ? "Active" : "History"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* TAB: ASSIGN */}
                  {activeSubTab === "assign" && (
                    <div className="space-y-4">
                      {/* Search Bar */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input 
                            type="text" 
                            placeholder="Search students..." 
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={studentSearch} 
                            onChange={(e) => setStudentSearch(e.target.value)} 
                          />
                        </div>
                        {filteredAvailableStudents.length > 0 && (
                          <button
                            onClick={() => setIsMultiAssignModalOpen(true)}
                            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            <Users size={14}/> Multi-Assign
                          </button>
                        )}
                      </div>

                      {/* Students Table/Cards */}
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full text-left min-w-[500px]">
                            <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                              <tr className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                {filteredAvailableStudents.length > 0 && (
                                  <th className="px-4 sm:px-6 py-3 sm:py-4 w-12">
                                    <input
                                      type="checkbox"
                                      checked={selectAll}
                                      onChange={handleSelectAll}
                                      className="w-4 h-4 rounded border-slate-300 text-teal-600"
                                    />
                                  </th>
                                )}
                                <th className="px-4 sm:px-6 py-3 sm:py-4">Student</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4">Location</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {filteredAvailableStudents.map(s => {
                                const alreadyAssigned = blockAssignments.some(a => a.student_id === s.id && a.schedule_id === parseInt(activeBlockId));
                                return (
                                  <tr key={s.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    {filteredAvailableStudents.length > 0 && (
                                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                                        <input
                                          type="checkbox"
                                          checked={selectedStudents.includes(s.id)}
                                          onChange={() => handleSelectStudent(s.id)}
                                          className="w-4 h-4 rounded border-slate-300 text-teal-600"
                                        />
                                      </td>
                                    )}
                                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                                      <span className="text-sm font-semibold text-slate-800 dark:text-white">{s.user?.name || s.name}</span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                                      <div className="flex items-center gap-2">
                                        <MapPin size={12} className="text-teal-500 flex-shrink-0" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">{s.location || s.street_address}</span>
                                      </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                                      {alreadyAssigned ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                          <CheckCircle2 size={12} />
                                          Assigned
                                        </span>
                                      ) : (
                                        <button 
                                          onClick={() => handleAssignStudent(s)} 
                                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                                        >
                                          Assign
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredAvailableStudents.length > 0 ? (
                            filteredAvailableStudents.map(s => {
                              const alreadyAssigned = blockAssignments.some(a => a.student_id === s.id && a.schedule_id === parseInt(activeBlockId));
                              return (
                                <div key={s.id} className="p-4 space-y-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h4 className="text-base font-bold text-slate-800 dark:text-white">{s.user?.name || s.name}</h4>
                                      <div className="flex items-center gap-1 mt-1">
                                        <MapPin size={12} className="text-teal-500" />
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{s.location || s.street_address}</span>
                                      </div>
                                    </div>
                                    {alreadyAssigned ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                        <CheckCircle2 size={12} />
                                        Assigned
                                      </span>
                                    ) : (
                                      <button 
                                        onClick={() => handleAssignStudent(s)} 
                                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                                      >
                                        Assign
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="py-12 text-center">
                              <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                              <p className="text-sm text-slate-500">No students available for this block</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: ACTIVE */}
                  {activeSubTab === "active" && (
                    <div className="space-y-3">
                      {activeSessions.length > 0 ? (
                        activeSessions.map(session => (
                          <div key={session.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:shadow-md transition-all">
                            <div className="flex-1 w-full min-w-0">
                              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 mb-2">
                                <h4 className="text-base sm:text-sm font-bold text-slate-800 dark:text-white truncate flex-1">
                                  {session.student?.user?.name}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 whitespace-nowrap">
                                  Active
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1"><CalendarIcon size={12} /> {session.date}</span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {session.start_time} - {session.end_time}</span>
                                <span className="flex items-center gap-1 truncate"><MapPin size={12} /> <span className="truncate">{session.student_location}</span></span>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
                              <button onClick={() => handleEditAssignment(session)} className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => handleDeleteAssignment(session.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <Clock size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-sm text-slate-500">No active sessions for this block</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: HISTORY */}
                  {activeSubTab === "history" && (
                    <div className="space-y-3">
                      {historySessions.length > 0 ? (
                        historySessions.map(session => (
                          <div key={session.id} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 opacity-75 hover:opacity-100 transition-opacity">
                            <div className="flex-1 w-full min-w-0">
                              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 mb-2">
                                <h4 className="text-base sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate flex-1">
                                  {session.student?.user?.name}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-500 whitespace-nowrap">
                                  Completed
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                {session.date} • {session.start_time} - {session.end_time}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-teal-600 flex-shrink-0 self-end sm:self-center">
                              <CheckCircle2 size={16} />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <History size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-sm text-slate-500">No history for this block</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD/EDIT DUTY BLOCK */}
      {isNewDutyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
                  {isEditMode ? 'Edit' : 'Add'} <span className="text-teal-600 dark:text-teal-400">Duty Block</span>
                </h2>
                <p className="text-xs sm:text-sm md:text-md text-slate-600 dark:text-slate-400 mt-1">
                  {isEditMode ? 'Modify existing duty block details' : 'Create a new duty block for instructor'}
                </p>
              </div>
              <button 
                onClick={() => setIsNewDutyModalOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              <div className="space-y-5 sm:space-y-6">
                {/* Task Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                    Task Description
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., City Driving, Highway Practice" 
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400" 
                    value={newDutyData.task_description} 
                    onChange={(e) => setNewDutyData({...newDutyData, task_description: e.target.value})}
                  />
                </div>

                {/* Date Range */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                    Date Range
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[15px] font-medium text-slate-600 dark:text-slate-400 mb-1 block">Start Date</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                        value={newDutyData.start_date} 
                        onChange={(e) => setNewDutyData({...newDutyData, start_date: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="text-[15px] font-medium text-slate-600 dark:text-slate-400 mb-1 block">End Date</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                        value={newDutyData.end_date} 
                        onChange={(e) => setNewDutyData({...newDutyData, end_date: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                {/* Time Range */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                    Time Range
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[15px] font-medium text-slate-600 dark:text-slate-400 mb-1 block">Start Time</label>
                      <input 
                        type="time" 
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                        value={newDutyData.start_time} 
                        onChange={(e) => setNewDutyData({...newDutyData, start_time: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="text-[15px] font-medium text-slate-600 dark:text-slate-400 mb-1 block">End Time</label>
                      <input 
                        type="time" 
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                        value={newDutyData.end_time} 
                        onChange={(e) => setNewDutyData({...newDutyData, end_time: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                {newDutyData.task_description && newDutyData.start_date && newDutyData.end_date && (
                  <div className="mt-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarDays size={14} className="text-teal-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">Block Preview</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-bold text-slate-800 dark:text-white">{newDutyData.task_description}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        <span className="font-semibold">Dates:</span> {newDutyData.start_date} - {newDutyData.end_date}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        <span className="font-semibold">Hours:</span> {newDutyData.start_time} - {newDutyData.end_time}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button 
                onClick={() => setIsNewDutyModalOpen(false)} 
                className="flex-1 px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveDuty} 
                className="flex-1 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isEditMode ? "Update Block" : "Create Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MULTI-ASSIGN STUDENTS */}
      {isMultiAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Multi-<span className="text-teal-600">Assign</span>
              </h3>
              <button onClick={() => {
                setIsMultiAssignModalOpen(false);
                setMultiAssignData({
                  date: "",
                  startTime: "09:00",
                  endTime: "10:00",
                  location: ""
                });
              }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-100 dark:border-teal-900">
                <p className="text-sm font-semibold text-center">
                  Assigning to <span className="text-teal-600">{selectedStudents.length}</span> selected student(s)
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Session Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                    value={multiAssignData.date} 
                    onChange={(e) => setMultiAssignData({...multiAssignData, date: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Start Time</label>
                    <input 
                      type="time" 
                      className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                      value={multiAssignData.startTime} 
                      onChange={(e) => setMultiAssignData({...multiAssignData, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">End Time</label>
                    <input 
                      type="time" 
                      className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                      value={multiAssignData.endTime} 
                      onChange={(e) => setMultiAssignData({...multiAssignData, endTime: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Pickup Location</label>
                  <input 
                    type="text" 
                    placeholder="Same location for all students" 
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400" 
                    value={multiAssignData.location} 
                    onChange={(e) => setMultiAssignData({...multiAssignData, location: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsMultiAssignModalOpen(false)}
                  className="flex-1 px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleMultiAssign}
                  className="flex-1 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-500/20"
                >
                  Assign All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN/EDIT STUDENT SESSION */}
      {isAssignModalOpen && selectedForSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
                  {editingAssignment ? "Edit" : "Assign"} <span className="text-teal-600 dark:text-teal-400">Student Session</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {editingAssignment ? "Modify existing session details" : "Assign a student to this duty block"}
                </p>
              </div>
              <button 
                onClick={() => setIsAssignModalOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              <div className="space-y-5 sm:space-y-6">
                {/* Student Information Card */}
                <div className="p-5 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-lg flex-shrink-0">
                      {(selectedForSession.user?.name || selectedForSession.name || 'S').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Student</p>
                      <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5 truncate">{selectedForSession.user?.name || selectedForSession.name}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin size={10} /> <span className="truncate">{selectedForSession.location || selectedForSession.street_address}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                    Session Details
                  </label>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[15px] font-medium text-slate-700 dark:text-slate-400 mb-1 block">Session Date</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                        value={formData.date} 
                        onChange={(e) => setFormData({...formData, date: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                {/* Time Range */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                    Time Slot
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[15px] font-medium text-slate-700 dark:text-slate-400 mb-1 block">Start Time</label>
                      <input 
                        type="time" 
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                        value={formData.startTime} 
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="text-[15px] font-medium text-slate-700 dark:text-slate-400 mb-1 block">End Time</label>
                      <input 
                        type="time" 
                        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                        value={formData.endTime} 
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                {/* Pickup Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                    Pickup Location
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter pickup address" 
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400" 
                    value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})} 
                  />
                </div>

                {/* Preview Section */}
                {formData.date && formData.startTime && formData.endTime && (
                  <div className="mt-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={14} className="text-teal-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">Session Preview</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{selectedForSession.user?.name || selectedForSession.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        <span className="font-semibold">Date:</span> {formData.date}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        <span className="font-semibold">Time:</span> {formData.startTime} - {formData.endTime}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        <span className="font-semibold">Location:</span> {formData.location || "Not specified"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button 
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedForSession(null);
                  setEditingAssignment(null);
                  setFormData({ date: "", startTime: "09:00", endTime: "10:00", location: "", blockId: "", assignmentId: null });
                }} 
                className="flex-1 px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveAssignment} 
                className="flex-1 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                {editingAssignment ? "Update Session" : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
