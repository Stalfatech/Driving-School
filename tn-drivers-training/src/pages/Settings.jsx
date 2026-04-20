import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, ShieldCheck, Mail, X, 
  Smartphone, CheckCircle, Slash, Plus, Edit3, Trash2,
  Loader2, AlertCircle
} from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

const Settings = () => {
  // ==================== STATE ====================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  

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
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ==================== FETCH DATA ====================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [locationsRes, templatesRes] = await Promise.all([
        axios.get(`${API_BASE}/locations`, { headers }),
        axios.get(`${API_BASE}/templates`, { headers })
      ]);

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

  

  // ==================== TAX REGIONS CRUD ====================
  const handleSaveRegion = async (e) => {
    e.preventDefault();
    setSaving(true);
    
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
        setMessage({ 
          type: 'success', 
          text: `Region ${editingRegion ? 'updated' : 'added'} successfully!` 
        });
        fetchData();
        closeTaxModal();
      }
    } catch (error) {
      console.error("Region save error:", error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save region' });
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
        setMessage({ type: 'success', text: 'Region deleted successfully!' });
        fetchData();
      }
    } catch (error) {
      console.error("Delete region error:", error);
      setMessage({ type: 'error', text: 'Failed to delete region' });
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
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`${API_BASE}/templates/${template.id}`, 
        { email_body: templateValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Template updated successfully!' });
        fetchData();
        setEditingTemplate(null);
      }
    } catch (error) {
      console.error("Update template error:", error);
      setMessage({ type: 'error', text: 'Failed to update template' });
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
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}
      
      {/* HEADER */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
              System <span className="text-teal-600 dark:text-teal-400">Rules</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Manage locations, tax compliance, and system permissions
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 overflow-x-hidden">
        <div className="max-w-[1800px] mx-auto space-y-6">
          
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
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{region.province || 'NL'}</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openTaxModal(region)} 
                        className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteRegion(region.id)} 
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Tax Type</p>
                      <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">{region['tax-type'] || 'HST'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Rate</p>
                      <p className="text-base font-bold text-slate-800 dark:text-white">{region.tax_rate}%</p>
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
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Region/City</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Tax Type</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Rate (%)</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {taxRegions.map((region) => (
                    <tr key={region.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800 dark:text-white">{region.province_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                          {region['tax-type'] || 'HST'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-base font-bold text-teal-600 dark:text-teal-400">{region.tax_rate}%</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openTaxModal(region)} 
                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="Edit Region"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteRegion(region.id)} 
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete Region"
                          >
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
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
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
              <PermissionCard 
                title="Full View / Edit" 
                admin={true} 
                instructor={false} 
                student={false} 
              />
              <PermissionCard 
                title="Manage Assigned Students" 
                admin={true} 
                instructor={true} 
                student={false} 
              />
              <PermissionCard 
                title="Book Lessons & Progress" 
                admin={true} 
                instructor={true} 
                student={true} 
              />
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">System Capability</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Admin</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Instructor</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Student</th>
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
    .map((template) => {
      // Determine icon based on template type
      const getIcon = () => {
        if (template.slug?.includes('welcome') || template.name?.toLowerCase().includes('welcome')) {
          return <Mail size={18} />;
        }
        if (template.slug?.includes('reminder') || template.name?.toLowerCase().includes('reminder')) {
          return <Smartphone size={18} />;
        }
        if (template.slug?.includes('activation') || template.name?.toLowerCase().includes('activation')) {
          return <Mail size={18} />;
        }
        return <Mail size={18} />;
      };

      // Determine template type for display
      const getTemplateType = () => {
        if (template.slug?.includes('email') || template.name?.toLowerCase().includes('email')) {
          return 'Email Template';
        }
        if (template.slug?.includes('sms') || template.name?.toLowerCase().includes('sms')) {
          return 'SMS Notification';
        }
        return 'Template';
      };

      return (
        <TemplateCard 
          key={template.id}
          icon={getIcon()}
          title={template.name}
          type={getTemplateType()}
          slug={template.slug}
          defaultVal={template.email_body}
          onEdit={() => openTemplateModal(template)}
        />
      );
    })}
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
                  {editingRegion ? 'Edit' : 'Add'} <span className="text-teal-600 dark:text-teal-400">Tax Region</span>
                </p>
                <p className="text-sm md:text-md lg:text-lg text-slate-700  dark:text-white mt-0.5">Configure local tax rates</p>
              </div>
              <button 
                onClick={closeTaxModal} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-white hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveRegion} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">City Name</label>
                <input 
                  required 
                  value={regionForm.city} 
                  onChange={(e) => setRegionForm({...regionForm, city: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm md:text-md lg:text-lg font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                  placeholder="e.g., St. John's"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tax Name</label>
                  <input 
                    required 
                    value={regionForm.taxName} 
                    onChange={(e) => setRegionForm({...regionForm, taxName: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                    placeholder="e.g., HST"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Rate (%)</label>
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
                <button 
                  type="button" 
                  onClick={closeTaxModal} 
                  className="flex-1 px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-red-500 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? 'Saving...' : 'Save Region'}
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
            Edit <span className="text-teal-600 dark:text-teal-400">Template</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{editingTemplate.name}</p>
        </div>
        <button 
          onClick={() => setEditingTemplate(null)} 
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-white hover:text-red-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {/* Placeholders Guide */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-teal-600">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Available Variables
              </span>
              <span className="text-[10px] text-slate-800 dark:text-white hover:text-teal-300">(Click to insert)</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {(() => {
                let placeholders = [];
                if (editingTemplate.slug?.includes('student_activation') || editingTemplate.name?.toLowerCase().includes('welcome')) {
                  placeholders = ['student_name', 'balance_due', 'package_name', ];
                } else if (editingTemplate.slug?.includes('instructor_student_assigned') || editingTemplate.name?.toLowerCase().includes('reminder')) {
                  placeholders = ['package_name', 'student_name', 'instructor_name'];
                }
                 else if (editingTemplate.slug?.includes('student_reschedule_request') || editingTemplate.name?.toLowerCase().includes('reminder')) {
                  placeholders = ['reason', 'pickup_location', 'requested_time','requested_date','current_time','current_date','student_name','instructor_name'];
                }
                else if (editingTemplate.slug?.includes('student_assignment_updated') || editingTemplate.name?.toLowerCase().includes('reminder')) {
                  placeholders = ['new_time', 'new_date', 'old_time', 'old_date','student_name','instructor_name'];
                }
                 else if (editingTemplate.slug?.includes('student_new_assignment') || editingTemplate.name?.toLowerCase().includes('reminder')) {
                  placeholders = ['pickup_location', 'topic', 'time', 'date','student_name','instructor_name'];
                } else {
                  placeholders = ['user_name', 'user_email'];
                }
                return placeholders.map((placeholder, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setTemplateValue(prev => prev + ` {${placeholder}} `);
                    }}
                    className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] md:text-sm font-soro text-slate-800 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-200 dark:border-indigo-800"
                  >
                    {`{${placeholder}}`}
                  </button>
                ));
              })()}
            </div>
            <p className="text-[9px] text-slate-500">
              Click any variable to insert it at cursor position. Variables will be replaced with actual data when sending.
            </p>
          </div>
          
          <textarea 
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-4 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none transition-all font-mono" 
            rows="10" 
            value={templateValue}
            onChange={(e) => setTemplateValue(e.target.value)}
          />
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setEditingTemplate(null)} 
              className="px-5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleUpdateTemplate(editingTemplate)}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
            >
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
  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
    <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</td>
    <td className="px-6 py-4 text-center">
      {admin ? <CheckCircle className="inline text-teal-500" size={18} /> : <Slash className="inline text-slate-300 dark:text-slate-600" size={14} />}
    </td>
    <td className="px-6 py-4 text-center">
      {instructor ? <CheckCircle className="inline text-teal-500" size={18} /> : <Slash className="inline text-slate-300 dark:text-slate-600" size={14} />}
    </td>
    <td className="px-6 py-4 text-center">
      {student ? <CheckCircle className="inline text-teal-500" size={18} /> : <Slash className="inline text-slate-300 dark:text-slate-600" size={14} />}
    </td>
  </tr>
);

const PermissionCard = ({ title, admin, instructor, student }) => (
  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
    <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">{title}</p>
    <div className="flex justify-around">
      <div className="text-center">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Admin</p>
        {admin ? <CheckCircle className="text-teal-500 mx-auto" size={18} /> : <Slash className="text-slate-300 dark:text-slate-600 mx-auto" size={14} />}
      </div>
      <div className="text-center">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Instructor</p>
        {instructor ? <CheckCircle className="text-teal-500 mx-auto" size={18} /> : <Slash className="text-slate-300 dark:text-slate-600 mx-auto" size={14} />}
      </div>
      <div className="text-center">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Student</p>
        {student ? <CheckCircle className="text-teal-500 mx-auto" size={18} /> : <Slash className="text-slate-300 dark:text-slate-600 mx-auto" size={14} />}
      </div>
    </div>
  </div>
);

const TemplateCard = ({ icon, title, type, slug, defaultVal, placeholders, onEdit }) => {
  const [templateValue, setTemplateValue] = useState(defaultVal);
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-teal-500">
            {icon}
          </div>
          <div>
            <p className="text-[10px] md:text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              {type}
            </p>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              {title}
            </h4>
            {slug && (
              <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {slug}
              </p>
            )}
          </div>
        </div>
        {placeholders && placeholders.length > 0 && (
          <button
            onClick={() => setShowPlaceholders(!showPlaceholders)}
            className="p-1.5 text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
            title="Available variables"
          >
            <span className="text-xs font-bold">{} {`{ }`}</span>
          </button>
        )}
      </div>
      <div className="p-5 space-y-4">
        {/* Placeholders Guide */}
        {showPlaceholders && placeholders && placeholders.length > 0 && (
          <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Available Variables
              </span>
              <span className="text-[8px] text-indigo-500">(Click to insert)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((placeholder, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTemplateValue(prev => prev + ` {${placeholder}} `);
                  }}
                  className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-mono text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-200 dark:border-indigo-800"
                >
                  {`{${placeholder}}`}
                </button>
              ))}
            </div>
            <p className="text-[8px] text-indigo-500 mt-2">
              Click any variable to insert it into the template
            </p>
          </div>
        )}
        
        <textarea 
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-4 dark:text-slate-200 outline-none resize-none transition-all font-mono cursor-not-allowed opacity-75" 
          rows="6" 
          value={templateValue}
          readOnly
          disabled
          onClick={() => {
            // Optional: Show a tooltip or message
            console.log("Click Edit Full Template to modify");
          }}
          placeholder="Click 'Edit Full Template' to modify content..."
        />
        {/* Quick tips */}
        <div className="text-[9px] text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
          <span className="font-semibold">💡 Tip:</span> Use {'{variable_name}'} to insert dynamic content. Available variables shown above.
        </div>
        
        <div className="flex justify-end gap-2">
          
          <button 
            onClick={() => {
              onEdit();
            }}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            Edit Full Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;