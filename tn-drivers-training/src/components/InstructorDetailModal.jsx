
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  X, MoveHorizontal, AlertCircle, 
  Edit3, Save, Loader2,
  FileText,
  Ban, CheckCircle, Trash2, ChevronLeft, ChevronRight,
  Car
} from 'lucide-react';

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

// Evaluates if a student is completed based on 100% progress and Paid status
const isStudentCompleted = (stu) => {
  const isPaid = stu.paymentStatus === 'Paid' || stu.payment_status === 'Paid';
  const progress = parseFloat(stu.progress_percentage) || 
                   (stu.totalHours && stu.hoursLogged ? (parseFloat(stu.hoursLogged) / parseFloat(stu.totalHours)) * 100 : 0);
  return isPaid && progress >= 100;
};

// ─── Sub-components outside main component to prevent focus loss ──────────────

const DataField = ({ label, name, value, onChange, isEditing, type = "text", error, isRequired }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
      {label}
      {isEditing && isRequired && !value && <span className="text-red-500 animate-pulse">*</span>}
    </label>
    {isEditing ? (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium text-slate-900 dark:text-white outline-none transition-all ${
          error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
        }`}
      />
    ) : (
      <div className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 min-h-[42px] flex items-center">
        {value || <span className="text-slate-400 text-xs italic">Not Provided</span>}
      </div>
    )}
    {error && <p className="text-[10px] text-red-500 font-['Sora'] font-medium mt-0.5 ml-1">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, isEditing, options, disabled, error, isRequired }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
      {label}
      {isEditing && isRequired && !value && <span className="text-red-500 animate-pulse">*</span>}
    </label>
    {isEditing ? (
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-lg border outline-none text-sm font-medium transition-all
          ${disabled ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-400 border-slate-200 dark:border-slate-700' 
            : error ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-red-500 focus:ring-red-500/20 focus:border-red-500' 
            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer'}
        `}
      >
        <option value="">Select {label}...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <div className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 capitalize min-h-[42px] flex items-center">
        {value || '---'}
      </div>
    )}
    {error && <p className="text-[10px] text-red-500 font-['Sora'] font-medium mt-0.5 ml-1">{error}</p>}
  </div>
);

const FileField = ({ label, name, currentFile, onChange, isEditing, error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</label>
    {isEditing ? (
      <input
        type="file"
        name={name}
        onChange={onChange}
        className={`w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer ${error ? 'border border-red-500 rounded-lg p-1' : ''}`}
      />
    ) : (
      <div className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 min-h-[42px] flex items-center">
        {currentFile ? (
          <a href={`http://127.0.0.1:8000/storage/${currentFile}`} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline flex items-center gap-2">
            <FileText size={14} /> View Document
          </a>
        ) : (
          <span className="text-slate-400 text-xs italic">No File</span>
        )}
      </div>
    )}
    {error && <p className="text-[10px] text-red-500 font-['Sora'] font-medium mt-0.5 ml-1">{error}</p>}
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const InstructorDetailModal = ({
  instructor,
  onClose,
  allInstructors = [],
  onUpdate,
  onToggleBlock,
  onDelete
}) => {
  const [transferingStudent, setTransferingStudent] = useState(null);
  const [newInstructorId, setNewInstructorId] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Custom Alerts & Confirmations
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [errors, setErrors] = useState({}); // Stores validation errors

  // Dynamic Backend Data
  const [dbLocations, setDbLocations] = useState([]);
  const [dbCars, setDbCars] = useState([]);
  const [assignedCarIds, setAssignedCarIds] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);

  const [editData, setEditData] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({
    doc_criminal_cert: null,
    doc_vulnerable_sector: null,
    doc_driver_abstract: null
  });

  const [localInstructor, setLocalInstructor] = useState(instructor);
  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 10;

  // Sync localInstructor
  useEffect(() => {
    if (instructor) setLocalInstructor(instructor);
  }, [instructor]);

  // Show Inline Notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    if (type !== 'success') {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Fetch Locations, Cars, and Assignments
  useEffect(() => {
    const fetchFormDependencies = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [locRes, carRes, instRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/locations`, { headers }),
          axios.get(`http://127.0.0.1:8000/api/cars`, { headers }),
          axios.get(`http://127.0.0.1:8000/api/instructors`, { headers })
        ]);
        
        setDbLocations(locRes.data.data || []);
        setDbCars(carRes.data.data || []);
        
        // Find cars already assigned (excluding the current instructor's car)
        const assignedIds = (instRes.data.data || [])
          .filter(i => i.car_id !== null && i.id !== localInstructor?.id)
          .map(i => i.car_id);
          
        setAssignedCarIds(assignedIds);
      } catch (err) {
        console.error("Error fetching form dependencies", err);
      }
    };
    fetchFormDependencies();
  }, [localInstructor?.id]);

  const buildEditData = (inst) => ({
    name: inst.user?.name || '',
    email: inst.user?.email || '',
    phone: inst.user?.phone || '',
    status: inst.user?.status === 'active' ? 'Active' : 'Blocked',
    dob: formatDateForInput(inst.dob),
    language: inst.language || '',
    street_address: inst.street_address || '',
    city: inst.city || '',
    province: inst.province || '',
    postal_code: inst.postal_code || '',
    country: inst.country || 'Canada',
    assigned_location: inst.assigned_location || '',
    car_id: inst.car_id || '',
    licence_no: inst.licence_no || '',
    inst_license_no: inst.inst_license_no || '',
    licence_expiry: formatDateForInput(inst.licence_expiry),
    emp_status: inst.emp_status || 'Full-time',
    qualifications_to_teach: inst.qualifications_to_teach || ''
  });

  useEffect(() => {
    if (localInstructor) {
      setEditData(buildEditData(localInstructor));
      setCurrentLocation(localInstructor.assigned_location || '');
      setStudentPage(1);
    }
  }, [localInstructor]);

  // Filter cars whenever assigned_location changes
  useEffect(() => {
    if (!editData.assigned_location) {
      setAvailableCars([]);
      return;
    }
    
    const selectedLocation = dbLocations.find(l => l.province_name === editData.assigned_location);
    if (!selectedLocation) {
      setAvailableCars([]);
      return;
    }

    const filtered = dbCars.filter(car => {
      const matchesLocation = String(car.location_id) === String(selectedLocation.id);
      const isNotAssigned = !assignedCarIds.includes(car.id);
      return matchesLocation && isNotAssigned;
    });

    setAvailableCars(filtered);
  }, [editData.assigned_location, dbLocations, dbCars, assignedCarIds]);

  const refetchInstructor = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/instructors/${localInstructor.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fresh = response.data.data || response.data;
      setLocalInstructor(fresh);
    } catch (err) {
      console.error("Re-fetch instructor error:", err);
    }
  }, [localInstructor?.id]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'assigned_location') {
        newData.car_id = '';
      }
      return newData;
    });
    // Auto-clear validation error for the field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    setSelectedFiles(prev => ({ ...prev, [name]: files[0] }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }, [errors]);

  const handleSave = async () => {
    setErrors({});
    setNotification(null);

    // --- Strict Frontend Validations ---
    let frontendErrors = {};
    if (!editData.name?.trim()) frontendErrors.name = ["Full name is required."];
    
    if (!editData.email?.trim()) {
      frontendErrors.email = ["Email address is required."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(editData.email)) {
      frontendErrors.email = ["Please enter a valid email format."];
    }

    if (!editData.phone?.trim()) frontendErrors.phone = ["Phone number is required."];
    if (!editData.dob) frontendErrors.dob = ["Date of birth is required."];
    if (!editData.assigned_location) frontendErrors.assigned_location = ["Assigned location is required."];
    if (!editData.province?.trim()) frontendErrors.province = ["Province is required."];
    if (!editData.country?.trim()) frontendErrors.country = ["Country is required."];
    if (!editData.licence_no?.trim()) frontendErrors.licence_no = ["Driver's License is required."];
    if (!editData.inst_license_no?.trim()) frontendErrors.inst_license_no = ["Instructor License is required."];
    if (!editData.licence_expiry) frontendErrors.licence_expiry = ["Expiry date is required."];

    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors);
      showNotification('warning', 'Please fix the highlighted validation errors before saving.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const data = new FormData();
      data.append('_method', 'PUT');

      const textFields = [
        'name', 'email', 'phone', 'dob', 'language',
        'street_address', 'city', 'province', 'postal_code',
        'country', 'assigned_location', 'licence_no',
        'inst_license_no', 'licence_expiry', 'emp_status',
        'qualifications_to_teach', 'car_id'
      ];

      textFields.forEach(field => {
        const val = editData[field];
        if (val !== null && val !== undefined) data.append(field, val);
      });

      if (editData.status) {
        data.append('status', editData.status === 'Active' ? 'active' : 'inactive');
      }

      if (selectedFiles.doc_criminal_cert) data.append('doc_criminal_cert', selectedFiles.doc_criminal_cert);
      if (selectedFiles.doc_vulnerable_sector) data.append('doc_vulnerable_sector', selectedFiles.doc_vulnerable_sector);
      if (selectedFiles.doc_driver_abstract) data.append('doc_driver_abstract', selectedFiles.doc_driver_abstract);

      const response = await axios.post(
        `http://127.0.0.1:8000/api/instructors/update/${localInstructor.id}`,
        data,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        showNotification("success", "Instructor profile updated successfully!");
        setIsEditing(false);
        await refetchInstructor();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error("Update error:", err.response?.data);
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        showNotification('warning', 'Please fix the highlighted validation errors below.');
      } else if (err.response?.status >= 500) {
        showNotification('error', 'A server error occurred. Please try again later.');
      } else {
        showNotification('error', err.response?.data?.message || 'Update failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const executeToggleBlock = async () => {
    setConfirmDialog(null);
    setBlockLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const newStatus = editData.status === "Active" ? "inactive" : "active";

      const response = await axios.post(
        `http://127.0.0.1:8000/api/instructors/update/${localInstructor.id}`,
        { _method: 'PUT', status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const newDisplayStatus = newStatus === 'active' ? 'Active' : 'Blocked';
        showNotification("success", `Instructor ${newDisplayStatus === "Active" ? "activated" : "blocked"} successfully!`);
        await refetchInstructor();
        if (onUpdate) onUpdate();
        if (onToggleBlock) onToggleBlock(localInstructor.id);
      }
    } catch (err) {
      showNotification("error", err.response?.data?.message || "Status update failed");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleToggleBlock = () => {
    const actionText = editData.status === "Active" ? "block" : "activate";
    
    if (editData.status === "Active" && hasActiveStudents) {
      showNotification("warning", `Cannot block ${editData.name} because they have ${activeStudents.length} active student(s). Please transfer them first.`);
      return;
    }

    setConfirmDialog({
      title: `${actionText === 'block' ? 'Block' : 'Activate'} Instructor`,
      message: `Are you sure you want to ${actionText} ${editData.name}?`,
      type: actionText === 'block' ? 'danger' : 'success',
      actionText: actionText === 'block' ? 'Yes, Block' : 'Yes, Activate',
      onConfirm: executeToggleBlock
    });
  };

  const executeDelete = async () => {
    setConfirmDialog(null);
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/api/instructors/${localInstructor.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (onDelete) onDelete(localInstructor.id);
      onClose();
    } catch (err) {
      showNotification("error", err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDelete = () => {
    if (editData.status !== "Blocked") {
      showNotification("warning", `Cannot delete ${editData.name} because they are not blocked. Block the instructor first.`);
      return;
    }

    setConfirmDialog({
      title: "Delete Instructor",
      message: `Are you sure you want to permanently delete ${editData.name}? This action cannot be undone.`,
      type: "danger",
      actionText: "Delete Permanently",
      onConfirm: executeDelete
    });
  };

  const handleTransfer = async () => {
    if (!newInstructorId) {
      showNotification("warning", "Please select a target instructor");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `http://127.0.0.1:8000/api/students/${transferingStudent.id}/reassign`,
        { new_instructor_id: newInstructorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification("success", `Successfully transferred ${transferingStudent.user?.name || transferingStudent.name} to another instructor`);
      setTransferingStudent(null);
      setNewInstructorId('');
      await refetchInstructor();
      if (onUpdate) onUpdate();
    } catch (err) {
      showNotification("error", "Error during transfer.");
    } finally {
      setLoading(false);
    }
  };

  if (!localInstructor) return null;

  const allAssignedStudents = localInstructor?.students || [];

  const completedStudentsCount = useMemo(() => {
    return allAssignedStudents.filter(isStudentCompleted).length;
  }, [allAssignedStudents]);

  const activeStudents = useMemo(() => {
    return allAssignedStudents.filter(stu => !isStudentCompleted(stu));
  }, [allAssignedStudents]);

  const paginatedStudents = useMemo(() => {
    return activeStudents.slice((studentPage - 1) * studentsPerPage, studentPage * studentsPerPage);
  }, [activeStudents, studentPage]);

  const totalStudentPages = Math.ceil(activeStudents.length / studentsPerPage);
  const hasActiveStudents = activeStudents.length > 0;
  const canBlock = !hasActiveStudents;
  const blockTooltip = hasActiveStudents ? `Cannot block: ${activeStudents.length} active student(s) assigned` : "";

  const availableSameLocationStaff = allInstructors.filter(
    (staff) => staff.assigned_location === currentLocation && staff.id !== localInstructor.id && staff.user?.status === 'active'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="relative bg-white dark:bg-slate-950 w-full max-w-7xl h-full max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">

        {/* INLINE NOTIFICATION BANNER */}
        {notification && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' : 
            notification.type === 'warning' ? 'bg-amber-500 text-white' : 
            'bg-rose-500 text-white'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-bold">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-75"><X size={16}/></button>
          </div>
        )}

        {/* CONFIRMATION OVERLAY */}
        {confirmDialog && (
          <div className="absolute inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${confirmDialog.type === 'danger' ? 'text-rose-600' : 'text-emerald-600'}`}>
                <AlertCircle size={20} /> {confirmDialog.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
                {confirmDialog.message}
              </p>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDialog.onConfirm}
                  className={`flex-1 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors ${
                    confirmDialog.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {confirmDialog.actionText}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm sm:text-base md:text-lg flex-shrink-0">
              {editData.name?.[0] || 'I'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <h2 className="text-sm sm:text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white truncate">
                  {editData.name}
                </h2>
                <span className={`text-[9px] sm:text-[10px] md:text-xs font-semibold px-1.5 sm:px-2 md:px-3 py-0.5 rounded-full whitespace-nowrap ${
                  editData.status === 'Active'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {editData.status}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                ID: {localInstructor.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Block / Activate */}
            <div className="relative group">
              <button
                onClick={handleToggleBlock}
                disabled={blockLoading || (editData.status === "Active" && !canBlock)}
                title={blockTooltip}
                className={`flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-lg font-semibold text-[10px] sm:text-xs md:text-sm transition-all ${
                  editData.status === "Blocked"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                } ${(editData.status === "Active" && !canBlock) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {blockLoading
                  ? <Loader2 className="animate-spin" size={12} />
                  : editData.status === "Blocked"
                    ? <CheckCircle size={12} />
                    : <Ban size={12} />
                }
                <span>{editData.status === "Blocked" ? 'Activate' : 'Block'}</span>
              </button>
              {editData.status === "Active" && !canBlock && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {blockTooltip}
                </div>
              )}
            </div>

            {/* Delete — only visible when Blocked */}
            {editData.status === "Blocked" && (
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-lg font-semibold text-[10px] sm:text-xs md:text-sm transition-all bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
              >
                {deleteLoading ? <Loader2 className="animate-spin" size={12} /> : <Trash2 size={12} />}
                <span>Delete</span>
              </button>
            )}

            {/* Edit / Save */}
            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                  setEditData(buildEditData(localInstructor)); // Reset to current data
                  setErrors({}); // Clear any residual errors
                }
              }}
              disabled={loading}
              className={`flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-lg font-semibold text-[10px] sm:text-xs md:text-sm transition-all ${
                isEditing
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 disabled:opacity-70 disabled:cursor-not-allowed'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={12} /> : isEditing ? <Save size={12} /> : <Edit3 size={12} />}
              <span>{isEditing ? 'Save' : 'Edit'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 md:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors hover:text-red-500"
            >
              <X size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative">

          {editData.status === "Active" && hasActiveStudents && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <span className="font-semibold">Cannot Block:</span> This instructor has {activeStudents.length} active student(s). Please transfer all students before blocking.
              </p>
            </div>
          )}

          {isEditing && hasActiveStudents && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-semibold">Note:</span> Assigned Location and Status are locked because this instructor has active students. Reassign students before changing.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">

              {/* Account & Identity */}
              <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                  Account & Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <DataField label="Full Name" name="name" value={editData.name} onChange={handleChange} isEditing={isEditing} error={errors.name?.[0]} isRequired={true} />
                  <DataField label="Email Address" name="email" value={editData.email} onChange={handleChange} isEditing={isEditing} error={errors.email?.[0]} isRequired={true} />
                  <DataField label="Phone Number" name="phone" value={editData.phone} onChange={handleChange} isEditing={isEditing} error={errors.phone?.[0]} isRequired={true} />
                  <SelectField
                    label="Status"
                    name="status"
                    value={editData.status}
                    onChange={handleChange}
                    isEditing={isEditing}
                    disabled={hasActiveStudents}
                    options={['Active', 'Blocked']}
                  />
                  <DataField label="Date of Birth" name="dob" value={editData.dob} onChange={handleChange} isEditing={isEditing} type="date" error={errors.dob?.[0]} isRequired={true} />
                  <DataField label="Primary Language" name="language" value={editData.language} onChange={handleChange} isEditing={isEditing} />
                </div>
              </section>

              {/* Address & Location */}
              <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                  Address & Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <DataField label="Street Address" name="street_address" value={editData.street_address} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="City" name="city" value={editData.city} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="Province" name="province" value={editData.province} onChange={handleChange} isEditing={isEditing} error={errors.province?.[0]} isRequired={true} />
                  <DataField label="Postal Code" name="postal_code" value={editData.postal_code} onChange={handleChange} isEditing={isEditing} />
                  <SelectField
                    label="Assigned Location"
                    name="assigned_location"
                    value={editData.assigned_location}
                    onChange={handleChange}
                    isEditing={isEditing}
                    disabled={hasActiveStudents}
                    options={dbLocations.map(l => l.province_name)}
                    error={errors.assigned_location?.[0]}
                    isRequired={true}
                  />
                  <DataField label="Country" name="country" value={editData.country} onChange={handleChange} isEditing={isEditing} error={errors.country?.[0]} isRequired={true} />
                </div>
              </section>

              {/* Professional & Licensing */}
              <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                  Professional & Licensing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <DataField label="Driver's License #" name="licence_no" value={editData.licence_no} onChange={handleChange} isEditing={isEditing} error={errors.licence_no?.[0]} isRequired={true} />
                  <DataField label="Instructor License #" name="inst_license_no" value={editData.inst_license_no} onChange={handleChange} isEditing={isEditing} error={errors.inst_license_no?.[0]} isRequired={true} />
                  <DataField label="License Expiry" name="licence_expiry" value={editData.licence_expiry} onChange={handleChange} isEditing={isEditing} type="date" error={errors.licence_expiry?.[0]} isRequired={true} />
                  <SelectField label="Employment Status" name="emp_status" value={editData.emp_status} onChange={handleChange} isEditing={isEditing} options={['Full-time', 'Part-time', 'Contract']} />
                  <div className="md:col-span-2">
                    <DataField label="Qualifications" name="qualifications_to_teach" value={editData.qualifications_to_teach} onChange={handleChange} isEditing={isEditing} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <FileField label="Criminal Record Check" name="doc_criminal_cert" currentFile={localInstructor.doc_criminal_cert} onChange={handleFileChange} isEditing={isEditing} error={errors.doc_criminal_cert?.[0]} />
                  <FileField label="Vulnerable Sector Search" name="doc_vulnerable_sector" currentFile={localInstructor.doc_vulnerable_sector} onChange={handleFileChange} isEditing={isEditing} error={errors.doc_vulnerable_sector?.[0]} />
                  <FileField label="Driver Abstract" name="doc_driver_abstract" currentFile={localInstructor.doc_driver_abstract} onChange={handleFileChange} isEditing={isEditing} error={errors.doc_driver_abstract?.[0]} />
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">

              {/* Vehicle Info */}
              <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                  Vehicle Assignment
                </h3>
                
                {isEditing ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Change Vehicle</label>
                    <select
                      name="car_id"
                      value={editData.car_id || ''}
                      onChange={handleChange}
                      disabled={!editData.assigned_location}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none text-sm font-medium bg-white dark:bg-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white"
                    >
                      <option value="">No Vehicle Assigned</option>
                      {availableCars.map(car => (
                        <option key={car.id} value={car.id}>
                          {car.car_name || 'Car'} ({car.number_plate || 'No Plate'})
                        </option>
                      ))}
                    </select>
                    {!editData.assigned_location && <p className="text-[10px] text-amber-600 font-medium">Select an assigned location first</p>}
                    {editData.assigned_location && availableCars.length === 0 && <p className="text-[10px] text-slate-500 font-medium">No available unassigned cars at this location.</p>}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Vehicle</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <Car size={14} className="text-teal-500" />
                        {localInstructor.car?.car_name || localInstructor.vehicle || 'Not Assigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Plate Number</p>
                      <p className="text-sm font-mono font-semibold text-slate-800 dark:text-white uppercase">
                        {localInstructor.car?.number_plate || localInstructor.plate || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Active Students */}
              <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                    Active Students
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700" title="Active Students">
                      {activeStudents.length} Active
                    </span>
                    <span className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800" title="Completed Students">
                      {completedStudentsCount} Completed
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {paginatedStudents.map(stu => (
                    <div key={stu.id} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex justify-between items-center group hover:shadow-sm transition-all">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{stu.user?.name || stu.name}</p>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">{stu.city || 'N/A'} • {stu.permit_number || 'No Permit'}</p>
                      </div>
                      <button
                        onClick={() => setTransferingStudent(stu)}
                        className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all"
                        title="Transfer to same-location staff"
                      >
                        <MoveHorizontal size={16} />
                      </button>
                    </div>
                  ))}
                  {(!activeStudents || activeStudents.length === 0) && (
                    <p className="text-center py-6 text-sm text-slate-400 italic">No active students assigned.</p>
                  )}
                </div>

                {totalStudentPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setStudentPage(p => Math.max(1, p - 1))}
                      disabled={studentPage === 1}
                      className="p-1 rounded-lg text-slate-400 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs text-slate-500 font-medium">Page {studentPage} of {totalStudentPages}</span>
                    <button
                      onClick={() => setStudentPage(p => Math.min(totalStudentPages, p + 1))}
                      disabled={studentPage === totalStudentPages}
                      className="p-1 rounded-lg text-slate-400 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        {/* TRANSFER STUDENT MODAL */}
        {transferingStudent && (
          <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white">Transfer Student</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Reassigning <span className="font-semibold text-teal-600">{transferingStudent.user?.name || transferingStudent.name}</span>
                  </p>
                </div>
                <button onClick={() => setTransferingStudent(null)} className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                    Target Instructor ({currentLocation})
                  </label>
                  <select
                    value={newInstructorId}
                    onChange={(e) => setNewInstructorId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                  >
                    <option value="">Select instructor...</option>
                    {availableSameLocationStaff.map(i => {
                      const staffActiveCount = (i.students || []).filter(s => !isStudentCompleted(s)).length;
                      return (
                        <option key={i.id} value={i.id}>{i.user?.name} ({staffActiveCount} active students)</option>
                      );
                    })}
                  </select>
                  {availableSameLocationStaff.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">No other instructors available in this location</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setTransferingStudent(null)}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={!newInstructorId || availableSameLocationStaff.length === 0 || loading}
                    className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-teal-500/20"
                  >
                    {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Confirm Transfer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDetailModal;