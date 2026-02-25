import React, { useState } from 'react';
import { 
  Receipt, Car, Gauge, CloudUpload, 
  ChevronRight, Save, Landmark, Verified, 
  History, Clock, CheckCircle2, FileText, Trash2
} from 'lucide-react';

// REMOVED: InstructorNavbar import to fix the "double navbar" issue

const MyExpenses = () => {
  const instructorName = "Marc-André Leclaire"; 
  const instructorBranch = "Burin";

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Fuel',
    merchant: '',
    description: '',
    vehicle: '2022 Toyota Corolla (V-882)',
    odometer: '',
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
    // Simulate API call
    console.log("Submitting Expense with Receipt:", formData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Expense submitted successfully!");
    }, 1500);
  };

  return (
    /* FIXED: Removed flex-1 and min-h-screen to work with Layout. 
       Added transition-colors to support theme switching. */
    <div className="max-w-7xl mx-auto space-y-10 transition-colors duration-300 animate-in fade-in duration-500">
      
      {/* 1. Header Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic leading-none">
            My <span className="text-[#008B8B]">Expenses</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Personal Reimbursements • {instructorBranch}</p>
        </div>
        <div className="flex gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="text-right border-r border-slate-200 dark:border-slate-800 pr-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
             <p className="text-xl font-black text-orange-500">$120.45</p>
           </div>
           <div className="text-right pl-2">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reimbursed</p>
             <p className="text-xl font-black text-emerald-500">$80.20</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. MAIN FORM SECTION */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Card 1: Details */}
            <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-[#008B8B] uppercase tracking-[0.2em] flex items-center gap-3">
                  <Receipt size={18} /> Transaction Details
                </h2>
                <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 uppercase">{instructorName}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExpenseInput label="Date of Purchase" type="date" value={formData.date} onChange={(val) => setFormData({...formData, date: val})} />
                <ExpenseSelect label="Category" options={['Fuel', 'Maintenance', 'Parking', 'Supplies']} value={formData.category} onChange={(val) => setFormData({...formData, category: val})} />
                <ExpenseInput label="Merchant Name" placeholder="e.g. Petro-Canada" value={formData.merchant} onChange={(val) => setFormData({...formData, merchant: val})} />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Used</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-[#008B8B]/20 transition-all appearance-none" value={formData.vehicle} onChange={(e) => setFormData({...formData, vehicle: e.target.value})}>
                    <option>2022 Toyota Corolla (V-882)</option>
                    <option>2023 Honda Civic (V-104)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Card 2: Financials & Receipt */}
            <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Total Amount Input */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[#008B8B] uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Landmark size={14} /> Total Amount (CAD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#008B8B] font-black text-2xl">$</span>
                    <input required type="number" step="0.01" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl pl-12 pr-6 py-6 text-3xl font-black dark:text-white focus:ring-4 focus:ring-[#008B8B]/10 outline-none" placeholder="0.00" value={formData.totalAmount} onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold italic uppercase px-2">HST (15%) will be calculated by Admin.</p>
                </div>

                {/* Receipt Upload Dropzone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evidence / Receipt</label>
                  <div className={`relative h-32 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 ${formData.receipt ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-[#008B8B] hover:bg-[#008B8B]/5'}`}>
                    <input required type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setFormData({...formData, receipt: e.target.files[0]})} />
                    
                    {formData.receipt ? (
                      <div className="flex flex-col items-center text-emerald-600">
                        <CheckCircle2 size={24} className="mb-1" />
                        <p className="text-[10px] font-black uppercase truncate max-w-[150px]">{formData.receipt.name}</p>
                        <button type="button" onClick={() => setFormData({...formData, receipt: null})} className="mt-1 text-[8px] font-black text-rose-500 uppercase tracking-tighter">Remove</button>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">
                        <CloudUpload size={24} className="mx-auto mb-1" />
                        <p className="text-[10px] font-black uppercase">Click to Attach</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t dark:border-slate-800 flex flex-col sm:flex-row gap-4">
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-5 bg-[#008B8B] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#008B8B]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                  {isSubmitting ? "Processing..." : <><Save size={18} /> Submit Reimbursement Claim</>}
                </button>
              </div>
            </section>
          </form>
        </div>

        {/* 3. SIDEBAR: HISTORY */}
        <div className="space-y-6">
          <div className="bg-[#111827] rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
             <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} /> Claim History
                </h3>
             </div>
             <div className="divide-y divide-slate-800">
                <ClaimRow date="Feb 24" cat="Fuel" price="65.00" status="Approved" />
                <ClaimRow date="Feb 22" cat="Service" price="120.45" status="Pending" />
                <ClaimRow date="Feb 18" cat="Supplies" price="15.20" status="Approved" />
             </div>
             <div className="p-5">
               <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-2xl flex gap-3">
                  <Verified className="text-blue-500 shrink-0" size={16} />
                  <p className="text-[9px] text-blue-300 font-bold uppercase tracking-tight leading-relaxed">Claims are reviewed weekly by the central finance office.</p>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Sub-components
const ClaimRow = ({ date, cat, price, status }) => (
  <div className="p-6 flex justify-between items-center group cursor-pointer hover:bg-slate-800/40 transition-all">
    <div>
      <p className="text-xs font-black text-white uppercase italic tracking-tight">{cat}</p>
      <p className="text-[9px] font-black text-slate-500 uppercase mt-0.5">{date}</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-black text-white italic">${price}</p>
      <div className={`flex items-center justify-end gap-1 text-[8px] font-black uppercase mt-1 ${status === 'Approved' ? 'text-emerald-500' : 'text-orange-500'}`}>
        {status === 'Approved' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
        {status}
      </div>
    </div>
  </div>
);

const ExpenseInput = ({ label, type = "text", placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input required type={type} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 text-sm font-bold dark:text-white focus:ring-2 focus:ring-[#008B8B]/20 outline-none transition-all" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const ExpenseSelect = ({ label, options, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 text-sm font-bold dark:text-white focus:ring-2 focus:ring-[#008B8B]/20 outline-none appearance-none cursor-pointer" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default MyExpenses;