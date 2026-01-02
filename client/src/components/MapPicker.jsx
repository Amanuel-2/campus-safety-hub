import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={customIcon} /> : null;
};

const MapPicker = ({ onLocationSelect, initialPosition = null }) => {
  const [position, setPosition] = useState(initialPosition);
  
  // Default center (can be your campus coordinates)
  const defaultCenter = [9.0305, 38.7633]; // Addis Ababa as example
  
  useEffect(() => {
    if (position) {
      onLocationSelect(position);
    }
  }, [position, onLocationSelect]);

  return (
    <div className="map-picker">
      <MapContainer
        center={initialPosition || defaultCenter}
        zoom={16}
        style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      <p className="map-hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
        Click on the map to select location
        {position && (
          <span className="coords">
            ({position.lat.toFixed(4)}, {position.lng.toFixed(4)})
          </span>
        )}
      </p>
      <style>{`
        .map-picker {
          margin-bottom: 0.5rem;
        }
        .map-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .map-hint svg {
          flex-shrink: 0;
        }
        .coords {
          margin-left: auto;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--accent-secondary);
        }
      `}</style>
    </div>
  );
};

export default MapPicker;

