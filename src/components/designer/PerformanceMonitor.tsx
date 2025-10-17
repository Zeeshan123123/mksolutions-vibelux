'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertTriangle, Zap, Clock, Database, Cpu, Download, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/client-logger';

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  updateCount: number;
  slowUpdates: string[];
  errors: Array<{
    message: string;
    stack?: string;
    timestamp: Date;
    component?: string;
  }>;
}

interface PerformanceMonitorProps {
  isVisible: boolean;
  onClose: () => void;
}

export function PerformanceMonitor({ isVisible, onClose }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    updateCount: 0,
    slowUpdates: [],
    errors: []
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderTimesRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!isVisible) return;

    // FPS Counter
    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTimeRef.current;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
        
        setMetrics(prev => ({ ...prev, fps }));
      }

      animationFrameRef.current = requestAnimationFrame(measureFPS);
    };

    // Memory Usage (if available)
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        setMetrics(prev => ({ ...prev, memoryUsage: usedMB }));
      }
    };

    // Component render tracking
    const originalConsoleError = console.error;
    const errorLog: typeof metrics.errors = [];
    
    console.error = function(...args) {
      originalConsoleError.apply(console, args);
      
      const error = {
        message: args[0]?.toString() || 'Unknown error',
        stack: args[0]?.stack,
        timestamp: new Date(),
        component: extractComponentName(args[0]?.stack)
      };
      
      errorLog.push(error);
      setMetrics(prev => ({ ...prev, errors: [...errorLog].slice(-10) })); // Keep last 10 errors
      
      // Log to server
      logger.error('Design tool error', error);
    };

    // Start monitoring
    measureFPS();
    const memoryInterval = setInterval(measureMemory, 1000);

    // React Performance Observer
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.startsWith('⚛')) {
            renderTimesRef.current.push(entry.duration);
            if (renderTimesRef.current.length > 100) {
              renderTimesRef.current.shift();
            }
            
            const avgRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;
            setMetrics(prev => ({ ...prev, renderTime: Math.round(avgRenderTime * 100) / 100 }));
            
            // Track slow updates
            if (entry.duration > 16) { // Slower than 60fps
              const componentName = entry.name.match(/⚛ (.+)/)?.[1] || 'Unknown';
              setMetrics(prev => ({
                ...prev,
                slowUpdates: [...prev.slowUpdates, componentName].slice(-5)
              }));
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['measure'] });
      
      return () => {
        observer.disconnect();
      };
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(memoryInterval);
      console.error = originalConsoleError;
    };
  }, [isVisible]);

  // Track component count
  useEffect(() => {
    if (!isVisible) return;
    
    const countComponents = () => {
      const allElements = document.querySelectorAll('*');
      let reactComponents = 0;
      
      allElements.forEach(element => {
        if (element.hasAttribute('data-reactroot') || 
            element._reactInternalFiber || 
            (element as any)._reactInternalInstance) {
          reactComponents++;
        }
      });
      
      setMetrics(prev => ({ ...prev, componentCount: reactComponents }));
    };
    
    const interval = setInterval(countComponents, 2000);
    countComponents();
    
    return () => clearInterval(interval);
  }, [isVisible]);

  const getPerformanceStatus = () => {
    if (metrics.fps < 30) return { color: 'text-red-400', status: 'Poor' };
    if (metrics.fps < 50) return { color: 'text-yellow-400', status: 'Fair' };
    return { color: 'text-green-400', status: 'Good' };
  };

  const exportMetrics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      metrics,
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        devicePixelRatio: window.devicePixelRatio
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearErrors = () => {
    setMetrics(prev => ({ ...prev, errors: [] }));
  };

  if (!isVisible) return null;

  const perfStatus = getPerformanceStatus();

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[600px] overflow-y-auto bg-gray-900 border-gray-700 shadow-2xl z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${perfStatus.color} bg-gray-800`}>
              {perfStatus.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Zap className="w-4 h-4" />
              FPS
            </div>
            <p className={`text-2xl font-bold ${metrics.fps < 30 ? 'text-red-400' : metrics.fps < 50 ? 'text-yellow-400' : 'text-green-400'}`}>
              {metrics.fps}
            </p>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              Render Time
            </div>
            <p className={`text-2xl font-bold ${metrics.renderTime > 16 ? 'text-yellow-400' : 'text-green-400'}`}>
              {metrics.renderTime}ms
            </p>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Database className="w-4 h-4" />
              Memory
            </div>
            <p className="text-2xl font-bold text-white">
              {metrics.memoryUsage}MB
            </p>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Cpu className="w-4 h-4" />
              Components
            </div>
            <p className="text-2xl font-bold text-white">
              {metrics.componentCount}
            </p>
          </div>
        </div>

        {/* Slow Updates */}
        {metrics.slowUpdates.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Slow Updates Detected
            </h4>
            <ul className="text-xs text-gray-300 space-y-1">
              {metrics.slowUpdates.map((component, idx) => (
                <li key={idx}>• {component}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Errors */}
        {metrics.errors.length > 0 && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Recent Errors ({metrics.errors.length})
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearErrors}
                className="h-6 text-xs"
              >
                Clear
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {metrics.errors.map((error, idx) => (
                <div key={idx} className="text-xs bg-gray-800 p-2 rounded">
                  <p className="text-red-300 font-medium">{error.message}</p>
                  {error.component && (
                    <p className="text-gray-400 mt-1">Component: {error.component}</p>
                  )}
                  <p className="text-gray-500">{error.timestamp.toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportMetrics}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
        </div>

        {/* Performance Tips */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Keep fixtures under 50 for best performance</p>
          <p>• Disable grid view when not needed</p>
          <p>• Use Chrome for optimal WebGL performance</p>
        </div>
      </CardContent>
    </Card>
  );
}

function extractComponentName(stack?: string): string {
  if (!stack) return 'Unknown';
  
  // Try to extract React component name from stack trace
  const match = stack.match(/at (\w+) \(/);
  return match ? match[1] : 'Unknown';
}