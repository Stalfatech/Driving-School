
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  X, Mail, CheckCircle, XCircle, 
  Clock, Calendar, FileText, 
  MapPin, History, Award, Edit2,
  Loader2, AlertCircle, User,
  Phone, BookOpen, Save, MessageSquare,
  Star, Calendar as CalendarIcon
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

export default function InstructorStudentDetail({ student, onClose }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Student data
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [progress, setProgress] = useState(student.progress || 0);
  
  // Edit states
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [editedProgress, setEditedProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  
  // Evaluation states
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [isEditingEvaluation, setIsEditingEvaluation] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState({
    score: 0,
    remarks: "",
    test_type: ""
  });

  const token = localStorage.getItem('access_token');

  // Fetch student data using instructor endpoints only
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Get attendance history
      const historyResponse = await axios.get(`${API_URL}/instructor/history`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: [] }));
      
      const historyData = historyResponse.data || [];
      const studentHistory = historyData.filter(a => a.student_id === student.id);
      setAttendanceHistory(studentHistory);
      
      // Get upcoming sessions
      const manifestResponse = await axios.get(`${API_URL}/instructor/manifest`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: [] }));
      
      const manifestData = manifestResponse.data || [];
      const upcoming = manifestData.filter(a => 
        a.student_id === student.id && !a.attendance
      );
      setUpcomingSessions(upcoming);
      
      // Extract evaluations
      const evals = studentHistory
        .filter(a => a.evaluation)
        .map(a => ({
          id: a.evaluation.id,
          assignment_id: a.id,
          date: a.date,
          test_type: a.evaluation.test_type || a.schedule?.task_description || 'Assessment',
          score: a.evaluation.score || 0,
          remarks: a.evaluation.instructor_remarks || '',
        }));
      setEvaluations(evals);
      
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (student?.id) {
      fetchStudentData();
    }
  }, [student]);

  // Save progress to database (only percentage)
  const saveProgress = async () => {
    try {
      setSaving(true);
      
      // Ensure value is valid
      const progressToSave = Math.min(editedProgress || 0, 100);
      
      console.log("Saving progress:", {
        studentId: student.id,
        progress_percentage: progressToSave
      });
      
      const response = await axios.post(`${API_URL}/instructor/student/${student.id}/progress`, {
        progress_percentage: progressToSave
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Save response:", response.data);
      
      setProgress(progressToSave);
      setIsEditingProgress(false);
      
      alert("Progress updated successfully!");
      
    } catch (err) {
      console.error("Error saving progress:", err);
      
      if (err.response) {
        alert(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        alert("No response from server. Please check your connection.");
      } else {
        alert("Error: " + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle progress change
  const handleProgressChange = (value) => {
    const newProgress = parseInt(value) || 0;
    const safeProgress = Math.min(100, Math.max(0, newProgress));
    setEditedProgress(safeProgress);
  };

  // Open evaluation editor
  const openEvaluationEditor = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setEvaluationForm({
      score: evaluation.score || 0,
      remarks: evaluation.remarks || "",
      test_type: evaluation.test_type || ""
    });
    setIsEditingEvaluation(true);
  };

  // Save evaluation
  const saveEvaluation = async () => {
    try {
      setSaving(true);
      
      await axios.post(`${API_URL}/instructor/assignments/${selectedEvaluation.assignment_id}/evaluation`, {
        score: evaluationForm.score || 0,
        remarks: evaluationForm.remarks || "",
        test_type: evaluationForm.test_type || "Assessment"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setEvaluations(prev => prev.map(e => 
        e.id === selectedEvaluation.id 
          ? { ...e, ...evaluationForm }
          : e
      ));
      
      setIsEditingEvaluation(false);
      setSelectedEvaluation(null);
      
      alert("Evaluation updated successfully!");
      
    } catch (err) {
      console.error("Error saving evaluation:", err);
      alert("Failed to save evaluation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-2xl">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-2xl text-center max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-sm font-medium text-red-600 mb-4">{error}</p>
          <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 font-['Lexend']">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[95vh] sm:h-[90vh] rounded-4xl sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800">
        
        {/* HEADER */}
        <header className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 shrink-0 gap-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="size-16 sm:size-20 rounded-2xl sm:rounded-3xl bg-indigo-600 flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-xl shrink-0">
              {student.name?.charAt(0) || '?'}
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                  {student.package || "Standard Package"}
                </span>
                <span className={`px-3 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest border ${
                  student.payment === 'Paid' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {student.payment || "Balance Due"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
                {student.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <Mail size={12} className="text-indigo-500" />
                  <span className="dark:text-slate-300">{student.email}</span>
                </div>
                {student.phone && (
                  <div className="flex items-center gap-1">
                    <Phone size={12} className="text-indigo-500" />
                    <span className="dark:text-slate-300">{student.phone}</span>
                  </div>
                )}
                {student.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-indigo-500" />
                    <span className="dark:text-slate-300">{student.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="absolute sm:relative top-4 right-4 sm:top-0 sm:right-0 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
          >
            <X size={20} />
          </button>
        </header>

        {/* TABS */}
        <nav className="flex px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 gap-4 sm:gap-6 bg-slate-50/30 dark:bg-slate-950/20 overflow-x-auto no-scrollbar">
          {["Overview", "Upcoming", "Evaluations", "History"].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`py-4 text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
                activeTab === tab ? "text-indigo-600" : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
            </button>
          ))}
        </nav>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          
          {/* OVERVIEW TAB */}
          {activeTab === "Overview" && (
            <div className="space-y-8">
              {/* Progress Card - Only Percentage */}
              <div className="bg-linear-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-900/10 p-8 rounded-3xl border border-indigo-200/50 dark:border-indigo-800/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest">Training Progress</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-indigo-600">
                      {isEditingProgress ? editedProgress : progress}%
                    </span>
                    {!isEditingProgress ? (
                      <button 
                        onClick={() => {
                          setEditedProgress(progress);
                          setIsEditingProgress(true);
                        }}
                        className="p-2 bg-white dark:bg-slate-800 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all"
                        title="Edit Progress"
                      >
                        <Edit2 size={16} />
                      </button>
                    ) : (
                      <button 
                        onClick={saveProgress}
                        disabled={saving}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
                        title="Save Progress"
                      >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                {isEditingProgress ? (
                  <div className="space-y-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={editedProgress || 0} 
                      onChange={(e) => handleProgressChange(e.target.value)}
                      className="w-full accent-indigo-600 h-3 bg-white dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
                    />
                    
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setIsEditingProgress(false);
                          setEditedProgress(progress);
                        }}
                        className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-full bg-white dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-4">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="text-center text-sm">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        Overall Progress: <span className="font-black text-indigo-600">{progress}%</span> complete
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Package and Student Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen size={18} className="text-indigo-600" />
                    <h4 className="text-xs font-black text-slate-400 uppercase">Package Details</h4>
                  </div>
                  <p className="text-lg font-black text-slate-800 dark:text-white mb-2">{student.package}</p>
                </div>

                <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <User size={18} className="text-indigo-600" />
                    <h4 className="text-xs font-black text-slate-400 uppercase">Student Info</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">ID: STU-{String(student.id).padStart(3, '0')}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Location: {student.location || 'N/A'}</p>
                </div>
              </div>

              {/* Recent Evaluations Preview */}
              {evaluations.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase mb-4">Recent Evaluations</h4>
                  <div className="space-y-3">
                    {evaluations.slice(0, 2).map(evalItem => (
                      <div key={evalItem.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{evalItem.test_type}</p>
                          <p className="text-xs text-slate-500">{evalItem.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-indigo-600">{Math.round(evalItem.score)}%</span>
                          <button 
                            onClick={() => {
                              setActiveTab("Evaluations");
                              openEvaluationEditor(evalItem);
                            }}
                            className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* UPCOMING SESSIONS TAB */}
          {activeTab === "Upcoming" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} className="text-indigo-600" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Upcoming Sessions</h3>
              </div>

              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black">
                          {new Date(session.date).getDate()}
                        </div>
                        <div>
                          <p className="text-base font-black text-slate-800 dark:text-white">
                            {session.schedule?.task_description || 'Driving Lesson'}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar size={12} /> {session.date}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock size={12} /> {session.start_time} - {session.end_time}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-indigo-500">
                              <MapPin size={12} /> {session.student_location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider self-start sm:self-center">
                        Upcoming
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                  <CalendarIcon size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-400">No upcoming sessions</p>
                </div>
              )}
            </div>
          )}

          {/* EVALUATIONS TAB */}
          {activeTab === "Evaluations" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-indigo-600" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Student Evaluations</h3>
              </div>

              {evaluations.length > 0 ? (
                <div className="space-y-4">
                  {evaluations.map((evalItem) => (
                    <div key={evalItem.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                      
                      {/* Evaluation Header */}
                      <div className="p-5 bg-slate-50 dark:bg-slate-700/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Award size={18} className="text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 dark:text-white">{evalItem.test_type}</h4>
                            <p className="text-xs text-slate-500">{evalItem.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-2xl font-black text-indigo-600">{Math.round(evalItem.score)}</span>
                            <span className="text-sm text-slate-400">/100</span>
                          </div>
                          <button 
                            onClick={() => openEvaluationEditor(evalItem)}
                            className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Evaluation Content */}
                      <div className="p-5">
                        <div className="bg-indigo-50/30 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100/50">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare size={14} className="text-indigo-600" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Instructor Remarks</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                            "{evalItem.remarks || 'No remarks added'}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                  <Star size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-400">No evaluations found</p>
                </div>
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "History" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <History size={18} className="text-indigo-600" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Session History</h3>
              </div>

              {attendanceHistory.length > 0 ? (
                <div className="space-y-3">
                  {attendanceHistory.map((session) => (
                    <div 
                      key={session.id} 
                      className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                          session.attendance?.status === 'present' 
                            ? 'bg-teal-50 text-teal-600' 
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {session.attendance?.status === 'present' 
                            ? <CheckCircle size={18} /> 
                            : <XCircle size={18} />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">
                            {session.schedule?.task_description || 'Driving Lesson'}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                              <Calendar size={10} /> {session.date}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                              <Clock size={10} /> {session.start_time} - {session.end_time}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-500">
                              <MapPin size={10} /> {session.student_location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                          session.attendance?.status === 'present' 
                            ? 'bg-teal-100 text-teal-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {session.attendance?.status || 'Unknown'}
                        </span>
                        {session.evaluation && (
                          <button
                            onClick={() => {
                              const evalItem = evaluations.find(e => e.assignment_id === session.id);
                              if (evalItem) {
                                setActiveTab("Evaluations");
                                openEvaluationEditor(evalItem);
                              }
                            }}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[8px] font-black uppercase hover:bg-indigo-200 transition-colors"
                          >
                            View Score
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                  <History size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-400">No attendance history found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Evaluation Edit Modal */}
      {isEditingEvaluation && selectedEvaluation && (
        <div className="fixed inset-0 z-200 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-900 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-indigo-600">Edit Evaluation</h3>
              <button 
                onClick={() => {
                  setIsEditingEvaluation(false);
                  setSelectedEvaluation(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Test Type</label>
                <input 
                  type="text"
                  value={evaluationForm.test_type}
                  onChange={(e) => setEvaluationForm({...evaluationForm, test_type: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Score (0-100)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="100"
                    value={evaluationForm.score}
                    onChange={(e) => setEvaluationForm({...evaluationForm, score: parseInt(e.target.value) || 0})}
                    className="flex-1 accent-indigo-600"
                  />
                  <span className="text-2xl font-black text-indigo-600 w-16 text-center">
                    {evaluationForm.score}%
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Instructor Remarks</label>
                <textarea 
                  rows={4}
                  value={evaluationForm.remarks}
                  onChange={(e) => setEvaluationForm({...evaluationForm, remarks: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  placeholder="Add your feedback..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setIsEditingEvaluation(false);
                    setSelectedEvaluation(null);
                  }}
                  className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveEvaluation}
                  disabled={saving}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}