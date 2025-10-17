'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HLPDeviceManager } from '@/components/lighting/HLPDeviceManager';
import { HLPZoneControl } from '@/components/lighting/HLPZoneControl';
import { AdvancedScheduleEditor } from '@/components/lighting/AdvancedScheduleEditor';
import { DeviceOnboarding } from '@/components/lighting/DeviceOnboarding';
import { exportFixturesToBLE } from '@/lib/export/ble-fixture-export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Map,
  Bluetooth,
  Zap,
  Activity,
  Layers,
  Settings,
  Download,
  Upload,
  ChevronRight,
  Info,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/client-logger';

export default function LightingControlPage() {
  const router = useRouter();
  const [hasDesign, setHasDesign] = useState(false);

  // Navigate to Zone Manager in Advanced Designer
  const openZoneManager = () => {
    router.push('/design/advanced?panel=nativeZoneManager');
  };

  // Export fixtures to BLE format
  const handleBLEExport = () => {
    // For now, we'll use sample data. In production, this would come from the design state
    const sampleFixtures = [
      { id: '1', x: 5, y: 5, z: 8, type: 'fixture', width: 2, length: 4, height: 0.5 },
      { id: '2', x: 15, y: 5, z: 8, type: 'fixture', width: 2, length: 4, height: 0.5 },
    ];
    const sampleRoom = { width: 20, length: 10, height: 10 };
    
    try {
      const bleData = exportFixturesToBLE(sampleFixtures, sampleRoom);
      const blob = new Blob([JSON.stringify(bleData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ble-fixtures.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('system', 'Error exporting BLE data:', error );
    }
  };

  // Start HLP Control
  const startHLPControl = () => {
    router.push('/design/advanced?panel=hlpZoneControl');
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Lighting Control System</h1>
        <p className="text-muted-foreground">
          Complete workflow from design to zone-based lighting control
        </p>
      </div>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  1
                </div>
                <h3 className="font-semibold">Design Layout</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-10">
                Create your facility layout and place fixtures
              </p>
              <Link href="/design/advanced" className="ml-10">
                <Button size="sm" variant="outline" className="w-full">
                  <Map className="h-4 w-4 mr-2" />
                  Open Designer
                </Button>
              </Link>
            </div>

            <ChevronRight className="hidden md:block self-center text-muted-foreground" />

            {/* Step 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center text-white font-semibold">
                  2
                </div>
                <h3 className="font-semibold">Create Zones</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-10">
                Define control zones and assign fixtures
              </p>
              <Button size="sm" variant="outline" className="w-full ml-10" onClick={openZoneManager}>
                <Layers className="h-4 w-4 mr-2" />
                Zone Manager
              </Button>
            </div>

            <ChevronRight className="hidden md:block self-center text-muted-foreground" />

            {/* Step 3 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/60 flex items-center justify-center text-white font-semibold">
                  3
                </div>
                <h3 className="font-semibold">Export Data</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-10">
                Export fixture positions for BLE/HLP
              </p>
              <Button size="sm" variant="outline" className="w-full ml-10" onClick={handleBLEExport}>
                <Download className="h-4 w-4 mr-2" />
                Export BLE
              </Button>
            </div>

            <ChevronRight className="hidden md:block self-center text-muted-foreground" />

            {/* Step 4 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center text-white font-semibold">
                  4
                </div>
                <h3 className="font-semibold">Control Lights</h3>
              </div>
              <p className="text-sm text-muted-foreground ml-10">
                Apply recipes and control via HLP
              </p>
              <Button size="sm" variant="outline" className="w-full ml-10" onClick={startHLPControl}>
                <Zap className="h-4 w-4 mr-2" />
                Start Control
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Complete Integration:</strong> Design your layout, create zones visually, 
          export fixture positions for BLE mesh positioning, and control lights via HLP protocol. 
          The system maintains exact fixture positions from design through to control.
        </AlertDescription>
      </Alert>

      {/* Control Interface */}
      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="setup">
            <Settings className="h-4 w-4 mr-2" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="devices">
            <Bluetooth className="h-4 w-4 mr-2" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="zones">
            <Map className="h-4 w-4 mr-2" />
            Zones
          </TabsTrigger>
          <TabsTrigger value="schedules">
            <Clock className="h-4 w-4 mr-2" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Activity className="h-4 w-4 mr-2" />
            Monitor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <DeviceOnboarding />
        </TabsContent>

        <TabsContent value="devices">
          <HLPDeviceManager />
        </TabsContent>

        <TabsContent value="zones">
          <HLPZoneControl />
        </TabsContent>

        <TabsContent value="schedules">
          <AdvancedScheduleEditor />
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>System Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Zone Status Overview */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">Active Zones</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">Connected Devices</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">0W</div>
                      <p className="text-xs text-muted-foreground">Total Power</p>
                    </CardContent>
                  </Card>
                </div>

                {/* BLE Export Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">BLE Mesh Export</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export fixture positions from your design for Bluetooth Low Energy mesh positioning systems.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Precise X, Y, Z coordinates in both feet and meters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Zone boundaries and fixture assignments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Signal characteristics for positioning algorithms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Mesh topology based on fixture distances</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">BLE Export Format</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{
  "fixtures": [{
    "id": "fixture_123",
    "position": { "x": 10.5, "y": 15.2, "z": 8.0 },
    "positionMeters": { "x": 3.2, "y": 4.6, "z": 2.4 },
    "signalCharacteristics": {
      "estimatedRSSI": -59,
      "antennaGain": 2.1,
      "transmitPower": 0
    }
  }],
  "meshConfig": {
    "beaconInterval": 100,
    "txPower": 0,
    "meshProtocol": "bluetooth-mesh-v1.0"
  }
}`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">HLP Control Command</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`// Apply spectrum to zone
POST /api/v1/lighting/hlp/control
{
  "command": "setSpectrum",
  "zoneId": "zone-1",
  "data": {
    "spectrum": {
      "RED": 60,
      "BLUE": 30,
      "FAR_RED": 10
    },
    "rampTime": 5,
    "maintainPPFD": true
  }
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}