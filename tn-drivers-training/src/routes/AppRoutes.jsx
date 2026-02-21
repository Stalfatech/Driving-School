import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import StudentPage from "../pages/StudentPage";
import Packages from "../pages/Packages";
import Schedule from "../pages/Schedule";
import Payments from "../pages/Payments"; 
// import Login from "../pages/Login";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/students" element={<StudentPage />} />
      <Route path="/packages" element={<Packages />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/payments" element={<Payments />} />
      {/* <Route path="/applications" element={<Applications />} />
      <Route path="/login" element={<Login />} /> */}
    </Routes>
  );
};

export default AppRoutes;
