'use client';

import React, { useState } from 'react';
import { Zap, Lightbulb, Target, BarChart3, Settings, Play, Pause, RotateCcw } from 'lucide-react';

interface SpectrumProfile {
  id: string;
  name: string;
  red: number;
  blue: number;
  green: number;
  farRed: number;
  uv: number;
  description: string;
  stage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
}

const spectrumProfiles: SpectrumProfile[] = [
  {
    id: 'seedling',
    name: 'Seedling Boost',
    red: 45,
    blue: 35,
    green: 15,
    farRed: 3,
    uv: 2,
    description: 'Optimized for seed germination and early growth',
    stage: 'seedling'
  },
  {
    id: 'vegetative',
    name: 'Vegetative Growth',
    red: 40,
    blue: 40,
    green: 15,
    farRed: 3,
    uv: 2,
    description: 'Promotes healthy leaf development and stem growth',
    stage: 'vegetative'
  },
  {
    id: 'flowering',
    name: 'Flowering Trigger',
    red: 55,
    blue: 25,
    green: 12,
    farRed: 6,
    uv: 2,
    description: 'Optimized for flower initiation and development',
    stage: 'flowering'
  },
  {
    id: 'harvest',
    name: 'Pre-Harvest Quality',
    red: 50,
    blue: 30,
    green: 10,
    farRed: 8,
    uv: 2,
    description: 'Enhances terpene and cannabinoid production',
    stage: 'harvest'
  }
];

export function SpectrumOptimizationSystem() {
  const [selectedProfile, setSelectedProfile] = useState<SpectrumProfile>(spectrumProfiles[0]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [customSpectrum, setCustomSpectrum] = useState({
    red: 45,
    blue: 35,
    green: 15,
    farRed: 3,
    uv: 2
  });

  const handleOptimizationToggle = () => {
    setIsOptimizing(!isOptimizing);
  };

  const handleSpectrumChange = (channel: string, value: number) => {
    setCustomSpectrum(prev => ({
      ...prev,
      [channel]: value
    }));
  };

  const resetToProfile = () => {
    setCustomSpectrum({
      red: selectedProfile.red,
      blue: selectedProfile.blue,
      green: selectedProfile.green,
      farRed: selectedProfile.farRed,
      uv: selectedProfile.uv
    });
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Spectrum Optimization</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOptimizationToggle}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isOptimizing
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {isOptimizing ? (
                <>
                  <Pause className="w-4 h-4 inline mr-1" />
                  Active
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 inline mr-1" />
                  Start
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Selection */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Growth Stage Profiles</h4>
          <div className="grid grid-cols-2 gap-2">
            {spectrumProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedProfile(profile)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedProfile.id === profile.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="font-medium text-white text-sm">{profile.name}</div>
                <div className="text-xs text-gray-400 mt-1">{profile.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Spectrum Controls */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300">Spectrum Composition</h4>
            <button
              onClick={resetToProfile}
              className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Profile
            </button>
          </div>
          
          <div className="space-y-3">
            {Object.entries(customSpectrum).map(([channel, value]) => (
              <div key={channel} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300 capitalize">
                    {channel === 'farRed' ? 'Far Red' : channel}
                  </label>
                  <span className="text-sm text-white font-medium">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => handleSpectrumChange(channel, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${getChannelColor(channel)} 0%, ${getChannelColor(channel)} ${value}%, #374151 ${value}%, #374151 100%)`
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Spectrum Visualization */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Spectrum Preview</h4>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-end space-x-1 h-24">
              {Object.entries(customSpectrum).map(([channel, value]) => (
                <div key={channel} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-t transition-all duration-300"
                    style={{
                      height: `${(value / 100) * 80}px`,
                      backgroundColor: getChannelColor(channel),
                      opacity: 0.8
                    }}
                  />
                  <div className="text-xs text-gray-400 mt-1 capitalize">
                    {channel === 'farRed' ? 'FR' : channel.charAt(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Optimization Metrics</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">DLI Efficiency</span>
              </div>
              <div className="text-lg font-bold text-white">94.2%</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Energy Efficiency</span>
              </div>
              <div className="text-lg font-bold text-white">2.8 μmol/J</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Photosynthetic Rate</span>
              </div>
              <div className="text-lg font-bold text-white">+23%</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Settings className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">Uniformity</span>
              </div>
              <div className="text-lg font-bold text-white">96.8%</div>
            </div>
          </div>
        </div>

        {/* Optimization Status */}
        {isOptimizing && (
          <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-300">Optimization Active</span>
            </div>
            <p className="text-xs text-green-200">
              AI system is continuously adjusting spectrum based on plant response and growth stage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getChannelColor(channel: string): string {
  switch (channel) {
    case 'red': return '#ef4444';
    case 'blue': return '#3b82f6';
    case 'green': return '#22c55e';
    case 'farRed': return '#dc2626';
    case 'uv': return '#8b5cf6';
    default: return '#6b7280';
  }
}