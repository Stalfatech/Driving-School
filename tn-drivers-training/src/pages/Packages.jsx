import React, { useState, useMemo, useCallback } from "react";
import NewPackage from "../components/NewPackage";
import EditPackage from "../components/EditPackage";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar"; 
import { Plus, Package as PackageIcon } from "lucide-react";

const Packages = () => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Master Tax Regions - Pull this from your Settings state or API later
  const [taxRegions] = useState([
    { id: 1, city: "Burin", rate: 0.10 },
    { id: 2, city: "Mount Pearl", rate: 0.15 },
    { id: 3, city: "Marystown", rate: 0.5 },
    { id: 4, city: "Grand Falls", rate: 0.20 },
  ]);

  const [packages, setPackages] = useState([
    { id: 1, name: "Basic Starter", price: 450, licenseClass: "Class 7 L", hours: 5 },
    { id: 2, name: "Pro Highway", price: 800, licenseClass: "Class 5", hours: 10 },
    { id: 3, name: "Advanced City", price: 600, licenseClass: "Class 5", hours: 8 },
  ]);

  // FIX: This function was missing or renamed, causing your error
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1); 
  }, []);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.licenseClass.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, packages]);

  const currentItems = useMemo(() => {
    const lastIdx = currentPage * itemsPerPage;
    return filteredPackages.slice(lastIdx - itemsPerPage, lastIdx);
  }, [currentPage, filteredPackages]);

  return (
    <div className="p-4 sm:p-8 bg-slate-50 dark:bg-[#020617] min-h-screen transition-colors font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
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
          {/* SEARCH BAR */}
          <div className="max-w-xl">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* PACKAGE GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map(pkg => (
              <div key={pkg.id} className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl relative transition-all hover:shadow-2xl">
                
                {/* ADMIN TOOLS */}
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                  <button onClick={() => setEditingPackage(pkg)} className="p-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-500 hover:text-white transition-all">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button onClick={() => setPackages(packages.filter(p => p.id !== pkg.id))} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>

                <div className="relative z-10">
                  <span className="text-[9px] font-black px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-full uppercase tracking-widest">{pkg.licenseClass}</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-4 uppercase italic">{pkg.name}</h3>
                  <p className="text-slate-400 font-bold text-xs mt-1 mb-8 flex items-center gap-2"><PackageIcon size={12} /> {pkg.hours} Hours Instruction</p>

                  {/* DYNAMIC REGIONAL TAX CALCULATION */}
                  <div className="space-y-3 mb-8">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Regional Pricing (Inc. Tax)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {taxRegions.map(region => {
                        const total = pkg.price * (1 + region.rate);
                        return (
                          <div key={region.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[8px] font-black text-slate-400 uppercase">{region.city}</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                              ${total.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BASE PRICE FOOTER */}
                  <div className="p-5 bg-teal-500/5 dark:bg-teal-500/10 rounded-3xl border border-teal-100 dark:border-teal-900/30">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-teal-600 uppercase italic">Base Price</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">${pkg.price.toFixed(2)}</span>
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

        {/* MODALS */}
        {showNewModal && <NewPackage onClose={() => setShowNewModal(false)} onAdd={(p) => setPackages([p, ...packages])} />}
        {editingPackage && <EditPackage pkg={editingPackage} onClose={() => setEditingPackage(null)} onUpdate={(up) => setPackages(packages.map(p => p.id === up.id ? up : p))} />}
      </div>
    </div>
  );
};

export default Packages;