
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X, Car, Hash, Palette, Gauge, FileText,
  Upload, MapPin, ChevronDown, CalendarDays,
  ShieldCheck, Bookmark, AlertCircle, CheckCircle, UploadCloud
} from 'lucide-react';

const BASE_URL = 'http://127.0.0.1:8000/api';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

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

  const [allCars, setAllCars]             = useState([]);
  const [loading, setLoading]             = useState(false);
  const [errors, setErrors]               = useState({}); // Unified Frontend & Backend errors
  const [fileError, setFileError]         = useState('');
  const [plateError, setPlateError]       = useState(''); // Real-time plate error
  const [notification, setNotification]   = useState(null);

  useEffect(() => {
    if (locations.length > 0 && !formData.location_id) {
      setFormData(prev => ({ ...prev, location_id: locations[0].id }));
    }
  }, [locations]);

  // Fetch all cars on load to enable real-time unique plate checking
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${BASE_URL}/cars`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.data && res.data.data) {
          setAllCars(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch cars for validation");
      }
    };
    fetchCars();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    if (type !== 'success') {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Helper for text inputs
  const f = (key, backendKey) => ({
    value: formData[key],
    onChange: (e) => {
      let val = e.target.value;
      
      // Auto-uppercase plate numbers
      if (key === 'plate') val = val.toUpperCase();

      setFormData({ ...formData, [key]: val });
      
      // Clear error when user starts typing
      if (errors[backendKey]) {
        setErrors(prev => ({ ...prev, [backendKey]: null }));
      }

      // Real-time Check: Is the license plate already taken?
      if (key === 'plate') {
        const exists = allCars.some(car => car.number_plate?.toUpperCase() === val);
        if (exists) {
          setPlateError('This license plate is already registered in the system.');
        } else {
          setPlateError('');
        }
      }
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData(prev => ({ ...prev, insuranceFile: null }));
      setFileError('');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size exceeds 2MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      setFormData(prev => ({ ...prev, insuranceFile: null }));
      return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setFileError('Only PDF, JPEG, PNG files are allowed');
      setFormData(prev => ({ ...prev, insuranceFile: null }));
      return;
    }
    setFileError('');
    setFormData(prev => ({ ...prev, insuranceFile: file }));
    
    if (errors['car_document']) {
      setErrors(prev => ({ ...prev, car_document: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setNotification(null);

    // --- Strict Frontend Validations ---
    let frontendErrors = {};
    if (!formData.name.trim()) frontendErrors.car_name = ["Vehicle name is required."];
    if (!formData.plate.trim()) frontendErrors.number_plate = ["License plate is required."];
    if (!formData.model.trim()) frontendErrors.model = ["Model / Year is required."];
    if (!formData.insuranceNo.trim()) frontendErrors.insurance_number = ["Insurance policy number is required."];
    if (!formData.rcNo.trim()) frontendErrors.rc_number = ["Vehicle permit number is required."];
    if (!formData.insuranceExpiry) frontendErrors.insurance_expiry = ["Insurance expiry date is required."];
    if (!formData.rcExpiry) frontendErrors.rc_expiry = ["Permit expiry date is required."];
    if (!formData.location_id) frontendErrors.location_id = ["Assigned location is required."];

    if (plateError) frontendErrors.number_plate = [plateError];

    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors);
      showNotification('warning', 'Please fill all the fields before registering.');
      return;
    }

    if (fileError) {
      showNotification('warning', 'Please fix the file upload errors before submitting.');
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    const data = new FormData();
    data.append('car_name',         formData.name);
    data.append('model',            formData.model);
    data.append('number_plate',     formData.plate);
    data.append('color',            formData.color);
    data.append('location_id',      formData.location_id);
    data.append('odometer',         formData.odometerKm || '0');
    data.append('insurance_number', formData.insuranceNo);
    data.append('rc_number',        formData.rcNo);
    data.append('insurance_expiry', formData.insuranceExpiry);
    data.append('rc_expiry',        formData.rcExpiry);
    if (formData.insuranceFile) {
      data.append('car_document', formData.insuranceFile);
    }

    try {
      const res = await axios.post(`${BASE_URL}/cars`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept':        'application/json',
          'Content-Type':  'multipart/form-data'
        }
      });

      if (res.data.success) {
        showNotification('success', 'Vehicle registered successfully!');
        setTimeout(() => {
          onRegister(); 
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Submit error:', err);
      
      if (err.response?.status === 401) {
        showNotification('error', 'Session expired. Please log in again.');
      } else if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        showNotification('warning', 'Please fix the highlighted validation errors below.');
      } else if (err.response?.status >= 500) {
        showNotification('error', 'A server error occurred. Please try again.');
      } else {
        showNotification('error', err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
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
              Register New <span className="text-teal-600 dark:text-teal-400">Vehicle</span>
            </h2>
            <p className="text-[10px] font-sora text-teal-600 dark:text-teal-400 uppercase tracking-widest mt-1">
              Compliance & Asset Onboarding
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form - Added noValidate so custom React validation handles it */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">

          {/* Basic Information */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field 
                icon={<Car size={14} />} 
                label="Vehicle Name" 
                error={errors.car_name?.[0]} 
                isRequired={true} 
                value={formData.name}
                helperText="e.g., Toyota Corolla"
              >
                <Input placeholder="Enter vehicle make & name..." error={errors.car_name?.[0]} {...f('name', 'car_name')} />
              </Field>
              <Field 
                icon={<Hash size={14} />} 
                label="License Plate" 
                error={plateError || errors.number_plate?.[0]} 
                isRequired={true} 
                value={formData.plate}
                helperText="Must be unique (e.g., ABCD 123)"
              >
                <Input placeholder="Enter plate number..." className="uppercase" error={plateError || errors.number_plate?.[0]} {...f('plate', 'number_plate')} />
              </Field>
            </div>
          </Section>

          {/* Vehicle Specifications */}
          <Section title="Vehicle Specifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field 
                icon={<Car size={14} />} 
                label="Model / Year" 
                error={errors.model?.[0]} 
                isRequired={true} 
                value={formData.model}
                helperText="e.g., 2024 LE"
              >
                <Input placeholder="Enter vehicle model..." error={errors.model?.[0]} {...f('model', 'model')} />
              </Field>
              <Field 
                icon={<Palette size={14} />} 
                label="Vehicle Color" 
                error={errors.color?.[0]}
                isRequired={false}
                value={formData.color}
                helperText="Optional descriptive color"
              >
                <Input placeholder="e.g., Midnight Blue" error={errors.color?.[0]} {...f('color', 'color')} />
              </Field>
              <Field 
                icon={<Gauge size={14} />} 
                label="Odometer (KM)" 
                error={errors.odometer?.[0]} 
                className="md:col-span-2"
                isRequired={false}
                value={formData.odometerKm}
                helperText="Current mileage of the vehicle"
              >
                <Input type="number" placeholder="12500" error={errors.odometer?.[0]} {...f('odometerKm', 'odometer')} />
              </Field>
            </div>
          </Section>

          {/* Compliance & Documentation */}
          <Section title="Compliance & Documentation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                icon={<ShieldCheck size={14} className="text-amber-500" />}
                label="Insurance Policy No."
                error={errors.insurance_number?.[0]}
                isRequired={true}
                value={formData.insuranceNo}
                helperText="Valid Canadian auto insurance policy"
              >
                <Input placeholder="e.g., INS-99234" error={errors.insurance_number?.[0]} {...f('insuranceNo', 'insurance_number')} />
              </Field>
              <Field
                icon={<Bookmark size={14} className="text-blue-500" />}
                label="Vehicle Permit No."
                error={errors.rc_number?.[0]}
                isRequired={true}
                value={formData.rcNo}
                helperText="Provincial vehicle registration number"
              >
                <Input placeholder="e.g., VXP-1102-ON" error={errors.rc_number?.[0]} {...f('rcNo', 'rc_number')} />
              </Field>
              <Field
                icon={<CalendarDays size={14} className="text-amber-500" />}
                label="Insurance Expiry Date"
                error={errors.insurance_expiry?.[0]}
                isRequired={true}
                value={formData.insuranceExpiry}
              >
                <Input type="date" error={errors.insurance_expiry?.[0]} {...f('insuranceExpiry', 'insurance_expiry')} />
              </Field>
              <Field
                icon={<CalendarDays size={14} className="text-blue-500" />}
                label="Permit Expiry Date"
                error={errors.rc_expiry?.[0]}
                isRequired={true}
                value={formData.rcExpiry}
              >
                <Input type="date" error={errors.rc_expiry?.[0]} {...f('rcExpiry', 'rc_expiry')} />
              </Field>
            </div>
          </Section>

          {/* Location Assignment */}
          <Section title="Location Assignment">
            <Field 
              icon={<MapPin size={14} />} 
              label="Assigned Branch Location" 
              error={errors.location_id?.[0]}
              isRequired={true}
              value={formData.location_id}
              helperText="The physical operating branch for this vehicle"
            >
              <div className="relative">
                <select
                  className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium text-slate-900 dark:text-white outline-none appearance-none cursor-pointer transition-all ${errors.location_id ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'}`}
                  value={formData.location_id}
                  onChange={(e) => {
                    setFormData({ ...formData, location_id: e.target.value });
                    if (errors.location_id) setErrors(prev => ({ ...prev, location_id: null }));
                  }}
                >
                  <option value="">Select Location...</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name || loc.province_name || loc.branch_name || `Location ${loc.id}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </Field>
          </Section>

          {/* Insurance Document */}
          <Section title="Registration / Insurance Document">
            <Field 
              icon={<FileText size={14} />} 
              label="Upload Digital Copy (Max 2MB)"
              isRequired={false}
              value={formData.insuranceFile?.name}
              error={errors.car_document?.[0]}
            >
              <div className="relative group">
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={handleFileChange}
                />
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  fileError || errors.car_document
                    ? 'border-red-400 bg-red-50/30 dark:bg-red-950/20'
                    : 'border-slate-200 dark:border-slate-700 group-hover:border-teal-500 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/20'
                }`}>
                  <UploadCloud
                    className={`mx-auto mb-3 transition-colors ${
                      fileError || errors.car_document ? 'text-red-400' : 'text-slate-400 group-hover:text-teal-500'
                    }`}
                    size={40}
                  />
                  <p className={`text-sm font-medium ${fileError || errors.car_document ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                    {formData.insuranceFile
                      ? formData.insuranceFile.name
                      : 'Click or drag vehicle document (PDF/Image)'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supported formats: PDF, JPG, PNG (Max 2MB)</p>
                </div>
              </div>

              {fileError && (
                <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                  <AlertCircle size={12} className="text-red-500 shrink-0" />
                  <p className="text-[10px] font-sora text-red-600 dark:text-red-400">{fileError}</p>
                </div>
              )}

              {formData.insuranceFile && !fileError && !errors.car_document && (
                <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
                  <ShieldCheck size={12} className="text-green-500 shrink-0" />
                  <p className="text-[10px] font-sora text-green-600 dark:text-green-400">
                    {formData.insuranceFile.name} — {(formData.insuranceFile.size / (1024 * 1024)).toFixed(2)}MB
                  </p>
                </div>
              )}
            </Field>
          </Section>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Register Vehicle'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

/* ── Reusable sub-components ─────────────────────────────────────────────── */

const Section = ({ title, children }) => (
  <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
    <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
      <div className="w-1 h-5 bg-teal-500 rounded-full" />
      {title}
    </h3>
    {children}
  </section>
);

const Field = ({ icon, label, error, children, className = '', isRequired, value, helperText }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
      <span className="text-teal-500">{icon}</span>
      {label}
      {isRequired && !value && <span className="text-red-500 animate-pulse">*</span>}
    </label>
    {children}
    {helperText && !error && <p className="text-[10px] text-slate-500 font-medium ml-1">{helperText}</p>}
    {error && <p className="text-[10px] text-rose-500 font-sora mt-0.5 ml-1">{error}</p>}
  </div>
);

const Input = ({ className = '', error, ...props }) => (
  <input
    className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium text-slate-900 dark:text-white outline-none transition-all ${
      error 
      ? 'border-red-500 focus:ring-red-500/20' 
      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
    } ${className}`}
    {...props}
  />
);

export default RegisterVehicleModal;