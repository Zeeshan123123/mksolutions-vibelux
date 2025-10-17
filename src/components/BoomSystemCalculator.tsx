'use client';

import React, { useState, useEffect } from 'react';
import { 
  BoomPPFDCalculator, 
  CherryCreekBoomCalculator, 
  BoomConfiguration, 
  PPFDCoverageResult,
  BoomSystemUtils 
} from '@/lib/irrigation/boom-ppfd-calculator';
import { ChevronDown, ChevronUp, Play, BarChart3, Settings, Zap, Calendar, TrendingUp } from 'lucide-react';
import { logger } from '@/lib/client-logger';

interface BoomSystemCalculatorProps {
  onClose?: () => void;
}

export function BoomSystemCalculator({ onClose }: BoomSystemCalculatorProps) {
  const [config, setConfig] = useState<BoomConfiguration>({
    fieldLength: 100,
    fieldWidth: 50,
    boomWidth: 30,
    boomHeight: 3,
    movementSpeed: 10,
    dailyPasses: 6,
    operatingHours: 16,
    fixturesPerBoom: 10,
    fixtureSpacing: 3,
    fixturePPFD: 500,
    beamAngle: 120,
    lightingEnabled: true,
    overlapPercentage: 20,
    startTime: 6,
    endTime: 22
  });

  const [result, setResult] = useState<PPFDCoverageResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'results' | 'schedule' | 'optimization' | 'mols-analysis'>('config');
  const [systemType, setSystemType] = useState<'standard' | 'cherry-creek'>('standard');
  const [timeframeStart, setTimeframeStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeframeEnd, setTimeframeEnd] = useState<string>(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  useEffect(() => {
    calculateCoverage();
  }, [config, systemType]);

  const calculateCoverage = async () => {
    setIsCalculating(true);
    
    try {
      // Simulate calculation time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const calculator = systemType === 'cherry-creek' 
        ? new CherryCreekBoomCalculator(config)
        : new BoomPPFDCalculator(config);
      
      const coverage = calculator.calculateCoverage();
      setResult(coverage);
    } catch (error) {
      logger.error('system', 'Error calculating boom coverage:', error );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleConfigChange = (key: keyof BoomConfiguration, value: number | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const optimizeConfiguration = () => {
    if (!result) return;
    
    const targetDLI = 20; // mol/m²/day
    const calculator = new BoomPPFDCalculator(config);
    const optimized = calculator.optimizeForTargetDLI(targetDLI);
    setConfig(optimized);
  };

  const renderCoverageMap = () => {
    if (!result?.coverageMap) return null;
    
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-3">Coverage Heat Map</h4>
        <div className="grid grid-cols-20 gap-px max-w-md mx-auto">
          {result.coverageMap.map((row, x) => 
            row.map((cell, y) => {
              const intensity = Math.min(cell / 30, 1); // Normalize to 30 DLI max
              const color = `rgb(${255 * intensity}, ${255 * (1 - intensity)}, 0)`;
              return (
                <div
                  key={`${x}-${y}`}
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: color }}
                  title={`DLI: ${cell.toFixed(1)} mol/m²/day`}
                />
              );
            })
          )}
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>Low DLI</span>
          <span>High DLI</span>
        </div>
      </div>
    );
  };

  const renderSchedule = () => {
    const calculator = systemType === 'cherry-creek' 
      ? new CherryCreekBoomCalculator(config)
      : new BoomPPFDCalculator(config);
    
    const schedule = calculator.getSchedule();
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Daily Boom Schedule</h4>
        <div className="space-y-3">
          {schedule.map((pass, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Pass {pass.pass}</span>
                <span className="text-gray-400 text-sm">
                  {Math.floor(pass.startTime / 60)}:{(pass.startTime % 60).toString().padStart(2, '0')} - 
                  {Math.floor(pass.endTime / 60)}:{(pass.endTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Direction: {pass.direction}</span>
                <span className="text-gray-400">
                  Duration: {((pass.endTime - pass.startTime) / 60).toFixed(1)} hours
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!result) return null;
    
    const roi = BoomSystemUtils.calculateROI(config, result, 5, 15); // $5/kg, 15% yield increase
    
    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-2">PPFD Metrics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total DLI:</span>
                <span className="text-white">{result.totalDLI.toFixed(1)} mol/m²/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average PPFD:</span>
                <span className="text-white">{result.averagePPFD.toFixed(0)} μmol/m²/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Peak PPFD:</span>
                <span className="text-white">{result.peakPPFD.toFixed(0)} μmol/m²/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Coverage Efficiency:</span>
                <span className="text-white">{result.coverageEfficiency.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Mols/Day:</span>
                <span className="text-white">{result.totalMolsDelivered.toFixed(1)} mol</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-2">Energy & ROI</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Energy Use:</span>
                <span className="text-white">{result.energyConsumption.toFixed(1)} kWh/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Efficiency:</span>
                <span className="text-white">{result.energyEfficiency.toFixed(1)} μmol/J</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payback Period:</span>
                <span className="text-white">{roi.paybackPeriod.toFixed(1)} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ROI:</span>
                <span className="text-white">{roi.roi.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Map */}
        {renderCoverageMap()}

        {/* Uniformity Analysis */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Uniformity Analysis</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Uniformity Index:</span>
                <span className="text-white">{result.uniformityIndex.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-gray-500">
                {result.uniformityIndex < 15 ? 'Excellent' : 
                 result.uniformityIndex < 25 ? 'Good' : 
                 result.uniformityIndex < 35 ? 'Fair' : 'Poor'} uniformity
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Exposure Time:</span>
                <span className="text-white">{(result.dailyExposureTime / 60).toFixed(0)} min/day</span>
              </div>
              <div className="text-xs text-gray-500">
                Per square meter
              </div>
            </div>
          </div>
        </div>

        {/* Hot/Cold Spots */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-2">Hot Spots</h4>
            <div className="space-y-1 text-xs">
              {result.hotspots.slice(0, 3).map((spot, index) => (
                <div key={index} className="flex justify-between text-gray-400">
                  <span>({spot.x}, {spot.y})</span>
                  <span>{spot.dli.toFixed(1)} DLI</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-2">Cold Spots</h4>
            <div className="space-y-1 text-xs">
              {result.coldspots.slice(0, 3).map((spot, index) => (
                <div key={index} className="flex justify-between text-gray-400">
                  <span>({spot.x}, {spot.y})</span>
                  <span>{spot.dli.toFixed(1)} DLI</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-400" size={24} />
            <h2 className="text-xl font-bold text-white">
              Boom System PPFD Calculator
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={systemType}
              onChange={(e) => setSystemType(e.target.value as 'standard' | 'cherry-creek')}
              className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-600"
            >
              <option value="standard">Standard Boom</option>
              <option value="cherry-creek">Cherry Creek Style</option>
            </select>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'config', label: 'Configuration', icon: Settings },
            { id: 'results', label: 'Results', icon: BarChart3 },
            { id: 'schedule', label: 'Schedule', icon: Play },
            { id: 'mols-analysis', label: 'Mols Analysis', icon: TrendingUp },
            { id: 'optimization', label: 'Optimization', icon: Zap }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Field Dimensions */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Field Dimensions</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Field Length (m)</label>
                      <input
                        type="number"
                        value={config.fieldLength}
                        onChange={(e) => handleConfigChange('fieldLength', parseFloat(e.target.value))}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Field Width (m)</label>
                      <input
                        type="number"
                        value={config.fieldWidth}
                        onChange={(e) => handleConfigChange('fieldWidth', parseFloat(e.target.value))}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Boom Width (m)</label>
                      <input
                        type="number"
                        value={config.boomWidth}
                        onChange={(e) => handleConfigChange('boomWidth', parseFloat(e.target.value))}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Boom Height (m)</label>
                      <input
                        type="number"
                        value={config.boomHeight}
                        onChange={(e) => handleConfigChange('boomHeight', parseFloat(e.target.value))}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Movement Parameters */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Movement Parameters</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Movement Speed (m/h)</label>
                      <input
                        type="number"
                        value={config.movementSpeed}
                        onChange={(e) => handleConfigChange('movementSpeed', parseFloat(e.target.value))}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Daily Passes</label>
                      <input
                        type="number"
                        value={config.dailyPasses}
                        onChange={(e) => handleConfigChange('dailyPasses', parseInt(e.target.value))}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Operating Hours</label>
                      <input
                        type="number"
                        value={config.operatingHours}
                        onChange={(e) => handleConfigChange('operatingHours', parseFloat(e.target.value))}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                        <input
                          type="number"
                          value={config.startTime}
                          onChange={(e) => handleConfigChange('startTime', parseInt(e.target.value))}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">End Time</label>
                        <input
                          type="number"
                          value={config.endTime}
                          onChange={(e) => handleConfigChange('endTime', parseInt(e.target.value))}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lighting Configuration */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Lighting Configuration</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Fixtures per Boom</label>
                    <input
                      type="number"
                      value={config.fixturesPerBoom}
                      onChange={(e) => handleConfigChange('fixturesPerBoom', parseInt(e.target.value))}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Fixture PPFD (μmol/m²/s)</label>
                    <input
                      type="number"
                      value={config.fixturePPFD}
                      onChange={(e) => handleConfigChange('fixturePPFD', parseFloat(e.target.value))}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Beam Angle (°)</label>
                    <input
                      type="number"
                      value={config.beamAngle}
                      onChange={(e) => handleConfigChange('beamAngle', parseFloat(e.target.value))}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <div className="flex justify-center">
                <button
                  onClick={calculateCoverage}
                  disabled={isCalculating}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Calculate Coverage
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'results' && renderResults()}
          {activeTab === 'schedule' && renderSchedule()}
          
          {activeTab === 'mols-analysis' && (
            <div className="space-y-6">
              {/* Timeframe Selection */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Custom Timeframe Analysis</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={timeframeStart}
                      onChange={(e) => setTimeframeStart(e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={timeframeEnd}
                      onChange={(e) => setTimeframeEnd(e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                    />
                  </div>
                </div>
                
                {result && (() => {
                  const calculator = systemType === 'cherry-creek' 
                    ? new CherryCreekBoomCalculator(config)
                    : new BoomPPFDCalculator(config);
                  
                  const customTimeframe = calculator.calculateMolsOverTimeframe(
                    new Date(timeframeStart),
                    new Date(timeframeEnd)
                  );
                  
                  return (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{customTimeframe.totalMols.toFixed(1)}</div>
                        <div className="text-sm text-gray-400">Total Mols</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{customTimeframe.timeframeDays}</div>
                        <div className="text-sm text-gray-400">Days</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{customTimeframe.averageDailyMols.toFixed(1)}</div>
                        <div className="text-sm text-gray-400">Avg Mols/Day</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Standard Timeframes */}
              {result && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Standard Timeframes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Total Mols Delivered</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Daily:</span>
                          <span className="text-white">{result.totalMolsDelivered.toFixed(1)} mol</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Weekly:</span>
                          <span className="text-white">{result.timeframeAnalysis.weekly.toFixed(1)} mol</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monthly:</span>
                          <span className="text-white">{result.timeframeAnalysis.monthly.toFixed(1)} mol</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Seasonal (90d):</span>
                          <span className="text-white">{result.timeframeAnalysis.seasonal.toFixed(1)} mol</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Annual:</span>
                          <span className="text-white">{result.timeframeAnalysis.annual.toFixed(1)} mol</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">Photon Calculations</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Daily Photons:</span>
                          <span className="text-white">{(result.totalPhotons / 1e21).toFixed(1)} × 10²¹</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Mols per m²:</span>
                          <span className="text-white">{result.molsPerSquareMeter.toFixed(1)} mol/m²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Field Area:</span>
                          <span className="text-white">{(config.fieldLength * config.fieldWidth).toFixed(0)} m²</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hourly Breakdown */}
              {result && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Hourly Mols Distribution</h3>
                  <div className="grid grid-cols-12 gap-1 mb-4">
                    {result.timeframeAnalysis.hourly.map((hour, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-400 mb-1">{hour.hour}</div>
                        <div
                          className="bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-sm"
                          style={{ height: `${Math.max(hour.mols / Math.max(...result.timeframeAnalysis.hourly.map(h => h.mols)) * 60, 2)}px` }}
                          title={`${hour.hour}:00 - ${hour.mols.toFixed(1)} mol`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 text-center">
                    Hover over bars to see hourly mols delivery
                  </div>
                </div>
              )}

              {/* Cumulative Analysis */}
              {result && (() => {
                const calculator = systemType === 'cherry-creek' 
                  ? new CherryCreekBoomCalculator(config)
                  : new BoomPPFDCalculator(config);
                
                const cumulative = calculator.calculateCumulativeMols(30); // 30 days
                
                return (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">30-Day Cumulative Analysis</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Key Milestones</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Week 1:</span>
                            <span className="text-white">{cumulative[6]?.cumulativeMols.toFixed(1)} mol</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Week 2:</span>
                            <span className="text-white">{cumulative[13]?.cumulativeMols.toFixed(1)} mol</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Week 3:</span>
                            <span className="text-white">{cumulative[20]?.cumulativeMols.toFixed(1)} mol</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">30 Days:</span>
                            <span className="text-white">{cumulative[29]?.cumulativeMols.toFixed(1)} mol</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-2">Growth Impact</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Daily Rate:</span>
                            <span className="text-white">{result.totalMolsDelivered.toFixed(1)} mol/day</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Consistency:</span>
                            <span className="text-white">{result.uniformityIndex < 20 ? 'High' : 'Medium'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Efficiency:</span>
                            <span className="text-white">{result.coverageEfficiency.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          {activeTab === 'optimization' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Optimization Tools</h3>
                <div className="space-y-4">
                  <button
                    onClick={optimizeConfiguration}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Optimize for 20 DLI Target
                  </button>
                  
                  {result && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">System Comparison</h4>
                        <div className="text-sm text-gray-400">
                          {BoomSystemUtils.compareToFixedLighting(config, result).reasoning}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-2">Recommendations</h4>
                        <div className="text-sm text-gray-400">
                          • {result.uniformityIndex < 20 ? 'Good' : 'Adjust boom spacing for better'} uniformity
                          <br />
                          • {result.coverageEfficiency > 80 ? 'Excellent' : 'Increase passes for better'} coverage
                          <br />
                          • {result.energyEfficiency > 2 ? 'Efficient' : 'Consider higher efficacy fixtures'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}