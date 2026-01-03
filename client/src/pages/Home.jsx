import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EmergencyButton from '../components/EmergencyButton';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/user/login');
      return;
    }
    fetchLatestAnnouncements();
  }, [navigate]);

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

  return (
    <div className="app-container">
      <Navbar />
      <main className="home-page">
        <div className="emergency-section">
          <EmergencyButton variant="hero" />
          <p className="safety-message">
            This system connects you directly with campus security in case of emergency.
          </p>
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
        
        <div className="quick-links-section">
          <div className="quick-links">
            <Link to="/report" className="quick-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Report Incident
            </Link>
            <Link to="/announcements" className="quick-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Announcements
            </Link>
            <Link to="/map" className="quick-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" y1="2" x2="8" y2="18"/>
                <line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
              Map View
            </Link>
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
        
        .emergency-section {
          padding: 3rem 2rem 2rem;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
        }
        
        .safety-message {
          margin-top: 2rem;
          font-size: 0.875rem;
          color: var(--text-muted);
          text-align: center;
          max-width: 500px;
          line-height: 1.6;
        }
        
        .home-announcements {
          padding: 3rem 2rem;
          background: var(--bg-secondary);
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
          transition: all 0.2s ease;
        }
        
        .announcement-preview-card:hover {
          border-color: var(--border-color);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
        
        .quick-links-section {
          padding: 2rem;
          background: var(--bg-primary);
          border-top: 1px solid var(--border-color);
        }
        
        .quick-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .quick-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          min-height: 48px;
        }
        
        .quick-link:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
          background: var(--bg-secondary);
        }
        
        .quick-link svg {
          flex-shrink: 0;
        }
        
        .home-footer {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
          font-size: 0.875rem;
          border-top: 1px solid var(--border-color);
        }
        
        @media (max-width: 640px) {
          .emergency-section {
            padding: 2rem 1rem 1.5rem;
            min-height: 40vh;
          }
          
          .safety-message {
            font-size: 0.8125rem;
            margin-top: 1.5rem;
          }
          
          .announcements-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .announcements-preview-grid {
            grid-template-columns: 1fr;
          }
          
          .quick-links {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .quick-link {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;

