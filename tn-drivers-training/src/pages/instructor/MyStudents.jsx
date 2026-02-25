import React, { useState } from "react";

import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import InstructorStudentDetail from "../../components/instructor/InstructorStudentDetail";
import { Eye, MapPin } from "lucide-react";

const MyStudents = () => {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Mock Student Data
  const [students] = useState([
    { id: "STU-001", name: "Alex Rivera", location: "Burin", progress: 65, status: "Active", email: "alex@example.com", package: "Full GDL", payment: "Balance Due" },
    { id: "STU-003", name: "Yuki Tanaka", location: "Burin", progress: 100, status: "Completed", email: "yuki@example.com", package: "Pro Highway", payment: "Paid" },
    { id: "STU-004", name: "Muhammed Salman", location: "Marystown", progress: 40, status: "Active", email: "salman@tech.com", package: "Basic 10hr", payment: "Balance Due" },
  ]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(query.toLowerCase());
    if (section === "Completed") return matchesSearch && s.progress === 100;
    if (section === "In Progress") return matchesSearch && s.progress < 100;
    return matchesSearch;
  });

  return (
    <div className="flex-1 bg-slate-50 dark:bg-gray-950 min-h-screen font-['Lexend']">
      
      
      <main className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Filter Header - Stacked on Mobile, Row on Desktop */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="w-full lg:max-w-md">
            <SearchBar onSearch={(val) => setQuery(val)} placeholder="Filter your students..." />
          </div>
          
          <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            {["All", "In Progress", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSection(tab)}
                className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  section === tab ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-indigo-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* --- DESKTOP TABLE VIEW (Visible on md and up) --- */}
        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-gray-800/40 border-b border-slate-100 dark:border-gray-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Student & ID</th>
                <th className="px-8 py-6">Location</th>
                <th className="px-8 py-6">Progress</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="group hover:bg-slate-50/50 dark:hover:bg-gray-800/20 transition-all cursor-pointer" onClick={() => setSelectedStudent(s)}>
                  <td className="px-8 py-5 flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">{s.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{s.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{s.id}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      <MapPin size={12} className="text-teal-500" /> {s.location}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${s.progress === 100 ? 'bg-teal-500' : 'bg-indigo-600'}`} style={{ width: `${s.progress}%` }} />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase mt-1 inline-block">{s.progress}% Complete</span>
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

        {/* --- MOBILE CARD VIEW (Visible on small screens only) --- */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredStudents.map((s) => (
            <div 
              key={s.id} 
              onClick={() => setSelectedStudent(s)}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md active:scale-[0.98] transition-transform"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">{s.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{s.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{s.id}</p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase ${s.progress === 100 ? 'bg-teal-50 text-teal-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {s.progress === 100 ? 'Completed' : 'In Progress'}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <MapPin size={12} className="text-teal-500" /> {s.location}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                    <span>Course Progress</span>
                    <span>{s.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.progress === 100 ? 'bg-teal-500' : 'bg-indigo-600'}`} style={{ width: `${s.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination - Simplified for mobile if needed */}
        <div className="p-4 md:p-8 flex justify-center border-t border-slate-100 dark:border-slate-800">
          <Pagination currentPage={page} totalItems={filteredStudents.length} itemsPerPage={10} onPageChange={setPage} />
        </div>
      </main>

      {selectedStudent && (
        <InstructorStudentDetail student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
};

export default MyStudents;