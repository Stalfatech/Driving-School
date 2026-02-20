import { Routes, Route, Navigate } from "react-router-dom";
import Application from "../Pages/Application";
import InstructorFleet from "../Pages/Instructors";
import FleetManagement from "../Pages/Fleetmanagement";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/applications" />} />
      <Route path="/applications" element={<Application />} />
      <Route path="/instructors" element={<InstructorFleet />} />
      <Route path="/fleet" element={<FleetManagement />} />
    </Routes>
  );
};

export default AppRoutes;
