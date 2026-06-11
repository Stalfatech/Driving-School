import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Calendar, Clock, MapPin, User, Award, BookOpen, 
  CheckCircle, Car, Users, AlertCircle, Star, 
  Sun, Cloud, X, Send, Loader2, FileText,
  TrendingUp, Target, ThumbsUp, MessageCircle,
  ClipboardList, Activity, BarChart3, CheckSquare,
  AlertTriangle, Info, Download, ChevronDown, ChevronUp,
  Clock as ClockIcon, Calendar as CalendarIcon
} from 'lucide-react';
import Pagination from '../../components/Pagination';

const API_URL = "http://localhost:8000/api";

const TestEvaluationPage = () => {
  const [selectedTest, setSelectedTest] = useState(null);
  const [studentResponse, setStudentResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendancePage, setAttendancePage] = useState(1);
  const [evaluationPage, setEvaluationPage] = useState(1);
  const itemsPerPage = 6;
  const textareaRef = useRef(null);

  const [evaluations, setEvaluations] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [statistics, setStatistics] = useState({
    total_tests: 0,
    average_score: 0,
    passed_tests: 0,
    present_count: 0,
    total_attendances: 0
  });
  
  const [evaluationMeta, setEvaluationMeta] = useState({
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1
  });
  
  const [attendanceMeta, setAttendanceMeta] = useState({
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1
  });

  const token = localStorage.getItem('access_token');

  const getHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  });

  const fetchEvaluations = async (page = 1) => {
    try {
      const response = await axios.get(`${API_URL}/student/test-evaluations`, {
        headers: getHeaders(),
        params: { per_page: itemsPerPage, page }
      });
      if (response.data.success) {
        const evaluationData = response.data.data.data || response.data.data;
        setEvaluations(Array.isArray(evaluationData) ? evaluationData : []);
        setEvaluationMeta({
          current_page: response.data.meta.current_page,
          total: response.data.meta.total,
          per_page: response.data.meta.per_page,
          last_page: response.data.meta.last_page
        });
      }
    } catch (err) {
      console.error('Error fetching evaluations:', err);
      setError('Failed to load evaluations');
      setEvaluations([]);
    }
  };

  const fetchAttendance = async (page = 1) => {
    try {
      const response = await axios.get(`${API_URL}/student/test-evaluations/attendance`, {
        headers: getHeaders(),
        params: { per_page: itemsPerPage, page }
      });
      if (response.data.success) {
        const attendanceData = response.data.data.data || response.data.data;
        setAttendances(Array.isArray(attendanceData) ? attendanceData : []);
        setAttendanceMeta({
          current_page: response.data.meta.current_page,
          total: response.data.meta.total,
          per_page: response.data.meta.per_page,
          last_page: response.data.meta.last_page
        });
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttendances([]);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/test-evaluations/statistics`, {
        headers: getHeaders()
      });
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const submitResponseToApi = async (evaluationId, responseText) => {
    try {
      const response = await axios.post(
        `${API_URL}/student/test-evaluations/${evaluationId}/response`,
        { student_reply: responseText },
        { headers: getHeaders() }
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to submit response');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchEvaluations(evaluationPage),
        fetchAttendance(attendancePage),
        fetchStatistics()
      ]);
    } catch (err) {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAllData(); }, []);
  useEffect(() => { fetchEvaluations(evaluationPage); }, [evaluationPage]);
  useEffect(() => { fetchAttendance(attendancePage); }, [attendancePage]);

  useEffect(() => {
    if (selectedTest && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedTest]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
    if (score >= 80) return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800';
    if (score >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
    if (score >= 60) return 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
    return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
  };

  const getStatusBadge = (score) => {
    if (score >= 80) return (
      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold flex items-center gap-1">
        <CheckCircle size={12} /> Passed
      </span>
    );
    if (score >= 70) return (
      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs font-bold flex items-center gap-1">
        <AlertTriangle size={12} /> Needs Improvement
      </span>
    );
    if (score >= 60) return (
      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-xs font-bold flex items-center gap-1">
        <AlertCircle size={12} /> Borderline
      </span>
    );
    return (
      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold flex items-center gap-1">
        <AlertCircle size={12} /> Failed
      </span>
    );
  };

  const handleSubmitResponse = async (evaluationId) => {
    if (!studentResponse.trim()) {
      alert('Please enter your response before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await submitResponseToApi(evaluationId, studentResponse);
      alert('Your response has been submitted successfully!');
      setStudentResponse('');
      setSelectedTest(null);
      await fetchEvaluations(evaluationPage);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextareaChange = (e, evaluationId) => {
    e.stopPropagation();
    setSelectedTest(evaluationId);
    setStudentResponse(e.target.value);
  };

  const handleCardHeaderClick = (evaluationId, isExpanded) => {
    if (selectedTest === evaluationId) return;
    setExpandedCard(isExpanded ? null : evaluationId);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading your evaluations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button onClick={loadAllData} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-8xl mx-auto space-y-4 sm:space-y-6">

          {/* Header */}
          <div className="mb-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
              Tests & <span className="text-teal-600 dark:text-teal-400">Evaluations</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              View your test results, instructor feedback, and session history
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Tests</p>
                <ClipboardList size={14} className="sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{statistics.total_tests}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">Completed evaluations</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Score</p>
                <BarChart3 size={14} className="sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">{statistics.average_score}%</p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">Overall performance</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passed</p>
                <ThumbsUp size={14} className="sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{statistics.passed_tests}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">Successful tests</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attendance</p>
                <CheckSquare size={14} className="sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{statistics.present_count}/{statistics.total_attendances}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">Sessions attended</p>
            </div>
          </div>

          {/* Attendance History */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ClockIcon size={18} className="text-teal-600 dark:text-teal-400" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Attendance History</h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {attendanceMeta.total > 0
                    ? `Showing ${(attendancePage - 1) * itemsPerPage + 1}–${Math.min(attendancePage * itemsPerPage, attendanceMeta.total)} of ${attendanceMeta.total}`
                    : 'No records'}
                </span>
              </div>
            </div>

            {/* Desktop Table */}
<div className="hidden md:block overflow-x-auto">
  <table className="w-full">
    <thead className="bg-slate-50 dark:bg-slate-800/50">
      <tr>
        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Test Type</th>
        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Marked At</th>
        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Instructor</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
      {attendances.map((record) => (
        <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
          <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300">{formatDate(record.lesson?.date)}</td>
          <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300">{record.lesson?.type || 'N/A'}</td>
          <td className="px-5 py-3">
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold capitalize">
              {record.attendance_status}
            </span>
          </td>
          <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">{formatDateTime(record.marked_at)}</td>
          <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300">{record.instructor?.name}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Mobile Cards */}
<div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
  {attendances.map((record) => (
    <div key={record.id} className="p-4 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              {record.lesson?.type || 'N/A'}
            </h3>
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold capitalize">
              {record.attendance_status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(record.lesson?.date)}</span>
            <span className="flex items-center gap-1"><Clock size={10} />{record.lesson?.start_time}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg">
          <span className="text-slate-500 dark:text-slate-400 block mb-1">Marked At</span>
          <p className="text-slate-700 dark:text-slate-300 font-medium">{formatDateTime(record.marked_at)}</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg">
          <span className="text-slate-500 dark:text-slate-400 block mb-1">Instructor</span>
          <p className="text-slate-700 dark:text-slate-300 font-medium">{record.instructor?.name}</p>
        </div>
      </div>
    </div>
  ))}
</div>

            {/* ✅ External Pagination for Attendance */}
            {attendanceMeta.last_page > 1 && (
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                <Pagination
                  currentPage={attendancePage}
                  totalItems={attendanceMeta.total}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setAttendancePage}
                />
              </div>
            )}
          </div>

          {/* Evaluations List */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Test Results & Evaluations</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {evaluationMeta.total > 0
                  ? `Showing ${(evaluationPage - 1) * itemsPerPage + 1}–${Math.min(evaluationPage * itemsPerPage, evaluationMeta.total)} of ${evaluationMeta.total}`
                  : 'No records'}
              </span>
            </div>

            {evaluations.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No evaluations found</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Your test results will appear here</p>
              </div>
            ) : (
              <>
                {evaluations.map((evaluation) => {
                  const isExpanded = expandedCard === evaluation.id;
                  const hasResponded = evaluation.student_reply && evaluation.student_reply.trim() !== '';
                  const isSelectedForResponse = selectedTest === evaluation.id;

                  const toggleExpand = (e) => {
                    e.stopPropagation();
                    setExpandedCard(isExpanded ? null : evaluation.id);
                  };

                  const handleResponseClick = (e) => {
                    e.stopPropagation();
                    if (!isSelectedForResponse) {
                      setSelectedTest(evaluation.id);
                      setStudentResponse(hasResponded ? evaluation.student_reply : '');
                    }
                  };

                  return (
                    <div key={evaluation.id} className={`bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                      evaluation.score >= 80 ? 'border-green-200 dark:border-green-800'
                      : evaluation.score >= 70 ? 'border-yellow-200 dark:border-yellow-800'
                      : 'border-orange-200 dark:border-orange-800'
                    }`}>

                      {/* Card Header */}
                      <div
                        className="p-4 sm:p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        onClick={() => handleCardHeaderClick(evaluation.id, isExpanded)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {getStatusBadge(evaluation.score)}
                            </div>
                            <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-2 break-words">
                              {evaluation.test_type}
                            </h3>
                            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-400">
                             <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(evaluation.lesson_date)}</span>
<span className="flex items-center gap-1"><Clock size={12} />{evaluation.lesson_time}</span>
<span className="flex items-center gap-1"><User size={12} />{evaluation.instructor?.name}</span>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="flex-shrink-0 self-start sm:self-center">
                            <div className="sm:hidden">
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${getScoreBgColor(evaluation.score)}`}>
                                <span className={`text-base font-bold ${getScoreColor(evaluation.score)}`}>{evaluation.score}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">/100</span>
                              </div>
                            </div>
                            <div className={`hidden sm:inline-flex flex-col items-center p-2 sm:p-3 rounded-xl ${getScoreBgColor(evaluation.score)}`}>
                              <span className={`text-xl sm:text-2xl lg:text-3xl font-bold ${getScoreColor(evaluation.score)}`}>{evaluation.score}</span>
                              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">/100</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2 text-xs">
                            {hasResponded && (
                              <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                                <CheckCircle size={12} />
                                <span className="hidden xs:inline">You responded</span>
                                <span className="xs:hidden">Responded</span>
                              </span>
                            )}
                          </div>
                          <button onClick={toggleExpand} className="text-teal-600 dark:text-teal-400 text-xs font-semibold flex items-center gap-1 hover:underline">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            <span className="hidden xs:inline">{isExpanded ? 'Show Less' : 'View Details'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-800">
                          <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle size={14} className="sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400" />
                              <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Instructor's Remarks</h4>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{evaluation.instructor_remarks}</p>
                          </div>

                          <div className="mb-4 sm:mb-5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin size={12} className="sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400" />
                              <h4 className="text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">Location</h4>
                            </div>
<p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 break-words">{evaluation.location}</p>                          </div>

                          {hasResponded && (
                            <div className="mb-4 sm:mb-5 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageCircle size={12} className="sm:w-3.5 sm:h-3.5 text-teal-600 dark:text-teal-400" />
                                <h4 className="text-[10px] sm:text-xs font-bold text-teal-700 dark:text-teal-400 uppercase">Your Previous Response</h4>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 break-words">{evaluation.student_reply}</p>
                            </div>
                          )}

                          {/* Response textarea */}
                          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700" onClick={handleResponseClick}>
                            <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-2">
                              <MessageCircle size={14} className="sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400" />
                              {hasResponded ? 'Update Your Response' : 'Your Response'}
                            </label>
                            <textarea
                              ref={isSelectedForResponse ? textareaRef : null}
                              rows={3}
                              value={isSelectedForResponse ? studentResponse : (hasResponded ? evaluation.student_reply : '')}
                              onChange={(e) => handleTextareaChange(e, evaluation.id)}
                              onClick={(e) => e.stopPropagation()}
                              onFocus={(e) => {
                                e.stopPropagation();
                                if (!isSelectedForResponse) {
                                  setSelectedTest(evaluation.id);
                                  setStudentResponse(hasResponded ? evaluation.student_reply : '');
                                }
                              }}
                              disabled={submitting}
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                              placeholder="Share your thoughts about this test/evaluation..."
                            />
                            {isSelectedForResponse && studentResponse !== (hasResponded ? evaluation.student_reply : '') && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSubmitResponse(evaluation.id); }}
                                disabled={submitting}
                                className="mt-3 px-4 sm:px-5 py-1.5 sm:py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                Submit Response
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* ✅ External Pagination for Evaluations */}
                {evaluationMeta.last_page > 1 && (
                  <div className="flex justify-center mt-4">
                    <Pagination
                      currentPage={evaluationPage}
                      totalItems={evaluationMeta.total}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setEvaluationPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TestEvaluationPage;