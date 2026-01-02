import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('incidents');
  const [incidents, setIncidents] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    pendingIncidents: 0,
    totalLostItems: 0,
    foundItems: 0,
  });
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
  });

  const fetchData = async () => {
    try {
      const [incidentsRes, lostItemsRes] = await Promise.all([
        axios.get(`${API_URL}/incidents`, getAuthHeaders()),
        axios.get(`${API_URL}/lost-items`, getAuthHeaders()),
      ]);
      
      setIncidents(incidentsRes.data);
      setLostItems(lostItemsRes.data);
      
      setStats({
        totalIncidents: incidentsRes.data.length,
        pendingIncidents: incidentsRes.data.filter(i => i.status === 'pending').length,
        totalLostItems: lostItemsRes.data.length,
        foundItems: lostItemsRes.data.filter(i => i.status === 'found').length,
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/incidents/${id}`, { status }, getAuthHeaders());
      setIncidents(prev =>
        prev.map(i => (i._id === id ? { ...i, status } : i))
      );
    } catch (err) {
      console.error('Failed to update incident:', err);
    }
  };

  const updateLostItemStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/lost-items/${id}`, { status }, getAuthHeaders());
      setLostItems(prev =>
        prev.map(i => (i._id === id ? { ...i, status } : i))
      );
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const deleteIncident = async (id) => {
    if (!confirm('Are you sure you want to delete this incident?')) return;
    try {
      await axios.delete(`${API_URL}/incidents/${id}`, getAuthHeaders());
      setIncidents(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      console.error('Failed to delete incident:', err);
    }
  };

  const deleteLostItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`${API_URL}/lost-items/${id}`, getAuthHeaders());
      setLostItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const getSeverityClass = (severity) => {
    const classes = {
      low: 'badge-resolved',
      medium: 'badge-pending',
      high: 'badge-investigating',
      critical: 'badge-lost',
    };
    return classes[severity] || '';
  };

  const handleIncidentRowClick = (incident) => {
    // Only show images if incident has images
    if (incident.images && incident.images.length > 0) {
      setSelectedIncident(incident);
      setShowImageModal(true);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedIncident(null);
  };

  const incidentStatuses = ['pending', 'investigating', 'resolved'];

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
        <div className="admin-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Manage incidents and lost items</p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon incidents">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalIncidents}</span>
              <span className="stat-label">Total Incidents</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.pendingIncidents}</span>
              <span className="stat-label">Pending Review</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon lost">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalLostItems}</span>
              <span className="stat-label">Lost/Found Items</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon found">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.foundItems}</span>
              <span className="stat-label">Items Returned</span>
            </div>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidents')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            </svg>
            Incidents ({incidents.length})
          </button>
          <button
            className={`tab ${activeTab === 'lostfound' ? 'active' : ''}`}
            onClick={() => setActiveTab('lostfound')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Lost & Found ({lostItems.length})
          </button>
        </div>

        {activeTab === 'incidents' ? (
          <div className="table-container animate-fade-in">
            {incidents.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <h3>No incidents reported</h3>
                <p>Incidents will appear here when reported</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr 
                      key={incident._id}
                      className={incident.images && incident.images.length > 0 ? 'has-images' : ''}
                      onClick={() => handleIncidentRowClick(incident)}
                      style={{ cursor: incident.images && incident.images.length > 0 ? 'pointer' : 'default' }}
                    >
                      <td>
                        <div className="cell-title">
                          {incident.title}
                          {incident.images && incident.images.length > 0 && (
                            <span className="image-badge">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                              </svg>
                              {incident.images.length} photo{incident.images.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="cell-subtitle">{incident.description.slice(0, 50)}...</div>
                      </td>
                      <td>
                        <span className="type-label">{incident.type.replace('_', ' ')}</span>
                      </td>
                      <td>
                        <span className={`badge ${getSeverityClass(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td>
                        <select
                          value={incident.status}
                          onChange={(e) => updateIncidentStatus(incident._id, e.target.value)}
                          className="status-select"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {incidentStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className="date-cell">
                          {new Date(incident.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteIncident(incident._id);
                          }}
                          className="btn btn-danger btn-sm"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="table-container animate-fade-in">
            {lostItems.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <h3>No lost items reported</h3>
                <p>Lost and found items will appear here</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Contact</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lostItems.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="cell-title">{item.title}</div>
                        <div className="cell-subtitle">{item.description.slice(0, 50)}...</div>
                      </td>
                      <td>
                        <span className="type-label">{item.category}</span>
                      </td>
                      <td>
                        <select
                          value={item.status}
                          onChange={(e) => updateLostItemStatus(item._id, e.target.value)}
                          className={`status-select ${item.status}`}
                        >
                          <option value="lost">Lost</option>
                          <option value="found">Found</option>
                          <option value="claimed">Claimed</option>
                        </select>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <span>{item.contactName}</span>
                          <span className="cell-subtitle">{item.contactEmail}</span>
                        </div>
                      </td>
                      <td>
                        <span className="date-cell">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => deleteLostItem(item._id)}
                          className="btn btn-danger btn-sm"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && selectedIncident && selectedIncident.images && selectedIncident.images.length > 0 && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3 className="image-modal-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                Photos - {selectedIncident.title}
              </h3>
              <button onClick={closeImageModal} className="image-modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="image-modal-content">
              <div className="image-grid">
                {selectedIncident.images.map((image, index) => (
                  <div key={index} className="image-item">
                    <img 
                      src={image} 
                      alt={`Photo ${index + 1} of ${selectedIncident.images.length}`}
                      onClick={() => {
                        // Open image in new tab for full size
                        const newWindow = window.open();
                        newWindow.document.write(`<img src="${image}" style="max-width: 100%; height: auto;" />`);
                      }}
                    />
                    <div className="image-number">{index + 1} / {selectedIncident.images.length}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          border-color: var(--accent-primary);
          transform: translateY(-2px);
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
        }
        
        .stat-icon.incidents {
          background: rgba(255, 71, 87, 0.15);
          color: var(--accent-danger);
        }
        
        .stat-icon.pending {
          background: rgba(255, 217, 61, 0.15);
          color: var(--accent-warning);
        }
        
        .stat-icon.lost {
          background: rgba(255, 107, 53, 0.15);
          color: var(--accent-primary);
        }
        
        .stat-icon.found {
          background: rgba(38, 222, 129, 0.15);
          color: var(--accent-success);
        }
        
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        
        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--text-primary);
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        
        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }
        
        .tab:hover {
          border-color: var(--accent-primary);
        }
        
        .tab.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }
        
        .cell-title {
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .image-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.125rem 0.5rem;
          background: rgba(78, 205, 196, 0.15);
          border: 1px solid rgba(78, 205, 196, 0.3);
          border-radius: var(--radius-full);
          color: var(--accent-secondary);
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .image-badge svg {
          width: 12px;
          height: 12px;
        }
        
        tr.has-images:hover {
          background: rgba(78, 205, 196, 0.05);
        }
        
        .cell-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .type-label {
          text-transform: capitalize;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .status-select {
          padding: 0.375rem 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .status-select:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
        
        .status-select.lost {
          border-color: var(--accent-danger);
          color: var(--accent-danger);
        }
        
        .status-select.found,
        .status-select.claimed {
          border-color: var(--accent-success);
          color: var(--accent-success);
        }
        
        .date-cell {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          color: var(--text-muted);
        }
        
        .contact-cell {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        
        .contact-cell span:first-child {
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .empty-state {
          padding: 4rem 2rem;
        }
        
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .admin-header {
            flex-direction: column;
            gap: 1rem;
          }
        }
        
        /* Image Modal Styles */
        .image-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 2rem;
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .image-modal {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .image-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .image-modal-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        
        .image-modal-close {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .image-modal-close:hover {
          background: var(--accent-danger);
          border-color: var(--accent-danger);
          color: white;
        }
        
        .image-modal-content {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }
        
        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .image-item {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .image-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }
        
        .image-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-number {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
          color: white;
          padding: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .image-grid {
            grid-template-columns: 1fr;
          }
          
          .image-modal-overlay {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Admin;

