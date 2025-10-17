// Comprehensive Error Tracking and Debugging System
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

export interface ErrorContext {
  userId?: string;
  sessionId: string;
  userAgent: string;
  url: string;
  timestamp: Date;
  additionalData?: Record<string, any>;
}

export interface CalculationDebugInfo {
  step: string;
  input: any;
  output: any;
  timestamp: number;
  processingTime: number;
  warnings?: string[];
  errors?: string[];
}

export interface UserAction {
  type: string;
  payload: any;
  timestamp: number;
  elementId?: string;
  coordinates?: { x: number; y: number };
}

export class ErrorTracker {
  private static instance: ErrorTracker;
  private errorQueue: any[] = [];
  private actionHistory: UserAction[] = [];
  private calculationDebugLog: CalculationDebugInfo[] = [];
  private maxHistorySize = 50;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    if (typeof window !== 'undefined') {
      this.initializeErrorHandlers();
    }
  }

  static getInstance(): ErrorTracker {
    if (!this.instance) {
      this.instance = new ErrorTracker();
    }
    return this.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'javascript_error',
        error: {
          message: event.error?.message || event.message,
          stack: event.error?.stack,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        severity: 'error'
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'unhandled_promise_rejection',
        error: {
          reason: event.reason,
          stack: event.reason?.stack
        },
        severity: 'error'
      });
    });

    // React error boundary integration
    this.setupReactErrorHandler();
  }

  private setupReactErrorHandler() {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this is a React error
      if (args.some(arg => typeof arg === 'string' && arg.includes('React'))) {
        this.captureError({
          type: 'react_error',
          error: {
            message: args.join(' '),
            args: args
          },
          severity: 'error'
        });
      }
      originalConsoleError.apply(console, args);
    };
  }

  // Capture user actions for replay
  trackUserAction(action: UserAction) {
    this.actionHistory.push(action);
    
    // Keep only recent actions
    if (this.actionHistory.length > this.maxHistorySize) {
      this.actionHistory.shift();
    }

    // Track specific problem patterns
    this.detectProblemPatterns();
  }

  // Detect common problem patterns
  private detectProblemPatterns() {
    const recentActions = this.actionHistory.slice(-10);
    
    // Rapid clicking (potential frustration)
    const rapidClicks = recentActions.filter(a => 
      a.type === 'click' && Date.now() - a.timestamp < 5000
    );
    if (rapidClicks.length > 10) {
      this.captureError({
        type: 'user_pattern_rapid_clicking',
        error: {
          message: 'User rapidly clicking, possibly experiencing UI issues',
          clickCount: rapidClicks.length,
          actions: rapidClicks
        },
        severity: 'warning'
      });
    }

    // Repeated fixture placement failures
    const failedFixturePlacements = recentActions.filter(a => 
      a.type === 'fixture_placement_failed'
    );
    if (failedFixturePlacements.length > 3) {
      this.captureError({
        type: 'user_pattern_fixture_placement_issues',
        error: {
          message: 'User repeatedly failing to place fixtures',
          failureCount: failedFixturePlacements.length,
          actions: failedFixturePlacements
        },
        severity: 'warning'
      });
    }
  }

  // Detailed calculation debugging
  logCalculationStep(step: string, input: any, output: any, warnings?: string[], errors?: string[]) {
    const startTime = performance.now();
    
    const debugInfo: CalculationDebugInfo = {
      step,
      input: JSON.parse(JSON.stringify(input)), // Deep clone
      output: JSON.parse(JSON.stringify(output)),
      timestamp: Date.now(),
      processingTime: performance.now() - startTime,
      warnings,
      errors
    };

    this.calculationDebugLog.push(debugInfo);

    // Keep only recent calculations
    if (this.calculationDebugLog.length > 100) {
      this.calculationDebugLog.shift();
    }

    // Auto-detect calculation issues
    if (errors && errors.length > 0) {
      this.captureError({
        type: 'calculation_error',
        error: {
          step,
          errors,
          input,
          output
        },
        severity: 'error'
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔧 Calculation Step: ${step}`);
      logger.info('api', 'Input:', { data: input });
      logger.info('api', 'Output:', { data: output });
      logger.info('api', 'Processing Time:', { data: `${debugInfo.processingTime.toFixed(2)}ms` });
      if (warnings?.length) logger.warn('api', 'Warnings:', { data: warnings });
      if (errors?.length) logger.error('api', 'Errors:', errors );
      console.groupEnd();
    }
  }

  // Capture errors with full context
  async captureError(errorData: {
    type: string;
    error: any;
    severity: 'info' | 'warning' | 'error' | 'critical';
    additionalContext?: Record<string, any>;
  }) {
    const context = await this.gatherContext();
    
    const fullErrorData = {
      ...errorData,
      sessionId: this.sessionId,
      context,
      actionHistory: this.actionHistory.slice(-20), // Last 20 actions
      calculationHistory: this.calculationDebugLog.slice(-10), // Last 10 calculations
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Queue for batch sending
    this.errorQueue.push(fullErrorData);

    // Send immediately for critical errors
    if (errorData.severity === 'critical') {
      await this.flushErrors();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${errorData.severity.toUpperCase()}: ${errorData.type}`);
      logger.error('api', 'Error:', errorData.error );
      logger.info('api', 'Context:', { data: context });
      logger.info('api', 'Recent Actions:', { data: this.actionHistory.slice(-5) });
      console.groupEnd();
    }
  }

  // Gather comprehensive context
  private async gatherContext(): Promise<Record<string, any>> {
    const context: Record<string, any> = {
      // Performance metrics
      performance: {
        memory: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null,
        navigation: performance.getEntriesByType('navigation')[0]
      },
      
      // Browser context
      browser: {
        cookieEnabled: navigator.cookieEnabled,
        language: navigator.language,
        onLine: navigator.onLine,
        platform: navigator.platform,
        vendor: navigator.vendor
      },
      
      // Screen context
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        pixelDepth: screen.pixelDepth
      },
      
      // Window context
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        location: {
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash
        }
      }
    };

    // Try to get design context if available
    try {
      const designContext = this.gatherDesignContext();
      if (designContext) {
        context.design = designContext;
      }
    } catch (e) {
      // Ignore if design context not available
    }

    return context;
  }

  // Gather design-specific context
  private gatherDesignContext(): Record<string, any> | null {
    try {
      // Try to get data from localStorage
      const designerState = localStorage.getItem('designer_state');
      const lastError = localStorage.getItem('last_calculation_error');
      
      return {
        designerState: designerState ? JSON.parse(designerState) : null,
        lastCalculationError: lastError ? JSON.parse(lastError) : null,
        currentPath: window.location.pathname,
        timestamp: Date.now()
      };
    } catch {
      return null;
    }
  }

  // Send errors to server
  async flushErrors() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await fetch('/api/debug/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ errors })
      });
    } catch (e) {
      // If sending fails, put errors back in queue
      this.errorQueue.unshift(...errors);
      logger.error('api', 'Failed to send error reports:', e);
    }
  }

  // Get debug session data for support
  getDebugSession(): {
    sessionId: string;
    actionHistory: UserAction[];
    calculationHistory: CalculationDebugInfo[];
    errorHistory: any[];
  } {
    return {
      sessionId: this.sessionId,
      actionHistory: this.actionHistory,
      calculationHistory: this.calculationDebugLog,
      errorHistory: this.errorQueue
    };
  }

  // Generate support ticket data
  generateSupportTicket(): string {
    const session = this.getDebugSession();
    
    return `
DEBUG SESSION REPORT
====================
Session ID: ${session.sessionId}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

RECENT ACTIONS (${session.actionHistory.length}):
${session.actionHistory.slice(-10).map((action, i) => 
  `${i + 1}. [${new Date(action.timestamp).toISOString()}] ${action.type}: ${JSON.stringify(action.payload)}`
).join('\n')}

CALCULATION HISTORY (${session.calculationHistory.length}):
${session.calculationHistory.slice(-5).map((calc, i) => 
  `${i + 1}. [${calc.step}] ${calc.processingTime.toFixed(2)}ms - ${calc.errors?.length || 0} errors, ${calc.warnings?.length || 0} warnings`
).join('\n')}

ERROR HISTORY (${session.errorHistory.length}):
${session.errorHistory.slice(-5).map((error, i) => 
  `${i + 1}. [${error.severity}] ${error.type}: ${JSON.stringify(error.error)}`
).join('\n')}
    `.trim();
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// Convenience functions
export const trackAction = (type: string, payload: any, elementId?: string, coordinates?: { x: number; y: number }) => {
  errorTracker.trackUserAction({
    type,
    payload,
    timestamp: Date.now(),
    elementId,
    coordinates
  });
};

export const logCalculation = (step: string, input: any, output: any, warnings?: string[], errors?: string[]) => {
  errorTracker.logCalculationStep(step, input, output, warnings, errors);
};

export const captureError = (type: string, error: any, severity: 'info' | 'warning' | 'error' | 'critical' = 'error', additionalContext?: Record<string, any>) => {
  errorTracker.captureError({
    type,
    error,
    severity,
    additionalContext
  });
};