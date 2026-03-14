import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, User, Mail, Phone, Lock, MapPin, 
  Home, Globe, Car, Loader2,
  CheckCircle, AlertCircle, Calendar, Award, 
  Hash, Briefcase, PenTool, Camera,
  Users, MapPinned
} from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

const RegisterModal = ({ onClose, onLoginClick }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [locations, setLocations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUnder18, setIsUnder18] = useState(false);
  const [showForeignAddress, setShowForeignAddress] = useState(false);

  // Form data (all fields preserved)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '', profile_picture: null,
    package_id: '', province: '', street_address: '', appartment: '', city: '', postal_code: '', state: '', country: 'Canada',
    permit_number: '', permit_issue_date: '', has_foreign_license: false, foreign_license_number: '',
    parent_name: '', parent_email: '', parent_phone: '', experience: '', additional_notes: '',
    foreign_street_address: '', foreign_appartment: '', foreign_city: '', foreign_state: '', foreign_postal_code: '', foreign_country: ''
  });

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

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({ ...formData, package_id: pkg.id });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profile_picture: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setTimeout(() => { onClose(); if (onLoginClick) onLoginClick(); }, 2000);
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
    if (step === 2 && (!formData.name || !formData.email || !formData.phone || !formData.password)) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }
    setStep(step + 1);
    setMessage({ type: '', text: '' });
  };

  const prevStep = () => {
    setStep(step - 1);
    setMessage({ type: '', text: '' });
  };

  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
        <div className="bg-white/10 backdrop-blur-3xl rounded-3xl p-8 border border-white/20">
          <Loader2 className="animate-spin text-teal-500 mx-auto" size={32} />
          <p className="mt-3 text-sm text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-2 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-4">
        {/* Glass Card */}
        <div className="relative bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          
          {/* FIXED HEADER */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
            <div className="p-4">
              <h2 className="text-xl font-black uppercase tracking-tighter">Join TerraDriving</h2>
              <p className="text-xs opacity-90">Step {step} of 3</p>
            </div>
            
            {/* Progress Steps - Compact */}
            <div className="px-4 pb-3 flex items-center gap-1">
              {[1,2,3].map(i => (
                <div key={i} className="flex-1">
                  <div className={`h-1 rounded-full transition-all ${step >= i ? 'bg-white' : 'bg-white/30'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`mx-4 mt-3 p-2 rounded-lg flex items-center gap-2 text-xs ${
              message.type === 'success' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Scrollable Form Content */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* STEP 1: Package & Location */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-1">
                    <Award size={14} className="text-teal-400" />Choose Package
                  </h3>
                  
                  {/* Package Cards - Smaller */}
                  <div className="grid grid-cols-3 gap-2">
                    {packages.map(pkg => {
                      const locationPricing = pkg.pricing_by_location?.find(
                        loc => loc.location_name === locations.find(l => l.id === parseInt(formData.province))?.province_name
                      );
                      
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => handlePackageSelect(pkg)}
                          className={`p-3 rounded-xl cursor-pointer text-center transition-all ${
                            selectedPackage?.id === pkg.id
                              ? 'bg-teal-500 border border-white shadow-lg'
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <h4 className="text-sm font-black text-white truncate">{pkg.package_name}</h4>
                          <p className="text-xs text-white/60">${pkg.base_amount}</p>
                          {formData.province && locationPricing && (
                            <p className="text-[9px] text-teal-300 mt-1">${locationPricing.total_price}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Location Select */}
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      <MapPin size={12} className="inline mr-1 text-teal-400" />Location *
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none focus:border-teal-500"
                    >
                      <option value="" className="bg-gray-800">Select province</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id} className="bg-gray-800">
                          {loc.province_name} ({loc['tax-type']} {loc.tax_rate}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: Personal Information - Compact */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-1">
                    <User size={14} className="text-teal-400" />Personal Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name"
                      className="col-span-2 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:border-teal-500 outline-none" />
                    
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email"
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:border-teal-500 outline-none" />
                    
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Phone"
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:border-teal-500 outline-none" />
                    
                    <input type="text" name="permit_number" value={formData.permit_number} onChange={handleChange} placeholder="Permit #"
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:border-teal-500 outline-none" />
                    
                    <input type="date" name="permit_issue_date" value={formData.permit_issue_date} onChange={handleChange}
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white [color-scheme:dark] focus:border-teal-500 outline-none" />
                    
                    <input type="text" name="experience" value={formData.experience} onChange={handleChange} placeholder="Experience"
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:border-teal-500 outline-none" />
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required placeholder="Password"
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:border-teal-500 outline-none" />
                      <p className="text-[8px] text-white/40 mt-0.5">Min 8 chars</p>
                    </div>
                    <div>
                      <input type={showConfirmPassword ? "text" : "password"} name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required placeholder="Confirm"
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:border-teal-500 outline-none" />
                    </div>
                  </div>

                  {/* Under 18 Checkbox */}
                  <label className="flex items-center gap-2 p-2 bg-white/5 rounded-lg text-xs cursor-pointer">
                    <input type="checkbox" checked={isUnder18} onChange={(e) => setIsUnder18(e.target.checked)} className="accent-teal-500" />
                    <span className="text-white">I am under 18</span>
                  </label>

                  {/* Profile Picture */}
                  <div>
                    <p className="text-xs font-medium text-white/80 mb-1"><Camera size={12} className="inline mr-1 text-teal-400" />Profile Picture</p>
                    <input type="file" accept="image/*" onChange={handleFileChange}
                      className="w-full text-xs text-white/60 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:bg-teal-500 file:text-white file:border-0" />
                  </div>
                </div>
              )}

              {/* STEP 3: Address & License - Compact */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-1">
                    <Home size={14} className="text-teal-400" />Address & License
                  </h3>
                  
                  {/* Canadian Address */}
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="street_address" value={formData.street_address} onChange={handleChange} required placeholder="Street Address"
                      className="col-span-2 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:border-teal-500 outline-none" />
                    
                    <input type="text" name="appartment" value={formData.appartment} onChange={handleChange} placeholder="Apt/Suite"
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:border-teal-500 outline-none" />
                    
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="City"
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:border-teal-500 outline-none" />
                    
                    <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} required placeholder="Postal Code"
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:border-teal-500 outline-none" />
                    
                    <input type="text" name="state" value={formData.state} onChange={handleChange} required placeholder="Province"
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:border-teal-500 outline-none" />
                  </div>

                  {/* Foreign License Checkbox */}
                  <label className="flex items-center gap-2 p-2 bg-white/5 rounded-lg text-xs cursor-pointer">
                    <input type="checkbox" name="has_foreign_license" checked={formData.has_foreign_license} onChange={handleChange} className="accent-teal-500" />
                    <span className="text-white">I have a foreign license</span>
                  </label>

                  {/* Foreign License Details */}
                  {showForeignAddress && (
                    <div className="p-3 bg-white/5 rounded-lg space-y-2">
                      <h4 className="text-xs font-bold text-teal-400">Foreign License</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" name="foreign_license_number" value={formData.foreign_license_number} onChange={handleChange} placeholder="License #"
                          className="col-span-2 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white" />
                        <input type="text" name="foreign_country" value={formData.foreign_country} onChange={handleChange} placeholder="Country"
                          className="col-span-2 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white" />
                        <input type="text" name="foreign_street_address" value={formData.foreign_street_address} onChange={handleChange} placeholder="Street"
                          className="col-span-2 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white" />
                        <input type="text" name="foreign_appartment" value={formData.foreign_appartment} onChange={handleChange} placeholder="Apt"
                          className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white" />
                        <input type="text" name="foreign_city" value={formData.foreign_city} onChange={handleChange} placeholder="City"
                          className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white" />
                        <input type="text" name="foreign_state" value={formData.foreign_state} onChange={handleChange} placeholder="State"
                          className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white" />
                        <input type="text" name="foreign_postal_code" value={formData.foreign_postal_code} onChange={handleChange} placeholder="Postal"
                          className="col-span-2 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white" />
                      </div>
                    </div>
                  )}

                  {/* Parent/Guardian */}
                  {isUnder18 && (
                    <div className="p-3 bg-white/5 rounded-lg space-y-2">
                      <h4 className="text-xs font-bold text-teal-400">Parent/Guardian</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" name="parent_name" value={formData.parent_name} onChange={handleChange} placeholder="Full Name"
                          className="col-span-2 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white" />
                        <input type="email" name="parent_email" value={formData.parent_email} onChange={handleChange} placeholder="Email"
                          className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white" />
                        <input type="tel" name="parent_phone" value={formData.parent_phone} onChange={handleChange} placeholder="Phone"
                          className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white" />
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  <textarea name="additional_notes" value={formData.additional_notes} onChange={handleChange} rows="2"
                    placeholder="Additional notes (optional)"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-white/30 focus:border-teal-500 outline-none resize-none" />
                </div>
              )}

              {/* Navigation Buttons - Sticky at bottom */}
              <div className="sticky bottom-0 pt-3 border-t border-white/10 bg-white/5 backdrop-blur-sm -mx-4 px-4 py-3 mt-2">
                <div className="flex justify-between">
                  {step > 1 && (
                    <button type="button" onClick={prevStep} className="px-4 py-2 text-xs text-white/60 hover:text-white">
                      ← Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button type="button" onClick={nextStep} className="ml-auto px-5 py-2 bg-teal-500 text-white rounded-lg text-xs font-bold hover:bg-teal-600">
                      Next →
                    </button>
                  ) : (
                    <button type="submit" disabled={loading} className="ml-auto px-5 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50">
                      {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                      {loading ? 'Registering...' : 'Register'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;