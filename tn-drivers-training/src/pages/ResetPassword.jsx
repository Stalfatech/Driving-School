import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Lock, Eye, EyeOff, Loader2, AlertCircle, 
  CheckCircle, ArrowLeft, Car, Mail
} from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    token: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Extract token and email from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    
    console.log('Reset Password Page - Full URL:', window.location.href);
    console.log('Reset Password Page - Search params:', location.search);
    console.log('Reset Password Page - Token:', token);
    console.log('Reset Password Page - Email:', email);
    
    if (token && email) {
      // Decode the email in case it was URL encoded
      const decodedEmail = decodeURIComponent(email);
      setFormData(prev => ({ ...prev, token, email: decodedEmail }));
      console.log('Form data updated with email:', decodedEmail);
    } else {
      setError('Invalid reset link. Please request a new one.');
      console.error('Missing token or email in URL');
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting reset password with:', {
        email: formData.email,
        token: formData.token,
        password: '[HIDDEN]'
      });

      const response = await axios.post(`${API_BASE}/reset-password`, {
        email: formData.email,
        token: formData.token,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });
      
      console.log('Reset response:', response.data);
      
      // Check for success in response
      if (response.data.message === 'Password reset successful' || response.status === 200) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        setError(errors[0]);
      } else {
        setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Reset Password Card */}
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-[2.5rem] blur-xl opacity-20 animate-pulse"></div>
        
        <div className="relative bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden">
          
          {/* Back to Login Button */}
          <button
            onClick={() => navigate('/login')}
            className="absolute top-6 left-6 p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white z-10"
          >
            <ArrowLeft size={20} />
          </button>
          
          {/* Header */}
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-3xl shadow-2xl mb-6">
              <Car size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
              Reset <span className="text-teal-400">Password</span>
            </h1>
            <p className="text-sm text-white/60 font-medium">
              Enter your new password below
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mx-8 mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl backdrop-blur-xl flex items-center gap-3">
              <CheckCircle size={18} className="text-green-400 shrink-0" />
              <p className="text-sm font-medium text-green-400">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-8 mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl backdrop-blur-xl flex items-center gap-3">
              <AlertCircle size={18} className="text-red-400 shrink-0" />
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
            
            {/* Email (disabled) - Show value if available */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-white/60 ml-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="email"
                  value={formData.email || ''}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium outline-none cursor-not-allowed"
                />
              </div>
              {!formData.email && (
                <p className="text-xs text-yellow-400 mt-1">Waiting for email from reset link...</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-white/60 ml-2">
                New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-teal-400 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-white/30 font-medium outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-white/60 ml-2">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-teal-400 transition-colors" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-white/30 font-medium outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">
                Password Requirements
              </p>
              <ul className="space-y-1">
                <li className="text-xs text-white/60 flex items-center gap-2">
                  <div className={`w-1 h-1 rounded-full ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-white/20'}`} />
                  At least 6 characters
                </li>
                <li className="text-xs text-white/60 flex items-center gap-2">
                  <div className={`w-1 h-1 rounded-full ${formData.password === formData.password_confirmation && formData.password ? 'bg-green-500' : 'bg-white/20'}`} />
                  Passwords must match
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.email}
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-wider shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;