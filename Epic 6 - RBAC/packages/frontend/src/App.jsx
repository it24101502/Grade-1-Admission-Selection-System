import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { ProtectedRoute, RoleRoute } from "./components/RouteGuards.jsx";
import { ROLES } from "./constants.js";

import Navbar from "./components/Navbar.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ApplicationsPage from "./pages/ApplicationsPage.jsx";
import NewApplicationPage from "./pages/NewApplicationPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AccessDeniedPage from "./pages/AccessDeniedPage.jsx";

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

        {/* All authenticated users */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />

        {/* Applications — readable by all roles, submit by Parent only */}
        <Route path="/applications" element={
          <ProtectedRoute><ApplicationsPage /></ProtectedRoute>
        } />

        {/* Scrum-27: Only Parents can submit new applications */}
        <Route path="/applications/new" element={
          <RoleRoute allowedRoles={[ROLES.PARENT]}>
            <NewApplicationPage />
          </RoleRoute>
        } />

        {/* Results — readable by all, write by Judge/Admin */}
        <Route path="/results" element={
          <ProtectedRoute><ResultsPage /></ProtectedRoute>
        } />
        <Route path="/results/new" element={
          <RoleRoute allowedRoles={[ROLES.JUDGE, ROLES.ADMIN]}>
            <ResultsPage />
          </RoleRoute>
        } />

        {/* Scrum-30: Admin-only routes */}
        <Route path="/admin/users" element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <UsersPage />
          </RoleRoute>
        } />
        <Route path="/admin/register" element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <RegisterPage />
          </RoleRoute>
        } />

        {/* Access denied */}
        <Route path="/access-denied" element={
          <ProtectedRoute><AccessDeniedPage /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
