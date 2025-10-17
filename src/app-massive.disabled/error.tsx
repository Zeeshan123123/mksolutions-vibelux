'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { logger } from '@/lib/client-logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error('system', 'Application error:', error );
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="max-w-md w-full px-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Something went wrong!
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
            >
              Go Home
            </Button>
            <Button
              onClick={reset}
            >
              Try Again
            </Button>
          </div>
          {error.digest && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}