import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Mock user store (mirrors backend) ────────────────────────────────────────
// The frontend authenticates locally so it works even without the backend running.
// In production, replace mockLogin() with a real API call.
const MOCK_USERS = [
  { id: "user-1", email: "parent@example.com", password: "parent123", role: "parent" },
  { id: "user-2", email: "judge@example.com",  password: "judge123",  role: "judge"  },
  { id: "user-3", email: "admin@example.com",  password: "admin123",  role: "admin"  },
];

function mockLogin(email, password) {
  const user = MOCK_USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) return null;
  // Return a fake token (base64 payload — not cryptographically signed, demo only)
  const payload = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));
  const fakeToken = `demo.${payload}.sig`;
  return { user: { id: user.id, email: user.email, role: user.role }, token: fakeToken };
}

// ── Component ─────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Small delay to show loading state
    setTimeout(() => {
      const result = mockLogin(form.email, form.password);
      if (!result) {
        setError("Invalid email or password. Check the demo credentials below.");
        setLoading(false);
        return;
      }
      login(result.user, result.token);
      navigate("/dashboard");
    }, 400);
  };

  // Quick-fill helper for demo buttons
  const fillCredentials = (email, password) => {
    setForm({ email, password });
    setError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🏫</div>
        <h1>School Portal</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="alert alert-error">❌ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="username"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="auth-hint">
          <p>Quick login — click to fill:</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn demo-btn-parent"
              onClick={() => fillCredentials("parent@example.com", "parent123")}
            >
              👨‍👩‍👧 Parent
            </button>
            <button
              type="button"
              className="demo-btn demo-btn-judge"
              onClick={() => fillCredentials("judge@example.com", "judge123")}
            >
              ⚖️ Judge
            </button>
            <button
              type="button"
              className="demo-btn demo-btn-admin"
              onClick={() => fillCredentials("admin@example.com", "admin123")}
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
