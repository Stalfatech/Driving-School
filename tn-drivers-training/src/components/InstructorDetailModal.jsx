

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, User, Mail, Phone, MapPin, 
  Car, Users, MoveHorizontal, 
  ShieldCheck, Edit3, Save, AlertCircle,
  ChevronRight, BadgeCheck, FileText, 
  Calendar, Globe, Briefcase, Loader2
} from 'lucide-react';

const InstructorDetailModal = ({ instructor, onClose, allInstructors, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({});
  const [transferingStudent, setTransferingStudent] = useState(null);
  const [newInstructorId, setNewInstructorId] = useState('');
  
  const hasStudents = instructor?.students?.length > 0;

  const [selectedFiles, setSelectedFiles] = useState({
    doc_criminal_cert: null,
    doc_vulnerable_sector: null,
    doc_driver_abstract: null
  });

  useEffect(() => {
    if (instructor) {
      setEditData({
        ...instructor,
        name: instructor.user?.name || '',
        email: instructor.user?.email || '',
        phone: instructor.user?.phone || '',
        status: instructor.user?.status || 'active',
      });
    }
  }, [instructor]);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFiles({
      ...selectedFiles,
      [e.target.name]: e.target.files[0]
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const data = new FormData();
      data.append('_method', 'PUT'); 

      const textFields = [
        'name', 'email', 'phone', 'status', 'dob', 'language', 
        'street_address', 'city', 'province', 'postal_code', 
        'country', 'assigned_location', 'licence_no', 
        'inst_license_no', 'licence_expiry', 'emp_status', 
        'qualifications_to_teach'
      ];

      textFields.forEach(field => {
        data.append(field, editData[field] || '');
      });

      if (selectedFiles.doc_criminal_cert) data.append('doc_criminal_cert', selectedFiles.doc_criminal_cert);
      if (selectedFiles.doc_vulnerable_sector) data.append('doc_vulnerable_sector', selectedFiles.doc_vulnerable_sector);
      if (selectedFiles.doc_driver_abstract) data.append('doc_driver_abstract', selectedFiles.doc_driver_abstract);

      await axios.post(`http://127.0.0.1:8000/api/instructors/update/${instructor.id}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      alert("Updated successfully!");
      onUpdate(); 
      setIsEditing(false);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransfer = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`http://127.0.0.1:8000/api/students/${transferingStudent.id}/reassign`, {
        new_instructor_id: newInstructorId
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Student reassigned!");
      setTransferingStudent(null);
      onUpdate(); 
    } catch (err) {
      alert("Error during transfer.");
    } finally {
      setLoading(false);
    }
  };

  if (!instructor) return null;

  const availableStaff = (allInstructors || []).filter(ins => 
    ins.assigned_location === instructor.assigned_location && 
    ins.id !== instructor.id &&
    ins.user?.status === 'active'
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-['Lexend']">
      <div className="bg-[#f8fafc] dark:bg-slate-950 w-full max-w-6xl h-full max-h-[95vh] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-5 bg-white dark:bg-slate-900 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User size={20} />
            </div>
            <div>
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest block">Instructor ID: #{instructor.id}</span>
                <span className="text-slate-900 dark:text-white font-black text-lg">{editData.name}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${isEditing ? 'bg-emerald-600' : 'bg-[#2563eb]'} text-white`}
            >
              {loading ? <Loader2 className="animate-spin" size={18}/> : isEditing ? <Save size={18}/> : <Edit3 size={18}/>}
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Global Warning for Locked Fields */}
          {isEditing && hasStudents && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-800 shadow-sm">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-medium leading-relaxed">
                <b>Note:</b> Assigned Location and Account Status are locked because this instructor has active students. Please reassign all students before changing these settings.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-tighter mb-6 flex items-center gap-2">
                  <BadgeCheck size={18} /> Account & Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DataField label="Full Name" name="name" value={editData.name} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="Email" name="email" value={editData.email} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="Phone" name="phone" value={editData.phone} onChange={handleChange} isEditing={isEditing} />
                  
                  {/* Status Field: Locked if has students */}
                  <SelectField 
                    label="Status" 
                    name="status" 
                    value={editData.status} 
                    onChange={handleChange} 
                    isEditing={isEditing} 
                    disabled={hasStudents}
                    options={['active', 'inactive', 'disabled']} 
                  />
                  
                  <DataField label="Date of Birth" name="dob" value={editData.dob} onChange={handleChange} isEditing={isEditing} type="date" />
                  <DataField label="Language" name="language" value={editData.language} onChange={handleChange} isEditing={isEditing} />
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-tighter mb-6 flex items-center gap-2">
                  <MapPin size={18} /> Address & Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DataField label="Street Address" name="street_address" value={editData.street_address} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="City" name="city" value={editData.city} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="Province" name="province" value={editData.province} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="Postal Code" name="postal_code" value={editData.postal_code} onChange={handleChange} isEditing={isEditing} />
                  
                  {/* Location Field: Locked if has students */}
                  <SelectField 
                    label="Assigned Location" 
                    name="assigned_location" 
                    value={editData.assigned_location} 
                    onChange={handleChange} 
                    isEditing={isEditing} 
                    disabled={hasStudents}
                    options={['Burin', 'Marystown', 'St. John’s']} 
                  />

                  <DataField label="Country" name="country" value={editData.country} onChange={handleChange} isEditing={isEditing} />
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-tighter mb-6 flex items-center gap-2">
                  <Briefcase size={18} /> Professional & Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <DataField label="License No" name="licence_no" value={editData.licence_no} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="Inst. License No" name="inst_license_no" value={editData.inst_license_no} onChange={handleChange} isEditing={isEditing} />
                  <DataField label="License Expiry" name="licence_expiry" value={editData.licence_expiry} onChange={handleChange} isEditing={isEditing} type="date" />
                  <SelectField label="Employment Status" name="emp_status" value={editData.emp_status} onChange={handleChange} isEditing={isEditing} options={['Full-time', 'Part-time', 'Contract']} />
                  <div className="md:col-span-2">
                    <DataField label="Qualifications" name="qualifications_to_teach" value={editData.qualifications_to_teach} onChange={handleChange} isEditing={isEditing} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                    <FileField label="Criminal Cert" name="doc_criminal_cert" currentFile={instructor.doc_criminal_cert} onChange={handleFileChange} isEditing={isEditing} />
                    <FileField label="Vulnerable Sector" name="doc_vulnerable_sector" currentFile={instructor.doc_vulnerable_sector} onChange={handleFileChange} isEditing={isEditing} />
                    <FileField label="Driver Abstract" name="doc_driver_abstract" currentFile={instructor.doc_driver_abstract} onChange={handleFileChange} isEditing={isEditing} />
                </div>
              </section>
            </div>

            <div className="space-y-8">
               <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-tighter mb-6 flex items-center gap-2">
                  <Users size={18} /> Active Students ({instructor.students?.length || 0})
                </h3>
                <div className="space-y-3">
                  {instructor.students?.length > 0 ? (
                    instructor.students.map(stu => (
                      <div key={stu.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{stu.user?.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{stu.city} • {stu.permit_number || 'No Permit'}</p>
                        </div>
                        <button 
                          onClick={() => setTransferingStudent(stu)}
                          className="p-2 bg-white dark:bg-slate-700 text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <MoveHorizontal size={18} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-400 text-sm italic">No students assigned.</div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* TRANSFER MODAL */}
        {transferingStudent && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl">
              <div className="text-center mb-6 text-slate-900">
                <MoveHorizontal size={32} className="mx-auto mb-4 text-blue-600"/>
                <h4 className="text-xl font-black">Transfer Student</h4>
                <p className="text-sm text-slate-500 mt-2">Move <b>{transferingStudent.user?.name}</b></p>
              </div>
              <select 
                value={newInstructorId}
                onChange={(e) => setNewInstructorId(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 text-sm font-bold outline-none mb-8"
              >
                <option value="">Choose New Instructor...</option>
                {availableStaff.map(s => ( <option key={s.id} value={s.id}>{s.user?.name}</option> ))}
              </select>
              <div className="flex gap-3">
                <button onClick={() => setTransferingStudent(null)} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
                <button 
                  onClick={handleConfirmTransfer}
                  disabled={!newInstructorId || loading}
                  className="flex-1 py-4 bg-[#2563eb] text-white rounded-2xl font-bold disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Confirm Transfer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* HELPER COMPONENTS */

const DataField = ({ label, name, value, onChange, isEditing, type = "text" }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
    {isEditing ? (
      <input 
        type={type} 
        name={name} 
        value={value || ''} 
        onChange={onChange} 
        /* Added bg-white and text-slate-900 for maximum visibility */
        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold text-slate-900 transition-all shadow-sm"
      />
    ) : (
      <div className="px-4 py-3 rounded-xl bg-slate-50/50 border border-transparent text-sm font-bold text-slate-700 min-h-[46px] flex items-center">
        {value || <span className="text-slate-300 font-normal italic text-xs">Not Provided</span>}
      </div>
    )}
  </div>
);

const SelectField = ({ label, name, value, onChange, isEditing, options, disabled }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
    {isEditing ? (
      <select 
        name={name} 
        value={value || ''} 
        onChange={onChange} 
        disabled={disabled}
        /* Added bg-white/text-slate-900 for active state, and bg-slate-100 for disabled state */
        className={`w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-bold appearance-none transition-all shadow-sm
          ${disabled 
            ? 'bg-slate-100 cursor-not-allowed text-slate-400' 
            : 'bg-white text-slate-900 focus:border-blue-500 cursor-pointer'
          }`}
      >
        <option value="" disabled>Select {label}...</option>
        {options.map(opt => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
      </select>
    ) : (
      <div className="px-4 py-3 rounded-xl bg-slate-50/50 text-sm font-bold text-slate-700 capitalize min-h-[46px] flex items-center">
        {value || '---'}
      </div>
    )}
  </div>
);

const FileField = ({ label, name, currentFile, onChange, isEditing }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
    {isEditing ? (
      <input type="file" name={name} onChange={onChange} className="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
    ) : (
      <div className="px-4 py-3 rounded-xl bg-slate-50/50 text-sm font-bold text-slate-700 min-h-[46px] flex items-center">
        {currentFile ? (
          <a href={`http://127.0.0.1:8000/storage/${currentFile}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2 text-xs">
            <FileText size={14} /> View Document
          </a>
        ) : ( <span className="text-slate-300 font-normal italic text-xs">No File</span> )}
      </div>
    )}
  </div>
);

export default InstructorDetailModal;