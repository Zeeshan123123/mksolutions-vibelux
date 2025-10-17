"use client"

import { useEffect } from 'react'
import { logger } from '@/lib/logging/production-logger';

export function GlobalErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('system', 'Unhandled promise rejection:', event.reason instanceof Error ? event.reason : undefined, event.reason instanceof Error ? undefined : { reason: event.reason })
      
      // Log additional details if available
      if (event.reason && typeof event.reason === 'object') {
        logger.error('system', 'Error details:', undefined, {
          message: event.reason.message, stack: event.reason.stack, name: event.reason.name
        })
      }
      
      // Prevent the default browser behavior
      event.preventDefault()
    }

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      logger.error('system', 'Uncaught error:', event.error )
      logger.error('system', 'Error details:', undefined, {
        message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno
      })
    }

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return null
}