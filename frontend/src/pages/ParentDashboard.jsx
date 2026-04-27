// FILE: frontend/src/pages/ParentDashboard.jsx
// Matches Image 3:
// - Light blue/white theme
// - Top bar: "Parent" title
// - Left sidebar with icons
// - Parent name card top-left with settings icon
// - Application deadline notice top-right
// - "Name of the child" accordion dropdowns
// - Category rows (Chief Occupant, Old Girl, Sister Category) each with "Fill application" button
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { parentApi } from '../services/api';

// Category display names
const CAT_LABELS = {
  CO:  'Chief Occupant',
  SIS: 'Siblings',
  OG:  'Old Girls / Old Boys',
  EDU: 'Educational',
  ED:  'Educational',
  TR:  'Transfer',
  AB:  'Abroad / Other',
};

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();

  const [slots,        setSlots]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [expanded,     setExpanded]     = useState(null);   // which slot accordion is open
  const [activeSection, setActiveSection] = useState('applications');

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await parentApi.getMySlots();
      setSlots(data);
    } catch {
      toast.error('Could not load your applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{
      width:      '100vw',
      minHeight:  '100vh',
      background: '#f0f2fa',
      fontFamily: "'DM Sans', sans-serif",
      display:    'flex',
      flexDirection: 'column',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        background:    'linear-gradient(135deg, #c5cef0, #d8dff5)',
        padding:       '18px 32px',
        borderRadius:  '0 0 20px 20px',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
        position:      'relative',
        boxShadow:     '0 2px 12px rgba(100,120,200,0.15)',
        marginBottom:  '8px',
      }}>
        <h1 style={{
          margin: 0, fontSize: '1.3rem',
          color: '#2a3a6a', fontWeight: 600, letterSpacing: '0.5px',
        }}>
          Parent
        </h1>
        <button
          onClick={handleLogout}
          style={{
            position:   'absolute', right: '24px',
            background: 'transparent', border: 'none',
            color: '#6070a0', cursor: 'pointer', fontSize: '0.82rem',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Logout
        </button>
      </div>

      {/* ── Main layout ── */}
      <div style={{ display: 'flex', flex: 1, gap: 0 }}>

        {/* ── Left sidebar ── */}
        <div style={{
          width:      '64px',
          background: 'linear-gradient(180deg, #dde3f5, #ccd3ed)',
          borderRadius: '0 20px 20px 0',
          display:    'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding:    '20px 0',
          gap:        '8px',
          boxShadow:  '2px 0 8px rgba(100,120,200,0.08)',
          minHeight:  'calc(100vh - 80px)',
        }}>
          {/* Hamburger */}
          <SidebarBtn title="Menu" active={false}
            onClick={() => {}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </SidebarBtn>

          {/* Profile */}
          <SidebarBtn title="Profile" active={activeSection === 'profile'}
            onClick={() => setActiveSection('profile')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </SidebarBtn>

          {/* Applications */}
          <SidebarBtn title="Applications" active={activeSection === 'applications'}
            onClick={() => setActiveSection('applications')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="13" y2="17"/>
            </svg>
          </SidebarBtn>

          {/* Documents */}
          <SidebarBtn title="Documents" active={activeSection === 'documents'}
            onClick={() => setActiveSection('documents')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </SidebarBtn>

          {/* Checklist */}
          <SidebarBtn title="Status" active={activeSection === 'status'}
            onClick={() => setActiveSection('status')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </SidebarBtn>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, padding: '24px 32px' }}>

          {/* Parent name card + deadline notice */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>

            {/* Parent info card */}
            <div style={{
              background:   'white',
              borderRadius: '14px',
              padding:      '14px 20px',
              display:      'flex',
              alignItems:   'center',
              gap:          '14px',
              boxShadow:    '0 2px 10px rgba(100,120,200,0.1)',
              minWidth:     '280px',
            }}>
              {/* Avatar */}
              <div style={{
                width:         '42px', height: '42px',
                borderRadius:  '10px',
                background:    'linear-gradient(135deg, #8090d0, #6070b0)',
                display:       'flex', alignItems: 'center', justifyContent: 'center',
                color:         'white', fontWeight: 700, fontSize: '1.1rem',
              }}>
                {user?.name?.charAt(0) || 'P'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, color: '#2a3a6a', fontSize: '0.95rem' }}>
                  {user?.name || 'Parent'}
                </p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#8090b0' }}>
                  Applicant details
                </p>
              </div>
              {/* Settings icons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: '#f0f2fa', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#8090b0" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                  </svg>
                </div>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: '#f0f2fa', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#8090b0" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Application deadline notice */}
            <div style={{
              background:   '#fce8e8',
              border:       '1px solid #f0b0b0',
              borderRadius: '12px',
              padding:      '12px 18px',
              maxWidth:     '280px',
              display:      'flex',
              gap:          '10px',
              alignItems:   'flex-start',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#c0392b" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#c0392b', fontSize: '0.85rem' }}>
                  Application deadline .....
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#a04040' }}>
                  Please make sure to submit the application/s on or before the deadline.
                </p>
              </div>
            </div>
          </div>

          {/* Applications section */}
          {activeSection === 'applications' && (
            <ApplicationsList
              slots={slots}
              loading={loading}
              expanded={expanded}
              setExpanded={setExpanded}
              onRefresh={fetchSlots}
              navigate={navigate}
            />
          )}

        </div>
      </div>
    </div>
  );
}

// ── Applications List ─────────────────────────────────────────
function ApplicationsList({ slots, loading, expanded, setExpanded, onRefresh, navigate }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#8090b0' }}>
        Loading your applications...
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div style={{
        background: 'white', borderRadius: '16px',
        padding: '3rem 2rem', textAlign: 'center',
        boxShadow: '0 2px 10px rgba(100,120,200,0.1)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
        <h3 style={{ color: '#2a3a6a', marginBottom: '0.5rem' }}>
          No application slots assigned yet
        </h3>
        <p style={{ color: '#8090b0', fontSize: '0.9rem' }}>
          Please contact the Document Controller to assign your application categories.
        </p>
      </div>
    );
  }

  // API returns: [{ childId, childName, slots: [{ slotId, category, filled, ... }] }]
  // One accordion per child, showing child's name. Inside: one row per category slot.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {slots.map(child => (
        <ChildAccordion
          key={child.childId}
          child={child}
          isExpanded={expanded === child.childId}
          onToggle={() => setExpanded(expanded === child.childId ? null : child.childId)}
          navigate={navigate}
        />
      ))}
    </div>
  );
}

// ── Child Accordion Row ───────────────────────────────────────
// One accordion per child. Header shows the child's real name.
// Expanded body shows one row per category slot.
function ChildAccordion({ child, isExpanded, onToggle, navigate }) {
  return (
    <div style={{
      background:   'white',
      borderRadius: '14px',
      overflow:     'hidden',
      boxShadow:    '0 2px 10px rgba(100,120,200,0.08)',
    }}>
      {/* Accordion header — shows child's real name */}
      <button
        onClick={onToggle}
        style={{
          width:      '100%',
          padding:    '18px 24px',
          background: isExpanded
            ? 'linear-gradient(135deg, #d0d8f0, #c5cef0)'
            : 'linear-gradient(135deg, #e8ecf8, #dde3f5)',
          border:     'none',
          cursor:     'pointer',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: "'DM Sans', sans-serif",
          borderRadius: isExpanded ? '14px 14px 0 0' : '14px',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Child avatar initial */}
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #8090d0, #6070b0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
          }}>
            {child.childName?.charAt(0) || '?'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#2a3a6a', display: 'block' }}>
              {child.childName}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#8090b0' }}>
              {child.slots?.length || 0} application slot{child.slots?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#6070a0" strokeWidth="2.5" strokeLinecap="round"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Expanded: one row per category slot */}
      {isExpanded && (
        <div>
          {child.slots?.map((slot, idx) => {
            const catLabel = CAT_LABELS[slot.category] || slot.category;
            return (
              <div
                key={slot.slotId}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding:    '14px 24px',
                  background: idx % 2 === 0
                    ? 'linear-gradient(135deg, #d8deef, #cdd5ea)'
                    : 'linear-gradient(135deg, #dde3f2, #d2daed)',
                  borderTop:  '1px solid rgba(100,130,200,0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Category badge */}
                  <span style={{
                    background: '#4a5fa0', color: 'white',
                    borderRadius: '6px', padding: '2px 8px',
                    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px',
                  }}>
                    {slot.category}
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#2a3a6a' }}>
                    {catLabel}
                  </span>
                </div>

                {slot.filled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '0.75rem', color: '#2e7d32',
                      background: 'rgba(46,125,50,0.1)',
                      border: '1px solid rgba(46,125,50,0.3)',
                      borderRadius: '20px', padding: '3px 10px', fontWeight: 600,
                    }}>
                      ✅ Submitted — {slot.applicationNumber}
                    </span>
                    {slot.status && (
                      <span style={{
                        fontSize: '0.72rem', color: '#5060a0',
                        background: 'rgba(80,96,160,0.1)',
                        borderRadius: '20px', padding: '2px 8px',
                      }}>
                        {slot.status}
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(`/apply/${slot.slotId}`, {
                      state: { childId: child.childId, childName: child.childName, category: slot.category }
                    })}
                    style={{
                      background:   'linear-gradient(135deg, #e8ecf8, #d8def5)',
                      border:       '1px solid rgba(100,130,200,0.3)',
                      borderRadius: '20px',
                      padding:      '6px 18px',
                      fontSize:     '0.8rem',
                      fontWeight:   600,
                      color:        '#3050a0',
                      cursor:       'pointer',
                      fontFamily:   "'DM Sans', sans-serif",
                      transition:   'all 0.2s',
                      whiteSpace:   'nowrap',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #d0d8f5, #c0ccf0)';
                      e.currentTarget.style.transform  = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #e8ecf8, #d8def5)';
                      e.currentTarget.style.transform  = 'translateY(0)';
                    }}
                  >
                    Fill application
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Sidebar Button ────────────────────────────────────────────
function SidebarBtn({ children, active, onClick, title }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width:        '44px', height: '44px',
        borderRadius: '12px',
        border:       'none',
        background:   active
                      ? 'linear-gradient(135deg, #7080c0, #5060a0)'
                      : 'transparent',
        color:        active ? 'white' : '#6070a0',
        cursor:       'pointer',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        transition:   'all 0.2s',
      }}
    >
      {children}
    </button>
  );
}