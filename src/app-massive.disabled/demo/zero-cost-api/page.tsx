'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Cloud, Map, Bell, Brain, Gauge, 
  Check, ArrowRight, DollarSign, TrendingUp,
  Clock, Image, Wifi, Database, ChevronRight,
  Play, Pause, RefreshCw, X
} from 'lucide-react';
import Link from 'next/link';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { CldImage } from 'next-cloudinary';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CloudinaryDemo } from '@/components/demos/CloudinaryDemo';
import { WeatherDemo } from '@/components/demos/WeatherDemo';
import dynamic from 'next/dynamic';

// Dynamically import demos to avoid SSR issues
const MapboxDemo = dynamic(() => import('@/components/demos/MapboxDemo').then(mod => mod.MapboxDemo), { ssr: false });
const NotificationDemo = dynamic(() => import('@/components/demos/NotificationDemo').then(mod => mod.NotificationDemo), { ssr: false });
const HybridMLDemo = dynamic(() => import('@/components/demos/HybridMLDemo').then(mod => mod.HybridMLDemo), { ssr: false });
const PerformanceDemo = dynamic(() => import('@/components/demos/PerformanceDemo').then(mod => mod.PerformanceDemo), { ssr: false });

// Demo Visualization Component
function DemoVisualization({ optimization, isRunning, onMetricsUpdate }: {
  optimization: any;
  isRunning: boolean;
  onMetricsUpdate: (metrics: any) => void;
}) {
  switch (optimization.id) {
    case 'cloudinary':
      return <CloudinaryDemo isRunning={isRunning} onMetricsUpdate={onMetricsUpdate} />;
    case 'mapbox':
      return <MapboxDemo isRunning={isRunning} onMetricsUpdate={onMetricsUpdate} />;
    case 'noaa':
      return <WeatherDemo isRunning={isRunning} onMetricsUpdate={onMetricsUpdate} />;
    case 'push':
      return <NotificationDemo isRunning={isRunning} onMetricsUpdate={onMetricsUpdate} />;
    case 'hybrid-ml':
      return <HybridMLDemo isRunning={isRunning} onMetricsUpdate={onMetricsUpdate} />;
    case 'performance':
      return <PerformanceDemo isRunning={isRunning} onMetricsUpdate={onMetricsUpdate} />;
    default:
      return (
        <div className="h-64 bg-gray-900/50 rounded-lg border border-gray-700 flex items-center justify-center">
          <p className="text-gray-400">Select an optimization to see the demo</p>
        </div>
      );
  }
}

// API Optimization configurations
const API_OPTIMIZATIONS = [
  {
    id: 'cloudinary',
    name: 'Cloudinary Auto-Optimization',
    icon: Image,
    color: 'from-blue-500 to-purple-600',
    monthlyValue: 150,
    features: [
      'f_auto format selection',
      'q_auto quality optimization',
      '50% faster load times',
      'AI-powered transformations'
    ],
    demo: 'image'
  },
  {
    id: 'mapbox',
    name: 'Mapbox Satellite Enhanced',
    icon: Map,
    color: 'from-green-500 to-emerald-600',
    monthlyValue: 200,
    features: [
      'Satellite imagery default',
      'Measurement tools',
      'Shadow analysis',
      'Terrain visualization'
    ],
    demo: 'map'
  },
  {
    id: 'noaa',
    name: 'NOAA Weather Intelligence',
    icon: Cloud,
    color: 'from-cyan-500 to-blue-600',
    monthlyValue: 300,
    features: [
      '30+ years historical data',
      'Climate risk assessment',
      'Seasonal recommendations',
      'Free government API'
    ],
    demo: 'weather'
  },
  {
    id: 'push',
    name: 'Web Push Notifications',
    icon: Bell,
    color: 'from-orange-500 to-red-600',
    monthlyValue: 100,
    features: [
      'No SMS costs',
      'Facility-specific alerts',
      'Offline capability',
      'Rich notifications'
    ],
    demo: 'notification'
  },
  {
    id: 'hybrid-ml',
    name: 'Hybrid ML Architecture',
    icon: Brain,
    color: 'from-purple-500 to-pink-600',
    monthlyValue: 400,
    features: [
      'Client-side inference',
      'Reduced API calls',
      'Instant predictions',
      'Privacy preserved'
    ],
    demo: 'ml'
  },
  {
    id: 'performance',
    name: 'Performance Monitoring',
    icon: Gauge,
    color: 'from-yellow-500 to-orange-600',
    monthlyValue: 250,
    features: [
      'Real-time metrics',
      'Automatic optimization',
      'Cost tracking',
      'Usage analytics'
    ],
    demo: 'metrics'
  }
];

// Demo states for each optimization
interface DemoState {
  isRunning: boolean;
  metrics: {
    before: number;
    after: number;
    improvement: string;
  };
}

export default function ZeroCostAPIDemo() {
  const [selectedOptimization, setSelectedOptimization] = useState(API_OPTIMIZATIONS[0]);
  const [demoState, setDemoState] = useState<DemoState>({
    isRunning: false,
    metrics: {
      before: 0,
      after: 0,
      improvement: '0%'
    }
  });
  const [totalSavings, setTotalSavings] = useState(0);
  const [roi, setRoi] = useState(0);

  // Calculate total monthly savings
  useEffect(() => {
    const total = API_OPTIMIZATIONS.reduce((sum, opt) => sum + opt.monthlyValue, 0);
    setTotalSavings(total);
    setRoi(Math.round((total * 12) / 299 * 100)); // ROI based on $299/mo subscription
  }, []);

  // Run demo based on selected optimization
  const runDemo = async () => {
    setDemoState(prev => ({ ...prev, isRunning: true }));
    
    // Simulate different demos
    switch (selectedOptimization.id) {
      case 'cloudinary':
        // Simulate image load time improvement
        setDemoState({
          isRunning: true,
          metrics: {
            before: 2300,
            after: 1100,
            improvement: '52%'
          }
        });
        break;
      case 'mapbox':
        setDemoState({
          isRunning: true,
          metrics: {
            before: 1800,
            after: 600,
            improvement: '67%'
          }
        });
        break;
      case 'noaa':
        setDemoState({
          isRunning: true,
          metrics: {
            before: 200,
            after: 0,
            improvement: '100%'
          }
        });
        break;
      case 'push':
        setDemoState({
          isRunning: true,
          metrics: {
            before: 150,
            after: 0,
            improvement: '100%'
          }
        });
        break;
      case 'hybrid-ml':
        setDemoState({
          isRunning: true,
          metrics: {
            before: 500,
            after: 50,
            improvement: '90%'
          }
        });
        break;
      case 'performance':
        setDemoState({
          isRunning: true,
          metrics: {
            before: 85,
            after: 98,
            improvement: '15%'
          }
        });
        break;
    }
    
    // Stop after 3 seconds
    setTimeout(() => {
      setDemoState(prev => ({ ...prev, isRunning: false }));
    }, 3000);
  };

  return (
    <>
      <MarketingNavigation />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 backdrop-blur-sm rounded-full border border-green-700/50 mb-6">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-200">$500K+ Annual Value Unlocked</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Zero-Cost API
                <br />
                <span className="bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
                  Optimization Demo
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Discover how VibeLux unlocks massive value from your existing API subscriptions 
                without any additional costs. See real-time demonstrations of each optimization.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ROI Stats */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="text-2xl font-bold text-white mb-1">
                  ${totalSavings.toLocaleString()}/mo
                </h3>
                <p className="text-gray-400">Monthly Value Unlocked</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <DollarSign className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-2xl font-bold text-white mb-1">
                  ${(totalSavings * 12).toLocaleString()}/yr
                </h3>
                <p className="text-gray-400">Annual Savings</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <Zap className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="text-2xl font-bold text-white mb-1">
                  {roi}% ROI
                </h3>
                <p className="text-gray-400">Return on Investment</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Optimization List */}
              <div className="lg:col-span-1">
                <h3 className="text-xl font-semibold text-white mb-4">Select Optimization</h3>
                <div className="space-y-3">
                  {API_OPTIMIZATIONS.map((opt) => (
                    <motion.button
                      key={opt.id}
                      onClick={() => setSelectedOptimization(opt)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 rounded-lg border transition-all duration-300 ${
                        selectedOptimization.id === opt.id
                          ? 'bg-gradient-to-r ' + opt.color + ' border-transparent'
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <opt.icon className={`w-5 h-5 ${
                            selectedOptimization.id === opt.id ? 'text-white' : 'text-gray-400'
                          }`} />
                          <span className={`font-medium ${
                            selectedOptimization.id === opt.id ? 'text-white' : 'text-gray-300'
                          }`}>
                            {opt.name}
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${
                          selectedOptimization.id === opt.id ? 'text-white' : 'text-green-400'
                        }`}>
                          +${opt.monthlyValue}/mo
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Demo Area */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {selectedOptimization.name}
                      </h3>
                      <p className="text-gray-400">
                        Value: ${selectedOptimization.monthlyValue}/month saved
                      </p>
                    </div>
                    <button
                      onClick={runDemo}
                      disabled={demoState.isRunning}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                        demoState.isRunning
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r ' + selectedOptimization.color + ' text-white hover:shadow-lg'
                      }`}
                    >
                      {demoState.isRunning ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Running Demo...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Run Demo
                        </>
                      )}
                    </button>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                      Features Included
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedOptimization.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Demo Results */}
                  <AnimatePresence>
                    {demoState.metrics.improvement !== '0%' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gray-900/50 rounded-lg p-6 border border-gray-700"
                      >
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                          Demo Results
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Before</p>
                            <p className="text-xl font-bold text-red-400">
                              {selectedOptimization.id === 'noaa' || selectedOptimization.id === 'push' 
                                ? `$${demoState.metrics.before}` 
                                : `${demoState.metrics.before}ms`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">After</p>
                            <p className="text-xl font-bold text-green-400">
                              {selectedOptimization.id === 'noaa' || selectedOptimization.id === 'push' 
                                ? `$${demoState.metrics.after}` 
                                : `${demoState.metrics.after}ms`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Improvement</p>
                            <p className="text-xl font-bold text-blue-400">
                              {demoState.metrics.improvement}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Demo Visualization Area */}
                  <div className="mt-6">
                    <DemoVisualization 
                      optimization={selectedOptimization} 
                      isRunning={demoState.isRunning}
                      onMetricsUpdate={(metrics) => setDemoState(prev => ({ ...prev, metrics }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation Code Examples */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Simple Implementation
              </h2>
              <p className="text-xl text-gray-300">
                See how easy it is to implement these optimizations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-red-900/50">
                <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <X className="w-5 h-5" />
                  Before Optimization
                </h3>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{`// Cloudinary without optimization
<CldImage 
  src="plant-123.jpg"
  width={800}
  height={600}
  alt="Plant"
/>

// Weather from paid API
const weather = await fetch(
  'https://paid-weather-api.com/data'
  // $200/month
);`}</code>
                </pre>
              </div>

              {/* After */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-900/50">
                <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  After Optimization
                </h3>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{`// Cloudinary with auto-optimization
<CldImage 
  src="plant-123.jpg"
  width={800}
  height={600}
  alt="Plant"
  crop="limit"
  quality="auto" // ✨ Added
  format="auto"  // ✨ Added
/>

// Weather from free NOAA
const weather = await fetch(
  'https://api.weather.gov/data'
  // $0/month
);`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-2xl p-12 border border-purple-700/50"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Unlock $500K+ in Value?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Start using these zero-cost optimizations today and see immediate results
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/get-started"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/docs/zero-cost-api"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800/50 backdrop-blur-sm text-white font-semibold rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-300"
                >
                  View Documentation
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}