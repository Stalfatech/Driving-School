import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import InstructorLayout from "../layouts/InstructorLayout";
//public page 
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import ResetPassword from "../pages/ResetPassword";
import RegistrationPage from "../pages/RegistrationPage";


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
import InvoiceManager from "../pages/InvoiceManager";
// ... other admin imports

// Instructor Pages
import InstructorDashboard from "../pages/instructor/Dashboard";
import MyStudents from "../pages/instructor/MyStudents";
import NotificationPage from "../pages/instructor/NotificationPage";
import InstructorSchedule from "../pages/instructor/MySchedule";
import InstructorExpenses from "../pages/instructor/MyExpenses";

//student pages
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentLayout from "../layouts/StudentLayout";
import TestEvaluationPage from "../pages/student/TestEvaluate";
import StudentNotificationPage from "../pages/student/StudentNotificationPage";
import MyPackages from "../pages/student/MyPackages";
import StudentProfile from "../pages/student/StudentProfile";
import StudentPayments from "../pages/student/StudentPayments";




const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTE */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<RegistrationPage />} />



      {/* 2. ADMIN ROUTES - Notice path="/admin" added to the parent */}
      <Route element={<AdminLayout />}>
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Students" element={<StudentPage />} />
        <Route path="/Packages" element={<Packages />} />
        <Route path="/Schedule" element={<Schedule />} />
        <Route path="/Payments" element={<Payments />} />
        <Route path="/Applications" element={<Application />} />
        <Route path="/Instructors" element={<InstructorFleet />} />
        <Route path="/Invoice" element={<InvoiceManager />} />"
        <Route path="/Fleet" element={<FleetManagement />} />
        <Route path="/Finances" element={<Finances />} />
        <Route path="/Settings" element={<Settings />} />
      </Route>

      {/* 3. INSTRUCTOR ROUTES */}
      <Route path="/instructor" element={<InstructorLayout />}>
        <Route index element={<InstructorDashboard />} />    {/* URL: /instructor */}
        <Route path="Students" element={<MyStudents />} />   {/* URL: /instructor/students */}
        <Route path="Notifications" element={<NotificationPage />} />
        <Route path="Schedule" element={<InstructorSchedule />} />
        <Route path="Expenses" element={<InstructorExpenses />} />
      </Route>

      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<StudentDashboard />} />
        <Route path="test-evaluation" element={<TestEvaluationPage />} />
        <Route path="notifications" element={<StudentNotificationPage />} />
        <Route path="mypackage" element={<MyPackages />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="payments" element={<StudentPayments />} />
      </Route>

    </Routes>
  );
};
export default AppRoutes;