// FILE: frontend/src/pages/AdminDashboard.jsx
// Step 7: Admin views all applications, monitors judge progress,
//         publishes final results by selecting top N per category
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Header, Sidebar, StatusBadge, CategoryBadge, StatCard, Spinner, Empty, SectionHead }
  from '../components/shared/UI';
import { adminApi } from '../services/api';

const CATEGORIES = ['CO', 'SIS', 'OG', 'ED', 'TR', 'AB'];

const NAV = [{
  label: 'Admin Panel',
  items: [
    { id: 'dashboard',    icon: '📊', label: 'Dashboard'         },
    { id: 'applications', icon: '📋', label: 'All Applications'  },
    { id: 'judges',       icon: '⚖️', label: 'Judge Progress'   },
    { id: 'publish',      icon: '🏆', label: 'Publish Results'   },
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
            {panel === 'judges'       && <JudgeProgressPanel />}
            {panel === 'publish'      && <PublishResultsPanel />}
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
        <StatCard icon="⚖️" value={stats.totalJudges}      label="Judges" />
        <StatCard icon="✏️" value={stats.scored}           label="Scored" color="var(--success)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1rem' }}>

        {/* By Category */}
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
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {count}
                  </span>
                </div>
                <div style={{ height: '6px', background: 'var(--navy-700)', borderRadius: '3px' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: 'var(--gold-400)', borderRadius: '3px',
                    transition: 'width 0.4s',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* By Status */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Applications by Status</h3></div>
          {Object.entries(stats.byStatus || {}).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center" style={{ marginBottom: '0.6rem' }}>
              <StatusBadge status={status} />
              <span style={{
                fontFamily: 'Cinzel', fontWeight: 700,
                color: 'var(--gold-200)', fontSize: '1rem',
              }}>
                {count}
              </span>
            </div>
          ))}
          {stats.flagged > 0 && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.6rem',
              background: 'rgba(239,68,68,.08)',
              border: '1px solid rgba(239,68,68,.3)',
              borderRadius: 'var(--r-sm)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
            }}>
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
  const [apps,    setApps]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('');
  const [stsFilter, setStsFilter] = useState('');
  const [search,    setSearch]    = useState('');

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getAllApplications(catFilter, stsFilter);
      setApps(data);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
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

      {/* Filters */}
      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
        <select className="form-control" style={{ width: 'auto' }}
          value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-control" style={{ width: 'auto' }}
          value={stsFilter} onChange={e => setStsFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['FORM_PENDING','SUBMITTED','UNDER_REVIEW','SCORED','FLAGGED','SELECTED','REJECTED']
            .map(s => <option key={s} value={s}>{s}</option>)}
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
                  <th>App No.</th>
                  <th>Child Name</th>
                  <th>Parent</th>
                  <th>District</th>
                  <th>Distance</th>
                  <th>Category</th>
                  <th>Marks</th>
                  <th>Rank</th>
                  <th>Status</th>
                  <th>Judge</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(app => (
                  <tr key={app.id}>
                    <td style={{ color: 'var(--gold-300)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {app.applicationNumber || `#${app.id}`}
                    </td>
                    <td>
                      <div>{app.childNameEnglish}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {app.childNameSinhala}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{app.applicantNameEnglish}</td>
                    <td style={{ fontSize: '0.82rem' }}>{app.district}</td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {app.distanceFromSchoolKm} km
                    </td>
                    <td><CategoryBadge category={app.category} /></td>
                    <td style={{
                      fontFamily: 'Cinzel', fontWeight: 700,
                      color: app.totalMarks >= 80 ? 'var(--success)'
                           : app.totalMarks >= 60 ? 'var(--gold-300)'
                           : app.totalMarks !== null ? 'var(--danger)' : 'var(--text-muted)',
                    }}>
                      {app.totalMarks ?? '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {app.rankInCategory ? `#${app.rankInCategory}` : '—'}
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {app.assignedJudge || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted text-sm mt-2">
            Showing {displayed.length} of {apps.length} applications
          </p>
        </div>
      )}
    </>
  );
}

// ── Judge Progress Panel ──────────────────────────────────────
function JudgeProgressPanel() {
  const [judges,  setJudges]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getJudgeProgress()
      .then(r => setJudges(r.data))
      .catch(() => toast.error('Failed to load judge progress'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <>
      <SectionHead icon="⚖️" title="Judge Progress" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {judges.map(judge => (
          <div key={judge.id} className="card">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>{judge.name}</span>
                <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>·</span>
                <CategoryBadge category={judge.category} />
              </div>
              <span style={{
                fontFamily: 'Cinzel', fontWeight: 700,
                color: judge.completionPct === 100 ? 'var(--success)' : 'var(--gold-300)',
                fontSize: '1.1rem',
              }}>
                {judge.completionPct}%
              </span>
            </div>

            <div style={{ height: '8px', background: 'var(--navy-700)', borderRadius: '4px', marginBottom: '0.5rem' }}>
              <div style={{
                height: '100%',
                width: `${judge.completionPct}%`,
                background: judge.completionPct === 100
                  ? 'var(--success)'
                  : 'linear-gradient(90deg, var(--gold-500), var(--gold-300))',
                borderRadius: '4px',
                transition: 'width 0.4s',
              }} />
            </div>

            <div className="flex gap-3" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Total: <strong style={{ color: 'var(--text-primary)' }}>{judge.total}</strong></span>
              <span>Scored: <strong style={{ color: 'var(--success)' }}>{judge.scored}</strong></span>
              <span>Pending: <strong style={{ color: 'var(--warning)' }}>{judge.pending}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Publish Results Panel ─────────────────────────────────────
function PublishResultsPanel() {
  const [selections, setSelections] = useState(
    Object.fromEntries(CATEGORIES.map(c => [c, '']))
  );
  const [ranked,    setRanked]    = useState({});
  const [publishing,setPublishing] = useState(false);
  const [published, setPublished]  = useState(null);
  const [activeTab, setActiveTab]  = useState(CATEGORIES[0]);

  useEffect(() => {
    // Load ranked lists for all categories
    Promise.all(CATEGORIES.map(cat =>
      adminApi.getRankedByCategory(cat)
        .then(r => [cat, r.data])
        .catch(() => [cat, { applications: [], total: 0, scored: 0 }])
    )).then(entries => {
      setRanked(Object.fromEntries(entries));
    });
  }, []);

  const handlePublish = async () => {
    // Validate all entries are numbers
    const parsed = {};
    for (const [cat, val] of Object.entries(selections)) {
      const n = parseInt(val);
      if (isNaN(n) || n < 0) {
        toast.error(`Enter a valid number for category ${cat}`);
        return;
      }
      parsed[cat] = n;
    }

    if (!window.confirm(
      'Are you sure you want to publish results? This will mark applications as SELECTED or REJECTED. This action cannot be undone.'
    )) return;

    setPublishing(true);
    try {
      const { data } = await adminApi.publishResults(parsed);
      setPublished(data);
      toast.success('✅ Results published successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish results');
    } finally {
      setPublishing(false);
    }
  };

  const currentRanked = ranked[activeTab];

  return (
    <>
      <SectionHead icon="🏆" title="Publish Results" />

      {published ? (
        /* Success summary */
        <div className="card" style={{ border: '1.5px solid var(--success)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'var(--success)' }}>
              ✅ Results Published Successfully
            </h3>
          </div>
          <div className="stats-row" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
            <StatCard icon="✅" value={published.totalSelected} label="Total Selected" color="var(--success)" />
            <StatCard icon="❌" value={published.totalRejected} label="Total Rejected" color="var(--danger)" />
          </div>
          <div className="mt-2">
            <p className="form-label mb-1">Selected per Category</p>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              {Object.entries(published.byCategory || {}).map(([cat, count]) => (
                <div key={cat} style={{
                  background: 'rgba(16,185,129,.1)',
                  border: '1px solid rgba(16,185,129,.3)',
                  borderRadius: 'var(--r-sm)',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem',
                }}>
                  <CategoryBadge category={cat} />
                  <span style={{ marginLeft: '0.4rem', color: 'var(--success)', fontWeight: 700 }}>
                    {count} selected
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Warning */}
          <div style={{
            background: 'rgba(245,158,11,.08)',
            border: '1px solid rgba(245,158,11,.3)',
            borderRadius: 'var(--r-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}>
            <p style={{ color: 'var(--warning)', fontWeight: 600, marginBottom: '0.3rem' }}>
              ⚠️ Important: Read before publishing
            </p>
            <p className="text-sm text-muted">
              Publishing results will mark the top N applications in each category as
              <strong style={{ color: 'var(--success)' }}> SELECTED</strong> and the rest as
              <strong style={{ color: 'var(--danger)' }}> REJECTED</strong>.
              Only scored (non-flagged) applications are considered. Rankings are by marks (high → low),
              then distance (near → far). This action cannot be undone.
            </p>
          </div>

          {/* Selection counts */}
          <div className="card mb-3">
            <div className="card-header">
              <h3 className="card-title">Set Selection Count per Category</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
              {CATEGORIES.map(cat => {
                const info = ranked[cat];
                const scored = info?.scored ?? '...';
                return (
                  <div key={cat} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      <CategoryBadge category={cat} />
                      <span style={{ marginLeft: '0.4rem', color: 'var(--text-muted)' }}>
                        ({scored} scored)
                      </span>
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      placeholder="e.g. 10"
                      value={selections[cat]}
                      onChange={e => setSelections(s => ({ ...s, [cat]: e.target.value }))}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview ranked list */}
          <div className="card mb-3">
            <div className="card-header">
              <h3 className="card-title">Preview Ranked List</h3>
            </div>
            {/* Category tabs */}
            <div className="flex gap-1 mb-2" style={{ flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm ${activeTab === cat ? 'btn-gold' : 'btn-ghost'}`}
                  onClick={() => setActiveTab(cat)}
                >
                  {cat}
                  {ranked[cat] && (
                    <span style={{ marginLeft: '0.3rem', opacity: 0.7 }}>
                      ({ranked[cat].scored})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {!currentRanked ? (
              <Spinner />
            ) : currentRanked.applications.length === 0 ? (
              <Empty icon="📋" message={`No scored applications in category ${activeTab}`} />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>App No.</th>
                      <th>Child Name</th>
                      <th>District</th>
                      <th>Distance</th>
                      <th>Marks</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRanked.applications.map((app, idx) => {
                      const selectCount = parseInt(selections[activeTab]) || 0;
                      const willBeSelected = idx < selectCount && !app.isFlagged && app.totalMarks !== null;
                      return (
                        <tr key={app.id} style={{
                          background: willBeSelected
                            ? 'rgba(16,185,129,.05)'
                            : app.isFlagged
                            ? 'rgba(239,68,68,.05)'
                            : 'transparent',
                        }}>
                          <td style={{ fontWeight: 700, color: 'var(--gold-300)' }}>
                            #{idx + 1}
                          </td>
                          <td style={{ color: 'var(--gold-300)' }}>{app.applicationNumber}</td>
                          <td>{app.childNameEnglish}</td>
                          <td style={{ fontSize: '0.82rem' }}>{app.district}</td>
                          <td style={{ fontSize: '0.82rem' }}>{app.distanceFromSchoolKm} km</td>
                          <td style={{ fontFamily: 'Cinzel', fontWeight: 700 }}>
                            {app.totalMarks ?? '—'}
                          </td>
                          <td>
                            {app.isFlagged ? (
                              <span className="badge s-flagged">🚩 Flagged</span>
                            ) : willBeSelected ? (
                              <span className="badge s-selected">✅ Will Select</span>
                            ) : (
                              <span className="badge s-rejected">❌ Will Reject</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <button
            className="btn btn-gold btn-lg btn-full"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing ? '⏳ Publishing...' : '🏆 Publish Final Results'}
          </button>
        </>
      )}
    </>
  );
}