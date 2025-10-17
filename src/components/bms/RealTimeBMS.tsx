'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Droplets,
  Wind,
  Sun,
  Gauge,
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Thermometer,
  Clock,
  Calendar,
  Map,
  Layers,
  Grid3x3,
  Zap,
  Shield,
  Database,
  Cloud,
  Wifi,
  Monitor,
  Server,
  HardDrive,
  RefreshCw,
  Power,
  X,
  Search,
  Plus,
  Network,
  Radio,
  Cable,
  Loader2
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { logger } from '@/lib/client-logger';
import { useWebSocket } from '@/hooks/useWebSocket';

interface DeviceData {
  deviceId: string;
  timestamp: Date;
  measurements: Record<string, number | boolean | string>;
  quality: 'good' | 'bad' | 'uncertain';
}

interface DiscoveredDevice {
  id: string;
  name: string;
  protocol: string;
  address: string;
  port?: number;
  deviceType?: string;
  manufacturer?: string;
  model?: string;
  status: 'online' | 'offline' | 'unknown';
}

interface CollectionStats {
  deviceId: string;
  pointsCollected: number;
  lastCollection: Date;
  failureCount: number;
  averageCollectionTime: number;
  status: 'running' | 'stopped' | 'error';
  error?: string;
}

export function RealTimeBMS() {
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'discovery' | 'control' | 'analytics'>('overview');
  const [discovering, setDiscovering] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<Map<string, DeviceData>>(new Map());
  const [collectionStats, setCollectionStats] = useState<Map<string, CollectionStats>>(new Map());
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [emergencyStopActive, setEmergencyStopActive] = useState(false);
  
  // WebSocket connection for real-time data
  const { data: wsData, isConnected } = useWebSocket('/api/websocket/bms');
  
  // Handle WebSocket messages
  useEffect(() => {
    if (wsData) {
      switch (wsData.type) {
        case 'deviceData':
          setConnectedDevices(prev => {
            const updated = new Map(prev);
            updated.set(wsData.deviceId, wsData.data);
            return updated;
          });
          break;
          
        case 'collectionStats':
          setCollectionStats(prev => {
            const updated = new Map(prev);
            updated.set(wsData.deviceId, wsData.stats);
            return updated;
          });
          break;
          
        case 'deviceDiscovered':
          setDiscoveredDevices(prev => [...prev, wsData.device]);
          break;
          
        case 'emergencyStop':
          setEmergencyStopActive(wsData.active);
          break;
      }
    }
  }, [wsData]);
  
  // Discover devices
  const discoverDevices = async () => {
    setDiscovering(true);
    setDiscoveredDevices([]);
    
    try {
      const response = await fetch('/api/bms/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocols: ['modbus', 'bacnet', 'mqtt', 'opcua']
        })
      });
      
      if (response.ok) {
        const devices = await response.json();
        setDiscoveredDevices(devices);
      }
    } catch (error) {
      logger.error('system', 'Discovery error:', error );
    } finally {
      setDiscovering(false);
    }
  };
  
  // Connect to device
  const connectDevice = async (device: DiscoveredDevice) => {
    try {
      const response = await fetch('/api/bms/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: device.id })
      });
      
      if (response.ok) {
        // Device connected, will receive data via WebSocket
      }
    } catch (error) {
      logger.error('system', 'Connection error:', error );
    }
  };
  
  // Execute control command
  const executeCommand = async (deviceId: string, command: string, parameters?: any) => {
    try {
      const response = await fetch('/api/bms/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          command,
          parameters
        })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      logger.error('system', 'Control error:', error );
      return { success: false, error: error.message };
    }
  };
  
  // Emergency stop
  const triggerEmergencyStop = async () => {
    if (confirm('Are you sure you want to trigger an emergency stop? This will stop all devices.')) {
      await fetch('/api/bms/emergency-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stopAll: true,
          reason: 'Manual emergency stop',
          operator: 'System Operator'
        })
      });
    }
  };
  
  // Reset emergency stop
  const resetEmergencyStop = async () => {
    await fetch('/api/bms/emergency-stop/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operator: 'System Operator'
      })
    });
  };
  
  const getProtocolIcon = (protocol: string) => {
    switch (protocol) {
      case 'modbus-tcp':
      case 'modbus-rtu':
        return Server;
      case 'bacnet':
        return Network;
      case 'mqtt':
        return Radio;
      case 'opcua':
        return Cable;
      default:
        return HardDrive;
    }
  };
  
  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'modbus-tcp':
      case 'modbus-rtu':
        return 'text-blue-400';
      case 'bacnet':
        return 'text-green-400';
      case 'mqtt':
        return 'text-purple-400';
      case 'opcua':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Real-Time BMS</h1>
              <p className="text-gray-400">Live Device Monitoring & Control</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* WebSocket Status */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Emergency Stop Button */}
            {emergencyStopActive ? (
              <button
                onClick={resetEmergencyStop}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset E-Stop
              </button>
            ) : (
              <button
                onClick={triggerEmergencyStop}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Power className="w-4 h-4" />
                Emergency Stop
              </button>
            )}
            
            <button
              onClick={() => setShowAddDevice(true)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mt-6">
          {[
            { id: 'overview', label: 'Overview', icon: Grid3x3 },
            { id: 'devices', label: 'Connected Devices', icon: Monitor },
            { id: 'discovery', label: 'Device Discovery', icon: Search },
            { id: 'control', label: 'Control Center', icon: Settings },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Status Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Devices</span>
                  <Monitor className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">{connectedDevices.size}</p>
                <p className="text-xs text-gray-400 mt-1">Connected & active</p>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Data Points</span>
                  <Activity className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {Array.from(collectionStats.values()).reduce((sum, stats) => sum + stats.pointsCollected, 0)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Collected today</p>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Active Alarms</span>
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {Array.from(collectionStats.values()).filter(s => s.status === 'error').length}
                </p>
                <p className="text-xs text-gray-400 mt-1">Requiring attention</p>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Avg Response</span>
                  <Gauge className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {Math.round(
                    Array.from(collectionStats.values()).reduce((sum, stats) => 
                      sum + stats.averageCollectionTime, 0
                    ) / Math.max(collectionStats.size, 1)
                  )}ms
                </p>
                <p className="text-xs text-gray-400 mt-1">Collection time</p>
              </div>
            </div>
            
            {/* Live Device Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {Array.from(connectedDevices.entries()).map(([deviceId, data]) => {
                const stats = collectionStats.get(deviceId);
                return (
                  <div key={deviceId} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">{deviceId}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        stats?.status === 'running' ? 'bg-green-900/30 text-green-400' :
                        stats?.status === 'error' ? 'bg-red-900/30 text-red-400' :
                        'bg-gray-900/30 text-gray-400'
                      }`}>
                        {stats?.status || 'unknown'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(data.measurements).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <span className="text-white font-medium">
                            {typeof value === 'number' ? value.toFixed(2) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {stats && (
                      <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-400">
                        Last update: {new Date(stats.lastCollection).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Devices Tab */}
        {activeTab === 'devices' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Connected Devices</h2>
              <button
                onClick={() => setActiveTab('discovery')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Device
              </button>
            </div>
            
            <div className="bg-gray-900 rounded-lg border border-gray-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-gray-400 font-medium">Device ID</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Protocol</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Points Collected</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Last Update</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(connectedDevices.keys()).map(deviceId => {
                    const stats = collectionStats.get(deviceId);
                    return (
                      <tr key={deviceId} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="p-4 text-white">{deviceId}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">Unknown</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            stats?.status === 'running' ? 'bg-green-900/30 text-green-400' :
                            stats?.status === 'error' ? 'bg-red-900/30 text-red-400' :
                            'bg-gray-900/30 text-gray-400'
                          }`}>
                            {stats?.status || 'unknown'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300">{stats?.pointsCollected || 0}</td>
                        <td className="p-4 text-gray-300">
                          {stats ? new Date(stats.lastCollection).toLocaleString() : 'Never'}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedDevice(deviceId)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Discovery Tab */}
        {activeTab === 'discovery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Device Discovery</h2>
              <button
                onClick={discoverDevices}
                disabled={discovering}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                {discovering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Scan Network
                  </>
                )}
              </button>
            </div>
            
            {discoveredDevices.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {discoveredDevices.map(device => {
                  const Icon = getProtocolIcon(device.protocol);
                  return (
                    <div key={device.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${getProtocolColor(device.protocol)}`} />
                          <div>
                            <h3 className="font-semibold text-white">{device.name}</h3>
                            <p className="text-sm text-gray-400">{device.protocol.toUpperCase()}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          device.status === 'online' ? 'bg-green-900/30 text-green-400' :
                          'bg-gray-900/30 text-gray-400'
                        }`}>
                          {device.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Address:</span>
                          <span className="text-gray-300">{device.address}{device.port ? `:${device.port}` : ''}</span>
                        </div>
                        {device.manufacturer && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Manufacturer:</span>
                            <span className="text-gray-300">{device.manufacturer}</span>
                          </div>
                        )}
                        {device.model && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Model:</span>
                            <span className="text-gray-300">{device.model}</span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => connectDevice(device)}
                        className="mt-3 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  {discovering ? 'Scanning network for devices...' : 'No devices discovered yet. Click "Scan Network" to start.'}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Control Tab */}
        {activeTab === 'control' && selectedDevice && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Device Control - {selectedDevice}</h2>
              <button
                onClick={() => setSelectedDevice('')}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Control Panel */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">Quick Controls</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => executeCommand(selectedDevice, 'ENABLE_DEVICE')}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    Enable Device
                  </button>
                  <button
                    onClick={() => executeCommand(selectedDevice, 'DISABLE_DEVICE')}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    Disable Device
                  </button>
                </div>
              </div>
              
              {/* Setpoint Control */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">Setpoints</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Temperature Setpoint</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        placeholder="24.0"
                      />
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
                        Set
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Humidity Setpoint</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        placeholder="60.0"
                      />
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
                        Set
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}