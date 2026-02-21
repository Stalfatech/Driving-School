import React, { useState } from "react";

const NewPackage = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [licenseClass, setLicenseClass] = useState("Class 5");
  const [hours, setHours] = useState(""); // New state for time

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price || !hours) return;

    onAdd({
      id: Date.now(),
      name,
      price: parseFloat(price),
      licenseClass,
      hours: parseInt(hours), // Adding the time value here
      sessions: Math.ceil(parseInt(hours) / 1.5), // Optional: auto-calc sessions
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 transition-colors">
        <div className="bg-teal p-8 text-white relative">
          <h3 className="text-2xl font-black">Create Package</h3>
          <p className="text-teal-50 text-sm">Set curriculum time and pricing</p>
          <button onClick={onClose} className="absolute top-4 right-4 font-bold text-white hover:text-gray-200 transition">X</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Package Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-teal rounded-2xl px-5 py-3 outline-none transition-all dark:text-white font-bold" placeholder="e.g. Full GDL Program" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Total Hours</label>
              <input type="number" required value={hours} onChange={(e) => setHours(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-teal rounded-2xl px-5 py-3 outline-none dark:text-white font-bold" placeholder="e.g. 12" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Price ($)</label>
              <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-teal rounded-2xl px-5 py-3 outline-none dark:text-white font-bold" placeholder="450" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">License Class</label>
            <select value={licenseClass} onChange={(e) => setLicenseClass(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 outline-none dark:text-white border-2 border-transparent focus:border-teal font-bold">
              <option>Class 7 L</option>
              <option>Class 7 N</option>
              <option>Class 5</option>
              <option>Class 1</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors">Discard</button>
            <button type="submit" className="flex-1 bg-teal text-white rounded-2xl font-bold shadow-lg shadow-teal/20 hover:opacity-90 transition-all">Save Package</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPackage;