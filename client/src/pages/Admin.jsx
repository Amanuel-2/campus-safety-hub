import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('incidents');
  const [incidents, setIncidents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    pendingIncidents: 0,
    totalAnnouncements: 0,
  });
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    category: 'general',
    imageUrl: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);

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
      const [incidentsRes, announcementsRes] = await Promise.all([
        axios.get(`${API_URL}/incidents`, getAuthHeaders()),
        axios.get(`${API_URL}/announcements`, getAuthHeaders()),
      ]);
      
      setIncidents(incidentsRes.data);
      setAnnouncements(announcementsRes.data);
      
      setStats({
        totalIncidents: incidentsRes.data.length,
        pendingIncidents: incidentsRes.data.filter(i => i.status === 'pending').length,
        totalAnnouncements: announcementsRes.data.length,
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

  const deleteIncident = async (id) => {
    if (!confirm('Are you sure you want to delete this incident?')) return;
    try {
      await axios.delete(`${API_URL}/incidents/${id}`, getAuthHeaders());
      setIncidents(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      console.error('Failed to delete incident:', err);
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

  const categories = [
    { value: 'safety_alert', label: 'Safety Alert' },
    { value: 'awareness', label: 'Awareness' },
    { value: 'rule_update', label: 'Rule Update' },
    { value: 'general', label: 'General' },
  ];

  const getCategoryLabel = (category) => {
    return categories.find(c => c.value === category)?.label || category;
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

  const openAnnouncementModal = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementForm({
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        imageUrl: announcement.imageUrl || '',
      });
      setImagePreview(announcement.imageUrl || null);
    } else {
      setEditingAnnouncement(null);
      setAnnouncementForm({
        title: '',
        content: '',
        category: 'general',
        imageUrl: '',
      });
      setImagePreview(null);
    }
    setShowAnnouncementModal(true);
  };

  const closeAnnouncementModal = () => {
    setShowAnnouncementModal(false);
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: '',
      content: '',
      category: 'general',
      imageUrl: '',
    });
    setImagePreview(null);
  };

  const handleAnnouncementFormChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('Image size must be less than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setAnnouncementForm(prev => ({ ...prev, imageUrl: base64String }));
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setAnnouncementForm(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
  };

  const submitAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      alert('Title and content are required');
      return;
    }

    setSubmittingAnnouncement(true);
    try {
      if (editingAnnouncement) {
        await axios.put(
          `${API_URL}/admin/announcements/${editingAnnouncement._id}`,
          announcementForm,
          getAuthHeaders()
        );
      } else {
        await axios.post(
          `${API_URL}/admin/announcements`,
          announcementForm,
          getAuthHeaders()
        );
      }
      await fetchData();
      closeAnnouncementModal();
    } catch (err) {
      console.error('Failed to save announcement:', err);
      alert(err.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await axios.delete(`${API_URL}/admin/announcements/${id}`, getAuthHeaders());
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      setStats(prev => ({ ...prev, totalAnnouncements: prev.totalAnnouncements - 1 }));
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      alert('Failed to delete announcement');
    }
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
        <div className="admin-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Manage incidents and announcements</p>
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
            <div className="stat-icon announcements">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalAnnouncements}</span>
              <span className="stat-label">Announcements</span>
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
            className={`tab ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Announcements ({announcements.length})
          </button>
        </div>

        {activeTab === 'announcements' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button onClick={() => openAnnouncementModal()} className="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create Announcement
            </button>
          </div>
        )}

        <div className="table-container animate-fade-in">
          {activeTab === 'incidents' ? (
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
            )
          ) : (
            announcements.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <h3>No announcements</h3>
                <p>Create your first announcement to get started</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((announcement) => (
                    <tr key={announcement._id}>
                      <td>
                        <div className="cell-title">{announcement.title}</div>
                        <div className="cell-subtitle">{announcement.content.slice(0, 60)}...</div>
                      </td>
                      <td>
                        <span
                          className="category-badge"
                          style={{ background: getCategoryColor(announcement.category) }}
                        >
                          {getCategoryLabel(announcement.category)}
                        </span>
                      </td>
                      <td>
                        <span className="date-cell">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => openAnnouncementModal(announcement)}
                            className="btn btn-secondary btn-sm"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteAnnouncement(announcement._id)}
                            className="btn btn-danger btn-sm"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="announcement-modal-overlay" onClick={closeAnnouncementModal}>
          <div className="announcement-modal" onClick={(e) => e.stopPropagation()}>
            <div className="announcement-modal-header">
              <h3 className="announcement-modal-title">
                {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
              </h3>
              <button onClick={closeAnnouncementModal} className="announcement-modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="announcement-modal-content">
              <div className="announcement-form-group">
                <label className="announcement-form-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={announcementForm.title}
                  onChange={handleAnnouncementFormChange}
                  className="announcement-form-input"
                  placeholder="Enter announcement title"
                />
              </div>
              <div className="announcement-form-group">
                <label className="announcement-form-label">Content *</label>
                <textarea
                  name="content"
                  value={announcementForm.content}
                  onChange={handleAnnouncementFormChange}
                  className="announcement-form-textarea"
                  placeholder="Enter announcement content"
                />
              </div>
              <div className="announcement-form-group">
                <label className="announcement-form-label">Category</label>
                <select
                  name="category"
                  value={announcementForm.category}
                  onChange={handleAnnouncementFormChange}
                  className="announcement-form-select"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="announcement-form-group">
                <label className="announcement-form-label">Image (Optional)</label>
                {!imagePreview ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="announcement-form-input"
                  />
                ) : (
                  <div className="announcement-image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button onClick={removeImage} className="announcement-image-remove">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="announcement-modal-actions">
              <button onClick={closeAnnouncementModal} className="btn btn-secondary" disabled={submittingAnnouncement}>
                Cancel
              </button>
              <button onClick={submitAnnouncement} className="btn btn-primary" disabled={submittingAnnouncement}>
                {submittingAnnouncement ? 'Saving...' : editingAnnouncement ? 'Update' : 'Create'}
              </button>
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
        
        .stat-icon.announcements {
          background: rgba(78, 205, 196, 0.15);
          color: var(--accent-secondary);
        }
        
        .category-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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
        
        /* Announcement Modal Styles */
        .announcement-modal-overlay {
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
        
        .announcement-modal {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }
        
        .announcement-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .announcement-modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        
        .announcement-modal-close {
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
        
        .announcement-modal-close:hover {
          background: var(--accent-danger);
          border-color: var(--accent-danger);
          color: white;
        }
        
        .announcement-modal-content {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }
        
        .announcement-form-group {
          margin-bottom: 1.5rem;
        }
        
        .announcement-form-label {
          display: block;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        
        .announcement-form-input,
        .announcement-form-textarea,
        .announcement-form-select {
          width: 100%;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.875rem;
          font-family: inherit;
        }
        
        .announcement-form-textarea {
          min-height: 150px;
          resize: vertical;
        }
        
        .announcement-form-input:focus,
        .announcement-form-textarea:focus,
        .announcement-form-select:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
        
        .announcement-image-preview {
          margin-top: 1rem;
          position: relative;
        }
        
        .announcement-image-preview img {
          width: 100%;
          max-height: 300px;
          object-fit: contain;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }
        
        .announcement-image-remove {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: var(--accent-danger);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          padding: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .announcement-modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 1.5rem;
          border-top: 1px solid var(--border-color);
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

