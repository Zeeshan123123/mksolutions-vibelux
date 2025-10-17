'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Download, Send, Home } from 'lucide-react';
import { logger } from '@/lib/client-logger';
import { toast } from '@/components/ui/use-toast';

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: boolean;
  errorBoundaryName?: string;
  errorMessage?: string;
  errorStack?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  errorCount: number;
}

export class ErrorBoundaryAdvanced extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    resetKeys?: Array<string | number>;
    resetOnPropsChange?: boolean;
    isolate?: boolean;
    level?: 'page' | 'section' | 'component';
  },
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    
    // Enhanced error logging
    const errorDetails = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      memory: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1048576),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1048576)
      } : null
    };

    // Log to console with formatting
    console.group(`🚨 Error Boundary Caught Error [${level}]`);
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Details:', errorDetails);
    console.groupEnd();

    // Log to server
    logger.error('Design tool error boundary', errorDetails);

    // Update state
    this.setState(prevState => ({
      errorInfo: errorInfo as any,
      errorCount: prevState.errorCount + 1
    }));

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo as any);
    }

    // Auto-recover for minor errors
    if (level === 'component' && this.state.errorCount < 3) {
      this.scheduleReset(5000);
    }
  }

  componentDidUpdate(prevProps: any) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    // Reset on prop changes if specified
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, idx) => key !== this.previousResetKeys[idx])) {
        this.resetErrorBoundary();
      }
    }
    
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
    
    this.previousResetKeys = resetKeys || [];
  }

  scheduleReset = (delay: number) => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
      toast({
        title: 'Auto-Recovery',
        description: 'The component has been automatically reset.',
      });
    }, delay);
  };

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      errorCount: 0
    });
  };

  generateErrorReport = () => {
    const { error, errorInfo, errorId } = this.state;
    
    const report = {
      errorId,
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message,
        stack: error?.stack
      },
      componentStack: errorInfo?.componentStack,
      browser: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      system: {
        memory: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1048576),
          total: Math.round((performance as any).memory.totalJSHeapSize / 1048576)
        } : null
      }
    };
    
    return report;
  };

  downloadErrorReport = () => {
    const report = this.generateErrorReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${this.state.errorId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Report Downloaded',
      description: 'Error report has been saved to your device.',
    });
  };

  sendErrorReport = async () => {
    try {
      const report = this.generateErrorReport();
      
      // Send to error reporting service
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      
      toast({
        title: 'Report Sent',
        description: 'Error report has been sent to our team.',
      });
    } catch (error) {
      toast({
        title: 'Failed to Send Report',
        description: 'Please download the report instead.',
        variant: 'destructive'
      });
    }
  };

  render() {
    const { hasError, error, errorInfo, errorId, errorCount } = this.state;
    const { children, fallback, isolate, level = 'component' } = this.props;

    if (hasError && error) {
      // Custom fallback
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI based on level
      const isPageLevel = level === 'page';
      const isSectionLevel = level === 'section';
      
      return (
        <div className={`${isPageLevel ? 'min-h-screen' : isSectionLevel ? 'min-h-[400px]' : 'min-h-[200px]'} bg-gray-900 flex items-center justify-center p-4`}>
          <Card className="max-w-lg w-full bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-white">
                    {isPageLevel ? 'Page Error' : isSectionLevel ? 'Section Error' : 'Component Error'}
                  </CardTitle>
                  <CardDescription>
                    {errorCount > 1 && `Attempt ${errorCount} • `}
                    Error ID: {errorId.slice(-8)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-sm font-medium text-red-400 mb-1">Error Message</p>
                <p className="text-sm text-gray-300 font-mono">{error.message}</p>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="cursor-pointer">
                  <summary className="text-sm text-gray-400 hover:text-gray-300">
                    Show Technical Details
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-900 p-3 rounded overflow-auto max-h-40 text-gray-400">
                    {error.stack}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={this.resetErrorBoundary}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                {isPageLevel && (
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-gray-700">
                <Button
                  onClick={this.downloadErrorReport}
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                
                <Button
                  onClick={this.sendErrorReport}
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Report
                </Button>
              </div>
              
              {errorCount < 3 && level === 'component' && (
                <p className="text-xs text-gray-400 text-center">
                  This component will auto-reset in 5 seconds...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // Wrap children in isolated error boundary if specified
    if (isolate) {
      return (
        <div data-error-boundary={level}>
          {children}
        </div>
      );
    }

    return children;
  }
}