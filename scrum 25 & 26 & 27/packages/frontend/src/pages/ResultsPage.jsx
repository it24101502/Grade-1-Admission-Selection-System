import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PERMISSIONS } from "@school-portal/shared";
import { usePermission } from "../hooks/usePermission";

const STATUS_STYLES = {
  accepted:     { label: "Accepted",     className: "badge-success" },
  rejected:     { label: "Rejected",     className: "badge-error"   },
  under_review: { label: "Under Review", className: "badge-warning" },
  pending:      { label: "Pending",      className: "badge-neutral" },
};

// Mock seed data shown before the parent submits anything
const SEED_RESULTS = [
  {
    applicationId: "app-seed-001",
    childName: "Demo Child",
    grade: "3",
    status: "under_review",
    message: "Your application is currently being reviewed by our admissions team.",
    submittedAt: "2024-03-01T10:00:00Z",
    publishedAt: "2024-03-05T09:00:00Z",
  },
];

export function ResultsPage() {
  const { user } = useAuth();
  const { can } = usePermission();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from sessionStorage (submitted via ApplyPage) + seed data
    setTimeout(() => {
      const stored = JSON.parse(sessionStorage.getItem("applications") || "[]");
      const userResults = stored.filter((r) => r.userId === user?.id);
      setResults([...userResults, ...SEED_RESULTS]);
      setLoading(false);
    }, 400);
  }, [user]);

  if (loading) {
    return (
      <div className="page">
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Loading your results…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page results-page">
      <div className="page-header">
        <div>
          <h1>My Results</h1>
          <p className="page-subtitle">
            View the status of your submitted applications.
          </p>
        </div>
        {can(PERMISSIONS.SUBMIT_APPLICATION) && (
          <Link to="/apply" className="btn-primary">
            + New Application
          </Link>
        )}
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <span>📭</span>
          <p>No results yet.</p>
          <Link to="/apply" className="btn-primary" style={{ marginTop: "1rem" }}>
            Submit your first application
          </Link>
        </div>
      ) : (
        <div className="results-list">
          {results.map((result) => {
            const style = STATUS_STYLES[result.status] ?? STATUS_STYLES.pending;
            return (
              <div key={result.applicationId} className="result-card">
                <div className="result-header">
                  <div>
                    <h3>{result.childName}</h3>
                    {result.grade && (
                      <span className="result-grade">Grade {result.grade}</span>
                    )}
                  </div>
                  <span className={`badge ${style.className}`}>
                    {style.label}
                  </span>
                </div>
                {result.message && (
                  <p className="result-message">{result.message}</p>
                )}
                <p className="result-date">
                  Submitted:{" "}
                  {result.submittedAt
                    ? new Date(result.submittedAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
