import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { StatCard, PageHeader, Card, StatusBadge } from "../../components/UI.jsx";

const COLOR = "#e74c3c";

export default function AdminDashboard() {
  const { authFetch, user } = useAuth();
  const [stats, setStats] = useState({ users: 0, applications: 0, pending: 0, results: 0 });
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    async function load() {
      const [uRes, aRes, rRes] = await Promise.all([
        authFetch("/api/users"),
        authFetch("/api/applications"),
        authFetch("/api/results"),
      ]);
      const [uData, aData, rData] = await Promise.all([uRes.json(), aRes.json(), rRes.json()]);
      const apps = aData.applications || [];
      setStats({
        users: uData.users?.length || 0,
        applications: apps.length,
        pending: apps.filter((a) => a.status === "pending").length,
        results: rData.results?.length || 0,
      });
      setRecentApps(apps.slice(0, 5));
    }
    load();
  }, [authFetch]);

  return (
    <div style={styles.page}>
      <PageHeader
        title={`Admin Dashboard`}
        subtitle={`Welcome back, ${user.name}. You have full system access.`}
        color={COLOR}
      />

      <div style={styles.stats}>
        <StatCard label="Total Users"       value={stats.users}        icon="👥" color={COLOR} />
        <StatCard label="Applications"      value={stats.applications} icon="📋" color="#8e44ad" />
        <StatCard label="Pending Review"    value={stats.pending}      icon="⏳" color="#f39c12" />
        <StatCard label="Results Recorded"  value={stats.results}      icon="✅" color="#27ae60" />
      </div>

      <div style={styles.grid}>
        <Card>
          <h2 style={styles.sectionTitle}>Recent Applications</h2>
          {recentApps.length === 0 ? <p style={styles.empty}>No applications yet.</p> :
            <table style={styles.table}>
              <thead>
                <tr>{["Title", "Category", "Submitted By", "Status"].map(h =>
                  <th key={h} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {recentApps.map((a) => (
                  <tr key={a.id} style={styles.tr}>
                    <td style={styles.td}>{a.title}</td>
                    <td style={styles.td}>{a.category}</td>
                    <td style={styles.td}>{a.submitter_name || "—"}</td>
                    <td style={styles.td}><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </Card>

        <Card>
          <h2 style={styles.sectionTitle}>Admin Actions</h2>
          <div style={styles.actionList}>
            {[
              { to: "/admin/users",     icon: "👤", label: "Manage Users",        desc: "Create, edit, delete users" },
              { to: "/applications",    icon: "📋", label: "All Applications",    desc: "View and manage all applications" },
              { to: "/results",         icon: "📊", label: "All Results",         desc: "Review all judging results" },
              { to: "/admin/register",  icon: "➕", label: "Add New User",        desc: "Register a new system user" },
            ].map((a) => (
              <Link key={a.to} to={a.to} style={styles.actionItem}>
                <span style={styles.actionIcon}>{a.icon}</span>
                <div>
                  <div style={styles.actionLabel}>{a.label}</div>
                  <div style={styles.actionDesc}>{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "28px", maxWidth: "1200px", margin: "0 auto" },
  stats: { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  sectionTitle: { fontSize: "1.05rem", fontWeight: "700", marginBottom: "16px", color: "#1a1a2e" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "8px 10px", fontSize: "0.8rem", color: "#888", borderBottom: "1px solid #eee" },
  tr: { borderBottom: "1px solid #f5f5f5" },
  td: { padding: "10px 10px", fontSize: "0.88rem", color: "#333" },
  empty: { color: "#aaa", textAlign: "center", padding: "20px" },
  actionList: { display: "flex", flexDirection: "column", gap: "10px" },
  actionItem: {
    display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px",
    borderRadius: "8px", background: "#f8f9fa", textDecoration: "none", color: "inherit",
    border: "1px solid #eee",
  },
  actionIcon: { fontSize: "1.5rem" },
  actionLabel: { fontWeight: "600", fontSize: "0.9rem", color: "#1a1a2e" },
  actionDesc: { fontSize: "0.78rem", color: "#888", marginTop: "2px" },
};
