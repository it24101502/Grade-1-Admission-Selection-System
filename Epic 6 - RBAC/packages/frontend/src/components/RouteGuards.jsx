import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Scrum-29: Block unauthenticated access
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={styles.loading}>Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// Scrum-29 / Scrum-30: Block unauthorized roles from specific routes
export function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={styles.loading}>Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!allowedRoles.includes(user.role)) {
    // Scrum-29: Redirect to their own dashboard instead of showing a blank error
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

const styles = {
  loading: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100vh", fontSize: "1.1rem", color: "#666",
  },
};
