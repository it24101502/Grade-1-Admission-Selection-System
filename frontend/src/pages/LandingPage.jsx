// FILE: frontend/src/pages/LandingPage.jsx
// 4 portal buttons — each silently logs in with real backend credentials.
// No manual login needed. Real JWT tokens are used so all API calls work.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ROLE_ROUTES = {
  PARENT:              '/dashboard',
  DOCUMENT_CONTROLLER: '/dc/dashboard',
  JUDGE:               '/judge/dashboard',
  ADMIN:               '/admin/dashboard',
};

function routeForRole(role) {
  if (role == null || role === '') return '/';
  const key = String(role).toUpperCase();
  return ROLE_ROUTES[key] || '/';
}

const PORTALS = [
  { role:'PARENT',              label:'Parent Portal',        icon:'👨‍👩‍👧', desc:'Fill & submit child applications',       color:'#3a5fbf' },
  { role:'DOCUMENT_CONTROLLER', label:'Document Controller',  icon:'📋',     desc:'Manage parents & assign categories',    color:'#b8860b' },
  { role:'JUDGE',               label:'Judge Panel',          icon:'⚖️',     desc:'Review applications & enter marks',     color:'#2e7d4a' },
  { role:'ADMIN',               label:'Admin Portal',         icon:'🔐',     desc:'Publish results & manage system',       color:'#7b3fa0' },
];

export default function LandingPage() {
  const navigate          = useNavigate();
  const { user, loginAs } = useAuth();
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    if (user?.role != null && routeForRole(user.role) !== '/') {
      navigate(routeForRole(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handlePortalClick = async (portal) => {
    if (loading) return;
    setLoading(portal.role);
    try {
      await loginAs(portal.role);
      navigate(routeForRole(portal.role), { replace: true });
    } catch (err) {
      if (!err.response) {
        toast.error('Cannot connect to server. Is the backend running on port 8080?');
      } else if (err.response?.status === 401) {
        toast.error('Default credentials incorrect. Check DataSeeder in the backend.');
      } else {
        toast.error('Login failed: ' + (err.response?.data?.error || err.message));
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ width:'100vw', height:'100vh', position:'relative', overflow:'hidden', fontFamily:"'DM Sans', sans-serif" }}>

      {/* Background SVG */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:0 }}
        viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="bg1" cx="20%" cy="20%" r="65%">
            <stop offset="0%" stopColor="#162a6e"/><stop offset="100%" stopColor="#040c28"/>
          </radialGradient>
          <radialGradient id="bg2" cx="75%" cy="80%" r="55%">
            <stop offset="0%" stopColor="#0d2060" stopOpacity="0.7"/><stop offset="100%" stopColor="#020814" stopOpacity="0"/>
          </radialGradient>
          <filter id="sb"><feGaussianBlur stdDeviation="20"/></filter>
          <filter id="gw"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id="ga" x1="0%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#A07010" stopOpacity="0.9"/><stop offset="50%" stopColor="#D4A017"/>
            <stop offset="75%" stopColor="#F5C842"/><stop offset="100%" stopColor="#8B6010" stopOpacity="0.7"/>
          </linearGradient>
          <linearGradient id="gb" x1="10%" y1="100%" x2="90%" y2="0%">
            <stop offset="0%" stopColor="#7a5000" stopOpacity="0.5"/><stop offset="50%" stopColor="#C49010" stopOpacity="0.85"/>
            <stop offset="100%" stopColor="#F0C040" stopOpacity="0.6"/>
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#bg1)"/>
        <rect width="1440" height="900" fill="url(#bg2)"/>
        <circle cx="200" cy="300" r="140" fill="#1a3a80" opacity="0.35" filter="url(#sb)"/>
        <circle cx="950" cy="520" r="110" fill="#2050a0" opacity="0.20" filter="url(#sb)"/>
        <circle cx="700" cy="700" r="70"  fill="#C8900A" opacity="0.12" filter="url(#sb)"/>
        <path d="M -80 -30 Q 260 160 140 920" stroke="url(#ga)" strokeWidth="60" fill="none" opacity="0.9"/>
        <path d="M -80 -30 Q 260 160 140 920" stroke="#FEE080" strokeWidth="3" fill="none" opacity="0.55" filter="url(#gw)"/>
        <path d="M 0 400 Q 550 180 850 720" stroke="rgba(180,200,255,0.28)" strokeWidth="1.5" fill="none"/>
        <path d="M 0 460 Q 520 220 800 780" stroke="rgba(180,200,255,0.18)" strokeWidth="1"   fill="none"/>
        <path d="M 0 830 Q 460 690 860 770 Q 1180 840 1440 710 L 1440 900 L 0 900 Z" fill="url(#gb)" opacity="0.75"/>
        <path d="M 0 830 Q 460 690 860 770 Q 1180 840 1440 710" stroke="#FAD96A" strokeWidth="2.5" fill="none" opacity="0.85"/>
        {[[270,480,9],[274,485,13],[266,477,6],[640,680,10],[644,685,14],[636,676,7]].map(([x,y,s],i)=>(
          <g key={i}><line x1={x-s} y1={y} x2={x+s} y2={y} stroke="#FAD96A" strokeWidth="1.8" opacity="0.9"/>
          <line x1={x} y1={y-s} x2={x} y2={y+s} stroke="#FAD96A" strokeWidth="1.8" opacity="0.9"/></g>
        ))}
        {[[420,75],[620,155],[880,105],[1080,195],[1290,340],[980,65],[780,215],[1180,125]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.8" fill="white" opacity="0.35"/>
        ))}
      </svg>

      {/* Content */}
      <div style={{ position:'relative', zIndex:10, width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'3rem' }}>

        {/* Title */}
        <div style={{ textAlign:'center' }}>
          <h1 style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:'clamp(3rem,6vw,5.5rem)', color:'#D4A017', margin:0, lineHeight:1, textShadow:'0 4px 30px rgba(212,160,23,0.55)', letterSpacing:'-2px' }}>
            Welcome
          </h1>
          <p style={{ color:'rgba(212,160,23,0.75)', fontSize:'clamp(0.95rem,1.8vw,1.2rem)', marginTop:'0.85rem', lineHeight:1.6 }}>
            Grade 1 Admission &nbsp;·&nbsp; Applications &amp; Submissions
          </p>
        </div>

        {/* 4 Buttons */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.25rem', width:'min(900px,90vw)' }}>
          {PORTALS.map(portal => {
            const isLoading = loading === portal.role;
            return (
              <button key={portal.role} onClick={() => handlePortalClick(portal)}
                disabled={!!loading}
                style={{
                  background:'rgba(8,18,50,0.75)', border:`1.5px solid ${isLoading ? portal.color : 'rgba(212,160,23,0.3)'}`,
                  borderRadius:'18px', padding:'1.75rem 1rem', cursor:loading?'wait':'pointer',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:'0.65rem',
                  transition:'all 0.25s ease', backdropFilter:'blur(12px)', textAlign:'center',
                  fontFamily:"'DM Sans',sans-serif", opacity:loading&&!isLoading?0.6:1,
                  boxShadow: isLoading ? `0 0 24px ${portal.color}55` : 'none',
                }}
                onMouseEnter={e => { if(loading)return; e.currentTarget.style.cssText+=`;background:rgba(18,36,90,0.9);border-color:${portal.color};transform:translateY(-6px);box-shadow:0 16px 40px rgba(0,0,0,0.45),0 0 20px ${portal.color}44`; }}
                onMouseLeave={e => { if(loading)return; e.currentTarget.style.background='rgba(8,18,50,0.75)'; e.currentTarget.style.borderColor='rgba(212,160,23,0.3)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
              >
                {isLoading
                  ? <div style={{ width:'2.2rem', height:'2.2rem', border:'3px solid rgba(255,255,255,0.2)', borderTop:`3px solid ${portal.color}`, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
                  : <span style={{ fontSize:'2.2rem', lineHeight:1 }}>{portal.icon}</span>
                }
                <span style={{ color:'#F5C842', fontWeight:700, fontSize:'0.95rem', lineHeight:1.3 }}>
                  {isLoading ? 'Connecting...' : portal.label}
                </span>
                <span style={{ color:'rgba(200,210,255,0.6)', fontSize:'0.75rem', lineHeight:1.4 }}>
                  {portal.desc}
                </span>
              </button>
            );
          })}
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}