import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, X } from "lucide-react";

const EditPackage = ({ pkg, onClose, onRefresh }) => {
  // 1. Initialize state with the existing package data (Default Values)
  const [formData, setFormData] = useState({
    package_name: pkg.package_name || "",
    amount: pkg.base_amount || pkg.amount || "", // Handles both controller structures
    license_class: pkg.license_class || "Class 5",
    hours: pkg.hours || ""
  });
  const [submitting, setSubmitting] = useState(false);

  // 2. Handle Update Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      // Using the PUT route from your api.php: Route::put('/packages/{id}')
      await axios.put(`http://127.0.0.1:8000/api/packages/${pkg.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onRefresh(); // Trigger parent to re-fetch updated list
      onClose();   // Close modal
    } catch (error) {
      console.error("Update error:", error.response?.data);
      alert(error.response?.data?.message || "Failed to update package");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
        
        {/* Header */}
        <div className="bg-amber-500 p-8 text-white relative">
          <h3 className="text-2xl font-black uppercase italic">Edit Package</h3>
          <p className="text-amber-50 text-xs font-bold uppercase tracking-widest">Update pricing or curriculum</p>
          <button onClick={onClose} className="absolute top-6 right-6 font-black hover:scale-110 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Package Name */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Package Name</label>
            <input 
              type="text" 
              required 
              value={formData.package_name} 
              onChange={(e) => setFormData({...formData, package_name: e.target.value})} 
              className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 rounded-2xl px-5 py-3 outline-none transition-all dark:text-white font-bold" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Hours */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Total Hours</label>
              <input 
                type="number" 
                required 
                value={formData.hours} 
                onChange={(e) => setFormData({...formData, hours: e.target.value})} 
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 rounded-2xl px-5 py-3 outline-none dark:text-white font-bold" 
              />
            </div>
            {/* Amount */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Base Price ($)</label>
              <input 
                type="number" 
                required 
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 rounded-2xl px-5 py-3 outline-none dark:text-white font-bold" 
              />
            </div>
          </div>

          {/* License Class */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">License Class</label>
            <select 
              value={formData.license_class} 
              onChange={(e) => setFormData({...formData, license_class: e.target.value})} 
              className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 outline-none dark:text-white border-2 border-transparent focus:border-amber-500 font-bold"
            >
              <option value="Class 7 L">Class 7 L</option>
              <option value="Class 7 N">Class 7 N</option>
              <option value="Class 5">Class 5</option>
              <option value="Class 1">Class 1</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors uppercase text-[10px] tracking-widest">Cancel</button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 bg-amber-500 text-white rounded-2xl font-black shadow-lg shadow-amber-500/20 hover:opacity-90 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : "Update Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPackage;