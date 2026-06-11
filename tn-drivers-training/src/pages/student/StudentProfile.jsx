import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Users, Mail, Phone, Calendar, MapPin, Home, 
  CreditCard, FileText, AlertCircle, Edit2, 
  Save, X, Globe, Car, Award, BookOpen,
  CheckCircle, ChevronRight, Building, Hash, Loader2
} from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

// ========== Helper Components (defined outside to prevent remounting) ==========
const ProfileSection = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm ${className}`}>
    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-50/50 to-transparent dark:from-teal-900/10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
          <Icon size={18} className="text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h2>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InfoRow = ({ label, value, colSpan = "col-span-1" }) => (
  <div className={colSpan}>
    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
      {label}
    </label>
    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
      {value || 'Not provided'}
    </p>
  </div>
);

const EditField = ({ label, name, type = "text", placeholder = "", rows = 3, colSpan = "col-span-1", value, onChange }) => {
  const inputId = name.replace(/\./g, '_');

  if (type === "textarea") {
    return (
      <div className={colSpan}>
        <label htmlFor={inputId} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1 cursor-pointer">
          {label}
        </label>
        <textarea
          id={inputId}
          name={name}
          value={value || ''}
          onChange={onChange}
          rows={rows}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
          placeholder={placeholder}
        />
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <div className={colSpan}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name={name}
            checked={!!value}
            onChange={onChange}
            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        </label>
      </div>
    );
  }

  return (
    <div className={colSpan}>
      <label htmlFor={inputId} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1 cursor-pointer">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        placeholder={placeholder}
      />
    </div>
  );
};

// ========== Main Component ==========
const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState({});

  const token = localStorage.getItem('access_token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/student/profile`, config);
      if (response.data.success) {
        setProfile(response.data.data);
        setEditForm(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setEditForm(prev => ({ ...prev, [name]: checked }));
      if (!checked) {
        setEditForm(prev => ({
          ...prev,
          foreign_license_number: "",
          foreign_street_address: "",
          foreign_appartment: "",
          foreign_city: "",
          foreign_state: "",
          foreign_postal_code: "",
          foreign_country: ""
        }));
      }
    } else if (name.startsWith('user.')) {
      const field = name.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        user: { ...prev.user, [field]: value }
      }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        user: {
          name: editForm.user.name,
          email: editForm.user.email,
          phone: editForm.user.phone
        },
        dob: editForm.dob,
        street_address: editForm.street_address,
        appartment: editForm.appartment,
        city: editForm.city,
        province: editForm.province,
        state: editForm.state,
        country: editForm.country,
        postal_code: editForm.postal_code,
        parent_name: editForm.parent_name,
        parent_email: editForm.parent_email,
        parent_phone: editForm.parent_phone,
        permit_number: editForm.permit_number,
        permit_issue_date: editForm.permit_issue_date,
        has_foreign_license: editForm.has_foreign_license,
        foreign_license_number: editForm.foreign_license_number,
        foreign_street_address: editForm.foreign_street_address,
        foreign_appartment: editForm.foreign_appartment,
        foreign_city: editForm.foreign_city,
        foreign_state: editForm.foreign_state,
        foreign_postal_code: editForm.foreign_postal_code,
        foreign_country: editForm.foreign_country,
        experience: editForm.experience,
        additional_notes: editForm.additional_notes
      };
      await axios.put(`${API_BASE}/student/profile`, payload, config);
      await fetchProfile();
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getAge = (dob) => {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-red-600 dark:text-red-400">{error || 'Failed to load profile'}</p>
          <button onClick={fetchProfile} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg">Retry</button>
        </div>
      </div>
    );
  }

  const { user, package: pkg, instructor } = profile;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-8xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
                My <span className="text-teal-600">Profile</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                View and manage your personal information
              </p>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="space-y-6">
            
            {/* Basic Information */}
            {/* Basic Information */}
<ProfileSection title="Basic Information" icon={User}>
  {!isEditing ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:col-span-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        {/* Profile Image - Fixed positioning */}
        <div className="flex-shrink-0">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {user.name?.charAt(0).toUpperCase() || 'S'}
            </div>
          )}
        </div>
        
        {/* User Info - Separate container */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white break-words">
            {user.name}
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400 break-all">
                {user.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {user.phone || 'Not provided'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <InfoRow label="Date of Birth" value={formatDate(profile.dob)} />
      <InfoRow label="Age" value={getAge(profile.dob)} />
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
          Full Name
        </label>
        <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400">
          {user.name}
        </div>
      </div>
      <div className="col-span-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
          Email
        </label>
        <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400">
          {user.email}
        </div>
      </div>
      <EditField 
        label="Phone" 
        name="user.phone" 
        type="tel" 
        value={editForm.user?.phone || ''}
        onChange={handleInputChange}
      />
      <EditField 
        label="Date of Birth" 
        name="dob" 
        type="date" 
        value={editForm.dob || ''}
        onChange={handleInputChange}
      />
    </div>
  )}
</ProfileSection>

            {/* Package & Instructor Information (Read-only) */}
            <ProfileSection title="Course Information" icon={BookOpen}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={18} className="text-teal-600" />
                    <h3 className="font-bold text-slate-800 dark:text-white">Selected Package</h3>
                  </div>
                  {pkg ? (
                    <>
                      <p className="text-lg font-bold text-teal-600">{pkg.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {pkg.hours} hours • ${pkg.price}
                      </p>
                      <ul className="mt-3 space-y-1">
                        {pkg.includes?.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <CheckCircle size={10} className="text-teal-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : <p className="text-sm text-slate-500">No active package</p>}
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Car size={18} className="text-teal-600" />
                    <h3 className="font-bold text-slate-800 dark:text-white">Assigned Instructor</h3>
                  </div>
                  {instructor ? (
                    <>
                      <p className="font-semibold text-slate-800 dark:text-white">{instructor.user?.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{instructor.specialization}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail size={12} />
                          {instructor.user?.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone size={12} />
                          {instructor.user?.phone}
                        </div>
                      </div>
                    </>
                  ) : <p className="text-sm text-slate-500">Not assigned yet</p>}
                </div>
              </div>
            </ProfileSection>

            {/* Address Information */}
            <ProfileSection title="Address Information" icon={MapPin}>
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow label="Street Address" value={profile.street_address} />
                  <InfoRow label="Apartment" value={profile.appartment} />
                  <InfoRow label="City" value={profile.city} />
                  <InfoRow label="Province" value={profile.province} />
                  <InfoRow label="Postal Code" value={profile.postal_code} />
                  <InfoRow label="Country" value={profile.country} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditField label="Street Address" name="street_address" type="text" value={editForm.street_address || ''} onChange={handleInputChange} />
                  <EditField label="Apartment" name="appartment" type="text" value={editForm.appartment || ''} onChange={handleInputChange} />
                  <EditField label="City" name="city" type="text" value={editForm.city || ''} onChange={handleInputChange} />
                  <EditField label="Province" name="province" type="text" value={editForm.province || ''} onChange={handleInputChange} />
                  <EditField label="Postal Code" name="postal_code" type="text" value={editForm.postal_code || ''} onChange={handleInputChange} />
                  <EditField label="Country" name="country" type="text" value={editForm.country || ''} onChange={handleInputChange} />
                </div>
              )}
            </ProfileSection>

            {/* Parent/Guardian Information */}
            <ProfileSection title="Parent/Guardian Information" icon={Users}>
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow label="Parent Name" value={profile.parent_name} />
                  <InfoRow label="Parent Email" value={profile.parent_email} />
                  <InfoRow label="Parent Phone" value={profile.parent_phone} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditField label="Parent Name" name="parent_name" type="text" value={editForm.parent_name || ''} onChange={handleInputChange} />
                  <EditField label="Parent Email" name="parent_email" type="email" value={editForm.parent_email || ''} onChange={handleInputChange} />
                  <EditField label="Parent Phone" name="parent_phone" type="tel" value={editForm.parent_phone || ''} onChange={handleInputChange} />
                </div>
              )}
            </ProfileSection>

            {/* Permit Information */}
            <ProfileSection title="Driver's Permit Information" icon={CreditCard}>
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow label="Permit Number" value={profile.permit_number} />
                  <InfoRow label="Issue Date" value={formatDate(profile.permit_issue_date)} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditField label="Permit Number" name="permit_number" type="text" value={editForm.permit_number || ''} onChange={handleInputChange} />
                  <EditField label="Issue Date" name="permit_issue_date" type="date" value={editForm.permit_issue_date || ''} onChange={handleInputChange} />
                </div>
              )}
            </ProfileSection>

            {/* Foreign License Information */}
            <ProfileSection title="Foreign License Information" icon={Globe}>
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={profile.has_foreign_license}
                      readOnly
                      disabled
                      className="w-4 h-4 rounded border-slate-300 text-teal-600"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Has foreign driver's license
                    </span>
                  </div>
                  
                  {profile.has_foreign_license && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <InfoRow label="License Number" value={profile.foreign_license_number} />
                      <InfoRow label="Street Address" value={profile.foreign_street_address} />
                      <InfoRow label="Apartment" value={profile.foreign_appartment} />
                      <InfoRow label="City" value={profile.foreign_city} />
                      <InfoRow label="State/Province" value={profile.foreign_state} />
                      <InfoRow label="Postal Code" value={profile.foreign_postal_code} />
                      <InfoRow label="Country" value={profile.foreign_country} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <EditField 
                    label="Has Foreign License" 
                    name="has_foreign_license" 
                    type="checkbox" 
                    value={editForm.has_foreign_license || false}
                    onChange={handleInputChange}
                  />
                  
                  {editForm.has_foreign_license && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <EditField label="License Number" name="foreign_license_number" type="text" value={editForm.foreign_license_number || ''} onChange={handleInputChange} />
                      <EditField label="Street Address" name="foreign_street_address" type="text" value={editForm.foreign_street_address || ''} onChange={handleInputChange} />
                      <EditField label="Apartment" name="foreign_appartment" type="text" value={editForm.foreign_appartment || ''} onChange={handleInputChange} />
                      <EditField label="City" name="foreign_city" type="text" value={editForm.foreign_city || ''} onChange={handleInputChange} />
                      <EditField label="State/Province" name="foreign_state" type="text" value={editForm.foreign_state || ''} onChange={handleInputChange} />
                      <EditField label="Postal Code" name="foreign_postal_code" type="text" value={editForm.foreign_postal_code || ''} onChange={handleInputChange} />
                      <EditField label="Country" name="foreign_country" type="text" value={editForm.foreign_country || ''} onChange={handleInputChange} />
                    </div>
                  )}
                </div>
              )}
            </ProfileSection>

            {/* Additional Information */}
            <ProfileSection title="Additional Information" icon={FileText}>
              {!isEditing ? (
                <div className="grid grid-cols-1 gap-6">
                  <InfoRow label="Driving Experience" value={profile.experience} colSpan="col-span-2" />
                  <InfoRow label="Additional Notes" value={profile.additional_notes} colSpan="col-span-2" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <EditField label="Driving Experience" name="experience" type="textarea" rows={3} value={editForm.experience || ''} onChange={handleInputChange} />
                  <EditField label="Additional Notes" name="additional_notes" type="textarea" rows={3} value={editForm.additional_notes || ''} onChange={handleInputChange} />
                </div>
              )}
            </ProfileSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;