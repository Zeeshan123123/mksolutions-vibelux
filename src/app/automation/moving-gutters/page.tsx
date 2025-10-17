'use client';

import React from 'react';
import MovingGutterDesigner from '@/components/automation/MovingGutterDesigner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  TrendingUp, 
  Droplets, 
  Gauge, 
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Settings
} from 'lucide-react';

export default function MovingGuttersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Automated Moving Gutter Systems
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Revolutionary NFT systems that automatically adjust plant spacing for optimal growth
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <TrendingUp className="h-8 w-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">30% Higher Yields</h3>
                <p className="text-sm opacity-80">
                  Optimal spacing throughout growth cycles maximizes plant productivity
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Zap className="h-8 w-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">40% Energy Savings</h3>
                <p className="text-sm opacity-80">
                  Dynamic spacing optimizes light distribution and reduces waste
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Droplets className="h-8 w-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">25% Water Reduction</h3>
                <p className="text-sm opacity-80">
                  Precision nutrient delivery based on real-time plant needs
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 -mt-8 relative z-10">
          {/* Features Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Automated Spacing
                </CardTitle>
                <CardDescription>
                  Intelligent algorithms adjust gutter positions based on plant growth stages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Seedling Stage</span>
                    <Badge variant="outline">30cm spacing</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vegetative Growth</span>
                    <Badge variant="outline">50cm spacing</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pre-Harvest</span>
                    <Badge variant="outline">80cm spacing</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  Light Optimization
                </CardTitle>
                <CardDescription>
                  Maximize PPFD distribution and minimize shadowing effects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Light Uniformity</span>
                    <Badge className="bg-green-100 text-green-800">95%+</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Energy Efficiency</span>
                    <Badge className="bg-blue-100 text-blue-800">Optimized</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Shadow Reduction</span>
                    <Badge className="bg-purple-100 text-purple-800">Minimal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gauge className="h-5 w-5 mr-2 text-green-600" />
                  Real-Time Monitoring
                </CardTitle>
                <CardDescription>
                  Continuous monitoring and adjustment for optimal growing conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Status</span>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time</span>
                    <Badge variant="outline">&lt; 30 seconds</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Precision</span>
                    <Badge variant="outline">±2cm accuracy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="mb-8 bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle>How Moving Gutter Systems Work</CardTitle>
              <CardDescription>
                Advanced automation that adapts to your plants' changing needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Plant Detection</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    System identifies plant growth stage and calculates optimal spacing requirements
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Spacing Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI algorithms determine ideal gutter positions for maximum light exposure
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Automated Movement</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Precision motors smoothly adjust gutter positions with safety collision detection
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">4</span>
                  </div>
                  <h3 className="font-semibold mb-2">Continuous Optimization</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    System continuously monitors and adjusts for optimal growing conditions
                  </p>
                </div>
              </div>

              {/* Flow arrows for larger screens */}
              <div className="hidden md:flex justify-center items-center mt-8 space-x-8">
                <ArrowRight className="h-6 w-6 text-gray-400" />
                <ArrowRight className="h-6 w-6 text-gray-400" />
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Main Designer Component */}
          <MovingGutterDesigner 
            onConfigChange={(config) => {
              console.log('Configuration changed:', config);
            }}
          />

          {/* Technical Specifications */}
          <Card className="mt-8 bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
              <CardDescription>
                Professional-grade components for commercial growing operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">System Dimensions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Length Range:</span>
                      <span>6m - 20m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Width Range:</span>
                      <span>4m - 12m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gutter Count:</span>
                      <span>6 - 20 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Load Capacity:</span>
                      <span>50kg per gutter</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Movement Specifications</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Max Speed:</span>
                      <span>2.0 m/min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precision:</span>
                      <span>±2cm accuracy</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Spacing:</span>
                      <span>2.0m centers</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Spacing:</span>
                      <span>0.1m centers</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Control System</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Controller:</span>
                      <span>Industrial PLC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interface:</span>
                      <span>Web-based HMI</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connectivity:</span>
                      <span>Ethernet, WiFi</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Safety:</span>
                      <span>Emergency stops</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="mt-8 mb-12 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200">
                Why Choose Moving Gutter Systems?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 text-green-700 dark:text-green-300">
                    Economic Benefits
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>30% increase in yield per square meter</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>40% reduction in energy costs</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>25% savings on water and nutrients</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>ROI typically achieved within 18 months</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4 text-green-700 dark:text-green-300">
                    Operational Advantages
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Reduced labor requirements for plant spacing</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Consistent, optimized growing conditions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Automated scheduling and plant management</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Real-time monitoring and alerts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}