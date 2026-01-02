import { useState } from 'react';
import Navbar from '../components/Navbar';
import MapPicker from '../components/MapPicker';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReportIncident = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'safety_concern',
    severity: 'medium',
    location: null,
    locationDescription: '',
    anonymous: true,
    reporterName: '',
    reporterContact: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const incidentTypes = [
    { value: 'safety_concern', label: 'Safety Concern' },
    { value: 'suspicious_activity', label: 'Suspicious Activity' },
    { value: 'theft', label: 'Theft' },
    { value: 'vandalism', label: 'Vandalism' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'other', label: 'Other' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'var(--accent-success)' },
    { value: 'medium', label: 'Medium', color: 'var(--accent-warning)' },
    { value: 'high', label: 'High', color: 'var(--accent-primary)' },
    { value: 'critical', label: 'Critical', color: 'var(--accent-danger)' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location: {
        lat: location.lat,
        lng: location.lng,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post(`${API_URL}/incidents`, formData);
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        type: 'safety_concern',
        severity: 'medium',
        location: null,
        locationDescription: '',
        anonymous: true,
        reporterName: '',
        reporterContact: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Report an Incident</h1>
          <p className="page-subtitle">Help keep our campus safe by reporting any concerns or emergencies</p>
        </div>

        {success && (
          <div className="success-message animate-fade-in">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Your report has been submitted successfully. Our team will review it promptly.
          </div>
        )}

        {error && (
          <div className="error-message animate-fade-in">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        <div className="report-layout">
          <form onSubmit={handleSubmit} className="report-form card animate-slide-up">
            <div className="form-section">
              <h3 className="section-title">Incident Details</h3>
              
              <div className="form-group">
                <label className="form-label">Incident Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Brief title describing the incident"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Incident Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    {incidentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Severity Level *</label>
                  <div className="severity-buttons">
                    {severityLevels.map(level => (
                      <button
                        key={level.value}
                        type="button"
                        className={`severity-btn ${formData.severity === level.value ? 'active' : ''}`}
                        style={{ '--severity-color': level.color }}
                        onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Provide detailed information about what happened, when it occurred, and any relevant details..."
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Location</h3>
              
              <MapPicker onLocationSelect={handleLocationSelect} />
              
              <div className="form-group">
                <label className="form-label">Location Description</label>
                <input
                  type="text"
                  name="locationDescription"
                  value={formData.locationDescription}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Near the library entrance, Building A floor 2"
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Reporter Information</h3>
              
              <div className="anonymous-toggle">
                <label className="toggle-wrapper">
                  <input
                    type="checkbox"
                    name="anonymous"
                    checked={formData.anonymous}
                    onChange={handleChange}
                  />
                  <span className="toggle-slider" />
                  <span className="toggle-label">Report Anonymously</span>
                </label>
                <p className="toggle-hint">Your identity will be kept confidential</p>
              </div>

              {!formData.anonymous && (
                <div className="contact-fields animate-fade-in">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Your Name</label>
                      <input
                        type="text"
                        name="reporterName"
                        value={formData.reporterName}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Full name"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Contact (Email/Phone)</label>
                      <input
                        type="text"
                        name="reporterContact"
                        value={formData.reporterContact}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="How can we reach you?"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={loading}>
              {loading ? (
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

          <aside className="report-sidebar">
            <div className="sidebar-card card animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h4>Emergency?</h4>
              <p>For immediate emergencies requiring urgent response, please call campus security directly.</p>
              <a href="tel:911" className="emergency-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Call 911
              </a>
            </div>

            <div className="sidebar-card card animate-slide-up" style={{ animationDelay: '200ms' }}>
              <h4>Reporting Tips</h4>
              <ul className="tips-list">
                <li>Be as specific as possible about the location</li>
                <li>Include approximate time of incident</li>
                <li>Describe any individuals involved</li>
                <li>Note any witnesses present</li>
                <li>Attach photos if available (coming soon)</li>
              </ul>
            </div>

            <div className="sidebar-card card animate-slide-up" style={{ animationDelay: '300ms' }}>
              <h4>What Happens Next?</h4>
              <div className="process-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-text">Report submitted & logged</div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-text">Security team reviews</div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-text">Investigation if needed</div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-text">Resolution & updates</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .report-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2rem;
          align-items: start;
        }
        
        .report-form {
          padding: 2rem;
        }
        
        .form-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .form-section:last-of-type {
          border-bottom: none;
          margin-bottom: 1.5rem;
          padding-bottom: 0;
        }
        
        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .severity-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .severity-btn {
          flex: 1;
          padding: 0.625rem 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }
        
        .severity-btn:hover {
          border-color: var(--severity-color);
          color: var(--severity-color);
        }
        
        .severity-btn.active {
          background: var(--severity-color);
          border-color: var(--severity-color);
          color: white;
        }
        
        .anonymous-toggle {
          margin-bottom: 1rem;
        }
        
        .toggle-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        
        .toggle-wrapper input {
          display: none;
        }
        
        .toggle-slider {
          width: 48px;
          height: 26px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          position: relative;
          transition: all 0.3s ease;
        }
        
        .toggle-slider::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background: var(--text-muted);
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: all 0.3s ease;
        }
        
        .toggle-wrapper input:checked + .toggle-slider {
          background: var(--accent-success);
          border-color: var(--accent-success);
        }
        
        .toggle-wrapper input:checked + .toggle-slider::after {
          background: white;
          left: calc(100% - 22px);
        }
        
        .toggle-label {
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .toggle-hint {
          margin-top: 0.375rem;
          margin-left: calc(48px + 0.75rem);
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        
        .contact-fields {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px dashed var(--border-color);
        }
        
        .submit-btn {
          width: 100%;
        }
        
        .report-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .sidebar-card {
          padding: 1.5rem;
        }
        
        .sidebar-card h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }
        
        .sidebar-card p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .emergency-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, var(--accent-danger) 0%, #ff6b7a 100%);
          color: white;
          font-weight: 600;
          border-radius: var(--radius-md);
          transition: all 0.2s ease;
        }
        
        .emergency-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
        }
        
        .tips-list {
          list-style: none;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .tips-list li {
          padding: 0.5rem 0;
          padding-left: 1.5rem;
          position: relative;
          border-bottom: 1px dashed var(--border-color);
        }
        
        .tips-list li:last-child {
          border-bottom: none;
        }
        
        .tips-list li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--accent-secondary);
        }
        
        .process-steps {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .step {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .step-number {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent-primary);
          font-family: var(--font-mono);
        }
        
        .step-text {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .success-message, .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        @media (max-width: 900px) {
          .report-layout {
            grid-template-columns: 1fr;
          }
          
          .report-sidebar {
            order: -1;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .severity-buttons {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportIncident;

