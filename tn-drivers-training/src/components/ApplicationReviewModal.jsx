import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Printer, CheckCircle, Loader2 } from 'lucide-react';

const ApplicationReviewModal = ({ studentId, onClose, onRefresh }) => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState(null);
    const [onboarding, setOnboarding] = useState({ packages: [], instructors: [] });
    
    const [selectedPackage, setSelectedPackage] = useState('');
    const [selectedInstructor, setSelectedInstructor] = useState('');

    useEffect(() => {
        if (studentId) {
            fetchDetails();
        }
    }, [studentId]);

//test x good   jeep this 
const fetchDetails = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Student first
        const studentRes = await axios.get(`http://127.0.0.1:8000/api/students/${studentId}`, { headers });
        const student = studentRes.data.data;
        
        // 2. SET DATA IMMEDIATELY
        setData(student);
        setSelectedPackage(student.package_id || '');

        // 3. CRITICAL: Use 'student.province' directly, NOT 'data.province'
        const onboardingRes = await axios.get(
            `http://127.0.0.1:8000/api/students/onboarding-data?location_id=${student.province}`, 
            { headers }
        );
        
        setOnboarding(onboardingRes.data);
    } catch (error) {
        console.error("Error fetching modal data:", error);
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
            onRefresh();
            onClose();
        } catch (error) {
            alert(error.response?.data?.error || "Activation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4">
            <div className="bg-white dark:bg-card-dark rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                
                {/* Header - Hidden on Print */}
                <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-white dark:bg-card-dark print:hidden">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">Application Review</h2>
                        <p className="text-xs text-slate-500">Verify details and assign instructor</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-xl hover:bg-slate-200 transition-colors">
                            <Printer size={18} /> Print
                        </button>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-teal" size={40} />
                            <p className="text-slate-500 animate-pulse">Fetching complete profile...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* PRINTABLE AREA STARTS HERE */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10" id="printable-area">
                                
                                {/* SECTION 1: PERSONAL PROFILE */}
                                <section>
                                    <h3 className="text-[10px] font-black text-teal uppercase tracking-[0.2em] mb-4">Personal Profile</h3>
                                    <div className="space-y-3 text-sm">
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Full Name</span> <span className="font-semibold dark:text-white">{data.user?.name}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Email</span> <span className="font-semibold dark:text-white">{data.user?.email}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Phone</span> <span className="font-semibold dark:text-white">{data.user?.phone}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Street Address</span> <span className="font-semibold dark:text-white">{data.street_address}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Apartment</span> <span className="font-semibold dark:text-white">{data.appartment || 'N/A'}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">City/</span> <span className="font-semibold dark:text-white">{data.city},</span></p>
<p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
    <span className="text-slate-400">Location</span> 
    <span className="font-semibold dark:text-white">
        {data.province_text || 'N/A'} 
    </span>
</p>                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Postal Code</span> <span className="font-semibold dark:text-white">{data.postal_code}</span></p>

                                    </div>
                                </section>

                                {/* SECTION 2: REGISTRATION DETAILS */}
                                <section>
                                    <h3 className="text-[10px] font-black text-teal uppercase tracking-[0.2em] mb-4">Registration Details</h3>
                                    <div className="space-y-3 text-sm">
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Applied Package</span> <span className="font-semibold text-amber-600">{data.package?.package_name || 'Generic'}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Parent Name</span> <span className="font-semibold dark:text-white">{data.parent_name || 'N/A'}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Permit Number</span> <span className="font-semibold dark:text-white font-mono">{data.permit_number || 'NOT PROVIDED'}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Issue Date</span> <span className="font-semibold dark:text-white">{data.permit_issue_date || 'N/A'}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Experience</span> <span className="font-semibold dark:text-white">{data.experience || 'Beginner'}</span></p>
                                    </div>
                                </section>

                                {/* SECTION 3: FOREIGN LICENCE (The new fields) */}
                                <section className="md:col-span-2">
                                    <h3 className="text-[10px] font-black text-teal uppercase tracking-[0.2em] mb-4">Foreign Licence Profile</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 text-sm">
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
                                            <span className="text-slate-400">Has Foreign Licence?</span> 
                                            <span className={`font-bold ${data.has_foreign_license ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {data.has_foreign_license ? 'YES' : 'NO'}
                                            </span>
                                        </p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Licence Number</span> <span className="font-semibold dark:text-white">{data.foreign_license_number || 'N/A'}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Street Address</span> <span className="font-semibold dark:text-white">{data.foreign_street_address || 'N/A'}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Apartment/Suite</span> <span className="font-semibold dark:text-white">{data.foreign_appartment || 'N/A'}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">City</span> <span className="font-semibold dark:text-white">{data.foreign_city || 'N/A'}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">State/Province</span> <span className="font-semibold dark:text-white">{data.foreign_state || 'N/A'}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Postal Code</span> <span className="font-semibold dark:text-white">{data.foreign_postal_code || 'N/A'}</span></p>
                                        <p className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2"><span className="text-slate-400">Country</span> <span className="font-semibold dark:text-white">{data.foreign_country || 'N/A'}</span></p>
                                    </div>
                                </section>
                            </div>

                            {/* ACTIVATION PANEL - Hidden on Print */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 print:hidden">
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2 dark:text-white">
                                    <CheckCircle size={18} className="text-teal" /> Final Approval & Assignment
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Package Selection</label>
                                        <select 
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal dark:text-white"
                                            value={selectedPackage}
                                            onChange={(e) => setSelectedPackage(e.target.value)}
                                        >
                                            <option value="">Select Package...</option>
                                            {onboarding.packages.map(pkg => (
                                                <option key={pkg.id} value={pkg.id}>{pkg.package_name} (${pkg.amount})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Assign Instructor</label>
                                        <select 
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal dark:text-white"
                                            value={selectedInstructor}
                                            onChange={(e) => setSelectedInstructor(e.target.value)}
                                        >
                                            <option value="">Select Instructor...</option>
                                            {onboarding.instructors.map(ins => (
                                                <option key={ins.id} value={ins.id}>{ins.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleActivate}
                                    disabled={submitting || !selectedInstructor || !selectedPackage}
                                    className="w-full mt-6 py-4 bg-teal hover:bg-[#007373] text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal/20"
                                >
                                    {submitting ? "Processing Enrolment..." : "Confirm & Activate Student Account"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                }
            `}</style>
        </div>
    );
};

export default ApplicationReviewModal;
