import React, { Component, ReactNode } from 'react';
import { DiagnosticReport } from '../../DiagnosticReport';
import { logger } from '@/lib/logging/production-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  showDiagnostic: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDiagnostic: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDiagnostic: false };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('system', 'ErrorBoundary caught an error:', error, errorInfo );
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <div className="flex items-center justify-center h-full bg-gray-900 text-red-400 p-4">
            <div className="text-center">
              <h2 className="text-xl mb-2">Canvas Error</h2>
              <p className="text-sm mb-4">{this.state.error?.message || 'Something went wrong'}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null, showDiagnostic: false })}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Try Again
                </button>
                <button
                  onClick={() => this.setState({ showDiagnostic: true })}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Report Issue
                </button>
              </div>
            </div>
          </div>
          {this.state.showDiagnostic && (
            <DiagnosticReport
              errorInfo={{
                message: this.state.error?.message || 'Unknown error',
                stack: this.state.error?.stack,
                componentStack: this.state.errorInfo?.componentStack,
              }}
              onClose={() => this.setState({ showDiagnostic: false })}
            />
          )}
        </>
      );
    }

    return this.props.children;
  }
}