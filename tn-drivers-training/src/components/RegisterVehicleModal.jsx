import React, { useState } from 'react';
import { X, Car, Hash, Palette, FileText, Gauge, Upload, MapPin, ChevronDown } from 'lucide-react';

const RegisterVehicleModal = ({ onClose, onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    plate: '',
    color: '',
    location: 'St. John’s / Mount Pearl',
    km: '',
    insuranceFile: null
  });

  const locations = [
    "Burin",
    "Grand Falls",
    "Marystown",
    "St. John’s / Mount Pearl"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-white dark:bg-[#111827] w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic leading-none">
              Register <span className="text-[#008B8B]">Vehicle</span>
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Asset Onboarding</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 shadow-sm transition-all">
            <X size={20}/>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Car size={14} className="text-[#008B8B]"/> Vehicle Name
              </label>
              <input 
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3.5 text-sm font-bold dark:text-white focus:ring-2 focus:ring-[#008B8B]/20 outline-none"
                placeholder="e.g. 2024 Toyota Corolla"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Number Plate */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Hash size={14} className="text-[#008B8B]"/> Number Plate
              </label>
              <input 
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3.5 text-sm font-bold dark:text-white focus:ring-2 focus:ring-[#008B8B]/20 outline-none uppercase"
                placeholder="e.g. VXB-102"
                value={formData.plate}
                onChange={(e) => setFormData({...formData, plate: e.target.value})}
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Palette size={14} className="text-[#008B8B]"/> Vehicle Color
              </label>
              <input 
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3.5 text-sm font-bold dark:text-white focus:ring-2 focus:ring-[#008B8B]/20 outline-none"
                placeholder="e.g. Midnight Blue"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
              />
            </div>

            {/* Starting KM */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Gauge size={14} className="text-[#008B8B]"/> kilometer (KM)
              </label>
              <input 
                required
                type="number"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3.5 text-sm font-bold dark:text-white focus:ring-2 focus:ring-[#008B8B]/20 outline-none"
                placeholder="e.g. 12500"
                value={formData.km}
                onChange={(e) => setFormData({...formData, km: e.target.value})}
              />
            </div>
          </div>

          {/* Location Field - NEW */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} className="text-[#008B8B]"/> Assign Branch Location
            </label>
            <div className="relative">
              <select 
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3.5 text-sm font-bold dark:text-white focus:ring-2 focus:ring-[#008B8B]/20 outline-none appearance-none cursor-pointer"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Insurance Upload */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={14} className="text-[#008B8B]"/> Insurance Document
            </label>
            <div className="relative group">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                onChange={(e) => setFormData({...formData, insuranceFile: e.target.files[0]})}
              />
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 text-center group-hover:border-[#008B8B] group-hover:bg-[#008B8B]/5 transition-all">
                <Upload className="mx-auto text-slate-300 group-hover:text-[#008B8B] mb-2" size={32}/>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                  {formData.insuranceFile ? formData.insuranceFile.name : "Click or drag insurance PDF/Image"}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
            >
              Discard
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 bg-[#008B8B] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#008B8B]/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Add to Fleet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterVehicleModal;