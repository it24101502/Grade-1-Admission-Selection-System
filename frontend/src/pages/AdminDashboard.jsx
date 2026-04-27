// FILE: frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { Header, Sidebar, StatusBadge, CategoryBadge, StatCard, Spinner, Empty, SectionHead }
  from '../components/shared/UI';
import { adminApi, reportApi } from '../services/api';

const CATEGORIES = ['CO', 'SIS', 'OG', 'TR', 'EDU', 'AB'];

const FIELD_TYPES = [
  { value: 'NUMBER_ONLY',        label: 'Number only',      hint: 'Numeric score' },
  { value: 'COMMENT_ONLY',       label: 'Comment only',     hint: 'Free-text notes' },
  { value: 'NUMBER_AND_COMMENT', label: 'Number + Comment', hint: 'Score and notes' },
];

const NAV = [{
  label: 'Admin Panel',
  items: [
    { id: 'dashboard',    icon: '📊', label: 'Dashboard'        },
    { id: 'applications', icon: '📋', label: 'All Applications' },
    { id: 'schemes',      icon: '📝', label: 'Marking Schemes'  },
    { id: 'users',        icon: '👤', label: 'User Progress'    },
    { id: 'publish',      icon: '🏆', label: 'Publish Results'  },
    { id: 'report',       icon: '📈', label: 'Report'           },
  ],
}];

export default function AdminDashboard() {
  const [panel, setPanel] = useState('dashboard');
  return (
    <div className="app-root">
      <Header />
      <div className="dashboard-layout">
        <Sidebar sections={NAV} activeId={panel} onSelect={setPanel} />
        <div className="main-area">
          <div className="page-wrap">
            {panel === 'dashboard'    && <DashboardPanel />}
            {panel === 'applications' && <ApplicationsPanel />}
            {panel === 'schemes'      && <SchemesPanel />}
            {panel === 'users'        && <UserProgressPanel />}
            {panel === 'publish'      && <PublishResultsPanel />}
            {panel === 'report'       && <ReportPanel role="ADMIN" />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard Panel ───────────────────────────────────────────
function DashboardPanel() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats)  return <Empty message="No data" />;

  return (
    <>
      <SectionHead icon="📊" title="Admin Dashboard" />
      <div className="stats-row">
        <StatCard icon="📋" value={stats.totalApplications} label="Total Applications" />
        <StatCard icon="👥" value={stats.totalParents}      label="Parent Accounts" />
        <StatCard icon="👤" value={stats.totalUsers}        label="Users" />
        <StatCard icon="✏️" value={stats.scored}            label="Scored" color="var(--success)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1rem' }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Applications by Category</h3></div>
          {CATEGORIES.map(cat => {
            const count = stats.byCategory?.[cat] || 0;
            const pct   = stats.totalApplications > 0
              ? Math.round((count / stats.totalApplications) * 100) : 0;
            return (
              <div key={cat} style={{ marginBottom: '0.75rem' }}>
                <div className="flex justify-between" style={{ marginBottom: '0.25rem' }}>
                  <CategoryBadge category={cat} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{count}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--navy-700)', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold-400)', borderRadius: '3px', transition: 'width 0.4s' }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Applications by Status</h3></div>
          {Object.entries(stats.byStatus || {}).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center" style={{ marginBottom: '0.6rem' }}>
              <StatusBadge status={status} />
              <span style={{ fontFamily: 'Cinzel', fontWeight: 700, color: 'var(--gold-200)', fontSize: '1rem' }}>{count}</span>
            </div>
          ))}
          {stats.flagged > 0 && (
            <div style={{ marginTop: '0.75rem', padding: '0.6rem', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 'var(--r-sm)', color: 'var(--danger)', fontSize: '0.85rem' }}>
              ⚠️ {stats.flagged} flagged application{stats.flagged !== 1 ? 's' : ''} need attention
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── All Applications Panel ────────────────────────────────────
function ApplicationsPanel() {
  const [apps,      setApps]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [catFilter, setCatFilter] = useState('');
  const [stsFilter, setStsFilter] = useState('');
  const [search,    setSearch]    = useState('');

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try { const { data } = await adminApi.getAllApplications(catFilter, stsFilter); setApps(data); }
    catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  }, [catFilter, stsFilter]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const displayed = apps.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.childNameEnglish?.toLowerCase().includes(q) ||
      a.applicantNameEnglish?.toLowerCase().includes(q) ||
      a.applicationNumber?.toLowerCase().includes(q) ||
      a.district?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <SectionHead icon="📋" title="All Applications">
        <button className="btn btn-ghost btn-sm" onClick={fetchApps}>🔄 Refresh</button>
      </SectionHead>
      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        <select className="form-control" style={{ width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-control" style={{ width: 'auto' }} value={stsFilter} onChange={e => setStsFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['PENDING','SUBMITTED','UNDER_REVIEW','SCORED','FLAGGED','SELECTED','REJECTED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input className="form-control" style={{ flex: 1, minWidth: '200px' }}
          placeholder="🔍 Search by name, app number, district..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? <Spinner /> : displayed.length === 0 ? (
        <Empty icon="📋" message="No applications found" />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>App No.</th><th>Child Name</th><th>Parent</th>
                  <th>District</th><th>Distance</th><th>Category</th>
                  <th>Score</th><th>Rank</th><th>Flag</th><th>Status</th>
                  <th>Assigned To</th><th>Override Flag</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(app => <AppRow key={app.id} app={app} onRefresh={fetchApps} />)}
              </tbody>
            </table>
          </div>
          <p className="text-muted text-sm mt-2">Showing {displayed.length} of {apps.length} applications</p>
        </div>
      )}
    </>
  );
}

function AppRow({ app, onRefresh }) {
  const [flagging, setFlagging] = useState(false);
  const handleFlag = async (color) => {
    setFlagging(true);
    try {
      const reason = color ? (window.prompt(`Reason for ${color} flag (optional):`) ?? '') : '';
      await adminApi.setFlag(app.id, color, reason);
      toast.success(color ? `${color} flag set` : 'Flag cleared');
      onRefresh();
    } catch { toast.error('Failed to update flag'); }
    finally { setFlagging(false); }
  };
  return (
    <tr>
      <td style={{ color: 'var(--gold-300)', fontWeight: 600, whiteSpace: 'nowrap' }}>{app.applicationNumber || `#${app.id}`}</td>
      <td><div>{app.childNameEnglish}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.childNameSinhala}</div></td>
      <td style={{ fontSize: '0.82rem' }}>{app.applicantNameEnglish}</td>
      <td style={{ fontSize: '0.82rem' }}>{app.district}</td>
      <td style={{ fontSize: '0.82rem' }}>{app.distanceFromSchoolKm} km</td>
      <td><CategoryBadge category={app.category} /></td>
      <td style={{ fontFamily: 'Cinzel', fontWeight: 700, color: app.totalScore >= 80 ? 'var(--success)' : app.totalScore >= 60 ? 'var(--gold-300)' : app.totalScore != null ? 'var(--danger)' : 'var(--text-muted)' }}>
        {app.totalScore ?? '—'}
      </td>
      <td style={{ textAlign: 'center' }}>{app.rankInCategory ? `#${app.rankInCategory}` : '—'}</td>
      <td>{app.flagColor ? <span style={{ fontWeight: 700, fontSize: '0.78rem', color: app.flagColor === 'RED' ? '#ef4444' : app.flagColor === 'YELLOW' ? '#f59e0b' : '#10b981' }}>● {app.flagColor}</span> : '—'}</td>
      <td><StatusBadge status={app.status} /></td>
      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.assignedUser || '—'}</td>
      <td>
        <div className="flex gap-1">
          {['GREEN','YELLOW','RED'].map(c => (
            <button key={c} disabled={flagging} onClick={() => handleFlag(app.flagColor === c ? null : c)} style={{
              border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px',
              fontSize: '0.65rem', fontWeight: 700,
              background: app.flagColor === c ? (c === 'RED' ? '#ef4444' : c === 'YELLOW' ? '#f59e0b' : '#10b981') : 'rgba(255,255,255,0.1)',
              color: app.flagColor === c ? 'white' : (c === 'RED' ? '#ef4444' : c === 'YELLOW' ? '#f59e0b' : '#10b981'),
            }}>{c[0]}</button>
          ))}
        </div>
      </td>
    </tr>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  MARKING SCHEMES PANEL
//  Admin has the same full editor as the DC.
//  Categories shown as accordion — click to expand.
// ════════════════════════════════════════════════════════════════════════════
function SchemesPanel() {
  const [summary,          setSummary]          = useState(null);
  const [loadingSummary,   setLoadingSummary]   = useState(true);
  const [openCategory,     setOpenCategory]     = useState(null);
  const [draftsByCategory, setDraftsByCategory] = useState({});

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try { setSummary((await adminApi.getSchemesSummary()).data); }
    catch { toast.error('Failed to load schemes summary'); }
    finally { setLoadingSummary(false); }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const toggleCategory = (cat) =>
    setOpenCategory(prev => prev === cat ? null : cat);

  const updateDraft = useCallback((cat, draft) =>
    setDraftsByCategory(prev => ({ ...prev, [cat]: draft })), []);
  const clearDraft  = useCallback((cat) =>
    setDraftsByCategory(prev => { const n = { ...prev }; delete n[cat]; return n; }), []);

  return (
    <>
      <SectionHead icon="📝" title="Marking Schemes">
        <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>
          Click a category to view or edit its scheme
        </p>
      </SectionHead>

      {loadingSummary ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {CATEGORIES.map(cat => {
            const info     = summary?.[cat] || {};
            const isOpen   = openCategory === cat;
            const hasDraft = !!draftsByCategory[cat];
            return (
              <div key={cat} style={{
                border: `1px solid ${info.hasActiveScheme ? 'rgba(16,185,129,.3)' : 'rgba(245,158,11,.3)'}`,
                borderRadius: 'var(--r-lg)', overflow: 'hidden',
              }}>
                {/* Category header row — click to expand */}
                <button onClick={() => toggleCategory(cat)} style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '1rem 1.25rem',
                  background: isOpen ? 'rgba(212,160,23,.06)' : 'transparent',
                  border: 'none', cursor: 'pointer', color: 'inherit',
                }}>
                  <div className="flex items-center gap-3">
                    <CategoryBadge category={cat} />
                    {info.hasActiveScheme ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {info.title} · {info.criteriaCount} criteria · {info.totalPossible} pts
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>No scheme yet</span>
                    )}
                    {hasDraft && <span style={{ fontSize: '0.72rem', color: 'var(--warning)' }}>✏️ unsaved draft</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '1rem' }}>{info.hasActiveScheme ? '✅' : '⚠️'}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Expanded editor */}
                {isOpen && (
                  <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)' }}>
                    <AdminCategorySchemeEditor
                      category={cat}
                      hasScheme={info.hasActiveScheme}
                      draft={draftsByCategory[cat]}
                      onDraftChange={(d) => updateDraft(cat, d)}
                      onSaved={() => { fetchSummary(); clearDraft(cat); }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function AdminCategorySchemeEditor({ category, hasScheme, draft, onDraftChange, onSaved }) {
  const [scheme,  setScheme]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [view,    setView]    = useState('view');

  const fetchScheme = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getActiveScheme(category);
      setScheme(data);
      if (!draft) setView('view');
    } catch {
      setScheme(null); setView('create');
    } finally { setLoading(false); }
  }, [category, draft]);

  useEffect(() => { fetchScheme(); }, [fetchScheme]);

  if (loading) return <Spinner message="Loading scheme…" />;

  return view === 'view' && scheme && !draft ? (
    <AdminSchemeViewer
      scheme={scheme}
      onEdit={() => setView('create')}
      onRefresh={() => { fetchScheme(); onSaved(); }}
    />
  ) : (
    <AdminSchemeBuilder
      category={category}
      existingScheme={scheme}
      draft={draft}
      onDraftChange={onDraftChange}
      onSaved={() => { fetchScheme(); onSaved(); }}
      onCancel={scheme && !draft ? () => setView('view') : undefined}
    />
  );
}

function AdminSchemeViewer({ scheme, onEdit, onRefresh }) {
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (id, title) => {
    if (!window.confirm(`Remove criterion "${title}"?`)) return;
    setRemovingId(id);
    try { await adminApi.removeCriterion(id); toast.success('Criterion removed'); onRefresh(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to remove'); }
    finally { setRemovingId(null); }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p style={{ fontWeight: 600, fontSize: '1rem' }}>{scheme.title}</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {scheme.criteriaCount} criteria · {scheme.totalPossible} total pts · <span style={{ color: 'var(--success)' }}>● Active</span>
          </p>
        </div>
        <button className="btn btn-gold btn-sm" onClick={onEdit}>✏️ Replace Scheme</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Criterion</th><th>Type</th><th>Max Score</th><th>Guide</th><th>Remove</th></tr>
          </thead>
          <tbody>
            {scheme.criteria.map((c, i) => (
              <tr key={c.id}>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{i + 1}</td>
                <td style={{ fontWeight: 600 }}>{c.title}</td>
                <td><FieldTypeBadge type={c.fieldType} /></td>
                <td style={{ fontFamily: 'Cinzel', color: 'var(--gold-300)', fontWeight: 700 }}>{c.maxScore ?? '—'}</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.description || '—'}</td>
                <td>
                  <button className="btn btn-danger btn-sm" style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    onClick={() => handleRemove(c.id, c.title)} disabled={removingId === c.id}>
                    {removingId === c.id ? '…' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
            <tr style={{ background: 'rgba(212,160,23,.06)' }}>
              <td colSpan={3} style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total:</td>
              <td style={{ fontFamily: 'Cinzel', fontWeight: 700, color: 'var(--gold-200)' }}>{scheme.totalPossible}</td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <p className="form-label mb-2">➕ Add Criterion to This Scheme</p>
        <AdminAddCriterionRow schemeId={scheme.id} onAdded={onRefresh} />
      </div>
    </div>
  );
}

function AdminAddCriterionRow({ schemeId, onAdded }) {
  const blank = { title: '', fieldType: 'NUMBER_ONLY', maxScore: '', description: '' };
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState({});
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrs(e => ({ ...e, [k]: '' })); };

  const handleAdd = async () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Required';
    if (form.fieldType !== 'COMMENT_ONLY') {
      const n = parseFloat(form.maxScore);
      if (isNaN(n) || n <= 0) e.maxScore = 'Required (> 0)';
    }
    if (Object.keys(e).length) { setErrs(e); return; }
    setBusy(true);
    try {
      await adminApi.addCriterion(schemeId, {
        title: form.title.trim(), fieldType: form.fieldType,
        maxScore: form.fieldType !== 'COMMENT_ONLY' ? parseFloat(form.maxScore) : undefined,
        description: form.description.trim() || undefined,
      });
      toast.success('Criterion added'); setForm(blank); onAdded();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to add'); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr auto', gap: '0.5rem', alignItems: 'flex-start' }}>
      <div>
        <input className="form-control" placeholder="Criterion title *" value={form.title} onChange={e => set('title', e.target.value)} />
        {errs.title && <p className="form-error">{errs.title}</p>}
      </div>
      <select className="form-control" value={form.fieldType} onChange={e => set('fieldType', e.target.value)}>
        {FIELD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
      </select>
      <div>
        <input className="form-control" type="number" placeholder={form.fieldType !== 'COMMENT_ONLY' ? 'Max score *' : 'N/A'}
          disabled={form.fieldType === 'COMMENT_ONLY'} value={form.maxScore} onChange={e => set('maxScore', e.target.value)} />
        {errs.maxScore && <p className="form-error">{errs.maxScore}</p>}
      </div>
      <input className="form-control" placeholder="Hint (optional)" value={form.description} onChange={e => set('description', e.target.value)} />
      <button className="btn btn-gold btn-sm" onClick={handleAdd} disabled={busy} style={{ whiteSpace: 'nowrap' }}>
        {busy ? '…' : '➕ Add'}
      </button>
    </div>
  );
}

function newBlankCriterion(order = 0) {
  return { _id: Date.now() + order, title: '', fieldType: 'NUMBER_ONLY', maxScore: '', description: '' };
}

function AdminSchemeBuilder({ category, existingScheme, draft, onDraftChange, onSaved, onCancel }) {
  const [title,    setTitle]    = useState(draft?.title    ?? '');
  const [criteria, setCriteria] = useState(draft?.criteria ?? [newBlankCriterion()]);
  const [saving,   setSaving]   = useState(false);
  const [errs,     setErrs]     = useState({});

  useEffect(() => { onDraftChange({ title, criteria }); }, [title, criteria]);

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
        title: c.title.trim(), fieldType: c.fieldType,
        maxScore: c.fieldType !== 'COMMENT_ONLY' ? parseFloat(c.maxScore) : undefined,
        description: c.description.trim() || undefined,
      }));
      await adminApi.createScheme(category, title.trim(), payload);
      toast.success(`✅ Scheme saved for ${category}`);
      onSaved();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save scheme'); }
    finally { setSaving(false); }
  };

  const previewTotal = criteria.filter(c => c.fieldType !== 'COMMENT_ONLY')
    .reduce((sum, c) => sum + (parseFloat(c.maxScore) || 0), 0);

  return (
    <div>
      {existingScheme && (
        <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 'var(--r-sm)', marginBottom: '1rem', fontSize: '0.83rem', color: 'var(--warning)' }}>
          ⚠️ This will replace the current active scheme. The old one is kept in history.
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Scheme Title <span className="required-star">*</span></label>
        <input className="form-control" placeholder={`e.g. ${category} Marking Scheme 2025`}
          value={title} onChange={e => { setTitle(e.target.value); setErrs(v => ({ ...v, title: '' })); }} />
        {errs.title && <p className="form-error">{errs.title}</p>}
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <div className="flex justify-between items-center mb-2">
          <p className="form-label" style={{ margin: 0 }}>
            Criteria {previewTotal > 0 && <span style={{ marginLeft: 8, color: 'var(--gold-300)', fontWeight: 700 }}>({previewTotal} pts)</span>}
          </p>
          <button className="btn btn-ghost btn-sm" onClick={addRow}>➕ Add Row</button>
        </div>
        {errs.criteria && <p className="form-error mb-2">{errs.criteria}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.6fr 1fr 2fr 32px', gap: '0.4rem', marginBottom: '0.35rem' }}>
          {['Criterion Title *','Input Type *','Max Score *','Hint (optional)',''].map((h, i) => (
            <p key={i} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>{h}</p>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {criteria.map((c, idx) => (
            <div key={c._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.6fr 1fr 2fr 32px', gap: '0.4rem', alignItems: 'flex-start' }}>
              <div>
                <input className="form-control" placeholder="e.g. Distance from school"
                  value={c.title} onChange={e => updateRow(idx, 'title', e.target.value)} />
                {errs[`c_${idx}_title`] && <p className="form-error">{errs[`c_${idx}_title`]}</p>}
              </div>
              <select className="form-control" value={c.fieldType} onChange={e => updateRow(idx, 'fieldType', e.target.value)}>
                {FIELD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
              </select>
              <div>
                <input className="form-control" type="number" min="0"
                  placeholder={c.fieldType !== 'COMMENT_ONLY' ? 'e.g. 30' : '—'}
                  disabled={c.fieldType === 'COMMENT_ONLY'} value={c.maxScore}
                  onChange={e => updateRow(idx, 'maxScore', e.target.value)} />
                {errs[`c_${idx}_maxScore`] && <p className="form-error">{errs[`c_${idx}_maxScore`]}</p>}
              </div>
              <input className="form-control" placeholder="e.g. 0 = far, 30 = near"
                value={c.description} onChange={e => updateRow(idx, 'description', e.target.value)} />
              <button type="button" onClick={() => removeRow(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1rem', padding: '6px' }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
          {saving ? '⏳ Saving…' : `💾 Save ${category} Scheme`}
        </button>
        {onCancel && <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>}
      </div>
    </div>
  );
}

// ── User Progress Panel ───────────────────────────────────────
function UserProgressPanel() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getUserProgress()
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load user progress'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  return (
    <>
      <SectionHead icon="👤" title="User Progress" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {users.length === 0 ? <Empty icon="👤" message="No users found" /> :
          users.map(u => (
            <div key={u.id} className="card">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>{u.name}</span>
                  <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>·</span>
                  <CategoryBadge category={u.category} />
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{u.username}</span>
                </div>
                <span style={{ fontFamily: 'Cinzel', fontWeight: 700, color: u.completionPct === 100 ? 'var(--success)' : 'var(--gold-300)', fontSize: '1.1rem' }}>
                  {u.completionPct}%
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--navy-700)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                <div style={{ height: '100%', width: `${u.completionPct}%`, background: u.completionPct === 100 ? 'var(--success)' : 'linear-gradient(90deg, var(--gold-500), var(--gold-300))', borderRadius: '4px', transition: 'width 0.4s' }} />
              </div>
              <div className="flex gap-3" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>Total: <strong style={{ color: 'var(--text-primary)' }}>{u.total}</strong></span>
                <span>Scored: <strong style={{ color: 'var(--success)' }}>{u.scored}</strong></span>
                <span>Pending: <strong style={{ color: 'var(--warning)' }}>{u.pending}</strong></span>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

// ── Publish Results Panel ─────────────────────────────────────
function PublishResultsPanel() {
  const [selections, setSelections] = useState(Object.fromEntries(CATEGORIES.map(c => [c, ''])));
  const [ranked,     setRanked]     = useState({});
  const [publishing, setPublishing] = useState(false);
  const [published,  setPublished]  = useState(null);
  const [activeTab,  setActiveTab]  = useState(CATEGORIES[0]);

  useEffect(() => {
    Promise.all(CATEGORIES.map(cat =>
      adminApi.getRankedByCategory(cat)
        .then(r => [cat, r.data])
        .catch(() => [cat, { applications: [], total: 0, scored: 0 }])
    )).then(entries => setRanked(Object.fromEntries(entries)));
  }, []);

  const handlePublish = async () => {
    const parsed = {};
    for (const [cat, val] of Object.entries(selections)) {
      const n = parseInt(val);
      if (isNaN(n) || n < 0) { toast.error(`Enter a valid number for ${cat}`); return; }
      parsed[cat] = n;
    }
    if (!window.confirm('Publish results? This cannot be undone.')) return;
    setPublishing(true);
    try { const { data } = await adminApi.publishResults(parsed); setPublished(data); toast.success('✅ Results published!'); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to publish'); }
    finally { setPublishing(false); }
  };

  const currentRanked = ranked[activeTab];

  if (published) return (
    <div className="card" style={{ border: '1.5px solid var(--success)' }}>
      <div className="card-header"><h3 className="card-title" style={{ color: 'var(--success)' }}>✅ Results Published</h3></div>
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
        <StatCard icon="✅" value={published.totalSelected} label="Total Selected" color="var(--success)" />
        <StatCard icon="❌" value={published.totalRejected} label="Total Rejected" color="var(--danger)" />
      </div>
      <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
        {Object.entries(published.byCategory || {}).map(([cat, count]) => (
          <div key={cat} style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 'var(--r-sm)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <CategoryBadge category={cat} />
            <span style={{ marginLeft: '0.4rem', color: 'var(--success)', fontWeight: 700 }}>{count} selected</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <SectionHead icon="🏆" title="Publish Results" />
      <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 'var(--r-md)', padding: '1rem', marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--warning)', fontWeight: 600, marginBottom: '0.3rem' }}>⚠️ Important: Read before publishing</p>
        <p className="text-sm text-muted">Publishing marks the top N per category as <strong style={{ color: 'var(--success)' }}> SELECTED</strong> and the rest as <strong style={{ color: 'var(--danger)' }}> REJECTED</strong>. Only scored, non-flagged applications are considered. This cannot be undone.</p>
      </div>
      <div className="card mb-3">
        <div className="card-header"><h3 className="card-title">Set Selection Count per Category</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
          {CATEGORIES.map(cat => (
            <div key={cat} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <CategoryBadge category={cat} />
                <span style={{ marginLeft: '0.4rem', color: 'var(--text-muted)' }}>({ranked[cat]?.scored ?? '...'} scored)</span>
              </label>
              <input className="form-control" type="number" min="0" placeholder="e.g. 10"
                value={selections[cat]} onChange={e => setSelections(s => ({ ...s, [cat]: e.target.value }))} />
            </div>
          ))}
        </div>
      </div>
      <div className="card mb-3">
        <div className="card-header"><h3 className="card-title">Preview Ranked List</h3></div>
        <div className="flex gap-1 mb-2" style={{ flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} className={`btn btn-sm ${activeTab === cat ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setActiveTab(cat)}>
              {cat} {ranked[cat] && <span style={{ opacity: 0.7 }}>({ranked[cat].scored})</span>}
            </button>
          ))}
        </div>
        {!currentRanked ? <Spinner /> : currentRanked.applications.length === 0 ? (
          <Empty icon="📋" message={`No scored applications in ${activeTab}`} />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Rank</th><th>App No.</th><th>Child Name</th><th>District</th><th>Distance</th><th>Score</th><th>Flag</th><th>Result</th></tr></thead>
              <tbody>
                {currentRanked.applications.map((app, idx) => {
                  const selectCount = parseInt(selections[activeTab]) || 0;
                  const willSelect  = idx < selectCount && !app.flagColor && app.totalScore != null;
                  return (
                    <tr key={app.id} style={{ background: willSelect ? 'rgba(16,185,129,.05)' : app.flagColor ? 'rgba(239,68,68,.05)' : 'transparent' }}>
                      <td style={{ fontWeight: 700, color: 'var(--gold-300)' }}>#{idx + 1}</td>
                      <td style={{ color: 'var(--gold-300)' }}>{app.applicationNumber}</td>
                      <td>{app.childNameEnglish}</td>
                      <td style={{ fontSize: '0.82rem' }}>{app.district}</td>
                      <td style={{ fontSize: '0.82rem' }}>{app.distanceFromSchoolKm} km</td>
                      <td style={{ fontFamily: 'Cinzel', fontWeight: 700 }}>{app.totalScore ?? '—'}</td>
                      <td>{app.flagColor ? <span style={{ fontSize: '0.75rem', fontWeight: 700, color: app.flagColor === 'RED' ? '#ef4444' : app.flagColor === 'YELLOW' ? '#f59e0b' : '#10b981' }}>● {app.flagColor}</span> : '—'}</td>
                      <td>
                        {app.flagColor ? <span className="badge s-flagged">🚩 Flagged</span>
                          : willSelect ? <span className="badge s-selected">✅ Will Select</span>
                          : <span className="badge s-rejected">❌ Will Reject</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <button className="btn btn-gold btn-lg btn-full" onClick={handlePublish} disabled={publishing}>
        {publishing ? '⏳ Publishing...' : '🏆 Publish Final Results'}
      </button>
    </>
  );
}

// ── Field type badge ──────────────────────────────────────────
function FieldTypeBadge({ type }) {
  const config = {
    NUMBER_ONLY:        { label: '🔢 Number',  color: '#1a7a8a' },
    COMMENT_ONLY:       { label: '💬 Comment', color: '#7b3fa0' },
    NUMBER_AND_COMMENT: { label: '🔢💬 Both',  color: '#b8860b' },
  };
  const { label, color } = config[type] || { label: type, color: '#666' };
  return (
    <span style={{ background: color + '20', color, border: `1px solid ${color}44`, borderRadius: 'var(--r-sm)', padding: '2px 8px', fontSize: '0.76rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

// ── Report Panel (shared component, used by both Admin and Judge dashboards) ──
export function ReportPanel({ role = 'ADMIN' }) {
  const isAdmin = role === 'ADMIN';
  const [availableFields, setAvailableFields] = useState([]);
  const [selectedKeys,    setSelectedKeys]    = useState([]);
  const [dropdownOpen,    setDropdownOpen]    = useState(false);
  const [categoryFilter,  setCategoryFilter]  = useState('');
  const [statusFilter,    setStatusFilter]    = useState('');
  const [reportData,      setReportData]      = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [sortKey,         setSortKey]         = useState('applicationNumber');
  const [sortDir,         setSortDir]         = useState('asc');
  const dropRef = useRef(null);

  useEffect(() => {
    reportApi.getFields()
      .then(r => setAvailableFields(r.data.fields || []))
      .catch(() => setError('Failed to load field list.'));
  }, []);

  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleKey   = key => setSelectedKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  const selectAll   = () => setSelectedKeys(availableFields.map(f => f.key));
  const clearAll    = () => setSelectedKeys([]);

  const generate = async () => {
    setLoading(true); setError(''); setReportData(null);
    try {
      const body = { fields: selectedKeys };
      if (isAdmin) {
        if (categoryFilter) body.category = categoryFilter;
        if (statusFilter)   body.status   = statusFilter;
      }
      const { data } = isAdmin
        ? await reportApi.generateAdmin(body)
        : await reportApi.generateUser(body);
      setReportData(data);
      setSortKey('applicationNumber'); setSortDir('asc');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to generate report.');
    } finally { setLoading(false); }
  };

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sortedRows = reportData ? [...reportData.rows].sort((a, b) => {
    const av = a[sortKey] ?? ''; const bv = b[sortKey] ?? '';
    const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  }) : [];

  return (
    <>
      <style>{`
        @media print {
          .app-root > *:not(#rpt-print-area) { display: none !important; }
          #rpt-print-area { display: block !important; position: fixed; inset: 0; background: white; color: black; padding: 20px; font-family: Arial, sans-serif; z-index: 9999; }
          #rpt-print-area table { width: 100%; border-collapse: collapse; font-size: 11px; }
          #rpt-print-area th, #rpt-print-area td { border: 1px solid #999; padding: 4px 6px; text-align: left; }
          #rpt-print-area th { background: #e8e8e8; font-weight: bold; }
          #rpt-print-area tr:nth-child(even) td { background: #f5f5f5; }
        }
      `}</style>

      <SectionHead icon="📈" title="Report Builder" />

      {/* Config card */}
      <div className="card mb-3">
        <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>Configure Report</h3>
        <div className="flex gap-3" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>

          {/* Admin filters */}
          {isAdmin && (
            <>
              <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
                <label className="form-label">Category</label>
                <select className="form-control" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
                <label className="form-label">Status</label>
                <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  {['PENDING','SUBMITTED','UNDER_REVIEW','SCORED','FLAGGED','SELECTED','REJECTED'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Column picker */}
          <div className="form-group" style={{ marginBottom: 0, position: 'relative', minWidth: 220 }} ref={dropRef}>
            <label className="form-label">
              Columns &nbsp;
              <span style={{ background: 'var(--gold-500)', color: '#000', borderRadius: 10, padding: '0px 7px', fontSize: '0.72rem', fontWeight: 700 }}>
                {selectedKeys.length + 1} selected
              </span>
            </label>
            <button className="form-control" style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
              onClick={() => setDropdownOpen(o => !o)}>
              <span>Select columns…</span>
              <span>{dropdownOpen ? '▲' : '▼'}</span>
            </button>

            {dropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200, background: 'var(--navy-800)', border: '1px solid var(--border-gold)', borderRadius: 'var(--r-md)', marginTop: 4, width: 280, boxShadow: '0 8px 32px rgba(0,0,0,.6)' }}>
                {/* Fixed row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Application Number</span>
                  <span style={{ marginLeft: 'auto', background: 'rgba(212,160,23,.15)', color: 'var(--gold-300)', borderRadius: 10, padding: '1px 8px', fontSize: '0.7rem' }}>Default</span>
                </div>
                {/* Select/clear all */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 14px', borderBottom: '1px solid var(--border)' }}>
                  <button onClick={selectAll} style={{ background: 'none', border: 'none', color: 'var(--gold-400)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Select all</button>
                  <button onClick={clearAll}  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>Clear all</button>
                </div>
                {/* Scrollable field list */}
                <div style={{ maxHeight: 300, overflowY: 'auto', padding: '4px 0' }}>
                  {availableFields.map(f => (
                    <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      <input type="checkbox" checked={selectedKeys.includes(f.key)} onChange={() => toggleKey(f.key)}
                        style={{ accentColor: 'var(--gold-400)', width: 14, height: 14 }} />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Generate button */}
          <button className={`btn ${loading ? 'btn-ghost' : 'btn-gold'}`} onClick={generate} disabled={loading}
            style={{ alignSelf: 'flex-end', whiteSpace: 'nowrap' }}>
            {loading ? '⏳ Generating…' : '⚡ Generate Report'}
          </button>

          {/* Print button */}
          {reportData && (
            <button className="btn btn-ghost" onClick={() => window.print()}
              style={{ alignSelf: 'flex-end', whiteSpace: 'nowrap' }}>
              🖨️ Print
            </button>
          )}
        </div>

        {error && (
          <div style={{ marginTop: 14, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.35)', borderRadius: 'var(--r-sm)', padding: '10px 14px', color: 'var(--danger)', fontSize: '0.88rem' }}>
            ❌ {error}
          </div>
        )}
      </div>

      {/* Results */}
      {reportData && (
        <>
          {/* Screen view */}
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="card-title" style={{ marginBottom: 4 }}>Results</h3>
                <p className="text-muted text-sm">
                  Scope: <strong style={{ color: 'var(--gold-300)' }}>{reportData.scope}</strong>
                  &ensp;·&ensp; {reportData.totalRows} record{reportData.totalRows !== 1 ? 's' : ''}
                  &ensp;·&ensp; Generated: {new Date(reportData.generatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {sortedRows.length === 0 ? (
              <Empty icon="📋" message="No records found for the selected filters." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {reportData.columns.map(col => (
                        <th key={col.key} onClick={() => handleSort(col.key)}
                          style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((row, i) => (
                      <tr key={row.applicationNumber || i}>
                        {reportData.columns.map(col => (
                          <td key={col.key} style={{ whiteSpace: 'nowrap' }}>
                            <ReportCell colKey={col.key} value={row[col.key]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-muted text-sm mt-2">{sortedRows.length} row{sortedRows.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Hidden print area */}
          <div id="rpt-print-area" style={{ display: 'none' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
              Grade 1 Admission — Custom Report ({reportData.scope})
            </div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>
              Generated: {new Date(reportData.generatedAt).toLocaleString()} &nbsp;|&nbsp; {reportData.totalRows} records
            </div>
            <table>
              <thead>
                <tr>{reportData.columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
              </thead>
              <tbody>
                {sortedRows.map((row, i) => (
                  <tr key={i}>
                    {reportData.columns.map(col => (
                      <td key={col.key}>{row[col.key] ?? '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

function ReportCell({ colKey, value }) {
  if (value === null || value === undefined || value === '') return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  if (colKey === 'flagColor') {
    const colors = { GREEN: 'var(--success)', YELLOW: 'var(--warning)', RED: 'var(--danger)' };
    return <span style={{ color: colors[value] || 'var(--text-muted)', fontWeight: 700, fontSize: '0.78rem' }}>● {value}</span>;
  }
  if (colKey === 'status') return <StatusBadge status={value} />;
  if (colKey === 'category') return <CategoryBadge category={value} />;
  if (colKey === 'distanceFromSchoolKm' && typeof value === 'number') return `${value.toFixed(3)} km`;
  if (colKey === 'totalScore' && typeof value === 'number') return <span style={{ fontFamily: 'Cinzel', fontWeight: 700, color: 'var(--gold-300)' }}>{value.toFixed(1)}</span>;
  if (colKey === 'applicationNumber') return <span style={{ color: 'var(--gold-300)', fontWeight: 600 }}>{value}</span>;
  if ((colKey === 'submittedAt' || colKey === 'dateOfBirth') && value) return String(value).replace('T', ' ').substring(0, 16);
  return String(value);
}