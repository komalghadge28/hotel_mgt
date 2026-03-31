import { BrowserRouter, Routes, Route } from "react-router-dom";

// User Pages
import Login from "./login.jsx";
import UserDashboard from "./UserDashboard.jsx";
import MultiStepForm from "./MultiStepForm.jsx";
import VerifyEdit from "./VerifyEdit.jsx";
import EmployeeOutForm from "./EmployeeOutForm.jsx";

import OutForm from "./OutForm.jsx"; // ✅ ADD THIS


// Admin Pages
import AdminRegister from "./admin/AdminRegister.jsx";
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import ManageUsers from "./admin/ManageUsers.jsx";
import ViewData from "./admin/ViewData.jsx";
import ViewDocuments from "./admin/ViewDocuments.jsx";
import EmployeeWorkReport from "./admin/EmployeeWorkReport.jsx";
import ProtectedRoute from "./admin/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= USER ROUTES ================= */}
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/room-booking" element={<MultiStepForm />} />
        <Route path="/verify-edit/:bookingId" element={<VerifyEdit />} />
        
        {/* ✅ NEW OUT FORM ROUTE */}
        <Route path="/out-form/:bookingId/:entryIdx" element={<OutForm />} />
        {/* Employee Final Out */}
        <Route path="/employee-out" element={<EmployeeOutForm />} />  
        

        {/* ================= ADMIN AUTH ROUTES ================= */}
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ================= PROTECTED ADMIN ROUTES ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <ManageUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/data"
          element={
            <ProtectedRoute>
              <ViewData />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/view-documents/:id"
          element={
            <ProtectedRoute>
              <ViewDocuments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/work-report"
          element={
            <ProtectedRoute>
              <EmployeeWorkReport />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;