import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { StatCard, PageHeader, Card, StatusBadge } from "../../components/UI.jsx";

const COLOR = "#27ae60";

export default function ParentDashboard() {
  const { authFetch, user } = useAuth();
  const [apps, setApps] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function load() {
      const [aRes, rRes] = await Promise.all([authFetch("/api/applications"), authFetch("/api/results")]);
      const [aData, rData] = await Promise.all([aRes.json(), rRes.json()]);
      setApps(aData.applications || []);
      setResults(rData.results || []);
    }
    load();
  }, [authFetch]);

  return (
    <div style={styles.page}>
      <PageHeader
        title={`My Dashboard`}
        subtitle={`Welcome, ${user.name}. Category: ${user.category || "Not assigned"}`}
        color={COLOR}
      />

      {/* Scrum-27: Only show apply + results actions */}
      <div style={styles.quickActions}>
        <Link to="/applications/new" style={{ ...styles.actionBtn, background: COLOR }}>
          📝 Submit New Application
        </Link>
        <Link to="/results" style={{ ...styles.actionBtn, background: "#2980b9" }}>
          📊 View My Results
        </Link>
      </div>

      <div style={styles.stats}>
        <StatCard label="My Applications" value={apps.length}                                  icon="📋" color={COLOR} />
        <StatCard label="Pending"         value={apps.filter(a => a.status === "pending").length}  icon="⏳" color="#f39c12" />
        <StatCard label="Approved"        value={apps.filter(a => a.status === "approved").length} icon="✅" color="#27ae60" />
        <StatCard label="Results"         value={results.length}                               icon="🏆" color="#8e44ad" />
      </div>

      <Card>
        {/* Scrum-26: Only shows apps from own category */}
        <h2 style={styles.sectionTitle}>My Applications <span style={styles.catTag}>({user.category})</span></h2>
        {apps.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>You haven't submitted any applications yet.</p>
            <Link to="/applications/new" style={{ ...styles.actionBtn, background: COLOR, display: "inline-block" }}>
              Submit Your First Application
            </Link>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>{["Title", "Status", "Submitted", "Result"].map(h =>
                <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {apps.map((a) => {
                const result = results.find(r => r.application_id === a.id);
                return (
                  <tr key={a.id} style={styles.tr}>
                    <td style={styles.td}>{a.title}</td>
                    <td style={styles.td}><StatusBadge status={a.status} /></td>
                    <td style={styles.td}>{new Date(a.created_at).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      {result ? <StatusBadge status={result.verdict?.toLowerCase()} /> : <span style={styles.awaiting}>Awaiting</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

const styles = {
  page: { padding: "28px", maxWidth: "1000px", margin: "0 auto" },
  quickActions: { display: "flex", gap: "12px", marginBottom: "24px" },
  actionBtn: {
    color: "#fff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none",
    fontWeight: "600", fontSize: "0.9rem",
  },
  stats: { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" },
  sectionTitle: { fontSize: "1.05rem", fontWeight: "700", marginBottom: "16px", color: "#1a1a2e" },
  catTag: { fontSize: "0.8rem", color: "#888", fontWeight: "400" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "8px 10px", fontSize: "0.8rem", color: "#888", borderBottom: "1px solid #eee" },
  tr: { borderBottom: "1px solid #f5f5f5" },
  td: { padding: "10px 10px", fontSize: "0.88rem", color: "#333" },
  emptyState: { textAlign: "center", padding: "30px" },
  emptyText: { color: "#aaa", marginBottom: "16px" },
  awaiting: { color: "#aaa", fontSize: "0.8rem" },
};
