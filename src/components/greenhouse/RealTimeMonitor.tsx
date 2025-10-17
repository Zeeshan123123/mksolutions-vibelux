'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Zap,
  AlertTriangle,
  CheckCircle,
  WifiOff,
  Wifi,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useGreenhouseWebSocket } from '@/lib/websocket/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RealtimeChart } from 'recharts';

interface SensorReading {
  sensorId: string;
  sensorType: string;
  sensorName: string;
  value: number;
  unit: string;
  quality: 'GOOD' | 'UNCERTAIN' | 'BAD';
  timestamp: string;
}

interface ClimateReading {
  zoneId: string;
  zoneName: string;
  zoneType: string;
  temperature: number;
  humidity: number;
  co2?: number;
  vpd?: number;
  lightLevel?: number;
  timestamp: string;
}

interface EquipmentStatus {
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  status: string;
  isActive: boolean;
  powerUsage?: number;
  efficiency?: number;
  timestamp: string;
}

interface Alert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: string;
  acknowledged?: boolean;
}

interface RealTimeMonitorProps {
  designId: string;
  facilityId?: string;
}

export function RealTimeMonitor({ designId, facilityId }: RealTimeMonitorProps) {
  const [sensorReadings, setSensorReadings] = useState<Map<string, SensorReading>>(new Map());
  const [climateReadings, setClimateReadings] = useState<Map<string, ClimateReading>>(new Map());
  const [equipmentStatus, setEquipmentStatus] = useState<Map<string, EquipmentStatus>>(new Map());
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('climate');

  const {
    connectionState,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    onMessage,
    isConnected
  } = useGreenhouseWebSocket({
    designId,
    facilityId
  });

  // Initialize WebSocket connection
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Set up message handlers
  useEffect(() => {
    const unsubscribeHandlers: (() => void)[] = [];

    // Handle initial data
    unsubscribeHandlers.push(
      onMessage('initial_data', (data) => {
        console.log('Received initial data:', data);
        // Process initial data and populate state
        if (data.zones) {
          data.zones.forEach((zone: any) => {
            if (zone.latestClimate) {
              setClimateReadings(prev => new Map(prev.set(zone.id, {
                zoneId: zone.id,
                zoneName: zone.name,
                zoneType: zone.zoneType || 'GROWING',
                ...zone.latestClimate
              })));
            }
          });
        }
      })
    );

    // Handle sensor readings
    unsubscribeHandlers.push(
      onMessage('sensor_reading', (data: SensorReading) => {
        setSensorReadings(prev => new Map(prev.set(data.sensorId, data)));
        
        // Add to historical data
        setHistoricalData(prev => [
          ...prev.slice(-99), // Keep last 100 points
          {
            timestamp: new Date(data.timestamp).getTime(),
            [data.sensorType]: data.value,
            sensorId: data.sensorId
          }
        ]);
      })
    );

    // Handle climate readings
    unsubscribeHandlers.push(
      onMessage('climate_reading', (data: ClimateReading) => {
        setClimateReadings(prev => new Map(prev.set(data.zoneId, data)));
        
        // Add to historical data
        setHistoricalData(prev => [
          ...prev.slice(-99),
          {
            timestamp: new Date(data.timestamp).getTime(),
            temperature: data.temperature,
            humidity: data.humidity,
            co2: data.co2,
            zoneId: data.zoneId
          }
        ]);
      })
    );

    // Handle equipment status
    unsubscribeHandlers.push(
      onMessage('equipment_status', (data: EquipmentStatus) => {
        setEquipmentStatus(prev => new Map(prev.set(data.equipmentId, data)));
      })
    );

    // Handle alerts
    unsubscribeHandlers.push(
      onMessage('alert', (data: Alert) => {
        setAlerts(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 alerts
      })
    );

    // Handle connection events
    unsubscribeHandlers.push(
      onMessage('connection_established', (data) => {
        console.log('WebSocket connection established:', data);
        
        // Subscribe to relevant channels
        const channels = [
          `design:${designId}`,
          `facility:${facilityId}`,
          'alerts',
          'system'
        ];
        
        subscribe(channels);
      })
    );

    return () => {
      unsubscribeHandlers.forEach(unsub => unsub());
    };
  }, [onMessage, subscribe, designId, facilityId]);

  const getConnectionStatusColor = () => {
    if (connectionState.connected) return 'text-green-600';
    if (connectionState.connecting) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConnectionStatusIcon = () => {
    if (connectionState.connected) return <Wifi className="h-4 w-4" />;
    if (connectionState.connecting) return <RefreshCw className="h-4 w-4 animate-spin" />;
    return <WifiOff className="h-4 w-4" />;
  };

  const getSensorQualityColor = (quality: string) => {
    switch (quality) {
      case 'GOOD': return 'text-green-600';
      case 'UNCERTAIN': return 'text-yellow-600';
      case 'BAD': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEquipmentStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return { icon: TrendingUp, color: 'text-green-600', direction: 'up' };
    if (current < previous) return { icon: TrendingDown, color: 'text-red-600', direction: 'down' };
    return { icon: Minus, color: 'text-gray-400', direction: 'stable' };
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Header */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span className={getConnectionStatusColor()}>
              {getConnectionStatusIcon()}
            </span>
            <div>
              <div className="font-medium">
                {connectionState.connected ? 'Connected' : 
                 connectionState.connecting ? 'Connecting...' : 'Disconnected'}
              </div>
              {connectionState.error && (
                <div className="text-sm text-red-600">{connectionState.error}</div>
              )}
              {connectionState.reconnectAttempts > 0 && (
                <div className="text-sm text-gray-600">
                  Reconnect attempts: {connectionState.reconnectAttempts}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isConnected && (
              <Button onClick={connect} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconnect
              </Button>
            )}
            <Badge variant="outline">
              Live Data
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {alerts.filter(a => !a.acknowledged).length} active alert{alerts.filter(a => !a.acknowledged).length !== 1 ? 's' : ''}
              </span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setActiveTab('alerts')}
              >
                View All
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Monitoring Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="climate">Climate</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {alerts.filter(a => !a.acknowledged).length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs">
                {alerts.filter(a => !a.acknowledged).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Climate Tab */}
        <TabsContent value="climate" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(climateReadings.values()).map((reading) => (
              <Card key={reading.zoneId}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{reading.zoneName}</span>
                    <Badge variant="outline">
                      {reading.zoneType.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="text-2xl font-bold">
                          {reading.temperature.toFixed(1)}°C
                        </div>
                        <div className="text-xs text-gray-500">Temperature</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">
                          {reading.humidity.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Humidity</div>
                      </div>
                    </div>
                  </div>

                  {reading.co2 && (
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-lg font-semibold">
                          {reading.co2.toFixed(0)} ppm
                        </div>
                        <div className="text-xs text-gray-500">CO₂ Level</div>
                      </div>
                    </div>
                  )}

                  {reading.lightLevel && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-yellow-500" />
                      <div>
                        <div className="text-lg font-semibold">
                          {reading.lightLevel.toFixed(0)} lux
                        </div>
                        <div className="text-xs text-gray-500">Light Level</div>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-400">
                    Last updated: {new Date(reading.timestamp).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Historical Chart */}
          {historicalData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Climate Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp"
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={false}
                        name="Temperature (°C)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="humidity" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                        name="Humidity (%)"
                      />
                      {historicalData.some(d => d.co2) && (
                        <Line 
                          type="monotone" 
                          dataKey="co2" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={false}
                          name="CO₂ (ppm)"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sensors Tab */}
        <TabsContent value="sensors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(sensorReadings.values()).map((reading) => (
              <Card key={reading.sensorId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{reading.sensorName}</CardTitle>
                    <Badge variant="outline">
                      {reading.sensorType.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">
                      {reading.value.toFixed(2)}
                    </div>
                    <div className="text-lg text-gray-600">
                      {reading.unit}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Quality:</span>
                    <Badge className={`${getSensorQualityColor(reading.quality)} border`}>
                      {reading.quality}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-400">
                    {new Date(reading.timestamp).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {Array.from(sensorReadings.values()).length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No sensor data available
                </h3>
                <p className="text-gray-600">
                  Sensor readings will appear here when available
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(equipmentStatus.values()).map((equipment) => (
              <Card key={equipment.equipmentId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{equipment.equipmentName}</CardTitle>
                    <Badge className={getEquipmentStatusColor(equipment.status)}>
                      {equipment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">
                      {equipment.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {equipment.powerUsage && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Power Usage:</span>
                      <span className="font-medium">{equipment.powerUsage}W</span>
                    </div>
                  )}

                  {equipment.efficiency && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Efficiency:</span>
                      <span className="font-medium">{(equipment.efficiency * 100).toFixed(1)}%</span>
                    </div>
                  )}

                  <div className="text-xs text-gray-400">
                    {new Date(equipment.timestamp).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {Array.from(equipmentStatus.values()).length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No equipment status available
                </h3>
                <p className="text-gray-600">
                  Equipment status updates will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={`${alert.acknowledged ? 'opacity-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${
                        alert.severity === 'CRITICAL' ? 'text-red-600' :
                        alert.severity === 'HIGH' ? 'text-orange-600' :
                        alert.severity === 'MEDIUM' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getAlertSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {alert.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {alerts.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No alerts
                </h3>
                <p className="text-gray-600">
                  All systems are operating normally
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}