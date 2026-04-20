



import React, { useState, useEffect } from 'react';
import {
  X, Car, Hash, Palette, Gauge, FileText,
  Upload, MapPin, ChevronDown, CalendarDays,
  ShieldCheck, Bookmark, AlertCircle
} from 'lucide-react';

const BASE_URL = 'http://localhost:8000/api';
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

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

  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (locations.length > 0 && !formData.location_id) {
      setFormData(prev => ({ ...prev, location_id: locations[0].id }));
    }
  }, [locations]);

  const f = (key) => ({
    value:    formData[key],
    onChange: (e) => setFormData({ ...formData, [key]: e.target.value }),
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData(prev => ({ ...prev, insuranceFile: null }));
      setFileError('');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size exceeds 1MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileError) return;

    setLoading(true);
    setErrors({});

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
      const res = await fetch(`${BASE_URL}/cars`, {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept':        'application/json',
          // ⚠️ Do NOT manually set Content-Type with FormData —
          // the browser sets it automatically with the correct multipart boundary
        },
        body: data,
      });

      const json = await res.json();

      if (res.ok && json.success) {
        onRegister(); // ✅ No args — FleetManagement.handleRegister just calls fetchCars()
        onClose();
      } else if (res.status === 401) {
        alert('Session expired. Please log in again.');
      } else if (res.status === 422) {
        setErrors(json.errors || {});
      } else {
        alert(json.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Network error. Check if your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-950 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Register New <span className="text-teal-600 dark:text-teal-400">Vehicle</span>
            </h2>
            <p className="text-[10px] font-mono text-teal-600 dark:text-teal-400 uppercase tracking-widest mt-1">
              Compliance & Asset Onboarding
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* Basic Information */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field icon={<Car size={14} />} label="Vehicle Name" error={errors.car_name?.[0]}>
                <Input required placeholder="2024 Toyota Corolla" {...f('name')} />
              </Field>
              <Field icon={<Hash size={14} />} label="Number Plate" error={errors.number_plate?.[0]}>
                <Input required placeholder="VXB-102" className="uppercase" {...f('plate')} />
              </Field>
            </div>
          </Section>

          {/* Vehicle Specifications */}
          <Section title="Vehicle Specifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field icon={<Car size={14} />} label="Model" error={errors.model?.[0]}>
                <Input required placeholder="Zxi / TDI..." {...f('model')} />
              </Field>
              <Field icon={<Palette size={14} />} label="Vehicle Color" error={errors.color?.[0]}>
                <Input placeholder="Midnight Blue" {...f('color')} />
              </Field>
              <Field icon={<Gauge size={14} />} label="Odometer (KM)" error={errors.odometer?.[0]} className="md:col-span-2">
                <Input type="number" placeholder="12500" {...f('odometerKm')} />
              </Field>
            </div>
          </Section>

          {/* Compliance & Documentation */}
          <Section title="Compliance & Documentation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                icon={<ShieldCheck size={14} className="text-amber-500" />}
                label="Insurance No."
                error={errors.insurance_number?.[0]}
              >
                <Input required placeholder="INS-99234" {...f('insuranceNo')} />
              </Field>
              <Field
                icon={<Bookmark size={14} className="text-blue-500" />}
                label="RC Number"
                error={errors.rc_number?.[0]}
              >
                <Input required placeholder="RC-1102-NL" {...f('rcNo')} />
              </Field>
              <Field
                icon={<CalendarDays size={14} className="text-amber-500" />}
                label="Insurance Expiry Date"
                error={errors.insurance_expiry?.[0]}
              >
                <Input required type="date" {...f('insuranceExpiry')} />
              </Field>
              <Field
                icon={<CalendarDays size={14} className="text-blue-500" />}
                label="RC Expiry Date"
                error={errors.rc_expiry?.[0]}
              >
                <Input required type="date" {...f('rcExpiry')} />
              </Field>
            </div>
          </Section>

          {/* Location Assignment */}
          <Section title="Location Assignment">
            <Field icon={<MapPin size={14} />} label="Assigned Branch Location" error={errors.location_id?.[0]}>
              <div className="relative">
                <select
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none appearance-none cursor-pointer transition-all"
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
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
          <Section title="Insurance Document">
            <Field icon={<FileText size={14} />} label="Upload Document (Max 1MB)">
              <div className="relative group">
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={handleFileChange}
                />
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  fileError
                    ? 'border-red-400 bg-red-50/30 dark:bg-red-950/20'
                    : 'border-slate-200 dark:border-slate-700 group-hover:border-teal-500 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/20'
                }`}>
                  <Upload
                    className={`mx-auto mb-3 transition-colors ${
                      fileError ? 'text-red-400' : 'text-slate-400 group-hover:text-teal-500'
                    }`}
                    size={40}
                  />
                  <p className={`text-sm font-medium ${fileError ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                    {formData.insuranceFile
                      ? formData.insuranceFile.name
                      : 'Click or drag insurance document (PDF/Image)'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supported formats: PDF, JPG, PNG (Max 1MB)</p>
                </div>
              </div>

              {fileError && (
                <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                  <AlertCircle size={12} className="text-red-500 shrink-0" />
                  <p className="text-[10px] font-mono text-red-600 dark:text-red-400">{fileError}</p>
                </div>
              )}

              {formData.insuranceFile && !fileError && (
                <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center gap-2">
                  <ShieldCheck size={12} className="text-green-500 shrink-0" />
                  <p className="text-[10px] font-mono text-green-600 dark:text-green-400">
                    {formData.insuranceFile.name} — {(formData.insuranceFile.size / (1024 * 1024)).toFixed(2)}MB
                  </p>
                </div>
              )}
            </Field>
          </Section>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
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

const Field = ({ icon, label, error, children, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
      <span className="text-teal-500">{icon}</span>
      {label}
    </label>
    {children}
    {error && <p className="text-[10px] text-rose-500 font-mono mt-0.5">{error}</p>}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all ${className}`}
    {...props}
  />
);

export default RegisterVehicleModal;