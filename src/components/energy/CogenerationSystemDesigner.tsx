'use client';

import React, { useState, useMemo } from 'react';
import { logger } from '@/lib/client-logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Factory, 
  Flame, 
  Zap, 
  Droplets, 
  Wind, 
  Gauge, 
  AlertTriangle,
  Download,
  FileText,
  Settings,
  Calculator,
  TrendingUp,
  DollarSign,
  Thermometer,
  Building
} from 'lucide-react';

interface BoilerSpecs {
  id: string;
  manufacturer: string;
  model: string;
  type: 'Natural Draft' | 'Forced Draft' | 'Condensing' | 'Combi';
  capacity: number; // MBH
  efficiency: number; // %
  emissions: {
    nox: number; // ppm
    co: number; // ppm
  };
  dimensions: {
    width: number;
    depth: number;
    height: number;
    weight: number;
  };
  price: number;
}

interface CogenerationSpecs {
  id: string;
  manufacturer: string;
  model: string;
  type: 'Reciprocating Engine' | 'Gas Turbine' | 'Microturbine' | 'Fuel Cell';
  electricalOutput: number; // kW
  thermalOutput: number; // kW
  totalEfficiency: number; // %
  electricalEfficiency: number; // %
  heatToElectricRatio: number;
  emissions: {
    nox: number; // g/kWh
    co: number; // g/kWh
    co2: number; // kg/kWh
  };
  dimensions: {
    width: number;
    depth: number;
    height: number;
    weight: number;
  };
  price: number;
  maintenanceCost: number; // $/kWh
}

interface SystemDesign {
  facilityLoad: {
    electrical: number; // kW
    heating: number; // kW
    cooling: number; // kW
    processHeat: number; // kW
  };
  operatingHours: {
    daily: number;
    annual: number;
  };
  utilityCosts: {
    electricity: number; // $/kWh
    naturalGas: number; // $/therm
  };
  selectedEquipment: {
    cogeneration?: CogenerationSpecs;
    boilers: BoilerSpecs[];
    chillers?: any[];
  };
}

// Database of cogeneration equipment
const cogenerationDatabase: CogenerationSpecs[] = [
  {
    id: 'cat-g3516',
    manufacturer: 'Caterpillar',
    model: 'G3516',
    type: 'Reciprocating Engine',
    electricalOutput: 1600,
    thermalOutput: 1850,
    totalEfficiency: 85,
    electricalEfficiency: 42,
    heatToElectricRatio: 1.16,
    emissions: {
      nox: 0.5,
      co: 0.3,
      co2: 0.45
    },
    dimensions: {
      width: 2400,
      depth: 6100,
      height: 2800,
      weight: 18000
    },
    price: 850000,
    maintenanceCost: 0.015
  },
  {
    id: 'capstone-c1000',
    manufacturer: 'Capstone',
    model: 'C1000 Signature Series',
    type: 'Microturbine',
    electricalOutput: 1000,
    thermalOutput: 1200,
    totalEfficiency: 80,
    electricalEfficiency: 33,
    heatToElectricRatio: 1.2,
    emissions: {
      nox: 0.07,
      co: 0.04,
      co2: 0.49
    },
    dimensions: {
      width: 2200,
      depth: 9200,
      height: 2900,
      weight: 13600
    },
    price: 750000,
    maintenanceCost: 0.012
  },
  {
    id: 'bloom-es-250',
    manufacturer: 'Bloom Energy',
    model: 'ES-250',
    type: 'Fuel Cell',
    electricalOutput: 250,
    thermalOutput: 180,
    totalEfficiency: 85,
    electricalEfficiency: 53,
    heatToElectricRatio: 0.72,
    emissions: {
      nox: 0.01,
      co: 0.01,
      co2: 0.35
    },
    dimensions: {
      width: 2400,
      depth: 4800,
      height: 2100,
      weight: 6800
    },
    price: 500000,
    maintenanceCost: 0.025
  }
];

// Database of boiler equipment
const boilerDatabase: BoilerSpecs[] = [
  {
    id: 'aerco-benchmark-3000',
    manufacturer: 'AERCO',
    model: 'Benchmark 3000',
    type: 'Condensing',
    capacity: 3000,
    efficiency: 95,
    emissions: {
      nox: 20,
      co: 50
    },
    dimensions: {
      width: 991,
      depth: 1270,
      height: 1981,
      weight: 771
    },
    price: 45000
  },
  {
    id: 'cleaver-brooks-cb-200',
    manufacturer: 'Cleaver-Brooks',
    model: 'CB-200',
    type: 'Natural Draft',
    capacity: 8368,
    efficiency: 82,
    emissions: {
      nox: 30,
      co: 60
    },
    dimensions: {
      width: 2134,
      depth: 3658,
      height: 2438,
      weight: 5443
    },
    price: 125000
  }
];

export default function CogenerationSystemDesigner() {
  const [systemDesign, setSystemDesign] = useState<SystemDesign>({
    facilityLoad: {
      electrical: 1200,
      heating: 2500,
      cooling: 1800,
      processHeat: 800
    },
    operatingHours: {
      daily: 16,
      annual: 5840
    },
    utilityCosts: {
      electricity: 0.12,
      naturalGas: 0.65
    },
    selectedEquipment: {
      boilers: []
    }
  });

  // Calculate system requirements
  const systemRequirements = useMemo(() => {
    const totalThermalLoad = systemDesign.facilityLoad.heating + 
                           systemDesign.facilityLoad.processHeat +
                           (systemDesign.facilityLoad.cooling * 1.2); // Absorption chiller COP

    const annualElectricalEnergy = systemDesign.facilityLoad.electrical * 
                                  systemDesign.operatingHours.annual;

    const annualThermalEnergy = totalThermalLoad * 
                               systemDesign.operatingHours.annual;

    return {
      peakElectrical: systemDesign.facilityLoad.electrical,
      peakThermal: totalThermalLoad,
      annualElectrical: annualElectricalEnergy,
      annualThermal: annualThermalEnergy,
      avgCapacityFactor: systemDesign.operatingHours.annual / 8760
    };
  }, [systemDesign]);

  // Calculate economics
  const calculateEconomics = (cogen?: CogenerationSpecs) => {
    if (!cogen) return null;

    const annualElectricalOutput = Math.min(
      cogen.electricalOutput * systemDesign.operatingHours.annual,
      systemRequirements.annualElectrical
    );

    const annualThermalOutput = Math.min(
      cogen.thermalOutput * systemDesign.operatingHours.annual,
      systemRequirements.annualThermal
    );

    const gasConsumption = annualElectricalOutput / (cogen.electricalEfficiency / 100);
    const gasCost = (gasConsumption * 0.00341) * systemDesign.utilityCosts.naturalGas; // Convert kWh to therms

    const electricitySavings = annualElectricalOutput * systemDesign.utilityCosts.electricity;
    const heatingSavings = (annualThermalOutput * 0.00341) * systemDesign.utilityCosts.naturalGas * 0.8; // Avoided boiler fuel

    const maintenanceCost = annualElectricalOutput * cogen.maintenanceCost;

    const netSavings = electricitySavings + heatingSavings - gasCost - maintenanceCost;
    const simplePayback = cogen.price / netSavings;

    return {
      annualElectricalOutput,
      annualThermalOutput,
      gasConsumption,
      gasCost,
      electricitySavings,
      heatingSavings,
      maintenanceCost,
      netSavings,
      simplePayback,
      roi: (netSavings / cogen.price) * 100
    };
  };

  const generateSpecificationDocument = () => {
    // This would generate a PDF similar to the one provided
    logger.info('energy', 'Generating specification document...');
    // Implementation would use a PDF library like jsPDF or react-pdf
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cogeneration System Designer</h1>
          <p className="text-muted-foreground mt-2">
            Design and specify boilers, heaters, and cogeneration systems for your facility
          </p>
        </div>
        <Button onClick={generateSpecificationDocument}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Spec Sheet
        </Button>
      </div>

      <Tabs defaultValue="requirements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="cogeneration">Cogeneration</TabsTrigger>
          <TabsTrigger value="boilers">Boilers & Heaters</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facility Load Requirements</CardTitle>
              <CardDescription>
                Enter your facility's energy requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Electrical Loads
                  </h3>
                  <div>
                    <Label>Peak Electrical Load (kW)</Label>
                    <Input
                      type="number"
                      value={systemDesign.facilityLoad.electrical}
                      onChange={(e) => setSystemDesign({
                        ...systemDesign,
                        facilityLoad: {
                          ...systemDesign.facilityLoad,
                          electrical: Number(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Thermometer className="mr-2 h-5 w-5" />
                    Thermal Loads
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Heating Load (kW)</Label>
                      <Input
                        type="number"
                        value={systemDesign.facilityLoad.heating}
                        onChange={(e) => setSystemDesign({
                          ...systemDesign,
                          facilityLoad: {
                            ...systemDesign.facilityLoad,
                            heating: Number(e.target.value)
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Cooling Load (kW)</Label>
                      <Input
                        type="number"
                        value={systemDesign.facilityLoad.cooling}
                        onChange={(e) => setSystemDesign({
                          ...systemDesign,
                          facilityLoad: {
                            ...systemDesign.facilityLoad,
                            cooling: Number(e.target.value)
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Process Heat (kW)</Label>
                      <Input
                        type="number"
                        value={systemDesign.facilityLoad.processHeat}
                        onChange={(e) => setSystemDesign({
                          ...systemDesign,
                          facilityLoad: {
                            ...systemDesign.facilityLoad,
                            processHeat: Number(e.target.value)
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Operating Schedule</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Daily Operating Hours</Label>
                      <Input
                        type="number"
                        value={systemDesign.operatingHours.daily}
                        onChange={(e) => setSystemDesign({
                          ...systemDesign,
                          operatingHours: {
                            daily: Number(e.target.value),
                            annual: Number(e.target.value) * 365
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Annual Operating Hours</Label>
                      <Input
                        type="number"
                        value={systemDesign.operatingHours.annual}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Utility Rates</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Electricity ($/kWh)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={systemDesign.utilityCosts.electricity}
                        onChange={(e) => setSystemDesign({
                          ...systemDesign,
                          utilityCosts: {
                            ...systemDesign.utilityCosts,
                            electricity: Number(e.target.value)
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Natural Gas ($/therm)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={systemDesign.utilityCosts.naturalGas}
                        onChange={(e) => setSystemDesign({
                          ...systemDesign,
                          utilityCosts: {
                            ...systemDesign.utilityCosts,
                            naturalGas: Number(e.target.value)
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Requirements Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {systemRequirements.peakElectrical.toLocaleString()} kW
                  </div>
                  <div className="text-sm text-muted-foreground">Peak Electrical</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {systemRequirements.peakThermal.toLocaleString()} kW
                  </div>
                  <div className="text-sm text-muted-foreground">Peak Thermal</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {(systemRequirements.annualElectrical / 1000).toFixed(0)} MWh
                  </div>
                  <div className="text-sm text-muted-foreground">Annual Electrical</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {(systemRequirements.avgCapacityFactor * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Capacity Factor</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cogeneration" className="space-y-4">
          <div className="grid gap-4">
            {cogenerationDatabase.map((cogen) => {
              const economics = calculateEconomics(cogen);
              const isSelected = systemDesign.selectedEquipment.cogeneration?.id === cogen.id;

              return (
                <Card key={cogen.id} className={isSelected ? "ring-2 ring-primary" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Factory className="mr-2 h-5 w-5" />
                          {cogen.manufacturer} {cogen.model}
                        </CardTitle>
                        <CardDescription>
                          {cogen.type} • {cogen.electricalOutput} kW Electrical • {cogen.thermalOutput} kW Thermal
                        </CardDescription>
                      </div>
                      <Badge variant={cogen.totalEfficiency > 80 ? "default" : "secondary"}>
                        {cogen.totalEfficiency}% Total Efficiency
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Electrical Efficiency</div>
                        <div>{cogen.electricalEfficiency}%</div>
                      </div>
                      <div>
                        <div className="font-medium">Heat/Electric Ratio</div>
                        <div>{cogen.heatToElectricRatio.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="font-medium">NOx Emissions</div>
                        <div>{cogen.emissions.nox} g/kWh</div>
                      </div>
                      <div>
                        <div className="font-medium">Capital Cost</div>
                        <div>${cogen.price.toLocaleString()}</div>
                      </div>
                    </div>

                    {economics && (
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <h4 className="font-semibold flex items-center">
                          <Calculator className="mr-2 h-4 w-4" />
                          Economic Analysis
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Annual Savings</div>
                            <div className="font-semibold text-green-600">
                              ${economics.netSavings.toLocaleString()}/yr
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Simple Payback</div>
                            <div className="font-semibold">
                              {economics.simplePayback.toFixed(1)} years
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">ROI</div>
                            <div className="font-semibold">
                              {economics.roi.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        variant={isSelected ? "secondary" : "default"}
                        onClick={() => setSystemDesign({
                          ...systemDesign,
                          selectedEquipment: {
                            ...systemDesign.selectedEquipment,
                            cogeneration: isSelected ? undefined : cogen
                          }
                        })}
                      >
                        {isSelected ? "Remove from Design" : "Add to Design"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="boilers" className="space-y-4">
          <div className="grid gap-4">
            {boilerDatabase.map((boiler) => {
              const isSelected = systemDesign.selectedEquipment.boilers.some(b => b.id === boiler.id);

              return (
                <Card key={boiler.id} className={isSelected ? "ring-2 ring-primary" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Flame className="mr-2 h-5 w-5" />
                          {boiler.manufacturer} {boiler.model}
                        </CardTitle>
                        <CardDescription>
                          {boiler.type} Boiler • {boiler.capacity} MBH • {boiler.efficiency}% Efficiency
                        </CardDescription>
                      </div>
                      <Badge variant={boiler.emissions.nox < 20 ? "default" : "secondary"}>
                        {boiler.emissions.nox} ppm NOx
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Thermal Output</div>
                        <div>{(boiler.capacity * 0.293).toFixed(0)} kW</div>
                      </div>
                      <div>
                        <div className="font-medium">CO Emissions</div>
                        <div>{boiler.emissions.co} ppm</div>
                      </div>
                      <div>
                        <div className="font-medium">Dimensions</div>
                        <div>{(boiler.dimensions.width/1000).toFixed(1)}m × {(boiler.dimensions.depth/1000).toFixed(1)}m</div>
                      </div>
                      <div>
                        <div className="font-medium">Price</div>
                        <div>${boiler.price.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant={isSelected ? "secondary" : "default"}
                        onClick={() => {
                          if (isSelected) {
                            setSystemDesign({
                              ...systemDesign,
                              selectedEquipment: {
                                ...systemDesign.selectedEquipment,
                                boilers: systemDesign.selectedEquipment.boilers.filter(b => b.id !== boiler.id)
                              }
                            });
                          } else {
                            setSystemDesign({
                              ...systemDesign,
                              selectedEquipment: {
                                ...systemDesign.selectedEquipment,
                                boilers: [...systemDesign.selectedEquipment.boilers, boiler]
                              }
                            });
                          }
                        }}
                      >
                        {isSelected ? "Remove from Design" : "Add to Design"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Analysis</CardTitle>
              <CardDescription>
                Comprehensive analysis of your selected equipment configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {systemDesign.selectedEquipment.cogeneration ? (
                <>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Cogeneration system selected. Supplemental boilers may be required for peak loads.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Energy Balance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Electrical Coverage</div>
                        <div className="text-2xl font-bold">
                          {Math.min(100, (systemDesign.selectedEquipment.cogeneration.electricalOutput / systemRequirements.peakElectrical) * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Thermal Coverage</div>
                        <div className="text-2xl font-bold">
                          {Math.min(100, (systemDesign.selectedEquipment.cogeneration.thermalOutput / systemRequirements.peakThermal) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Environmental Impact</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">CO2 Reduction</div>
                        <div className="text-xl font-semibold text-green-600">
                          {((systemRequirements.annualElectrical * 0.0004) - 
                            (systemDesign.selectedEquipment.cogeneration.emissions.co2 * systemRequirements.annualElectrical / 1000)).toFixed(0)} tons/yr
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">NOx Emissions</div>
                        <div className="text-xl font-semibold">
                          {(systemDesign.selectedEquipment.cogeneration.emissions.nox * systemRequirements.annualElectrical / 1000000).toFixed(1)} tons/yr
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Primary Energy Savings</div>
                        <div className="text-xl font-semibold text-green-600">
                          {((1 - (1 / systemDesign.selectedEquipment.cogeneration.totalEfficiency * 100)) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No cogeneration system selected. Please select equipment from the Cogeneration tab.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Documents</CardTitle>
              <CardDescription>
                Download technical specifications and proposals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Technical Specification</div>
                      <div className="text-sm text-muted-foreground">
                        Complete system design with equipment specifications
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Economic Analysis Report</div>
                      <div className="text-sm text-muted-foreground">
                        ROI calculations and financial projections
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Excel
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Equipment Cut Sheets</div>
                      <div className="text-sm text-muted-foreground">
                        Manufacturer specifications and drawings
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download ZIP
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}