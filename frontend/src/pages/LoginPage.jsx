// FILE: frontend/src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PORTAL_CONFIG = {
  parent: {
    icon:            '👨‍👩‍👧',
    title:           'Parent Portal',
    subtitle:        'Login with your email and NIC as password',
    userLabel:       'Email Address',
    userPlaceholder: 'your@email.com',
    passLabel:       'Password (your NIC number initially)',
    passPH:          'Enter your NIC number',
    hint:            'Username = your email. Initial password = your NIC number.',
    inputType:       'email',
  },
  dc: {
    icon:            '📋',
    title:           'Document Controller',
    subtitle:        'Staff login',
    userLabel:       'Email Address',
    userPlaceholder: 'dc@school.lk',
    passLabel:       'Password',
    passPH:          'Enter your password',
    hint:            'Default: dc@school.lk / DocCtrl@2025',
    inputType:       'email',
  },
  judge: {
    icon:            '⚖️',
    title:           'Judge Panel',
    subtitle:        'Use your assigned judge credentials',
    userLabel:       'Username',
    userPlaceholder: 'e.g. judge_co',
    passLabel:       'Password',
    passPH:          'Enter your password',
    hint:            'Example: judge_co / Judge_CO@2025',
    inputType:       'text',
  },
  admin: {
    icon:            '🔐',
    title:           'Administrator',
    subtitle:        'Full system access',
    userLabel:       'Email Address',
    userPlaceholder: 'admin@school.lk',
    passLabel:       'Password',
    passPH:          'Enter admin password',
    hint:            'Default: admin@school.lk / Admin@2025',
    inputType:       'email',
  },
};

const ROLE_DASHBOARDS = {
  PARENT:              '/dashboard',
  DOCUMENT_CONTROLLER: '/dc/dashboard',
  JUDGE:               '/judge/dashboard',
  ADMIN:               '/admin/dashboard',
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const role   = searchParams.get('role') || 'parent';
  const config = PORTAL_CONFIG[role] || PORTAL_CONFIG.parent;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const { login, user } = useAuth();
  const navigate        = useNavigate();

  // If already logged in, go to their dashboard
  useEffect(() => {
    if (user) {
      navigate(ROLE_DASHBOARDS[user.role] || '/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(username.trim(), password.trim());
      const destination  = ROLE_DASHBOARDS[loggedInUser.role];

      if (!destination) {
        setError('Unknown role. Please contact your administrator.');
        return;
      }

      toast.success(`Welcome, ${loggedInUser.name}!`);
      navigate(destination, { replace: true });

    } catch (err) {
      const msg = err.response?.data?.error
        || (err.response?.status === 401 ? 'Invalid username or password' : null)
        || err.message
        || 'Login failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-crest">{config.icon}</div>
          <h2>{config.title}</h2>
          <p>{config.subtitle}</p>
        </div>

        <div className="gold-bar" />

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,.12)',
            border: '1px solid rgba(239,68,68,.4)',
            borderRadius: 'var(--r-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#fca5a5',
            fontSize: '0.88rem',
          }}>
            ❌ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label className="form-label">
              {config.userLabel} <span className="required-star">*</span>
            </label>
            <input
              className="form-control"
              type={config.inputType}
              placeholder={config.userPlaceholder}
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {config.passLabel} <span className="required-star">*</span>
            </label>
            <input
              className="form-control"
              type="password"
              placeholder={config.passPH}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
            />
            <p className="form-hint">{config.hint}</p>
          </div>

          <button
            className="btn btn-gold btn-full mt-2"
            type="submit"
            disabled={loading}
          >
            {loading ? '⏳ Logging in...' : 'Login →'}
          </button>

        </form>

        <div className="divider" />

        <p className="text-center text-muted text-sm">
          <Link to="/">← Back to Portal Selection</Link>
        </p>

        {/* Role switcher */}
        <div className="mt-2 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Wrong portal?&nbsp;
          {['parent', 'dc', 'judge', 'admin']
            .filter(r => r !== role)
            .map((r, i, arr) => (
              <span key={r}>
                <Link to={`/login?role=${r}`}>{PORTAL_CONFIG[r].title}</Link>
                {i < arr.length - 1 && ' · '}
              </span>
            ))
          }
        </div>

      </div>
    </div>
  );
}