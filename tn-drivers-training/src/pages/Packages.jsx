
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import NewPackage from "../components/NewPackage";
import EditPackage from "../components/EditPackage";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar"; 
import { Plus, Package as PackageIcon, Loader2 } from "lucide-react";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 1. Fetch Packages from Laravel
  const fetchPackages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get("http://127.0.0.1:8000/api/packages", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Your controller returns { success: true, data: [...] }
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

  // 2. Delete Package
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/api/packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      alert("Failed to delete package");
    }
  };

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1); 
  }, []);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) =>
      pkg.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.license_class?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, packages]);

  const currentItems = useMemo(() => {
    const lastIdx = currentPage * itemsPerPage;
    return filteredPackages.slice(lastIdx - itemsPerPage, lastIdx);
  }, [currentPage, filteredPackages]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={48} /></div>;

  return (
    <div className="p-4 sm:p-8 bg-slate-50 dark:bg-[#020617] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
            Driving <span className="text-teal-500">Finance</span>
          </h1>
          <button 
            onClick={() => setShowNewModal(true)} 
            className="bg-teal-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-teal-600 transition-all"
          >
            <Plus size={16} /> Add Master Package
          </button>
        </div>

        <div className="space-y-10">
          <div className="max-w-xl">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map(pkg => (
              <div key={pkg.id} className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl relative transition-all hover:shadow-2xl">
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                  <button onClick={() => setEditingPackage(pkg)} className="p-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-500 hover:text-white transition-all">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>

                <div className="relative z-10">
                  <span className="text-[9px] font-black px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-full uppercase tracking-widest">{pkg.license_class}</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-4 uppercase italic">{pkg.package_name}</h3>
                  <p className="text-slate-400 font-bold text-xs mt-1 mb-8 flex items-center gap-2"><PackageIcon size={12} /> {pkg.hours} Hours Instruction</p>

                  <div className="space-y-3 mb-8">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Regional Pricing (Inc. Tax)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {pkg.pricing_by_location?.map((loc, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                          <p className="text-[8px] font-black text-slate-400 uppercase">{loc.location_name}</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            ${loc.total_price}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-teal-500/5 dark:bg-teal-500/10 rounded-3xl border border-teal-100 dark:border-teal-900/30">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-teal-600 uppercase italic">Base Price</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">${pkg.base_amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center pt-8">
            <Pagination totalItems={filteredPackages.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>
        </div>

        {showNewModal && <NewPackage onClose={() => setShowNewModal(false)} onRefresh={fetchPackages} />}
        {editingPackage && <EditPackage pkg={editingPackage} onClose={() => setEditingPackage(null)} onRefresh={fetchPackages} />}
      </div>
    </div>
  );
};

export default Packages;