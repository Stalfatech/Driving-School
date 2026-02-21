import { Routes, Route, Navigate } from "react-router-dom";
import Application from "../Pages/Application";
import InstructorFleet from "../Pages/Instructors";
import FleetManagement from "../Pages/Fleetmanagement";
import Finances from "../Pages/Finances";
import Settings from "../Pages/Settings";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/applications" />} />
      <Route path="/applications" element={<Application />} />
      <Route path="/instructors" element={<InstructorFleet />} />
      <Route path="/fleet" element={<FleetManagement />} />
      <Route path="/finances" element={<Finances />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default AppRoutes;
