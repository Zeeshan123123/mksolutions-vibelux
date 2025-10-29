import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { logger } from '@/lib/client-logger';

export interface Alert {
  id: string;
  alertConfigId: string;
  sensorId: string;
  facilityId: string;
  alertType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  triggeredValue: number;
  thresholdValue: number;
  unit?: string | null;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'IGNORED';
  acknowledgedAt?: Date | null;
  acknowledgedBy?: string | null;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  resolutionNotes?: string | null;
  sensorName?: string | null;
  location?: string | null;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  sensor?: {
    id: string;
    name: string;
    sensorType: string;
  };
  facility?: {
    id: string;
    name: string;
  };
  alertConfig?: {
    id: string;
    name: string;
  };
}

export interface AlertStats {
  total: number;
  unacknowledged: number;
  bySeverity: Record<string, number>;
  todayCount: number;
  avgResponseTime: number | null;
  topSensors: Array<{
    sensorId: string;
    sensorName: string | null;
    count: number;
  }>;
}

export interface AlertFilters {
  facilityId?: string;
  status?: string;
  severity?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UseAlertsResult {
  alerts: Alert[];
  stats: AlertStats | null;
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  acknowledge: (alertId: string) => Promise<void>;
  resolve: (alertId: string, resolutionNotes: string) => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: AlertFilters) => void;
  exportToCsv: () => Promise<void>;
}

export function useAlerts(initialFilters: AlertFilters = {}): UseAlertsResult {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AlertFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const socketRef = useRef<Socket | null>(null);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.facilityId) params.append('facilityId', filters.facilityId);
      if (filters.status) params.append('status', filters.status);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page?.toString() || '1');
      params.append('limit', filters.limit?.toString() || '50');

      const response = await fetch(`/api/alerts?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const data = await response.json();
      setAlerts(data.alerts);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      logger.error('system', 'Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.facilityId) params.append('facilityId', filters.facilityId);

      const response = await fetch(`/api/alerts/stats?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      logger.error('system', 'Error fetching alert stats:', err);
    }
  }, [filters.facilityId]);

  // Initialize WebSocket
  useEffect(() => {
    if (!filters.facilityId) return;

    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || '', {
      path: '/api/socketio',
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      logger.info('system', 'WebSocket connected for alerts');
      socket.emit('subscribe', [`facility:${filters.facilityId}`]);
    });

    socket.on('alert:new', (newAlert: Alert) => {
      logger.info('system', 'New alert received via WebSocket', newAlert);
      setAlerts(prev => [newAlert, ...prev]);
      fetchStats(); // Update stats
    });

    socket.on('alert:acknowledged', ({ alertId, acknowledgedBy, acknowledgedAt, responseTime }: any) => {
      logger.info('system', 'Alert acknowledged via WebSocket', alertId);
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { ...alert, status: 'ACKNOWLEDGED' as const, acknowledgedAt: new Date(acknowledgedAt), acknowledgedBy }
          : alert
      ));
      fetchStats(); // Update stats
    });

    socket.on('alert:resolved', ({ alertId, resolvedAt, resolvedBy, resolutionNotes }: any) => {
      logger.info('system', 'Alert resolved via WebSocket', alertId);
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { 
              ...alert, 
              status: 'RESOLVED' as const, 
              resolvedAt: new Date(resolvedAt), 
              resolvedBy,
              resolutionNotes 
            }
          : alert
      ));
      fetchStats(); // Update stats
    });

    socket.on('alert:escalated', ({ alertId, level }: any) => {
      logger.info('system', 'Alert escalated via WebSocket', { alertId, level });
      // Optionally update UI to show escalation status
    });

    socket.on('disconnect', () => {
      logger.info('system', 'WebSocket disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [filters.facilityId, fetchStats]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, [fetchAlerts, fetchStats]);

  // Acknowledge alert
  const acknowledge = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to acknowledge alert');
      }

      const data = await response.json();
      logger.info('system', 'Alert acknowledged successfully', data);

      // Update local state optimistically
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { ...alert, status: 'ACKNOWLEDGED' as const, acknowledgedAt: data.alert.acknowledgedAt }
          : alert
      ));
      fetchStats(); // Update stats
    } catch (err) {
      logger.error('system', 'Error acknowledging alert:', err);
      throw err;
    }
  }, [fetchStats]);

  // Resolve alert
  const resolve = useCallback(async (alertId: string, resolutionNotes: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolutionNotes })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resolve alert');
      }

      const data = await response.json();
      logger.info('system', 'Alert resolved successfully', data);

      // Update local state optimistically
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { 
              ...alert, 
              status: 'RESOLVED' as const, 
              resolvedAt: data.alert.resolvedAt,
              resolutionNotes 
            }
          : alert
      ));
      fetchStats(); // Update stats
    } catch (err) {
      logger.error('system', 'Error resolving alert:', err);
      throw err;
    }
  }, [fetchStats]);

  // Export to CSV
  const exportToCsv = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.facilityId) params.append('facilityId', filters.facilityId);
      params.append('format', 'csv');

      const response = await fetch(`/api/alerts/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to export alerts');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alerts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      logger.info('system', 'Alerts exported successfully');
    } catch (err) {
      logger.error('system', 'Error exporting alerts:', err);
      throw err;
    }
  }, [filters.facilityId]);

  // Refresh data
  const refresh = useCallback(async () => {
    await fetchAlerts();
    await fetchStats();
  }, [fetchAlerts, fetchStats]);

  return {
    alerts,
    stats,
    loading,
    error,
    page,
    totalPages,
    acknowledge,
    resolve,
    refresh,
    setFilters: (newFilters) => setFilters(prev => ({ ...prev, ...newFilters })),
    exportToCsv
  };
}

