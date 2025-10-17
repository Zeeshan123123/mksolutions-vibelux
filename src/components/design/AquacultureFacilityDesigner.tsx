'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Fish, 
  Upload, 
  Download,
  Settings,
  Calculator,
  GitBranch,
  Package,
  FileText,
  CheckCircle,
  AlertCircle,
  Layers,
  Gauge
} from 'lucide-react';
import AquacultureDesigner3D from './AquacultureDesigner3D';
import AquacultureCalculator from '../calculators/AquacultureCalculator';
import { designHydraulicSystem, exportToCAD } from '@/lib/aquaculture/piping-system';

interface DesignStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'pending' | 'active' | 'completed';
}

const designSteps: DesignStep[] = [
  {
    id: 'import',
    title: 'Import Building',
    description: 'Load CAD file of existing building or greenhouse',
    icon: Upload,
    status: 'completed'
  },
  {
    id: 'tanks',
    title: 'Place Tanks',
    description: 'Position tanks and equipment in 3D space',
    icon: Fish,
    status: 'active'
  },
  {
    id: 'piping',
    title: 'Design Piping',
    description: 'Auto-route pipes with proper sizing',
    icon: GitBranch,
    status: 'pending'
  },
  {
    id: 'equipment',
    title: 'Size Equipment',
    description: 'Calculate pumps, filters, and treatment systems',
    icon: Settings,
    status: 'pending'
  },
  {
    id: 'analysis',
    title: 'Analyze System',
    description: 'Verify hydraulics and performance',
    icon: Calculator,
    status: 'pending'
  },
  {
    id: 'export',
    title: 'Export Design',
    description: 'Generate CAD files and reports',
    icon: Download,
    status: 'pending'
  }
];

interface SystemMetrics {
  totalVolume: number;
  biomassCapacity: number;
  flowRate: number;
  powerRequirement: number;
  waterExchange: number;
  estimatedCost: number;
}

export default function AquacultureFacilityDesigner() {
  const [currentStep, setCurrentStep] = useState('tanks');
  const [buildingLoaded, setBuildingLoaded] = useState(true); // Simulated as loaded
  const [systemDesigned, setSystemDesigned] = useState(false);
  const [activeTab, setActiveTab] = useState('3d');
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalVolume: 201.2,
    biomassCapacity: 6036,
    flowRate: 300,
    powerRequirement: 45,
    waterExchange: 15.1,
    estimatedCost: 125000
  });

  const [billOfMaterials, setBillOfMaterials] = useState([
    { item: 'Circular Tanks (4m x 4m)', quantity: 4, unit: 'units', unitCost: 8500, total: 34000 },
    { item: 'Drum Filter (300 m³/hr)', quantity: 1, unit: 'unit', unitCost: 12000, total: 12000 },
    { item: 'Moving Bed Biofilter', quantity: 1, unit: 'unit', unitCost: 18000, total: 18000 },
    { item: 'Oxygen Cone', quantity: 1, unit: 'unit', unitCost: 8000, total: 8000 },
    { item: 'PVC Pipe (200mm)', quantity: 120, unit: 'm', unitCost: 45, total: 5400 },
    { item: 'PVC Pipe (100mm)', quantity: 80, unit: 'm', unitCost: 22, total: 1760 },
    { item: 'Centrifugal Pump (45kW)', quantity: 2, unit: 'units', unitCost: 6500, total: 13000 },
    { item: 'Butterfly Valves', quantity: 8, unit: 'units', unitCost: 450, total: 3600 },
    { item: 'Control System', quantity: 1, unit: 'set', unitCost: 15000, total: 15000 },
    { item: 'Installation & Labor', quantity: 1, unit: 'lot', unitCost: 14240, total: 14240 }
  ]);

  const handleDesignSystem = useCallback(() => {
    // Simulate system design
    setSystemDesigned(true);
    
    // Update design steps
    const steps = [...designSteps];
    steps[2].status = 'completed';
    steps[3].status = 'completed';
    steps[4].status = 'active';
  }, []);

  const handleExportCAD = useCallback(() => {
    // Generate and download CAD file
    const cadData = exportToCAD({
      routes: [],
      pumps: [],
      valves: [],
      manifolds: [],
      totalFlowRate: metrics.flowRate,
      systemPressure: 3.5
    });
    
    const blob = new Blob([cadData], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aquaculture-system-design.dxf';
    a.click();
    URL.revokeObjectURL(url);
  }, [metrics]);

  const handleExportReport = useCallback(() => {
    // Generate PDF report
    alert('Generating comprehensive design report...');
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Aquaculture Facility Designer</h1>
          <p className="text-muted-foreground">
            Design complete RAS and aquaponics systems with automated pipe routing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCAD}>
            <Download className="h-4 w-4 mr-2" />
            Export CAD
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Design Steps Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Design Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {designSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${step.status === 'completed' ? 'bg-green-500 text-white' :
                        step.status === 'active' ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-500'}
                    `}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <span className="text-xs mt-2 text-center max-w-[80px]">
                      {step.title}
                    </span>
                  </div>
                  {index < designSteps.length - 1 && (
                    <div className={`
                      h-1 w-24 mx-2
                      ${designSteps[index + 1].status !== 'pending' ? 'bg-blue-500' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Design Area */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="3d">3D Design</TabsTrigger>
          <TabsTrigger value="calculator">System Calculator</TabsTrigger>
          <TabsTrigger value="piping">Piping Analysis</TabsTrigger>
          <TabsTrigger value="bom">Bill of Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="3d" className="space-y-4">
          <AquacultureDesigner3D />
          
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button onClick={handleDesignSystem} disabled={systemDesigned}>
              <GitBranch className="h-4 w-4 mr-2" />
              Auto-Route Piping
            </Button>
            <Button variant="outline">
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Hydraulics
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Size Equipment
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="calculator">
          <AquacultureCalculator />
        </TabsContent>

        <TabsContent value="piping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hydraulic Analysis</CardTitle>
              <CardDescription>
                System hydraulics and pump requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Flow Distribution Diagram */}
              <div className="space-y-4">
                <h3 className="font-semibold">Flow Distribution</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Main Supply Line</span>
                      <Badge>300 m³/hr</Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tank 1 Branch</span>
                      <Badge variant="secondary">75 m³/hr</Badge>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tank 2 Branch</span>
                      <Badge variant="secondary">75 m³/hr</Badge>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tank 3 Branch</span>
                      <Badge variant="secondary">75 m³/hr</Badge>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tank 4 Branch</span>
                      <Badge variant="secondary">75 m³/hr</Badge>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Pump Sizing */}
              <div className="space-y-4">
                <h3 className="font-semibold">Pump Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Main Circulation Pump</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Flow Rate:</span>
                        <span>300 m³/hr</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Head:</span>
                        <span>12.5 m</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Power:</span>
                        <span>22 kW</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Efficiency:</span>
                        <span>75%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Backup Pump</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Flow Rate:</span>
                        <span>300 m³/hr</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Head:</span>
                        <span>12.5 m</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Power:</span>
                        <span>22 kW</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="secondary">Standby</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Head Loss Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold">Head Loss Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pipe friction losses</span>
                    <span>4.2 m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fitting losses (elbows, tees)</span>
                    <span>2.8 m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Equipment losses (filters)</span>
                    <span>3.5 m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Static head</span>
                    <span>2.0 m</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                    <span>Total System Head</span>
                    <span>12.5 m</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bill of Materials</CardTitle>
              <CardDescription>
                Complete equipment and material list with pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">Item</th>
                        <th className="text-right p-3">Quantity</th>
                        <th className="text-right p-3">Unit</th>
                        <th className="text-right p-3">Unit Cost</th>
                        <th className="text-right p-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billOfMaterials.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">{item.item}</td>
                          <td className="text-right p-3">{item.quantity}</td>
                          <td className="text-right p-3">{item.unit}</td>
                          <td className="text-right p-3">${item.unitCost.toLocaleString()}</td>
                          <td className="text-right p-3 font-medium">
                            ${item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="text-right p-3 font-semibold">
                          Total Project Cost
                        </td>
                        <td className="text-right p-3 font-bold text-lg">
                          ${billOfMaterials.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Prices are estimates based on typical market rates. Contact suppliers for current pricing and availability.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-2xl font-bold">{metrics.totalVolume.toFixed(1)} m³</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Biomass Capacity</p>
              <p className="text-2xl font-bold">{metrics.biomassCapacity.toLocaleString()} kg</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Flow Rate</p>
              <p className="text-2xl font-bold">{metrics.flowRate} m³/hr</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Power Required</p>
              <p className="text-2xl font-bold">{metrics.powerRequirement} kW</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Water Exchange</p>
              <p className="text-2xl font-bold">{metrics.waterExchange.toFixed(1)} m³/day</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Est. Cost</p>
              <p className="text-2xl font-bold">${(metrics.estimatedCost / 1000).toFixed(0)}k</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}