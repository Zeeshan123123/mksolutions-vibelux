'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAlertWebSocket } from '@/hooks/useAlertWebSocket';
import Link from 'next/link';

interface AlertWidgetProps {
  facilityId: string;
  maxDisplay?: number;
}

export function AlertWidget({ facilityId, maxDisplay = 3 }: AlertWidgetProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { newAlert } = useAlertWebSocket(facilityId);

  // Fetch recent alerts
  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch(
          `/api/alerts/logs?facilityId=${facilityId}&status=ACTIVE&limit=${maxDisplay}`
        );
        const data = await response.json();
        
        if (data.success) {
          setAlerts(data.alerts || []);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [facilityId, maxDisplay]);

  // Add new alert to list
  useEffect(() => {
    if (newAlert) {
      setAlerts(prev => [newAlert, ...prev].slice(0, maxDisplay));
    }
  }, [newAlert, maxDisplay]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-900/30';
      case 'HIGH': return 'text-orange-400 bg-orange-900/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-900/30';
      case 'LOW': return 'text-blue-400 bg-blue-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
          {alerts.length > 0 && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        <Link 
          href="/alerts" 
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-green-400 mb-2">✓</div>
          <p className="text-gray-400 text-sm">No active alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-white truncate mb-1">
                    {alert.sensorName || alert.sensor?.name || 'Sensor Alert'}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>Value: <strong className="text-gray-300">{alert.triggeredValue}{alert.unit}</strong></span>
                    <span>•</span>
                    <span>Threshold: <strong className="text-gray-300">{alert.thresholdValue}{alert.unit}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {alerts.length >= maxDisplay && (
        <div className="mt-4 text-center">
          <Link
            href="/alerts"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View {alerts.length > maxDisplay ? 'more' : 'all'} alerts →
          </Link>
        </div>
      )}
    </div>
  );
}

