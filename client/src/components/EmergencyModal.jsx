import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CampusMapPicker from './CampusMapPicker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EmergencyModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Warning, 2: Form, 3: Success
  const [formData, setFormData] = useState({
    locationId: null,
    area: '',
    emergencyType: 'other',
    description: '',
    contactInfo: {
      phone: '',
      email: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFormData({
        locationId: null,
        area: '',
        emergencyType: 'other',
        description: '',
        contactInfo: {
          phone: '',
          email: '',
        },
      });
      setError('');
    }
  }, [isOpen]);

  // Check authentication
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('userToken');
      if (!token) {
        onClose();
        navigate('/user/login');
      }
    }
  }, [isOpen, navigate, onClose]);

  const emergencyTypes = [
    { value: 'medical', label: 'Medical Emergency', icon: '🏥' },
    { value: 'fire', label: 'Fire', icon: '🔥' },
    { value: 'security', label: 'Security Threat', icon: '🚨' },
    { value: 'natural_disaster', label: 'Natural Disaster', icon: '🌪️' },
    { value: 'other', label: 'Other', icon: '⚠️' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      locationId: locationData.locationId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Location selection is required
    if (!formData.locationId) {
      setError('Please select a location on the campus map.');
      setLoading(false);
      return;
    }

    try {
      // Get auth token
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/user/login');
        return;
      }

      const payload = {
        locationId: formData.locationId,
        area: formData.area || null, // Optional
        emergencyType: formData.emergencyType,
        description: formData.description || '',
        contactInfo: (formData.contactInfo.phone || formData.contactInfo.email) ? formData.contactInfo : null,
      };

      // Add device fingerprint header
      const deviceFingerprint = localStorage.getItem('deviceFingerprint') || 
        `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceFingerprint', deviceFingerprint);

      await axios.post(`${API_URL}/emergency/alert`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Device-Fingerprint': deviceFingerprint,
        },
      });

      setStep(3);
    } catch (err) {
      if (err.response?.status === 429) {
        setError(err.response.data.message || 'Too many alerts. Please wait before sending another.');
      } else {
        setError(err.response?.data?.message || 'Failed to send emergency alert. Please try again or call +251 9____ directly.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="emergency-modal" onClick={(e) => e.stopPropagation()}>
        {step === 1 && (
          <div className="emergency-warning">
            <div className="warning-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2 className="warning-title">Emergency Alert</h2>
            <div className="warning-content">
              <p className="warning-text">
                <strong>This is for REAL EMERGENCIES only.</strong>
              </p>
              <p className="warning-text">
                Misuse of this system may result in disciplinary action, including suspension or expulsion, 
                and legal consequences under campus policies and local laws.
              </p>
              <p className="warning-text">
                For immediate life-threatening emergencies, call <strong>+251 9____</strong> first.
              </p>
              <div className="warning-legal">
                <p>By proceeding, you confirm:</p>
                <ul>
                  <li>This is a genuine emergency requiring immediate response</li>
                  <li>You understand the consequences of false reporting</li>
                  <li>You are providing accurate information</li>
                </ul>
              </div>
            </div>
            <div className="warning-actions">
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => setStep(2)} className="btn btn-danger btn-lg">
                I Understand - Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="emergency-form">
            <div className="modal-header">
              <h2 className="modal-title">Emergency Alert Details</h2>
              <button type="button" onClick={onClose} className="modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {error && (
              <div className="error-message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Select Location on Campus Map <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <CampusMapPicker 
                onLocationSelect={handleLocationSelect} 
                initialLocationId={formData.locationId}
              />
              <p className="form-hint">
                <strong>Required:</strong> Please select your location from the campus map above. Click on a building pin to select it.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Specific Area/Room (optional)</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Room 205, 2nd floor, North entrance"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Type</label>
              <div className="emergency-type-grid">
                {emergencyTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    className={`emergency-type-btn ${formData.emergencyType === type.value ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, emergencyType: type.value }))}
                  >
                    <span className="type-icon">{type.icon}</span>
                    <span className="type-label">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description (optional but helpful)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Describe what is happening..."
                rows="3"
              />
            </div>

            <div className="contact-section">
              <p className="contact-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Optional: Provide contact information if you'd like to be reached
              </p>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="tel"
                    name="contact.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Phone (optional)"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="contact.email"
                    value={formData.contactInfo.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Email (optional)"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                Back
              </button>
              <button type="submit" className="btn btn-danger btn-lg" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 20, height: 20 }} />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                    </svg>
                    Send Emergency Alert
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="emergency-success">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 className="success-title">Emergency Alert Sent</h2>
            <p className="success-text">
              Your emergency alert has been sent to campus security. 
              They will respond as quickly as possible.
            </p>
            <p className="success-note">
              <strong>Remember:</strong> For immediate life-threatening emergencies, 
              always call <strong>+251 9____</strong> first.
            </p>
            <button onClick={onClose} className="btn btn-primary btn-lg">
              Close
            </button>
          </div>
        )}

        <style>{`
          .emergency-modal {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 0;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: scaleIn 0.3s ease-out;
          }
          
          .emergency-warning {
            padding: 2.5rem;
            text-align: center;
          }
          
          .warning-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 71, 87, 0.1);
            border-radius: 50%;
            color: var(--accent-danger);
          }
          
          .warning-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1.5rem;
          }
          
          .warning-content {
            text-align: left;
            margin-bottom: 2rem;
          }
          
          .warning-text {
            color: var(--text-secondary);
            line-height: 1.7;
            margin-bottom: 1rem;
          }
          
          .warning-legal {
            background: rgba(255, 71, 87, 0.05);
            border: 1px solid rgba(255, 71, 87, 0.2);
            border-radius: var(--radius-md);
            padding: 1rem;
            margin-top: 1.5rem;
          }
          
          .warning-legal p {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
          }
          
          .warning-legal ul {
            list-style: none;
            padding-left: 0;
            margin: 0;
          }
          
          .warning-legal li {
            padding: 0.375rem 0;
            padding-left: 1.5rem;
            position: relative;
            color: var(--text-secondary);
            font-size: 0.9rem;
          }
          
          .warning-legal li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--accent-danger);
            font-weight: bold;
          }
          
          .warning-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }
          
          .emergency-form {
            padding: 2rem;
          }
          
          .emergency-type-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          
          .emergency-type-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            background: var(--bg-tertiary);
            border: 2px solid var(--border-color);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .emergency-type-btn:hover {
            border-color: var(--accent-primary);
          }
          
          .emergency-type-btn.active {
            background: rgba(255, 71, 87, 0.1);
            border-color: var(--accent-danger);
          }
          
          .type-icon {
            font-size: 1.5rem;
          }
          
          .type-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-primary);
          }
          
          .contact-section {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px dashed var(--border-color);
          }
          
          .contact-note {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-muted);
            margin-bottom: 1rem;
          }
          
          .location-loading {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            background: rgba(78, 205, 196, 0.1);
            border: 1px solid rgba(78, 205, 196, 0.3);
            border-radius: var(--radius-md);
            color: var(--accent-secondary);
            margin-bottom: 0.75rem;
            font-size: 0.875rem;
          }
          
          .location-success {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            background: rgba(38, 222, 129, 0.1);
            border: 1px solid rgba(38, 222, 129, 0.3);
            border-radius: var(--radius-md);
            color: var(--accent-success);
            margin-bottom: 0.75rem;
            font-size: 0.875rem;
          }
          
          .location-success svg {
            flex-shrink: 0;
          }
          
          .location-warning {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid rgba(255, 193, 7, 0.3);
            border-radius: var(--radius-md);
            color: var(--accent-warning);
            margin-bottom: 0.75rem;
            font-size: 0.875rem;
          }
          
          .location-warning svg {
            flex-shrink: 0;
          }
          
          .form-hint {
            margin-top: 0.5rem;
            font-size: 0.8125rem;
            color: var(--text-muted);
          }
          
          .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
          }
          
          .emergency-success {
            padding: 3rem 2rem;
            text-align: center;
          }
          
          .success-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(38, 222, 129, 0.1);
            border-radius: 50%;
            color: var(--accent-success);
          }
          
          .success-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
          }
          
          .success-text {
            color: var(--text-secondary);
            line-height: 1.7;
            margin-bottom: 1.5rem;
          }
          
          .success-note {
            background: rgba(255, 107, 53, 0.1);
            border: 1px solid rgba(255, 107, 53, 0.2);
            border-radius: var(--radius-md);
            padding: 1rem;
            margin-bottom: 2rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
          }
          
          @media (max-width: 640px) {
            .emergency-type-grid {
              grid-template-columns: 1fr;
            }
            
            .warning-actions,
            .form-actions {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default EmergencyModal;
