
import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import InstructorStudentDetail from "../../components/instructor/InstructorStudentDetail";
import { Eye, MapPin, Loader2, AlertCircle, UserCheck } from "lucide-react";

const API_URL = "http://localhost:8000/api";

const MyStudents = () => {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem('access_token');
  const itemsPerPage = 10;

  // Fetch students assigned to this instructor
  const fetchMyStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching from:", `${API_URL}/instructor/my-students`);
      
      const response = await axios.get(`${API_URL}/instructor/my-students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Response:", response.data);
      
      // Handle response structure
      let studentsData = [];
      if (response.data.success && response.data.data) {
        studentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        studentsData = response.data;
      } else {
        studentsData = [];
      }
      
      console.log("Students data:", studentsData);
      
      // Format students for display
      const formattedStudents = studentsData.map(student => ({
        id: student.id,
        studentId: `STU-${String(student.id).padStart(3, '0')}`,
        name: student.name || 'Unknown',
        // location: student.province || student.city || 'N/A',
        progress: 0, // Will calculate later if needed
        status: 'Active',
        email: student.email || '',
        package: student.package?.name || 'Standard',
        payment: 'N/A',
        balance: 0,
        phone: student.phone || '',
        address: student.street_address || ''
      }));
      
      setStudents(formattedStudents);
      
    } catch (err) {
      console.error("Error fetching students:", err);
      
      if (err.response) {
        console.error("Error response:", err.response.data);
        
        if (err.response.status === 403) {
          setError("You don't have permission to view students. Please contact admin.");
        } else if (err.response.status === 401) {
          setError("Your session has expired. Please login again.");
        } else if (err.response.status === 404) {
          setError("The students endpoint was not found. Please contact admin.");
        } else {
          setError(`Failed to load students: ${err.response.data?.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyStudents();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(query.toLowerCase()) ||
                         s.studentId?.toLowerCase().includes(query.toLowerCase()) ||
                         (s.email && s.email.toLowerCase().includes(query.toLowerCase()));
    if (section === "Completed") return matchesSearch && s.progress === 100;
    if (section === "In Progress") return matchesSearch && s.progress < 100;
    return matchesSearch;
  });

  // Pagination
  const paginatedStudents = filteredStudents.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-gray-950 min-h-screen font-['Lexend']">
        <main className="p-4 md:p-10 max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading your students...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-slate-50 dark:bg-gray-950 min-h-screen font-['Lexend']">
        <main className="p-4 md:p-10 max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <p className="text-sm font-medium text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchMyStudents}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-gray-950 min-h-screen font-['Lexend']">
      <main className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-gray-500 mb-1">Total Students</p>
            <p className="text-2xl font-bold text-indigo-600">{students.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-gray-500 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {students.filter(s => s.progress < 100).length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-gray-500 mb-1">Completed</p>
            <p className="text-2xl font-bold text-blue-600">
              {students.filter(s => s.progress === 100).length}
            </p>
          </div>
        </div>
        
        {/* Filter Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="w-full lg:max-w-md">
            <SearchBar onSearch={(val) => {
              setQuery(val);
              setPage(1);
            }} placeholder="Search by name, ID or email..." />
          </div>
          
          <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            {["All", "In Progress", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSection(tab);
                  setPage(1);
                }}
                className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  section === tab ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-indigo-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {students.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800">
            <UserCheck size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-sm font-medium text-slate-400">No students assigned to you yet</p>
          </div>
        )}

        {/* Desktop Table View */}
        {students.length > 0 && (
          <>
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-gray-800/40 border-b border-slate-100 dark:border-gray-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-6">Student & ID</th>
                    {/* <th className="px-8 py-6">Location</th> */}
                    <th className="px-8 py-6">Package</th>
                    <th className="px-8 py-6">Contact</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                  {paginatedStudents.map((s) => (
                    <tr 
                      key={s.id} 
                      className="group hover:bg-slate-50/50 dark:hover:bg-gray-800/20 transition-all cursor-pointer" 
                      onClick={() => setSelectedStudent(s)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                            {s.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{s.name}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{s.studentId}</p>
                          </div>
                        </div>
                      </td>
                      {/* <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                          <MapPin size={12} className="text-teal-500" /> {s.location}
                        </div>
                      </td> */}
                      <td className="px-8 py-5">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {s.package}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-xs">
                          <p className="text-slate-600 dark:text-slate-400">{s.email}</p>
                          <p className="text-[10px] text-slate-400">{s.phone}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="opacity-0 group-hover:opacity-100 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {paginatedStudents.map((s) => (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedStudent(s)}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md active:scale-[0.98] transition-transform"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                        {s.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{s.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{s.studentId}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase">
                      Active
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <MapPin size={12} className="text-teal-500" /> {s.location}
                    </div> */}
                    
                    <div className="flex justify-between text-[10px]">
                      <span className="font-medium text-slate-600">Package:</span>
                      <span className="font-bold text-indigo-600">{s.package}</span>
                    </div>
                    
                    <div className="text-[10px] text-slate-500">
                      <p>{s.email}</p>
                      <p>{s.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredStudents.length > itemsPerPage && (
              <div className="p-4 md:p-8 flex justify-center border-t border-slate-100 dark:border-slate-800">
                <Pagination 
                  currentPage={page} 
                  totalItems={filteredStudents.length} 
                  itemsPerPage={itemsPerPage} 
                  onPageChange={setPage} 
                />
              </div>
            )}
          </>
        )}
      </main>

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