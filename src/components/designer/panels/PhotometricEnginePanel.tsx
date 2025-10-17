'use client';

import React, { useState } from 'react';
import { X, Lightbulb, Activity, BarChart3, Settings, Download, Info } from 'lucide-react';

interface PhotometricEnginePanelProps {
  onClose: () => void;
}

export function PhotometricEnginePanel({ onClose }: PhotometricEnginePanelProps) {
  const [calculationMode, setCalculationMode] = useState<'point' | 'grid' | 'volumetric'>('grid');
  const [showReflections, setShowReflections] = useState(true);
  const [reflectanceValues, setReflectanceValues] = useState({
    ceiling: 80,
    walls: 50,
    floor: 20
  });
  const [calculationResolution, setCalculationResolution] = useState(6); // inches

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-4 w-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Photometric Engine
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Calculation Mode */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Calculation Mode</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setCalculationMode('point')}
            className={`p-2 rounded text-sm ${
              calculationMode === 'point'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Point
          </button>
          <button
            onClick={() => setCalculationMode('grid')}
            className={`p-2 rounded text-sm ${
              calculationMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setCalculationMode('volumetric')}
            className={`p-2 rounded text-sm ${
              calculationMode === 'volumetric'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Volumetric
          </button>
        </div>
      </div>

      {/* Calculation Settings */}
      <div className="mb-6 space-y-4">
        <h4 className="text-sm font-medium text-gray-400">Calculation Settings</h4>
        
        <div>
          <label className="text-sm text-gray-300">Resolution (inches)</label>
          <input
            type="number"
            value={calculationResolution}
            onChange={(e) => setCalculationResolution(parseInt(e.target.value) || 6)}
            className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
          />
        </div>

        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Include Reflections</span>
          <input
            type="checkbox"
            checked={showReflections}
            onChange={(e) => setShowReflections(e.target.checked)}
            className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>

      {/* Reflectance Values */}
      {showReflections && (
        <div className="mb-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-400">Reflectance Values (%)</h4>
          
          <div>
            <label className="text-sm text-gray-300">Ceiling</label>
            <input
              type="range"
              min="0"
              max="100"
              value={reflectanceValues.ceiling}
              onChange={(e) => setReflectanceValues(prev => ({ ...prev, ceiling: parseInt(e.target.value) }))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{reflectanceValues.ceiling}%</span>
          </div>

          <div>
            <label className="text-sm text-gray-300">Walls</label>
            <input
              type="range"
              min="0"
              max="100"
              value={reflectanceValues.walls}
              onChange={(e) => setReflectanceValues(prev => ({ ...prev, walls: parseInt(e.target.value) }))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{reflectanceValues.walls}%</span>
          </div>

          <div>
            <label className="text-sm text-gray-300">Floor</label>
            <input
              type="range"
              min="0"
              max="100"
              value={reflectanceValues.floor}
              onChange={(e) => setReflectanceValues(prev => ({ ...prev, floor: parseInt(e.target.value) }))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{reflectanceValues.floor}%</span>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      <div className="mb-6 bg-gray-800 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Quick Analysis</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Average PPFD:</span>
            <span className="text-white">-- μmol/m²/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Uniformity:</span>
            <span className="text-white">-- %</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Min/Max Ratio:</span>
            <span className="text-white">--</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
          <Activity className="h-4 w-4" />
          Run Calculation
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors">
          <BarChart3 className="h-4 w-4" />
          View Results
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300">
            The photometric engine uses IES file data to calculate accurate light distribution patterns and intensities.
          </p>
        </div>
      </div>
    </div>
  );
}