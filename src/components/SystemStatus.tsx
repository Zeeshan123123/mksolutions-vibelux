'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Activity,
  Database,
  Cloud,
  Wifi,
  Shield,
  Cpu,
  HardDrive,
  RefreshCw,
  Clock,
  TrendingUp
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  uptime: number;
  responseTime: number;
  lastChecked: Date;
  description?: string;
  icon: React.ReactNode;
}

interface IncidentReport {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  affectedServices: string[];
  startTime: Date;
  endTime?: Date;
  updates: {
    time: Date;
    message: string;
  }[];
}

export function SystemStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Web Application',
      status: 'operational',
      uptime: 99.99,
      responseTime: 85,
      lastChecked: new Date(),
      icon: <Cloud className="w-5 h-5" />
    },
    {
      name: 'API Services',
      status: 'operational',
      uptime: 99.95,
      responseTime: 120,
      lastChecked: new Date(),
      icon: <Wifi className="w-5 h-5" />
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: 99.99,
      responseTime: 15,
      lastChecked: new Date(),
      icon: <Database className="w-5 h-5" />
    },
    {
      name: 'Authentication',
      status: 'operational',
      uptime: 100,
      responseTime: 95,
      lastChecked: new Date(),
      icon: <Shield className="w-5 h-5" />
    },
    {
      name: 'AI Services',
      status: 'operational',
      uptime: 99.8,
      responseTime: 250,
      lastChecked: new Date(),
      icon: <Cpu className="w-5 h-5" />
    },
    {
      name: 'File Storage',
      status: 'operational',
      uptime: 99.99,
      responseTime: 180,
      lastChecked: new Date(),
      icon: <HardDrive className="w-5 h-5" />
    }
  ]);

  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  // Simulate status checks
  const refreshStatus = async () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update last checked time for all services
    setServices(prev => prev.map(service => ({
      ...service,
      lastChecked: new Date(),
      // Simulate minor variations in response time
      responseTime: service.responseTime + (Math.random() * 20 - 10)
    })));
    
    setLastUpdateTime(new Date());
    setIsRefreshing(false);
  };

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(refreshStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'down':
        return 'text-red-400';
      case 'maintenance':
        return 'text-blue-400';
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5" />;
      case 'down':
        return <XCircle className="w-5 h-5" />;
      case 'maintenance':
        return <Activity className="w-5 h-5" />;
    }
  };

  const getOverallStatus = () => {
    if (services.every(s => s.status === 'operational')) {
      return { status: 'All Systems Operational', color: 'text-green-400' };
    } else if (services.some(s => s.status === 'down')) {
      return { status: 'Major Outage', color: 'text-red-400' };
    } else if (services.some(s => s.status === 'degraded')) {
      return { status: 'Partial Outage', color: 'text-yellow-400' };
    } else {
      return { status: 'Maintenance', color: 'text-blue-400' };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Status</h1>
          <p className="text-gray-400">
            Real-time status of VibeLux services and infrastructure
          </p>
        </div>
        <button
          onClick={refreshStatus}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overall Status Banner */}
      <div className={`bg-gray-800/50 p-6 rounded-xl border ${
        overallStatus.status === 'All Systems Operational' 
          ? 'border-green-500/50' 
          : overallStatus.status === 'Major Outage'
          ? 'border-red-500/50'
          : overallStatus.status === 'Partial Outage'
          ? 'border-yellow-500/50'
          : 'border-blue-500/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={overallStatus.color}>
              {getStatusIcon(
                overallStatus.status === 'All Systems Operational' ? 'operational' :
                overallStatus.status === 'Major Outage' ? 'down' :
                overallStatus.status === 'Partial Outage' ? 'degraded' :
                'maintenance'
              )}
            </div>
            <h2 className={`text-2xl font-bold ${overallStatus.color}`}>
              {overallStatus.status}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Last updated</p>
            <p className="text-white font-medium">
              {lastUpdateTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.name}
            className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-gray-400">{service.icon}</div>
                <h3 className="font-semibold text-white">{service.name}</h3>
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(service.status)}`}>
                {getStatusIcon(service.status)}
                <span className="text-sm capitalize">{service.status}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Uptime</span>
                <span className="text-white font-medium">{service.uptime}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Response Time</span>
                <span className="text-white font-medium">
                  {Math.round(service.responseTime)}ms
                </span>
              </div>
              {service.description && (
                <p className="text-sm text-gray-400 mt-2">{service.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Average Response Time</p>
            <p className="text-2xl font-bold text-white">
              {Math.round(services.reduce((acc, s) => acc + s.responseTime, 0) / services.length)}ms
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Average Uptime</p>
            <p className="text-2xl font-bold text-white">
              {(services.reduce((acc, s) => acc + s.uptime, 0) / services.length).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Active Services</p>
            <p className="text-2xl font-bold text-white">
              {services.filter(s => s.status === 'operational').length}/{services.length}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Health Score</p>
            <p className="text-2xl font-bold text-green-400">Excellent</p>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Incidents
        </h3>
        {incidents.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No incidents reported in the last 90 days
          </p>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="border-l-2 border-gray-700 pl-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{incident.title}</h4>
                    <p className="text-sm text-gray-400">
                      {incident.startTime.toLocaleDateString()} - 
                      {incident.endTime ? incident.endTime.toLocaleDateString() : 'Ongoing'}
                    </p>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    incident.status === 'resolved' 
                      ? 'bg-green-900/20 text-green-400'
                      : 'bg-yellow-900/20 text-yellow-400'
                  }`}>
                    {incident.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance Schedule */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Scheduled Maintenance</h3>
        <p className="text-gray-400">
          No scheduled maintenance at this time. We perform regular maintenance 
          during off-peak hours to minimize disruption.
        </p>
      </div>
    </div>
  );
}