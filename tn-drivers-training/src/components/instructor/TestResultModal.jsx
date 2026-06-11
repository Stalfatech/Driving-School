

import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle, XCircle, Loader2, Save } from 'lucide-react';

const TestResultModal = ({ test, onClose, onSave, saving }) => {
  const [formData, setFormData] = useState({
    score: test.test_score || 75,
    result: test.test_result || 'Fail',
    remarks: test.evaluation?.instructor_remarks || ''
  });

  useEffect(() => {
    setFormData({
      score: test.test_score || 75,
      result: test.test_result || 'Fail',
      remarks: test.evaluation?.instructor_remarks || ''
    });
  }, [test]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-teal-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getGradeLetter = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'D+';
    if (score >= 50) return 'D';
    return 'F';
  };

  const quickTemplates = [
    "Excellent driving skills. Passed with confidence.",
    "Good overall, but needs more highway practice.",
    "Struggled with parallel parking. Needs more practice.",
    "Failed: Missed shoulder checks and blind spot observations.",
    "Great progress! Ready for next level test.",
    "Needs improvement on clutch control and hill starts."
  ];

  const handleSubmit = () => {
    if (!formData.remarks.trim()) {
      alert('Please provide instructor remarks');
      return;
    }
    onSave(formData);
  };

  const isEditing = test.test_result !== null && test.test_result !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      {/* Modal Container - Added max-h-[90vh] and flex flex-col */}
      <div className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header - Fixed at top */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-50/50 to-transparent dark:from-teal-900/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Award size={20} className="text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {isEditing ? "Edit Test Results" : "Test Results"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {test.test_type} • {test.test_attempt ? `${test.test_attempt}${test.test_attempt === 1 ? 'st' : test.test_attempt === 2 ? 'nd' : test.test_attempt === 3 ? 'rd' : 'th'} Attempt` : 'New Test'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* Student Info */}
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 font-bold shrink-0">
                {test.student?.user?.name?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-500">Student</p>
                <p className="text-base font-bold text-slate-800 dark:text-white truncate">
                  {test.student?.user?.name || 'Unknown Student'}
                </p>
                <p className="text-xs text-slate-500 truncate">{test.date} at {test.start_time} - {test.end_time}</p>
              </div>
            </div>
          </div>

          {/* Score Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Score</label>
              <span className="text-red-500 text-sm">*</span>
            </div>
            <div className="space-y-3">
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="1"
                value={formData.score}
                onChange={(e) => setFormData({...formData, score: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <p className="text-xs text-slate-500">Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(formData.score)}`}>
                    {formData.score}%
                  </p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs text-slate-500">Grade</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white">
                    {getGradeLetter(formData.score)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Result</label>
              <span className="text-red-500 text-sm">*</span>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="result" 
                  value="Pass"
                  checked={formData.result === 'Pass'}
                  onChange={(e) => setFormData({...formData, result: e.target.value})}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="flex items-center gap-1 text-green-600 font-semibold">
                  <CheckCircle size={16} /> Pass
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="result" 
                  value="Fail"
                  checked={formData.result === 'Fail'}
                  onChange={(e) => setFormData({...formData, result: e.target.value})}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="flex items-center gap-1 text-red-600 font-semibold">
                  <XCircle size={16} /> Fail
                </span>
              </label>
            </div>
          </div>

          {/* Remarks Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Instructor Remarks</label>
              <span className="text-red-500 text-sm">*</span>
            </div>
            <textarea 
              rows={4}
              value={formData.remarks}
              onChange={(e) => setFormData({...formData, remarks: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
              placeholder="Provide detailed feedback about the student's test performance... At leat one word is required"
            />
          </div>

          {/* Quick Templates */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Quick feedback templates:</p>
            <div className="flex flex-wrap gap-2">
              {quickTemplates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => setFormData({...formData, remarks: template})}
                  className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"
                >
                  {template.length > 40 ? template.substring(0, 40) + "..." : template}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex gap-3 p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl shrink-0">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : (isEditing ? "Update Results" : "Save Results")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResultModal;