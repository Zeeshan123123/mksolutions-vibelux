'use client';

import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import { motion } from 'framer-motion';
import { Image, Zap, Check } from 'lucide-react';

interface CloudinaryDemoProps {
  isRunning: boolean;
  onMetricsUpdate: (metrics: any) => void;
}

export function CloudinaryDemo({ isRunning, onMetricsUpdate }: CloudinaryDemoProps) {
  const [showOptimized, setShowOptimized] = useState(false);
  const [loadTimes, setLoadTimes] = useState({ standard: 0, optimized: 0 });
  
  useEffect(() => {
    if (isRunning) {
      // Simulate load time measurement
      const startStandard = Date.now();
      setTimeout(() => {
        const standardTime = 2300; // Simulated load time
        setLoadTimes(prev => ({ ...prev, standard: standardTime }));
        
        // Now load optimized version
        setShowOptimized(true);
        const optimizedTime = 1100; // Simulated optimized load time
        setTimeout(() => {
          setLoadTimes(prev => ({ ...prev, optimized: optimizedTime }));
          onMetricsUpdate({
            before: standardTime,
            after: optimizedTime,
            improvement: '52%'
          });
        }, 1100);
      }, 2300);
    } else {
      setShowOptimized(false);
      setLoadTimes({ standard: 0, optimized: 0 });
    }
  }, [isRunning, onMetricsUpdate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Standard Image */}
        <div className="relative">
          <div className="absolute top-2 left-2 z-10">
            <span className="px-3 py-1 bg-red-600/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              Standard Loading
            </span>
          </div>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
            {isRunning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading image...</p>
                  {loadTimes.standard > 0 && (
                    <p className="text-red-400 font-bold mt-2">{loadTimes.standard}ms</p>
                  )}
                </div>
              </div>
            )}
            <CldImage
              src="samples/landscapes/nature-mountains"
              width={600}
              height={400}
              alt="Standard loading"
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                isRunning && loadTimes.standard === 0 ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </div>
        </div>

        {/* Optimized Image */}
        <div className="relative">
          <div className="absolute top-2 left-2 z-10">
            <span className="px-3 py-1 bg-green-600/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              Auto-Optimized
            </span>
          </div>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
            {isRunning && !showOptimized && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-600">Waiting...</p>
              </div>
            )}
            {showOptimized && loadTimes.optimized === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-gray-600 border-t-green-400 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading optimized...</p>
                </div>
              </div>
            )}
            {showOptimized && (
              <CldImage
                src="samples/landscapes/nature-mountains"
                width={600}
                height={400}
                alt="Optimized loading"
                quality="auto"
                format="auto"
                crop="limit"
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  loadTimes.optimized === 0 ? 'opacity-0' : 'opacity-100'
                }`}
              />
            )}
            {loadTimes.optimized > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-green-600/90 backdrop-blur-sm rounded-lg p-4 text-white">
                  <Zap className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-bold text-lg">{loadTimes.optimized}ms</p>
                  <p className="text-sm">52% Faster!</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Optimization Details */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">Optimizations Applied</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">Format: Auto</p>
              <p className="text-sm text-gray-400">WebP for Chrome, JPEG for others</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">Quality: Auto</p>
              <p className="text-sm text-gray-400">Optimal quality/size balance</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">CDN: Global</p>
              <p className="text-sm text-gray-400">Served from nearest edge</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}