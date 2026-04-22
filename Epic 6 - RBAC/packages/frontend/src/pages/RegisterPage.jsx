import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { PageHeader, Card } from "../components/UI.jsx";
import { ROLES } from "../constants.js";

export default function RegisterPage() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: ROLES.PARENT, category: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.role) {
      setError("All fields except category are required"); return;
    }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await authFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`User "${form.name}" created successfully!`);
      setForm({ name: "", email: "", password: "", role: ROLES.PARENT, category: "" });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const needsCategory = [ROLES.PARENT, ROLES.JUDGE].includes(form.role);

  return (
    <div style={styles.page}>
      <PageHeader title="Register New User" subtitle="Create a new system account and assign a role" color="#e74c3c" />
      <Card style={{ maxWidth: "540px" }}>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {[
          { label: "Full Name *", key: "name", type: "text", placeholder: "Jane Smith" },
          { label: "Email *",     key: "email", type: "email", placeholder: "jane@example.com" },
          { label: "Password *",  key: "password", type: "password", placeholder: "min 8 chars" },
        ].map(f => (
          <div key={f.key} style={styles.field}>
            <label style={styles.label}>{f.label}</label>
            <input type={f.type} style={styles.input} value={form[f.key]} placeholder={f.placeholder}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
          </div>
        ))}

        <div style={styles.field}>
          <label style={styles.label}>Role *</label>
          <select style={styles.input} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
            {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {needsCategory && (
          <div style={styles.field}>
            <label style={styles.label}>Category</label>
            <input style={styles.input} value={form.category} placeholder="e.g. SchoolZone"
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
          </div>
        )}

        <div style={styles.actions}>
          <button onClick={() => navigate("/admin/users")} style={styles.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={styles.submitBtn}>
            {loading ? "Creating…" : "Create User"}
          </button>
        </div>
      </Card>
    </div>
  );
}

const styles = {
  page: { padding: "28px", maxWidth: "800px", margin: "0 auto" },
  field: { marginBottom: "16px" },
  label: { display: "block", fontWeight: "600", fontSize: "0.85rem", color: "#444", marginBottom: "6px" },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: "8px", fontSize: "0.9rem", fontFamily: "inherit" },
  error: { background: "#fef0f0", color: "#e74c3c", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "0.85rem" },
  success: { background: "#f0fef4", color: "#27ae60", padding: "10px", borderRadius: "8px", marginBottom: "14px", fontSize: "0.85rem" },
  actions: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" },
  cancelBtn: { padding: "10px 20px", border: "1.5px solid #ddd", borderRadius: "8px", background: "#fff", cursor: "pointer" },
  submitBtn: { padding: "10px 24px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
};
