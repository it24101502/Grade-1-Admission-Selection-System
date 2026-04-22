import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const DEMO_USERS = [
  { label: "Admin",               email: "admin@demo.com",   password: "admin123",   color: "#e74c3c" },
  { label: "Judge",               email: "judge@demo.com",   password: "judge123",   color: "#8e44ad" },
  { label: "Parent",              email: "parent@demo.com",  password: "parent123",  color: "#27ae60" },
  { label: "Doc Controller",      email: "docctrl@demo.com", password: "docctrl123", color: "#2980b9" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (u) => {
    setEmail(u.email);
    setPassword(u.password);
    setError("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.icon}>🔐</span>
          <h1 style={styles.title}>RBAC Portal</h1>
          <p style={styles.subtitle}>Role-Based Access Control System</p>
        </div>

        {/* Demo quick-fill */}
        <div style={styles.demoSection}>
          <p style={styles.demoLabel}>Quick login (demo):</p>
          <div style={styles.demoButtons}>
            {DEMO_USERS.map((u) => (
              <button key={u.email} onClick={() => fillDemo(u)}
                style={{ ...styles.demoBtn, borderColor: u.color, color: u.color }}>
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required style={styles.input} placeholder="you@example.com" autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required style={styles.input} placeholder="••••••••" autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  },
  card: {
    background: "#fff", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  header: { textAlign: "center", marginBottom: "28px" },
  icon: { fontSize: "2.5rem" },
  title: { fontSize: "1.8rem", fontWeight: "800", color: "#1a1a2e", marginTop: "8px" },
  subtitle: { color: "#888", fontSize: "0.9rem", marginTop: "4px" },
  demoSection: { marginBottom: "24px", padding: "14px", background: "#f8f9fa", borderRadius: "10px" },
  demoLabel: { fontSize: "0.8rem", color: "#666", marginBottom: "10px", fontWeight: "600" },
  demoButtons: { display: "flex", gap: "8px", flexWrap: "wrap" },
  demoBtn: {
    padding: "5px 12px", borderRadius: "20px", border: "1.5px solid", background: "transparent",
    cursor: "pointer", fontSize: "0.8rem", fontWeight: "600",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.85rem", fontWeight: "600", color: "#444" },
  input: {
    padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: "8px",
    fontSize: "0.95rem", outline: "none", transition: "border 0.2s",
  },
  error: {
    background: "#fef0f0", color: "#e74c3c", padding: "10px 14px",
    borderRadius: "8px", fontSize: "0.85rem", border: "1px solid #fcc",
  },
  submitBtn: {
    background: "#1a1a2e", color: "#fff", padding: "12px", border: "none",
    borderRadius: "8px", fontSize: "1rem", fontWeight: "700", cursor: "pointer", marginTop: "4px",
  },
};
