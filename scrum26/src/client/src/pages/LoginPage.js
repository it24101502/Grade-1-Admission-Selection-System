// src/client/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";

const DEMO = [
  { label: "School Zone",   email: "alice@example.com", password: "password123" },
  { label: "Eligibility A", email: "bob@example.com",   password: "password123" },
  { label: "Eligibility B", email: "carol@example.com", password: "password123" },
  { label: "Admin",         email: "admin@example.com", password: "adminpass"   },
];

export default function LoginPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await api.login(email, password);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-mark">CA</div>
          <h1>Category Access</h1>
          <p>Sign in to view your applications</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="demo-accounts">
          <p className="demo-label">Demo accounts</p>
          <div className="demo-grid">
            {DEMO.map(acc => (
              <button key={acc.email} type="button" className="demo-chip"
                onClick={() => { setEmail(acc.email); setPassword(acc.password); }}>
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
