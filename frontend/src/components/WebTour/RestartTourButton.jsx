import React from 'react';
import './RestartTourButton.css';

const RestartTourButton = ({ onRestart }) => {
  return (
    <button className="restart-tour-button" onClick={onRestart}>
      🎯 Restart Tour
    </button>
  );
};

export default RestartTourButton; 