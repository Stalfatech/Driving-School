// import { useState } from "react";
// import { Outlet } from "react-router-dom";
// import InstructorSidebar from "../components/instructor/InstructorSidebar";

// const InstructorLayout = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   return (
//     <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
//       <InstructorSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
//       <div className="flex-1 flex flex-col">
//         {/* We don't need a global navbar here because the InstructorDashboard has its own custom one */}
//         <div className="flex-1 overflow-y-auto">
//           <Outlet /> {/* This renders the Instructor Pages */}
//         </div>
//       </div>
//     </div>
//   );
// };
// export default InstructorLayout;
// InstructorLayout.jsx





// import React, { useState } from "react";
// import { Outlet } from "react-router-dom";
// import InstructorSidebar from "../components/instructor/InstructorSidebar";
// import InstructorNavbar from "../components/instructor/InstructorNavbar";

// const InstructorLayout = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <div className="flex h-screen bg-slate-950 overflow-hidden">
//       {/* Sidebar stays fixed on the left */}
//       <InstructorSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//         {/* Navbar stays fixed at the top */}
//         <InstructorNavbar isOpen={isOpen} setIsOpen={setIsOpen} />

//         {/* Page Content scrolls underneath the Navbar */}
//         <main className="flex-1 overflow-y-auto p-4 md:p-8">
//           <Outlet /> 
//         </main>
//       </div>
//     </div>
//   );
// };
// export default InstructorLayout;




import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import InstructorSidebar from "../components/instructor/InstructorSidebar";
import InstructorNavbar from "../components/instructor/InstructorNavbar";

const InstructorLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    /* Change 1: Added dynamic background classes and transition for smooth switching */
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      
      {/* Sidebar stays fixed on the left */}
      <InstructorSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar stays fixed at the top */}
        <InstructorNavbar isOpen={isOpen} setIsOpen={setIsOpen} />

        {/* Page Content scrolls underneath the Navbar */}
        {/* Change 2: Ensure the main container also respects the theme background */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;