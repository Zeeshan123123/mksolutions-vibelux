'use client';

import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Calculator, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function VPDCalculatorPage() {
  const [temperature, setTemperature] = useState(75);
  const [humidity, setHumidity] = useState(60);
  const [vpd, setVpd] = useState(0);
  const [leafTemp, setLeafTemp] = useState(75);

  // Calculate VPD
  useEffect(() => {
    // Saturation vapor pressure calculation using Magnus formula
    const satVaporPressure = (temp: number) => {
      return 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    };

    const airSatVP = satVaporPressure(temperature);
    const leafSatVP = satVaporPressure(leafTemp);
    const actualVP = airSatVP * (humidity / 100);
    
    const calculatedVPD = leafSatVP - actualVP;
    setVpd(Math.max(0, calculatedVPD));
  }, [temperature, humidity, leafTemp]);

  const getVPDStatus = () => {
    if (vpd < 0.4) return { status: 'Too Low', color: 'text-blue-400', bg: 'bg-blue-900/20' };
    if (vpd < 0.8) return { status: 'Low', color: 'text-cyan-400', bg: 'bg-cyan-900/20' };
    if (vpd <= 1.2) return { status: 'Optimal', color: 'text-green-400', bg: 'bg-green-900/20' };
    if (vpd <= 1.6) return { status: 'High', color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
    return { status: 'Too High', color: 'text-red-400', bg: 'bg-red-900/20' };
  };

  const vpdStatus = getVPDStatus();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/calculators">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Calculators
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">VPD Calculator</h1>
              <p className="text-gray-400">Vapor Pressure Deficit optimization for plant growth</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Environmental Inputs
              </CardTitle>
              <CardDescription>
                Enter your current environmental conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Thermometer className="w-4 h-4" />
                  Air Temperature (°F)
                </label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg"
                  min="32"
                  max="120"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Range: 32-120°F (typical: 70-85°F)
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Droplets className="w-4 h-4" />
                  Relative Humidity (%)
                </label>
                <input
                  type="number"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg"
                  min="0"
                  max="100"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Range: 0-100% (typical: 50-70%)
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Thermometer className="w-4 h-4" />
                  Leaf Temperature (°F)
                </label>
                <input
                  type="number"
                  value={leafTemp}
                  onChange={(e) => setLeafTemp(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg"
                  min="32"
                  max="120"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Usually 2-5°F cooler than air temperature
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>VPD Result</CardTitle>
                <CardDescription>
                  Current vapor pressure deficit calculation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">{vpd.toFixed(2)}</div>
                  <div className="text-gray-400 mb-4">kPa</div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full ${vpdStatus.bg} ${vpdStatus.color} font-semibold`}>
                    {vpdStatus.status}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>VPD Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
                  <span>Seedlings</span>
                  <span className="font-semibold">0.4-0.8 kPa</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                  <span>Vegetative</span>
                  <span className="font-semibold">0.8-1.2 kPa</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-900/20 rounded-lg">
                  <span>Flowering</span>
                  <span className="font-semibold">1.0-1.4 kPa</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {vpd < 0.4 && (
                  <div className="p-4 bg-blue-900/20 rounded-lg">
                    <p className="text-blue-200">VPD too low - increase temperature or decrease humidity to improve transpiration.</p>
                  </div>
                )}
                {vpd >= 0.4 && vpd <= 1.4 && (
                  <div className="p-4 bg-green-900/20 rounded-lg">
                    <p className="text-green-200">Excellent VPD range for healthy plant growth and transpiration.</p>
                  </div>
                )}
                {vpd > 1.4 && (
                  <div className="p-4 bg-red-900/20 rounded-lg">
                    <p className="text-red-200">VPD too high - decrease temperature or increase humidity to prevent plant stress.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Mode Banner */}
        <div className="mt-8 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-center">
          <p className="text-green-400 font-semibold">🚀 Test Mode - Full VPD Calculator Available</p>
        </div>
      </div>
    </div>
  );
}