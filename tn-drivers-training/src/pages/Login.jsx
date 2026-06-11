
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle, AlertCircle, X, Eye, EyeOff, Home } from 'lucide-react';
import PrivacyPolicy from './PrivacyPolicy'; 

const API_BASE = "http://localhost:8000/api";

const Login = () => {
  const navigate = useNavigate();
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false); 
  
  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

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

    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email: formData.email,
        password: formData.password,
        remember: rememberMe
      });
      
      if (response.data.success) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
          if (response.data.user.role === 'admin') {
            navigate('/Dashboard');
          } else if (response.data.user.role === 'instructor') {
            navigate('/instructor');
          } else if (response.data.user.role === 'student') {
            navigate('/student');
          } else {
            navigate('/');
          }
        }, 1500);
      }
    } catch (err) {
      console.error('Login error:', err);
      const status = err.response?.status;
      const message = err.response?.data?.message;

      // Ensure 403 or specific blocked messages are caught first
      if (status === 403 || (message && message.includes('contact administration'))) {
        setError(message || 'Your account is not active. Please contact administration.');
      } else if (status === 401 || message === 'Invalid credentials.') {
        setError('Invalid email or password');
      } else {
        setError(message || 'Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setError('Please enter a valid email address');
      setForgotLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/forgot-password`, {
        email: forgotEmail
      });
      
      if (response.data.success) {
        setForgotSuccess(true);
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotSuccess(false);
          setForgotEmail('');
        }, 3000);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      
      if (err.response?.status === 404) {
        setError('Email not found in our records');
      } else if (err.response?.status === 422) {
        setError(err.response.data.message || 'Please enter a valid email address');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#0a0a1a] font-display antialiased h-screen overflow-hidden">
      <div className="flex h-full w-full flex-col lg:flex-row">
        
        {/* Left Side: Branding & Visuals */}
        <div className="relative hidden lg:flex lg:w-1/2 dynamic-waves flex-col justify-between p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <svg className="h-full w-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,400 C150,300 350,500 500,400 C650,300 800,400 800,400 L800,800 L0,800 Z" fill="rgba(236, 91, 19, 0.1)"></path>
              <path d="M0,500 C200,400 400,600 600,500 C700,450 800,500 800,500 L800,800 L0,800 Z" fill="rgba(168, 85, 247, 0.1)"></path>
            </svg>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <img src="/logo.webp" alt="TerraNova Logo" className="h-12 w-auto object-contain drop-shadow-md" />
            <h1 className="text-3xl font-black tracking-tight text-white">TerraNova</h1>
          </div>

          <div className="relative z-10 max-w-lg">
            <h2 className="text-5xl font-black leading-tight text-white mb-6">
              Drivers Training <br/>
              <span className="text-[#ec5b13] font-black">Management System.</span>
            </h2>
            <p className="text-lg text-slate-300 font-medium leading-relaxed">
              Experience the next generation of fleet safety and driver education. Streamlined compliance, advanced analytics, and interactive learning modules.
            </p>
          </div>

          <div className="relative z-10 flex gap-8">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">12k+</span>
              <span className="text-sm font-bold text-slate-400">Certified Drivers</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">98%</span>
              <span className="text-sm font-bold text-slate-400">Safety Rating</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">24/7</span>
              <span className="text-sm font-bold text-slate-400">Support</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="relative flex w-full lg:w-1/2 flex-col items-center justify-center p-6 sm:p-12 bg-[#f8f6f6] dark:bg-[#0a0a1a] overflow-y-auto">
          
          {/* Top Right Home Button */}
          <button 
            onClick={() => navigate('/')}
            className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm backdrop-blur-sm text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#ec5b13] dark:hover:text-[#ec5b13] hover:border-[#ec5b13]/30 transition-all z-10"
          >
            <Home size={16} />
            Home
          </button>

          <div className="w-full max-w-md space-y-8 mt-10 lg:mt-0">
            
            <div className="lg:hidden flex items-center justify-center mb-8">
              <img src="/logo.webp" alt="TerraNova Logo" className="h-12 w-auto object-contain drop-shadow-sm" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight dark:text-white">Welcome back</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Please enter your details to sign in to your account.</p>
            </div>

            {success && (
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3">
                <CheckCircle size={18} className="text-green-400 shrink-0" />
                <p className="text-sm font-bold text-green-400">{success}</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3 animate-fadeIn">
                <AlertCircle size={18} className="text-red-500 dark:text-red-400 shrink-0" />
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="gradient-outline p-8 rounded-xl shadow-2xl dark:bg-[#0f172a]/20">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="name@company.com"
                      className="w-full rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 pl-11 py-3 focus:border-[#ec5b13] focus:ring-[#ec5b13] dark:text-white transition-all outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="password">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-bold text-[#ec5b13] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                    
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 pl-11 pr-12 py-3 focus:border-[#ec5b13] focus:ring-[#ec5b13] dark:text-white transition-all outline-none font-medium [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#ec5b13] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    className="rounded border-slate-300 text-[#ec5b13] focus:ring-[#ec5b13]"
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-400" htmlFor="remember">
                    Remember me for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ec5b13] hover:bg-[#ec5b13]/90 text-white font-black py-3 px-4 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span className="font-black">Signing in...</span>
                    </>
                  ) : (
                    <span className="font-black">Sign In</span>
                  )}
                </button>
              </form> 
            </div>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account? 
              <a className="font-black text-[#ec5b13] hover:underline ml-1" href="/register">
                Create Account
              </a>
            </p>

            <footer className="mt-auto pt-8 text-xs text-slate-400 flex flex-wrap gap-x-6 gap-y-2 justify-center font-bold">
              <button 
                onClick={() => setShowPrivacyPolicy(true)} 
                className="hover:text-[#ec5b13] transition-colors"
              >
                Privacy Policy
              </button>
              <span>© 2026 Terra Nova Drivers Training</span>
            </footer>
          </div>
        </div>
      </div>

      <PrivacyPolicy 
        isOpen={showPrivacyPolicy} 
        onClose={() => setShowPrivacyPolicy(false)} 
      />

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ec5b13] to-indigo-500 rounded-[2rem] blur-xl opacity-30"></div>
            
            <div className="relative bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-[#ec5b13]/20 to-indigo-600/20 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                    Reset Password
                  </h3>
                  <button
                    onClick={() => {
                      setShowForgotModal(false);
                      setError('');
                      setForgotEmail('');
                    }}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X size={18} className="text-white/60" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {forgotSuccess ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-4 border border-green-500/30">
                      <CheckCircle size={32} className="text-green-400" />
                    </div>
                    <h4 className="text-lg font-black text-white mb-2">Check Your Email</h4>
                    <p className="text-sm text-white/60 font-medium">
                      We've sent password reset instructions to <br />
                      <span className="font-black text-[#ec5b13]">{forgotEmail}</span>
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className="text-sm text-white/60 font-medium mb-4">
                      Enter your email address and we'll send you instructions to reset your password.
                    </p>
                    
                    {error && (
                      <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2 text-sm text-red-400">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xl">mail</span>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setError('');
                        }}
                        required
                        placeholder="your@email.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/30 font-medium outline-none focus:border-[#ec5b13]/50 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotModal(false);
                          setError('');
                          setForgotEmail('');
                        }}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl font-black text-xs uppercase tracking-wider transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="flex-1 py-3 bg-gradient-to-r from-[#ec5b13] to-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {forgotLoading ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
      
      <style>{`
        .gradient-outline {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }
        .gradient-outline::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 1rem;
          padding: 2px;
          background: linear-gradient(45deg, #ec5b13, #a855f7, #3b82f6);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .dynamic-waves {
          background: radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.2) 0%, transparent 50%),
                      linear-gradient(135deg, #0a0a1a 0%, #1e1b4b 100%);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default Login;