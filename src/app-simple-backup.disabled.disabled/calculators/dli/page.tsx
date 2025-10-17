'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Clock, Calculator, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function DLICalculatorPage() {
  const [ppfd, setPpfd] = useState(400);
  const [hours, setHours] = useState(16);
  const [dli, setDli] = useState(0);

  // Calculate DLI
  useEffect(() => {
    // DLI = PPFD × photoperiod × 0.0036
    const calculatedDLI = (ppfd * hours * 0.0036);
    setDli(calculatedDLI);
  }, [ppfd, hours]);

  const getDLIStatus = () => {
    if (dli < 10) return { status: 'Very Low', color: 'text-red-400', bg: 'bg-red-900/20' };
    if (dli < 20) return { status: 'Low', color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
    if (dli <= 40) return { status: 'Optimal', color: 'text-green-400', bg: 'bg-green-900/20' };
    if (dli <= 60) return { status: 'High', color: 'text-blue-400', bg: 'bg-blue-900/20' };
    return { status: 'Very High', color: 'text-purple-400', bg: 'bg-purple-900/20' };
  };

  const dliStatus = getDLIStatus();

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
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">DLI Calculator</h1>
              <p className="text-gray-400">Daily Light Integral planning for optimal plant growth</p>
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
                Lighting Inputs
              </CardTitle>
              <CardDescription>
                Enter your lighting system parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Sun className="w-4 h-4" />
                  PPFD (μmol/m²/s)
                </label>
                <input
                  type="number"
                  value={ppfd}
                  onChange={(e) => setPpfd(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg"
                  min="0"
                  max="2000"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Photosynthetic Photon Flux Density
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Clock className="w-4 h-4" />
                  Photoperiod (hours)
                </label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg"
                  min="0"
                  max="24"
                  step="0.5"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Hours of light per day
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-2">Quick PPFD Reference</h4>
                <div className="space-y-1 text-sm text-gray-400">
                  <div>• Seedlings: 100-300 μmol/m²/s</div>
                  <div>• Vegetative: 300-600 μmol/m²/s</div>
                  <div>• Flowering: 600-1000 μmol/m²/s</div>
                  <div>• High-light crops: 800-1200 μmol/m²/s</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>DLI Result</CardTitle>
                <CardDescription>
                  Daily Light Integral calculation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">{dli.toFixed(1)}</div>
                  <div className="text-gray-400 mb-4">mol/m²/day</div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full ${dliStatus.bg} ${dliStatus.color} font-semibold`}>
                    {dliStatus.status}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DLI Requirements by Crop</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
                  <span>Leafy Greens</span>
                  <span className="font-semibold">12-17 mol/m²/day</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg">
                  <span>Herbs</span>
                  <span className="font-semibold">15-25 mol/m²/day</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-900/20 rounded-lg">
                  <span>Tomatoes</span>
                  <span className="font-semibold">20-35 mol/m²/day</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
                  <span>Cannabis</span>
                  <span className="font-semibold">35-65 mol/m²/day</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Energy Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Daily runtime:</span>
                  <span className="font-semibold">{hours} hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Weekly DLI:</span>
                  <span className="font-semibold">{(dli * 7).toFixed(0)} mol/m²</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Monthly DLI:</span>
                  <span className="font-semibold">{(dli * 30).toFixed(0)} mol/m²</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {dli < 15 && (
                  <div className="p-4 bg-yellow-900/20 rounded-lg">
                    <p className="text-yellow-200">DLI may be too low for most crops. Consider increasing PPFD or photoperiod.</p>
                  </div>
                )}
                {dli >= 15 && dli <= 40 && (
                  <div className="p-4 bg-green-900/20 rounded-lg">
                    <p className="text-green-200">Excellent DLI range for most horticultural applications.</p>
                  </div>
                )}
                {dli > 40 && (
                  <div className="p-4 bg-blue-900/20 rounded-lg">
                    <p className="text-blue-200">High DLI - suitable for light-hungry crops like cannabis and tomatoes.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Mode Banner */}
        <div className="mt-8 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-center">
          <p className="text-green-400 font-semibold">🚀 Test Mode - Full DLI Calculator Available</p>
        </div>
      </div>
    </div>
  );
}