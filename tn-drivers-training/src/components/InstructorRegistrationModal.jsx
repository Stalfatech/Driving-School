
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, User, Mail, Phone, MapPin, BadgeCheck, 
  Car, Globe, Briefcase, FileText, Save, Loader2, 
  UploadCloud, CheckSquare, AlertCircle, CheckCircle
} from 'lucide-react';

const InstructorRegistrationModal = ({ isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [allCars, setAllCars] = useState([]); 
  const [assignedCarIds, setAssignedCarIds] = useState([]); 

  const [uniqueErrors, setUniqueErrors] = useState({ email: '', phone: '' });
  const [errors, setErrors] = useState({}); // Stores both frontend & backend 422 errors
  const [notification, setNotification] = useState(null); // Custom alert banner

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    language: 'English',
    country: 'Canada',
    city: '',
    province: 'Ontario',
    streetAddress: '',
    postalCode: '',
    assignedLocation: '',
    empStatus: 'Full-time',
    carId: '',
    driversLicense: '',
    instructorLicense: '',
    licenceExpiry: '',
    qualifications: ''
  });

  const [files, setFiles] = useState({
    docCriminalCert: null,
    docVulnerableSector: null,
    docDriverAbstract: null
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    if (type !== 'success') {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Fetch Locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get('http://127.0.0.1:8000/api/locations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setLocations(res.data.data);
      } catch (err) { 
        console.error("Error fetching locations", err); 
      }
    };
    if (isOpen) fetchLocations();
  }, [isOpen]);

  // Fetch all cars and instructors
  useEffect(() => {
    const fetchCarsAndInstructors = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        const carsRes = await axios.get('http://127.0.0.1:8000/api/cars', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const carsData = carsRes.data.data || [];
        setAllCars(carsData);
        
        const instructorsRes = await axios.get('http://127.0.0.1:8000/api/instructors', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const instructorsData = instructorsRes.data.data || [];
        
        const assignedIds = instructorsData
          .filter(instructor => instructor.car_id !== null)
          .map(instructor => instructor.car_id);
        
        setAssignedCarIds(assignedIds);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    
    if (isOpen) {
      fetchCarsAndInstructors();
    }
  }, [isOpen]);

  // Filter unassigned cars by location
  useEffect(() => {
    const fetchUnassignedCarsByLocation = async () => {
      if (!formData.assignedLocation) {
        setAvailableCars([]);
        return;
      }
      try {
        const selectedLocation = locations.find(l => l.province_name === formData.assignedLocation);
        if (!selectedLocation) return;

        const filteredUnassigned = allCars.filter(car => {
          const matchesLocation = String(car.location_id) === String(selectedLocation.id);
          const isNotAssigned = !assignedCarIds.includes(car.id);
          return matchesLocation && isNotAssigned;
        });
        
        setAvailableCars(filteredUnassigned);
      } catch (err) {
        console.error("Error filtering cars", err);
      }
    };
    
    fetchUnassignedCarsByLocation();
  }, [formData.assignedLocation, locations, allCars, assignedCarIds]);

  // Real-time unique check for email and phone
  const handleBlur = async (e) => {
    const { name, value } = e.target;
    if ((name === 'email' || name === 'phone') && value) {
      try {
        const response = await axios.post(`http://127.0.0.1:8000/api/check-unique`, { field: name, value });
        if (!response.data.is_unique) {
          setUniqueErrors(prev => ({ ...prev, [name]: `This ${name} is already registered.` }));
          setErrors(prev => ({ ...prev, [name]: [`This ${name} is already registered.`] }));
        } else {
          setUniqueErrors(prev => ({ ...prev, [name]: '' }));
          if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        }
      } catch (error) {
        console.error("Unique check failed", error);
      }
    }
  };

  // Helper for text inputs with formatting and error clearing
  const f = (key, backendKey) => ({
    value: formData[key],
    onChange: (e) => {
      let val = e.target.value;
      const alphabetFields = ['firstName', 'lastName', 'city', 'province', 'country'];
      const numberFields = ['phone'];

      if (alphabetFields.includes(key)) {
        val = val.replace(/[^\p{L}\s'-]/gu, '');
      } else if (numberFields.includes(key)) {
        val = val.replace(/[^0-9+\-()\s]/g, '');
      }

      setFormData({ ...formData, [key]: val });
      
      // Clear specific errors when user starts typing
      if (errors[backendKey]) setErrors(prev => ({ ...prev, [backendKey]: null }));
      if (backendKey === 'name') {
         if (errors.firstName) setErrors(prev => ({ ...prev, firstName: null }));
         if (errors.lastName) setErrors(prev => ({ ...prev, lastName: null }));
      }
      if (key === 'email' || key === 'phone') setUniqueErrors(prev => ({ ...prev, [key]: '' }));
    },
  });

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    setFiles(prev => ({ ...prev, [name]: uploadedFiles[0] }));
    
    const backendKeyMap = {
      docCriminalCert: 'doc_criminal_cert',
      docVulnerableSector: 'doc_vulnerable_sector',
      docDriverAbstract: 'doc_driver_abstract'
    };
    if (errors[backendKeyMap[name]]) {
      setErrors(prev => ({ ...prev, [backendKeyMap[name]]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setNotification(null);
    
    // Frontend Validations before sending to backend
    let frontendErrors = {};
    if (!formData.firstName) frontendErrors.firstName = ["First name is required."];
    if (!formData.lastName) frontendErrors.lastName = ["Last name is required."];
    if (!formData.dob) frontendErrors.dob = ["Date of birth is required."];
    if (!formData.assignedLocation) frontendErrors.assigned_location = ["Please assign a location."];
    if (!formData.province) frontendErrors.province = ["Province is required."];
    if (!formData.country) frontendErrors.country = ["Country is required."];
    if (!formData.driversLicense) frontendErrors.licence_no = ["Driver's License is required."];
    if (!formData.instructorLicense) frontendErrors.inst_license_no = ["Instructor License is required."];
    if (!formData.licenceExpiry) frontendErrors.licence_expiry = ["Expiry date is required."];

    if (!formData.email) {
      frontendErrors.email = ["Email address is required."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
      frontendErrors.email = ["Please enter a valid email format."];
    }

    if (!formData.phone) {
      frontendErrors.phone = ["Phone number is required."];
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      frontendErrors.phone = ["Phone number must be at least 10 digits."];
    }

    if (uniqueErrors.email) frontendErrors.email = [uniqueErrors.email];
    if (uniqueErrors.phone) frontendErrors.phone = [uniqueErrors.phone];

    // If there are errors, block submission and highlight fields
    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors);
      showNotification('warning', 'Please fill all the fields correctly before registering.');
      return;
    }

    setLoading(true);

    const data = new FormData();
    const fullName = `${formData.firstName} ${formData.lastName}`;
    data.append('name', fullName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('password', formData.phone);
    data.append('password_confirmation', formData.phone);
    data.append('dob', formData.dob);
    data.append('language', formData.language);
    data.append('country', formData.country); 
    data.append('city', formData.city);
    data.append('province', formData.province);
    data.append('street_address', formData.streetAddress);
    data.append('postal_code', formData.postalCode);
    data.append('assigned_location', formData.assignedLocation);
    data.append('emp_status', formData.empStatus);
    data.append('car_id', formData.carId);
    data.append('licence_no', formData.driversLicense);
    data.append('inst_license_no', formData.instructorLicense);
    data.append('licence_expiry', formData.licenceExpiry);
    data.append('qualifications_to_teach', formData.qualifications);

    if (files.docCriminalCert) data.append('doc_criminal_cert', files.docCriminalCert);
    if (files.docVulnerableSector) data.append('doc_vulnerable_sector', files.docVulnerableSector);
    if (files.docDriverAbstract) data.append('doc_driver_abstract', files.docDriverAbstract);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post('http://127.0.0.1:8000/api/instructors', data, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json' 
        }
      });
      
      if (response.data.success) {
        showNotification('success', "Instructor Registered Successfully!");
        setTimeout(() => {
          if (onRefresh) onRefresh();
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Backend Error:", err);
      
      if (err.response?.status === 422) {
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

  const handleReset = () => {
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', dob: '',
      language: 'English', country: 'Canada', city: '', province: 'Ontario',
      streetAddress: '', postalCode: '', assignedLocation: '', empStatus: 'Full-time',
      carId: '', driversLicense: '', instructorLicense: '', licenceExpiry: '', qualifications: ''
    });
    setUniqueErrors({ email: '', phone: '' });
    setErrors({});
    setNotification(null);
    setFiles({ docCriminalCert: null, docVulnerableSector: null, docDriverAbstract: null });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="relative bg-white dark:bg-slate-950 w-full max-w-7xl h-full max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
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
              Register New <span className="text-teal-600 dark:text-teal-400">Instructor</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Fill in the details to add a new instructor to the system
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
          
          {/* Personal Information */}
          <Section title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="First Name" isRequired value={formData.firstName} error={errors.firstName?.[0] || errors.name?.[0]}>
                <Input placeholder="e.g., Jean" error={errors.firstName || errors.name} {...f('firstName', 'name')} />
              </Field>
              
              <Field label="Last Name" isRequired value={formData.lastName} error={errors.lastName?.[0]}>
                <Input placeholder="e.g., Dupont" error={errors.lastName} {...f('lastName', 'name')} />
              </Field>
              
              <Field label="Date of Birth" isRequired value={formData.dob} error={errors.dob?.[0]}>
                <Input type="date" error={errors.dob} {...f('dob', 'dob')} />
              </Field>
              
              <Field label="Email Address" isRequired value={formData.email} error={errors.email?.[0]}>
                <Input 
                  type="email" placeholder="jean@example.ca" error={errors.email}
                  value={formData.email} onChange={(e) => { f('email', 'email').onChange(e); handleBlur(e); }} onBlur={handleBlur}
                />
              </Field>
              
              <Field label="Phone Number" isRequired value={formData.phone} error={errors.phone?.[0]}>
                <Input 
                  type="tel" placeholder="+1 (709) 555-0123" error={errors.phone}
                  value={formData.phone} onChange={(e) => { f('phone', 'phone').onChange(e); handleBlur(e); }} onBlur={handleBlur}
                />
              </Field>

              <Field label="Primary Language" isRequired value={formData.language} error={errors.language?.[0]}>
                <select 
                  className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium text-slate-900 dark:text-white outline-none transition-all ${errors.language ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20'}`}
                  value={formData.language} onChange={(e) => { setFormData({...formData, language: e.target.value}); setErrors(prev => ({...prev, language: null})); }}
                >
                  <option>English</option>
                  <option>French</option>
                  <option>Bilingual (EN/FR)</option>
                </select>
              </Field>

              <Field label="Assigned Location" className="md:col-span-3" isRequired value={formData.assignedLocation} error={errors.assigned_location?.[0]}>
                <select 
                  className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium text-slate-900 dark:text-white outline-none transition-all ${errors.assigned_location ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20'}`}
                  value={formData.assignedLocation} onChange={(e) => { setFormData({...formData, assignedLocation: e.target.value}); setErrors(prev => ({...prev, assigned_location: null})); }}
                >
                  <option value="">Select a location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.province_name}>{loc.province_name}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          {/* Residential Address */}
          <Section title="Residential Address">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <Field label="Street Address" className="md:col-span-2" value={formData.streetAddress} error={errors.street_address?.[0]}>
                <Input placeholder="123 Maple Leaf Ave" error={errors.street_address} {...f('streetAddress', 'street_address')} />
              </Field>
              <Field label="City" value={formData.city} error={errors.city?.[0]}>
                <Input placeholder="St. John's" error={errors.city} {...f('city', 'city')} />
              </Field>
              <Field label="Province" isRequired value={formData.province} error={errors.province?.[0]}>
                <Input error={errors.province} {...f('province', 'province')} />
              </Field>
              <Field label="Postal Code" value={formData.postalCode} error={errors.postal_code?.[0]}>
                <Input placeholder="A1B 2C3" error={errors.postal_code} {...f('postalCode', 'postal_code')} />
              </Field>
              <Field label="Country" icon={<Globe size={14} className="text-teal-500"/>} isRequired value={formData.country} error={errors.country?.[0]} helperText="Country of residence">
                <Input placeholder="e.g., Canada" error={errors.country} {...f('country', 'country')} />
              </Field>
            </div>
          </Section>

          {/* Vehicle Assignment & Employment */}
          <Section title="Vehicle Assignment & Employment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Assign Vehicle" icon={<Car size={14} className="text-teal-500" />} value={formData.carId} error={errors.car_id?.[0]}>
                <select 
                  className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium text-slate-900 dark:text-white outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.car_id ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20'}`}
                  value={formData.carId} onChange={(e) => { setFormData({...formData, carId: e.target.value}); setErrors(prev => ({...prev, car_id: null})); }} disabled={!formData.assignedLocation}
                >
                  <option value="">Select a vehicle</option>
                  {availableCars.length === 0 && formData.assignedLocation ? (
                    <option value="" disabled>No unassigned vehicles available here</option>
                  ) : (
                    availableCars.map(car => (
                      <option key={car.id} value={car.id}>{car.car_name || 'Car'} ({car.number_plate || 'No Plate'})</option>
                    ))
                  )}
                </select>
                {!formData.assignedLocation && <p className="text-xs text-amber-600 mt-1">Select location first</p>}
              </Field>

              <Field label="Employment Status" icon={<Briefcase size={14} className="text-teal-500" />} value={formData.empStatus} error={errors.emp_status?.[0]}>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="radio" value="Full-time" checked={formData.empStatus === 'Full-time'} onChange={(e) => setFormData({...formData, empStatus: e.target.value})} className="text-teal-600 focus:ring-teal-500/20" /> Full-time
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="radio" value="Contractor" checked={formData.empStatus === 'Contractor'} onChange={(e) => setFormData({...formData, empStatus: e.target.value})} className="text-teal-600 focus:ring-teal-500/20" /> Contractor
                  </label>
                </div>
              </Field>
            </div>
          </Section>

          {/* Licensing & Certifications */}
          <Section title="Licensing & Certifications">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <Field label="Driver's License #" isRequired value={formData.driversLicense} error={errors.licence_no?.[0]}>
                <Input placeholder="e.g., D1234..." error={errors.licence_no} {...f('driversLicense', 'licence_no')} />
              </Field>
              <Field label="Instructor License #" isRequired value={formData.instructorLicense} error={errors.inst_license_no?.[0]}>
                <Input placeholder="e.g., INST-88291-AB" error={errors.inst_license_no} {...f('instructorLicense', 'inst_license_no')} />
              </Field>
              <Field label="License Expiry Date" isRequired value={formData.licenceExpiry} error={errors.licence_expiry?.[0]}>
                <Input type="date" error={errors.licence_expiry} {...f('licenceExpiry', 'licence_expiry')} />
              </Field>
            </div>
            
            <Field label="Qualified to Teach" icon={<CheckSquare size={14} className="text-teal-500"/>} value={formData.qualifications} error={errors.qualifications_to_teach?.[0]} helperText="Separate classes with commas (e.g., Class 5, Class 6)">
              <Input placeholder="e.g., Class 5 (Car), Class 6 (Motorcycle)" error={errors.qualifications_to_teach} {...f('qualifications', 'qualifications_to_teach')} />
            </Field>
          </Section>

          {/* Compliance & Documentation */}
          <Section title="Compliance & Documentation">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Criminal Record Check" error={errors.doc_criminal_cert?.[0]}>
                <div className="relative group">
                  <input type="file" name="docCriminalCert" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${errors.doc_criminal_cert ? 'border-red-400 bg-red-50/30' : files.docCriminalCert ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20' : 'border-slate-200 dark:border-slate-700 group-hover:border-teal-500 group-hover:bg-teal-50'}`}>
                    <UploadCloud className={`mx-auto mb-2 ${errors.doc_criminal_cert ? 'text-red-400' : files.docCriminalCert ? 'text-teal-500' : 'text-slate-400 group-hover:text-teal-500'}`} size={24} />
                    <p className={`text-xs font-medium truncate ${errors.doc_criminal_cert ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>{files.docCriminalCert ? files.docCriminalCert.name : "Upload Document"}</p>
                    <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                </div>
              </Field>

              <Field label="Vulnerable Sector Search" error={errors.doc_vulnerable_sector?.[0]}>
                <div className="relative group">
                  <input type="file" name="docVulnerableSector" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${errors.doc_vulnerable_sector ? 'border-red-400 bg-red-50/30' : files.docVulnerableSector ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20' : 'border-slate-200 dark:border-slate-700 group-hover:border-teal-500 group-hover:bg-teal-50'}`}>
                    <UploadCloud className={`mx-auto mb-2 ${errors.doc_vulnerable_sector ? 'text-red-400' : files.docVulnerableSector ? 'text-teal-500' : 'text-slate-400 group-hover:text-teal-500'}`} size={24} />
                    <p className={`text-xs font-medium truncate ${errors.doc_vulnerable_sector ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>{files.docVulnerableSector ? files.docVulnerableSector.name : "Upload Document"}</p>
                    <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                </div>
              </Field>

              <Field label="Driver Abstract (3-Year)" error={errors.doc_driver_abstract?.[0]}>
                <div className="relative group">
                  <input type="file" name="docDriverAbstract" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${errors.doc_driver_abstract ? 'border-red-400 bg-red-50/30' : files.docDriverAbstract ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20' : 'border-slate-200 dark:border-slate-700 group-hover:border-teal-500 group-hover:bg-teal-50'}`}>
                    <UploadCloud className={`mx-auto mb-2 ${errors.doc_driver_abstract ? 'text-red-400' : files.docDriverAbstract ? 'text-teal-500' : 'text-slate-400 group-hover:text-teal-500'}`} size={24} />
                    <p className={`text-xs font-medium truncate ${errors.doc_driver_abstract ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>{files.docDriverAbstract ? files.docDriverAbstract.name : "Upload Document"}</p>
                    <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                </div>
              </Field>
            </div>
          </Section>
        </form>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button 
            type="button" 
            onClick={handleReset} 
            className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Reset Form
          </button>
          <button 
            type="submit" 
            disabled={loading}
            onClick={handleSubmit}
            className="px-8 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Save size={16} />
                Complete Registration
              </>
            )}
          </button>
        </div>
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
      {icon && <span className="text-teal-500">{icon}</span>}
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

export default InstructorRegistrationModal;
