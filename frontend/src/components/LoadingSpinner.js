import React from 'react';
import { ClipLoader } from 'react-spinners';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ 
  size = 50,
  color = '#0066cc',
  loading = true,
  text = 'Loading...',
  showText = true
}) => {
  return (
    <div className="loading-spinner-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <ClipLoader
        color={color}
        loading={loading}
        size={size}
        aria-label="Loading Spinner"
      />
      {showText && (
        <span style={{ marginTop: '10px', color: '#666' }}>
          {text}
        </span>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  loading: PropTypes.bool,
  text: PropTypes.string,
  showText: PropTypes.bool
};

export default LoadingSpinner;
