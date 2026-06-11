
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import { 
  Search, Mail, Download, Wallet, Banknote, 
  CreditCard, Settings, CalendarDays, FileDown, 
  ScanEye, Eye, X, ChevronDown, RefreshCw, 
  CheckCircle, XCircle, Clock, Filter, FileText,
  TrendingUp, TrendingDown, Sparkles
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

// KPI Card Component with Hover Effects
const KpiCard = ({ title, value, growth, icon, subtitle }) => {
  const isPositiveGrowth = growth && growth > 0;
  
  return (
    <div className="group relative overflow-hidden bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-transparent to-emerald-50 dark:from-teal-900/20 dark:via-transparent dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute -inset-1 bg-gradient-to-r from-teal-200/30 to-emerald-200/30 dark:from-teal-500/10 dark:to-emerald-500/10 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
      
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center mb-2 sm:mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/60 dark:to-teal-800/40 text-teal-600 dark:text-teal-400 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
              {React.cloneElement(icon, { size: 18, strokeWidth: 1.8 })}
            </div>
          </div>
        </div>
        
        <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {title}
        </p>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-emerald-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
          {value}
        </h3>
        
        {growth && (
          <div className={`flex items-center justify-center gap-1 mt-2 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[0.55rem] sm:text-xs font-bold font-mono transition-all duration-300 group-hover:scale-105 ${
            isPositiveGrowth 
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 group-hover:bg-green-200 dark:group-hover:bg-green-900/60'
              : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 group-hover:bg-red-200 dark:group-hover:bg-red-900/60'
          }`}>
            {isPositiveGrowth ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isPositiveGrowth ? '+' : ''}{growth}%
          </div>
        )}
        
        {subtitle && (
          <p className="text-[0.55rem] sm:text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Decorative corner sparkle */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles size={10} className="text-teal-400/60" />
      </div>
    </div>
  );
};

// Payment Details Modal Component
const PaymentDetailsModal = ({ payment, onClose }) => {
  const formatCAD = (amount) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount || 0);

  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-950 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Payment <span className="text-teal-600 dark:text-teal-400">Details</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Transaction #{payment.id || 'N/A'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Amount Section */}
          <div className="text-center border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Amount</p>
            <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">{formatCAD(payment.amount)}</p>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payment ID</span>
              <span className="text-sm font-medium text-slate-800 dark:text-white">{payment.id || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{payment.formatted_date || payment.date || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Name</span>
              <span className="text-sm font-medium text-slate-800 dark:text-white">{payment.student?.name || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{payment.student?.email || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{payment.package_name || payment.course || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction ID</span>
              <span className="text-sm font-mono text-slate-600 dark:text-slate-300">{payment.transaction_id || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payment Method</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{payment.method || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</span>
              <span className={`text-sm font-semibold ${
                payment.status === 'succeeded' ? 'text-green-600' :
                payment.status === 'pending' ? 'text-amber-600' :
                payment.status === 'failed' ? 'text-red-600' :
                'text-slate-600'
              }`}>
                {payment.status || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0">
          {payment.receipt_url && (
            <a 
              href={payment.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <FileText size={16} />
              View Receipt
            </a>
          )}
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-500/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [filteredRevenue, setFilteredRevenue] = useState(0);
  const [stats, setStats] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const limit = 10;

  // Template state
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

  // --- API FUNCTIONS ---
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const params = new URLSearchParams({
        page: currentPage,
        per_page: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filterDate !== 'all' && { filter_date: filterDate }),
        ...(filterDate === 'range' && startDate && { start_date: startDate }),
        ...(filterDate === 'range' && endDate && { end_date: endDate })
      });

      const response = await axios.get(`${API_BASE}/payments?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPayments(response.data.data);
        setTotalItems(response.data.meta.total);
        setFilteredRevenue(response.data.total_revenue);
      }
    } catch (error) {
      console.error("Payment Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterDate, startDate, endDate]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE}/payments/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data);
        setTotalRevenue(response.data.data.total_revenue);
      }
    } catch (error) {
      console.error("Stats Fetch Error:", error);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    setTemplateLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE}/templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTemplates(response.data.data);
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
        fetchTemplates();
      }
    } catch (error) {
      console.error("Template Update Error:", error);
      alert('Failed to update template');
    } finally {
      setTemplateUpdateLoading(false);
    }
  };

  const formatCAD = (amount) => new Intl.NumberFormat('en-CA', { 
    style: 'currency', 
    currency: 'CAD' 
  }).format(amount || 0);

  // Calculate growth percentage (mock calculation - you can adjust based on your data)
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Mock previous revenue for growth calculation (you can replace with actual data from API)
  const previousTotalRevenue = totalRevenue * 0.85; // Example: 15% less last month
  const previousTodayRevenue = stats?.today_revenue ? stats.today_revenue * 0.9 : 0;

  // --- HANDLERS ---
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  useEffect(() => {
    fetchPayments();
    fetchStats();
    fetchTemplates();
  }, [fetchPayments, fetchStats, fetchTemplates]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFilterDate = (filter) => {
    setFilterDate(filter);
    setCurrentPage(1);
  };

  const handleDownloadData = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(filterDate !== 'all' && { filter_date: filterDate }),
        ...(filterDate === 'range' && startDate && { start_date: startDate }),
        ...(filterDate === 'range' && endDate && { end_date: endDate })
      });

      const response = await axios.get(`${API_BASE}/payments/download?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
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

  const getStatusBadge = (status) => {
    switch(status) {
      case 'succeeded':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-[10px] font-bold uppercase"><CheckCircle size={10}/> Paid</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-bold uppercase"><Clock size={10}/> Pending</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold uppercase"><XCircle size={10}/> Failed</span>;
      case 'refunded':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-[10px] font-bold uppercase"><RefreshCw size={10}/> Refunded</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      {/* SCROLL ANCHOR */}
      <div ref={topRef} />
      
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-[1800px] mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
                Payment <span className="text-teal-600 dark:text-teal-400">Management</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                Manage and track all financial transactions, invoices, and payment history
              </p>
            </div>
            
            {/* Export Button */}
            <div className="flex justify-end w-full md:w-auto">
              <button 
                onClick={handleDownloadData}
                disabled={downloading || loading}
                className="w-full md:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-teal-600 hover:text-white dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {downloading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <FileDown size={18} />
                )}
                {downloading ? 'Exporting...' : 'Export All Payments'}
              </button>
            </div>
          </div>

          {/* KPI Cards - Only 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <KpiCard 
              title="Total Revenue"
              value={formatCAD(totalRevenue)}
              growth={calculateGrowth(totalRevenue, previousTotalRevenue)}
              icon={<Wallet />}
              subtitle="Lifetime revenue"
            />
            
            <KpiCard 
              title="Today"
              value={formatCAD(stats?.today_revenue || 0)}
              growth={calculateGrowth(stats?.today_revenue || 0, previousTodayRevenue)}
              icon={<CalendarDays />}
              subtitle="Today's transactions"
            />
            
            <KpiCard 
              title="Filtered Revenue"
              value={formatCAD(filteredRevenue)}
              icon={<Filter />}
              subtitle={filterDate === 'all' ? 'All time' : 
                        filterDate === 'today' ? 'Today only' :
                        filterDate === 'yesterday' ? 'Yesterday only' :
                        startDate && endDate ? `${startDate} to ${endDate}` : 'Custom range'}
            />
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col w-full lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4 mb-6">
            {/* Search Bar with Clear Button */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Transaction ID or Email..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-11 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
              />
              {/* Clear Button (X) - Only shows when there's text */}
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md text-slate-500 transition-colors"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
              {['all', 'today', 'yesterday', 'range'].map(t => (
                <button 
                  key={t} 
                  onClick={() => handleFilterDate(t)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    filterDate === t 
                      ? 'bg-teal-600 text-white shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-400 hover:text-teal-600'
                  }`}
                >
                  {t === 'range' ? 'Custom Range' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Range Date Picker */}
          {filterDate === "range" && (
            <div className="flex flex-col sm:flex-row items-center gap-3 p-5 mb-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <CalendarDays size={18} className="text-teal-500 shrink-0" />
              <div className="flex items-center gap-3 w-full">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }} 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                />
                <span className="text-slate-400 text-sm">→</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }} 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                />
              </div>
            </div>
          )}

          {/* DATA DISPLAY: TABLE (MD+) & CARDS (SM) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">ID / Date</th>
                    <th className="px-6 py-4 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Student</th>
                    <th className="px-6 py-4 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Transaction ID</th>
                    <th className="px-6 py-4 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Method</th>
                    <th className="px-6 py-4 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-6 py-4 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Amount</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr><td colSpan="7" className="py-16 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div></td></tr>
                  ) : payments.length === 0 ? (
                    <tr><td colSpan="7" className="py-16 text-center text-slate-500">No payments found</td></tr>
                  ) : (
                    payments.map(pay => (
                      <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="text-md font-bold text-slate-800 dark:text-white">#{pay.id}</div>
                          <div className="text-sm text-slate-500 mt-0.5">{pay.formatted_date}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-md font-semibold text-slate-800 dark:text-white">{pay.student.name}</div>
                          <div className="text-sm text-slate-500 mt-0.5">{pay.student.email}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-md font-mono font-medium text-slate-600 dark:text-slate-400">{pay.transaction_id}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-md font-medium text-slate-600 dark:text-slate-400">{pay.method}</span>
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge(pay.status)}
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-md font-bold text-teal-600 dark:text-teal-400">{formatCAD(pay.amount)}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button 
                            onClick={() => handleViewPayment(pay)}
                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all"
                            title="View Payment Details"
                          >
                            <ScanEye size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <div className="py-12 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div></div>
              ) : payments.length === 0 ? (
                <div className="py-12 text-center text-slate-500">No payments found</div>
              ) : (
                payments.map(pay => (
                  <div key={pay.id} className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-mono text-slate-400">#{pay.id} • {pay.formatted_date}</div>
                        <div className="text-base font-bold text-slate-800 dark:text-white mt-1">{pay.student.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{pay.student.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-teal-600 dark:text-teal-400">{formatCAD(pay.amount)}</div>
                        <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">{pay.method}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-400 truncate flex-1 mr-2">
                        {pay.transaction_id}
                      </div>
                      {getStatusBadge(pay.status)}
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={() => handleViewPayment(pay)}
                        className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <ScanEye size={18} /> View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-center">
              <Pagination 
                currentPage={currentPage} 
                totalItems={totalItems} 
                itemsPerPage={limit} 
                onPageChange={handlePageChange} 
              />
            </div>
          </div>

          {/* Template Editor Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Mail size={18} className="text-teal-500" />
                Payment Receipt Email Template
              </h3>
              <button
                onClick={() => setShowTemplateEditor(!showTemplateEditor)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-teal-700 transition"
              >
                {showTemplateEditor ? 'Hide Editor' : 'Edit Template'}
              </button>
            </div>

            {showTemplateEditor && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {templateLoading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
                  </div>
                ) : selectedTemplate ? (
                  <form onSubmit={handleUpdateTemplate} className="p-6 space-y-6">
                    {/* Template Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-teal-50 dark:bg-teal-950/20 rounded-xl gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Current Template</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{selectedTemplate.name}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Available Placeholders</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {['{student_name}', '{amount}', '{course_name}', '{transaction_id}', '{remaining_balance}'].map(tag => (
                            <span key={tag} className="px-2 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded text-[8px] font-mono">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Subject Line */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>

                    {/* Email Body */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Email Body (HTML supported)
                      </label>
                      <textarea
                        value={templateForm.email_body}
                        onChange={(e) => setTemplateForm({...templateForm, email_body: e.target.value})}
                        rows="10"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>

                    {/* SMS Body */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        SMS Body (Optional)
                      </label>
                      <textarea
                        value={templateForm.sms_body}
                        onChange={(e) => setTemplateForm({...templateForm, sms_body: e.target.value})}
                        rows="3"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-teal-950/20 dark:to-indigo-950/20 rounded-xl">
                      <p className="text-[9px] font-bold text-teal-600 uppercase tracking-wider mb-2">Live Preview</p>
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-teal-100 dark:border-teal-900/40">
                        <p className="text-xs font-bold text-teal-600 mb-2">
                          {templateForm.subject.replace(/{transaction_id}/g, 'TXN-12345')}
                        </p>
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
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowTemplateEditor(false)}
                        className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={templateUpdateLoading}
                        className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-teal-700 transition disabled:opacity-50 flex items-center gap-2"
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

      {/* Payment Details Modal */}
      {isModalOpen && selectedPayment && (
        <PaymentDetailsModal 
          payment={selectedPayment}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
};

export default Payments;