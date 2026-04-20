import { Component } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navigation } from "./components/Navigation";
import { PERMISSIONS } from "@school-portal/shared";

import { LoginPage }        from "./pages/LoginPage";
import { DashboardPage }    from "./pages/DashboardPage";
import { ApplyPage }        from "./pages/ApplyPage";
import { ResultsPage }      from "./pages/ResultsPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(err) { return { error: err }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "2rem", fontFamily: "monospace" }}>
          <h2>Something went wrong</h2>
          <pre style={{ color: "red", whiteSpace: "pre-wrap" }}>
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Navigation />
          <main className="main-content">
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Authenticated (any role) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Parent-only routes */}
              <Route
                path="/apply"
                element={
                  <ProtectedRoute permission={PERMISSIONS.SUBMIT_APPLICATION}>
                    <ApplyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results"
                element={
                  <ProtectedRoute permission={PERMISSIONS.VIEW_OWN_RESULTS}>
                    <ResultsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
