import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { 
  Search, FileText, CheckCircle, Clock, Eye, ScanEye,
  RefreshCw, Printer, AlertCircle,
  X, Download, RotateCw, Receipt,
  Copy, Loader2
} from "lucide-react";
import Pagination from "../components/Pagination";

const API_BASE = "http://localhost:8000/api";

// Export Options Modal Component
const ExportOptionsModal = ({ isOpen, onClose, onDownloadCSV, onCopyClipboard, downloading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
        <div className="px-6 py-4 bg-teal-600">
          <h3 className="text-lg font-semibold text-white">Export Options</h3>
          <p className="text-sm text-teal-100 mt-0.5">Choose how to export your filtered invoices</p>
        </div>
        <div className="p-6 space-y-3">
          <button 
            onClick={onDownloadCSV}
            disabled={downloading}
            className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <Download size={18} className="text-teal-600" />
              <div>
                <p className="font-medium text-gray-800">Download as CSV</p>
                <p className="text-xs text-gray-500">Opens in Excel, Google Sheets, etc.</p>
              </div>
            </div>
          </button>
          <button 
            onClick={onCopyClipboard}
            disabled={downloading}
            className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <Copy size={18} className="text-amber-600" />
              <div>
                <p className="font-medium text-gray-800">Copy to Clipboard</p>
                <p className="text-xs text-gray-500">Paste into Excel or text editor</p>
              </div>
            </div>
          </button>
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <button onClick={onClose} className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
// Invoice Preview Modal - Fixed with proper style isolation
const InvoicePreviewModal = ({ invoice, onClose, loading }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const iframeRef = useRef(null);

  // Extract and clean the HTML content
  const getCleanInvoiceHTML = () => {
    if (!invoice?.html_content) return '';
    
    // Extract the body content and styles
    const styleMatch = invoice.html_content.match(/<style>([\s\S]*?)<\/style>/);
    const styles = styleMatch ? styleMatch[1] : '';
    
    // Extract body content (remove any existing print actions)
    let bodyContent = invoice.html_content;
    bodyContent = bodyContent.replace(/<div class="print-actions[^>]*>[\s\S]*?<\/div>/, '');
    bodyContent = bodyContent.replace(/<div class="no-print[^>]*>[\s\S]*?<\/div>/, '');
    
    // Extract the main content
    const bodyMatch = bodyContent.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    const content = bodyMatch ? bodyMatch[1] : bodyContent;
    
    return { styles, content };
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (downloadSuccess) {
      const timer = setTimeout(() => setDownloadSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [downloadSuccess]);

  // Render in iframe for complete isolation
  useEffect(() => {
    if (!invoice?.html_content || !iframeRef.current || loading) return;
    
    const { styles, content } = getCleanInvoiceHTML();
    
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoice.transaction_id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: white;
              padding: 20px;
              margin: 0;
            }
            
            /* Preserve all original styles */
            ${styles}
            
            /* Override any modal-related issues */
            .container {
              max-width: 900px;
              margin: 0 auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
            }
            
            .print-actions, .no-print {
              display: none !important;
            }
            
            /* Ensure proper spacing */
            .content {
              padding: 40px !important;
            }
            
            /* Fix any broken layouts */
            .header {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 40px !important;
            }
            
            .invoice-details {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 40px !important;
            }
            
            .summary {
              display: grid !important;
              grid-template-columns: 1fr 300px !important;
              gap: 40px !important;
            }
            
            .footer {
              display: grid !important;
              grid-template-columns: 1fr 1fr 1fr !important;
              gap: 30px !important;
            }
            
            @media (max-width: 768px) {
              .header, .invoice-details, .summary, .footer {
                grid-template-columns: 1fr !important;
              }
            }
            
            /* Print styles */
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              .print-actions, .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    iframeDoc.close();
    
  }, [invoice, loading]);

  // Helper function to get styles from iframe
  const getStylesFromIframe = (iframeDoc) => {
    const styles = iframeDoc.querySelectorAll('style');
    let stylesHtml = '';
    styles.forEach(style => {
      stylesHtml += style.outerHTML;
    });
    return stylesHtml;
  };

  // Helper function to get body content from iframe
  const getBodyContentFromIframe = (iframeDoc) => {
    const body = iframeDoc.body;
    return body.innerHTML;
  };

  // PDF Download using iframe content - No print dialog
  const handleDownloadPDF = async () => {
    if (!iframeRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Get the complete HTML content
      const htmlContent = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice ${invoice.transaction_id}</title>
          ${getStylesFromIframe(iframeDoc)}
        </head>
        <body>
          ${getBodyContentFromIframe(iframeDoc)}
        </body>
      </html>`;
      
      // Create blob and download as HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoice.transaction_id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success message instead of alert
      setDownloadSuccess(true);
      
    } catch (error) {
      console.error('Download error:', error);
      // You can add an error toast here if needed
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.print();
    }
  };

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden">
        
        {/* Beautiful Modal Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Receipt size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Invoice Preview</h3>
              <p className="text-teal-100 text-xs">{invoice.transaction_id}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all p-2 group"
          >
            <X size={20} className="group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Action Buttons Bar */}
        <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-b border-gray-200">
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              <Printer size={16} /> Print / Save as PDF
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Downloading...
                </>
              ) : (
                <>
                  <Download size={16} /> Download HTML
                </>
              )}
            </button>
          </div>
          <div className="text-xs text-gray-400">
            <span className="hidden sm:inline">Press </span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+P</kbd>
            <span className="hidden sm:inline"> to save as PDF</span>
          </div>
        </div>

        {/* Success Toast Notification */}
        {downloadSuccess && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <CheckCircle size={18} />
              <span className="font-medium">Invoice downloaded successfully!</span>
            </div>
          </div>
        )}

        {/* Invoice Content - Using iframe for style isolation */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="animate-spin text-teal-600 mx-auto mb-3" size={40} />
                <p className="text-sm text-gray-500">Loading invoice...</p>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              title="Invoice Preview"
              className="w-full h-full border-0 bg-white"
              sandbox="allow-same-origin allow-scripts allow-popups allow-modals"
              style={{ minHeight: '600px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
// Main Invoice Manager Component
const InvoiceManager = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingInvoiceDetail, setLoadingInvoiceDetail] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const limit = 10;
  const token = localStorage.getItem('access_token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatCAD = (amount) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount || 0);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'succeeded':
      case 'paid':
        return { text: 'Paid', bg: 'bg-green-100', textColor: 'text-green-700' };
      case 'deposit_paid':
        return { text: 'Deposit Paid', bg: 'bg-teal-100', textColor: 'text-teal-700' };
      case 'partial':
        return { text: 'Partial', bg: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'pending':
        return { text: 'Pending', bg: 'bg-amber-100', textColor: 'text-amber-700' };
      default:
        return { text: status, bg: 'bg-gray-100', textColor: 'text-gray-600' };
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchInput) {
        setSearchTerm(searchInput);
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, searchTerm]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        per_page: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await axios.get(`${API_BASE}/invoices?${params}`, config);

      if (response.data.success) {
        setInvoices(response.data.data);
        setTotalItems(response.data.meta.total);
        setTotalPages(response.data.meta.last_page);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      showNotification('error', 'Failed to load invoices');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Fetch invoice detail when selected
  useEffect(() => {
    const fetchInvoiceDetail = async () => {
      if (!selectedInvoice?.id) return;

      setLoadingInvoiceDetail(true);
      try {
        const response = await axios.get(`${API_BASE}/invoices/${selectedInvoice.id}`, config);
        
        if (response.data.success) {
          setSelectedInvoice(prev => ({
            ...prev,
            html_content: response.data.data.html_content,
            transaction_id: response.data.data.transaction_id,
          }));
        }
      } catch (error) {
        console.error("Error fetching invoice detail:", error);
        showNotification('error', 'Failed to load invoice preview');
      } finally {
        setLoadingInvoiceDetail(false);
      }
    };

    if (selectedInvoice?.id && !selectedInvoice?.html_content) {
      fetchInvoiceDetail();
    }
  }, [selectedInvoice?.id]);

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Export functions
  const generateFilename = () => {
    let filename = 'invoices_';
    if (statusFilter !== 'all') filename += `${statusFilter}_`;
    filename += new Date().toISOString().split('T')[0];
    filename += '.csv';
    return filename;
  };

  const handleDownloadDataAsCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        export: 'true',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await axios.get(`${API_BASE}/invoices/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', generateFilename());
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setShowExportOptions(false);
      showNotification('success', 'CSV downloaded successfully!');
    } catch (error) {
      showNotification('error', 'Failed to download CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        export: 'true',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await axios.get(`${API_BASE}/invoices/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'text'
      });

      await navigator.clipboard.writeText(response.data);
      setShowExportOptions(false);
      showNotification('success', 'Copied to clipboard!');
    } catch (error) {
      showNotification('error', 'Failed to copy to clipboard');
    } finally {
      setExporting(false);
    }
  };

  // Summary stats
  const stats = [
    { label: "Total Invoices", value: totalItems, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Pending Payment", value: invoices.filter(i => i.status === 'pending').length, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Paid / Active", value: invoices.filter(i => i.status === 'paid' || i.status === 'succeeded').length, color: "text-green-600", bg: "bg-green-50" }
  ];

  if (initialLoad) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-600 mx-auto mb-4" size={40} />
          <p className="text-sm text-gray-500">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300 ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Export Modal */}
      <ExportOptionsModal 
        isOpen={showExportOptions}
        onClose={() => setShowExportOptions(false)}
        onDownloadCSV={handleDownloadDataAsCSV}
        onCopyClipboard={handleCopyToClipboard}
        downloading={exporting}
      />

      {/* Invoice Preview Modal */}
      {selectedInvoice && (
        <InvoicePreviewModal 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)}
          loading={loadingInvoiceDetail}
        />
      )}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1920px] mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Invoices <span className="text-teal-600">Archive</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track all student invoices</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => fetchInvoices()} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
              <RotateCw size={14} /> Refresh
            </button>
            <button onClick={() => setShowExportOptions(true)} disabled={exporting || invoices.length === 0} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50">
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.bg} rounded-lg border border-gray-200 p-4`}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'succeeded', label: 'Paid' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setStatusFilter(tab.id); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === tab.id 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearchTerm(''); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Clear Filters */}
          {(searchInput || statusFilter !== 'all') && (
            <button onClick={clearFilters} className="text-sm text-teal-600 hover:text-teal-700 text-left">
              Clear all filters
            </button>
          )}
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="animate-spin text-teal-600 mx-auto" size={28} />
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-lg border border-gray-200">
              <Receipt size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No invoices found</p>
            </div>
          ) : (
            invoices.map(inv => {
              const statusInfo = getStatusBadge(inv.status);
              return (
                <div key={inv.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-teal-600 font-mono">{inv.transaction_id}</p>
                      <p className="text-xs text-gray-500">{inv.formatted_date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo.bg} ${statusInfo.textColor}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800">{inv.student?.name}</p>
                  <p className="text-sm text-gray-500">{inv.course}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-lg font-bold text-teal-600">{formatCAD(inv.amount)}</span>
                    <button onClick={() => setSelectedInvoice(inv)} className="px-3 py-1 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50">
                      View
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Invoice</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Course</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="py-12 text-center"><Loader2 className="animate-spin text-teal-600 mx-auto" size={28} /></td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan="6" className="py-12 text-center text-gray-500">No invoices found</td></tr>
                ) : (
                  invoices.map(inv => {
                    const statusInfo = getStatusBadge(inv.status);
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-mono text-gray-800">{inv.transaction_id}</div>
                          <div className="text-xs text-gray-500">{inv.formatted_date}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-800">{inv.student?.name}</div>
                          <div className="text-xs text-gray-500">{inv.student?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{inv.course}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-medium text-teal-600">{formatCAD(inv.amount)}</span>
                          {inv.balance_due > 0 && inv.balance_due !== inv.amount && (
                            <div className="text-xs text-amber-600">Balance: {formatCAD(inv.balance_due)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.bg} ${statusInfo.textColor}`}>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => setSelectedInvoice(inv)} className="text-gray-500 hover:text-teal-600 transition-colors" title="View Invoice">
                            <ScanEye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination 
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceManager;