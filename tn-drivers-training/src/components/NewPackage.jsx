
import React, { useState } from "react";
import axios from "axios";
import { 
  X, Package, Clock, DollarSign, GraduationCap, 
  Plus, Zap, FileText, List, Trash2, AlertCircle, CheckCircle, Crown, Shield
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/api";

const NewPackage = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    package_name: "",
    tier: "Basic", // Default to Basic
    amount: "",
    license_class: "Class 5",
    hours: "",
    description: "",
    included_items: []
  });
  
  const [newItem, setNewItem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({}); 
  const [notification, setNotification] = useState(null); 

  const showNotification = (type, message) => {
    setNotification({ type, message });
    if (type !== 'success') {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const setTier = (tierType) => {
    setFormData(prev => ({ ...prev, tier: tierType }));
    if (errors.tier) setErrors(prev => ({ ...prev, tier: null }));
  };

  const addIncludedItem = () => {
    if (newItem.trim() !== "") {
      setFormData(prev => ({
        ...prev,
        included_items: [...prev.included_items, newItem.trim()]
      }));
      setNewItem("");
    }
  };

  const removeIncludedItem = (index) => {
    setFormData(prev => ({
      ...prev,
      included_items: prev.included_items.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIncludedItem();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setNotification(null);
    
    // Strict Frontend Validations
    let frontendErrors = {};
    if (!formData.package_name.trim()) frontendErrors.package_name = ["Package name is required."];
    if (!formData.amount || parseFloat(formData.amount) <= 0) frontendErrors.amount = ["Please enter a valid price greater than 0."];
    if (!formData.hours || parseInt(formData.hours) <= 0) frontendErrors.hours = ["Please enter valid training hours."];

    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors);
      showNotification('warning', 'Please fix the highlighted errors before creating the package.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        hours: parseInt(formData.hours),
        included_items: formData.included_items.filter(item => item.trim() !== "")
      };
      
      const response = await axios.post(`${API_BASE}/packages`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showNotification('success', 'Package created successfully!');
        setTimeout(() => {
          onRefresh();
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Submission error:", error);
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        showNotification('warning', 'Please fix the highlighted validation errors.');
      } else if (error.response?.status >= 500) {
        showNotification('error', 'A server error occurred. Please try again later.');
      } else {
        showNotification('error', error.response?.data?.message || "Failed to create package.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative bg-white dark:bg-slate-950 w-full max-w-[95%] sm:max-w-2xl lg:max-w-6xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* INLINE NOTIFICATION BANNER */}
        {notification && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' : 
            notification.type === 'warning' ? 'bg-amber-500 text-white' : 
            'bg-rose-500 text-white'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-bold">{notification.message}</span>
            {notification.type !== 'success' && (
              <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-75"><X size={16}/></button>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
              Create New <span className="text-teal-600 dark:text-teal-400">Package</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
              Configure pricing, curriculum details, and package tier
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Package Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Package size={14} className="text-teal-500" />
                  Package Name {!formData.package_name && <span className="text-red-500 animate-pulse">*</span>}
                </label>
                <input 
                  type="text" 
                  name="package_name"
                  value={formData.package_name} 
                  onChange={handleChange} 
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white dark:bg-slate-900 border outline-none text-sm font-medium text-slate-900 dark:text-white transition-all placeholder:text-slate-400 ${
                    errors.package_name 
                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                  }`}
                  placeholder="e.g., Full GDL Program" 
                />
                {errors.package_name && <p className="text-[10px] text-red-500 font-sora mt-0.5 ml-1">{errors.package_name[0]}</p>}
              </div>

              {/* Tier Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Shield size={14} className="text-teal-500" />
                  Package Tier
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTier('Basic')}
                    className={`flex-1 py-2 sm:py-2.5 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.tier === 'Basic' 
                      ? 'border-slate-800 bg-slate-800 text-white dark:bg-white dark:border-white dark:text-slate-900' 
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Package size={16} /> Basic
                  </button>
                  <button
                    type="button"
                    onClick={() => setTier('Premium')}
                    className={`flex-1 py-2 sm:py-2.5 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.tier === 'Premium' 
                      ? 'border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Crown size={16} className={formData.tier === 'Premium' ? 'text-white' : 'text-amber-500'} /> Premium
                  </button>
                </div>
                {errors.tier && <p className="text-[10px] text-red-500 font-sora mt-0.5 ml-1">{errors.tier[0]}</p>}
              </div>
            </div>

            {/* Hours & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={14} className="text-teal-500" />
                  Total Hours {!formData.hours && <span className="text-red-500 animate-pulse">*</span>}
                </label>
                <input 
                  type="number" 
                  name="hours"
                  min="1"
                  step="1"
                  value={formData.hours} 
                  onChange={handleChange} 
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white dark:bg-slate-900 border outline-none text-sm font-medium text-slate-900 dark:text-white transition-all ${
                    errors.hours 
                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                  }`}
                  placeholder="12" 
                />
                {errors.hours && <p className="text-[10px] text-red-500 font-sora mt-0.5 ml-1">{errors.hours[0]}</p>}
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign size={14} className="text-teal-500" />
                  Base Price {!formData.amount && <span className="text-red-500 animate-pulse">*</span>}
                </label>
                <input 
                  type="number" 
                  name="amount"
                  min="0"
                  step="0.01"
                  value={formData.amount} 
                  onChange={handleChange} 
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white dark:bg-slate-900 border outline-none text-sm font-medium text-slate-900 dark:text-white transition-all ${
                    errors.amount 
                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                  }`}
                  placeholder="450" 
                />
                {errors.amount && <p className="text-[10px] text-red-500 font-sora mt-0.5 ml-1">{errors.amount[0]}</p>}
              </div>

              {/* License Class */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap size={14} className="text-teal-500" />
                  License Class {!formData.license_class && <span className="text-red-500 animate-pulse">*</span>}
                </label>
                <input 
                  type="text"
                  name="license_class"
                  value={formData.license_class} 
                  onChange={handleChange} 
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white dark:bg-slate-900 border outline-none text-sm font-medium text-slate-900 dark:text-white transition-all placeholder:text-slate-400 ${
                    errors.license_class 
                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                  }`}
                  placeholder="e.g., Class 5"
                />
                {errors.license_class && <p className="text-[10px] text-red-500 font-sora mt-0.5 ml-1">{errors.license_class[0]}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} className="text-teal-500" />
                Description
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm font-medium text-slate-900 dark:text-white transition-all resize-none"
                placeholder="Describe the package, its benefits, target audience, etc."
              />
              {errors.description && <p className="text-[10px] text-red-500 font-sora mt-0.5 ml-1">{errors.description[0]}</p>}
            </div>

            {/* What's Included - Dynamic List */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <List size={14} className="text-teal-500" />
                What's Included
              </label>
              <div className="space-y-2 sm:space-y-3">
                {formData.included_items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 break-words">
                      {item}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIncludedItem(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm font-medium text-slate-900 dark:text-white transition-all"
                    placeholder="e.g., 10 hours in-car training"
                  />
                  <button
                    type="button"
                    onClick={addIncludedItem}
                    disabled={!newItem.trim()}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1">Press Enter or click Add to include each item</p>
            </div>

            {/* Preview Section */}
            {(formData.package_name || formData.amount || formData.hours || formData.description || formData.included_items.length > 0) && (
              <div className={`mt-4 p-4 sm:p-5 rounded-xl border ${formData.tier === 'Premium' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className={formData.tier === 'Premium' ? 'text-amber-500' : 'text-teal-500'} />
                  <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${formData.tier === 'Premium' ? 'text-amber-600 dark:text-amber-500' : 'text-teal-600 dark:text-teal-400'}`}>
                    {formData.tier} Package Preview
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-white break-words">{formData.package_name || '—'}</p>
                        {formData.tier === 'Premium' && <Crown size={16} className="text-amber-500" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formData.license_class} • {formData.hours || '0'} hours</p>
                    </div>
                    <p className={`text-xl sm:text-2xl font-bold whitespace-nowrap ${formData.tier === 'Premium' ? 'text-amber-600 dark:text-amber-500' : 'text-teal-600 dark:text-teal-400'}`}>
                      ${formData.amount ? parseFloat(formData.amount).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  {formData.description && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">{formData.description}</p>
                  )}
                  {formData.included_items.length > 0 && (
                    <div>
                      <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mb-2">What's Included:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {formData.included_items.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 break-words">{item}</li>
                        ))}
                        {formData.included_items.length > 3 && (
                          <li className="text-xs sm:text-sm text-teal-500">+{formData.included_items.length - 3} more items</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="w-full sm:flex-1 px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:flex-1 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create {formData.tier} Package
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPackage;