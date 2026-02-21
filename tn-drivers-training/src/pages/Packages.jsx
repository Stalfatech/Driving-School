import React, { useState, useMemo, useCallback } from "react";
import NewPackage from "../components/NewPackage";
import EditPackage from "../components/EditPackage";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { calculateCanadianInvoice } from "../utils/taxLogic";
import { Plus, Package as PackageIcon } from "lucide-react";

const Packages = () => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [packages, setPackages] = useState([
    { id: 1, name: "Basic Starter", price: 450, licenseClass: "Class 7 L", hours: 5 },
    { id: 2, name: "Pro Highway", price: 800, licenseClass: "Class 5", hours: 10 },
    { id: 3, name: "Advanced City", price: 600, licenseClass: "Class 5", hours: 8 },
    { id: 4, name: "Winter Driving", price: 500, licenseClass: "Class 5", hours: 6 },
    { id: 5, name: "Novice Prep", price: 400, licenseClass: "Class 7 N", hours: 4 },
    { id: 6, name: "Truck Level 1", price: 1500, licenseClass: "Class 1", hours: 20 },
  ]);

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
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
              Driving <span className="text-teal-500">Finance</span>
            </h1>
          </div>

          <button 
            onClick={() => setShowNewModal(true)} 
            className="bg-teal-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 hover:bg-teal-600"
          >
            <Plus size={16} /> Add Master Package
          </button>
        </div>

        {/* CONTENT */}
        <div className="space-y-10">
          {/* Reverted SearchBar to original size */}
          <div className="max-w-xl">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map(pkg => {
              const invoice = calculateCanadianInvoice(pkg.price, "NL");
              return (
                <div key={pkg.id} className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl relative transition-all">
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
                    <p className="text-slate-400 font-bold text-xs mt-1 flex items-center gap-2"><PackageIcon size={12} /> {pkg.hours} Hours Instruction</p>

                    <div className="mt-8 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>Base Price</span><span>${pkg.price.toFixed(2)}</span></div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mt-1"><span>Est. HST (15%)</span><span>${invoice.taxAmount.toFixed(2)}</span></div>
                      <div className="h-px bg-slate-200 dark:bg-slate-700 my-3" />
                      <div className="flex justify-between items-end">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{invoice.formattedTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center pt-8">
            <Pagination 
              totalItems={filteredPackages.length} 
              itemsPerPage={itemsPerPage} 
              currentPage={currentPage} 
              onPageChange={setCurrentPage} 
            />
          </div>
        </div>

        {showNewModal && (
          <NewPackage 
            onClose={() => setShowNewModal(false)} 
            onAdd={(p) => setPackages([p, ...packages])} 
          />
        )}
        
        {editingPackage && (
          <EditPackage 
            pkg={editingPackage} 
            onClose={() => setEditingPackage(null)} 
            onUpdate={(up) => setPackages(packages.map(p => p.id === up.id ? up : p))} 
          />
        )}
      </div>
    </div>
  );
};

export default Packages;