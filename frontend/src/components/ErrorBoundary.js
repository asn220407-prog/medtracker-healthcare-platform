import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[Clinical ErrorBoundary Caught Runtime Exception]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="clinical-error-boundary">
          <div className="clinical-error-card" role="alert" aria-live="assertive">
            <div className="clinical-error-icon">⚠️</div>
            <h2 className="clinical-error-title">Clinical Workspace Exception</h2>
            <p className="clinical-error-desc">
              The clinical interface encountered an unexpected rendering fault.
              Patient medical records and scheduled intake alarms remain safely synchronized on the server.
            </p>
            {this.state.error && (
              <div className="clinical-error-technical">
                {this.state.error.toString()}
              </div>
            )}
            <div className="clinical-error-actions">
              <button className="clinical-btn-primary" onClick={this.handleReload}>
                Reload Workspace
              </button>
              <button className="clinical-btn-secondary" onClick={this.handleHome}>
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
