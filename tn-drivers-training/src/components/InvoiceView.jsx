import React, { useState } from "react";
import { 
  Receipt, Mail, MessageSquare, Check, 
  Smartphone, CreditCard, Banknote, X 
} from "lucide-react";
import { calculateCanadianInvoice } from "../utils/taxLogic";

const InvoiceView = ({ student, pkg, province = "NL", onConfirm, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState("Interac e-Transfer");
  const [deliveryStatus, setDeliveryStatus] = useState(null); // 'email' or 'sms'
  
  const invoice = calculateCanadianInvoice(pkg.price, province);

  // Helper to simulate sending
  const handleDelivery = (type) => {
    setDeliveryStatus(type);
    const contact = type === 'email' ? student.email : student.phone;
    
    // Logic: In production, this would hit a SendGrid (Email) or Twilio (SMS) API
    console.log(`Sending Invoice to ${contact} via ${type}...`);
    
    setTimeout(() => {
      alert(`Invoice successfully sent to ${contact}`);
      setDeliveryStatus(null);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
      
      {/* 1. TOP HEADER: BRANDING & CONTACT */}
      <div className="p-8 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Receipt size={20} />
              <span className="font-black uppercase tracking-[0.2em] text-[10px]">Tax Invoice</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase">Drive <span className="text-indigo-600">Academy</span></h2>
          </div>
          <div className="text-right text-[10px] font-black text-slate-400 uppercase leading-relaxed">
            <p>Invoice #INV-{Math.floor(Math.random() * 9000 + 1000)}</p>
            <p>{new Date().toLocaleDateString('en-CA')}</p>
          </div>
        </div>

        {/* Student Contact Info (Registered Details) */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bill To</p>
             <p className="text-xs font-black text-slate-700 dark:text-slate-200">{student?.name || "Unregistered Student"}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email</p>
             <p className="text-xs font-bold text-slate-500">{student?.email || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* 2. FINANCIAL BREAKDOWN */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold text-slate-500">
            <span>{pkg.name} ({pkg.hours} Hours)</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-400">
            <span>{invoice.taxName} ({(invoice.taxRate * 100)}%)</span>
            <span>${invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />
          <div className="flex justify-between items-center">
            <span className="text-lg font-black text-slate-900 dark:text-white italic uppercase">Total Due (CAD)</span>
            <span className="text-3xl font-black text-indigo-600">{invoice.formattedTotal}</span>
          </div>
        </div>

        {/* 3. DELIVERY OPTIONS (The Missing Options) */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleDelivery('email')}
            disabled={!student?.email}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30"
          >
            {deliveryStatus === 'email' ? <Check size={16}/> : <Mail size={16}/>}
            Send via Email
          </button>
          <button 
            onClick={() => handleDelivery('sms')}
            disabled={!student?.phone}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-green-100 dark:border-green-900 text-green-600 font-black text-[10px] uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all disabled:opacity-30"
          >
            {deliveryStatus === 'sms' ? <Check size={16}/> : <MessageSquare size={16}/>}
            Send via WhatsApp
          </button>
        </div>

        {/* 4. PAYMENT METHOD (For internal tracking) */}
        <div className="space-y-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Expected Payment Method</p>
          <div className="flex gap-2">
            {['Interac', 'Credit Card', 'Cash'].map(m => (
              <button 
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${paymentMethod === m ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* 5. FINAL CONFIRMATION */}
        <button 
          onClick={() => onConfirm({ ...invoice, paymentMethod, studentId: student.id })}
          className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all"
        >
          Confirm & Log Transaction
        </button>
      </div>
    </div>
  );
};

export default InvoiceView;