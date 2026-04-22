import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { PageHeader, Card, Badge } from "../components/UI.jsx";
import { ROLES } from "../constants.js";

const ROLE_COLORS = {
  [ROLES.ADMIN]: "#e74c3c", [ROLES.JUDGE]: "#8e44ad",
  [ROLES.PARENT]: "#27ae60", [ROLES.DOCUMENT_CONTROLLER]: "#2980b9",
};

export default function UsersPage() {
  const { authFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const loadUsers = () => {
    authFetch("/api/users").then(r => r.json()).then(d => { setUsers(d.users || []); setLoading(false); });
  };

  useEffect(() => { loadUsers(); }, [authFetch]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    setDeleting(id);
    await authFetch(`/api/users/${id}`, { method: "DELETE" });
    loadUsers();
    setDeleting(null);
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <PageHeader title="User Management" subtitle="Manage all system users and their roles" color="#e74c3c" />
        <Link to="/admin/register" style={styles.addBtn}>+ Add User</Link>
      </div>

      <Card>
        {loading ? <p style={styles.empty}>Loading…</p> :
          <table style={styles.table}>
            <thead>
              <tr>{["Name", "Email", "Role", "Category", "Created", "Actions"].map(h =>
                <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={styles.tr}>
                  <td style={styles.td}><strong>{u.name}</strong></td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}><Badge label={u.role} color={ROLE_COLORS[u.role] || "#888"} /></td>
                  <td style={styles.td}>{u.category || "—"}</td>
                  <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleDelete(u.id, u.name)} disabled={deleting === u.id}
                      style={styles.deleteBtn}>
                      {deleting === u.id ? "…" : "Delete"}
                    </button>
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
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  addBtn: {
    background: "#e74c3c", color: "#fff", padding: "10px 18px", borderRadius: "8px",
    textDecoration: "none", fontWeight: "600", fontSize: "0.9rem", whiteSpace: "nowrap", marginTop: "4px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "8px 10px", fontSize: "0.8rem", color: "#888", borderBottom: "2px solid #eee" },
  tr: { borderBottom: "1px solid #f5f5f5" },
  td: { padding: "11px 10px", fontSize: "0.88rem", color: "#333" },
  empty: { color: "#aaa", textAlign: "center", padding: "40px" },
  deleteBtn: {
    background: "#fef0f0", color: "#e74c3c", border: "1px solid #fcc",
    padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem",
  },
};
