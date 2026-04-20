

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  X, MoveHorizontal, AlertCircle, 
  Edit3, Save, Loader2,
  FileText,
  Ban, CheckCircle, Trash2, ChevronLeft, ChevronRight
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

// ─── Sub-components outside main component to prevent focus loss ──────────────

const DataField = ({ label, name, value, onChange, isEditing, type = "text" }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</label>
    {isEditing ? (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm font-medium text-slate-900 dark:text-white transition-all"
      />
    ) : (
      <div className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 min-h-[42px] flex items-center">
        {value || <span className="text-slate-400 text-xs italic">Not Provided</span>}
      </div>
    )}
  </div>
);

const SelectField = ({ label, name, value, onChange, isEditing, options, disabled }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</label>
    {isEditing ? (
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none text-sm font-medium transition-all
          ${disabled
            ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-400'
            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer'
          }`}
      >
        <option value="">Select {label}...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <div className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 capitalize min-h-[42px] flex items-center">
        {value || '---'}
      </div>
    )}
  </div>
);

const FileField = ({ label, name, currentFile, onChange, isEditing }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</label>
    {isEditing ? (
      <input
        type="file"
        name={name}
        onChange={onChange}
        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
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
  const [editData, setEditData] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({
    doc_criminal_cert: null,
    doc_vulnerable_sector: null,
    doc_driver_abstract: null
  });

  // localInstructor: live copy of instructor — updated after every API action
  const [localInstructor, setLocalInstructor] = useState(instructor);

  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 10;

  // Sync localInstructor when parent passes a fresh prop
  useEffect(() => {
    if (instructor) setLocalInstructor(instructor);
  }, [instructor]);

  // Build editData from an instructor object
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
    licence_no: inst.licence_no || '',
    inst_license_no: inst.inst_license_no || '',
    licence_expiry: formatDateForInput(inst.licence_expiry),
    emp_status: inst.emp_status || 'Full-time',
    qualifications_to_teach: inst.qualifications_to_teach || ''
  });

  // Re-initialize whenever localInstructor updates
  useEffect(() => {
    if (localInstructor) {
      setEditData(buildEditData(localInstructor));
      setCurrentLocation(localInstructor.assigned_location || '');
      setStudentPage(1);
    }
  }, [localInstructor]);

  // Fetch a fresh copy of this instructor directly from API
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
    setEditData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    setSelectedFiles(prev => ({ ...prev, [name]: files[0] }));
  }, []);

  const handleSave = async () => {
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
        'qualifications_to_teach'
      ];

      textFields.forEach(field => {
        const val = editData[field];
        if (val && val.trim() !== '') data.append(field, val);
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
        alert("Instructor updated successfully!");
        setIsEditing(false);
        await refetchInstructor();
        if (onUpdate) onUpdate();
      } else {
        alert(response.data.message || "Update failed.");
      }
    } catch (err) {
      console.error("Update error:", err.response?.data);
      const errorMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || "Update failed. Please check all fields.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    const hasStudents = (localInstructor.students?.length || 0) > 0;
    if (editData.status === "Active" && hasStudents) {
      alert(`Cannot block ${editData.name} because they have ${localInstructor.students.length} active student(s). Please transfer all students before blocking.`);
      return;
    }

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
        alert(`Instructor ${newDisplayStatus === "Active" ? "activated" : "blocked"} successfully!`);
        // Re-fetch so modal immediately shows new status + Delete button if blocked
        await refetchInstructor();
        if (onUpdate) onUpdate();
        if (onToggleBlock) onToggleBlock(localInstructor.id);
      }
    } catch (err) {
      console.error("Status Update Error:", err.response);
      alert(err.response?.data?.message || "Status update failed");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleDelete = async () => {
    if (editData.status !== "Blocked") {
      alert(`Cannot delete ${editData.name} because they are not blocked. Please block the instructor first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete ${editData.name}? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/api/instructors/${localInstructor.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Instructor ${editData.name} deleted successfully!`);
      if (onDelete) onDelete(localInstructor.id);
      onClose();
    } catch (err) {
      console.error("Delete Error:", err);
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!newInstructorId) return alert("Please select a target instructor");

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `http://127.0.0.1:8000/api/students/${transferingStudent.id}/reassign`,
        { new_instructor_id: newInstructorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Successfully transferred ${transferingStudent.user?.name || transferingStudent.name} to another instructor`);
      setTransferingStudent(null);
      setNewInstructorId('');
      await refetchInstructor();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Transfer Error:", err);
      alert("Error during transfer.");
    } finally {
      setLoading(false);
    }
  };

  if (!localInstructor) return null;

  const hasStudents = (localInstructor.students?.length || 0) > 0;

  const paginatedStudents = useMemo(() => {
    const students = localInstructor?.students || [];
    return students.slice((studentPage - 1) * studentsPerPage, studentPage * studentsPerPage);
  }, [localInstructor, studentPage]);

  const totalStudentPages = Math.ceil((localInstructor.students?.length || 0) / studentsPerPage);

  const availableSameLocationStaff = allInstructors.filter(
    (staff) => staff.assigned_location === currentLocation && staff.id !== localInstructor.id && staff.user?.status === 'active'
  );

  const canBlock = !hasStudents;
  const blockTooltip = hasStudents ? `Cannot block: ${localInstructor.students.length} active student(s) assigned` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-950 w-full max-w-7xl h-full max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">

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
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={loading}
              className={`flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-lg font-semibold text-[10px] sm:text-xs md:text-sm transition-all ${
                isEditing
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={12} /> : isEditing ? <Save size={12} /> : <Edit3 size={12} />}
              <span>{isEditing ? 'Save' : 'Edit'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 sm:p-1.5 md:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
            >
              <X size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">

          {editData.status === "Active" && hasStudents && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <span className="font-semibold">Cannot Block:</span> This instructor has {localInstructor.students.length} active student(s). Please transfer all students before blocking.
              </p>
            </div>
          )}

          {isEditing && hasStudents && (
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
                  <DataField label="Full Name" name="name" value={editData.name} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="Email Address" name="email" value={editData.email} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="Phone Number" name="phone" value={editData.phone} onChange={handleChange} isEditing={isEditing} />
                  <SelectField
                    label="Status"
                    name="status"
                    value={editData.status}
                    onChange={handleChange}
                    isEditing={isEditing}
                    disabled={hasStudents}
                    options={['Active', 'Blocked']}
                  />
                  <DataField label="Date of Birth" name="dob" value={editData.dob} onChange={handleChange} isEditing={isEditing} type="date" />
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
                  <DataField label="Province" name="province" value={editData.province} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="Postal Code" name="postal_code" value={editData.postal_code} onChange={handleChange} isEditing={isEditing} />
                  <SelectField
                    label="Assigned Location"
                    name="assigned_location"
                    value={editData.assigned_location}
                    onChange={handleChange}
                    isEditing={isEditing}
                    disabled={hasStudents}
                    options={['Burin', 'Grand Falls', 'Marystown', "St. John's / Mount Pearl"]}
                  />
                  <DataField label="Country" name="country" value={editData.country} onChange={handleChange} isEditing={isEditing} />
                </div>
              </section>

              {/* Professional & Licensing */}
              <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                  Professional & Licensing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <DataField label="Driver's License #" name="licence_no" value={editData.licence_no} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="Instructor License #" name="inst_license_no" value={editData.inst_license_no} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="License Expiry" name="licence_expiry" value={editData.licence_expiry} onChange={handleChange} isEditing={isEditing} type="date" />
                  <SelectField label="Employment Status" name="emp_status" value={editData.emp_status} onChange={handleChange} isEditing={isEditing} options={['Full-time', 'Part-time', 'Contract']} />
                  <div className="md:col-span-2">
                    <DataField label="Qualifications" name="qualifications_to_teach" value={editData.qualifications_to_teach} onChange={handleChange} isEditing={isEditing} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <FileField label="Criminal Record Check" name="doc_criminal_cert" currentFile={localInstructor.doc_criminal_cert} onChange={handleFileChange} isEditing={isEditing} />
                  <FileField label="Vulnerable Sector Search" name="doc_vulnerable_sector" currentFile={localInstructor.doc_vulnerable_sector} onChange={handleFileChange} isEditing={isEditing} />
                  <FileField label="Driver Abstract" name="doc_driver_abstract" currentFile={localInstructor.doc_driver_abstract} onChange={handleFileChange} isEditing={isEditing} />
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
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Vehicle</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
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
              </section>

              {/* Active Students */}
              <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                    Active Students
                  </h3>
                  <span className="text-xs font-semibold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {localInstructor.students?.length || 0}
                  </span>
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
                  {(!localInstructor.students || localInstructor.students.length === 0) && (
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
                    <span className="text-xs text-slate-500">Page {studentPage} of {totalStudentPages}</span>
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

        {/* FOOTER */}
        <footer className="px-8 py-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
          >
            Close Profile
          </button>
        </footer>

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
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  >
                    <option value="">Select instructor...</option>
                    {availableSameLocationStaff.map(i => (
                      <option key={i.id} value={i.id}>{i.user?.name} ({i.students?.length || 0} students)</option>
                    ))}
                  </select>
                  {availableSameLocationStaff.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">No other instructors available in this location</p>
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