import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { StatCard, PageHeader, Card, StatusBadge } from "../../components/UI.jsx";

const COLOR = "#8e44ad";

export default function JudgeDashboard() {
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

  const pending = apps.filter((a) => a.status === "pending");

  return (
    <div style={styles.page}>
      <PageHeader
        title="Judge Dashboard"
        subtitle={`Welcome, ${user.name}. Review applications and record verdicts.`}
        color={COLOR}
      />

      <div style={styles.stats}>
        <StatCard label="Total Applications" value={apps.length}     icon="📋" color={COLOR} />
        <StatCard label="Pending Review"      value={pending.length} icon="⏳" color="#f39c12" />
        <StatCard label="Results Recorded"    value={results.length} icon="✅" color="#27ae60" />
      </div>

      <Card>
        <h2 style={styles.sectionTitle}>⏳ Pending Applications — Awaiting Verdict</h2>
        {pending.length === 0 ? <p style={styles.empty}>All applications have been reviewed. ✨</p> :
          <table style={styles.table}>
            <thead>
              <tr>{["Title", "Category", "Submitted By", "Date", "Action"].map(h =>
                <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {pending.map((a) => (
                <tr key={a.id} style={styles.tr}>
                  <td style={styles.td}>{a.title}</td>
                  <td style={styles.td}>{a.category}</td>
                  <td style={styles.td}>{a.submitter_name || "—"}</td>
                  <td style={styles.td}>{new Date(a.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <Link to={`/results/new?applicationId=${a.id}`} style={styles.judgeBtn}>
                      Judge
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </Card>

      <Card>
        <h2 style={styles.sectionTitle}>📊 Recent Results</h2>
        {results.length === 0 ? <p style={styles.empty}>No results recorded yet.</p> :
          <table style={styles.table}>
            <thead>
              <tr>{["Application", "Score", "Verdict", "Date"].map(h =>
                <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {results.slice(0, 8).map((r) => (
                <tr key={r.id} style={styles.tr}>
                  <td style={styles.td}>{r.application_title}</td>
                  <td style={styles.td}>{r.score ?? "—"}</td>
                  <td style={styles.td}><StatusBadge status={r.verdict?.toLowerCase()} /></td>
                  <td style={styles.td}>{new Date(r.created_at).toLocaleDateString()}</td>
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
  judgeBtn: {
    background: "#8e44ad", color: "#fff", padding: "4px 12px", borderRadius: "6px",
    textDecoration: "none", fontSize: "0.8rem", fontWeight: "600",
  },
};
