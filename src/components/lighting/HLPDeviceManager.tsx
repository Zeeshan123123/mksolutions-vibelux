'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { logger } from '@/lib/client-logger';
import { 
  Wifi, 
  WifiOff, 
  Search, 
  Settings, 
  Zap,
  Activity,
  AlertCircle,
  RefreshCw,
  Map,
  Sun,
  Palette
} from 'lucide-react';

interface HLPDevice {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  status: 'online' | 'offline' | 'error';
  ipAddress: string;
  zoneId?: string;
  capabilities: {
    maxChannels: number;
    supportedChannelTypes: string[];
    supportsDimming: boolean;
    supportsScheduling: boolean;
  };
  currentStatus?: {
    totalPower: number;
    averageIntensity: number;
    temperature?: number;
  };
}

interface Zone {
  id: string;
  name: string;
}

export function HLPDeviceManager() {
  const [devices, setDevices] = useState<HLPDevice[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<HLPDevice | null>(null);
  const [loading, setLoading] = useState(true);

  // Control states
  const [intensity, setIntensity] = useState(50);
  const [spectrum, setSpectrum] = useState({
    RED: 30,
    BLUE: 40,
    GREEN: 10,
    FAR_RED: 15,
    UV: 5
  });

  useEffect(() => {
    loadDevices();
    loadZones();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await fetch('/api/v1/lighting/hlp/devices');
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (error) {
      logger.error('system', 'Error loading devices:', error );
      toast.error('Failed to load HLP devices');
    } finally {
      setLoading(false);
    }
  };

  const loadZones = async () => {
    try {
      const response = await fetch('/api/v1/zones');
      const data = await response.json();
      setZones(data.zones || []);
    } catch (error) {
      logger.error('system', 'Error loading zones:', error );
    }
  };

  const discoverDevices = async () => {
    setIsDiscovering(true);
    try {
      const response = await fetch('/api/v1/lighting/hlp/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover' })
      });

      if (response.ok) {
        toast.success('Discovery initiated. Devices will appear as they respond.');
        // Reload devices after a delay
        setTimeout(() => loadDevices(), 5000);
      }
    } catch (error) {
      toast.error('Failed to start discovery');
    } finally {
      setIsDiscovering(false);
    }
  };

  const mapDeviceToZone = async (deviceId: string, zoneId: string) => {
    try {
      const response = await fetch('/api/v1/lighting/hlp/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'mapToZone',
          deviceId,
          zoneId
        })
      });

      if (response.ok) {
        toast.success('Device mapped to zone');
        loadDevices();
      }
    } catch (error) {
      toast.error('Failed to map device to zone');
    }
  };

  const setDeviceIntensity = async (deviceId: string, intensity: number) => {
    try {
      const response = await fetch('/api/v1/lighting/hlp/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: 'setIntensity',
          deviceId,
          data: { intensity, rampTime: 2 }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Intensity updated');
      } else {
        toast.error('Failed to update intensity');
      }
    } catch (error) {
      toast.error('Control command failed');
    }
  };

  const setDeviceSpectrum = async (deviceId: string) => {
    try {
      const response = await fetch('/api/v1/lighting/hlp/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: 'setSpectrum',
          deviceId,
          data: { 
            spectrum,
            rampTime: 5,
            maintainPPFD: true
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Spectrum updated');
      } else {
        toast.error('Failed to update spectrum');
      }
    } catch (error) {
      toast.error('Control command failed');
    }
  };

  const getDeviceStatus = async (deviceId: string) => {
    try {
      const response = await fetch('/api/v1/lighting/hlp/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: 'getStatus',
          deviceId
        })
      });

      const result = await response.json();
      if (result.success && result.result) {
        // Update device status in state
        setDevices(prev => prev.map(d => 
          d.id === deviceId 
            ? { ...d, currentStatus: result.result }
            : d
        ));
      }
    } catch (error) {
      logger.error('system', 'Failed to get device status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">HLP Device Manager</h2>
          <p className="text-muted-foreground">
            Manage and control HLP-compatible lighting devices
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => window.open('/advanced-fixture-layout', '_blank')}
            variant="outline"
            className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
          >
            <Map className="mr-2 h-4 w-4" />
            Layout Designer
          </Button>
          <Button
            onClick={loadDevices}
            variant="outline"
            size="icon"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={discoverDevices}
            disabled={isDiscovering}
          >
            <Search className="mr-2 h-4 w-4" />
            {isDiscovering ? 'Discovering...' : 'Discover Devices'}
          </Button>
        </div>
      </div>

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle>Discovered Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading devices...
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8">
              <WifiOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No HLP devices found. Click "Discover Devices" to search.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {devices.map((device) => (
                <Card 
                  key={device.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedDevice(device)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{device.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {device.manufacturer} {device.model}
                        </p>
                      </div>
                      <Badge variant={
                        device.status === 'online' ? 'success' : 
                        device.status === 'error' ? 'destructive' : 'secondary'
                      }>
                        {device.status === 'online' ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                        {device.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IP:</span>
                        <span>{device.ipAddress}</span>
                      </div>
                      {device.zoneId && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Zone:</span>
                          <span>{zones.find(z => z.id === device.zoneId)?.name || device.zoneId}</span>
                        </div>
                      )}
                      {device.currentStatus && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Power:</span>
                            <span>{device.currentStatus.totalPower}W</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Intensity:</span>
                            <span>{device.currentStatus.averageIntensity}%</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          getDeviceStatus(device.id);
                        }}
                      >
                        <Activity className="h-3 w-3" />
                      </Button>
                      {!device.zoneId && (
                        <Select
                          onValueChange={(value) => {
                            mapDeviceToZone(device.id, value);
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Assign to zone" />
                          </SelectTrigger>
                          <SelectContent>
                            {zones.map((zone) => (
                              <SelectItem key={zone.id} value={zone.id}>
                                {zone.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Control Panel */}
      {selectedDevice && (
        <Card>
          <CardHeader>
            <CardTitle>
              Control Panel - {selectedDevice.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="intensity">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="intensity">
                  <Sun className="h-4 w-4 mr-2" />
                  Intensity
                </TabsTrigger>
                <TabsTrigger value="spectrum">
                  <Palette className="h-4 w-4 mr-2" />
                  Spectrum
                </TabsTrigger>
                <TabsTrigger value="info">
                  <Settings className="h-4 w-4 mr-2" />
                  Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="intensity" className="space-y-4">
                <div className="space-y-2">
                  <Label>Light Intensity</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[intensity]}
                      onValueChange={([value]) => setIntensity(value)}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{intensity}%</span>
                  </div>
                </div>
                <Button
                  onClick={() => setDeviceIntensity(selectedDevice.id, intensity)}
                  className="w-full"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Apply Intensity
                </Button>
              </TabsContent>

              <TabsContent value="spectrum" className="space-y-4">
                {Object.entries(spectrum).map(([channel, value]) => (
                  <div key={channel} className="space-y-2">
                    <Label>{channel.replace('_', ' ')}</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[value]}
                        onValueChange={([newValue]) => 
                          setSpectrum(prev => ({ ...prev, [channel]: newValue }))
                        }
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-right">{value}%</span>
                    </div>
                  </div>
                ))}
                <Button
                  onClick={() => setDeviceSpectrum(selectedDevice.id)}
                  className="w-full"
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Apply Spectrum
                </Button>
              </TabsContent>

              <TabsContent value="info" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Device ID:</span>
                    <span className="font-mono">{selectedDevice.id}</span>
                    
                    <span className="text-muted-foreground">IP Address:</span>
                    <span>{selectedDevice.ipAddress}</span>
                    
                    <span className="text-muted-foreground">Channels:</span>
                    <span>{selectedDevice.capabilities.maxChannels}</span>
                    
                    <span className="text-muted-foreground">Dimming:</span>
                    <span>{selectedDevice.capabilities.supportsDimming ? 'Yes' : 'No'}</span>
                    
                    <span className="text-muted-foreground">Scheduling:</span>
                    <span>{selectedDevice.capabilities.supportsScheduling ? 'Yes' : 'No'}</span>
                  </div>
                  
                  <div>
                    <Label>Supported Channels</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedDevice.capabilities.supportedChannelTypes.map((type) => (
                        <Badge key={type} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}