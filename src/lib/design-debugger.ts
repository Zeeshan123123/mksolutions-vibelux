import { logger } from '@/lib/client-logger';

interface DebugEvent {
  timestamp: number;
  type: 'action' | 'render' | 'calculation' | 'error' | 'warning';
  component: string;
  details: any;
  duration?: number;
}

class DesignDebugger {
  private events: DebugEvent[] = [];
  private isEnabled: boolean = false;
  private maxEvents: number = 1000;
  private performanceMarks: Map<string, number> = new Map();
  
  constructor() {
    // Enable debugging in development or with debug flag
    this.isEnabled = process.env.NODE_ENV === 'development' || 
                    (typeof window !== 'undefined' && localStorage.getItem('vibelux_debug') === 'true');
    
    if (this.isEnabled && typeof window !== 'undefined') {
      console.log('🔧 VibeLux Design Debugger Enabled');
      this.attachGlobalHandlers();
    }
  }

  enable() {
    this.isEnabled = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('vibelux_debug', 'true');
      this.attachGlobalHandlers();
      console.log('🔧 VibeLux Design Debugger Enabled');
    }
  }

  disable() {
    this.isEnabled = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vibelux_debug');
      console.log('🔧 VibeLux Design Debugger Disabled');
    }
  }

  private attachGlobalHandlers() {
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      }, 'Global');
    });

    // Track resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        this.error('Resource Loading Error', {
          type: (event.target as any).tagName,
          src: (event.target as any).src || (event.target as any).href,
          message: event.message
        }, 'Resources');
      }
    }, true);

    // Add debug panel toggle
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        this.toggleDebugPanel();
      }
    });
  }

  // Performance tracking
  startMeasure(label: string) {
    if (!this.isEnabled) return;
    this.performanceMarks.set(label, performance.now());
  }

  endMeasure(label: string, metadata?: any) {
    if (!this.isEnabled) return;
    
    const start = this.performanceMarks.get(label);
    if (!start) {
      this.warn(`No start mark found for: ${label}`, {}, 'Performance');
      return;
    }
    
    const duration = performance.now() - start;
    this.performanceMarks.delete(label);
    
    this.log(`Performance: ${label}`, {
      duration: Math.round(duration * 100) / 100,
      ...metadata
    }, 'Performance', duration);
    
    // Warn if operation is slow
    if (duration > 100) {
      this.warn(`Slow operation: ${label}`, {
        duration: Math.round(duration * 100) / 100,
        threshold: 100
      }, 'Performance');
    }
  }

  // Event logging
  action(action: string, details: any, component: string = 'Unknown') {
    if (!this.isEnabled) return;
    
    this.addEvent({
      timestamp: Date.now(),
      type: 'action',
      component,
      details: { action, ...details }
    });
  }

  render(component: string, details: any, duration?: number) {
    if (!this.isEnabled) return;
    
    this.addEvent({
      timestamp: Date.now(),
      type: 'render',
      component,
      details,
      duration
    });
  }

  calculation(calculation: string, input: any, output: any, component: string = 'Calculator') {
    if (!this.isEnabled) return;
    
    this.addEvent({
      timestamp: Date.now(),
      type: 'calculation',
      component,
      details: { calculation, input, output }
    });
  }

  error(message: string, details: any, component: string = 'Unknown') {
    // Always log errors, even if debugging is disabled
    const event: DebugEvent = {
      timestamp: Date.now(),
      type: 'error',
      component,
      details: { message, ...details }
    };
    
    this.addEvent(event);
    
    // Also log to server
    logger.error(`Design Error: ${message}`, {
      component,
      ...details
    });
  }

  warn(message: string, details: any, component: string = 'Unknown') {
    if (!this.isEnabled) return;
    
    this.addEvent({
      timestamp: Date.now(),
      type: 'warning',
      component,
      details: { message, ...details }
    });
  }

  log(message: string, details: any, component: string = 'Unknown', duration?: number) {
    if (!this.isEnabled) return;
    
    this.addEvent({
      timestamp: Date.now(),
      type: 'action',
      component,
      details: { message, ...details },
      duration
    });
  }

  private addEvent(event: DebugEvent) {
    this.events.push(event);
    
    // Limit event history
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = {
        action: '🎯',
        render: '🎨',
        calculation: '🧮',
        error: '❌',
        warning: '⚠️'
      }[event.type];
      
      console.log(
        `${emoji} [${event.component}] ${event.details.message || event.details.action || event.type}`,
        event.details,
        event.duration ? `(${event.duration}ms)` : ''
      );
    }
  }

  // Debug panel
  private toggleDebugPanel() {
    const existingPanel = document.getElementById('vibelux-debug-panel');
    
    if (existingPanel) {
      existingPanel.remove();
      return;
    }
    
    const panel = document.createElement('div');
    panel.id = 'vibelux-debug-panel';
    panel.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 400px;
        max-height: 600px;
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        z-index: 999999;
        font-family: monospace;
        font-size: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      ">
        <div style="
          padding: 12px;
          background: #2a2a2a;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <h3 style="margin: 0; color: #fff;">🔧 Design Debugger</h3>
          <button onclick="document.getElementById('vibelux-debug-panel').remove()" 
                  style="background: none; border: none; color: #999; cursor: pointer; font-size: 16px;">
            ×
          </button>
        </div>
        <div style="
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        ">
          ${this.renderEvents()}
        </div>
        <div style="
          padding: 12px;
          background: #2a2a2a;
          border-top: 1px solid #333;
          display: flex;
          gap: 8px;
        ">
          <button onclick="window.designDebugger.clearEvents()" 
                  style="padding: 4px 12px; background: #444; border: none; color: #fff; cursor: pointer; border-radius: 4px;">
            Clear
          </button>
          <button onclick="window.designDebugger.exportEvents()" 
                  style="padding: 4px 12px; background: #444; border: none; color: #fff; cursor: pointer; border-radius: 4px;">
            Export
          </button>
          <button onclick="window.designDebugger.disable(); document.getElementById('vibelux-debug-panel').remove()" 
                  style="padding: 4px 12px; background: #444; border: none; color: #fff; cursor: pointer; border-radius: 4px;">
            Disable
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
  }

  private renderEvents(): string {
    const recentEvents = this.events.slice(-50).reverse();
    
    return recentEvents.map(event => {
      const time = new Date(event.timestamp).toLocaleTimeString();
      const color = {
        action: '#4a9eff',
        render: '#50fa7b',
        calculation: '#f1fa8c',
        error: '#ff5555',
        warning: '#ffb86c'
      }[event.type];
      
      return `
        <div style="
          margin-bottom: 8px;
          padding: 8px;
          background: #2a2a2a;
          border-left: 3px solid ${color};
          border-radius: 4px;
        ">
          <div style="color: ${color}; font-weight: bold;">
            ${event.type.toUpperCase()} - ${event.component}
            ${event.duration ? `<span style="color: #999; font-weight: normal;">(${Math.round(event.duration)}ms)</span>` : ''}
          </div>
          <div style="color: #ccc; margin-top: 4px;">
            ${JSON.stringify(event.details, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}
          </div>
          <div style="color: #666; font-size: 10px; margin-top: 4px;">${time}</div>
        </div>
      `;
    }).join('');
  }

  clearEvents() {
    this.events = [];
    this.toggleDebugPanel();
    this.toggleDebugPanel();
  }

  exportEvents() {
    const data = {
      timestamp: new Date().toISOString(),
      events: this.events,
      system: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        memory: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1048576),
          total: Math.round((performance as any).memory.totalJSHeapSize / 1048576)
        } : null
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Get summary statistics
  getStats() {
    const stats = {
      totalEvents: this.events.length,
      errors: this.events.filter(e => e.type === 'error').length,
      warnings: this.events.filter(e => e.type === 'warning').length,
      slowOperations: this.events.filter(e => e.duration && e.duration > 100).length,
      avgRenderTime: 0
    };
    
    const renderEvents = this.events.filter(e => e.type === 'render' && e.duration);
    if (renderEvents.length > 0) {
      stats.avgRenderTime = renderEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / renderEvents.length;
    }
    
    return stats;
  }
}

// Create singleton instance
const designDebugger = new DesignDebugger();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).designDebugger = designDebugger;
}

export { designDebugger };