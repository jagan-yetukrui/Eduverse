import React, { useEffect } from 'react';
import './Tooltip.css';

const Tooltip = ({ message, position, onNext, onSkip, isMissing, stepIndex }) => {
  // Debug logging
  useEffect(() => {
    console.log('Tooltip rendered:', { stepIndex, message, isMissing });
  }, [stepIndex, message, isMissing]);

  if (!position) return null;

  return (
    <div 
      className="tooltip-bubble"
      style={{ 
        top: position.top, 
        left: position.left,
      }}
    >
      <div className="tooltip-message">
        {isMissing ? (
          <div className="tooltip-warning">
            <span>⚠️</span>
            <span>Could not locate the element</span>
          </div>
        ) : (
          message
        )}
      </div>
      
      <div className="tooltip-actions">
        <button 
          className="tooltip-button secondary"
          onClick={onSkip}
        >
          Skip Tour
        </button>
        <button 
          className="tooltip-button primary"
          onClick={onNext}
        >
          {stepIndex === 0 ? 'Start Tour' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Tooltip; 