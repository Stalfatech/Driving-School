import React from "react";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";

const ReceivablesTable = () => {
  // Mock data - in a real app, this comes from your database
  const receivables = [
    { id: 1, name: "Jordan Smith", packageName: "Pro Highway", totalWithTax: 920.00, paid: 400.00, phone: "7095550123" },
    { id: 2, name: "Sam Chen", packageName: "Basic Starter", totalWithTax: 517.50, paid: 0, phone: "7095550456" },
  ];

  const handleSendSMS = (student) => {
    // Logic for automated SMS reminder
    const balance = (student.totalWithTax - student.paid).toFixed(2);
    const message = `Hi ${student.name}, this is Drive Academy. You have an outstanding balance of $${balance}. Please Interac e-Transfer to pay@drive-academy.ca. Thanks!`;
    
    // In production, you'd call your API here (Twilio/AWS SNS)
    console.log("Sending SMS:", message);
    alert(`SMS Sent to ${student.name}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl">
      <table className="w-full text-left">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Student</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Total CAD</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Balance Due</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {receivables.map((item) => {
            const balance = item.totalWithTax - item.paid;
            return (
              <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-8 py-5">
                  <p className="font-black text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.packageName}</p>
                </td>
                <td className="px-8 py-5 text-sm font-bold text-slate-500">${item.totalWithTax.toFixed(2)}</td>
                <td className="px-8 py-5">
                  {balance > 0 ? (
                    <div className="flex items-center gap-2 text-red-500 font-black">
                      <AlertCircle size={14} /> ${balance.toFixed(2)}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-teal-500 font-black">
                      <CheckCircle2 size={14} /> PAID
                    </div>
                  )}
                </td>
                <td className="px-8 py-5 text-right">
                  {balance > 0 && (
                    <button 
                      onClick={() => handleSendSMS(item)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:translate-y-[-2px] transition-all"
                    >
                      <Send size={12} className="inline mr-2" /> Send SMS
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReceivablesTable;