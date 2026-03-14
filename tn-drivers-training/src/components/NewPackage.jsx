import React, { useState } from "react";
import axios from "axios";

const NewPackage = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    package_name: "",
    amount: "",
    license_class: "Class 5",
    hours: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      await axios.post("http://127.0.0.1:8000/api/packages", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onRefresh(); // Refresh the list in the parent
      onClose();   // Close modal
    } catch (error) {
      console.error("Submission error:", error.response?.data);
      alert(error.response?.data?.message || "Failed to create package");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
        <div className="bg-teal-500 p-8 text-white relative">
          <h3 className="text-2xl font-black uppercase italic">Create Package</h3>
          <p className="text-teal-50 text-xs font-bold uppercase tracking-widest">Set curriculum and pricing</p>
          <button onClick={onClose} className="absolute top-6 right-6 font-black hover:scale-110 transition">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Package Name</label>
            <input 
              type="text" 
              required 
              value={formData.package_name} 
              onChange={(e) => setFormData({...formData, package_name: e.target.value})} 
              className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-3 outline-none transition-all dark:text-white font-bold" 
              placeholder="e.g. Full GDL Program" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Total Hours</label>
              <input 
                type="number" 
                required 
                value={formData.hours} 
                onChange={(e) => setFormData({...formData, hours: e.target.value})} 
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-3 outline-none dark:text-white font-bold" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Base Price ($)</label>
              <input 
                type="number" 
                required 
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-3 outline-none dark:text-white font-bold" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">License Class</label>
            <select 
              value={formData.license_class} 
              onChange={(e) => setFormData({...formData, license_class: e.target.value})} 
              className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 outline-none dark:text-white border-2 border-transparent focus:border-teal-500 font-bold"
            >
              <option>Class 7 L</option>
              <option>Class 7 N</option>
              <option>Class 5</option>
              <option>Class 1</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors uppercase text-[10px] tracking-widest">Discard</button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 bg-teal-500 text-white rounded-2xl font-black shadow-lg shadow-teal-500/20 hover:opacity-90 transition-all uppercase text-[10px] tracking-widest"
            >
              {submitting ? "Saving..." : "Save Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPackage;