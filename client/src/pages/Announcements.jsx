import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAnnouncements();
  }, [filter]);

  const fetchAnnouncements = async () => {
    try {
      const params = filter !== 'all' ? { category: filter } : {};
      const response = await axios.get(`${API_URL}/announcements`, { params });
      setAnnouncements(response.data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoading(false);
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="loading-container" style={{ minHeight: '80vh' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">Stay informed with the latest campus safety updates and important notices</p>
        </div>

        <div className="filter-section">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'safety_alert' ? 'active' : ''}`}
            onClick={() => setFilter('safety_alert')}
          >
            Safety Alerts
          </button>
          <button
            className={`filter-btn ${filter === 'awareness' ? 'active' : ''}`}
            onClick={() => setFilter('awareness')}
          >
            Awareness
          </button>
          <button
            className={`filter-btn ${filter === 'rule_update' ? 'active' : ''}`}
            onClick={() => setFilter('rule_update')}
          >
            Rule Updates
          </button>
          <button
            className={`filter-btn ${filter === 'general' ? 'active' : ''}`}
            onClick={() => setFilter('general')}
          >
            General
          </button>
        </div>

        {announcements.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <h3>No announcements found</h3>
            <p>Check back later for updates</p>
          </div>
        ) : (
          <div className="announcements-grid">
            {announcements.map((announcement) => (
              <div key={announcement._id} className="announcement-card">
                <div className="announcement-header">
                  <span
                    className="category-badge"
                    style={{ background: getCategoryColor(announcement.category) }}
                  >
                    {getCategoryLabel(announcement.category)}
                  </span>
                  <span className="announcement-date">{formatDate(announcement.createdAt)}</span>
                </div>
                <h3 className="announcement-title">{announcement.title}</h3>
                <div className="announcement-content">
                  {announcement.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                {announcement.imageUrl && (
                  <div className="announcement-image">
                    <img src={announcement.imageUrl} alt={announcement.title} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .page-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        
        .page-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary);
        }
        
        .filter-section {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .filter-btn {
          padding: 0.625rem 1.25rem;
          border-radius: var(--radius-full);
          font-weight: 500;
          font-size: 0.875rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .filter-btn:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }
        
        .filter-btn.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }
        
        .announcements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .announcement-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.3s ease;
        }
        
        .announcement-card:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .announcement-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        
        .category-badge {
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .announcement-date {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
          white-space: nowrap;
        }
        
        .announcement-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        
        .announcement-content {
          color: var(--text-secondary);
          line-height: 1.7;
          flex: 1;
        }
        
        .announcement-content p {
          margin: 0 0 1rem 0;
        }
        
        .announcement-content p:last-child {
          margin-bottom: 0;
        }
        
        .announcement-image {
          width: 100%;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border-color);
          margin-top: 0.5rem;
        }
        
        .announcement-image img {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          color: var(--text-muted);
        }
        
        .empty-state svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .announcements-grid {
            grid-template-columns: 1fr;
          }
          
          .page-title {
            font-size: 2rem;
          }
          
          .announcement-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default Announcements;

