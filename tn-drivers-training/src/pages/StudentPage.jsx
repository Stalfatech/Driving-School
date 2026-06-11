
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import StudentDetailView from "../components/StudentDetailView";
import { 
  Search, ScanEye, MapPin, Mail, AlertCircle, 
  User, Loader2, X, BellRing, CheckCircle, AlertTriangle
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

const StudentPage = () => {
  // 1. STATE MANAGEMENT
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [remindingId, setRemindingId] = useState(null); 
  
  // Custom Alerts & Dialogs (Replaces browser alert/confirm)
  const [toast, setToast] = useState({ type: '', message: '' });
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Filter & Pagination State
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;
  
  // Meta Data
  const [availableLocations, setAvailableLocations] = useState([]);
  const [viewStudent, setViewStudent] = useState(null);

  // Filter options
  const paymentStatuses = ["Paid", "Deposit Paid", "Awaiting Payment", "Due"];
  const systemStatuses = ["Active", "Awaiting Payment", "Blocked"]; 

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  // 2. FETCH LOCATIONS
  const fetchMetaData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_BASE}/students/onboarding-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableLocations(res.data.locations || []);
    } catch (err) {
      console.error("Meta fetch failed. Verify Admin login.", err);
    }
  };

  // 3. MAIN STUDENT FETCH
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const params = { page: page, per_page: limit };
      if (query) params.search = query;
      if (locationFilter) params.location = locationFilter;
      if (statusFilter) params.status = statusFilter.toLowerCase().replace(" ", "_");
      
      const res = await axios.get(`${API_BASE}/admin/students/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params: params
      });

      if (res.data.success) {
        const transformedStudents = res.data.data.map(s => {
          let readableStatus = 'Blocked';
          if (s.user?.status === 'active') readableStatus = 'Active';
          if (s.user?.status === 'awaiting_payment') readableStatus = 'Awaiting Payment';

          return {
            id: s.id,
            name: s.user?.name || 'Unknown',
            email: s.user?.email || 'N/A',
            phone: s.user?.phone || 'N/A',
            location: s.province_name_text || 'N/A',
            status: readableStatus, 
            paymentStatus: s.paymentStatus || 'Due',
            balanceCAD: s.balanceCAD || 0,
            licenseClass: s.license_class || 'Class 5',
            province: s.province_name_text,
            packageName: s.package?.package_name || 'Not Assigned',
            instructor: s.instructor?.user?.name || 'Unassigned',
            totalPackageAmount: s.totalPackageAmount || 0,
            totalPaid: s.totalPaid || 0
          };
        });
        
        let filtered = transformedStudents;
        if (paymentFilter) {
          filtered = filtered.filter(s => s.paymentStatus === paymentFilter);
        }
        
        setStudents(filtered);
        setTotal(res.data.meta.total);
      }
    } catch (err) {
      console.error("Student list fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [page, query, locationFilter, statusFilter, paymentFilter, limit]);

  useEffect(() => { fetchMetaData(); }, []);
  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleSearch = (val) => {
    setQuery(val);
    setPage(1);
  };

  const clearAllFilters = () => {
    setQuery("");
    setLocationFilter("");
    setPaymentFilter("");
    setStatusFilter("");
    setPage(1);
  };

  // 4. SEND REMINDER LOGIC (Updated with Custom Warning Dialog)
  const executeSendReminder = async (student) => {
    setConfirmDialog(null); // Close the dialog
    setRemindingId(student.id); // Start spinner
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(`${API_BASE}/students/${student.id}/remind-payment`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        showToast('success', 'Payment reminder sent successfully!');
      }
    } catch (err) {
      console.error("Reminder failed:", err);
      showToast('error', err.response?.data?.message || 'Failed to send reminder.');
    } finally {
      setRemindingId(null); // Stop spinner
    }
  };

  const handleSendReminderClick = (student) => {
    // Open the Custom Warning Dialog instead of browser confirm()
    setConfirmDialog({
      title: "Send Payment Reminder",
      message: `Are you sure you want to send a payment reminder to ${student.name} for $${getBalance(student.balanceCAD).toFixed(2)}?`,
      type: "warning", // This triggers the Amber/Warning styling
      actionText: "Send Reminder",
      onConfirm: () => executeSendReminder(student)
    });
  };

  // Helper to parse balance
  const getBalance = (balanceStr) => {
    return typeof balanceStr === 'string' 
      ? parseFloat(balanceStr.replace(/,/g, '')) 
      : Number(balanceStr);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors w-full relative">
      
      {/* IN-APP TOAST NOTIFICATION */}
      {toast.message && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold text-white transition-all animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-teal-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {toast.message}
        </div>
      )}

      {/* CUSTOM CONFIRM DIALOG (Warning Style) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold flex items-center gap-2 text-amber-600">
              <AlertCircle size={20} /> {confirmDialog.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">{confirmDialog.message}</p>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setConfirmDialog(null)} 
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDialog.onConfirm} 
                className="flex-1 py-2.5 text-white rounded-lg text-sm font-bold shadow-md bg-amber-500 hover:bg-amber-600 transition-colors"
              >
                {confirmDialog.actionText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-6">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
                Student <span className="text-teal-600 dark:text-teal-400">Management</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                Managing <span className="text-teal-600 font-bold">{total}</span> student records
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2 sm:gap-3 flex-1">
              
              <select 
                value={locationFilter} 
                onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
              >
                <option value="">All Regions</option>
                {availableLocations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.province_name}</option>
                ))}
              </select>

              <select 
                value={paymentFilter} 
                onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
              >
                <option value="">All Payments</option>
                {paymentStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
              >
                <option value="">All Status</option>
                {systemStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Search Bar With Clear Button */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Name or Email..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md text-slate-500 transition-colors"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 overflow-x-hidden">
        <div className="max-w-[1920px] mx-auto">
          
          {/* MOBILE VIEW (Cards) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin text-teal-500 mx-auto" size={32} />
                <p className="text-sm text-slate-500 mt-2">Loading students...</p>
              </div>
            ) : students.map((student) => {
              const balance = getBalance(student.balanceCAD);
              
              return (
              <div key={student.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                {student.status === 'Blocked' && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />}
                {student.status === 'Awaiting Payment' && <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />}
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                      {student.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">{student.name}</h3>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">ID: #{student.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                    student.status === 'Blocked' ? 'bg-red-100 text-red-700' : 
                    student.status === 'Awaiting Payment' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {student.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Mail size={16} className="text-teal-500 shrink-0" /> 
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin size={16} className="text-teal-500 shrink-0" /> 
                    <span>{student.location}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewStudent(student)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <ScanEye size={18} /> View
                  </button>

                  {balance > 0 && (
                    <button 
                      onClick={() => handleSendReminderClick(student)}
                      disabled={remindingId === student.id}
                      className="py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 rounded-xl text-sm font-bold transition-all flex items-center justify-center disabled:opacity-50"
                      title="Send Payment Reminder"
                    >
                      {remindingId === student.id ? <Loader2 size={18} className="animate-spin" /> : <BellRing size={18} />}
                    </button>
                  )}
                </div>
              </div>
            )})}
          </div>

          {/* DESKTOP VIEW (Table) */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Student Details</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Location & Class</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Payment</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">System Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <Loader2 className="animate-spin text-teal-500 mx-auto" size={32} />
                        <p className="text-sm text-slate-500 mt-2">Loading students...</p>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No students found</td>
                    </tr>
                  ) : (
                    students.map((student) => {
                      const balanceAmount = getBalance(student.balanceCAD);
                      
                      return (
                      <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                              student.status === 'Blocked' ? 'bg-slate-400' : 
                              student.status === 'Awaiting Payment' ? 'bg-amber-500' :
                              'bg-teal-500'
                            }`}>
                              {student.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="text-base font-bold text-slate-800 dark:text-white">{student.name}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <MapPin size={14} className="text-teal-500" /> {student.location}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">{student.licenseClass}</div>
                        </td>
                        <td className="px-6 py-5">
                          {student.paymentStatus === 'Paid' ? (
                            <span className="inline-flex px-3 py-1 rounded-full w-24 text-[10px] justify-center font-bold uppercase tracking-widest bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Paid
                            </span>
                          ) : student.paymentStatus === 'Deposit Paid' ? (
                            <span className="inline-flex px-3 py-1 rounded-full w-24 text-[10px] justify-center font-bold uppercase tracking-widest bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              Deposit Paid
                            </span>
                          ) : (
                            <>
                              <span className="inline-flex px-3 py-1 rounded-full w-24 text-[10px] justify-center font-bold uppercase tracking-widest bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                {student.paymentStatus}
                              </span>
                              {balanceAmount > 0 && (
                                <div className="text-xs font-bold text-amber-600 mt-1.5 ml-1">
                                  ${balanceAmount.toFixed(2)} due
                                </div>
                              )}
                            </>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] w-36 justify-center font-bold uppercase tracking-widest ${
                            student.status === 'Blocked' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                              : student.status === 'Awaiting Payment'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              student.status === 'Blocked' ? 'bg-red-500' : 
                              student.status === 'Awaiting Payment' ? 'bg-amber-500 animate-pulse' :
                              'bg-teal-500 animate-pulse'
                            }`} />
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            
                            {/* NEW: Payment Reminder Button */}
                            {balanceAmount > 0 && (
                              <button 
                                onClick={() => handleSendReminderClick(student)}
                                disabled={remindingId === student.id}
                                className="p-2.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all disabled:opacity-50"
                                title={`Send Reminder ($${balanceAmount.toFixed(2)} due)`}
                              >
                                {remindingId === student.id ? <Loader2 size={20} className="animate-spin" /> : <BellRing size={20} />}
                              </button>
                            )}

                            <button 
                              onClick={() => setViewStudent(student)}
                              className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all"
                              title="View Profile"
                            >
                              <ScanEye size={22} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && students.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl mt-4">
              <AlertCircle className="mx-auto text-slate-300 mb-4" size={56} />
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No students found matching your filters.</p>
              <button 
                onClick={clearAllFilters}
                className="mt-4 text-teal-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* PAGINATION */}
      {total > limit && !loading && (
        <footer className="flex justify-center py-10 px-4">
          <Pagination 
            currentPage={page} 
            totalItems={total} 
            itemsPerPage={limit} 
            onPageChange={setPage} 
          />
        </footer>
      )}

      {/* DETAIL VIEW MODAL */}
      {viewStudent && (
        <StudentDetailView 
          studentId={viewStudent.id}
          onClose={() => {
            setViewStudent(null);
            fetchStudents(); 
          }} 
        />
      )}
    </div>
  );
};

export default StudentPage;