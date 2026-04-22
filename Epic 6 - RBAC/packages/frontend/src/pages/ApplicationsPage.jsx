import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { PageHeader, Card, StatusBadge } from "../components/UI.jsx";
import { ROLES } from "../constants.js";

export default function ApplicationsPage() {
  const { authFetch, user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/api/applications")
      .then(r => r.json())
      .then(d => { setApps(d.applications || []); setLoading(false); });
  }, [authFetch]);

  const canSubmit = user.role === ROLES.PARENT;
  const canEdit   = [ROLES.ADMIN, ROLES.DOCUMENT_CONTROLLER].includes(user.role);

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <PageHeader
          title="Applications"
          subtitle={user.role === ROLES.PARENT ? `Showing your applications in: ${user.category}` : "All applications"}
        />
        {canSubmit && (
          <Link to="/applications/new" style={styles.newBtn}>+ New Application</Link>
        )}
      </div>

      <Card>
        {loading ? <p style={styles.empty}>Loading…</p> :
          apps.length === 0 ? <p style={styles.empty}>No applications found.</p> : (
          <table style={styles.table}>
            <thead>
              <tr>{["#", "Title", "Category", "Submitted By", "Status", "Date", canEdit ? "Actions" : ""].map((h, i) =>
                <th key={i} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id} style={styles.tr}>
                  <td style={styles.td}>#{a.id}</td>
                  <td style={styles.td}><strong>{a.title}</strong></td>
                  <td style={styles.td}>{a.category}</td>
                  <td style={styles.td}>{a.submitter_name || "—"}</td>
                  <td style={styles.td}><StatusBadge status={a.status} /></td>
                  <td style={styles.td}>{new Date(a.created_at).toLocaleDateString()}</td>
                  {canEdit && (
                    <td style={styles.td}>
                      <Link to={`/applications/${a.id}/edit`} style={styles.editBtn}>Edit</Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

const styles = {
  page: { padding: "28px", maxWidth: "1100px", margin: "0 auto" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0" },
  newBtn: {
    background: "#27ae60", color: "#fff", padding: "10px 18px", borderRadius: "8px",
    textDecoration: "none", fontWeight: "600", fontSize: "0.9rem", whiteSpace: "nowrap", marginTop: "4px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "8px 10px", fontSize: "0.8rem", color: "#888", borderBottom: "2px solid #eee" },
  tr: { borderBottom: "1px solid #f5f5f5" },
  td: { padding: "11px 10px", fontSize: "0.88rem", color: "#333" },
  empty: { color: "#aaa", textAlign: "center", padding: "40px" },
  editBtn: {
    background: "#f0f2f5", color: "#555", padding: "4px 10px", borderRadius: "6px",
    textDecoration: "none", fontSize: "0.8rem",
  },
};
