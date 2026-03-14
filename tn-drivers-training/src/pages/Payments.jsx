
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import { 
  Download, Wallet, CalendarDays, 
  RefreshCw, Eye, CheckCircle,
  XCircle, Clock, Filter, FileText,Mail  
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

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
  const [downloading, setDownloading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [filterMethod, setFilterMethod] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [stats, setStats] = useState(null);

  const limit = 10;

  const [templates, setTemplates] = useState([]);
const [selectedTemplate, setSelectedTemplate] = useState(null);
const [templateLoading, setTemplateLoading] = useState(false);
const [templateUpdateLoading, setTemplateUpdateLoading] = useState(false);
const [showTemplateEditor, setShowTemplateEditor] = useState(false);
const [templateForm, setTemplateForm] = useState({
  subject: '',
  email_body: '',
  sms_body: ''
});
  // --- FETCH PAYMENTS FROM API ---
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        per_page: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filterDate && { filter_date: filterDate }),
        ...(filterDate === 'range' && startDate && { start_date: startDate }),
        ...(filterDate === 'range' && endDate && { end_date: endDate }),
        ...(filterMethod && { method: filterMethod }),
        ...(filterStatus && { status: filterStatus })
      });

      const response = await axios.get(`${API_BASE}/payments?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPayments(response.data.data);
        setTotalItems(response.data.meta.total);
        setTotalRevenue(response.data.total_revenue);
      }
    } catch (error) {
      console.error("Payment Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterDate, startDate, endDate, filterMethod, filterStatus]);

  // --- FETCH PAYMENT STATS ---
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE}/payments/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Stats Fetch Error:", error);
    }
  }, []);
  // Fetch email templates
const fetchTemplates = useCallback(async () => {
  setTemplateLoading(true);
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_BASE}/templates`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      setTemplates(response.data.data);
      // Find payment receipt template
      const paymentTemplate = response.data.data.find(t => 
        t.slug === 'payment_confirmation' || t.slug === 'payment_receipt'
      );
      if (paymentTemplate) {
        setSelectedTemplate(paymentTemplate);
        setTemplateForm({
          subject: paymentTemplate.subject,
          email_body: paymentTemplate.email_body,
          sms_body: paymentTemplate.sms_body || ''
        });
      }
    }
  } catch (error) {
    console.error("Template Fetch Error:", error);
  } finally {
    setTemplateLoading(false);
  }
}, []);

// Update template
const handleUpdateTemplate = async (e) => {
  e.preventDefault();
  if (!selectedTemplate) return;
  
  setTemplateUpdateLoading(true);
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.put(`${API_BASE}/templates/${selectedTemplate.id}`, templateForm, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      alert('Template updated successfully!');
      fetchTemplates(); // Refresh templates
    }
  } catch (error) {
    console.error("Template Update Error:", error);
    alert('Failed to update template');
  } finally {
    setTemplateUpdateLoading(false);
  }
};

// Call fetchTemplates in useEffect
useEffect(() => {
  fetchPayments();
  fetchStats();
  fetchTemplates(); // Add this
}, [fetchPayments, fetchStats, fetchTemplates]);

  const formatCAD = (amount) => new Intl.NumberFormat('en-CA', { 
    style: 'currency', 
    currency: 'CAD' 
  }).format(amount);

  // --- SCROLL TO TOP ON PAGE CHANGE ---
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [fetchPayments, fetchStats]);

  // --- HANDLE SEARCH ---
  const handleSearch = useCallback((val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  }, []);

  // --- HANDLE PAGE CHANGE ---
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  // --- HANDLE FILTER CHANGE ---
  const handleFilterDate = (filter) => {
    setFilterDate(filter);
    setCurrentPage(1);
  };

  // --- HANDLE DOWNLOAD DATA ---
  const handleDownloadData = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Build query parameters for download (no pagination)
      const params = new URLSearchParams({
        download: 'true',
        ...(searchTerm && { search: searchTerm }),
        ...(filterDate && { filter_date: filterDate }),
        ...(filterDate === 'range' && startDate && { start_date: startDate }),
        ...(filterDate === 'range' && endDate && { end_date: endDate }),
        ...(filterMethod && { method: filterMethod }),
        ...(filterStatus && { status: filterStatus })
      });

      const response = await axios.get(`${API_BASE}/payments/download?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Important for file download
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on date range
      let filename = 'payments_';
      if (filterDate === 'today') {
        filename += new Date().toISOString().split('T')[0];
      } else if (filterDate === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        filename += yesterday.toISOString().split('T')[0];
      } else if (filterDate === 'range' && startDate && endDate) {
        filename += `${startDate}_to_${endDate}`;
      } else {
        filename += 'all_' + new Date().toISOString().split('T')[0];
      }
      filename += '.csv';
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error("Download Error:", error);
      alert("Failed to download data");
    } finally {
      setDownloading(false);
    }
  };

  // --- GET STATUS BADGE COLOR ---
  const getStatusBadge = (status) => {
    switch(status) {
      case 'succeeded':
        return <span className="px-2 py-1 bg-green-100 text-green-600 rounded-lg text-[9px] font-black uppercase flex items-center gap-1"><CheckCircle size={10}/> Paid</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-lg text-[9px] font-black uppercase flex items-center gap-1"><Clock size={10}/> Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-[9px] font-black uppercase flex items-center gap-1"><XCircle size={10}/> Failed</span>;
      case 'refunded':
        return <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-lg text-[9px] font-black uppercase flex items-center gap-1"><RefreshCw size={10}/> Refunded</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-black uppercase">{status}</span>;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors font-sans overflow-x-hidden">
      {/* SCROLL ANCHOR */}
      <div ref={topRef} />
      
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* STATS CARDS */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200 dark:border-gray-800">
              <p className="text-[9px] font-black text-slate-400 uppercase">Total Revenue</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{formatCAD(stats.total_revenue)}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200 dark:border-gray-800">
              <p className="text-[9px] font-black text-slate-400 uppercase">Today</p>
              <p className="text-xl font-black text-teal-600">{formatCAD(stats.today_revenue)}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200 dark:border-gray-800">
              <p className="text-[9px] font-black text-slate-400 uppercase">This Week</p>
              <p className="text-xl font-black text-indigo-600">{formatCAD(stats.weekly_revenue)}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-200 dark:border-gray-800">
              <p className="text-[9px] font-black text-slate-400 uppercase">This Month</p>
              <p className="text-xl font-black text-amber-600">{formatCAD(stats.monthly_revenue)}</p>
            </div>
          </div>
        )}
        
        {/* HEADER SECTION: REVENUE & DOWNLOAD */}
        <div className="w-full flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 mb-8 md:mb-12">
          <div className="flex items-center gap-4 sm:gap-6 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-3xl sm:rounded-[2.5rem] border border-slate-200 dark:border-gray-800 shadow-xl w-full md:w-auto">
            <div className="h-12 w-12 sm:h-14 sm:w-14 bg-teal-500/10 text-teal-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shrink-0">
              <Wallet size={24} className="sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                {filterDate === 'all' ? 'Total Revenue' : 
                 filterDate === 'today' ? "Today's Revenue" :
                 filterDate === 'yesterday' ? "Yesterday's Revenue" :
                 'Filtered Revenue'}
              </p>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white transition-all truncate">
                {loading ? "..." : formatCAD(totalRevenue)}
              </h2>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownloadData}
            disabled={downloading || loading}
            className="flex items-center justify-center gap-3 bg-white dark:bg-gray-900 px-8 py-4 sm:py-6 rounded-3xl sm:rounded-[2.5rem] border border-slate-200 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all w-full md:w-auto group disabled:opacity-50"
          >
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
              {downloading ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Download size={20} />
              )}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {filterDate === 'range' ? 'Export Range' : 'Export Data'}
              </span>
              <span className="text-sm font-bold dark:text-white">
                {downloading ? 'Processing...' : 'Download CSV'}
              </span>
            </div>
          </button>
        </div>

        {/* FILTERS & SEARCH */}
        <div className="w-full space-y-4 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="w-full lg:col-span-2">
              <SearchBar onSearch={handleSearch} placeholder="Search by Transaction ID / Student / Email" />
            </div>
            <div className="w-full lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'all', label: 'All Time' },
                { key: 'today', label: 'Today' },
                { key: 'yesterday', label: 'Yesterday' },
                { key: 'range', label: 'Custom Range' }
              ].map(t => (
                <button 
                  key={t.key} 
                  onClick={() => handleFilterDate(t.key)}
                  className={`w-full py-3 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                    filterDate === t.key 
                      ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20' 
                      : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 text-slate-500 hover:border-teal-500/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select 
              value={filterMethod} 
              onChange={(e) => {
                setFilterMethod(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Payment Methods</option>
              <option value="Cash">Cash</option>
              <option value="E-Transfer">E-Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
            </select>

            <select 
              value={filterStatus} 
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Payment Status</option>
              <option value="succeeded">Succeeded / Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <button 
              onClick={() => {
                setFilterMethod('');
                setFilterStatus('');
                setFilterDate('all');
                setSearchTerm('');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition flex items-center justify-center gap-2"
            >
              <Filter size={14} />
              Clear All Filters
            </button>
          </div>

          {filterDate === "range" && (
            <div className="w-full flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <CalendarDays className="text-teal-500 shrink-0" size={20} />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Range</span>
              </div>
              <div className="flex items-center gap-2 w-full">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }} 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800 text-[10px] sm:text-xs dark:text-white outline-none focus:ring-2 focus:ring-teal-500" 
                />
                <span className="text-slate-400 font-bold">→</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }} 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800 text-[10px] sm:text-xs dark:text-white outline-none focus:ring-2 focus:ring-teal-500" 
                />
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
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6">Amount</th>
                  {/* <th className="px-8 py-6 text-right">Actions</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan="7" className="py-24 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div></td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan="7" className="py-24 text-center text-slate-500">No payments found</td></tr>
                ) : (
                  payments.map(pay => (
                    <tr key={pay.id} className="group hover:bg-slate-50/50 dark:hover:bg-gray-800/20 transition-all">
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold dark:text-white">#{pay.id}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{pay.formatted_date}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-800 dark:text-gray-200 text-sm truncate max-w-37.5">{pay.student.name}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-37.5">{pay.student.email}</div>
                      </td>
                      <td className="px-8 py-5 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">{pay.transaction_id}</td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-600 dark:text-gray-400">{pay.method}</td>
                      <td className="px-8 py-5">{getStatusBadge(pay.status)}</td>
                      <td className="px-8 py-5 font-black text-slate-900 dark:text-white">{formatCAD(pay.amount)}</td>
                      {/* <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => window.open(`/receipts/${pay.id}`, '_blank')}
                          className="p-2 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-xl transition-all border border-indigo-50 dark:border-indigo-900/30 active:scale-95"
                          title="View Receipt"
                        >
                          <FileText size={16}/>
                        </button>
                      </td> */}
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
             ) : payments.length === 0 ? (
               <div className="py-20 text-center text-slate-500">No payments found</div>
             ) : (
               payments.map(pay => (
                 <div key={pay.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">#{pay.id} • {pay.formatted_date}</div>
                        <div className="font-bold text-slate-900 dark:text-white">{pay.student.name}</div>
                        <div className="text-[9px] text-slate-500">{pay.student.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-teal-600">{formatCAD(pay.amount)}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">{pay.method}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] font-mono bg-slate-100 dark:bg-gray-800 p-2 rounded-lg text-slate-500 dark:text-slate-400 truncate flex-1 mr-2">
                        {pay.transaction_id}
                      </div>
                      {getStatusBadge(pay.status)}
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        onClick={() => window.open(`/receipts/${pay.id}`, '_blank')}
                        className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-indigo-100 dark:border-indigo-900/40"
                      >
                        <FileText size={12}/> View Receipt
                      </button>
                    </div>
                 </div>
               ))
             )}
          </div>

          {/* Pagination */}
          <div className="p-4 sm:p-8 border-t border-slate-50 dark:border-gray-800 flex justify-center">
            <Pagination 
              currentPage={currentPage} 
              totalItems={totalItems} 
              itemsPerPage={limit} 
              onPageChange={handlePageChange} 
            />
          </div>
        </div>

        {/* Export Summary */}
        <div className="w-full bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-900 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center">
              <Download size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-indigo-600 uppercase tracking-wider">Export Payment Data</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Click the download button to export all payments matching your current filters as a CSV file.
                {filterDate === 'range' && startDate && endDate && (
                  <span className="block mt-1 font-bold">
                    Exporting data from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

{/* //template  */}
{/* Email Template Editor Section */}
<div className="w-full mt-8">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
      <Mail size={20} className="text-indigo-600" />
      Payment Receipt Email Template
    </h3>
    <button
      onClick={() => setShowTemplateEditor(!showTemplateEditor)}
      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition"
    >
      {showTemplateEditor ? 'Hide Editor' : 'Edit Template'}
    </button>
  </div>

  {showTemplateEditor && (
    <div className="w-full bg-white dark:bg-gray-900 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-xl overflow-hidden">
      {templateLoading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : selectedTemplate ? (
        <form onSubmit={handleUpdateTemplate} className="p-6 space-y-6">
          {/* Template Info */}
          <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl">
            <div>
              <p className="text-xs font-black text-indigo-600 uppercase tracking-wider">Current Template</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{selectedTemplate.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Available Placeholders</p>
              <div className="flex gap-2 mt-1">
                {['{student_name}', '{amount}', '{course_name}', '{transaction_id}', '{remaining_balance}'].map(tag => (
                  <span key={tag} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded text-[8px] font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={templateForm.subject}
              onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Email Body */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
              Email Body (HTML supported)
            </label>
            <textarea
              value={templateForm.email_body}
              onChange={(e) => setTemplateForm({...templateForm, email_body: e.target.value})}
              rows="10"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* SMS Body */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
              SMS Body (Optional)
            </label>
            <textarea
              value={templateForm.sms_body}
              onChange={(e) => setTemplateForm({...templateForm, sms_body: e.target.value})}
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Preview */}
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl">
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-wider mb-2">Live Preview</p>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
              <p className="text-xs font-bold text-indigo-600 mb-2">{templateForm.subject.replace('{transaction_id}', 'TXN-12345')}</p>
              <div className="text-sm text-slate-600 dark:text-slate-400 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: templateForm.email_body
                    .replace(/{student_name}/g, 'John Doe')
                    .replace(/{amount}/g, '$150.00')
                    .replace(/{course_name}/g, 'Full G License Bundle')
                    .replace(/{transaction_id}/g, 'TXN-12345')
                    .replace(/{remaining_balance}/g, '$350.00')
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setShowTemplateEditor(false)}
              className="px-6 py-3 rounded-xl border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={templateUpdateLoading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {templateUpdateLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Template'
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-12 text-center">
          <p className="text-slate-500">No payment receipt template found. Please create one first.</p>
        </div>
      )}
    </div>
  )}
</div>

      </div>
    </div>
  );
};

export default Payments;