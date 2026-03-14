import React, { useState } from "react";
import axios from "axios";
import { 
  X, Lock, Eye, EyeOff, Loader2, 
  CheckCircle, AlertCircle, Shield, LogOut
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

const ChangePasswordModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const togglePassword = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    
    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }
    
    if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('access_token');
      const formDataToSend = new FormData();
      formDataToSend.append('current_password', formData.current_password);
      formDataToSend.append('new_password', formData.new_password);
      formDataToSend.append('new_password_confirmation', formData.new_password_confirmation);

      const response = await axios.post(`${API_BASE}/profile/update`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setMessage({ 
          type: 'success', 
          text: 'Password changed successfully! Redirecting to login...' 
        });
        
        // Clear token and user data from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      console.error("Password change error:", error);
      
      if (error.response?.status === 400) {
        // Current password incorrect
        setMessage({ 
          type: 'error', 
          text: error.response.data.message || 'Current password is incorrect' 
        });
        setErrors({ current_password: 'Incorrect password' });
      } else if (error.response?.status === 422) {
        // Validation errors
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        }
        setMessage({ 
          type: 'error', 
          text: error.response.data.message || 'Validation failed' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Failed to change password. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-200 p-4">
      
      {/* Glass Card */}
      <div className="relative w-full max-w-md rounded-[3rem] p-8 overflow-hidden 
                      bg-white/5 backdrop-blur-3xl 
                      border border-white/20 
                      shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] 
                      animate-in zoom-in duration-300">
        
        {/* Specular Highlight */}
        <div className="absolute top-0 left-0 right-0 h-1px bg-linear-to-r from-transparent via-white/40 to-transparent" />
        <div className="absolute top-0 bottom-0 left-0 w-1px bg-linear-to-b from-white/20 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all z-20"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-teal/20 rounded-2xl border border-teal/30">
            <Shield size={24} className="text-teal" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              Security
            </h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
              Update Password
            </p>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl backdrop-blur-xl border flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-300' 
              : 'bg-red-500/20 border-red-500/30 text-red-300'
          }`}>
            {message.type === 'success' ? 
              <CheckCircle size={18} className="shrink-0" /> : 
              <AlertCircle size={18} className="shrink-0" />
            }
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-3xl mb-4 border border-green-500/30">
              <LogOut size={32} className="text-green-400" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Password Updated!</h3>
            <p className="text-sm text-white/60">
              You'll be redirected to the login page to sign in with your new password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Current Password */}
            <div className="group relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal transition-colors" size={16} />
              <input
                type={showPasswords.current ? "text" : "password"}
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                placeholder="Current Password"
                className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-white outline-none transition-all focus:border-teal/50 focus:bg-white/10 ${
                  errors.current_password ? 'border-red-500/50' : 'border-white/10'
                }`}
              />
              {/* <button
                type="button"
                onClick={() => togglePassword('current')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button> */}
              {errors.current_password && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.current_password}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="group relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal transition-colors" size={16} />
              <input
                type={showPasswords.new ? "text" : "password"}
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="New Password"
                className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-white outline-none transition-all focus:border-teal/50 focus:bg-white/10 ${
                  errors.new_password ? 'border-red-500/50' : 'border-white/10'
                }`}
              />
              {/* <button
                type="button"
                onClick={() => togglePassword('new')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button> */}
              {errors.new_password && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.new_password}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="group relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal transition-colors" size={16} />
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="new_password_confirmation"
                value={formData.new_password_confirmation}
                onChange={handleChange}
                placeholder="Confirm New Password"
                className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-white outline-none transition-all focus:border-teal/50 focus:bg-white/10 ${
                  errors.new_password_confirmation ? 'border-red-500/50' : 'border-white/10'
                }`}
              />
              {/* <button
                type="button"
                onClick={() => togglePassword('confirm')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button> */}
              {errors.new_password_confirmation && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.new_password_confirmation}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">
                Password Requirements
              </p>
              <ul className="space-y-1">
                <li className="text-xs text-white/60 flex items-center gap-2">
                  <div className={`w-1 h-1 rounded-full ${formData.new_password.length >= 8 ? 'bg-green-500' : 'bg-white/20'}`} />
                  At least 8 characters
                </li>
                <li className="text-xs text-white/60 flex items-center gap-2">
                  <div className={`w-1 h-1 rounded-full ${formData.new_password === formData.new_password_confirmation && formData.new_password ? 'bg-green-500' : 'bg-white/20'}`} />
                  Passwords must match
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-teal text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;