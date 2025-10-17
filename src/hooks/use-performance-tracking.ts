import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@/lib/client-logger';

interface PerformanceMetrics {
  renderCount: number;
  renderTime: number;
  slowRenders: number;
  memoryUsage?: number;
  errors: Error[];
}

interface UsePerformanceTrackingOptions {
  componentName: string;
  warnThreshold?: number; // ms
  errorThreshold?: number; // ms
  trackMemory?: boolean;
  onSlowRender?: (duration: number) => void;
  onError?: (error: Error) => void;
}

export function usePerformanceTracking({
  componentName,
  warnThreshold = 16, // 60fps
  errorThreshold = 50,
  trackMemory = true,
  onSlowRender,
  onError
}: UsePerformanceTrackingOptions) {
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    renderTime: 0,
    slowRenders: 0,
    errors: []
  });
  
  const renderStartRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  // Track render start
  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  // Track render end
  useEffect(() => {
    const renderEnd = performance.now();
    const renderDuration = renderEnd - renderStartRef.current;
    
    metricsRef.current.renderCount++;
    metricsRef.current.renderTime += renderDuration;
    
    if (renderDuration > warnThreshold) {
      metricsRef.current.slowRenders++;
      
      if (renderDuration > errorThreshold) {
        logger.warn(`Slow render detected in ${componentName}`, {
          duration: renderDuration,
          threshold: errorThreshold
        });
      }
      
      if (onSlowRender) {
        onSlowRender(renderDuration);
      }
    }
    
    // Track memory if available
    if (trackMemory && 'memory' in performance) {
      metricsRef.current.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
  });

  // Error tracking
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = new Error(event.message);
      error.stack = event.error?.stack;
      
      metricsRef.current.errors.push(error);
      
      logger.error(`Error in ${componentName}`, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      if (onError) {
        onError(error);
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      isMountedRef.current = false;
      
      // Log final metrics on unmount
      const avgRenderTime = metricsRef.current.renderTime / metricsRef.current.renderCount;
      
      if (avgRenderTime > warnThreshold || metricsRef.current.errors.length > 0) {
        logger.info(`Performance summary for ${componentName}`, {
          renders: metricsRef.current.renderCount,
          avgRenderTime: Math.round(avgRenderTime * 100) / 100,
          slowRenders: metricsRef.current.slowRenders,
          errors: metricsRef.current.errors.length,
          memoryUsage: metricsRef.current.memoryUsage ? 
            Math.round(metricsRef.current.memoryUsage / 1048576) + 'MB' : 'N/A'
        });
      }
    };
  }, [componentName, warnThreshold, errorThreshold, onSlowRender, onError, trackMemory]);

  const measurePerformance = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    fnName: string
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      
      try {
        const result = fn(...args);
        
        // Handle promises
        if (result instanceof Promise) {
          return result.finally(() => {
            const duration = performance.now() - start;
            if (duration > warnThreshold) {
              logger.warn(`Slow operation: ${componentName}.${fnName}`, { duration });
            }
          });
        }
        
        const duration = performance.now() - start;
        if (duration > warnThreshold) {
          logger.warn(`Slow operation: ${componentName}.${fnName}`, { duration });
        }
        
        return result;
      } catch (error) {
        logger.error(`Error in ${componentName}.${fnName}`, error);
        throw error;
      }
    }) as T;
  }, [componentName, warnThreshold]);

  const getMetrics = useCallback(() => ({
    ...metricsRef.current,
    avgRenderTime: metricsRef.current.renderTime / metricsRef.current.renderCount
  }), []);

  return {
    measurePerformance,
    getMetrics
  };
}

// Hook for tracking specific operations
export function useOperationTracking(operationName: string) {
  const startTimeRef = useRef<number>(0);
  
  const startOperation = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);
  
  const endOperation = useCallback((metadata?: Record<string, any>) => {
    const duration = performance.now() - startTimeRef.current;
    
    logger.info(`Operation completed: ${operationName}`, {
      duration: Math.round(duration * 100) / 100,
      ...metadata
    });
    
    return duration;
  }, [operationName]);
  
  return { startOperation, endOperation };
}