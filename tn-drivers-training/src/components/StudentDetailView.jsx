
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Mail, Loader2, Calendar, Clock, 
  CreditCard, Award, User, ShieldCheck, 
  AlertCircle, PlusCircle, Check, DollarSign,
  MapPin, Phone, BookOpen, Hash, FileText,
  CalendarIcon, UserCircle, Download, Edit, Trash2, MessageCircle, X, Save
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/api";

export default function StudentDetailView({ studentId, onClose }) {
  const [data, setData] = useState(null);
  const [rawStudent, setRawStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [scheduleTab, setScheduleTab] = useState("attendance");
  
  // --- Edit Form States ---
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [errors, setErrors] = useState({}); 
  
  // --- Global UI States ---
  const [notification, setNotification] = useState(null); // Custom alert banner
  const [confirmDialog, setConfirmDialog] = useState(null); // Custom confirm modal

  const [payLoading, setPayLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount_total: "",
    payment_method: "Cash",
    transaction_id: "", 
    status: "succeeded",
  });

  const extractEditableFields = (adminData, rawData) => {
    return {
      name:             adminData.name || '',
      email:            adminData.email || '',
      phone:            adminData.phone || '',
      permit_number:    adminData.permit_number !== 'N/A' ? adminData.permit_number : '',
      street_address:   rawData?.street_address || '',
      appartment:       rawData?.appartment || '',
      city:             rawData?.city || '',
      postal_code:      rawData?.postal_code || '',
      state:            rawData?.state || '',
      country:          rawData?.country || '',
      parent_name:      rawData?.parent_name || '',
      parent_email:     rawData?.parent_email || '',
      parent_phone:     rawData?.parent_phone || '',
      additional_notes: rawData?.additional_notes || '',
    };
  };

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');

      const [adminRes, rawRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (adminRes.data.success) {
        setData(adminRes.data.data);
        const raw = rawRes.data.data || rawRes.data;
        setRawStudent(raw);
        setEditFormData(extractEditableFields(adminRes.data.data, raw));
      } else {
        setError("Student not found.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchDetails();
  }, [studentId]);

  // --- Premium UI Helpers ---
  const showNotification = (type, message) => {
    setNotification({ type, message });
    if (type !== 'success') {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPayLoading(true);
    setNotification(null);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_BASE}/payments`, {
        student_id: studentId,
        amount_total: parseFloat(formData.amount_total),
        payment_method: formData.payment_method,
        transaction_id: formData.transaction_id,
        status: "succeeded"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFormData({ 
        amount_total: "", 
        payment_method: "Cash", 
        transaction_id: "", 
        status: "succeeded"
      });
      
      await fetchDetails();
      showNotification('success', 'Payment recorded successfully!');
    } catch (err) {
      showNotification('error', "Error recording payment: " + (err.response?.data?.message || err.message));
    } finally {
      setPayLoading(false);
    }
  };

  // Replaces the old native browser confirm() box
  const handleBlockToggle = (action) => {
    setConfirmDialog({
      title: `${action === 'block' ? 'Block' : 'Unblock'} Student`,
      message: `Are you sure you want to ${action} this student?`,
      type: action === 'block' ? 'danger' : 'success',
      actionText: action === 'block' ? 'Yes, Block' : 'Yes, Unblock',
      onConfirm: () => executeBlockToggle(action)
    });
  };

  const executeBlockToggle = async (action) => {
    setConfirmDialog(null);
    setNotification(null);
    try {
      const token = localStorage.getItem('access_token');
      const endpoint = action === 'block' ? 'block' : 'unblock';
      await axios.post(`${API_BASE}/${studentId}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchDetails();
      
      // Request mapping: Red for Block, Green for Unblock
      if (action === 'block') {
        showNotification('error', 'Student blocked successfully!');
      } else {
        showNotification('success', 'Student unblocked successfully!');
      }
    } catch (err) {
      showNotification('error', `Failed to ${action} student`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setNotification(null);

    let frontendErrors = {};
    if (!editFormData.name?.trim()) frontendErrors.name = ["Full name is required."];
    
    if (!editFormData.email?.trim()) {
      frontendErrors.email = ["Email address is required."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(editFormData.email)) {
      frontendErrors.email = ["Please enter a valid email format."];
    }

    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors);
      showNotification('warning', 'Please fix the highlighted validation errors before saving.');
      return;
    }

    setEditLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(`${API_BASE}/students/${studentId}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchDetails();
      showNotification('success', 'Student information updated successfully!');
      setTimeout(() => setIsEditing(false), 1500);
    } catch (err) {
      console.error("Update error:", err);
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        showNotification('warning', 'Please fix the highlighted validation errors.');
      } else if (err.response?.status >= 500) {
        showNotification('error', 'A server error occurred. Please try again later.');
      } else {
        showNotification('error', err.response?.data?.error || err.response?.data?.message || "Failed to update student information.");
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenEdit = () => {
    if (data && rawStudent) {
      setEditFormData(extractEditableFields(data, rawStudent));
    }
    setErrors({});
    setNotification(null);
    setIsEditing(true);
  };

  const getInputClass = (fieldName) => `w-full p-3 sm:p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 font-medium text-sm sm:text-base text-slate-900 dark:text-white focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
    errors[fieldName] 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
      : 'border-slate-200 dark:border-slate-700 focus:border-teal-400 focus:ring-teal-200'
  }`;

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-slate-950 backdrop-blur-sm">
      <div className="text-center">
        <Loader2 className="animate-spin text-teal-600 dark:text-teal-400 mx-auto mb-4" size={48} />
        <p className="text-sm sm:text-base font-mono text-slate-500 dark:text-slate-400 tracking-wider">Loading student records...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-slate-950 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-12 rounded-2xl text-center max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6">{error || "Student not found"}</p>
        <button onClick={onClose} className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition">Return</button>
      </div>
    </div>
  );

  // --- REUSABLE UI BLOCKS ---
  const NotificationBanner = () => {
    if (!notification) return null;
    return (
      <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${
        notification.type === 'success' ? 'bg-emerald-500 text-white' : 
        notification.type === 'warning' ? 'bg-amber-500 text-white' : 
        'bg-rose-500 text-white'
      }`}>
        {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
        <span className="text-sm font-bold">{notification.message}</span>
        {notification.type !== 'success' && (
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-75"><X size={16}/></button>
        )}
      </div>
    );
  };

  const ConfirmDialogOverlay = () => {
    if (!confirmDialog) return null;
    return (
      <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${confirmDialog.type === 'danger' ? 'text-rose-600' : 'text-emerald-600'}`}>
            <AlertCircle size={20} /> {confirmDialog.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            {confirmDialog.message}
          </p>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => setConfirmDialog(null)}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={confirmDialog.onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors ${
                confirmDialog.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {confirmDialog.actionText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Edit Modal View ---
  if (isEditing) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
          
          <NotificationBanner />

          <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Edit Student Information</h2>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Update personal details for {data.name}</p>
            </div>
            <button 
              onClick={() => setIsEditing(false)} 
              disabled={editLoading}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={20} className="text-slate-500 dark:text-slate-400 hover:text-red-500" />
            </button>
          </div>

          <form onSubmit={handleEditSubmit} noValidate className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              
              <div className="col-span-2">
                <h3 className="text-sm sm:text-base font-semibold text-teal-600 dark:text-teal-400 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">Personal Information</h3>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                  Full Name {!editFormData.name && <span className="text-red-500 animate-pulse">*</span>}
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={editFormData.name} 
                  onChange={handleInputChange}
                  disabled={editLoading}
                  className={getInputClass('name')}
                />
                {errors.name && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.name[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                  Email Address {!editFormData.email && <span className="text-red-500 animate-pulse">*</span>}
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={editFormData.email} 
                  onChange={handleInputChange}
                  disabled={editLoading}
                  className={getInputClass('email')}
                />
                {errors.email && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.email[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={editFormData.phone} 
                  onChange={handleInputChange}
                  disabled={editLoading}
                  className={getInputClass('phone')}
                />
                {errors.phone && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.phone[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase">Permit Number</label>
                <input 
                  type="text" 
                  name="permit_number" 
                  value={editFormData.permit_number} 
                  onChange={handleInputChange}
                  disabled={editLoading}
                  className={getInputClass('permit_number')}
                />
                {errors.permit_number && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.permit_number[0]}</p>}
              </div>

              <div className="col-span-2 mt-2">
                <h3 className="text-sm sm:text-base font-semibold text-teal-600 dark:text-teal-400 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">Address Information</h3>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase">Street Address</label>
                <input 
                  type="text" 
                  name="street_address" 
                  value={editFormData.street_address} 
                  onChange={handleInputChange}
                  disabled={editLoading}
                  className={getInputClass('street_address')}
                />
                {errors.street_address && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.street_address[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase">Apartment/Suite</label>
                <input 
                  type="text" 
                  name="appartment" 
                  value={editFormData.appartment} 
                  onChange={handleInputChange}
                  disabled={editLoading}
                  className={getInputClass('appartment')}
                />
                {errors.appartment && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.appartment[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase">City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={editFormData.city} 
                  onChange={handleInputChange}
                  disabled={editLoading}
                  className={getInputClass('city')}
                />
                {errors.city && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.city[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase">Postal Code</label>
                <input 
                  type="text" 
                  name="postal_code" 
                  value={editFormData.postal_code} 
                  onChange={handleInputChange}
                  disabled={editLoading}
                  className={getInputClass('postal_code')}
                />
                {errors.postal_code && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.postal_code[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase">Province/State</label>
                <input 
                  type="text" 
                  name="state" 
                  value={editFormData.state} 
                  onChange={handleInputChange}
                  disabled={editLoading}
                  className={getInputClass('state')}
                />
                {errors.state && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.state[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase">Country</label>
                <input 
                  type="text" 
                  name="country" 
                  value={editFormData.country} 
                  onChange={handleInputChange}
                  disabled={editLoading}
                  className={getInputClass('country')}
                />
                {errors.country && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.country[0]}</p>}
              </div>

              <div className="col-span-2 mt-2">
                <h3 className="text-sm sm:text-base font-semibold text-teal-600 dark:text-teal-400 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">Parent/Guardian Information</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase">Parent Name</label>
                <input 
                  type="text" 
                  name="parent_name" 
                  value={editFormData.parent_name} 
                  onChange={handleInputChange}
                  disabled={editLoading}
                  className={getInputClass('parent_name')}
                />
                {errors.parent_name && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.parent_name[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase">Parent Email</label>
                <input 
                  type="email" 
                  name="parent_email" 
                  value={editFormData.parent_email} 
                  onChange={handleInputChange}
                  disabled={editLoading}
                  className={getInputClass('parent_email')}
                />
                {errors.parent_email && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.parent_email[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase">Parent Phone</label>
                <input 
                  type="tel" 
                  name="parent_phone" 
                  value={editFormData.parent_phone} 
                  onChange={handleInputChange}
                  disabled={editLoading}
                  className={getInputClass('parent_phone')}
                />
                {errors.parent_phone && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.parent_phone[0]}</p>}
              </div>

              <div className="col-span-2 mt-2">
                <label className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase">Additional Notes</label>
                <textarea 
                  name="additional_notes" 
                  value={editFormData.additional_notes} 
                  onChange={handleInputChange} 
                  rows="2"
                  disabled={editLoading}
                  className={`${getInputClass('additional_notes')} mt-2`}
                />
                {errors.additional_notes && <p className="text-[10px] sm:text-xs text-red-500 font-['Sora'] font-medium mt-1 ml-1">{errors.additional_notes[0]}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                disabled={editLoading}
                className="px-5 sm:px-7 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm sm:text-base hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={editLoading}
                className="px-5 sm:px-7 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:bg-teal-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
              >
                {editLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Main View (when not editing) ---
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm p-3 sm:p-4 md:p-8 overflow-y-auto">
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-6xl min-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto">
        
        <ConfirmDialogOverlay />
        <NotificationBanner />

        <button onClick={onClose} className="absolute top-4 right-4 sm:top-0 sm:right-0 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all">
          ✕
        </button>

        <div className="p-5 sm:p-7 md:p-9 lg:p-10 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row items-center gap-5 sm:gap-7 md:gap-9">
            <div className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-4xl sm:text-5xl font-bold text-teal-600 dark:text-teal-400 shadow-sm border-2 border-teal-200 dark:border-teal-800">
              {data.name?.charAt(0) || '?'}
            </div>
            
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-3 sm:mb-4">
                  <span className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-bold uppercase tracking-wider border ${
                    data.paymentStatus === 'Paid' 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                      : data.paymentStatus === 'Deposit Paid'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  }`}>{data.paymentStatus}</span>

                <span className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-bold uppercase tracking-wider border ${
                  data.status === 'active' 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : data.status === 'pending'
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                }`}>{data.status}</span>
                <span className="px-3 sm:px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400 rounded-lg text-xs sm:text-sm font-mono font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                  Permit: {data.permit_number || 'N/A'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">{data.name}</h2>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-6 text-slate-800 dark:text-slate-400 text-sm sm:text-base">
                <span className="flex items-center gap-2"><Mail size={14} /> {data.email}</span>
                <span className="flex items-center gap-2"><Phone size={14} /> {data.phone || 'N/A'}</span>
                <span className="flex items-center gap-2"><MapPin size={14} /> {data.location || data.locationName || 'N/A'}</span>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 w-full lg:w-auto min-w-[200px] sm:min-w-[220px]">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs sm:text-sm font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Balance Due</p>
                <p className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400">CAD {data.balanceCAD}</p>
              </div>
              
              <div className="flex flex-row lg:flex-col gap-2">
                {data.status === 'active' ? (
                  <button onClick={() => handleBlockToggle('block')}
                    className="flex-1 lg:w-full px-4 sm:px-5 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm sm:text-base font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition flex items-center justify-center gap-2">
                    <ShieldCheck size={16} /> Block Student
                  </button>
                ) : data.status === 'blocked' ? (
                  <button onClick={() => handleBlockToggle('unblock')}
                    className="flex-1 lg:w-full px-4 sm:px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm sm:text-base font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition flex items-center justify-center gap-2">
                    <ShieldCheck size={16} /> Unblock Student
                  </button>
                ) : null}

                <button onClick={handleOpenEdit}
                  className="flex-1 lg:w-full px-4 sm:px-5 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm sm:text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2">
                  <Edit size={16} /> Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex px-5 sm:px-7 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 gap-4 sm:gap-6 md:gap-8 min-w-max">
              {["Overview", "Attendance & Schedule", "Skill Evaluation", "Payment History"].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`py-3 sm:py-4 whitespace-nowrap text-sm sm:text-base font-semibold tracking-wide relative transition-all ${
                    activeTab === tab ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}>
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-500 rounded-full" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 overflow-y-auto">
          
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="flex items-center gap-2 text-sm sm:text-base font-mono font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-4 sm:mb-5">
                  <User size={16} /> Personal Details
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="pb-2 sm:pb-3 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-xs sm:text-sm font-mono text-slate-400 dark:text-slate-500 uppercase mb-1">Full Name</p>
                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white break-words">{data.name}</p>
                  </div>
                  <div className="pb-2 sm:pb-3 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-xs sm:text-sm font-mono text-slate-400 dark:text-slate-500 uppercase mb-1">Email</p>
                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white break-words">{data.email}</p>
                  </div>
                  <div className="pb-2 sm:pb-3 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-xs sm:text-sm font-mono text-slate-400 dark:text-slate-500 uppercase mb-1">Phone</p>
                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">{data.phone || 'Not provided'}</p>
                  </div>
                  <div className="pb-2 sm:pb-3 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-xs sm:text-sm font-mono text-slate-400 dark:text-slate-500 uppercase mb-1">Location</p>
                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white break-words">{data.location || data.locationName || data.province || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-mono text-slate-400 dark:text-slate-500 uppercase mb-1">Permit Number</p>
                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">{data.permit_number || 'Not issued'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="flex items-center gap-2 text-sm sm:text-base font-mono font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-4 sm:mb-5">
                  <BookOpen size={16} /> Enrollment Details
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-wrap justify-between gap-2 pb-2 sm:pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Package</span>
                    <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white text-right break-words">{data.packageName || 'Standard Course'}</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 pb-2 sm:pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Total Amount</span>
                    <span className="font-semibold text-sm sm:text-base text-teal-600 dark:text-teal-400">CAD {data.totalPackageAmount}</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 pb-2 sm:pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Paid</span>
                    <span className="font-semibold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">CAD {data.totalPaid}</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Progress</span>
                    <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">{data.hoursLogged} / {data.totalHours} hrs</span>
                  </div>
                </div>
              </div>

              <div className="bg-teal-600 dark:bg-teal-900 rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-sm">
                <h4 className="flex items-center gap-2 text-sm sm:text-base font-mono font-bold text-teal-100 uppercase tracking-wider mb-4 sm:mb-5">
                  <Award size={16} /> Assigned Instructor
                </h4>
                {data.instructor && data.instructor !== 'Unassigned' ? (
                  <div>
                    <p className="text-base sm:text-lg md:text-xl font-semibold mb-1.5 break-words">{data.instructor}</p>
                    <p className="text-sm sm:text-base text-teal-100 mb-3 sm:mb-4">Lead Instructor</p>
                    {data.instructorEmail && <div className="flex items-center gap-2 text-sm sm:text-base mb-2 break-words"><Mail size={14} className="flex-shrink-0"/> {data.instructorEmail}</div>}
                    {data.instructorPhone && <div className="flex items-center gap-2 text-sm sm:text-base break-words"><Phone size={14} className="flex-shrink-0"/> {data.instructorPhone}</div>}
                  </div>
                ) : (
                  <p className="text-sm sm:text-base opacity-80">No instructor assigned</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "Attendance & Schedule" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-wrap gap-2 sm:gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <button onClick={() => setScheduleTab('attendance')}
                  className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    scheduleTab === 'attendance' ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}>
                  <Clock size={12} className="inline mr-1 sm:mr-2" /> Attendance History
                </button>
                <button onClick={() => setScheduleTab('upcoming')}
                  className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    scheduleTab === 'upcoming' ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}>
                  <Calendar size={12} className="inline mr-1 sm:mr-2" /> Upcoming Schedule
                </button>
              </div>

              {scheduleTab === 'attendance' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {data.attendance?.map((log, i) => (
                    <div key={i} className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className={`p-1.5 sm:p-2 rounded-xl flex-shrink-0 ${log.status === 'present' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-amber-100 dark:bg-amber-900/20'}`}>
                          <Clock size={14} className={log.status === 'present' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}/>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white truncate">{log.session || 'Driving Session'}</p>
                          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-mono">{log.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs sm:text-sm font-mono font-bold px-2 sm:px-3 py-1 rounded-lg whitespace-nowrap flex-shrink-0 ${
                        log.status === 'present' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                      }`}>{log.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {scheduleTab === 'upcoming' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {data.upcomingSchedules?.map((schedule, i) => (
                    <div key={i} className="p-4 sm:p-5 bg-teal-50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800 flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="p-1.5 sm:p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex-shrink-0"><Calendar size={14} className="text-teal-600 dark:text-teal-400"/></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white truncate">{schedule.sessionType || 'Driving Lesson'}</p>
                          <p className="text-xs sm:text-sm text-teal-600 dark:text-teal-400 font-mono truncate">{schedule.date} • {schedule.time}</p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-mono font-bold px-2 sm:px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg whitespace-nowrap flex-shrink-0">
                        {schedule.duration}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Skill Evaluation" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-teal-50 dark:bg-teal-950/30 p-4 sm:p-5 rounded-2xl text-center">
                  <p className="text-xs sm:text-sm font-mono text-teal-600 dark:text-teal-400 uppercase tracking-wider">Total Tests</p>
                  <p className="text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-400">{data.evaluations?.length || 0}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 sm:p-5 rounded-2xl text-center">
                  <p className="text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Average Score</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                    {data.evaluations?.length > 0 ? Math.round(data.evaluations.reduce((a, c) => a + c.score, 0) / data.evaluations.length) : 0}%
                  </p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl text-center">
                  <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-600 dark:text-slate-400">{data.evaluations?.length || 0}</p>
                </div>
              </div>

              {data.evaluations?.map((item, i) => (
                <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-mono text-teal-600 dark:text-teal-400 uppercase bg-teal-100 dark:bg-teal-900/30 px-2 py-1 rounded inline-block">{item.category}</span>
                        <h4 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white mt-2 break-words">{item.test_type}</h4>
                        <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1">{item.date}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400">{item.score}</span>
                        <span className="text-sm sm:text-base text-slate-400 dark:text-slate-500">/100</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-3 sm:p-4 rounded-xl">
                      <p className="text-xs sm:text-sm font-mono text-teal-600 dark:text-teal-400 uppercase mb-2">Instructor Feedback</p>
                      <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 break-words">"{item.note}"</p>
                    </div>
                    {item.student_reply && (
                      <div className="bg-teal-50 dark:bg-teal-950/30 p-3 sm:p-4 rounded-xl mt-3">
                        <p className="text-xs sm:text-sm font-mono text-teal-600 dark:text-teal-400 uppercase mb-2">Student Reply</p>
                        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 break-words">"{item.student_reply}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Payment History" && (
            <div className="space-y-5 sm:space-y-7">
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm sm:text-base font-mono font-bold text-teal-600 dark:text-teal-400 uppercase mb-4">Record New Payment</h4>
                <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="relative">
                    <input type="number" step="0.01" placeholder="Amount"
                      className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm sm:text-base focus:outline-none focus:border-teal-400"
                      value={formData.amount_total} onChange={e => setFormData({...formData, amount_total: e.target.value})} required />
                    <DollarSign className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14}/>
                  </div>
                  <input type="text" placeholder="Transaction ID"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm sm:text-base focus:outline-none focus:border-teal-400"
                    value={formData.transaction_id} onChange={e => setFormData({...formData, transaction_id: e.target.value})} />
                  <select className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm sm:text-base focus:outline-none focus:border-teal-400"
                    value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                    <option value="Cash">Cash</option>
                    <option value="E-Transfer">E-Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                  <button type="submit" disabled={payLoading}
                    className="bg-teal-600 text-white font-semibold text-sm sm:text-base rounded-xl py-2.5 sm:py-3 flex justify-center items-center hover:bg-teal-700 transition disabled:opacity-50">
                    {payLoading ? <Loader2 className="animate-spin" size={16} /> : "Record Payment"}
                  </button>
                </form>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="p-3 sm:p-4 text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="p-3 sm:p-4 text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="p-3 sm:p-4 text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Method</th>
                      <th className="p-3 sm:p-4 text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.payments?.map((p, i) => (
                      <tr key={i}>
                        <td className="p-3 sm:p-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 whitespace-nowrap">{p.date}</td>
                        <td className="p-3 sm:p-4 font-semibold text-sm sm:text-base text-teal-600 dark:text-teal-400 whitespace-nowrap">CAD {p.amount}</td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base text-slate-500 dark:text-slate-400">{p.method || 'N/A'}</td>
                        <td className="p-3 sm:p-4">
                          <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-mono font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg whitespace-nowrap">succeeded</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}