
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, ShieldCheck, Mail, Save, X, Eye, 
  Smartphone, CheckCircle, Slash, ChevronRight, Bell, Plus, Edit3, Trash2,
  Loader2, AlertCircle
} from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

const Settings = () => {
  // ==================== STATE ====================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

// Auto-clear message after 3 seconds
useEffect(() => {
  if (message.text) {
    const timer = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000); // 3 seconds

    return () => clearTimeout(timer); // Cleanup on unmount or when message changes
  }
}, [message]);


// Mobile permission card component
const PermissionCard = ({ label, admin, instructor, student }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
    <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-tight mb-3">
      {label}
    </p>
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="flex flex-col items-center">
        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Admin</div>
        {admin ? 
          <CheckCircle className="text-teal-500" size={18} /> : 
          <Slash className="text-slate-300 dark:text-slate-600" size={16} />
        }
      </div>
      <div className="flex flex-col items-center">
        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Instructor</div>
        {instructor ? 
          <CheckCircle className="text-teal-500" size={18} /> : 
          <Slash className="text-slate-300 dark:text-slate-600" size={16} />
        }
      </div>
      <div className="flex flex-col items-center">
        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Student</div>
        {student ? 
          <CheckCircle className="text-teal-500" size={18} /> : 
          <Slash className="text-slate-300 dark:text-slate-600" size={16} />
        }
      </div>
    </div>
  </div>
);
  
  // Locations State
  const [locations, setLocations] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationForm, setLocationForm] = useState({ 
    province_name: '', 
    tax_rate: 15, 
    'tax-type': 'HST' 
  });

  // Email Templates State
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    subject: '',
    email_body: '',
    sms_body: ''
  });
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  // Priority Areas (Postal Codes) - could be stored in DB later
  const [postalCodes, setPostalCodes] = useState(['V6B', 'V7C', 'M5V', 'H2X']);
  const [newCode, setNewCode] = useState('');

  // ==================== FETCH DATA ====================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch locations and templates in parallel
      const [locationsRes, templatesRes] = await Promise.all([
        axios.get(`${API_BASE}/locations`, { headers }),
        axios.get(`${API_BASE}/templates`, { headers })
      ]);

      if (locationsRes.data.success) {
        setLocations(locationsRes.data.data);
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

  // ==================== LOCATION CRUD ====================
  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      let response;
      if (editingLocation) {
        // Update
        response = await axios.put(`${API_BASE}/locations/${editingLocation.id}`, locationForm, { headers });
      } else {
        // Create
        response = await axios.post(`${API_BASE}/locations`, locationForm, { headers });
      }

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `Location ${editingLocation ? 'updated' : 'created'} successfully!` 
        });
        fetchData(); // Refresh data
        closeLocationModal();
      }
    } catch (error) {
      console.error("Location save error:", error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save location' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.delete(`${API_BASE}/locations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Location deleted successfully!' });
        fetchData();
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete location' 
      });
    }
  };

  const openLocationModal = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setLocationForm({
        province_name: location.province_name,
        tax_rate: location.tax_rate,
        'tax-type': location['tax-type'] || 'HST'
      });
    } else {
      setEditingLocation(null);
      setLocationForm({ province_name: '', tax_rate: 15, 'tax-type': 'HST' });
    }
    setShowLocationModal(true);
  };

  const closeLocationModal = () => {
    setShowLocationModal(false);
    setEditingLocation(null);
  };

  // ==================== EMAIL TEMPLATE CRUD ====================
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTemplateForm({
      subject: template.subject,
      email_body: template.email_body,
      sms_body: template.sms_body || ''
    });
    setShowTemplateModal(true);
  };

  const handleTemplateUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setTemplateLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`${API_BASE}/templates/${selectedTemplate.id}`, templateForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Template updated successfully!' });
        fetchData(); // Refresh templates
        setShowTemplateModal(false);
      }
    } catch (error) {
      console.error("Template update error:", error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update template' 
      });
    } finally {
      setTemplateLoading(false);
    }
  };

  // ==================== POSTAL CODES ====================
  const addPostalCode = () => {
    if (newCode && !postalCodes.includes(newCode.toUpperCase())) {
      setPostalCodes([...postalCodes, newCode.toUpperCase()]);
      setNewCode('');
    }
  };

  const removeCode = (code) => {
    setPostalCodes(postalCodes.filter(c => c !== code));
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={40} />
          <p className="text-slate-500 font-bold">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* HEADER */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
        <div className="flex items-center gap-2 text-sm overflow-hidden">
          <span className="text-slate-400 font-medium hidden xs:inline">Settings</span>
          <ChevronRight size={14} className="text-slate-300 hidden xs:inline" />
          <span className="text-slate-800 dark:text-white font-bold uppercase text-[10px] tracking-widest truncate">Configuration</span>
        </div>
      </header>

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

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
              System <span className="text-teal-500">Configuration</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">Manage locations, tax rates, and email templates.</p>
          </div>

          {/* LOCATIONS SECTION */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-11 rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">Locations & Tax Rates</h3>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Manage provinces and HST/GST rates</p>
                </div>
              </div>
              <button 
                onClick={() => openLocationModal()}
                className="bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-xl transition-all shadow-lg"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-50 dark:border-slate-800">
                      <th className="pb-4">Province</th>
                      <th className="pb-4">Tax Type</th>
                      <th className="pb-4">Rate (%)</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {locations.length > 0 ? (
                      locations.map((location) => (
                        <tr key={location.id} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          <td className="py-4 font-black">{location.province_name}</td>
                          <td className="py-4">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-[9px] uppercase">
                              {location['tax-type'] || 'HST'}
                            </span>
                          </td>
                          <td className="py-4">{location.tax_rate}%</td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => openLocationModal(location)} 
                                className="p-2 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg"
                                title="Edit"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteLocation(location.id)} 
                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-500">
                          No locations found. Click the + button to add one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* EMAIL TEMPLATES SECTION */}
<section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
  <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
    <div className="flex items-center gap-4">
      <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
        <Mail size={20} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">Email Templates</h3>
        <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Manage automated emails</p>
      </div>
    </div>
  </div>

  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
    {templates.length > 0 ? (
      // Filter out payment-related templates
      templates.filter(template => {
        const slug = template.slug?.toLowerCase() || '';
        const name = template.name?.toLowerCase() || '';
        // Exclude any template that has 'payment' in slug or name
        return !slug.includes('payment') && !name.includes('payment');
      }).map((template) => (
        <TemplateCard 
          key={template.id}
          template={template}
          onEdit={() => handleTemplateSelect(template)}
        />
      ))
    ) : (
      <div className="col-span-2 text-center py-8 text-slate-500">
        No email templates found.
      </div>
    )}
    
    {/* Show message if all templates are filtered out */}
    {templates.length > 0 && templates.filter(t => 
      !t.slug?.includes('payment') && !t.name?.toLowerCase().includes('payment')
    ).length === 0 && (
      <div className="col-span-2 text-center py-8 text-slate-500">
        No editable templates available.
      </div>
    )}
  </div>
</section>

          {/* PERMISSIONS MATRIX (Static for now) */}
          {/* PERMISSIONS MATRIX */}
<section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
  <div className="p-5 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
    <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
      <ShieldCheck size={20} />
    </div>
    <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">Permissions Matrix</h3>
  </div>
  
  {/* Mobile View - Card Layout (visible on small screens) */}
  <div className="block md:hidden p-6 space-y-4">
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5">
      <div className="grid grid-cols-3 gap-2 mb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
        <div className="col-span-1"></div>
        <div>Admin</div>
        <div>Instructor</div>
        <div>Student</div>
      </div>
      
      <div className="space-y-4">
        <PermissionCard label="Full System Access" admin={true} instructor={false} student={false} />
        <PermissionCard label="Manage Assigned Students" admin={true} instructor={true} student={false} />
        <PermissionCard label="Book Lessons & Track Progress" admin={true} instructor={true} student={true} />
        <PermissionCard label="Submit Expenses" admin={true} instructor={true} student={false} />
        <PermissionCard label="View Payment History" admin={true} instructor={false} student={true} />
      </div>
    </div>
  </div>

  {/* Desktop View - Table Layout (visible on medium screens and above) */}
  <div className="hidden md:block overflow-x-auto text-xs">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-50/50 dark:bg-slate-900 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
          <th className="px-8 py-5">System Capability</th>
          <th className="px-6 py-5 text-center">Admin</th>
          <th className="px-6 py-5 text-center">Instructor</th>
          <th className="px-6 py-5 text-center">Student</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
        <PermissionRow label="Full System Access" admin={true} instructor={false} student={false} />
        <PermissionRow label="Manage Assigned Students" admin={true} instructor={true} student={false} />
        <PermissionRow label="Book Lessons & Track Progress" admin={true} instructor={true} student={true} />
        <PermissionRow label="Submit Expenses" admin={true} instructor={true} student={false} />
        <PermissionRow label="View Payment History" admin={true} instructor={false} student={true} />
      </tbody>
    </table>
  </div>
</section>
        </div>
      </main>

      {/* LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
            <div className="p-8 bg-teal-500 text-white">
              <h3 className="text-xl font-black uppercase italic">
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h3>
              <p className="text-xs font-bold opacity-80">Configure province tax rates</p>
            </div>
            <form onSubmit={handleLocationSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">
                  Province Name
                </label>
                <input 
                  required 
                  value={locationForm.province_name} 
                  onChange={(e) => setLocationForm({...locationForm, province_name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3 dark:text-white font-bold"
                  placeholder="e.g., Ontario"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">
                    Tax Type
                  </label>
                  <select
                    value={locationForm['tax-type']}
                    onChange={(e) => setLocationForm({...locationForm, 'tax-type': e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3 dark:text-white font-bold"
                  >
                    <option value="HST">HST</option>
                    <option value="GST">GST</option>
                    <option value="PST">PST</option>
                    <option value="QST">QST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">
                    Rate (%)
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="100"
                    required 
                    value={locationForm.tax_rate} 
                    onChange={(e) => setLocationForm({...locationForm, tax_rate: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3 dark:text-white font-bold"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={closeLocationModal} 
                  className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 bg-teal-500 text-white rounded-2xl font-black shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving...' : (editingLocation ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPLATE EDIT MODAL */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 bg-indigo-500 text-white">
              <h3 className="text-xl font-black uppercase italic">Edit Template</h3>
              <p className="text-xs font-bold opacity-80">{selectedTemplate.name}</p>
            </div>
            <form onSubmit={handleTemplateUpdate} className="p-8 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">
                  Subject Line
                </label>
                <input 
                  required 
                  value={templateForm.subject} 
                  onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">
                  Email Body (HTML supported)
                </label>
                <textarea 
                  required 
                  rows="8"
                  value={templateForm.email_body} 
                  onChange={(e) => setTemplateForm({...templateForm, email_body: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3 dark:text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">
                  SMS Body (Optional)
                </label>
                <textarea 
                  rows="3"
                  value={templateForm.sms_body} 
                  onChange={(e) => setTemplateForm({...templateForm, sms_body: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3 dark:text-white font-bold"
                />
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl">
                <p className="text-[9px] font-black text-indigo-600 uppercase mb-2">Available Placeholders</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.placeholders?.split(',').map((p, i) => (
                    <span key={i} className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-[8px] font-mono">
                      {p.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowTemplateModal(false)} 
                  className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={templateLoading}
                  className="flex-1 bg-indigo-500 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {templateLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {templateLoading ? 'Updating...' : 'Update Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== HELPER COMPONENTS ====================

const PermissionRow = ({ label, admin, instructor, student }) => (
  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
    <td className="px-8 py-5 font-bold text-slate-800 dark:text-white uppercase tracking-tight">{label}</td>
    <td className="px-6 py-5 text-center">
      {admin ? <CheckCircle className="inline text-teal-500" size={18}/> : <Slash className="inline text-slate-200 dark:text-slate-800" size={16}/>}
    </td>
    <td className="px-6 py-5 text-center">
      {instructor ? <CheckCircle className="inline text-teal-500" size={18}/> : <Slash className="inline text-slate-200 dark:text-slate-800" size={16}/>}
    </td>
    <td className="px-6 py-5 text-center">
      {student ? <CheckCircle className="inline text-teal-500" size={18}/> : <Slash className="inline text-slate-200 dark:text-slate-800" size={16}/>}
    </td>
  </tr>
);

const TemplateCard = ({ template, onEdit }) => {
  const getIcon = () => {
    if (template.slug.includes('student')) return <Mail size={18} />;
    if (template.slug.includes('instructor')) return <Smartphone size={18} />;
    return <Bell size={18} />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
        <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm text-indigo-500">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
            {template.slug}
          </h3>
          <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase italic truncate">
            {template.name}
          </h4>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
          {template.subject}
        </p>
        <div className="flex justify-end">
          <button 
            onClick={onEdit}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2"
          >
            <Edit3 size={12} /> Edit Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;