import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermission } from "../hooks/usePermission";
import { PermissionGate } from "../components/PermissionGate";
import { PERMISSIONS } from "@school-portal/shared";

export function DashboardPage() {
  const { user } = useAuth();
  const { role } = usePermission();

  return (
    <div className="page dashboard-page">
      <h1>Welcome, {user?.email}</h1>
      <p className="role-label">
        Logged in as: <strong>{role}</strong>
      </p>

      <div className="card-grid">
        {/* ── Parent cards ─────────────────────────── */}
        <PermissionGate permission={PERMISSIONS.SUBMIT_APPLICATION}>
          <Link to="/apply" className="dashboard-card card-apply">
            <span className="card-icon">📝</span>
            <h3>Submit Application</h3>
            <p>Apply for school admission</p>
          </Link>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.VIEW_OWN_RESULTS}>
          <Link to="/results" className="dashboard-card card-results">
            <span className="card-icon">📊</span>
            <h3>My Results</h3>
            <p>View your application results</p>
          </Link>
        </PermissionGate>

        {/* ── Judge cards ──────────────────────────── */}
        <PermissionGate permission={PERMISSIONS.REVIEW_APPLICATIONS}>
          <Link to="/review" className="dashboard-card card-review">
            <span className="card-icon">🔍</span>
            <h3>Review Applications</h3>
            <p>Score and evaluate applications</p>
          </Link>
        </PermissionGate>

        {/* ── Admin cards ──────────────────────────── */}
        <PermissionGate permission={PERMISSIONS.MANAGE_USERS}>
          <Link to="/admin" className="dashboard-card card-admin">
            <span className="card-icon">⚙️</span>
            <h3>Admin Panel</h3>
            <p>Manage users and system settings</p>
          </Link>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.EXPORT_DATA}>
          <Link to="/admin/export" className="dashboard-card card-export">
            <span className="card-icon">📤</span>
            <h3>Export Data</h3>
            <p>Download system reports</p>
          </Link>
        </PermissionGate>
      </div>
    </div>
  );
}
