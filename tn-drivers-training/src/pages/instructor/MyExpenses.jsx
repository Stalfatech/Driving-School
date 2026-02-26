import React, { useState, useEffect } from 'react';
import { 
  Receipt, Car, Gauge, CloudUpload, ChevronDown, Save, 
  Landmark, Verified, History, Clock, CheckCircle2, 
  ShieldCheck, Edit3, AlertTriangle, Calendar
} from 'lucide-react';

const MyExpenses = () => {
  const instructorName = "Marc-André Leclaire"; 
  const instructorBranch = "Burin";

  // --- CAR MANAGEMENT STATE ---
  const [assignedCar, setAssignedCar] = useState({
    model: "2022 Toyota Corolla",
    plate: "HJH-412",
    id: "V-882",
    odometer: 42500,
    insurancePolicy: "NF-99234-X",
    insuranceStart: "2025-03-01",
    insuranceExpiry: "2026-03-25" 
  });

  const [isEditingCar, setIsEditingCar] = useState(false);
  const [tempCarData, setTempCarData] = useState({ ...assignedCar });
  const [insuranceStatus, setInsuranceStatus] = useState({ type: 'valid', message: '' });

  // --- INSURANCE ALERT LOGIC ---
  useEffect(() => {
    const today = new Date();
    const expiry = new Date(assignedCar.insuranceExpiry);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      setInsuranceStatus({ type: 'expired', message: 'Insurance Expired! Contact Admin Immediately.' });
    } else if (diffDays <= 30) {
      setInsuranceStatus({ type: 'warning', message: `Attention: Insurance expiring in ${diffDays} days.` });
    } else {
      setInsuranceStatus({ type: 'valid', message: 'Insurance coverage is active and valid.' });
    }
  }, [assignedCar.insuranceExpiry]);

  const handleCarUpdate = () => {
    setAssignedCar({ ...tempCarData });
    setIsEditingCar(false);
  };

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Fuel',
    merchant: '',
    totalAmount: '',
    receipt: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.receipt) {
      alert("Please attach a receipt before submitting.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Expense submitted successfully!");
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* 1. Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic leading-none">
            My <span className="text-[#008B8B]">Expenses</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 italic">Personal Reimbursements • {instructorBranch}</p>
        </div>
        <div className="flex gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
           <div className="text-right border-r border-slate-200 dark:border-slate-800 pr-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Pending</p>
             <p className="text-xl font-black text-orange-500 mt-1">$120.45</p>
           </div>
           <div className="text-right pl-2">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Reimbursed</p>
             <p className="text-xl font-black text-emerald-500 mt-1">$80.20</p>
           </div>
        </div>
      </div>

      {/* 2. INSURANCE COMPLIANCE ALERT */}
      <div className={`p-4 rounded-2xl flex items-center gap-3 border transition-all ${
        insuranceStatus.type === 'valid' 
          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600' 
          : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-600 animate-pulse'
      }`}>
        {insuranceStatus.type === 'valid' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}
        <p className="text-[10px] font-black uppercase tracking-[0.15em]">{insuranceStatus.message}</p>
      </div>

      {/* 3. MY CAR MANAGEMENT SECTION */}
      <section className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl transition-all duration-300 relative overflow-hidden group">
        <Car className="absolute -right-10 -top-10 size-48 opacity-5 dark:opacity-10 group-hover:rotate-12 transition-transform duration-700 text-slate-900 dark:text-white" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-[#008B8B] p-3 rounded-2xl shadow-lg text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest leading-none italic">My Assigned Car</h2>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Asset ID: {assignedCar.id}</p>
              </div>
            </div>

            {!isEditingCar ? (
              <button 
                onClick={() => setIsEditingCar(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black text-slate-900 dark:text-white uppercase transition-all"
              >
                <Edit3 size={14} /> Update Logs
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditingCar(false)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                <button onClick={handleCarUpdate} className="px-5 py-2.5 bg-[#008B8B] text-white rounded-xl text-[10px] font-black uppercase shadow-lg">Save Changes</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">Model</p>
              <p className="text-sm font-black italic text-slate-900 dark:text-white">{assignedCar.model} <span className="opacity-30 ml-1">🔒</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">License Plate</p>
              <p className="text-sm font-black italic text-slate-900 dark:text-white">{assignedCar.plate} <span className="opacity-30 ml-1">🔒</span></p>
            </div>
            
            <EditableField isEditing={isEditingCar} label="Odometer" value={tempCarData.odometer} type="number" suffix="KM" onChange={(val) => setTempCarData({...tempCarData, odometer: val})} />
            <EditableField isEditing={isEditingCar} label="Insurance Policy" value={tempCarData.insurancePolicy} onChange={(val) => setTempCarData({...tempCarData, insurancePolicy: val})} />
            <EditableField isEditing={isEditingCar} label="Starting Date" value={tempCarData.insuranceStart} type="date" onChange={(val) => setTempCarData({...tempCarData, insuranceStart: val})} />
            <EditableField isEditing={isEditingCar} label="Expiry Date" value={tempCarData.insuranceExpiry} type="date" color="text-rose-500" onChange={(val) => setTempCarData({...tempCarData, insuranceExpiry: val})} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 transition-colors">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-[#008B8B] uppercase tracking-[0.2em] flex items-center gap-3">
                  <Receipt size={18} /> Transaction Details
                </h2>
                <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 uppercase tracking-widest">{instructorName}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExpenseInput label="Date of Purchase" type="date" value={formData.date} onChange={(val) => setFormData({...formData, date: val})} />
                <ExpenseSelect label="Category" options={['Fuel', 'Maintenance', 'Parking', 'Supplies']} value={formData.category} onChange={(val) => setFormData({...formData, category: val})} />
                <ExpenseInput label="Merchant Name" placeholder="e.g. Petro-Canada" value={formData.merchant} onChange={(val) => setFormData({...formData, merchant: val})} />
                <ExpenseSelect label="Vehicle Used" options={[`${assignedCar.model} (${assignedCar.id})`]} value={formData.vehicle} onChange={(val) => setFormData({...formData, vehicle: val})} />
              </div>
            </section>
            
            <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[#008B8B] uppercase tracking-widest ml-1 flex items-center gap-2 italic">
                    <Landmark size={14} /> Total Amount (CAD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#008B8B] font-black text-2xl">$</span>
                    <input required type="number" step="0.01" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl pl-12 pr-6 py-6 text-3xl font-black dark:text-white focus:ring-4 focus:ring-[#008B8B]/10 outline-none" placeholder="0.00" value={formData.totalAmount} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evidence / Receipt</label>
                  <div className={`relative h-32 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 ${formData.receipt ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-[#008B8B] hover:bg-[#008B8B]/5'}`}>
                    <input required type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setFormData({...formData, receipt: e.target.files[0]})} />
                    <CloudUpload size={24} className="text-slate-400 mb-1" />
                    <p className="text-[10px] font-black uppercase text-slate-400 italic truncate max-w-[150px]">{formData.receipt ? formData.receipt.name : "Click to Attach"}</p>
                  </div>
                </div>
              </div>
              <button disabled={isSubmitting} className="w-full py-5 bg-[#008B8B] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50">
                {isSubmitting ? "Submitting..." : "Submit Claim"}
              </button>
            </section>
          </form>
        </div>

        {/* 5. Sidebar History */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
             <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/20">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} /> Claim History
                </h3>
             </div>
             <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <ClaimRow date="Feb 24" cat="Fuel" price="65.00" status="Approved" />
                <ClaimRow date="Feb 22" cat="Service" price="120.45" status="Pending" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const EditableField = ({ isEditing, label, value, onChange, type = "text", suffix = "", color = "" }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{label}</p>
    {isEditing ? (
      <input 
        type={type} 
        className="bg-slate-100 dark:bg-white/10 border-none rounded-lg px-2 py-1 text-sm font-black w-full outline-none focus:ring-1 focus:ring-[#008B8B] text-slate-900 dark:text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <p className={`text-sm font-black italic ${color || 'text-slate-900 dark:text-white'}`}>{value} {suffix}</p>
    )}
  </div>
);

const ExpenseInput = ({ label, type, placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      required 
      type={type} 
      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#008B8B]/20 outline-none transition-all" 
      placeholder={placeholder} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
    />
  </div>
);

const ExpenseSelect = ({ label, options, value, onChange }) => (
  <div className="space-y-1.5 relative">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <select 
        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#008B8B]/20 outline-none appearance-none cursor-pointer transition-all" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-[#008B8B] transition-colors" />
    </div>
  </div>
);

const ClaimRow = ({ date, cat, price, status }) => (
  <div className="p-6 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer">
    <div>
      <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{cat}</p>
      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mt-0.5">{date}</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-black text-slate-900 dark:text-white italic">${price}</p>
      <div className={`flex items-center justify-end gap-1 text-[8px] font-black uppercase mt-1 ${status === 'Approved' ? 'text-emerald-500' : 'text-orange-500'}`}>
        {status === 'Approved' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
        {status}
      </div>
    </div>
  </div>
);

export default MyExpenses;