import { Link } from "react-router-dom";
import { usePermission } from "../hooks/usePermission";

export function UnauthorizedPage() {
  const { role } = usePermission();

  return (
    <div className="page unauthorized-page">
      <div className="unauthorized-card">
        <span className="unauthorized-icon">🔒</span>
        <h1>Access Denied</h1>
        <p>
          Your account role (<strong>{role ?? "unknown"}</strong>) does not have
          permission to view this page.
        </p>
        <Link to="/dashboard" className="btn-primary">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
