'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Wifi,
  Search,
  Settings,
  Check,
  X,
  AlertCircle,
  Loader2,
  ChevronRight,
  Copy,
  ExternalLink,
  Network,
  Zap
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export function DeviceOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<any[]>([]);
  const [networkConfig, setNetworkConfig] = useState({
    deviceIP: '',
    subnetMask: '255.255.255.0',
    gateway: '',
    hlpPort: '50001',
    useMulticast: true,
    multicastGroup: '239.255.255.250'
  });

  const steps: OnboardingStep[] = [
    {
      id: 'network',
      title: 'Network Configuration',
      description: 'Configure your network for HLP communication',
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'active' : 'pending'
    },
    {
      id: 'discovery',
      title: 'Device Discovery',
      description: 'Scan for HLP-compatible devices on your network',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending'
    },
    {
      id: 'assignment',
      title: 'Zone Assignment',
      description: 'Assign discovered devices to control zones',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending'
    },
    {
      id: 'testing',
      title: 'Test Connection',
      description: 'Verify device communication and control',
      status: currentStep === 3 ? 'active' : 'pending'
    }
  ];

  const handleNetworkSave = () => {
    // Validate network config
    if (!networkConfig.deviceIP || !networkConfig.gateway) {
      toast.error('Please fill in all required network fields');
      return;
    }
    
    // Save to backend
    toast.success('Network configuration saved');
    setCurrentStep(1);
  };

  const startDeviceDiscovery = async () => {
    setIsScanning(true);
    
    try {
      const response = await fetch('/api/v1/lighting/hlp/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover' })
      });

      if (response.ok) {
        toast.success('Discovery started. Devices will appear as they respond.');
        
        // Poll for devices
        let attempts = 0;
        const pollInterval = setInterval(async () => {
          const devicesResponse = await fetch('/api/v1/lighting/hlp/devices');
          const data = await devicesResponse.json();
          
          if (data.devices && data.devices.length > 0) {
            setDiscoveredDevices(data.devices);
            clearInterval(pollInterval);
            setIsScanning(false);
          }
          
          attempts++;
          if (attempts > 10) {
            clearInterval(pollInterval);
            setIsScanning(false);
            toast.error('No devices found. Check network configuration.');
          }
        }, 3000);
      }
    } catch (error) {
      toast.error('Discovery failed. Check network connection.');
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Device Setup Wizard</h2>
        <p className="text-muted-foreground">
          Connect your HLP-compatible lighting devices to VibeLux
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                step.status === 'active' ? 'bg-primary border-primary text-white' :
                'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                {step.status === 'completed' ? <Check className="h-5 w-5" /> : index + 1}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  step.status === 'active' ? 'text-primary' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="mx-4 text-gray-400" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Network Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Network className="h-4 w-4" />
              <AlertDescription>
                Your HLP devices must be on the same network as your VibeLux server.
                Ensure devices are connected via Ethernet for best reliability.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Device Network IP Range*</Label>
                <Input
                  placeholder="e.g., 192.168.1.100"
                  value={networkConfig.deviceIP}
                  onChange={(e) => setNetworkConfig({...networkConfig, deviceIP: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  IP address range where your devices are located
                </p>
              </div>

              <div className="space-y-2">
                <Label>Gateway IP*</Label>
                <Input
                  placeholder="e.g., 192.168.1.1"
                  value={networkConfig.gateway}
                  onChange={(e) => setNetworkConfig({...networkConfig, gateway: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>HLP Port</Label>
                <Input
                  value={networkConfig.hlpPort}
                  onChange={(e) => setNetworkConfig({...networkConfig, hlpPort: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Subnet Mask</Label>
                <Input
                  value={networkConfig.subnetMask}
                  onChange={(e) => setNetworkConfig({...networkConfig, subnetMask: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={networkConfig.useMulticast}
                onChange={(e) => setNetworkConfig({...networkConfig, useMulticast: e.target.checked})}
                className="rounded"
              />
              <Label>Enable multicast discovery (recommended)</Label>
            </div>

            <Button onClick={handleNetworkSave} className="w-full">
              Save Network Configuration
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Device Discovery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Wifi className="h-4 w-4" />
              <AlertDescription>
                Make sure your HLP devices are powered on and connected to the network.
                Discovery typically takes 10-30 seconds.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={startDeviceDiscovery} 
              disabled={isScanning}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning for devices...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Start Device Discovery
                </>
              )}
            </Button>

            {discoveredDevices.length > 0 && (
              <div className="space-y-2">
                <Label>Discovered Devices ({discoveredDevices.length})</Label>
                <div className="space-y-2">
                  {discoveredDevices.map((device) => (
                    <div key={device.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{device.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {device.manufacturer} {device.model} • {device.ipAddress}
                          </p>
                        </div>
                        <Badge variant="success">
                          <Check className="h-3 w-3 mr-1" />
                          Found
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => setCurrentStep(2)} 
                  className="w-full"
                >
                  Continue to Zone Assignment
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Zone Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Assign devices to zones created in the design phase. 
                You can reassign devices later from the control panel.
              </AlertDescription>
            </Alert>
            
            <p className="text-center text-muted-foreground py-8">
              Zone assignment interface would go here...
            </p>
            
            <Button onClick={() => setCurrentStep(3)} className="w-full">
              Continue to Testing
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Test your devices to ensure proper communication before starting production.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                <Zap className="mr-2 h-4 w-4" />
                Test All Devices (Flash 3 times)
              </Button>
              
              <Button variant="outline" className="w-full">
                Test Dimming (0-100-0%)
              </Button>
              
              <Button variant="outline" className="w-full">
                Test Spectrum Control
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Setup Complete!</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Your devices are ready for production control. You can now:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                <li>• Create and apply lighting schedules</li>
                <li>• Monitor device status in real-time</li>
                <li>• Set up safety limits and alerts</li>
                <li>• Export data for analysis</li>
              </ul>
              
              <Button className="w-full">
                Go to Control Center
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="network">
            <TabsList>
              <TabsTrigger value="network">Network Issues</TabsTrigger>
              <TabsTrigger value="devices">Device Issues</TabsTrigger>
              <TabsTrigger value="control">Control Issues</TabsTrigger>
            </TabsList>
            
            <TabsContent value="network" className="space-y-2">
              <div className="text-sm space-y-2">
                <p><strong>Devices not discovered:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Verify devices are on same subnet as VibeLux server</li>
                  <li>Check firewall allows UDP port 50000-50001</li>
                  <li>Ensure multicast is enabled on your network</li>
                  <li>Try manual IP entry if auto-discovery fails</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="devices" className="space-y-2">
              <div className="text-sm space-y-2">
                <p><strong>Device shows offline:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Check device power and Ethernet connection</li>
                  <li>Verify device firmware supports HLP v1.1.0</li>
                  <li>Try power cycling the device</li>
                  <li>Check device logs for error messages</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="control" className="space-y-2">
              <div className="text-sm space-y-2">
                <p><strong>Commands not working:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Ensure device is assigned to a zone</li>
                  <li>Check schedule is enabled and active</li>
                  <li>Verify safety limits aren\'t blocking commands</li>
                  <li>Review execution logs for errors</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}