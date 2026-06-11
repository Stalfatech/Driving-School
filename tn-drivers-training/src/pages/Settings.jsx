
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, ShieldCheck, Mail, X, Building, 
  Smartphone, CheckCircle, Slash, Plus, Edit3, Trash2,
  Loader2, AlertCircle, Save, Globe, Phone, MapPin as MapPinIcon,
  AtSign, CreditCard
} from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

// ==================== REUSABLE FIELD COMPONENT ====================
const Field = ({ label, name, type = "text", value, onChange, error, required = false, placeholder = "", rows = 3 }) => {
  const [touched, setTouched] = useState(false);
  
  const handleChange = (e) => {
    onChange(e);
    // Clear error when user types
    if (error && touched) {
      // Error will be cleared by parent via onChange
    }
  };
  
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
        {label}
        {required && !value && <span className="text-red-500 text-base ml-1">*</span>}
        {required && value && <span className="text-green-500 text-xs ml-1">✓</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          rows={rows}
          className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium outline-none transition-all resize-none ${
            error && touched 
              ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
              : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
          } dark:text-white`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border text-sm font-medium outline-none transition-all ${
            error && touched 
              ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
              : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
          } dark:text-white`}
          placeholder={placeholder}
        />
      )}
      {error && touched && (
        <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
      )}
    </div>
  );
};

// ==================== COMPANY DETAILS COMPONENT ====================
const CompanyDetailsSection = ({ companyData, onUpdate, saving, showNotification }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    company_city: '',
    company_province: '',
    company_postal_code: '',
    company_email: '',
    company_phone: '',
    payment_instructions: ''
  });
  const [errors, setErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (companyData) {
      setFormData({
        company_name: companyData.company_name || '',
        company_address: companyData.company_address || '',
        company_city: companyData.company_city || '',
        company_province: companyData.company_province || '',
        company_postal_code: companyData.company_postal_code || '',
        company_email: companyData.company_email || '',
        company_phone: companyData.company_phone || '',
        payment_instructions: companyData.payment_instructions || ''
      });
      if (companyData.company_logo) {
        setLogoPreview(`${API_BASE.replace('/api', '')}/storage/${companyData.company_logo}`);
      }
    }
  }, [companyData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showNotification('error', 'Logo file must be less than 2MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showNotification('error', 'Only JPG, PNG, or WEBP images are allowed');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.company_name.trim()) newErrors.company_name = "Company name is required";
    if (!formData.company_address.trim()) newErrors.company_address = "Company address is required";
    if (!formData.company_city.trim()) newErrors.company_city = "City is required";
    if (!formData.company_province.trim()) newErrors.company_province = "Province is required";
    if (!formData.company_postal_code.trim()) newErrors.company_postal_code = "Postal code is required";
    if (!formData.company_email.trim()) {
      newErrors.company_email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)) {
      newErrors.company_email = "Invalid email format";
    }
    if (!formData.company_phone.trim()) newErrors.company_phone = "Phone number is required";
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Frontend validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showNotification('warning', 'Please fill in all required fields correctly');
      return;
    }
    
    // Prepare FormData for file upload
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    if (logoFile) {
      submitData.append('company_logo', logoFile);
    }
    
    await onUpdate(submitData, () => {
      setIsEditing(false);
      setLogoFile(null);
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setLogoFile(null);
    if (companyData) {
      setFormData({
        company_name: companyData.company_name || '',
        company_address: companyData.company_address || '',
        company_city: companyData.company_city || '',
        company_province: companyData.company_province || '',
        company_postal_code: companyData.company_postal_code || '',
        company_email: companyData.company_email || '',
        company_phone: companyData.company_phone || '',
        payment_instructions: companyData.payment_instructions || ''
      });
      if (companyData.company_logo) {
        setLogoPreview(`${API_BASE.replace('/api', '')}/storage/${companyData.company_logo}`);
      }
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-50/50 to-transparent dark:from-teal-900/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Building size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Company Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Business information for invoices</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Edit3 size={14} /> Edit Company Info
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo Display */}
            <div className="flex-shrink-0 text-center">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Company Logo" 
                  className="w-24 h-24 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm mx-auto"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 mx-auto">
                  <Building size={32} className="text-slate-400" />
                </div>
              )}
            </div>
            
            {/* Company Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company Name</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white mt-1">{formData.company_name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white mt-1 break-all">{formData.company_email || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white mt-1">{formData.company_phone || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Address</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white mt-1">{formData.company_address || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">City</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white mt-1">{formData.company_city || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Province</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white mt-1">{formData.company_province || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Postal Code</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white mt-1">{formData.company_postal_code || 'Not set'}</p>
              </div>
            </div>
          </div>
          
          {formData.payment_instructions && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Payment Instructions</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{formData.payment_instructions}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-50/50 to-transparent dark:from-teal-900/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Building size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Edit Company Details</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Update your business information</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
        {/* Logo Upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Company Logo</label>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img src={logoPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200">
                <Building size={24} className="text-slate-400" />
              </div>
            )}
            <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors">
              Upload Logo
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoChange} className="hidden" />
            </label>
          </div>
        </div>
        
        <Field 
          label="Company Name" name="company_name" value={formData.company_name} 
          onChange={handleInputChange} error={errors.company_name} required 
          placeholder="Terra Nova Driving School"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field 
            label="Email" name="company_email" type="email" value={formData.company_email} 
            onChange={handleInputChange} error={errors.company_email} required 
            placeholder="info@terranovadriverstraining.ca"
          />
          <Field 
            label="Phone" name="company_phone" type="tel" value={formData.company_phone} 
            onChange={handleInputChange} error={errors.company_phone} required 
            placeholder="(555) 123-4567"
          />
        </div>
        
        <Field 
          label="Street Address" name="company_address" value={formData.company_address} 
          onChange={handleInputChange} error={errors.company_address} required 
          placeholder="123 Learning Way, Suite 100"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field 
            label="City" name="company_city" value={formData.company_city} 
            onChange={handleInputChange} error={errors.company_city} required 
            placeholder="Toronto"
          />
          <Field 
            label="Province" name="company_province" value={formData.company_province} 
            onChange={handleInputChange} error={errors.company_province} required 
            placeholder="ON"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field 
            label="Postal Code" name="company_postal_code" value={formData.company_postal_code} 
            onChange={handleInputChange} error={errors.company_postal_code} required 
            placeholder="M4B 1B3"
          />
        </div>
        
        <Field 
          label="Payment Instructions" name="payment_instructions" type="textarea" rows={4}
          value={formData.payment_instructions} onChange={handleInputChange} error={errors.payment_instructions} 
          placeholder="Send e-Transfer to info@terranovadriverstraining.ca. Auto-deposit enabled. Please include your full name in the notes."
        />
        
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={handleCancel} className="flex-1 px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ==================== MAIN SETTINGS COMPONENT ====================
const Settings = () => {
  // ==================== STATE ====================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [companyData, setCompanyData] = useState(null);
  
  // Tax Regions State
  const [taxRegions, setTaxRegions] = useState([]);
  
  // Template State
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateValue, setTemplateValue] = useState('');
  
  // Modal State
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [regionForm, setRegionForm] = useState({ city: '', province: 'NL', taxName: 'HST', rate: 15 });

  // Auto-clear message
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showNotification = (type, text) => {
    setMessage({ type, text });
  };

  // ==================== FETCH DATA ====================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [companyRes, locationsRes, templatesRes] = await Promise.all([
        axios.get(`${API_BASE}/company-settings`, { headers }),
        axios.get(`${API_BASE}/locations`, { headers }),
        axios.get(`${API_BASE}/templates`, { headers })
      ]);

      if (companyRes.data.success) {
        setCompanyData(companyRes.data.data);
      }

      if (locationsRes.data.success) {
        setTaxRegions(locationsRes.data.data);
      }

      if (templatesRes.data.success) {
        setTemplates(templatesRes.data.data);
      }

    } catch (error) {
      console.error("Fetch error:", error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  // ==================== COMPANY SETTINGS CRUD ====================
  const handleUpdateCompany = async (formData, onSuccess) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_BASE}/company-settings`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setCompanyData(response.data.data);
        showNotification('success', 'Company settings updated successfully!');
        onSuccess();
      }
    } catch (error) {
      console.error("Update company error:", error);
      
      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors;
        // These will be handled by the form's validation
        showNotification('warning', 'Please check the highlighted fields');
      } else if (error.response?.status >= 500) {
        showNotification('error', 'A server error occurred. Please try again.');
      } else if (error.response?.status === 401) {
        showNotification('error', 'Your session has expired. Please log in again.');
      } else {
        showNotification('error', error.response?.data?.message || 'Failed to update company settings');
      }
    } finally {
      setSaving(false);
    }
  };

  // ==================== TAX REGIONS CRUD ====================
  const handleSaveRegion = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const regionData = {
        province_name: regionForm.city,
        tax_rate: parseFloat(regionForm.rate),
        'tax-type': regionForm.taxName
      };
      
      let response;
      if (editingRegion) {
        response = await axios.put(`${API_BASE}/locations/${editingRegion.id}`, regionData, { headers });
      } else {
        response = await axios.post(`${API_BASE}/locations`, regionData, { headers });
      }
      
      if (response.data.success) {
        showNotification('success', `Region ${editingRegion ? 'updated' : 'added'} successfully!`);
        fetchData();
        closeTaxModal();
      }
    } catch (error) {
      console.error("Region save error:", error);
      
      if (error.response?.status === 422) {
        showNotification('warning', 'Please check the form fields');
      } else if (error.response?.status >= 500) {
        showNotification('error', 'A server error occurred. Please try again.');
      } else if (error.response?.status === 401) {
        showNotification('error', 'Your session has expired. Please log in again.');
      } else {
        showNotification('error', error.response?.data?.message || 'Failed to save region');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRegion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this region?')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.delete(`${API_BASE}/locations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showNotification('success', 'Region deleted successfully!');
        fetchData();
      }
    } catch (error) {
      console.error("Delete region error:", error);
      showNotification('error', 'Failed to delete region');
    }
  };

  const openTaxModal = (region = null) => {
    if (region) {
      setEditingRegion(region);
      setRegionForm({ 
        city: region.province_name, 
        province: 'NL', 
        taxName: region['tax-type'] || 'HST', 
        rate: region.tax_rate 
      });
    } else {
      setEditingRegion(null);
      setRegionForm({ city: '', province: 'NL', taxName: 'HST', rate: 15 });
    }
    setShowTaxModal(true);
  };

  const closeTaxModal = () => {
    setShowTaxModal(false);
    setEditingRegion(null);
  };

  // ==================== TEMPLATES ====================
  const handleUpdateTemplate = async (template) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`${API_BASE}/templates/${template.id}`, 
        { email_body: templateValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showNotification('success', 'Template updated successfully!');
        fetchData();
        setEditingTemplate(null);
      }
    } catch (error) {
      console.error("Update template error:", error);
      
      if (error.response?.status >= 500) {
        showNotification('error', 'A server error occurred. Please try again.');
      } else if (error.response?.status === 401) {
        showNotification('error', 'Your session has expired. Please log in again.');
      } else {
        showNotification('error', error.response?.data?.message || 'Failed to update template');
      }
    } finally {
      setSaving(false);
    }
  };

  const openTemplateModal = (template) => {
    setEditingTemplate(template);
    setTemplateValue(template.email_body);
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={40} />
          <p className="text-sm text-slate-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      
      {/* Message Alert */}
      {message.text && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-4 duration-300 ${
          message.type === 'success' ? 'bg-green-500 text-white' : 
          message.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-2 hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* HEADER */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
              System <span className="text-teal-600 dark:text-teal-400">Settings</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Manage company details, tax compliance, and email templates
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 overflow-x-hidden">
        <div className="max-w-[1800px] mx-auto space-y-6">
          
          {/* COMPANY DETAILS SECTION */}
          <CompanyDetailsSection 
            companyData={companyData}
            onUpdate={handleUpdateCompany}
            saving={saving}
            showNotification={showNotification}
          />

          {/* TAX COMPLIANCE SECTION */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
                  $
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tax Compliance</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">GST/HST Regional Rates</p>
                </div>
              </div>
              <button 
                onClick={() => openTaxModal()}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={14} /> Add Region
              </button>
            </div>
            
            {/* Mobile Card View */}
            <div className="block md:hidden p-5 space-y-3">
              {taxRegions.map((region) => (
                <div key={region.id} className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-base font-bold text-slate-800 dark:text-white">{region.province_name}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openTaxModal(region)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDeleteRegion(region.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Tax Type</p>
                      <p className="text-sm font-semibold text-teal-600">{region['tax-type'] || 'HST'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Rate</p>
                      <p className="text-base font-bold text-slate-800">{region.tax_rate}%</p>
                    </div>
                  </div>
                </div>
              ))}
              {taxRegions.length === 0 && (
                <div className="text-center py-8 text-slate-500">No tax regions configured</div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Region/City</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Tax Type</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Rate (%)</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {taxRegions.map((region) => (
                    <tr key={region.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">{region.province_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-600">
                          {region['tax-type'] || 'HST'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-base font-bold text-teal-600">{region.tax_rate}%</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openTaxModal(region)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDeleteRegion(region.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PERMISSIONS MATRIX */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Permissions Matrix</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Role-based access control</p>
                </div>
              </div>
            </div>
            
            {/* Mobile Card View */}
            <div className="block md:hidden p-5 space-y-3">
              <PermissionCard title="Full View / Edit" admin={true} instructor={false} student={false} />
              <PermissionCard title="Manage Assigned Students" admin={true} instructor={true} student={false} />
              <PermissionCard title="Book Lessons & Progress" admin={true} instructor={true} student={true} />
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">System Capability</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Admin</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Instructor</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Student</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <PermissionRow label="Full View / Edit" admin instructor={false} student={false} />
                  <PermissionRow label="Manage Assigned Students" admin instructor student={false} />
                  <PermissionRow label="Book Lessons & Progress" admin instructor student />
                </tbody>
              </table>
            </div>
          </div>

          {/* TEMPLATES GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates
              .filter(template => {
                const slug = template.slug?.toLowerCase() || '';
                const name = template.name?.toLowerCase() || '';
                return !slug.includes('payment') && !name.includes('payment');
              })
              .map((template) => (
                <TemplateCard 
                  key={template.id}
                  title={template.name}
                  slug={template.slug}
                  defaultVal={template.email_body}
                  onEdit={() => openTemplateModal(template)}
                  placeholders={getPlaceholdersForTemplate(template.slug)}
                />
              ))}
          </div>
        </div>
      </main>

      {/* TAX MODAL */}
      {showTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                  {editingRegion ? 'Edit' : 'Add'} <span className="text-teal-600">Tax Region</span>
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">Configure local tax rates</p>
              </div>
              <button onClick={closeTaxModal} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-red-500 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveRegion} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  City Name {!regionForm.city && <span className="text-red-500">*</span>}
                </label>
                <input 
                  required 
                  value={regionForm.city} 
                  onChange={(e) => setRegionForm({...regionForm, city: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                  placeholder="e.g., St. John's"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Tax Name {!regionForm.taxName && <span className="text-red-500">*</span>}
                  </label>
                  <input 
                    required 
                    value={regionForm.taxName} 
                    onChange={(e) => setRegionForm({...regionForm, taxName: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                    placeholder="e.g., HST"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Rate (%) {String(regionForm.rate).trim() === '' && <span className="text-red-500">*</span>}
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    required 
                    value={regionForm.rate} 
                    onChange={(e) => setRegionForm({...regionForm, rate: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                    placeholder="15"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeTaxModal} className="flex-1 px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-500 font-semibold text-sm hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? (editingRegion ? 'Updating...' : 'Saving...') : (editingRegion ? 'Update Region' : 'Save Region')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPLATE EDIT MODAL */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Edit <span className="text-teal-600">Template</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{editingTemplate.name}</p>
              </div>
              <button onClick={() => setEditingTemplate(null)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-red-500 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Available Variables</span>
                    <span className="text-[10px] text-slate-500">(Click to insert)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getPlaceholdersForTemplate(editingTemplate.slug).map((placeholder, i) => (
                      <button
                        key={i}
                        onClick={() => setTemplateValue(prev => prev + ` {${placeholder}} `)}
                        className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-mono text-indigo-600 hover:bg-indigo-100 transition-colors border border-indigo-200"
                      >
                        {`{${placeholder}}`}
                      </button>
                    ))}
                  </div>
                  <p className="text-[8px] text-slate-500">Click any variable to insert it at cursor position.</p>
                </div>
                
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-4 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none transition-all font-mono" 
                  rows="12" 
                  value={templateValue}
                  onChange={(e) => setTemplateValue(e.target.value)}
                />
                
                <div className="flex justify-end gap-3">
                  <button onClick={() => setEditingTemplate(null)} className="px-5 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:text-red-500 hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                  <button onClick={() => handleUpdateTemplate(editingTemplate)} disabled={saving} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2">
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    Update Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== HELPER COMPONENTS ====================
const PermissionRow = ({ label, admin, instructor, student }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="px-6 py-4 text-sm font-medium text-slate-700">{label}</td>
    <td className="px-6 py-4 text-center">
      {admin ? <CheckCircle className="inline text-teal-500" size={18} /> : <Slash className="inline text-slate-300" size={14} />}
    </td>
    <td className="px-6 py-4 text-center">
      {instructor ? <CheckCircle className="inline text-teal-500" size={18} /> : <Slash className="inline text-slate-300" size={14} />}
    </td>
    <td className="px-6 py-4 text-center">
      {student ? <CheckCircle className="inline text-teal-500" size={18} /> : <Slash className="inline text-slate-300" size={14} />}
    </td>
  </tr>
);

const PermissionCard = ({ title, admin, instructor, student }) => (
  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
    <p className="text-sm font-bold text-slate-800 mb-3">{title}</p>
    <div className="flex justify-around">
      <div className="text-center">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Admin</p>
        {admin ? <CheckCircle className="text-teal-500 mx-auto" size={18} /> : <Slash className="text-slate-300 mx-auto" size={14} />}
      </div>
      <div className="text-center">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Instructor</p>
        {instructor ? <CheckCircle className="text-teal-500 mx-auto" size={18} /> : <Slash className="text-slate-300 mx-auto" size={14} />}
      </div>
      <div className="text-center">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Student</p>
        {student ? <CheckCircle className="text-teal-500 mx-auto" size={18} /> : <Slash className="text-slate-300 mx-auto" size={14} />}
      </div>
    </div>
  </div>
);

const TemplateCard = ({ title, slug, defaultVal, onEdit, placeholders }) => {
  const [templateValue, setTemplateValue] = useState(defaultVal);
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-teal-500">
            <Mail size={18} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">Email Template</p>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h4>
            {slug && <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{slug}</p>}
          </div>
        </div>
        {placeholders && placeholders.length > 0 && (
          <button
            onClick={() => setShowPlaceholders(!showPlaceholders)}
            className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
            title="Available variables"
          >
            <span className="text-xs font-bold">{} {`{ }`}</span>
          </button>
        )}
      </div>
      <div className="p-5 space-y-4">
        {showPlaceholders && placeholders && placeholders.length > 0 && (
          <div className="mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Available Variables</span>
              <span className="text-[8px] text-indigo-500">(Click to insert)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((placeholder, i) => (
                <button
                  key={i}
                  onClick={() => setTemplateValue(prev => prev + ` {${placeholder}} `)}
                  className="px-2 py-1 bg-white rounded-lg text-[10px] font-mono text-indigo-600 hover:bg-indigo-100 transition-colors border border-indigo-200"
                >
                  {`{${placeholder}}`}
                </button>
              ))}
            </div>
            <p className="text-[8px] text-indigo-500 mt-2">Click any variable to insert it into the template</p>
          </div>
        )}
        
        <textarea 
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-4 dark:text-slate-200 outline-none resize-none transition-all font-mono cursor-not-allowed opacity-75" 
          rows="6" 
          value={templateValue}
          readOnly
          disabled
          placeholder="Click 'Edit Full Template' to modify content..."
        />
        
        <div className="flex justify-end">
          <button onClick={onEdit} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm">
            Edit Full Template
          </button>
        </div>
      </div>
    </div>
  );
};

const getPlaceholdersForTemplate = (slug) => {
  const placeholderMap = {
    'student_activation': ['student_name', 'balance_due', 'package_name'],
    'student_new_assignment': ['pickup_location', 'topic', 'time', 'date', 'student_name', 'instructor_name'],
    'student_assignment_updated': ['new_time', 'new_date', 'old_time', 'old_date', 'student_name', 'instructor_name'],
    'student_reschedule_request': ['reason', 'pickup_location', 'requested_time', 'requested_date', 'current_time', 'current_date', 'student_name', 'instructor_name'],
    'instructor_student_assigned': ['package_name', 'student_name', 'instructor_name'],
    'deposit_invoice': ['student_name', 'student_email', 'student_address', 'package_name', 'total_amount', 'amount_paid', 'balance_due', 'invoice_number', 'invoice_date', 'company_name', 'company_address', 'company_city', 'company_province', 'company_postal_code', 'company_email', 'company_phone']
  };
  
  return placeholderMap[slug] || ['user_name', 'user_email'];
};

export default Settings;