/**
 * Diagnostic Report Utilities
 * Helper functions for collecting and managing diagnostic information
 */

export interface ConsoleError {
  message: string;
  stack?: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
}

export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: string;
  headers?: Record<string, string>;
}

// Initialize diagnostic data collection
export function initializeDiagnosticCollection() {
  // Store session start time
  if (!sessionStorage.getItem('sessionStart')) {
    sessionStorage.setItem('sessionStart', Date.now().toString());
  }

  // Initialize error collection arrays
  if (!sessionStorage.getItem('consoleErrors')) {
    sessionStorage.setItem('consoleErrors', JSON.stringify([]));
  }
  
  if (!sessionStorage.getItem('networkRequests')) {
    sessionStorage.setItem('networkRequests', JSON.stringify([]));
  }

  // Override console methods to capture errors
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args) => {
    captureConsoleError('error', args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args) => {
    captureConsoleError('warn', args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
    originalConsoleWarn.apply(console, args);
  };

  // Monitor network requests
  monitorNetworkRequests();

  // Track user actions
  trackUserActions();
}

// Capture console errors
function captureConsoleError(level: 'error' | 'warn' | 'info', message: string) {
  try {
    const errors = JSON.parse(sessionStorage.getItem('consoleErrors') || '[]');
    const error: ConsoleError = {
      message,
      stack: new Error().stack,
      timestamp: new Date().toISOString(),
      level,
    };
    
    errors.push(error);
    
    // Keep only last 50 errors to prevent storage overflow
    if (errors.length > 50) {
      errors.splice(0, errors.length - 50);
    }
    
    sessionStorage.setItem('consoleErrors', JSON.stringify(errors));
  } catch (e) {
    // Fail silently to avoid recursive errors
  }
}

// Monitor network requests
function monitorNetworkRequests() {
  // Override fetch
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const startTime = Date.now();
    try {
      const response = await originalFetch.apply(this, args);
      const endTime = Date.now();
      
      captureNetworkRequest({
        url: args[0] instanceof Request ? args[0].url : args[0].toString(),
        method: args[0] instanceof Request ? args[0].method : args[1]?.method || 'GET',
        status: response.status,
        responseTime: endTime - startTime,
        timestamp: new Date().toISOString(),
      });
      
      return response;
    } catch (error) {
      const endTime = Date.now();
      
      captureNetworkRequest({
        url: args[0] instanceof Request ? args[0].url : args[0].toString(),
        method: args[0] instanceof Request ? args[0].method : args[1]?.method || 'GET',
        status: 0,
        responseTime: endTime - startTime,
        timestamp: new Date().toISOString(),
      });
      
      throw error;
    }
  };

  // Override XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    (this as any)._method = method;
    (this as any)._url = url;
    (this as any)._startTime = Date.now();
    return originalOpen.apply(this, [method, url, ...args]);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    const xhr = this;
    const originalOnReadyStateChange = xhr.onreadystatechange;
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        const endTime = Date.now();
        captureNetworkRequest({
          url: (xhr as any)._url,
          method: (xhr as any)._method,
          status: xhr.status,
          responseTime: endTime - ((xhr as any)._startTime || endTime),
          timestamp: new Date().toISOString(),
        });
      }
      
      if (originalOnReadyStateChange) {
        originalOnReadyStateChange.apply(this, arguments as any);
      }
    };
    
    return originalSend.apply(this, args);
  };
}

function captureNetworkRequest(request: NetworkRequest) {
  try {
    const requests = JSON.parse(sessionStorage.getItem('networkRequests') || '[]');
    requests.push(request);
    
    // Keep only last 50 requests
    if (requests.length > 50) {
      requests.splice(0, requests.length - 50);
    }
    
    sessionStorage.setItem('networkRequests', JSON.stringify(requests));
  } catch (e) {
    // Fail silently
  }
}

// Track user actions
function trackUserActions() {
  const trackAction = (action: string) => {
    sessionStorage.setItem('lastUserAction', `${action} at ${new Date().toISOString()}`);
  };

  // Track clicks
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const elementInfo = target.tagName.toLowerCase();
    const id = target.id ? `#${target.id}` : '';
    const className = target.className ? `.${target.className.split(' ')[0]}` : '';
    trackAction(`click:${elementInfo}${id}${className}`);
  });

  // Track navigation
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    trackAction(`navigate:${args[2] || window.location.pathname}`);
    return originalPushState.apply(this, args);
  };

  history.replaceState = function(...args) {
    trackAction(`navigate:${args[2] || window.location.pathname}`);
    return originalReplaceState.apply(this, args);
  };

  window.addEventListener('popstate', () => {
    trackAction(`navigate:${window.location.pathname}`);
  });
}

// Get system information
export function getSystemInfo() {
  return {
    browser: navigator.userAgent,
    os: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    connectionType: (navigator as any).connection?.effectiveType || 'unknown',
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookieEnabled: navigator.cookieEnabled,
    onlineStatus: navigator.onLine,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
  };
}

// Get performance metrics
export function getPerformanceMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  return {
    pageLoadTime: navigation?.loadEventEnd - navigation?.fetchStart || 0,
    domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart || 0,
    renderTime: navigation?.domComplete - navigation?.domLoading || 0,
    memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
    connectionSpeed: (navigator as any).connection?.downlink || 0,
    totalPageLoadTime: performance.now(),
  };
}

// Get app state
export function getAppState() {
  return {
    currentPage: window.location.pathname,
    userAuthenticated: !!localStorage.getItem('auth_token'),
    lastAction: sessionStorage.getItem('lastUserAction') || 'unknown',
    sessionDuration: Date.now() - parseInt(sessionStorage.getItem('sessionStart') || '0'),
    featureFlags: JSON.parse(localStorage.getItem('featureFlags') || '{}'),
    localStorageSize: JSON.stringify(localStorage).length,
    sessionStorageSize: JSON.stringify(sessionStorage).length,
  };
}

// Clean up diagnostic data
export function clearDiagnosticData() {
  sessionStorage.removeItem('consoleErrors');
  sessionStorage.removeItem('networkRequests');
  sessionStorage.removeItem('lastUserAction');
  sessionStorage.removeItem('sessionStart');
}

// Check if diagnostic collection is enabled
export function isDiagnosticEnabled() {
  return localStorage.getItem('diagnosticEnabled') !== 'false';
}

// Enable/disable diagnostic collection
export function setDiagnosticEnabled(enabled: boolean) {
  localStorage.setItem('diagnosticEnabled', enabled.toString());
  if (!enabled) {
    clearDiagnosticData();
  }
}