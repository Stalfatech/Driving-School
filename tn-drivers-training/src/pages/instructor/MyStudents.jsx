import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Pagination from "../../components/Pagination";
import InstructorStudentDetail from "../../components/instructor/InstructorStudentDetail";
import { 
  ScanEye, MapPin, Mail, Search, AlertCircle, 
  User, Phone, Loader2, CheckCircle, Clock
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

const MyStudents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem('access_token');
  const itemsPerPage = 5;

  // Fetch students assigned to this instructor
  const fetchMyStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/instructor/my-students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let studentsData = [];
      if (response.data.success && response.data.data) {
        studentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        studentsData = response.data;
      }
      
      const formattedStudents = studentsData.map(student => ({
        id: student.id,
        studentId: `STU-${String(student.id).padStart(3, '0')}`,
        name: student.name || 'Unknown',
        email: student.email || '',
        phone: student.phone || '',
        package: student.package?.name || 'Standard Package',
        progress: student.progress ?? 0,
        status: (student.progress ?? 0) === 100 ? 'Completed' : 'In Progress',
        location: student.province || student.city || 'N/A',
        address: student.street_address || '',
        city: student.city || ''
      }));
      
      setStudents(formattedStudents);
      
    } catch (err) {
      console.error("Error fetching students:", err);
      if (err.response?.status === 403) {
        setError("You don't have permission to view students. Please contact admin.");
      } else if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else {
        setError(err.response?.data?.message || "Failed to load students");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyStudents();
  }, []);

  // Filter students based on search and status
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = searchTerm === "" || 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "" || 
        (statusFilter === "In Progress" && s.progress < 100) ||
        (statusFilter === "Completed" && s.progress === 100);
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, students]);

  // Pagination
  const paginatedStudents = filteredStudents.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Calculate stats
  const totalStudents = students.length;
  const activeCount = students.filter(s => s.progress < 100).length;
  const completedCount = students.filter(s => s.progress === 100).length;

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-500 mx-auto mb-4" size={48} />
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Loading your students...</p>
        </div>
      </div>
    );
  }

  // ================= ERROR STATE =================
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center px-4">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-sm font-medium text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchMyStudents}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      
      {/* HEADER */}
      <header className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
              My <span className="text-teal-600 dark:text-teal-400">Students</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-300 mt-1.5 font-medium">
              Manage and track your assigned students
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col w-full lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4 mb-6">
          {/* Status Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2 sm:gap-3 flex-1">
            
            {/* Status Filter */}
            <div className="group relative w-full">
              <select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
              >
                <option value="">All Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:max-w-md lg:ml-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, ID or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <p className="text-xs md:text-md lg:text-lg text-center font-semibold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-1">Total Students</p>
            <p className="text-2xl text-center font-bold text-teal-600 dark:text-teal-400">{totalStudents}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <p className="text-xs md:text-md lg:text-lg text-center font-semibold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-1">In Progress</p>
            <p className="text-2xl text-center font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <p className="text-xs md:text-md lg:text-lg text-center font-semibold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-1">Completed</p>
            <p className="text-2xl text-center font-bold text-blue-600 dark:text-blue-400">{completedCount}</p>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 overflow-x-hidden">
        <div className="max-w-[1920px] mx-auto">
          
          {/* Empty State */}
          {students.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <AlertCircle className="mx-auto text-slate-300 mb-4" size={56} />
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No students assigned to you yet.</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW (Cards) */}
              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((s) => (
                    <div 
                      key={s.id} 
                      onClick={() => setSelectedStudent(s)}
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-all"
                    >
                      {s.progress < 100 && <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500" />}
                      {s.progress === 100 && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />}
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm md:text-md">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">{s.name}</h3>
                            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5">ID: {s.studentId}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                          s.progress === 100 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                            : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                        }`}>
                          {s.progress === 100 ? 'Completed' : 'In Progress'}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 text-sm text-slate-800 dark:text-slate-300">
                          <Mail size={16} className="text-teal-500 shrink-0" /> 
                          <span className="truncate">{s.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-800 dark:text-slate-300">
                          <Phone size={16} className="text-teal-500 shrink-0" /> 
                          <span>{s.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-800 dark:text-slate-300">
                          <MapPin size={16} className="text-teal-500 shrink-0" /> 
                          <span>{s.city}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>{s.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${s.progress === 100 ? 'bg-blue-500' : 'bg-teal-500'}`} 
                            style={{ width: `${s.progress}%` }} 
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(s);
                          }}
                          className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <ScanEye size={18} /> View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-slate-500">No students match your filters.</p>
                  </div>
                )}
              </div>

              {/* DESKTOP VIEW (Table) */}
              <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300">Student Details</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300">Package</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300">Location</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300">Progress</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paginatedStudents.length > 0 ? (
                        paginatedStudents.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                                  s.progress === 100 ? 'bg-blue-500' : 'bg-teal-500'
                                }`}>
                                  {s.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-base font-bold text-slate-800 dark:text-white">{s.name}</div>
                                  <div className="text-sm text-slate-800 dark:text-slate-300 font-medium">ID: {s.studentId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-300">{s.package}</span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-300">
                                <MapPin size={14} className="text-teal-500" /> {s.address}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="w-32">
                                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                                  <span>{s.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${s.progress === 100 ? 'bg-blue-500' : 'bg-teal-500'}`} 
                                    style={{ width: `${s.progress}%` }} 
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                s.progress === 100 
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                                  : 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${s.progress === 100 ? 'bg-blue-500' : 'bg-teal-500 animate-pulse'}`} />
                                {s.progress === 100 ? 'Completed' : 'In Progress'}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <button 
                                onClick={() => setSelectedStudent(s)}
                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all"
                                title="View Student Details"
                              >
                                <ScanEye size={20} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-500">
                            No students match your filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {filteredStudents.length > itemsPerPage && (
                <div className="flex justify-center pt-8 pb-4">
                  <Pagination 
                    currentPage={page} 
                    totalItems={filteredStudents.length} 
                    itemsPerPage={itemsPerPage} 
                    onPageChange={handlePageChange} 
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <InstructorStudentDetail 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
};

export default MyStudents;