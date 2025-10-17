'use client';

import React from 'react';
import MovingRackLightingDesigner from '@/components/lighting/MovingRackLightingDesigner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Award, 
  TrendingUp, 
  Zap, 
  Target,
  CheckCircle,
  DollarSign,
  Settings,
  BarChart3,
  Shield
} from 'lucide-react';

export default function MovingRackLightingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Professional Moving Rack Lighting Design
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              DLC-qualified LED solutions for 5-rack × 8-level growing systems delivering precise 300 PPFD
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Award className="h-8 w-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">DLC Qualified</h3>
                <p className="text-sm opacity-80">
                  Only fixtures from the DesignLights Consortium Qualified Products List
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Target className="h-8 w-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Precision PPFD</h3>
                <p className="text-sm opacity-80">
                  Optimized layout for uniform 300 μmol/m²/s across 40 growing levels
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <DollarSign className="h-8 w-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">ROI Optimized</h3>
                <p className="text-sm opacity-80">
                  Complete cost analysis with utility rebate calculations
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 -mt-8 relative z-10">
          {/* Key Features */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  Premium LED Fixtures
                </CardTitle>
                <CardDescription>
                  Top-tier DLC qualified fixtures from industry leaders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fluence SPYDR 2i</span>
                    <Badge className="bg-green-100 text-green-800">2.7 μmol/J</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Verjure Arize Life2</span>
                    <Badge className="bg-green-100 text-green-800">3.2 μmol/J</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gavita Pro 1700e</span>
                    <Badge className="bg-green-100 text-green-800">2.6 μmol/J</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  System Optimization
                </CardTitle>
                <CardDescription>
                  Intelligent layout calculation for maximum efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Light Uniformity</span>
                    <Badge className="bg-blue-100 text-blue-800">&gt;85%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">PPFD Accuracy</span>
                    <Badge className="bg-purple-100 text-purple-800">±10%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Energy Optimization</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Maximized</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Multi-Tier Compatibility
                </CardTitle>
                <CardDescription>
                  Designed specifically for vertical farming systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Profile Design</span>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">&lt;10cm</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Heat Management</span>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Passive</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rack Integration</span>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Optimized</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Specifications */}
          <Card className="mb-8 bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle>5-Rack × 8-Level System Specifications</CardTitle>
              <CardDescription>
                Professional specifications for your multi-tier growing operation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">40</span>
                  </div>
                  <h3 className="font-semibold mb-2">Growing Levels</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    5 mobile racks with 8 growing levels each for maximum space utilization
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">300</span>
                  </div>
                  <h3 className="font-semibold mb-2">Target PPFD</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Precisely delivered μmol/m²/s optimized for leafy greens and herbs
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">±2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Positioning Accuracy</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Centimeter-level precision for moving rack systems
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">85%</span>
                  </div>
                  <h3 className="font-semibold mb-2">Light Uniformity</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Professional-grade uniformity across all growing surfaces
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Designer Component */}
          <MovingRackLightingDesigner 
            onDesignChange={(analysis) => {
              console.log('Lighting design updated:', analysis);
            }}
          />

          {/* DLC Benefits */}
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                DesignLights Consortium (DLC) Advantages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 text-green-700 dark:text-green-300">
                    Performance Assurance
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Minimum 1.9 μmol/J efficacy requirement</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Third-party verified performance metrics</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>36,000+ hour lifespan (Q90 rating)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Rigorous quality and reliability testing</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4 text-green-700 dark:text-green-300">
                    Financial Benefits
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Eligibility for utility rebate programs</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Reduced energy consumption vs. non-qualified fixtures</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Lower maintenance costs and longer replacement intervals</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Improved ROI through energy savings</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    Industry Impact
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  DLC qualified horticultural lighting has the potential to save the industry approximately 
                  <strong> $240 million annually</strong> in energy costs while improving crop yields and quality 
                  through superior light distribution and spectral optimization.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card className="mt-8 mb-12 bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle>Technical Implementation Details</CardTitle>
              <CardDescription>
                Engineering specifications for professional installation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Electrical Requirements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Input Voltage:</span>
                      <span>120-277V AC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Power Factor:</span>
                      <span>&gt;0.95</span>
                    </div>
                    <div className="flex justify-between">
                      <span>THD:</span>
                      <span>&lt;20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimming:</span>
                      <span>0-10V, PWM</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Environmental Ratings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>IP Rating:</span>
                      <span>IP65/IP66</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operating Temp:</span>
                      <span>0°C to 40°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Humidity:</span>
                      <span>Up to 95% RH</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vibration:</span>
                      <span>Rated for mobile racks</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Control Integration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Communication:</span>
                      <span>Modbus, BACnet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scheduling:</span>
                      <span>Programmable</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Zoning:</span>
                      <span>Individual fixture</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monitoring:</span>
                      <span>Real-time status</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}