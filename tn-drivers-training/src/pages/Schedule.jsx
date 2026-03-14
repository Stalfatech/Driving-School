
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { 
  MapPin, Calendar as CalendarIcon, Search, X, 
  Clock, AlertCircle, CheckCircle2, Edit3, Trash2, 
  UserPlus, History, Settings2, PlusCircle, Save, ArrowLeft,
  CalendarDays, Repeat, ArrowRightLeft, Check, Users
} from "lucide-react";

import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";

const API_URL = "http://localhost:8000/api";

const Schedule = () => {
  // --- 1. STATES ---
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allLocations, setAllLocations] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDutyId, setEditingDutyId] = useState(null);
  const [blockAssignments, setBlockAssignments] = useState([]);
  
  // Multi-select state
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const userRole = localStorage.getItem("user_role"); 
  const token = localStorage.getItem("access_token");
  
  const [viewMode, setViewMode] = useState("instructors"); 
  const [activeSubTab, setActiveSubTab] = useState("assign"); 
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState("All Places");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [activeBlockId, setActiveBlockId] = useState("");
  
  const [isNewDutyModalOpen, setIsNewDutyModalOpen] = useState(false);
  const [selectedForSession, setSelectedForSession] = useState(null);
  const [isMultiAssignModalOpen, setIsMultiAssignModalOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [availableStudents, setAvailableStudents] = useState([]);
  const itemsPerPage = 6;
  
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

  // Multi-assignment form data
  const [multiAssignData, setMultiAssignData] = useState({
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    location: ""
  });

  // --- 2. API SYNC ---

  const fetchBlockAssignments = async (blockId) => {
    if (!blockId) {
      setBlockAssignments([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/admin/assignments/block/${blockId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Fetched assignments:", res.data);
      setBlockAssignments(res.data);
    } catch (err) {
      console.error("Error fetching manifest:", err);
    }
  };

  // Fetch assignments when block changes or when component mounts with saved block
  useEffect(() => {
    if (activeBlockId) {
      fetchBlockAssignments(activeBlockId);
    }
  }, [activeBlockId]);

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
    } catch (error) { console.error("API Error:", error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPlace]);

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- 3. ACTIONS ---

  const handleDeleteDuty = async (id, force = false) => {
  const message = force 
    ? "Delete this duty block and ALL student assignments? This cannot be undone!"
    : "Delete this duty block? Students assigned here will lose their slots.";
    
  if (!window.confirm(message)) return;
  
  try {
    await axios.delete(`${API_URL}/admin/duty/${id}${force ? '?force=true' : ''}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setSelectedInstructor(prev => ({
      ...prev,
      workBlocks: prev.workBlocks.filter(block => block.id !== id)
    }));

    fetchAllData(); 
    alert("Duty deleted!");
  } catch (err) { 
    if (err.response?.status === 422 && !force) {
      // Ask if user wants to force delete
      if (confirm("This duty block has students assigned. Delete anyway? This will remove all student bookings.")) {
        handleDeleteDuty(id, true);
      }
    } else {
      alert("Failed to delete duty."); 
    }
  }
};

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Remove this student from the block?")) return;
    try {
      await axios.delete(`${API_URL}/assignments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlockAssignments(activeBlockId);
    } catch (err) { alert("Failed to delete assignment."); }
  };

  const handleSaveDuty = async () => {
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

  const handleSaveSession = async () => {
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
      
      // Refresh assignments after successful save
      await fetchBlockAssignments(activeBlockId);
      
      // Reset form
      setFormData({ date: "", startTime: "09:00", endTime: "10:00", location: "", blockId: "", assignmentId: null });
    } catch (err) {
      alert(err.response?.data?.message || "Error saving session.");
    }
  };

  // Handle multi-assign students
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
      // Create assignments for all selected students
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
      
      // Clear selections and close modal
      setSelectedStudents([]);
      setSelectAll(false);
      setIsMultiAssignModalOpen(false);
      
      // Refresh assignments
      await fetchBlockAssignments(activeBlockId);
      
      // Reset multi-assign form
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

  // Handle select all students
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      const allStudentIds = filteredAvailableStudents.map(s => s.id);
      setSelectedStudents(allStudentIds);
    }
    setSelectAll(!selectAll);
  };

  // Handle individual student selection
  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Clear selections when block changes
  useEffect(() => {
    setSelectedStudents([]);
    setSelectAll(false);
  }, [activeBlockId]);

  const openEditDutyModal = (block) => {
    setNewDutyData({
      task_description: block.task,
      start_date: block.start,
      end_date: block.end,
      start_time: block.startTime,
      end_time: block.endTime,
    });
    setEditingDutyId(block.id);
    setIsEditMode(true);
    setIsNewDutyModalOpen(true);
  };

  // --- 4. FILTERS & MEMO ---
  
  // Filter students not yet assigned to current block
  const studentsNotYetAssigned = useMemo(() => {
    if (!availableStudents.length) return [];
    
    const assignedStudentIds = blockAssignments.map(a => a.student_id);
    return availableStudents.filter(student => !assignedStudentIds.includes(student.id));
  }, [availableStudents, blockAssignments]);

  // Filtered available students based on search
  const filteredAvailableStudents = useMemo(() => {
    return studentsNotYetAssigned.filter(s => 
      (s.user?.name || s.name || "").toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [studentsNotYetAssigned, studentSearch]);

  // Active sessions (no attendance recorded yet)
  const activeSessions = useMemo(() => {
    return blockAssignments.filter(a => !a.attendance || !a.attendance.id);
  }, [blockAssignments]);

  // History sessions (have attendance recorded)
  const historySessions = useMemo(() => {
    return blockAssignments.filter(a => a.attendance && a.attendance.id);
  }, [blockAssignments]);

  const dynamicPlaces = useMemo(() => ["All Places", ...allLocations.map(l => l.province_name)], [allLocations]);
  
  const instructorsList = useMemo(() => {
    return instructors.filter(ins => 
      (selectedPlace === "All Places" || ins.place === selectedPlace) && 
      ins.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedPlace, searchQuery, instructors]);
  
  const paginatedInstructors = instructorsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // FETCH STUDENTS WHEN BLOCK CHANGES
  useEffect(() => {
    const fetchRelevantStudents = async () => {
      if (!activeBlockId || !selectedInstructor) { 
        setAvailableStudents([]); 
        return; 
      }
      
      try {
        // Use the correct endpoint from your routes
        const res = await axios.get(`${API_URL}/students/by-duty`, {
          params: { 
            instructor_id: selectedInstructor.id, 
            schedule_id: activeBlockId
          },
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Available students:", res.data);
        setAvailableStudents(res.data);
      } catch (err) { 
        console.error("Error fetching students:", err);
        // If the endpoint doesn't exist, set empty array
        setAvailableStudents([]);
      }
    };
    fetchRelevantStudents();
  }, [activeBlockId, selectedInstructor]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-indigo-600">SYNCING FLEET DATA...</div>;

  return (
    <div className="p-3 sm:p-6 lg:p-10 bg-slate-50 dark:bg-[#020617] min-h-screen font-['Lexend'] pb-20 text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-center lg:text-left w-full">
            {viewMode === "manage" && (
              <button onClick={() => { 
                setViewMode("instructors"); 
                setActiveBlockId(""); 
                setSelectedInstructor(null);
              }} className="flex items-center gap-2 text-indigo-600 font-black uppercase text-[10px] tracking-widest mb-4 hover:gap-3 transition-all">
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
            <div className="flex flex-wrap justify-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              {dynamicPlaces.map((place) => (
                <button key={place} onClick={() => setSelectedPlace(place)} className={`px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${selectedPlace === place ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-indigo-600"}`}>{place}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedInstructors.map((ins) => {
                const hasBlocks = ins.workBlocks && ins.workBlocks.length > 0;
                
                let dateRange = "No Schedule Set";
                if (hasBlocks) {
                  const dates = ins.workBlocks.map(b => new Date(b.start).getTime());
                  const minDate = new Date(Math.min(...dates)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                  const maxDate = new Date(Math.max(...dates)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                  dateRange = `${minDate} - ${maxDate}`;
                }

                return (
                  <div key={ins.id} className="group bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 ${
                        hasBlocks 
                          ? "bg-teal-100 text-teal-600" 
                          : "bg-rose-100 text-rose-600"
                      }`}>
                        <CalendarDays size={10} />
                        {hasBlocks ? "Active Schedule" : "No Schedule"}
                      </div>
                      
                      <button 
                        onClick={() => { setSelectedInstructor(ins); setViewMode("manage"); }} 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 flex items-center gap-2 shadow-lg"
                      >
                        <Settings2 size={14}/> Manage
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl">
                        {ins.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-lg truncate">{ins.name}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <MapPin size={10}/> {ins.place}
                        </p>
                        <p className={`mt-1 text-[9px] font-bold uppercase tracking-tight ${hasBlocks ? "text-indigo-500" : "text-slate-300"}`}>
                          {dateRange}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => { setSelectedInstructor(ins); setIsEditMode(false); setIsNewDutyModalOpen(true); }} 
                      className="mt-4 w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all"
                    >
                      + Add Duty Block
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center pt-8">
              <Pagination 
                currentPage={currentPage} 
                totalItems={instructorsList.length} 
                itemsPerPage={itemsPerPage} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </>
        ) : (
          /* MANAGEMENT VIEW */
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            
            {/* 1. EDITABLE DUTY BLOCKS SECTION */}
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 italic">
                <CalendarIcon size={14}/> Instructor Schedule Blocks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedInstructor?.workBlocks.map(block => (
                  <div key={block.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div>
                      <h4 className="font-black text-sm uppercase text-indigo-600">{block.task}</h4>
                      <p className="text-[10px] font-bold text-slate-400">
                        {block.start} • {block.startTime}-{block.endTime}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditDutyModal(block)} className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDeleteDuty(block.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* 2. BLOCK SELECTOR FOR ASSIGNMENTS */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
  <label className="text-[9px] font-black uppercase text-indigo-600 ml-2 italic block mb-2">
    Select Duty Block to Manage Assignments
  </label>
  <div className="relative">
    <select 
      value={activeBlockId} 
      onChange={(e) => setActiveBlockId(e.target.value)} 
      className="w-full px-4 py-3.5 rounded-2xl bg-indigo-50 dark:bg-slate-800 font-bold text-xs outline-none border border-indigo-100 dark:border-slate-700 appearance-none cursor-pointer text-slate-800 dark:text-white"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%234f46e5' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 1rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem'
      }}
    >
      <option value="" className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        Choose a block to view assignments...
      </option>
      {selectedInstructor?.workBlocks?.map(block => (
        <option 
          key={block.id} 
          value={block.id} 
          className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
        >
          {block.task} ({block.start}) • {block.startTime}-{block.endTime}
        </option>
      ))}
    </select>
  </div>
</div>

            {/* 3. ASSIGNMENT TABS */}
            <div className="flex flex-wrap bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 w-fit gap-1.5">
              {[
                { id: "assign", label: "Assign", icon: <UserPlus size={14}/> }, 
                { id: "active", label: "Active", icon: <Clock size={14}/> },
                { id: "history", label: "History", icon: <History size={14}/> }
              ].map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveSubTab(tab.id)} 
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                    activeSubTab === tab.id 
                      ? "bg-indigo-600 text-white shadow-lg" 
                      : "text-slate-400 hover:text-indigo-600"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* TAB: ASSIGN */}
            {activeSubTab === "assign" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold text-sm"
                      value={studentSearch} 
                      onChange={(e) => setStudentSearch(e.target.value)} 
                    />
                  </div>
                  
                  {activeBlockId && filteredAvailableStudents.length > 0 && (
                    <button
                      onClick={() => setIsMultiAssignModalOpen(true)}
                      className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
                    >
                      <Users size={16}/> Multi-Assign ({selectedStudents.length})
                    </button>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-400">
                      <tr>
                        {activeBlockId && filteredAvailableStudents.length > 0 && (
                          <th className="px-6 py-5 w-12">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </th>
                        )}
                        <th className="px-6 py-5">Learner</th>
                        <th className="px-6 py-5">Address</th>
                        <th className="px-6 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {activeBlockId ? (
                        filteredAvailableStudents.length > 0 ? (
                          filteredAvailableStudents.map(s => (
                            <tr key={s.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                              {filteredAvailableStudents.length > 0 && (
                                <td className="px-6 py-5">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(s.id)}
                                    onChange={() => handleSelectStudent(s.id)}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                </td>
                              )}
                              <td className="px-6 py-5">
                                <span className="font-black uppercase text-sm text-slate-900 dark:text-indigo-400">
                                  {s.user?.name || s.name}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <p className="text-[10px] text-slate-500 flex items-center gap-1 font-bold">
                                  <MapPin size={10}/> {s.street_address || "Address pending"}
                                </p>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <button 
                                  onClick={() => { 
                                    setSelectedForSession(s); 
                                    const block = selectedInstructor.workBlocks.find(b => String(b.id) === String(activeBlockId));
                                    setFormData({ 
                                      date: block?.start || "", 
                                      startTime: block?.startTime || "09:00", 
                                      endTime: block?.endTime || "10:00", 
                                      location: s.street_address || "", 
                                      blockId: activeBlockId, 
                                      assignmentId: null 
                                    });
                                  }} 
                                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-md hover:bg-indigo-700"
                                >
                                  Assign
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={filteredAvailableStudents.length > 0 ? "4" : "3"} className="px-6 py-10 text-center text-slate-400 font-bold italic">
                              No matching students available.
                            </td>
                          </tr>
                        )
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-10 text-center text-slate-400 font-bold italic">
                            Select a Duty Block above first.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: ACTIVE */}
            {activeSubTab === "active" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBlockId ? (
                  activeSessions.length > 0 ? (
                    activeSessions.map(session => (
                      <div key={session.id} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg flex justify-between items-center group">
                        <div>
                          <h4 className="font-black text-sm uppercase text-indigo-600">
                            {session.student?.user?.name || "Unknown Student"}
                          </h4>
                          <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase mt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-indigo-400"/> 
                              {session.start_time} - {session.end_time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-indigo-400"/> 
                              {session.student_location || "N/A"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedForSession(session.student);
                              setFormData({
                                assignmentId: session.id,
                                date: session.date,
                                startTime: session.start_time,
                                endTime: session.end_time,
                                location: session.student_location,
                                blockId: activeBlockId
                              });
                            }} 
                            className="p-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all"
                            title="Edit Session"
                          >
                            <Edit3 size={18}/>
                          </button>

                          <button 
                            onClick={() => handleDeleteAssignment(session.id)}
                            className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                            title="Delete Session"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center text-slate-400 font-bold italic">
                      No active students found for this block.
                    </div>
                  )
                ) : (
                  <div className="col-span-full py-10 text-center text-slate-400 font-bold italic">
                    Select a Duty Block above to view active sessions.
                  </div>
                )}
              </div>
            )}

            {/* TAB: HISTORY */}
            {activeSubTab === "history" && (
              <div className="space-y-4">
                {activeBlockId ? (
                  historySessions.length > 0 ? (
                    historySessions.map(session => (
                      <div key={session.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 flex justify-between items-center opacity-75">
                        <div>
                          <h4 className="font-black text-sm uppercase text-slate-500">
                            {session.student?.user?.name || "Unknown Student"}
                          </h4>
                          <p className="text-[9px] font-bold text-teal-600 uppercase mt-1">
                            {session.attendance?.status === 'Present' ? (
                              <> student pressent </>
                            ) : (
                              <>Student Absent</>
                            )}
                          </p>
                          <p className="text-[8px] text-slate-400 mt-1">
                            {session.date} • {session.start_time} - {session.end_time}
                          </p>
                        </div>
                        <div className="size-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                          <Check size={14} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-slate-400 font-bold italic">
                      No history for this block.
                    </div>
                  )
                ) : (
                  <div className="py-10 text-center text-slate-400 font-bold italic">
                    Select a Duty Block above to view history.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: MULTI-ASSIGN STUDENTS */}
      {isMultiAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic">
                Multi-<span className="text-indigo-600">Assign</span>
              </h3>
              <button onClick={() => {
                setIsMultiAssignModalOpen(false);
                setMultiAssignData({
                  date: "",
                  startTime: "09:00",
                  endTime: "10:00",
                  location: ""
                });
              }} className="text-slate-400 hover:text-rose-500">
                <X/>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                <p className="text-sm font-bold text-center">
                  Assigning to <span className="text-indigo-600">{selectedStudents.length}</span> selected student(s)
                </p>
              </div>
              
              <div className="space-y-3">
                <input 
                  type="date" 
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-sm border-none" 
                  value={multiAssignData.date} 
                  onChange={(e) => setMultiAssignData({...multiAssignData, date: e.target.value})}
                  placeholder="Session Date"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="time" 
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-sm border-none" 
                    value={multiAssignData.startTime} 
                    onChange={(e) => setMultiAssignData({...multiAssignData, startTime: e.target.value})}
                  />
                  <input 
                    type="time" 
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-sm border-none" 
                    value={multiAssignData.endTime} 
                    onChange={(e) => setMultiAssignData({...multiAssignData, endTime: e.target.value})}
                  />
                </div>
                
                <input 
                  type="text" 
                  placeholder="Pickup Location (same for all)" 
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-sm border-none" 
                  value={multiAssignData.location} 
                  onChange={(e) => setMultiAssignData({...multiAssignData, location: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsMultiAssignModalOpen(false)}
                  className="flex-1 py-3 text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleMultiAssign}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-md hover:bg-indigo-700 transition-all"
                >
                  Assign All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN / EDIT STUDENT SESSION */}
      {selectedForSession && !isMultiAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic">
                {formData.assignmentId ? "Edit" : "Finalize"} <span className="text-indigo-600">Booking</span>
              </h3>
              <button onClick={() => {
                setSelectedForSession(null);
                setFormData({ date: "", startTime: "09:00", endTime: "10:00", location: "", blockId: "", assignmentId: null });
              }} className="text-slate-400 hover:text-rose-500">
                <X/>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                <div className="size-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black">
                  {(selectedForSession?.user?.name || 'S').charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-indigo-600">Student</p>
                  <p className="text-sm font-bold">{selectedForSession?.user?.name || selectedForSession?.name}</p>
                </div>
              </div>
              <input 
                type="date" 
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-sm border-none" 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="time" 
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-sm border-none" 
                  value={formData.startTime} 
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
                <input 
                  type="time" 
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-sm border-none" 
                  value={formData.endTime} 
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
              <input 
                type="text" 
                placeholder="Pickup Address" 
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-sm border-none" 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
              <button 
                onClick={handleSaveSession} 
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-indigo-700 transition-transform active:scale-95"
              >
                {formData.assignmentId ? "Update Session" : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW / EDIT DUTY BLOCK */}
      {isNewDutyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic">
                {isEditMode ? 'Edit' : 'New'} <span className="text-indigo-600">Duty Block</span>
              </h3>
              <button onClick={() => { 
                setIsNewDutyModalOpen(false); 
                setIsEditMode(false); 
              }} className="text-slate-400 hover:text-rose-500">
                <X/>
              </button>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="e.g. In-Car Lessons" 
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm" 
                value={newDutyData.task_description} 
                onChange={(e) => setNewDutyData({...newDutyData, task_description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="date" 
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm" 
                  value={newDutyData.start_date} 
                  onChange={(e) => setNewDutyData({...newDutyData, start_date: e.target.value})}
                />
                <input 
                  type="date" 
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm" 
                  value={newDutyData.end_date} 
                  onChange={(e) => setNewDutyData({...newDutyData, end_date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="time" 
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm" 
                  value={newDutyData.start_time} 
                  onChange={(e) => setNewDutyData({...newDutyData, start_time: e.target.value})}
                />
                <input 
                  type="time" 
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-sm" 
                  value={newDutyData.end_time} 
                  onChange={(e) => setNewDutyData({...newDutyData, end_time: e.target.value})}
                />
              </div>
              <button 
                onClick={handleSaveDuty} 
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-indigo-700 transition-colors"
              >
                {isEditMode ? "Update Block" : "Create Block"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;