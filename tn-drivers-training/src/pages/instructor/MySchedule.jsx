import React, { useState } from 'react';

import { UserPlus, Trash2, MapPin, Calendar, Filter, CheckCircle, Clock } from "lucide-react";

const InstructorSchedule = () => {
  const adminAssignment = {
    startDate: "2026-03-01",
    endDate: "2026-03-07",
    task: "Parallel Parking & Reverse Gear",
    message: "Focus on curb distance and mirror alignment for all learners this week."
  };

  const burinAreas = ["All Areas", "Burin Bay Arm", "Burin Heritage", "Salt Pond", "Epworth"];

  // FULL STUDENT OBJECTS - Crucial for the Detail Modal to work
  const studentPool = [
    { id: 'STU-101', name: "Alex Rivera", area: "Burin Heritage", pickup: "Heritage Museum", email: "alex@drive.com", progress: 65 },
    { id: 'STU-102', name: "Sam Chen", area: "Salt Pond", pickup: "Main Gate", email: "sam@drive.com", progress: 30 },
    { id: 'STU-103', name: "Yuki Tanaka", area: "Epworth", pickup: "Community Well", email: "yuki@drive.com", progress: 100 },
    { id: 'STU-104', name: "Muhammed Salman", area: "Salt Pond", pickup: "Residence Lot 4", email: "salman@tech.com", progress: 40 },
  ];

  const [scheduledStudents, setScheduledStudents] = useState([]);
  const [filterArea, setFilterArea] = useState("All Areas");
  const [formData, setFormData] = useState({ studentId: "", time: "", date: "" });

  const handleAddSchedule = (e) => {
    e.preventDefault();
    const student = studentPool.find(s => s.id === formData.studentId);
    if (!student) return;
    
    const newEntry = {
      id: Date.now(),
      ...student, // This passes name, area, pickup, email, AND progress
      time: formData.time,
      date: formData.date,
      status: "Scheduled"
    };

    setScheduledStudents([newEntry, ...scheduledStudents]);
    setFormData({ ...formData, studentId: "" }); 
  };

  const toggleStatus = (id) => {
    setScheduledStudents(prev => prev.map(s => 
      s.id === id ? { ...s, status: s.status === "Completed" ? "Scheduled" : "Completed" } : s
    ));
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-gray-950 min-h-screen font-['Lexend']">
      
      <main className="p-4 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Admin Instruction Banner */}
        <section className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
           <div className="relative z-10 space-y-2">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">{adminAssignment.task}</h2>
              <p className="opacity-80 text-sm italic">"{adminAssignment.message}"</p>
           </div>
           <div className="relative z-10 bg-white/10 p-4 rounded-2xl border border-white/10 text-center min-w-[140px]">
              <p className="text-[10px] font-black uppercase opacity-60">Cycle Ends</p>
              <p className="font-bold">{adminAssignment.endDate}</p>
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Planner Form */}
          <section className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
              <h3 className="text-lg font-black uppercase mb-6 dark:text-white flex items-center gap-2"><Filter size={18} className="text-indigo-600"/> Assign Slot</h3>
              <form onSubmit={handleAddSchedule} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">1. Filter Area</label>
                  <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs dark:text-white outline-none">
                    {burinAreas.map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">2. Select Student</label>
                  <select required value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm dark:text-white outline-none">
                    <option value="">Choose a student...</option>
                    {studentPool.filter(s => filterArea === "All Areas" || s.area === filterArea).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs dark:text-white" />
                  <input required type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs dark:text-white" />
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all">Assign to Week</button>
              </form>
            </div>
          </section>

          {/* Roster View */}
          <section className="lg:col-span-2 space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Weekly Roster</h3>
            <div className="grid gap-3">
              {scheduledStudents.map(s => (
                <div key={s.id} className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between ${s.status === 'Completed' ? 'opacity-60 bg-slate-50 dark:bg-slate-900' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                  <div className="flex items-center gap-6">
                    <div className={`size-14 rounded-2xl flex items-center justify-center ${s.status === 'Completed' ? 'bg-teal-500 text-white' : 'bg-indigo-50 dark:bg-slate-800 text-indigo-600'}`}>
                      {s.status === 'Completed' ? <CheckCircle size={28}/> : <Clock size={28}/>}
                    </div>
                    <div>
                      <h4 className={`text-lg font-black uppercase tracking-tight dark:text-white ${s.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>{s.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.date} • {s.time} • {s.pickup} ({s.area})</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleStatus(s.id)} className={`p-3 rounded-xl ${s.status === 'Completed' ? 'bg-teal-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-300'}`}><CheckCircle size={20} /></button>
                    <button onClick={() => setScheduledStudents(scheduledStudents.filter(item => item.id !== s.id))} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20}/></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default InstructorSchedule;