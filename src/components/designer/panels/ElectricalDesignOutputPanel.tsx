'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  FileText, 
  Download, 
  Calculator, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Printer,
  Settings,
  Grid,
  Lightbulb,
  Fan,
  Thermometer,
  Wifi,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Wind,
  Droplets,
  Flame,
  FileSpreadsheet
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useFacilityDesign } from '../context/FacilityDesignContext';
import { useNotifications } from '../context/NotificationContext';
import { ProfessionalDrawingExport } from '../export/ProfessionalDrawingExport';
import { logger } from '@/lib/client-logger';
import { NECComplianceChecker } from '@/lib/electrical/nec-compliance';
import { ElectricalExcelExporter, ElectricalScheduleData, LoadSummaryData, PanelScheduleData } from '@/lib/electrical/excel-export';

interface ElectricalComponent {
  id: string;
  type: 'lighting' | 'hvac' | 'exhaust-fan' | 'circulation-fan' | 'oscillating-fan' | 'dehumidifier' | 'humidifier' | 'sensor' | 'controller' | 'irrigation' | 'co2-system' | 'heater' | 'cooler' | 'ballast' | 'transformer' | 'ups' | 'monitor' | 'emergency' | 'vfd' | 'chiller' | 'boiler' | 'hrv' | 'other';
  name: string;
  voltage: number;
  current: number;
  power: number;
  quantity: number;
  circuitType: '120V' | '240V' | '277V' | '480V' | '208V-3P' | '480V-3P';
  wireGauge: string;
  breaker: string;
  cost: number;
  location: { x: number; y: number };
  isEditable?: boolean;
  isCustom?: boolean;
  phases?: number; // 1 or 3 phase
  powerFactor?: number; // For AC calculations
  gfciRequired?: boolean;
  wetLocation?: boolean;
  emergencySystem?: boolean;
  demandFactor?: number; // For load calculations
}

interface ElectricalDesignOutputPanelProps {
  onClose: () => void;
}

// Equipment database for additional loads
const EQUIPMENT_DATABASE = {
  'oscillating-fan': {
    name: 'Oscillating Fan',
    defaultPower: 75,
    voltage: 120,
    cost: 150,
    icon: Wind,
    description: 'Air circulation fan with oscillation'
  },
  'circulation-fan': {
    name: 'Circulation Fan',
    defaultPower: 100,
    voltage: 120,
    cost: 200,
    icon: Fan,
    description: 'Continuous air circulation'
  },
  'exhaust-fan': {
    name: 'Exhaust Fan',
    defaultPower: 200,
    voltage: 120,
    cost: 300,
    icon: Wind,
    description: 'Ventilation exhaust fan'
  },
  'dehumidifier': {
    name: 'Dehumidifier',
    defaultPower: 500,
    voltage: 120,
    cost: 800,
    icon: Droplets,
    description: 'Humidity control system'
  },
  'humidifier': {
    name: 'Humidifier',
    defaultPower: 300,
    voltage: 120,
    cost: 600,
    icon: Droplets,
    description: 'Humidity addition system'
  },
  'heater': {
    name: 'Space Heater',
    defaultPower: 1500,
    voltage: 240,
    cost: 400,
    icon: Flame,
    description: 'Supplemental heating'
  },
  'cooler': {
    name: 'Evaporative Cooler',
    defaultPower: 800,
    voltage: 120,
    cost: 1200,
    icon: Thermometer,
    description: 'Cooling system'
  },
  'irrigation': {
    name: 'Irrigation Pump',
    defaultPower: 750,
    voltage: 120,
    cost: 500,
    icon: Droplets,
    description: 'Water circulation system'
  },
  'co2-system': {
    name: 'CO2 Generator',
    defaultPower: 400,
    voltage: 120,
    cost: 1000,
    icon: Wind,
    description: 'CO2 supplementation'
  },
  'ballast': {
    name: 'LED Driver/Ballast',
    defaultPower: 200,
    voltage: 277,
    cost: 250,
    icon: Zap,
    description: 'LED driver for lighting systems'
  },
  'transformer': {
    name: 'Step-Down Transformer',
    defaultPower: 1000,
    voltage: 480,
    cost: 800,
    icon: Zap,
    description: 'Voltage transformation'
  },
  'ups': {
    name: 'UPS System',
    defaultPower: 1500,
    voltage: 120,
    cost: 1200,
    icon: Shield,
    description: 'Uninterruptible power supply'
  },
  'monitor': {
    name: 'Power Monitor',
    defaultPower: 50,
    voltage: 120,
    cost: 400,
    icon: Calculator,
    description: 'Energy monitoring system'
  },
  'emergency': {
    name: 'Emergency Lighting',
    defaultPower: 100,
    voltage: 120,
    cost: 300,
    icon: AlertTriangle,
    description: 'Emergency/exit lighting'
  },
  'vfd': {
    name: 'Variable Frequency Drive',
    defaultPower: 2000,
    voltage: 480,
    cost: 1500,
    icon: Settings,
    description: 'Motor speed control'
  },
  'chiller': {
    name: 'Chiller System',
    defaultPower: 5000,
    voltage: 480,
    cost: 8000,
    icon: Thermometer,
    description: 'Large-scale cooling system'
  },
  'boiler': {
    name: 'Electric Boiler',
    defaultPower: 4000,
    voltage: 480,
    cost: 6000,
    icon: Flame,
    description: 'Electric heating system'
  },
  'hrv': {
    name: 'Heat Recovery Ventilator',
    defaultPower: 300,
    voltage: 120,
    cost: 1200,
    icon: Wind,
    description: 'Energy recovery ventilation'
  }
};

export function ElectricalDesignOutputPanel({ onClose }: ElectricalDesignOutputPanelProps) {
  const { state } = useDesigner();
  const { objects, room, calculations } = state;
  const { updateSystem, state: facilityState } = useFacilityDesign();
  const { showNotification } = useNotifications();
  
  const [electricalComponents, setElectricalComponents] = useState<ElectricalComponent[]>([]);
  const [totalLoad, setTotalLoad] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [selectedOutputFormat, setSelectedOutputFormat] = useState<'pdf' | 'dwg' | 'xlsx'>('pdf');
  const [includeSpareCapacity, setIncludeSpareCapacity] = useState(true);
  const [spareCapacityPercent, setSpareCapacityPercent] = useState(25);
  const [showCircuitDetails, setShowCircuitDetails] = useState(false);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showProfessionalExport, setShowProfessionalExport] = useState(false);

  // Calculate electrical requirements from lighting layout
  useEffect(() => {
    const components: ElectricalComponent[] = [];
    let totalPower = 0;
    let totalCostEstimate = 0;

    // Process lighting fixtures
    const lightingFixtures = objects.filter(obj => obj.type === 'fixture');
    lightingFixtures.forEach((fixture, index) => {
      const power = fixture.wattage || 200; // Default wattage
      const voltage = power > 1000 ? 480 : (power > 500 ? 277 : 120);
      const current = power / voltage;
      const wireGauge = current > 20 ? '12 AWG' : (current > 15 ? '14 AWG' : '16 AWG');
      const breaker = current > 20 ? '30A' : (current > 15 ? '20A' : '15A');
      
      components.push({
        id: `lighting-${index}`,
        type: 'lighting',
        name: `${fixture.brand || 'LED'} Fixture ${fixture.model || ''}`,
        voltage,
        current,
        power,
        quantity: 1,
        circuitType: `${voltage}V` as any,
        wireGauge,
        breaker,
        cost: (fixture.price || 500) + (power * 0.5), // Installation cost estimate
        location: { x: fixture.x || 0, y: fixture.y || 0 },
        isEditable: true
      });
      
      totalPower += power;
      totalCostEstimate += (fixture.price || 500) + (power * 0.5);
    });

    // Process HVAC components (legacy format)
    const hvacUnits = objects.filter(obj => obj.type === 'hvac' || obj.type === 'fan');
    hvacUnits.forEach((unit, index) => {
      const power = unit.power || 1500; // Default HVAC power
      const voltage = power > 2000 ? 480 : 240;
      const current = power / voltage;
      const wireGauge = current > 30 ? '10 AWG' : (current > 20 ? '12 AWG' : '14 AWG');
      const breaker = current > 30 ? '40A' : (current > 20 ? '30A' : '20A');
      
      components.push({
        id: `hvac-${index}`,
        type: unit.type === 'fan' ? 'fan' : 'hvac',
        name: `${unit.type === 'fan' ? 'Exhaust Fan' : 'HVAC Unit'} ${index + 1}`,
        voltage,
        current,
        power,
        quantity: 1,
        circuitType: `${voltage}V` as any,
        wireGauge,
        breaker,
        cost: 800 + (power * 0.3), // Installation cost estimate
        location: { x: unit.x || 0, y: unit.y || 0 },
        isEditable: true
      });
      
      totalPower += power;
      totalCostEstimate += 800 + (power * 0.3);
    });

    // Process equipment from expanded databases (HVAC, fans, dehumidifiers, etc.)
    const equipmentUnits = objects.filter(obj => obj.type === 'equipment');
    equipmentUnits.forEach((unit, index) => {
      // Extract electrical specifications from the unit
      let power, voltage, phases, powerFactor, wireGauge, breaker, cost, equipmentName, equipmentType;
      
      if (unit.equipmentType === 'hvac') {
        // HVAC equipment with full specifications
        power = unit.watts || unit.power || 1500;
        voltage = unit.voltage || (power > 2000 ? 480 : 240);
        phases = unit.phase || (voltage >= 480 ? 3 : 1);
        powerFactor = 0.85; // Typical for HVAC
        equipmentName = unit.name || `HVAC Unit ${index + 1}`;
        equipmentType = 'hvac';
        cost = unit.price || 2500;
      } else if (unit.equipmentType === 'fan') {
        // Fan equipment
        power = unit.watts || unit.power || 200;
        voltage = unit.voltage || 120;
        phases = unit.phase || 1;
        powerFactor = 0.9; // Typical for fans
        equipmentName = unit.name || `Fan ${index + 1}`;
        equipmentType = unit.category === 'Exhaust' ? 'exhaust-fan' : 'circulation-fan';
        cost = unit.price || 400;
      } else if (unit.equipmentType === 'dehumidifier') {
        // Dehumidifier equipment
        power = unit.watts || unit.power || 1000;
        voltage = unit.voltage || 120;
        phases = unit.phase || 1;
        powerFactor = 0.85; // Typical for dehumidifiers
        equipmentName = unit.name || `Dehumidifier ${index + 1}`;
        equipmentType = 'dehumidifier';
        cost = unit.price || 2000;
      } else if (unit.equipmentType === 'co2') {
        // CO2 equipment
        power = unit.watts || unit.power || 300;
        voltage = unit.voltage || 120;
        phases = unit.phase || 1;
        powerFactor = 1.0; // Resistive load
        equipmentName = unit.name || `CO2 System ${index + 1}`;
        equipmentType = 'co2-system';
        cost = unit.price || 800;
      } else if (unit.equipmentType === 'controller') {
        // Environmental controllers
        power = unit.watts || unit.power || 50;
        voltage = unit.voltage || 120;
        phases = unit.phase || 1;
        powerFactor = 1.0; // Electronic load
        equipmentName = unit.name || `Controller ${index + 1}`;
        equipmentType = 'controller';
        cost = unit.price || 1200;
      } else if (unit.equipmentType === 'irrigation' || unit.equipmentType === 'pump') {
        // Irrigation and pump systems
        power = unit.watts || unit.power || 750;
        voltage = unit.voltage || 240;
        phases = unit.phase || 1;
        powerFactor = 0.8; // Motor load
        equipmentName = unit.name || `Irrigation System ${index + 1}`;
        equipmentType = 'irrigation';
        cost = unit.price || 800;
      } else if (unit.equipmentType === 'sensor' || unit.equipmentType === 'monitor') {
        // Environmental sensors and monitoring
        power = unit.watts || unit.power || 25;
        voltage = unit.voltage || 24; // Low voltage sensors
        phases = 1;
        powerFactor = 1.0; // Electronic load
        equipmentName = unit.name || `Sensor System ${index + 1}`;
        equipmentType = 'sensor';
        cost = unit.price || 300;
      } else if (unit.equipmentType === 'ups' || unit.equipmentType === 'backup') {
        // Uninterruptible power supply
        power = unit.watts || unit.power || 1500;
        voltage = unit.voltage || 120;
        phases = unit.phase || 1;
        powerFactor = 0.9; // UPS power factor
        equipmentName = unit.name || `UPS System ${index + 1}`;
        equipmentType = 'ups';
        cost = unit.price || 2000;
      } else if (unit.equipmentType === 'transformer') {
        // Transformers
        power = unit.watts || unit.power || 3000;
        voltage = unit.voltage || 480;
        phases = unit.phase || 3;
        powerFactor = 0.95; // Transformer efficiency
        equipmentName = unit.name || `Transformer ${index + 1}`;
        equipmentType = 'transformer';
        cost = unit.price || 1500;
      } else if (unit.equipmentType === 'chiller') {
        // Large chiller systems
        power = unit.watts || unit.power || 15000;
        voltage = unit.voltage || 480;
        phases = unit.phase || 3;
        powerFactor = 0.85; // Chiller power factor
        equipmentName = unit.name || `Chiller System ${index + 1}`;
        equipmentType = 'chiller';
        cost = unit.price || 25000;
      } else {
        // Generic equipment fallback
        power = unit.watts || unit.power || 500;
        voltage = unit.voltage || 120;
        phases = unit.phase || 1;
        powerFactor = 1.0;
        equipmentName = unit.name || `Equipment ${index + 1}`;
        equipmentType = 'other';
        cost = unit.price || 1000;
      }

      // Calculate electrical parameters
      const current = phases === 3 
        ? power / (voltage * Math.sqrt(3) * powerFactor)
        : power / (voltage * powerFactor);
      
      wireGauge = calculateWireGauge(current, voltage, phases);
      breaker = calculateBreakerSize(current, phases);
      const circuitType = phases === 3 ? `${voltage}V-3P` : `${voltage}V`;
      
      // Determine special requirements
      const gfciRequired = ['dehumidifier', 'irrigation'].includes(unit.equipmentType);
      const wetLocation = ['dehumidifier', 'irrigation'].includes(unit.equipmentType);
      const demandFactor = calculateDemandFactor(equipmentType);
      const isMotor = ['hvac', 'fan', 'pump', 'irrigation', 'chiller'].includes(unit.equipmentType);
      const isContinuous = !['irrigation', 'co2-system'].includes(unit.equipmentType);

      // Perform NEC compliance check
      const necCompliance = NECComplianceChecker.performCompleteComplianceCheck({
        type: equipmentType,
        power,
        voltage,
        current,
        phases,
        isMotor,
        isContinuous,
        isWetLocation: wetLocation
      }, Math.sqrt(Math.pow(unit.x || 0, 2) + Math.pow(unit.y || 0, 2))); // Distance from origin

      components.push({
        id: `equipment-${unit.equipmentType}-${index}`,
        type: equipmentType as any,
        name: equipmentName,
        voltage,
        current,
        power,
        quantity: 1,
        circuitType: circuitType as any,
        wireGauge,
        breaker,
        cost: cost + (power * 0.2), // Add installation cost
        location: { x: unit.x || 0, y: unit.y || 0 },
        isEditable: true,
        phases,
        powerFactor,
        gfciRequired,
        wetLocation,
        demandFactor,
        necCompliance, // Add NEC compliance data
        isMotor,
        isContinuous
      });
      
      totalPower += power * demandFactor;
      totalCostEstimate += cost + (power * 0.2);
    });

    // Process irrigation components (pumps, controllers, valves)
    const irrigationUnits = objects.filter(obj => obj.type === 'irrigation' || obj.type === 'pump');
    irrigationUnits.forEach((unit, index) => {
      const power = unit.power || 750; // Default irrigation pump power
      const voltage = power > 1000 ? 240 : 120;
      const current = power / voltage;
      const wireGauge = current > 20 ? '12 AWG' : (current > 15 ? '14 AWG' : '16 AWG');
      const breaker = current > 20 ? '30A' : (current > 15 ? '20A' : '15A');
      
      components.push({
        id: `irrigation-${index}`,
        type: 'irrigation',
        name: `Irrigation Pump ${index + 1}`,
        voltage,
        current,
        power,
        quantity: 1,
        circuitType: `${voltage}V` as any,
        wireGauge,
        breaker,
        cost: 600 + (power * 0.4), // Installation cost estimate
        location: { x: unit.x || 0, y: unit.y || 0 },
        isEditable: true,
        gfciRequired: true, // GFCI required for water/electrical
        wetLocation: true,
        demandFactor: 0.8 // Irrigation systems don't run continuously
      });
      
      totalPower += power;
      totalCostEstimate += 600 + (power * 0.4);
    });

    // Add control systems
    if (components.length > 0) {
      components.push({
        id: 'controller-main',
        type: 'controller',
        name: 'Main Environmental Controller',
        voltage: 120,
        current: 2,
        power: 240,
        quantity: 1,
        circuitType: '120V',
        wireGauge: '14 AWG',
        breaker: '15A',
        cost: 2500,
        location: { x: room.width * 0.1, y: room.height * 0.1 },
        isEditable: true
      });
      
      totalPower += 240;
      totalCostEstimate += 2500;
    }

    // Add sensors
    if (components.length > 0) {
      const sensorCount = Math.max(1, Math.floor((room.width * room.height) / 100));
      components.push({
        id: 'sensors',
        type: 'sensor',
        name: 'Environmental Sensors',
        voltage: 24,
        current: 0.5,
        power: 12,
        quantity: sensorCount,
        circuitType: '120V',
        wireGauge: '18 AWG',
        breaker: '15A',
        cost: 150 * sensorCount,
        location: { x: room.width * 0.5, y: room.height * 0.5 },
        isEditable: true
      });
      
      totalPower += 12 * sensorCount;
      totalCostEstimate += 150 * sensorCount;
    }

    // Calculate demand load (more accurate than connected load)
    const demandLoad = components.reduce((sum, comp) => {
      const demandFactor = comp.demandFactor || 1.0;
      return sum + (comp.power * comp.quantity * demandFactor);
    }, 0);

    // Add spare capacity
    const finalLoad = includeSpareCapacity 
      ? demandLoad * (1 + spareCapacityPercent / 100)
      : demandLoad;
    
    const finalCost = includeSpareCapacity 
      ? totalCostEstimate * 1.2 
      : totalCostEstimate;

    setElectricalComponents(components);
    setTotalLoad(finalLoad);
    setTotalCost(finalCost);
    
    // Update facility design context with electrical system data
    updateSystem('electrical-system', {
      id: 'electrical-system',
      type: 'electrical',
      status: 'configured',
      loads: {
        electrical: finalLoad,
        thermal: 0,
        structural: 0,
        water: 0
      },
      costs: {
        equipment: components.reduce((sum, comp) => sum + comp.cost * comp.quantity, 0),
        installation: finalCost - components.reduce((sum, comp) => sum + comp.cost * comp.quantity, 0),
        maintenance: finalCost * 0.02, // 2% annual maintenance
        energy: finalLoad * 8760 / 1000 * 0.12 // Annual energy cost
      },
      components: components,
      dependencies: [],
      conflicts: [],
      lastUpdated: new Date(),
      data: {
        totalLoad: finalLoad,
        mainBreaker: finalLoad > 10000 ? '100A' : '60A',
        voltage: '120/240V Single Phase',
        spareCapacity: includeSpareCapacity ? spareCapacityPercent : 0,
        circuitCount: components.length
      }
    });
  }, [objects, room, includeSpareCapacity, spareCapacityPercent]);

  const generateElectricalDrawing = () => {
    return {
      title: `Electrical Design - ${room.name || 'Cultivation Room'}`,
      dimensions: `${room.width}' x ${room.height}' x ${room.ceilingHeight || 10}'`,
      totalLoad: `${totalLoad.toFixed(0)} W`,
      voltage: '120/240V Single Phase',
      mainBreaker: totalLoad > 10000 ? '100A' : '60A',
      components: electricalComponents,
      wireRun: calculateWireRuns(),
      circuitSchedule: generateCircuitSchedule(),
      costBreakdown: generateCostBreakdown()
    };
  };

  const calculateWireRuns = () => {
    // Calculate wire runs based on component locations
    const runs = electricalComponents.map(comp => {
      const distance = Math.sqrt(
        Math.pow(comp.location.x - room.width * 0.1, 2) + 
        Math.pow(comp.location.y - room.height * 0.1, 2)
      );
      return {
        component: comp.name,
        distance: Math.ceil(distance + 10), // Add 10ft for routing
        wireType: comp.wireGauge,
        conduit: comp.voltage > 240 ? 'EMT' : 'NM Cable'
      };
    });
    return runs;
  };

  const generateCircuitSchedule = () => {
    const schedule = electricalComponents.map((comp, index) => ({
      circuit: index + 1,
      description: comp.name,
      voltage: comp.voltage,
      current: comp.current.toFixed(1),
      breaker: comp.breaker,
      wire: comp.wireGauge,
      conduit: comp.voltage > 240 ? 'EMT' : 'NM'
    }));
    return schedule;
  };

  const generateCostBreakdown = () => {
    const breakdown = {
      lighting: electricalComponents.filter(c => c.type === 'lighting' || c.type === 'ballast').reduce((sum, c) => sum + c.cost, 0),
      hvac: electricalComponents.filter(c => 
        c.type === 'hvac' || c.type === 'fan' || c.type === 'exhaust-fan' || 
        c.type === 'circulation-fan' || c.type === 'oscillating-fan' || 
        c.type === 'dehumidifier' || c.type === 'humidifier' || 
        c.type === 'heater' || c.type === 'cooler' || c.type === 'chiller' || 
        c.type === 'boiler' || c.type === 'hrv' || c.type === 'vfd'
      ).reduce((sum, c) => sum + c.cost, 0),
      controls: electricalComponents.filter(c => 
        c.type === 'controller' || c.type === 'sensor' || c.type === 'monitor' || c.type === 'ups'
      ).reduce((sum, c) => sum + c.cost, 0),
      irrigation: electricalComponents.filter(c => c.type === 'irrigation' || c.type === 'co2-system').reduce((sum, c) => sum + c.cost, 0),
      electrical: electricalComponents.filter(c => c.type === 'transformer' || c.type === 'emergency').reduce((sum, c) => sum + c.cost, 0),
      materials: totalCost * 0.15, // 15% for wire, conduit, etc.
      labor: totalCost * 0.25, // 25% for installation labor
      permits: totalCost > 20000 ? 1000 : 500, // Higher permits for larger installations
      contingency: totalCost * 0.1 // 10% contingency
    };
    return breakdown;
  };

  const handleExportDrawing = () => {
    const drawing = generateElectricalDrawing();
    const blob = new Blob([JSON.stringify(drawing, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electrical-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    try {
      // Prepare circuit data
      const circuits = electricalComponents.map((comp, index) => ({
        circuit: index + 1,
        description: comp.name,
        load: comp.power * comp.quantity,
        voltage: comp.voltage,
        current: comp.current,
        phases: comp.phases || 1,
        wireGauge: comp.wireGauge,
        breaker: comp.breaker,
        conduit: comp.voltage > 240 ? 'EMT' : 'NM Cable',
        gfci: comp.gfciRequired || false,
        notes: [
          comp.wetLocation ? 'Wet Location' : '',
          comp.emergencySystem ? 'Emergency System' : '',
          comp.phases === 3 ? '3-Phase' : '',
          comp.demandFactor && comp.demandFactor !== 1.0 ? `${Math.round(comp.demandFactor * 100)}% Demand` : ''
        ].filter(Boolean).join(', ')
      }));

      // Prepare load summary by category
      const loadSummaryMap = new Map();
      electricalComponents.forEach(comp => {
        const category = comp.type === 'lighting' ? 'Lighting' : 
                        ['hvac', 'chiller'].includes(comp.type) ? 'HVAC' :
                        ['fan', 'exhaust-fan', 'circulation-fan'].includes(comp.type) ? 'Ventilation' :
                        ['dehumidifier', 'humidifier'].includes(comp.type) ? 'Humidity Control' :
                        ['controller', 'sensor', 'monitor'].includes(comp.type) ? 'Controls' :
                        comp.type === 'irrigation' ? 'Irrigation' :
                        comp.type === 'co2-system' ? 'CO2 Systems' :
                        'Other Equipment';
        
        if (!loadSummaryMap.has(category)) {
          loadSummaryMap.set(category, { connectedLoad: 0, demandLoad: 0, count: 0 });
        }
        
        const data = loadSummaryMap.get(category);
        const power = comp.power * comp.quantity;
        data.connectedLoad += power;
        data.demandLoad += power * (comp.demandFactor || 1.0);
        data.count++;
      });

      const totalDemandLoad = Array.from(loadSummaryMap.values()).reduce((sum, cat) => sum + cat.demandLoad, 0);
      
      const loadSummary = Array.from(loadSummaryMap.entries()).map(([category, data]) => ({
        category,
        connectedLoad: data.connectedLoad,
        demandFactor: data.demandLoad / data.connectedLoad,
        demandLoad: data.demandLoad,
        percentage: (data.demandLoad / totalDemandLoad) * 100
      }));

      // Panel data
      const panelData = {
        panel: 'EP-1',
        mainBreaker: totalLoad > 20000 ? '125A' : totalLoad > 10000 ? '100A' : '60A',
        voltage: totalLoad > 20000 ? '120/208V 3-Phase' : '120/240V Single Phase',
        phases: totalLoad > 20000 ? 3 : 1,
        totalLoad: totalLoad,
        spareCapacity: spareCapacityPercent,
        circuits
      };

      // Generate Excel file
      const excelBuffer = ElectricalExcelExporter.generateElectricalScheduleWorkbook(
        room.name || 'VibeLux Electrical Design',
        circuits,
        loadSummary,
        panelData
      );

      // Download file
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `electrical-schedule-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      showNotification('success', 'Excel file exported successfully');
    } catch (error) {
      logger.error('system', 'Excel export error:', error );
      showNotification('error', 'Failed to export Excel file');
    }
  };

  const costBreakdown = generateCostBreakdown();

  // Add equipment function
  const addEquipment = (equipmentType: string, quantity: number = 1) => {
    const equipment = EQUIPMENT_DATABASE[equipmentType as keyof typeof EQUIPMENT_DATABASE];
    if (!equipment) return;

    const power = equipment.defaultPower;
    const voltage = equipment.voltage;
    const phases = voltage >= 480 ? 3 : 1;
    const powerFactor = ['vfd', 'chiller', 'boiler'].includes(equipmentType) ? 0.85 : 1.0;
    
    // Calculate current based on phases
    const current = phases === 3 
      ? power / (voltage * Math.sqrt(3) * powerFactor)
      : power / (voltage * powerFactor);
    
    // Enhanced wire sizing logic
    const wireGauge = calculateWireGauge(current, voltage, phases);
    const breaker = calculateBreakerSize(current, phases);
    const circuitType = phases === 3 ? `${voltage}V-3P` : `${voltage}V`;
    
    // Determine special requirements
    const gfciRequired = ['irrigation', 'humidifier', 'dehumidifier'].includes(equipmentType);
    const wetLocation = ['irrigation', 'humidifier'].includes(equipmentType);
    const emergencySystem = equipmentType === 'emergency';
    const demandFactor = calculateDemandFactor(equipmentType);

    const newComponent: ElectricalComponent = {
      id: `custom-${Date.now()}`,
      type: equipmentType as any,
      name: equipment.name,
      voltage,
      current,
      power,
      quantity,
      circuitType: circuitType as any,
      wireGauge,
      breaker,
      cost: equipment.cost * quantity,
      location: { x: room.width * 0.5, y: room.height * 0.5 },
      isEditable: true,
      isCustom: true,
      phases,
      powerFactor,
      gfciRequired,
      wetLocation,
      emergencySystem,
      demandFactor
    };

    setElectricalComponents(prev => [...prev, newComponent]);
    setShowAddEquipment(false);
  };

  // Enhanced wire sizing calculation
  const calculateWireGauge = (current: number, voltage: number, phases: number): string => {
    const ampacity = current * 1.25; // 125% for continuous loads
    
    if (phases === 3) {
      if (ampacity > 100) return '2 AWG';
      if (ampacity > 75) return '4 AWG';
      if (ampacity > 55) return '6 AWG';
      if (ampacity > 40) return '8 AWG';
      if (ampacity > 30) return '10 AWG';
      return '12 AWG';
    } else {
      if (ampacity > 30) return '10 AWG';
      if (ampacity > 20) return '12 AWG';
      if (ampacity > 15) return '14 AWG';
      return '16 AWG';
    }
  };

  // Enhanced breaker sizing
  const calculateBreakerSize = (current: number, phases: number): string => {
    const breakerSize = Math.ceil(current * 1.25 / 5) * 5; // Round up to nearest 5A
    return phases === 3 ? `${breakerSize}A-3P` : `${breakerSize}A`;
  };

  // Demand factor calculation per NEC and industry standards
  const calculateDemandFactor = (equipmentType: string): number => {
    const demandFactors: Record<string, number> = {
      'lighting': 1.0,            // Continuous load per NEC 210.20(A)
      'hvac': 1.0,               // HVAC systems typically continuous
      'chiller': 1.0,            // Large refrigeration equipment continuous
      'boiler': 1.0,             // Heating equipment continuous
      'circulation-fan': 0.8,     // Fans may cycle
      'oscillating-fan': 0.75,   // Oscillating fans intermittent
      'exhaust-fan': 0.85,       // Exhaust fans mostly continuous
      'dehumidifier': 0.9,       // Dehumidifiers run most of the time
      'humidifier': 0.85,        // Humidifiers seasonal/intermittent
      'irrigation': 0.7,         // Irrigation systems cycle on/off
      'co2-system': 0.6,         // CO2 systems intermittent during light hours
      'controller': 1.0,         // Control systems continuous
      'sensor': 1.0,             // Sensors continuous
      'ups': 1.0,                // UPS systems continuous
      'transformer': 1.0,        // Transformers continuous when loaded
      'emergency': 1.0,          // Emergency systems must be available
      'monitor': 1.0,            // Monitoring systems continuous
      'other': 0.8              // Conservative factor for unknown equipment
    };
    return demandFactors[equipmentType] || 0.8;
  };

  // Edit component function
  const editComponent = (componentId: string, updates: Partial<ElectricalComponent>) => {
    setElectricalComponents(prev => 
      prev.map(comp => {
        if (comp.id === componentId) {
          const updated = { ...comp, ...updates };
          // Recalculate dependent values
          if (updates.power || updates.voltage) {
            updated.current = updated.power / updated.voltage;
            updated.wireGauge = updated.current > 20 ? '12 AWG' : (updated.current > 15 ? '14 AWG' : '16 AWG');
            updated.breaker = updated.current > 20 ? '30A' : (updated.current > 15 ? '20A' : '15A');
          }
          return updated;
        }
        return comp;
      })
    );
    setEditingComponent(null);
  };

  // Delete component function
  const deleteComponent = (componentId: string) => {
    setElectricalComponents(prev => prev.filter(comp => comp.id !== componentId));
  };

  // Duplicate component function
  const duplicateComponent = (componentId: string) => {
    const component = electricalComponents.find(comp => comp.id === componentId);
    if (!component) return;

    const newComponent: ElectricalComponent = {
      ...component,
      id: `duplicate-${Date.now()}`,
      name: `${component.name} (Copy)`,
      location: { x: component.location.x + 5, y: component.location.y + 5 },
      isEditable: true,
      isCustom: true
    };

    setElectricalComponents(prev => [...prev, newComponent]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Electrical Design Output</h2>
              <p className="text-gray-400">Generate electrical drawings and cost estimates</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAdvancedMode(!advancedMode)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                advancedMode 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {advancedMode ? 'Advanced' : 'Basic'}
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
              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Output Format</label>
                <select
                  value={selectedOutputFormat}
                  onChange={(e) => setSelectedOutputFormat(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="pdf">PDF Drawings</option>
                  <option value="dwg">AutoCAD DWG</option>
                  <option value="xlsx">Excel Schedule</option>
                </select>
              </div>

              {/* Spare Capacity */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <input
                    type="checkbox"
                    checked={includeSpareCapacity}
                    onChange={(e) => setIncludeSpareCapacity(e.target.checked)}
                    className="rounded"
                  />
                  Include Spare Capacity
                </label>
                {includeSpareCapacity && (
                  <div className="ml-6">
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={spareCapacityPercent}
                      onChange={(e) => setSpareCapacityPercent(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-400">{spareCapacityPercent}% spare capacity</span>
                  </div>
                )}
              </div>

              {/* Enhanced Load Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Load Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Connected Load:</span>
                    <span className="text-white font-medium">{electricalComponents.reduce((sum, c) => sum + c.power * c.quantity, 0).toFixed(0)} W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Demand Load:</span>
                    <span className="text-white font-medium">{totalLoad.toFixed(0)} W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Single Phase:</span>
                    <span className="text-white font-medium">{(totalLoad / 240).toFixed(1)} A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Three Phase:</span>
                    <span className="text-white font-medium">{(totalLoad / (208 * Math.sqrt(3))).toFixed(1)} A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Main Breaker:</span>
                    <span className="text-white font-medium">{totalLoad > 20000 ? '125A' : totalLoad > 10000 ? '100A' : '60A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Service:</span>
                    <span className="text-white font-medium">
                      {totalLoad > 20000 ? '120/208V 3-Phase' : totalLoad > 10000 ? '120/240V Single' : '120/240V Single'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Cost Estimate</h3>
                  <button
                    onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {showCostBreakdown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Cost:</span>
                    <span className="text-white font-medium">${totalCost.toLocaleString()}</span>
                  </div>
                  {showCostBreakdown && (
                    <div className="mt-3 pt-3 border-t border-gray-700 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Lighting:</span>
                        <span className="text-white">${costBreakdown.lighting.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">HVAC:</span>
                        <span className="text-white">${costBreakdown.hvac.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Controls:</span>
                        <span className="text-white">${costBreakdown.controls.toLocaleString()}</span>
                      </div>
                      {costBreakdown.irrigation > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Irrigation/CO2:</span>
                          <span className="text-white">${costBreakdown.irrigation.toLocaleString()}</span>
                        </div>
                      )}
                      {costBreakdown.electrical > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Electrical:</span>
                          <span className="text-white">${costBreakdown.electrical.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Materials:</span>
                        <span className="text-white">${costBreakdown.materials.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Labor:</span>
                        <span className="text-white">${costBreakdown.labor.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Permits:</span>
                        <span className="text-white">${costBreakdown.permits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Contingency:</span>
                        <span className="text-white">${costBreakdown.contingency.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Equipment Management */}
              {advancedMode && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Equipment Management</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowAddEquipment(true)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Equipment
                    </button>
                    <div className="text-xs text-gray-400">
                      Add oscillating fans, dehumidifiers, heaters, and other equipment to your electrical design
                    </div>
                  </div>
                </div>
              )}

              {/* Safety & Compliance */}
              {advancedMode && (
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-200 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Safety & Compliance
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-200">GFCI Protected:</span>
                      <span className="text-yellow-100">
                        {electricalComponents.filter(c => c.gfciRequired).length} circuits
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-200">Wet Locations:</span>
                      <span className="text-yellow-100">
                        {electricalComponents.filter(c => c.wetLocation).length} circuits
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-200">Emergency Systems:</span>
                      <span className="text-yellow-100">
                        {electricalComponents.filter(c => c.emergencySystem).length} circuits
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-200">Three-Phase:</span>
                      <span className="text-yellow-100">
                        {electricalComponents.filter(c => c.phases === 3).length} circuits
                      </span>
                    </div>
                    <div className="mt-3 p-2 bg-yellow-800/30 rounded">
                      <p className="text-xs text-yellow-200">
                        <strong>Arc Flash Notice:</strong> Equipment over 50kVA requires arc flash analysis per NFPA 70E
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Export Options */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowProfessionalExport(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Professional Drawing
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Excel Schedule
                </button>
                <button
                  onClick={handleExportDrawing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Data (JSON)
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Preview
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Component List & Circuit Schedule */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Component List */}
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Electrical Components</h3>
                  <button
                    onClick={() => setShowCircuitDetails(!showCircuitDetails)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {showCircuitDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                <div className="space-y-2">
                  {electricalComponents.map((component) => (
                    <div key={component.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg group">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gray-700 rounded">
                          {component.type === 'lighting' && <Lightbulb className="w-4 h-4 text-yellow-400" />}
                          {component.type === 'hvac' && <Thermometer className="w-4 h-4 text-blue-400" />}
                          {(component.type === 'fan' || component.type === 'exhaust-fan' || component.type === 'circulation-fan') && <Fan className="w-4 h-4 text-green-400" />}
                          {component.type === 'oscillating-fan' && <Wind className="w-4 h-4 text-cyan-400" />}
                          {(component.type === 'dehumidifier' || component.type === 'humidifier') && <Droplets className="w-4 h-4 text-blue-400" />}
                          {component.type === 'heater' && <Flame className="w-4 h-4 text-red-400" />}
                          {component.type === 'controller' && <Settings className="w-4 h-4 text-purple-400" />}
                          {component.type === 'sensor' && <Wifi className="w-4 h-4 text-orange-400" />}
                          {(component.type === 'ballast' || component.type === 'transformer') && <Zap className="w-4 h-4 text-yellow-400" />}
                          {component.type === 'ups' && <Shield className="w-4 h-4 text-green-400" />}
                          {component.type === 'monitor' && <Calculator className="w-4 h-4 text-blue-400" />}
                          {component.type === 'emergency' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                          {component.type === 'vfd' && <Settings className="w-4 h-4 text-purple-400" />}
                          {component.type === 'chiller' && <Thermometer className="w-4 h-4 text-cyan-400" />}
                          {component.type === 'boiler' && <Flame className="w-4 h-4 text-orange-400" />}
                          {component.type === 'hrv' && <Wind className="w-4 h-4 text-green-400" />}
                        </div>
                        <div className="flex-1">
                          {editingComponent === component.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={component.name}
                                onChange={(e) => editComponent(component.id, { name: e.target.value })}
                                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={component.power}
                                  onChange={(e) => editComponent(component.id, { power: Number(e.target.value) })}
                                  className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                                  placeholder="Power"
                                />
                                <input
                                  type="number"
                                  value={component.voltage}
                                  onChange={(e) => editComponent(component.id, { voltage: Number(e.target.value) })}
                                  className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                                  placeholder="Voltage"
                                />
                                <input
                                  type="number"
                                  value={component.quantity}
                                  onChange={(e) => editComponent(component.id, { quantity: Number(e.target.value) })}
                                  className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                                  placeholder="Qty"
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-white font-medium">{component.name}</div>
                              {showCircuitDetails && (
                                <div className="text-sm text-gray-400">
                                  {component.power}W • {component.voltage}V • {component.current.toFixed(1)}A • {component.wireGauge}
                                  {component.quantity > 1 && ` • Qty: ${component.quantity}`}
                                  {component.phases === 3 && ` • 3-Phase`}
                                  {component.gfciRequired && ` • GFCI`}
                                  {component.wetLocation && ` • Wet Location`}
                                  {component.emergencySystem && ` • Emergency`}
                                  {component.demandFactor && component.demandFactor !== 1.0 && ` • ${Math.round(component.demandFactor * 100)}% Demand`}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-white font-medium">${component.cost.toLocaleString()}</div>
                          {showCircuitDetails && (
                            <div className="text-sm text-gray-400">{component.breaker}</div>
                          )}
                        </div>
                        {advancedMode && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {editingComponent === component.id ? (
                              <button
                                onClick={() => setEditingComponent(null)}
                                className="p-1 bg-green-600 hover:bg-green-700 rounded text-white"
                                title="Save"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setEditingComponent(component.id)}
                                className="p-1 bg-gray-600 hover:bg-gray-500 rounded text-white"
                                title="Edit"
                                disabled={!component.isEditable && !component.isCustom}
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => duplicateComponent(component.id)}
                              className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                              title="Duplicate"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {component.isCustom && (
                              <button
                                onClick={() => deleteComponent(component.id)}
                                className="p-1 bg-red-600 hover:bg-red-700 rounded text-white"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Circuit Schedule */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Circuit Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-2 text-gray-400">Circuit</th>
                        <th className="text-left p-2 text-gray-400">Description</th>
                        <th className="text-left p-2 text-gray-400">Voltage</th>
                        <th className="text-left p-2 text-gray-400">Current</th>
                        <th className="text-left p-2 text-gray-400">Breaker</th>
                        <th className="text-left p-2 text-gray-400">Wire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateCircuitSchedule().map((circuit, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="p-2 text-white">{circuit.circuit}</td>
                          <td className="p-2 text-white">{circuit.description}</td>
                          <td className="p-2 text-white">{circuit.voltage}V</td>
                          <td className="p-2 text-white">{circuit.current}A</td>
                          <td className="p-2 text-white">{circuit.breaker}</td>
                          <td className="p-2 text-white">{circuit.wire}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Safety Notes */}
              <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-yellow-200">Safety & Code Compliance</h3>
                </div>
                <ul className="text-sm text-yellow-200 space-y-1">
                  <li>• All electrical work must be performed by licensed electricians</li>
                  <li>• Designs must comply with local electrical codes (NEC, local amendments)</li>
                  <li>• Permits required for installations over 1000W</li>
                  <li>• GFCI protection required in wet locations</li>
                  <li>• Proper grounding and bonding required for all equipment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Add Equipment Modal */}
        {showAddEquipment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Add Equipment</h3>
                  <button
                    onClick={() => setShowAddEquipment(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(EQUIPMENT_DATABASE).map(([key, equipment]) => (
                    <div
                      key={key}
                      className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => addEquipment(key)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gray-800 rounded">
                          <equipment.icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{equipment.name}</h4>
                          <p className="text-sm text-gray-400">{equipment.description}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Power: {equipment.defaultPower}W</span>
                        <span className="text-gray-400">Voltage: {equipment.voltage}V</span>
                        <span className="text-green-400">${equipment.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
                  <h4 className="text-blue-400 font-medium mb-2">Custom Equipment</h4>
                  <p className="text-sm text-blue-300 mb-3">
                    Add any equipment type by selecting one above and then editing its properties in Advanced mode.
                  </p>
                  <div className="text-xs text-blue-400">
                    💡 Tip: You can duplicate and modify existing equipment to create custom configurations
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Professional Drawing Export Modal */}
        {showProfessionalExport && (
          <ProfessionalDrawingExport
            isOpen={showProfessionalExport}
            onClose={() => setShowProfessionalExport(false)}
          />
        )}
      </div>
    </div>
  );
}