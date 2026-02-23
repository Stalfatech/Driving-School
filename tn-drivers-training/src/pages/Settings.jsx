import React, { useState } from 'react';
import { 
  MapPin, ShieldCheck, Mail, Save, X, Eye, 
  Smartphone, CheckCircle, Slash, ChevronRight, Bell
} from 'lucide-react';

const Settings = () => {
  const [postalCodes, setPostalCodes] = useState(['V6B', 'V7C', 'M5V', 'H2X']);
  const [newCode, setNewCode] = useState('');

  const addPostalCode = () => {
    if (newCode && !postalCodes.includes(newCode.toUpperCase())) {
      setPostalCodes([...postalCodes, newCode.toUpperCase()]);
      setNewCode('');
    }
  };

  const removeCode = (code) => {
    setPostalCodes(postalCodes.filter(c => c !== code));
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-background-dark transition-colors duration-300">
      
      {/* 1. HEADER - Responsive Padding & Z-Index */}
      <header className="h-16 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
        <div className="flex items-center gap-2 text-sm overflow-hidden">
          <span className="text-slate-400 font-medium hidden xs:inline">Settings</span>
          <ChevronRight size={14} className="text-slate-300 hidden xs:inline" />
          <span className="text-slate-800 dark:text-white font-bold uppercase text-[10px] tracking-widest truncate">Configuration</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors">
            <Bell size={18} />
            <span className="absolute top-2 right-2 size-1.5 bg-rose-500 rounded-full border border-white"></span>
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden xs:block"></div>
          <button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-3 md:px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all active:scale-95">
            <Save size={14} /> <span className="hidden sm:inline">Save Changes</span>
            <span className="sm:hidden">Save</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-10">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
              System <span className="text-[#0ea5e9]">Rules</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">Manage priority regions, access controls, and automated messaging.</p>
          </div>

          {/* 2. PRIORITY AREA CONFIGURATOR */}
          <section className="bg-white dark:bg-[#111827] rounded-3xl md:rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="size-10 md:size-11 rounded-xl md:rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-sm md:text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight leading-none">Priority Areas</h3>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mt-1">Postal Code Prefixes</p>
              </div>
            </div>
            <div className="p-5 md:p-6 space-y-4">
              <p className="text-xs text-slate-500 font-medium">Tagged as <span className="text-orange-600 font-bold italic">"High Priority"</span>.</p>
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-background-dark rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                {postalCodes.map((code) => (
                  <div key={code} className="flex items-center gap-2 bg-[#0ea5e9]/10 text-[#0ea5e9] px-3 py-1.5 rounded-lg text-xs font-black border border-[#0ea5e9]/20">
                    {code}
                    <button onClick={() => removeCode(code)} className="hover:text-rose-500 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <input 
                  className="bg-transparent border-none focus:ring-0 text-xs flex-1 min-w-30 dark:text-white placeholder:text-slate-400 font-bold" 
                  placeholder="Add code..." 
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPostalCode()}
                />
              </div>
            </div>
          </section>

          {/* 3. PERMISSIONS - Card stack on mobile, Table on MD+ */}
          <section className="bg-white dark:bg-[#111827] rounded-3xl md:rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="size-10 md:size-11 rounded-xl md:rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm md:text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">Permissions Matrix</h3>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mt-1">Access Control</p>
              </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-background-dark text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    <th className="px-8 py-5">System Capability</th>
                    <th className="px-6 py-5 text-center">Admin</th>
                    <th className="px-6 py-5 text-center">Instructor</th>
                    <th className="px-6 py-5 text-center">Student</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  <PermissionRow label="Full View / Edit" admin instructor={false} student={false} />
                  <PermissionRow label="Manage Assigned Students" admin instructor student={false} />
                  <PermissionRow label="Mark Attendance & Receipts" admin={false} instructor student={false} />
                  <PermissionRow label="Book Lessons & Progress" admin instructor student />
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              <MobilePermissionCard label="Full View / Edit" admin instructor={false} student={false} />
              <MobilePermissionCard label="Manage Assigned Students" admin instructor student={false} />
              <MobilePermissionCard label="Mark Attendance & Receipts" admin instructor student={false} />
              <MobilePermissionCard label="Book Lessons & Progress" admin instructor student />
            </div>
          </section>

          {/* 4. TEMPLATES CONFIGURATION - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <TemplateCard 
              icon={<Mail className="text-blue-600" size={18} />} 
              title="Welcome" 
              type="Email Template"
              defaultVal="Hi {student_name}, welcome to DriveSmart!"
            />
            <TemplateCard 
              icon={<Smartphone className="text-purple-600" size={18} />} 
              title="Reminder" 
              type="SMS Notification"
              defaultVal="Reminder: Hi {student_name}, lesson tomorrow at {lesson_time}."
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Helper Components ---

const PermissionRow = ({ label, admin, instructor, student }) => (
  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-xs">
    <td className="px-8 py-5 font-bold text-slate-800 dark:text-white uppercase tracking-tight">{label}</td>
    <td className="px-6 py-5 text-center">{admin ? <CheckCircle className="inline text-[#0ea5e9]" size={18}/> : <Slash className="inline text-slate-200" size={16}/>}</td>
    <td className="px-6 py-5 text-center">{instructor ? <CheckCircle className="inline text-[#0ea5e9]" size={18}/> : <Slash className="inline text-slate-200" size={16}/>}</td>
    <td className="px-6 py-5 text-center">{student ? <CheckCircle className="inline text-[#0ea5e9]" size={18}/> : <Slash className="inline text-slate-200" size={16}/>}</td>
  </tr>
);

const MobilePermissionCard = ({ label, admin, instructor, student }) => (
  <div className="p-4 space-y-3">
    <div className="text-[10px] font-black uppercase text-[#0ea5e9] tracking-widest">{label}</div>
    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
      <div className="flex flex-col items-center gap-1">
        <span className="text-[8px] font-bold text-slate-400 uppercase">Admin</span>
        {admin ? <CheckCircle className="text-[#0ea5e9]" size={16}/> : <Slash className="text-slate-200" size={14}/>}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[8px] font-bold text-slate-400 uppercase">Staff</span>
        {instructor ? <CheckCircle className="text-[#0ea5e9]" size={16}/> : <Slash className="text-slate-200" size={14}/>}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[8px] font-bold text-slate-400 uppercase">Student</span>
        {student ? <CheckCircle className="text-[#0ea5e9]" size={16}/> : <Slash className="text-slate-200" size={14}/>}
      </div>
    </div>
  </div>
);

const TemplateCard = ({ icon, title, type, defaultVal }) => (
  <div className="bg-white dark:bg-[#111827] rounded-3xl md:rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
    <div className="p-5 md:p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 bg-slate-50/30 dark:bg-slate-900/50 shrink-0">
      <div className="size-9 md:size-11 rounded-xl md:rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
        {icon}
      </div>
      <div className="overflow-hidden">
        <h3 className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] truncate">{type}</h3>
        <h4 className="text-sm md:text-base font-bold text-slate-800 dark:text-white uppercase italic truncate">{title}</h4>
      </div>
    </div>
    <div className="p-5 md:p-6 space-y-4 flex-1">
      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Message Content</label>
        <textarea 
          className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold p-3 md:p-4 resize-none dark:text-white focus:ring-1 focus:ring-[#0ea5e9] outline-none" 
          rows="3" 
          defaultValue={defaultVal}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {['{name}', '{time}'].map(tag => (
          <button key={tag} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md text-[8px] font-black text-slate-500 uppercase">{tag}</button>
        ))}
      </div>
    </div>
    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-50 dark:border-slate-800 flex justify-end gap-3 shrink-0">
      <button className="px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-white dark:bg-slate-800 border border-slate-200 rounded-lg dark:text-white">Update</button>
    </div>
  </div>
);

export default Settings;