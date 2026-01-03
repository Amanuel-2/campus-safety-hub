import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EmergencyNotification from '../components/EmergencyNotification';
import { useSocket } from '../context/SocketContext';
import { getLocationName } from '../data/campusLocations';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PoliceDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('emergencies');
  const [incidents, setIncidents] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    pendingIncidents: 0,
    activeEmergencies: 0,
  });
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem('policeToken');
    if (!token) {
      navigate('/police/login');
      return;
    }
    fetchData();
    
    if (location.state?.emergencyAlertId) {
      setActiveTab('emergencies');
    }
  }, [navigate, location]);

  // Listen for real-time emergency alerts
  useEffect(() => {
    if (!socket) return;

    const handleNewEmergency = (alert) => {
      console.log('🚨 New emergency alert received:', alert);
      setCurrentNotification(alert);
      fetchEmergencyAlerts();
    };

    const handleEmergencyUpdate = ({ alertId, status }) => {
      setEmergencyAlerts(prev =>
        prev.map(alert =>
          alert._id === alertId ? { ...alert, status } : alert
        )
      );
      fetchEmergencyAlerts();
    };

    socket.on('new-emergency', handleNewEmergency);
    socket.on('emergency-updated', handleEmergencyUpdate);

    return () => {
      socket.off('new-emergency', handleNewEmergency);
      socket.off('emergency-updated', handleEmergencyUpdate);
    };
  }, [socket]);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('policeToken')}` },
  });

  const fetchEmergencyAlerts = async () => {
    try {
      const res = await axios.get(`${API_URL}/police/emergencies`, getAuthHeaders());
      setEmergencyAlerts(res.data);
      const activeCount = res.data.filter(a => a.status === 'active' || a.status === 'investigating').length;
      setStats(prev => ({ ...prev, activeEmergencies: activeCount }));
    } catch (err) {
      console.error('Failed to fetch emergency alerts:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('policeToken');
        navigate('/police/login');
      }
    }
  };

  const fetchData = async () => {
    try {
      const [incidentsRes, emergenciesRes] = await Promise.all([
        axios.get(`${API_URL}/police/incidents`, getAuthHeaders()),
        axios.get(`${API_URL}/police/emergencies`, getAuthHeaders()),
      ]);
      
      setIncidents(incidentsRes.data);
      setEmergencyAlerts(emergenciesRes.data);
      
      const activeEmergencies = emergenciesRes.data.filter(a => a.status === 'active' || a.status === 'investigating').length;
      
      setStats({
        totalIncidents: incidentsRes.data.length,
        pendingIncidents: incidentsRes.data.filter(i => i.status === 'pending').length,
        activeEmergencies,
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('policeToken');
        navigate('/police/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateEmergencyStatus = async (id, status, acknowledge = false) => {
    try {
      await axios.patch(
        `${API_URL}/police/emergencies/${id}`,
        { status, acknowledge },
        getAuthHeaders()
      );
      if (acknowledge) {
        setAcknowledgedAlerts(prev => new Set(prev).add(id));
        setCurrentNotification(null);
      }
      fetchEmergencyAlerts();
    } catch (err) {
      console.error('Failed to update emergency:', err);
      alert('Failed to update status');
    }
  };

  const updateIncidentStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/police/incidents/${id}`, { status }, getAuthHeaders());
      setIncidents(prev =>
        prev.map(i => (i._id === id ? { ...i, status } : i))
      );
    } catch (err) {
      console.error('Failed to update incident:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('policeToken');
    navigate('/police/login');
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
    if (incident.images && incident.images.length > 0) {
      setSelectedIncident(incident);
      setShowImageModal(true);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedIncident(null);
  };

  const handleAcknowledge = (alertId) => {
    updateEmergencyStatus(alertId, null, true);
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
            <h1 className="page-title">Police Dashboard</h1>
            <p className="page-subtitle">Emergency response and incident management</p>
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
          <div className="stat-card" style={{ borderLeft: '4px solid #ff4757' }}>
            <div className="stat-icon" style={{ color: '#ff4757' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                <path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value" style={{ color: '#ff4757' }}>{stats.activeEmergencies}</span>
              <span className="stat-label">Active Emergencies</span>
            </div>
          </div>
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
        </div>

        {currentNotification && !acknowledgedAlerts.has(currentNotification.alertId) && (
          <EmergencyNotification
            alert={currentNotification}
            onDismiss={() => {
              setCurrentNotification(null);
            }}
          />
        )}

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'emergencies' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergencies')}
            style={activeTab === 'emergencies' ? { borderColor: '#ff4757', color: '#ff4757' } : {}}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              <path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Emergency Alerts ({emergencyAlerts.filter(a => a.status === 'active' || a.status === 'investigating').length})
          </button>
          <button
            className={`tab ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidents')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            </svg>
            Incidents ({incidents.length})
          </button>
        </div>

        <div className="table-container animate-fade-in">
          {activeTab === 'emergencies' ? (
            emergencyAlerts.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
                <h3>No emergency alerts</h3>
                <p>Emergency alerts will appear here when triggered</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Reporter</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencyAlerts.map((alert) => {
                    const getStatusBadge = (status) => {
                      const badges = {
                        active: { label: 'NEW', color: '#ff4757' },
                        investigating: { label: 'IN PROGRESS', color: '#ff6b35' },
                        resolved: { label: 'RESOLVED', color: '#26de81' },
                        false_alarm: { label: 'FALSE ALARM', color: '#718096' },
                      };
                      return badges[status] || badges.active;
                    };
                    const statusBadge = getStatusBadge(alert.status);
                    const locationName = alert.location?.locationId
                      ? getLocationName(alert.location.locationId)
                      : alert.location?.building || 'Unknown Location';
                    const emergencyTypeLabels = {
                      medical: 'Medical Emergency',
                      fire: 'Fire',
                      security: 'Security Threat',
                      natural_disaster: 'Natural Disaster',
                      other: 'Other Emergency',
                    };
                    const reporterName = alert.reportedBy?.name || 'Unknown';
                    const reporterId = alert.reportedBy?.universityId || alert.reportedBy?.campusId || 'N/A';
                    const reporterRole = alert.reportedBy?.role || 'unknown';
                    return (
                      <tr key={alert._id} style={{ borderLeft: `4px solid ${statusBadge.color}` }}>
                        <td>
                          <span style={{ fontWeight: 600, color: '#1a1a2e' }}>
                            {emergencyTypeLabels[alert.emergencyType] || alert.emergencyType}
                          </span>
                        </td>
                        <td>
                          <div className="contact-cell">
                            <span>{reporterName}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {reporterId} • {reporterRole}
                            </span>
                          </div>
                        </td>
                        <td>{locationName}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: statusBadge.color,
                              color: 'white',
                              fontWeight: 700,
                            }}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td>{new Date(alert.timestamp).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {alert.status === 'active' && (
                              <button
                                onClick={() => handleAcknowledge(alert._id)}
                                className="btn btn-primary btn-sm"
                                style={{ background: '#26de81', borderColor: '#26de81' }}
                              >
                                Acknowledge
                              </button>
                            )}
                            <select
                              value={alert.status}
                              onChange={(e) => updateEmergencyStatus(alert._id, e.target.value)}
                              className="status-select"
                              style={{ borderColor: statusBadge.color }}
                            >
                              <option value="active">NEW</option>
                              <option value="investigating">IN PROGRESS</option>
                              <option value="resolved">RESOLVED</option>
                              <option value="false_alarm">FALSE ALARM</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          ) : (
            incidents.length === 0 ? (
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
                    <th>Reporter</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => {
                    const reporter = incident.reportedBy?.userId || incident.reportedBy;
                    const reporterName = reporter?.name || incident.reportedBy?.name || 'Unknown';
                    const reporterId = reporter?.campusId || incident.reportedBy?.universityId || 'N/A';
                    const reporterRole = reporter?.role || incident.reportedBy?.role || 'unknown';
                    return (
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
                          <div className="contact-cell">
                            <span>{reporterName}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {reporterId} • {reporterRole}
                            </span>
                          </div>
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
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
          grid-template-columns: repeat(3, 1fr);
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
          text-align: center;
        }
        
        .empty-state svg {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }
        
        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        
        .empty-state p {
          color: var(--text-muted);
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

export default PoliceDashboard;

