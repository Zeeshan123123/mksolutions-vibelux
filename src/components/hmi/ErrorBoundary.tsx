'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { DiagnosticReport } from '../DiagnosticReport';
import { logger } from '@/lib/client-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('system', 'ErrorBoundary caught an error:', error, errorInfo );
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDiagnostic: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <>
          <div className="min-h-[400px] flex items-center justify-center p-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-gray-400 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={() => this.setState({ showDiagnostic: true })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
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