import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled application error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen flex items-center justify-center p-6"
          style={{
            backgroundColor: 'var(--color-paper)',
            color: 'var(--color-ink)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <div
            className="max-w-md w-full p-8 text-center"
            style={{
              backgroundColor: 'var(--color-paper-2)',
              border: '2px solid var(--color-ink)',
              boxShadow: '6px 6px 0px var(--color-ink)',
            }}
          >
            <span
              className="text-xs font-mono tracking-widest uppercase block mb-3"
              style={{ color: 'var(--color-ink-3)' }}
            >
              Application Notice
            </span>
            <h1
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Something went wrong
            </h1>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--color-ink-2)', lineHeight: 1.6 }}
            >
              A script or visual component encountered an unexpected issue while loading.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="btn-primary w-full"
              style={{ cursor: 'pointer' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
