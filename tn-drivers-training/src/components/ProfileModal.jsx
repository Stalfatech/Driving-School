
import React, { useState, useEffect } from "react";
import axios from "axios";
import ChangePasswordModal from "./ChangePasswordModal";
import { X, Camera, Mail, User as UserIcon, ShieldCheck, Save, BadgeCheck, Loader2 } from "lucide-react";

const API_BASE = "http://localhost:8000/api";

const ProfileModal = ({ onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  useEffect(() => {
  if (message.text) {
    const timer = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [message]);

  // Form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    profile_picture: null
  });

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
      setProfileForm({
        name: userData.name,
        profile_picture: null
      });
    } catch (error) {
      console.error("Fetch user error:", error);
    } finally {
      setLoading(false);
    }
  };

 

  const handleProfileUpdate = async () => {
  setSaving(true);
  setMessage({ type: '', text: '' });

  try {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    
    // Only append name if it changed
    if (profileForm.name !== user.name) {
      formData.append('name', profileForm.name);
    }
    
    // Only append image if selected
    if (profileForm.profile_picture) {
      formData.append('profile_picture', profileForm.profile_picture);
    }

    // If no changes, show message
    if (!profileForm.profile_picture && profileForm.name === user.name) {
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
      
      // Update user state with the new data
      setUser(response.data.data);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      setEditing(false);
      setPreviewImage(null);
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

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 2MB' });
        return;
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setMessage({ type: 'error', text: 'Only JPG, JPEG, PNG files are allowed' });
        return;
      }

      setProfileForm({ ...profileForm, profile_picture: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-100 p-4">
        <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-12 border border-white/20">
          <Loader2 className="animate-spin text-teal mx-auto" size={40} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-100 p-4">
      
      {/* 1. THE GLASS CARD */}
      <div className="relative w-full max-w-md rounded-[3rem] p-8 overflow-hidden 
                      bg-white/5 backdrop-blur-3xl 
                      border border-white/20 
                      shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
        
        {/* 2. SPECULAR HIGHLIGHT (The "Glass Edge" light) */}
        <div className="absolute top-0 left-0 right-0 h-1px bg-linear-to-r from-transparent via-white/40 to-transparent" />
        <div className="absolute top-0 bottom-0 left-0 w-1px bg-linear-to-b from-white/20 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all z-20"
        >
          <X size={20} />
        </button>

        {/* Message Alert */}
        {message.text && (
          <div className={`absolute top-20 left-6 right-6 z-30 p-4 rounded-2xl backdrop-blur-xl border ${
            message.type === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-300' 
              : 'bg-red-500/20 border-red-500/30 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col items-center">
          


          <div className="relative mb-6">
  <div className="absolute -inset-2 bg-linear-to-tr from-teal to-indigo-500 rounded-full blur-lg opacity-30 animate-pulse" />
  <div className="relative p-1 bg-white/10 rounded-full backdrop-blur-3xl border border-white/20">
    <img
      src={previewImage || user.profile_picture || `https://ui-avatars.com/api/?name=${user.name}&background=008B8B&color=fff&size=128`}
      alt="profile"
      className="w-28 h-28 rounded-full object-cover border border-white/10"
      onError={(e) => {
        // If image fails to load, show initials avatar
        e.target.onerror = null;
        e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=008B8B&color=fff&size=128`;
      }}
    />
    
    {editing && (
      <label className="absolute bottom-0 right-0 bg-teal p-2.5 rounded-full cursor-pointer shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/30">
        <input 
          type="file" 
          className="hidden" 
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleImageChange}
        />
        <Camera size={16} className="text-white" />
      </label>
    )}
  </div>
</div>

          {/* User Details */}
          <div className="w-full space-y-6">
            <div className="text-center">
              {!editing ? (
                <div className="flex items-center justify-center gap-2">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    {user.name}
                    </h2>
                    <BadgeCheck size={18} className="text-teal" />
                </div>
              ) : (
                <p className="text-[10px] font-black uppercase tracking-widest text-teal italic mb-2">Identity Configuration</p>
              )}
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">{user.email}</p>
            </div>

            {/* Transparent Glass Inputs */}
            <div className="space-y-4">
              <div className="group relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal transition-colors" size={16} />
                <input
                  disabled={!editing}
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all
                    ${editing ? "focus:border-[#008B8B]/50 focus:bg-white/10" : "opacity-40 cursor-not-allowed"}`}
                />
              </div>

              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" size={16} />
                <input
                  disabled
                  type="email"
                  value={user.email}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white/20 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Actions: Glass Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              {editing ? (
                <button
                  onClick={handleProfileUpdate}
                  disabled={saving}
                  className="w-full py-4 bg-[#008B8B] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#008B8B]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'UPDATING...' : 'Update Identity'}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 backdrop-blur-md transition-all active:scale-95"
                  >
                    Modify Profile
                  </button>
                  <button
                    onClick={() => setChangePasswordOpen(true)}
                    className="w-full py-4 bg-white/5 hover:bg-rose-500/10 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={16} /> Reset Security Credentials
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Internal Change Password Logic */}
        {changePasswordOpen && (
          <div className="absolute inset-0 z-50 bg-[#0f172a] p-8 flex flex-col justify-center rounded-[3rem]">
             <ChangePasswordModal onClose={() => setChangePasswordOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;