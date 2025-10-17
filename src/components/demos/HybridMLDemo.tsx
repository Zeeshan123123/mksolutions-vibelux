'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Cloud, Zap, Check } from 'lucide-react';

interface HybridMLDemoProps {
  isRunning: boolean;
  onMetricsUpdate: (metrics: any) => void;
}

export function HybridMLDemo({ isRunning, onMetricsUpdate }: HybridMLDemoProps) {
  const [processing, setProcessing] = useState({ client: false, server: false });
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (isRunning) {
      // Simulate client-side processing
      setProcessing({ client: true, server: false });
      
      setTimeout(() => {
        // Client-side complete, minimal server call
        setProcessing({ client: false, server: true });
        
        setTimeout(() => {
          setProcessing({ client: false, server: false });
          setResults({
            pestDetected: false,
            confidence: 0.94,
            processTime: { client: 45, server: 5 }
          });
          
          onMetricsUpdate({
            before: 500, // All server-side
            after: 50,   // Hybrid approach
            improvement: '90%'
          });
        }, 500);
      }, 1000);
    } else {
      setProcessing({ client: false, server: false });
      setResults(null);
    }
  }, [isRunning, onMetricsUpdate]);

  return (
    <div className="space-y-6">
      {/* Processing Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client-Side */}
        <div className={`bg-gray-900/50 rounded-lg p-6 border transition-all duration-300 ${
          processing.client ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-700'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Cpu className={`w-8 h-8 ${processing.client ? 'text-purple-400 animate-pulse' : 'text-gray-600'}`} />
            <div>
              <h5 className="font-semibold text-white">Client-Side ML</h5>
              <p className="text-gray-400 text-sm">TensorFlow.js in browser</p>
            </div>
          </div>
          
          {processing.client && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-purple-400">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span className="text-sm">Processing image locally...</span>
              </div>
              <div className="text-xs text-gray-500">
                • Feature extraction<br />
                • Initial classification<br />
                • Privacy preserved
              </div>
            </motion.div>
          )}
          
          {results && (
            <div className="mt-4 text-sm text-gray-300">
              <p>Processing time: <span className="text-green-400 font-bold">{results.processTime.client}ms</span></p>
            </div>
          )}
        </div>

        {/* Server-Side */}
        <div className={`bg-gray-900/50 rounded-lg p-6 border transition-all duration-300 ${
          processing.server ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-700'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Cloud className={`w-8 h-8 ${processing.server ? 'text-blue-400 animate-pulse' : 'text-gray-600'}`} />
            <div>
              <h5 className="font-semibold text-white">Server-Side ML</h5>
              <p className="text-gray-400 text-sm">Platform intelligence</p>
            </div>
          </div>
          
          {processing.server && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-sm">Sending minimal data...</span>
              </div>
              <div className="text-xs text-gray-500">
                • Validation only<br />
                • Aggregate insights<br />
                • Model updates
              </div>
            </motion.div>
          )}
          
          {results && (
            <div className="mt-4 text-sm text-gray-300">
              <p>Processing time: <span className="text-green-400 font-bold">{results.processTime.server}ms</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-gray-700"
        >
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Analysis Complete
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Result</p>
              <p className="text-xl font-bold text-green-400">Healthy Plant</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Confidence</p>
              <p className="text-xl font-bold text-white">{(results.confidence * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Time</p>
              <p className="text-xl font-bold text-purple-400">50ms</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Benefits */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-4">Hybrid ML Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">90% Reduced API Calls</p>
              <p className="text-sm text-gray-400">Process locally, validate remotely</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">Instant Results</p>
              <p className="text-sm text-gray-400">No network latency for predictions</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">Privacy First</p>
              <p className="text-sm text-gray-400">Sensitive data stays on device</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">Platform Intelligence</p>
              <p className="text-sm text-gray-400">Aggregate insights preserved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}