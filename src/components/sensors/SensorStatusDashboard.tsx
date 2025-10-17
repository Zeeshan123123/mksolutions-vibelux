'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, WifiOff,
  Thermometer, Droplets, Wind, TestTube, Sun, Zap,
  TrendingUp, TrendingDown, Minus, RefreshCw,
  AlertCircle, Shield, ShieldOff, Settings
} from 'lucide-react';
import { realSensorService, SensorStatus } from '@/lib/sensors/real-sensor-service';
import { formatDistanceToNow } from 'date-fns';

interface SensorData {
  id: string;
  name: string;
  type: string;
  status: SensorStatus;
  value?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  lastUpdate?: Date;
  quality?: 'good' | 'questionable' | 'bad';
  isReal: boolean;
}

export function SensorStatusDashboard() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [isSimulated, setIsSimulated] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    loadSensors();
    
    // Subscribe to real sensor events
    const handleSensorReading = (reading: any) => {
      updateSensorData(reading.sensorId, {
        value: reading.value,
        unit: reading.unit,
        lastUpdate: reading.timestamp,
        quality: reading.quality,
        status: 'connected'
      });
    };

    const handleSensorDisconnected = (data: any) => {
      updateSensorData(data.sensorId, {
        status: 'disconnected'
      });
    };

    const handleSensorReconnected = (data: any) => {
      updateSensorData(data.sensorId, {
        status: 'connected'
      });
    };

    realSensorService.on('sensorReading', handleSensorReading);
    realSensorService.on('sensorDisconnected', handleSensorDisconnected);
    realSensorService.on('sensorReconnected', handleSensorReconnected);

    // Refresh every 5 seconds
    const interval = setInterval(loadSensors, 5000);

    return () => {
      clearInterval(interval);
      realSensorService.off('sensorReading', handleSensorReading);
      realSensorService.off('sensorDisconnected', handleSensorDisconnected);
      realSensorService.off('sensorReconnected', handleSensorReconnected);
    };
  }, []);

  const loadSensors = () => {
    const realSensors = realSensorService.getAllSensors();
    const sensorData: SensorData[] = [];

    // Add real sensors
    realSensors.forEach(sensor => {
      const status = realSensorService.getSensorStatus(sensor.id);
      const reading = realSensorService.getLastReading(sensor.id);
      
      sensorData.push({
        id: sensor.id,
        name: sensor.name,
        type: sensor.type,
        status,
        value: reading?.value,
        unit: reading?.unit,
        lastUpdate: reading?.timestamp,
        quality: reading?.quality,
        isReal: true,
        trend: calculateTrend(sensor.id)
      });
    });

    // If no real sensors, show demo sensors with warning
    if (sensorData.length === 0) {
      setIsSimulated(true);
      sensorData.push(
        {
          id: 'demo-1',
          name: 'Demo Temperature',
          type: 'temperature',
          status: 'connected',
          value: 22.5,
          unit: '°C',
          lastUpdate: new Date(),
          quality: 'good',
          isReal: false,
          trend: 'stable'
        },
        {
          id: 'demo-2',
          name: 'Demo Humidity',
          type: 'humidity',
          status: 'connected',
          value: 65,
          unit: '%',
          lastUpdate: new Date(),
          quality: 'good',
          isReal: false,
          trend: 'up'
        },
        {
          id: 'demo-3',
          name: 'Demo CO2',
          type: 'co2',
          status: 'connected',
          value: 850,
          unit: 'ppm',
          lastUpdate: new Date(),
          quality: 'good',
          isReal: false,
          trend: 'down'
        }
      );
    } else {
      setIsSimulated(false);
    }

    setSensors(sensorData);
  };

  const updateSensorData = (sensorId: string, updates: Partial<SensorData>) => {
    setSensors(prev => prev.map(sensor => 
      sensor.id === sensorId ? { ...sensor, ...updates } : sensor
    ));
  };

  const calculateTrend = (sensorId: string): 'up' | 'down' | 'stable' => {
    // This would normally look at historical data
    // For now, return stable
    return 'stable';
  };

  const getStatusIcon = (status: SensorStatus, isReal: boolean) => {
    if (!isReal) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'calibrating':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="w-5 h-5" />;
      case 'humidity':
        return <Droplets className="w-5 h-5" />;
      case 'co2':
        return <Wind className="w-5 h-5" />;
      case 'ph':
        return <TestTube className="w-5 h-5" />;
      case 'ec':
        return <Zap className="w-5 h-5" />;
      case 'light':
        return <Sun className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getQualityBadge = (quality?: string) => {
    switch (quality) {
      case 'good':
        return (
          <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 
                         text-green-700 dark:text-green-400 rounded-full">
            Good
          </span>
        );
      case 'questionable':
        return (
          <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 
                         text-yellow-700 dark:text-yellow-400 rounded-full">
            Questionable
          </span>
        );
      case 'bad':
        return (
          <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 
                         text-red-700 dark:text-red-400 rounded-full">
            Bad
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sensor Status Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time monitoring of all connected sensors
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSimulated ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 
                          text-yellow-700 dark:text-yellow-400 rounded-lg">
              <ShieldOff className="w-4 h-4" />
              <span className="text-sm font-medium">Demo Mode</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 
                          text-green-700 dark:text-green-400 rounded-lg">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Real Sensors</span>
            </div>
          )}
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                           dark:hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      {isSimulated && showWarning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 
                      dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  No Real Sensors Connected
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  You're viewing demo data. To see real sensor readings, connect actual sensors 
                  using the sensor setup wizard.
                </p>
                <div className="mt-3">
                  <button className="px-4 py-1.5 bg-yellow-600 text-white rounded-lg 
                                   hover:bg-yellow-700 transition-colors text-sm">
                    Setup Real Sensors
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 
                       dark:hover:text-yellow-400"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sensors.map(sensor => (
          <div
            key={sensor.id}
            className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-2 transition-all ${
              sensor.isReal
                ? sensor.status === 'connected'
                  ? 'border-green-200 dark:border-green-900'
                  : 'border-red-200 dark:border-red-900'
                : 'border-yellow-200 dark:border-yellow-900'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  sensor.isReal
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : 'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                  {getSensorIcon(sensor.type)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {sensor.name}
                  </h3>
                  {!sensor.isReal && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-500">
                      SIMULATED
                    </p>
                  )}
                </div>
              </div>
              {getStatusIcon(sensor.status, sensor.isReal)}
            </div>

            {/* Value Display */}
            {sensor.value !== undefined && (
              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sensor.value.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {sensor.unit}
                  </span>
                  {getTrendIcon(sensor.trend)}
                </div>
                {sensor.quality && getQualityBadge(sensor.quality)}
              </div>
            )}

            {/* Status Line */}
            <div className="flex items-center justify-between text-xs">
              <span className={`${
                sensor.status === 'connected'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {sensor.status === 'connected' ? 'Online' : 'Offline'}
              </span>
              {sensor.lastUpdate && (
                <span className="text-gray-500">
                  {formatDistanceToNow(sensor.lastUpdate, { addSuffix: true })}
                </span>
              )}
            </div>

            {/* Real Sensor Badge */}
            {sensor.isReal && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    REAL HARDWARE
                  </span>
                </div>
              </div>
            )}

            {/* Simulated Sensor Warning */}
            {!sensor.isReal && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                    DEMO DATA ONLY
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 
                      dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sensors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sensors.length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 
                      dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sensors.filter(s => s.status === 'connected').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 
                      dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Disconnected</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {sensors.filter(s => s.status === 'disconnected').length}
              </p>
            </div>
            <WifiOff className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 
                      dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Real Sensors</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {sensors.filter(s => s.isReal).length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
}