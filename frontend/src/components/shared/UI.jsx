// ================================================================
//  FILE: frontend/src/components/shared/UI.jsx
//
//  Reusable UI components used by all pages.
//  Import what you need: import { Header, Sidebar, Badge } from '...'
// ================================================================
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ── HEADER ────────────────────────────────────────────────────
export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show the right badge based on role
  const roleBadgeClass = {
    APPLICANT:           'badge badge-applicant',
    DOCUMENT_CONTROLLER: 'badge badge-dc',
    JUDGE:               'badge badge-judge',
    ADMIN:               'badge badge-admin',
  }[user?.role] || 'badge';

  const roleLabel = {
    APPLICANT:           '👨‍👩‍👧 Parent / Applicant',
    DOCUMENT_CONTROLLER: '📋 Document Controller',
    JUDGE:               `⚖️ Judge — ${user?.category || ''}`,
    ADMIN:               '🔐 Administrator',
  }[user?.role] || user?.role;

  return (
    <header className="site-header">
      {/* Brand */}
      <div className="header-brand">
        <span className="brand-crest">🏫</span>
        <div className="brand-text">
          <h1>Grade 1 Admission System</h1>
          <p>Primary Section — Academic Admissions Portal</p>
        </div>
      </div>

      {/* Right side */}
      <div className="header-right">
        {user ? (
          <>
            <span className={roleBadgeClass}>{roleLabel}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {user.name}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            🏠 Home
          </button>
        )}
      </div>
    </header>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────
export function Sidebar({ sections, activeId, onSelect }) {
  return (
    <aside className="sidebar">
      {sections.map((sec, si) => (
        <div key={si}>
          <div className="sidebar-section">{sec.label}</div>
          {sec.items.map((item) => (
            <div
              key={item.id}
              className={`sidebar-item ${activeId === item.id ? 'active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}

// ── STATUS BADGE ──────────────────────────────────────────────
export function StatusBadge({ status }) {
  const config = {
    FORM_PENDING:  { label: '⏳ Form Pending',   cls: 's-form_pending'  },
    SUBMITTED:     { label: '📨 Submitted',       cls: 's-submitted'     },
    UNDER_REVIEW:  { label: '🔍 Under Review',    cls: 's-under_review'  },
    SCORED:        { label: '✏️ Scored',          cls: 's-scored'        },
    FLAGGED:       { label: '🚩 Flagged',         cls: 's-flagged'       },
    SELECTED:      { label: '✅ Selected',        cls: 's-selected'      },
    REJECTED:      { label: '❌ Rejected',        cls: 's-rejected'      },
  };
  const { label, cls } = config[status] || { label: status, cls: '' };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ── CATEGORY BADGE ────────────────────────────────────────────
export function CategoryBadge({ category }) {
  const config = {
    CO:  { label: 'CO',  cls: 'cat-co'  },
    SIS: { label: 'SIS', cls: 'cat-sis' },
    OG:  { label: 'OG',  cls: 'cat-og'  },
    ED:  { label: 'ED',  cls: 'cat-ed'  },
    TR:  { label: 'TR',  cls: 'cat-tr'  },
    AB:  { label: 'AB',  cls: 'cat-ab'  },
  };
  const { label, cls } = config[category] || { label: category, cls: '' };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ── STAT CARD ─────────────────────────────────────────────────
export function StatCard({ icon, value, label, color }) {
  return (
    <div className="stat-card" data-icon={icon} style={color ? { borderColor: color } : {}}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value" style={color ? { color } : {}}>{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── LOADING SPINNER ───────────────────────────────────────────
export function Spinner({ message = 'Loading...' }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
      <div style={{
        display: 'inline-block',
        fontSize: '2.5rem',
        animation: 'spin 1.2s linear infinite'
      }}>⚙️</div>
      <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────
export function Empty({ icon = '📭', message = 'No data found', sub = '' }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{icon}</div>
      <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{message}</p>
      {sub && <p style={{ fontSize: '0.82rem', marginTop: '0.4rem' }}>{sub}</p>}
    </div>
  );
}

// ── SECTION HEADING ───────────────────────────────────────────
export function SectionHead({ icon, title, children }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="section-heading">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
}