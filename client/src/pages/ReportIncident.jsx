import { useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import CampusMapPicker from '../components/CampusMapPicker';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReportIncident = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'safety_concern',
        severity: 'medium',
        locationId: null,
        locationDescription: '',
        anonymous: true,
        reporterName: '',
        reporterContact: '',
        images: [],
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const incidentTypes = [
        { value: 'safety_concern', label: 'Safety Concern', icon: '⚠️' },
        { value: 'suspicious_activity', label: 'Suspicious Activity', icon: '👁️' },
        { value: 'theft', label: 'Theft', icon: '🔓' },
        { value: 'vandalism', label: 'Vandalism', icon: '🔨' },
        { value: 'harassment', label: 'Harassment', icon: '🚫' },
        { value: 'emergency', label: 'Emergency', icon: '🚨' },
        { value: 'other', label: 'Other', icon: '📋' },
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

    const handleLocationSelect = useCallback((locationData) => {
        setFormData(prev => ({
            ...prev,
            locationId: locationData.locationId,
        }));
    }, []);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        
        setError(''); // Clear previous errors
        
        // Check total count
        if (files.length + imagePreviews.length > 5) {
            setError(`Maximum 5 images allowed. You already have ${imagePreviews.length} image(s).`);
            e.target.value = ''; // Reset file input
            return;
        }

        // Validate each file before processing
        const validFiles = [];
        const errors = [];
        
        files.forEach((file, index) => {
            // Check file type
            if (!file.type.startsWith('image/')) {
                errors.push(`${file.name} is not an image file`);
                return;
            }
            
            // Check file size (limit to 3MB to account for base64 overhead)
            const maxSize = 3 * 1024 * 1024; // 3MB
            if (file.size > maxSize) {
                errors.push(`${file.name} is too large (max 3MB per image)`);
                return;
            }
            
            validFiles.push(file);
        });

        // Show errors if any
        if (errors.length > 0) {
            setError(errors.join('. '));
            if (validFiles.length === 0) {
                e.target.value = ''; // Reset file input if no valid files
                return;
            }
        }

        // Process valid files
        validFiles.forEach(file => {
            const reader = new FileReader();
            
            reader.onerror = () => {
                setError(`Failed to read ${file.name}`);
            };
            
            reader.onloadend = () => {
                try {
                    const base64 = reader.result;
                    
                    // Validate base64 string
                    if (!base64 || typeof base64 !== 'string' || !base64.startsWith('data:image/')) {
                        setError(`Invalid image format for ${file.name}`);
                        return;
                    }
                    
                    // Check base64 size (should be less than 4MB)
                    if (base64.length > 4000000) {
                        setError(`${file.name} is too large after encoding`);
                        return;
                    }
                    
                    setImagePreviews(prev => [...prev, base64]);
                    setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, base64],
                    }));
                    setError(''); // Clear errors on success
                } catch (err) {
                    setError(`Error processing ${file.name}: ${err.message}`);
                }
            };
            
            reader.readAsDataURL(file);
        });
        
        // Reset file input after processing
        e.target.value = '';
    };

    const removeImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError('');
        setSuccess(false);

        // Validate required fields
        if (!formData.title.trim()) {
            setError('Please enter an incident title');
            setSubmitLoading(false);
            return;
        }

        if (!formData.description.trim()) {
            setError('Please enter a description');
            setSubmitLoading(false);
            return;
        }

        try {
            // Prepare payload with proper formatting
            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                type: formData.type,
                severity: formData.severity,
                locationId: formData.locationId || null,
                locationDescription: formData.locationDescription?.trim() || '',
                anonymous: formData.anonymous,
                reporterName: formData.anonymous ? '' : (formData.reporterName?.trim() || ''),
                reporterContact: formData.anonymous ? '' : (formData.reporterContact?.trim() || ''),
                images: Array.isArray(formData.images) ? formData.images : [],
            };

            console.log('Submitting incident:', {
                title: payload.title,
                type: payload.type,
                imagesCount: payload.images.length,
                hasLocationId: !!payload.locationId,
            });

            const response = await axios.post(`${API_URL}/incidents`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // 30 second timeout for large payloads
            });

            console.log('Incident submitted successfully:', response.data);
            
            setSuccess(true);
            setFormData({
                title: '',
                description: '',
                type: 'safety_concern',
                severity: 'medium',
                locationId: null,
                locationDescription: '',
                anonymous: true,
                reporterName: '',
                reporterContact: '',
                images: [],
            });
            setImagePreviews([]);
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 5000);
        } catch (err) {
            console.error('Error submitting incident:', err);
            
            let errorMessage = 'Failed to submit incident. Please try again.';
            
            if (err.response) {
                // Server responded with error
                errorMessage = err.response.data?.message || errorMessage;
                
                // Handle specific error cases
                if (err.response.status === 413 || err.response.status === 400) {
                    if (err.response.data?.message?.includes('too large')) {
                        errorMessage = 'Images are too large. Please reduce image size or upload fewer images.';
                    }
                }
            } else if (err.request) {
                // Request was made but no response received
                errorMessage = 'Network error. Please check your connection and try again.';
            }
            
            setError(errorMessage);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="app-container">
            <Navbar />
            <div className="page-container">
                <div className="page-header">
                    <h1 className="page-title">Report an Incident</h1>
                    <p className="page-subtitle">Help keep our campus safe by reporting safety concerns</p>
                </div>

                {error && (
                    <div className="error-message animate-fade-in">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="report-form card animate-fade-in">
                    {/* Photo Upload Section */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            Upload Photos
                        </h3>
                        <div className="image-upload-area">
                            <input
                                type="file"
                                id="image-upload"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="file-input"
                            />
                            <label htmlFor="image-upload" className="upload-label">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <span>Click to upload photos</span>
                                <span className="upload-hint">Max 5 images, 3MB each (JPG, PNG, GIF, WebP)</span>
                            </label>
                        </div>
                        {imagePreviews.length > 0 && (
                            <div className="image-previews">
                                {imagePreviews.map((src, index) => (
                                    <div key={index} className="preview-item">
                                        <img src={src} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="remove-image"
                                            onClick={() => removeImage(index)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Incident Type & Severity */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            Incident Details
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Incident Type *</label>
                            <div className="type-grid">
                                {incidentTypes.map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        className={`type-btn ${formData.type === type.value ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                                    >
                                        <span className="type-icon">{type.icon}</span>
                                        <span>{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Severity Level *</label>
                            <div className="severity-grid">
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

                    {/* Message Section */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            Your Message
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Title *</label>
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

                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-textarea"
                                placeholder="Provide detailed information about what happened, when, and any other relevant details..."
                                required
                                rows={5}
                            />
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            Location
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Select Location on Campus Map (optional)</label>
                            <CampusMapPicker 
                                onLocationSelect={handleLocationSelect} 
                                initialLocationId={formData.locationId}
                            />
                            <p className="form-hint">
                                Select a building location from the campus map. This helps us locate the incident quickly.
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location Description</label>
                            <input
                                type="text"
                                name="locationDescription"
                                value={formData.locationDescription}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., Near the library entrance, Building A parking lot"
                            />
                        </div>
                    </div>

                    {/* Reporter Info Section */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Your Information
                        </h3>

                        <div className="anonymous-toggle">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    name="anonymous"
                                    checked={formData.anonymous}
                                    onChange={handleChange}
                                    className="toggle-input"
                                />
                                <span className="toggle-switch"></span>
                                <span className="toggle-text">Report Anonymously</span>
                            </label>
                            <p className="toggle-hint">Your identity will be kept confidential</p>
                        </div>

                        {!formData.anonymous && (
                            <div className="contact-fields animate-fade-in">
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
                                    <label className="form-label">Contact (Email or Phone)</label>
                                    <input
                                        type="text"
                                        name="reporterContact"
                                        value={formData.reporterContact}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="email@example.com or phone number"
                                    />
                                </div>
                            </div>
                        )}
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
                                    <path d="M22 2L11 13" />
                                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                                </svg>
                                Submit Report
                            </>
                        )}
                    </button>

                    {success && (
                        <div className="success-message animate-fade-in">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            Your incident has been reported successfully. Our team will review it shortly.
                        </div>
                    )}
                </form>
            </div>

            <style>{`
        .report-form {
          max-width: 800px;
          padding: 2rem;
        }

        .form-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border-color);
        }

        .form-section:last-of-type {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
        }

        .section-title svg {
          color: var(--accent-primary);
        }

        /* Image Upload */
        .image-upload-area {
          margin-bottom: 1rem;
        }

        .file-input {
          display: none;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 2.5rem;
          background: var(--bg-tertiary);
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-secondary);
        }

        .upload-label:hover {
          border-color: var(--accent-primary);
          background: rgba(255, 107, 53, 0.05);
        }

        .upload-label svg {
          color: var(--accent-primary);
        }

        .upload-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .image-previews {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .preview-item {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-danger);
          border-radius: var(--radius-full);
          color: white;
          transition: transform 0.2s ease;
        }

        .remove-image:hover {
          transform: scale(1.1);
        }

        /* Type Selection */
        .type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.75rem;
        }

        .type-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .type-btn:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }

        .type-btn.active {
          background: rgba(255, 107, 53, 0.1);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .type-icon {
          font-size: 1.25rem;
        }

        /* Severity Selection */
        .severity-grid {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .severity-btn {
          flex: 1;
          min-width: 100px;
          padding: 0.875rem 1.25rem;
          background: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .severity-btn:hover {
          border-color: var(--severity-color);
          color: var(--severity-color);
        }

        .severity-btn.active {
          background: color-mix(in srgb, var(--severity-color) 15%, transparent);
          border-color: var(--severity-color);
          color: var(--severity-color);
        }

        /* Anonymous Toggle */
        .anonymous-toggle {
          margin-bottom: 1rem;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .toggle-input {
          display: none;
        }

        .toggle-switch {
          width: 48px;
          height: 26px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          position: relative;
          transition: all 0.2s ease;
        }

        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          background: var(--text-muted);
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .toggle-input:checked + .toggle-switch {
          background: var(--accent-success);
          border-color: var(--accent-success);
        }

        .toggle-input:checked + .toggle-switch::after {
          left: 25px;
          background: white;
        }

        .toggle-text {
          font-weight: 500;
          color: var(--text-primary);
        }

        .toggle-hint {
          margin-top: 0.5rem;
          margin-left: 3.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .contact-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }

        .submit-btn {
          width: 100%;
          margin-top: 1.5rem;
        }

        @media (max-width: 640px) {
          .type-grid {
            grid-template-columns: 1fr 1fr;
          }

          .severity-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .contact-fields {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default ReportIncident;
