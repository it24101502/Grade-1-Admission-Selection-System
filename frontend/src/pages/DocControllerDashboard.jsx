// FILE: frontend/src/pages/DocControllerDashboard.jsx
// Updated: DC can now assign category slots to each parent after creating their account.

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Header, Sidebar, StatCard, Spinner, Empty, SectionHead }
  from '../components/shared/UI';
import { dcApi } from '../services/api';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'CO',  label: 'CO — Chief Occupant'  },
  { value: 'SIS', label: 'SIS — Siblings'        },
  { value: 'OG',  label: 'OG — Old Girls / Boys' },
  { value: 'TR',  label: 'TR — Transfer'         },
  { value: 'EDU', label: 'EDU — Educational'     },
  { value: 'AB',  label: 'AB — Abroad / Other'   },
];

const FIELD_TYPES = [
  { value: 'NUMBER_ONLY',        label: 'Number only',         hint: 'Judge enters a numeric score' },
  { value: 'COMMENT_ONLY',       label: 'Comment only',        hint: 'Judge writes free-text notes' },
  { value: 'NUMBER_AND_COMMENT', label: 'Number + Comment',    hint: 'Judge enters both a score and notes' },
];

const CAT_COLOR = {
  CO: '#3a5fbf', SIS: '#2e7d4a', OG: '#7b3fa0',
  TR: '#b8860b', EDU: '#1a7a8a', AB: '#a04040',
};

const NAV = [{
  label: 'Document Controller',
  items: [
    { id: 'overview',  icon: '📊', label: 'Overview'         },
    { id: 'parents',   icon: '👶', label: 'Create Parent'    },
    { id: 'manage',    icon: '👥', label: 'Manage Parents'   },
    { id: 'schemes',   icon: '📝', label: 'Marking Schemes'  },
  ],
}];

// ── Root component ────────────────────────────────────────────────────────────
export default function DocControllerDashboard() {
  const [panel, setPanel] = useState('overview');
  return (
    <div className="app-root">
      <Header />
      <div className="dashboard-layout">
        <Sidebar sections={NAV} activeId={panel} onSelect={setPanel} />
        <div className="main-area">
          <div className="page-wrap">
            {panel === 'overview' && <OverviewPanel   onNav={setPanel} />}
            {panel === 'parents'  && <CreateParentPanel onCreated={() => setPanel('manage')} />}
            {panel === 'manage'   && <ManageParentsPanel />}
            {panel === 'schemes'  && <SchemesPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  OVERVIEW PANEL
// ════════════════════════════════════════════════════════════════════════════
function OverviewPanel({ onNav }) {
  const [parents, setParents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dcApi.getAllParents(), dcApi.getSchemesSummary()])
      .then(([pr, sr]) => { setParents(pr.data); setSummary(sr.data); })
      .catch(() => toast.error('Failed to load overview'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner message="Loading overview..." />;

  const submitted    = parents.filter(p => p.hasSubmitted).length;
  const schemesReady = summary ? Object.values(summary).filter(s => s.hasActiveScheme).length : 0;

  return (
    <>
      <SectionHead icon="📊" title="DC Overview" />

      <div className="stats-row">
        <StatCard icon="👥" value={parents.length}  label="Parent Accounts" />
        <StatCard icon="📋" value={submitted}        label="Submitted Apps"   color="var(--success)" />
        <StatCard icon="⏳" value={parents.length - submitted} label="Pending"  color="var(--warning)" />
        <StatCard icon="📝" value={`${schemesReady}/6`} label="Schemes Ready" color={schemesReady === 6 ? 'var(--success)' : 'var(--warning)'} />
      </div>

      {/* Scheme status grid */}
      <div className="card mt-2">
        <div className="card-header">
          <h3 className="card-title">Marking Scheme Status</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav('schemes')}>
            Manage Schemes →
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
          {CATEGORIES.map(cat => {
            const info = summary?.[cat.value] || {};
            return (
              <div key={cat.value} style={{
                padding: '0.85rem 1rem',
                background: info.hasActiveScheme
                  ? 'rgba(16,185,129,.07)' : 'rgba(245,158,11,.07)',
                border: `1px solid ${info.hasActiveScheme
                  ? 'rgba(16,185,129,.25)' : 'rgba(245,158,11,.25)'}`,
                borderRadius: 'var(--r-md)',
              }}>
                <div className="flex justify-between items-center mb-1">
                  <span style={{
                    background: CAT_COLOR[cat.value] + '22',
                    color: CAT_COLOR[cat.value],
                    border: `1px solid ${CAT_COLOR[cat.value]}55`,
                    borderRadius: 'var(--r-sm)',
                    padding: '2px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}>{cat.value}</span>
                  <span style={{ fontSize: '1rem' }}>
                    {info.hasActiveScheme ? '✅' : '⚠️'}
                  </span>
                </div>
                {info.hasActiveScheme ? (
                  <>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 2px' }}>
                      {info.criteriaCount} criteria · max {info.totalPossible} pts
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                      {info.title}
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize: '0.78rem', color: 'var(--warning)', margin: '4px 0 0' }}>
                    No scheme yet
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <button className="btn btn-gold" onClick={() => onNav('parents')}>
          ➕ Create Parent Account
        </button>
        <button className="btn btn-navy" onClick={() => onNav('schemes')}>
          📝 Manage Marking Schemes
        </button>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  CREATE PARENT PANEL
// ════════════════════════════════════════════════════════════════════════════
function CreateParentPanel({ onCreated }) {
  const [form,    setForm]    = useState({ phone: '', nic: '', childName: '', category: 'CO' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.phone.trim())     e.phone     = 'Phone number is required';
    else if (!/^[\d+\-() ]{7,15}$/.test(form.phone.trim()))
                                e.phone     = 'Enter a valid phone number';
    if (!form.nic.trim())       e.nic       = 'NIC is required';
    else if (form.nic.trim().length < 9)
                                e.nic       = 'NIC must be at least 9 characters';
    if (!form.childName.trim()) e.childName = "Child's name is required";
    return e;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data } = await dcApi.createParent(
        form.phone.trim(), form.nic.trim(), form.childName.trim(), form.category);
      setResult(data);
      toast.success(`✅ Account created for ${form.childName}`);
      setForm({ phone: '', nic: '', childName: '', category: 'CO' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SectionHead icon="👶" title="Create Parent Account" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Form card */}
        <div className="card card-gold-border">
          <div className="card-header"><h3 className="card-title">New Parent Account</h3></div>

          {/* Credentials info box */}
          <div style={{
            background: 'rgba(212,160,23,.07)',
            border: '1px solid rgba(212,160,23,.25)',
            borderRadius: 'var(--r-sm)', padding: '0.75rem 1rem',
            marginBottom: '1.25rem', fontSize: '0.85rem',
          }}>
            <p style={{ color: 'var(--gold-200)', fontWeight: 600, marginBottom: '4px' }}>
              🔑 Login credentials for parent:
            </p>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              <strong>Username</strong> = Phone number you enter below<br />
              <strong>Password</strong> = NIC number you enter below
            </p>
          </div>

          <form onSubmit={handleCreate}>
            {/* Phone */}
            <div className="form-group">
              <label className="form-label">
                Phone Number <span className="required-star">*</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>
                  (this becomes the login username)
                </span>
              </label>
              <input className="form-control" type="tel" placeholder="e.g. 0771234567"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>

            {/* NIC */}
            <div className="form-group">
              <label className="form-label">
                NIC Number <span className="required-star">*</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>
                  (this becomes the initial password)
                </span>
              </label>
              <input className="form-control" type="text" placeholder="e.g. 199012345678"
                value={form.nic} onChange={e => set('nic', e.target.value)} />
              {errors.nic && <p className="form-error">{errors.nic}</p>}
            </div>

            {/* Child name */}
            <div className="form-group">
              <label className="form-label">
                Child's Name <span className="required-star">*</span>
              </label>
              <input className="form-control" type="text" placeholder="e.g. Sithum Perera"
                value={form.childName} onChange={e => set('childName', e.target.value)} />
              {errors.childName && <p className="form-error">{errors.childName}</p>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">
                Application Category <span className="required-star">*</span>
              </label>
              <select className="form-control"
                value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <button className="btn btn-gold btn-full" type="submit" disabled={loading}>
              {loading ? '⏳ Creating...' : '➕ Create Account'}
            </button>
          </form>
        </div>

        {/* Right side: result or guide */}
        <div>
          {result ? (
            <div className="card" style={{
              border: '1.5px solid var(--success)',
              background: 'rgba(16,185,129,.04)',
            }}>
              <div className="card-header">
                <h3 className="card-title" style={{ color: 'var(--success)' }}>
                  ✅ Account Created
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  ['Child Name',          result.childName],
                  ['Category',            result.category],
                  ['Login Username',       result.username],
                  ['Initial Password',     result.password],
                ].map(([label, value]) => (
                  <div key={label} style={{
                    background: 'rgba(7,20,50,.4)',
                    borderRadius: 'var(--r-sm)', padding: '0.6rem 0.85rem',
                  }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                      {label}
                    </p>
                    <p style={{
                      fontFamily: 'monospace', color: 'var(--gold-200)',
                      fontWeight: 700, fontSize: '0.95rem', margin: 0,
                    }}>{value}</p>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '1rem',
                background: 'rgba(245,158,11,.08)',
                border: '1px solid rgba(245,158,11,.2)',
                borderRadius: 'var(--r-sm)', padding: '0.65rem 0.85rem',
                fontSize: '0.82rem', color: 'var(--warning)',
              }}>
                ⚠️ Please share these credentials with the parent securely.
                The password is their NIC number and should be changed on first login.
              </div>

              <div className="flex gap-2 mt-2">
                <button className="btn btn-ghost btn-sm" onClick={() => setResult(null)}>
                  ➕ Create Another
                </button>
                <button className="btn btn-navy btn-sm" onClick={onCreated}>
                  👥 View All Parents →
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header"><h3 className="card-title">📋 How it works</h3></div>
              <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  'Parent visits the school office with physical documents.',
                  'You enter their phone number, NIC, child\'s name, and category.',
                  'The system creates a login: phone = username, NIC = password.',
                  'Parent logs in and fills the online application form.',
                  'On first login the parent is prompted to change their password.',
                  'Submitted forms are routed to the correct judge automatically.',
                ].map((s, i) => (
                  <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--gold-300)' }}>Step {i + 1}:</strong> {s}
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

// ════════════════════════════════════════════════════════════════════════════
//  MANAGE PARENTS PANEL
// ════════════════════════════════════════════════════════════════════════════
function ManageParentsPanel() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [catFilter, setCatFilter] = useState('');

  const fetchParents = useCallback(async () => {
    setLoading(true);
    try { setParents((await dcApi.getAllParents()).data); }
    catch { toast.error('Failed to load parents'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchParents(); }, [fetchParents]);

  const filtered = parents.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.childName.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.nic.toLowerCase().includes(q);
    const matchCat = !catFilter || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const submitted = parents.filter(p => p.hasSubmitted).length;

  return (
    <>
      <SectionHead icon="👥" title="Manage Parents">
        <button className="btn btn-ghost btn-sm" onClick={fetchParents}>🔄 Refresh</button>
      </SectionHead>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '1.25rem' }}>
        <StatCard icon="👥" value={parents.length}             label="Total Accounts" />
        <StatCard icon="✅" value={submitted}                   label="Submitted"       color="var(--success)" />
        <StatCard icon="⏳" value={parents.length - submitted}  label="Pending"         color="var(--warning)" />
        <StatCard icon="🔒" value={parents.filter(p => !p.active).length} label="Deactivated" color="var(--danger)" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        <input className="form-control" style={{ flex: 1, minWidth: 200 }}
          placeholder="🔍 Search by name, phone, or NIC…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-control" style={{ width: 'auto' }}
          value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <Empty icon="👥" message="No parents found"
            sub="Create accounts using the 'Create Parent' panel." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Child Name</th>
                  <th>Category</th>
                  <th>Phone (Username)</th>
                  <th>NIC</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <ParentRow key={p.id} parent={p} onRefresh={fetchParents} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <p className="text-muted text-sm mt-2">
            Showing {filtered.length} of {parents.length} accounts
          </p>
        )}
      </div>
    </>
  );
}

function ParentRow({ parent: p, onRefresh }) {
  const [busy, setBusy] = useState(false);

  const handleReset = async () => {
    if (!window.confirm(`Reset password for ${p.childName}'s parent to their NIC?`)) return;
    setBusy(true);
    try {
      await dcApi.resetPassword(p.id);
      toast.success('Password reset to NIC');
    } catch { toast.error('Failed to reset password'); }
    finally { setBusy(false); }
  };

  const handleToggleActive = async () => {
    const action = p.active ? 'deactivate' : 'activate';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} account for ${p.childName}'s parent?`)) return;
    setBusy(true);
    try {
      await dcApi.setActive(p.id, !p.active);
      toast.success(`Account ${action}d`);
      onRefresh();
    } catch { toast.error('Failed to update status'); }
    finally { setBusy(false); }
  };

  return (
    <tr style={{ opacity: p.active ? 1 : 0.55 }}>
      <td>
        <p style={{ fontWeight: 600, margin: 0 }}>{p.childName}</p>
      </td>
      <td>
        <span style={{
          background: (CAT_COLOR[p.category] || '#666') + '22',
          color: CAT_COLOR[p.category] || '#aaa',
          border: `1px solid ${(CAT_COLOR[p.category] || '#666')}44`,
          borderRadius: 'var(--r-sm)',
          padding: '2px 8px', fontSize: '0.78rem', fontWeight: 700,
        }}>{p.category}</span>
      </td>
      <td style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>{p.phone}</td>
      <td style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
        {p.nic}
      </td>
      <td>
        {p.hasSubmitted
          ? <span style={{ color: 'var(--success)', fontSize: '0.82rem', fontWeight: 600 }}>✅ Submitted</span>
          : <span style={{ color: 'var(--warning)', fontSize: '0.82rem' }}>⏳ Pending</span>
        }
        {!p.active && (
          <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'block' }}>
            🔒 Deactivated
          </span>
        )}
      </td>
      <td>
        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={handleReset} disabled={busy}>
            🔑 Reset
          </button>
          <button
            className={`btn btn-sm ${p.active ? 'btn-danger' : 'btn-success'}`}
            onClick={handleToggleActive} disabled={busy}>
            {p.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  MARKING SCHEMES PANEL
// ════════════════════════════════════════════════════════════════════════════
function SchemesPanel() {
  const [activeCategory, setActiveCategory] = useState('CO');
  const [summary,        setSummary]        = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try { setSummary((await dcApi.getSchemesSummary()).data); }
    catch { toast.error('Failed to load schemes'); }
    finally { setLoadingSummary(false); }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  return (
    <>
      <SectionHead icon="📝" title="Marking Schemes">
        <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>
          Each judge category has its own independent marking scheme
        </p>
      </SectionHead>

      {/* Category tabs */}
      <div className="flex gap-1 mb-3" style={{ flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => {
          const info = summary?.[cat.value] || {};
          return (
            <button
              key={cat.value}
              className={`btn btn-sm ${activeCategory === cat.value ? 'btn-gold' : 'btn-ghost'}`}
              onClick={() => setActiveCategory(cat.value)}
              style={{ position: 'relative' }}
            >
              {cat.value}
              {!loadingSummary && (
                <span style={{
                  marginLeft: 6, fontSize: '0.65rem',
                  color: info.hasActiveScheme ? 'var(--success)' : 'var(--warning)',
                }}>
                  {info.hasActiveScheme ? '●' : '○'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Per-category scheme editor */}
      <CategorySchemeEditor
        category={activeCategory}
        summaryInfo={summary?.[activeCategory]}
        onSchemeSaved={fetchSummary}
      />
    </>
  );
}

// ── Category Scheme Editor ────────────────────────────────────────────────────
function CategorySchemeEditor({ category, summaryInfo, onSchemeSaved }) {
  const [scheme,   setScheme]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState('view');  // 'view' | 'create'

  const fetchScheme = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await dcApi.getActiveScheme(category);
      setScheme(data);
      setView('view');
    } catch {
      setScheme(null);
      setView('create');    // no scheme yet → go straight to creator
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchScheme(); }, [fetchScheme]);

  if (loading) return <Spinner message="Loading scheme…" />;

  return (
    <div>
      {view === 'view' && scheme ? (
        <SchemeViewer
          scheme={scheme}
          category={category}
          onEdit={() => setView('create')}
          onRefresh={() => { fetchScheme(); onSchemeSaved(); }}
        />
      ) : (
        <SchemeBuilder
          category={category}
          existingScheme={scheme}
          onSaved={() => { fetchScheme(); onSchemeSaved(); }}
          onCancel={scheme ? () => setView('view') : undefined}
        />
      )}
    </div>
  );
}

// ── Scheme Viewer ─────────────────────────────────────────────────────────────
function SchemeViewer({ scheme, category, onEdit, onRefresh }) {
  const [removingId, setRemovingId] = useState(null);

  const handleRemoveCriterion = async (id, title) => {
    if (!window.confirm(`Remove criterion "${title}"?`)) return;
    setRemovingId(id);
    try {
      await dcApi.removeCriterion(id);
      toast.success('Criterion removed');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove criterion');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h3 className="card-title">{scheme.title}</h3>
          <p className="text-muted text-sm" style={{ marginTop: 2 }}>
            {scheme.criteriaCount} criteria · {scheme.totalPossible} total points ·
            <span style={{ color: 'var(--success)', marginLeft: 4 }}>● Active</span>
          </p>
        </div>
        <button className="btn btn-gold btn-sm" onClick={onEdit}>
          ✏️ Replace with New Scheme
        </button>
      </div>

      {/* Criteria table */}
      {scheme.criteria.length === 0 ? (
        <Empty message="No criteria yet" sub="Add criteria using the scheme builder." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 36 }}>#</th>
                <th>Criterion Title</th>
                <th>Input Type</th>
                <th>Max Score</th>
                <th>Guide / Hint</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {scheme.criteria.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{c.title}</td>
                  <td>
                    <FieldTypeBadge type={c.fieldType} />
                  </td>
                  <td style={{ fontFamily: 'Cinzel', color: 'var(--gold-300)', fontWeight: 700 }}>
                    {c.maxScore ?? '—'}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {c.description || '—'}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                      onClick={() => handleRemoveCriterion(c.id, c.title)}
                      disabled={removingId === c.id}
                    >
                      {removingId === c.id ? '…' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr style={{ background: 'rgba(212,160,23,.06)' }}>
                <td colSpan={3} style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Total possible score:
                </td>
                <td style={{ fontFamily: 'Cinzel', fontWeight: 700, color: 'var(--gold-200)' }}>
                  {scheme.totalPossible}
                </td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Add criterion inline */}
      <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <p className="form-label mb-2">➕ Add Criterion to This Scheme</p>
        <AddCriterionRow schemeId={scheme.id} onAdded={onRefresh} />
      </div>
    </div>
  );
}

// ── Add criterion inline row ──────────────────────────────────────────────────
function AddCriterionRow({ schemeId, onAdded }) {
  const blank = { title: '', fieldType: 'NUMBER_ONLY', maxScore: '', description: '' };
  const [form, setForm]   = useState(blank);
  const [busy, setBusy]   = useState(false);
  const [errs, setErrs]   = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrs(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.fieldType !== 'COMMENT_ONLY') {
      const n = parseFloat(form.maxScore);
      if (isNaN(n) || n <= 0) e.maxScore = 'Enter a valid max score (> 0)';
    }
    return e;
  };

  const handleAdd = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setBusy(true);
    try {
      await dcApi.addCriterion(schemeId, {
        title:       form.title.trim(),
        fieldType:   form.fieldType,
        maxScore:    form.fieldType !== 'COMMENT_ONLY' ? parseFloat(form.maxScore) : undefined,
        description: form.description.trim() || undefined,
      });
      toast.success('Criterion added');
      setForm(blank);
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add criterion');
    } finally {
      setBusy(false);
    }
  };

  const needsMax = form.fieldType !== 'COMMENT_ONLY';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr auto', gap: '0.5rem', alignItems: 'flex-start' }}>
      <div>
        <input className="form-control" placeholder="Criterion title *"
          value={form.title} onChange={e => set('title', e.target.value)} />
        {errs.title && <p className="form-error">{errs.title}</p>}
      </div>
      <select className="form-control" value={form.fieldType}
        onChange={e => set('fieldType', e.target.value)}>
        {FIELD_TYPES.map(ft => (
          <option key={ft.value} value={ft.value}>{ft.label}</option>
        ))}
      </select>
      <div>
        <input className="form-control" type="number" placeholder={needsMax ? 'Max score *' : 'N/A'}
          disabled={!needsMax} value={form.maxScore}
          onChange={e => set('maxScore', e.target.value)} />
        {errs.maxScore && <p className="form-error">{errs.maxScore}</p>}
      </div>
      <input className="form-control" placeholder="Hint / guide (optional)"
        value={form.description} onChange={e => set('description', e.target.value)} />
      <button className="btn btn-gold btn-sm" onClick={handleAdd} disabled={busy}
        style={{ whiteSpace: 'nowrap' }}>
        {busy ? '…' : '➕ Add'}
      </button>
    </div>
  );
}

// ── Scheme Builder (create a full new scheme) ─────────────────────────────────
function SchemeBuilder({ category, existingScheme, onSaved, onCancel }) {
  const [title,    setTitle]    = useState('');
  const [criteria, setCriteria] = useState([newBlankCriterion()]);
  const [saving,   setSaving]   = useState(false);
  const [errs,     setErrs]     = useState({});

  function newBlankCriterion(order = 0) {
    return { _id: Date.now() + order, title: '', fieldType: 'NUMBER_ONLY', maxScore: '', description: '' };
  }

  const addRow    = () => setCriteria(prev => [...prev, newBlankCriterion(prev.length)]);
  const removeRow = (idx) => setCriteria(prev => prev.filter((_, i) => i !== idx));
  const updateRow = (idx, key, val) => {
    setCriteria(prev => prev.map((c, i) => i === idx ? { ...c, [key]: val } : c));
    setErrs(e => { const ne = { ...e }; delete ne[`c_${idx}_${key}`]; return ne; });
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Scheme title is required';
    if (criteria.length === 0) e.criteria = 'Add at least one criterion';
    criteria.forEach((c, i) => {
      if (!c.title.trim()) e[`c_${i}_title`] = 'Required';
      if (c.fieldType !== 'COMMENT_ONLY') {
        const n = parseFloat(c.maxScore);
        if (isNaN(n) || n <= 0) e[`c_${i}_maxScore`] = 'Required (> 0)';
      }
    });
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setSaving(true);
    try {
      const payload = criteria.map(c => ({
        title:       c.title.trim(),
        fieldType:   c.fieldType,
        maxScore:    c.fieldType !== 'COMMENT_ONLY' ? parseFloat(c.maxScore) : undefined,
        description: c.description.trim() || undefined,
      }));
      await dcApi.createScheme(category, title.trim(), payload);
      toast.success(`✅ Marking scheme saved for ${category}`);
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save scheme');
    } finally {
      setSaving(false);
    }
  };

  const previewTotal = criteria
    .filter(c => c.fieldType !== 'COMMENT_ONLY')
    .reduce((sum, c) => sum + (parseFloat(c.maxScore) || 0), 0);

  return (
    <div className="card card-gold-border">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            {existingScheme ? '🔄 Create New Scheme Version' : '📝 Create Marking Scheme'} — {category}
          </h3>
          {existingScheme && (
            <p className="text-muted text-sm" style={{ marginTop: 2 }}>
              This will replace the current active scheme for {category}.
              The old scheme is kept in history.
            </p>
          )}
        </div>
        {onCancel && (
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
        )}
      </div>

      {/* Scheme title */}
      <div className="form-group">
        <label className="form-label">
          Scheme Title <span className="required-star">*</span>
        </label>
        <input className="form-control"
          placeholder={`e.g. ${category} Category Marking Scheme 2025`}
          value={title} onChange={e => { setTitle(e.target.value); setErrs(v => ({ ...v, title: '' })); }} />
        {errs.title && <p className="form-error">{errs.title}</p>}
      </div>

      {/* Criteria rows */}
      <div style={{ marginTop: '0.5rem' }}>
        <div className="flex justify-between items-center mb-2">
          <p className="form-label" style={{ margin: 0 }}>
            Marking Criteria
            {previewTotal > 0 && (
              <span style={{ marginLeft: 8, color: 'var(--gold-300)', fontWeight: 700 }}>
                ({previewTotal} total pts)
              </span>
            )}
          </p>
          <button className="btn btn-ghost btn-sm" type="button" onClick={addRow}>
            ➕ Add Row
          </button>
        </div>
        {errs.criteria && <p className="form-error mb-2">{errs.criteria}</p>}

        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.6fr 1fr 2fr 32px',
          gap: '0.4rem', marginBottom: '0.35rem',
        }}>
          {['Criterion Title *', 'Input Type *', 'Max Score *', 'Hint / Guide (optional)', ''].map((h, i) => (
            <p key={i} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>{h}</p>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {criteria.map((c, idx) => {
            const needsMax = c.fieldType !== 'COMMENT_ONLY';
            return (
              <div key={c._id} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.6fr 1fr 2fr 32px',
                gap: '0.4rem', alignItems: 'flex-start',
              }}>
                {/* Title */}
                <div>
                  <input className="form-control" placeholder="e.g. Distance from school"
                    value={c.title} onChange={e => updateRow(idx, 'title', e.target.value)} />
                  {errs[`c_${idx}_title`] && (
                    <p className="form-error">{errs[`c_${idx}_title`]}</p>
                  )}
                </div>

                {/* Type */}
                <select className="form-control" value={c.fieldType}
                  onChange={e => updateRow(idx, 'fieldType', e.target.value)}>
                  {FIELD_TYPES.map(ft => (
                    <option key={ft.value} value={ft.value} title={ft.hint}>{ft.label}</option>
                  ))}
                </select>

                {/* Max score */}
                <div>
                  <input className="form-control" type="number" min="0"
                    placeholder={needsMax ? 'e.g. 30' : '—'}
                    disabled={!needsMax}
                    value={c.maxScore}
                    onChange={e => updateRow(idx, 'maxScore', e.target.value)} />
                  {errs[`c_${idx}_maxScore`] && (
                    <p className="form-error">{errs[`c_${idx}_maxScore`]}</p>
                  )}
                </div>

                {/* Description */}
                <input className="form-control" placeholder="e.g. 0 = far, 30 = very near"
                  value={c.description}
                  onChange={e => updateRow(idx, 'description', e.target.value)} />

                {/* Remove row */}
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: 'var(--danger)', cursor: 'pointer',
                    fontSize: '1rem', padding: '6px', borderRadius: 'var(--r-sm)',
                  }}
                  title="Remove criterion"
                >✕</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Field type legend */}
      <div style={{
        marginTop: '1rem',
        padding: '0.65rem 0.85rem',
        background: 'rgba(7,20,50,.35)',
        borderRadius: 'var(--r-sm)',
        display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
      }}>
        {FIELD_TYPES.map(ft => (
          <span key={ft.value} style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>{ft.label}</strong>: {ft.hint}
          </span>
        ))}
      </div>

      {/* Save button */}
      <div className="flex gap-2 mt-3">
        <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
          {saving ? '⏳ Saving…' : `💾 Save ${category} Scheme`}
        </button>
        {onCancel && (
          <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        )}
      </div>
    </div>
  );
}

// ── Small helper component: field type badge ──────────────────────────────────
function FieldTypeBadge({ type }) {
  const config = {
    NUMBER_ONLY:        { label: '🔢 Number',        color: '#1a7a8a' },
    COMMENT_ONLY:       { label: '💬 Comment',        color: '#7b3fa0' },
    NUMBER_AND_COMMENT: { label: '🔢💬 Both',         color: '#b8860b' },
  };
  const { label, color } = config[type] || { label: type, color: '#666' };
  return (
    <span style={{
      background: color + '20', color,
      border: `1px solid ${color}44`,
      borderRadius: 'var(--r-sm)', padding: '2px 8px',
      fontSize: '0.76rem', fontWeight: 600, whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}