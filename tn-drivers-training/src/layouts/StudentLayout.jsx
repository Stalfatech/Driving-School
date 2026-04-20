import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/student/StudentSidebar";
import StudentNavbar from "../components/student/StudentNavbar";

const StudentLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      
      {/* Sidebar stays fixed on the left */}
      <StudentSidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar stays fixed at the top */}
        <StudentNavbar isOpen={isOpen} setIsOpen={setIsOpen} />

        {/* Page Content scrolls underneath the Navbar */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;