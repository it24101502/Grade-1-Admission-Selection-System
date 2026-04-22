export function StatCard({ label, value, icon, color = "#1a1a2e" }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <div style={styles.icon}>{icon}</div>
      <div style={{ ...styles.value, color }}>{value ?? "—"}</div>
      <div style={styles.label}>{label}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, color = "#1a1a2e" }) {
  return (
    <div style={{ ...styles.header, borderLeft: `4px solid ${color}` }}>
      <h1 style={{ ...styles.title, color }}>{title}</h1>
      {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}

export function Card({ children, style }) {
  return <div style={{ ...styles.genericCard, ...style }}>{children}</div>;
}

export function Badge({ label, color }) {
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}55`,
      padding: "2px 8px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600" }}>
      {label}
    </span>
  );
}

const STATUS_COLORS = { pending: "#f39c12", approved: "#27ae60", rejected: "#e74c3c" };
export function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || "#888";
  return <Badge label={status} color={color} />;
}

const styles = {
  card: {
    background: "#fff", borderRadius: "12px", padding: "24px", textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", minWidth: "140px",
  },
  icon: { fontSize: "2rem", marginBottom: "8px" },
  value: { fontSize: "2rem", fontWeight: "800", marginBottom: "4px" },
  label: { color: "#888", fontSize: "0.85rem" },
  header: {
    padding: "16px 20px", background: "#fff", borderRadius: "10px", marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  title: { fontSize: "1.5rem", fontWeight: "800" },
  subtitle: { color: "#888", marginTop: "4px", fontSize: "0.9rem" },
  genericCard: {
    background: "#fff", borderRadius: "12px", padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "20px",
  },
};
