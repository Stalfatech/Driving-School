import React, { useState } from "react";

export default function StudentDetailView({ student, onClose }) {
  if (!student) return null;
  const [activeTab, setActiveTab] = useState("Overview");

  const formatCAD = (amount) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount);

  // --- CONTENT RENDERING LOGIC ---
  const renderTabContent = () => {
    switch (activeTab) {
      case "Schedule":
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Upcoming Sessions</h3>
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex flex-col items-center justify-center font-bold">
                    <span className="text-[10px] uppercase">Feb</span>
                    <span className="text-lg leading-none">{20 + i}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">In-Car Lesson #{i + 4}</p>
                    <p className="text-xs text-gray-500">2:00 PM - 4:00 PM • Pick up at Home</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-bold text-gray-400 uppercase">Confirmed</span>
              </div>
            ))}
          </div>
        );

      case "Payment History":
        return (
          <div className="overflow-hidden rounded-4xl border border-gray-100 dark:border-gray-800 animate-in fade-in duration-500">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Method</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr>
                  <td className="px-6 py-4 text-xs font-bold dark:text-gray-300">2026-02-15</td>
                  <td className="px-6 py-4 text-xs text-gray-500">Interac e-Transfer</td>
                  <td className="px-6 py-4 text-xs font-bold text-indigo-600">{formatCAD(150)}</td>
                  <td className="px-6 py-4 text-right"><span className="text-[9px] font-black text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md uppercase">Cleared</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      default: // Overview
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <section className="p-8 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100/50 dark:border-indigo-900/30">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">GDL Tracking</h3>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">Training Progress</p>
                </div>
                <span className="text-sm font-black text-indigo-600">{student.hoursLogged} / 12 Hours</span>
              </div>
              <div className="w-full bg-white dark:bg-gray-800 h-4 rounded-full overflow-hidden p-1 shadow-inner">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${student.progress}%` }}></div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-4">
                Skill Evaluation <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {["Lane Discipline", "Parallel Parking", "Mirror Checks", "Highway Merging"].map((skill, i) => (
                  <div key={skill} className="bg-white dark:bg-gray-800/50 p-5 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between mb-3 text-[13px] font-bold text-gray-700 dark:text-gray-300">
                      <span>{skill}</span>
                      <span className="text-indigo-500">{5 - (i % 2)}/5</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <div key={dot} className={`h-1.5 flex-1 rounded-full ${dot <= (5 - (i % 2)) ? 'bg-indigo-500' : 'bg-gray-100 dark:bg-gray-700'}`}></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center bg-gray-950/80 backdrop-blur-sm p-0 md:p-6 overflow-y-auto custom-scrollbar">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl my-auto rounded-none md:rounded-[2.5rem] shadow-2xl relative border border-gray-100 dark:border-gray-800 overflow-hidden">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-110 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 h-10 w-10 flex items-center justify-center rounded-xl transition-all border border-gray-100 dark:border-gray-700 shadow-sm">
          ✕
        </button>

        {/* --- HEADER --- */}
        <div className="p-8 md:p-12 bg-gray-50/30 dark:bg-gray-800/10 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-8">
              <div className="h-32 w-32 rounded-4xl bg-indigo-600 text-white flex items-center justify-center text-4xl font-bold shadow-xl ring-4 ring-white dark:ring-gray-800">
                {student.name.charAt(0)}
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg text-[10px] font-bold uppercase">{student.licenseClass}</span>
                  <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg text-[10px] font-bold uppercase">{student.paymentStatus}</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white tracking-tight">{student.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">📍 {student.location} • ID: {student.id}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-center lg:text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Balance Due</p>
              <p className="text-2xl font-black text-gray-800 dark:text-white">{formatCAD(student.balanceCAD)}</p>
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="flex px-8 md:px-12 border-b border-gray-100 dark:border-gray-800 gap-8 overflow-x-auto">
          {["Overview", "Schedule", "Payment History"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-6 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                activeTab === tab ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
            </button>
          ))}
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {renderTabContent()}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900 dark:bg-indigo-600 rounded-[3rem] p-10 text-center text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mb-8">GDL Countdown</h4>
                 <div className="text-6xl font-black mb-2">{student.gdlEligibilityMonths}</div>
                 <p className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-8">Months until Class 5</p>
                 <div className="py-3 px-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 inline-block">
                    <span className="text-[11px] font-bold uppercase tracking-widest">
                      {student.gdlEligibilityMonths === 0 ? "Eligible for Road Test" : "In Probationary Period"}
                    </span>
                 </div>
               </div>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Instructor</h4>
               <p className="font-bold text-gray-800 dark:text-white">{student.instructor}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}