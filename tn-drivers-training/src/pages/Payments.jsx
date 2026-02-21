import React, { useState, useEffect, useCallback, useRef } from "react";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import { 
  Mail, Download, Wallet, Banknote, 
  CreditCard, Settings, BellRing, BellOff, CalendarDays 
} from "lucide-react";

const Payments = () => {
  // --- REF FOR SCROLL TARGET ---
  const topRef = useRef(null);

  // --- SERVER-SIDE STATE ---
  const [payments, setPayments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("all");
  const [startDate, setStartDate] = useState(""); 
  const [endDate, setEndDate] = useState("");     
  const [loading, setLoading] = useState(false);
  const [exactRevenue, setExactRevenue] = useState(0);

  const limit = 10;
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [emailTemplate, setEmailTemplate] = useState(
    "Hi {name}, thank you for your payment of {amount} for the {course}. Your transaction ID is {txId}. You can download your receipt here: {link}"
  );

  const formatCAD = (amount) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount);

  // --- FIXED: SCROLL TO TOP ON PAGE CHANGE ---
  // Uses THREE strategies to guarantee scroll works in any layout
  useEffect(() => {
    // Strategy 1: Scroll the ref element into view (most reliable)
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Strategy 2: Scroll window (works if window is the scroll container)
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Strategy 3: Find and scroll any parent scrollable container
    // This catches dashboard layouts where a wrapper div is the scroll container
    const scrollableParent = findScrollableParent(topRef.current);
    if (scrollableParent && scrollableParent !== document.documentElement) {
      scrollableParent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  // Helper: walk up the DOM to find the actual scrolling container
  const findScrollableParent = (element) => {
    if (!element) return null;
    let parent = element.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      const overflowY = style.overflowY;
      if (
        (overflowY === 'auto' || overflowY === 'scroll') &&
        parent.scrollHeight > parent.clientHeight
      ) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return document.documentElement;
  };

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); 
      const mockData = Array.from({ length: limit }, (_, i) => ({
        id: 2000 + i + (currentPage * limit),
        studentName: ["Alex Rivera", "Sam Chen", "Jordan Smith", "Maria Garcia", "Yuki Tanaka"][i % 5],
        course: "Class 5 GDL Package",
        amount: 450.00,
        method: i % 3 === 0 ? "Cash" : "Interac e-Transfer",
        transactionId: i % 3 === 0 ? `RCPT-${i}-CSH` : `TXN-${i}VXB7`,
        date: new Date().toISOString().split('T')[0],
        email: "student@example.ca"
      }));
      setPayments(mockData);
      setTotalItems(120); 
      setExactRevenue(filterDate === 'all' ? 45200.50 : 12450.00); 
    } catch (error) {
      console.error("Payment Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterDate, startDate, endDate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSearch = useCallback((val) => {
    setSearchTerm(val);
    setCurrentPage(1); 
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleSendInvoice = (pay) => {
    const message = emailTemplate
      .replace("{name}", pay.studentName)
      .replace("{amount}", formatCAD(pay.amount))
      .replace("{course}", pay.course)
      .replace("{txId}", pay.transactionId)
      .replace("{link}", "www.drive-academy.ca/receipts/" + pay.id);

    window.location.href = `mailto:${pay.email}?subject=Payment Receipt&body=${encodeURIComponent(message)}`;
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors font-sans overflow-x-hidden">
      {/* SCROLL ANCHOR - This is what we scroll to */}
      <div ref={topRef} />
      
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* HEADER SECTION: REVENUE & TOGGLE */}
        <div className="w-full flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 mb-8 md:mb-12">
          <div className="flex items-center gap-4 sm:gap-6 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-3xl sm:rounded-[2.5rem] border border-slate-200 dark:border-gray-800 shadow-xl w-full md:w-auto">
            <div className="h-12 w-12 sm:h-14 sm:w-14 bg-teal-500/10 text-teal-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shrink-0">
              <Wallet size={24} className="sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                {filterDate === 'all' ? 'Total Revenue' : `${filterDate} Revenue`}
              </p>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white transition-all truncate">
                {loading ? "..." : formatCAD(exactRevenue)}
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 bg-white dark:bg-gray-900 px-6 py-4 sm:py-6 rounded-3xl sm:rounded-[2.5rem] border border-slate-200 dark:border-gray-800 shadow-sm w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${autoInvoice ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {autoInvoice ? <BellRing size={18} /> : <BellOff size={18} />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Auto-Invoice</span>
                <span className="text-xs font-bold dark:text-white">{autoInvoice ? "Active" : "Disabled"}</span>
              </div>
            </div>
            <button onClick={() => setAutoInvoice(!autoInvoice)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${autoInvoice ? 'bg-teal-500' : 'bg-slate-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoInvoice ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* FILTERS & SEARCH */}
        <div className="w-full space-y-4 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="w-full lg:col-span-2">
              <SearchBar onSearch={handleSearch} placeholder="Search by Transaction ID / Email" />
            </div>
            <div className="w-full lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
               {['all', 'today', 'yesterday', 'range'].map(t => (
                 <button key={t} onClick={() => {setFilterDate(t); setCurrentPage(1);}}
                  className={`w-full py-3 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${filterDate === t ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 text-slate-500 hover:border-teal-500/50'}`}
                 >
                   {t}
                 </button>
               ))}
            </div>
          </div>

          {filterDate === "range" && (
            <div className="w-full flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <CalendarDays className="text-teal-500 shrink-0" size={20} />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dates</span>
              </div>
              <div className="flex items-center gap-2 w-full">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800 text-[10px] sm:text-xs dark:text-white outline-none" />
                <span className="text-slate-400 font-bold">→</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800 text-[10px] sm:text-xs dark:text-white outline-none" />
              </div>
            </div>
          )}
        </div>

        {/* DATA DISPLAY: TABLE (MD+) & CARDS (SM) */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-3xl sm:rounded-[2.5rem] border border-slate-200 dark:border-gray-800 shadow-xl overflow-hidden mb-12">
          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-gray-800/40 border-b border-slate-100 dark:border-gray-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-6">ID / Date</th>
                  <th className="px-8 py-6">Student</th>
                  <th className="px-8 py-6">TXN ID</th>
                  <th className="px-8 py-6">Method</th>
                  <th className="px-8 py-6">Amount</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan="6" className="py-24 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div></td></tr>
                ) : (
                  payments.map(pay => (
                    <tr key={pay.id} className="group hover:bg-slate-50/50 dark:hover:bg-gray-800/20 transition-all">
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold dark:text-white">#{pay.id}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{pay.date}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-800 dark:text-gray-200 text-sm truncate max-w-37.5">{pay.studentName}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-37.5">{pay.email}</div>
                      </td>
                      <td className="px-8 py-5 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">{pay.transactionId}</td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-600 dark:text-gray-400">{pay.method}</td>
                      <td className="px-8 py-5 font-black text-slate-900 dark:text-white">{formatCAD(pay.amount)}</td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleSendInvoice(pay)} className="p-2 text-teal-600 hover:bg-teal-500 hover:text-white rounded-xl transition-all border border-teal-50 dark:border-teal-900/30 active:scale-95"><Mail size={16}/></button>
                          <button className="p-2 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all border border-slate-100 dark:border-gray-800 active:scale-95"><Download size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-gray-800">
             {loading ? (
               <div className="py-20 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div></div>
             ) : (
               payments.map(pay => (
                 <div key={pay.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">#{pay.id} • {pay.date}</div>
                        <div className="font-bold text-slate-900 dark:text-white">{pay.studentName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-teal-600">{formatCAD(pay.amount)}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">{pay.method}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono bg-slate-100 dark:bg-gray-800 p-2 rounded-lg text-slate-500 dark:text-slate-400 truncate">
                      {pay.transactionId}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleSendInvoice(pay)} className="flex-1 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-teal-100 dark:border-teal-900/40">
                        <Mail size={12}/> Email
                      </button>
                      <button className="flex-1 py-2 bg-slate-50 dark:bg-gray-800 text-slate-600 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-slate-200 dark:border-gray-700">
                        <Download size={12}/> Receipt
                      </button>
                    </div>
                 </div>
               ))
             )}
          </div>

          <div className="p-4 sm:p-8 border-t border-slate-50 dark:border-gray-800 flex justify-center">
            <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={limit} onPageChange={handlePageChange} />
          </div>
        </div>

        {/* EDITOR & PREVIEW SECTION */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          <div className="w-full lg:col-span-2 bg-white dark:bg-gray-900 p-6 sm:p-8 lg:p-10 rounded-3xl sm:rounded-[3rem] border border-slate-200 dark:border-gray-800 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <Settings size={20} className="text-indigo-600 shrink-0"/>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase italic truncate">Template Editor</h3>
            </div>
            <textarea className="w-full h-40 p-5 rounded-2xl sm:rounded-4xl bg-slate-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-600 dark:text-gray-300 resize-none shadow-inner transition-all" value={emailTemplate} onChange={(e) => setEmailTemplate(e.target.value)} />
            <div className="mt-4 flex flex-wrap gap-2">
              {['{name}', '{amount}', '{course}', '{txId}'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase">{tag}</span>
              ))}
            </div>
          </div>
          <div className="w-full bg-indigo-600 p-8 sm:p-10 rounded-3xl sm:rounded-[3rem] text-white shadow-2xl relative flex flex-col justify-center min-h-62.5 overflow-hidden">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">Live Preview</h4>
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 text-sm italic opacity-95 line-clamp-6">
                "{emailTemplate.replace('{name}', 'Alex Rivera').replace('{amount}', '$450.00').replace('{course}', 'Class 5 GDL')}"
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;