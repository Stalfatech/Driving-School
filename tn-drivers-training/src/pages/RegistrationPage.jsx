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
  const [uniqueErrors, setUniqueErrors] = useState({ email: '', phone: '' });

  // Form data – all fields
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '', profile_picture: null,
    package_id: '', province: '', street_address: '', appartment: '', city: '', postal_code: '', state: '', country: 'Canada',
    permit_number: '', permit_issue_date: '', has_foreign_license: false, foreign_license_number: '',
    parent_name: '', parent_email: '', parent_phone: '', experience: '', additional_notes: '',
    foreign_street_address: '', foreign_appartment: '', foreign_city: '', foreign_state: '', foreign_postal_code: '', foreign_country: '',
    dob: ''
  });

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

  const handleDobChange = (e) => {
    const dob = e.target.value;
    setFormData({ ...formData, dob });
    const age = calculateAge(dob);
    setCalculatedAge(age);
    setIsUnder18(age !== null && age < 18);
  };

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

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    if ((name === 'email' || name === 'phone') && value) {
      try {
        const response = await axios.post(`${API_BASE}/check-unique`, { field: name, value });
        if (!response.data.is_unique) {
          setUniqueErrors(prev => ({ ...prev, [name]: `This ${name} is already registered.` }));
        } else {
          setUniqueErrors(prev => ({ ...prev, [name]: '' }));
        }
      } catch (error) {
        console.error("Unique check failed", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    const alphabetFields = [
      'name', 'parent_name', 'city', 'state', 'country', 
      'foreign_city', 'foreign_state', 'foreign_country'
    ];
    const numberFields = ['phone', 'parent_phone'];

    if (alphabetFields.includes(name)) {
      newValue = value.replace(/[^\p{L}\s'-]/gu, '');
    } else if (numberFields.includes(name)) {
      newValue = value.replace(/[^0-9+\-()\s]/g, '');
    }

    if (name === 'email' || name === 'phone') {
      setUniqueErrors(prev => ({ ...prev, [name]: '' }));
    }

    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : newValue });
    if (name === 'has_foreign_license') setShowForeignAddress(checked);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profile_picture: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
    
    if (step === 2) {
      if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.dob) {
        setMessage({ type: 'error', text: 'Please fill all required fields including Date of Birth' });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
        setMessage({ type: 'error', text: 'Please enter a valid email address format' });
        return;
      }
      if (formData.phone.replace(/\D/g, '').length < 10) {
        setMessage({ type: 'error', text: 'Phone number must be at least 10 digits' });
        return;
      }
      if (formData.password.length < 8) {
        setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
        return;
      }
      if (formData.password !== formData.password_confirmation) {
        setMessage({ type: 'error', text: 'Passwords do not match' });
        return;
      }
      if (calculateAge(formData.dob) < 16) {
        setMessage({ type: 'error', text: 'You must be at least 16 years old to register' });
        return;
      }
      if (uniqueErrors.email || uniqueErrors.phone) {
        setMessage({ type: 'error', text: 'Please resolve the errors in your email or phone number.' });
        return;
      }
    }

    setStep(step + 1);
    setMessage({ type: '', text: '' });
  };

  const prevStep = () => {
    setStep(step - 1);
    setMessage({ type: '', text: '' });
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-slate-900 dark:text-white [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shrink-0">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/login')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="font-black italic text-lg tracking-tighter uppercase dark:text-white">
            Terra<span className="text-teal-500">Driving</span>
          </h1>
          <div className="w-10" />
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div className="bg-teal-500 h-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </header>

      {/* FIXED HEIGHT CONTAINER WRAPPER */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:py-8 flex items-center justify-center">
        
        {/* THE CARD: strict height limits, flex-col structure */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 w-full h-[750px] max-h-[85vh] flex flex-col overflow-hidden relative">
          
          {/* STATIC HEADER AREA inside the card */}
          <div className="px-6 pt-6 md:px-10 md:pt-10 pb-4 shrink-0 bg-white dark:bg-slate-900 z-10">
            <span className="text-teal-500 font-black text-[10px] uppercase tracking-[0.2em]">Step {step} of 3</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
              {step === 1 && "Choose Your Package"}
              {step === 2 && "Personal Details"}
              {step === 3 && "Address & License"}
            </h2>
          </div>

          {/* SCROLLABLE FORM AREA */}
          <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-6 custom-scrollbar">
            
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

            <form onSubmit={handleSubmit} className="space-y-6 text-left pb-4">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 gap-3">
                    {packages.map(pkg => {
                      const selectedLoc = locations.find(l => l.id === parseInt(formData.province));
                      const locationPricing = pkg.pricing_by_location?.find(
                        loc => loc.location_name === selectedLoc?.province_name
                      );
                      const displayPrice = locationPricing ? locationPricing.total_price : pkg.base_amount;
                      
                      return (
                        <label key={pkg.id} className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.package_id === pkg.id ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10' : 'border-slate-100 dark:border-slate-800'}`}>
                          <div className="flex items-center gap-4">
                            <input type="radio" name="package" checked={formData.package_id === pkg.id} onChange={() => setFormData({...formData, package_id: pkg.id})} className="w-5 h-5 accent-teal-500" />
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
                    <select name="province" value={formData.province} onChange={handleChange} className={inputClass} required>
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

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <input name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="Legal Name" required />
                    </div>
                    
                    <div>
                      <label className={labelClass}>Email Address *</label>
                      <input name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={inputClass} placeholder="mail@example.com" required />
                      {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email) && !uniqueErrors.email && (
                        <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">Please enter a valid email format.</p>
                      )}
                      {uniqueErrors.email && (
                        <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">{uniqueErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className={labelClass}>Phone Number *</label>
                      <input name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} className={inputClass} placeholder="+1 ..." required />
                      {formData.phone && formData.phone.replace(/\D/g, '').length < 10 && !uniqueErrors.phone && (
                        <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">Phone number must contain at least 10 digits.</p>
                      )}
                      {uniqueErrors.phone && (
                        <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">{uniqueErrors.phone}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className={labelClass}>Date of Birth *</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleDobChange} className={inputClass} required />
                      {calculatedAge !== null && (
                        <p className={`text-xs mt-1.5 ml-1 font-medium ${calculatedAge < 16 ? 'text-red-500' : 'text-teal-600'}`}>
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
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <p className={`text-xs mt-1.5 ml-1 font-medium ${formData.password && formData.password.length < 8 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                          Minimum 8 characters required.
                        </p>
                      </div>
                      <div>
                        <label className={labelClass}>Confirm Password *</label>
                        <div className="relative">
                          <input type={showConfirmPassword ? "text" : "password"} name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className={inputClass} placeholder="••••••••" required />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500">
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {formData.password_confirmation && formData.password !== formData.password_confirmation && (
                          <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">Passwords do not match.</p>
                        )}
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

                    <div>
                      <label className={labelClass}>Profile Picture</label>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 dark:file:bg-teal-900/30 dark:file:text-teal-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  
                  {/* Canadian Residence */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-4">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Canadian Residence</p>
                    
                    <div>
                      <label className={labelClass}>Street Address *</label>
                      <input name="street_address" value={formData.street_address} onChange={handleChange} className={inputClass} placeholder="123 Main St" required />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Apt / Suite</label>
                        <input name="appartment" value={formData.appartment} onChange={handleChange} className={inputClass} placeholder="Apt 4B" />
                      </div>
                      <div>
                        <label className={labelClass}>City *</label>
                        <input name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="Toronto" required />
                      </div>
                      <div>
                        <label className={labelClass}>Province *</label>
                        <input name="state" value={formData.state} onChange={handleChange} className={inputClass} placeholder="Ontario" required />
                      </div>
                      <div>
                        <label className={labelClass}>Postal Code *</label>
                        <input name="postal_code" value={formData.postal_code} onChange={handleChange} className={inputClass} placeholder="A1A 1A1" required />
                      </div>
                    </div>
                  </div>

                  {/* Foreign License Toggle */}
                  <label className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <input type="checkbox" name="has_foreign_license" checked={formData.has_foreign_license} onChange={handleChange} className="h-5 w-5 accent-teal-500" />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Hold a Foreign License</span>
                  </label>

                  {/* Foreign Details (Shown if checked) */}
                  {showForeignAddress && (
                    <div className="p-5 bg-teal-500/5 rounded-2xl border border-teal-500/20 space-y-4 animate-in slide-in-from-top-2">
                      <p className="text-[10px] font-black text-teal-600 uppercase mb-2">Foreign Details</p>
                      
                      <div>
                        <label className={labelClass}>Street Address</label>
                        <input name="foreign_street_address" value={formData.foreign_street_address} onChange={handleChange} className={inputClass} placeholder="Local street address" />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Country</label>
                          <input name="foreign_country" value={formData.foreign_country} onChange={handleChange} className={inputClass} placeholder="Origin Country" />
                        </div>
                        <div>
                          <label className={labelClass}>License Number</label>
                          <input name="foreign_license_number" value={formData.foreign_license_number} onChange={handleChange} className={inputClass} placeholder="Foreign License #" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Apt / Suite</label>
                          <input name="foreign_appartment" value={formData.foreign_appartment} onChange={handleChange} className={inputClass} placeholder="Apt/Suite" />
                        </div>
                        <div>
                          <label className={labelClass}>City</label>
                          <input name="foreign_city" value={formData.foreign_city} onChange={handleChange} className={inputClass} placeholder="City" />
                        </div>
                        <div>
                          <label className={labelClass}>State / Province</label>
                          <input name="foreign_state" value={formData.foreign_state} onChange={handleChange} className={inputClass} placeholder="State/Province/Region" />
                        </div>
                        <div>
                          <label className={labelClass}>Postal / ZIP Code</label>
                          <input name="foreign_postal_code" value={formData.foreign_postal_code} onChange={handleChange} className={inputClass} placeholder="Postal Code" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Parent/Guardian (auto-shown if under 18) */}
                  {isUnder18 && (
                    <div className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 space-y-4 animate-in slide-in-from-top-2">
                      <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">Guardian Contact (Required for minors)</p>
                      
                      <div>
                        <label className={labelClass}>Guardian Full Name *</label>
                        <input name="parent_name" value={formData.parent_name} onChange={handleChange} className={inputClass} placeholder="John Doe" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Guardian Email *</label>
                          <input name="parent_email" type="email" value={formData.parent_email} onChange={handleChange} className={inputClass} placeholder="parent@example.com" />
                        </div>
                        <div>
                          <label className={labelClass}>Guardian Phone *</label>
                          <input name="parent_phone" value={formData.parent_phone} onChange={handleChange} className={inputClass} placeholder="+1 ..." />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>Additional Notes</label>
                    <textarea name="additional_notes" value={formData.additional_notes} onChange={handleChange} rows="3" className={inputClass} placeholder="Special requests, scheduling needs, etc." />
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* STATIC FOOTER AREA inside the card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
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

// Custom scrollbar CSS
const style = document.createElement('style');
style.textContent = `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
`;
document.head.appendChild(style);

export default RegistrationPage;