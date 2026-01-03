import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    universityId: '',
    password: '',
    name: '',
    role: 'student',
    phone: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/register`, formData);

      // Store tokens
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('campusToken', response.data.campusToken);
      localStorage.setItem('userId', response.data.user.id);

      // Redirect to user home
      navigate('/user/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern" />
      
      <div className="auth-container animate-fade-in">
        <Link to="/" className="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Home
        </Link>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <h1 className="auth-title">User Registration</h1>
            <p className="auth-subtitle">Register with your campus ID</p>
          </div>

          {error && (
            <div className="error-message animate-fade-in">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input with-icon"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">University ID Number *</label>
              <div className="input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="text"
                  name="universityId"
                  value={formData.universityId}
                  onChange={handleChange}
                  className="form-input with-icon"
                  placeholder="Enter your university ID"
                  required
                  autoComplete="username"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Role *</label>
              <div className="input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-input with-icon"
                  required
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input with-icon"
                  placeholder="Enter your password"
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone (Optional)</label>
              <div className="input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input with-icon"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Department (Optional)</label>
              <div className="input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-input with-icon"
                  placeholder="Enter your department"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 20, height: 20 }} />
                  Registering...
                </>
              ) : (
                <>
                  Register
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already registered? <Link to="/user/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        
        .auth-bg-pattern {
          position: fixed;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 30%, rgba(255, 107, 53, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(78, 205, 196, 0.12) 0%, transparent 50%),
            var(--bg-primary);
          z-index: -1;
        }
        
        .auth-container {
          width: 100%;
          max-width: 480px;
        }
        
        .auth-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }
        
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .auth-logo {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(78, 205, 196, 0.15) 100%);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          margin: 0 auto 1.25rem;
          color: var(--accent-primary);
        }
        
        .auth-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        
        .auth-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        
        .auth-btn {
          width: 100%;
          margin-top: 0.5rem;
        }
        
        .auth-footer {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px dashed var(--border-color);
          text-align: center;
        }
        
        .auth-footer p {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        
        .auth-footer a {
          color: var(--accent-primary);
          font-weight: 500;
        }
        
        .auth-footer a:hover {
          text-decoration: underline;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          transition: color 0.2s ease;
        }
        
        .back-link:hover {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default StudentRegister;
