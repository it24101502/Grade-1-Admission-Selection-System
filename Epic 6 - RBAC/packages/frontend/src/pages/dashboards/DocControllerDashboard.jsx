import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { StatCard, PageHeader, Card, StatusBadge } from "../../components/UI.jsx";

const COLOR = "#2980b9";

export default function DocControllerDashboard() {
  const { authFetch, user } = useAuth();
  const [apps, setApps] = useState([]);

  useEffect(() => {
    authFetch("/api/applications")
      .then(r => r.json())
      .then(d => setApps(d.applications || []));
  }, [authFetch]);

  return (
    <div style={styles.page}>
      <PageHeader
        title="Document Controller Dashboard"
        subtitle={`Welcome, ${user.name}. Manage and verify application documents.`}
        color={COLOR}
      />

      <div style={styles.stats}>
        <StatCard label="Total Applications" value={apps.length}                                  icon="📁" color={COLOR} />
        <StatCard label="Pending Docs"        value={apps.filter(a => a.status === "pending").length}  icon="📄" color="#f39c12" />
        <StatCard label="Approved"            value={apps.filter(a => a.status === "approved").length} icon="✅" color="#27ae60" />
      </div>

      <Card>
        <h2 style={styles.sectionTitle}>All Applications — Document Review Queue</h2>
        {apps.length === 0 ? <p style={styles.empty}>No applications in the system.</p> :
          <table style={styles.table}>
            <thead>
              <tr>{["ID", "Title", "Category", "Submitted By", "Status", "Doc Status"].map(h =>
                <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} style={styles.tr}>
                  <td style={styles.td}>#{a.id}</td>
                  <td style={styles.td}>{a.title}</td>
                  <td style={styles.td}>{a.category}</td>
                  <td style={styles.td}>{a.submitter_name || "—"}</td>
                  <td style={styles.td}><StatusBadge status={a.status} /></td>
                  <td style={styles.td}>
                    <span style={a.status === "pending" ? styles.docPending : styles.docVerified}>
                      {a.status === "pending" ? "⏳ Awaiting" : "✅ Filed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </Card>
    </div>
  );
}

const styles = {
  page: { padding: "28px", maxWidth: "1100px", margin: "0 auto" },
  stats: { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" },
  sectionTitle: { fontSize: "1.05rem", fontWeight: "700", marginBottom: "16px", color: "#1a1a2e" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "8px 10px", fontSize: "0.8rem", color: "#888", borderBottom: "1px solid #eee" },
  tr: { borderBottom: "1px solid #f5f5f5" },
  td: { padding: "10px 10px", fontSize: "0.88rem", color: "#333" },
  empty: { color: "#aaa", textAlign: "center", padding: "20px" },
  docPending: { color: "#f39c12", fontSize: "0.82rem", fontWeight: "600" },
  docVerified: { color: "#27ae60", fontSize: "0.82rem", fontWeight: "600" },
};
