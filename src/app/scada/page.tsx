'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Monitor,
  Activity,
  AlertTriangle,
  Settings,
  Database,
  Cpu,
  Network,
  Shield,
  Bell,
  TrendingUp,
  Gauge,
  Power,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SystemStatus {
  name: string;
  status: 'online' | 'offline' | 'warning';
  value: number;
  unit: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'stable';
}

interface AlarmEvent {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  system: string;
  message: string;
  acknowledged: boolean;
}

export default function SCADAPage() {
  const [selectedSystem, setSelectedSystem] = useState<string>('overview');
  const [alarms, setAlarms] = useState<AlarmEvent[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60000),
      severity: 'warning',
      system: 'HVAC',
      message: 'Room 3 temperature 2°F above setpoint',
      acknowledged: false
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60000),
      severity: 'info',
      system: 'Lighting',
      message: 'Scheduled dimming cycle started',
      acknowledged: true
    }
  ]);

  const systems: SystemStatus[] = [
    { name: 'HVAC System', status: 'online', value: 98, unit: '%', icon: Wind, trend: 'stable' },
    { name: 'Lighting Control', status: 'online', value: 100, unit: '%', icon: Sun, trend: 'up' },
    { name: 'Irrigation', status: 'warning', value: 85, unit: '%', icon: Droplets, trend: 'down' },
    { name: 'Power Systems', status: 'online', value: 99.9, unit: '%', icon: Power, trend: 'stable' },
    { name: 'Environmental', status: 'online', value: 95, unit: '%', icon: Thermometer, trend: 'up' },
    { name: 'Security', status: 'online', value: 100, unit: '%', icon: Shield, trend: 'stable' }
  ];

  const roomData = [
    { id: 'VEG-01', temp: 75, humidity: 65, co2: 1200, light: 450, status: 'optimal' },
    { id: 'VEG-02', temp: 74, humidity: 63, co2: 1180, light: 445, status: 'optimal' },
    { id: 'FLOW-01', temp: 72, humidity: 55, co2: 1100, light: 650, status: 'optimal' },
    { id: 'FLOW-02', temp: 73, humidity: 58, co2: 1150, light: 645, status: 'warning' },
    { id: 'DRY-01', temp: 68, humidity: 45, co2: 800, light: 0, status: 'optimal' },
    { id: 'PROC-01', temp: 70, humidity: 50, co2: 900, light: 200, status: 'optimal' }
  ];

  const acknowledgeAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === id ? { ...alarm, acknowledged: true } : alarm
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'optimal': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'warning': return 'bg-yellow-600';
      case 'info': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Monitor className="w-10 h-10 text-green-400" />
            SCADA System
          </h1>
          <p className="text-gray-400 text-lg">
            Supervisory Control and Data Acquisition for complete facility monitoring
          </p>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {systems.map((system, index) => (
            <motion.div
              key={system.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer"
              onClick={() => setSelectedSystem(system.name.toLowerCase().replace(' ', '-'))}
            >
              <div className="flex items-center justify-between mb-2">
                <system.icon className={`w-5 h-5 ${getStatusColor(system.status)}`} />
                {system.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                {system.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />}
              </div>
              <div className="text-xs text-gray-400 mb-1">{system.name}</div>
              <div className="text-xl font-bold">{system.value}{system.unit}</div>
              <div className={`text-xs mt-1 ${getStatusColor(system.status)} capitalize`}>
                {system.status}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Real-time Monitoring */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Real-time Room Monitoring
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                    <th className="pb-2">Room</th>
                    <th className="pb-2">Temp (°F)</th>
                    <th className="pb-2">RH (%)</th>
                    <th className="pb-2">CO₂ (ppm)</th>
                    <th className="pb-2">Light (µmol)</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roomData.map((room) => (
                    <tr key={room.id} className="border-b border-gray-700">
                      <td className="py-3 font-medium">{room.id}</td>
                      <td className="py-3">{room.temp}</td>
                      <td className="py-3">{room.humidity}</td>
                      <td className="py-3">{room.co2}</td>
                      <td className="py-3">{room.light}</td>
                      <td className="py-3">
                        <span className={`flex items-center gap-1 ${getStatusColor(room.status)}`}>
                          {room.status === 'optimal' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <AlertTriangle className="w-4 h-4" />
                          )}
                          {room.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alarms Panel */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-400" />
              Active Alarms
              <span className="ml-auto text-sm font-normal text-gray-400">
                {alarms.filter(a => !a.acknowledged).length} unacknowledged
              </span>
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`p-3 rounded-lg border ${
                    alarm.acknowledged ? 'border-gray-700 opacity-60' : 'border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(alarm.severity)}`}>
                      {alarm.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {alarm.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm font-medium mb-1">{alarm.system}</div>
                  <div className="text-sm text-gray-400 mb-2">{alarm.message}</div>
                  {!alarm.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlarm(alarm.id)}
                      className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Control Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              PLC Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Main Controller</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">I/O Modules</span>
                <span className="text-green-400">24/24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CPU Load</span>
                <span>32%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Scan Time</span>
                <span>12ms</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-400" />
              Network Health
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Primary</span>
                <span className="text-green-400">100 Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Redundant</span>
                <span className="text-green-400">100 Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Packet Loss</span>
                <span className="text-green-400">0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Latency</span>
                <span>&lt; 1ms</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-yellow-400" />
              Data Historian
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Storage Used</span>
                <span>45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Points/sec</span>
                <span>1,250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Retention</span>
                <span>90 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Backup</span>
                <span className="text-green-400">Current</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-400" />
              Power Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Main Feed</span>
                <span>485V</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Load</span>
                <span>245 kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Power Factor</span>
                <span>0.95</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">UPS Status</span>
                <span className="text-green-400">100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-600/30">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/hvac" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <Wind className="w-6 h-6 text-blue-400" />
              <span className="text-sm">HVAC Control</span>
            </Link>
            <Link href="/lighting" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <Sun className="w-6 h-6 text-yellow-400" />
              <span className="text-sm">Lighting</span>
            </Link>
            <Link href="/analytics" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <Gauge className="w-6 h-6 text-purple-400" />
              <span className="text-sm">Analytics</span>
            </Link>
            <Link href="/settings" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 flex flex-col items-center gap-2 transition-colors">
              <Settings className="w-6 h-6 text-gray-400" />
              <span className="text-sm">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}