import React, { useState, useMemo } from 'react';
import { 
  Search, Download, CheckCircle, Filter, 
  RotateCw, CreditCard, Eye, MoreVertical, 
  Check, X, FileText, TrendingUp, TrendingDown, 
  AlertCircle, HelpCircle, Receipt, ChevronRight
} from 'lucide-react';

const Finances = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [expenses, setExpenses] = useState([
    { id: 1, instructor: "Marc-André Leclaire", category: "Fuel", amount: 84.20, card: "4291", status: "Pending", receipt: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600" },
    { id: 2, instructor: "Sarah Jenkins", category: "Maintenance", amount: 312.45, card: "8832", status: "Approved", receipt: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?q=80&w=600" },
    { id: 3, instructor: "Robert Smith", category: "Car Wash", amount: 25.00, card: "1102", status: "Queried", receipt: "https://images.unsplash.com/photo-1554224155-1696413575b8?q=80&w=600" }
  ]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = exp.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All Categories' || exp.category === categoryFilter;
      const matchesStatus = statusFilter === 'All Status' || exp.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, categoryFilter, statusFilter, expenses]);

  const updateStatus = (id, newStatus) => {
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, status: newStatus } : exp));
  };

  const stats = [
    { label: "Pending Approval", value: "$4,250.00", color: "bg-amber-50 text-amber-600" },
    { label: "Monthly Spend", value: "$12,840.50", color: "bg-blue-50 text-blue-600" },
    { label: "Approved Items", value: "84", color: "bg-emerald-50 text-emerald-600" },
    { label: "Queried Issues", value: "12", color: "bg-rose-50 text-rose-600" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {/* Title Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic leading-none">Financial <span className="text-indigo-600">Oversight</span></h1>
            <p className="text-sm text-slate-500 mt-2">Reconcile spending for Terra Nova instructor assets.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-sm hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"><Download size={16}/> Export</button>
            <button onClick={() => setExpenses(prev => prev.map(e => ({...e, status: 'Approved'})))} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"><Check size={16}/> Approve All</button>
          </div>
        </div>

        {/* STATS GRID - 2 columns on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-white dark:bg-[#111827] p-4 md:p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{s.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">{s.value}</span>
              </div>
              <div className={`mt-2 h-1 w-8 rounded-full ${s.color.split(' ')[1]}`}></div>
            </div>
          ))}
        </div>

        {/* FILTER BAR - Stacks perfectly */}
        <div className="bg-white dark:bg-[#111827] p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-stretch gap-4">
          <div className="flex items-center gap-3 px-3 flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl py-2">
            <Search size={18} className="text-slate-400" />
            <input 
              className="bg-transparent border-none outline-none text-sm w-full dark:text-white" 
              placeholder="Search instructor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase py-2.5 px-4 border-none outline-none dark:text-white">
              <option>All Categories</option><option>Fuel</option><option>Maintenance</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase py-2.5 px-4 border-none outline-none dark:text-white">
              <option>All Status</option><option>Pending</option><option>Approved</option>
            </select>
          </div>
        </div>

        {/* MOBILE CARDS (Visible only on small screens) */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {filteredExpenses.map(exp => (
            <div key={exp.id} className="bg-white dark:bg-[#111827] p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-all active:scale-[0.98]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">{exp.instructor[0]}</div>
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase leading-none">{exp.instructor}</p>
                    <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1 tracking-widest">{exp.category}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${exp.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {exp.status}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                 <div className="space-y-0.5">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Amount</p>
                   <p className="text-lg font-black text-slate-900 dark:text-white">${exp.amount.toFixed(2)}</p>
                 </div>
                 <button onClick={() => setSelectedExpense(exp)} className="size-12 rounded-xl overflow-hidden border-2 border-white shadow-md active:scale-110 transition-transform">
                   <img src={exp.receipt} className="w-full h-full object-cover" alt="receipt" />
                 </button>
              </div>

              <div className="flex gap-2">
                 <button onClick={() => updateStatus(exp.id, 'Approved')} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center transition-all"><CheckCircle size={20}/></button>
                 <button onClick={() => updateStatus(exp.id, 'Queried')} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl flex items-center justify-center transition-all"><HelpCircle size={20}/></button>
                 <button onClick={() => setSelectedExpense(exp)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center justify-center transition-all"><Eye size={20}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE (Hidden on mobile) */}
        <div className="hidden lg:block bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 shadow-sm rounded-[2rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b dark:border-slate-800">
                <tr>
                  <th className="px-8 py-5">Instructor</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5 text-center">Amount (CAD)</th>
                  <th className="px-6 py-5 text-center">Receipt</th>
                  <th className="px-6 py-5 text-center">Card</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-6 text-sm font-black text-slate-800 dark:text-white uppercase leading-none">{exp.instructor}</td>
                    <td className="px-6 py-6"><span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">{exp.category}</span></td>
                    <td className="px-6 py-6 text-center font-black text-slate-900 dark:text-white">${exp.amount.toFixed(2)}</td>
                    <td className="px-6 py-6 text-center">
                      <button onClick={() => setSelectedExpense(exp)} className="size-11 rounded-lg overflow-hidden inline-block border-2 border-white dark:border-slate-700 shadow-sm hover:scale-125 transition-transform"><img src={exp.receipt} className="w-full h-full object-cover" alt="receipt" /></button>
                    </td>
                    <td className="px-6 py-6 text-center text-[10px] font-black text-slate-400">•• {exp.card}</td>
                    <td className="px-6 py-6"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${exp.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : exp.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>{exp.status}</span></td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => updateStatus(exp.id, 'Approved')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Approve"><CheckCircle size={18}/></button>
                        <button onClick={() => updateStatus(exp.id, 'Queried')} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Query"><HelpCircle size={18}/></button>
                        <button onClick={() => setSelectedExpense(exp)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"><Eye size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* DETAIL VERIFICATION MODAL */}
      {selectedExpense && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 transition-all">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedExpense(null)} />
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#111827] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 md:p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase italic leading-none">Receipt <span className="text-indigo-600">Evidence</span></h2>
              <button onClick={() => setSelectedExpense(null)} className="p-2 hover:bg-rose-500 hover:text-white rounded-full transition-all text-slate-400"><X size={20}/></button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-indigo-500">Instructor Account</p><p className="text-lg font-black dark:text-white uppercase italic">{selectedExpense.instructor}</p></div>
                <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border dark:border-slate-800">
                  <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total CAD</p><p className="text-xl font-black text-slate-900 dark:text-white">${selectedExpense.amount.toFixed(2)}</p></div>
                  <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p><span className="text-[10px] font-black uppercase text-indigo-600">{selectedExpense.category}</span></div>
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={() => {updateStatus(selectedExpense.id, 'Approved'); setSelectedExpense(null);}} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all">Approve Expense</button>
                  <button onClick={() => {updateStatus(selectedExpense.id, 'Queried'); setSelectedExpense(null);}} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all">Flag for Query</button>
                </div>
              </div>
              <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-3xl border-4 border-white dark:border-slate-800 shadow-inner flex items-center justify-center overflow-hidden">
                <img src={selectedExpense.receipt} className="w-full h-auto max-h-80 object-contain rounded-2xl" alt="receipt evidence" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finances;
