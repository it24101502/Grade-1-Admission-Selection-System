// FILE: frontend/src/pages/LandingPage.jsx
import { useNavigate } from 'react-router-dom';

// Note: redirect logic moved to App.jsx HomeRedirect component
// This component only renders the landing UI
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      {/* Hero */}
      <div className="landing-hero">
        <h1>Grade 1 Admission System</h1>
        <div className="gold-bar" style={{ maxWidth: '300px', margin: '1rem auto' }} />
        <p>
          Official online admissions portal for the Primary Section.
          Select your portal below to proceed.
        </p>
      </div>

      {/* Portal Cards */}
      <div className="portal-grid">

        <div className="portal-card" onClick={() => navigate('/login?role=parent')}>
          <div className="portal-icon">👨‍👩‍👧</div>
          <h3>Parent Portal</h3>
          <p>Fill and submit your child's application form online.</p>
        </div>

        <div className="portal-card" onClick={() => navigate('/login?role=dc')}>
          <div className="portal-icon">📋</div>
          <h3>Document Controller</h3>
          <p>Create parent login accounts and manage form submissions.</p>
        </div>

        <div className="portal-card" onClick={() => navigate('/login?role=judge')}>
          <div className="portal-icon">⚖️</div>
          <h3>Judge Panel</h3>
          <p>Review assigned applications and enter marks.</p>
        </div>

        <div className="portal-card" onClick={() => navigate('/login?role=admin')}>
          <div className="portal-icon">🔐</div>
          <h3>Admin Portal</h3>
          <p>Full system access — manage users and publish results.</p>
        </div>

      </div>

      <p className="text-muted text-sm mt-4">
        Grade 1 Admission System · Primary Section
      </p>
    </div>
  );
}