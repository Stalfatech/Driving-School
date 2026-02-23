import { useState } from "react";
import { Outlet } from "react-router-dom";
import InstructorSidebar from "../components/instructor/InstructorSidebar";

const InstructorLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
      <InstructorSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex-1 flex flex-col">
        {/* We don't need a global navbar here because the InstructorDashboard has its own custom one */}
        <div className="flex-1 overflow-y-auto">
          <Outlet /> {/* This renders the Instructor Pages */}
        </div>
      </div>
    </div>
  );
};
export default InstructorLayout;