import React from 'react';
import PropTypes from 'prop-types';
import { FaExclamationCircle } from 'react-icons/fa';

const ErrorMessage = ({
  message = 'Something went wrong. Please try again.',
  type = 'error',
  showIcon = true,
  className = ''
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          backgroundColor: '#fff3cd',
          color: '#856404',
          borderColor: '#ffeeba'
        };
      case 'error':
      default:
        return {
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderColor: '#f5c6cb'
        };
    }
  };

  const containerStyles = {
    padding: '12px 20px',
    marginBottom: '15px',
    border: '1px solid',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    ...getTypeStyles()
  };

  return (
    <div style={containerStyles} className={`error-message ${className}`} role="alert">
      {showIcon && <FaExclamationCircle />}
      <span>{message}</span>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['error', 'warning']),
  showIcon: PropTypes.bool,
  className: PropTypes.string
};

export default ErrorMessage;
