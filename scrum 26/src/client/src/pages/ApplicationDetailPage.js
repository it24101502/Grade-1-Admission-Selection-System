// src/client/pages/ApplicationDetailPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";

const LABEL = {
  school_zone:        "School Zone",
  eligibility_type_a: "Eligibility Type A",
  eligibility_type_b: "Eligibility Type B",
};

export default function ApplicationDetailPage() {
  const { id }                    = useParams();
  const navigate                  = useNavigate();
  const [app, setApp]             = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    api.getApplicationById(id)
      .then(d => setApp(d.application))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-mark">CA</span>
          <span className="brand-name">Category Access</span>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>← Back</button>
      </header>

      <main className="main detail-main">
        {loading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">🚫</div>
            <h3>Access Denied</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>Return to Dashboard</button>
          </div>
        ) : (
          <div className="detail-card">
            <div className="detail-badges">
              <span className={`status-badge ${app.status === "Open" ? "status-open" : "status-closed"}`}>{app.status}</span>
              <span className="card-category">{LABEL[app.category] || app.category}</span>
            </div>
            <h2>{app.title}</h2>
            <p className="detail-desc">{app.description}</p>
            <div className="detail-meta">
              <div className="meta-item"><span className="meta-label">ID</span><span className="meta-value">{app.id}</span></div>
              <div className="meta-item"><span className="meta-label">Deadline</span><span className="meta-value">{new Date(app.deadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></div>
              <div className="meta-item"><span className="meta-label">Category</span><span className="meta-value">{LABEL[app.category] || app.category}</span></div>
            </div>
            {app.status === "Open" && <button className="btn btn-primary apply-btn">Apply Now</button>}
          </div>
        )}
      </main>
    </div>
  );
}
