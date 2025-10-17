'use client';

import React, { useState } from 'react';
import {
  FileText,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Zap,
  Thermometer,
  Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  fluenceLights, 
  hpsLights, 
  calculateHPStoLEDReplacement,
  generateLightingLayout 
} from '@/lib/drawing/lightingSpecs';

export function DrawingImportDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Example room from Boundary Cone drawing
  const roomSpecs = {
    name: 'Boundary Cone Room',
    width: 66,
    length: 22,
    area: 1452,
    tableCount: 9,
    tableSize: '64\' x 8\'',
    currentLighting: 'HPS 1000W DE',
    hpsCount: 58 // Based on 25 sq ft coverage
  };

  // Calculate LED replacement
  const hpsFixture = hpsLights['HPS 1000W DE'];
  const ledReplacement = calculateHPStoLEDReplacement(
    hpsFixture,
    [fluenceLights['SPYDR 2p'], fluenceLights['SPYDR 2i']]
  );

  // Generate new lighting layout with SPYDR 2p
  const newLayout = generateLightingLayout(
    roomSpecs.width,
    roomSpecs.length,
    fluenceLights['SPYDR 2p'],
    700
  );

  const steps = [
    {
      title: 'Upload Drawing',
      description: 'PDF floor plan uploaded',
      icon: <FileText className="w-6 h-6" />
    },
    {
      title: 'Parse Dimensions',
      description: 'Extracted 66\' x 22\' room',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      title: 'Generate Layout',
      description: '9 rolling tables optimized',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: 'Lighting Analysis',
      description: 'HPS to LED conversion',
      icon: <Lightbulb className="w-6 h-6" />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div
              className={`flex flex-col items-center ${
                index <= currentStep ? 'text-purple-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-purple-100' : 'bg-gray-100'
                }`}
              >
                {step.icon}
              </div>
              <p className="text-sm font-medium mt-2">{step.title}</p>
              <p className="text-xs text-gray-600">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div className="h-0.5 bg-gray-200">
                  <div
                    className="h-full bg-purple-600 transition-all duration-500"
                    style={{
                      width: index < currentStep ? '100%' : '0%'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current Step Display */}
      {!showResults && (
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {React.cloneElement(steps[currentStep].icon, { className: 'w-12 h-12 text-purple-600' })}
              </div>
              <p className="text-lg mb-6">{steps[currentStep].description}</p>
              <Button onClick={handleNext}>
                {currentStep < steps.length - 1 ? 'Continue' : 'View Results'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {showResults && (
        <div className="space-y-6">
          {/* Room Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Vibelux Output: {roomSpecs.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Room Size</p>
                  <p className="text-2xl font-bold">{roomSpecs.width}' × {roomSpecs.length}'</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Area</p>
                  <p className="text-2xl font-bold">{roomSpecs.area.toLocaleString()} sq ft</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Tables</p>
                  <p className="text-2xl font-bold">{roomSpecs.tableCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Table Size</p>
                  <p className="text-2xl font-bold">{roomSpecs.tableSize}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HPS to LED Conversion Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>
                HPS to Fluence SPYDR 2p Conversion Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-8">
                {/* Current HPS Setup */}
                <div>
                  <h3 className="font-semibold mb-4 text-red-600">Current HPS Setup</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fixtures</span>
                      <span className="font-medium">{roomSpecs.hpsCount} × 1000W DE HPS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Power</span>
                      <span className="font-medium">{(roomSpecs.hpsCount * 1000).toLocaleString()}W</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Power Density</span>
                      <span className="font-medium">{(roomSpecs.hpsCount * 1000 / roomSpecs.area).toFixed(1)} W/sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Energy Cost</span>
                      <span className="font-medium text-red-600">
                        ${((roomSpecs.hpsCount * 1000 / 1000) * 12 * 365 * 0.12).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heat Output</span>
                      <span className="font-medium text-red-600">Very High</span>
                    </div>
                  </div>
                </div>

                {/* New LED Setup */}
                <div>
                  <h3 className="font-semibold mb-4 text-green-600">New SPYDR 2p Setup</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fixtures</span>
                      <span className="font-medium">{newLayout.metrics.totalFixtures} × SPYDR 2p</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Power</span>
                      <span className="font-medium">{newLayout.metrics.totalPower.toLocaleString()}W</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Power Density</span>
                      <span className="font-medium">{newLayout.metrics.powerDensity.toFixed(1)} W/sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Energy Cost</span>
                      <span className="font-medium text-green-600">
                        ${((newLayout.metrics.totalPower / 1000) * 12 * 365 * 0.12).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heat Output</span>
                      <span className="font-medium text-green-600">Low</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Savings Analysis */}
              <div className="mt-8 p-6 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  ROI Analysis
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Power Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      {((1 - newLayout.metrics.totalPower / (roomSpecs.hpsCount * 1000)) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Annual Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(((roomSpecs.hpsCount * 1000 - newLayout.metrics.totalPower) / 1000) * 12 * 365 * 0.12 * 1.3).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Including HVAC savings</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payback Period</p>
                    <p className="text-2xl font-bold text-green-600">
                      {((newLayout.metrics.totalFixtures * fluenceLights['SPYDR 2p'].price) / 
                        (((roomSpecs.hpsCount * 1000 - newLayout.metrics.totalPower) / 1000) * 12 * 365 * 0.12 * 1.3)).toFixed(1)} years
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Benefits */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Thermometer className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-medium">Reduced HVAC Load</h4>
                  <p className="text-sm text-gray-600">
                    30% less cooling required vs HPS
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Zap className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-medium">Better Light Quality</h4>
                  <p className="text-sm text-gray-600">
                    Full spectrum, uniform coverage
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <Timer className="w-8 h-8 text-orange-600 mb-2" />
                  <h4 className="font-medium">Longer Lifespan</h4>
                  <p className="text-sm text-gray-600">
                    50,000+ hours vs 24,000 hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lighting Layout Details */}
          <Card>
            <CardHeader>
              <CardTitle>SPYDR 2p Layout Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Fixture Specifications</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model</span>
                      <span>Fluence SPYDR 2p</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wattage</span>
                      <span>645W</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PPF Output</span>
                      <span>1700 μmol/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Efficacy</span>
                      <span>2.6 μmol/J</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coverage</span>
                      <span>4' × 4' @ 6-12"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimensions</span>
                      <span>47" × 44" × 4"</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Layout Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Fixtures</span>
                      <span>{newLayout.metrics.totalFixtures}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average PPFD</span>
                      <span>{newLayout.metrics.avgPPFD.toFixed(0)} μmol/m²/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uniformity</span>
                      <span>{(newLayout.metrics.uniformity * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mounting Height</span>
                      <span>8 ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimming Range</span>
                      <span>0-100%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IP Rating</span>
                      <span>IP66 (Waterproof)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Grid Representation */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Fixture Grid Layout (Top View)</h4>
                <div className="grid grid-cols-11 gap-1">
                  {Array.from({ length: 110 }).map((_, i) => {
                    const row = Math.floor(i / 11);
                    const col = i % 11;
                    const hasFixture = row % 2 === 0 && col % 2 === 0;
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded ${
                          hasFixture
                            ? 'bg-yellow-400 border border-yellow-600'
                            : 'bg-gray-200'
                        }`}
                        title={hasFixture ? 'SPYDR 2p' : 'Coverage area'}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Yellow squares represent SPYDR 2p fixtures in a 6' × 6' grid pattern
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button size="lg">
              View 3D Visualization
            </Button>
            <Button size="lg" variant="outline">
              Export Lighting Report
            </Button>
            <Button size="lg" variant="outline">
              Get Quote for SPYDR 2p
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}