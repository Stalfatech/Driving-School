import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle, Loader2, User, FileText, Globe, Cake, Calendar, Phone, Mail, MapPin, Home, AlertCircle } from 'lucide-react';

const ApplicationReviewModal = ({ studentId, onClose, onRefresh }) => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState(null);
    const [onboarding, setOnboarding] = useState({ packages: [], instructors: [] });
    const [age, setAge] = useState(null);
    const [error, setError] = useState(null);
    
    const [selectedPackage, setSelectedPackage] = useState('');
    const [selectedInstructor, setSelectedInstructor] = useState('');

    // Calculate age from DOB
    const calculateAge = (dob) => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        console.log("Modal opened with studentId:", studentId);
        if (studentId) {
            fetchDetails();
        }
    }, [studentId]);

    const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('access_token');
            const headers = { Authorization: `Bearer ${token}` };

            console.log("Fetching student details for ID:", studentId);
            
            // 1. Fetch Student first
            const studentRes = await axios.get(`http://127.0.0.1:8000/api/students/${studentId}`, { headers });
            console.log("Student API Response:", studentRes.data);
            
            const student = studentRes.data.data;
            
            // Calculate age from DOB
            const studentAge = calculateAge(student.dob);
            setAge(studentAge);
            
            // 2. SET DATA IMMEDIATELY
            setData(student);
            setSelectedPackage(student.package_id || '');

            // 3. Fetch onboarding data based on location
            const onboardingRes = await axios.get(
                `http://127.0.0.1:8000/api/students/onboarding-data?location_id=${student.province}`, 
                { headers }
            );
            
            console.log("Onboarding API Response:", onboardingRes.data);
            setOnboarding(onboardingRes.data);
        } catch (error) {
            console.error("Error fetching modal data:", error);
            console.error("Error details:", error.response?.data);
            setError(error.response?.data?.message || "Failed to load student data");
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('access_token');
            await axios.post(`http://127.0.0.1:8000/api/students/${studentId}/activate`, {
                package_id: selectedPackage,
                instructor_id: selectedInstructor
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Student activated! Notifications sent.");
            if (onRefresh) onRefresh();
            onClose();
        } catch (error) {
            console.error("Activation error:", error.response?.data);
            alert(error.response?.data?.error || "Activation failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 transition-all">
            <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
                
                {/* Header */}
                <div className="px-6 py-5 sm:px-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                            Application Review
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Verify student details and assign a professional instructor.
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-200 dark:border-slate-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="animate-spin text-teal-500" size={40} />
                            <p className="text-sm font-medium text-slate-500">Retrieving student profile...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <AlertCircle className="text-red-500" size={40} />
                            <p className="text-sm font-medium text-slate-500">{error}</p>
                            <button 
                                onClick={fetchDetails}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : !data ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <AlertCircle className="text-amber-500" size={40} />
                            <p className="text-sm font-medium text-slate-500">No student data available</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* PRINTABLE AREA */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16" id="printable-area">
                                
                                {/* SECTION 1: PERSONAL PROFILE */}
                                <section>
                                    <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                                        <User size={16} /> Personal Profile
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.user?.name || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1"><Mail size={12} /> Email</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                                {data.user?.email || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1"><Phone size={12} /> Phone</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                                {data.user?.phone || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1"><Cake size={12} /> Date of Birth</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.dob ? new Date(data.dob).toLocaleDateString() : 'N/A'} 
                                                {age && <span className="ml-2 text-xs text-teal-600">({age} years)</span>}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1"><Home size={12} /> Street Address</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.street_address || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Apartment</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.appartment || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">City</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.city || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1"><MapPin size={12} /> Location</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.province_text || data.province || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Postal Code</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                                {data.postal_code || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                {/* SECTION 2: REGISTRATION DETAILS */}
                                <section>
                                    <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                                        <FileText size={16} /> Registration Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20 mb-4 flex justify-between items-center">
                                            <span className="text-sm font-bold text-amber-800 dark:text-amber-400">Applied Package</span>
                                            <span className="text-base font-bold text-amber-600">{data.package?.package_name || 'Not Assigned'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Parent/Guardian</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.parent_name || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Parent Email</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                                {data.parent_email || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Parent Phone</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                                {data.parent_phone || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Permit Number</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                                {data.permit_number || 'NOT PROVIDED'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1"><Calendar size={12} /> Permit Issue Date</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.permit_issue_date || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Experience Level</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.experience || 'Beginner'}
                                            </span>
                                        </div>
                                        {data.additional_notes && (
                                            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Additional Notes</span>
                                                <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 max-w-[60%] text-right">
                                                    {data.additional_notes}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* SECTION 3: FOREIGN LICENCE */}
                                <section className="lg:col-span-2 pt-4">
                                    <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
                                        <Globe size={16} /> Foreign Licence Profile
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
                                        <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase mb-1">Has Foreign Licence?</span>
                                            <span className={`text-sm sm:text-base font-semibold ${data.has_foreign_license ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {data.has_foreign_license ? 'YES' : 'NO'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase mb-1">Licence Number</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                                {data.foreign_license_number || '—'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase mb-1">Country</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.foreign_country || '—'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase mb-1">Street Address</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.foreign_street_address || '—'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase mb-1">Apartment/Suite</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.foreign_appartment || '—'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase mb-1">City</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.foreign_city || '—'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase mb-1">State/Province</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {data.foreign_state || '—'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/50 pb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase mb-1">Postal Code</span>
                                            <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 font-mono">
                                                {data.foreign_postal_code || '—'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Age Notice if under 18 */}
                                    {age !== null && age < 18 && (
                                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                                <AlertCircle size={16} />
                                                <span className="text-sm font-semibold">Minor Student Notice</span>
                                            </div>
                                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                                This student is {age} years old. Parent/Guardian information has been collected and verified.
                                            </p>
                                        </div>
                                    )}
                                </section>
                            </div>

                            {/* ACTIVATION PANEL */}
                            <div className="bg-slate-50 dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 mt-10 shadow-inner">
                                <h3 className="text-base sm:text-lg font-bold mb-6 flex items-center gap-3 text-slate-800 dark:text-slate-200">
                                    <CheckCircle size={20} className="text-teal-500" /> Final Approval & Instructor Assignment
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Confirm Package</label>
                                        <select 
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-slate-200 transition-all shadow-sm"
                                            value={selectedPackage}
                                            onChange={(e) => setSelectedPackage(e.target.value)}
                                        >
                                            <option value="">Select Package...</option>
                                            {onboarding.packages?.map(pkg => (
                                                <option key={pkg.id} value={pkg.id}>{pkg.package_name} (${pkg.amount})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Assign Professional Instructor</label>
                                        <select 
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-slate-200 transition-all shadow-sm"
                                            value={selectedInstructor}
                                            onChange={(e) => setSelectedInstructor(e.target.value)}
                                        >
                                            <option value="">Select Instructor...</option>
                                            {onboarding.instructors?.map(ins => (
                                                <option key={ins.id} value={ins.id}>{ins.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleActivate}
                                    disabled={submitting || !selectedInstructor || !selectedPackage}
                                    className="w-full mt-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm sm:text-base transition-all disabled:opacity-40 disabled:grayscale shadow-lg shadow-teal-500/20"
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <Loader2 className="animate-spin" size={20} /> Finalizing Enrollment...
                                        </span>
                                    ) : (
                                        "Activate Student Account & Send Credentials"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Add this style tag in your component or global CSS
// For now, add it as a regular style tag
const style = document.createElement('style');
style.textContent = `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
    
    @media print {
        body * { visibility: hidden; }
        #printable-area, #printable-area * { visibility: visible; }
        #printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; background: white; }
    }
`;
document.head.appendChild(style);

export default ApplicationReviewModal;