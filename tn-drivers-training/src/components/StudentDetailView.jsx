import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Mail, Loader2, Calendar, Clock, 
  CreditCard, Award, User, ShieldCheck, 
  AlertCircle, PlusCircle, Check, DollarSign,
  MapPin, Phone, BookOpen, Hash, FileText,
  CreditCard as CardIcon, Calendar as CalendarIcon,
  UserCircle, Download, Edit, Trash2,MessageCircle  
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

export default function StudentDetailView({ studentId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [scheduleTab, setScheduleTab] = useState("attendance"); // 'attendance' or 'upcoming'

  // Payment Form State
  const [payLoading, setPayLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount_total: "",
    payment_method: "Cash",
    transaction_id: "", 
    status: "succeeded",
  });

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_BASE}/admin/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError("Student not found.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchDetails();
  }, [studentId]);

  const handlePaymentSubmit = async (e) => {
  e.preventDefault();
  setPayLoading(true);
  try {
    const token = localStorage.getItem('access_token');
    await axios.post(`${API_BASE}/payments`, {
      student_id: studentId,
      amount_total: parseFloat(formData.amount_total),
      payment_method: formData.payment_method,
      transaction_id: formData.transaction_id,
      status: "succeeded"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Reset form
    setFormData({ 
      amount_total: "", 
      payment_method: "Cash", 
      transaction_id: "", 
      status: "succeeded"
      // Removed 'notes' from reset
    });
    
    await fetchDetails();
    alert("Payment recorded successfully!");
  } catch (err) {
    alert("Error recording payment: " + (err.response?.data?.message || err.message));
  } finally {
    setPayLoading(false);
  }
};

  const handleBlockToggle = async (action) => {
    if (!confirm(`Are you sure you want to ${action} this student?`)) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const endpoint = action === 'block' ? 'block' : 'unblock';
      await axios.post(`${API_BASE}/${studentId}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchDetails();
    } catch (err) {
      alert(`Failed to ${action} student`);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-md">
      <div className="text-center">
        <Loader2 className="animate-spin text-indigo-500 mb-4 mx-auto" size={48} />
        <p className="text-white font-black uppercase tracking-widest text-[10px]">Accessing Registry...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80">
      <div className="bg-white dark:bg-gray-900 p-12 rounded-[3rem] text-center max-w-md">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <button onClick={onClose} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs">Return</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/90 backdrop-blur-xl p-4 md:p-10 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 w-full max-w-6xl min-h-[90vh] rounded-[3.5rem] shadow-2xl relative border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col my-auto">
        
        <button onClick={onClose} className="absolute top-8 right-8 z-20 bg-white/10 hover:bg-red-500 hover:text-white text-gray-400 h-12 w-12 flex items-center justify-center rounded-2xl transition-all border border-gray-100 dark:border-gray-800 shadow-xl font-bold">✕</button>

        {/* Header with Student Basic Info */}
        {/* Header with Student Basic Info */}
<div className="p-10 md:p-16 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
  <div className="flex flex-col lg:flex-row items-center gap-12">
    {/* Profile Picture */}
    <div className="h-44 w-44 rounded-[3.5rem] bg-indigo-600 flex items-center justify-center text-7xl font-black text-white italic shadow-2xl border-4 border-white dark:border-gray-800 overflow-hidden">
      {data.profile_picture ? (
        <img src={data.profile_picture} className="h-full w-full object-cover" alt="Profile" />
      ) : (
        <UserCircle size={80} />
      )}
    </div>
    
    {/* Student Info */}
    <div className="flex-1 text-center lg:text-left">
      <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-4">
        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
          data.paymentStatus === 'Paid' 
            ? 'bg-emerald-100 text-emerald-600 border-emerald-200' 
            : 'bg-amber-100 text-amber-600 border-amber-200'
        }`}>
          {data.paymentStatus}
        </span>
        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
          data.status === 'active' 
            ? 'bg-green-100 text-green-600 border-green-200'
            : data.status === 'pending'
            ? 'bg-yellow-100 text-yellow-600 border-yellow-200'
            : 'bg-red-100 text-red-600 border-red-200'
        }`}>
          {data.status}
        </span>
        <span className="px-4 py-1.5 bg-purple-100 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-200">
          Permit: {data.permit_number || 'N/A'}
        </span>
      </div>
      <h2 className="text-5xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter mb-2">{data.name}</h2>
      <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
        <span className="flex items-center gap-2">
          <Mail size={14} className="text-indigo-500"/> {data.email}
        </span>
        <span className="flex items-center gap-2">
          <Phone size={14} className="text-indigo-500"/> {data.phone || 'N/A'}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={14} className="text-indigo-500"/> {data.location || 'N/A'}
        </span>
      </div>
    </div>

    {/* Right Side - Balance Card and Status Actions */}
    <div className="flex flex-col items-stretch gap-4 min-w-[240px]">
      {/* Balance Card */}
      <div className="bg-white dark:bg-gray-950 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl text-center">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Due to Pay</p>
        <p className="text-3xl font-black text-gray-900 dark:text-white italic">CAD {data.balanceCAD}</p>
      </div>
      
      {/* Status Action Buttons - Separate from Balance Card */}
      <div className="flex flex-col gap-2">
        {data.status === 'active' ? (
          <button 
            onClick={() => handleBlockToggle('block')}
            className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <ShieldCheck size={14} />
            Block Student
          </button>
        ) : data.status === 'blocked' ? (
          <button 
            onClick={() => handleBlockToggle('unblock')}
            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <ShieldCheck size={14} />
            Unblock Student
          </button>
        ) : data.status === 'pending' ? (
          <div className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
            <Clock size={14} />
            Pending Approval
          </div>
        ) : null}
      </div>
    </div>
  </div>
</div>

        {/* Tabs Navigation */}
        <div className="flex px-16 bg-white dark:bg-gray-900 border-b border-gray-50 dark:border-gray-800 gap-10 overflow-x-auto no-scrollbar">
          {["Overview", "Attendance & Schedule", "Skill Evaluation", "Payment History"].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`py-8 whitespace-nowrap text-xs font-black uppercase tracking-widest relative transition-all ${
                activeTab === tab ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-600 rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-10 md:p-16 overflow-y-auto">
          
          {/* OVERVIEW TAB */}
          {activeTab === "Overview" && (
            <div className="space-y-10">
              {/* Student Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="col-span-1 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-lg">
                  <h4 className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-indigo-600 mb-6">
                    <User size={18}/> Personal Details
                  </h4>
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                      <p className="font-bold text-gray-900 dark:text-white">{data.name}</p>
                    </div>
                    <div className="pb-3 border-b border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                      <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Mail size={14} className="text-indigo-400"/>
                        {data.email}
                      </p>
                    </div>
                    <div className="pb-3 border-b border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                      <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Phone size={14} className="text-indigo-400"/>
                        {data.phone || 'Not provided'}
                      </p>
                    </div>
                    <div className="pb-3 border-b border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Province</p>
                      <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin size={14} className="text-indigo-400"/>
                        {data.location || data.province || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Permit Number</p>
                      <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText size={14} className="text-indigo-400"/>
                        {data.permit_number || 'Not issued'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Package & Enrollment Details */}
                <div className="col-span-1 bg-indigo-50 dark:bg-indigo-950/20 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/40 shadow-lg">
                  <h4 className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-indigo-600 mb-6">
                    <BookOpen size={18}/> Enrollment Details
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-indigo-100/50">
                      <span className="text-gray-500 font-bold text-xs uppercase">Selected Package</span>
                      <span className="font-black text-gray-900 dark:text-white text-lg">
                        {data.packageName || 'Standard Course'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-indigo-100/50">
                      <span className="text-gray-500 font-bold text-xs uppercase">Package Amount</span>
                      <span className="font-black text-indigo-600 text-xl">
                        CAD {data.totalPackageAmount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-indigo-100/50">
                      <span className="text-gray-500 font-bold text-xs uppercase">Total Paid</span>
                      <span className="font-black text-emerald-600 text-xl">
                        CAD {data.totalPaid}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-bold text-xs uppercase">Training Hours</span>
                      <span className="font-black text-gray-900 dark:text-white">
                        {data.hoursLogged} / {data.totalHours} Hours
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instructor Details */}
                <div className="col-span-1 bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <User size={120}/>
                  </div>
                  <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-6">
                    <Award size={18}/> Assigned Instructor
                  </h4>
                  
                  {data.instructor && data.instructor !== 'Unassigned' ? (
                    <div className="space-y-4 relative z-10">
                      <div>
                        <p className="text-2xl font-black italic uppercase tracking-tighter mb-1">
                          {data.instructor}
                        </p>
                        <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                          Lead Instructor
                        </p>
                      </div>
                      
                      {data.instructorEmail && (
                        <div className="flex items-center gap-3 text-sm">
                          <Mail size={16} className="text-indigo-400"/>
                          <span className="opacity-90">{data.instructorEmail}</span>
                        </div>
                      )}
                      
                      {data.instructorPhone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone size={16} className="text-indigo-400"/>
                          <span className="opacity-90">{data.instructorPhone}</span>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-indigo-800/50">
                        <p className="text-[9px] font-black uppercase tracking-wider text-indigo-400 mb-1">
                          Specialization
                        </p>
                        <p className="text-sm font-bold">Class 5 & 7 Instruction</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-2xl font-black italic opacity-50 mb-2">Unassigned</p>
                      <p className="text-xs text-indigo-300">No instructor assigned yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ATTENDANCE & SCHEDULE TAB */}
          {activeTab === "Attendance & Schedule" && (
            <div className="space-y-8">
              {/* Sub-tabs for Attendance/Upcoming */}
              <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
                <button
                  onClick={() => setScheduleTab('attendance')}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    scheduleTab === 'attendance'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <Clock size={16} className="inline mr-2" />
                  Attendance History
                </button>
                <button
                  onClick={() => setScheduleTab('upcoming')}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    scheduleTab === 'upcoming'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <Calendar size={16} className="inline mr-2" />
                  Upcoming Schedule
                </button>
              </div>

              {/* Attendance History */}
              {scheduleTab === 'attendance' && (
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                    Complete Attendance Log ({data.attendance?.length || 0} sessions)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.attendance?.length > 0 ? (
                      data.attendance.map((log, i) => (
                        <div key={i} className="p-6 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 flex justify-between items-center group hover:shadow-lg transition">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${
                              log.status === 'present' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-amber-100 text-amber-600'
                            }`}>
                              <Clock size={20}/>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white uppercase text-sm">
                                {log.session || 'Driving Session'}
                              </p>
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                                {log.date}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-xl border ${
                            log.status === 'present' 
                              ? 'bg-green-100 text-green-600 border-green-200' 
                              : log.status === 'absent'
                              ? 'bg-rose-100 text-rose-600 border-rose-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-16 bg-gray-50 dark:bg-gray-800/20 rounded-[2.5rem]">
                        <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 font-bold">No attendance records found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upcoming Schedule */}
              {scheduleTab === 'upcoming' && (
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                    Upcoming Sessions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.upcomingSchedules?.length > 0 ? (
                      data.upcomingSchedules.map((schedule, i) => (
                        <div key={i} className="p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-900 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                              <CalendarIcon size={20}/>
                            </div>
                            <div>
                              <p className="font-black text-gray-900 dark:text-white uppercase text-sm">
                                {schedule.sessionType || 'Driving Lesson'}
                              </p>
                              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">
                                {schedule.date} • {schedule.time}
                              </p>
                            </div>
                          </div>
                          <span className="text-[9px] font-black uppercase px-4 py-1.5 bg-indigo-100 text-indigo-600 rounded-xl border border-indigo-200">
                            {schedule.duration || '2 hours'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-16 bg-gray-50 dark:bg-gray-800/20 rounded-[2.5rem]">
                        <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 font-bold">No upcoming sessions scheduled</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SKILL EVALUATION TAB (unchanged from your original) */}
          {activeTab === "Skill Evaluation" && (
  <div className="space-y-8">
    {/* Header with stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-[2rem] text-white shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Total Evaluations</p>
        <p className="text-4xl font-black">{data.evaluations?.length || 0}</p>
      </div>
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[2rem] text-white shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Average Score</p>
        <p className="text-4xl font-black">
          {data.evaluations?.length > 0 
            ? Math.round(data.evaluations.reduce((acc, curr) => acc + curr.score, 0) / data.evaluations.length) 
            : 0}%
        </p>
      </div>
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-[2rem] text-white shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Tests Completed</p>
        <p className="text-4xl font-black">{data.evaluations?.length || 0}</p>
      </div>
    </div>

    {/* Evaluations List */}
    <div className="space-y-6">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <Award size={18} className="text-indigo-500"/>
        Skill Assessment Records
      </h3>
      
      {data.evaluations?.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {data.evaluations.map((item, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden hover:shadow-xl transition-all">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">#{i + 1}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-wider">
                          {item.category || 'Driving Test'}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12}/>
                          {item.date || 'N/A'}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        {item.test_type || 'Practical Evaluation'}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</p>
                      <div className="flex items-center gap-2">
                        <span className="text-4xl font-black text-indigo-600">{item.score}</span>
                        <span className="text-sm text-gray-400">/100</span>
                      </div>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center">
                      <span className="text-2xl font-black text-white">{item.score}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pt-4">
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>

              {/* Instructor Remarks & Student Reply */}
              <div className="p-6 space-y-4">
                {/* Instructor Remark */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border-l-4 border-indigo-500">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-indigo-600"/>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">Instructor Remark</span>
                        <span className="text-[9px] text-gray-400">{item.remark_date || 'N/A'}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        "{item.note || 'No remarks provided'}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Student Reply (if exists) */}
                {item.student_reply ? (
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-5 border-l-4 border-blue-500 ml-8">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-blue-600"/>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Student Reply</span>
                          <span className="text-[9px] text-gray-400">{item.reply_date || 'N/A'}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          "{item.student_reply}"
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* If no reply yet, show placeholder */
                  <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-xl p-5 border border-dashed border-gray-300 dark:border-gray-700 ml-8">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <MessageCircle size={16} className="text-gray-500"/>
                      </div>
                      <p className="text-xs text-gray-500 italic">No reply from student yet</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with view-only indicator */}
              <div className="bg-gray-50/50 dark:bg-gray-800/20 px-6 py-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-end text-[9px] text-gray-400 uppercase tracking-wider">
                  <ShieldCheck size={12} className="mr-1" />
                  Admin View Only • No Editing Allowed
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
          <Award size={60} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 font-bold text-lg mb-2">No Evaluations Found</p>
          <p className="text-gray-400 text-sm">Skill assessments will appear here once completed</p>
        </div>
      )}
    </div>
  </div>
)}

          {/* PAYMENT HISTORY TAB */}
          {activeTab === "Payment History" && (
            <div className="space-y-10">
              {/* Payment Form */}
              <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-900 p-10 rounded-[3rem] border-2 border-dashed border-indigo-200 dark:border-indigo-900/40">
                <h4 className="text-xs font-black uppercase tracking-widest mb-8 text-indigo-600 flex items-center gap-3">
                  <PlusCircle size={20}/> Record New Payment
                </h4>
                <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Amount" 
                      className="w-full bg-white dark:bg-gray-900 pl-12 pr-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm font-bold outline-none focus:border-indigo-300" 
                      value={formData.amount_total} 
                      onChange={e => setFormData({...formData, amount_total: e.target.value})} 
                      required 
                    />
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Transaction ID" 
                      className="w-full bg-white dark:bg-gray-900 pl-12 pr-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm font-bold outline-none focus:border-indigo-300"
                      value={formData.transaction_id} 
                      onChange={e => setFormData({...formData, transaction_id: e.target.value})} 
                    />
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                  </div>
                  
                  <select 
                    className="bg-white dark:bg-gray-900 px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm font-bold outline-none focus:border-indigo-300"
                    value={formData.payment_method} 
                    onChange={e => setFormData({...formData, payment_method: e.target.value})}
                  >
                    <option value="Cash">Cash</option>
                    <option value="E-Transfer">E-Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                  
                  <button 
                    type="submit" 
                    disabled={payLoading} 
                    className="bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl py-4 flex justify-center items-center hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {payLoading ? <Loader2 className="animate-spin" size={16} /> : "Record Payment"}
                  </button>
                </form>
                

              </div>

              {/* Payment History Table */}
              <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                        <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {data.payments?.length > 0 ? (
                        data.payments.map((p, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                            <td className="p-6 font-bold text-sm">{p.date}</td>
                            <td className="p-6 font-black text-indigo-600 text-lg">CAD {p.amount}</td>
                            <td className="p-6 font-bold text-gray-600 dark:text-gray-400 text-xs uppercase">
                              {p.method || 'N/A'}
                            </td>
                            <td className="p-6 font-mono text-xs text-gray-500">
                              {p.transaction_id || '—'}
                            </td>
                            <td className="p-6">
                              <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase ${
                                p.status === 'succeeded' 
                                  ? 'bg-green-50 text-green-600 border border-green-200' 
                                  : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-12 text-center text-gray-500">
                            <CreditCard size={40} className="mx-auto mb-4 text-gray-400" />
                            No payment records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}