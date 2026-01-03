import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MyReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/user/login');
      return;
    }

    fetchMyReports();
  }, [navigate]);

  const fetchMyReports = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get(`${API_URL}/incidents/my-reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setReports(response.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('userToken');
        navigate('/user/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pending', color: '#ffd93d' },
      investigating: { label: 'Investigating', color: '#ff6b35' },
      resolved: { label: 'Resolved', color: '#26de81' },
    };
    return badges[status] || badges.pending;
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
          <h1 className="page-title">My Reports</h1>
          <p className="page-subtitle">View the status of your submitted incident reports</p>
        </div>

        {reports.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <h3>No reports submitted</h3>
            <p>Your incident reports will appear here</p>
          </div>
        ) : (
          <div className="table-container animate-fade-in">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Date Submitted</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const statusBadge = getStatusBadge(report.status);
                  return (
                    <tr key={report._id}>
                      <td>
                        <div className="cell-title">{report.title}</div>
                        <div className="cell-subtitle">{report.description.slice(0, 60)}...</div>
                      </td>
                      <td>
                        <span className="type-label">{report.type.replace('_', ' ')}</span>
                      </td>
                      <td>
                        <span className={`badge ${getSeverityClass(report.severity)}`}>
                          {report.severity}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: statusBadge.color,
                            color: 'white',
                            fontWeight: 600,
                          }}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td>
                        <span className="date-cell">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;

