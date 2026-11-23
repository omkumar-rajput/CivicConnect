import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React Error Boundary Caught]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center">
          <div
            className="civic-card p-4 p-md-5 bg-white border shadow-sm mx-auto"
            style={{ maxWidth: '550px' }}
          >
            <div
              className="rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}
            >
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h4 className="fw-bold text-dark mb-2">Something went wrong</h4>
            <p className="text-secondary small mb-4">
              An unexpected error occurred while rendering this view:
              <br />
              <code className="text-danger small">{this.state.error?.message || 'Rendering error'}</code>
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-civic-primary btn-sm px-4"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
              >
                <i className="bi bi-house me-1"></i> Return to Safety
              </button>
              <button
                className="btn btn-civic-outline btn-sm px-4"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Reload
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
