'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Battery, 
  Thermometer, 
  Droplets, 
  Lightbulb, 
  Gauge, 
  PlayCircle, 
  StopCircle, 
  Settings, 
  Plus, 
  Trash2, 
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Radio,
  Zap,
  LineChart
} from 'lucide-react';

interface IoTDevice {
  id: string;
  name: string;
  type: string;
  protocol: string;
  location: string;
  status: {
    online: boolean;
    lastSeen: Date;
    batteryLevel?: number;
    signalStrength?: number;
    firmware?: string;
    errorCodes?: string[];
  };
  lastReading?: {
    timestamp: Date;
    sensorType: string;
    value: number;
    unit: string;
  };
  capabilities: string[];
}

interface DeviceReading {
  deviceId: string;
  timestamp: Date;
  sensorType: string;
  value: number;
  unit: string;
  location?: string;
}

export default function IoTDevicesPage() {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [readings, setReadings] = useState<DeviceReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [hubInitialized, setHubInitialized] = useState(false);

  const [newDevice, setNewDevice] = useState({
    id: '',
    name: '',
    type: '',
    protocol: '',
    location: '',
    configuration: {
      deviceAddress: '',
      reportingInterval: 60,
      alertThresholds: {}
    }
  });

  const [hubConfig, setHubConfig] = useState({
    facilityId: 'facility_001',
    protocols: {
      mqtt: {
        brokerUrl: '',
        username: '',
        password: '',
        clientId: ''
      },
      http: {
        baseUrl: '',
        timeout: 5000
      },
      modbus: {
        tcp: {
          host: '',
          port: 502,
          timeout: 5000
        }
      }
    },
    settings: {
      dataRetentionDays: 30,
      autoDiscovery: true,
      pollingInterval: 30,
      batchSize: 100
    }
  });

  const deviceTypes = [
    { value: 'climate_sensor', label: 'Climate Sensor', icon: <Thermometer className="h-4 w-4" /> },
    { value: 'soil_sensor', label: 'Soil Sensor', icon: <Droplets className="h-4 w-4" /> },
    { value: 'light_controller', label: 'Light Controller', icon: <Lightbulb className="h-4 w-4" /> },
    { value: 'irrigation_controller', label: 'Irrigation Controller', icon: <Droplets className="h-4 w-4" /> },
    { value: 'ph_sensor', label: 'pH Sensor', icon: <Gauge className="h-4 w-4" /> },
    { value: 'co2_sensor', label: 'CO2 Sensor', icon: <Radio className="h-4 w-4" /> }
  ];

  const protocols = [
    { value: 'mqtt', label: 'MQTT', description: 'Message broker protocol' },
    { value: 'http', label: 'HTTP/REST', description: 'RESTful API' },
    { value: 'modbus_tcp', label: 'Modbus TCP', description: 'Industrial protocol over TCP' },
    { value: 'modbus_rtu', label: 'Modbus RTU', description: 'Industrial serial protocol' },
    { value: 'lorawan', label: 'LoRaWAN', description: 'Long range wireless' },
    { value: 'websocket', label: 'WebSocket', description: 'Real-time communication' }
  ];

  useEffect(() => {
    loadDevices();
    checkHubStatus();
  }, []);

  const loadDevices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/iot/devices?facilityId=${hubConfig.facilityId}`);
      
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkHubStatus = async () => {
    // Check if hub is initialized
    // This would typically check configuration status
    setHubInitialized(true);
  };

  const initializeHub = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/iot/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'initialize_hub',
          facilityId: hubConfig.facilityId,
          config: hubConfig
        })
      });

      if (response.ok) {
        setHubInitialized(true);
        alert('IoT Hub initialized successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to initialize hub: ${error.error}`);
      }
    } catch (error) {
      console.error('Hub initialization error:', error);
      alert('Failed to initialize IoT hub');
    } finally {
      setIsLoading(false);
    }
  };

  const addDevice = async () => {
    if (!newDevice.id || !newDevice.name || !newDevice.type || !newDevice.protocol) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/iot/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'register',
          device: {
            ...newDevice,
            facilityId: hubConfig.facilityId,
            capabilities: getDeviceCapabilities(newDevice.type)
          }
        })
      });

      if (response.ok) {
        setNewDevice({
          id: '',
          name: '',
          type: '',
          protocol: '',
          location: '',
          configuration: {
            deviceAddress: '',
            reportingInterval: 60,
            alertThresholds: {}
          }
        });
        setShowAddDevice(false);
        await loadDevices();
        alert('Device added successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to add device: ${error.error}`);
      }
    } catch (error) {
      console.error('Add device error:', error);
      alert('Failed to add device');
    } finally {
      setIsLoading(false);
    }
  };

  const removeDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to remove this device?')) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/iot/devices?deviceId=${deviceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadDevices();
        if (selectedDevice?.id === deviceId) {
          setSelectedDevice(null);
        }
        alert('Device removed successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to remove device: ${error.error}`);
      }
    } catch (error) {
      console.error('Remove device error:', error);
      alert('Failed to remove device');
    } finally {
      setIsLoading(false);
    }
  };

  const sendCommand = async (deviceId: string, command: string, parameters?: any) => {
    try {
      const response = await fetch('/api/iot/commands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId,
          command,
          parameters,
          priority: 'medium'
        })
      });

      if (response.ok) {
        alert('Command sent successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to send command: ${error.error}`);
      }
    } catch (error) {
      console.error('Send command error:', error);
      alert('Failed to send command');
    }
  };

  const loadDeviceReadings = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/iot/readings?deviceId=${deviceId}&limit=100`);
      
      if (response.ok) {
        const data = await response.json();
        setReadings(data.readings || []);
      }
    } catch (error) {
      console.error('Failed to load readings:', error);
    }
  };

  const getDeviceCapabilities = (deviceType: string): string[] => {
    const capabilityMap: Record<string, string[]> = {
      'climate_sensor': ['temperature', 'humidity', 'co2'],
      'soil_sensor': ['soil_moisture', 'soil_temperature', 'ph', 'ec'],
      'light_controller': ['brightness_control', 'spectrum_control', 'timing'],
      'irrigation_controller': ['valve_control', 'flow_control', 'pressure_monitoring'],
      'ph_sensor': ['ph_measurement', 'calibration'],
      'co2_sensor': ['co2_measurement', 'ppm_reading']
    };

    return capabilityMap[deviceType] || [];
  };

  const getStatusIcon = (device: IoTDevice) => {
    if (device.status.online) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getProtocolIcon = (protocol: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'mqtt': <Radio className="h-4 w-4" />,
      'http': <Wifi className="h-4 w-4" />,
      'modbus_tcp': <Cpu className="h-4 w-4" />,
      'modbus_rtu': <Cpu className="h-4 w-4" />,
      'lorawan': <Radio className="h-4 w-4" />,
      'websocket': <Zap className="h-4 w-4" />
    };

    return iconMap[protocol] || <Radio className="h-4 w-4" />;
  };

  if (!hubInitialized) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Cpu className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">IoT Device Hub</h1>
            <p className="text-muted-foreground">Initialize your IoT infrastructure</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Initialize IoT Hub</CardTitle>
            <CardDescription>
              Configure protocols and settings for your IoT device network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="facilityId">Facility ID</Label>
                <Input
                  id="facilityId"
                  value={hubConfig.facilityId}
                  onChange={(e) => setHubConfig({ ...hubConfig, facilityId: e.target.value })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Protocol Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>MQTT Broker URL</Label>
                    <Input
                      placeholder="mqtt://localhost:1883"
                      value={hubConfig.protocols.mqtt.brokerUrl}
                      onChange={(e) => setHubConfig({
                        ...hubConfig,
                        protocols: {
                          ...hubConfig.protocols,
                          mqtt: { ...hubConfig.protocols.mqtt, brokerUrl: e.target.value }
                        }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>HTTP Base URL</Label>
                    <Input
                      placeholder="http://localhost:8080/api"
                      value={hubConfig.protocols.http.baseUrl}
                      onChange={(e) => setHubConfig({
                        ...hubConfig,
                        protocols: {
                          ...hubConfig.protocols,
                          http: { ...hubConfig.protocols.http, baseUrl: e.target.value }
                        }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Modbus TCP Host</Label>
                    <Input
                      placeholder="192.168.1.100"
                      value={hubConfig.protocols.modbus.tcp.host}
                      onChange={(e) => setHubConfig({
                        ...hubConfig,
                        protocols: {
                          ...hubConfig.protocols,
                          modbus: {
                            ...hubConfig.protocols.modbus,
                            tcp: { ...hubConfig.protocols.modbus.tcp, host: e.target.value }
                          }
                        }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Modbus TCP Port</Label>
                    <Input
                      type="number"
                      value={hubConfig.protocols.modbus.tcp.port}
                      onChange={(e) => setHubConfig({
                        ...hubConfig,
                        protocols: {
                          ...hubConfig.protocols,
                          modbus: {
                            ...hubConfig.protocols.modbus,
                            tcp: { ...hubConfig.protocols.modbus.tcp, port: parseInt(e.target.value) }
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Hub Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Polling Interval (seconds)</Label>
                    <Input
                      type="number"
                      value={hubConfig.settings.pollingInterval}
                      onChange={(e) => setHubConfig({
                        ...hubConfig,
                        settings: { ...hubConfig.settings, pollingInterval: parseInt(e.target.value) }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Retention (days)</Label>
                    <Input
                      type="number"
                      value={hubConfig.settings.dataRetentionDays}
                      onChange={(e) => setHubConfig({
                        ...hubConfig,
                        settings: { ...hubConfig.settings, dataRetentionDays: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoDiscovery"
                    checked={hubConfig.settings.autoDiscovery}
                    onCheckedChange={(checked) => setHubConfig({
                      ...hubConfig,
                      settings: { ...hubConfig.settings, autoDiscovery: checked }
                    })}
                  />
                  <Label htmlFor="autoDiscovery">Enable Auto Discovery</Label>
                </div>
              </div>
            </div>

            <Button 
              onClick={initializeHub} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Initializing...' : 'Initialize IoT Hub'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Cpu className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">IoT Device Hub</h1>
            <p className="text-muted-foreground">
              Manage your IoT devices and protocols
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadDevices}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDevice(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Device Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.filter(d => d.status.online).length}
            </div>
            <Progress 
              value={devices.length ? (devices.filter(d => d.status.online).length / devices.length) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protocols</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(devices.map(d => d.protocol)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.filter(d => !d.status.online || d.status.errorCodes?.length).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="devices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="readings">Data & Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Device List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Device List</CardTitle>
                  <CardDescription>
                    Manage your connected IoT devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {devices.map((device) => (
                      <div
                        key={device.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedDevice?.id === device.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedDevice(device);
                          loadDeviceReadings(device.id);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(device)}
                            <div>
                              <h3 className="font-medium">{device.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {device.type} • {device.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getProtocolIcon(device.protocol)}
                            <Badge variant={device.status.online ? 'default' : 'secondary'}>
                              {device.status.online ? 'Online' : 'Offline'}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeDevice(device.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {device.lastReading && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Last reading: {device.lastReading.value} {device.lastReading.unit} 
                            ({new Date(device.lastReading.timestamp).toLocaleString()})
                          </div>
                        )}
                      </div>
                    ))}

                    {devices.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Cpu className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No devices connected yet</p>
                        <Button onClick={() => setShowAddDevice(true)} className="mt-2">
                          Add your first device
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Device Details */}
            <div>
              {selectedDevice ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(selectedDevice)}
                      {selectedDevice.name}
                    </CardTitle>
                    <CardDescription>{selectedDevice.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Protocol</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {getProtocolIcon(selectedDevice.protocol)}
                        <span className="capitalize">{selectedDevice.protocol}</span>
                      </div>
                    </div>

                    <div>
                      <Label>Location</Label>
                      <p className="mt-1">{selectedDevice.location}</p>
                    </div>

                    <div>
                      <Label>Status</Label>
                      <div className="mt-1 space-y-1">
                        <div className="flex justify-between">
                          <span>Online:</span>
                          <span>{selectedDevice.status.online ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Seen:</span>
                          <span>{new Date(selectedDevice.status.lastSeen).toLocaleString()}</span>
                        </div>
                        {selectedDevice.status.batteryLevel && (
                          <div className="flex justify-between">
                            <span>Battery:</span>
                            <span>{selectedDevice.status.batteryLevel}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Capabilities</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedDevice.capabilities.map((capability) => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Device Controls</Label>
                      {selectedDevice.type.includes('controller') && (
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => sendCommand(selectedDevice.id, 'start')}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => sendCommand(selectedDevice.id, 'stop')}
                          >
                            <StopCircle className="h-4 w-4 mr-2" />
                            Stop
                          </Button>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => sendCommand(selectedDevice.id, 'status')}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Get Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a device to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="readings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Device Data & Analytics
              </CardTitle>
              <CardDescription>
                View sensor readings and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDevice ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Readings for {selectedDevice.name}
                    </h3>
                    <Button onClick={() => loadDeviceReadings(selectedDevice.id)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  {readings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {readings.slice(-10).reverse().map((reading, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium capitalize">
                              {reading.sensorType.replace('_', ' ')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {reading.value} {reading.unit}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(reading.timestamp).toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No readings available for this device</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a device to view readings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Hub Settings</CardTitle>
              <CardDescription>
                Configure IoT hub behavior and protocols
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings panel would go here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Device Modal */}
      {showAddDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Device</CardTitle>
              <CardDescription>
                Register a new IoT device to the hub
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceId">Device ID</Label>
                  <Input
                    id="deviceId"
                    value={newDevice.id}
                    onChange={(e) => setNewDevice({ ...newDevice, id: e.target.value })}
                    placeholder="device_001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deviceName">Device Name</Label>
                  <Input
                    id="deviceName"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    placeholder="Climate Sensor #1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deviceType">Device Type</Label>
                  <Select 
                    value={newDevice.type} 
                    onValueChange={(value) => setNewDevice({ ...newDevice, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protocol">Protocol</Label>
                  <Select 
                    value={newDevice.protocol} 
                    onValueChange={(value) => setNewDevice({ ...newDevice, protocol: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      {protocols.map((protocol) => (
                        <SelectItem key={protocol.value} value={protocol.value}>
                          <div>
                            <div className="font-medium">{protocol.label}</div>
                            <div className="text-xs text-muted-foreground">{protocol.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newDevice.location}
                    onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                    placeholder="Greenhouse A, Zone 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deviceAddress">Device Address</Label>
                  <Input
                    id="deviceAddress"
                    value={newDevice.configuration.deviceAddress}
                    onChange={(e) => setNewDevice({ 
                      ...newDevice, 
                      configuration: { 
                        ...newDevice.configuration, 
                        deviceAddress: e.target.value 
                      }
                    })}
                    placeholder="192.168.1.100 or topic/path"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddDevice(false)}>
                  Cancel
                </Button>
                <Button onClick={addDevice} disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Device'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}