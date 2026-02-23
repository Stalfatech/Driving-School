import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex-1 flex flex-col">
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="flex-1 overflow-y-auto">
          <Outlet /> {/* This renders the Admin Pages */}
        </div>
      </div>
    </div>
  );
};
export default AdminLayout;