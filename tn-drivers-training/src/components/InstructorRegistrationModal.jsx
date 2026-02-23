// import React from "react";
// import { X } from "lucide-react";

// const InstructorRegisterModal = ({ isOpen, onClose }) => {
//   if (!isOpen) return null;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onClose();
//   };

//   const handleReset = () => {
//     const form = document.getElementById("instructorRegForm");
//     if (form) form.reset();
//   };

//   return (
//     <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-['Lexend']">
//       <div className="bg-[#f0f7ff] dark:bg-background-dark w-full max-w-5xl h-full max-h-[92vh] rounded-4xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
//         {/* HEADER */}
//         <div className="flex items-center justify-between px-8 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
//           <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
//             <span>Instructors</span>
//             <span className="material-symbols-outlined text-sm">chevron_right</span>
//             <span className="text-slate-900 dark:text-white font-bold tracking-tight uppercase italic">Register Staff</span>
//           </div>
//           <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
//             <X size={20} />
//           </button>
//         </div>

//         {/* SCROLLABLE CONTENT */}
//         <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
//           <form id="instructorRegForm" onSubmit={handleSubmit} className="space-y-8">
            
//             {/* 1. Personal Information */}
//             <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
//               <h3 className="text-sm font-bold text-[#2563eb] dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
//                 <span className="material-symbols-outlined text-lg">person</span> Personal Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="flex flex-col gap-1.5">
//                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">First Name</label>
//                   <input type="text" placeholder="e.g. Jean" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" required />
//                 </div>
//                 <div className="flex flex-col gap-1.5">
//                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Last Name</label>
//                   <input type="text" placeholder="e.g. Dupont" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" required />
//                 </div>
//                 <div className="flex flex-col gap-1.5">
//                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Date of Birth</label>
//                   <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm text-white dark:text-white outline-none" required />
//                 </div>
//                 <div className="flex flex-col gap-1.5">
//                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Email Address</label>
//                   <input type="email" placeholder="jean.dupont@example.ca" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" required />
//                 </div>
//                 <div className="flex flex-col gap-1.5">
//                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Phone Number</label>
//                   <input type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" required />
//                 </div>
//                 <div className="flex flex-col gap-1.5">
//                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Primary Language</label>
//                   <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none">
//                     <option>English</option>
//                     <option>French</option>
//                     <option>Bilingual (EN/FR)</option>
//                   </select>
//                 </div>
//               </div>
//             </section>

//             {/* 2. Residential Address */}
//             <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
//               <h3 className="text-sm font-bold text-[#2563eb] dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
//                 <span className="material-symbols-outlined text-lg">home</span> Residential Address
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 <div className="md:col-span-2 flex flex-col gap-1.5">
//                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Street Address</label>
//                   <input type="text" placeholder="123 Maple Leaf Ave" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" />
//                 </div>
//                 <div className="flex flex-col gap-1.5">
//                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">City</label>
//                   <input type="text" placeholder="Toronto" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" />
//                 </div>
//                 <div className="flex flex-col gap-1.5">
//                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Province</label>
//                   <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none">
//                     <option>Ontario</option>
//                     <option>Quebec</option>
//                     <option>Newfoundland and Labrador</option>
//                   </select>
//                 </div>
//                 <div className="flex flex-col gap-1.5">
//                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Postal Code</label>
//                   <input type="text" placeholder="M5V 2L7" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" />
//                 </div>
//               </div>
//             </section>

//             {/* 3. Licensing & Certifications */}
//             <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
//               <h3 className="text-sm font-bold text-[#2563eb] dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
//                 <span className="material-symbols-outlined text-lg">badge</span> Licensing & Certifications
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//                 <div className="flex flex-col gap-1.5">
//                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Driver's License #</label>
//                   <input type="text" placeholder="D1234-56789-01234" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" required />
//                 </div>
//                 <div className="flex flex-col gap-1.5">
//                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Instructor License #</label>
//                   <input type="text" placeholder="INST-88291-AB" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" required />
//                 </div>
//                 <div className="flex flex-col gap-1.5">
//                   <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Instructor License Expiry</label>
//                   <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm text-slate-900 dark:text-white outline-none" required />
//                 </div>
//               </div>
              
//               <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight block mb-3">Qualified to Teach (Classes)</label>
//               <div className="flex flex-wrap gap-3">
//                 {["Class 5 (Car)", "Class 6 (Motorcycle)", "Class 1 (Commercial)", "Class 4 (Ambulance/Taxi)"].map((cls) => (
//                   <label key={cls} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
//                     <input type="checkbox" className="rounded text-[#2563eb] focus:ring-[#2563eb]" />
//                     <span className="text-sm font-medium dark:text-slate-300">{cls}</span>
//                   </label>
//                 ))}
//               </div>
//             </section>

//             {/* 4. Compliance & Documentation */}
//             <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm pb-10">
//               <h3 className="text-sm font-bold text-[#2563eb] dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
//                 <span className="material-symbols-outlined text-lg">verified_user</span> Compliance & Documentation
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div className="space-y-4">
//                   {[
//                     { label: "Criminal Record Check", sub: "Valid within last 6 months" },
//                     { label: "Vulnerable Sector Search", sub: "Required for teaching minors" }
//                   ].map((doc) => (
//                     <div key={doc.label} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-background-dark rounded-xl border border-slate-200 dark:border-slate-800">
//                       <div>
//                         <p className="text-sm font-bold dark:text-white">{doc.label}</p>
//                         <p className="text-[10px] text-slate-500 uppercase font-black">{doc.sub}</p>
//                       </div>
//                       <button type="button" className="text-[#2563eb] dark:text-blue-400 text-xs font-bold flex items-center gap-1 hover:underline">
//                         <span className="material-symbols-outlined text-sm">upload_file</span> Upload
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="space-y-6">
//                   <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-background-dark rounded-xl border border-slate-200 dark:border-slate-800">
//                     <div>
//                       <p className="text-sm font-bold dark:text-white">Driver Abstract (3-Year)</p>
//                       <p className="text-[10px] text-slate-500 uppercase font-black">Less than 6 demerits</p>
//                     </div>
//                     <button type="button" className="text-[#2563eb] dark:text-blue-400 text-xs font-bold flex items-center gap-1 hover:underline">
//                       <span className="material-symbols-outlined text-sm">upload_file</span> Upload
//                     </button>
//                   </div>
//                   <div>
//                     <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight block mb-2">Employment Status</label>
//                     <div className="flex gap-6">
//                       <label className="flex items-center gap-2 text-sm font-medium dark:text-slate-300 cursor-pointer">
//                         <input type="radio" name="status" defaultChecked className="text-[#2563eb] focus:ring-[#2563eb]" /> Full-time
//                       </label>
//                       <label className="flex items-center gap-2 text-sm font-medium dark:text-slate-300 cursor-pointer">
//                         <input type="radio" name="status" className="text-[#2563eb] focus:ring-[#2563eb]" /> Contractor
//                       </label>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </section>
//           </form>
//         </div>

//         {/* FOOTER */}
//         <div className="flex items-center justify-end gap-4 px-8 py-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
//           <button 
//             type="button"
//             onClick={handleReset} 
//             className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
//           >
//             Reset Form
//           </button>
//           <button 
//             type="submit"
//             form="instructorRegForm"
//             className="px-10 py-2.5 rounded-xl bg-[#2563eb] text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
//           >
//             Complete Registration
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InstructorRegisterModal;














import React from "react";
import { X } from "lucide-react";

const InstructorRegisterModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  const handleReset = () => {
    const form = document.getElementById("instructorRegForm");
    if (form) form.reset();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-['Lexend']">
      <div className="bg-[#f0f7ff] dark:bg-background-dark w-full max-w-5xl h-full max-h-[92vh] rounded-4xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <span>Instructors</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-slate-900 dark:text-white font-bold tracking-tight uppercase italic">Register Staff</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          <form id="instructorRegForm" onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Personal Information */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-[#2563eb] dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">person</span> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">First Name</label>
                  <input type="text" placeholder="e.g. Jean" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Last Name</label>
                  <input type="text" placeholder="e.g. Dupont" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Date of Birth</label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm text-slate-900 dark:text-white outline-none" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Email Address</label>
                  <input type="email" placeholder="jean.dupont@example.ca" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Phone Number</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Primary Language</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none">
                    <option>English</option>
                    <option>French</option>
                    <option>Bilingual (EN/FR)</option>
                  </select>
                </div>
                {/* NEW LOCATION FIELD */}
                <div className="flex flex-col gap-1.5 md:col-span-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Assigned Location</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" required>
                    <option value="">Select a location</option>
                    <option value="Burin">Burin</option>
                    <option value="Grand Falls">Grand Falls</option>
                    <option value="Marystown">Marystown</option>
                    <option value="St. John’s / Mount Pearl">St. John’s / Mount Pearl</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 2. Residential Address */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-[#2563eb] dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">home</span> Residential Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Street Address</label>
                  <input type="text" placeholder="123 Maple Leaf Ave" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">City</label>
                  <input type="text" placeholder="Toronto" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Province</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none">
                    <option>Ontario</option>
                    <option>Quebec</option>
                    <option>Newfoundland and Labrador</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Postal Code</label>
                  <input type="text" placeholder="M5V 2L7" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" />
                </div>
              </div>
            </section>

            {/* 3. Licensing & Certifications */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-[#2563eb] dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">badge</span> Licensing & Certifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Driver's License #</label>
                  <input type="text" placeholder="D1234-56789-01234" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Instructor License #</label>
                  <input type="text" placeholder="INST-88291-AB" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm dark:text-white outline-none" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Instructor License Expiry</label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-background-dark text-sm text-slate-900 dark:text-white outline-none" required />
                </div>
              </div>
              
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight block mb-3">Qualified to Teach (Classes)</label>
              <div className="flex flex-wrap gap-3">
                {["Class 5 (Car)", "Class 6 (Motorcycle)", "Class 1 (Commercial)", "Class 4 (Ambulance/Taxi)"].map((cls) => (
                  <label key={cls} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                    <input type="checkbox" className="rounded text-[#2563eb] focus:ring-[#2563eb]" />
                    <span className="text-sm font-medium dark:text-slate-300">{cls}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* 4. Compliance & Documentation */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm pb-10">
              <h3 className="text-sm font-bold text-[#2563eb] dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">verified_user</span> Compliance & Documentation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {[
                    { label: "Criminal Record Check", sub: "Valid within last 6 months" },
                    { label: "Vulnerable Sector Search", sub: "Required for teaching minors" }
                  ].map((doc) => (
                    <div key={doc.label} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-background-dark rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-sm font-bold dark:text-white">{doc.label}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">{doc.sub}</p>
                      </div>
                      <button type="button" className="text-[#2563eb] dark:text-blue-400 text-xs font-bold flex items-center gap-1 hover:underline">
                        <span className="material-symbols-outlined text-sm">upload_file</span> Upload
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-background-dark rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-bold dark:text-white">Driver Abstract (3-Year)</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black">Less than 6 demerits</p>
                    </div>
                    <button type="button" className="text-[#2563eb] dark:text-blue-400 text-xs font-bold flex items-center gap-1 hover:underline">
                      <span className="material-symbols-outlined text-sm">upload_file</span> Upload
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight block mb-2">Employment Status</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-sm font-medium dark:text-slate-300 cursor-pointer">
                        <input type="radio" name="status" defaultChecked className="text-[#2563eb] focus:ring-[#2563eb]" /> Full-time
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium dark:text-slate-300 cursor-pointer">
                        <input type="radio" name="status" className="text-[#2563eb] focus:ring-[#2563eb]" /> Contractor
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-4 px-8 py-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button 
            type="button"
            onClick={handleReset} 
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Reset Form
          </button>
          <button 
            type="submit"
            form="instructorRegForm"
            className="px-10 py-2.5 rounded-xl bg-[#2563eb] text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            Complete Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorRegisterModal;