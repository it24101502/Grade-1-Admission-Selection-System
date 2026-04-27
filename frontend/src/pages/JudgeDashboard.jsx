// FILE: frontend/src/pages/JudgeDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Header, Sidebar, StatusBadge, CategoryBadge, StatCard, Spinner, Empty, SectionHead }
  from '../components/shared/UI';
import { userApi } from '../services/api';
import { ReportPanel } from './AdminDashboard';

const NAV = [{
  label: 'User Panel',
  items: [
    { id: 'overview',     icon: '📊', label: 'Overview'     },
    { id: 'applications', icon: '📋', label: 'Applications' },
    { id: 'ranked',       icon: '🏆', label: 'Ranked List'  },
    { id: 'report',       icon: '📈', label: 'Report'       },
  ],
}];

export default function JudgeDashboard() {
  const [panel,      setPanel]      = useState('overview');
  const [stats,      setStats]      = useState(null);
  const [statsError, setStatsError] = useState(false);
  // Fetch scheme once and pass down — avoids re-fetching per application
  const [scheme,     setScheme]     = useState(null);

  useEffect(() => {
    userApi.getStats()
      .then(r => setStats(r.data))
      .catch(() => { setStatsError(true); toast.error('Failed to load stats'); });
    userApi.getScheme()
      .then(r => setScheme(r.data))
      .catch(() => {}); // silently — shown as "no scheme" inside modal
  }, []);

  return (
    <div className="app-root">
      <Header />
      <div className="dashboard-layout">
        <Sidebar sections={NAV} activeId={panel} onSelect={setPanel} />
        <div className="main-area">
          <div className="page-wrap">
            {panel === 'overview'     && <OverviewPanel stats={stats} error={statsError} scheme={scheme} />}
            {panel === 'applications' && <ApplicationsPanel scheme={scheme} />}
            {panel === 'ranked'       && <RankedPanel />}
            {panel === 'report'       && <ReportPanel role="USER" />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Overview Panel ────────────────────────────────────────────
function OverviewPanel({ stats, error, scheme }) {
  if (error) return <Empty icon="⚠️" message="Could not load overview" sub="Check your connection and refresh the page." />;
  if (!stats) return <Spinner message="Loading overview..." />;

  const category      = stats.category      ?? '—';
  const userName      = stats.userName      ?? stats.username ?? '—';
  const total         = stats.total         ?? 0;
  const scored        = stats.scored        ?? 0;
  const pending       = stats.pending       ?? 0;
  const flagged       = stats.flagged       ?? 0;
  const completionPct = stats.completionPct ?? (total > 0 ? Math.round((scored / total) * 100) : 0);

  return (
    <>
      <SectionHead icon="📊" title={`Overview — Category ${category}`} />

      <div style={{ background: 'linear-gradient(135deg, var(--navy-700), var(--navy-800))', border: '1px solid var(--border-gold)', borderRadius: 'var(--r-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <p className="text-muted text-sm">Assigned User</p>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--gold-200)', marginTop: '0.25rem' }}>{userName}</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Category: <CategoryBadge category={category} /></p>
      </div>

      <div className="stats-row">
        <StatCard icon="📋" value={total}   label="Total Assigned" />
        <StatCard icon="✏️" value={scored}  label="Scored"         color="var(--success)" />
        <StatCard icon="⏳" value={pending} label="Pending"        color="var(--warning)" />
        <StatCard icon="🚩" value={flagged} label="Flagged"        color="var(--danger)"  />
      </div>

      <div className="card mt-2">
        <div className="flex justify-between items-center mb-2">
          <p style={{ fontWeight: 600 }}>Scoring Progress</p>
          <p style={{ color: 'var(--gold-300)', fontWeight: 700, fontSize: '1.1rem' }}>{completionPct}%</p>
        </div>
        <div style={{ height: '12px', background: 'var(--navy-700)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${completionPct}%`, background: 'linear-gradient(90deg, var(--gold-500), var(--gold-300))', borderRadius: '6px', transition: 'width 0.5s ease' }} />
        </div>
        <p className="text-muted text-sm mt-1">{scored} of {total} applications scored</p>
      </div>

      {/* Scheme preview on overview */}
      {scheme && (
        <div className="card mt-2">
          <div className="card-header">
            <h3 className="card-title">📝 Marking Scheme — {scheme.category}</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{scheme.title}</span>
          </div>
          <SchemeReadOnlyView scheme={scheme} />
        </div>
      )}
    </>
  );
}

// ── Scheme read-only view (shared between overview + modal) ───
function SchemeReadOnlyView({ scheme }) {
  if (!scheme) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No marking scheme assigned yet.</p>;
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{scheme.criteriaCount} criteria</span>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>·</span>
        <span style={{ fontSize: '0.82rem', color: 'var(--gold-300)', fontWeight: 700 }}>{scheme.totalPossible} total pts</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {scheme.criteria.map((c, i) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(7,20,50,.3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', minWidth: 20 }}>{i + 1}.</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>{c.title}</p>
              {c.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '2px 0 0' }}>{c.description}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <FieldTypeBadge type={c.fieldType} />
              {c.maxScore != null && (
                <span style={{ fontSize: '0.78rem', color: 'var(--gold-300)', fontWeight: 700 }}>max {c.maxScore}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Applications Panel ────────────────────────────────────────
function ApplicationsPanel({ scheme }) {
  const [apps,     setApps]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState('ALL');

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try { const { data } = await userApi.getApplications(); setApps(Array.isArray(data) ? data : []); }
    catch { toast.error('Failed to load applications'); setApps([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const filtered = apps.filter(a => {
    if (filter === 'PENDING') return !a.totalScore && !a.flagColor;
    if (filter === 'SCORED')  return !!a.totalScore && !a.flagColor;
    if (filter === 'FLAGGED') return !!a.flagColor;
    return true;
  });

  return (
    <>
      <SectionHead icon="📋" title="Applications">
        <button className="btn btn-ghost btn-sm" onClick={fetchApps}>🔄 Refresh</button>
      </SectionHead>

      <div className="flex gap-2 mb-3">
        {['ALL','PENDING','SCORED','FLAGGED'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <Empty icon="📋" message="No applications found" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(app => (
            <ApplicationRow key={app.id} app={app} scheme={scheme} onSelect={() => setSelected(app.id)} onRefresh={fetchApps} />
          ))}
        </div>
      )}

      {selected && (
        <ApplicationDetailModal
          appId={selected}
          scheme={scheme}
          onClose={() => { setSelected(null); fetchApps(); }}
        />
      )}
    </>
  );
}

// ── Application Row Card ──────────────────────────────────────
function ApplicationRow({ app, onSelect, onRefresh, scheme }) {
  const [marking,      setMarking]      = useState(false);
  const [criteriaScores, setCriteriaScores] = useState({});
  const [comment,      setComment]      = useState(app.userComment ?? '');
  const [saving,       setSaving]       = useState(false);

  // Auto-sum all criterion scores → total
  const computedTotal = scheme
    ? scheme.criteria
        .filter(c => c.fieldType !== 'COMMENT_ONLY')
        .reduce((sum, c) => sum + (parseFloat(criteriaScores[c.id]) || 0), 0)
    : 0;

  const handleCriterionChange = (id, val) => {
    setCriteriaScores(prev => ({ ...prev, [id]: val }));
  };

  const handleSaveScore = async (e) => {
    e.stopPropagation();
    if (!scheme) { toast.error('No marking scheme loaded'); return; }
    // Validate each criterion doesn't exceed its max
    for (const c of scheme.criteria.filter(cr => cr.fieldType !== 'COMMENT_ONLY')) {
      const val = parseFloat(criteriaScores[c.id]);
      if (isNaN(val) || val < 0) { toast.error(`Enter a valid score for "${c.title}"`); return; }
      if (val > c.maxScore) { toast.error(`"${c.title}" cannot exceed ${c.maxScore}`); return; }
    }
    setSaving(true);
    try {
      await userApi.saveScores(app.id, computedTotal, comment);
      toast.success(`Score saved: ${computedTotal} / ${scheme.totalPossible}`);
      setMarking(false); onRefresh();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save score'); }
    finally { setSaving(false); }
  };

  const handleFlag = async (e, color) => {
    e.stopPropagation();
    if (app.flagColor === color) {
      try { await userApi.toggleFlag(app.id, null, null); toast.success('Flag cleared'); onRefresh(); }
      catch { toast.error('Failed to clear flag'); }
      return;
    }
    const reason = window.prompt(`Reason for ${color} flag (optional):`);
    if (reason === null) return;
    try { await userApi.toggleFlag(app.id, color, reason || ''); toast.success(`${color} flag set`); onRefresh(); }
    catch { toast.error('Failed to set flag'); }
  };

  const flagBorderColor = app.flagColor === 'RED'    ? 'rgba(239,68,68,.5)'
                        : app.flagColor === 'YELLOW'  ? 'rgba(245,158,11,.5)'
                        : app.flagColor === 'GREEN'   ? 'rgba(16,185,129,.4)'
                        : app.totalScore != null       ? 'rgba(16,185,129,.3)'
                        : 'var(--border)';

  return (
    <div className="card" style={{ border: `1px solid ${flagBorderColor}`, cursor: 'pointer' }}>
      <div className="flex justify-between items-center" onClick={onSelect}>
        <div>
          <span style={{ color: 'var(--gold-300)', fontWeight: 700, fontSize: '0.95rem' }}>{app.applicationNumber}</span>
          <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontWeight: 600 }}>{app.childNameEnglish}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: '0.5rem' }}>{app.childNameSinhala}</span>
        </div>
        <div className="flex gap-2 items-center">
          <StatusBadge status={app.status} />
          {app.flagColor && (
            <span style={{ background: app.flagColor === 'RED' ? 'rgba(239,68,68,.15)' : app.flagColor === 'YELLOW' ? 'rgba(245,158,11,.15)' : 'rgba(16,185,129,.15)', color: app.flagColor === 'RED' ? '#ef4444' : app.flagColor === 'YELLOW' ? '#f59e0b' : '#10b981', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
              ● {app.flagColor}
            </span>
          )}
          {app.totalScore != null && (
            <span style={{ background: 'rgba(212,160,23,.15)', border: '1px solid rgba(212,160,23,.4)', borderRadius: '20px', padding: '0.2rem 0.7rem', color: 'var(--gold-200)', fontFamily: 'Cinzel', fontWeight: 700, fontSize: '0.9rem' }}>
              {app.totalScore}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-1" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <span>📅 {app.dateOfBirth}</span>
        <span>📍 {app.district}</span>
        <span>🏫 {app.distanceFromSchoolKm} km</span>
        {app.flagReason && <span style={{ color: 'var(--warning)' }}>🚩 {app.flagReason}</span>}
      </div>

      <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
        <button className="btn btn-navy btn-sm" onClick={() => setMarking(!marking)}>
          ✏️ {app.totalScore != null ? 'Edit Score' : 'Enter Score'}
        </button>
        {['GREEN','YELLOW','RED'].map(color => (
          <button key={color} className="btn btn-sm" style={{ background: app.flagColor === color ? (color === 'RED' ? 'rgba(239,68,68,.25)' : color === 'YELLOW' ? 'rgba(245,158,11,.25)' : 'rgba(16,185,129,.25)') : 'transparent', border: `1px solid ${color === 'RED' ? 'rgba(239,68,68,.4)' : color === 'YELLOW' ? 'rgba(245,158,11,.4)' : 'rgba(16,185,129,.4)'}`, color: color === 'RED' ? '#ef4444' : color === 'YELLOW' ? '#f59e0b' : '#10b981', fontSize: '0.75rem' }} onClick={e => handleFlag(e, color)}>
            ● {color}
          </button>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={onSelect}>👁 Details + Scheme</button>
      </div>

      {marking && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(2,10,30,.6)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-gold)' }} onClick={e => e.stopPropagation()}>
          {scheme ? (
            <>
              <p style={{ color: 'var(--gold-200)', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                ✏️ Enter Marks — {scheme.title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                {scheme.criteria.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(7,20,50,.4)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{c.title}</p>
                      {c.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '2px 0 0' }}>{c.description}</p>}
                    </div>
                    {c.fieldType !== 'COMMENT_ONLY' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <input
                          type="number" min="0" max={c.maxScore} step="0.5"
                          placeholder="0"
                          value={criteriaScores[c.id] ?? ''}
                          onChange={e => handleCriterionChange(c.id, e.target.value)}
                          style={{ width: 70, padding: '4px 8px', background: 'var(--navy-800)', border: '1px solid var(--border-gold)', borderRadius: 'var(--r-sm)', color: 'var(--text-primary)', fontSize: '0.9rem', textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>/ {c.maxScore}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Total + comment */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', padding: '0.6rem 1rem', background: 'rgba(212,160,23,.08)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(212,160,23,.3)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Score:</span>
                <span style={{ fontFamily: 'Cinzel', fontWeight: 700, fontSize: '1.15rem', color: 'var(--gold-300)' }}>
                  {computedTotal.toFixed(1)} / {scheme.totalPossible}
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Overall Comment / Observations</label>
                <input className="form-control" placeholder="Optional comment"
                  value={comment} onChange={e => setComment(e.target.value)} />
              </div>

              <div className="flex gap-2">
                <button className="btn btn-success btn-sm" onClick={handleSaveScore} disabled={saving}>
                  {saving ? '⏳ Saving...' : '✅ Save Score'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setMarking(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No marking scheme loaded — try refreshing the page.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Application Detail Modal (with scheme + score entry) ──────
function ApplicationDetailModal({ appId, scheme, onClose }) {
  const [app,            setApp]            = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [tab,            setTab]            = useState('details');
  const [criteriaScores, setCriteriaScores] = useState({});
  const [comment,        setComment]        = useState('');
  const [saving,         setSaving]         = useState(false);

  useEffect(() => {
    userApi.getApplicationDetail(appId)
      .then(r => {
        setApp(r.data);
        setComment(r.data.userComment ?? '');
        // If already scored, pre-fill equal distribution as a hint
        // (we don't store per-criterion scores on backend, so leave blank for re-entry)
      })
      .catch(() => toast.error('Failed to load details'))
      .finally(() => setLoading(false));
  }, [appId]);

  const computedTotal = scheme
    ? scheme.criteria
        .filter(c => c.fieldType !== 'COMMENT_ONLY')
        .reduce((sum, c) => sum + (parseFloat(criteriaScores[c.id]) || 0), 0)
    : 0;

  const handleCriterionChange = (id, val) => {
    setCriteriaScores(prev => ({ ...prev, [id]: val }));
  };

  const handleSave = async () => {
    if (!scheme) { toast.error('No marking scheme loaded'); return; }
    for (const c of scheme.criteria.filter(cr => cr.fieldType !== 'COMMENT_ONLY')) {
      const val = parseFloat(criteriaScores[c.id]);
      if (isNaN(val) || val < 0) { toast.error(`Enter a valid score for "${c.title}"`); return; }
      if (val > c.maxScore) { toast.error(`"${c.title}" cannot exceed ${c.maxScore}`); return; }
    }
    setSaving(true);
    try {
      await userApi.saveScores(appId, computedTotal, comment);
      toast.success(`Score saved: ${computedTotal} / ${scheme.totalPossible}`);
      onClose();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="modal-backdrop"><div className="modal-box"><Spinner /></div></div>;
  if (!app)    return null;

  const Section = ({ title, fields }) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <p style={{ color: 'var(--gold-300)', fontFamily: 'Cinzel', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>{title}</p>
      <div className="form-grid">
        {fields.filter(([, v]) => v).map(([label, val]) => (
          <div key={label}><p className="form-label">{label}</p><p style={{ fontSize: '0.88rem' }}>{val}</p></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: '820px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Application {app.applicationNumber}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="flex gap-2 mb-3 items-center">
          <StatusBadge status={app.status} />
          <CategoryBadge category={app.category} />
          {app.totalScore != null && <span style={{ color: 'var(--gold-300)', fontWeight: 700 }}>Score: {app.totalScore}</span>}
          {app.flagColor && (
            <span style={{ color: app.flagColor === 'RED' ? '#ef4444' : app.flagColor === 'YELLOW' ? '#f59e0b' : '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
              ● {app.flagColor}{app.flagReason ? ` — ${app.flagReason}` : ''}
            </span>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-3">
          <button className={`btn btn-sm ${tab === 'details' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setTab('details')}>📄 Application Details</button>
          <button className={`btn btn-sm ${tab === 'scheme'  ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setTab('scheme')}>
            📝 Marking Scheme {app.totalScore != null && <span style={{ marginLeft: 4, color: 'var(--success)' }}>✓</span>}
          </button>
        </div>

        {/* Details tab */}
        {tab === 'details' && (
          <>
            <Section title="Child Details" fields={[
              ["Name (English)",      app.childNameEnglish],
              ["Name (Sinhala)",      app.childNameSinhala],
              ["Date of Birth",       app.dateOfBirth],
              ["Birth Cert No.",      app.birthCertNumber],
              ["Birth Cert Division", app.birthCertDivision],
              ["Birth Cert District", app.birthCertDistrict],
            ]} />
            <Section title="Parent / Guardian" fields={[
              ["Name (English)",  app.applicantNameEnglish],
              ["Name (Sinhala)",  app.applicantNameSinhala],
              ["Relationship",    app.applicantRelationship],
              ["NIC",             app.applicantNic],
              ["Contact",         app.contactNumber],
              ["Phone",           app.phoneNumber],
            ]} />
            <Section title="Address & Location" fields={[
              ["Address",  [app.addressLine1, app.addressLine2].filter(Boolean).join(', ')],
              ["Street",   app.street],
              ["Town",     app.town],
              ["District", app.district],
              ["Distance", app.distanceFromSchoolKm ? `${app.distanceFromSchoolKm} km` : null],
            ]} />
            {(app.motherFullName || app.fatherFullName) && (
              <Section title="Parents Info" fields={[
                ["Mother's Name",       app.motherFullName],
                ["Mother's Contact",    app.motherContact],
                ["Mother's Occupation", app.motherOccupation],
                ["Father's Name",       app.fatherFullName],
                ["Father's Contact",    app.fatherContact],
                ["Father's Occupation", app.fatherOccupation],
              ]} />
            )}
            {app.userComment && (
              <div style={{ background: 'rgba(212,160,23,.06)', border: '1px solid rgba(212,160,23,.2)', borderRadius: 'var(--r-md)', padding: '0.75rem 1rem', marginTop: '0.5rem' }}>
                <p className="form-label">User's Comment</p>
                <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>{app.userComment}</p>
              </div>
            )}
          </>
        )}

        {/* Scheme + score entry tab */}
        {tab === 'scheme' && (
          <div>
            {scheme ? (
              <>
                <p style={{ color: 'var(--gold-300)', fontFamily: 'Cinzel', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  {scheme.title} — {scheme.totalPossible} pts total
                </p>

                {/* Per-criterion input rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  {scheme.criteria.map((c, i) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(7,20,50,.35)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', minWidth: 20, paddingTop: 2 }}>{i + 1}.</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>{c.title}</p>
                        {c.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '2px 0 0' }}>{c.description}</p>}
                        {/* Comment field for COMMENT or BOTH types */}
                        {(c.fieldType === 'COMMENT_ONLY' || c.fieldType === 'NUMBER_AND_COMMENT') && (
                          <input
                            className="form-control"
                            placeholder="Comment for this criterion..."
                            style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}
                            value={criteriaScores[`comment_${c.id}`] ?? ''}
                            onChange={e => handleCriterionChange(`comment_${c.id}`, e.target.value)}
                          />
                        )}
                      </div>
                      {/* Score input for NUMBER or BOTH types */}
                      {c.fieldType !== 'COMMENT_ONLY' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <FieldTypeBadge type={c.fieldType} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 4 }}>
                            <input
                              type="number" min="0" max={c.maxScore} step="0.5"
                              placeholder="0"
                              value={criteriaScores[c.id] ?? ''}
                              onChange={e => handleCriterionChange(c.id, e.target.value)}
                              style={{ width: 80, padding: '5px 8px', background: 'var(--navy-800)', border: '1px solid var(--border-gold)', borderRadius: 'var(--r-sm)', color: 'var(--text-primary)', fontSize: '1rem', textAlign: 'center' }}
                            />
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>/ {c.maxScore}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Running total */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(212,160,23,.08)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(212,160,23,.3)', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Score</span>
                  <span style={{ fontFamily: 'Cinzel', fontWeight: 700, fontSize: '1.4rem', color: computedTotal > scheme.totalPossible ? 'var(--danger)' : 'var(--gold-300)' }}>
                    {computedTotal.toFixed(1)}
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}> / {scheme.totalPossible}</span>
                  </span>
                </div>

                {/* Overall comment */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Overall Comment / Observations</label>
                  <input className="form-control" placeholder="Optional overall notes"
                    value={comment} onChange={e => setComment(e.target.value)} />
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                    {saving ? '⏳ Saving...' : '✅ Save Score & Close'}
                  </button>
                  <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                </div>
              </>
            ) : (
              <Empty icon="📝" message="No marking scheme assigned" sub="The document controller or admin needs to create a scheme for this category first." />
            )}
          </div>
        )}

        {tab === 'details' && (
          <button className="btn btn-ghost btn-full mt-3" onClick={onClose}>Close</button>
        )}
      </div>
    </div>
  );
}

// ── Ranked List Panel ─────────────────────────────────────────
function RankedPanel() {
  const [ranked,    setRanked]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [sortField, setSortField] = useState('totalScore');
  const [sortDir,   setSortDir]   = useState('desc');

  const fetchRanked = useCallback(async () => {
    setLoading(true);
    try { const { data } = await userApi.getRanked(sortField, sortDir); setRanked(Array.isArray(data) ? data : []); }
    catch { toast.error('Failed to load ranked list'); setRanked([]); }
    finally { setLoading(false); }
  }, [sortField, sortDir]);

  useEffect(() => { fetchRanked(); }, [fetchRanked]);

  return (
    <>
      <SectionHead icon="🏆" title="Ranked List">
        <div className="flex gap-2 items-center">
          <select className="form-control" style={{ width: 'auto', fontSize: '0.82rem' }} value={sortField} onChange={e => setSortField(e.target.value)}>
            <option value="totalScore">Sort by Score</option>
            <option value="distance">Sort by Distance</option>
            <option value="name">Sort by Name</option>
            <option value="dateOfBirth">Sort by DOB</option>
          </select>
          <select className="form-control" style={{ width: 'auto', fontSize: '0.82rem' }} value={sortDir} onChange={e => setSortDir(e.target.value)}>
            <option value="desc">High → Low</option>
            <option value="asc">Low → High</option>
          </select>
        </div>
      </SectionHead>

      {loading ? <Spinner /> : ranked.length === 0 ? (
        <Empty icon="🏆" message="No scored applications yet" sub="Enter scores in the Applications panel to see the ranking." />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Rank</th><th>App No.</th><th>Child Name</th><th>DOB</th><th>District</th><th>Distance</th><th>Score</th><th>Flag</th><th>Status</th></tr>
              </thead>
              <tbody>
                {ranked.map((app, idx) => (
                  <tr key={app.id} style={{ opacity: app.flagColor === 'RED' ? 0.6 : 1 }}>
                    <td>
                      <span style={{ fontFamily: 'Cinzel', fontWeight: 700, color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'var(--text-secondary)', fontSize: idx < 3 ? '1.1rem' : '0.9rem' }}>
                        {idx < 3 ? ['🥇','🥈','🥉'][idx] : `#${app.rank || idx + 1}`}
                      </span>
                    </td>
                    <td style={{ color: 'var(--gold-300)', fontWeight: 600 }}>{app.applicationNumber}</td>
                    <td>{app.childNameEnglish}</td>
                    <td style={{ fontSize: '0.82rem' }}>{app.dateOfBirth}</td>
                    <td style={{ fontSize: '0.82rem' }}>{app.district}</td>
                    <td style={{ fontSize: '0.82rem' }}>{app.distanceFromSchoolKm} km</td>
                    <td>
                      <span style={{ fontFamily: 'Cinzel', fontWeight: 700, color: app.totalScore >= 80 ? 'var(--success)' : app.totalScore >= 60 ? 'var(--gold-300)' : 'var(--danger)' }}>
                        {app.totalScore ?? '—'}
                      </span>
                    </td>
                    <td>
                      {app.flagColor ? (
                        <span style={{ color: app.flagColor === 'RED' ? '#ef4444' : app.flagColor === 'YELLOW' ? '#f59e0b' : '#10b981', fontWeight: 700, fontSize: '0.78rem' }}>● {app.flagColor}</span>
                      ) : '—'}
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted text-sm mt-2">{ranked.length} application{ranked.length !== 1 ? 's' : ''} shown</p>
        </div>
      )}
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