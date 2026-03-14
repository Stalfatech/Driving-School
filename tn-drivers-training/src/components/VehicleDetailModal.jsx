
import React, { useState } from 'react';
import {
    X, Car, Hash, Palette, MapPin,
    Gauge, Edit3, Save,
    ChevronDown, ShieldCheck, Trash2, CalendarDays, FileText, Bookmark
} from 'lucide-react';

const BASE_URL = 'http://localhost:8000/api';

const VehicleDetailModal = ({ vehicle, onClose, onUpdate, onDelete, locations = [] }) => {
    // Helper function to format ISO dates to YYYY-MM-DD for input fields
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.split('T')[0]; // Grabs only the YYYY-MM-DD part
    };

    const [isEditing, setIsEditing] = useState(false);
    // Format the initial dates from the vehicle object
    const [formData, setFormData] = useState({ 
        ...vehicle,
        insuranceExpiry: formatDate(vehicle.insuranceExpiry),
        rcExpiry: formatDate(vehicle.rcExpiry)
    });
    const [newFile, setNewFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');

    const handleSave = async () => {
        setLoading(true);
        setErrors({});

        const data = new FormData();
        data.append('_method', 'POST'); 
        data.append('car_name', formData.name || '');
        data.append('number_plate', formData.plate || '');
        data.append('color', formData.color || '');
        data.append('odometer', formData.km || '');
        data.append('insurance_number', formData.insuranceNo || '');
        data.append('insurance_expiry', formData.insuranceExpiry || '');
        data.append('rc_number', formData.rcNo || '');
        data.append('rc_expiry', formData.rcExpiry || '');

        if (formData.location_id) {
            data.append('location_id', formData.location_id);
        } else {
            const matchedLocation = locations.find(l => l.name === formData.location);
            if (matchedLocation) data.append('location_id', matchedLocation.id);
        }

        if (newFile) {
            data.append('car_document', newFile);
        }

        try {
            const res = await fetch(`${BASE_URL}/cars/${vehicle.id}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: data,
            });

            const json = await res.json();

            if (res.ok) {
                setIsEditing(false);
                setNewFile(null);
                onUpdate();
            } else if (res.status === 422) {
                setErrors(json.errors || {});
            } else {
                alert(json.message || 'Update failed.');
            }
        } catch (err) {
            console.error("Save Error:", err);
            alert('Network error. Check if your backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 transition-all">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="bg-white dark:bg-[#111827] w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[95vh]">

                {/* Header */}
                <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic leading-none">
                            Asset <span className="text-[#008B8B]">Intelligence</span>
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">VIN: {formData.vin}</p>
                    </div>
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="p-2.5 bg-[#008B8B]/10 text-[#008B8B] rounded-full hover:bg-[#008B8B] hover:text-white transition-all shadow-sm active:scale-90">
                                <Edit3 size={20} />
                            </button>
                        ) : (
                            <button onClick={handleSave} disabled={loading} className="p-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all shadow-lg active:scale-90 disabled:opacity-60">
                                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block" /> : <Save size={20} />}
                            </button>
                        )}
                        <button onClick={onClose} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 transition-all active:scale-90">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DataField icon={<Car size={16}/>} label="Vehicle Name" value={formData.name} isEditing={isEditing} onChange={v => setFormData({...formData, name: v})} error={errors.car_name?.[0]} />
                        <DataField icon={<Hash size={16}/>} label="Plate Number" value={formData.plate} isEditing={isEditing} onChange={v => setFormData({...formData, plate: v})} className="uppercase" error={errors.number_plate?.[0]} />
                        <DataField icon={<Palette size={16}/>} label="Color" value={formData.color} isEditing={isEditing} onChange={v => setFormData({...formData, color: v})} error={errors.color?.[0]} />
                        <DataField icon={<Gauge size={16}/>} label="Odometer (KM)" value={formData.km} isEditing={isEditing} type="number" onChange={v => setFormData({...formData, km: v})} error={errors.odometer?.[0]} />
                    </div>

                    {/* Compliance Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck size={14} className="text-[#008B8B]" /> Compliance Documents
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                            <div className="space-y-6">
                                <DataField icon={<ShieldCheck size={16}/>} label="Insurance No." value={formData.insuranceNo} isEditing={isEditing} onChange={v => setFormData({...formData, insuranceNo: v})} error={errors.insurance_number?.[0]} />
                                <DataField icon={<CalendarDays size={16}/>} label="Insurance Expiry" value={formData.insuranceExpiry} isEditing={isEditing} type="date" onChange={v => setFormData({...formData, insuranceExpiry: v})} error={errors.insurance_expiry?.[0]} />
                            </div>
                            <div className="space-y-6">
                                <Bookmark size={16} className="hidden" /> {/* Placeholder for logic alignment */}
                                <DataField icon={<Bookmark size={16}/>} label="RC Number" value={formData.rcNo} isEditing={isEditing} onChange={v => setFormData({...formData, rcNo: v})} error={errors.rc_number?.[0]} />
                                <DataField icon={<CalendarDays size={16}/>} label="RC Expiry" value={formData.rcExpiry} isEditing={isEditing} type="date" onChange={v => setFormData({...formData, rcExpiry: v})} error={errors.rc_expiry?.[0]} />
                            </div>
                        </div>
                    </div>

                    {/* Location - FIXED */}
                    <div className="bg-[#008B8B]/5 p-6 rounded-[2rem] border border-[#008B8B]/10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={14} className="text-[#008B8B]" /> Branch Location
                            </label>
                            {isEditing ? (
                                <div className="relative">
                                    <select
                                        className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700 appearance-none cursor-pointer"
                                        value={formData.location_id || ''}
                                        onChange={(e) => {
                                            const id = parseInt(e.target.value);
                                            const loc = locations.find(l => l.id === id);
                                            setFormData({ ...formData, location_id: id, location: loc?.name || '' });
                                        }}
                                    >
                                        <option value="" className="text-gray-400 dark:text-gray-500">Select Location</option>
                                        {locations.map(loc => (
                                            <option 
                                                key={loc.id} 
                                                value={loc.id}
                                                className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                                            >
                                                {loc.name || loc.province_name || loc.branch_name || `Location ${loc.id}`}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            ) : (
                                <p className="text-sm font-bold dark:text-white px-1 uppercase">
                                    {formData.location || locations.find(l => l.id === formData.location_id)?.name || 'Not Assigned'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* File Area */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white flex items-center justify-between relative group overflow-hidden border-2 border-[#008B8B]/20 shadow-xl">
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="size-16 rounded-[1.25rem] bg-white/10 flex items-center justify-center text-[#008B8B] border border-white/10">
                                <FileText size={32} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-[#008B8B] uppercase tracking-[0.2em] mb-1">Onboarded Documentation</p>
                                <h4 className="text-base font-bold italic uppercase leading-tight tracking-tight truncate w-40">
                                    {newFile ? newFile.name : `Doc_${formData.plate || 'Asset'}.pdf`}
                                </h4>
                                <div className="flex gap-4 mt-3">
                                    {formData.carDocument && (
                                        <a href={`http://localhost:8000/storage/${formData.carDocument}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all border border-white/5">
                                            View Policy
                                        </a>
                                    )}
                                    {isEditing && (
                                        <label className="text-[10px] font-black uppercase tracking-widest bg-[#008B8B]/20 text-[#008B8B] px-4 py-2 rounded-lg transition-all border border-[#008B8B]/20 cursor-pointer">
                                            Replace File
                                            <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={(e) => setNewFile(e.target.files[0])} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                        <ShieldCheck size={120} className="absolute -right-4 -bottom-4 text-white opacity-5 rotate-12 group-hover:rotate-0 transition-all duration-700" />
                    </div>

                    {/* Buttons */}
                    <div className="pt-4">
                        {isEditing ? (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={() => { setIsEditing(false); setErrors({}); setFormData({...vehicle, insuranceExpiry: formatDate(vehicle.insuranceExpiry), rcExpiry: formatDate(vehicle.rcExpiry)}); }} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={loading} className="flex-[2] py-4 bg-[#008B8B] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                    {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />} Save Changes
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => onDelete(vehicle.id)} className="w-full py-4 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all border border-dashed border-transparent hover:border-rose-200">
                                <Trash2 size={16} /> Decommission Asset
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DataField = ({ icon, label, value, isEditing, onChange, type = 'text', className = '', error }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="text-[#008B8B]">{icon}</span> {label}
        </label>
        {isEditing ? (
            <input
                type={type}
                className={`w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white ring-1 ring-slate-100 dark:ring-slate-700 outline-none transition-all ${className}`}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
            />
        ) : (
            <p className={`text-sm font-bold text-slate-800 dark:text-white px-1 py-1 ${className}`}>{value || 'Not Set'}</p>
        )}
        {error && <p className="text-[10px] text-rose-500 font-bold">{error}</p>}
    </div>
);

export default VehicleDetailModal;