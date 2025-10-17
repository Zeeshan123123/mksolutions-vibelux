'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { logger } from '@/lib/client-logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    resetErrorBoundary: () => void;
  }>;
}

export class GlobalErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    logger.error('ui', 'Global error boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Store error info in state
    this.setState({
      error,
      errorInfo
    });

    // Report to error tracking service (Sentry, etc.)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        );
      }

      // Default error UI
      return <DefaultErrorFallback 
        error={this.state.error}
        resetErrorBoundary={this.resetErrorBoundary}
        isDevelopment={process.env.NODE_ENV === 'development'}
      />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error?: Error;
  resetErrorBoundary: () => void;
  isDevelopment?: boolean;
}

function DefaultErrorFallback({ 
  error, 
  resetErrorBoundary, 
  isDevelopment = false 
}: DefaultErrorFallbackProps) {
  const handleReportError = () => {
    const subject = encodeURIComponent('VibeLux Error Report');
    const body = encodeURIComponent(`
Error: ${error?.message || 'Unknown error'}

Stack Trace:
${error?.stack || 'No stack trace available'}

Browser: ${navigator.userAgent}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
[Your description here]
    `);
    
    window.open(`mailto:support@vibelux.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="bg-red-500/10 rounded-full p-4 inline-block mb-4">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-400 mb-6">
            We're sorry for the inconvenience. An unexpected error has occurred.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {isDevelopment && error && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Error Details (Development Only)
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Message:</span>
                <p className="text-red-300 font-mono text-sm mt-1">
                  {error.message}
                </p>
              </div>
              {error.stack && (
                <div>
                  <span className="text-gray-400 text-sm">Stack Trace:</span>
                  <pre className="text-gray-300 font-mono text-xs mt-1 p-3 bg-gray-800 rounded overflow-x-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={resetErrorBoundary}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>

          <button
            onClick={handleReportError}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            <Bug className="w-5 h-5" />
            Report Error
          </button>
        </div>

        {/* Help Text */}
        <div className="text-gray-500 text-sm space-y-2">
          <p>
            If this problem persists, please contact our support team at{' '}
            <a 
              href="mailto:support@vibelux.com"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              support@vibelux.com
            </a>
          </p>
          <p>
            Error ID: {Date.now().toString(36).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default GlobalErrorBoundary;