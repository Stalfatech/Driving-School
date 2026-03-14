
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Receipt, Car, CloudUpload, ChevronDown, Clock, CheckCircle2, 
  ShieldCheck, Edit3, Plus, Eye, Trash2, X, FileText, AlertTriangle, Save, MessageSquare, Bell
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
  
  const [formData, setFormData] = useState({
    category: 'Fuel', payment_method: 'cash', amount: '', description: '', receipt: null
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
        alerts.push(`${label} is expiring soon (${dateStr})`);
      } else if (expiryDate < today) {
        alerts.push(`${label} has EXPIRED!`);
      }
    };

    checkExpiry(assignedCar.insurance_expiry, "Insurance");
    checkExpiry(assignedCar.rc_expiry, "RC Document");
    
    return alerts;
  }, [assignedCar]);

  const fetchData = async () => {
    try {
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
    } catch (err) { console.error(err); } finally { setLoading(false); }
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
    } catch (err) { alert("Update failed."); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const data = new FormData();
    Object.keys(formData).forEach(key => { if(formData[key]) data.append(key, formData[key]); });
    try {
      if (isEditingExpense) data.append('_method', 'POST');
      const url = isEditingExpense ? `${API_BASE}/expenses/${formData.id}` : `${API_BASE}/expenses`;
      const res = await axios.post(url, data, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) { alert("Action failed."); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#008B8B] border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-white font-black uppercase italic">Syncing...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 p-4 bg-gray-50 dark:bg-[#020617] min-h-screen text-gray-900 dark:text-white font-sans transition-colors duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">
          My <span className="text-[#008B8B]">Expenses</span>
        </h1>
        <button 
          onClick={() => { setIsEditingExpense(false); setIsModalOpen(true); }} 
          className="bg-[#008B8B] text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={16} /> New Claim
        </button>
      </div>

      {/* VEHICLE SECTION WITH EXPIRY ALERTS */}
      {assignedCar && (
        <section className="bg-white dark:bg-[#0f172a] p-8 rounded-[2.5rem] border border-gray-200 dark:border-slate-800 relative overflow-hidden shadow-xl">
          <Car className="absolute -right-10 -top-10 size-48 opacity-5 dark:opacity-10 text-gray-400 dark:text-white" />
          
          <div className="relative z-10 space-y-6">
            {/* --- EXPIRY ALERT BANNER --- */}
            {expiryAlerts.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
                <div className="bg-rose-500 p-2 rounded-xl text-white shadow-lg shadow-rose-500/20">
                  <Bell size={18}/>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-500 tracking-widest">Compliance Warning</p>
                  <div className="flex flex-wrap gap-x-4">
                    {expiryAlerts.map((msg, i) => (
                      <span key={i} className="text-xs font-bold text-rose-700 dark:text-rose-200 italic">• {msg}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-[#008B8B] p-3 rounded-2xl text-white shadow-lg">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-sm font-black uppercase italic text-[#008B8B]">Vehicle Assets</h2>
              </div>
              {!isEditingCar ? (
                <button 
                  onClick={() => setIsEditingCar(true)} 
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                  <Edit3 size={14} /> Update Logs
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditingCar(false)} 
                    className="px-4 py-2 text-[10px] font-black uppercase text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCarUpdate} 
                    className="bg-[#008B8B] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Save size={14} className="inline mr-1"/> Save
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <StaticField label="Model" value={assignedCar.car_name} locked />
              <EditableField isEditing={isEditingCar} label="Odometer" value={carFormData.odometer} onChange={(v) => setCarFormData({...carFormData, odometer: v})} type="number" />
              <EditableField isEditing={isEditingCar} label="Policy No" value={carFormData.insurance_number} onChange={(v) => setCarFormData({...carFormData, insurance_number: v})} />
              <EditableField isEditing={isEditingCar} label="RC Number" value={carFormData.rc_number} onChange={(v) => setCarFormData({...carFormData, rc_number: v})} />
              <EditableField isEditing={isEditingCar} label="Ins. Expiry" value={carFormData.insurance_expiry} onChange={(v) => setCarFormData({...carFormData, insurance_expiry: v})} type="date" color={expiryAlerts.some(m => m.includes("Insurance")) ? "text-rose-600 dark:text-rose-500 underline" : "text-gray-900 dark:text-white"} />
              <EditableField isEditing={isEditingCar} label="RC Expiry" value={carFormData.rc_expiry} onChange={(v) => setCarFormData({...carFormData, rc_expiry: v})} type="date" color={expiryAlerts.some(m => m.includes("RC Document")) ? "text-rose-600 dark:text-rose-500 underline" : "text-gray-900 dark:text-white"} />
            </div>
          </div>
        </section>
      )}

      {/* EXPENSE TABLE */}
      <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-950/50 italic">
              <th className="p-6 text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase">Category</th>
              <th className="p-6 text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase text-center">Amount</th>
              <th className="p-6 text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase text-center">Status</th>
              <th className="p-6 text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {expenses.map((ex) => (
              <tr key={ex.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="p-6 font-black uppercase text-xs italic text-gray-900 dark:text-white">{ex.category}</td>
                <td className="p-6 text-center text-sm font-black text-gray-900 dark:text-white italic">${ex.amount}</td>
                <td className="p-6 text-center">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                    ex.status === 'approved' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-500'
                  }`}>
                    {ex.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => setSelectedExpense(ex)} 
                    className="p-2 text-gray-500 hover:text-[#008B8B] dark:text-slate-500 dark:hover:text-[#008B8B] transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL WITH ADMIN REMARKS */}
      {selectedExpense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in zoom-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-[3.5rem] border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-8 bg-gray-50 dark:bg-slate-950/40 flex justify-between items-center border-b border-gray-200 dark:border-slate-800">
              <h3 className="text-sm font-black uppercase italic text-[#008B8B]">Claim Detail View</h3>
              <button onClick={() => setSelectedExpense(null)} className="text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white">
                <X size={20}/>
              </button>
            </div>
            <div className="p-8 space-y-6">
              {selectedExpense.admin_remarks && (
                <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex gap-3">
                  <div className="bg-rose-500 p-2 rounded-xl text-white h-fit">
                    <MessageSquare size={14}/>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-rose-600 dark:text-rose-500 uppercase mb-1">Admin Feedback</p>
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-200 italic">"{selectedExpense.admin_remarks}"</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-center">
                 <DetailItem label="Status" value={selectedExpense.status} color={selectedExpense.status === 'approved' ? 'text-emerald-600 dark:text-emerald-500' : 'text-orange-600 dark:text-orange-500'}/>
                 <DetailItem label="Total" value={`$${selectedExpense.amount}`}/>
                 <DetailItem label="Category" value={selectedExpense.category}/>
                 <DetailItem label="Method" value={selectedExpense.payment_method}/>
              </div>
              <div className="p-5 bg-gray-100 dark:bg-[#020617] border border-gray-200 dark:border-slate-800 rounded-2xl text-xs font-bold italic text-gray-900 dark:text-white">
                 <p className="text-[8px] font-black text-[#008B8B] uppercase mb-1 not-italic">Description</p>
                 {selectedExpense.description || 'No notes.'}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase italic truncate w-40 text-gray-700 dark:text-white">
                   <FileText size={14} className="text-[#008B8B]"/> Receipt
                 </div>
                 <a href={`http://localhost:8000/storage/${selectedExpense.receipt_path}`} target="_blank" className="text-[9px] font-black text-[#008B8B] uppercase underline hover:text-[#006666]">
                   View Doc
                 </a>
              </div>
              {selectedExpense.status === 'pending' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                  <button 
                    onClick={() => startEditExpense(selectedExpense)} 
                    className="flex-1 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase text-gray-700 dark:text-white transition-colors"
                  >
                    <Edit3 size={14} className="inline mr-2"/> Edit
                  </button>
                  <button className="flex-1 py-4 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 hover:bg-rose-200 dark:hover:bg-rose-500/20 rounded-2xl font-black text-[10px] uppercase transition-colors">
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-2xl rounded-[3rem] border border-gray-200 dark:border-slate-800 p-8 space-y-6 shadow-2xl">
            <h2 className="text-sm font-black text-[#008B8B] uppercase italic flex items-center gap-3">
              <Plus size={20} /> {isEditingExpense ? "Resubmit Claim" : "New Reimbursement"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <ExpenseSelect label="Category" options={['Fuel', 'Maintenance', 'Parking']} value={formData.category} onChange={(v)=>setFormData({...formData, category:v})}/>
                <ExpenseSelect label="Payment" options={['cash', 'online', 'card']} value={formData.payment_method} onChange={(v)=>setFormData({...formData, payment_method:v})}/>
                <ExpenseInput label="Amount ($)" type="number" placeholder="0.00" value={formData.amount} onChange={(v)=>setFormData({...formData, amount:v})}/>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase italic">Receipt Doc</label>
                  <div className="relative h-14 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-800 bg-gray-50 dark:bg-transparent flex items-center justify-center text-gray-500 dark:text-slate-500 hover:border-[#008B8B] dark:hover:border-[#008B8B] transition-colors">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e)=>setFormData({...formData, receipt: e.target.files[0]})}/>
                    <CloudUpload size={16}/>
                    <p className="ml-2 text-[8px] font-black uppercase italic">
                      {formData.receipt ? formData.receipt.name : "Attach Image"}
                    </p>
                  </div>
                </div>
              </div>
              <textarea 
                className="w-full bg-gray-50 dark:bg-[#020617] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold min-h-[100px] outline-none italic text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:ring-2 focus:ring-[#008B8B]/50 transition-all" 
                placeholder="Reimbursement details..." 
                value={formData.description} 
                onChange={(e)=>setFormData({...formData, description:e.target.value})}
              />
              <button className="w-full py-5 bg-[#008B8B] text-white rounded-[1.5rem] font-black text-xs uppercase shadow-xl hover:shadow-2xl transition-all active:scale-95">
                {isEditingExpense ? "Update Claim" : "Submit Claim"}
              </button>
              <button 
                type="button" 
                onClick={() => { setIsModalOpen(false); setIsEditingExpense(false); }} 
                className="w-full text-gray-500 dark:text-slate-500 font-black uppercase text-[10px] hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
              >
                Discard
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPERS ---
const StaticField = ({ label, value, locked }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-gray-500 dark:text-slate-500 uppercase italic leading-none">{label}</p>
    <p className="text-[13px] font-black italic uppercase text-gray-900 dark:text-white">
      {value || 'N/A'} {locked && <span className="opacity-20 ml-1 text-gray-400 dark:text-white/20">🔒</span>}
    </p>
  </div>
);

const EditableField = ({ isEditing, label, value, onChange, type = "text", color = "" }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-gray-500 dark:text-slate-400 uppercase italic leading-none">{label}</p>
    {isEditing ? (
      <input 
        type={type} 
        className="bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/5 rounded-lg px-2 py-1 text-xs font-black w-full outline-none focus:ring-2 focus:ring-[#008B8B] text-gray-900 dark:text-white" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
      />
    ) : (
      <p className={`text-[13px] font-black italic uppercase ${color || 'text-gray-900 dark:text-white'}`}>
        {value || 'N/A'}
      </p>
    )}
  </div>
);

const DetailItem = ({ label, value, color }) => (
  <div>
    <p className="text-[9px] font-black text-gray-500 dark:text-slate-400 uppercase mb-1 tracking-widest italic">{label}</p>
    <p className={`text-base font-black italic uppercase tracking-tighter ${color || 'text-gray-900 dark:text-white'}`}>{value}</p>
  </div>
);

const ExpenseInput = ({ label, type, placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest italic">{label}</label>
    <input 
      required 
      type={type} 
      className="w-full bg-gray-50 dark:bg-[#020617] border border-gray-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#008B8B]/50 transition-all uppercase placeholder-gray-400 dark:placeholder-white/30" 
      placeholder={placeholder} 
      value={value} 
      onChange={(e)=>onChange(e.target.value)}
    />
  </div>
);

const ExpenseSelect = ({ label, options, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest italic">{label}</label>
    <select 
      className="w-full bg-gray-50 dark:bg-[#020617] border border-gray-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 dark:text-white outline-none appearance-none uppercase focus:ring-2 focus:ring-[#008B8B]/50 transition-all" 
      value={value} 
      onChange={(e)=>onChange(e.target.value)}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default MyExpenses;