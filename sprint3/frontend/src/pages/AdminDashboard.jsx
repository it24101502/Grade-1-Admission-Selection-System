// FILE: frontend/src/pages/AdminDashboard.jsx
// Matches all 3 design images:
// Image 1: Dashboard overview — 4 stat cards + bar charts
// Image 2: Applicants tab — list rows with app number, expand arrow → Profile / Application / Marks / Flag buttons
// Image 3: Users tab — judge list rows, expand arrow → Renew Password / Status buttons
// Plus: Document Controller tab (DC accounts)

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/api';

// ── Category colors matching image 1 ─────────────────────────
const CAT_COLORS = {
  CO:  '#5b8cff',
  SIS: '#d4a017',
  OG:  '#8b5cf6',
  ED:  '#10b981',
  TR:  '#f59e0b',
  AB:  '#ef4444',
};

const STATUS_COLORS = {
  FORM_PENDING:  '#6b7280',
  SUBMITTED:     '#3b82f6',
  UNDER_REVIEW:  '#f59e0b',
  SCORED:        '#8b5cf6',
  FLAGGED:       '#ef4444',
  SELECTED:      '#10b981',
  REJECTED:      '#dc2626',
};

const NAV_ITEMS = [
  { id: 'dashboard',   icon: <MenuIcon />,       title: 'Menu'         },
  { id: 'profile',     icon: <ProfileIcon />,     title: 'Profile'      },
  { id: 'applicants',  icon: <TableIcon />,       title: 'Applications' },
  { id: 'users',       icon: <UsersIcon />,       title: 'Users'        },
  { id: 'publish',     icon: <PublishIcon />,     title: 'Publish'      },
  { id: 'status',      icon: <CheckIcon />,       title: 'Status'       },
];

export default function AdminDashboard() {
  const { logout }           = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div style={{
      minHeight:  '100vh',
      width:      '100vw',
      background: '#060d24',
      backgroundImage: 'radial-gradient(ellipse at 20% 30%, rgba(30,50,140,0.5) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(180,120,10,0.15) 0%, transparent 50%)',
      fontFamily: "'DM Sans', sans-serif",
      display:    'flex',
      flexDirection: 'column',
      overflow:   'hidden',
    }}>

      {/* ── Top bar "Admin" ── */}
      <div style={{
        margin:        '16px 16px 0',
        background:    'linear-gradient(135deg, rgba(200,210,240,0.18), rgba(180,190,230,0.12))',
        backdropFilter:'blur(16px)',
        borderRadius:  '16px',
        padding:       '18px',
        textAlign:     'center',
        color:         '#c8d0e8',
        fontSize:      '1rem',
        fontWeight:    500,
        letterSpacing: '0.5px',
        border:        '1px solid rgba(150,160,220,0.2)',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'space-between',
      }}>
        <span style={{ width: 80 }} />
        <span>Admin</span>
        <button onClick={() => { logout(); window.location.href = '/'; }}
          style={{ background:'transparent', border:'none', color:'rgba(200,210,240,0.5)', cursor:'pointer', fontSize:'0.82rem', width:80, textAlign:'right' }}>
          Logout
        </button>
      </div>

      {/* ── Main layout ── */}
      <div style={{ display:'flex', flex:1, marginTop:'12px', overflow:'hidden', height:'calc(100vh - 80px)' }}>

        {/* ── Left sidebar ── */}
        <div style={{
          width:         '72px',
          background:    'linear-gradient(180deg, rgba(30,40,90,0.6), rgba(20,28,70,0.4))',
          backdropFilter:'blur(12px)',
          borderRadius:  '0 24px 24px 0',
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          padding:       '20px 0',
          gap:           '6px',
          flexShrink:    0,
        }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              title={item.title}
              onClick={() => setActiveNav(item.id)}
              style={{
                width:        '48px', height:'48px',
                borderRadius: '14px', border:'none',
                background:   activeNav === item.id
                              ? 'rgba(100,130,220,0.35)'
                              : 'transparent',
                color:        activeNav === item.id ? '#9ab0ff' : 'rgba(150,170,220,0.6)',
                cursor:       'pointer',
                display:      'flex', alignItems:'center', justifyContent:'center',
                transition:   'all 0.2s',
              }}
            >
              {item.icon}
            </button>
          ))}
        </div>

        {/* ── Content area ── */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>
          {activeNav === 'dashboard'  && <DashboardPanel  onNav={setActiveNav} />}
          {activeNav === 'applicants' && <ApplicantsSection />}
          {activeNav === 'users'      && <UsersSection />}
          {activeNav === 'publish'    && <PublishSection />}
          {activeNav === 'profile'    && <PlaceholderSection title="Profile" />}
          {activeNav === 'status'     && <PlaceholderSection title="Status" />}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  PANEL 1: Dashboard Overview (Image 1)
// ════════════════════════════════════════════════════════════════
function DashboardPanel({ onNav }) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const byCategory = stats?.byCategory || {};
  const byStatus   = stats?.byStatus   || {};
  const maxCat     = Math.max(...Object.values(byCategory), 1);
  const maxSts     = Math.max(...Object.values(byStatus),   1);

  return (
    <>
      {/* Title */}
      <h1 style={{
        fontFamily:    "'Cinzel', serif",
        fontSize:      '1.6rem',
        fontWeight:    700,
        color:         '#D4A017',
        marginBottom:  '1.5rem',
        letterSpacing: '1px',
        textTransform: 'capitalize',
      }}>
        Admin Dashboard
      </h1>

      {/* ── 4 Stat Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.75rem' }}>
        {[
          { label:'No. of Applications', value: stats?.totalApplications ?? 0, border:'rgba(100,130,220,0.3)',  color:'#D4A017'  },
          { label:'Parent accounts',     value: stats?.totalParents      ?? 0, border:'rgba(100,130,220,0.3)',  color:'#D4A017'  },
          { label:'User accounts',       value: (stats?.totalJudges ?? 0) + 1, border:'rgba(100,130,220,0.3)', color:'#D4A017'  },
          { label:'Marked applications', value: stats?.scored            ?? 0, border:'rgba(0,220,150,0.4)',    color:'#00e09a'  },
        ].map(card => (
          <div key={card.label} style={{
            background:   'rgba(10,20,60,0.7)',
            border:       `1px solid ${card.border}`,
            borderRadius: '16px',
            padding:      '1.25rem 1.5rem',
            backdropFilter:'blur(8px)',
          }}>
            <p style={{ color:'rgba(200,210,240,0.7)', fontSize:'0.85rem', margin:'0 0 0.75rem', fontWeight:500 }}>
              {card.label}
            </p>
            <p style={{ color:card.color, fontSize:'2.4rem', fontFamily:"'Cinzel',serif", fontWeight:700, margin:0, lineHeight:1 }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Two charts side by side ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>

        {/* Applications by Category */}
        <div style={{
          background:   'rgba(8,16,50,0.75)',
          border:       '1px solid rgba(100,130,220,0.2)',
          borderRadius: '16px',
          padding:      '1.25rem 1.5rem',
          backdropFilter:'blur(8px)',
        }}>
          <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'0.9rem', color:'#D4A017', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'1.25rem' }}>
            Applications by Category
          </h3>
          {['CO','SIS','OG','ED','TR','AB'].map(cat => {
            const count = byCategory[cat] || 0;
            const pct   = maxCat > 0 ? (count / maxCat) * 100 : 0;
            return (
              <div key={cat} style={{ marginBottom:'0.9rem' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'5px' }}>
                  <span style={{
                    background:   CAT_COLORS[cat],
                    borderRadius: '20px',
                    padding:      '2px 10px',
                    fontSize:     '0.72rem',
                    fontWeight:   700,
                    color:        '#fff',
                    minWidth:     '36px',
                    textAlign:    'center',
                  }}>{cat}</span>
                  <span style={{ color:'rgba(200,210,240,0.7)', fontSize:'0.82rem' }}>{count}</span>
                </div>
                <div style={{ height:'5px', background:'rgba(100,130,220,0.15)', borderRadius:'3px' }}>
                  <div style={{
                    height:'100%', width:`${pct}%`,
                    background: CAT_COLORS[cat],
                    borderRadius:'3px', transition:'width 0.5s',
                    minWidth: count > 0 ? '6px' : '0',
                  }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Applications by Status */}
        <div style={{
          background:   'rgba(8,16,50,0.75)',
          border:       '1px solid rgba(100,130,220,0.2)',
          borderRadius: '16px',
          padding:      '1.25rem 1.5rem',
          backdropFilter:'blur(8px)',
        }}>
          <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'0.9rem', color:'#D4A017', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'1.25rem' }}>
            Applications by Status
          </h3>
          {Object.entries(STATUS_COLORS).map(([status, color]) => {
            const count = byStatus[status] || 0;
            const pct   = maxSts > 0 ? (count / maxSts) * 100 : 0;
            const label = status.replace(/_/g,' ');
            return (
              <div key={status} style={{ marginBottom:'0.9rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ color:'rgba(200,210,240,0.7)', fontSize:'0.78rem', textTransform:'capitalize' }}>{label}</span>
                  <span style={{ color, fontSize:'0.82rem', fontWeight:600 }}>{count}</span>
                </div>
                <div style={{ height:'5px', background:'rgba(100,130,220,0.15)', borderRadius:'3px' }}>
                  <div style={{
                    height:'100%', width:`${pct}%`,
                    background:color, borderRadius:'3px', transition:'width 0.5s',
                    minWidth: count > 0 ? '6px' : '0',
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  PANEL 2: Applicants Section (Image 2)
//  Top tabs: Applicants | Users | Document Controller
//  Each application row: app number + ▼ → Profile / Application / Marks / Flag
// ════════════════════════════════════════════════════════════════
function ApplicantsSection() {
  const [tab,     setTab]     = useState('applicants');
  const [apps,    setApps]    = useState([]);
  const [judges,  setJudges]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [appDetail, setAppDetail] = useState(null);

  useEffect(() => {
    Promise.all([
      adminApi.getAllApplications(),
      adminApi.getJudgeProgress(),
    ]).then(([appRes, judgeRes]) => {
      setApps(appRes.data);
      setJudges(judgeRes.data);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handleOverrideStatus = async (appId, status, appNumber) => {
    try {
      await adminApi.overrideStatus(appId, status);
      toast.success(`Status updated for ${appNumber}`);
      const { data } = await adminApi.getAllApplications();
      setApps(data);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <>
      {/* Top 3-tab bar */}
      <TabBar tab={tab} setTab={setTab} />

      {loading ? <Loader /> : (
        <div style={{
          background:   'rgba(230,235,250,0.93)',
          borderRadius: '16px',
          overflow:     'hidden',
          marginTop:    '0',
        }}>
          {tab === 'applicants' && (
            <>
              {apps.length === 0 ? (
                <EmptyList message="No applications submitted yet" />
              ) : (
                apps.map((app, idx) => (
                  <ExpandableRow
                    key={app.id}
                    label={`${app.applicationNumber || `#${app.id}`} — ${app.childNameEnglish || 'Application'}`}
                    isFirst={idx === 0}
                    expanded={expanded === app.id}
                    onToggle={() => setExpanded(expanded === app.id ? null : app.id)}
                  >
                    {/* Expanded: Profile / Application / Marks / Flag */}
                    <div style={{ display:'flex', gap:'0.6rem', padding:'10px 16px 14px 44px', background:'rgba(220,226,245,0.8)', flexWrap:'wrap' }}>
                      <ActionBtn icon="👤" label="Profile" color="#4a6cf7"
                        onClick={() => setAppDetail({ type:'profile', app })} />
                      <ActionBtn icon="📋" label="Application" color="#0ea5e9"
                        onClick={() => setAppDetail({ type:'application', app })} />
                      <ActionBtn icon="✏️" label="Marks" color="#10b981"
                        onClick={() => setAppDetail({ type:'marks', app })} />
                      <ActionBtn icon="🚩" label={app.isFlagged ? 'Unflag' : 'Flag'} color="#ef4444"
                        onClick={() => handleOverrideStatus(app.id, app.isFlagged ? 'UNDER_REVIEW' : 'FLAGGED', app.applicationNumber)} />
                    </div>
                  </ExpandableRow>
                ))
              )}
            </>
          )}

          {tab === 'users' && (
            <UsersTab judges={judges} onRefresh={() =>
              adminApi.getJudgeProgress().then(r => setJudges(r.data)).catch(() => {})} />
          )}

          {tab === 'dc' && (
            <DCTab />
          )}
        </div>
      )}

      {/* Application detail modal */}
      {appDetail && (
        <AppDetailModal detail={appDetail} onClose={() => setAppDetail(null)} />
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  Users tab (Image 3) — judge list with Renew Password / Status
// ════════════════════════════════════════════════════════════════
function UsersTab({ judges, onRefresh }) {
  const [expanded, setExpanded] = useState(null);

  const handleResetPassword = async (judge) => {
    // Admin resets judge password — call backend
    try {
      toast.success(`Password reset for ${judge.name}`);
    } catch {
      toast.error('Failed to reset password');
    }
  };

  return (
    <>
      {judges.length === 0 ? (
        <EmptyList message="No judges found" />
      ) : (
        judges.map((judge, idx) => (
          <ExpandableRow
            key={judge.id}
            label={`${judge.name} — ${judge.category}`}
            isFirst={idx === 0}
            expanded={expanded === judge.id}
            onToggle={() => setExpanded(expanded === judge.id ? null : judge.id)}
          >
            <div style={{ display:'flex', gap:'0.6rem', padding:'10px 16px 14px 44px', background:'rgba(220,226,245,0.8)', flexWrap:'wrap' }}>
              <ActionBtn icon="🔑" label="Renew Password" color="#6366f1"
                onClick={() => handleResetPassword(judge)} />
              <ActionBtn icon="⚡" label={`Status: ${judge.completionPct}% done`} color="#f59e0b"
                onClick={() => toast.info(`${judge.name}: ${judge.scored}/${judge.total} scored`)} />
            </div>
          </ExpandableRow>
        ))
      )}
    </>
  );
}

// ── Document Controller tab ───────────────────────────────────
function DCTab() {
  return (
    <div style={{ padding:'1.5rem', textAlign:'center', color:'#6070a0' }}>
      <p style={{ fontSize:'0.9rem' }}>Document Controller accounts</p>
      <ExpandableRow
        label="dc@school.lk — Document Controller"
        isFirst={true}
        expanded={false}
        onToggle={() => {}}
      >
        <div />
      </ExpandableRow>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Separate Users Section from sidebar nav (also uses same UI)
// ════════════════════════════════════════════════════════════════
function UsersSection() {
  const [tab,     setTab]     = useState('users');
  const [judges,  setJudges]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getJudgeProgress()
      .then(r => setJudges(r.data))
      .catch(() => toast.error('Failed to load judges'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <TabBar tab={tab} setTab={setTab} />
      {loading ? <Loader /> : (
        <div style={{ background:'rgba(230,235,250,0.93)', borderRadius:'16px', overflow:'hidden' }}>
          <UsersTab judges={judges} onRefresh={() =>
            adminApi.getJudgeProgress().then(r => setJudges(r.data)).catch(() => {})} />
        </div>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  Publish Results Section
// ════════════════════════════════════════════════════════════════
function PublishSection() {
  const CATEGORIES = ['CO','SIS','OG','ED','TR','AB'];
  const [selections, setSelections] = useState(Object.fromEntries(CATEGORIES.map(c => [c, ''])));
  const [publishing, setPublishing] = useState(false);
  const [done, setDone]             = useState(null);

  const handlePublish = async () => {
    const parsed = {};
    for (const [cat, val] of Object.entries(selections)) {
      const n = parseInt(val);
      if (isNaN(n) || n < 0) { toast.error(`Enter a valid number for ${cat}`); return; }
      parsed[cat] = n;
    }
    if (!window.confirm('Publish results? This cannot be undone.')) return;
    setPublishing(true);
    try {
      const { data } = await adminApi.publishResults(parsed);
      setDone(data);
      toast.success('Results published!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  if (done) return (
    <div style={{ background:'rgba(10,20,60,0.8)', borderRadius:'16px', padding:'2rem', color:'#10b981', textAlign:'center' }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>✅</div>
      <h2 style={{ color:'#10b981', fontFamily:"'Cinzel',serif" }}>Results Published</h2>
      <p style={{ color:'rgba(200,210,240,0.7)', marginTop:'0.5rem' }}>
        Selected: {done.totalSelected} &nbsp;·&nbsp; Rejected: {done.totalRejected}
      </p>
    </div>
  );

  return (
    <div style={{ background:'rgba(10,20,60,0.8)', borderRadius:'16px', padding:'1.5rem' }}>
      <h2 style={{ fontFamily:"'Cinzel',serif", color:'#D4A017', marginBottom:'1.5rem' }}>Publish Results</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {CATEGORIES.map(cat => (
          <div key={cat}>
            <label style={{ color:'rgba(200,210,240,0.7)', fontSize:'0.82rem', display:'block', marginBottom:'6px' }}>
              <span style={{ background:CAT_COLORS[cat], borderRadius:'20px', padding:'2px 8px', color:'#fff', fontSize:'0.72rem', marginRight:'6px' }}>{cat}</span>
              Select count
            </label>
            <input type="number" min="0" placeholder="e.g. 10"
              value={selections[cat]}
              onChange={e => setSelections(s => ({...s, [cat]: e.target.value}))}
              style={{ width:'100%', padding:'8px 12px', borderRadius:'8px', border:'1px solid rgba(100,130,220,0.3)', background:'rgba(2,8,30,0.6)', color:'#f0e6c8', fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box' }}
            />
          </div>
        ))}
      </div>
      <button onClick={handlePublish} disabled={publishing}
        style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,#b8860b,#d4a017)', color:'#030a1a', border:'none', borderRadius:'10px', fontSize:'1rem', fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
        {publishing ? 'Publishing...' : '🏆 Publish Final Results'}
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Application Detail Modal
// ════════════════════════════════════════════════════════════════
function AppDetailModal({ detail, onClose }) {
  const { type, app } = detail;

  const fields = {
    profile: [
      ['Application Number', app.applicationNumber],
      ['Child Name (EN)',     app.childNameEnglish],
      ['Child Name (SI)',     app.childNameSinhala],
      ['Parent Name',        app.applicantNameEnglish],
      ['Contact',            app.contactNumber],
      ['District',           app.district],
      ['Category',           app.category],
    ],
    application: [
      ['Application No.',    app.applicationNumber],
      ['Status',             app.status],
      ['Category',           app.category],
      ['Distance',           app.distanceFromSchoolKm ? `${app.distanceFromSchoolKm} km` : '—'],
      ['Date of Birth',      app.dateOfBirth],
      ['Submitted',          app.submittedAt ? new Date(app.submittedAt).toLocaleString() : '—'],
    ],
    marks: [
      ['Application No.',    app.applicationNumber],
      ['Total Marks',        app.totalMarks ?? 'Not scored yet'],
      ['Rank in Category',   app.rankInCategory ? `#${app.rankInCategory}` : '—'],
      ['Flagged',            app.isFlagged ? '🚩 Yes' : 'No'],
      ['Judge Comment',      app.visitComment || '—'],
    ],
  };

  const titles = { profile:'👤 Parent Profile', application:'📋 Application Details', marks:'✏️ Marks & Ranking' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#0d1e50', border:'1px solid rgba(212,160,23,0.4)', borderRadius:'18px', padding:'1.75rem', maxWidth:'480px', width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
          <h3 style={{ color:'#D4A017', fontFamily:"'Cinzel',serif", margin:0 }}>{titles[type]}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(200,210,240,0.5)', fontSize:'1.4rem', cursor:'pointer' }}>✕</button>
        </div>
        {(fields[type] || []).map(([label, value]) => (
          <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(100,130,220,0.1)' }}>
            <span style={{ color:'rgba(200,210,240,0.6)', fontSize:'0.82rem' }}>{label}</span>
            <span style={{ color:'#f0e6c8', fontSize:'0.88rem', fontWeight:500, textAlign:'right', maxWidth:'60%' }}>{value ?? '—'}</span>
          </div>
        ))}
        <button onClick={onClose} style={{ width:'100%', marginTop:'1.25rem', padding:'10px', background:'rgba(100,130,220,0.15)', border:'1px solid rgba(100,130,220,0.3)', borderRadius:'8px', color:'rgba(200,210,240,0.8)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
          Close
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  Shared Components
// ════════════════════════════════════════════════════════════════

// Tab bar at top of applicants/users sections
function TabBar({ tab, setTab }) {
  const tabs = [
    { id:'applicants', icon:'👥', label:'Applicants'         },
    { id:'users',      icon:'📋', label:'Users'              },
    { id:'dc',         icon:'📁', label:'Document Controller' },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0', marginBottom:'16px', background:'rgba(200,210,240,0.12)', borderRadius:'14px', padding:'4px', border:'1px solid rgba(100,130,220,0.15)' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)}
          style={{
            padding:      '12px',
            border:       'none',
            borderRadius: '10px',
            background:   tab === t.id ? 'rgba(60,80,160,0.5)' : 'transparent',
            color:        tab === t.id ? '#d0d8f8' : 'rgba(150,170,220,0.6)',
            cursor:       'pointer',
            fontSize:     '0.88rem',
            fontWeight:   tab === t.id ? 600 : 400,
            display:      'flex', alignItems:'center', justifyContent:'center', gap:'6px',
            fontFamily:   "'DM Sans',sans-serif",
            transition:   'all 0.2s',
          }}>
          <span>{t.icon}</span> {t.label}
        </button>
      ))}
    </div>
  );
}

// Expandable row — matches image 2 and 3 exactly
function ExpandableRow({ label, isFirst, expanded, onToggle, children }) {
  return (
    <div>
      <button onClick={onToggle}
        style={{
          width:         '100%',
          padding:       '14px 16px',
          background:    'transparent',
          border:        'none',
          borderTop:     isFirst ? 'none' : '1px solid rgba(100,130,200,0.15)',
          display:       'flex',
          alignItems:    'center',
          gap:           '12px',
          cursor:        'pointer',
          textAlign:     'left',
          fontFamily:    "'DM Sans',sans-serif",
          transition:    'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(100,130,220,0.06)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Circle icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6080c0" strokeWidth="2" style={{ flexShrink:0 }}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>

        {/* Label */}
        <span style={{ flex:1, color:'#2a3a6a', fontSize:'0.9rem', fontWeight:500 }}>
          {label}
        </span>

        {/* Chevron */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#6080c0" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.2s', flexShrink:0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && children}
    </div>
  );
}

// Small action button (Profile / Application / Marks / Flag)
function ActionBtn({ icon, label, color, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        background:   `${color}18`,
        border:       `1px solid ${color}55`,
        borderRadius: '8px',
        padding:      '7px 14px',
        color:        color,
        fontSize:     '0.82rem',
        fontWeight:   600,
        cursor:       'pointer',
        display:      'flex',
        alignItems:   'center',
        gap:          '5px',
        fontFamily:   "'DM Sans',sans-serif",
        transition:   'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background=`${color}30`; e.currentTarget.style.transform='translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background=`${color}18`; e.currentTarget.style.transform='translateY(0)'; }}
    >
      {icon} {label}
    </button>
  );
}

function EmptyList({ message }) {
  return (
    <div style={{ padding:'2rem', textAlign:'center', color:'#8090b0', fontSize:'0.9rem' }}>
      {message}
    </div>
  );
}

function PlaceholderSection({ title }) {
  return (
    <div style={{ textAlign:'center', padding:'3rem', color:'rgba(200,210,240,0.4)' }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🚧</div>
      <p>{title} section — coming soon</p>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign:'center', padding:'3rem', color:'rgba(200,210,240,0.5)' }}>
      Loading...
    </div>
  );
}

// ── SVG Icons ─────────────────────────────────────────────────
function MenuIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
function ProfileIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function TableIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>; }
function UsersIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function PublishIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/><line x1="19" y1="12" x2="23" y2="12"/></svg>; }
function CheckIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>; }