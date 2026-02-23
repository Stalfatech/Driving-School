import React, { useState } from 'react';
import { 
  X, User, Mail, Phone, MapPin, 
  Car, Users, MoveHorizontal, AlertCircle, 
  ShieldCheck 
} from 'lucide-react';

const InstructorDetailModal = ({ instructor, onClose, allInstructors }) => {
  const [transferingStudent, setTransferingStudent] = useState(null);
  const [newInstructorId, setNewInstructorId] = useState('');
  const [currentLocation, setCurrentLocation] = useState(instructor?.location || '');

  if (!instructor) return null;

  // Logic to filter instructors who are in the SAME location as the current instructor
  const availableSameLocationStaff = allInstructors.filter(
    (staff) => staff.location === currentLocation
  );

  const handleTransfer = () => {
    if (!newInstructorId) return alert("Please select a target instructor");
    const targetName = availableSameLocationStaff.find(i => i.id === newInstructorId)?.name;
    alert(`Successfully transferred ${transferingStudent.name} to ${targetName} (within ${currentLocation})`);
    setTransferingStudent(null);
    setNewInstructorId('');
  };

  const handleLocationUpdate = (e) => {
    const newLoc = e.target.value;
    setCurrentLocation(newLoc);
    // Note: When location changes, any open transfer dropdown will recalculate 
    // to show instructors from the NEW location.
    console.log(`Updating ${instructor.name}'s location to: ${newLoc}`);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-['Lexend']">
      <div className="bg-[#f0f7ff] dark:bg-background-dark w-full max-w-5xl h-full max-h-[92vh] rounded-4xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all">
        
        {/* HEADER */}
        <header className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-4">
            <div className={`size-14 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-lg ${instructor.status === 'Blocked' ? 'bg-slate-400' : 'bg-teal'}`}>
              {instructor.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{instructor.name}</h2>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${instructor.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {instructor.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Instructor ID: {instructor.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={24}/>
          </button>
        </header>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: PERSONAL & OPERATIONS */}
            <div className="space-y-8">
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold text-[#2563eb] uppercase tracking-widest mb-6 flex items-center gap-2">
                  <User size={18}/> Personal Profile
                </h3>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Full Name</p>
                    <p className="font-bold text-slate-900 dark:text-slate-200">{instructor.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Date of Birth</p>
                    <p className="font-bold text-slate-900 dark:text-slate-200">{instructor.dob || '1985-06-12'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400 uppercase font-black">Email</p>
                    <p className="font-bold text-slate-900 dark:text-slate-200 break-all">{instructor.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Phone</p>
                    <p className="font-bold text-slate-900 dark:text-slate-200">{instructor.contact}</p>
                  </div>
                </div>
              </section>

              {/* Editable Location Box */}
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-[#2563eb]">
                <h3 className="text-sm font-bold text-[#2563eb] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin size={18}/> Assigned Operations
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Branch Location</label>
                    <select 
                      value={currentLocation}
                      onChange={handleLocationUpdate}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="Burin">Burin</option>
                      <option value="Grand Falls">Grand Falls</option>
                      <option value="Marystown">Marystown</option>
                      <option value="St. John’s / Mount Pearl">St. John’s / Mount Pearl</option>
                    </select>
                    <p className="text-[9px] text-[#2563eb] mt-2 font-bold uppercase tracking-tight">
                      * Transfers restricted to staff in {currentLocation}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: VEHICLE & STUDENTS */}
            <div className="space-y-8">
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold text-[#2563eb] uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ShieldCheck size={18}/> Licensing & Vehicle
                </h3>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black">License Number</p>
                    <p className="font-mono font-bold text-slate-900 dark:text-slate-200">{instructor.license || 'INST-88291-AB'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Expiry Date</p>
                    <p className="font-bold text-rose-500">{instructor.expiry}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Vehicle</p>
                    <p className="font-bold text-slate-900 dark:text-slate-200">{instructor.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Plate</p>
                    <p className="font-mono font-bold text-slate-900 dark:text-slate-200 uppercase">{instructor.plate}</p>
                  </div>
                </div>
              </section>

              {/* Active Students List */}
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-[#2563eb] uppercase tracking-widest flex items-center gap-2">
                    <Users size={18}/> Active Students
                  </h3>
                  <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-full text-xs font-black">
                    {instructor.students?.length || 0}
                  </span>
                </div>

                <div className="space-y-3">
                  {instructor.students?.map(stu => (
                    <div key={stu.id} className="p-4 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-100 dark:border-slate-800 flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{stu.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">Progress: {stu.progress}</p>
                      </div>
                      <button 
                        onClick={() => setTransferingStudent(stu)}
                        className="p-2 text-teal hover:bg-teal hover:text-white rounded-lg transition-all shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        title="Transfer to same-location staff"
                      >
                        <MoveHorizontal size={18}/>
                      </button>
                    </div>
                  ))}
                  {(!instructor.students || instructor.students.length === 0) && (
                    <p className="text-center py-4 text-xs text-slate-400 italic">No active students found.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="px-8 py-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-rose-500">
            {instructor.status === 'Blocked' && (
              <>
                <AlertCircle size={16}/>
                <span className="text-[10px] font-black uppercase">Service Suspended</span>
              </>
            )}
          </div>
          <button 
            onClick={onClose}
            className="px-10 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-sm shadow-lg active:scale-95 transition-transform"
          >
            Close Profile
          </button>
        </footer>

        {/* TRANSFER STUDENT OVERLAY - FILTERED BY LOCATION */}
        {transferingStudent && (
          <div className="absolute inset-0 z-100 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">Relocate Student</h4>
                  <p className="text-xs text-slate-500 font-medium">Reassigning <span className="text-teal font-bold">{transferingStudent.name}</span></p>
                  <p className="text-[10px] text-blue-500 font-bold uppercase mt-1 tracking-wider italic">Within branch: {currentLocation}</p>
                </div>
                <button onClick={() => setTransferingStudent(null)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20}/></button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Target Instructor ({currentLocation} Staff)</label>
                  <select 
                    value={newInstructorId}
                    onChange={(e) => setNewInstructorId(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">Select compatible staff...</option>
                    {availableSameLocationStaff.length > 0 ? (
                      availableSameLocationStaff.map(i => (
                        <option key={i.id} value={i.id}>{i.name} (Load: {i.students?.length || 0})</option>
                      ))
                    ) : (
                      <option disabled>No other instructors available in {currentLocation}</option>
                    )}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setTransferingStudent(null)} className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">Cancel</button>
                  <button 
                    onClick={handleTransfer} 
                    disabled={availableSameLocationStaff.length === 0}
                    className="flex-1 py-3.5 bg-teal disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
                  >
                    Confirm Reassignment
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