import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    fetchLatestAnnouncements();
  }, []);

  const fetchLatestAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_URL}/announcements`, {
        params: { limit: 5 }
      });
      setAnnouncements(response.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      safety_alert: 'Safety Alert',
      awareness: 'Awareness',
      rule_update: 'Rule Update',
      general: 'General',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      safety_alert: 'var(--accent-danger)',
      awareness: 'var(--accent-secondary)',
      rule_update: 'var(--accent-warning)',
      general: 'var(--accent-primary)',
    };
    return colors[category] || colors.general;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };
  const features = [
    {
      to: '/report',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      title: 'Report Incident',
      description: 'Report safety concerns, suspicious activities, or emergencies on campus',
      color: 'var(--accent-danger)',
      gradient: 'linear-gradient(135deg, rgba(255, 71, 87, 0.15) 0%, rgba(255, 107, 53, 0.15) 100%)',
    },
    {
      to: '/map',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
      ),
      title: 'Campus Map',
      description: 'View incidents and lost items on an interactive campus map',
      color: 'var(--accent-warning)',
      gradient: 'linear-gradient(135deg, rgba(255, 217, 61, 0.15) 0%, rgba(255, 107, 53, 0.15) 100%)',
    },
    {
      to: '/admin',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      ),
      title: 'Admin Dashboard',
      description: 'Manage reports, update statuses, and oversee campus safety',
      color: 'var(--accent-primary)',
      gradient: 'linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(255, 140, 90, 0.15) 100%)',
    },
  ];

  return (
    <div className="app-container">
      <Navbar />
      <main className="home-page">
        <div className="home-hero">
          <div className="hero-bg-pattern" />
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Campus Safety
            </div>
            <h1 className="hero-title">
              Your Safety,<br />
              <span>Our Priority</span>
            </h1>
            <p className="hero-subtitle">
              A unified platform for reporting incidents and keeping our campus community safe and connected.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value">24/7</span>
                <span className="stat-label">Active Monitoring</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-value">&lt;5min</span>
                <span className="stat-label">Response Time</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-value">100%</span>
                <span className="stat-label">Anonymous Reports</span>
              </div>
            </div>
          </div>
        </div>

        {!loadingAnnouncements && announcements.length > 0 && (
          <div className="home-announcements">
            <div className="announcements-header">
              <h2 className="announcements-title">Latest Announcements</h2>
              <Link to="/announcements" className="announcements-link">
                View all announcements
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
            <div className="announcements-preview-grid">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="announcement-preview-card">
                  <div className="announcement-preview-header">
                    <span
                      className="announcement-preview-badge"
                      style={{ background: getCategoryColor(announcement.category) }}
                    >
                      {getCategoryLabel(announcement.category)}
                    </span>
                    <span className="announcement-preview-date">{formatDate(announcement.createdAt)}</span>
                  </div>
                  <h3 className="announcement-preview-title">{announcement.title}</h3>
                  <p className="announcement-preview-content">
                    {announcement.content.length > 100
                      ? announcement.content.substring(0, 100) + '...'
                      : announcement.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="home-features">
          <div className="features-grid">
            {features.map((feature, index) => (
              <Link
                key={feature.to}
                to={feature.to}
                className="feature-card"
                style={{
                  '--feature-color': feature.color,
                  '--feature-gradient': feature.gradient,
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <footer className="home-footer">
          <p>&copy; 2026 Campus Safety Hub. Keeping our community safe.</p>
        </footer>
      </main>
      
      <style>{`
        .home-page {
          min-height: calc(100vh - 60px);
          display: flex;
          flex-direction: column;
        }
        
        .home-hero {
          position: relative;
          padding: 4rem 2rem 5rem;
          background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
          overflow: hidden;
        }
        
        .hero-bg-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(78, 205, 196, 0.08) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.2);
          border-radius: var(--radius-full);
          color: var(--accent-primary);
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }
        
        .hero-title {
          font-size: 4rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }
        
        .hero-title span {
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto 2.5rem;
          line-height: 1.7;
        }
        
        .hero-stats {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }
        
        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .stat-value {
          font-family: var(--font-mono);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent-primary);
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        
        .stat-divider {
          width: 1px;
          height: 40px;
          background: var(--border-color);
        }
        
        .home-announcements {
          padding: 3rem 2rem;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-color);
        }
        
        .announcements-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .announcements-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        
        .announcements-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--accent-primary);
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .announcements-link:hover {
          gap: 0.75rem;
          color: var(--accent-secondary);
        }
        
        .announcements-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .announcement-preview-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: all 0.3s ease;
        }
        
        .announcement-preview-card:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .announcement-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
        }
        
        .announcement-preview-badge {
          padding: 0.25rem 0.625rem;
          border-radius: var(--radius-full);
          font-size: 0.625rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .announcement-preview-date {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
          white-space: nowrap;
        }
        
        .announcement-preview-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.4;
        }
        
        .announcement-preview-content {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }
        
        .home-features {
          flex: 1;
          padding: 3rem 2rem;
          background: var(--bg-primary);
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .feature-card {
          position: relative;
          background: var(--feature-gradient);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.3s ease;
          animation: slideUp 0.5s ease-out both;
          overflow: hidden;
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, var(--bg-primary) 100%);
          opacity: 0.5;
          pointer-events: none;
        }
        
        .feature-card:hover {
          transform: translateY(-8px);
          border-color: var(--feature-color);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .feature-card:hover .feature-arrow {
          transform: translateX(5px);
          opacity: 1;
        }
        
        .feature-icon {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--feature-color);
          position: relative;
          z-index: 1;
        }
        
        .feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          position: relative;
          z-index: 1;
        }
        
        .feature-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          flex: 1;
          position: relative;
          z-index: 1;
        }
        
        .feature-arrow {
          display: flex;
          align-items: center;
          color: var(--feature-color);
          opacity: 0.6;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }
        
        .home-footer {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
          font-size: 0.875rem;
          border-top: 1px solid var(--border-color);
        }
        
        @media (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .hero-title {
            font-size: 3rem;
          }
        }
        
        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-stats {
            gap: 1.5rem;
          }
          
          .stat-divider {
            display: none;
          }
          
          .announcements-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .announcements-preview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;

