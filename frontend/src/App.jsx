// FILE: frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage            from './pages/LandingPage';
import LoginPage              from './pages/LoginPage';
import ParentDashboard        from './pages/ParentDashboard';
import ApplicationFormPage    from './pages/ApplicationFormPage';
import DocControllerDashboard from './pages/DocControllerDashboard';
import JudgeDashboard         from './pages/JudgeDashboard';
import AdminDashboard         from './pages/AdminDashboard';

const ROLE_DASHBOARDS = {
  PARENT:              '/dashboard',
  DOCUMENT_CONTROLLER: '/dc/dashboard',
  JUDGE:               '/judge/dashboard',
  ADMIN:               '/admin/dashboard',
};

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to={ROLE_DASHBOARDS[user.role] || '/login'} replace />;
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <LandingPage />;
  return <Navigate to={ROLE_DASHBOARDS[user.role] || '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/"      element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />}    />

          {/* Parent */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['PARENT']}>
              <ParentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/apply" element={
            <ProtectedRoute allowedRoles={['PARENT']}>
              <ApplicationFormPage />
            </ProtectedRoute>
          } />

          {/* Document Controller */}
          <Route path="/dc/dashboard" element={
            <ProtectedRoute allowedRoles={['DOCUMENT_CONTROLLER']}>
              <DocControllerDashboard />
            </ProtectedRoute>
          } />

          {/* Judge — Step 5 & 6 */}
          <Route path="/judge/dashboard" element={
            <ProtectedRoute allowedRoles={['JUDGE']}>
              <JudgeDashboard />
            </ProtectedRoute>
          } />

          {/* Admin — Step 7 */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        theme="dark"
        toastStyle={{
          background: 'var(--navy-800)',
          border: '1px solid var(--border-gold)',
          color: 'var(--text-primary)',
        }}
      />
    </AuthProvider>
  );
}