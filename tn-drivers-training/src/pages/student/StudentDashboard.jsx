
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Calendar, Clock, MapPin, User, Award, BookOpen, 
  CheckCircle, Car, Users, AlertCircle, Star, Phone,
  Sun, Cloud, X, Send, Loader2, CheckCircle as CheckCircleIcon, Mail  
} from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

// Helper function for formatting display date
const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Reusable Field Component
const Field = ({ label, error, children, className = '', isRequired, value }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
      {label}
      {isRequired && !value && <span className="text-red-500 text-base animate-pulse">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
  </div>
);

// Reusable Input Component
const Input = ({ error, className = '', ...props }) => (
  <input
    className={`w-full px-4 sm:px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-medium outline-none transition-all ${
      error 
        ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
        : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
    } dark:text-white ${className}`}
    {...props}
  />
);

// Reusable TextArea Component
const TextArea = ({ error, className = '', ...props }) => (
  <textarea
    className={`w-full px-4 sm:px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-medium outline-none transition-all resize-none ${
      error 
        ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
        : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
    } dark:text-white ${className}`}
    {...props}
  />
);

// Notification Banner Component
const NotificationBanner = ({ notification, onDismiss }) => {
  if (!notification) return null;
  
  const icons = {
    success: <CheckCircleIcon size={18} className="text-white" />,
    warning: <AlertCircle size={18} className="text-white" />,
    error: <AlertCircle size={18} className="text-white" />
  };
  
  const colors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500'
  };
  
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${colors[notification.type]}`}>
      {icons[notification.type]}
      <span className="text-sm font-bold text-white">{notification.message}</span>
      <button onClick={onDismiss} className="ml-2 hover:opacity-75 text-white">
        <X size={16} />
      </button>
    </div>
  );
};

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  
  // Reschedule Modal State
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    pickupLocation: '',
    reason: ''
  });
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeScheduleTab, setActiveScheduleTab] = useState("upcoming");

  // Test states
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [testStatistics, setTestStatistics] = useState(null);
  const [loadingTests, setLoadingTests] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState("schedule");
  
  // Validation State
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [showEmailMenu, setShowEmailMenu] = useState(false);
  
  // Ref for notification timeout
  const notificationTimeoutRef = useRef(null);

  const token = localStorage.getItem('access_token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Helper to show notifications with auto-hide for ALL types
  const showNotification = (type, message) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    setNotification({ type, message });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Clear notification timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // Clear a specific field error when user starts typing
  const clearFieldError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/student/dashboard`, config);
        if (response.data.success) {
          setDashboard(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load dashboard');
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.response?.data?.message || 'Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (rescheduleForm.date && dashboard && dashboard.instructor && dashboard.instructor.id) {
      const fetchSlots = async () => {
        setIsFetchingSlots(true);
        try {
          const res = await axios.get(`${API_BASE}/instructor-availability`, {
            params: { instructor_id: dashboard.instructor.id, date: rescheduleForm.date },
            ...config
          });
          setAvailableSlots(res.data.available_slots || []);
        } catch (err) {
          console.error("Could not fetch slots:", err);
          setAvailableSlots([]);
        } finally {
          setIsFetchingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [rescheduleForm.date, dashboard]);

  // Fetch test data
  const fetchUpcomingTests = async () => {
    setLoadingTests(true);
    try {
      const response = await axios.get(`${API_BASE}/student/tests/upcoming`, config);
      if (response.data.success) {
        setUpcomingTests(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching upcoming tests:", error);
    } finally {
      setLoadingTests(false);
    }
  };

  const fetchCompletedTests = async () => {
    try {
      const response = await axios.get(`${API_BASE}/student/tests/completed`, config);
      if (response.data.success) {
        setCompletedTests(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching completed tests:", error);
    }
  };

  const fetchTestHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/student/tests/history`, config);
      if (response.data.success) {
        setTestStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error("Error fetching test history:", error);
    }
  };

  // Fetch all test data on component mount
  useEffect(() => {
    fetchUpcomingTests();
    fetchCompletedTests();
    fetchTestHistory();
  }, []);

  // Scroll to schedule section when coming from MyPackages
  useEffect(() => {
    if (window.history.state?.usr?.scrollToSchedule) {
      setTimeout(() => {
        const scheduleSection = document.getElementById('schedule-section');
        if (scheduleSection) {
          scheduleSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500);
    }
  }, [dashboard]);

  // Handle opening the reschedule modal
  const handleRescheduleRequest = (schedule) => {
    setRescheduleModal(schedule);
    setRescheduleForm({
      date: schedule.date,
      startTime: '', 
      endTime: '',
      pickupLocation: schedule.location || schedule.pickupLocation || '',
      reason: ''
    });
    setErrors({});
    setNotification(null);
    setAvailableSlots([]);
  };

  // Handle form field changes with real-time error clearing
  const handleRescheduleFormChange = (field, value) => {
    setRescheduleForm(prev => ({ ...prev, [field]: value }));
    clearFieldError(field);
    
    if (field === 'date') {
      if (errors.startTime) clearFieldError('startTime');
    }
  };

  // Frontend validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!rescheduleForm.date) {
      newErrors.date = "Please select a preferred date.";
    }
    
    if (!rescheduleForm.startTime) {
      newErrors.startTime = "Please select an available time slot.";
    }
    
    if (!rescheduleForm.pickupLocation || !rescheduleForm.pickupLocation.trim()) {
      newErrors.pickupLocation = "Please enter a pickup location.";
    }
    
    return newErrors;
  };

  // Submit the reschedule request
  const handleRescheduleSubmit = async () => {
    setErrors({});
    setNotification(null);
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showNotification('warning', 'Please fix the highlighted errors before submitting.');
      return;
    }

    setSubmitting(true);
    
    try {
      const payload = {
        assignment_id: rescheduleModal.id,
        requested_date: rescheduleForm.date,
        requested_start_time: rescheduleForm.startTime,
        requested_end_time: rescheduleForm.endTime,
        pickup_location: rescheduleForm.pickupLocation,
        reason: rescheduleForm.reason
      };
      
      await axios.post(`${API_BASE}/student/reschedule`, payload, config);
      
      showNotification('success', 'Reschedule request submitted to the Admin for approval!');
      
      setTimeout(() => {
        setRescheduleModal(null);
        setRescheduleForm({
          date: '',
          startTime: '',
          endTime: '',
          pickupLocation: '',
          reason: ''
        });
      }, 1500);
      
    } catch (err) {
      if (err.response?.status === 422) {
        const backendErrors = err.response.data.errors || {};
        const formattedErrors = {};
        
        Object.keys(backendErrors).forEach(key => {
          if (key === 'requested_date') formattedErrors.date = backendErrors[key][0];
          else if (key === 'requested_start_time') formattedErrors.startTime = backendErrors[key][0];
          else if (key === 'pickup_location') formattedErrors.pickupLocation = backendErrors[key][0];
          else if (key === 'reason') formattedErrors.reason = backendErrors[key][0];
          else formattedErrors[key] = backendErrors[key][0];
        });
        
        setErrors(formattedErrors);
        showNotification('warning', 'Please fix the highlighted validation errors below.');
        
      } else if (err.response?.status >= 500) {
        showNotification('error', 'A server error occurred. Please try again.');
        
      } else if (err.response?.status === 401) {
        showNotification('error', 'Your session has expired. Please log in again.');
        
      } else {
        showNotification('error', err.response?.data?.message || 'Failed to submit request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Formatting helpers
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTimeAMPM = (timeString) => {
    if (!timeString) return '';
    const [hourString, minute] = timeString.split(':');
    const hour = parseInt(hourString, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getWeatherIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return <Sun className="w-5 h-5 text-yellow-500" />;
    if (hour < 17) return <Sun className="w-5 h-5 text-orange-500" />;
    return <Cloud className="w-5 h-5 text-slate-500" />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={48} />
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dashboard) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-red-600 font-semibold mb-4">{error || 'Unable to load dashboard'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { student, package: pkg, instructor, upcoming_sessions, completed_sessions } = dashboard;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-8xl mx-auto">
      
      {/* Notification Banner */}
      <NotificationBanner notification={notification} onDismiss={() => setNotification(null)} />

      {/* Welcome Section with Stats */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-teal-700 dark:from-teal-800 dark:to-teal-900 rounded-3xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative px-6 sm:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                {getWeatherIcon()}
                <span className="text-white/80 text-xs sm:text-sm font-medium tracking-wide">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2 sm:mb-3 tracking-tight">
                {getGreeting()}, {student?.name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-teal-100 text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed">
                Ready for your next driving session? You're making great progress! Keep up the momentum.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4">
                  <p className="text-teal-100 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Completed</p>
                  <p className="text-white text-2xl sm:text-3xl font-bold">{pkg?.completed_hours || 0}<span className="text-base sm:text-lg text-teal-200">/{pkg?.hours || 0}h</span></p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4">
                  <p className="text-teal-100 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Progress</p>
                  <p className="text-white text-2xl sm:text-3xl font-bold">{pkg?.progress || 0}%</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 sm:px-5 py-3 sm:py-4">
                  <p className="text-teal-100 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Upcoming</p>
                  <p className="text-white text-2xl sm:text-3xl font-bold">{upcoming_sessions?.length || 0} <span className="text-base sm:text-lg text-teal-200">Classes</span></p>
                </div>
              </div>
            </div>

            {/* Progress Ring */}
            <div className="hidden sm:flex flex-col items-center bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/10">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
                  <circle cx="50%" cy="50%" r="45%" stroke="white" strokeWidth="8" fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - (pkg?.progress || 0) / 100)}`}
                    className="transition-all duration-1000 ease-out" strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-2xl sm:text-3xl font-bold">{pkg?.progress || 0}%</p>
                </div>
              </div>
              <p className="text-white/90 font-medium text-xs sm:text-sm mt-3 sm:mt-4 uppercase tracking-wider">Course Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Package & Instructor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Package Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
          <div className="p-6 sm:p-8 flex flex-col h-full">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl">
                  <BookOpen size={22} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{pkg?.name || 'No Active Package'}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    {pkg?.hours || 0} Hours Total • {pkg?.includes?.length || 0} Core Components
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid mb-6 text-center">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                <p className="text-xs md:text-md font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Remaining Hours
                </p>
                <p className="text-slate-800 dark:text-slate-200 font-bold text-2xl">
                  {pkg?.remaining_hours || 0}
                  <span className="text-sm font-normal text-slate-500"> / {pkg?.hours || 0}h</span>
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>Overall Progress</span>
                <span className="text-teal-600 dark:text-teal-400">{pkg?.progress || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${pkg?.progress || 0}%` }} />
              </div>
            </div>

            <div className="mt-auto">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                What's Included
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg?.includes?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                    <CheckCircle size={18} className="text-teal-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Instructor Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
          <div className="p-6 sm:p-8 flex flex-col h-full">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Award size={22} className="sm:w-6 sm:h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Your Instructor</h2>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6 text-center sm:text-left">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-teal-500/20 flex-shrink-0 border-4 border-white dark:border-slate-900">
                {instructor?.name?.charAt(0) || 'T'}
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {instructor?.name || 'Not Assigned'}
                </h3>
                <p className="text-teal-600 dark:text-teal-400 font-semibold mb-3">
                  {instructor?.specialization || 'Driving Instructor'}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium">
                    <Clock size={14} />
                    {instructor?.experience || 'Experience N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  <User size={16} className="text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-sm font-medium break-all">{instructor?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  <Phone size={16} className="text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-sm font-medium">{instructor?.phone || 'N/A'}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                if (!instructor?.email) {
                  showNotification('warning', 'Instructor email not available.');
                  return;
                }
                
                const subject = encodeURIComponent(`Driving Lesson Query - ${student?.name || 'Student'}`);
                const body = encodeURIComponent(
                  `Hello ${instructor?.name || 'Instructor'},\n\n` +
                  `I have a question about my driving lessons.\n\n` +
                  `Student: ${student?.name || 'N/A'}\n` +
                  `Package: ${pkg?.name || 'N/A'}\n` +
                  `Progress: ${pkg?.progress || 0}%\n\n` +
                  `Message:\n[Type your message here]\n\n` +
                  `Best regards,\n${student?.name || 'Student'}`
                );
                
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${instructor?.email}&su=${subject}&body=${body}`;
                window.open(gmailUrl, '_blank');
              }}
              className="mt-auto w-full py-3.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Mail size={16} />
              Message Instructor
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Section with Tab Switcher */}
      <div id="schedule-section" className="space-y-6 pt-4">
        
        {/* Tab Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
              {activeDashboardTab === 'schedule' ? (
                <Calendar size={24} className="text-teal-600 dark:text-teal-400" />
              ) : (
                <Award size={24} className="text-teal-600 dark:text-teal-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeDashboardTab === 'schedule' ? 'My Schedule' : 'My Tests'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {activeDashboardTab === 'schedule' 
                  ? 'Manage your upcoming and completed sessions' 
                  : 'Track your driving test progress and results'}
              </p>
            </div>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveDashboardTab("schedule")}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeDashboardTab === "schedule"
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Calendar size={14} /> Schedule
            </button>
            <button
              onClick={() => setActiveDashboardTab("tests")}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeDashboardTab === "tests"
                  ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Award size={14} /> Tests
            </button>
          </div>
        </div>

        {/* Schedule View */}
        {activeDashboardTab === "schedule" && (
          <>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveScheduleTab("upcoming")}
                className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeScheduleTab === "upcoming"
                    ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                Upcoming ({upcoming_sessions?.length || 0})
              </button>
              <button
                onClick={() => setActiveScheduleTab("completed")}
                className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeScheduleTab === "completed"
                    ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                Completed ({completed_sessions?.length || 0})
              </button>
            </div>

            {/* Upcoming Sessions */}
            {activeScheduleTab === "upcoming" && (
              <div className="space-y-4">
                {upcoming_sessions && upcoming_sessions.length > 0 ? (
                  upcoming_sessions.map((schedule) => (
                    <div key={schedule.id} className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-l-teal-500 border-y border-r border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="p-5 sm:p-6">
                        {/* Mobile layout */}
                        <div className="block md:hidden">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar size={16} className="text-teal-500" />
                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                  {formatDate(schedule.date)}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{schedule.topic}</h3>
                            </div>
                            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-2 text-center min-w-[60px]">
                              <p className="text-teal-600 dark:text-teal-400 text-xs font-bold uppercase">
                                {new Date(schedule.date).toLocaleDateString('en-US', { month: 'short' })}
                              </p>
                              <p className="text-slate-900 dark:text-white text-xl font-bold">
                                {new Date(schedule.date).getDate()}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                              <Clock size={16} className="text-teal-500" />
                              <span>{schedule.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                              <MapPin size={16} className="text-teal-500" />
                              <span>{schedule.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                              <Users size={16} className="text-teal-500" />
                              <span>Instructor: {schedule.instructor}</span>
                            </div>
                          </div>
                          <button onClick={() => handleRescheduleRequest(schedule)} className="w-full px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:border-teal-500 hover:text-teal-600 transition-all">
                            Reschedule Session
                          </button>
                        </div>
                        {/* Desktop layout */}
                        <div className="hidden md:flex md:items-center md:justify-between gap-6">
                          <div className="flex items-center gap-6 flex-1">
                            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 rounded-xl p-3 text-center min-w-[90px]">
                              <p className="text-teal-600 dark:text-teal-400 text-xs font-bold uppercase mb-1">
                                {new Date(schedule.date).toLocaleDateString('en-US', { month: 'short' })}
                              </p>
                              <p className="text-slate-900 dark:text-white text-2xl font-black">
                                {new Date(schedule.date).getDate()}
                              </p>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{schedule.topic}</h3>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                  <Clock size={16} className="text-teal-500" /> {schedule.time}
                                </span>
                                <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                  <MapPin size={16} className="text-teal-500" /> {schedule.location}
                                </span>
                                <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                  <Users size={16} className="text-teal-500" /> {schedule.instructor}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleRescheduleRequest(schedule)} className="px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:border-teal-500 hover:text-teal-600 transition-all whitespace-nowrap">
                            Reschedule
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
                    <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No upcoming sessions</p>
                    <p className="text-slate-500 dark:text-slate-500 mt-2">You don't have any classes scheduled right now.</p>
                  </div>
                )}
              </div>
            )}

            {/* Completed Sessions */}
            {activeScheduleTab === "completed" && (
              <div className="space-y-4">
                {completed_sessions && completed_sessions.length > 0 ? (
                  completed_sessions.map((schedule) => (
                    <div key={schedule.id} className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-l-slate-300 dark:border-l-slate-600 border-y border-r border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="p-5 sm:p-6">
                        {/* Mobile layout */}
                        <div className="block md:hidden">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar size={16} className="text-slate-400" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">{formatDate(schedule.date)}</span>
                              </div>
                              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 line-through">{schedule.topic}</h3>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                              <span className="text-green-600 dark:text-green-400 text-xs font-bold flex items-center gap-1">
                                <CheckCircle size={12} /> Done
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock size={14} /> <span>{schedule.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <MapPin size={14} /> <span>{schedule.location}</span>
                            </div>
                          </div>
                          {schedule.score && (
                            <div className="flex items-center gap-2 text-sm font-bold text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg w-fit">
                              <Star size={14} className="fill-yellow-500" /> Score: {schedule.score}%
                            </div>
                          )}
                        </div>
                        {/* Desktop layout */}
                        <div className="hidden md:flex md:items-center gap-6">
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 text-center min-w-[90px] opacity-70">
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">
                              {new Date(schedule.date).toLocaleDateString('en-US', { month: 'short' })}
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 text-2xl font-black">
                              {new Date(schedule.date).getDate()}
                            </p>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 line-through">{schedule.topic}</h3>
                              <span className="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                <CheckCircle size={12} /> Completed
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1.5"><Clock size={16} /> {schedule.time}</span>
                              <span className="flex items-center gap-1.5"><MapPin size={16} /> {schedule.location}</span>
                              {schedule.score && (
                                <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md font-bold">
                                  <Star size={14} className="fill-yellow-500" /> Score: {schedule.score}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
                    <CheckCircle size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No completed sessions</p>
                    <p className="text-slate-500 dark:text-slate-500 mt-2">Your finished classes will appear here.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Tests View */}
        {activeDashboardTab === "tests" && (
          <div className="space-y-6">
            {/* Test Statistics Cards */}
            {testStatistics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                  <p className="text-xs text-slate-500">Total Tests</p>
                  <p className="text-2xl font-bold text-teal-600">{testStatistics.total_tests}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                  <p className="text-xs text-slate-500">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{testStatistics.passed_tests}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                  <p className="text-xs text-slate-500">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{testStatistics.failed_tests}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                  <p className="text-xs text-slate-500">Pass Rate</p>
                  <p className="text-2xl font-bold text-teal-600">{testStatistics.pass_rate}%</p>
                </div>
              </div>
            )}

            {/* Upcoming Tests */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <Clock size={18} className="text-amber-500" /> Upcoming Tests
              </h3>
              <div className="space-y-3">
                {loadingTests ? (
                  <div className="text-center py-8"><Loader2 className="animate-spin text-teal-600 mx-auto" size={24} /></div>
                ) : upcomingTests.length > 0 ? (
                  upcomingTests.map(test => (
                    <div key={test.id} className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 rounded-full text-[10px] font-bold uppercase">
                              {test.test_type}
                            </span>
                            <span className="text-xs text-slate-500">Attempt #{test.attempt_number}</span>
                          </div>
                          <p className="font-semibold text-slate-800 dark:text-white">Instructor: {test.instructor_name}</p>
                          <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-600">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {formatDisplayDate(test.date)}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {formatTimeAMPM(test.start_time)} - {formatTimeAMPM(test.end_time)}</span>
                            <span className="flex items-center gap-1"><MapPin size={14} /> {test.location}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold whitespace-nowrap">
                          Scheduled
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed">
                    <p className="text-slate-500">No upcoming tests scheduled</p>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Tests */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" /> Completed Tests
              </h3>
              <div className="space-y-3">
                {completedTests.length > 0 ? (
                  completedTests.map(test => (
                    <div key={test.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 rounded-full text-[10px] font-bold uppercase">
                              {test.test_type}
                            </span>
                            <span className="text-xs text-slate-500">Attempt #{test.attempt_number}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${test.result === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {test.result || 'Pending'}
                            </span>
                            {test.score && (
                              <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[10px] font-bold">
                                Score: {test.score}%
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-slate-800 dark:text-white">Instructor: {test.instructor_name}</p>
                          <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-600">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {formatDisplayDate(test.date)}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {formatTimeAMPM(test.start_time)} - {formatTimeAMPM(test.end_time)}</span>
                          </div>
                          {test.remarks && (
                            <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                              <p className="text-xs font-semibold text-slate-500">Instructor Remarks:</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{test.remarks}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed">
                    <p className="text-slate-500">No completed tests yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Request Reschedule</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{rescheduleModal.topic}</p>
              </div>
              <button onClick={() => setRescheduleModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-white hover:text-red-500 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleRescheduleSubmit(); }} className="flex-1 flex flex-col overflow-hidden" noValidate>
              <div className="p-6 sm:p-8 space-y-5 sm:space-y-6 overflow-y-auto">
                
                {/* Date Selection */}
                <Field label="Preferred Date" isRequired value={rescheduleForm.date} error={errors.date}>
                  <Input 
                    type="date" 
                    min={
                      rescheduleModal.schedule_start_date > new Date().toISOString().split('T')[0] 
                        ? rescheduleModal.schedule_start_date 
                        : new Date().toISOString().split('T')[0]
                    } 
                    max={rescheduleModal.schedule_end_date || ''} 
                    value={rescheduleForm.date}
                    onChange={(e) => handleRescheduleFormChange('date', e.target.value)}
                    error={errors.date}
                  />
                </Field>

                {/* Time Slot Selection */}
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-3">
                    Available Slots <span className="text-red-500">*</span>
                  </label>
                  {isFetchingSlots ? (
                    <p className="text-teal-600 text-sm font-semibold animate-pulse">Checking instructor availability...</p>
                  ) : (
                    availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableSlots.map((slot, index) => {
                          const isSelected = rescheduleForm.startTime === slot.start;
                          const hasError = errors.startTime && !isSelected;
                          return (
                            <button 
                              key={index} 
                              type="button" 
                              onClick={() => {
                                handleRescheduleFormChange('startTime', slot.start);
                                handleRescheduleFormChange('endTime', slot.end);
                              }}
                              className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                                isSelected 
                                  ? 'bg-teal-600 text-white border-teal-600 shadow-md' 
                                  : hasError
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-slate-700 dark:text-slate-300 hover:border-teal-500'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-500 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {formatTimeAMPM(slot.start)} - {formatTimeAMPM(slot.end)}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={`p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center text-sm ${
                        errors.startTime ? 'border border-red-500 bg-red-50 dark:bg-red-900/20' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {rescheduleForm.date 
                          ? "No free slots available on this date. Try another day." 
                          : "Select a date to see available slots."}
                      </div>
                    )
                  )}
                  {errors.startTime && (
                    <p className="text-xs text-red-500 font-medium mt-2">{errors.startTime}</p>
                  )}
                </div>

                {/* Pickup Location */}
                <Field label="Pickup Location" isRequired value={rescheduleForm.pickupLocation} error={errors.pickupLocation}>
                  <Input 
                    type="text" 
                    value={rescheduleForm.pickupLocation} 
                    onChange={(e) => handleRescheduleFormChange('pickupLocation', e.target.value)} 
                    placeholder="Enter pickup location"
                    error={errors.pickupLocation}
                  />
                </Field>

                {/* Reason */}
                <Field label="Reason for Reschedule" error={errors.reason}>
                  <TextArea 
                    rows={3} 
                    value={rescheduleForm.reason} 
                    onChange={(e) => handleRescheduleFormChange('reason', e.target.value)} 
                    placeholder="Please provide a brief reason..."
                    error={errors.reason}
                  />
                  <p className="text-xs text-slate-400 mt-1">Optional</p>
                </Field>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 p-6 sm:p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button 
                  type="button"
                  onClick={() => setRescheduleModal(null)} 
                  className="flex-1 px-6 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-white dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting} 
                  className="flex-1 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                  {submitting ? "Sending..." : "Submit to Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;