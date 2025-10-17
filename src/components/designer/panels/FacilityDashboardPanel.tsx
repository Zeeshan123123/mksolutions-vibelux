'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  Building, 
  Droplets, 
  Wind, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  Lightbulb,
  Thermometer,
  Gauge,
  MapPin,
  Calendar,
  Target,
  Layers
} from 'lucide-react';
import { useFacilityDesign } from '../context/FacilityDesignContext';
import { useDesigner } from '../context/DesignerContext';
import { logger } from '@/lib/client-logger';

interface FacilityDashboardPanelProps {
  onClose: () => void;
}

interface SystemHealthStatus {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  uptime: number;
  lastUpdated: Date;
  alerts: number;
  performance: number; // 0-100%
}

interface KPICard {
  title: string;
  value: string;
  unit?: string;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
  target?: string;
}

export function FacilityDashboardPanel({ onClose }: FacilityDashboardPanelProps) {
  const { state: facilityState, exportFacilityReport, validateDesign, optimizeFacility } = useFacilityDesign();
  const { state } = useDesigner();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | 'ytd'>('7d');
  const [showSystemDetails, setShowSystemDetails] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus[]>([]);
  const [kpiCards, setKPICards] = useState<KPICard[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Real-time facility monitoring
  useEffect(() => {
    updateDashboard();
    
    const interval = setInterval(() => {
      updateDashboard();
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [facilityState, selectedTimeframe, refreshInterval]);

  const updateDashboard = () => {
    generateSystemHealth();
    generateKPICards();
    setLastRefresh(new Date());
  };

  const generateSystemHealth = () => {
    const health: SystemHealthStatus[] = [];
    const systems = Object.values(facilityState.systems);
    
    systems.forEach(system => {
      const uptime = Math.random() * 100; // Mock uptime
      const performance = system.status === 'validated' ? 95 + Math.random() * 5 : 
                         system.status === 'configured' ? 85 + Math.random() * 10 :
                         system.status === 'error' ? 30 + Math.random() * 30 : 60;
      
      health.push({
        id: system.id,
        name: system.type.charAt(0).toUpperCase() + system.type.slice(1).replace('-', ' '),
        status: system.status === 'error' ? 'critical' :
                system.status === 'validated' ? 'healthy' :
                system.status === 'configured' ? 'warning' : 'offline',
        uptime,
        lastUpdated: system.lastUpdated,
        alerts: facilityState.conflicts.filter(c => c.systems.includes(system.id)).length,
        performance
      });
    });
    
    setSystemHealth(health);
  };

  const generateKPICards = () => {
    const { metrics } = facilityState;
    
    const cards: KPICard[] = [
      {
        title: 'Total Investment',
        value: (metrics.totalCost.equipment + metrics.totalCost.installation).toLocaleString(),
        unit: '$',
        change: 0,
        trend: 'stable',
        icon: DollarSign,
        color: '#10b981',
        target: '< $500K'
      },
      {
        title: 'Energy Efficiency',
        value: metrics.energyEfficiency.toFixed(1),
        unit: 'kWh/sq ft/yr',
        change: -12,
        trend: 'down',
        icon: Zap,
        color: '#f59e0b',
        target: '< 15'
      },
      {
        title: 'Electrical Load',
        value: (metrics.totalElectricalLoad / 1000).toFixed(1),
        unit: 'kW',
        change: 5,
        trend: 'up',
        icon: Lightbulb,
        color: '#3b82f6'
      },
      {
        title: 'Water Flow',
        value: metrics.totalWaterFlow.toFixed(1),
        unit: 'GPM',
        change: 2,
        trend: 'up',
        icon: Droplets,
        color: '#06b6d4'
      },
      {
        title: 'Structural Load',
        value: (metrics.totalStructuralLoad / 1000).toFixed(1),
        unit: 'K lbs',
        change: 0,
        trend: 'stable',
        icon: Building,
        color: '#8b5cf6'
      },
      {
        title: 'HVAC Capacity',
        value: (metrics.totalThermalLoad / 1000).toFixed(1),
        unit: 'K BTU/hr',
        change: 8,
        trend: 'up',
        icon: Wind,
        color: '#ef4444'
      },
      {
        title: 'ROI Payback',
        value: metrics.roi.paybackPeriod.toFixed(1),
        unit: 'years',
        change: -15,
        trend: 'down',
        icon: TrendingUp,
        color: '#22c55e',
        target: '< 5 years'
      },
      {
        title: 'Sustainability Score',
        value: metrics.sustainabilityScore.toFixed(0),
        unit: '/100',
        change: 10,
        trend: 'up',
        icon: Target,
        color: '#16a34a',
        target: '> 80'
      }
    ];
    
    setKPICards(cards);
  };

  const handleValidateDesign = () => {
    validateDesign();
  };

  const handleOptimizeFacility = () => {
    const suggestions = optimizeFacility();
    logger.info('system', 'Optimization suggestions:', { data: suggestions });
  };

  const handleExportReport = () => {
    const report = exportFacilityReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facility-dashboard-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      case 'offline': return Clock;
      default: return Clock;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Gauge;
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'stable') return 'text-gray-400';
    return change > 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Facility Dashboard</h2>
              <p className="text-gray-400">Real-time facility monitoring and analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="ytd">Year to Date</option>
            </select>
            <button
              onClick={updateDashboard}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportReport}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Quick Actions */}
          <div className="w-64 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Facility Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Facility Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Room Type:</span>
                    <span className="text-white capitalize">{state.room.roomType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dimensions:</span>
                    <span className="text-white">{state.room.width}' × {state.room.height}'</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Systems:</span>
                    <span className="text-white">{Object.keys(facilityState.systems).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-medium ${facilityState.isValidated ? 'text-green-400' : 'text-yellow-400'}`}>
                      {facilityState.isValidated ? 'Validated' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">System Status</h3>
                <div className="space-y-2">
                  {systemHealth.map((system) => {
                    const StatusIcon = getStatusIcon(system.status);
                    return (
                      <div key={system.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(system.status)}`} />
                          <span className="text-gray-300 text-sm">{system.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white">{system.performance.toFixed(0)}%</div>
                          {system.alerts > 0 && (
                            <div className="text-xs text-red-400">{system.alerts} alerts</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleValidateDesign}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Validate Design
                </button>
                <button
                  onClick={handleOptimizeFacility}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  Optimize Facility
                </button>
                <button
                  onClick={() => setShowSystemDetails(!showSystemDetails)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {showSystemDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showSystemDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - KPIs and Analytics */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((kpi, index) => {
                  const IconComponent = kpi.icon;
                  const TrendIcon = getTrendIcon(kpi.trend);
                  
                  return (
                    <div key={index} className="bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: kpi.color + '20' }}>
                          <IconComponent className="w-5 h-5" style={{ color: kpi.color }} />
                        </div>
                        {kpi.change !== 0 && (
                          <div className={`flex items-center gap-1 ${getTrendColor(kpi.trend, kpi.change)}`}>
                            <TrendIcon className="w-3 h-3" />
                            <span className="text-xs font-medium">{Math.abs(kpi.change)}%</span>
                          </div>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {kpi.unit && kpi.unit === '$' ? kpi.unit : ''}{kpi.value}{kpi.unit && kpi.unit !== '$' ? ` ${kpi.unit}` : ''}
                      </div>
                      <div className="text-sm text-gray-400">{kpi.title}</div>
                      {kpi.target && (
                        <div className="text-xs text-gray-500 mt-1">Target: {kpi.target}</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* System Dependencies */}
              {facilityState.dependencies.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">System Dependencies</h3>
                  <div className="space-y-2">
                    {facilityState.dependencies.map((dep, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <div className="text-sm text-gray-300">
                          {dep.fromSystem} → {dep.toSystem}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">{dep.value.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 capitalize">{dep.dependencyType}</span>
                          {dep.critical && (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conflicts and Warnings */}
              {facilityState.conflicts.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">System Conflicts</h3>
                  <div className="space-y-3">
                    {facilityState.conflicts.map((conflict, index) => (
                      <div key={index} className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-red-400 font-medium capitalize">{conflict.severity} - {conflict.conflictType}</div>
                            <div className="text-sm text-gray-300 mt-1">{conflict.description}</div>
                            {conflict.resolution && (
                              <div className="text-sm text-blue-400 mt-2">
                                Resolution: {conflict.resolution}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              Affected systems: {conflict.systems.join(', ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-2">
                  {Object.values(facilityState.systems).slice(0, 5).map((system, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <div className="text-sm text-gray-300">
                        {system.type.charAt(0).toUpperCase() + system.type.slice(1)} system updated
                      </div>
                      <div className="text-xs text-gray-400">
                        {system.lastUpdated.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}