
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, User, Mail, Phone, MapPin, BadgeCheck, 
  Car, Globe, Briefcase, FileText, Save, Loader2, UploadCloud, CheckSquare, Camera 
} from 'lucide-react';

const InstructorRegistrationModal = ({ isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  const classOptions = [
    "Class 5 (Car)", "Class 6 (Motorcycle)", "Class 1 (Commercial)", "Class 4 (Ambulance/Taxi)"
  ];

  const provinceOptions = [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick", 
    "Newfoundland and Labrador", "Nova Scotia", "Ontario", 
    "Prince Edward Island", "Quebec", "Saskatchewan"
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '', 
    dob: '',
    language: 'English',
    country: 'Canada',
    city: '', 
    province: 'Ontario',
    street_address: '',
    postal_code: '', // Ensure this is initialized
    assigned_location: '', 
    emp_status: 'Full-time',
    car_id: '',
    licence_no: '',
    inst_license_no: '',
    licence_expiry: '',
  });

  const [files, setFiles] = useState({
    profile_picture: null,
    doc_criminal_cert: null,
    doc_vulnerable_sector: null,
    doc_driver_abstract: null
  });

  // Fetch Locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get('http://127.0.0.1:8000/api/locations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setLocations(res.data.data);
      } catch (err) { console.error("Error fetching locations", err); }
    };
    if (isOpen) fetchLocations();
  }, [isOpen]);

  // Fetch Cars based on Location
  // useEffect(() => {
  //   const fetchCarsByLocation = async () => {
  //     if (!formData.assigned_location) { setAvailableCars([]); return; }
  //     try {
  //       const token = localStorage.getItem('access_token');
  //       const res = await axios.get('http://127.0.0.1:8000/api/cars', {
  //         headers: { 'Authorization': `Bearer ${token}` }
  //       });
  //       const filtered = res.data.data.filter(car => 
  //           String(car.location_id) === String(formData.assigned_location)
  //       );
  //       setAvailableCars(filtered);
  //     } catch (err) { console.error("Error fetching cars", err); }
  //   };
  //   fetchCarsByLocation();
  // }, [formData.assigned_location]);
  useEffect(() => {
  const fetchCarsByLocation = async () => {
    if (!formData.assigned_location) {
      setAvailableCars([]);
      return;
    }
    try {
      // 1. Find the ID of the location that matches the selected name
      const selectedLocation = locations.find(l => l.province_name === formData.assigned_location);
      if (!selectedLocation) return;

      const token = localStorage.getItem('access_token');
      const res = await axios.get('http://127.0.0.1:8000/api/cars', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 2. Filter cars using the found ID
      const filtered = res.data.data.filter(car => 
          String(car.location_id) === String(selectedLocation.id)
      );
      setAvailableCars(filtered);
    } catch (err) {
      console.error("Error fetching cars", err);
    }
  };
  fetchCarsByLocation();
}, [formData.assigned_location, locations]); // Add locations to dependency array

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFiles(prev => ({ ...prev, [e.target.name]: file }));
    if (e.target.name === 'profile_picture' && file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    
    // Map form data and handle potential nulls
    Object.keys(formData).forEach(key => {
      let value = formData[key];
      
      // Fix for "Column cannot be null" error: send empty string if value is empty
      if (value === null || value === undefined) value = '';

      if (key === 'contact') {
        data.append('phone', value);
        data.append('password', value); // Default password as phone
        data.append('password_confirmation', value);
      } else {
        data.append(key, value);
      }
    });

    data.append('qualifications_to_teach', qualifications.join(', '));

    // Append Files
    if (files.profile_picture) data.append('profile_picture', files.profile_picture);
    if (files.doc_criminal_cert) data.append('doc_criminal_cert', files.doc_criminal_cert);
    if (files.doc_vulnerable_sector) data.append('doc_vulnerable_sector', files.doc_vulnerable_sector);
    if (files.doc_driver_abstract) data.append('doc_driver_abstract', files.doc_driver_abstract);

    try {
      const token = localStorage.getItem('access_token');
      await axios.post('http://127.0.0.1:8000/api/instructors', data, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json' 
        }
      });
      alert("Instructor Registered Successfully!");
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Backend Error:", err.response?.data);
      alert(`Error: ${err.response?.data?.message || "Check required fields."}`);
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800">
        
        <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center z-20">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Register New Instructor</h2>
            <p className="text-sm text-slate-500 font-medium">Please fill in all address details including Postal Code.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          
          <section className="flex flex-col items-center justify-center gap-4">
            <div className="relative group">
              <div className="size-28 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg overflow-hidden flex items-center justify-center">
                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-300" />}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-teal text-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-md">
                <Camera size={16} />
                <input type="file" name="profile_picture" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Profile Photo</span>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal flex items-center gap-2"><User size={14}/> Identity & Auth</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
              <InputField label="Phone" name="contact" value={formData.contact} onChange={handleChange} placeholder="709-000-0000" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectField 
                label="Assigned Location" 
                name="assigned_location" 
                value={formData.assigned_location} 
                onChange={handleChange} 
                options={locations.map(loc => ({ label: loc.province_name, value: loc.province_name  }))} 
              />
              <SelectField 
                label="Assign Car" 
                name="car_id" 
                value={formData.car_id} 
                onChange={handleChange} 
                disabled={!formData.assigned_location}
                options={availableCars.map(car => ({ 
                    label: `${car.car_name || 'Car'} (${car.number_plate || car.id})`, 
                    value: car.id 
                }))} 
              />
              <InputField label="Primary Language" name="language" value={formData.language} onChange={handleChange} />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal flex items-center gap-2"><BadgeCheck size={14}/> Credentials</h3>
                <div className="grid grid-cols-1 gap-4">
                  <InputField label="Driver's Licence #" name="licence_no" value={formData.licence_no} onChange={handleChange} />
                  <InputField label="Instructor Licence #" name="inst_license_no" value={formData.inst_license_no} onChange={handleChange} />
                  <InputField label="Licence Expiry" name="licence_expiry" type="date" value={formData.licence_expiry} onChange={handleChange} />
                </div>
             </div>
             <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal flex items-center gap-2"><MapPin size={14}/> Residency & DOB</h3>
                <div className="grid grid-cols-1 gap-4">
                  <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="City" name="city" value={formData.city} onChange={handleChange} />
                    <SelectField label="Province" name="province" value={formData.province} onChange={handleChange} options={provinceOptions} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Street Address" name="street_address" value={formData.street_address} onChange={handleChange} />
                    <InputField label="Postal Code" name="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="A1B 2C3" />
                  </div>
                </div>
             </div>
          </div>

          {/* Qualifications & Files sections remain the same... */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal flex items-center gap-2"><CheckSquare size={14}/> Qualified to Teach</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl">
              {classOptions.map(cls => (
                <label key={cls} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={qualifications.includes(cls)}
                    onChange={() => setQualifications(prev => prev.includes(cls) ? prev.filter(i => i !== cls) : [...prev, cls])}
                    className="size-5 rounded border-slate-300 text-teal focus:ring-teal"
                  />
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{cls}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal flex items-center gap-2"><FileText size={14}/> Compliance Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FileUploader label="Criminal Cert" name="doc_criminal_cert" onChange={handleFileChange} file={files.doc_criminal_cert} />
              <FileUploader label="Vulnerable Sector" name="doc_vulnerable_sector" onChange={handleFileChange} file={files.doc_vulnerable_sector} />
              <FileUploader label="Driver Abstract" name="doc_driver_abstract" onChange={handleFileChange} file={files.doc_driver_abstract} />
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600">Cancel</button>
            <button type="submit" disabled={loading} className="bg-teal text-white px-12 py-4 rounded-2xl font-bold shadow-xl shadow-teal/20 flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : <Save />} Confirm Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- SHARED UI COMPONENTS (InputField, SelectField, FileUploader) stay as they were --- */
const InputField = ({ label, type = "text", name, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider ml-1">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 outline-none focus:border-teal text-sm font-semibold dark:text-white transition-all" />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, disabled }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider ml-1">{label}</label>
    <select name={name} value={value} onChange={onChange} required disabled={disabled} className={`w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 outline-none focus:border-teal text-sm font-semibold dark:text-white appearance-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <option value="">Select...</option>
      {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
    </select>
  </div>
);

const FileUploader = ({ label, name, onChange, file }) => (
  <div className="relative group h-32">
    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2 block">{label}</label>
    <div className={`h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${file ? 'border-teal bg-teal/5' : 'border-slate-200 dark:border-slate-700 group-hover:border-teal/50'}`}>
      <UploadCloud className={file ? "text-teal" : "text-slate-300"} size={24} />
      <span className="text-[10px] font-bold text-slate-500 px-4 text-center truncate w-full">{file ? file.name : "Upload File"}</span>
      <input type="file" name={name} onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer" />
    </div>
  </div>
);

export default InstructorRegistrationModal;