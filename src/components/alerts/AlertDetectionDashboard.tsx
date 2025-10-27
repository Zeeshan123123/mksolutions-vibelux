'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Filter,
  Download,
  Clock,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Activity
} from 'lucide-react';
import { useAlertWebSocket } from '@/hooks/useAlertWebSocket';
import toast from 'react-hot-toast';

interface Alert {
  id: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  alertType: string;
  triggeredValue: number;
  thresholdValue: number;
  unit: string | null;
  sensorName: string | null;
  location: string | null;
  createdAt: string;
  sensor?: {
    name: string;
    sensorType: string;
  };
  alertConfig?: {
    name: string;
    condition: string;
  };
}

interface AlertDetectionDashboardProps {
  facilityId: string;
}

export function AlertDetectionDashboard({ facilityId }: AlertDetectionDashboardProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ALL'>('ACTIVE');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  
  // WebSocket for real-time updates
  const { newAlert } = useAlertWebSocket(facilityId);

  // Fetch alerts from API
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        facilityId,
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(severityFilter !== 'ALL' && { severity: severityFilter }),
        limit: '50'
      });

      const response = await fetch(`/api/alerts/logs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [facilityId, statusFilter, severityFilter]);

  // Handle new alerts from WebSocket
  useEffect(() => {
    if (newAlert) {
      setAlerts(prev => [newAlert, ...prev]);
      
      // Show notification based on severity
      if (newAlert.severity === 'CRITICAL') {
        toast.error(`🚨 CRITICAL: ${newAlert.message}`, {
          duration: 10000,
          position: 'top-right'
        });
        
        // Play alert sound for critical alerts
        try {
          const audio = new Audio('/sounds/alert.mp3');
          audio.play().catch(() => {}); // Ignore if sound fails
        } catch (err) {}
      } else if (newAlert.severity === 'HIGH') {
        toast.error(`⚠️ HIGH: ${newAlert.message}`, {
          duration: 6000
        });
      } else {
        toast(`📊 ${newAlert.severity}: ${newAlert.message}`, {
          duration: 4000
        });
      }

      // Browser notification
      if (typeof window !== 'undefined' && Notification.permission === 'granted') {
        new Notification(`${newAlert.severity} Alert`, {
          body: newAlert.message,
          icon: '/icon.png',
          badge: '/badge.png'
        });
      }
    }
  }, [newAlert]);

  // Handle alert acknowledgment
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts/logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId,
          action: 'acknowledge'
        })
      });

      if (response.ok) {
        toast.success('Alert acknowledged');
        fetchAlerts(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  // Handle alert resolution
  const resolveAlert = async (alertId: string, notes?: string) => {
    try {
      const response = await fetch('/api/alerts/logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId,
          action: 'resolve',
          notes
        })
      });

      if (response.ok) {
        toast.success('Alert resolved');
        fetchAlerts(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-900/50 border-red-500 text-red-100';
      case 'HIGH': return 'bg-orange-900/50 border-orange-500 text-orange-100';
      case 'MEDIUM': return 'bg-yellow-900/50 border-yellow-500 text-yellow-100';
      case 'LOW': return 'bg-blue-900/50 border-blue-500 text-blue-100';
      default: return 'bg-gray-900/50 border-gray-500 text-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '📊';
      case 'LOW': return 'ℹ️';
      default: return '📋';
    }
  };

  const getSensorIcon = (sensorType: string) => {
    switch (sensorType?.toUpperCase()) {
      case 'TEMPERATURE': return <Thermometer className="w-5 h-5" />;
      case 'HUMIDITY': return <Droplets className="w-5 h-5" />;
      case 'CO2': return <Wind className="w-5 h-5" />;
      case 'LIGHT': return <Sun className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const filteredAlerts = alerts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell className="w-7 h-7" />
            Alert Management
            {alerts.length > 0 && (
              <span className="text-lg font-normal text-gray-400">
                ({alerts.length} {statusFilter.toLowerCase()})
              </span>
            )}
          </h2>
          <p className="text-gray-400 mt-1">
            Real-time sensor monitoring and threshold alerts
          </p>
        </div>

        <button
          onClick={() => fetchAlerts()}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 font-medium">Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Active count badges */}
          <div className="flex gap-2 ml-auto">
            <div className="px-3 py-1 bg-red-900/30 border border-red-800 rounded-full text-red-300 text-sm">
              Critical: {alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length}
            </div>
            <div className="px-3 py-1 bg-orange-900/30 border border-orange-800 rounded-full text-orange-300 text-sm">
              High: {alerts.filter(a => a.severity === 'HIGH' && a.status === 'ACTIVE').length}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading alerts...</div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-white mb-2">All Clear!</h3>
          <p className="text-gray-400 text-lg">
            {statusFilter === 'ACTIVE' 
              ? 'No active alerts at this time. Your systems are running normally.'
              : `No ${statusFilter.toLowerCase()} alerts found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl border-2 p-5 ${getSeverityColor(alert.severity)} transition-all hover:shadow-lg`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Alert Content */}
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{alert.severity}</span>
                      <span className="text-sm opacity-75">•</span>
                      <span className="text-sm opacity-75 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {alert.status !== 'ACTIVE' && (
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                        {alert.status}
                      </span>
                    )}
                  </div>

                  {/* Sensor Info */}
                  <div className="flex items-center gap-2 mb-2">
                    {getSensorIcon(alert.sensor?.sensorType || '')}
                    <h4 className="font-semibold text-lg">
                      {alert.sensorName || alert.sensor?.name || 'Unknown Sensor'}
                    </h4>
                    {alert.location && (
                      <>
                        <span className="text-sm opacity-75">•</span>
                        <span className="text-sm opacity-75">{alert.location}</span>
                      </>
                    )}
                  </div>

                  {/* Message */}
                  <p className="text-base mb-3">{alert.message}</p>

                  {/* Values */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg">
                      <span className="opacity-75">Current:</span>
                      <strong className="text-base">
                        {alert.triggeredValue}{alert.unit}
                      </strong>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg">
                      <span className="opacity-75">Threshold:</span>
                      <strong className="text-base">
                        {alert.thresholdValue}{alert.unit}
                      </strong>
                    </div>
                    {alert.alertConfig?.condition && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg">
                        <span className="opacity-75">Condition:</span>
                        <strong>{alert.alertConfig.condition}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {alert.status === 'ACTIVE' && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Acknowledge Alert"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Resolve Alert"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-4">
          <div className="text-red-300 text-sm mb-1">Critical Alerts</div>
          <div className="text-3xl font-bold text-red-100">
            {alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-orange-900/30 border border-orange-800 rounded-xl p-4">
          <div className="text-orange-300 text-sm mb-1">High Priority</div>
          <div className="text-3xl font-bold text-orange-100">
            {alerts.filter(a => a.severity === 'HIGH' && a.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-800 rounded-xl p-4">
          <div className="text-yellow-300 text-sm mb-1">Medium Priority</div>
          <div className="text-3xl font-bold text-yellow-100">
            {alerts.filter(a => a.severity === 'MEDIUM' && a.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-green-900/30 border border-green-800 rounded-xl p-4">
          <div className="text-green-300 text-sm mb-1">Resolved Today</div>
          <div className="text-3xl font-bold text-green-100">
            {alerts.filter(a => {
              const today = new Date().toDateString();
              return a.status === 'RESOLVED' && new Date(a.createdAt).toDateString() === today;
            }).length}
          </div>
        </div>
      </div>
    </div>
  );
}

