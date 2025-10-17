'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Droplets, 
  Calculator, 
  Settings, 
  Zap,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Gauge,
  Wrench,
  FileText,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useFacilityDesign } from '../context/FacilityDesignContext';

interface IrrigationComponent {
  id: string;
  type: 'pump' | 'valve' | 'emitter' | 'filter' | 'tank' | 'sensor' | 'controller' | 'pipe' | 'fitting';
  name: string;
  flowRate: number; // GPM
  pressure: number; // PSI
  power?: number; // Watts (for pumps)
  voltage?: number; // Volts (for electrical components)
  cost: number;
  quantity: number;
  location: { x: number; y: number };
  specifications: {
    material?: string;
    diameter?: number; // inches
    length?: number; // feet
    efficiency?: number; // percentage
    maxPressure?: number; // PSI
  };
  isCustom?: boolean;
  isEditable?: boolean;
}

interface IrrigationZone {
  id: string;
  name: string;
  area: number; // square feet
  plantDensity: number; // plants per sq ft
  waterRequirement: number; // gallons per plant per day
  emitterType: 'drip' | 'sprinkler' | 'mist' | 'flood';
  components: IrrigationComponent[];
}

interface IrrigationDesignPanelProps {
  onClose: () => void;
}

// Irrigation component database
const IRRIGATION_DATABASE = {
  'centrifugal-pump': {
    name: 'Centrifugal Pump',
    flowRate: 50, // GPM
    pressure: 40, // PSI
    power: 750, // Watts
    voltage: 120,
    cost: 800,
    efficiency: 75,
    description: 'General purpose centrifugal pump'
  },
  'submersible-pump': {
    name: 'Submersible Pump',
    flowRate: 30,
    pressure: 60,
    power: 500,
    voltage: 120,
    cost: 600,
    efficiency: 80,
    description: 'Submersible water pump'
  },
  'booster-pump': {
    name: 'Booster Pump',
    flowRate: 20,
    pressure: 80,
    power: 400,
    voltage: 120,
    cost: 500,
    efficiency: 78,
    description: 'High-pressure booster pump'
  },
  'solenoid-valve': {
    name: 'Solenoid Valve',
    flowRate: 25,
    pressure: 150,
    power: 10,
    voltage: 24,
    cost: 80,
    description: 'Automated irrigation valve'
  },
  'pressure-regulator': {
    name: 'Pressure Regulator',
    flowRate: 100,
    pressure: 50,
    cost: 120,
    description: 'Pressure regulation valve'
  },
  'drip-emitter': {
    name: 'Drip Emitter',
    flowRate: 0.5, // GPH
    pressure: 15,
    cost: 2,
    description: 'Individual drip emitter'
  },
  'sprinkler-head': {
    name: 'Sprinkler Head',
    flowRate: 3,
    pressure: 25,
    cost: 15,
    description: 'Micro sprinkler head'
  },
  'water-tank': {
    name: 'Water Storage Tank',
    flowRate: 0,
    pressure: 0,
    cost: 400,
    description: '100-gallon storage tank'
  },
  'filtration-system': {
    name: 'Water Filter',
    flowRate: 75,
    pressure: 10, // pressure drop
    cost: 300,
    description: 'Sediment and carbon filter'
  },
  'flow-sensor': {
    name: 'Flow Sensor',
    flowRate: 50,
    pressure: 5,
    power: 5,
    voltage: 24,
    cost: 150,
    description: 'Digital flow measurement'
  },
  'irrigation-controller': {
    name: 'Irrigation Controller',
    flowRate: 0,
    pressure: 0,
    power: 50,
    voltage: 120,
    cost: 400,
    description: 'Multi-zone irrigation controller'
  }
};

export function IrrigationDesignPanel({ onClose }: IrrigationDesignPanelProps) {
  const { state } = useDesigner();
  const { objects, room } = state;
  const { updateSystem, addSystemDependency } = useFacilityDesign();
  
  const [irrigationComponents, setIrrigationComponents] = useState<IrrigationComponent[]>([]);
  const [irrigationZones, setIrrigationZones] = useState<IrrigationZone[]>([]);
  const [totalFlow, setTotalFlow] = useState(0);
  const [totalPressure, setTotalPressure] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [showSystemDetails, setShowSystemDetails] = useState(false);

  // Calculate irrigation requirements
  useEffect(() => {
    calculateIrrigationSystem();
  }, [objects, room]);

  const calculateIrrigationSystem = () => {
    const components: IrrigationComponent[] = [];
    const zones: IrrigationZone[] = [];
    
    // Calculate zones based on plant objects
    const plantObjects = objects.filter(obj => obj.type === 'plant' || obj.type === 'crop');
    const roomArea = room.width * room.height;
    
    if (plantObjects.length > 0) {
      // Create irrigation zones based on plant density
      const totalPlants = plantObjects.length;
      const plantDensity = totalPlants / roomArea;
      
      // Estimate water requirements based on plant type
      const waterPerPlant = estimateWaterRequirement(plantObjects[0]?.variety || 'lettuce');
      const totalWaterNeeded = totalPlants * waterPerPlant; // GPD
      const peakFlowRate = totalWaterNeeded / 24 * 2; // GPH, assume 2x peak factor
      
      // Create main irrigation zone
      const mainZone: IrrigationZone = {
        id: 'main-zone',
        name: 'Main Growing Area',
        area: roomArea,
        plantDensity,
        waterRequirement: waterPerPlant,
        emitterType: determineEmitterType(plantObjects[0]?.variety || 'lettuce'),
        components: []
      };
      
      zones.push(mainZone);
      
      // Add required components
      components.push(...generateIrrigationComponents(peakFlowRate, totalPlants));
    }
    
    // Calculate totals
    const flow = components.reduce((sum, comp) => sum + comp.flowRate * comp.quantity, 0);
    const cost = components.reduce((sum, comp) => sum + comp.cost * comp.quantity, 0);
    const maxPressure = Math.max(...components.map(comp => comp.pressure));
    
    setIrrigationComponents(components);
    setIrrigationZones(zones);
    setTotalFlow(flow);
    setTotalPressure(maxPressure);
    setTotalCost(cost);
    
    // Update facility design context with irrigation system data
    const totalPower = components.reduce((sum, comp) => sum + (comp.power || 0) * comp.quantity, 0);
    updateSystem('irrigation-system', {
      id: 'irrigation-system',
      type: 'irrigation',
      status: 'configured',
      loads: {
        electrical: totalPower,
        thermal: 0,
        structural: components.reduce((sum, comp) => sum + (comp.type === 'tank' ? 500 : 50) * comp.quantity, 0), // Tank weight estimation
        water: flow
      },
      costs: {
        equipment: components.reduce((sum, comp) => sum + comp.cost * comp.quantity, 0),
        installation: cost * 0.25, // 25% installation cost
        maintenance: cost * 0.08, // 8% annual maintenance
        energy: totalPower * 8760 / 1000 * 0.12 // Annual energy cost
      },
      components: components,
      dependencies: totalPower > 0 ? ['electrical'] : [],
      conflicts: [],
      lastUpdated: new Date(),
      data: {
        zones: zones,
        totalFlow: flow,
        maxPressure: maxPressure,
        waterEfficiency: zones.reduce((sum, zone) => sum + (zone.efficiency || 0.8), 0) / zones.length || 0.8,
        pumpCount: components.filter(c => c.type === 'pump').length
      }
    });
    
    // Add dependency to electrical system if there are pumps
    if (totalPower > 0) {
      addSystemDependency({
        fromSystem: 'irrigation-system',
        toSystem: 'electrical-system',
        dependencyType: 'electrical-load',
        value: totalPower,
        critical: false
      });
    }
  };

  const estimateWaterRequirement = (plantType: string): number => {
    const waterRequirements: Record<string, number> = {
      'lettuce': 0.5, // gallons per plant per day
      'tomato': 2.0,
      'cannabis': 1.5,
      'herbs': 0.3,
      'strawberry': 0.8,
      'cucumber': 1.8,
      'pepper': 1.2,
      'kale': 0.6,
      'spinach': 0.4
    };
    
    return waterRequirements[plantType] || 0.5;
  };

  const determineEmitterType = (plantType: string): 'drip' | 'sprinkler' | 'mist' | 'flood' => {
    const emitterTypes: Record<string, 'drip' | 'sprinkler' | 'mist' | 'flood'> = {
      'lettuce': 'drip',
      'tomato': 'drip',
      'cannabis': 'drip',
      'herbs': 'mist',
      'strawberry': 'drip',
      'cucumber': 'drip',
      'pepper': 'drip',
      'kale': 'sprinkler',
      'spinach': 'sprinkler'
    };
    
    return emitterTypes[plantType] || 'drip';
  };

  const generateIrrigationComponents = (flowRate: number, plantCount: number): IrrigationComponent[] => {
    const components: IrrigationComponent[] = [];
    
    // Calculate pump requirements
    const pumpFlowRate = Math.ceil(flowRate * 1.2); // 20% safety factor
    const pumpPressure = 40; // PSI for typical irrigation
    const pumpPower = calculatePumpPower(pumpFlowRate, pumpPressure);
    
    // Add main pump
    components.push({
      id: 'main-pump',
      type: 'pump',
      name: 'Main Irrigation Pump',
      flowRate: pumpFlowRate,
      pressure: pumpPressure,
      power: pumpPower,
      voltage: pumpPower > 1000 ? 240 : 120,
      cost: estimatePumpCost(pumpPower),
      quantity: 1,
      location: { x: room.width * 0.1, y: room.height * 0.1 },
      specifications: {
        efficiency: 75,
        material: 'Cast Iron',
        maxPressure: 60
      },
      isEditable: true
    });
    
    // Add water tank
    const tankSize = Math.ceil(flowRate * 24 / 100) * 100; // Size for 1 day capacity
    components.push({
      id: 'water-tank',
      type: 'tank',
      name: `${tankSize}G Water Tank`,
      flowRate: 0,
      pressure: 0,
      cost: tankSize * 2, // $2 per gallon
      quantity: 1,
      location: { x: room.width * 0.05, y: room.height * 0.05 },
      specifications: {
        material: 'Polyethylene',
        diameter: Math.sqrt(tankSize / 10) // Approximate diameter
      },
      isEditable: true
    });
    
    // Add filtration
    components.push({
      id: 'filtration',
      type: 'filter',
      name: 'Water Filtration System',
      flowRate: pumpFlowRate,
      pressure: 10, // pressure drop
      cost: 300,
      quantity: 1,
      location: { x: room.width * 0.15, y: room.height * 0.1 },
      specifications: {
        material: 'Stainless Steel'
      },
      isEditable: true
    });
    
    // Add irrigation controller
    const zoneCount = Math.ceil(plantCount / 100); // 100 plants per zone
    components.push({
      id: 'controller',
      type: 'controller',
      name: `${zoneCount}-Zone Controller`,
      flowRate: 0,
      pressure: 0,
      power: 50,
      voltage: 120,
      cost: 400 + (zoneCount * 50),
      quantity: 1,
      location: { x: room.width * 0.2, y: room.height * 0.1 },
      specifications: {
        material: 'Plastic Enclosure'
      },
      isEditable: true
    });
    
    // Add valves (one per zone)
    for (let i = 0; i < zoneCount; i++) {
      components.push({
        id: `valve-${i}`,
        type: 'valve',
        name: `Zone ${i + 1} Valve`,
        flowRate: pumpFlowRate / zoneCount,
        pressure: 150,
        power: 10,
        voltage: 24,
        cost: 80,
        quantity: 1,
        location: { x: room.width * (0.3 + i * 0.1), y: room.height * 0.1 },
        specifications: {
          material: 'Brass',
          diameter: 1
        },
        isEditable: true
      });
    }
    
    // Add emitters
    const emittersPerPlant = 2; // 2 emitters per plant
    const totalEmitters = plantCount * emittersPerPlant;
    components.push({
      id: 'emitters',
      type: 'emitter',
      name: 'Drip Emitters',
      flowRate: 0.5, // GPH per emitter
      pressure: 15,
      cost: 2,
      quantity: totalEmitters,
      location: { x: room.width * 0.5, y: room.height * 0.5 },
      specifications: {
        material: 'Plastic'
      },
      isEditable: true
    });
    
    return components;
  };

  const calculatePumpPower = (flowRate: number, pressure: number): number => {
    // Simplified pump power calculation: HP = (GPM × PSI × 1.1) / (3960 × Efficiency)
    const efficiency = 0.75; // 75% efficiency
    const hp = (flowRate * pressure * 1.1) / (3960 * efficiency);
    return Math.ceil(hp * 746); // Convert HP to watts
  };

  const estimatePumpCost = (power: number): number => {
    // Cost estimation based on pump power
    const baseCost = 500;
    const costPerWatt = 0.8;
    return baseCost + (power * costPerWatt);
  };

  const addIrrigationComponent = (componentType: string) => {
    const component = IRRIGATION_DATABASE[componentType as keyof typeof IRRIGATION_DATABASE];
    if (!component) return;

    const newComponent: IrrigationComponent = {
      id: `custom-${Date.now()}`,
      type: componentType.split('-')[0] as any,
      name: component.name,
      flowRate: component.flowRate,
      pressure: component.pressure,
      power: component.power,
      voltage: component.voltage,
      cost: component.cost,
      quantity: 1,
      location: { x: room.width * 0.5, y: room.height * 0.5 },
      specifications: {
        efficiency: component.efficiency,
        material: 'Standard'
      },
      isCustom: true,
      isEditable: true
    };

    setIrrigationComponents(prev => [...prev, newComponent]);
    setShowAddComponent(false);
  };

  const generateSystemReport = () => {
    return {
      title: `Irrigation System Design - ${room.name || 'Cultivation Room'}`,
      dimensions: `${room.width}' x ${room.height}'`,
      totalFlow: `${totalFlow.toFixed(1)} GPM`,
      totalPressure: `${totalPressure} PSI`,
      totalCost: `$${totalCost.toLocaleString()}`,
      components: irrigationComponents,
      zones: irrigationZones,
      pumpSpecifications: calculatePumpSpecifications(),
      pipingLayout: generatePipingLayout()
    };
  };

  const calculatePumpSpecifications = () => {
    const pumps = irrigationComponents.filter(comp => comp.type === 'pump');
    return pumps.map(pump => ({
      name: pump.name,
      flowRate: pump.flowRate,
      pressure: pump.pressure,
      power: pump.power,
      efficiency: pump.specifications.efficiency,
      wireSize: pump.power && pump.power > 1000 ? '12 AWG' : '14 AWG',
      breaker: pump.power && pump.power > 1000 ? '20A' : '15A',
      gfciRequired: true
    }));
  };

  const generatePipingLayout = () => {
    const zones = irrigationZones.length;
    const mainLineSize = zones > 4 ? 2 : 1.5; // inches
    const branchLineSize = 1; // inches
    const lateralLineSize = 0.75; // inches
    
    return {
      mainLine: `${mainLineSize}" PVC`,
      branchLines: `${branchLineSize}" PVC`,
      lateralLines: `${lateralLineSize}" PVC`,
      totalPipeLength: Math.ceil(room.width * room.height * 0.1), // Estimate
      fittings: Math.ceil(irrigationComponents.length * 2)
    };
  };

  const handleExportSystem = () => {
    const systemReport = generateSystemReport();
    const blob = new Blob([JSON.stringify(systemReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irrigation-system-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Irrigation System Design</h2>
              <p className="text-gray-400">Design and size irrigation systems for optimal plant growth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Controls */}
          <div className="w-80 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* System Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">System Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Flow:</span>
                    <span className="text-white font-medium">{totalFlow.toFixed(1)} GPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Pressure:</span>
                    <span className="text-white font-medium">{totalPressure} PSI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Cost:</span>
                    <span className="text-white font-medium">${totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Zones:</span>
                    <span className="text-white font-medium">{irrigationZones.length}</span>
                  </div>
                </div>
              </div>

              {/* Pump Specifications */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Pump Requirements</h3>
                {calculatePumpSpecifications().map((pump, index) => (
                  <div key={index} className="space-y-2 mb-4">
                    <div className="text-sm font-medium text-blue-400">{pump.name}</div>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex justify-between">
                        <span>Flow Rate:</span>
                        <span className="text-white">{pump.flowRate} GPM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pressure:</span>
                        <span className="text-white">{pump.pressure} PSI</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Power:</span>
                        <span className="text-white">{pump.power}W</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Electrical:</span>
                        <span className="text-white">{pump.wireSize} • {pump.breaker}</span>
                      </div>
                      {pump.gfciRequired && (
                        <div className="text-yellow-400 text-xs">⚠️ GFCI Required</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Component */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowAddComponent(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Component
                </button>
                <button
                  onClick={handleExportSystem}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export System
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Component List */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Components List */}
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Irrigation Components</h3>
                  <button
                    onClick={() => setShowSystemDetails(!showSystemDetails)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {showSystemDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="space-y-2">
                  {irrigationComponents.map((component) => (
                    <div key={component.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-700 rounded">
                          {component.type === 'pump' && <Gauge className="w-4 h-4 text-blue-400" />}
                          {component.type === 'valve' && <Settings className="w-4 h-4 text-green-400" />}
                          {component.type === 'emitter' && <Droplets className="w-4 h-4 text-blue-400" />}
                          {component.type === 'filter' && <Wrench className="w-4 h-4 text-yellow-400" />}
                          {component.type === 'tank' && <Droplets className="w-4 h-4 text-purple-400" />}
                          {component.type === 'controller' && <Settings className="w-4 h-4 text-orange-400" />}
                        </div>
                        <div>
                          <div className="text-white font-medium">{component.name}</div>
                          {showSystemDetails && (
                            <div className="text-sm text-gray-400">
                              {component.flowRate > 0 && `${component.flowRate} GPM • `}
                              {component.pressure > 0 && `${component.pressure} PSI • `}
                              {component.power && `${component.power}W • `}
                              {component.quantity > 1 && `Qty: ${component.quantity}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">${(component.cost * component.quantity).toLocaleString()}</div>
                        {showSystemDetails && component.specifications.material && (
                          <div className="text-sm text-gray-400">{component.specifications.material}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Piping Layout */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Piping Layout</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(generatePipingLayout()).map(([key, value]) => (
                    <div key={key} className="bg-gray-800 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-white font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Component Modal */}
        {showAddComponent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Add Irrigation Component</h3>
                  <button
                    onClick={() => setShowAddComponent(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(IRRIGATION_DATABASE).map(([key, component]) => (
                    <div
                      key={key}
                      className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => addIrrigationComponent(key)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gray-800 rounded">
                          <Droplets className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{component.name}</h4>
                          <p className="text-sm text-gray-400">{component.description}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Flow: {component.flowRate} GPM</span>
                        <span className="text-gray-400">Pressure: {component.pressure} PSI</span>
                        <span className="text-green-400">${component.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}