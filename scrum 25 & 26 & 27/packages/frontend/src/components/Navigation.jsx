import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS } from "@school-portal/shared";

export function Navigation() {
  const { user, logout } = useAuth();
  const { can } = usePermission();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">🏫 School Portal</Link>
      </div>

      <ul className="navbar-links">
        {/* Always visible to authenticated users */}
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>

        {/* Parent-only links */}
        {can(PERMISSIONS.SUBMIT_APPLICATION) && (
          <li>
            <Link to="/apply">Apply</Link>
          </li>
        )}
        {can(PERMISSIONS.VIEW_OWN_RESULTS) && (
          <li>
            <Link to="/results">My Results</Link>
          </li>
        )}

        {/* Judge-only links */}
        {can(PERMISSIONS.REVIEW_APPLICATIONS) && (
          <li>
            <Link to="/review">Review Applications</Link>
          </li>
        )}

        {/* Admin-only links */}
        {can(PERMISSIONS.MANAGE_USERS) && (
          <li>
            <Link to="/admin">Admin Panel</Link>
          </li>
        )}
      </ul>

      <div className="navbar-user">
        <span className="user-role-badge" data-role={user.role}>
          {user.role.toUpperCase()}
        </span>
        <span className="user-email">{user.email}</span>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}
