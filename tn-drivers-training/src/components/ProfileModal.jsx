import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Camera, Mail, User, Shield, Save, Lock, Eye, EyeOff, CheckCircle, Loader2, ChevronLeft, BadgeCheck } from "lucide-react";

const API_BASE = "http://localhost:8000/api";

const ProfileModal = ({ onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [view, setView] = useState('profile');
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form states
  const [profileName, setProfileName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);

  // Auto-clear message
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch user data
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data;
      setUser(userData);
      setProfileName(userData.name);
    } catch (error) {
      console.error("Fetch user error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 2MB' });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setMessage({ type: 'error', text: 'Only JPG, JPEG, PNG files are allowed' });
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      
      if (profileName !== user.name) {
        formData.append('name', profileName);
      }
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }

      if (!profilePicture && profileName === user.name) {
        setMessage({ type: 'error', text: 'No changes detected' });
        setSaving(false);
        return;
      }

      const response = await axios.post(`${API_BASE}/profile/update`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        setEditing(false);
        setPreviewImage(null);
        setProfilePicture(null);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    // Validation
    if (!passwordForm.current_password) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return;
    }
    if (!passwordForm.new_password) {
      setMessage({ type: 'error', text: 'New password is required' });
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('access_token');
      
      // Send the correct field names as expected by the backend
      const response = await axios.post(`${API_BASE}/profile/update`, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordForm({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        // Return to profile view after 1.5 seconds
        setTimeout(() => {
          setView('profile');
          setMessage({ type: '', text: '' });
        }, 1500);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update password' });
      }
    } catch (error) {
      console.error("Password update error:", error.response?.data);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.response?.data?.errors?.new_password?.[0] || 'Current password is incorrect or update failed' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
          <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={40} />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header Area */}
        <div className="relative h-24 bg-gradient-to-r from-teal-500 to-emerald-600">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Avatar Overlay */}
        <div className="relative flex justify-center -mt-12">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 p-1 shadow-xl">
              <img
                src={previewImage || user.profile_picture || `https://ui-avatars.com/api/?name=${user.name}&background=008B8B&color=fff&size=128`}
                alt="Avatar"
                className="w-full h-full object-cover rounded-[1.25rem]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=008B8B&color=fff&size=128`;
                }}
              />
            </div>
            {editing && (
              <label className="absolute -bottom-2 -right-2 bg-teal-500 p-2 rounded-xl text-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/jpeg,image/png,image/jpg" />
                <Camera size={16} />
              </label>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 pt-4 min-h-[320px]">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user.name}</h2>
              <BadgeCheck size={18} className="text-teal-500" />
            </div>
            <p className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-widest">{user.role}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{user.email}</p>
          </div>

          {/* Fixed height message container */}
          <div className="h-14 mb-2">
            {message.text && (
              <div className={`p-3 rounded-xl text-xs font-semibold text-center ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
              }`}>
                {message.text}
              </div>
            )}
          </div>

          {view === 'profile' ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    disabled={!editing}
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    readOnly
                    type="text"
                    value={user.email}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {editing ? (
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={saving}
                    className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Identity
                  </button>
                ) : (
                  <button 
                    onClick={() => setEditing(true)}
                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm transition-colors"
                  >
                    Modify Profile
                  </button>
                )}
                
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setView('password');
                      setMessage({ type: '', text: '' });
                    }}
                    className="w-full py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Lock size={14} /> Security
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={() => {
                  setView('profile');
                  setMessage({ type: '', text: '' });
                  setPasswordForm({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                  });
                }} 
                className="flex items-center gap-1 text-slate-400 hover:text-teal-500 text-xs font-bold mb-2 transition-colors"
              >
                <ChevronLeft size={14} /> Back to Profile
              </button>
              
              <div className="space-y-3">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type={showPasswords ? "text" : "password"} 
                    placeholder="Current Password" 
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500"
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type={showPasswords ? "text" : "password"} 
                    placeholder="New Password" 
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500"
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type={showPasswords ? "text" : "password"} 
                    placeholder="Confirm New Password" 
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    value={passwordForm.new_password_confirmation}
                    onChange={(e) => setPasswordForm({...passwordForm, new_password_confirmation: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500"
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button 
                  onClick={handlePasswordUpdate}
                  disabled={saving}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;