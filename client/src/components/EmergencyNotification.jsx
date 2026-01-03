import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocationName } from '../data/campusLocations';

const EmergencyNotification = ({ alert, onDismiss }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 30 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        setTimeout(onDismiss, 300); // Wait for animation
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!isVisible) return null;

  const locationName = alert.location?.locationId
    ? getLocationName(alert.location.locationId)
    : alert.location?.building || 'Unknown Location';

  const emergencyTypeLabels = {
    medical: 'Medical Emergency',
    fire: 'Fire',
    security: 'Security Threat',
    natural_disaster: 'Natural Disaster',
    other: 'Other Emergency',
  };

  const handleClick = () => {
    navigate('/admin', { state: { emergencyAlertId: alert.alertId } });
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className="emergency-notification" onClick={handleClick}>
      <div className="emergency-notification-content">
        <div className="emergency-notification-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div className="emergency-notification-text">
          <div className="emergency-notification-title">🚨 Emergency Alert</div>
          <div className="emergency-notification-details">
            <span>{emergencyTypeLabels[alert.emergencyType] || alert.emergencyType}</span>
            <span>•</span>
            <span>{locationName}</span>
            <span>•</span>
            <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
        <button
          className="emergency-notification-close"
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
            if (onDismiss) {
              setTimeout(onDismiss, 300);
            }
          }}
          aria-label="Dismiss notification"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <style>{`
        .emergency-notification {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10000;
          background: #ff4757;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideDown 0.3s ease-out;
          cursor: pointer;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .emergency-notification-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .emergency-notification-icon {
          flex-shrink: 0;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .emergency-notification-text {
          flex: 1;
          min-width: 0;
        }

        .emergency-notification-title {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .emergency-notification-details {
          font-size: 0.875rem;
          opacity: 0.95;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .emergency-notification-close {
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease;
          color: white;
        }

        .emergency-notification-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 640px) {
          .emergency-notification-content {
            padding: 0.75rem 1rem;
          }

          .emergency-notification-title {
            font-size: 1rem;
          }

          .emergency-notification-details {
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EmergencyNotification;

