import React from 'react';
import { X } from 'lucide-react';

const PrivacyPolicy = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Privacy Policy</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Last Updated: November 11, 2025</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar text-sm text-slate-600 dark:text-slate-300 space-y-6">
          <p className="font-medium leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Terra Nova Drivers Training</strong> ("we", "us", or "our") is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights. By using our website or registering for courses you consent to the terms described below.
          </p>

          <div className="space-y-4">
            <section>
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">1. Information We Collect</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Personal details:</strong> name, date of birth, contact information, and driver's licence information when required.</li>
                <li><strong>Course data:</strong> enrollments, progress, quiz results, and certificates.</li>
                <li><strong>Technical data:</strong> device, browser, IP address, and site usage for analytics and security.</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">2. How We Use Your Information</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Manage course registrations, deliver training, and issue certificates.</li>
                <li>Verify eligibility and report completion to Motor Vehicle Registration (MVR) where required.</li>
                <li>Provide support, send course updates, and improve our services.</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">3. Consent & Legal Basis</h4>
              <p>By using our services you consent to the collection and use of your information as described. You can withdraw consent at any time by contacting us at <strong>info@terranovadriverstraining.ca</strong>, though this may affect our ability to provide certain services.</p>
            </section>

            <section>
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">4. Sharing & Third Parties</h4>
              <p>We do not sell personal information. We may share data with MVR, service providers (hosting, LMS platforms, email, payment processors), or when required by law. All providers are contractually required to safeguard your data.</p>
            </section>

            <section>
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">5. International Transfers & Storage</h4>
              <p>Your data may be stored in Canada or in other countries where our service providers operate. Cross-border transfers may be subject to foreign laws; we take reasonable steps to ensure adequate protections.</p>
            </section>

            <section>
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">6. Retention</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Course records and certificates:</strong> retained for a minimum of 7 years.</li>
                <li><strong>Payment records:</strong> retained for 7 years for accounting and tax compliance.</li>
                <li><strong>Support correspondence:</strong> retained for up to 2 years unless required longer.</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">7. Security</h4>
              <p>We protect data with SSL encryption, secure hosting, and access controls. Although we take precautions, no system is 100% secure. In the event of a serious breach we will notify affected individuals and authorities as required by law.</p>
            </section>

            <section>
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">8. Cookies & Communications</h4>
              <p>We use cookies and similar technologies to improve the site and remember preferences. We comply with Canadian Anti-Spam Legislation (CASL) for electronic communications; marketing messages include an unsubscribe option.</p>
            </section>

            <section>
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">9. Your Rights</h4>
              <p>You may request access to, correction of, or deletion of your personal information (subject to legal retention requirements). To exercise your rights or raise a privacy concern, contact us at:</p>
              <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p><strong>Email:</strong> info@terranovadriverstraining.ca</p>
                <p><strong>Phone:</strong> +1 709-749-1564</p>
              </div>
            </section>
          </div>

          <p className="text-center italic font-bold mt-8 text-teal-600 dark:text-teal-500">
            Terra Nova Drivers Training — Committed to privacy, safety, and professional driver education.
          </p>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;