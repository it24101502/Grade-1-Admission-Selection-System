import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { PageHeader, Card, StatusBadge } from "../components/UI.jsx";
import { ROLES } from "../constants.js";

export default function ResultsPage() {
  const { authFetch, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const newForApp = searchParams.get("applicationId");

  const [results, setResults] = useState([]);
  const [apps, setApps] = useState([]);
  const [form, setForm] = useState({ application_id: newForApp || "", score: "", verdict: "Approved", notes: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const canJudge = [ROLES.JUDGE, ROLES.ADMIN].includes(user.role);

  useEffect(() => {
    async function load() {
      const [rRes, aRes] = await Promise.all([authFetch("/api/results"), authFetch("/api/applications")]);
      const [rData, aData] = await Promise.all([rRes.json(), aRes.json()]);
      setResults(rData.results || []);
      setApps((aData.applications || []).filter(a => a.status === "pending"));
    }
    load();
  }, [authFetch]);

  const handleSubmit = async () => {
    if (!form.application_id || !form.verdict) { setError("Application and verdict are required"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await authFetch("/api/results", {
        method: "POST",
        body: JSON.stringify({ application_id: Number(form.application_id), score: form.score ? Number(form.score) : null, verdict: form.verdict, notes: form.notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Result recorded successfully!");
      // Refresh
      const rRes = await authFetch("/api/results");
      const rData = await rRes.json();
      setResults(rData.results || []);
      setForm({ application_id: "", score: "", verdict: "Approved", notes: "" });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <PageHeader title="Results" subtitle={canJudge ? "Record and review judging results" : "Your application results"} color="#8e44ad" />

      {canJudge && (
        <Card>
          <h2 style={styles.sectionTitle}>📝 Record New Result</h2>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}
          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Application</label>
              <select style={styles.input} value={form.application_id}
                onChange={e => setForm(f => ({ ...f, application_id: e.target.value }))}>
                <option value="">Select application…</option>
                {apps.map(a => <option key={a.id} value={a.id}>#{a.id} — {a.title}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Verdict</label>
              <select style={styles.input} value={form.verdict}
                onChange={e => setForm(f => ({ ...f, verdict: e.target.value }))}>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Deferred</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Score (optional)</label>
              <input type="number" min="0" max="100" style={styles.input} value={form.score}
                onChange={e => setForm(f => ({ ...f, score: e.target.value }))} placeholder="0–100" />
            </div>
            <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Notes</label>
              <textarea style={{ ...styles.input, height: "80px" }} value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Evaluation notes…" />
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} style={styles.submitBtn}>
            {loading ? "Saving…" : "Save Result"}
          </button>
        </Card>
      )}

      <Card>
        <h2 style={styles.sectionTitle}>All Results</h2>
        {results.length === 0 ? <p style={styles.empty}>No results yet.</p> :
          <table style={styles.table}>
            <thead>
              <tr>{["Application", "Score", "Verdict", "Notes", "Date"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.id} style={styles.tr}>
                  <td style={styles.td}>{r.application_title || `#${r.application_id}`}</td>
                  <td style={styles.td}>{r.score ?? "—"}</td>
                  <td style={styles.td}><StatusBadge status={r.verdict?.toLowerCase()} /></td>
                  <td style={styles.td}>{r.notes || "—"}</td>
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
  sectionTitle: { fontSize: "1.05rem", fontWeight: "700", marginBottom: "16px", color: "#1a1a2e" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" },
  field: {},
  label: { display: "block", fontWeight: "600", fontSize: "0.82rem", color: "#555", marginBottom: "5px" },
  input: { width: "100%", padding: "9px 12px", border: "1.5px solid #ddd", borderRadius: "7px", fontSize: "0.9rem", fontFamily: "inherit" },
  submitBtn: { background: "#8e44ad", color: "#fff", padding: "10px 24px", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "8px 10px", fontSize: "0.8rem", color: "#888", borderBottom: "2px solid #eee" },
  tr: { borderBottom: "1px solid #f5f5f5" },
  td: { padding: "11px 10px", fontSize: "0.88rem", color: "#333" },
  empty: { color: "#aaa", textAlign: "center", padding: "40px" },
  error: { background: "#fef0f0", color: "#e74c3c", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "0.85rem" },
  success: { background: "#f0fef4", color: "#27ae60", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "0.85rem" },
};
