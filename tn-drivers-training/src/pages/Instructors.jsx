import React, { useState } from 'react';
import InstructorDetailModal from '../components/InstructorDetailModal';
import InstructorRegistrationModal from '../components/InstructorRegistrationModal';
import { 
  Search, BadgeCheck, AlertTriangle, Eye, RefreshCcw, Car, 
  Download, Plus, X, Phone, User, Ban, CheckCircle
} from 'lucide-react';

const Instructors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  const [instructors, setInstructors] = useState([
    { 
      id: "INST-9821", 
      name: "Jean Dupont", 
      contact: "709-555-0123", 
      email: "jean.d@example.com",
      dob: "1985-06-12",
      address: "123 Maple Leaf Ave, Toronto, ON",
      license: "D1234-56789-01234",
      expiry: "2026-03-10", 
      vehicle: "Toyota Corolla", 
      plate: "V-882", 
      success: 92, 
      location: "Burin",
      status: "Active",
      students: [
        { id: "STU-101", name: "Alice Cooper", progress: "60%" },
        { id: "STU-102", name: "Bob Marley", progress: "20%" }
      ]
    },
    { 
      id: "INST-1122", 
      name: "Marc Leblanc", 
      contact: "709-555-9988", 
      email: "m.leblanc@example.com",
      dob: "1982-11-05",
      address: "77 Water St, Burin, NL",
      license: "L5544-33221-11223",
      expiry: "2025-12-30", 
      vehicle: "Hyundai Elantra", 
      plate: "V-901", 
      success: 95, 
      location: "Burin",
      status: "Active",
      students: [{ id: "STU-105", name: "Kevin Hart", progress: "10%" }]
    },
    { 
      id: "INST-4432", 
      name: "Sarah Miller", 
      contact: "709-555-4432", 
      email: "s.miller@example.com",
      dob: "1990-02-20",
      address: "456 Oak St, St. John's, NL",
      license: "S9876-54321-09876",
      expiry: "2026-05-20", 
      vehicle: "Honda Civic", 
      plate: "V-104", 
      success: 88, 
      location: "St. John’s / Mount Pearl",
      status: "Blocked",
      students: []
    },
    { 
      id: "INST-5566", 
      name: "David Smith", 
      contact: "709-555-6677", 
      email: "d.smith@example.com",
      dob: "1988-08-15",
      address: "12 Pine Rd, Grand Falls, NL",
      license: "K1122-33445-55667",
      expiry: "2027-01-10", 
      vehicle: "Ford Focus", 
      plate: "V-302", 
      success: 90, 
      location: "Grand Falls",
      status: "Active",
      students: [{ id: "STU-109", name: "Emma Watson", progress: "45%" }]
    }
  ]);

  // Function to handle adding new instructor
  const handleAddInstructor = (newIns) => {
    const formattedInstructor = {
      ...newIns,
      id: `INST-${Math.floor(1000 + Math.random() * 9000)}`,
      success: 0, 
      status: "Active",
      students: []
    };
    setInstructors((prev) => [...prev, formattedInstructor]);
  };

  // NEW: Function to handle updating instructor details (e.g., Location)
  const handleUpdateInstructor = (id, updatedFields) => {
    setInstructors(prev => prev.map(ins => 
      ins.id === id ? { ...ins, ...updatedFields } : ins
    ));
    // Also update the selectedInstructor state so the modal stays in sync
    if (selectedInstructor && selectedInstructor.id === id) {
      setSelectedInstructor(prev => ({ ...prev, ...updatedFields }));
    }
  };

  const toggleBlockStatus = (id) => {
    setInstructors(prev => prev.map(ins => 
      ins.id === id ? { ...ins, status: ins.status === "Blocked" ? "Active" : "Blocked" } : ins
    ));
  };

  const filteredInstructors = instructors.filter(ins => {
    const matchesLocation = locationFilter === 'All Locations' || ins.location === locationFilter;
    const matchesSearch = ins.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ins.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLocation && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-slate-200 transition-colors duration-300">
      
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 md:px-8 py-4 sticky top-0 z-20 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 max-w-350 mx-auto">
          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
              <input 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal/50 dark:text-white" 
                placeholder="Search name or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              value={locationFilter} 
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full md:w-48 px-4 py-2.5 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white appearance-none cursor-pointer"
            >
              <option>All Locations</option>
              <option value="Burin">Burin</option>
              <option value="Grand Falls">Grand Falls</option>
              <option value="Marystown">Marystown</option>
              <option value="St. John’s / Mount Pearl">St. John’s / Mount Pearl</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase transition-all hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-transparent md:border-slate-200 md:dark:border-slate-800">
              <Download size={16} /> <span className="hidden sm:inline">Export</span>
            </button>
            <button 
              onClick={() => setIsRegModalOpen(true)} 
              className="flex-2 md:flex-none flex items-center justify-center gap-2 bg-teal px-6 py-2.5 text-white rounded-xl shadow-lg shadow-teal/20 transition-all active:scale-95 text-sm font-bold whitespace-nowrap"
            >
              <Plus size={20} /> New Instructor
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 space-y-6 max-w-350 mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Instructors Management</h1>
            <p className="text-xs md:text-sm text-slate-500">Manage performance, status, and students reassignments.</p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {filteredInstructors.map((ins) => (
              <div key={ins.id} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`size-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg ${ins.status === 'Blocked' ? 'bg-slate-400' : 'bg-teal'}`}>
                      {ins.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold dark:text-white text-sm">{ins.name}</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">{ins.id} • {ins.location}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    ins.status === "Active" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10" : "bg-rose-100 text-rose-600 dark:bg-rose-500/10"
                  }`}>
                    {ins.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Success: {ins.success}%</span>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedInstructor(ins)} className="p-2 bg-sky-100 dark:bg-sky-500/10 text-sky-600 rounded-lg"><Eye size={16} /></button>
                    <button onClick={() => toggleBlockStatus(ins.id)} className={`p-2 rounded-lg ${ins.status === 'Blocked' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {ins.status === 'Blocked' ? <CheckCircle size={16} /> : <Ban size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-[#1f2937] text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Instructor Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Success Rate</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredInstructors.map((ins) => (
                    <tr key={ins.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`size-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${ins.status === 'Blocked' ? 'bg-slate-400' : 'bg-teal'}`}>
                            {ins.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{ins.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">ID: {ins.id} • {ins.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                          ins.status === "Active" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
                        }`}>
                          {ins.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-white">
                          {ins.success}%
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedInstructor(ins)} className="p-2 bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg"><Eye size={16} /></button>
                          <button onClick={() => toggleBlockStatus(ins.id)} className={`p-2 rounded-lg ${ins.status === 'Blocked' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {ins.status === 'Blocked' ? <CheckCircle size={16} /> : <Ban size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <InstructorRegistrationModal 
        isOpen={isRegModalOpen} 
        onClose={() => setIsRegModalOpen(false)} 
        onAdd={handleAddInstructor}
      />
      
      {selectedInstructor && (
        <InstructorDetailModal 
          instructor={selectedInstructor} 
          onClose={() => setSelectedInstructor(null)} 
          allInstructors={instructors.filter(i => i.id !== selectedInstructor.id)}
          onUpdate={handleUpdateInstructor} // PASSING UPDATE PROP
        />
      )}
    </div>
  );
};

export default Instructors;