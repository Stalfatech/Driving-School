import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  CreditCard, DollarSign, ReceiptText, 
  CheckCircle, Clock, XCircle, Loader2, AlertCircle 
} from "lucide-react";

// Import your custom Pagination component
import Pagination from "../../components/Pagination";

const API_BASE = "http://localhost:8000/api";

const StudentPayments = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [financials, setFinancials] = useState({
    package_name: 'Loading...',
    total_amount: 0,
    balance_due: 0
  });

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_BASE}/student/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setFinancials(res.data.financials);
        setPayments(res.data.payments);
      }
    } catch (err) {
      console.error("Failed to load payments", err);
      setError("Failed to load your payment history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const formatCAD = (amount) => {
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD' 
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'succeeded':
      case 'paid':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-[10px] font-bold uppercase tracking-wider"><CheckCircle size={12}/> Success</span>;
      case 'pending': 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-md text-[10px] font-bold uppercase tracking-wider"><Clock size={12}/> Pending</span>;
      case 'failed': 
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-[10px] font-bold uppercase tracking-wider"><XCircle size={12}/> Failed</span>;
      default: 
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider">{status || 'UNKNOWN'}</span>;
    }
  };

  // --- Calculate Pagination Data ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = payments.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-teal-600" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-200 flex items-center gap-3">
          <AlertCircle /> <span className="font-semibold">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            My <span className="text-teal-600 dark:text-teal-400">Payments</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View your package financials and past transaction history.
          </p>
        </div>

        {/* ── TOP SECTION: FINANCIAL CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          
          {/* Card 1: Total Package Price */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5 relative overflow-hidden">
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center shrink-0 z-10">
              <ReceiptText size={28} />
            </div>
            <div className="z-10 relative">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Total Package Price (Inc. Tax)
              </p>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">
                {formatCAD(financials.total_amount)}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">{financials.package_name}</p>
            </div>
            <div className="absolute right-0 top-0 w-32 h-32 bg-teal-50 dark:bg-teal-900/10 rounded-full blur-3xl -mr-10 -mt-10" />
          </div>

          {/* Card 2: Balance Due */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5 relative overflow-hidden">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 z-10 ${
              financials.balance_due > 0 
                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' 
                : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            }`}>
              <DollarSign size={28} />
            </div>
            <div className="z-10 relative">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Balance Amount to Pay
              </p>
              <h2 className={`text-3xl font-black ${
                financials.balance_due > 0 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {formatCAD(financials.balance_due)}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {financials.balance_due > 0 ? "Payment pending" : "Fully paid"}
              </p>
            </div>
            <div className={`absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 ${
              financials.balance_due > 0 ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-green-50 dark:bg-green-900/10'
            }`} />
          </div>

        </div>

        {/* ── BOTTOM SECTION: PAYMENT HISTORY ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <CreditCard className="text-teal-500" size={20} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Transaction History</h3>
          </div>
          
          {currentPayments.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500 font-medium">
              No payment records found.
            </div>
          ) : (
            <>
              {/* MOBILE VIEW: Card Grid Layout */}
              <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                {currentPayments.map((payment) => (
                  <div key={payment.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {payment.transaction_id || 'No ID'}
                      </div>
                      <div>{getStatusBadge(payment.status)}</div>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                          {payment.date}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                          Method: <span className="font-semibold text-slate-700 dark:text-slate-300">{payment.method || 'Manual'}</span>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-slate-800 dark:text-white">
                        {formatCAD(payment.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP VIEW: Standard Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Date</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Transaction ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Method</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-800 dark:text-white">{payment.date}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-mono text-slate-600 dark:text-slate-400">
                            {payment.transaction_id || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                            {payment.method || 'Manual'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-800 dark:text-white">
                            {formatCAD(payment.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {getStatusBadge(payment.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ── PAGINATION COMPONENT ── */}
        {payments.length > itemsPerPage && (
          <div className="flex justify-center mt-6">
            <Pagination 
              currentPage={currentPage} 
              totalItems={payments.length} 
              itemsPerPage={itemsPerPage} 
              onPageChange={(page) => setCurrentPage(page)} 
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentPayments;