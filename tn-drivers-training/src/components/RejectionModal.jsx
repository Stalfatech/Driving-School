import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const RejectionModal = ({ isOpen, onClose, onSubmit, studentName, isRejecting }) => {
  const [reason, setReason] = useState('');

  // Clear the text area every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  // Don't render anything if it's not open
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Reject Application</h2>
        </div>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Please provide a reason for rejecting the application for <span className="font-bold text-slate-700 dark:text-slate-300">{studentName}</span>. This message will be sent to the student via email.
        </p>
        
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., Your permit is currently expired, please reapply once renewed."
          className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-slate-300 outline-none focus:ring-2 focus:ring-red-500/20 transition-all resize-none mb-6"
        ></textarea>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isRejecting}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRejecting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isRejecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Rejecting...
              </>
            ) : (
              'Confirm & Send Email'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectionModal;