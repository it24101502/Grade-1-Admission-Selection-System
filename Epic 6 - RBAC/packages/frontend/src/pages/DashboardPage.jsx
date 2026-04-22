import { useAuth } from "../context/AuthContext.jsx";
import { ROLES } from "../constants.js";
import AdminDashboard from "./dashboards/AdminDashboard.jsx";
import JudgeDashboard from "./dashboards/JudgeDashboard.jsx";
import ParentDashboard from "./dashboards/ParentDashboard.jsx";
import DocControllerDashboard from "./dashboards/DocControllerDashboard.jsx";

// Scrum-29 / Scrum-30: Role dispatcher — each role gets its own secured dashboard
export default function DashboardPage() {
  const { user } = useAuth();

  const dashboards = {
    [ROLES.ADMIN]: <AdminDashboard />,
    [ROLES.JUDGE]: <JudgeDashboard />,
    [ROLES.PARENT]: <ParentDashboard />,
    [ROLES.DOCUMENT_CONTROLLER]: <DocControllerDashboard />,
  };

  return dashboards[user?.role] ?? (
    <div style={{ padding: "40px", textAlign: "center", color: "#e74c3c" }}>
      Unknown role. Please contact an administrator.
    </div>
  );
}
