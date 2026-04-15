// FILE: frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage            from './pages/LandingPage';
import ParentDashboard        from './pages/ParentDashboard';
import ApplicationFormPage    from './pages/ApplicationFormPage';
import DocControllerDashboard from './pages/DocControllerDashboard';
import JudgeDashboard         from './pages/JudgeDashboard';
import AdminDashboard         from './pages/AdminDashboard';

const ROLE_ROUTES = {
  PARENT:              '/dashboard',
  DOCUMENT_CONTROLLER: '/dc/dashboard',
  JUDGE:               '/judge/dashboard',
  ADMIN:               '/admin/dashboard',
};

function routeForRole(role) {
  if (role == null || role === '') return '/';
  const key = String(role).toUpperCase();
  return ROLE_ROUTES[key] || '/';
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  const roleKey = user.role != null ? String(user.role).toUpperCase() : '';
  if (allowedRoles && !allowedRoles.includes(roleKey))
    return <Navigate to={routeForRole(user.role)} replace />;
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (user) return <Navigate to={routeForRole(user.role)} replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page IS the home — no separate login page */}
          <Route path="/"        element={<HomeRedirect />} />
          <Route path="/login"   element={<Navigate to="/" replace />} />
          <Route path="/login/*" element={<Navigate to="/" replace />} />

          {/* Parent */}
          <Route path="/dashboard"     element={<ProtectedRoute allowedRoles={['PARENT']}><ParentDashboard /></ProtectedRoute>} />
          <Route path="/apply/:slotId" element={<ProtectedRoute allowedRoles={['PARENT']}><ApplicationFormPage /></ProtectedRoute>} />
          <Route path="/apply"         element={<ProtectedRoute allowedRoles={['PARENT']}><ApplicationFormPage /></ProtectedRoute>} />

          {/* Document Controller */}
          <Route path="/dc/dashboard"    element={<ProtectedRoute allowedRoles={['DOCUMENT_CONTROLLER']}><DocControllerDashboard /></ProtectedRoute>} />

          {/* Judge */}
          <Route path="/judge/dashboard" element={<ProtectedRoute allowedRoles={['JUDGE']}><JudgeDashboard /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

          {/* Everything else → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer position="bottom-right" autoClose={4000} theme="dark"
        toastStyle={{ background:'#071e47', border:'1px solid rgba(212,160,23,0.4)', color:'#f0e6c8' }} />
    </AuthProvider>
  );
}