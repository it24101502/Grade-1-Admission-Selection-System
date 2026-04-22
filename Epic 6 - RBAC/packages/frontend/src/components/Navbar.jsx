import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLES } from "../constants.js";

const ROLE_COLORS = {
  [ROLES.ADMIN]: "#e74c3c",
  [ROLES.JUDGE]: "#8e44ad",
  [ROLES.PARENT]: "#27ae60",
  [ROLES.DOCUMENT_CONTROLLER]: "#2980b9",
};

const ROLE_LINKS = {
  [ROLES.ADMIN]: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/admin/users", label: "Manage Users" },
    { to: "/applications", label: "Applications" },
    { to: "/results", label: "Results" },
  ],
  [ROLES.JUDGE]: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/applications", label: "Applications" },
    { to: "/results", label: "Results" },
  ],
  [ROLES.PARENT]: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/applications", label: "My Applications" },
    { to: "/applications/new", label: "Apply" },
    { to: "/results", label: "My Results" },
  ],
  [ROLES.DOCUMENT_CONTROLLER]: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/applications", label: "Applications" },
    { to: "/documents", label: "Documents" },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const links = ROLE_LINKS[user.role] || [];
  const color = ROLE_COLORS[user.role] || "#555";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{ ...styles.nav, borderBottom: `3px solid ${color}` }}>
      <div style={styles.brand}>
        <span style={styles.logo}>🔐</span>
        <span style={styles.brandName}>RBAC Portal</span>
      </div>

      <div style={styles.links}>
        {links.map((l) => (
          <Link key={l.to} to={l.to} style={styles.link}>
            {l.label}
          </Link>
        ))}
      </div>

      <div style={styles.user}>
        <span style={{ ...styles.roleBadge, background: color }}>{user.role}</span>
        <span style={styles.userName}>{user.name}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#1a1a2e", padding: "0 24px", height: "60px", position: "sticky", top: 0, zIndex: 100,
  },
  brand: { display: "flex", alignItems: "center", gap: "8px" },
  logo: { fontSize: "1.4rem" },
  brandName: { color: "#fff", fontWeight: "700", fontSize: "1.1rem", letterSpacing: "0.5px" },
  links: { display: "flex", gap: "4px" },
  link: {
    color: "#ccc", textDecoration: "none", padding: "6px 12px", borderRadius: "6px",
    fontSize: "0.9rem", transition: "background 0.2s",
  },
  user: { display: "flex", alignItems: "center", gap: "10px" },
  roleBadge: {
    color: "#fff", fontSize: "0.7rem", fontWeight: "700", padding: "3px 8px",
    borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px",
  },
  userName: { color: "#ddd", fontSize: "0.9rem" },
  logoutBtn: {
    background: "transparent", border: "1px solid #555", color: "#ccc",
    padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem",
  },
};
