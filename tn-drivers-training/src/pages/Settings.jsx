import React, { useState } from 'react';
import { 
  MapPin, ShieldCheck, Mail, MessageSquare, 
  Plus, X, Save, Eye, Smartphone, CheckCircle, 
  Slash, ChevronRight, Bell
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
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
      
      {/* 1. HEADER */}
      <header className="h-16 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400 font-medium">Settings</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-800 dark:text-white font-bold uppercase text-[10px] tracking-widest">System Configuration</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
          <button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all active:scale-95">
            <Save size={16} /> Save All Changes
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">System <span className="text-[#0ea5e9]">Rules</span></h2>
            <p className="text-slate-500 font-medium">Manage priority regions, access controls, and automated messaging.</p>
          </div>

          {/* 2. PRIORITY AREA CONFIGURATOR */}
          <section className="bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="size-11 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center border border-orange-100 dark:border-orange-900/30">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">Priority Area Configurator</h3>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Canadian Postal Code Prefixes</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-slate-500 font-medium">Any registration from these prefixes will be tagged as <span className="text-orange-600 font-bold">"High Priority"</span> for immediate follow-up.</p>
              <div className="flex flex-wrap gap-2.5 min-h-[110px] p-5 bg-slate-50 dark:bg-[#0f172a] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                {postalCodes.map((code) => (
                  <div key={code} className="flex items-center gap-2 bg-[#0ea5e9]/5 text-[#0ea5e9] px-3.5 py-1.5 rounded-xl text-sm font-black border border-[#0ea5e9]/20 group transition-all">
                    {code}
                    <button onClick={() => removeCode(code)} className="hover:text-rose-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <input 
                  className="bg-transparent border-none focus:ring-0 text-sm flex-1 min-w-[200px] dark:text-white placeholder:text-slate-400 font-bold" 
                  placeholder="Type prefix (e.g. A1B)..." 
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPostalCode()}
                />
              </div>
            </div>
          </section>

          {/* 3. PERMISSIONS MANAGEMENT */}
          <section className="bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">Permissions Matrix</h3>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Role-Based Access Control</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-[#0f172a] text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">
                    <th className="px-8 py-5">System Capability</th>
                    <th className="px-6 py-5 text-center">Admin</th>
                    <th className="px-6 py-5 text-center">Instructor</th>
                    <th className="px-6 py-5 text-center">Student</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  <PermissionRow label="Full View / Edit" admin instructor={false} student={false} />
                  <PermissionRow label="Manage Assigned Students" admin instructor student={false} />
                  <PermissionRow label="Mark Attendance & Receipts" admin instructor student={false} />
                  <PermissionRow label="Book Lessons & Progress" admin instructor student />
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. TEMPLATES CONFIGURATION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TemplateCard 
              icon={<Mail className="text-blue-600" />} 
              title="Automated Welcome" 
              type="Email Template"
              defaultVal="Hi {student_name}, welcome to DriveSmart! Your first lesson is with {instructor_name}."
            />
            <TemplateCard 
              icon={<Smartphone className="text-purple-600" />} 
              title="Lesson Reminder" 
              type="SMS Notification"
              defaultVal="Reminder: Hi {student_name}, you have a lesson tomorrow at {lesson_time} with {instructor_name}."
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Helper Components ---

const PermissionRow = ({ label, admin, instructor, student }) => (
  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
    <td className="px-8 py-5">
      <div className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">{label}</div>
    </td>
    <td className="px-6 py-5 text-center">{admin ? <CheckCircle className="inline text-[#0ea5e9]" size={20}/> : <Slash className="inline text-slate-200" size={18}/>}</td>
    <td className="px-6 py-5 text-center">{instructor ? <CheckCircle className="inline text-[#0ea5e9]" size={20}/> : <Slash className="inline text-slate-200" size={18}/>}</td>
    <td className="px-6 py-5 text-center">{student ? <CheckCircle className="inline text-[#0ea5e9]" size={20}/> : <Slash className="inline text-slate-200" size={18}/>}</td>
  </tr>
);

const TemplateCard = ({ icon, title, type, defaultVal }) => (
  <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-transform hover:shadow-md">
    <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 bg-slate-50/30 dark:bg-slate-900/50">
      <div className="size-11 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
        {icon}
      </div>
      <div>
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-0.5">{type}</h3>
        <h4 className="text-base font-bold text-slate-800 dark:text-white uppercase italic">{title}</h4>
      </div>
    </div>
    <div className="p-6 space-y-5 flex-1">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Content</label>
        <textarea 
          className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold p-4 resize-none dark:text-white focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none" 
          rows="4" 
          defaultValue={defaultVal}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {['{student_name}', '{instructor_name}', '{lesson_time}'].map(tag => (
          <button key={tag} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-500 uppercase hover:border-[#0ea5e9] transition-all">{tag}</button>
        ))}
      </div>
    </div>
    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-50 dark:border-slate-800 flex justify-end gap-3">
      <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Preview</button>
      <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-sm dark:text-white">Update</button>
    </div>
  </div>
);

export default Settings;

