import { useState } from 'react';
import EmergencyModal from './EmergencyModal';

const EmergencyButton = ({ variant = 'floating' }) => {
  const [showModal, setShowModal] = useState(false);

  const handleEmergencyClick = () => {
    // Open modal - user will select location from campus map
    setShowModal(true);
  };

  return (
    <>
      <button
        className={`emergency-button ${variant === 'hero' ? 'emergency-button-hero' : ''}`}
        onClick={handleEmergencyClick}
        aria-label="Emergency Alert"
      >
        <div className="emergency-button-content">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span className="emergency-button-text">EMERGENCY</span>
        </div>
        <div className="emergency-button-pulse" />
      </button>

      {showModal && (
        <EmergencyModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
          }}
        />
      )}

      <style>{`
        .emergency-button {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%);
          border: none;
          border-radius: 50%;
          box-shadow: 0 8px 30px rgba(255, 71, 87, 0.4), 0 0 0 0 rgba(255, 71, 87, 0.7);
          cursor: pointer;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          animation: emergencyPulse 2s infinite;
        }
        
        .emergency-button:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 40px rgba(255, 71, 87, 0.6), 0 0 0 0 rgba(255, 71, 87, 0.7);
        }
        
        .emergency-button:active {
          transform: scale(0.95);
        }
        
        .emergency-button-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          color: white;
          z-index: 2;
        }
        
        .emergency-button-text {
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .emergency-button-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(255, 71, 87, 0.4);
          animation: pulseRing 2s infinite;
        }
        
        @keyframes emergencyPulse {
          0%, 100% {
            box-shadow: 0 8px 30px rgba(255, 71, 87, 0.4), 0 0 0 0 rgba(255, 71, 87, 0.7);
          }
          50% {
            box-shadow: 0 8px 30px rgba(255, 71, 87, 0.4), 0 0 0 20px rgba(255, 71, 87, 0);
          }
        }
        
        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        .emergency-button-hero {
          position: relative;
          width: 200px;
          height: 200px;
          bottom: auto;
          right: auto;
          margin: 2rem auto;
          display: block;
          animation: emergencyPulseHero 2s infinite;
        }
        
        .emergency-button-hero .emergency-button-content {
          gap: 0.75rem;
        }
        
        .emergency-button-hero svg {
          width: 64px;
          height: 64px;
        }
        
        .emergency-button-hero .emergency-button-text {
          font-size: 1rem;
          letter-spacing: 0.15em;
        }
        
        @keyframes emergencyPulseHero {
          0%, 100% {
            box-shadow: 0 8px 30px rgba(255, 71, 87, 0.4), 0 0 0 0 rgba(255, 71, 87, 0.7);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 8px 30px rgba(255, 71, 87, 0.4), 0 0 0 30px rgba(255, 71, 87, 0);
            transform: scale(1.05);
          }
        }
        
        @media (max-width: 640px) {
          .emergency-button {
            width: 70px;
            height: 70px;
            bottom: 1.5rem;
            right: 1.5rem;
          }
          
          .emergency-button svg {
            width: 28px;
            height: 28px;
          }
          
          .emergency-button-text {
            font-size: 0.5rem;
          }
          
          .emergency-button-hero {
            width: 150px;
            height: 150px;
          }
          
          .emergency-button-hero svg {
            width: 48px;
            height: 48px;
          }
          
          .emergency-button-hero .emergency-button-text {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default EmergencyButton;
