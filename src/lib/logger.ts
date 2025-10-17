import { NextRequest } from 'next/server';

// Logger configuration
interface LogContext {
  userId?: string;
  requestId?: string;
  method?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

class Logger {
  private context: LogContext = {};
  
  // Set context for all subsequent logs
  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  // Clear context
  clearContext() {
    this.context = {};
  }

  // Create child logger with additional context
  child(context: LogContext) {
    const childLogger = new Logger();
    childLogger.context = { ...this.context, ...context };
    return childLogger;
  }

  // Core logging method
  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...this.context,
      ...(data && { data }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    // In production, send to external service (Sentry, DataDog, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry if configured
      if (process.env.SENTRY_DSN && (level === 'error' || level === 'fatal')) {
        this.sendToSentry(logEntry, error);
      }
      
      // Always log to console in structured format
      logger.info('api', JSON.stringify(logEntry));
    } else {
      // In development, use pretty printing
      const colorMap = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
        fatal: '\x1b[35m', // Magenta
      };
      const color = colorMap[level];
      const reset = '\x1b[0m';
      
      logger.info('api', `${color}[${level.toUpperCase()}]${reset} ${timestamp} - ${message}`);
      if (data) logger.info('api', 'Data:', { data: data });
      if (error) logger.error('api', 'Error:', error );
      if (Object.keys(this.context).length > 0) {
        logger.info('api', 'Context:', { data: this.context });
      }
    }
  }

  // Send error to Sentry
  private async sendToSentry(logEntry: any, error?: Error) {
    try {
      // Dynamic import to avoid loading Sentry in environments where it's not needed
      const Sentry = await import('@sentry/nextjs');
      
      if (error) {
        Sentry.captureException(error, {
          contexts: {
            log: logEntry,
          },
          level: logEntry.level === 'fatal' ? 'fatal' : 'error',
        });
      } else {
        Sentry.captureMessage(logEntry.message, {
          contexts: {
            log: logEntry,
          },
          level: 'error',
        });
      }
    } catch (err) {
      // Sentry not available or misconfigured
      logger.error('api', 'Failed to send to Sentry:', err instanceof Error ? err : undefined, err instanceof Error ? undefined : { error: err });
    }
  }

  // Public logging methods
  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any, data?: any) {
    if (error instanceof Error) {
      this.log('error', message, data, error);
    } else {
      this.log('error', message, { ...data, error });
    }
  }

  fatal(message: string, error?: Error | any, data?: any) {
    if (error instanceof Error) {
      this.log('fatal', message, data, error);
    } else {
      this.log('fatal', message, { ...data, error });
    }
    
    // In production, you might want to trigger alerts for fatal errors
    if (process.env.NODE_ENV === 'production') {
      // Trigger PagerDuty, send email, etc.
    }
  }

  // Helper to create logger from request
  static fromRequest(req: NextRequest): Logger {
    const logger = new Logger();
    logger.setContext({
      method: req.method,
      path: req.nextUrl.pathname,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] || 
          req.headers.get('x-real-ip') || 
          'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      requestId: req.headers.get('x-request-id') || crypto.randomUUID(),
    });
    return logger;
  }
}

// Export singleton instance for general use
export const logger = new Logger();

// Export class for creating custom instances
export { Logger };

// Utility function for logging API errors
export function logApiError(
  req: NextRequest,
  error: Error,
  additionalContext?: any
) {
  const requestLogger = Logger.fromRequest(req);
  requestLogger.error('API Error', error, additionalContext);
}

// Middleware to add logging to API routes
export function withLogging<T extends (...args: any[]) => any>(
  handler: T,
  options?: { logResponse?: boolean }
): T {
  return (async (...args: Parameters<T>) => {
    const start = Date.now();
    const [req] = args;
    const requestLogger = req ? Logger.fromRequest(req as NextRequest) : logger;
    
    requestLogger.info('API Request');
    
    try {
      const result = await handler(...args);
      
      const duration = Date.now() - start;
      requestLogger.info('API Response', {
        duration,
        status: result?.status || 200,
        ...(options?.logResponse && { response: result }),
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      requestLogger.error('API Error', error as Error, { duration });
      throw error;
    }
  }) as T;
}

// Performance logging utilities
export const performance = {
  mark(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name);
    }
  },
  
  measure(name: string, startMark: string, endMark?: string) {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        const measure = window.performance.measure(name, startMark, endMark);
        logger.debug(`Performance: ${name}`, {
          duration: measure.duration,
          startTime: measure.startTime,
        });
        return measure.duration;
      } catch (error) {
        logger.warn('api', { name, error });
      }
    }
    return null;
  },
};

// Energy-specific logging for Ensave integration
export const energyLogger = logger.child({ module: 'energy' });

// Database query logging
export const dbLogger = logger.child({ module: 'database' });

// Authentication logging
export const authLogger = logger.child({ module: 'auth' });