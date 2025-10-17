import { logger } from '@/lib/client-logger';

interface MemoryStats {
  used: number;
  total: number;
  limit: number;
  percentage: number;
}

class MemoryOptimizer {
  private warningThreshold = 0.7; // 70% memory usage
  private criticalThreshold = 0.85; // 85% memory usage
  private checkInterval = 30000; // Check every 30 seconds
  private intervalId: number | null = null;
  private callbacks: Map<string, (stats: MemoryStats) => void> = new Map();
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.startMonitoring();
    }
  }

  private startMonitoring() {
    // Only monitor if performance.memory is available (Chrome)
    if (!('memory' in performance)) {
      logger.info('Memory monitoring not available in this browser');
      return;
    }

    this.intervalId = window.setInterval(() => {
      this.checkMemory();
    }, this.checkInterval);

    // Initial check
    this.checkMemory();
  }

  private checkMemory() {
    const stats = this.getMemoryStats();
    
    if (!stats) return;

    // Log high memory usage
    if (stats.percentage > this.criticalThreshold) {
      logger.error('api', stats);
      this.triggerCallbacks(stats);
      this.performEmergencyCleanup();
    } else if (stats.percentage > this.warningThreshold) {
      logger.warn('api', stats);
      this.triggerCallbacks(stats);
      this.performRoutineCleanup();
    }
  }

  getMemoryStats(): MemoryStats | null {
    if (!('memory' in performance)) return null;

    const memory = (performance as any).memory;
    const used = memory.usedJSHeapSize;
    const total = memory.totalJSHeapSize;
    const limit = memory.jsHeapSizeLimit;
    const percentage = used / limit;

    return {
      used: Math.round(used / 1048576), // Convert to MB
      total: Math.round(total / 1048576),
      limit: Math.round(limit / 1048576),
      percentage: Math.round(percentage * 100) / 100
    };
  }

  private performRoutineCleanup() {
    // Clear large arrays and objects that aren't actively used
    this.clearUnusedResources();
    
    // Force garbage collection if available (Chrome with --enable-precise-memory-info)
    if ('gc' in window) {
      (window as any).gc();
    }
  }

  private performEmergencyCleanup() {
    logger.warn('Performing emergency memory cleanup');
    
    // More aggressive cleanup
    this.clearUnusedResources();
    this.clearCaches();
    this.revokeObjectURLs();
    
    // Notify user
    if (typeof window !== 'undefined' && window.alert) {
      window.alert('High memory usage detected. Some features may be temporarily disabled to prevent crashes.');
    }
  }

  private clearUnusedResources() {
    // Clear detached DOM nodes
    const allNodes = document.querySelectorAll('*');
    allNodes.forEach(node => {
      if (!document.body.contains(node)) {
        node.remove();
      }
    });

    // Clear event listeners on removed elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.removedNodes.forEach(node => {
          if (node instanceof Element) {
            // Remove all event listeners by cloning
            const newNode = node.cloneNode(true);
            node.parentNode?.replaceChild(newNode, node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    // Disconnect after cleanup
    setTimeout(() => observer.disconnect(), 100);
  }

  private clearCaches() {
    // Clear any application-specific caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('vibelux-temp')) {
            caches.delete(name);
          }
        });
      });
    }

    // Clear localStorage items that are temporary
    if (typeof localStorage !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('_temp') || key.includes('_cache')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  private revokeObjectURLs() {
    // Revoke any blob URLs that might be lingering
    const urls = performance.getEntriesByType('resource')
      .filter(entry => entry.name.startsWith('blob:'))
      .map(entry => entry.name);

    urls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // Ignore errors
      }
    });
  }

  private triggerCallbacks(stats: MemoryStats) {
    this.callbacks.forEach(callback => {
      try {
        callback(stats);
      } catch (error) {
        logger.error('api', error);
      }
    });
  }

  onHighMemory(id: string, callback: (stats: MemoryStats) => void) {
    this.callbacks.set(id, callback);
  }

  removeCallback(id: string) {
    this.callbacks.delete(id);
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.callbacks.clear();
  }

  // Manual optimization methods
  optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Reduce quality of large images
      if (img.naturalWidth > 2000 || img.naturalHeight > 2000) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = Math.min(img.naturalWidth, 2000);
          canvas.height = Math.min(img.naturalHeight, 2000);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          img.src = canvas.toDataURL('image/jpeg', 0.8);
        }
      }
    });
  }

  clearCanvases() {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
  }

  // Utility to track object sizes
  getObjectSize(obj: any): number {
    const seen = new WeakSet();
    
    function sizeof(obj: any): number {
      if (obj === null || obj === undefined) return 0;
      
      const type = typeof obj;
      if (type === 'boolean') return 4;
      if (type === 'string') return obj.length * 2;
      if (type === 'number') return 8;
      
      if (type === 'object') {
        if (seen.has(obj)) return 0;
        seen.add(obj);
        
        let size = 0;
        if (Array.isArray(obj)) {
          obj.forEach(item => {
            size += sizeof(item);
          });
        } else {
          Object.keys(obj).forEach(key => {
            size += sizeof(key);
            size += sizeof(obj[key]);
          });
        }
        return size;
      }
      
      return 0;
    }
    
    return sizeof(obj);
  }
}

// Create singleton instance
const memoryOptimizer = new MemoryOptimizer();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).memoryOptimizer = memoryOptimizer;
}

export { memoryOptimizer, type MemoryStats };