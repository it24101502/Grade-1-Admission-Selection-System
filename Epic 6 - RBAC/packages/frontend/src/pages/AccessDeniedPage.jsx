import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AccessDeniedPage() {
  const { user } = useAuth();
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>🚫</div>
        <h1 style={styles.title}>Access Denied</h1>
        <p style={styles.message}>
          Your role (<strong>{user?.role}</strong>) does not have permission to view this page.
        </p>
        <Link to="/dashboard" style={styles.btn}>← Back to My Dashboard</Link>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" },
  card: {
    textAlign: "center", background: "#fff", borderRadius: "16px", padding: "48px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: "420px",
  },
  icon: { fontSize: "3rem", marginBottom: "16px" },
  title: { fontSize: "1.6rem", fontWeight: "800", color: "#e74c3c", marginBottom: "12px" },
  message: { color: "#666", lineHeight: "1.6", marginBottom: "24px" },
  btn: {
    display: "inline-block", background: "#1a1a2e", color: "#fff", padding: "10px 24px",
    borderRadius: "8px", textDecoration: "none", fontWeight: "600",
  },
};
