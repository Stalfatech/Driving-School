import React, { useState } from 'react';
import { X } from 'lucide-react';

const EditPackage = ({ pkg, onClose, onUpdate }) => {
  // Use state to handle form inputs
  const [name, setName] = useState(pkg.name);
  const [price, setPrice] = useState(pkg.price);
  const [licenseClass, setLicenseClass] = useState(pkg.licenseClass);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Pass the updated object back to Packages.jsx
    onUpdate({
      ...pkg, // keep the original id
      name: name,
      price: parseFloat(price),
      licenseClass: licenseClass
    });
    
    onClose(); // Close modal
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Edit Package</h2>
            <p className="text-indigo-100 text-xs">Update curriculum details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form className="p-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Package Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3 outline-none transition-all dark:text-white font-bold" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Price ($ CAD)</label>
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3 outline-none transition-all dark:text-white font-bold" 
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">License Class</label>
              <select 
                value={licenseClass} 
                onChange={(e) => setLicenseClass(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 outline-none dark:text-white border-2 border-transparent focus:border-indigo-500 font-bold"
              >
                <option>Class 7 L</option>
                <option>Class 7 N</option>
                <option>Class 5</option>
                <option>Class 1</option>
              </select>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
            >
              Update Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPackage;