'use client';

import React, { useState } from 'react';
import {
  Leaf,
  TrendingUp,
  Droplets,
  Thermometer,
  Sun,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  DollarSign,
  Clock,
  Settings,
  Download,
  Plus,
  Eye,
  Activity,
  Wind,
  Gauge
} from 'lucide-react';

interface CropCycle {
  id: string;
  cropType: string;
  variety: string;
  plantDate: string;
  harvestDate: string;
  stage: 'germination' | 'vegetative' | 'flowering' | 'harvest' | 'complete';
  zone: string;
  plantCount: number;
  expectedYield: number;
  currentYield?: number;
  health: 'excellent' | 'good' | 'fair' | 'poor';
}

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  co2: number;
  ppfd: number;
  dli: number;
  vpd: number;
}

interface YieldMetrics {
  currentCycle: {
    projected: number;
    actual: number;
    efficiency: number;
  };
  historical: {
    lastMonth: number;
    last3Months: number;
    yearToDate: number;
    trend: number;
  };
}

export default function GrowerDemo() {
  const [selectedZone, setSelectedZone] = useState('zone-1');
  const [activeTab, setActiveTab] = useState<'overview' | 'crops' | 'environment' | 'yield' | 'analytics'>('overview');

  const cropCycles: CropCycle[] = [
    {
      id: 'cycle-1',
      cropType: 'Lettuce',
      variety: 'Buttercrunch',
      plantDate: '2024-01-15',
      harvestDate: '2024-02-28',
      stage: 'harvest',
      zone: 'Zone A',
      plantCount: 2400,
      expectedYield: 720,
      currentYield: 745,
      health: 'excellent'
    },
    {
      id: 'cycle-2',
      cropType: 'Basil',
      variety: 'Genovese',
      plantDate: '2024-01-08',
      harvestDate: '2024-03-15',
      stage: 'flowering',
      zone: 'Zone B',
      plantCount: 1800,
      expectedYield: 540,
      health: 'good'
    },
    {
      id: 'cycle-3',
      cropType: 'Tomatoes',
      variety: 'Cherry',
      plantDate: '2024-02-01',
      harvestDate: '2024-05-30',
      stage: 'vegetative',
      zone: 'Zone C',
      plantCount: 600,
      expectedYield: 1800,
      health: 'excellent'
    },
    {
      id: 'cycle-4',
      cropType: 'Spinach',
      variety: 'Baby Leaf',
      plantDate: '2024-02-10',
      harvestDate: '2024-03-25',
      stage: 'germination',
      zone: 'Zone D',
      plantCount: 3200,
      expectedYield: 480,
      health: 'good'
    }
  ];

  const environmentalData: Record<string, EnvironmentalData> = {
    'zone-1': {
      temperature: 22.5,
      humidity: 65,
      co2: 1200,
      ppfd: 385,
      dli: 18.5,
      vpd: 0.85
    },
    'zone-2': {
      temperature: 24.2,
      humidity: 68,
      co2: 1150,
      ppfd: 420,
      dli: 20.2,
      vpd: 0.92
    },
    'zone-3': {
      temperature: 26.1,
      humidity: 62,
      co2: 1300,
      ppfd: 450,
      dli: 21.6,
      vpd: 1.15
    }
  };

  const yieldMetrics: YieldMetrics = {
    currentCycle: {
      projected: 3540,
      actual: 2847,
      efficiency: 103.4
    },
    historical: {
      lastMonth: 2654,
      last3Months: 8921,
      yearToDate: 18477,
      trend: 12.3
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'germination': return 'bg-yellow-500';
      case 'vegetative': return 'bg-green-500';
      case 'flowering': return 'bg-purple-500';
      case 'harvest': return 'bg-orange-500';
      case 'complete': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getMetricStatus = (value: number, target: number, type: 'temp' | 'humidity' | 'co2' | 'ppfd') => {
    const tolerance = {
      temp: 2,
      humidity: 5,
      co2: 100,
      ppfd: 25
    };
    
    const diff = Math.abs(value - target);
    if (diff <= tolerance[type]) return 'optimal';
    if (diff <= tolerance[type] * 2) return 'acceptable';
    return 'warning';
  };

  const zones = [
    { id: 'zone-1', name: 'Zone A - Leafy Greens', crop: 'Lettuce', area: '1,200 sq ft' },
    { id: 'zone-2', name: 'Zone B - Herbs', crop: 'Basil', area: '800 sq ft' },
    { id: 'zone-3', name: 'Zone C - Fruiting', crop: 'Tomatoes', area: '2,000 sq ft' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Leaf className="w-8 h-8 text-green-400" />
                <div>
                  <h1 className="text-xl font-bold">Grower Dashboard</h1>
                  <p className="text-sm text-gray-400">Precision Crop Management System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Cycle
              </button>
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Active Cycles</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-green-400">2 ready for harvest</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Yield Efficiency</p>
                  <p className="text-2xl font-bold">103.4%</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-blue-400">+12.3% vs last month</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Avg PPFD</p>
                  <p className="text-2xl font-bold">418</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-purple-400">All zones optimal</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Revenue YTD</p>
                  <p className="text-2xl font-bold">$127K</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-orange-400">$18K this month</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'crops', label: 'Crop Cycles', icon: Leaf },
              { id: 'environment', label: 'Environment', icon: Thermometer },
              { id: 'yield', label: 'Yield Tracking', icon: TrendingUp },
              { id: 'analytics', label: 'Analytics', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current Cycles */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Active Crop Cycles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cropCycles.slice(0, 4).map((cycle) => (
                  <div key={cycle.id} className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStageColor(cycle.stage)}`}></div>
                        <h4 className="font-medium">{cycle.cropType} - {cycle.variety}</h4>
                      </div>
                      <span className={`text-sm ${getHealthColor(cycle.health)}`}>
                        {cycle.health}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Zone: {cycle.zone}</span>
                        <span>Stage: {cycle.stage}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Plants: {cycle.plantCount.toLocaleString()}</span>
                        <span>Expected: {cycle.expectedYield} kg</span>
                      </div>
                      {cycle.currentYield && (
                        <div className="flex items-center justify-between">
                          <span>Current: {cycle.currentYield} kg</span>
                          <span className="text-green-400">
                            {((cycle.currentYield / cycle.expectedYield) * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Environmental Summary */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Environmental Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {zones.map((zone) => {
                  const env = environmentalData[zone.id];
                  return (
                    <div key={zone.id} className="p-4 bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium mb-3">{zone.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Temperature</span>
                          <span className="font-medium">{env.temperature}°C</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Humidity</span>
                          <span className="font-medium">{env.humidity}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">PPFD</span>
                          <span className="font-medium">{env.ppfd} µmol/m²/s</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">CO₂</span>
                          <span className="font-medium">{env.co2} ppm</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'crops' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Crop Cycle Management</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">
                    Schedule Harvest
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Calendar View
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {cropCycles.map((cycle) => (
                  <div key={cycle.id} className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${getStageColor(cycle.stage)}`}></div>
                        <div>
                          <h4 className="font-medium">{cycle.cropType} - {cycle.variety}</h4>
                          <p className="text-sm text-gray-400">{cycle.zone} • {cycle.plantCount.toLocaleString()} plants</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm ${getHealthColor(cycle.health)}`}>
                          {cycle.health}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Plant Date</span>
                        <p className="font-medium">{new Date(cycle.plantDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Harvest Date</span>
                        <p className="font-medium">{new Date(cycle.harvestDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Expected Yield</span>
                        <p className="font-medium">{cycle.expectedYield} kg</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Current Progress</span>
                        <p className="font-medium capitalize">{cycle.stage}</p>
                      </div>
                    </div>

                    {cycle.currentYield && (
                      <div className="mt-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-400">Current yield: {cycle.currentYield} kg</span>
                          <span className="text-sm text-green-400">
                            {((cycle.currentYield / cycle.expectedYield) * 100).toFixed(1)}% of expected
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'environment' && (
          <div className="space-y-6">
            {/* Zone Selector */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Select Zone:</span>
                <div className="flex gap-2">
                  {zones.map((zone) => (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZone(zone.id)}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        selectedZone === zone.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {zone.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Environmental Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Temperature</h3>
                  <Thermometer className="w-6 h-6 text-red-400" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  {environmentalData[selectedZone]?.temperature}°C
                </div>
                <div className="text-sm text-gray-400">
                  Target: 22-24°C
                  <span className="text-green-400 ml-2">✓ Optimal</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Humidity</h3>
                  <Droplets className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  {environmentalData[selectedZone]?.humidity}%
                </div>
                <div className="text-sm text-gray-400">
                  Target: 60-70%
                  <span className="text-green-400 ml-2">✓ Optimal</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">CO₂</h3>
                  <Wind className="w-6 h-6 text-gray-400" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  {environmentalData[selectedZone]?.co2} ppm
                </div>
                <div className="text-sm text-gray-400">
                  Target: 1000-1500 ppm
                  <span className="text-green-400 ml-2">✓ Optimal</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">PPFD</h3>
                  <Sun className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  {environmentalData[selectedZone]?.ppfd}
                </div>
                <div className="text-sm text-gray-400">
                  µmol/m²/s
                  <span className="text-green-400 ml-2">✓ Optimal</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">DLI</h3>
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  {environmentalData[selectedZone]?.dli}
                </div>
                <div className="text-sm text-gray-400">
                  mol/m²/day
                  <span className="text-green-400 ml-2">✓ Optimal</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">VPD</h3>
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  {environmentalData[selectedZone]?.vpd}
                </div>
                <div className="text-sm text-gray-400">
                  kPa
                  <span className="text-green-400 ml-2">✓ Optimal</span>
                </div>
              </div>
            </div>

            {/* Real-time Charts Placeholder */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">24-Hour Trends</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">Temperature</button>
                  <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">Humidity</button>
                  <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">PPFD</button>
                </div>
              </div>
              <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Real-time Environmental Charts</p>
                  <p className="text-sm text-gray-500">Temperature, humidity, and light trends</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'yield' && (
          <div className="space-y-6">
            {/* Yield Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Current Cycle</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Projected</span>
                    <span className="font-medium">{yieldMetrics.currentCycle.projected} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Actual</span>
                    <span className="font-medium text-green-400">{yieldMetrics.currentCycle.actual} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Efficiency</span>
                    <span className="font-medium text-blue-400">{yieldMetrics.currentCycle.efficiency}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Historical Performance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Last Month</span>
                    <span className="font-medium">{yieldMetrics.historical.lastMonth} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Last 3 Months</span>
                    <span className="font-medium">{yieldMetrics.historical.last3Months} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Year to Date</span>
                    <span className="font-medium text-purple-400">{yieldMetrics.historical.yearToDate} kg</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Trend Analysis</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    +{yieldMetrics.historical.trend}%
                  </div>
                  <p className="text-sm text-gray-400">Month over month improvement</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Improving</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Yield by Crop Type */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Yield by Crop Type</h3>
              <div className="space-y-4">
                {cropCycles.filter(c => c.currentYield).map((cycle) => (
                  <div key={cycle.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStageColor(cycle.stage)}`}></div>
                      <div>
                        <h4 className="font-medium">{cycle.cropType} - {cycle.variety}</h4>
                        <p className="text-sm text-gray-400">{cycle.zone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{cycle.currentYield} kg</p>
                      <p className="text-sm text-green-400">
                        {((cycle.currentYield! / cycle.expectedYield) * 100).toFixed(1)}% of target
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Crop Health Score</span>
                    <span className="text-green-400 font-medium">92%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Resource Efficiency</span>
                    <span className="text-blue-400 font-medium">87%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Energy Usage</span>
                    <span className="text-purple-400 font-medium">2.1 kWh/kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Water Usage</span>
                    <span className="text-cyan-400 font-medium">18.5 L/kg</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Revenue This Month</span>
                    <span className="font-medium">$18,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Operating Costs</span>
                    <span className="font-medium">$12,200</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Profit Margin</span>
                    <span className="text-green-400 font-medium">33.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Cost per kg</span>
                    <span className="font-medium">$4.28</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Productivity Chart Placeholder */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Productivity Trends</h3>
              <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Yield & Revenue Analytics</p>
                  <p className="text-sm text-gray-500">Monthly trends and forecasting</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}