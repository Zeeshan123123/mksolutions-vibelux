'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Database, 
  Server, 
  Zap, 
  Users, 
  Activity,
  RefreshCw,
  Eye,
  Settings,
  TrendingUp,
  Wifi,
  HardDrive
} from 'lucide-react';

interface SystemStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down' | 'checking';
  responseTime?: number;
  lastChecked: Date;
  details?: string;
  error?: string;
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  apiCalls: number;
  errorRate: number;
  averageResponseTime: number;
  uptime: string;
}

export function SystemHealthDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const services = [
    { key: 'database', name: 'Database', icon: Database, endpoint: '/api/admin/health/database' },
    { key: 'auth', name: 'Authentication', icon: Users, endpoint: '/api/admin/health/auth' },
    { key: 'api', name: 'API Routes', icon: Server, endpoint: '/api/admin/health/api' },
    { key: 'storage', name: 'File Storage', icon: HardDrive, endpoint: '/api/admin/health/storage' },
    { key: 'external', name: 'External APIs', icon: Wifi, endpoint: '/api/admin/health/external' },
    { key: 'ai', name: 'AI Services', icon: Zap, endpoint: '/api/admin/health/ai' },
    { key: 'cache', name: 'Cache/Redis', icon: Activity, endpoint: '/api/admin/health/cache' },
  ];

  const checkSystemHealth = useCallback(async () => {
    setIsRefreshing(true);
    
    const statusPromises = services.map(async (service) => {
      const startTime = Date.now();
      try {
        const response = await fetch(service.endpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const responseTime = Date.now() - startTime;
        const data = await response.json();
        
        return {
          service: service.key,
          status: response.ok ? 'healthy' as const : 'degraded' as const,
          responseTime,
          lastChecked: new Date(),
          details: data.details || `${service.name} is operational`,
          error: response.ok ? undefined : data.error
        };
      } catch (error) {
        return {
          service: service.key,
          status: 'down' as const,
          responseTime: Date.now() - startTime,
          lastChecked: new Date(),
          details: `${service.name} is not responding`,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    try {
      // Get system metrics
      const metricsResponse = await fetch('/api/admin/metrics');
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }

    const statuses = await Promise.all(statusPromises);
    setSystemStatus(statuses);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    checkSystemHealth();
  }, [checkSystemHealth]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, checkSystemHealth]);

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <Clock className="w-5 h-5 text-gray-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'down':
        return 'bg-red-50 border-red-200';
      case 'checking':
        return 'bg-gray-50 border-gray-200';
    }
  };

  const overallHealth = systemStatus.length > 0 ? 
    systemStatus.every(s => s.status === 'healthy') ? 'healthy' :
    systemStatus.some(s => s.status === 'down') ? 'down' : 'degraded'
    : 'checking';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health Dashboard</h1>
          <p className="text-gray-600">Monitor all system components and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </label>
          
          <button
            onClick={checkSystemHealth}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-6 rounded-lg border-2 ${getStatusColor(overallHealth)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(overallHealth)}
            <div>
              <h2 className="text-xl font-semibold">Overall System Status</h2>
              <p className="text-gray-600 capitalize">{overallHealth}</p>
            </div>
          </div>
          
          {metrics && (
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">{metrics.totalUsers}</div>
                <div className="text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{metrics.activeUsers}</div>
                <div className="text-gray-600">Active Now</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{metrics.apiCalls}</div>
                <div className="text-gray-600">API Calls/hr</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{metrics.errorRate.toFixed(1)}%</div>
                <div className="text-gray-600">Error Rate</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const status = systemStatus.find(s => s.service === service.key);
          const ServiceIcon = service.icon;
          
          return (
            <div
              key={service.key}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                getStatusColor(status?.status || 'checking')
              } ${selectedService === service.key ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedService(selectedService === service.key ? null : service.key)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <ServiceIcon className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold">{service.name}</h3>
                </div>
                {getStatusIcon(status?.status || 'checking')}
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                {status && (
                  <>
                    <div>Response: {status.responseTime}ms</div>
                    <div>Last checked: {status.lastChecked.toLocaleTimeString()}</div>
                    {selectedService === service.key && (
                      <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                        <div className="font-medium">Details:</div>
                        <div>{status.details}</div>
                        {status.error && (
                          <div className="text-red-600 mt-1">
                            <div className="font-medium">Error:</div>
                            <div>{status.error}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Metrics */}
      {metrics && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance Metrics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Average Response Time</div>
              <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(metrics.averageResponseTime / 10, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Error Rate</div>
              <div className="text-2xl font-bold">{metrics.errorRate.toFixed(2)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    metrics.errorRate > 5 ? 'bg-red-500' : 
                    metrics.errorRate > 2 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(metrics.errorRate * 10, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">System Uptime</div>
              <div className="text-2xl font-bold">{metrics.uptime}</div>
              <div className="text-sm text-green-600">🟢 Operational</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-3 border rounded-lg hover:bg-gray-50 text-left">
            <Eye className="w-5 h-5 mb-2 text-blue-600" />
            <div className="font-medium">View Logs</div>
            <div className="text-sm text-gray-600">System & error logs</div>
          </button>
          
          <button className="p-3 border rounded-lg hover:bg-gray-50 text-left">
            <Database className="w-5 h-5 mb-2 text-green-600" />
            <div className="font-medium">DB Status</div>
            <div className="text-sm text-gray-600">Database health</div>
          </button>
          
          <button className="p-3 border rounded-lg hover:bg-gray-50 text-left">
            <Users className="w-5 h-5 mb-2 text-purple-600" />
            <div className="font-medium">User Activity</div>
            <div className="text-sm text-gray-600">Active sessions</div>
          </button>
          
          <button className="p-3 border rounded-lg hover:bg-gray-50 text-left">
            <Activity className="w-5 h-5 mb-2 text-orange-600" />
            <div className="font-medium">Performance</div>
            <div className="text-sm text-gray-600">Detailed metrics</div>
          </button>
        </div>
      </div>
    </div>
  );
}