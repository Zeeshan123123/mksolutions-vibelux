'use client';

import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Router, 
  Wifi, 
  Radio, 
  Settings, 
  Activity,
  Shield,
  Database,
  Zap,
  Thermometer,
  Droplets,
  Wind,
  Camera,
  Lock,
  AlertTriangle,
  CheckCircle,
  Signal
} from 'lucide-react';

interface NetworkDevice {
  id: string;
  name: string;
  type: 'controller' | 'sensor' | 'actuator' | 'gateway' | 'router' | 'switch' | 'camera' | 'access_point';
  position: [number, number];
  zone: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  specifications: {
    protocol?: string;
    power?: number; // watts
    dataRate?: string;
    range?: number; // feet
    batteryLife?: number; // hours
  };
  connections: string[];
  lastSeen: string;
}

interface SensorNetwork {
  id: string;
  name: string;
  type: 'environmental' | 'security' | 'production' | 'energy';
  devices: NetworkDevice[];
  protocol: 'WiFi' | 'Zigbee' | 'LoRaWAN' | 'Modbus' | 'BACnet';
  coverage: number; // percentage
  reliability: number; // percentage
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    device: string;
    condition: string;
    value: number;
  };
  action: {
    device: string;
    command: string;
    value?: number;
  };
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface FacilityConfig {
  dimensions: { length: number; width: number; height: number };
}

interface AutomationNetworkDesignerProps {
  facilityConfig: FacilityConfig;
  onSystemUpdate?: (system: any) => void;
}

export function AutomationNetworkDesigner({ 
  facilityConfig, 
  onSystemUpdate 
}: AutomationNetworkDesignerProps) {
  const [designMode, setDesignMode] = useState<'overview' | 'devices' | 'networks' | 'automation' | 'monitoring'>('overview');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

  const [networkDevices, setNetworkDevices] = useState<NetworkDevice[]>([
    // Central Controllers
    {
      id: 'main-controller',
      name: 'Main Automation Controller',
      type: 'controller',
      position: [60, 30],
      zone: 'central',
      status: 'online',
      specifications: {
        protocol: 'BACnet/IP',
        power: 50
      },
      connections: ['env-gateway', 'security-gateway', 'lighting-controller'],
      lastSeen: '2024-07-26 14:30:00'
    },
    {
      id: 'lighting-controller',
      name: 'LED Lighting Controller',
      type: 'controller',
      position: [40, 40],
      zone: 'flowering-room-1',
      status: 'online',
      specifications: {
        protocol: 'DMX512',
        power: 25
      },
      connections: ['main-controller'],
      lastSeen: '2024-07-26 14:30:00'
    },

    // Environmental Sensors
    {
      id: 'temp-sensor-1',
      name: 'Temperature Sensor F1-1',
      type: 'sensor',
      position: [20, 35],
      zone: 'flowering-room-1',
      status: 'online',
      specifications: {
        protocol: 'Zigbee',
        power: 0.1,
        range: 100,
        batteryLife: 8760
      },
      connections: ['env-gateway'],
      lastSeen: '2024-07-26 14:29:45'
    },
    {
      id: 'humidity-sensor-1',
      name: 'Humidity Sensor F1-2',
      type: 'sensor',
      position: [25, 40],
      zone: 'flowering-room-1',
      status: 'online',
      specifications: {
        protocol: 'Zigbee',
        power: 0.1,
        range: 100,
        batteryLife: 8760
      },
      connections: ['env-gateway'],
      lastSeen: '2024-07-26 14:29:50'
    },
    {
      id: 'co2-sensor-1',
      name: 'CO₂ Sensor F1-3',
      type: 'sensor',
      position: [30, 35],
      zone: 'flowering-room-1',
      status: 'online',
      specifications: {
        protocol: 'Zigbee',
        power: 0.2,
        range: 100,
        batteryLife: 4380
      },
      connections: ['env-gateway'],
      lastSeen: '2024-07-26 14:29:55'
    },

    // Network Infrastructure
    {
      id: 'env-gateway',
      name: 'Environmental Gateway',
      type: 'gateway',
      position: [50, 40],
      zone: 'central',
      status: 'online',
      specifications: {
        protocol: 'Zigbee/WiFi',
        power: 12,
        range: 300
      },
      connections: ['main-controller', 'temp-sensor-1', 'humidity-sensor-1', 'co2-sensor-1'],
      lastSeen: '2024-07-26 14:30:00'
    },
    {
      id: 'security-gateway',
      name: 'Security Gateway',
      type: 'gateway',
      position: [70, 40],
      zone: 'central',
      status: 'online',
      specifications: {
        protocol: 'WiFi/Ethernet',
        power: 15
      },
      connections: ['main-controller', 'security-camera-1', 'access-control-1'],
      lastSeen: '2024-07-26 14:30:00'
    },
    {
      id: 'main-switch',
      name: 'Main Network Switch',
      type: 'switch',
      position: [60, 50],
      zone: 'central',
      status: 'online',
      specifications: {
        protocol: 'Ethernet',
        power: 35,
        dataRate: '1 Gbps'
      },
      connections: ['main-controller', 'env-gateway', 'security-gateway'],
      lastSeen: '2024-07-26 14:30:00'
    },
    {
      id: 'wifi-ap-1',
      name: 'WiFi Access Point 1',
      type: 'access_point',
      position: [40, 20],
      zone: 'flowering-room-1',
      status: 'online',
      specifications: {
        protocol: 'WiFi 6',
        power: 20,
        range: 150
      },
      connections: ['main-switch'],
      lastSeen: '2024-07-26 14:30:00'
    },

    // Security Devices
    {
      id: 'security-camera-1',
      name: 'Security Camera F1-1',
      type: 'camera',
      position: [15, 30],
      zone: 'flowering-room-1',
      status: 'online',
      specifications: {
        protocol: 'WiFi',
        power: 8,
        dataRate: '4K@30fps'
      },
      connections: ['security-gateway'],
      lastSeen: '2024-07-26 14:29:58'
    },
    {
      id: 'access-control-1',
      name: 'Access Control Panel',
      type: 'controller',
      position: [10, 25],
      zone: 'entrance',
      status: 'online',
      specifications: {
        protocol: 'WiFi/RFID',
        power: 12
      },
      connections: ['security-gateway'],
      lastSeen: '2024-07-26 14:30:00'
    },

    // Actuators
    {
      id: 'hvac-actuator-1',
      name: 'HVAC Damper Actuator',
      type: 'actuator',
      position: [35, 45],
      zone: 'flowering-room-1',
      status: 'online',
      specifications: {
        protocol: 'BACnet',
        power: 5
      },
      connections: ['main-controller'],
      lastSeen: '2024-07-26 14:29:52'
    }
  ]);

  const [sensorNetworks, setSensorNetworks] = useState<RadioNetwork[]>([
    {
      id: 'environmental-network',
      name: 'Environmental Monitoring',
      type: 'environmental',
      devices: networkDevices.filter(d => ['temp-sensor-1', 'humidity-sensor-1', 'co2-sensor-1', 'env-gateway'].includes(d.id)),
      protocol: 'Zigbee',
      coverage: 95,
      reliability: 99.2
    },
    {
      id: 'security-network',
      name: 'Security & Access Control',
      type: 'security',
      devices: networkDevices.filter(d => ['security-camera-1', 'access-control-1', 'security-gateway'].includes(d.id)),
      protocol: 'WiFi',
      coverage: 100,
      reliability: 99.8
    },
    {
      id: 'lighting-network',
      name: 'Lighting Control',
      type: 'production',
      devices: networkDevices.filter(d => ['lighting-controller'].includes(d.id)),
      protocol: 'WiFi',
      coverage: 100,
      reliability: 99.5
    }
  ]);

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: 'rule-temp-high',
      name: 'High Temperature Response',
      trigger: {
        device: 'temp-sensor-1',
        condition: 'greater_than',
        value: 78
      },
      action: {
        device: 'hvac-actuator-1',
        command: 'increase_cooling',
        value: 10
      },
      enabled: true,
      priority: 'high'
    },
    {
      id: 'rule-humidity-low',
      name: 'Low Humidity Alert',
      trigger: {
        device: 'humidity-sensor-1',
        condition: 'less_than',
        value: 45
      },
      action: {
        device: 'main-controller',
        command: 'send_alert'
      },
      enabled: true,
      priority: 'medium'
    },
    {
      id: 'rule-security-breach',
      name: 'Security Breach Protocol',
      trigger: {
        device: 'access-control-1',
        condition: 'unauthorized_access',
        value: 1
      },
      action: {
        device: 'security-gateway',
        command: 'lockdown_facility'
      },
      enabled: true,
      priority: 'critical'
    }
  ]);

  const networkMetrics = useMemo(() => {
    const totalDevices = networkDevices.length;
    const onlineDevices = networkDevices.filter(d => d.status === 'online').length;
    const offlineDevices = networkDevices.filter(d => d.status === 'offline').length;
    const warningDevices = networkDevices.filter(d => d.status === 'warning').length;
    
    const uptime = (onlineDevices / totalDevices) * 100;
    const totalPower = networkDevices.reduce((sum, device) => sum + (device.specifications.power || 0), 0);
    
    const avgCoverage = sensorNetworks.reduce((sum, network) => sum + network.coverage, 0) / sensorNetworks.length;
    const avgReliability = sensorNetworks.reduce((sum, network) => sum + network.reliability, 0) / sensorNetworks.length;
    
    const activeRules = automationRules.filter(rule => rule.enabled).length;

    return {
      totalDevices,
      onlineDevices,
      offlineDevices,
      warningDevices,
      uptime: uptime.toFixed(1),
      totalPower: totalPower.toFixed(1),
      avgCoverage: avgCoverage.toFixed(1),
      avgReliability: avgReliability.toFixed(1),
      activeRules,
      dataPoints: 15420, // daily data points
      alerts: 3
    };
  }, [networkDevices, sensorNetworks, automationRules]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Network Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Network Uptime</span>
            <Signal className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">{networkMetrics.uptime}%</p>
          <p className="text-xs text-green-400">{networkMetrics.onlineDevices}/{networkMetrics.totalDevices} devices online</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Coverage</span>
            <Wifi className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">{networkMetrics.avgCoverage}%</p>
          <p className="text-xs text-gray-400">Average network coverage</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Rules</span>
            <Settings className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-white">{networkMetrics.activeRules}</p>
          <p className="text-xs text-gray-400">Automation rules enabled</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Power Consumption</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-white">{networkMetrics.totalPower}W</p>
          <p className="text-xs text-gray-400">Network infrastructure</p>
        </div>
      </div>

      {/* Network Topology */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Network Topology</h3>
        <div className="relative bg-gray-800 rounded-lg h-96 overflow-hidden">
          <svg 
            viewBox={`0 0 ${facilityConfig.dimensions.length} ${facilityConfig.dimensions.width}`}
            className="w-full h-full"
          >
            {/* Facility outline */}
            <rect
              x={0}
              y={0}
              width={facilityConfig.dimensions.length}
              height={facilityConfig.dimensions.width}
              fill="none"
              stroke="#4B5563"
              strokeWidth={0.5}
            />
            
            {/* Network connections */}
            {networkDevices.map((device) => 
              device.connections.map((connId) => {
                const connectedDevice = networkDevices.find(d => d.id === connId);
                if (!connectedDevice) return null;
                
                return (
                  <line
                    key={`${device.id}-${connId}`}
                    x1={device.position[0]}
                    y1={device.position[1]}
                    x2={connectedDevice.position[0]}
                    y2={connectedDevice.position[1]}
                    stroke="#3B82F6"
                    strokeWidth={0.5}
                    opacity={0.6}
                  />
                );
              })
            )}
            
            {/* Network devices */}
            {networkDevices.map((device) => {
              const deviceColor = 
                device.status === 'online' ? '#10B981' :
                device.status === 'warning' ? '#F59E0B' :
                device.status === 'offline' ? '#EF4444' :
                '#6B7280';
              
              const deviceIcon = 
                device.type === 'controller' ? 'C' :
                device.type === 'sensor' ? 'S' :
                device.type === 'actuator' ? 'A' :
                device.type === 'gateway' ? 'G' :
                device.type === 'router' ? 'R' :
                device.type === 'switch' ? 'SW' :
                device.type === 'camera' ? 'CAM' :
                'AP';
              
              return (
                <g key={device.id}>
                  <circle
                    cx={device.position[0]}
                    cy={device.position[1]}
                    r={2}
                    fill={deviceColor}
                    className="cursor-pointer"
                    onClick={() => setSelectedDevice(device.id)}
                  />
                  <text
                    x={device.position[0]}
                    y={device.position[1] - 3}
                    fill="#E5E7EB"
                    fontSize="1.5"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {deviceIcon}
                  </text>
                  
                  {/* WiFi coverage for access points */}
                  {device.type === 'access_point' && (
                    <circle
                      cx={device.position[0]}
                      cy={device.position[1]}
                      r={device.specifications.range ? device.specifications.range / 10 : 15}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth={0.2}
                      opacity={0.3}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* System Status & Alerts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Network Status</h3>
          <div className="space-y-3">
            {sensorNetworks.map((network) => (
              <div key={network.id} className="bg-gray-600 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{network.name}</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-400">Active</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Protocol</p>
                    <p className="text-white">{network.protocol}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Coverage</p>
                    <p className="text-white">{network.coverage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Reliability</p>
                    <p className="text-white">{network.reliability}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Active Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-yellow-400 text-sm font-medium">Sensor Battery Low</p>
                <p className="text-yellow-300 text-xs">CO₂ Sensor F1-3 battery at 15%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-blue-400 text-sm font-medium">System Update Available</p>
                <p className="text-blue-300 text-xs">Firmware v2.1.3 ready for installation</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-green-400 text-sm font-medium">All Systems Operational</p>
                <p className="text-green-300 text-xs">Network performance within normal range</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDevicesManagement = () => (
    <div className="space-y-6">
      {/* Device Inventory */}
      <div className="bg-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Network Devices</h3>
          <button className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">
            Add Device
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-600">
                <th className="text-left p-3">Device</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Zone</th>
                <th className="text-left p-3">Protocol</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Last Seen</th>
                <th className="text-left p-3">Power</th>
              </tr>
            </thead>
            <tbody>
              {networkDevices.map((device) => (
                <tr 
                  key={device.id} 
                  className={`text-white border-b border-gray-600 hover:bg-gray-600 cursor-pointer ${
                    selectedDevice === device.id ? 'bg-gray-600' : ''
                  }`}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded ${
                        device.type === 'controller' ? 'bg-red-500' :
                        device.type === 'sensor' ? 'bg-blue-500' :
                        device.type === 'actuator' ? 'bg-green-500' :
                        device.type === 'gateway' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}>
                        {device.type === 'controller' && <Cpu className="w-3 h-3 text-white" />}
                        {device.type === 'sensor' && <Radio className="w-3 h-3 text-white" />}
                        {device.type === 'actuator' && <Settings className="w-3 h-3 text-white" />}
                        {device.type === 'gateway' && <Router className="w-3 h-3 text-white" />}
                        {device.type === 'camera' && <Camera className="w-3 h-3 text-white" />}
                        {(device.type === 'router' || device.type === 'switch' || device.type === 'access_point') && <Wifi className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-medium">{device.name}</span>
                    </div>
                  </td>
                  <td className="p-3 capitalize">{device.type.replace('_', ' ')}</td>
                  <td className="p-3">{device.zone}</td>
                  <td className="p-3">{device.specifications.protocol || 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      device.status === 'online' ? 'bg-green-500/20 text-green-400' :
                      device.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      device.status === 'offline' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs">{device.lastSeen}</td>
                  <td className="p-3">{device.specifications.power || 0}W</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Details */}
      {selectedDevice && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Device Details</h3>
          {(() => {
            const device = networkDevices.find(d => d.id === selectedDevice);
            if (!device) return null;
            
            return (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Device Name</label>
                    <input 
                      type="text" 
                      value={device.name}
                      className="w-full bg-gray-600 text-white rounded-lg p-3"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Position (X, Y)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="number" 
                        value={device.position[0]}
                        className="bg-gray-600 text-white rounded-lg p-3"
                        readOnly
                      />
                      <input 
                        type="number" 
                        value={device.position[1]}
                        className="bg-gray-600 text-white rounded-lg p-3"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Zone</label>
                    <input 
                      type="text" 
                      value={device.zone}
                      className="w-full bg-gray-600 text-white rounded-lg p-3"
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Status</label>
                    <select className="w-full bg-gray-600 text-white rounded-lg p-3">
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Protocol</label>
                    <input 
                      type="text" 
                      value={device.specifications.protocol || 'N/A'}
                      className="w-full bg-gray-600 text-white rounded-lg p-3"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Power Consumption</label>
                    <input 
                      type="text" 
                      value={`${device.specifications.power || 0}W`}
                      className="w-full bg-gray-600 text-white rounded-lg p-3"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Router className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Automation Network Designer</h2>
            <p className="text-gray-400">IoT devices, sensor networks, and automation control systems</p>
          </div>
        </div>
        
        {/* Mode selector */}
        <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview', icon: Activity },
            { key: 'devices', label: 'Devices', icon: Cpu },
            { key: 'networks', label: 'Networks', icon: Wifi },
            { key: 'automation', label: 'Rules', icon: Settings },
            { key: 'monitoring', label: 'Monitor', icon: Database }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setDesignMode(key as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                designMode === key
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on design mode */}
      {designMode === 'overview' && renderOverview()}
      {designMode === 'devices' && renderDevicesManagement()}
      {designMode === 'networks' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Network Configuration</h3>
          <p className="text-gray-400">Network topology and protocol configuration tools coming soon...</p>
        </div>
      )}
      {designMode === 'automation' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Automation Rules</h3>
          <div className="space-y-4">
            {automationRules.map((rule) => (
              <div key={rule.id} className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">{rule.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rule.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      rule.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      rule.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {rule.priority}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
                  </div>
                </div>
                
                <div className="text-sm text-gray-300">
                  <p>
                    <span className="text-blue-400">When</span> {rule.trigger.device} {rule.trigger.condition} {rule.trigger.value}
                  </p>
                  <p>
                    <span className="text-green-400">Then</span> {rule.action.device} {rule.action.command} {rule.action.value || ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {designMode === 'monitoring' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Real-time Network Monitoring</h3>
          <p className="text-gray-400">Network performance and device monitoring dashboard coming soon...</p>
        </div>
      )}
    </div>
  );
}

export default AutomationNetworkDesigner;