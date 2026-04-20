
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Receipt, Car, CloudUpload, ChevronDown, Clock, CheckCircle2, 
  ShieldCheck, Edit3, Plus, Eye, Trash2, X, FileText, AlertTriangle, Save, MessageSquare, Bell, Search, ScanEye,
  Filter, Calendar, DollarSign, Wallet, CreditCard
} from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

const MyExpenses = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [assignedCar, setAssignedCar] = useState(null);
  const [isEditingCar, setIsEditingCar] = useState(false);
  const [carFormData, setCarFormData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEditingExpense, setIsEditingExpense] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [formData, setFormData] = useState({
    category: 'Fuel', 
    payment_method: 'cash', 
    amount: '', 
    description: '', 
    receipt: null,
    id: null
  });

  // --- LOGIC: CHECK FOR EXPIRY IN 1 MONTH ---
  const expiryAlerts = useMemo(() => {
    if (!assignedCar) return [];
    const alerts = [];
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const checkExpiry = (dateStr, label) => {
      if (!dateStr) return;
      const expiryDate = new Date(dateStr);
      if (expiryDate <= nextMonth && expiryDate >= today) {
        alerts.push({ label, date: dateStr, type: 'expiring' });
      } else if (expiryDate < today) {
        alerts.push({ label, date: dateStr, type: 'expired' });
      }
    };

    checkExpiry(assignedCar.insurance_expiry, "Insurance");
    checkExpiry(assignedCar.rc_expiry, "RC Document");
    
    return alerts;
  }, [assignedCar]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const [expRes, carRes] = await Promise.all([
        axios.get(`${API_BASE}/expenses/my-history`, { headers }),
        axios.get(`${API_BASE}/my-assigned-car`, { headers }).catch(() => ({ data: { success: false } }))
      ]);
      if (expRes.data.success) setExpenses(expRes.data.data);
      if (carRes.data.success) {
        const car = carRes.data.data;
        setAssignedCar(car);
        setCarFormData({
          odometer: car.odometer,
          insurance_number: car.insurance_number,
          rc_number: car.rc_number,
          insurance_expiry: car.insurance_expiry?.split('T')[0] || '',
          rc_expiry: car.rc_expiry?.split('T')[0] || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCarUpdate = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const data = new FormData();
      data.append('_method', 'POST'); 
      Object.keys(carFormData).forEach(key => data.append(key, carFormData[key]));
      const res = await axios.post(`${API_BASE}/my-car-update/${assignedCar.id}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setAssignedCar(res.data.data);
        setIsEditingCar(false);
        alert("Vehicle logs updated.");
      }
    } catch (err) { 
      alert("Update failed."); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] && key !== 'id') data.append(key, formData[key]);
    });
    try {
      let url = `${API_BASE}/expenses`;
      if (isEditingExpense) {
        url = `${API_BASE}/expenses/${formData.id}`;
        data.append('_method', 'POST');
      }
      const res = await axios.post(url, data, { 
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
      });
      if (res.data.success) {
        setIsModalOpen(false);
        setIsEditingExpense(false);
        setFormData({
          category: 'Fuel', payment_method: 'cash', amount: '', description: '', receipt: null, id: null
        });
        fetchData();
        alert(isEditingExpense ? "Claim updated!" : "Claim submitted!");
      }
    } catch (err) { 
      alert("Action failed."); 
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this claim?")) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.delete(`${API_BASE}/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSelectedExpense(null);
        fetchData();
        alert("Claim deleted successfully!");
      }
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const startEditExpense = (expense) => {
    setFormData({
      category: expense.category,
      payment_method: expense.payment_method,
      amount: expense.amount,
      description: expense.description,
      receipt: null,
      id: expense.id
    });
    setIsEditingExpense(true);
    setIsModalOpen(true);
    setSelectedExpense(null);
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exp.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || exp.status === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate stats
  const totalApproved = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalPending = expenses.filter(e => e.status === 'pending').length;

  // Get unique categories for filter
  const categories = ['All', ...new Set(expenses.map(e => e.category))];

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      
      {/* HEADER */}
      <header className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
              My <span className="text-teal-600 dark:text-teal-400">Expenses</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-400 mt-1.5 font-medium">
              Track and manage your expense claims
            </p>
          </div>
          <div className="flex justify-end w-full md:w-auto">
            <button 
              onClick={() => { 
                setIsEditingExpense(false); 
                setFormData({
                  category: 'Fuel', payment_method: 'cash', amount: '', description: '', receipt: null, id: null
                });
                setIsModalOpen(true); 
              }} 
              className="w-full md:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-teal-600 hover:text-white dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> New Claim
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 overflow-x-hidden">
        <div className="max-w-[1920px] mx-auto">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <p className="text-xs md:text-md lg:text-lg text-center font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider mb-1">Total Approved</p>
              <p className="text-2xl text-center font-bold text-teal-600 dark:text-teal-400">${totalApproved.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <p className="text-xs md:text-md lg:text-lg text-center font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider mb-1">Pending Claims</p>
              <p className="text-2xl text-center font-bold text-amber-600 dark:text-amber-400">{totalPending}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <p className="text-xs md:text-md lg:text-lg text-center font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-wider mb-1">Total Claims</p>
              <p className="text-2xl text-center font-bold text-slate-800 dark:text-white">{expenses.length}</p>
            </div>
          </div>

          {/* Vehicle Section */}
          {assignedCar && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <Car size={16} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-xs md:text-md lg:text-lg font-bold text-slate-800 dark:text-white">Vehicle Assets</h3>
                </div>
                {!isEditingCar ? (
                  <button 
                    onClick={() => setIsEditingCar(true)} 
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <Edit3 size={12} /> Update Logs
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditingCar(false)} 
                      className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleCarUpdate} 
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                    >
                      <Save size={12} /> Save
                    </button>
                  </div>
                )}
              </div>
              
              {/* Expiry Alerts */}
              {expiryAlerts.length > 0 && (
                <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  <div className="flex flex-wrap gap-2">
                    {expiryAlerts.map((alert, i) => (
                      <span key={i} className={`text-xs ${alert.type === 'expired' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {alert.label} {alert.type === 'expired' ? 'has EXPIRED!' : `expires on ${alert.date}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <StaticField label="Model" value={assignedCar.car_name} />
                  <EditableField isEditing={isEditingCar} label="Odometer (KM)" value={carFormData.odometer} onChange={(v) => setCarFormData({...carFormData, odometer: v})} type="number" />
                  <EditableField isEditing={isEditingCar} label="Policy No" value={carFormData.insurance_number} onChange={(v) => setCarFormData({...carFormData, insurance_number: v})} />
                  <EditableField isEditing={isEditingCar} label="RC Number" value={carFormData.rc_number} onChange={(v) => setCarFormData({...carFormData, rc_number: v})} />
                  <EditableField isEditing={isEditingCar} label="Ins. Expiry" value={carFormData.insurance_expiry} onChange={(v) => setCarFormData({...carFormData, insurance_expiry: v})} type="date" />
                  <EditableField isEditing={isEditingCar} label="RC Expiry" value={carFormData.rc_expiry} onChange={(v) => setCarFormData({...carFormData, rc_expiry: v})} type="date" />
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col w-full lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4 mb-6">
            {/* Filter Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2 sm:gap-3 flex-1">
              
              {/* Status Filter */}
              <div className="group relative w-full">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm cursor-pointer"
                >
                  <option>All Status</option>
                  <option>pending</option>
                  <option>approved</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="group relative w-full">
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by category or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-400">Category</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-400">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-400">Date</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-400">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                            <Receipt size={14} className="text-teal-600" />
                          </div>
                          <span className="text-sm font-semibold text-slate-800 dark:text-white">{exp.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-base font-bold text-teal-600 dark:text-teal-400">${parseFloat(exp.amount).toFixed(2)}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{exp.payment_method}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-400">{exp.created_at?.split('T')[0]}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          exp.status === 'approved' 
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${exp.status === 'approved' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                          {exp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => setSelectedExpense(exp)} 
                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all"
                            title="View Details"
                          >
                            <ScanEye size={18} />
                          </button>
                          {exp.status === 'pending' ? (
                            <button 
                              onClick={() => startEditExpense(exp)} 
                              className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                              title="Edit Claim"
                            >
                              <Edit3 size={16} />
                            </button>
                          ) : (
                            <button className="p-2 text-gray-400 cursor-not-allowed rounded-lg transition-all" title="Cannot edit approved claim" disabled>
                              <Edit3 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredExpenses.length === 0 && (
              <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl m-6">
                <Receipt size={56} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No expenses found</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('All');
                    setCategoryFilter('All');
                  }} 
                  className="mt-4 text-teal-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* VIEW MODAL */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400">Claim Details</h3>
              <button onClick={() => setSelectedExpense(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedExpense.admin_remarks && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3">
                  <MessageSquare size={16} className="text-amber-500" />
                  <div>
                    <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">Admin Feedback</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">"{selectedExpense.admin_remarks}"</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Status" value={selectedExpense.status} color={selectedExpense.status === 'approved' ? 'text-green-600' : 'text-amber-600'} />
                <DetailItem label="Amount" value={`$${parseFloat(selectedExpense.amount).toFixed(2)}`} />
                <DetailItem label="Category" value={selectedExpense.category} />
                <DetailItem label="Payment Method" value={selectedExpense.payment_method} />
                <DetailItem label="Date" value={selectedExpense.created_at?.split('T')[0]} />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{selectedExpense.description || 'No description'}</p>
              </div>
              {selectedExpense.receipt_path && (
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-teal-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Receipt</span>
                  </div>
                  <a 
                    href={`${API_BASE.replace('/api','')}/storage/${selectedExpense.receipt_path}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-teal-600 hover:underline"
                  >
                    View Document
                  </a>
                </div>
              )}
              {selectedExpense.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => startEditExpense(selectedExpense)} 
                    className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm transition-all"
                  >
                    <Edit3 size={16} className="inline mr-2" /> Edit Claim
                  </button>
                  <button 
                    onClick={() => handleDeleteExpense(selectedExpense.id)} 
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-all"
                  >
                    <Trash2 size={16} className="inline mr-2" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h2 className="text-lg font-bold text-teal-600 dark:text-teal-400">
                {isEditingExpense ? "Edit Claim" : "New Reimbursement"}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setIsEditingExpense(false); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg dark:text-white hover:text-red-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 dark:text-white">
                <ExpenseSelect label="Category" options={['Fuel', 'Maintenance', 'Parking', 'Supplies','Other']} value={formData.category} onChange={(v)=>setFormData({...formData, category:v})} required/>
                <ExpenseSelect label="Payment Method" options={['cash', 'online', 'card']} value={formData.payment_method} onChange={(v)=>setFormData({...formData, payment_method:v})} required/>
                <ExpenseInput label="Amount ($)" type="number" placeholder="0.00" value={formData.amount} onChange={(v)=>setFormData({...formData, amount:v})} required/>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Receipt</label>
                  <div className="relative h-12 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:border-teal-500 transition-colors cursor-pointer">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e)=>setFormData({...formData, receipt: e.target.files[0]})} required/>
                    <CloudUpload size={16} />
                    <p className="ml-2 text-xs font-medium truncate max-w-[150px]">
                      {formData.receipt ? formData.receipt.name : "Upload Receipt"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Description</label>
                <textarea 
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border dark:text-white border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none" 
                  rows="3"
                  placeholder="Reimbursement details..." 
                  value={formData.description} 
                  onChange={(e)=>setFormData({...formData, description:e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-teal-500/20">
                {isEditingExpense ? "Update Claim" : "Submit Claim"}
              </button>
              <button 
                type="button" 
                onClick={() => { setIsModalOpen(false); setIsEditingExpense(false); }} 
                className="w-full text-sm font-medium text-slate-500 transition-colors hover:text-red-500"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPERS ---
const StaticField = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-sm font-medium text-slate-800 dark:text-white">{value || 'N/A'}</p>
  </div>
);

const EditableField = ({ isEditing, label, value, onChange, type = "text" }) => (
  <div>
    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    {isEditing ? (
      <input 
        type={type} 
        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
      />
    ) : (
      <p className="text-sm font-medium text-slate-800 dark:text-white">{value || 'N/A'}</p>
    )}
  </div>
);

const DetailItem = ({ label, value, color }) => (
  <div>
    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-sm font-semibold ${color || 'text-slate-800 dark:text-white'}`}>{value}</p>
  </div>
);

const ExpenseInput = ({ label, type, placeholder, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</label>
    <input 
      required 
      type={type} 
      className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
      placeholder={placeholder} 
      value={value} 
      onChange={(e)=>onChange(e.target.value)}
    />
  </div>
);

const ExpenseSelect = ({ label, options, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <select 
        className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer appearance-none" 
        value={value} 
        onChange={(e)=>onChange(e.target.value)}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
    </div>
  </div>
);

export default MyExpenses;