'use client';

import React, { useState } from 'react';
import { X, Activity, BarChart3, Eye, Sun, Zap, Download, Info } from 'lucide-react';

interface SpectrumAnalysisPanelProps {
  onClose: () => void;
}

export function SpectrumAnalysisPanel({ onClose }: SpectrumAnalysisPanelProps) {
  const [selectedFixture, setSelectedFixture] = useState<string>('fixture1');
  const [showComparison, setShowComparison] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'single' | 'blend'>('single');
  
  // Mock spectrum data
  const spectrumData = {
    wavelengths: Array.from({ length: 400 }, (_, i) => 380 + i),
    fixture1: Array.from({ length: 400 }, (_, i) => {
      const wavelength = 380 + i;
      // Simulate LED spectrum with peaks at blue and red
      const blue = Math.exp(-Math.pow(wavelength - 450, 2) / 1000) * 100;
      const red = Math.exp(-Math.pow(wavelength - 660, 2) / 1500) * 100;
      const farRed = Math.exp(-Math.pow(wavelength - 730, 2) / 1200) * 60;
      return blue + red + farRed + Math.random() * 5;
    })
  };

  const metrics = {
    ppf: 1850,
    ppe: 2.8,
    par: 1680,
    blueRatio: 15,
    greenRatio: 12,
    redRatio: 58,
    farRedRatio: 15,
    rToFr: 3.9,
    dli: 38.5
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-4 w-[520px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Spectrum Analysis
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Fixture Selection */}
      <div className="mb-4 flex gap-2">
        <select
          value={selectedFixture}
          onChange={(e) => setSelectedFixture(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="fixture1">Fluence SPYDR 2p</option>
          <option value="fixture2">Gavita Pro 1700e</option>
          <option value="fixture3">Custom Bar Light</option>
        </select>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showComparison ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Compare
        </button>
      </div>

      {/* Analysis Mode */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setAnalysisMode('single')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            analysisMode === 'single' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Single Fixture
        </button>
        <button
          onClick={() => setAnalysisMode('blend')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            analysisMode === 'blend' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Spectrum Blend
        </button>
      </div>

      {/* Spectrum Graph */}
      <div className="mb-4 bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Spectral Power Distribution</h4>
        <div className="h-48 bg-gray-900 rounded relative overflow-hidden">
          {/* Wavelength regions background */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-blue-900/20"></div>
            <div className="flex-1 bg-green-900/20"></div>
            <div className="flex-1 bg-red-900/20"></div>
            <div className="w-16 bg-red-950/20"></div>
          </div>
          {/* Graph placeholder */}
          <div className="absolute inset-0 flex items-end p-2">
            {spectrumData.wavelengths.filter((_, i) => i % 10 === 0).map((wavelength, i) => {
              const value = spectrumData.fixture1[i * 10];
              const height = (value / 100) * 100;
              return (
                <div
                  key={wavelength}
                  className="flex-1 mx-px"
                  style={{ height: `${height}%` }}
                >
                  <div className="h-full bg-gradient-to-t from-blue-500 via-green-500 to-red-500 opacity-80 rounded-t"></div>
                </div>
              );
            })}
          </div>
          {/* Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 py-1 text-xs text-gray-500">
            <span>380nm</span>
            <span>500nm</span>
            <span>600nm</span>
            <span>700nm</span>
            <span>780nm</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-gray-400">PPF</span>
          </div>
          <div className="text-lg font-semibold text-white">{metrics.ppf}</div>
          <div className="text-xs text-gray-500">μmol/s</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-green-400" />
            <span className="text-xs text-gray-400">PPE</span>
          </div>
          <div className="text-lg font-semibold text-white">{metrics.ppe}</div>
          <div className="text-xs text-gray-500">μmol/J</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="h-4 w-4 text-orange-400" />
            <span className="text-xs text-gray-400">DLI</span>
          </div>
          <div className="text-lg font-semibold text-white">{metrics.dli}</div>
          <div className="text-xs text-gray-500">mol/m²/d</div>
        </div>
      </div>

      {/* Spectrum Breakdown */}
      <div className="mb-4 bg-gray-800 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Spectrum Breakdown</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-400">Blue (400-500nm)</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${metrics.blueRatio}%` }}></div>
              </div>
              <span className="text-sm text-white w-10 text-right">{metrics.blueRatio}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-400">Green (500-600nm)</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metrics.greenRatio}%` }}></div>
              </div>
              <span className="text-sm text-white w-10 text-right">{metrics.greenRatio}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-400">Red (600-700nm)</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${metrics.redRatio}%` }}></div>
              </div>
              <span className="text-sm text-white w-10 text-right">{metrics.redRatio}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-300">Far Red (700-800nm)</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div className="bg-red-700 h-2 rounded-full" style={{ width: `${metrics.farRedRatio}%` }}></div>
              </div>
              <span className="text-sm text-white w-10 text-right">{metrics.farRedRatio}%</span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-sm">
          <span className="text-gray-400">R:FR Ratio</span>
          <span className="text-white font-medium">{metrics.rToFr}:1</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
          <BarChart3 className="h-4 w-4" />
          Generate Report
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300">
            Spectrum analysis helps optimize light quality for different growth stages. Blue promotes vegetative growth, red enhances flowering.
          </p>
        </div>
      </div>
    </div>
  );
}