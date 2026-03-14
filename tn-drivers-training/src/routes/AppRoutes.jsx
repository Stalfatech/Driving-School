import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import InstructorLayout from "../layouts/InstructorLayout";
//public page 
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import ResetPassword from "../pages/ResetPassword";

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
      {/* 1. PUBLIC ROUTE */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />


      {/* 2. ADMIN ROUTES - Notice path="/admin" added to the parent */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />              {/* URL: /admin */}
        <Route path="students" element={<StudentPage />} />   {/* URL: /admin/students */}
        <Route path="packages" element={<Packages />} />     {/* URL: /admin/packages */}
        <Route path="schedule" element={<Schedule />} />     {/* URL: /admin/schedule */}
        <Route path="payments" element={<Payments />} />     {/* URL: /admin/payments */}
        <Route path="applications" element={<Application />} /> {/* URL: /admin/applications */}
        <Route path="instructors" element={<InstructorFleet />} />
        <Route path="fleet" element={<FleetManagement />} />
        <Route path="finances" element={<Finances />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 3. INSTRUCTOR ROUTES */}
      <Route path="/instructor" element={<InstructorLayout />}>
        <Route index element={<InstructorDashboard />} />    {/* URL: /instructor */}
        <Route path="students" element={<MyStudents />} />   {/* URL: /instructor/students */}
        <Route path="notifications" element={<NotificationPage />} />
        <Route path="schedule" element={<InstructorSchedule />} />
        <Route path="expenses" element={<InstructorExpenses />} />
      </Route>
    </Routes>
  );
};
export default AppRoutes;