'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react'
import { logger } from '@/lib/client-logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class MobileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo)
    
    // Log error for debugging
    logger.error('system', 'Error Boundary caught an error:', error, errorInfo )
    
    // Send error to monitoring service
    if (typeof window !== 'undefined') {
      fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
          }
        })
      }).catch(error => logger.error('system', 'Failed to report error:', error))
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isDevelopment = process.env.NODE_ENV === 'development'
      const errorMessage = this.state.error?.message || 'An unexpected error occurred'
      
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {isDevelopment ? errorMessage : 'We encountered an unexpected error. Please try again.'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {isDevelopment && this.state.error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <details className="text-xs">
                    <summary className="font-medium text-red-800 dark:text-red-400 cursor-pointer">
                      Error Details
                    </summary>
                    <pre className="mt-2 text-red-700 dark:text-red-300 whitespace-pre-wrap break-words">
                      {this.state.error.stack}
                    </pre>
                  </details>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={this.handleReset}
                  className="w-full flex items-center justify-center gap-2"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  If this problem persists, please contact support
                </p>
                <Button 
                  onClick={() => window.open('mailto:support@vibelux.ai', '_blank')}
                  className="w-full mt-2 flex items-center justify-center gap-2"
                  variant="ghost"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping components with error boundary
export function withMobileErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <MobileErrorBoundary fallback={fallback}>
      <Component {...props} />
    </MobileErrorBoundary>
  )
  
  WrappedComponent.displayName = `withMobileErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default MobileErrorBoundary