'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Leaf, 
  MapPin, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Calendar,
  Package,
  Thermometer,
  Droplets,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { 
  getTodaysHarvestSchedule, 
  getHarvestAlerts, 
  HarvestGutter, 
  HarvestAlert 
} from '@/lib/harvest-tracking';

interface HarvestTrackerProps {
  facilityId: string;
  showAlerts?: boolean;
  autoRefresh?: boolean;
}

export function HarvestTracker({ 
  facilityId, 
  showAlerts = true, 
  autoRefresh = true 
}: HarvestTrackerProps) {
  const [schedule, setSchedule] = useState(getTodaysHarvestSchedule(facilityId));
  const [alerts, setAlerts] = useState<HarvestAlert[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (showAlerts) {
      setAlerts(getHarvestAlerts(facilityId));
    }
  }, [facilityId, showAlerts]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setSchedule(getTodaysHarvestSchedule(facilityId));
      if (showAlerts) {
        setAlerts(getHarvestAlerts(facilityId));
      }
      setLastUpdate(new Date());
    }, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [facilityId, showAlerts, autoRefresh]);

  const getQualityBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 80) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Today's Harvest Schedule</h2>
          <p className="text-gray-400">{schedule.facility} • {schedule.date.toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Total Estimated Yield</div>
            <div className="text-2xl font-bold text-green-400">{schedule.totalEstimatedYield}</div>
            <div className="text-xs text-gray-500">heads today</div>
          </div>
          <button 
            onClick={() => {
              setSchedule(getTodaysHarvestSchedule(facilityId));
              setLastUpdate(new Date());
            }}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Quality Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Premium Grade</span>
          </div>
          <div className="text-2xl font-bold text-white">{schedule.qualityFlags.premiumGrade}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Standard Grade</span>
          </div>
          <div className="text-2xl font-bold text-white">{schedule.qualityFlags.standardGrade}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Needs Attention</span>
          </div>
          <div className="text-2xl font-bold text-white">{schedule.qualityFlags.needsAttention}</div>
        </div>
      </div>

      {/* Alerts Section */}
      {showAlerts && alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Harvest Alerts
          </h3>
          {alerts.map(alert => (
            <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.priority)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.priority === 'high' ? 'bg-red-500 text-white' :
                      alert.priority === 'medium' ? 'bg-yellow-500 text-black' :
                      'bg-blue-500 text-white'
                    }`}>
                      {alert.priority.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400">Gutter {alert.gutterId}</span>
                  </div>
                  <p className="text-white font-medium mb-1">{alert.message}</p>
                  <p className="text-sm text-gray-400 mb-2">{alert.recommendedAction}</p>
                  <div className="text-xs text-gray-500">
                    Estimated value: ${alert.estimatedValue} • {alert.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ready for Harvest */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-400" />
          Ready for Harvest Today
        </h3>
        
        {schedule.readyGutters.map(gutter => (
          <GutterCard key={gutter.id} gutter={gutter} status="ready" />
        ))}
      </div>

      {/* Upcoming Harvests */}
      {schedule.upcomingGutters.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Upcoming Harvests (Next 3 Days)
          </h3>
          
          {schedule.upcomingGutters.map(gutter => (
            <GutterCard key={gutter.id} gutter={gutter} status="upcoming" />
          ))}
        </div>
      )}

      {/* Last Update */}
      <div className="text-center text-xs text-gray-500">
        Last updated: {lastUpdate.toLocaleTimeString()}
        {autoRefresh && ' • Auto-refresh every 5 minutes'}
      </div>
    </div>
  );
}

function GutterCard({ gutter, status }: { gutter: HarvestGutter; status: 'ready' | 'upcoming' }) {
  const getQualityBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 80) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-6 border ${
      status === 'ready' ? 'border-green-500/30 ring-1 ring-green-500/20' : 'border-gray-800'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-white">
              {gutter.product.variety} {gutter.product.type}
            </h4>
            <span className={`px-2 py-1 rounded border text-xs font-medium ${getQualityBadgeColor(gutter.currentStatus.qualityScore)}`}>
              Quality: {gutter.currentStatus.qualityScore}%
            </span>
            {status === 'ready' && (
              <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-medium">
                READY NOW
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {gutter.location.room} - {gutter.location.section}
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              {gutter.currentStatus.estimatedYield} {gutter.currentStatus.unit}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {status === 'ready' ? 'Ready now' : `${gutter.currentStatus.daysToHarvest} days`}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">RFID</div>
          <div className="font-mono text-xs text-gray-500">{gutter.automation.rfidTag}</div>
        </div>
      </div>

      {/* Environmental Data */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-red-400" />
          <div>
            <div className="text-xs text-gray-400">Temp</div>
            <div className="text-sm font-medium text-white">{gutter.automation.environmentalData.temperature}°F</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-xs text-gray-400">Humidity</div>
            <div className="text-sm font-medium text-white">{gutter.automation.environmentalData.humidity}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <div>
            <div className="text-xs text-gray-400">Nutrients</div>
            <div className="text-sm font-medium text-white">{gutter.automation.environmentalData.nutrientLevel} EC</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <div>
            <div className="text-xs text-gray-400">Light</div>
            <div className="text-sm font-medium text-white">{gutter.automation.environmentalData.lightHours}h</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {status === 'ready' && (
        <div className="flex gap-2 mt-4">
          <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
            Create Marketplace Listing
          </button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
            Schedule Harvest
          </button>
        </div>
      )}
    </div>
  );
}