'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gauge, TrendingUp, Activity, BarChart3 } from 'lucide-react';

interface PerformanceDemoProps {
  isRunning: boolean;
  onMetricsUpdate: (metrics: any) => void;
}

export function PerformanceDemo({ isRunning, onMetricsUpdate }: PerformanceDemoProps) {
  const [metrics, setMetrics] = useState({
    pageLoad: 0,
    apiLatency: 0,
    cacheHitRate: 0,
    errorRate: 0
  });

  useEffect(() => {
    if (isRunning) {
      let interval: NodeJS.Timeout;
      
      // Simulate real-time metrics
      interval = setInterval(() => {
        setMetrics({
          pageLoad: Math.random() * 500 + 800, // 800-1300ms
          apiLatency: Math.random() * 50 + 30,  // 30-80ms
          cacheHitRate: Math.random() * 20 + 75, // 75-95%
          errorRate: Math.random() * 0.5 // 0-0.5%
        });
      }, 1000);

      // Show improvement after 3 seconds
      setTimeout(() => {
        onMetricsUpdate({
          before: 85,  // 85% performance score
          after: 98,   // 98% performance score
          improvement: '15%'
        });
      }, 3000);

      return () => clearInterval(interval);
    } else {
      setMetrics({
        pageLoad: 0,
        apiLatency: 0,
        cacheHitRate: 0,
        errorRate: 0
      });
    }
  }, [isRunning, onMetricsUpdate]);

  return (
    <div className="space-y-6">
      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <p className="text-sm text-gray-400">Page Load</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {isRunning ? `${metrics.pageLoad.toFixed(0)}ms` : '--'}
          </p>
        </motion.div>

        <motion.div
          animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <p className="text-sm text-gray-400">API Latency</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {isRunning ? `${metrics.apiLatency.toFixed(0)}ms` : '--'}
          </p>
        </motion.div>

        <motion.div
          animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 2, delay: 1 }}
          className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <p className="text-sm text-gray-400">Cache Hit</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {isRunning ? `${metrics.cacheHitRate.toFixed(0)}%` : '--'}
          </p>
        </motion.div>

        <motion.div
          animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 2, delay: 1.5 }}
          className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-red-400" />
            <p className="text-sm text-gray-400">Error Rate</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {isRunning ? `${metrics.errorRate.toFixed(1)}%` : '--'}
          </p>
        </motion.div>
      </div>

      {/* Performance Score */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">Overall Performance Score</h4>
        
        <div className="relative h-32">
          <svg className="w-full h-full" viewBox="0 0 200 100">
            {/* Background arc */}
            <path
              d="M 20 80 A 60 60 0 0 1 180 80"
              fill="none"
              stroke="rgba(107, 114, 128, 0.3)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            
            {/* Score arc */}
            {isRunning && (
              <motion.path
                d="M 20 80 A 60 60 0 0 1 180 80"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ pathLength: 0.85 }}
                animate={{ pathLength: 0.98 }}
                transition={{ duration: 2, delay: 1 }}
              />
            )}
            
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center mt-8">
              <p className="text-4xl font-bold text-white">
                {isRunning ? '98' : '--'}
              </p>
              <p className="text-sm text-gray-400">Performance Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Details */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">Active Optimizations</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-300">Lazy Loading</span>
            <span className="text-green-400 text-sm font-medium">-40% initial load</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-300">Edge Caching</span>
            <span className="text-green-400 text-sm font-medium">95% cache hit rate</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-300">API Batching</span>
            <span className="text-green-400 text-sm font-medium">-60% requests</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-300">Image Optimization</span>
            <span className="text-green-400 text-sm font-medium">-52% bandwidth</span>
          </div>
        </div>
      </div>
    </div>
  );
}