// FILE: frontend/src/pages/ParentDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header, StatusBadge, CategoryBadge, Spinner, Empty } from '../components/shared/UI';
import { useAuth } from '../context/AuthContext';
import { parentApi } from '../services/api';

export default function ParentDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [applications,    setApplications]    = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showChangePwd,   setShowChangePwd]   = useState(false);

  const fetchApps = useCallback(async () => {
    try {
      const { data } = await parentApi.getMyApplications();
      setApplications(data);
    } catch {
      toast.error('Could not load your application');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const hasApplication    = applications.length > 0;
  const needsPasswordChange = user && !user.hasChangedPassword;

  return (
    <div className="app-root">
      <Header />
      <div className="main-area">
        <div className="page-wrap">

          {/* Welcome bar */}
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 style={{ fontSize: '1.7rem', color: 'var(--gold-300)' }}>
                Welcome, {user?.name?.split(' ')[0]} 👋
              </h2>
              <p className="text-muted text-sm">Grade 1 Admission — Parent Portal</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowChangePwd(true)}>
                🔑 Change Password
              </button>
              {!hasApplication && (
                <button className="btn btn-gold" onClick={() => navigate('/apply')}>
                  📋 Fill Application Form
                </button>
              )}
            </div>
          </div>

          {/* Password warning */}
          {needsPasswordChange && (
            <div style={{
              background: 'rgba(245,158,11,.1)',
              border: '1px solid rgba(245,158,11,.4)',
              borderRadius: 'var(--r-md)',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div>
                <p style={{ color: 'var(--warning)', fontWeight: 600 }}>
                  You are using your NIC as your password
                </p>
                <p className="text-sm text-muted">
                  For security, please{' '}
                  <button
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--gold-300)', cursor: 'pointer',
                      textDecoration: 'underline', padding: 0,
                    }}
                    onClick={() => setShowChangePwd(true)}
                  >
                    change your password
                  </button>
                  {' '}to something personal.
                </p>
              </div>
            </div>
          )}

          {/* Main Content */}
          {loading ? (
            <Spinner message="Loading your application..." />
          ) : !hasApplication ? (
            /* No application yet */
            <div className="card card-gold-border" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ color: 'var(--gold-300)', marginBottom: '0.5rem', fontSize: '1.3rem' }}>
                You haven't submitted an application yet
              </h3>
              <p className="text-muted mb-3" style={{ maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
                Click the button below to fill in your child's Grade 1 application form.
                It takes about 5–10 minutes.
              </p>
              <button className="btn btn-gold btn-lg" onClick={() => navigate('/apply')}>
                📋 Start Application Form →
              </button>
            </div>
          ) : (
            /* Show application(s) */
            applications.map(app => (
              <ApplicationCard key={app.id} app={app} />
            ))
          )}

        </div>
      </div>

      {showChangePwd && (
        <ChangePasswordModal onClose={() => setShowChangePwd(false)} />
      )}
    </div>
  );
}

// ── Application Card ──────────────────────────────────────────
function ApplicationCard({ app }) {
  return (
    <div className="card card-gold-border mb-2">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            Application {app.applicationNumber ? `#${app.applicationNumber}` : `#${app.id}`}
          </h3>
          <p className="text-muted text-sm">
            Submitted: {app.submittedAt
              ? new Date(app.submittedAt).toLocaleString()
              : '—'}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <CategoryBadge category={app.category} />
          <StatusBadge   status={app.status} />
        </div>
      </div>

      <div className="form-grid">
        {[
          ["Child's Name (English)", app.childNameEnglish],
          ["Child's Name (Sinhala)", app.childNameSinhala],
          ['Date of Birth',          app.dateOfBirth],
          ['Category Applied',       app.category],
          ['District',               app.district],
          ['Distance to School',     app.distanceFromSchoolKm
            ? `${app.distanceFromSchoolKm} km` : '—'],
        ].map(([label, val]) => (
          <div key={label}>
            <p className="form-label">{label}</p>
            <p style={{ fontSize: '0.9rem' }}>{val || '—'}</p>
          </div>
        ))}
      </div>

      {app.status === 'SELECTED' && (
        <div style={{
          marginTop: '1rem',
          background: 'rgba(16,185,129,.1)',
          border: '1px solid rgba(16,185,129,.4)',
          borderRadius: 'var(--r-md)',
          padding: '1rem',
        }}>
          <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem' }}>
            🎉 Congratulations! Your child has been SELECTED for admission.
          </p>
          <p className="text-muted text-sm mt-1">
            Please visit the school office within 2 weeks to complete enrolment.
          </p>
        </div>
      )}

      {app.status === 'REJECTED' && (
        <div style={{
          marginTop: '1rem',
          background: 'rgba(239,68,68,.07)',
          border: '1px solid rgba(239,68,68,.3)',
          borderRadius: 'var(--r-md)',
          padding: '1rem',
        }}>
          <p style={{ color: 'var(--danger)', fontWeight: 600 }}>
            Your application was not selected this year.
          </p>
          <p className="text-muted text-sm mt-1">
            For queries, please contact the school admissions office.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Change Password Modal ─────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [form,    setForm]    = useState({ current: '', newPwd: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.current)              { setError('Enter your current password'); return; }
    if (form.newPwd.length < 8)     { setError('New password must be at least 8 characters'); return; }
    if (form.newPwd !== form.confirm){ setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      await parentApi.changePassword(form.current, form.newPwd);
      toast.success('✅ Password changed successfully!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2 className="modal-title">🔑 Change Password</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,.1)',
            border: '1px solid rgba(239,68,68,.3)',
            borderRadius: 'var(--r-sm)',
            padding: '0.6rem 0.8rem',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Current Password (NIC if not changed yet)</label>
            <input
              className="form-control"
              type="password"
              placeholder="Your current password"
              value={form.current}
              onChange={e => { setForm(f => ({...f, current: e.target.value})); setError(''); }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="At least 8 characters"
              value={form.newPwd}
              onChange={e => { setForm(f => ({...f, newPwd: e.target.value})); setError(''); }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="Re-enter new password"
              value={form.confirm}
              onChange={e => { setForm(f => ({...f, confirm: e.target.value})); setError(''); }}
            />
          </div>
          <button className="btn btn-gold btn-full" type="submit" disabled={loading}>
            {loading ? '⏳ Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}