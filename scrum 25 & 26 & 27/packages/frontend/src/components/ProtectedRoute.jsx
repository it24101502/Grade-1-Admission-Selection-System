import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermission } from "../hooks/usePermission";

/**
 * Wraps a route to require authentication (and optionally a permission).
 *
 * @param {string} [permission]  – if provided, also checks the user's permission
 * @param {string} [redirectTo]  – where to redirect on failure (default "/login")
 *
 * @example
 * <Route
 *   path="/apply"
 *   element={
 *     <ProtectedRoute permission="submit_application">
 *       <ApplicationForm />
 *     </ProtectedRoute>
 *   }
 * />
 */
export function ProtectedRoute({
  children,
  permission,
  redirectTo = "/login",
}) {
  const { user } = useAuth();
  const { can } = usePermission();

  if (!user) return <Navigate to={redirectTo} replace />;

  if (permission && !can(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
