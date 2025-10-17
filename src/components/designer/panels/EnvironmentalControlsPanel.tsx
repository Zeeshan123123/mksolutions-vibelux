'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Zap,
  Settings,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Activity,
  Clock,
  FileText,
  Download,
  Eye,
  EyeOff,
  Gauge,
  Wifi,
  Shield,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useFacilityDesign } from '../context/FacilityDesignContext';

interface EnvironmentalControlDevice {
  id: string;
  type: 'sensor' | 'controller' | 'hvac' | 'lighting' | 'irrigation' | 'co2' | 'dehumidifier' | 'humidifier' | 'exhaust-fan' | 'circulation-fan' | 'heater' | 'cooler';
  name: string;
  parameter: 'temperature' | 'humidity' | 'co2' | 'light' | 'airflow' | 'ph' | 'ec' | 'oxygen' | 'pressure';
  setpoint?: number;
  tolerance?: number;
  currentValue?: number;
  unit: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  location: { x: number; y: number };
  specifications: {
    range?: { min: number; max: number };
    accuracy?: number;
    resolution?: number;
    response_time?: number; // seconds
    communication?: string;
    power?: number; // watts
    voltage?: number;
  };
  controlLogic?: {
    deadband?: number;
    pid_settings?: { kp: number; ki: number; kd: number };
    schedule?: any[];
    failsafe?: any;
  };
  isEditable?: boolean;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

interface EnvironmentalZone {
  id: string;
  name: string;
  area: number; // sq ft
  targetConditions: {
    temperature: { min: number; max: number; optimal: number };
    humidity: { min: number; max: number; optimal: number };
    co2: { min: number; max: number; optimal: number };
    light: { min: number; max: number; optimal: number };
    airflow: { min: number; max: number; optimal: number };
  };
  currentConditions: {
    temperature: number;
    humidity: number;
    co2: number;
    light: number;
    airflow: number;
  };
  devices: EnvironmentalControlDevice[];
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
  cropType: string;
}

interface EnvironmentalControlsPanelProps {
  onClose: () => void;
}

// Environmental control device database
const ENVIRONMENTAL_DEVICES = {
  'temp-humidity-sensor': {
    name: 'Temperature/Humidity Sensor',
    parameter: 'temperature',
    unit: '°F / %RH',
    range: { min: -40, max: 185 },
    accuracy: 0.5,
    power: 5,
    voltage: 24,
    cost: 150,
    description: 'High-precision temp/humidity sensor'
  },
  'co2-sensor': {
    name: 'CO2 Sensor',
    parameter: 'co2',
    unit: 'ppm',
    range: { min: 0, max: 5000 },
    accuracy: 50,
    power: 12,
    voltage: 24,
    cost: 300,
    description: 'NDIR CO2 sensor'
  },
  'light-sensor': {
    name: 'Light Sensor (PPFD)',
    parameter: 'light',
    unit: 'μmol/m²/s',
    range: { min: 0, max: 2000 },
    accuracy: 5,
    power: 3,
    voltage: 24,
    cost: 200,
    description: 'Quantum PAR sensor'
  },
  'airflow-sensor': {
    name: 'Airflow Sensor',
    parameter: 'airflow',
    unit: 'CFM',
    range: { min: 0, max: 1000 },
    accuracy: 2,
    power: 8,
    voltage: 24,
    cost: 250,
    description: 'Differential pressure airflow sensor'
  },
  'ph-sensor': {
    name: 'pH Sensor',
    parameter: 'ph',
    unit: 'pH',
    range: { min: 0, max: 14 },
    accuracy: 0.1,
    power: 10,
    voltage: 24,
    cost: 180,
    description: 'Digital pH sensor'
  },
  'ec-sensor': {
    name: 'EC Sensor',
    parameter: 'ec',
    unit: 'mS/cm',
    range: { min: 0, max: 10 },
    accuracy: 0.01,
    power: 8,
    voltage: 24,
    cost: 220,
    description: 'Conductivity sensor'
  },
  'environmental-controller': {
    name: 'Environmental Controller',
    parameter: 'temperature',
    unit: 'Multi',
    power: 50,
    voltage: 120,
    cost: 2500,
    description: 'Multi-zone environmental controller'
  },
  'hvac-controller': {
    name: 'HVAC Controller',
    parameter: 'temperature',
    unit: 'Multi',
    power: 30,
    voltage: 120,
    cost: 800,
    description: 'HVAC control module'
  },
  'lighting-controller': {
    name: 'Lighting Controller',
    parameter: 'light',
    unit: 'Multi',
    power: 25,
    voltage: 120,
    cost: 600,
    description: 'Dimming and scheduling controller'
  },
  'irrigation-controller': {
    name: 'Irrigation Controller',
    parameter: 'ph',
    unit: 'Multi',
    power: 40,
    voltage: 120,
    cost: 1200,
    description: 'Fertigation control system'
  }
};

// Optimal growing conditions by crop type
const CROP_CONDITIONS = {
  'lettuce': {
    temperature: { min: 60, max: 70, optimal: 65 },
    humidity: { min: 50, max: 70, optimal: 60 },
    co2: { min: 400, max: 1200, optimal: 800 },
    light: { min: 200, max: 400, optimal: 300 },
    airflow: { min: 0.5, max: 2.0, optimal: 1.0 }
  },
  'tomato': {
    temperature: { min: 65, max: 80, optimal: 75 },
    humidity: { min: 60, max: 80, optimal: 70 },
    co2: { min: 400, max: 1500, optimal: 1000 },
    light: { min: 400, max: 800, optimal: 600 },
    airflow: { min: 1.0, max: 3.0, optimal: 2.0 }
  },
  'cannabis': {
    temperature: { min: 70, max: 85, optimal: 78 },
    humidity: { min: 40, max: 60, optimal: 50 },
    co2: { min: 400, max: 1500, optimal: 1200 },
    light: { min: 600, max: 1200, optimal: 900 },
    airflow: { min: 1.5, max: 4.0, optimal: 2.5 }
  },
  'herbs': {
    temperature: { min: 65, max: 75, optimal: 70 },
    humidity: { min: 45, max: 65, optimal: 55 },
    co2: { min: 400, max: 1000, optimal: 600 },
    light: { min: 300, max: 600, optimal: 450 },
    airflow: { min: 0.8, max: 2.5, optimal: 1.5 }
  },
  'strawberry': {
    temperature: { min: 60, max: 75, optimal: 68 },
    humidity: { min: 60, max: 80, optimal: 70 },
    co2: { min: 400, max: 1200, optimal: 800 },
    light: { min: 300, max: 600, optimal: 450 },
    airflow: { min: 1.0, max: 2.5, optimal: 1.8 }
  }
};

export function EnvironmentalControlsPanel({ onClose }: EnvironmentalControlsPanelProps) {
  const { state } = useDesigner();
  const { objects, room, calculations } = state;
  const { updateSystem } = useFacilityDesign();
  
  const [controlDevices, setControlDevices] = useState<EnvironmentalControlDevice[]>([]);
  const [environmentalZones, setEnvironmentalZones] = useState<EnvironmentalZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showSystemDetails, setShowSystemDetails] = useState(false);
  const [controlMode, setControlMode] = useState<'auto' | 'manual'>('auto');
  const [selectedGrowthStage, setSelectedGrowthStage] = useState<'seedling' | 'vegetative' | 'flowering' | 'harvest'>('vegetative');
  const [selectedCropType, setSelectedCropType] = useState<string>('lettuce');

  // Calculate environmental control system
  useEffect(() => {
    calculateEnvironmentalSystem();
  }, [objects, room, selectedCropType, selectedGrowthStage]);

  const calculateEnvironmentalSystem = () => {
    const devices: EnvironmentalControlDevice[] = [];
    const zones: EnvironmentalZone[] = [];
    
    const roomArea = room.width * room.height;
    const cropConditions = CROP_CONDITIONS[selectedCropType as keyof typeof CROP_CONDITIONS] || CROP_CONDITIONS.lettuce;
    
    // Create main environmental zone
    const mainZone: EnvironmentalZone = {
      id: 'main-zone',
      name: 'Main Growing Area',
      area: roomArea,
      targetConditions: cropConditions,
      currentConditions: {
        temperature: 72,
        humidity: 65,
        co2: 450,
        light: calculations?.averagePPFD || 300,
        airflow: 1.5
      },
      devices: [],
      growthStage: selectedGrowthStage,
      cropType: selectedCropType
    };
    
    zones.push(mainZone);
    
    // Generate control devices
    devices.push(...generateControlDevices(roomArea, cropConditions));
    
    setControlDevices(devices);
    setEnvironmentalZones(zones);
    
    // Update facility design context with environmental system data
    const totalPower = devices.reduce((sum, device) => sum + (device.specifications.power || 0) * (device.quantity || 1), 0);
    const totalCost = devices.reduce((sum, device) => sum + device.cost * (device.quantity || 1), 0);
    
    updateSystem('environmental-system', {
      id: 'environmental-system',
      type: 'environmental',
      status: 'configured',
      loads: {
        electrical: totalPower,
        thermal: 0,
        structural: devices.reduce((sum, device) => sum + (device.specifications.weight || 10) * (device.quantity || 1), 0),
        water: 0
      },
      costs: {
        equipment: totalCost,
        installation: totalCost * 0.3, // 30% installation cost
        maintenance: totalCost * 0.06, // 6% annual maintenance
        energy: totalPower * 8760 / 1000 * 0.12 // Annual energy cost
      },
      components: devices,
      dependencies: totalPower > 0 ? ['electrical'] : [],
      conflicts: [],
      lastUpdated: new Date(),
      data: {
        zones: zones,
        cropType: selectedCropType,
        growthStage: selectedGrowthStage,
        controlMode: controlMode,
        deviceCount: devices.length,
        sensorCount: devices.filter(d => d.type === 'sensor').length
      }
    });
  };

  const generateControlDevices = (area: number, conditions: any): EnvironmentalControlDevice[] => {
    const devices: EnvironmentalControlDevice[] = [];
    
    // Add environmental sensors
    const sensorsNeeded = Math.ceil(area / 200); // 1 sensor per 200 sq ft
    
    // Temperature/Humidity sensors
    devices.push({
      id: 'temp-humidity-sensors',
      type: 'sensor',
      name: `${sensorsNeeded}x Temp/Humidity Sensor`,
      parameter: 'temperature',
      setpoint: conditions.temperature.optimal,
      tolerance: 2,
      currentValue: 72,
      unit: '°F / %RH',
      status: 'active',
      location: { x: room.width * 0.3, y: room.height * 0.3 },
      specifications: {
        range: { min: -40, max: 185 },
        accuracy: 0.5,
        resolution: 0.1,
        response_time: 5,
        communication: 'Modbus RTU',
        power: 5,
        voltage: 24
      },
      controlLogic: {
        deadband: 2,
        pid_settings: { kp: 1.0, ki: 0.1, kd: 0.05 }
      },
      isEditable: true,
      lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    });
    
    // CO2 sensors
    devices.push({
      id: 'co2-sensors',
      type: 'sensor',
      name: `${Math.ceil(sensorsNeeded / 2)}x CO2 Sensor`,
      parameter: 'co2',
      setpoint: conditions.co2.optimal,
      tolerance: 50,
      currentValue: 450,
      unit: 'ppm',
      status: 'active',
      location: { x: room.width * 0.7, y: room.height * 0.3 },
      specifications: {
        range: { min: 0, max: 5000 },
        accuracy: 50,
        resolution: 10,
        response_time: 30,
        communication: 'Modbus RTU',
        power: 12,
        voltage: 24
      },
      controlLogic: {
        deadband: 100,
        pid_settings: { kp: 0.5, ki: 0.05, kd: 0.02 }
      },
      isEditable: true,
      lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
    });
    
    // Light sensors
    devices.push({
      id: 'light-sensors',
      type: 'sensor',
      name: `${sensorsNeeded}x Light Sensor`,
      parameter: 'light',
      setpoint: conditions.light.optimal,
      tolerance: 20,
      currentValue: 320,
      unit: 'μmol/m²/s',
      status: 'active',
      location: { x: room.width * 0.5, y: room.height * 0.7 },
      specifications: {
        range: { min: 0, max: 2000 },
        accuracy: 5,
        resolution: 1,
        response_time: 1,
        communication: 'Modbus RTU',
        power: 3,
        voltage: 24
      },
      controlLogic: {
        deadband: 25,
        pid_settings: { kp: 0.8, ki: 0.1, kd: 0.03 }
      },
      isEditable: true,
      lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000)
    });
    
    // Environmental controller
    devices.push({
      id: 'environmental-controller',
      type: 'controller',
      name: 'Multi-Zone Environmental Controller',
      parameter: 'temperature',
      unit: 'Multi',
      status: 'active',
      location: { x: room.width * 0.1, y: room.height * 0.1 },
      specifications: {
        communication: 'Ethernet/Modbus',
        power: 50,
        voltage: 120
      },
      controlLogic: {
        schedule: [
          { time: '06:00', temp: conditions.temperature.optimal, humidity: conditions.humidity.optimal, co2: conditions.co2.optimal },
          { time: '12:00', temp: conditions.temperature.optimal + 2, humidity: conditions.humidity.optimal - 5, co2: conditions.co2.optimal },
          { time: '18:00', temp: conditions.temperature.optimal, humidity: conditions.humidity.optimal, co2: conditions.co2.optimal },
          { time: '00:00', temp: conditions.temperature.optimal - 3, humidity: conditions.humidity.optimal + 5, co2: conditions.co2.min }
        ],
        failsafe: {
          max_temp: conditions.temperature.max + 5,
          min_temp: conditions.temperature.min - 5,
          max_humidity: conditions.humidity.max + 10,
          emergency_ventilation: true
        }
      },
      isEditable: true,
      lastMaintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    });
    
    // HVAC controller
    devices.push({
      id: 'hvac-controller',
      type: 'controller',
      name: 'HVAC Control Module',
      parameter: 'temperature',
      unit: 'Multi',
      status: 'active',
      location: { x: room.width * 0.9, y: room.height * 0.1 },
      specifications: {
        communication: 'BACnet/IP',
        power: 30,
        voltage: 120
      },
      controlLogic: {
        deadband: 2,
        pid_settings: { kp: 1.2, ki: 0.15, kd: 0.08 }
      },
      isEditable: true,
      lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    });
    
    // Lighting controller
    devices.push({
      id: 'lighting-controller',
      type: 'controller',
      name: 'Lighting Controller',
      parameter: 'light',
      unit: 'Multi',
      status: 'active',
      location: { x: room.width * 0.5, y: room.height * 0.1 },
      specifications: {
        communication: 'DALI/DMX',
        power: 25,
        voltage: 120
      },
      controlLogic: {
        schedule: [
          { time: '06:00', intensity: 100, spectrum: 'full' },
          { time: '12:00', intensity: 100, spectrum: 'full' },
          { time: '18:00', intensity: 75, spectrum: 'red-enriched' },
          { time: '22:00', intensity: 0, spectrum: 'off' }
        ]
      },
      isEditable: true,
      lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
    });
    
    return devices;
  };

  const addControlDevice = (deviceType: string) => {
    const deviceData = ENVIRONMENTAL_DEVICES[deviceType as keyof typeof ENVIRONMENTAL_DEVICES];
    if (!deviceData) return;

    const newDevice: EnvironmentalControlDevice = {
      id: `custom-${Date.now()}`,
      type: deviceType.includes('controller') ? 'controller' : 'sensor',
      name: deviceData.name,
      parameter: deviceData.parameter as any,
      setpoint: deviceData.range ? (deviceData.range.min + deviceData.range.max) / 2 : undefined,
      tolerance: deviceData.accuracy,
      currentValue: deviceData.range ? (deviceData.range.min + deviceData.range.max) / 2 : undefined,
      unit: deviceData.unit,
      status: 'active',
      location: { x: room.width * 0.5, y: room.height * 0.5 },
      specifications: {
        range: deviceData.range,
        accuracy: deviceData.accuracy,
        power: deviceData.power,
        voltage: deviceData.voltage,
        communication: 'Modbus RTU'
      },
      isEditable: true,
      lastMaintenance: new Date(),
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    };

    setControlDevices(prev => [...prev, newDevice]);
    setShowAddDevice(false);
  };

  const calculateSystemHealth = () => {
    const totalDevices = controlDevices.length;
    const activeDevices = controlDevices.filter(d => d.status === 'active').length;
    const maintenanceNeeded = controlDevices.filter(d => 
      d.nextMaintenance && d.nextMaintenance < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    return {
      overall: Math.round((activeDevices / totalDevices) * 100),
      active: activeDevices,
      total: totalDevices,
      maintenanceNeeded
    };
  };

  const generateSystemReport = () => {
    const zone = environmentalZones[0];
    const systemHealth = calculateSystemHealth();
    
    return {
      title: `Environmental Control System - ${room.name || 'Cultivation Room'}`,
      dimensions: `${room.width}' x ${room.height}'`,
      cropType: selectedCropType,
      growthStage: selectedGrowthStage,
      systemHealth,
      targetConditions: zone?.targetConditions,
      currentConditions: zone?.currentConditions,
      devices: controlDevices,
      zones: environmentalZones,
      controlStrategies: generateControlStrategies(),
      maintenanceSchedule: generateMaintenanceSchedule(),
      energyConsumption: calculateEnergyConsumption()
    };
  };

  const generateControlStrategies = () => {
    return {
      temperature: 'PID control with 2°F deadband, day/night setback',
      humidity: 'Dehumidification priority, ventilation integration',
      co2: 'Demand-based injection, exhaust coordination',
      lighting: 'DLI-based dimming, spectrum scheduling',
      airflow: 'Variable speed control, pressure differential'
    };
  };

  const generateMaintenanceSchedule = () => {
    return controlDevices.map(device => ({
      device: device.name,
      lastMaintenance: device.lastMaintenance,
      nextMaintenance: device.nextMaintenance,
      status: device.nextMaintenance && device.nextMaintenance < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'due-soon' : 'scheduled'
    }));
  };

  const calculateEnergyConsumption = () => {
    const totalPower = controlDevices.reduce((sum, device) => sum + (device.specifications.power || 0), 0);
    const dailyEnergy = (totalPower * 24) / 1000; // kWh
    const monthlyCost = dailyEnergy * 30 * 0.12; // $0.12/kWh
    
    return {
      totalPower: `${totalPower}W`,
      dailyEnergy: `${dailyEnergy.toFixed(1)} kWh`,
      monthlyCost: `$${monthlyCost.toFixed(2)}`
    };
  };

  const handleExportSystem = () => {
    const systemReport = generateSystemReport();
    const blob = new Blob([JSON.stringify(systemReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `environmental-controls-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const systemHealth = calculateSystemHealth();
  const zone = environmentalZones[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Environmental Controls</h2>
              <p className="text-gray-400">Monitor and control growing environment parameters</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setControlMode(controlMode === 'auto' ? 'manual' : 'auto')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                controlMode === 'auto' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {controlMode === 'auto' ? 'Auto Mode' : 'Manual Mode'}
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
              {/* Crop Settings */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Crop Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Crop Type</label>
                    <select
                      value={selectedCropType}
                      onChange={(e) => setSelectedCropType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      {Object.keys(CROP_CONDITIONS).map(crop => (
                        <option key={crop} value={crop}>{crop.charAt(0).toUpperCase() + crop.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Growth Stage</label>
                    <select
                      value={selectedGrowthStage}
                      onChange={(e) => setSelectedGrowthStage(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="seedling">Seedling</option>
                      <option value="vegetative">Vegetative</option>
                      <option value="flowering">Flowering</option>
                      <option value="harvest">Harvest</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Overall Health:</span>
                    <span className={`font-medium ${
                      systemHealth.overall >= 90 ? 'text-green-400' :
                      systemHealth.overall >= 70 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {systemHealth.overall}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Active Devices:</span>
                    <span className="text-white font-medium">{systemHealth.active}/{systemHealth.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Maintenance Due:</span>
                    <span className={`font-medium ${
                      systemHealth.maintenanceNeeded > 0 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {systemHealth.maintenanceNeeded} devices
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Conditions */}
              {zone && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Current Conditions</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Temperature:</span>
                      <span className={`font-medium ${
                        zone.currentConditions.temperature >= zone.targetConditions.temperature.min &&
                        zone.currentConditions.temperature <= zone.targetConditions.temperature.max
                          ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {zone.currentConditions.temperature}°F
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Humidity:</span>
                      <span className={`font-medium ${
                        zone.currentConditions.humidity >= zone.targetConditions.humidity.min &&
                        zone.currentConditions.humidity <= zone.targetConditions.humidity.max
                          ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {zone.currentConditions.humidity}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CO2:</span>
                      <span className={`font-medium ${
                        zone.currentConditions.co2 >= zone.targetConditions.co2.min &&
                        zone.currentConditions.co2 <= zone.targetConditions.co2.max
                          ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {zone.currentConditions.co2} ppm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Light:</span>
                      <span className={`font-medium ${
                        zone.currentConditions.light >= zone.targetConditions.light.min &&
                        zone.currentConditions.light <= zone.targetConditions.light.max
                          ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {zone.currentConditions.light} PPFD
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Energy Consumption */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Energy Usage</h3>
                <div className="space-y-2">
                  {Object.entries(calculateEnergyConsumption()).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowAddDevice(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Device
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

          {/* Right Panel - Device List */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Devices List */}
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Control Devices</h3>
                  <button
                    onClick={() => setShowSystemDetails(!showSystemDetails)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {showSystemDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="space-y-2">
                  {controlDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-700 rounded">
                          {device.type === 'sensor' && <Gauge className="w-4 h-4 text-blue-400" />}
                          {device.type === 'controller' && <Settings className="w-4 h-4 text-green-400" />}
                          {device.type === 'hvac' && <Wind className="w-4 h-4 text-purple-400" />}
                          {device.type === 'lighting' && <Sun className="w-4 h-4 text-yellow-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{device.name}</span>
                            <div className={`w-2 h-2 rounded-full ${
                              device.status === 'active' ? 'bg-green-500' :
                              device.status === 'inactive' ? 'bg-gray-500' :
                              device.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></div>
                          </div>
                          {showSystemDetails && (
                            <div className="text-sm text-gray-400 mt-1">
                              {device.currentValue && device.unit && `${device.currentValue} ${device.unit} • `}
                              {device.specifications.power && `${device.specifications.power}W • `}
                              {device.specifications.communication}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {device.setpoint && (
                          <div className="text-white font-medium">
                            Target: {device.setpoint} {device.unit}
                          </div>
                        )}
                        {showSystemDetails && device.nextMaintenance && (
                          <div className={`text-sm ${
                            device.nextMaintenance < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                              ? 'text-yellow-400' : 'text-gray-400'
                          }`}>
                            Next: {device.nextMaintenance.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Control Strategies */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Control Strategies</h3>
                <div className="space-y-2">
                  {Object.entries(generateControlStrategies()).map(([parameter, strategy]) => (
                    <div key={parameter} className="flex items-start gap-3">
                      <span className="text-sm font-medium text-gray-300 capitalize min-w-0 w-20">
                        {parameter}:
                      </span>
                      <span className="text-sm text-gray-400 flex-1">{strategy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Device Modal */}
        {showAddDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Add Control Device</h3>
                  <button
                    onClick={() => setShowAddDevice(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(ENVIRONMENTAL_DEVICES).map(([key, device]) => (
                    <div
                      key={key}
                      className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => addControlDevice(key)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gray-800 rounded">
                          <Activity className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{device.name}</h4>
                          <p className="text-sm text-gray-400">{device.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-400">Parameter: {device.parameter}</span>
                        <span className="text-gray-400">Unit: {device.unit}</span>
                        {device.range && <span className="text-gray-400">Range: {device.range.min}-{device.range.max}</span>}
                        <span className="text-green-400">${device.cost}</span>
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