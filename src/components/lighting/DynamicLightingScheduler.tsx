'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import {
  Clock,
  Plus,
  Trash2,
  Edit3,
  Play,
  Pause,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Palette,
  Target,
  Calendar,
  Settings,
  Save,
  Copy,
  RefreshCw,
  Activity,
  TrendingUp,
  Zap,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  CheckCircle,
  X,
  ArrowRight,
  Lightbulb,
  Timer,
  Sliders
} from 'lucide-react';

interface TimePoint {
  id: string;
  time: string; // HH:MM format
  name: string;
  description?: string;
  enabled: boolean;
  
  // Recipe or manual spectrum control
  mode: 'recipe' | 'manual' | 'transition';
  recipeId?: string;
  
  // Manual spectrum control
  spectrum?: {
    blue: number;
    green: number;
    red: number;
    farRed: number;
    uv: number;
    white: number;
  };
  
  // Light parameters
  intensity: number; // 0-100%
  ppfd?: number;
  
  // Transition settings
  transitionDuration: number; // minutes
  transitionType: 'linear' | 'smooth' | 'stepped';
  
  // Advanced settings
  rampTime: number; // seconds for immediate change
  maintainPPFD: boolean;
  
  // Conditional settings
  conditions?: {
    enableOnDays: string[]; // ['mon', 'tue', etc.]
    enableOnDates?: string[]; // specific dates
    weatherDependent?: boolean;
    cropStageDependent?: boolean;
  };
}

interface DailySchedule {
  id: string;
  name: string;
  description: string;
  zoneId: string;
  zoneName: string;
  isActive: boolean;
  timePoints: TimePoint[];
  createdAt: Date;
  updatedAt: Date;
  
  // Schedule metadata
  totalEnergyUsage: number; // kWh estimation
  totalDLI: number; // mol/m²/day
  peakPPFD: number;
  averagePPFD: number;
  
  // Performance tracking
  metrics?: {
    energyEfficiency: number; // % improvement
    plantResponse: number; // growth rate improvement
    yieldImpact: number; // % change
    costSavings: number; // $ per day
  };
}

interface Recipe {
  id: string;
  name: string;
  cropType: string;
  spectrum: {
    blue: number;
    green: number;
    red: number;
    farRed: number;
    uv: number;
    white: number;
  };
  targetPPFD: number;
  description: string;
}

interface Zone {
  id: string;
  name: string;
  area: number;
  currentCrop?: string;
  growthStage?: string;
  status: 'active' | 'idle' | 'maintenance';
}

// Mock data
const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Morning Vegetative Boost',
    cropType: 'Leafy Greens',
    spectrum: { blue: 30, green: 10, red: 45, farRed: 10, uv: 2, white: 3 },
    targetPPFD: 200,
    description: 'High blue content for morning photosynthesis activation'
  },
  {
    id: '2',
    name: 'Midday Growth Optimizer',
    cropType: 'Leafy Greens',
    spectrum: { blue: 15, green: 8, red: 65, farRed: 8, uv: 2, white: 2 },
    targetPPFD: 300,
    description: 'Red-heavy spectrum for peak photosynthesis'
  },
  {
    id: '3',
    name: 'Evening Wind-Down',
    cropType: 'Leafy Greens',
    spectrum: { blue: 10, green: 15, red: 50, farRed: 20, uv: 1, white: 4 },
    targetPPFD: 150,
    description: 'Higher far-red for end-of-day responses'
  },
  {
    id: '4',
    name: 'Cannabis Flowering Morning',
    cropType: 'Cannabis',
    spectrum: { blue: 12, green: 5, red: 70, farRed: 10, uv: 3, white: 0 },
    targetPPFD: 800,
    description: 'Flowering spectrum with UV for terpene production'
  }
];

const MOCK_ZONES: Zone[] = [
  { id: 'zone-1', name: 'Greenhouse A - North', area: 200, currentCrop: 'Lettuce', growthStage: 'vegetative', status: 'active' },
  { id: 'zone-2', name: 'Indoor Room 1', area: 100, currentCrop: 'Cannabis', growthStage: 'flowering', status: 'active' }
];

const DEFAULT_SCHEDULE: DailySchedule = {
  id: '',
  name: 'New Schedule',
  description: '',
  zoneId: '',
  zoneName: '',
  isActive: false,
  timePoints: [
    {
      id: '1',
      time: '06:00',
      name: 'Sunrise',
      description: 'Gentle morning activation',
      enabled: true,
      mode: 'recipe',
      recipeId: '1',
      intensity: 30,
      transitionDuration: 30,
      transitionType: 'smooth',
      rampTime: 120,
      maintainPPFD: true
    },
    {
      id: '2',
      time: '12:00',
      name: 'Midday Peak',
      description: 'Maximum photosynthesis',
      enabled: true,
      mode: 'recipe',
      recipeId: '2',
      intensity: 100,
      transitionDuration: 15,
      transitionType: 'linear',
      rampTime: 60,
      maintainPPFD: true
    },
    {
      id: '3',
      time: '18:00',
      name: 'Evening Transition',
      description: 'Prepare for night cycle',
      enabled: true,
      mode: 'recipe',
      recipeId: '3',
      intensity: 60,
      transitionDuration: 45,
      transitionType: 'smooth',
      rampTime: 180,
      maintainPPFD: false
    },
    {
      id: '4',
      time: '22:00',
      name: 'Lights Off',
      description: 'Night period begins',
      enabled: true,
      mode: 'manual',
      spectrum: { blue: 0, green: 0, red: 0, farRed: 0, uv: 0, white: 0 },
      intensity: 0,
      transitionDuration: 15,
      transitionType: 'linear',
      rampTime: 300,
      maintainPPFD: false
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
  totalEnergyUsage: 0,
  totalDLI: 0,
  peakPPFD: 0,
  averagePPFD: 0
};

export function DynamicLightingScheduler() {
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<DailySchedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<DailySchedule | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedules' | 'live' | 'analytics'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTimePointModal, setShowTimePointModal] = useState(false);
  const [editingTimePoint, setEditingTimePoint] = useState<TimePoint | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveMode, setLiveMode] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate schedule metrics
  const calculateScheduleMetrics = (schedule: DailySchedule): DailySchedule => {
    let totalDLI = 0;
    let peakPPFD = 0;
    let totalEnergyUsage = 0;
    let weightedPPFD = 0;
    let totalDuration = 0;

    for (let i = 0; i < schedule.timePoints.length; i++) {
      const point = schedule.timePoints[i];
      const nextPoint = schedule.timePoints[i + 1];
      
      if (!point.enabled || point.intensity === 0) continue;

      // Calculate PPFD for this point
      let ppfd = 0;
      if (point.mode === 'recipe' && point.recipeId) {
        const recipe = recipes.find(r => r.id === point.recipeId);
        ppfd = recipe ? (recipe.targetPPFD * point.intensity / 100) : 0;
      } else if (point.ppfd) {
        ppfd = point.ppfd * point.intensity / 100;
      } else {
        // Estimate PPFD from spectrum (simplified calculation)
        const totalSpectrum = point.spectrum ? 
          Object.values(point.spectrum).reduce((a, b) => a + b, 0) : 0;
        ppfd = (totalSpectrum / 100) * point.intensity * 5; // Rough estimation
      }

      peakPPFD = Math.max(peakPPFD, ppfd);

      // Calculate duration until next point
      if (nextPoint) {
        const currentMinutes = parseInt(point.time.split(':')[0]) * 60 + parseInt(point.time.split(':')[1]);
        const nextMinutes = parseInt(nextPoint.time.split(':')[0]) * 60 + parseInt(nextPoint.time.split(':')[1]);
        const duration = nextMinutes > currentMinutes ? 
          nextMinutes - currentMinutes : 
          (24 * 60) - currentMinutes + nextMinutes;

        // Add to DLI calculation (convert minutes to hours, PPFD to DLI)
        totalDLI += (ppfd * duration / 60) * 3.6 / 1000000; // Convert to mol/m²/day
        weightedPPFD += ppfd * duration;
        totalDuration += duration;

        // Estimate energy usage (simplified)
        totalEnergyUsage += (ppfd / 100) * (duration / 60) * 0.5; // kWh estimation
      }
    }

    return {
      ...schedule,
      totalDLI: parseFloat(totalDLI.toFixed(2)),
      peakPPFD: Math.round(peakPPFD),
      averagePPFD: totalDuration > 0 ? Math.round(weightedPPFD / totalDuration) : 0,
      totalEnergyUsage: parseFloat(totalEnergyUsage.toFixed(2))
    };
  };

  const deploySchedule = async (schedule: DailySchedule) => {
    try {
      const response = await fetch('/api/v1/lighting/hlp/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: 'deploySchedule',
          zoneId: schedule.zoneId,
          schedule: {
            name: schedule.name,
            timePoints: schedule.timePoints.map(tp => ({
              time: tp.time,
              enabled: tp.enabled,
              intensity: tp.intensity,
              spectrum: tp.mode === 'recipe' ? 
                recipes.find(r => r.id === tp.recipeId)?.spectrum : 
                tp.spectrum,
              transitionDuration: tp.transitionDuration,
              transitionType: tp.transitionType,
              rampTime: tp.rampTime,
              maintainPPFD: tp.maintainPPFD
            }))
          }
        })
      });

      if (response.ok) {
        // Update schedule status
        setSchedules(prev => prev.map(s => 
          s.id === schedule.id ? { ...s, isActive: true } : s
        ));
        
        // Show success message
        alert('Schedule deployed successfully!');
      } else {
        alert('Failed to deploy schedule');
      }
    } catch (error) {
      logger.error('system', 'Deployment error:', error );
      alert('Error deploying schedule');
    }
  };

  const getCurrentTimePoint = (schedule: DailySchedule): TimePoint | null => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    // Find the current active time point
    let currentPoint: TimePoint | null = null;
    let minDistance = Infinity;

    schedule.timePoints.forEach(point => {
      if (!point.enabled) return;
      
      const pointMinutes = parseInt(point.time.split(':')[0]) * 60 + parseInt(point.time.split(':')[1]);
      let distance;
      
      if (pointMinutes <= now) {
        distance = now - pointMinutes;
      } else {
        distance = (24 * 60) - pointMinutes + now;
      }
      
      if (distance < minDistance) {
        minDistance = distance;
        currentPoint = point;
      }
    });

    return currentPoint;
  };

  const addTimePoint = () => {
    if (!editingSchedule) return;
    
    const newTimePoint: TimePoint = {
      id: Date.now().toString(),
      time: '12:00',
      name: 'New Time Point',
      enabled: true,
      mode: 'manual',
      spectrum: { blue: 20, green: 10, red: 60, farRed: 8, uv: 2, white: 0 },
      intensity: 100,
      transitionDuration: 15,
      transitionType: 'linear',
      rampTime: 60,
      maintainPPFD: true
    };
    
    setEditingTimePoint(newTimePoint);
    setShowTimePointModal(true);
  };

  const saveTimePoint = (timePoint: TimePoint) => {
    if (!editingSchedule) return;
    
    const updatedTimePoints = editingTimePoint?.id === timePoint.id ?
      editingSchedule.timePoints.map(tp => tp.id === timePoint.id ? timePoint : tp) :
      [...editingSchedule.timePoints, timePoint];
    
    // Sort by time
    updatedTimePoints.sort((a, b) => {
      const aMinutes = parseInt(a.time.split(':')[0]) * 60 + parseInt(a.time.split(':')[1]);
      const bMinutes = parseInt(b.time.split(':')[0]) * 60 + parseInt(b.time.split(':')[1]);
      return aMinutes - bMinutes;
    });
    
    const updatedSchedule = calculateScheduleMetrics({
      ...editingSchedule,
      timePoints: updatedTimePoints,
      updatedAt: new Date()
    });
    
    setEditingSchedule(updatedSchedule);
    setShowTimePointModal(false);
    setEditingTimePoint(null);
  };

  const getSpectrumColor = (spectrum: any) => {
    if (!spectrum) return 'bg-gray-400';
    
    const { blue, green, red, farRed } = spectrum;
    const total = blue + green + red + farRed;
    
    if (total === 0) return 'bg-gray-800';
    
    const blueRatio = blue / total;
    const redRatio = red / total;
    
    if (blueRatio > 0.3) return 'bg-blue-500';
    if (redRatio > 0.6) return 'bg-red-500';
    if (farRed > 15) return 'bg-pink-500';
    
    return 'bg-yellow-500'; // Mixed spectrum
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dynamic Lighting Scheduler</h1>
            <p className="text-sm text-gray-400 mt-1">
              Real-time spectrum control and automated daily lighting schedules
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-white font-mono">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <button
              onClick={() => setLiveMode(!liveMode)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                liveMode 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {liveMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {liveMode ? 'Live Mode' : 'Start Live'}
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-900 border-b border-gray-800 px-6">
        <nav className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'schedules', label: 'Schedules', icon: Calendar },
            { id: 'live', label: 'Live Control', icon: Sliders },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all
                  ${activeTab === tab.id 
                    ? 'text-white bg-gray-950 border-t border-l border-r border-gray-800' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Live Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {zones.filter(z => z.status === 'active').map(zone => {
                const activeSchedule = schedules.find(s => s.zoneId === zone.id && s.isActive);
                const currentPoint = activeSchedule ? getCurrentTimePoint(activeSchedule) : null;
                
                return (
                  <div key={zone.id} className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{zone.name}</h3>
                      <div className={`w-3 h-3 rounded-full ${
                        activeSchedule ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    {activeSchedule && currentPoint ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-gray-400">Current Phase:</span>
                          <span className="text-white font-medium">{currentPoint.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-gray-400">Mode:</span>
                          <span className="text-white capitalize">{currentPoint.mode}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-gray-400">Intensity:</span>
                          <span className="text-white font-medium">{currentPoint.intensity}%</span>
                        </div>
                        
                        {currentPoint.mode === 'recipe' && currentPoint.recipeId && (
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-gray-400">Recipe:</span>
                            <span className="text-white text-sm">
                              {recipes.find(r => r.id === currentPoint.recipeId)?.name || 'Unknown'}
                            </span>
                          </div>
                        )}
                        
                        {/* Spectrum preview */}
                        {(currentPoint.spectrum || (currentPoint.recipeId && recipes.find(r => r.id === currentPoint.recipeId))) && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-400 mb-2">Current Spectrum</p>
                            <div className="grid grid-cols-4 gap-1">
                              {Object.entries(
                                currentPoint.spectrum || 
                                recipes.find(r => r.id === currentPoint.recipeId)?.spectrum || 
                                {}
                              ).slice(0, 4).map(([channel, value]) => (
                                <div key={channel} className="text-center">
                                  <div className={`h-8 rounded-sm ${
                                    channel === 'blue' ? 'bg-blue-500' :
                                    channel === 'green' ? 'bg-green-500' :
                                    channel === 'red' ? 'bg-red-500' :
                                    'bg-pink-500'
                                  }`} style={{ opacity: value / 100 }} />
                                  <p className="text-xs text-gray-500 mt-1">{value}%</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Next transition */}
                        <div className="pt-3 border-t border-gray-700">
                          <p className="text-xs text-gray-400">Schedule: {activeSchedule.name}</p>
                          <p className="text-xs text-gray-500">
                            DLI: {activeSchedule.totalDLI} mol/m²/day • Peak: {activeSchedule.peakPPFD} PPFD
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Sun className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No active schedule</p>
                        <button className="text-emerald-400 text-sm hover:text-emerald-300 mt-1">
                          Assign Schedule
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Daily Timeline Preview */}
            {schedules.length > 0 && (
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Today's Lighting Timeline</h3>
                <div className="space-y-4">
                  {schedules.filter(s => s.isActive).map(schedule => (
                    <div key={schedule.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{schedule.zoneName}</span>
                        <span className="text-gray-400 text-sm">{schedule.name}</span>
                      </div>
                      
                      {/* Timeline */}
                      <div className="relative h-16 bg-gray-800 rounded-lg overflow-hidden">
                        {/* Time markers */}
                        <div className="absolute inset-0 flex">
                          {Array.from({ length: 24 }, (_, i) => (
                            <div key={i} className="flex-1 border-r border-gray-700 last:border-r-0">
                              <div className="text-xs text-gray-500 p-1">{i.toString().padStart(2, '0')}</div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Time points */}
                        {schedule.timePoints.filter(tp => tp.enabled).map(point => {
                          const hour = parseInt(point.time.split(':')[0]);
                          const minute = parseInt(point.time.split(':')[1]);
                          const position = ((hour + minute / 60) / 24) * 100;
                          
                          return (
                            <div
                              key={point.id}
                              className="absolute top-6 w-1 h-8 bg-emerald-400 rounded-full"
                              style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                              title={`${point.time} - ${point.name}`}
                            />
                          );
                        })}
                        
                        {/* Current time indicator */}
                        <div
                          className="absolute top-0 w-0.5 h-full bg-red-400"
                          style={{ 
                            left: `${((currentTime.getHours() + currentTime.getMinutes() / 60) / 24) * 100}%`,
                            transform: 'translateX(-50%)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other tabs would show "Coming Soon" */}
        {(activeTab === 'schedules' || activeTab === 'live' || activeTab === 'analytics') && (
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-8 border border-gray-800 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gray-800 rounded-xl mb-4">
              <Lightbulb className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Advanced {activeTab} features are being developed for complete dynamic lighting control.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}