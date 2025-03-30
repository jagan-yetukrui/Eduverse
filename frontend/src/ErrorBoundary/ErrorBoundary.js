import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as Sentry from '@sentry/react'; // Ensure Sentry is configured in your project

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to display the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to an external service
    Sentry.captureException(error, { extra: errorInfo });
    this.setState({ errorInfo });
  }

  handleReset = () => {
    // Reset the state to allow retrying
    this.setState({ hasError: false, errorInfo: null });
    // Optionally, you can add logic to reset any global state or perform cleanup
  };

  render() {
    if (this.state.hasError) {
      // Render a custom fallback UI
      return (
        <div className="error-boundary">
          <h1>Oops! Something went wrong.</h1>
          <p>We're sorry for the inconvenience. Please try the following:</p>
          <ul>
            <li>Refresh the page.</li>
            <li>Contact support if the problem persists.</li>
          </ul>
          <button onClick={this.handleReset}>Try Again</button>
          {/* Optionally, display error details in development mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="error-details">
              <h2>Error Details:</h2>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </div>
          )}
        </div>
      );
    }

    // Render children components if no error
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
