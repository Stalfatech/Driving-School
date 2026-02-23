import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import StudentPage from "../pages/StudentPage";
import Packages from "../pages/Packages";
import Schedule from "../pages/Schedule";
import Payments from "../pages/Payments"; 
import Application from "../pages/Application";
import InstructorFleet from "../pages/Instructors";
import FleetManagement from "../pages/Fleetmanagement";
import Finances from "../pages/Finances";
import Settings from "../pages/Settings";
// import Login from "../pages/Login";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/students" element={<StudentPage />} />
      <Route path="/packages" element={<Packages />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/applications" element={<Application />} />
      <Route path="/instructors" element={<InstructorFleet />} />
      <Route path="/fleet" element={<FleetManagement />} />
      <Route path="/finances" element={<Finances />} />
      <Route path="/settings" element={<Settings />} />
      {/* 
      <Route path="/login" element={<Login />} /> */}
    </Routes>
  );
};

export default AppRoutes;
