import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
// import Students from "../pages/Students";
// import Applications from "../pages/Applications";
// import Login from "../pages/Login";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {/* <Route path="/students" element={<Students />} />
      <Route path="/applications" element={<Applications />} />
      <Route path="/login" element={<Login />} /> */}
    </Routes>
  );
};

export default AppRoutes;
