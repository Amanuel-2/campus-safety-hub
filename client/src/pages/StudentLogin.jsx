import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    campusId: '',
    password: '',
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

    try {
      const response = await axios.post(`${API_URL}/students/login`, formData);

      // Store tokens
      localStorage.setItem('studentToken', response.data.token);
      localStorage.setItem('campusToken', response.data.campusToken);
      localStorage.setItem('studentId', response.data.student.id);

      // Redirect to home
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid campus ID or password. Please try again.');
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
            <h1 className="auth-title">Student Login</h1>
            <p className="auth-subtitle">Sign in with your campus ID</p>
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
              <label className="form-label">Campus ID Number</label>
              <div className="input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="text"
                  name="campusId"
                  value={formData.campusId}
                  onChange={handleChange}
                  className="form-input with-icon"
                  placeholder="Enter your campus ID"
                  required
                  autoComplete="username"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
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
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 20, height: 20 }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
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
              Not registered? <Link to="/student/register">Register here</Link>
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
      `}</style>
    </div>
  );
};

export default StudentLogin;


