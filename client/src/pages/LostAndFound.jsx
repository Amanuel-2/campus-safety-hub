import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MapPicker from '../components/MapPicker';
import EmergencyButton from '../components/EmergencyButton';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LostAndFound = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'electronics',
    status: 'lost',
    location: null,
    locationDescription: '',
    dateOccurred: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'electronics', label: 'Electronics', icon: '📱' },
    { value: 'documents', label: 'Documents/ID', icon: '📄' },
    { value: 'clothing', label: 'Clothing', icon: '👕' },
    { value: 'jewelry', label: 'Jewelry', icon: '💍' },
    { value: 'bags', label: 'Bags/Backpacks', icon: '🎒' },
    { value: 'keys', label: 'Keys', icon: '🔑' },
    { value: 'books', label: 'Books', icon: '📚' },
    { value: 'other', label: 'Other', icon: '📦' },
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/lost-items`);
      setItems(response.data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location: { lat: location.lat, lng: location.lng },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post(`${API_URL}/lost-items`, formData);
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: 'electronics',
        status: 'lost',
        location: null,
        locationDescription: '',
        dateOccurred: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
      });
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : '📦';
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Lost & Found</h1>
          <p className="page-subtitle">Report lost items or browse found items to recover your belongings</p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Browse Items
          </button>
          <button
            className={`tab ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Report Item
          </button>
        </div>

        {activeTab === 'browse' ? (
          <div className="browse-section animate-fade-in">
            <div className="browse-controls">
              <div className="search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn lost ${filter === 'lost' ? 'active' : ''}`}
                  onClick={() => setFilter('lost')}
                >
                  Lost
                </button>
                <button
                  className={`filter-btn found ${filter === 'found' ? 'active' : ''}`}
                  onClick={() => setFilter('found')}
                >
                  Found
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
                <h3>No items found</h3>
                <p>Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="items-grid">
                {filteredItems.map((item, index) => (
                  <div
                    key={item._id}
                    className="item-card card"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="item-header">
                      <span className="item-category">{getCategoryIcon(item.category)}</span>
                      <span className={`badge badge-${item.status}`}>{item.status}</span>
                    </div>
                    <h3 className="item-title">{item.title}</h3>
                    <p className="item-description">{item.description}</p>
                    <div className="item-meta">
                      {item.locationDescription && (
                        <div className="meta-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {item.locationDescription}
                        </div>
                      )}
                      {item.dateOccurred && (
                        <div className="meta-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {new Date(item.dateOccurred).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {item.contactEmail && (
                      <a href={`mailto:${item.contactEmail}`} className="btn btn-secondary btn-sm contact-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        Contact
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="report-section animate-fade-in">
            {success && (
              <div className="success-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Your item has been reported successfully!
              </div>
            )}

            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="lf-form card">
              <div className="status-toggle">
                <button
                  type="button"
                  className={`status-btn lost ${formData.status === 'lost' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, status: 'lost' }))}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  I Lost Something
                </button>
                <button
                  type="button"
                  className={`status-btn found ${formData.status === 'found' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, status: 'found' }))}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                  I Found Something
                </button>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Item Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., Black iPhone 15, Blue Backpack"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Describe the item in detail (color, brand, distinguishing features...)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date Lost/Found</label>
                  <input
                    type="date"
                    name="dateOccurred"
                    value={formData.dateOccurred}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location Description</label>
                  <input
                    type="text"
                    name="locationDescription"
                    value={formData.locationDescription}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., Library 2nd floor, Cafeteria"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Mark on Map</label>
                  <MapPicker onLocationSelect={handleLocationSelect} />
                </div>

                <div className="form-section-title">Contact Information</div>

                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone (optional)</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={submitLoading}>
                {submitLoading ? (
                  <>
                    <span className="spinner" style={{ width: 20, height: 20 }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                    </svg>
                    Submit Report
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <EmergencyButton />

      <style>{`
        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
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
          color: var(--text-primary);
          border-color: var(--accent-secondary);
        }
        
        .tab.active {
          background: var(--accent-secondary);
          border-color: var(--accent-secondary);
          color: white;
        }
        
        .browse-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .search-box {
          flex: 1;
          min-width: 250px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }
        
        .search-box svg {
          color: var(--text-muted);
        }
        
        .search-input {
          flex: 1;
          padding: 0.875rem 0;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 1rem;
        }
        
        .search-input:focus {
          outline: none;
        }
        
        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .filter-btn {
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }
        
        .filter-btn:hover {
          border-color: var(--text-muted);
        }
        
        .filter-btn.active {
          color: white;
          border-color: transparent;
        }
        
        .filter-btn.active:not(.lost):not(.found) {
          background: var(--accent-primary);
        }
        
        .filter-btn.lost.active {
          background: var(--accent-danger);
        }
        
        .filter-btn.found.active {
          background: var(--accent-success);
        }
        
        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .item-card {
          padding: 1.5rem;
          animation: slideUp 0.4s ease-out both;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .item-category {
          font-size: 2rem;
        }
        
        .item-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        
        .item-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .item-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .contact-btn {
          width: 100%;
        }
        
        .lf-form {
          padding: 2rem;
          max-width: 800px;
        }
        
        .status-toggle {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .status-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          transition: all 0.2s ease;
        }
        
        .status-btn:hover {
          border-color: var(--text-muted);
        }
        
        .status-btn.lost.active {
          background: rgba(255, 71, 87, 0.1);
          border-color: var(--accent-danger);
          color: var(--accent-danger);
        }
        
        .status-btn.found.active {
          background: rgba(38, 222, 129, 0.1);
          border-color: var(--accent-success);
          color: var(--accent-success);
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        
        .form-section-title {
          grid-column: 1 / -1;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          padding-top: 1rem;
          margin-top: 0.5rem;
          border-top: 1px solid var(--border-color);
        }
        
        .submit-btn {
          width: 100%;
          margin-top: 1.5rem;
        }
        
        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .status-toggle {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default LostAndFound;

