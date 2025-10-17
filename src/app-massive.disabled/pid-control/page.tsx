'use client';

import { useState } from 'react';
import { AlertTriangle, Info, Settings, Zap, Gauge } from 'lucide-react';
import { PIDControlPanel } from '@/components/controls/PIDControlPanel';

export default function PIDControlPage() {
  const [showDeepRedWarning, setShowDeepRedWarning] = useState(false);
  const [deepRedPercentage, setDeepRedPercentage] = useState(60);
  const [allowOverride, setAllowOverride] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Gauge className="w-8 h-8 text-purple-400" />
                PID Environmental Control
              </h1>
              <p className="text-gray-400">
                Advanced proportional-integral-derivative control for precision growing
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Settings className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Deep Red Strategy Warning */}
        <div className="mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Deep Red Lighting Strategy
            </h2>
            
            <div className="space-y-4">
              {/* Deep Red Control */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Deep Red Spectrum Percentage
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={deepRedPercentage}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setDeepRedPercentage(value);
                      setShowDeepRedWarning(value > 80);
                    }}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold w-16">{deepRedPercentage}%</span>
                </div>
              </div>

              {/* Cannabis White Tip Warning */}
              {showDeepRedWarning && (
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-400 mb-1">
                        Cannabis White Tip Warning
                      </h4>
                      <p className="text-sm text-gray-300 mb-3">
                        High deep red levels ({deepRedPercentage}%) may increase risk of white tip 
                        (photobleaching) in cannabis, especially during late flowering (weeks 6-8).
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>Monitor top colas daily for white/yellow tips</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>Consider dimming to 80-85% intensity if symptoms appear</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>Increase canopy-to-light distance by 6-12 inches</span>
                        </div>
                      </div>
                      
                      {/* Override Option */}
                      <div className="mt-4 p-3 bg-gray-800 rounded">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowOverride}
                            onChange={(e) => setAllowOverride(e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="text-sm">
                            I understand the risks and want to proceed with {deepRedPercentage}% deep red
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scientific Reference */}
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-400 font-semibold mb-1">Research Note:</p>
                    <p className="text-gray-300">
                      Based on Rodriguez-Morrison et al. (2021) and Westmoreland et al. (2021), 
                      cannabis photobleaching risk increases with:
                    </p>
                    <ul className="mt-2 space-y-1 text-gray-400">
                      <li>• Red light PPFD &gt; 200 μmol/m²/s</li>
                      <li>• Total PPFD &gt; 900 μmol/m²/s in flowering</li>
                      <li>• Prolonged exposure without intensity ramping</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PID Control Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <PIDControlPanel 
            allowHighIntensity={allowOverride}
            deepRedPercentage={deepRedPercentage}
          />
        </div>

        {/* Additional Safety Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Auto-Dimming Protection</h3>
            <p className="text-sm text-gray-400 mb-4">
              Automatically reduces intensity if photobleaching risk detected
            </p>
            <div className="text-xs text-gray-500">
              • Top canopy monitoring
              • Thermal imaging integration
              • VPD-adjusted thresholds
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Spectrum Ramping</h3>
            <p className="text-sm text-gray-400 mb-4">
              Gradual spectrum transitions to prevent light shock
            </p>
            <div className="text-xs text-gray-500">
              • 30-minute dawn/dusk simulation
              • Smooth spectrum shifts
              • Stage-based adjustments
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Strain-Specific Profiles</h3>
            <p className="text-sm text-gray-400 mb-4">
              Pre-configured settings for different cannabis varieties
            </p>
            <div className="text-xs text-gray-500">
              • Sativa: Lower red ratios
              • Indica: Higher red tolerance
              • Auto-flowering: Reduced intensity
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}