/**
 * Client-Side Logger
 * Safe logging for browser environments
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogContext = 'api' | 'auth' | 'database' | 'ai' | 'security' | 'user' | 'system' | 'pest' | 'energy';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: LogContext;
  message: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class ClientLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment) {
      // In production, only log errors and warnings
      return level === 'error' || level === 'warn' || level === 'fatal';
    }
    return true;
  }

  private createLogEntry(
    level: LogLevel,
    context: LogContext,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      metadata
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    return entry;
  }

  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const prefix = `[${entry.level.toUpperCase()}] ${entry.context}:`;
    
    switch (entry.level) {
      case 'debug':
        console.debug(prefix, entry.message, entry.metadata || '');
        break;
      case 'info':
        console.info(prefix, entry.message, entry.metadata || '');
        break;
      case 'warn':
        console.warn(prefix, entry.message, entry.metadata || '', entry.error || '');
        break;
      case 'error':
      case 'fatal':
        console.error(prefix, entry.message, entry.error || '', entry.metadata || '');
        break;
    }

    // Send errors to monitoring service in production
    if (entry.level === 'error' || entry.level === 'fatal') {
      this.sendToMonitoring(entry);
    }
  }

  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    if (this.isDevelopment) return;

    try {
      // Send to monitoring endpoint (can be configured)
      await fetch('/api/monitoring/client-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Silently fail - don't create recursive logging
      console.error('Failed to send error to monitoring:', error);
    }
  }

  // Public logging methods
  debug(context: LogContext, message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('debug', context, message, metadata);
    this.writeLog(entry);
  }

  info(context: LogContext, message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('info', context, message, metadata);
    this.writeLog(entry);
  }

  warn(context: LogContext, message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('warn', context, message, metadata);
    this.writeLog(entry);
  }

  error(context: LogContext, message: string, error?: Error, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('error', context, message, metadata, error);
    this.writeLog(entry);
  }

  fatal(context: LogContext, message: string, error?: Error, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry('fatal', context, message, metadata, error);
    this.writeLog(entry);
  }
}

// Export single instance
export const clientLogger = new ClientLogger();

// Convenience export for backward compatibility
export const logger = clientLogger;

export default clientLogger;