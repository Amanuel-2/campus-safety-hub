import { useState, useEffect, useRef } from 'react';
import { CAMPUS_LOCATIONS } from '../data/campusLocations';

const CampusMapPicker = ({ onLocationSelect, initialLocationId = null }) => {
  const [selectedLocationId, setSelectedLocationId] = useState(initialLocationId);
  const [mapScale, setMapScale] = useState(1);
  const mapContainerRef = useRef(null);
  const imageRef = useRef(null);

  // Calculate scale based on container size
  useEffect(() => {
    const updateScale = () => {
      if (mapContainerRef.current && imageRef.current) {
        const container = mapContainerRef.current;
        const img = imageRef.current;
        
        // Get natural image dimensions
        const naturalWidth = img.naturalWidth || 800; // Fallback if image not loaded
        const naturalHeight = img.naturalHeight || 600;
        
        // Calculate scale to fit container while maintaining aspect ratio
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const scaleX = containerWidth / naturalWidth;
        const scaleY = containerHeight / naturalHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up
        
        setMapScale(scale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Notify parent when selection changes
  useEffect(() => {
    if (selectedLocationId) {
      onLocationSelect({ locationId: selectedLocationId });
    }
  }, [selectedLocationId, onLocationSelect]);

  // Update selection when initialLocationId changes
  useEffect(() => {
    if (initialLocationId) {
      setSelectedLocationId(initialLocationId);
    }
  }, [initialLocationId]);

  const handlePinClick = (locationId) => {
    setSelectedLocationId(locationId);
  };

  return (
    <div className="campus-map-picker">
      <div className="map-container" ref={mapContainerRef}>
        <img
          ref={imageRef}
          src="/campus-map.jpg"
          alt="Campus Map"
          className="campus-map-image"
          onLoad={() => {
            // Recalculate scale when image loads
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
        <div className="pins-layer" style={{ transform: `scale(${mapScale})` }}>
          {CAMPUS_LOCATIONS.map((location) => {
            const isSelected = selectedLocationId === location.id;
            return (
              <button
                key={location.id}
                className={`location-pin ${isSelected ? 'selected' : ''}`}
                style={{
                  left: `${location.x}px`,
                  top: `${location.y}px`,
                }}
                onClick={() => handlePinClick(location.id)}
                aria-label={`Select ${location.name}`}
                type="button"
              >
                <div className="pin-marker">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                {isSelected && (
                  <div className="pin-checkmark">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
                <div className="pin-label">{location.name}</div>
              </button>
            );
          })}
        </div>
      </div>
      {selectedLocationId && (
        <div className="selected-location-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Selected: {CAMPUS_LOCATIONS.find(loc => loc.id === selectedLocationId)?.name}</span>
        </div>
      )}
      <style>{`
        .campus-map-picker {
          margin-bottom: 0.5rem;
        }
        
        .map-container {
          position: relative;
          width: 100%;
          height: 400px;
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
        
        .pins-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform-origin: top left;
          pointer-events: none;
        }
        
        .location-pin {
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
          z-index: 10;
        }
        
        .pin-marker {
          position: relative;
          width: 24px;
          height: 24px;
          color: var(--accent-primary);
          transition: all 0.2s ease;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }
        
        .location-pin:hover .pin-marker {
          transform: scale(1.1);
          color: var(--accent-secondary);
        }
        
        .location-pin.selected .pin-marker {
          color: var(--accent-danger);
          transform: scale(1.3);
          filter: drop-shadow(0 0 8px rgba(255, 71, 87, 0.6));
        }
        
        .pin-checkmark {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          background: var(--accent-danger);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .pin-label {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 4px;
          padding: 0.25rem 0.5rem;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: var(--radius-sm);
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        
        .location-pin:hover .pin-label,
        .location-pin.selected .pin-label {
          opacity: 1;
        }
        
        .selected-location-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: rgba(38, 222, 129, 0.1);
          border: 1px solid rgba(38, 222, 129, 0.3);
          border-radius: var(--radius-md);
          color: var(--accent-success);
          font-size: 0.875rem;
        }
        
        .selected-location-info svg {
          flex-shrink: 0;
        }
        
        @media (max-width: 640px) {
          .map-container {
            height: 300px;
          }
          
          .pin-marker {
            width: 28px;
            height: 28px;
          }
          
          .location-pin {
            min-width: 48px;
            min-height: 48px;
          }
        }
      `}</style>
    </div>
  );
};

export default CampusMapPicker;

