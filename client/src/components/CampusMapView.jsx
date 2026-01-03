import { useState, useEffect, useRef } from 'react';
import { CAMPUS_LOCATIONS, getLocationById, getLocationName } from '../data/campusLocations';

const CampusMapView = ({ 
  incidents = [], 
  emergencyAlerts = [], 
  onMarkerClick = null,
  selectedItem = null 
}) => {
  const [mapScale, setMapScale] = useState(1);
  const mapContainerRef = useRef(null);
  const imageRef = useRef(null);

  // Calculate scale based on container size
  useEffect(() => {
    const updateScale = () => {
      if (mapContainerRef.current && imageRef.current) {
        const container = mapContainerRef.current;
        const img = imageRef.current;
        
        const naturalWidth = img.naturalWidth || 800;
        const naturalHeight = img.naturalHeight || 600;
        
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const scaleX = containerWidth / naturalWidth;
        const scaleY = containerHeight / naturalHeight;
        const scale = Math.min(scaleX, scaleY, 1);
        
        setMapScale(scale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#26de81',
      medium: '#ffd53d',
      high: '#ff6b35',
      critical: '#ff4757',
    };
    return colors[severity] || colors.medium;
  };

  // Group incidents by locationId
  const incidentsByLocation = {};
  incidents.forEach(incident => {
    if (incident.locationId) {
      if (!incidentsByLocation[incident.locationId]) {
        incidentsByLocation[incident.locationId] = [];
      }
      incidentsByLocation[incident.locationId].push(incident);
    }
  });

  // Group emergency alerts by locationId
  const alertsByLocation = {};
  emergencyAlerts.forEach(alert => {
    if (alert.location?.locationId) {
      if (!alertsByLocation[alert.location.locationId]) {
        alertsByLocation[alert.location.locationId] = [];
      }
      alertsByLocation[alert.location.locationId].push(alert);
    }
  });

  const handleMarkerClick = (locationId, items) => {
    if (onMarkerClick) {
      onMarkerClick({ locationId, items });
    }
  };

  return (
    <div className="campus-map-view">
      <div className="map-container" ref={mapContainerRef}>
        <img
          ref={imageRef}
          src="/campus-map.jpg"
          alt="Campus Map"
          className="campus-map-image"
          onLoad={() => {
            if (mapContainerRef.current && imageRef.current) {
              const container = mapContainerRef.current;
              const img = imageRef.current;
              const naturalWidth = img.naturalWidth;
              const naturalHeight = img.naturalHeight;
              const containerWidth = container.clientWidth;
              const containerHeight = container.clientHeight;
              const scaleX = containerWidth / naturalWidth;
              const scaleY = containerHeight / naturalHeight;
              const scale = Math.min(scaleX, scaleY, 1);
              setMapScale(scale);
            }
          }}
        />
        <div className="markers-layer" style={{ transform: `scale(${mapScale})` }}>
          {/* Render emergency alerts first (they should be on top) */}
          {Object.entries(alertsByLocation).map(([locationId, alerts]) => {
            const location = getLocationById(locationId);
            if (!location) return null;
            
            const isSelected = selectedItem && 
              (selectedItem.locationId === locationId && selectedItem.type === 'emergency');
            
            return (
              <button
                key={`emergency-${locationId}`}
                className={`emergency-marker ${isSelected ? 'selected' : ''}`}
                style={{
                  left: `${location.x}px`,
                  top: `${location.y}px`,
                }}
                onClick={() => handleMarkerClick(locationId, alerts)}
                aria-label={`Emergency at ${location.name}`}
                type="button"
              >
                <div className="marker-pulse" />
                <div className="marker-icon emergency">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="marker-badge">{alerts.length}</div>
                <div className="marker-label">{location.name}</div>
              </button>
            );
          })}
          
          {/* Render regular incidents */}
          {Object.entries(incidentsByLocation).map(([locationId, locationIncidents]) => {
            const location = getLocationById(locationId);
            if (!location) return null;
            
            // Skip if there's an emergency alert at this location (emergency takes priority)
            if (alertsByLocation[locationId]) return null;
            
            // Get the highest severity for color coding
            const highestSeverity = locationIncidents.reduce((max, incident) => {
              const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
              return severityOrder[incident.severity] > severityOrder[max] 
                ? incident.severity 
                : max;
            }, 'low');
            
            const isSelected = selectedItem && 
              (selectedItem.locationId === locationId && selectedItem.type === 'incident');
            
            return (
              <button
                key={`incident-${locationId}`}
                className={`incident-marker ${isSelected ? 'selected' : ''}`}
                style={{
                  left: `${location.x}px`,
                  top: `${location.y}px`,
                  '--marker-color': getSeverityColor(highestSeverity),
                }}
                onClick={() => handleMarkerClick(locationId, locationIncidents)}
                aria-label={`${locationIncidents.length} incident(s) at ${location.name}`}
                type="button"
              >
                <div className="marker-icon incident">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                {locationIncidents.length > 1 && (
                  <div className="marker-badge">{locationIncidents.length}</div>
                )}
                <div className="marker-label">{location.name}</div>
              </button>
            );
          })}
        </div>
      </div>
      
      <style>{`
        .campus-map-view {
          width: 100%;
          height: 100%;
        }
        
        .map-container {
          position: relative;
          width: 100%;
          height: 100%;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-tertiary);
        }
        
        .campus-map-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        
        .markers-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform-origin: top left;
          pointer-events: none;
        }
        
        .emergency-marker,
        .incident-marker {
          position: absolute;
          transform: translate(-50%, -100%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          pointer-events: all;
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
        }
        
        .emergency-marker {
          z-index: 30;
        }
        
        .marker-pulse {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 71, 87, 0.4);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .marker-icon {
          position: relative;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
          transition: all 0.2s ease;
        }
        
        .marker-icon.emergency {
          color: #ff4757;
        }
        
        .marker-icon.incident {
          color: var(--marker-color);
        }
        
        .emergency-marker:hover .marker-icon,
        .incident-marker:hover .marker-icon {
          transform: scale(1.15);
        }
        
        .emergency-marker.selected .marker-icon,
        .incident-marker.selected .marker-icon {
          transform: scale(1.25);
          filter: drop-shadow(0 0 12px currentColor);
        }
        
        .marker-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          background: white;
          border: 2px solid currentColor;
          border-radius: var(--radius-full);
          font-size: 0.625rem;
          font-weight: 700;
          color: currentColor;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .emergency-marker .marker-badge {
          color: #ff4757;
          border-color: #ff4757;
        }
        
        .marker-label {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 4px;
          padding: 0.25rem 0.5rem;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: var(--radius-sm);
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        
        .emergency-marker:hover .marker-label,
        .incident-marker:hover .marker-label,
        .emergency-marker.selected .marker-label,
        .incident-marker.selected .marker-label {
          opacity: 1;
        }
        
        @media (max-width: 640px) {
          .marker-icon.emergency {
            width: 36px;
            height: 36px;
          }
          
          .marker-icon.incident {
            width: 28px;
            height: 28px;
          }
          
          .emergency-marker,
          .incident-marker {
            min-width: 48px;
            min-height: 48px;
          }
        }
      `}</style>
    </div>
  );
};

export default CampusMapView;

