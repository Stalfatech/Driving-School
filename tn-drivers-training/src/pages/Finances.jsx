
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Search, Download, CheckCircle, Filter, 
  RotateCw, Eye, X, FileText, AlertCircle, HelpCircle, Receipt, Plus, Save, Loader2, Tag, AlignLeft
} from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

const Finances = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  // --- ADMIN REMARKS STATE ---
  const [adminRemarks, setAdminRemarks] = useState('');

  // 1. Fetch all claims using the admin route
  const fetchAllClaims = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_BASE}/admin/expenses/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setExpenses(res.data.data);
    } catch (err) {
      console.error("Access Denied or Server Error", err.response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllClaims(); }, []);

  // 2. Handle Status Update with Remarks
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(`${API_BASE}/admin/expenses/${id}/status`, {
        status: newStatus,
        admin_remarks: adminRemarks
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setExpenses(prev => prev.map(ex => ex.id === id ? res.data.data : ex));
        setSelectedExpense(null);
        setAdminRemarks('');
        alert(`Claim successfully ${newStatus}.`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const instructorName = exp.instructor?.user?.name || '';
      const matchesSearch = instructorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || exp.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, expenses]);

  // UI Stats calculation
  const stats = useMemo(() => {
    const total = expenses.filter(e => e.status === 'approved').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    return [
        { label: "Pending", value: expenses.filter(e => e.status === 'pending').length, color: "text-amber-500" },
        { label: "Approved Total", value: `$${total.toFixed(2)}`, color: "text-emerald-500" },
        { label: "Queries", value: expenses.filter(e => e.status === 'rejected').length, color: "text-rose-500" }
    ];
  }, [expenses]);

  if (loading) return <div className="p-20 text-center font-black uppercase italic dark:text-white flex flex-col items-center gap-4"><Loader2 className="animate-spin text-indigo-500" size={40}/> Accessing Secure Financial Core...</div>;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-24">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
            Financial <span className="text-indigo-600">Control</span>
          </h1>
          <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50">
            <Download size={16}/> Export History
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s, i) => (
                <div key={i} className="bg-white dark:bg-[#111827] p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{s.label}</p>
                    <p className={`text-xl font-black italic ${s.color}`}>{s.value}</p>
                </div>
            ))}
        </div>

        <div className="bg-white dark:bg-[#111827] p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-3 px-3 flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl py-2">
            <Search size={18} className="text-slate-400" />
            <input 
              className="bg-transparent border-none outline-none text-sm w-full dark:text-white font-bold" 
              placeholder="Filter by instructor name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase py-2 px-4 dark:text-white outline-none border-none cursor-pointer"
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 shadow-sm rounded-[2rem] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 border-b dark:border-slate-800 italic">
              <tr>
                <th className="px-8 py-5">Instructor</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5 text-center">Amount</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6 text-sm font-black text-slate-800 dark:text-white uppercase italic leading-none">{exp.instructor?.user?.name || 'N/A'}</td>
                  <td className="px-6 py-6"><span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">{exp.category}</span></td>
                  <td className="px-6 py-6 text-center font-black text-slate-900 dark:text-white italic tracking-tighter">${parseFloat(exp.amount).toFixed(2)}</td>
                  <td className="px-6 py-6 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${exp.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : exp.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button onClick={() => { setSelectedExpense(exp); setAdminRemarks(exp.admin_remarks || ''); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-all hover:bg-indigo-50 rounded-xl">
                      <Eye size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && <p className="p-10 text-center text-[10px] font-black uppercase text-slate-500 italic">No records matching the current filter</p>}
        </div>
      </main>

      {/* ADMIN REVIEW MODAL (Updated with Description & Category) */}
      {selectedExpense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setSelectedExpense(null)} />
          <div className="relative z-10 w-full max-w-5xl bg-white dark:bg-[#111827] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left side: Evidence Viewer */}
            <div className="w-full md:w-1/2 bg-slate-100 dark:bg-slate-950 p-6 flex flex-col items-center justify-center border-r dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest italic">Visual Evidence</p>
                <img 
                    src={`http://localhost:8000/storage/${selectedExpense.receipt_path}`} 
                    className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl transition-transform hover:scale-105 cursor-zoom-in" 
                    alt="Instructor Receipt" 
                />
            </div>

            {/* Right side: Detailed Analysis */}
            <div className="w-full md:w-1/2 p-8 flex flex-col space-y-5 overflow-y-auto">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Instructor Profile</p>
                        <h2 className="text-xl font-black dark:text-white uppercase italic">{selectedExpense.instructor?.user?.name}</h2>
                    </div>
                    <button onClick={() => setSelectedExpense(null)} className="p-2 text-slate-400 hover:bg-rose-50 rounded-full transition-colors"><X/></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border dark:border-slate-800">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Claim Amount</p>
                        <p className="text-xl font-black dark:text-white italic tracking-tighter">${parseFloat(selectedExpense.amount).toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border dark:border-slate-800">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Tag size={8}/> Category</p>
                        <p className="text-xs font-black dark:text-white uppercase italic tracking-widest text-indigo-500">{selectedExpense.category}</p>
                    </div>
                </div>

                {/* --- NEW: DESCRIPTION SECTION --- */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border dark:border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1"><AlignLeft size={10}/> Instructor's Description</p>
                    <p className="text-xs font-bold dark:text-slate-200 italic leading-relaxed">
                        {selectedExpense.description || "No description provided by instructor."}
                    </p>
                </div>

                {/* --- ADMIN REMARKS INPUT --- */}
                <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Review Remarks (Instructor will see this)</p>
                    <textarea 
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="State reason for approval or rejection..."
                        rows="3"
                        value={adminRemarks}
                        onChange={(e) => setAdminRemarks(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t dark:border-slate-800">
                    <button 
                        onClick={() => handleStatusUpdate(selectedExpense.id, 'approved')} 
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={14}/> Approve & Reconcile
                    </button>
                    <button 
                        onClick={() => handleStatusUpdate(selectedExpense.id, 'rejected')} 
                        className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <X size={14}/> Flag / Reject Claim
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finances;