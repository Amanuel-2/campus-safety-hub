import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CampusMapView from '../components/CampusMapView';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MapView = () => {
  const [incidents, setIncidents] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showEmergencies, setShowEmergencies] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [incidentsRes, emergenciesRes] = await Promise.all([
        axios.get(`${API_URL}/incidents`),
        axios.get(`${API_URL}/emergency`),
      ]);
      setIncidents(incidentsRes.data);
      setEmergencyAlerts(emergenciesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = ({ locationId, items }) => {
    if (items && items.length > 0) {
      setSelectedItem({
        locationId,
        type: items[0].emergencyType ? 'emergency' : 'incident',
        items,
      });
    }
  };

  const filteredIncidents = showIncidents ? incidents : [];
  const filteredEmergencies = showEmergencies ? emergencyAlerts : [];

  return (
    <div className="app-container">
      <Navbar />
      <div className="map-page">
        <div className="map-sidebar">
          <div className="sidebar-header">
            <h2>Campus Map</h2>
            <p>View incidents across campus</p>
          </div>

          <div className="layer-controls">
            <h3>Layers</h3>
            <label className="layer-toggle">
              <input
                type="checkbox"
                checked={showEmergencies}
                onChange={(e) => setShowEmergencies(e.target.checked)}
              />
              <span className="toggle-indicator emergencies" />
              <span className="toggle-text">
                Emergency Alerts
                <span className="count">{emergencyAlerts.length}</span>
              </span>
            </label>
            <label className="layer-toggle">
              <input
                type="checkbox"
                checked={showIncidents}
                onChange={(e) => setShowIncidents(e.target.checked)}
              />
              <span className="toggle-indicator incidents" />
              <span className="toggle-text">
                Incidents
                <span className="count">{incidents.length}</span>
              </span>
            </label>
          </div>

          <div className="legend">
            <h3>Legend</h3>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-dot emergency" />
                Emergency Alerts
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#26de81' }} />
                Low Severity
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#ffd53d' }} />
                Medium Severity
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#ff6b35' }} />
                High Severity
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#ff4757' }} />
                Critical Severity
              </div>
            </div>
          </div>

          <div className="recent-items">
            <h3>Recent Activity</h3>
            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
              </div>
            ) : (
              <div className="activity-list">
                {[
                  ...emergencyAlerts.map(a => ({ ...a, type: 'emergency', title: `Emergency: ${a.emergencyType}` })),
                  ...incidents.map(i => ({ ...i, type: 'incident' })),
                ]
                  .sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp))
                  .slice(0, 10)
                  .map((item) => (
                    <div
                      key={item._id}
                      className={`activity-item ${selectedItem?.locationId && selectedItem.items?.some(i => i._id === item._id) ? 'active' : ''}`}
                      onClick={() => {
                        if (item.type === 'emergency') {
                          setSelectedItem({
                            locationId: item.location?.locationId,
                            type: 'emergency',
                            items: [item],
                          });
                        } else {
                          setSelectedItem({
                            locationId: item.locationId,
                            type: 'incident',
                            items: [item],
                          });
                        }
                      }}
                    >
                      <div
                        className="activity-indicator"
                        style={{
                          background: item.type === 'emergency' ? '#ff4757' : '#ff6b35',
                        }}
                      />
                      <div className="activity-content">
                        <span className="activity-title">{item.title}</span>
                        <span className="activity-meta">
                          {item.type === 'emergency' ? 'Emergency' : 'Incident'} •{' '}
                          {new Date(item.createdAt || item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          
          {selectedItem && (
            <div className="selected-item-details">
              <h3>Details</h3>
              {selectedItem.items?.map((item) => (
                <div key={item._id} className="detail-card">
                  <div className="detail-header">
                    <span className="detail-type">{item.type === 'emergency' ? 'Emergency' : 'Incident'}</span>
                    <span className="detail-date">
                      {new Date(item.createdAt || item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="detail-title">{item.title || `Emergency: ${item.emergencyType}`}</h4>
                  {item.description && (
                    <p className="detail-description">{item.description}</p>
                  )}
                  {item.location?.locationId && (
                    <p className="detail-location">
                      📍 Location: {item.location.locationId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="map-container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
            </div>
          ) : (
            <CampusMapView
              incidents={filteredIncidents}
              emergencyAlerts={filteredEmergencies}
              onMarkerClick={handleMarkerClick}
              selectedItem={selectedItem}
            />
          )}
        </div>
      </div>

      <style>{`
        .map-page {
          display: flex;
          height: calc(100vh - 60px);
          overflow: hidden;
        }
        
        .map-sidebar {
          width: 320px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .sidebar-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        
        .sidebar-header p {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        
        .layer-controls {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .layer-controls h3,
        .legend h3,
        .recent-items h3 {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.75rem;
        }
        
        .layer-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0;
          cursor: pointer;
        }
        
        .layer-toggle input {
          display: none;
        }
        
        .toggle-indicator {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 2px solid var(--border-color);
          transition: all 0.2s ease;
        }
        
        .toggle-indicator.emergencies {
          background: rgba(255, 71, 87, 0.3);
        }
        
        .toggle-indicator.incidents {
          background: rgba(255, 107, 53, 0.3);
        }
        
        .layer-toggle input:checked + .toggle-indicator {
          border-color: currentColor;
        }
        
        .layer-toggle input:checked + .toggle-indicator.emergencies {
          background: #ff4757;
          border-color: #ff4757;
        }
        
        .layer-toggle input:checked + .toggle-indicator.incidents {
          background: #ff6b35;
          border-color: #ff6b35;
        }
        
        .toggle-text {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .count {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-muted);
          background: var(--bg-tertiary);
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-full);
        }
        
        .legend {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .legend-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .recent-items {
          flex: 1;
          padding: 1.25rem 1.5rem;
          overflow-y: auto;
        }
        
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        
        .activity-item:hover {
          background: var(--bg-hover);
        }
        
        .activity-item.active {
          border-color: var(--accent-primary);
          background: rgba(255, 107, 53, 0.1);
        }
        
        .activity-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }
        
        .activity-content {
          flex: 1;
          min-width: 0;
        }
        
        .activity-title {
          display: block;
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .activity-meta {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.125rem;
        }
        
        .map-container {
          flex: 1;
          position: relative;
        }
        
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .popup-content {
          min-width: 200px;
        }
        
        .popup-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .popup-badge {
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-full);
          font-size: 0.625rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
        }
        
        .popup-type {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }
        
        .popup-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.375rem;
        }
        
        .popup-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 0.5rem;
        }
        
        .popup-location {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.375rem;
        }
        
        .popup-date {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }
        
        @media (max-width: 768px) {
          .map-page {
            flex-direction: column;
          }
          
          .map-sidebar {
            width: 100%;
            max-height: 40vh;
          }
          
          .map-container {
            min-height: 60vh;
          }
        }
      `}</style>
    </div>
  );
};

export default MapView;

