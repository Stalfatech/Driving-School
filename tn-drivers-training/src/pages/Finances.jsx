import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Download, CheckCircle, Filter, 
  RotateCw, ScanEye, X, FileText, AlertCircle, 
  HelpCircle, Receipt, Plus, Save, Loader2, 
  Tag, AlignLeft, ChevronDown, ChevronUp, 
  MapPin, Mail, Phone, Calendar, Copy
} from 'lucide-react';
import axios from 'axios';
import Pagination from '../components/Pagination';

const API_BASE = "http://localhost:8000/api";

// Export Options Modal Component
const ExportOptionsModal = ({ isOpen, onClose, onDownloadCSV, onCopyClipboard, downloading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-500 to-emerald-500">
          <h3 className="text-lg font-bold text-white">Export Options</h3>
          <p className="text-sm text-teal-100 mt-1">Choose how to export your filtered expenses</p>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3">
          {/* CSV Download */}
          <button 
            onClick={onDownloadCSV}
            disabled={downloading}
            className="w-full p-4 rounded-xl border-2 border-teal-200 dark:border-teal-900 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all text-left disabled:opacity-50"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                <Download size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Download as CSV</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Opens in Excel, Google Sheets, etc.</p>
              </div>
            </div>
          </button>

          {/* Copy to Clipboard */}
          <button 
            onClick={onCopyClipboard}
            disabled={downloading}
            className="w-full p-4 rounded-xl border-2 border-amber-200 dark:border-amber-900 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all text-left disabled:opacity-50"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                <Copy size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Copy to Clipboard</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Paste into Excel or text editor</p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={onClose}
            disabled={downloading}
            className="w-full px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium text-sm transition-all disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Finances = () => {
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [expenses, setExpenses] = useState([]);
  
  // Search state variables
  const [searchInput, setSearchInput] = useState(''); 
  const [searchTerm, setSearchTerm] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Filter options state
  const [categories, setCategories] = useState(['All']);
  const [locations, setLocations] = useState(['All']);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString.split('T')[0] || 'N/A';
    }
  };

  // Helper function to get instructor location
  const getInstructorLocation = (expense) => {
    if (expense.location) return expense.location;
    if (expense.instructor?.location) {
      if (typeof expense.instructor.location === 'string') return expense.instructor.location;
      if (expense.instructor.location.name) return expense.instructor.location.name;
      if (expense.instructor.location.province_name) return expense.instructor.location.province_name;
    }
    if (expense.instructor?.branch) return expense.instructor.branch;
    if (expense.instructor?.assigned_location) return expense.instructor.assigned_location;
    return 'Not Assigned';
  };

  // Helper function to get the correct receipt URL
  const getReceiptUrl = (receiptPath) => {
    if (!receiptPath) return null;
    
    if (receiptPath.startsWith('http')) {
      return receiptPath;
    }
    
    if (receiptPath.startsWith('/storage/')) {
      return `http://localhost:8000${receiptPath}`;
    }
    
    if (receiptPath.startsWith('storage/')) {
      return `http://localhost:8000/${receiptPath}`;
    }
    
    let cleanPath = receiptPath.replace(/^\/?(public\/)?/i, '');
    return `http://localhost:8000/storage/${cleanPath}`;
  };

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only trigger if the input actually changed
      if (searchTerm !== searchInput) {
        setSearchTerm(searchInput);
        setCurrentPage(1);
      }
    }, 500); // Waits half a second after you stop typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, searchTerm]);

  // Fetch all claims with pagination and filters
  const fetchAllClaims = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('per_page', itemsPerPage);
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (statusFilter !== 'All') {
        params.append('status', statusFilter.toLowerCase());
      }
      if (categoryFilter !== 'All') {
        params.append('category', categoryFilter);
      }
      if (locationFilter !== 'All') {
        params.append('location', locationFilter);
      }
      
      const res = await axios.get(`${API_BASE}/admin/expenses/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        const processedExpenses = res.data.data.map(exp => ({
          ...exp,
          displayLocation: getInstructorLocation(exp)
        }));
        setExpenses(processedExpenses);
        setTotalItems(res.data.meta?.total || 0);
        setTotalPages(res.data.meta?.last_page || 1);
        
        if (res.data.filters) {
          if (res.data.filters.categories) setCategories(['All', ...res.data.filters.categories]);
          if (res.data.filters.locations) setLocations(['All', ...res.data.filters.locations]);
        }
      } else {
        console.error("Failed to fetch expenses");
      }
    } catch (err) {
      console.error("Access Denied or Server Error", err.response);
      alert(err.response?.data?.message || "Failed to load expenses. Please check your connection.");
    } finally {
      setLoading(false);
      setInitialLoad(false); 
    }
  }, [currentPage, searchTerm, statusFilter, categoryFilter, locationFilter, itemsPerPage]);

  useEffect(() => { 
    fetchAllClaims(); 
  }, [fetchAllClaims]);

  // Handle Status Update with Remarks
  const handleStatusUpdate = async (id, newStatus) => {
    if (!adminRemarks.trim() && newStatus === 'rejected') {
      alert("Please provide remarks for rejecting this claim.");
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/admin/expenses/${id}/status`, {
        status: newStatus,
        admin_remarks: adminRemarks
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        await fetchAllClaims();
        setSelectedExpense(null);
        setAdminRemarks('');
        alert(`Claim successfully ${newStatus}.`);
      } else {
        alert(res.data.message || "Action failed.");
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Generate filename
  const generateFilename = () => {
    let filename = 'expenses_';
    if (statusFilter !== 'All') filename += `${statusFilter.toLowerCase()}_`;
    if (categoryFilter !== 'All') filename += `${categoryFilter.toLowerCase()}_`;
    if (locationFilter !== 'All') filename += `${locationFilter.toLowerCase().replace(/\s+/g, '_')}_`;
    filename += new Date().toISOString().split('T')[0];
    filename += '.csv';
    return filename;
  };

  // Download as CSV
  const handleDownloadDataAsCSV = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const params = new URLSearchParams();
      params.append('export', 'true');
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'All') params.append('status', statusFilter.toLowerCase());
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (locationFilter !== 'All') params.append('location', locationFilter);

      const response = await axios.get(`${API_BASE}/admin/expenses/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const csvBlob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(csvBlob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', generateFilename());
      link.setAttribute('type', 'text/csv');
      link.style.visibility = 'hidden';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 500);

      setShowExportOptions(false);
      
    } catch (error) {
      console.error("Download Error:", error);
      let errorMsg = "Failed to download CSV file.";
      
      if (error.response?.status === 401) {
        errorMsg = "Authentication failed. Please log in again.";
      } else if (error.response?.status === 403) {
        errorMsg = "You don't have permission to download expenses.";
      } else if (error.response?.status === 404) {
        errorMsg = "No expense data found. Check your filters.";
      } else if (error.message.includes('Network')) {
        errorMsg = "Network error. Please check your connection and try again.";
      }
      
      alert(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  // Copy to Clipboard
  const handleCopyToClipboard = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const params = new URLSearchParams();
      params.append('export', 'true');
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'All') params.append('status', statusFilter.toLowerCase());
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (locationFilter !== 'All') params.append('location', locationFilter);

      const response = await axios.get(`${API_BASE}/admin/expenses/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'text'
      });

      await navigator.clipboard.writeText(response.data);
      alert('✅ CSV data copied to clipboard!\n\nYou can now paste it into:\n• Microsoft Excel\n• Google Sheets\n• Any text editor');
      setShowExportOptions(false);
      
    } catch (error) {
      console.error("Copy Error:", error);
      alert("Failed to copy data. Please try downloading as CSV instead.");
    } finally {
      setExporting(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setLocationFilter('All');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const stats = [
    { 
      label: "Pending", 
      value: expenses.filter(e => e.status === 'pending').length,
      amount: `$${expenses.filter(e => e.status === 'pending').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0).toFixed(2)}`,
      color: "text-amber-600 dark:text-amber-400", 
      bg: "bg-amber-50 dark:bg-amber-900/20" 
    },
    { 
      label: "Approved Total", 
      value: `$${expenses.filter(e => e.status === 'approved').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0).toFixed(2)}`,
      amount: `${expenses.filter(e => e.status === 'approved').length} claims`,
      color: "text-teal-600 dark:text-teal-400", 
      bg: "bg-teal-50 dark:bg-teal-900/20" 
    },
    { 
      label: "Rejected", 
      value: expenses.filter(e => e.status === 'rejected').length,
      amount: `$${expenses.filter(e => e.status === 'rejected').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0).toFixed(2)}`,
      color: "text-red-600 dark:text-red-400", 
      bg: "bg-red-50 dark:bg-red-900/20" 
    }
  ];

  if (initialLoad) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={48} />
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Accessing Secure Financial Core...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      
      {/* HEADER */}
      <header className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
              Financial <span className="text-teal-600 dark:text-teal-400">Control</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Manage and approve instructor expense claims
            </p>
          </div>
          <div className="flex justify-end w-full md:w-auto gap-3">
            <button 
              onClick={() => fetchAllClaims()}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-teal-600 hover:text-white dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <RotateCw size={18} /> Refresh
            </button>
            <button 
              onClick={() => setShowExportOptions(true)}
              disabled={exporting || expenses.length === 0}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-teal-600 hover:text-white dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Export Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* IMPROVED FILTER BAR */}
        <div className="flex flex-col w-full gap-4 mb-6">
          {/* First row: Filter selects */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative w-full">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Status
              </label>
              <select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="relative w-full">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select 
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Location
              </label>
              <select 
                value={locationFilter}
                onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm cursor-pointer"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Second row: Search Bar and Clear Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="relative flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by instructor name or category..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchInput || statusFilter !== 'All' || categoryFilter !== 'All' || locationFilter !== 'All') && (
              <button
                onClick={clearFilters}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center gap-2 h-[42px]"
              >
                <X size={16} /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {stats.map((s, i) => (
            <div key={i} className={`${s.bg} rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-all hover:shadow-md`}>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              {s.amount && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{s.amount}</p>
              )}
            </div>
          ))}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 overflow-x-hidden">
        <div className="max-w-[1800px] mx-auto">
          
          {/* MOBILE VIEW */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {expenses.map((exp) => (
              <div key={exp.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white">
                      {exp.instructor?.user?.name || 'Unknown Instructor'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={12} className="text-slate-400" />
                      <p className="text-xs font-mono text-slate-400">
                        {formatDate(exp.created_at || exp.date)}
                      </p>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      ID: {exp.instructor_id || 'N/A'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                    exp.status === 'approved' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' : 
                    exp.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {exp.status}
                  </span>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Tag size={16} className="text-teal-500 shrink-0" /> 
                    <span>{exp.category || 'Uncategorized'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin size={16} className="text-teal-500 shrink-0" /> 
                    <span>{exp.displayLocation || exp.location || 'Not Assigned'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                      ${parseFloat(exp.amount || 0).toFixed(2)}
                    </span>
                  </div>
                  <button 
                    onClick={() => { 
                      setSelectedExpense(exp); 
                      setAdminRemarks(exp.admin_remarks || ''); 
                    }}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <ScanEye size={18} /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Instructor</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Category</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Location</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-slate-800 dark:text-white">
                          {exp.instructor?.user?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          ID: {exp.instructor_id || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex px-2 py-1 rounded-lg text-[10px] justify-center w-25 font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                          {exp.category || 'Other'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-base font-bold text-teal-600 dark:text-teal-400">
                          ${parseFloat(exp.amount || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                          <MapPin size={14} className="text-teal-500" /> 
                          {exp.displayLocation || exp.location || 'Not Assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                          <Calendar size={14} className="text-teal-500" />
                          {formatDate(exp.created_at || exp.date)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 w-25 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          exp.status === 'approved' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400' : 
                          exp.status === 'pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                          'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            exp.status === 'approved' ? 'bg-teal-500' : 
                            exp.status === 'pending' ? 'bg-amber-500 animate-pulse' : 
                            'bg-red-500'
                          }`} />
                          {exp.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          onClick={() => { 
                            setSelectedExpense(exp); 
                            setAdminRemarks(exp.admin_remarks || ''); 
                          }}
                          className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all"
                          title="Review Claim"
                        >
                          <ScanEye size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {expenses.length === 0 && (
              <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl m-6">
                <Receipt size={56} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No expenses found matching your filters.</p>
                <button 
                  onClick={clearFilters} 
                  className="mt-4 text-teal-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination 
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </main>

      {/* Export Options Modal */}
      <ExportOptionsModal 
        isOpen={showExportOptions}
        onClose={() => setShowExportOptions(false)}
        onDownloadCSV={handleDownloadDataAsCSV}
        onCopyClipboard={handleCopyToClipboard}
        downloading={exporting}
      />

      {/* ADMIN REVIEW MODAL */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Left side: Evidence Viewer */}
              <div className="w-full md:w-1/2 bg-slate-50 dark:bg-slate-800/30 p-6 flex flex-col items-center justify-center border-b md:border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
                <div className="text-center mb-4">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visual Evidence</p>
                </div>
                {selectedExpense.receipt_path ? (
                  <>
                    <img 
                      src={getReceiptUrl(selectedExpense.receipt_path)}
                      className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-lg" 
                      alt="Receipt" 
                      onError={(e) => {
                        console.error('Image failed to load:', getReceiptUrl(selectedExpense.receipt_path));
                        e.target.onerror = null;
                        const altPath = `http://localhost:8000/storage/${selectedExpense.receipt_path.replace(/^\/?(public\/)?/, '')}`;
                        if (e.target.src !== altPath) {
                          e.target.src = altPath;
                        } else {
                          e.target.src = 'https://placehold.co/600x400/e2e8f0/475569?text=No+Image+Found&font=montserrat';
                        }
                      }}
                    />
                    <div className="mt-4 flex gap-2">
                      <a 
                        href={getReceiptUrl(selectedExpense.receipt_path)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-teal-600 hover:underline flex items-center gap-2"
                      >
                        <FileText size={16} /> View Full Receipt
                      </a>
                      <button
                        onClick={() => {
                          console.log('Receipt path:', selectedExpense.receipt_path);
                          console.log('Full URL:', getReceiptUrl(selectedExpense.receipt_path));
                          alert(`Receipt Path: ${selectedExpense.receipt_path}\n\nFull URL: ${getReceiptUrl(selectedExpense.receipt_path)}`);
                        }}
                        className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1"
                      >
                        <HelpCircle size={14} /> Debug
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-sm text-slate-500">No receipt uploaded</p>
                  </div>
                )}
              </div>

              {/* Right side: Detailed Analysis */}
              <div className="w-full md:w-1/2 p-6 flex flex-col space-y-5 overflow-y-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">Instructor</p>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                      {selectedExpense.instructor?.user?.name || 'Unknown Instructor'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={14} className="text-slate-400" />
                      <p className="text-sm text-slate-500">
                        Submitted on {formatDate(selectedExpense.created_at || selectedExpense.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin size={14} className="text-teal-500" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Location: {selectedExpense.displayLocation || selectedExpense.location || 'Not Assigned'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedExpense(null)} 
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Claim Amount</p>
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      ${parseFloat(selectedExpense.amount || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category</p>
                    <p className="text-sm font-bold uppercase text-teal-600 dark:text-teal-400">
                      {selectedExpense.category || 'Uncategorized'}
                    </p>
                  </div>
                </div>

                {/* Description Section */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlignLeft size={12} /> Description
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedExpense.description || "No description provided."}
                  </p>
                </div>

                {/* Only show Admin Remarks Input and Action Buttons for PENDING expenses */}
                {selectedExpense.status === 'pending' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Review Remarks
                      </label>
                      <textarea 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-none"
                        placeholder="State reason for approval or rejection..."
                        rows="3"
                        value={adminRemarks}
                        onChange={(e) => setAdminRemarks(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => handleStatusUpdate(selectedExpense.id, 'approved')} 
                        disabled={updating}
                        className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-60"
                      >
                        {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} 
                        Approve & Reconcile
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(selectedExpense.id, 'rejected')} 
                        disabled={updating}
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {updating ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />} 
                        Reject Claim
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Current Status</p>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                        selectedExpense.status === 'approved' 
                          ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          selectedExpense.status === 'approved' ? 'bg-teal-500' : 'bg-red-500'
                        }`} />
                        {selectedExpense.status.toUpperCase()}
                      </span>
                      {selectedExpense.admin_remarks && (
                        <div className="mt-3 text-left">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Admin Remarks
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                            "{selectedExpense.admin_remarks}"
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => setSelectedExpense(null)} 
                      className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm transition-all"
                    >
                      Close
                    </button>
                  </div>
                )}

                {selectedExpense.status === 'pending' && selectedExpense.admin_remarks && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Previous Remarks (from admin)
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                      "{selectedExpense.admin_remarks}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finances;