import React, { useState } from "react";
import { Mail, CheckCircle, XCircle, Award } from "lucide-react";

export default function StudentDetailView({ student, onClose }) {
  if (!student) return null;
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditing, setIsEditing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  // Local state to simulate real-time updates
  const [localStudent, setLocalStudent] = useState(student);

  const formatCAD = (amount) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount);

  // --- EMAIL REMINDER LOGIC ---
  const sendReminderEmail = () => {
    const subject = encodeURIComponent(`Payment Reminder: ${localStudent.name} - Driving Academy`);
    const body = encodeURIComponent(
      `Hi ${localStudent.name},\n\n` +
      `This is a friendly reminder regarding your outstanding balance of ${formatCAD(localStudent.balanceCAD)}.\n\n` +
      `Current Status: ${localStudent.paymentStatus}\n` +
      `Remaining Balance: ${formatCAD(localStudent.balanceCAD)}\n\n` +
      `Please arrange for payment at your earliest convenience to avoid any session disruptions.\n\n` +
      `Best regards,\n` +
      `Driving Academy Admin`
    );
    window.location.href = `mailto:${localStudent.email}?subject=${subject}&body=${body}`;
  };

  const handleManualPayment = () => {
    const paid = parseFloat(paymentAmount);
    if (isNaN(paid) || paid <= 0) return alert("Please enter a valid amount");

    const newBalance = Math.max(0, localStudent.balanceCAD - paid);
    setLocalStudent({
      ...localStudent,
      balanceCAD: newBalance,
      paymentStatus: newBalance === 0 ? "Paid" : "Balance Due"
    });
    setIsEditing(false);
    setPaymentAmount("");
    alert("Physical payment recorded successfully!");
  };

  const attendanceLogs = [
    { date: "2026-02-10", session: "In-Car #1", status: "Present" },
    { date: "2026-02-12", session: "In-Car #2", status: "Present" },
    { date: "2026-02-15", session: "In-Car #3", status: "Present" },
    { date: "2026-02-18", session: "Observation", status: "Absent" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Schedule":
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Upcoming Sessions</h3>
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex flex-col items-center justify-center font-bold">
                    <span className="text-[10px] uppercase font-black tracking-tighter">Feb</span>
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
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-4xl">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Admin: Record Cash Payment</h4>
              </div>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20">
                  Edit / Record Cash Received
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="number" placeholder="Enter amount in CAD" className="flex-1 px-5 py-3 rounded-xl border border-amber-200 outline-none text-sm bg-white dark:bg-gray-900" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={handleManualPayment} className="px-6 py-3 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase">Apply</button>
                    <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase">Cancel</button>
                  </div>
                </div>
              )}
            </div>
            {/* Payment Table remains as per previous version */}
          </div>
        );

      default: // Overview
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* PROGRESS BAR */}
            <section className="p-8 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100/50 dark:border-indigo-900/30">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">GDL Tracking</h3>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">Training Progress</p>
                </div>
                <span className="text-sm font-black text-indigo-600">{localStudent.hoursLogged} / 12 Hours</span>
              </div>
              <div className="w-full bg-white dark:bg-gray-800 h-4 rounded-full overflow-hidden p-1 shadow-inner">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${localStudent.progress}%` }}></div>
              </div>
            </section>

            {/* ATTENDANCE */}
            <section className="p-8 bg-white dark:bg-gray-800/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Attendance Registry</h3>
              <div className="space-y-3">
                {attendanceLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="text-[10px] font-black text-gray-400 w-20">{log.date}</div>
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{log.session}</div>
                    </div>
                    <div className={`text-[9px] font-black uppercase px-2 py-1 rounded ${log.status === 'Present' ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                      {log.status === 'Present' ? <CheckCircle size={10} className="inline mr-1"/> : <XCircle size={10} className="inline mr-1"/>} {log.status}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SKILL EVALUATION (RESTORED) */}
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-gray-950/80 backdrop-blur-sm p-0 md:p-6 overflow-y-auto custom-scrollbar">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl my-auto rounded-none md:rounded-[2.5rem] shadow-2xl relative border border-gray-100 dark:border-gray-800 overflow-hidden">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-110 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 h-10 w-10 flex items-center justify-center rounded-xl transition-all border border-gray-100 dark:border-gray-700 shadow-sm">✕</button>

        <div className="p-8 md:p-12 bg-gray-50/30 dark:bg-gray-800/10 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-8">
              <div className="h-32 w-32 rounded-4xl bg-indigo-600 text-white flex items-center justify-center text-4xl font-bold shadow-xl">
                {localStudent.name.charAt(0)}
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{localStudent.licenseClass}</span>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${localStudent.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{localStudent.paymentStatus}</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white tracking-tight">{localStudent.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">📧 {localStudent.email}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl border border-gray-100 text-center lg:text-left shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Balance Due</p>
              <p className="text-2xl font-black text-gray-800 dark:text-white">{formatCAD(localStudent.balanceCAD)}</p>
            </div>
          </div>
        </div>

        <div className="flex px-8 md:px-12 border-b border-gray-100 gap-8">
          {["Overview", "Schedule", "Payment History"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-6 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab ? "text-indigo-600" : "text-gray-400"}`}>
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
            </button>
          ))}
        </div>

        <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">{renderTabContent()}</div>
          <div className="space-y-6">
            {localStudent.balanceCAD > 0 && (
              <button onClick={sendReminderEmail} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-4xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                <Mail size={16} /> Send Email Reminder
              </button>
            )}
            <div className="bg-gray-900 dark:bg-indigo-600 rounded-[3rem] p-10 text-center text-white shadow-2xl relative">
              <h4 className="text-[10px] font-bold uppercase opacity-60 mb-8">GDL Countdown</h4>
              <div className="text-6xl font-black mb-2">{localStudent.gdlEligibilityMonths}</div>
              <p className="text-[10px] uppercase font-bold opacity-80 mb-8">Months until Class 5</p>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100">
               <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4">Instructor</h4>
               <p className="font-bold text-gray-800 dark:text-white">{localStudent.instructor}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}