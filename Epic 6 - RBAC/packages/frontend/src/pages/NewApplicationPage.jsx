import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { PageHeader, Card } from "../components/UI.jsx";

export default function NewApplicationPage() {
  const { authFetch, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setLoading(true); setError("");
    try {
      const res = await authFetch("/api/applications", {
        method: "POST",
        body: JSON.stringify({ title: form.title, description: form.description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      navigate("/applications");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <PageHeader title="Submit Application" subtitle={`Category: ${user.category}`} color="#27ae60" />
      <Card style={{ maxWidth: "600px" }}>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.field}>
          <label style={styles.label}>Application Title *</label>
          <input style={styles.input} value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Merit Scholarship 2025" />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Description</label>
          <textarea style={{ ...styles.input, height: "120px", resize: "vertical" }}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe your application…" />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Category (auto-assigned)</label>
          <input style={{ ...styles.input, background: "#f5f5f5", color: "#888" }}
            value={user.category} readOnly />
        </div>
        <div style={styles.actions}>
          <button onClick={() => navigate(-1)} style={styles.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={styles.submitBtn}>
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </Card>
    </div>
  );
}

const styles = {
  page: { padding: "28px", maxWidth: "800px", margin: "0 auto" },
  field: { marginBottom: "18px" },
  label: { display: "block", fontWeight: "600", fontSize: "0.85rem", color: "#444", marginBottom: "6px" },
  input: {
    width: "100%", padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: "8px",
    fontSize: "0.95rem", outline: "none", fontFamily: "inherit",
  },
  error: { background: "#fef0f0", color: "#e74c3c", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.85rem" },
  actions: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" },
  cancelBtn: { padding: "10px 20px", border: "1.5px solid #ddd", borderRadius: "8px", background: "#fff", cursor: "pointer" },
  submitBtn: { padding: "10px 24px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
};
