'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  TurfgrassLightingCalculator, 
  TurfgrassConfiguration, 
  TurfgrassLightingResult,
  TurfgrassUtils 
} from '@/lib/turfgrass/turfgrass-lighting-calculator';
import { 
  Zap, 
  Leaf, 
  Sun, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  AlertCircle,
  CheckCircle,
  BarChart3,
  Settings,
  Calendar
} from 'lucide-react';

interface TurfgrassLightingCalculatorProps {
  onClose?: () => void;
}

export function TurfgrassLightingCalculator({ onClose }: TurfgrassLightingCalculatorProps) {
  const [config, setConfig] = useState<TurfgrassConfiguration>({
    fieldType: 'soccer',
    grassType: 'bermuda',
    fieldArea: 7140, // Standard soccer field (105m x 68m)
    supplementalLighting: true,
    fixtureType: 'led-horticultural',
    fixtureCount: 20,
    fixtureWattage: 400,
    fixtureHeight: 8,
    climate: 'temperate',
    season: 'spring',
    shadingLevel: 15,
    playingSchedule: 'weekly',
    maintenanceWindow: 8,
    offSeasonLighting: true,
    targetQuality: 'professional',
    uniformityRequired: true,
    yearRoundMaintenance: true
  });

  const [result, setResult] = useState<TurfgrassLightingResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'results' | 'schedule' | 'recommendations'>('config');

  useEffect(() => {
    calculateResults();
  }, [config]);

  const calculateResults = async () => {
    setIsCalculating(true);
    
    try {
      // Simulate calculation time
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const calculator = new TurfgrassLightingCalculator(config);
      const calculation = calculator.calculate();
      setResult(calculation);
    } catch (error) {
      logger.error('system', 'Error calculating turfgrass lighting:', error );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleConfigChange = (key: keyof TurfgrassConfiguration, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <AlertCircle className="h-5 w-5 text-yellow-600" />;
  };

  const renderConfiguration = () => (
    <div className="space-y-6">
      {/* Field Specifications */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Field Specifications
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
            <select
              value={config.fieldType}
              onChange={(e) => handleConfigChange('fieldType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="soccer">Soccer Field</option>
              <option value="football">Football Field</option>
              <option value="baseball">Baseball Field</option>
              <option value="golf">Golf Course</option>
              <option value="tennis">Tennis Court</option>
              <option value="general">General Sports Field</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grass Type</label>
            <select
              value={config.grassType}
              onChange={(e) => handleConfigChange('grassType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="bermuda">Bermuda Grass</option>
              <option value="zoysia">Zoysia Grass</option>
              <option value="st-augustine">St. Augustine Grass</option>
              <option value="fescue">Fescue</option>
              <option value="ryegrass">Perennial Ryegrass</option>
              <option value="kentucky-bluegrass">Kentucky Bluegrass</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Area (m²)</label>
            <input
              type="number"
              value={config.fieldArea}
              onChange={(e) => handleConfigChange('fieldArea', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Quality</label>
            <select
              value={config.targetQuality}
              onChange={(e) => handleConfigChange('targetQuality', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="championship">Championship</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lighting System */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Lighting System
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fixture Type</label>
            <select
              value={config.fixtureType}
              onChange={(e) => handleConfigChange('fixtureType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="led-horticultural">LED Horticultural</option>
              <option value="led-sports">LED Sports</option>
              <option value="metal-halide">Metal Halide</option>
              <option value="high-pressure-sodium">High Pressure Sodium</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fixture Count</label>
            <input
              type="number"
              value={config.fixtureCount}
              onChange={(e) => handleConfigChange('fixtureCount', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fixture Wattage</label>
            <input
              type="number"
              value={config.fixtureWattage}
              onChange={(e) => handleConfigChange('fixtureWattage', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fixture Height (m)</label>
            <input
              type="number"
              value={config.fixtureHeight}
              onChange={(e) => handleConfigChange('fixtureHeight', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Environmental Conditions */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Environmental Conditions
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Climate</label>
            <select
              value={config.climate}
              onChange={(e) => handleConfigChange('climate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="temperate">Temperate</option>
              <option value="subtropical">Subtropical</option>
              <option value="tropical">Tropical</option>
              <option value="arid">Arid</option>
              <option value="continental">Continental</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
            <select
              value={config.season}
              onChange={(e) => handleConfigChange('season', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="fall">Fall</option>
              <option value="winter">Winter</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shading Level (%)</label>
            <input
              type="number"
              value={config.shadingLevel}
              onChange={(e) => handleConfigChange('shadingLevel', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Playing Schedule</label>
            <select
              value={config.playingSchedule}
              onChange={(e) => handleConfigChange('playingSchedule', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="occasional">Occasional</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
        </div>
      </div>

      {/* Maintenance Schedule */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Maintenance Schedule
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Lighting Window (hours)</label>
            <input
              type="number"
              value={config.maintenanceWindow}
              onChange={(e) => handleConfigChange('maintenanceWindow', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.supplementalLighting}
                onChange={(e) => handleConfigChange('supplementalLighting', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Supplemental Lighting</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.offSeasonLighting}
                onChange={(e) => handleConfigChange('offSeasonLighting', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Off-Season Lighting</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!result) return <div className="text-center py-8 text-gray-500">No results available</div>;

    return (
      <div className="space-y-6">
        {/* Health Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Grass Health
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Health Score</span>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-semibold ${getHealthColor(result.grassHealth.healthScore)}`}>
                    {result.grassHealth.healthScore.toFixed(0)}%
                  </span>
                  {getHealthIcon(result.grassHealth.healthScore)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <span className="text-sm font-medium">{(result.grassHealth.growthRate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recovery Time</span>
                <span className="text-sm font-medium">{result.grassHealth.recoveryTime} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dormancy Risk</span>
                <span className={`text-sm font-medium ${result.grassHealth.dormancyRisk > 25 ? 'text-red-600' : 'text-green-600'}`}>
                  {result.grassHealth.dormancyRisk.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Light Requirements
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Required DLI</span>
                <span className="text-sm font-medium">{result.photosynthesis.requiredDLI.toFixed(1)} mol/m²/day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Provided DLI</span>
                <span className="text-sm font-medium">{result.photosynthesis.providedDLI.toFixed(1)} mol/m²/day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Light Sufficiency</span>
                <span className={`text-sm font-medium ${result.photosynthesis.lightingSufficiency >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {result.photosynthesis.lightingSufficiency.toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Seasonal Factor</span>
                <span className="text-sm font-medium">{result.photosynthesis.seasonalAdjustment.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{result.performance.playingSurface.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Playing Surface</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{result.performance.playerSafety.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Player Safety</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{result.performance.durability.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Durability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{result.performance.appearance.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Appearance</div>
            </div>
          </div>
        </div>

        {/* Economics */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Economic Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Daily Energy Cost</span>
                  <span className="text-sm font-medium">${result.economics.energyCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Annual Maintenance Savings</span>
                  <span className="text-sm font-medium text-green-600">${result.economics.maintenanceSavings.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Surface Replacement Cycle</span>
                  <span className="text-sm font-medium">{result.economics.surfaceReplacement.toFixed(1)} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ROI</span>
                  <span className={`text-sm font-medium ${result.economics.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.economics.roi.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Water Savings</span>
                  <span className="text-sm font-medium text-blue-600">
                    {TurfgrassUtils.calculateWaterSavings(result.grassHealth.healthScore, config.fieldArea).toFixed(0)} L/day
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Carbon Reduction</span>
                  <span className="text-sm font-medium text-green-600">
                    {TurfgrassUtils.calculateCarbonReduction(
                      config.fixtureCount * config.fixtureWattage * config.maintenanceWindow / 1000,
                      result.grassHealth.healthScore
                    ).toFixed(1)} kg CO₂/day
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSchedule = () => {
    if (!result) return <div className="text-center py-8 text-gray-500">No schedule available</div>;

    const calculator = new TurfgrassLightingCalculator(config);
    const seasonalSchedule = calculator.generateSeasonalSchedule();

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Lighting Schedule
          </h3>
          <div className="space-y-3">
            {result.maintenance.lightingSchedule.map((schedule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">
                      {schedule.startHour}:00 - {schedule.startHour + schedule.duration}:00
                    </div>
                    <div className="text-xs text-gray-500">{schedule.purpose}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-green-600">
                  {schedule.intensity}% intensity
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Seasonal Adjustments</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(seasonalSchedule).map(([season, schedules]) => (
              <div key={season} className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 capitalize mb-2">{season}</h4>
                {schedules.map((schedule, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <div>{schedule.dailyHours.toFixed(1)} hours/day</div>
                    <div>{schedule.intensity}% intensity</div>
                    <div className="text-xs text-gray-500">{schedule.purpose}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!result) return <div className="text-center py-8 text-gray-500">No recommendations available</div>;

    const calculator = new TurfgrassLightingCalculator(config);
    const recommendations = calculator.generateRecommendations();

    return (
      <div className="space-y-6">
        {Object.entries(recommendations).map(([category, items]) => (
          <div key={category} className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
              {category} Recommendations
            </h3>
            {items.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                No recommendations needed - system is optimized
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-50 rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center gap-3">
            <Leaf className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">
              Turfgrass Lighting Calculator
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-white">
          {[
            { id: 'config', label: 'Configuration', icon: Settings },
            { id: 'results', label: 'Results', icon: BarChart3 },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'recommendations', label: 'Recommendations', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white border-b-2 border-green-400'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          {isCalculating && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <div className="text-gray-600">Calculating turfgrass requirements...</div>
            </div>
          )}

          {!isCalculating && (
            <>
              {activeTab === 'config' && renderConfiguration()}
              {activeTab === 'results' && renderResults()}
              {activeTab === 'schedule' && renderSchedule()}
              {activeTab === 'recommendations' && renderRecommendations()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}