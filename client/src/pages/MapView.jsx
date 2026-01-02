import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import Navbar from '../components/Navbar';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Custom marker icons
const createIcon = (color) => new L.DivIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: ${color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const incidentIcon = createIcon('#ff4757');
const lostIcon = createIcon('#ff6b35');
const foundIcon = createIcon('#26de81');

const MapView = () => {
  const [incidents, setIncidents] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showLostItems, setShowLostItems] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const defaultCenter = [9.0305, 38.7633];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [incidentsRes, lostItemsRes] = await Promise.all([
        axios.get(`${API_URL}/incidents`),
        axios.get(`${API_URL}/lost-items`),
      ]);
      setIncidents(incidentsRes.data);
      setLostItems(lostItemsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'var(--accent-success)',
      medium: 'var(--accent-warning)',
      high: 'var(--accent-primary)',
      critical: 'var(--accent-danger)',
    };
    return colors[severity] || colors.medium;
  };

  const incidentsWithLocation = incidents.filter(i => i.location?.lat && i.location?.lng);
  const lostItemsWithLocation = lostItems.filter(i => i.location?.lat && i.location?.lng);

  return (
    <div className="app-container">
      <Navbar />
      <div className="map-page">
        <div className="map-sidebar">
          <div className="sidebar-header">
            <h2>Campus Map</h2>
            <p>View incidents and lost items across campus</p>
          </div>

          <div className="layer-controls">
            <h3>Layers</h3>
            <label className="layer-toggle">
              <input
                type="checkbox"
                checked={showIncidents}
                onChange={(e) => setShowIncidents(e.target.checked)}
              />
              <span className="toggle-indicator incidents" />
              <span className="toggle-text">
                Incidents
                <span className="count">{incidentsWithLocation.length}</span>
              </span>
            </label>
            <label className="layer-toggle">
              <input
                type="checkbox"
                checked={showLostItems}
                onChange={(e) => setShowLostItems(e.target.checked)}
              />
              <span className="toggle-indicator lost-found" />
              <span className="toggle-text">
                Lost & Found
                <span className="count">{lostItemsWithLocation.length}</span>
              </span>
            </label>
          </div>

          <div className="legend">
            <h3>Legend</h3>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#ff4757' }} />
                Incidents
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#ff6b35' }} />
                Lost Items
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#26de81' }} />
                Found Items
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
                {[...incidents.slice(0, 3), ...lostItems.slice(0, 3)]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((item, index) => (
                    <div
                      key={item._id}
                      className={`activity-item ${selectedItem?._id === item._id ? 'active' : ''}`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div
                        className="activity-indicator"
                        style={{
                          background: item.severity
                            ? '#ff4757'
                            : item.status === 'found'
                            ? '#26de81'
                            : '#ff6b35',
                        }}
                      />
                      <div className="activity-content">
                        <span className="activity-title">{item.title}</span>
                        <span className="activity-meta">
                          {item.severity ? 'Incident' : item.status === 'found' ? 'Found' : 'Lost'} •{' '}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="map-container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
            </div>
          ) : (
            <MapContainer
              center={defaultCenter}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {showIncidents &&
                incidentsWithLocation.map((incident) => (
                  <Marker
                    key={incident._id}
                    position={[incident.location.lat, incident.location.lng]}
                    icon={incidentIcon}
                  >
                    <Popup>
                      <div className="popup-content">
                        <div className="popup-header">
                          <span
                            className="popup-badge"
                            style={{ background: getSeverityColor(incident.severity) }}
                          >
                            {incident.severity}
                          </span>
                          <span className="popup-type">{incident.type.replace('_', ' ')}</span>
                        </div>
                        <h4 className="popup-title">{incident.title}</h4>
                        <p className="popup-desc">{incident.description}</p>
                        {incident.locationDescription && (
                          <p className="popup-location">📍 {incident.locationDescription}</p>
                        )}
                        <p className="popup-date">
                          {new Date(incident.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {showLostItems &&
                lostItemsWithLocation.map((item) => (
                  <Marker
                    key={item._id}
                    position={[item.location.lat, item.location.lng]}
                    icon={item.status === 'found' ? foundIcon : lostIcon}
                  >
                    <Popup>
                      <div className="popup-content">
                        <div className="popup-header">
                          <span
                            className="popup-badge"
                            style={{
                              background: item.status === 'found' ? '#26de81' : '#ff6b35',
                            }}
                          >
                            {item.status}
                          </span>
                          <span className="popup-type">{item.category}</span>
                        </div>
                        <h4 className="popup-title">{item.title}</h4>
                        <p className="popup-desc">{item.description}</p>
                        {item.locationDescription && (
                          <p className="popup-location">📍 {item.locationDescription}</p>
                        )}
                        <p className="popup-date">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
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
        
        .toggle-indicator.incidents {
          background: rgba(255, 71, 87, 0.3);
        }
        
        .toggle-indicator.lost-found {
          background: rgba(255, 107, 53, 0.3);
        }
        
        .layer-toggle input:checked + .toggle-indicator {
          border-color: currentColor;
        }
        
        .layer-toggle input:checked + .toggle-indicator.incidents {
          background: #ff4757;
          border-color: #ff4757;
        }
        
        .layer-toggle input:checked + .toggle-indicator.lost-found {
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

