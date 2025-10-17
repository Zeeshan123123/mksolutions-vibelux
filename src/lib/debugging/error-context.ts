// Enhanced error tracking with detailed context

interface ErrorContext {
  // Error details
  message: string;
  stack?: string;
  type: 'error' | 'warning' | '404' | 'network' | 'permission' | 'validation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Location context
  url: string;
  route: string;
  component?: string;
  line?: number;
  column?: number;
  
  // User context
  userId?: string;
  sessionId: string;
  userAgent: string;
  
  // Environment
  timestamp: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  
  // Technical details
  browser: {
    name: string;
    version: string;
    platform: string;
  };
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
  
  // Network
  connection?: {
    type: string;
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  
  // Additional context
  metadata?: Record<string, any>;
  breadcrumbs: Breadcrumb[];
  lastApiCalls: ApiCall[];
}

interface Breadcrumb {
  timestamp: string;
  type: 'navigation' | 'click' | 'api' | 'console' | 'custom';
  message: string;
  data?: any;
}

interface ApiCall {
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  error?: string;
}

class ErrorContextCollector {
  private breadcrumbs: Breadcrumb[] = [];
  private apiCalls: ApiCall[] = [];
  private maxBreadcrumbs = 20;
  private maxApiCalls = 10;
  
  constructor() {
    this.setupListeners();
  }
  
  private setupListeners() {
    // Track navigation
    if (typeof window !== 'undefined') {
      const originalPushState = history.pushState;
      history.pushState = (...args) => {
        this.addBreadcrumb({
          type: 'navigation',
          message: `Navigated to ${args[2]}`,
          data: { url: args[2] }
        });
        return originalPushState.apply(history, args);
      };
      
      window.addEventListener('popstate', () => {
        this.addBreadcrumb({
          type: 'navigation',
          message: `Navigated to ${window.location.pathname}`,
          data: { url: window.location.pathname }
        });
      });
      
      // Track clicks
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const selector = this.getElementSelector(target);
        this.addBreadcrumb({
          type: 'click',
          message: `Clicked ${selector}`,
          data: { selector, text: target.textContent?.slice(0, 50) }
        });
      }, true);
      
      // Track console errors
      const originalError = console.error;
      console.error = (...args) => {
        this.addBreadcrumb({
          type: 'console',
          message: 'Console error',
          data: { args: args.map(arg => String(arg).slice(0, 200)) }
        });
        return originalError.apply(console, args);
      };
      
      // Track API calls
      this.interceptFetch();
      this.interceptXHR();
    }
  }
  
  private interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = Date.now();
      const [url, options] = args;
      const method = options?.method || 'GET';
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - start;
        
        this.addApiCall({
          method,
          url: url.toString(),
          status: response.status,
          duration
        });
        
        if (!response.ok) {
          this.addBreadcrumb({
            type: 'api',
            message: `API error: ${method} ${url} (${response.status})`,
            data: { status: response.status, statusText: response.statusText }
          });
        }
        
        return response;
      } catch (error) {
        const duration = Date.now() - start;
        this.addApiCall({
          method,
          url: url.toString(),
          duration,
          error: error instanceof Error ? error.message : 'Network error'
        });
        throw error;
      }
    };
  }
  
  private interceptXHR() {
    const XHR = XMLHttpRequest.prototype;
    const originalOpen = XHR.open;
    const originalSend = XHR.send;
    
    XHR.open = function(method: string, url: string, ...rest: any[]) {
      this._method = method;
      this._url = url;
      this._startTime = Date.now();
      return originalOpen.apply(this, [method, url, ...rest]);
    };
    
    XHR.send = function(...args: any[]) {
      this.addEventListener('load', () => {
        const duration = Date.now() - this._startTime;
        
        (window as any).errorContextCollector?.addApiCall({
          method: this._method,
          url: this._url,
          status: this.status,
          duration
        });
      });
      
      this.addEventListener('error', () => {
        const duration = Date.now() - this._startTime;
        
        (window as any).errorContextCollector?.addApiCall({
          method: this._method,
          url: this._url,
          duration,
          error: 'Network error'
        });
      });
      
      return originalSend.apply(this, args);
    };
  }
  
  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }
  
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>) {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: new Date().toISOString()
    });
    
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }
  
  addApiCall(apiCall: Omit<ApiCall, 'timestamp'>) {
    this.apiCalls.push({
      ...apiCall,
      timestamp: new Date().toISOString()
    });
    
    if (this.apiCalls.length > this.maxApiCalls) {
      this.apiCalls.shift();
    }
  }
  
  collectContext(error: Error, additionalInfo?: any): ErrorContext {
    const context: ErrorContext = {
      // Error details
      message: error.message,
      stack: error.stack,
      type: this.categorizeError(error),
      severity: this.assessSeverity(error),
      
      // Location
      url: window.location.href,
      route: window.location.pathname,
      component: this.extractComponent(error.stack),
      ...this.extractLineInfo(error.stack),
      
      // User context
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      
      // Environment
      timestamp: new Date().toISOString(),
      environment: this.getEnvironment(),
      version: this.getAppVersion(),
      
      // Browser info
      browser: this.getBrowserInfo(),
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio || 1
      },
      
      // Memory info
      memory: this.getMemoryInfo(),
      
      // Network info
      connection: this.getConnectionInfo(),
      
      // Context
      metadata: additionalInfo,
      breadcrumbs: [...this.breadcrumbs],
      lastApiCalls: [...this.apiCalls]
    };
    
    return context;
  }
  
  private categorizeError(error: Error): ErrorContext['type'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('404') || message.includes('not found')) return '404';
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('permission') || message.includes('unauthorized')) return 'permission';
    if (message.includes('validation') || message.includes('invalid')) return 'validation';
    
    return 'error';
  }
  
  private assessSeverity(error: Error): ErrorContext['severity'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) return 'critical';
    if (message.includes('error') || message.includes('failed')) return 'high';
    if (message.includes('warning')) return 'medium';
    
    return 'low';
  }
  
  private extractComponent(stack?: string): string | undefined {
    if (!stack) return undefined;
    
    const match = stack.match(/at\s+(\w+)\s+\(/);
    return match ? match[1] : undefined;
  }
  
  private extractLineInfo(stack?: string): { line?: number; column?: number } {
    if (!stack) return {};
    
    const match = stack.match(/:(\d+):(\d+)/);
    if (match) {
      return {
        line: parseInt(match[1]),
        column: parseInt(match[2])
      };
    }
    
    return {};
  }
  
  private getUserId(): string | undefined {
    // Get from Clerk or your auth system
    return (window as any).Clerk?.user?.id;
  }
  
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('vibelux_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('vibelux_session_id', sessionId);
    }
    return sessionId;
  }
  
  private getEnvironment(): ErrorContext['environment'] {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'development';
    if (hostname.includes('staging')) return 'staging';
    return 'production';
  }
  
  private getAppVersion(): string {
    return process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  }
  
  private getBrowserInfo() {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';
    
    if (ua.includes('Chrome')) {
      name = 'Chrome';
      version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Safari')) {
      name = 'Safari';
      version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Firefox')) {
      name = 'Firefox';
      version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
    }
    
    return {
      name,
      version,
      platform: navigator.platform
    };
  }
  
  private getMemoryInfo() {
    const memory = (performance as any).memory;
    if (!memory) return undefined;
    
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576),
      total: Math.round(memory.totalJSHeapSize / 1048576),
      limit: Math.round(memory.jsHeapSizeLimit / 1048576)
    };
  }
  
  private getConnectionInfo() {
    const connection = (navigator as any).connection;
    if (!connection) return undefined;
    
    return {
      type: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0
    };
  }
}

// Create singleton instance
export const errorContextCollector = typeof window !== 'undefined' 
  ? new ErrorContextCollector() 
  : null;

// Store on window for global access
if (typeof window !== 'undefined') {
  (window as any).errorContextCollector = errorContextCollector;
}

export type { ErrorContext, Breadcrumb, ApiCall };