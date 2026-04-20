
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import NewPackage from "../components/NewPackage";
import EditPackage from "../components/EditPackage";
import Pagination from "../components/Pagination";
import { Plus, Package as PackageIcon, Edit2, Trash2, Search, Loader2 } from "lucide-react";

const API_BASE = "http://localhost:8000/api";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  // Delete Package
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_BASE}/packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      alert("Failed to delete package");
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
          <p className="text-sm text-slate-500">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-[1800px] mx-auto">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
                Driving <span className="text-teal-600 dark:text-teal-400">Packages</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                Manage pricing, packages, and regional tax calculations
              </p>
            </div>
            <div className="flex justify-end w-full md:w-auto">
              <button 
                onClick={() => setShowNewModal(true)} 
                className="w-full md:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-teal-600 hover:text-white dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add New Package
              </button>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="mb-6">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search packages by name or license class..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* PACKAGE GRID */}
          {filteredPackages.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <PackageIcon size={56} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No packages found matching your search.</p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="mt-4 text-teal-600 font-bold hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentItems.map(pkg => (
                  <div 
                    key={pkg.id} 
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
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
                      {/* License Class Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-bold px-2.5 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg uppercase tracking-wider">
                          {pkg.license_class || "Class 5"}
                        </span>
                        <PackageIcon size={16} className="text-slate-400 group-hover:text-teal-500 transition-colors duration-300" />
                      </div>
                      
                      {/* Package Name */}
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
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
                        <span className="text-xl font-bold text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300">
                          ${pkg.base_amount }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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