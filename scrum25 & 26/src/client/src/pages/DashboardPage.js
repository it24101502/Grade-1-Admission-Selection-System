// src/client/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";

const LABEL = {
  school_zone:        "School Zone",
  eligibility_type_a: "Eligibility Type A",
  eligibility_type_b: "Eligibility Type B",
  admin:              "Administrator",
};

export default function DashboardPage() {
  const { user, logout }              = useAuth();
  const navigate                      = useNavigate();
  const [apps, setApps]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    api.getApplications()
      .then(d => setApps(d.applications))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-mark">CA</span>
          <span className="brand-name">Category Access</span>
        </div>
        <div className="topbar-user">
          <span className="user-pill">{LABEL[user.category] || user.category}</span>
          <span className="user-name">{user.name}</span>
          <button className="btn btn-ghost" onClick={() => { logout(); navigate("/login"); }}>Sign Out</button>
        </div>
      </header>

      <main className="main">
        <div className="page-header">
          <div>
            <h2>Your Applications</h2>
            <p className="subtitle">Category: <strong>{LABEL[user.category] || user.category}</strong></p>
          </div>
          <div className="count-badge">{apps.length} applications</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>
        ) : apps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No applications found</h3>
            <p>Nothing available for your category right now.</p>
          </div>
        ) : (
          <div className="app-grid">
            {apps.map(app => (
              <div className="app-card" key={app.id}>
                <div className="card-top">
                  <span className={`status-badge ${app.status === "Open" ? "status-open" : "status-closed"}`}>{app.status}</span>
                  <span className="card-category">{LABEL[app.category] || app.category}</span>
                </div>
                <h3 className="card-title">{app.title}</h3>
                <p className="card-desc">{app.description}</p>
                <div className="card-footer">
                  <span className="deadline">Deadline: <strong>{new Date(app.deadline).toLocaleDateString()}</strong></span>
                  <button className="btn btn-sm" onClick={() => navigate(`/applications/${app.id}`)}>View →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
