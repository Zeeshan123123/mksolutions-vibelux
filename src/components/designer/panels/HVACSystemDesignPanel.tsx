'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wind, 
  Thermometer, 
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
  Snowflake,
  Flame,
  FileText,
  Download,
  Eye,
  EyeOff,
  BarChart3,
  Activity
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useFacilityDesign } from '../context/FacilityDesignContext';

interface HVACComponent {
  id: string;
  type: 'hvac-unit' | 'exhaust-fan' | 'intake-fan' | 'circulation-fan' | 'dehumidifier' | 'humidifier' | 'heater' | 'cooler' | 'chiller' | 'boiler' | 'hrv' | 'ducting' | 'damper' | 'filter';
  name: string;
  capacity: number; // BTU/hr or CFM
  power: number; // Watts
  voltage: number;
  airflow: number; // CFM
  efficiency: number; // %
  cost: number;
  quantity: number;
  location: { x: number; y: number };
  specifications: {
    refrigerant?: string;
    filterType?: string;
    soundLevel?: number; // dB
    dimensions?: { width: number; height: number; depth: number };
    weight?: number; // lbs
    ductSize?: number; // inches
    staticPressure?: number; // inches H2O
  };
  isCustom?: boolean;
  isEditable?: boolean;
  energyRating?: string; // SEER, EER, etc.
}

interface HVACZone {
  id: string;
  name: string;
  area: number; // sq ft
  volume: number; // cubic ft
  targetTemp: number; // °F
  targetHumidity: number; // %
  airChangesPerHour: number;
  heatLoad: number; // BTU/hr
  coolLoad: number; // BTU/hr
  components: HVACComponent[];
}

interface HVACSystemDesignPanelProps {
  onClose: () => void;
}

// HVAC component database
const HVAC_DATABASE = {
  'split-system': {
    name: 'Split System AC',
    capacity: 36000, // BTU/hr (3 ton)
    power: 3500,
    voltage: 240,
    airflow: 1200,
    efficiency: 16, // SEER
    cost: 4500,
    description: 'Standard split system for medium spaces'
  },
  'packaged-unit': {
    name: 'Packaged Rooftop Unit',
    capacity: 60000, // BTU/hr (5 ton)
    power: 6000,
    voltage: 480,
    airflow: 2000,
    efficiency: 14,
    cost: 8000,
    description: 'Complete packaged HVAC unit'
  },
  'mini-split': {
    name: 'Mini Split System',
    capacity: 12000, // BTU/hr (1 ton)
    power: 1200,
    voltage: 120,
    airflow: 400,
    efficiency: 22,
    cost: 2000,
    description: 'High-efficiency mini split'
  },
  'exhaust-fan': {
    name: 'Exhaust Fan',
    capacity: 0,
    power: 400,
    voltage: 120,
    airflow: 1000,
    efficiency: 80,
    cost: 600,
    description: 'High-volume exhaust fan'
  },
  'intake-fan': {
    name: 'Intake Fan',
    capacity: 0,
    power: 300,
    voltage: 120,
    airflow: 800,
    efficiency: 85,
    cost: 450,
    description: 'Fresh air intake fan'
  },
  'circulation-fan': {
    name: 'Circulation Fan',
    capacity: 0,
    power: 150,
    voltage: 120,
    airflow: 300,
    efficiency: 75,
    cost: 200,
    description: 'Air circulation fan'
  },
  'dehumidifier': {
    name: 'Commercial Dehumidifier',
    capacity: 130, // Pints/day
    power: 1200,
    voltage: 120,
    airflow: 400,
    efficiency: 2.5, // L/kWh
    cost: 2500,
    description: 'Commercial dehumidification'
  },
  'humidifier': {
    name: 'Steam Humidifier',
    capacity: 50, // lbs/hr
    power: 1500,
    voltage: 240,
    airflow: 0,
    efficiency: 95,
    cost: 3000,
    description: 'Steam humidification system'
  },
  'heat-pump': {
    name: 'Heat Pump',
    capacity: 48000, // BTU/hr
    power: 4000,
    voltage: 240,
    airflow: 1600,
    efficiency: 18, // SEER
    cost: 5500,
    description: 'Efficient heat pump system'
  },
  'chiller': {
    name: 'Water Chiller',
    capacity: 120000, // BTU/hr (10 ton)
    power: 12000,
    voltage: 480,
    airflow: 0,
    efficiency: 12, // EER
    cost: 15000,
    description: 'Central water chiller'
  },
  'boiler': {
    name: 'Electric Boiler',
    capacity: 100000, // BTU/hr
    power: 30000,
    voltage: 480,
    airflow: 0,
    efficiency: 98,
    cost: 8000,
    description: 'Electric heating boiler'
  },
  'hrv': {
    name: 'Heat Recovery Ventilator',
    capacity: 0,
    power: 400,
    voltage: 120,
    airflow: 600,
    efficiency: 85, // Heat recovery efficiency
    cost: 2200,
    description: 'Energy recovery ventilation'
  }
};

export function HVACSystemDesignPanel({ onClose }: HVACSystemDesignPanelProps) {
  const { state } = useDesigner();
  const { objects, room, calculations } = state;
  const { updateSystem, addSystemDependency } = useFacilityDesign();
  
  const [hvacComponents, setHvacComponents] = useState<HVACComponent[]>([]);
  const [hvacZones, setHvacZones] = useState<HVACZone[]>([]);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [totalPower, setTotalPower] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalAirflow, setTotalAirflow] = useState(0);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [showSystemDetails, setShowSystemDetails] = useState(false);
  const [designMode, setDesignMode] = useState<'auto' | 'manual'>('auto');

  // Calculate HVAC requirements
  useEffect(() => {
    calculateHVACSystem();
  }, [objects, room, calculations]);

  const calculateHVACSystem = () => {
    const components: HVACComponent[] = [];
    const zones: HVACZone[] = [];
    
    // Calculate heat loads
    const roomArea = room.width * room.height;
    const roomVolume = roomArea * (room.ceilingHeight || 10);
    
    // Calculate lighting heat load
    const lightingLoad = (calculations?.totalPower || 0) * 3.41; // BTU/hr from watts
    
    // Calculate occupancy and equipment loads
    const occupancyLoad = 500; // BTU/hr per person (assume 1 person per 500 sq ft)
    const equipmentLoad = 1000; // BTU/hr base equipment load
    
    // Calculate building envelope loads
    const envelopeLoad = calculateEnvelopeLoad(roomArea, room.ceilingHeight || 10);
    
    // Calculate ventilation requirements
    const requiredAirChanges = calculateRequiredAirChanges(room.roomType);
    const requiredCFM = (roomVolume * requiredAirChanges) / 60;
    
    // Total cooling load
    const totalCoolingLoad = lightingLoad + occupancyLoad + equipmentLoad + envelopeLoad;
    
    // Total heating load (typically 60% of cooling)
    const totalHeatingLoad = totalCoolingLoad * 0.6;
    
    // Create main zone
    const mainZone: HVACZone = {
      id: 'main-zone',
      name: 'Main Growing Area',
      area: roomArea,
      volume: roomVolume,
      targetTemp: 75, // °F
      targetHumidity: 60, // %
      airChangesPerHour: requiredAirChanges,
      heatLoad: totalHeatingLoad,
      coolLoad: totalCoolingLoad,
      components: []
    };
    
    zones.push(mainZone);
    
    // Generate HVAC components
    components.push(...generateHVACComponents(totalCoolingLoad, totalHeatingLoad, requiredCFM, roomArea));
    
    // Calculate totals
    const capacity = components.reduce((sum, comp) => sum + comp.capacity, 0);
    const power = components.reduce((sum, comp) => sum + comp.power * comp.quantity, 0);
    const cost = components.reduce((sum, comp) => sum + comp.cost * comp.quantity, 0);
    const airflow = components.reduce((sum, comp) => sum + comp.airflow * comp.quantity, 0);
    
    setHvacComponents(components);
    setHvacZones(zones);
    setTotalCapacity(capacity);
    setTotalPower(power);
    setTotalCost(cost);
    setTotalAirflow(airflow);
    
    // Update facility design context with HVAC system data
    updateSystem('hvac-system', {
      id: 'hvac-system',
      type: 'hvac',
      status: 'configured',
      loads: {
        electrical: power,
        thermal: capacity,
        structural: components.reduce((sum, comp) => sum + (comp.specifications.weight || 0) * comp.quantity, 0),
        water: 0
      },
      costs: {
        equipment: components.reduce((sum, comp) => sum + comp.cost * comp.quantity, 0),
        installation: components.reduce((sum, comp) => sum + comp.cost * comp.quantity * 0.3, 0), // 30% installation cost
        maintenance: components.reduce((sum, comp) => sum + comp.cost * comp.quantity * 0.05, 0), // 5% annual maintenance
        energy: power * 8760 / 1000 * 0.12 // Annual energy cost
      },
      components: components,
      dependencies: ['electrical'],
      conflicts: [],
      lastUpdated: new Date(),
      data: {
        zones: zones,
        capacity: capacity,
        airflow: airflow,
        efficiency: components.filter(c => c.type === 'hvac-unit').reduce((sum, c) => sum + c.efficiency, 0) / components.filter(c => c.type === 'hvac-unit').length || 0
      }
    });
    
    // Add dependency to electrical system (HVAC electrical load)
    addSystemDependency({
      fromSystem: 'hvac-system',
      toSystem: 'electrical-system',
      dependencyType: 'electrical-load',
      value: power,
      critical: true
    });
  };

  const calculateEnvelopeLoad = (area: number, height: number): number => {
    // Simplified envelope load calculation
    const wallArea = (room.width + room.height) * 2 * height;
    const roofArea = area;
    const uValueWall = 0.08; // BTU/hr·ft²·°F (well-insulated)
    const uValueRoof = 0.05;
    const tempDifference = 20; // °F difference indoor/outdoor
    
    return (wallArea * uValueWall + roofArea * uValueRoof) * tempDifference;
  };

  const calculateRequiredAirChanges = (roomType: string): number => {
    const airChanges: Record<string, number> = {
      'cultivation': 12, // High air changes for plant growth
      'greenhouse': 8,
      'residential': 6,
      'commercial': 10
    };
    return airChanges[roomType] || 10;
  };

  const generateHVACComponents = (coolingLoad: number, heatingLoad: number, cfm: number, area: number): HVACComponent[] => {
    const components: HVACComponent[] = [];
    
    // Determine primary HVAC system
    if (coolingLoad > 60000) {
      // Large system - use packaged unit or chiller
      const unitsNeeded = Math.ceil(coolingLoad / 60000);
      components.push({
        id: 'primary-hvac',
        type: 'hvac-unit',
        name: `${unitsNeeded}x Packaged Unit`,
        capacity: 60000,
        power: 6000,
        voltage: 480,
        airflow: 2000,
        efficiency: 14,
        cost: 8000,
        quantity: unitsNeeded,
        location: { x: room.width * 0.1, y: room.height * 0.1 },
        specifications: {
          refrigerant: 'R410A',
          soundLevel: 65,
          dimensions: { width: 72, height: 48, depth: 36 },
          weight: 800
        },
        isEditable: true,
        energyRating: '14 SEER'
      });
    } else if (coolingLoad > 24000) {
      // Medium system - split system
      components.push({
        id: 'primary-hvac',
        type: 'hvac-unit',
        name: 'Split System AC',
        capacity: 36000,
        power: 3500,
        voltage: 240,
        airflow: 1200,
        efficiency: 16,
        cost: 4500,
        quantity: 1,
        location: { x: room.width * 0.1, y: room.height * 0.1 },
        specifications: {
          refrigerant: 'R410A',
          soundLevel: 55,
          dimensions: { width: 36, height: 30, depth: 24 },
          weight: 400
        },
        isEditable: true,
        energyRating: '16 SEER'
      });
    } else {
      // Small system - mini splits
      const unitsNeeded = Math.ceil(coolingLoad / 12000);
      components.push({
        id: 'primary-hvac',
        type: 'hvac-unit',
        name: `${unitsNeeded}x Mini Split`,
        capacity: 12000,
        power: 1200,
        voltage: 120,
        airflow: 400,
        efficiency: 22,
        cost: 2000,
        quantity: unitsNeeded,
        location: { x: room.width * 0.2, y: room.height * 0.1 },
        specifications: {
          refrigerant: 'R410A',
          soundLevel: 42,
          dimensions: { width: 24, height: 18, depth: 12 },
          weight: 150
        },
        isEditable: true,
        energyRating: '22 SEER'
      });
    }
    
    // Add ventilation fans
    const exhaustFansNeeded = Math.ceil(cfm / 1000);
    components.push({
      id: 'exhaust-system',
      type: 'exhaust-fan',
      name: `${exhaustFansNeeded}x Exhaust Fan`,
      capacity: 0,
      power: 400,
      voltage: 120,
      airflow: 1000,
      efficiency: 80,
      cost: 600,
      quantity: exhaustFansNeeded,
      location: { x: room.width * 0.9, y: room.height * 0.1 },
      specifications: {
        soundLevel: 50,
        dimensions: { width: 24, height: 24, depth: 12 },
        staticPressure: 0.5
      },
      isEditable: true
    });
    
    // Add intake fans
    const intakeFansNeeded = Math.ceil(cfm / 800);
    components.push({
      id: 'intake-system',
      type: 'intake-fan',
      name: `${intakeFansNeeded}x Intake Fan`,
      capacity: 0,
      power: 300,
      voltage: 120,
      airflow: 800,
      efficiency: 85,
      cost: 450,
      quantity: intakeFansNeeded,
      location: { x: room.width * 0.1, y: room.height * 0.9 },
      specifications: {
        soundLevel: 45,
        dimensions: { width: 20, height: 20, depth: 10 },
        staticPressure: 0.3
      },
      isEditable: true
    });
    
    // Add circulation fans
    const circulationFansNeeded = Math.ceil(area / 200); // 1 per 200 sq ft
    components.push({
      id: 'circulation-system',
      type: 'circulation-fan',
      name: `${circulationFansNeeded}x Circulation Fan`,
      capacity: 0,
      power: 150,
      voltage: 120,
      airflow: 300,
      efficiency: 75,
      cost: 200,
      quantity: circulationFansNeeded,
      location: { x: room.width * 0.5, y: room.height * 0.5 },
      specifications: {
        soundLevel: 40,
        dimensions: { width: 18, height: 18, depth: 8 }
      },
      isEditable: true
    });
    
    // Add dehumidifier if needed
    if (room.roomType === 'cultivation' || room.roomType === 'greenhouse') {
      components.push({
        id: 'dehumidifier',
        type: 'dehumidifier',
        name: 'Commercial Dehumidifier',
        capacity: 130, // pints/day
        power: 1200,
        voltage: 120,
        airflow: 400,
        efficiency: 2.5,
        cost: 2500,
        quantity: 1,
        location: { x: room.width * 0.3, y: room.height * 0.1 },
        specifications: {
          soundLevel: 48,
          dimensions: { width: 24, height: 36, depth: 18 },
          weight: 120
        },
        isEditable: true
      });
    }
    
    return components;
  };

  const addHVACComponent = (componentType: string) => {
    const component = HVAC_DATABASE[componentType as keyof typeof HVAC_DATABASE];
    if (!component) return;

    const newComponent: HVACComponent = {
      id: `custom-${Date.now()}`,
      type: componentType as any,
      name: component.name,
      capacity: component.capacity,
      power: component.power,
      voltage: component.voltage,
      airflow: component.airflow,
      efficiency: component.efficiency,
      cost: component.cost,
      quantity: 1,
      location: { x: room.width * 0.5, y: room.height * 0.5 },
      specifications: {
        soundLevel: 50,
        dimensions: { width: 24, height: 24, depth: 12 }
      },
      isCustom: true,
      isEditable: true
    };

    setHvacComponents(prev => [...prev, newComponent]);
    setShowAddComponent(false);
  };

  const generateSystemReport = () => {
    const zone = hvacZones[0];
    return {
      title: `HVAC System Design - ${room.name || 'Cultivation Room'}`,
      dimensions: `${room.width}' x ${room.height}' x ${room.ceilingHeight || 10}'`,
      totalCapacity: `${(totalCapacity / 1000).toFixed(1)} tons`,
      totalPower: `${totalPower.toFixed(0)} W`,
      totalCost: `$${totalCost.toLocaleString()}`,
      totalAirflow: `${totalAirflow} CFM`,
      loadCalculations: zone ? {
        coolingLoad: `${zone.coolLoad.toFixed(0)} BTU/hr`,
        heatingLoad: `${zone.heatLoad.toFixed(0)} BTU/hr`,
        airChanges: `${zone.airChangesPerHour} ACH`,
        ventilationRate: `${(zone.volume * zone.airChangesPerHour / 60).toFixed(0)} CFM`
      } : null,
      components: hvacComponents,
      zones: hvacZones,
      energyAnalysis: calculateEnergyAnalysis()
    };
  };

  const calculateEnergyAnalysis = () => {
    const annualHours = 8760;
    const coolingHours = 2000; // Typical cooling hours
    const heatingHours = 1500; // Typical heating hours
    const ventilationHours = annualHours;
    
    const coolingComponents = hvacComponents.filter(c => c.type === 'hvac-unit' || c.type === 'chiller');
    const heatingComponents = hvacComponents.filter(c => c.type === 'boiler' || c.type === 'heater');
    const ventilationComponents = hvacComponents.filter(c => c.type.includes('fan') || c.type === 'hrv');
    
    const coolingEnergy = coolingComponents.reduce((sum, c) => sum + c.power * c.quantity, 0) * coolingHours / 1000;
    const heatingEnergy = heatingComponents.reduce((sum, c) => sum + c.power * c.quantity, 0) * heatingHours / 1000;
    const ventilationEnergy = ventilationComponents.reduce((sum, c) => sum + c.power * c.quantity, 0) * ventilationHours / 1000;
    
    const totalEnergy = coolingEnergy + heatingEnergy + ventilationEnergy;
    const energyCost = totalEnergy * 0.12; // $0.12/kWh average
    
    return {
      totalEnergy: `${totalEnergy.toFixed(0)} kWh/year`,
      energyCost: `$${energyCost.toLocaleString()}/year`,
      coolingEnergy: `${coolingEnergy.toFixed(0)} kWh/year`,
      heatingEnergy: `${heatingEnergy.toFixed(0)} kWh/year`,
      ventilationEnergy: `${ventilationEnergy.toFixed(0)} kWh/year`
    };
  };

  const handleExportSystem = () => {
    const systemReport = generateSystemReport();
    const blob = new Blob([JSON.stringify(systemReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hvac-system-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const zone = hvacZones[0]; // Main zone

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Wind className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">HVAC System Design</h2>
              <p className="text-gray-400">Design heating, cooling, and ventilation systems</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDesignMode(designMode === 'auto' ? 'manual' : 'auto')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                designMode === 'auto' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {designMode === 'auto' ? 'Auto Design' : 'Manual Design'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
                    <span className="text-gray-400">Total Capacity:</span>
                    <span className="text-white font-medium">{(totalCapacity / 1000).toFixed(1)} tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Power:</span>
                    <span className="text-white font-medium">{totalPower.toFixed(0)} W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Airflow:</span>
                    <span className="text-white font-medium">{totalAirflow.toLocaleString()} CFM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Cost:</span>
                    <span className="text-white font-medium">${totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Load Calculations */}
              {zone && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Load Calculations</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cooling Load:</span>
                      <span className="text-white font-medium">{zone.coolLoad.toFixed(0)} BTU/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Heating Load:</span>
                      <span className="text-white font-medium">{zone.heatLoad.toFixed(0)} BTU/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Air Changes:</span>
                      <span className="text-white font-medium">{zone.airChangesPerHour} ACH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ventilation:</span>
                      <span className="text-white font-medium">{(zone.volume * zone.airChangesPerHour / 60).toFixed(0)} CFM</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Energy Analysis */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Energy Analysis</h3>
                <div className="space-y-2">
                  {Object.entries(calculateEnergyAnalysis()).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
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
                  <h3 className="text-lg font-semibold text-white">HVAC Components</h3>
                  <button
                    onClick={() => setShowSystemDetails(!showSystemDetails)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {showSystemDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="space-y-2">
                  {hvacComponents.map((component) => (
                    <div key={component.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-700 rounded">
                          {component.type === 'hvac-unit' && <Thermometer className="w-4 h-4 text-blue-400" />}
                          {component.type.includes('fan') && <Wind className="w-4 h-4 text-green-400" />}
                          {component.type === 'dehumidifier' && <Droplets className="w-4 h-4 text-purple-400" />}
                          {component.type === 'humidifier' && <Droplets className="w-4 h-4 text-blue-400" />}
                          {component.type === 'chiller' && <Snowflake className="w-4 h-4 text-cyan-400" />}
                          {component.type === 'boiler' && <Flame className="w-4 h-4 text-red-400" />}
                          {component.type === 'hrv' && <Activity className="w-4 h-4 text-yellow-400" />}
                        </div>
                        <div>
                          <div className="text-white font-medium">{component.name}</div>
                          {showSystemDetails && (
                            <div className="text-sm text-gray-400">
                              {component.capacity > 0 && `${component.capacity.toLocaleString()} BTU/hr • `}
                              {component.airflow > 0 && `${component.airflow} CFM • `}
                              {component.power > 0 && `${component.power}W • `}
                              {component.quantity > 1 && `Qty: ${component.quantity}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">${(component.cost * component.quantity).toLocaleString()}</div>
                        {showSystemDetails && component.energyRating && (
                          <div className="text-sm text-green-400">{component.energyRating}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Performance */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">System Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Energy Efficiency</div>
                    <div className="text-lg font-semibold text-green-400">
                      {hvacComponents.filter(c => c.type === 'hvac-unit').reduce((sum, c) => sum + c.efficiency, 0) / 
                       hvacComponents.filter(c => c.type === 'hvac-unit').length || 0} SEER
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Sound Level</div>
                    <div className="text-lg font-semibold text-yellow-400">
                      {Math.max(...hvacComponents.map(c => c.specifications.soundLevel || 0))} dB
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Total Weight</div>
                    <div className="text-lg font-semibold text-blue-400">
                      {hvacComponents.reduce((sum, c) => sum + (c.specifications.weight || 0) * c.quantity, 0)} lbs
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Maintenance</div>
                    <div className="text-lg font-semibold text-purple-400">
                      {hvacComponents.filter(c => c.specifications.filterType).length} Filters
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Component Modal */}
        {showAddComponent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Add HVAC Component</h3>
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
                  {Object.entries(HVAC_DATABASE).map(([key, component]) => (
                    <div
                      key={key}
                      className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => addHVACComponent(key)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gray-800 rounded">
                          <Wind className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{component.name}</h4>
                          <p className="text-sm text-gray-400">{component.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-400">Capacity: {component.capacity.toLocaleString()} BTU/hr</span>
                        <span className="text-gray-400">Power: {component.power}W</span>
                        <span className="text-gray-400">Airflow: {component.airflow} CFM</span>
                        <span className="text-green-400">${component.cost.toLocaleString()}</span>
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