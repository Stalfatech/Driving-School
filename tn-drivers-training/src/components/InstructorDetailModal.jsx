import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User, Mail, Phone, MapPin, 
  Car, Users, MoveHorizontal, 
  ShieldCheck, Edit3, Save, 
  ChevronLeft, ChevronRight, 
  BadgeCheck, FileText, Home, ChevronDown,
  Check, Search, UploadCloud, Trash2
} from 'lucide-react';

const InstructorDetailModal = ({ instructor, onClose, allInstructors, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [transferingStudent, setTransferingStudent] = useState(null);
  const [newInstructorId, setNewInstructorId] = useState('');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 3;

  // Ref for the hidden file input
  const fileInputRef = useRef(null);

  const availableClasses = [
    "Class 1 (Semi-Trailer)", 
    "Class 2 (Bus)", 
    "Class 3 (Heavy Truck)", 
    "Class 4 (Taxi/Ambulance)", 
    "Class 5 (Car)", 
    "Class 6 (Motorcycle)"
  ];

  useEffect(() => {
    if (instructor) {
      setEditData({
        ...instructor,
        firstName: instructor.name?.split(' ')[0] || "",
        lastName: instructor.name?.split(' ').slice(1).join(' ') || "",
        province: instructor.province || "Ontario",
        language: instructor.language || "English",
        status: instructor.status || "Full-time",
        qualifyToTeach: instructor.qualifyToTeach || "Class 5 (Car)",
        address: instructor.address || "",
        city: instructor.city || "",
        postalCode: instructor.postalCode || "",
        driversLicense: instructor.driversLicense || "",
        license: instructor.license || "",
        expiry: instructor.expiry || "",
      });
    }
  }, [instructor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const toggleQualification = (cls) => {
    if (!isEditing) return;
    const currentList = editData.qualifyToTeach ? editData.qualifyToTeach.split(", ") : [];
    const newList = currentList.includes(cls)
      ? currentList.filter(item => item !== cls)
      : [...currentList, cls];
    
    setEditData({ ...editData, qualifyToTeach: newList.join(", ") });
  };

  // Logic for Transfer Confirmation Alert
  const handleConfirmTransfer = () => {
    const targetInstructor = allInstructors.find(s => s.id === newInstructorId);
    alert(`Success: ${transferingStudent.name} has been transferred to ${targetInstructor?.name || 'the new instructor'}.`);
    setTransferingStudent(null);
    setNewInstructorId('');
  };

  // Logic to trigger hidden file input
  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  if (!instructor) return null;

  const filteredStudents = (instructor.students || []).filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const currentStudents = filteredStudents.slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage);
  const availableStaff = allInstructors.filter(s => s.location === editData.location && s.id !== instructor.id);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-['Lexend']">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={(e) => alert(`File "${e.target.files[0]?.name}" selected for upload.`)}
      />

      <div className="bg-[#f0f7ff] dark:bg-slate-950 w-full max-w-6xl h-full max-h-[92vh] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
            <span className="hidden sm:inline">Instructors</span>
            <ChevronRight size={14} className="hidden sm:block" />
            <span className="text-slate-900 dark:text-white font-bold tracking-tight uppercase italic text-[10px] sm:text-xs">Staff Profile</span>
            <ChevronRight size={14} />
            <span className="text-[#2563eb] font-bold text-[10px] sm:text-xs uppercase italic">{editData.firstName} {editData.lastName}</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => isEditing ? (onUpdate(instructor.id, editData), setIsEditing(false)) : setIsEditing(true)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95 ${isEditing ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-[#2563eb] text-white shadow-blue-500/20'}`}
              >
                {isEditing ? <><Save size={16}/> Save Changes</> : <><Edit3 size={16}/> Edit Profile</>}
              </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 custom-scrollbar">
          
          {/* PERSONAL INFO */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-[#2563eb] uppercase tracking-widest mb-8 flex items-center gap-2 justify-center sm:justify-start">
              <User size={18} /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DataField label="First Name" name="firstName" value={editData.firstName} onChange={handleChange} isEditing={isEditing} />
              <DataField label="Last Name" name="lastName" value={editData.lastName} onChange={handleChange} isEditing={isEditing} />
              <DataField label="Date of Birth" name="dob" value={editData.dob} onChange={handleChange} isEditing={isEditing} type="date" />
              <DataField label="Email Address" name="email" value={editData.email} onChange={handleChange} isEditing={isEditing} />
              <DataField label="Phone Number" name="contact" value={editData.contact} onChange={handleChange} isEditing={isEditing} />
              <SelectField label="Primary Language" name="language" value={editData.language} onChange={handleChange} isEditing={isEditing} options={["English", "French", "Bilingual (EN/FR)"]} />
              <div className="md:col-span-3">
                <SelectField label="Assigned Location" name="location" value={editData.location} onChange={handleChange} isEditing={isEditing} options={["Burin", "Grand Falls", "Marystown", "St. John’s / Mount Pearl"]} />
              </div>
            </div>
          </section>

          {/* RESIDENTIAL ADDRESS */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-[#2563eb] uppercase tracking-widest mb-8 flex items-center gap-2 justify-center sm:justify-start">
              <Home size={18} /> Residential Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <DataField label="Street Address" name="address" value={editData.address} onChange={handleChange} isEditing={isEditing} />
              </div>
              <DataField label="City" name="city" value={editData.city} onChange={handleChange} isEditing={isEditing} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField label="Province" name="province" value={editData.province} onChange={handleChange} isEditing={isEditing} options={["Ontario", "Quebec", "Newfoundland and Labrador"]} />
                <DataField label="Postal Code" name="postalCode" value={editData.postalCode} onChange={handleChange} isEditing={isEditing} />
              </div>
            </div>
          </section>

          {/* LICENSING & QUALIFICATIONS */}
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-[#2563eb] uppercase tracking-widest mb-8 flex items-center gap-2 justify-center sm:justify-start">
              <BadgeCheck size={18} /> Licensing & Certifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <DataField label="Driver's License #" name="driversLicense" value={editData.driversLicense} onChange={handleChange} isEditing={isEditing} />
              <DataField label="Instructor License #" name="license" value={editData.license} onChange={handleChange} isEditing={isEditing} />
              <DataField label="Instructor License Expiry" name="expiry" value={editData.expiry} onChange={handleChange} isEditing={isEditing} type="date" />
            </div>
            
            <div className="flex flex-col items-center sm:items-start w-full">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mb-4">Qualified to Teach</label>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center sm:justify-start gap-3 w-full">
                {availableClasses.map((cls) => {
                  const isSelected = editData.qualifyToTeach?.includes(cls);
                  return (
                    <button
                      key={cls}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => toggleQualification(cls)}
                      className={`w-full sm:w-auto px-5 py-3 rounded-2xl border text-sm font-bold transition-all flex items-center gap-3 ${
                        isSelected 
                          ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-400'
                      } ${isEditing ? 'cursor-pointer hover:scale-[1.01]' : 'cursor-default'}`}
                    >
                      {isEditing && (
                        <div className={`size-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-white border-white' : 'border-slate-300 bg-white'}`}>
                          {isSelected && <Check size={12} className="text-[#2563eb] stroke-[4px]" />}
                        </div>
                      )}
                      <span className="flex-1 text-center sm:text-left">{cls}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* TWO COLUMN: DOCUMENTS & ROSTER */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* DOCUMENT UPLOAD SECTION - VIEW REPLACED BY UPLOAD */}
            <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-[#2563eb] uppercase tracking-widest mb-6 flex items-center gap-2 justify-center sm:justify-start">
                <FileText size={18} /> Compliance Documents
              </h3>
              <div className="space-y-4">
                {[
                  { id: 'crc', name: 'Criminal Record Check', date: 'Valid until Oct 2026' },
                  { id: 'vss', name: 'Vulnerable Sector Search', date: 'Verified Aug 2025' }
                ].map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                        <FileText size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{doc.date}</p>
                      </div>
                    </div>
                    {/* REPLACED "VIEW" WITH UPLOAD TRIGGER */}
                    <button 
                      onClick={triggerUpload}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-[#2563eb] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                    >
                      <UploadCloud size={14} />
                      Upload
                    </button>
                  </div>
                ))}
                {isEditing && (
                  <button onClick={triggerUpload} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all">
                    <UploadCloud size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Upload New Document</span>
                  </button>
                )}
              </div>
            </section>

            {/* STUDENT ROSTER WITH SEARCH & PAGINATION */}
            <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-sm font-bold text-[#2563eb] uppercase tracking-widest flex items-center gap-2 justify-center sm:justify-start">
                  <Users size={18} /> Student Roster
                </h3>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    value={searchTerm}
                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                    className="w-full sm:w-48 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {currentStudents.length > 0 ? currentStudents.map(stu => (
                  <div key={stu.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-blue-200 transition-all">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{stu.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Class: {stu.licenseClass || '5'}</span>
                    </div>
                    <button onClick={() => setTransferingStudent(stu)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm">
                      <MoveHorizontal size={18} />
                    </button>
                  </div>
                )) : (
                  <div className="py-8 text-center text-slate-400 text-xs italic">No matching students found.</div>
                )}
              </div>
              
              {/* PAGINATION LOGIC */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase">Page {currentPage} of {totalPages || 1}</span>
                <div className="flex gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)} className="p-2 border border-slate-100 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 disabled:opacity-30 shadow-sm"><ChevronLeft size={16}/></button>
                  <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p+1)} className="p-2 border border-slate-100 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 disabled:opacity-30 shadow-sm"><ChevronRight size={16}/></button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-center sm:justify-end px-8 py-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button onClick={onClose} className="w-full sm:w-auto px-12 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl active:scale-95 transition-all">
            Dismiss Record
          </button>
        </div>

        {/* STUDENT TRANSFER OVERLAY */}
        {transferingStudent && (
          <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
              <div className="text-center mb-6">
                <div className="size-14 bg-blue-50 dark:bg-blue-900/30 text-[#2563eb] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MoveHorizontal size={28}/>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Transfer Student</h4>
                <p className="text-xs text-slate-500 mt-1 italic">Moving {transferingStudent.name} to another instructor</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block ml-1">New Instructor</label>
                  <div className="relative">
                    <select 
                      value={newInstructorId}
                      onChange={(e) => setNewInstructorId(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 text-sm font-bold outline-none appearance-none dark:text-white"
                    >
                      <option value="">Select Target Instructor...</option>
                      {availableStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setTransferingStudent(null)} className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                <button 
                  disabled={!newInstructorId}
                  onClick={handleConfirmTransfer}
                  className="flex-1 py-4 bg-[#2563eb] text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- REUSABLE FIELD COMPONENTS --- */

const DataField = ({ label, name, value, onChange, isEditing, type = "text" }) => (
  <div className="flex flex-col gap-1.5 items-center sm:items-start text-center sm:text-left">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1">{label}</label>
    <div className={`w-full px-4 py-3.5 rounded-2xl border transition-all flex items-center bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 ${
      isEditing ? 'border-blue-500 ring-2 ring-blue-500/10' : ''
    }`}>
      {isEditing ? (
        <input 
          type={type} 
          name={name} 
          value={value || ""} 
          onChange={onChange} 
          className="w-full bg-transparent text-sm font-bold outline-none text-slate-900 dark:text-white"
        />
      ) : (
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{value || "---"}</span>
      )}
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, isEditing, options }) => (
  <div className="flex flex-col gap-1.5 items-center sm:items-start text-center sm:text-left">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1">{label}</label>
    <div className={`w-full px-4 py-3.5 rounded-2xl border transition-all flex items-center justify-between bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 ${
      isEditing ? 'border-blue-500 ring-2 ring-blue-500/10' : ''
    }`}>
      {isEditing ? (
        <select 
          name={name} 
          value={value} 
          onChange={onChange} 
          className="w-full bg-transparent text-sm font-bold outline-none cursor-pointer appearance-none text-slate-900 dark:text-white"
        >
          {options.map(opt => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
        </select>
      ) : (
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{value}</span>
      )}
      {isEditing && <ChevronDown size={14} className="text-blue-500 ml-2 shrink-0" />}
    </div>
  </div>
);

export default InstructorDetailModal;