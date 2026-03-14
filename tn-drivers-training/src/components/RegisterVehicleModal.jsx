
import React, { useState, useEffect } from 'react';
import {
  X, Car, Hash, Palette, FileText, Gauge,
  Upload, MapPin, ChevronDown, CalendarDays, ShieldCheck, Bookmark
} from 'lucide-react';

const BASE_URL = 'http://localhost:8000/api';

const RegisterVehicleModal = ({ onClose, onRegister, locations = [] }) => {
  const [formData, setFormData] = useState({
    name:            '',
    model:           '',
    plate:           '',
    color:           '',
    location_id:     '',
    odometerKm:      '',
    insuranceNo:     '',
    rcNo:            '',
    insuranceExpiry: '',
    rcExpiry:        '',
    insuranceFile:   null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  // Set default location_id once locations are available
  useEffect(() => {
    if (locations.length > 0 && !formData.location_id) {
      setFormData(prev => ({ ...prev, location_id: locations[0].id }));
    }
  }, [locations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const token = localStorage.getItem('access_token');

    const data = new FormData();
    data.append('car_name',         formData.name);
    data.append('model',            formData.model);
    data.append('number_plate',     formData.plate);
    data.append('color',            formData.color);
    data.append('location_id',      formData.location_id);
    data.append('odometer',         formData.odometerKm);
    data.append('insurance_number', formData.insuranceNo);
    data.append('rc_number',        formData.rcNo);
    data.append('insurance_expiry', formData.insuranceExpiry);
    data.append('rc_expiry',        formData.rcExpiry);
    
    if (formData.insuranceFile) {
      data.append('car_document', formData.insuranceFile);
    }

    try {
      const res = await fetch(`${BASE_URL}/cars`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: data,
      });

      const json = await res.json();

      if (res.ok && json.success) {
        onRegister();
      } else if (res.status === 401) {
        alert("Session expired. Please log in again.");
      } else if (res.status === 422) {
        setErrors(json.errors || {});
      } else {
        alert(json.message || 'Registration failed.');
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert('Network error. Check if your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({
    value:    formData[key],
    onChange: (e) => setFormData({ ...formData, [key]: e.target.value }),
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="bg-white dark:bg-[#111827] w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic leading-none">Register <span className="text-[#008B8B]">Vehicle</span></h2>
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mt-1">Compliance & Asset Onboarding</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 shadow-sm transition-all active:scale-90"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField icon={<Car size={14} />} label="Vehicle Name" error={errors.car_name?.[0]}>
              <input required className={inputCls} placeholder="2024 Toyota Corolla" {...f('name')} />
            </FormField>
            <FormField icon={<Car size={14} />} label="Model" error={errors.model?.[0]}>
              <input required className={inputCls} placeholder="Corolla" {...f('model')} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField icon={<Hash size={14} />} label="Number Plate" error={errors.number_plate?.[0]}>
              <input required className={`${inputCls} uppercase`} placeholder="VXB-102" {...f('plate')} />
            </FormField>
            <FormField icon={<Palette size={14} />} label="Vehicle Color" error={errors.color?.[0]}>
              <input className={inputCls} placeholder="Midnight Blue" {...f('color')} />
            </FormField>
          </div>
          <FormField icon={<Gauge size={14} />} label="Odometer (KM)" error={errors.odometer?.[0]}>
            <input type="number" className={inputCls} placeholder="12500" {...f('odometerKm')} />
          </FormField>

          {/* Compliance Section */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField icon={<ShieldCheck size={14} className="text-orange-500" />} label="Insurance No." error={errors.insurance_number?.[0]}>
                <input required className={inputSmCls} placeholder="INS-99234" {...f('insuranceNo')} />
              </FormField>
              <FormField icon={<Bookmark size={14} className="text-blue-500" />} label="RC Number" error={errors.rc_number?.[0]}>
                <input required className={inputSmCls} placeholder="RC-1102-NL" {...f('rcNo')} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-200 dark:border-slate-700">
              <FormField icon={<CalendarDays size={14} className="text-orange-500" />} label="Insurance Expiry" error={errors.insurance_expiry?.[0]}>
                <input required type="date" className={inputSmCls} {...f('insuranceExpiry')} />
              </FormField>
              <FormField icon={<CalendarDays size={14} className="text-blue-500" />} label="RC Expiry" error={errors.rc_expiry?.[0]}>
                <input required type="date" className={inputSmCls} {...f('rcExpiry')} />
              </FormField>
            </div>
          </div>

          {/* Location Field - FIXED VISIBILITY */}
          <FormField icon={<MapPin size={14} />} label="Assign Branch Location" error={errors.location_id?.[0]}>
            <div className="relative">
              <select 
                required 
                className={`${inputCls} appearance-none cursor-pointer`} 
                value={formData.location_id} 
                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                style={{ color: formData.location_id ? 'inherit' : '#9CA3AF' }}
              >
                <option value="" className="text-gray-400 dark:text-gray-500">Select Location...</option>
                {locations.map(loc => (
                  <option 
                    key={loc.id} 
                    value={loc.id} 
                    className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    style={{ color: '#1F2937' }}
                  >
                    {loc.name || loc.province_name || loc.branch_name || `Location ${loc.id}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </FormField>

          <FormField icon={<FileText size={14} />} label="Insurance Document">
            <div className="relative group">
              <input type="file" accept=".pdf,.jpg,.png" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setFormData({ ...formData, insuranceFile: e.target.files[0] })} />
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 text-center group-hover:border-[#008B8B] group-hover:bg-[#008B8B]/5 transition-all">
                <Upload className="mx-auto text-slate-300 group-hover:text-[#008B8B] mb-2" size={32} />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{formData.insuranceFile ? formData.insuranceFile.name : 'Click or drag insurance PDF/Image'}</p>
              </div>
            </div>
          </FormField>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">Discard</button>
            <button type="submit" disabled={loading} className="flex-[2] py-4 bg-[#008B8B] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#008B8B]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Add to Fleet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const inputCls   = 'w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#008B8B]/20 outline-none';
const inputSmCls = 'w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#008B8B]/20';

const FormField = ({ icon, label, error, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span className="text-[#008B8B]">{icon}</span> {label}</label>
    {children}
    {error && <p className="text-[10px] text-rose-500 font-bold mt-1">{error}</p>}
  </div>
);

export default RegisterVehicleModal;