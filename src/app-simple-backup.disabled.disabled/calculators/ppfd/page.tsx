'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Ruler, Calculator, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PPFDCalculatorPage() {
  const [ppf, setPpf] = useState(1750);
  const [width, setWidth] = useState(4);
  const [length, setLength] = useState(4);
  const [height, setHeight] = useState(2);
  const [efficiency, setEfficiency] = useState(85);
  const [ppfd, setPpfd] = useState(0);

  // Calculate PPFD
  useEffect(() => {
    const area = width * length; // m²
    const effectivePPF = ppf * (efficiency / 100);
    
    // Basic inverse square law approximation
    // PPFD = PPF / Area (simplified, actual calculation is more complex)
    const calculatedPPFD = area > 0 ? effectivePPF / area : 0;
    setPpfd(calculatedPPFD);
  }, [ppf, width, length, height, efficiency]);

  const getPPFDStatus = () => {
    if (ppfd < 200) return { status: 'Low', color: 'text-blue-400', bg: 'bg-blue-900/20' };
    if (ppfd < 400) return { status: 'Moderate', color: 'text-cyan-400', bg: 'bg-cyan-900/20' };
    if (ppfd <= 800) return { status: 'Good', color: 'text-green-400', bg: 'bg-green-900/20' };
    if (ppfd <= 1200) return { status: 'High', color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
    return { status: 'Very High', color: 'text-red-400', bg: 'bg-red-900/20' };
  };

  const ppfdStatus = getPPFDStatus();

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
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">PPFD Calculator</h1>
              <p className="text-gray-400">Photosynthetic Photon Flux Density calculations</p>
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
                Fixture & Area Inputs
              </CardTitle>
              <CardDescription>
                Enter your fixture specifications and coverage area
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Zap className="w-4 h-4" />
                  PPF (μmol/s)
                </label>
                <input
                  type="number"
                  value={ppf}
                  onChange={(e) => setPpf(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg"
                  min="0"
                  max="5000"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Photosynthetic Photon Flux (fixture output)
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Ruler className="w-4 h-4" />
                  Coverage Width (m)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg"
                  min="0.1"
                  max="20"
                  step="0.1"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Ruler className="w-4 h-4" />
                  Coverage Length (m)
                </label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg"
                  min="0.1"
                  max="20"
                  step="0.1"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Ruler className="w-4 h-4" />
                  Hanging Height (m)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg"
                  min="0.1"
                  max="10"
                  step="0.1"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  Optical Efficiency (%)
                </label>
                <input
                  type="number"
                  value={efficiency}
                  onChange={(e) => setEfficiency(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg"
                  min="50"
                  max="100"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Light transmission efficiency (typical: 80-95%)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PPFD Result</CardTitle>
                <CardDescription>
                  Average photosynthetic photon flux density
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">{Math.round(ppfd)}</div>
                  <div className="text-gray-400 mb-4">μmol/m²/s</div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full ${ppfdStatus.bg} ${ppfdStatus.color} font-semibold`}>
                    {ppfdStatus.status}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coverage Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Coverage Area:</span>
                  <span className="font-semibold">{(width * length).toFixed(1)} m²</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Effective PPF:</span>
                  <span className="font-semibold">{Math.round(ppf * (efficiency / 100))} μmol/s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>PPF per m²:</span>
                  <span className="font-semibold">{Math.round(ppf / (width * length))} μmol/s/m²</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PPFD Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
                  <span>Seedlings</span>
                  <span className="font-semibold">100-300 μmol/m²/s</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                  <span>Vegetative</span>
                  <span className="font-semibold">300-600 μmol/m²/s</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-900/20 rounded-lg">
                  <span>Flowering</span>
                  <span className="font-semibold">600-1000 μmol/m²/s</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-900/20 rounded-lg">
                  <span>High Light</span>
                  <span className="font-semibold">1000+ μmol/m²/s</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {ppfd < 300 && (
                  <div className="p-4 bg-blue-900/20 rounded-lg">
                    <p className="text-blue-200">PPFD suitable for seedlings and low-light plants. Consider increasing for vegetative growth.</p>
                  </div>
                )}
                {ppfd >= 300 && ppfd <= 800 && (
                  <div className="p-4 bg-green-900/20 rounded-lg">
                    <p className="text-green-200">Excellent PPFD range for most vegetative growth applications.</p>
                  </div>
                )}
                {ppfd > 800 && (
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <p className="text-yellow-200">High PPFD - ideal for flowering and high-light crops. Ensure adequate CO₂ supplementation.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Mode Banner */}
        <div className="mt-8 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-center">
          <p className="text-green-400 font-semibold">🚀 Test Mode - Full PPFD Calculator Available</p>
        </div>
      </div>
    </div>
  );
}