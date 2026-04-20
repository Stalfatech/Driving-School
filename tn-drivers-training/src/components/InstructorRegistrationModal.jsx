
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, User, Mail, Phone, MapPin, BadgeCheck, 
  Car, Globe, Briefcase, FileText, Save, Loader2, UploadCloud, CheckSquare
} from 'lucide-react';

const InstructorRegistrationModal = ({ isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [allCars, setAllCars] = useState([]); // Store all cars for filtering
  const [assignedCarIds, setAssignedCarIds] = useState([]); // Store IDs of cars with instructors

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

  // Fetch all cars and instructors to determine which cars are assigned
  useEffect(() => {
    const fetchCarsAndInstructors = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        // Fetch all cars
        const carsRes = await axios.get('http://127.0.0.1:8000/api/cars', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const carsData = carsRes.data.data || [];
        setAllCars(carsData);
        
        // Fetch all instructors to get assigned car IDs
        const instructorsRes = await axios.get('http://127.0.0.1:8000/api/instructors', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const instructorsData = instructorsRes.data.data || [];
        
        // Extract car_ids that are already assigned to instructors
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

  // Fetch Cars based on Location and filter out assigned ones
  useEffect(() => {
    const fetchUnassignedCarsByLocation = async () => {
      if (!formData.assignedLocation) {
        setAvailableCars([]);
        return;
      }
      
      try {
        const selectedLocation = locations.find(l => l.province_name === formData.assignedLocation);
        if (!selectedLocation) return;

        // Filter cars by location and by not being assigned to any instructor
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(prev => ({ ...prev, [e.target.name]: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    
    // Combine first and last name
    const fullName = `${formData.firstName} ${formData.lastName}`;
    data.append('name', fullName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('password', formData.phone);
    data.append('password_confirmation', formData.phone);
    data.append('dob', formData.dob);
    data.append('language', formData.language);
    data.append('country', formData.country); // Added country field
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

    // Append Files
    if (files.docCriminalCert) data.append('doc_criminal_cert', files.docCriminalCert);
    if (files.docVulnerableSector) data.append('doc_vulnerable_sector', files.docVulnerableSector);
    if (files.docDriverAbstract) data.append('doc_driver_abstract', files.docDriverAbstract);

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
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Backend Error:", err.response?.data);
      alert(`Error: ${err.response?.data?.message || "Check required fields."}`);
    } finally { 
      setLoading(false); 
    }
  };

  const handleReset = () => {
    setFormData({
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
    setFiles({
      docCriminalCert: null,
      docVulnerableSector: null,
      docDriverAbstract: null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-950 w-full max-w-7xl h-full max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
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
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
          
          {/* Personal Information */}
          <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">First Name</label>
                <input 
                  name="firstName" 
                  type="text" 
                  placeholder="e.g., Jean" 
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Last Name</label>
                <input 
                  name="lastName" 
                  type="text" 
                  placeholder="e.g., Dupont" 
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Date of Birth</label>
                <input 
                  name="dob" 
                  type="date" 
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Address</label>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="jean.dupont@example.ca" 
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone Number</label>
                <input 
                  name="phone" 
                  type="tel" 
                  placeholder="+1 (709) 555-0123" 
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Primary Language</label>
                <select 
                  name="language" 
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                >
                  <option>English</option>
                  <option>French</option>
                  <option>Bilingual (EN/FR)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Assigned Location</label>
                <select 
                  name="assignedLocation" 
                  value={formData.assignedLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  required
                >
                  <option value="">Select a location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.province_name}>
                      {loc.province_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Residential Address */}
          <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
              Residential Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Street Address</label>
                <input 
                  name="streetAddress" 
                  type="text" 
                  placeholder="123 Maple Leaf Ave" 
                  value={formData.streetAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">City</label>
                <input 
                  name="city" 
                  type="text" 
                  placeholder="St. John's" 
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Province</label>
                <input 
                  type="text" 
                  name="province" 
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Postal Code</label>
                <input 
                  name="postalCode" 
                  type="text" 
                  placeholder="A1B 2C3" 
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>
              {/* Country Field - Added here */}
              <div className=" flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Globe size={14} className="text-teal-500" /> Country
                </label>
                <input 
                  name="country" 
                  type="text" 
                  placeholder="e.g., Canada, USA, United Kingdom" 
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Enter the country where the instructor resides</p>
              </div>
            </div>
          </section>

          {/* Vehicle Assignment */}
          <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
              Vehicle Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Car size={14} className="text-teal-500" /> Assign Vehicle
                </label>
                <select 
                  name="carId" 
                  value={formData.carId}
                  onChange={handleChange}
                  disabled={!formData.assignedLocation}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select a vehicle</option>
                  {availableCars.length === 0 && formData.assignedLocation ? (
                    <option value="" disabled>No unassigned vehicles available at this location</option>
                  ) : (
                    availableCars.map(car => (
                      <option key={car.id} value={car.id}>
                        {car.car_name || 'Car'} ({car.number_plate || 'No Plate'})
                      </option>
                    ))
                  )}
                </select>
                {!formData.assignedLocation && (
                  <p className="text-xs text-amber-600 mt-1">Please select a location first</p>
                )}
                {formData.assignedLocation && availableCars.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No unassigned vehicles available at this location</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase size={14} className="text-teal-500" /> Employment Status
                </label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="empStatus" 
                      value="Full-time" 
                      checked={formData.empStatus === 'Full-time'}
                      onChange={handleChange}
                      className="text-teal-600 focus:ring-teal-500/20" 
                    /> Full-time
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="empStatus" 
                      value="Contractor" 
                      checked={formData.empStatus === 'Contractor'}
                      onChange={handleChange}
                      className="text-teal-600 focus:ring-teal-500/20" 
                    /> Contractor
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Licensing & Certifications */}
          <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
              Licensing & Certifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Driver's License #</label>
                <input 
                  name="driversLicense" 
                  type="text" 
                  placeholder="e.g., D1234-56789-01234" 
                  value={formData.driversLicense}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Instructor License #</label>
                <input 
                  name="instructorLicense" 
                  type="text" 
                  placeholder="e.g., INST-88291-AB" 
                  value={formData.instructorLicense}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">License Expiry Date</label>
                <input 
                  name="licenceExpiry" 
                  type="date" 
                  value={formData.licenceExpiry}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  required 
                />
              </div>
            </div>
            
            {/* Qualifications as Text Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare size={14} className="text-teal-500" /> Qualified to Teach (Separate with commas)
              </label>
              <input 
                name="qualifications" 
                type="text" 
                placeholder="e.g., Class 5 (Car), Class 6 (Motorcycle), Class 1 (Commercial)" 
                value={formData.qualifications}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              />
              <p className="text-xs text-slate-500 mt-1">Enter all classes the instructor is qualified to teach, separated by commas</p>
            </div>
          </section>

          {/* Compliance & Documentation */}
          <section className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
              Compliance & Documentation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Criminal Record Check</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    name="docCriminalCert" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  />
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                    files.docCriminalCert 
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20' 
                      : 'border-slate-200 dark:border-slate-700 group-hover:border-teal-500 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/20'
                  }`}>
                    <UploadCloud className={`mx-auto mb-2 transition-colors ${
                      files.docCriminalCert ? 'text-teal-500' : 'text-slate-400 group-hover:text-teal-500'
                    }`} size={24} />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                      {files.docCriminalCert ? files.docCriminalCert.name : "Upload Document"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Vulnerable Sector Search</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    name="docVulnerableSector" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  />
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                    files.docVulnerableSector 
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20' 
                      : 'border-slate-200 dark:border-slate-700 group-hover:border-teal-500 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/20'
                  }`}>
                    <UploadCloud className={`mx-auto mb-2 transition-colors ${
                      files.docVulnerableSector ? 'text-teal-500' : 'text-slate-400 group-hover:text-teal-500'
                    }`} size={24} />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                      {files.docVulnerableSector ? files.docVulnerableSector.name : "Upload Document"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Driver Abstract (3-Year)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    name="docDriverAbstract" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  />
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                    files.docDriverAbstract 
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20' 
                      : 'border-slate-200 dark:border-slate-700 group-hover:border-teal-500 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/20'
                  }`}>
                    <UploadCloud className={`mx-auto mb-2 transition-colors ${
                      files.docDriverAbstract ? 'text-teal-500' : 'text-slate-400 group-hover:text-teal-500'
                    }`} size={24} />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                      {files.docDriverAbstract ? files.docDriverAbstract.name : "Upload Document"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
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
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

export default InstructorRegistrationModal;