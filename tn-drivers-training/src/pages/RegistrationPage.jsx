import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, CheckCircle, AlertCircle, 
  User, Mail, Phone, Lock, MapPin, Home, Globe, Car, 
  Calendar, Award, Hash, Briefcase, PenTool, Camera,
  Users, MapPinned, Cake, Eye, EyeOff
} from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [locations, setLocations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState(null);
  const [isUnder18, setIsUnder18] = useState(false);
  const [showForeignAddress, setShowForeignAddress] = useState(false);

  // Form data – all fields
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '', profile_picture: null,
    package_id: '', province: '', street_address: '', appartment: '', city: '', postal_code: '', state: '', country: 'Canada',
    permit_number: '', permit_issue_date: '', has_foreign_license: false, foreign_license_number: '',
    parent_name: '', parent_email: '', parent_phone: '', experience: '', additional_notes: '',
    foreign_street_address: '', foreign_appartment: '', foreign_city: '', foreign_state: '', foreign_postal_code: '', foreign_country: '',
    dob: ''
  });

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handle DOB change
  const handleDobChange = (e) => {
    const dob = e.target.value;
    setFormData({ ...formData, dob });
    const age = calculateAge(dob);
    setCalculatedAge(age);
    setIsUnder18(age !== null && age < 18);
  };

  // Fetch packages and locations on mount
  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const [locationsRes, packagesRes] = await Promise.all([
          axios.get(`${API_BASE}/locations`),
          axios.get(`${API_BASE}/packages`)
        ]);
        if (locationsRes.data.success) setLocations(locationsRes.data.data);
        if (packagesRes.data.success) setPackages(packagesRes.data.data);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to load registration data' });
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (name === 'has_foreign_license') setShowForeignAddress(checked);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profile_picture: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Age validation (minimum 16)
    if (formData.dob) {
      const age = calculateAge(formData.dob);
      if (age < 16) {
        setMessage({ type: 'error', text: 'You must be at least 16 years old to register' });
        return;
      }
    } else {
      setMessage({ type: 'error', text: 'Date of birth is required' });
      return;
    }
    
    if (formData.password !== formData.password_confirmation) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'profile_picture' && formData[key]) formDataToSend.append(key, formData[key]);
          else if (key === 'has_foreign_license') formDataToSend.append(key, formData[key] ? '1' : '0');
          else formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post(`${API_BASE}/students`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Registration successful! Account pending approval.' });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.errors 
        ? Object.values(error.response.data.errors)[0][0]
        : error.response?.data?.message || 'Registration failed';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.package_id || !formData.province)) {
      setMessage({ type: 'error', text: !formData.package_id ? 'Select a package' : 'Select your location' });
      return;
    }
    if (step === 2 && (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.dob)) {
      setMessage({ type: 'error', text: 'Please fill all required fields including Date of Birth' });
      return;
    }
    setStep(step + 1);
    setMessage({ type: '', text: '' });
  };

  const prevStep = () => {
    setStep(step - 1);
    setMessage({ type: '', text: '' });
  };

  // Styling classes (matching the first design)
  const inputClass = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-slate-900 dark:text-white";
  const labelClass = "block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1";

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={48} />
          <p className="text-slate-500">Loading registration data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header with back button */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/login')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="font-black italic text-lg tracking-tighter uppercase dark:text-white">
            Terra<span className="text-teal-500">Driving</span>
          </h1>
          <div className="w-10" />
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div className="bg-teal-500 h-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:py-10">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 md:p-10">
            <div className="mb-8">
              <span className="text-teal-500 font-black text-[10px] uppercase tracking-[0.2em]">Step {step} of 3</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
                {step === 1 && "Choose Your Package"}
                {step === 2 && "Personal Details"}
                {step === 3 && "Address & License"}
              </h2>
            </div>

            {/* Message Alert */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
                message.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              }`}>
                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              {/* STEP 1: Packages & Location */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 gap-3">
                    {packages.map(pkg => {
                      // Find pricing for selected province (if any)
                      const selectedLoc = locations.find(l => l.id === parseInt(formData.province));
                      const locationPricing = pkg.pricing_by_location?.find(
                        loc => loc.location_name === selectedLoc?.province_name
                      );
                      const displayPrice = locationPricing ? locationPricing.total_price : pkg.base_amount;
                      
                      return (
                        <label
                          key={pkg.id}
                          className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            formData.package_id === pkg.id
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10'
                              : 'border-slate-100 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <input
                              type="radio"
                              name="package"
                              checked={formData.package_id === pkg.id}
                              onChange={() => setFormData({...formData, package_id: pkg.id})}
                              className="w-5 h-5 accent-teal-500"
                            />
                            <div>
                              <p className="font-black dark:text-white">{pkg.package_name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase">{pkg.hours} Hours Training</p>
                            </div>
                          </div>
                          <p className="text-lg font-black text-teal-600">${displayPrice}</p>
                        </label>
                      );
                    })}
                  </div>

                  <div>
                    <label className={labelClass}>Select Training Province</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      <option value="">Select Province</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {loc.province_name} ({loc['tax-type']} {loc.tax_rate}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: Personal Details */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <input name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="Legal Name" required />
                    </div>
                    <div>
                      <label className={labelClass}>Email Address *</label>
                      <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="mail@example.com" required />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number *</label>
                      <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+1 ..." required />
                    </div>
                    
                    {/* Date of Birth */}
                    <div>
                      <label className={labelClass}>Date of Birth *</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleDobChange} className={inputClass} required />
                      {calculatedAge !== null && (
                        <p className={`text-xs mt-1 ${calculatedAge < 16 ? 'text-red-500' : 'text-teal-600'}`}>
                          Age: {calculatedAge} years {calculatedAge < 16 ? '(Must be 16 or older)' : ''}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>Driving Experience</label>
                      <input name="experience" value={formData.experience} onChange={handleChange} className={inputClass} placeholder="e.g. None or 2 Years" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Password *</label>
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="••••••••" required />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Confirm Password *</label>
                        <div className="relative">
                          <input type={showConfirmPassword ? "text" : "password"} name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className={inputClass} placeholder="••••••••" required />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Permit Number</label>
                        <input name="permit_number" value={formData.permit_number} onChange={handleChange} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Issue Date</label>
                        <input type="date" name="permit_issue_date" value={formData.permit_issue_date} onChange={handleChange} className={inputClass} />
                      </div>
                    </div>

                    {/* Profile Picture */}
                    <div>
                      <label className={labelClass}>Profile Picture</label>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 dark:file:bg-teal-900/30 dark:file:text-teal-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Address & License */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-4">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-2">Canadian Residence</p>
                    <input name="street_address" value={formData.street_address} onChange={handleChange} className={inputClass} placeholder="Street Address *" required />
                    <div className="grid grid-cols-2 gap-3">
                      <input name="appartment" value={formData.appartment} onChange={handleChange} className={inputClass} placeholder="Apt/Suite" />
                      <input name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="City *" required />
                      <input name="state" value={formData.state} onChange={handleChange} className={inputClass} placeholder="Province *" required />
                      <input name="postal_code" value={formData.postal_code} onChange={handleChange} className={inputClass} placeholder="Postal Code *" required />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer">
                    <input type="checkbox" name="has_foreign_license" checked={formData.has_foreign_license} onChange={handleChange} className="h-5 w-5 accent-teal-500" />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Hold a Foreign License</span>
                  </label>

                  {showForeignAddress && (
                    <div className="p-5 bg-teal-500/5 rounded-2xl border border-teal-500/20 space-y-3 animate-in slide-in-from-top-2">
                      <p className="text-[10px] font-black text-teal-600 uppercase">Foreign Details</p>
                      <input name="foreign_street_address" value={formData.foreign_street_address} onChange={handleChange} className={inputClass} placeholder="Street" />
                      <div className="grid grid-cols-2 gap-2">
                        <input name="foreign_country" value={formData.foreign_country} onChange={handleChange} className={inputClass} placeholder="Country" />
                        <input name="foreign_license_number" value={formData.foreign_license_number} onChange={handleChange} className={inputClass} placeholder="License #" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input name="foreign_appartment" value={formData.foreign_appartment} onChange={handleChange} className={inputClass} placeholder="Apt/Suite" />
                        <input name="foreign_city" value={formData.foreign_city} onChange={handleChange} className={inputClass} placeholder="City" />
                        <input name="foreign_state" value={formData.foreign_state} onChange={handleChange} className={inputClass} placeholder="State/Province" />
                        <input name="foreign_postal_code" value={formData.foreign_postal_code} onChange={handleChange} className={inputClass} placeholder="Postal Code" />
                      </div>
                    </div>
                  )}

                  {/* Parent/Guardian (auto-shown if under 18) */}
                  {isUnder18 && (
                    <div className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 space-y-3 animate-in slide-in-from-top-2">
                      <p className="text-[10px] font-black text-indigo-600 uppercase">Guardian Contact (Required for minors)</p>
                      <input name="parent_name" value={formData.parent_name} onChange={handleChange} className={inputClass} placeholder="Guardian Full Name" />
                      <input name="parent_email" value={formData.parent_email} onChange={handleChange} className={inputClass} placeholder="Guardian Email" />
                      <input name="parent_phone" value={formData.parent_phone} onChange={handleChange} className={inputClass} placeholder="Guardian Phone" />
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>Additional Notes</label>
                    <textarea name="additional_notes" value={formData.additional_notes} onChange={handleChange} rows="3" className={inputClass} placeholder="Special requests..." />
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer Buttons */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button onClick={prevStep} className="text-xs font-black uppercase text-slate-400 hover:text-teal-600 transition flex items-center gap-2">
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button onClick={nextStep} className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2">
                Next <ArrowLeft size={16} className="rotate-180" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="px-10 py-4 bg-teal-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-500/30 flex items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegistrationPage;