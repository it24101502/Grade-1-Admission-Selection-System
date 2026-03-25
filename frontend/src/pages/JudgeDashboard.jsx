// FILE: frontend/src/pages/JudgeDashboard.jsx
// Step 5: View assigned applications, enter marks, add comments
// Step 6: Flag applications, view ranked list
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Header, Sidebar, StatusBadge, CategoryBadge, StatCard, Spinner, Empty, SectionHead }
  from '../components/shared/UI';
import { useAuth } from '../context/AuthContext';
import { judgeApi } from '../services/api';

const NAV = [{
  label: 'Judge Panel',
  items: [
    { id: 'overview',     icon: '📊', label: 'Overview'          },
    { id: 'applications', icon: '📋', label: 'Applications'      },
    { id: 'ranked',       icon: '🏆', label: 'Ranked List'       },
  ],
}];

export default function JudgeDashboard() {
  const [panel, setPanel] = useState('overview');
  const [stats,  setStats]  = useState(null);

  useEffect(() => {
    judgeApi.getStats()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'));
  }, []);

  return (
    <div className="app-root">
      <Header />
      <div className="dashboard-layout">
        <Sidebar sections={NAV} activeId={panel} onSelect={setPanel} />
        <div className="main-area">
          <div className="page-wrap">
            {panel === 'overview'     && <OverviewPanel     stats={stats} />}
            {panel === 'applications' && <ApplicationsPanel />}
            {panel === 'ranked'       && <RankedPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Overview Panel ────────────────────────────────────────────
function OverviewPanel({ stats }) {
  if (!stats) return <Spinner message="Loading overview..." />;
  return (
    <>
      <SectionHead icon="📊" title={`Overview — Category ${stats.category}`} />

      <div style={{
        background: 'linear-gradient(135deg, var(--navy-700), var(--navy-800))',
        border: '1px solid var(--border-gold)',
        borderRadius: 'var(--r-lg)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <p className="text-muted text-sm">Assigned Judge</p>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--gold-200)', marginTop: '0.25rem' }}>
          {stats.judgeName}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Category: <CategoryBadge category={stats.category} />
        </p>
      </div>

      <div className="stats-row">
        <StatCard icon="📋" value={stats.total}   label="Total Assigned" />
        <StatCard icon="✏️" value={stats.scored}  label="Scored"         color="var(--success)" />
        <StatCard icon="⏳" value={stats.pending} label="Pending"        color="var(--warning)" />
        <StatCard icon="🚩" value={stats.flagged} label="Flagged"        color="var(--danger)"  />
      </div>

      {/* Progress bar */}
      <div className="card mt-2">
        <div className="flex justify-between items-center mb-2">
          <p style={{ fontWeight: 600 }}>Scoring Progress</p>
          <p style={{ color: 'var(--gold-300)', fontWeight: 700, fontSize: '1.1rem' }}>
            {stats.completionPct}%
          </p>
        </div>
        <div style={{
          height: '12px',
          background: 'var(--navy-700)',
          borderRadius: '6px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${stats.completionPct}%`,
            background: 'linear-gradient(90deg, var(--gold-500), var(--gold-300))',
            borderRadius: '6px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p className="text-muted text-sm mt-1">
          {stats.scored} of {stats.total} applications scored
        </p>
      </div>
    </>
  );
}

// ── Applications Panel ────────────────────────────────────────
function ApplicationsPanel() {
  const [apps,       setApps]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [filter,     setFilter]     = useState('ALL');

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await judgeApi.getApplications();
      setApps(data);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const filtered = apps.filter(a => {
    if (filter === 'PENDING')  return !a.totalMarks && !a.isFlagged;
    if (filter === 'SCORED')   return !!a.totalMarks && !a.isFlagged;
    if (filter === 'FLAGGED')  return a.isFlagged;
    return true;
  });

  return (
    <>
      <SectionHead icon="📋" title="Applications">
        <button className="btn btn-ghost btn-sm" onClick={fetchApps}>🔄 Refresh</button>
      </SectionHead>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-3">
        {['ALL', 'PENDING', 'SCORED', 'FLAGGED'].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-gold' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Empty icon="📋" message="No applications found" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(app => (
            <ApplicationRow
              key={app.id}
              app={app}
              onSelect={() => setSelected(app.id)}
              onRefresh={fetchApps}
            />
          ))}
        </div>
      )}

      {selected && (
        <ApplicationDetailModal
          appId={selected}
          onClose={() => { setSelected(null); fetchApps(); }}
        />
      )}
    </>
  );
}

// ── Application Row Card ──────────────────────────────────────
function ApplicationRow({ app, onSelect, onRefresh }) {
  const [marking,  setMarking]  = useState(false);
  const [marks,    setMarks]    = useState(app.totalMarks ?? '');
  const [comment,  setComment]  = useState(app.visitComment ?? '');
  const [saving,   setSaving]   = useState(false);

  const handleSaveMarks = async (e) => {
    e.stopPropagation();
    if (marks === '' || isNaN(marks) || marks < 0 || marks > 100) {
      toast.error('Enter marks between 0 and 100');
      return;
    }
    setSaving(true);
    try {
      await judgeApi.enterMarks(app.id, parseFloat(marks), comment);
      toast.success(`Marks saved for ${app.applicationNumber}`);
      setMarking(false);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const handleFlag = async (e) => {
    e.stopPropagation();
    const reason = app.isFlagged
      ? ''
      : window.prompt('Enter reason for flagging this application:');
    if (!app.isFlagged && !reason) return;
    try {
      await judgeApi.toggleFlag(app.id, !app.isFlagged, reason || '');
      toast.success(app.isFlagged ? 'Flag removed' : 'Application flagged');
      onRefresh();
    } catch {
      toast.error('Failed to update flag');
    }
  };

  return (
    <div className="card" style={{
      border: app.isFlagged
        ? '1px solid rgba(239,68,68,.5)'
        : app.totalMarks !== null
        ? '1px solid rgba(16,185,129,.3)'
        : '1px solid var(--border)',
      cursor: 'pointer',
    }}>
      {/* Header row */}
      <div
        className="flex justify-between items-center"
        onClick={onSelect}
      >
        <div>
          <span style={{ color: 'var(--gold-300)', fontWeight: 700, fontSize: '0.95rem' }}>
            {app.applicationNumber}
          </span>
          <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontWeight: 600 }}>{app.childNameEnglish}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: '0.5rem' }}>
            {app.childNameSinhala}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <StatusBadge status={app.status} />
          {app.totalMarks !== null && (
            <span style={{
              background: 'rgba(212,160,23,.15)',
              border: '1px solid rgba(212,160,23,.4)',
              borderRadius: '20px',
              padding: '0.2rem 0.7rem',
              color: 'var(--gold-200)',
              fontFamily: 'Cinzel',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}>
              {app.totalMarks}
            </span>
          )}
        </div>
      </div>

      {/* Details row */}
      <div className="flex gap-3 mt-1" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <span>📅 DOB: {app.dateOfBirth}</span>
        <span>📍 {app.district}</span>
        <span>🏫 {app.distanceFromSchoolKm} km</span>
        {app.isFlagged && app.flagReason && (
          <span style={{ color: 'var(--danger)' }}>🚩 {app.flagReason}</span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
        <button
          className="btn btn-navy btn-sm"
          onClick={() => setMarking(!marking)}
        >
          ✏️ {app.totalMarks !== null ? 'Edit Marks' : 'Enter Marks'}
        </button>
        <button
          className={`btn btn-sm ${app.isFlagged ? 'btn-ghost' : 'btn-danger'}`}
          onClick={handleFlag}
        >
          {app.isFlagged ? '🏳️ Remove Flag' : '🚩 Flag'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onSelect}>
          👁 View Details
        </button>
      </div>

      {/* Mark entry form */}
      {marking && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(2,10,30,.6)',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border-gold)',
        }}>
          <div className="form-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Marks (0–100) <span className="required-star">*</span>
              </label>
              <input
                className="form-control"
                type="number"
                min="0"
                max="100"
                step="0.5"
                placeholder="e.g. 85.5"
                value={marks}
                onChange={e => setMarks(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Comment / Observations</label>
              <input
                className="form-control"
                placeholder="Optional comment after review"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="btn btn-success btn-sm"
              onClick={handleSaveMarks}
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : '✅ Save Marks'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setMarking(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Application Detail Modal ──────────────────────────────────
function ApplicationDetailModal({ appId, onClose }) {
  const [app,     setApp]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    judgeApi.getApplicationDetail(appId)
      .then(r => setApp(r.data))
      .catch(() => toast.error('Failed to load details'))
      .finally(() => setLoading(false));
  }, [appId]);

  if (loading) return (
    <div className="modal-backdrop">
      <div className="modal-box"><Spinner /></div>
    </div>
  );
  if (!app) return null;

  const Section = ({ title, fields }) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <p style={{
        color: 'var(--gold-300)',
        fontFamily: 'Cinzel',
        fontWeight: 600,
        fontSize: '0.85rem',
        marginBottom: '0.75rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.4rem',
      }}>{title}</p>
      <div className="form-grid">
        {fields.filter(([, v]) => v).map(([label, val]) => (
          <div key={label}>
            <p className="form-label">{label}</p>
            <p style={{ fontSize: '0.88rem' }}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: '760px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            Application {app.applicationNumber}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="flex gap-2 mb-3 items-center">
          <StatusBadge   status={app.status} />
          <CategoryBadge category={app.category} />
          {app.totalMarks !== null && (
            <span style={{ color: 'var(--gold-300)', fontWeight: 700 }}>
              Marks: {app.totalMarks}
            </span>
          )}
          {app.isFlagged && (
            <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
              🚩 {app.flagReason}
            </span>
          )}
        </div>

        <Section title="Child Details" fields={[
          ["Name (English)",       app.childNameEnglish],
          ["Name (Sinhala)",       app.childNameSinhala],
          ["Date of Birth",        app.dateOfBirth],
          ["Birth Cert No.",       app.birthCertNumber],
          ["Birth Cert Division",  app.birthCertDivision],
          ["Birth Cert District",  app.birthCertDistrict],
        ]} />

        <Section title="Parent / Guardian" fields={[
          ["Name (English)",   app.applicantNameEnglish],
          ["Name (Sinhala)",   app.applicantNameSinhala],
          ["Relationship",     app.applicantRelationship],
          ["NIC",              app.applicantNic],
          ["Contact",          app.contactNumber],
          ["Phone",            app.phoneNumber],
        ]} />

        <Section title="Address & Location" fields={[
          ["Address",         [app.addressLine1, app.addressLine2, app.addressLine3].filter(Boolean).join(', ')],
          ["Street",          app.street],
          ["Town",            app.town],
          ["District",        app.district],
          ["Distance",        app.distanceFromSchoolKm ? `${app.distanceFromSchoolKm} km` : null],
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

        {app.visitComment && (
          <div style={{
            background: 'rgba(212,160,23,.06)',
            border: '1px solid rgba(212,160,23,.2)',
            borderRadius: 'var(--r-md)',
            padding: '0.75rem 1rem',
            marginTop: '0.5rem',
          }}>
            <p className="form-label">Judge's Comment</p>
            <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>{app.visitComment}</p>
          </div>
        )}

        <button className="btn btn-ghost btn-full mt-3" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ── Ranked List Panel ─────────────────────────────────────────
function RankedPanel() {
  const [ranked,  setRanked]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    judgeApi.getRanked()
      .then(r => setRanked(r.data))
      .catch(() => toast.error('Failed to load ranked list'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <>
      <SectionHead icon="🏆" title="Ranked List">
        <p className="text-muted text-sm">
          Sorted by marks (high → low), then distance (near → far)
        </p>
      </SectionHead>

      {ranked.length === 0 ? (
        <Empty
          icon="🏆"
          message="No scored applications yet"
          sub="Enter marks in the Applications panel to see the ranking."
        />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>App No.</th>
                  <th>Child Name</th>
                  <th>Date of Birth</th>
                  <th>District</th>
                  <th>Distance</th>
                  <th>Marks</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((app, idx) => (
                  <tr key={app.id}>
                    <td>
                      <span style={{
                        fontFamily: 'Cinzel',
                        fontWeight: 700,
                        color: idx === 0 ? '#ffd700'
                             : idx === 1 ? '#c0c0c0'
                             : idx === 2 ? '#cd7f32'
                             : 'var(--text-secondary)',
                        fontSize: idx < 3 ? '1.1rem' : '0.9rem',
                      }}>
                        {idx < 3 ? ['🥇','🥈','🥉'][idx] : `#${idx + 1}`}
                      </span>
                    </td>
                    <td style={{ color: 'var(--gold-300)', fontWeight: 600 }}>
                      {app.applicationNumber}
                    </td>
                    <td>{app.childNameEnglish}</td>
                    <td style={{ fontSize: '0.82rem' }}>{app.dateOfBirth}</td>
                    <td style={{ fontSize: '0.82rem' }}>{app.district}</td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {app.distanceFromSchoolKm} km
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'Cinzel',
                        fontWeight: 700,
                        color: app.totalMarks >= 80 ? 'var(--success)'
                             : app.totalMarks >= 60 ? 'var(--gold-300)'
                             : 'var(--danger)',
                      }}>
                        {app.totalMarks ?? '—'}
                      </span>
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}