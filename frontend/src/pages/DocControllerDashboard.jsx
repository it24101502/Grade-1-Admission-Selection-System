// FILE: frontend/src/pages/DocControllerDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Header, Sidebar, StatusBadge, StatCard, Spinner, Empty, SectionHead }
  from '../components/shared/UI';
import { dcApi } from '../services/api';

const NAV = [
  {
    label: 'Main',
    items: [
      { id: 'create', icon: '➕', label: 'Create Parent Login' },
      { id: 'manage', icon: '👥', label: 'Manage Parents'      },
    ],
  },
];

export default function DocControllerDashboard() {
  const [panel, setPanel] = useState('create');

  return (
    <div className="app-root">
      <Header />
      <div className="dashboard-layout">
        <Sidebar sections={NAV} activeId={panel} onSelect={setPanel} />
        <div className="main-area">
          <div className="page-wrap">
            {panel === 'create' && <CreateLoginPanel onCreated={() => setPanel('manage')} />}
            {panel === 'manage' && <ManageParentsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
//  PANEL 1: Create Parent Login
// ================================================================
function CreateLoginPanel({ onCreated }) {
  const [form, setForm]       = useState({ fullName: '', email: '', nic: '' });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [errors,  setErrors]  = useState({});

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())  e.fullName = 'Full name is required';
    if (!form.email.trim())     e.email    = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.nic.trim())       e.nic      = 'NIC is required';
    if (form.nic.length < 9)    e.nic      = 'NIC must be at least 9 characters';
    return e;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await dcApi.createParentLogin(
        form.fullName.trim(),
        form.email.trim(),
        form.nic.trim()
      );
      setResult(data);
      toast.success(`✅ Parent login created for ${form.fullName}`);
      setForm({ fullName: '', email: '', nic: '' });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create login. Please try again.';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors(e => ({ ...e, email: msg }));
      if (msg.toLowerCase().includes('nic'))   setErrors(e => ({ ...e, nic: msg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SectionHead icon="➕" title="Create Parent Login" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* ── Form ── */}
        <div className="card card-gold-border">
          <div className="card-header">
            <h3 className="card-title">New Parent Account</h3>
          </div>

          <div style={{
            background: 'rgba(212,160,23,.06)',
            border: '1px solid rgba(212,160,23,.2)',
            borderRadius: 'var(--r-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}>
            <strong style={{ color: 'var(--gold-200)' }}>How it works:</strong><br />
            Enter the parent details from the physical form. The system creates a login where:<br />
            <strong style={{ color: 'var(--gold-300)' }}>Username = Email &nbsp;|&nbsp; Password = NIC number</strong>
          </div>

          <form onSubmit={handleCreate}>

            <div className="form-group">
              <label className="form-label">
                Parent / Guardian Full Name <span className="required-star">*</span>
              </label>
              <input
                className="form-control"
                placeholder="e.g. Priya Fernando"
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
              />
              {errors.fullName && <p className="form-error">{errors.fullName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required-star">*</span>
              </label>
              <input
                className="form-control"
                type="email"
                placeholder="parent@gmail.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
              <p className="form-hint">This will be the parent's username to login.</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                NIC Number <span className="required-star">*</span>
              </label>
              <input
                className="form-control"
                placeholder="199XXXXXXXXXV or 20XXXXXXXXXX"
                value={form.nic}
                onChange={e => set('nic', e.target.value)}
              />
              {errors.nic && <p className="form-error">{errors.nic}</p>}
              <p className="form-hint">This will be the parent's initial login password.</p>
            </div>

            <button
              className="btn btn-gold btn-full"
              type="submit"
              disabled={loading}
            >
              {loading ? '⏳ Creating...' : '➕ Create Parent Login'}
            </button>

          </form>
        </div>

        {/* ── Result / Instructions ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {result ? (
            <div className="card" style={{
              border: '1.5px solid var(--success)',
              background: 'rgba(16,185,129,.05)',
            }}>
              <div className="card-header">
                <h3 className="card-title" style={{ color: 'var(--success)' }}>
                  ✅ Login Created Successfully
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  ['Parent Name', result.fullName],
                  ['Email (Username)', result.email],
                  ['NIC (Initial Password)', result.nic],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="form-label" style={{ marginBottom: '2px' }}>{label}</p>
                    <p style={{
                      fontFamily: label.includes('Email') || label.includes('NIC')
                        ? 'monospace' : 'inherit',
                      color: 'var(--gold-200)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}>{val}</p>
                  </div>
                ))}

                <div className="divider" />

                <div>
                  <p className="form-label">Login Link to Send Parent</p>
                  <div style={{
                    background: 'rgba(0,0,0,.3)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    padding: '0.6rem 0.8rem',
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    color: 'var(--gold-200)',
                    wordBreak: 'break-all',
                  }}>
                    http://localhost:3000/login?role=parent
                  </div>
                  <p className="form-hint mt-1">
                    Send the parent: their email, NIC, and this link via SMS or email.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setResult(null)}
                  >
                    ➕ Create Another
                  </button>
                  <button
                    className="btn btn-navy btn-sm"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `Login: http://localhost:3000/login?role=parent\nEmail: ${result.email}\nPassword: ${result.nic}`
                      );
                      toast.success('Copied to clipboard!');
                    }}
                  >
                    📋 Copy Details
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📋 Process Guide</h3>
              </div>
              <ol style={{
                paddingLeft: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.7rem',
              }}>
                {[
                  'Parent submits physical application form at the school office.',
                  'You enter their name, email, and NIC in the form on the left.',
                  'System creates a login account automatically.',
                  'Send the parent their email, NIC (as password), and the login link.',
                  'Parent logs in and fills the online datasheet (4 steps).',
                  'Completed forms are automatically routed to the assigned judge.',
                ].map((step, i) => (
                  <li key={i} style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.87rem',
                    lineHeight: 1.5,
                  }}>
                    <strong style={{ color: 'var(--gold-300)' }}>Step {i + 1}:</strong> {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// ================================================================
//  PANEL 2: Manage Parents
// ================================================================
function ManageParentsPanel() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  const fetchParents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await dcApi.getAllParents();
      setParents(data);
    } catch (err) {
      toast.error('Failed to load parents. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchParents(); }, [fetchParents]);

  const handleResetPassword = async (id, name) => {
    if (!window.confirm(`Reset password for "${name}" back to their NIC number?`)) return;
    try {
      await dcApi.resetPassword(id);
      toast.success(`Password reset to NIC for ${name}`);
    } catch {
      toast.error('Failed to reset password');
    }
  };

  const handleToggle = async (id, isActive, name) => {
    const action = isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} "${name}"?`)) return;
    try {
      await dcApi.toggleActive(id, !isActive);
      toast.success(`Account ${action}d`);
      fetchParents();
    } catch {
      toast.error('Failed to update account status');
    }
  };

  const filtered = parents.filter(p => {
    const q = search.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.nic || '').toLowerCase().includes(q)
    );
  });

  const total     = parents.length;
  const submitted = parents.filter(p => p.formFilled).length;
  const pending   = total - submitted;

  return (
    <>
      <SectionHead icon="👥" title="Manage Parents">
        <button className="btn btn-ghost btn-sm" onClick={fetchParents}>
          🔄 Refresh
        </button>
      </SectionHead>

      {/* Stats */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '1.5rem' }}>
        <StatCard icon="👥" value={total}     label="Total Accounts" />
        <StatCard icon="✅" value={submitted} label="Forms Submitted"  color="var(--success)" />
        <StatCard icon="⏳" value={pending}   label="Pending Forms"    color="var(--warning)" />
      </div>

      {/* Search */}
      <div className="form-group">
        <input
          className="form-control"
          placeholder="🔍 Search by name, email, or NIC..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <Spinner message="Loading parent accounts..." />
        ) : filtered.length === 0 ? (
          <Empty
            icon="👥"
            message={total === 0 ? 'No parent accounts created yet' : 'No results found'}
            sub={total === 0 ? 'Use the "Create Parent Login" panel to add parents.' : 'Try a different search term.'}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Parent Name</th>
                  <th>Email</th>
                  <th>NIC</th>
                  <th>Form Status</th>
                  <th>Account</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--gold-300)', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 500 }}>{p.fullName}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {p.email}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {p.nic}
                    </td>
                    <td><StatusBadge status={p.formStatus} /></td>
                    <td>
                      <span className={`badge ${p.isActive ? 's-submitted' : 's-rejected'}`}>
                        {p.isActive ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Reset password back to NIC"
                          onClick={() => handleResetPassword(p.id, p.fullName)}
                        >
                          🔑 Reset
                        </button>
                        <button
                          className={`btn btn-sm ${p.isActive ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggle(p.id, p.isActive, p.fullName)}
                        >
                          {p.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}