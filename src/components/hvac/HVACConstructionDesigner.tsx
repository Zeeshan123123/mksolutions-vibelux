'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wind,
  Gauge,
  Droplets,
  Thermometer,
  Zap,
  Settings,
  FileText,
  Download,
  Calculator,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Layers,
  GitBranch,
  Activity,
  ClipboardList
} from 'lucide-react';
import {
  HVACConstructionDesigner as HVACDesigner,
  type HVACDesignSystem,
  type AirHandlerUnit,
  type DuctSection,
  type PipingCircuit
} from '@/lib/hvac/hvac-construction-designer';

interface HVACConstructionDesignerProps {
  facilityType?: 'greenhouse' | 'indoor-farm' | 'processing' | 'hybrid';
  spaceArea?: number;
  spaceHeight?: number;
  onExport?: (data: any) => void;
}

export default function HVACConstructionDesigner({
  facilityType = 'greenhouse',
  spaceArea = 10000,
  spaceHeight = 20,
  onExport
}: HVACConstructionDesignerProps) {
  // Design conditions based on climate zone
  const [climateZone, setClimateZone] = useState('4A'); // Default to mixed-humid
  const [systemType, setSystemType] = useState<HVACDesignSystem['systemType']>('split');
  
  // Load calculations
  const [coolingLoad, setCoolingLoad] = useState(0);
  const [heatingLoad, setHeatingLoad] = useState(0);
  const [ventilationCFM, setVentilationCFM] = useState(0);
  const [latentLoad, setLatentLoad] = useState(0);
  
  // Equipment sizing
  const [selectedEquipment, setSelectedEquipment] = useState<{
    airHandlers: AirHandlerUnit[];
    ductwork: DuctSection[];
    piping: PipingCircuit | null;
  }>({
    airHandlers: [],
    ductwork: [],
    piping: null
  });

  // Create HVAC system configuration
  const hvacSystem = useMemo<HVACDesignSystem>(() => ({
    projectId: `HVAC-${Date.now()}`,
    facilityType,
    systemType,
    zoningStrategy: facilityType === 'greenhouse' ? 'multi-zone' : 'single-zone',
    designConditions: {
      outdoor: {
        summerDB: getClimateData(climateZone).summerDB,
        summerWB: getClimateData(climateZone).summerWB,
        winterDB: getClimateData(climateZone).winterDB,
        altitude: 0
      },
      indoor: {
        summerDB: facilityType === 'greenhouse' ? 78 : 72,
        summerRH: facilityType === 'greenhouse' ? 70 : 50,
        winterDB: facilityType === 'greenhouse' ? 65 : 68,
        winterRH: facilityType === 'greenhouse' ? 60 : 40,
        airChangesPerHour: facilityType === 'greenhouse' ? 0.5 : 6
      }
    },
    equipment: {
      airHandlers: selectedEquipment.airHandlers,
      chillers: [],
      boilers: [],
      fans: [],
      pumps: [],
      terminals: []
    },
    ductwork: {
      material: 'galvanized',
      insulation: {
        type: 'external',
        thickness: 1.5,
        rValue: 6
      },
      mains: selectedEquipment.ductwork,
      branches: [],
      diffusers: [],
      grilles: [],
      dampers: [],
      accessories: [],
      pressureAnalysis: {
        criticalPath: [],
        totalStaticPressure: 0,
        frictionRate: 0.08
      }
    },
    piping: {
      chilledWater: selectedEquipment.piping || undefined,
      insulation: {
        type: 'fiberglass',
        thickness: 1,
        vaporBarrier: true
      }
    },
    controls: {
      type: 'ddc',
      manufacturer: 'Basis of Design',
      sensors: [],
      actuators: [],
      controllers: [],
      protocol: 'bacnet',
      webAccess: true,
      trending: true,
      alarms: true
    }
  }), [facilityType, systemType, climateZone, selectedEquipment]);

  const designer = useMemo(() => new HVACDesigner(hvacSystem), [hvacSystem]);

  // Calculate loads when inputs change
  useEffect(() => {
    calculateLoads();
  }, [spaceArea, spaceHeight, climateZone, facilityType]);

  const calculateLoads = () => {
    // Simplified load calculations
    const volume = spaceArea * spaceHeight;
    
    // Cooling loads (BTU/hr)
    let sensibleCooling = 0;
    let latentCooling = 0;
    
    if (facilityType === 'greenhouse') {
      // Greenhouse loads
      sensibleCooling = spaceArea * 150; // 150 BTU/sf for greenhouse
      latentCooling = spaceArea * 50; // High latent from plants
    } else {
      // Indoor farm loads
      sensibleCooling = spaceArea * 100; // LED heat load
      latentCooling = spaceArea * 30; // Plant transpiration
    }
    
    // Heating loads
    const heatingLoad = spaceArea * 60; // 60 BTU/sf
    
    // Ventilation
    const ventCFM = volume * hvacSystem.designConditions.indoor.airChangesPerHour / 60;
    
    setCoolingLoad(Math.round((sensibleCooling + latentCooling) / 12000)); // Convert to tons
    setHeatingLoad(Math.round(heatingLoad / 1000)); // Convert to MBH
    setVentilationCFM(Math.round(ventCFM));
    setLatentLoad(Math.round(latentCooling / 12000));
  };

  const generateEquipment = () => {
    // Size air handler
    const totalCFM = Math.max(
      coolingLoad * 400, // 400 CFM/ton
      ventilationCFM
    );
    
    const ahu: AirHandlerUnit = {
      id: 'AHU-1',
      tag: 'AHU-1',
      location: { x: 0, y: 0, z: 0 },
      cfm: totalCFM,
      coolingCapacity: coolingLoad,
      heatingCapacity: heatingLoad,
      components: {
        supplyFan: {
          type: 'centrifugal',
          hp: Math.ceil(totalCFM * 1.5 / 6356), // Fan law calculation
          staticPressure: 3.0, // inches w.c.
          efficiency: 0.75
        },
        cooling: {
          type: systemType === 'split' ? 'dx' : 'chilled-water',
          stages: 2,
          capacity: coolingLoad
        },
        heating: {
          type: 'hot-water',
          stages: 1,
          capacity: heatingLoad
        },
        filters: {
          preFilter: 'MERV 8',
          finalFilter: facilityType === 'greenhouse' ? 'MERV 11' : 'MERV 13'
        },
        economizer: true,
        energyRecovery: facilityType === 'indoor-farm' ? {
          type: 'wheel',
          effectiveness: 0.75
        } : undefined
      },
      electrical: {
        voltage: 460,
        phase: 3,
        mca: Math.round(coolingLoad * 7), // Rough estimate
        mop: Math.round(coolingLoad * 8)
      },
      dimensions: {
        length: Math.ceil(totalCFM / 2000) * 3,
        width: 6,
        height: 6,
        weight: totalCFM * 0.5
      },
      connections: {
        ductwork: {
          supply: {
            size: designer.sizeDuctwork(totalCFM).dimensions,
            location: 'side',
            offset: { x: 0, y: 0 }
          },
          return: {
            size: designer.sizeDuctwork(totalCFM * 0.9).dimensions,
            location: 'bottom',
            offset: { x: 0, y: 0 }
          }
        },
        piping: systemType !== 'split' ? {
          chilledWaterSupply: {
            size: designer.sizePipe(coolingLoad * 24), // 24 gpm/ton
            type: 'grooved',
            location: { x: 0, y: 0, z: 0 }
          },
          chilledWaterReturn: {
            size: designer.sizePipe(coolingLoad * 24),
            type: 'grooved',
            location: { x: 0, y: 0, z: 0 }
          },
          condensateDrain: {
            size: 1,
            type: 'threaded',
            location: { x: 0, y: 0, z: 0 }
          }
        } : {
          condensateDrain: {
            size: 1,
            type: 'threaded',
            location: { x: 0, y: 0, z: 0 }
          }
        }
      }
    };
    
    // Size main ductwork
    const mainDuct = designer.sizeDuctwork(totalCFM, 1200);
    
    // Create piping if needed
    let pipingCircuit = null;
    if (systemType === 'all-water' || systemType === 'air-water') {
      pipingCircuit = {
        fluid: 'water' as const,
        flowRate: coolingLoad * 24,
        supplyTemp: 45,
        returnTemp: 55,
        designPressure: 125,
        mains: [{
          id: 'CHW-1',
          tag: 'CHW-1',
          nominalSize: designer.sizePipe(coolingLoad * 24),
          material: 'steel' as const,
          schedule: '40' as const,
          flowRate: coolingLoad * 24,
          velocity: 6,
          startPoint: { x: 0, y: 0, z: 0 },
          endPoint: { x: 100, y: 0, z: 0 },
          fittings: [],
          frictionLoss: 2.5,
          totalPressureDrop: 10
        }],
        branches: [],
        valves: [],
        specialties: [],
        pumpHead: 75,
        pressureDrop: 25,
        criticalPath: ['CHW-1']
      };
    }
    
    setSelectedEquipment({
      airHandlers: [ahu],
      ductwork: [mainDuct],
      piping: pipingCircuit
    });
  };

  const exportToCAD = () => {
    const exportData = {
      system: hvacSystem,
      calculations: {
        coolingLoad,
        heatingLoad,
        ventilationCFM,
        latentLoad
      },
      equipment: selectedEquipment,
      schedule: designer.generateEquipmentSchedule(),
      sequence: designer.generateControlSequence()
    };
    
    onExport?.(exportData);
    
    // In production, this would generate actual CAD files
    console.log('Exporting HVAC design to CAD:', exportData);
  };

  const getClimateData = (zone: string) => {
    const climateData: Record<string, any> = {
      '1A': { summerDB: 90, summerWB: 78, winterDB: 60 }, // Very Hot-Humid
      '2A': { summerDB: 92, summerWB: 77, winterDB: 40 }, // Hot-Humid
      '3A': { summerDB: 93, summerWB: 76, winterDB: 25 }, // Warm-Humid
      '4A': { summerDB: 89, summerWB: 75, winterDB: 15 }, // Mixed-Humid
      '5A': { summerDB: 87, summerWB: 73, winterDB: 5 },  // Cool-Humid
      '6A': { summerDB: 84, summerWB: 71, winterDB: -5 }, // Cold-Humid
      '7': { summerDB: 81, summerWB: 68, winterDB: -15 }, // Very Cold
      '8': { summerDB: 75, summerWB: 64, winterDB: -30 }  // Subarctic
    };
    
    return climateData[zone] || climateData['4A'];
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          HVAC Construction Designer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Professional HVAC system design with complete construction documentation
        </p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Set project parameters and design conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="climate-zone">Climate Zone</Label>
              <Select value={climateZone} onValueChange={setClimateZone}>
                <SelectTrigger id="climate-zone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1A">1A - Very Hot-Humid</SelectItem>
                  <SelectItem value="2A">2A - Hot-Humid</SelectItem>
                  <SelectItem value="3A">3A - Warm-Humid</SelectItem>
                  <SelectItem value="4A">4A - Mixed-Humid</SelectItem>
                  <SelectItem value="5A">5A - Cool-Humid</SelectItem>
                  <SelectItem value="6A">6A - Cold-Humid</SelectItem>
                  <SelectItem value="7">7 - Very Cold</SelectItem>
                  <SelectItem value="8">8 - Subarctic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="system-type">System Type</Label>
              <Select value={systemType} onValueChange={(v) => setSystemType(v as any)}>
                <SelectTrigger id="system-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="split">Split DX System</SelectItem>
                  <SelectItem value="packaged">Packaged Unit</SelectItem>
                  <SelectItem value="vrf">VRF System</SelectItem>
                  <SelectItem value="all-air">All-Air VAV</SelectItem>
                  <SelectItem value="air-water">Air-Water System</SelectItem>
                  <SelectItem value="all-water">All-Water System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="area">Space Area (ft²)</Label>
              <Input
                id="area"
                type="number"
                value={spaceArea}
                onChange={(e) => e.target.value}
                disabled
              />
            </div>

            <div>
              <Label htmlFor="height">Space Height (ft)</Label>
              <Input
                id="height"
                type="number"
                value={spaceHeight}
                onChange={(e) => e.target.value}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Load Calculations */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Thermometer className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cooling Load
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {coolingLoad} tons
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Thermometer className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Heating Load
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {heatingLoad} MBH
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Wind className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ventilation
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ventilationCFM.toLocaleString()} CFM
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Droplets className="h-8 w-8 text-cyan-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Latent Load
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {latentLoad} tons
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="equipment" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="ductwork">Ductwork</TabsTrigger>
          <TabsTrigger value="piping">Piping</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Equipment Tab */}
        <TabsContent value="equipment">
          <div className="space-y-4">
            {selectedEquipment.airHandlers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No equipment selected yet. Generate equipment based on load calculations.
                  </p>
                  <Button onClick={generateEquipment}>
                    <Wrench className="h-4 w-4 mr-2" />
                    Generate Equipment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {selectedEquipment.airHandlers.map((ahu) => (
                  <Card key={ahu.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Air Handler Unit - {ahu.tag}</span>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sized
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-600 dark:text-gray-400">Airflow</p>
                          <p className="text-lg font-bold">{ahu.cfm.toLocaleString()} CFM</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600 dark:text-gray-400">Cooling</p>
                          <p className="text-lg font-bold">{ahu.coolingCapacity} tons</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600 dark:text-gray-400">Heating</p>
                          <p className="text-lg font-bold">{ahu.heatingCapacity} MBH</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600 dark:text-gray-400">Power</p>
                          <p className="text-lg font-bold">{ahu.electrical.voltage}V-{ahu.electrical.phase}PH</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Components</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            Supply Fan: {ahu.components.supplyFan.hp} HP
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            Filters: {ahu.components.filters.finalFilter}
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            Cooling: {ahu.components.cooling.type.toUpperCase()}
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            Economizer: {ahu.components.economizer ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        {/* Ductwork Tab */}
        <TabsContent value="ductwork">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitBranch className="h-5 w-5 mr-2" />
                Ductwork Design
              </CardTitle>
              <CardDescription>
                Duct sizing and layout based on equal friction method
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEquipment.ductwork.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Material</p>
                        <p className="font-bold">{hvacSystem.ductwork.material.toUpperCase()}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Insulation</p>
                        <p className="font-bold">R-{hvacSystem.ductwork.insulation.rValue}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Friction Rate</p>
                        <p className="font-bold">0.08" w.c./100ft</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Main Supply Duct</h4>
                    {selectedEquipment.ductwork.map((duct, index) => (
                      <div key={duct.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">Section {index + 1}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {duct.cfm.toLocaleString()} CFM @ {Math.round(duct.velocity)} FPM
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            {duct.dimensions.width}" × {duct.dimensions.height}"
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Generate equipment first to size ductwork
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Piping Tab */}
        <TabsContent value="piping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Piping Design
              </CardTitle>
              <CardDescription>
                Hydronic piping layout and sizing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEquipment.piping ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Flow Rate</p>
                      <p className="font-bold">{selectedEquipment.piping.flowRate} GPM</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Supply Temp</p>
                      <p className="font-bold">{selectedEquipment.piping.supplyTemp}°F</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Return Temp</p>
                      <p className="font-bold">{selectedEquipment.piping.returnTemp}°F</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pump Head</p>
                      <p className="font-bold">{selectedEquipment.piping.pumpHead} ft</p>
                    </div>
                  </div>
                  
                  <Alert>
                    <Gauge className="h-4 w-4" />
                    <AlertDescription>
                      Pipe sizes calculated for maximum velocity of 8 fps to minimize noise
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {systemType === 'split' ? 
                      'No piping required for DX system' : 
                      'Generate equipment first to size piping'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Control System
              </CardTitle>
              <CardDescription>
                DDC controls and sequence of operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Control Type</p>
                    <p className="font-bold">Direct Digital Control (DDC)</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Protocol</p>
                    <p className="font-bold">BACnet IP</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Control Points</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Space Temperature Sensors
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Space Humidity Sensors
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Supply Air Temperature Control
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Economizer Control
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      VFD Fan Speed Control
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigator.clipboard.writeText(designer.generateControlSequence())}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Sequence of Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete control sequence documentation for contractor installation
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Equipment Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete equipment schedule for drawings and specifications
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button size="lg" onClick={exportToCAD} disabled={selectedEquipment.airHandlers.length === 0}>
              <Download className="h-5 w-5 mr-2" />
              Export Complete HVAC Design Package
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}