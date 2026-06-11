
import React, { useState } from 'react';
import axios from 'axios';
import {
    X, Car, Hash, Palette, MapPin,
    Gauge, Edit3, Save,
    ChevronDown, ShieldCheck, Trash2, CalendarDays, FileText, Bookmark, User, AlertCircle, CheckCircle
} from 'lucide-react';

const BASE_URL = 'http://127.0.0.1:8000/api';

const VehicleDetailModal = ({ 
    vehicle, 
    onClose, 
    onUpdate, 
    onDelete, 
    locations = [], 
    instructors = [] 
}) => {
    // Helper function to format ISO dates to YYYY-MM-DD for input fields
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.split('T')[0];
    };

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ 
        ...vehicle,
        insuranceExpiry: formatDate(vehicle.insuranceExpiry),
        rcExpiry: formatDate(vehicle.rcExpiry)
    });
    
    const [newFile, setNewFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({}); // Unified Frontend & Backend errors
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [notification, setNotification] = useState(null); // Custom alert banner

    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    // Check if vehicle is assigned to an instructor
    const isVehicleAssigned = vehicle.instructor && 
                              vehicle.instructor !== null && 
                              vehicle.instructor !== 'Unassigned';

    const showNotification = (type, message) => {
        setNotification({ type, message });
        if (type !== 'success') {
            setTimeout(() => setNotification(null), 5000);
        }
    };

    // Auto-clears errors when the user types
    const handleChange = (field, backendKey, value) => {
        let finalValue = value;
        if (field === 'plate') finalValue = value.toUpperCase();

        setFormData({ ...formData, [field]: finalValue });
        
        if (errors[backendKey]) {
            setErrors(prev => ({ ...prev, [backendKey]: null }));
        }
    };

    const handleSave = async () => {
        setErrors({});
        setNotification(null);
        setSaveSuccess(false);

        // Strict Frontend Validations
        let frontendErrors = {};
        if (!formData.name?.trim()) frontendErrors.car_name = ["Vehicle name is required."];
        if (!formData.plate?.trim()) frontendErrors.number_plate = ["License plate is required."];
        if (!formData.insuranceNo?.trim()) frontendErrors.insurance_number = ["Insurance policy number is required."];
        if (!formData.rcNo?.trim()) frontendErrors.rc_number = ["Vehicle permit number is required."];
        if (!formData.insuranceExpiry) frontendErrors.insurance_expiry = ["Insurance expiry date is required."];
        if (!formData.rcExpiry) frontendErrors.rc_expiry = ["Permit expiry date is required."];
        if (!formData.location_id && !formData.location) frontendErrors.location_id = ["Assigned location is required."];

        if (Object.keys(frontendErrors).length > 0) {
            setErrors(frontendErrors);
            showNotification('warning', 'Please fill  the highlighted area before saving.');
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append('_method', 'POST'); // Laravel convention for updating records with files via POST
        data.append('car_name', formData.name || '');
        data.append('model', formData.model || '');
        data.append('number_plate', formData.plate || '');
        data.append('color', formData.color || '');
        data.append('odometer', formData.km || '');
        data.append('insurance_number', formData.insuranceNo || '');
        data.append('insurance_expiry', formData.insuranceExpiry || '');
        data.append('rc_number', formData.rcNo || '');
        data.append('rc_expiry', formData.rcExpiry || '');

        // Handle location
        if (formData.location_id) {
            data.append('location_id', formData.location_id);
        } else if (formData.location) {
            const matchedLocation = locations.find(l => l.name === formData.location);
            if (matchedLocation) data.append('location_id', matchedLocation.id);
        }

        if (newFile) {
            data.append('car_document', newFile);
        }

        try {
            const res = await axios.post(`${BASE_URL}/cars/${vehicle.id}`, data, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                setIsEditing(false);
                setNewFile(null);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
                showNotification('success', 'Vehicle updated successfully!');
                if (onUpdate) onUpdate();
            }
        } catch (err) {
            console.error("Save Error:", err);
            
            if (err.response?.status === 401) {
                showNotification('error', 'Session expired. Please log in again.');
            } else if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                showNotification('warning', 'Please fix the highlighted validation errors below.');
            } else if (err.response?.status >= 500) {
                showNotification('error', 'A server error occurred. Please try again later.');
            } else {
                showNotification('error', err.response?.data?.message || 'Update failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to decommission this asset? This action cannot be undone.')) {
            if (onDelete) onDelete(vehicle.id);
            onClose();
        }
    };

    const getLocationName = () => {
        if (formData.location) return formData.location;
        const loc = locations.find(l => l.id === formData.location_id);
        return loc?.name || loc?.province_name || 'Not Assigned';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
            <div className="relative bg-white dark:bg-slate-950 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">

                {/* INLINE NOTIFICATION BANNER */}
                {notification && (
                    <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${
                        notification.type === 'success' ? 'bg-emerald-500 text-white' : 
                        notification.type === 'warning' ? 'bg-amber-500 text-white' : 
                        'bg-rose-500 text-white'
                    }`}>
                        {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm font-bold">{notification.message}</span>
                        {notification.type !== 'success' && (
                            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-75"><X size={16}/></button>
                        )}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                            Asset <span className="text-teal-600 dark:text-teal-400">Details</span>
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            VIN: {vehicle.vin || 'N/A'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)} 
                                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-teal-600 hover:text-white transition-all"
                                title="Edit Vehicle"
                            >
                                <Edit3 size={18} />
                            </button>
                        ) : (
                            <button 
                                onClick={handleSave} 
                                disabled={loading} 
                                className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all disabled:opacity-60"
                                title="Save Changes"
                            >
                                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                            </button>
                        )}
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-red-500 text-slate-400 transition-colors"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                    
                    {/* Success Message */}
                    {saveSuccess && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium text-center">
                                Vehicle updated successfully!
                            </p>
                        </div>
                    )}

                    {/* Basic Information Section */}
                    <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                            <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <DataField 
                                icon={<Car size={14}/>} 
                                label="Vehicle Name" 
                                value={formData.name} 
                                isEditing={isEditing} 
                                onChange={v => handleChange('name', 'car_name', v)} 
                                error={errors.car_name?.[0]} 
                                isRequired={true}
                            />
                            <DataField 
                                icon={<Car size={14}/>} 
                                label="Model / Year" 
                                value={formData.model} 
                                isEditing={isEditing} 
                                onChange={v => handleChange('model', 'model', v)} 
                                error={errors.model?.[0]} 
                                isRequired={true}
                            />
                            <DataField 
                                icon={<Hash size={14}/>} 
                                label="Plate Number" 
                                value={formData.plate} 
                                isEditing={isEditing} 
                                onChange={v => handleChange('plate', 'number_plate', v)} 
                                className="uppercase" 
                                error={errors.number_plate?.[0]} 
                                isRequired={true}
                            />
                            <DataField 
                                icon={<Palette size={14}/>} 
                                label="Color" 
                                value={formData.color} 
                                isEditing={isEditing} 
                                onChange={v => handleChange('color', 'color', v)} 
                                error={errors.color?.[0]} 
                            />
                            <DataField 
                                icon={<Gauge size={14}/>} 
                                label="Odometer (KM)" 
                                value={formData.km} 
                                isEditing={isEditing} 
                                type="number" 
                                onChange={v => handleChange('km', 'odometer', v)} 
                                error={errors.odometer?.[0]} 
                            />
                        </div>
                    </section>

                    {/* Compliance Documents Section */}
                    <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                            <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                            Compliance Documents
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-5">
                                <DataField 
                                    icon={<ShieldCheck size={14}/>} 
                                    label="Insurance Number" 
                                    value={formData.insuranceNo} 
                                    isEditing={isEditing} 
                                    onChange={v => handleChange('insuranceNo', 'insurance_number', v)} 
                                    error={errors.insurance_number?.[0]} 
                                    isRequired={true}
                                />
                                <DataField 
                                    icon={<CalendarDays size={14}/>} 
                                    label="Insurance Expiry" 
                                    value={formData.insuranceExpiry} 
                                    isEditing={isEditing} 
                                    type="date" 
                                    onChange={v => handleChange('insuranceExpiry', 'insurance_expiry', v)} 
                                    error={errors.insurance_expiry?.[0]} 
                                    isRequired={true}
                                />
                            </div>
                            <div className="space-y-5">
                                <DataField 
                                    icon={<Bookmark size={14}/>} 
                                    label="RC Number" 
                                    value={formData.rcNo} 
                                    isEditing={isEditing} 
                                    onChange={v => handleChange('rcNo', 'rc_number', v)} 
                                    error={errors.rc_number?.[0]} 
                                    isRequired={true}
                                />
                                <DataField 
                                    icon={<CalendarDays size={14}/>} 
                                    label="RC Expiry" 
                                    value={formData.rcExpiry} 
                                    isEditing={isEditing} 
                                    type="date" 
                                    onChange={v => handleChange('rcExpiry', 'rc_expiry', v)} 
                                    error={errors.rc_expiry?.[0]} 
                                    isRequired={true}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Assignment Details Section */}
                    <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                            <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                            Assignment Details
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Location Field */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin size={14} className="text-teal-500" /> Branch Location
                                    {isEditing && !formData.location_id && !formData.location && <span className="text-red-500 animate-pulse">*</span>}
                                </label>
                                {isEditing ? (
                                    isVehicleAssigned ? (
                                        <div className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2.5 text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            <span>Location locked - vehicle assigned to instructor</span>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <select
                                                className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium text-slate-900 dark:text-white appearance-none cursor-pointer transition-all outline-none ${
                                                    errors.location_id ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
                                                }`}
                                                value={formData.location_id || ''}
                                                onChange={(e) => {
                                                    const id = parseInt(e.target.value);
                                                    const loc = locations.find(l => l.id === id);
                                                    setFormData({ ...formData, location_id: id, location: loc?.name || '' });
                                                    if (errors.location_id) setErrors(prev => ({...prev, location_id: null}));
                                                }}
                                            >
                                                <option value="">Select Location</option>
                                                {locations.map(loc => (
                                                    <option key={loc.id} value={loc.id}>
                                                        {loc.name || loc.province_name || loc.branch_name || `Location ${loc.id}`}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    )
                                ) : (
                                    <div className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-white">
                                        {getLocationName()}
                                    </div>
                                )}
                                {errors.location_id?.[0] && (
                                    <p className="text-[10px] text-red-500 font-mono mt-0.5">{errors.location_id[0]}</p>
                                )}
                            </div>

                            {/* Instructor Field */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                    <User size={14} className={`${isVehicleAssigned ? 'text-teal-500' : 'text-slate-400'}`} /> Assigned Instructor
                                </label>
                                <div className={`px-4 py-2.5 rounded-lg border text-sm font-medium ${
                                    isVehicleAssigned 
                                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white' 
                                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                                }`}>
                                    {isVehicleAssigned ? vehicle.instructor : 'Unassigned'}
                                </div>
                                {isEditing && isVehicleAssigned && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                                        <AlertCircle size={12} />
                                        Cannot edit while assigned
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Document Section */}
                    <section className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 text-white relative overflow-hidden">
                        <div className="relative z-10 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-teal-400 border border-white/20">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">Onboarded Documentation</p>
                                <p className="text-sm font-medium truncate max-w-[200px]">
                                    {newFile ? newFile.name : (vehicle.carDocument ? `Doc_${vehicle.plate || 'Asset'}.pdf` : 'No document uploaded')}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    {vehicle.carDocument && (
                                        <a 
                                            href={`${BASE_URL}/storage/${vehicle.carDocument}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-xs font-semibold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-all"
                                        >
                                            View
                                        </a>
                                    )}
                                    {isEditing && (
                                        <label className="text-xs font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-400 px-3 py-1 rounded-lg cursor-pointer hover:bg-teal-500/30 transition-all">
                                            {vehicle.carDocument ? 'Replace' : 'Upload'}
                                            <input 
                                                type="file" 
                                                accept=".pdf,.jpg,.png" 
                                                className="hidden" 
                                                onChange={(e) => {
                                                    setNewFile(e.target.files[0]);
                                                    if(errors.car_document) setErrors(prev => ({...prev, car_document: null}));
                                                }} 
                                            />
                                        </label>
                                    )}
                                </div>
                                {errors.car_document?.[0] && (
                                    <p className="text-[10px] text-red-400 font-mono mt-1">{errors.car_document[0]}</p>
                                )}
                            </div>
                        </div>
                        <ShieldCheck size={100} className="absolute -right-8 -bottom-8 text-white opacity-5 rotate-12" />
                    </section>

                    {/* Action Buttons */}
                    <div className="pt-4">
                        {isEditing ? (
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => { 
                                        setIsEditing(false); 
                                        setErrors({}); 
                                        setNotification(null);
                                        setFormData({ 
                                            ...vehicle,
                                            insuranceExpiry: formatDate(vehicle.insuranceExpiry),
                                            rcExpiry: formatDate(vehicle.rcExpiry)
                                        }); 
                                        setNewFile(null);
                                    }} 
                                    className="flex-1 px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave} 
                                    disabled={loading} 
                                    className="flex-1 px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleDelete} 
                                className="w-full py-3 text-red-600 dark:text-red-400 font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all border border-dashed border-transparent hover:border-red-200 dark:hover:border-red-800"
                            >
                                <Trash2 size={16} /> Decommission Asset
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Unified DataField component with dynamic asterisk and red borders
const DataField = ({ icon, label, value, isEditing, onChange, type = 'text', className = '', error, isRequired = false }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="text-teal-500">{icon}</span> {label}
            {isRequired && !value && isEditing && <span className="text-red-500 animate-pulse">*</span>}
        </label>
        {isEditing ? (
            <input
                type={type}
                className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium text-slate-900 dark:text-white outline-none transition-all ${
                    error 
                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
                } ${className}`}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
            />
        ) : (
            <div className={`px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-white ${className}`}>
                {value || <span className="text-slate-400">Not Set</span>}
            </div>
        )}
        {error && <p className="text-[10px] text-red-500 font-sora mt-0.5 ml-1">{error}</p>}
    </div>
);

export default VehicleDetailModal;
