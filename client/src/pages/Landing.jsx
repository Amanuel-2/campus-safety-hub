import { Link } from 'react-router-dom';
import logoImage from '../assets/photo_2026-01-02_20-42-55.png';

const Landing = () => {
  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="landing-header">
          <div className="landing-logo-container">
            <img src={logoImage} alt="Campus Safety Hub Logo" className="landing-logo" />
            <div className="landing-title-group">
              <h1 className="landing-title">Campus Safety Hub</h1>
              <p className="landing-subtitle">Ambo University</p>
            </div>
          </div>
        </div>

        <div className="landing-content">
          <h2 className="landing-question">Who are you?</h2>
          
          <div className="role-selection-grid">
            <Link to="/user/login" className="role-card user-card">
              <div className="role-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 className="role-title">User</h3>
              <p className="role-description">Student or Staff</p>
              <p className="role-subdescription">Report incidents, view announcements, trigger emergency alerts</p>
            </Link>

            <Link to="/police/login" className="role-card police-card">
              <div className="role-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  <path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="role-title">Police</h3>
              <p className="role-description">Campus Police</p>
              <p className="role-subdescription">Respond to emergencies, manage incidents, monitor campus safety</p>
            </Link>

            <Link to="/admin/login" className="role-card admin-card">
              <div className="role-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3 className="role-title">Admin</h3>
              <p className="role-description">System Administrator</p>
              <p className="role-subdescription">Manage accounts, post announcements, view system logs</p>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .landing-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--bg-primary);
        }

        .landing-container {
          width: 100%;
          max-width: 1200px;
          text-align: center;
        }

        .landing-header {
          margin-bottom: 4rem;
        }

        .landing-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .landing-logo {
          width: 64px;
          height: 64px;
          object-fit: contain;
        }

        .landing-title-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .landing-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.2;
        }

        .landing-subtitle {
          font-size: 1.125rem;
          color: var(--text-muted);
          margin: 0.25rem 0 0 0;
        }

        .landing-content {
          margin-top: 3rem;
        }

        .landing-question {
          font-size: 2rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 3rem;
        }

        .role-selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .role-card {
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2.5rem 2rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .role-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          border-color: var(--accent-primary);
        }

        .user-card:hover {
          border-color: var(--accent-primary);
        }

        .police-card:hover {
          border-color: #ff4757;
        }

        .admin-card:hover {
          border-color: var(--accent-secondary);
        }

        .role-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin-bottom: 1.5rem;
          background: var(--bg-secondary);
          color: var(--accent-primary);
        }

        .user-card .role-icon {
          background: rgba(37, 99, 235, 0.1);
          color: var(--accent-primary);
        }

        .police-card .role-icon {
          background: rgba(255, 71, 87, 0.1);
          color: #ff4757;
        }

        .admin-card .role-icon {
          background: rgba(78, 205, 196, 0.1);
          color: var(--accent-secondary);
        }

        .role-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .role-description {
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin: 0 0 0.75rem 0;
        }

        .role-subdescription {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .landing-title {
            font-size: 2rem;
          }

          .landing-question {
            font-size: 1.5rem;
          }

          .role-selection-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .landing-logo-container {
            flex-direction: column;
            gap: 0.5rem;
          }

          .landing-title-group {
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;

