import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import InstructorLayout from "../layouts/InstructorLayout";

// Admin Pages
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
// ... other admin imports

// Instructor Pages
import InstructorDashboard from "../pages/instructor/Dashboard";
import MyStudents from "../pages/instructor/MyStudents";
import NotificationPage from "../pages/instructor/NotificationPage";
import InstructorSchedule from "../pages/instructor/MySchedule";
import InstructorExpenses from "../pages/instructor/MyExpenses";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ADMIN ROUTES */}
      <Route element={<AdminLayout />}>
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
      </Route>

      {/* INSTRUCTOR ROUTES */}
      <Route path="/instructor" element={<InstructorLayout />}>
        <Route index element={<InstructorDashboard />} /> {/* /instructor */}
        <Route path="/instructor/students" element={<MyStudents />} />
        <Route path="/instructor/notifications" element={<NotificationPage />} />
        <Route path="/instructor/schedule" element={<InstructorSchedule />} />
        <Route path="/instructor/expenses" element={<InstructorExpenses />} />
      </Route>

      {/* LOGIN ROUTE (Outer - no sidebar) */}
      {/* <Route path="/login" element={<Login />} /> */}
    </Routes>
  );
};

export default AppRoutes;
