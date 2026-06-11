
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import NewPackage from "../components/NewPackage";
import EditPackage from "../components/EditPackage";
import Pagination from "../components/Pagination";
import { Plus, Package as PackageIcon, Edit2, Trash2, Search, Loader2, X, Crown, Shield, AlertCircle, CheckCircle } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/api";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- Premium UI States ---
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Fetch packages from API
  const fetchPackages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE}/packages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPackages(response.data.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    if (type !== 'success') {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // --- Custom Delete Confirmation ---
  const handleDelete = (id) => {
    setConfirmDialog({
      title: "Delete Package",
      message: "Are you sure you want to delete this package? This action cannot be undone.",
      type: "danger",
      actionText: "Yes, Delete",
      onConfirm: () => executeDelete(id)
    });
  };

  const executeDelete = async (id) => {
    setConfirmDialog(null);
    setNotification(null);
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_BASE}/packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPackages(prev => prev.filter(p => p.id !== id));
      
      showNotification('success', 'Package deleted successfully.');
      setTimeout(() => setNotification(null), 3000); // Auto-hide success after 3 seconds
    } catch (error) {
      showNotification('error', error.response?.data?.message || "Failed to delete package.");
    }
  };

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) =>
      pkg.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.license_class?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, packages]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPackages.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredPackages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={40} />
          <p className="text-sm text-slate-500 font-medium">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden relative">
      
      {/* INLINE NOTIFICATION BANNER */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : 
          notification.type === 'warning' ? 'bg-amber-500 text-white' : 
          'bg-rose-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{notification.message}</span>
          {notification.type !== 'success' && (
            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-75"><X size={16}/></button>
          )}
        </div>
      )}

      {/* CONFIRMATION OVERLAY */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <h3 className={`text-lg font-bold flex items-center gap-2 ${confirmDialog.type === 'danger' ? 'text-rose-600' : 'text-emerald-600'}`}>
              <AlertCircle size={20} /> {confirmDialog.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm font-medium">
              {confirmDialog.message}
            </p>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className={`flex-1 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg ${
                  confirmDialog.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                }`}
              >
                {confirmDialog.actionText}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-[1800px] mx-auto">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
                Driving <span className="text-teal-600 dark:text-teal-400">Packages</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                Manage pricing, tiers, packages, and regional tax calculations
              </p>
            </div>
            <div className="flex justify-end w-full md:w-auto">
              <button 
                onClick={() => setShowNewModal(true)} 
                className="w-full md:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-teal-600 hover:text-white dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus size={18} /> Add New Package
              </button>
            </div>
          </div>

          {/* SEARCH BAR - FULL WIDTH WITH INLINE CLEAR */}
          <div className="mb-6 w-full">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search packages by name or license class..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-11 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md text-slate-500 transition-colors"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* PACKAGE GRID */}
          {filteredPackages.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <PackageIcon size={56} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No packages found matching your search.</p>
              {searchTerm && (
                <button 
                  onClick={clearSearch} 
                  className="mt-4 text-teal-600 font-bold hover:underline transition-all"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentItems.map(pkg => {
                  const isPremium = pkg.tier === 'Premium';

                  return (
                    <div 
                      key={pkg.id} 
                      className={`group bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${
                        isPremium 
                        ? 'border-amber-200 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-800'
                      }`}
                    >
                      {/* ADMIN TOOLS */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <button 
                          onClick={() => setEditingPackage(pkg)} 
                          className="p-2 bg-white dark:bg-slate-800 text-teal-600 rounded-xl hover:bg-teal-600 hover:text-white transition-all shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:scale-110 active:scale-95"
                          title="Edit Package"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(pkg.id)} 
                          className="p-2 bg-white dark:bg-slate-800 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:scale-110 active:scale-95"
                          title="Delete Package"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="p-6">
                        {/* License Class & Tier Badges */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-[11px] font-bold px-2.5 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg uppercase tracking-wider">
                            {pkg.license_class || "Class 5"}
                          </span>
                          
                          {isPremium ? (
                            <span className="text-[11px] font-bold px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg uppercase tracking-wider flex items-center gap-1">
                              <Crown size={12} /> Premium
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg uppercase tracking-wider flex items-center gap-1">
                              <PackageIcon size={12} /> Basic
                            </span>
                          )}
                        </div>
                        
                        {/* Package Name */}
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300 pr-16">
                          {pkg.package_name || "Unnamed Package"}
                        </h3>
                        
                        {/* Hours */}
                        <div className="flex items-center gap-3 mb-5">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {pkg.hours || 0} Hours Instruction
                          </span>
                        </div>

                        {/* Regional Pricing */}
                        {pkg.pricing_by_location && pkg.pricing_by_location.length > 0 && (
                          <div className="mb-5">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                              Regional Pricing (Inc. Tax)
                            </label>
                            <div className="grid grid-cols-2 gap-2 text-center">
                              {pkg.pricing_by_location.map((loc, idx, arr) => (
                                <div 
                                  key={idx} 
                                  className={`
                                    p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg 
                                    border border-slate-100 dark:border-slate-700 
                                    group-hover:border-teal-200 dark:group-hover:border-teal-800 
                                    transition-all duration-300
                                    ${idx === arr.length - 1 && arr.length % 2 !== 0 ? 'col-span-2' : ''}
                                  `}
                                >
                                  <p className="text-[10px] lg:text-sm font-semibold text-slate-500 uppercase tracking-wider truncate" title={loc.location_name}>
                                    {loc.location_name}
                                  </p>
                                  <p className="text-sm lg:text-md font-bold text-slate-800 dark:text-white">
                                    ${loc.total_price?.toFixed(2) || '0.00'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Base Price */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Base Price</span>
                          <span className={`text-xl font-bold transition-colors duration-300 ${
                            isPremium 
                            ? 'text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300' 
                            : 'text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300'
                          }`}>
                            ${pkg.base_amount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination */}
              {filteredPackages.length > itemsPerPage && (
                <div className="flex justify-center pt-8 pb-4">
                  <Pagination 
                    totalItems={filteredPackages.length} 
                    itemsPerPage={itemsPerPage} 
                    currentPage={currentPage} 
                    onPageChange={setCurrentPage} 
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showNewModal && (
        <NewPackage 
          onClose={() => setShowNewModal(false)} 
          onRefresh={fetchPackages}
        />
      )}
      {editingPackage && (
        <EditPackage 
          pkg={editingPackage} 
          onClose={() => setEditingPackage(null)} 
          onRefresh={fetchPackages}
        />
      )}
    </div>
  );
};

export default Packages;