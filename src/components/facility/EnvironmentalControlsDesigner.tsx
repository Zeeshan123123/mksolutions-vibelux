'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Gauge, 
  Fan,
  Activity,
  Settings,
  Zap,
  AlertTriangle,
  Snowflake,
  Sun,
  Cloud,
  Calculator,
  Ruler,
  Info
} from 'lucide-react';
import { DuctworkDesigner, DuctSection, DuctDesignCriteria, DuctSizingResult } from '@/lib/ductwork-design';
import { FanSelector, FanSelectionCriteria, FanSelectionResult, SystemCurve } from '@/lib/fan-selection';
import { EnergyCodeAnalyzer, BuildingEnvelope, LightingSystem, HVACSystem, ComplianceResult } from '@/lib/energy-code-compliance';
import { PsychrometricCalculator, PsychrometricState, PsychrometricProcess } from '@/lib/psychrometric-calculations';

interface EnvironmentalZone {
  id: string;
  name: string;
  area: number; // sq ft
  targetTemp: { min: number; max: number };
  targetHumidity: { min: number; max: number };
  targetCO2: number; // ppm
  ventilationRate: number; // CFM
  currentConditions: {
    temperature: number;
    humidity: number;
    co2: number;
    pressure: number;
  };
}

interface HVACEquipment {
  id: string;
  type: 'heater' | 'cooler' | 'fan' | 'dehumidifier' | 'humidifier' | 'co2_generator' | 'exhaust_fan';
  name: string;
  capacity: number;
  position: [number, number];
  zone: string;
  status: 'active' | 'standby' | 'maintenance' | 'error';
  specifications: {
    power?: number; // watts
    airflow?: number; // CFM
    efficiency?: number; // %
    automation?: boolean;
  };
}

interface VentilationSystem {
  type: 'natural' | 'forced' | 'hybrid';
  airExchangeRate: number; // per hour
  intakeArea: number; // sq ft
  exhaustArea: number; // sq ft
  fans: HVACEquipment[];
}

interface FacilityConfig {
  dimensions: { length: number; width: number; height: number };
}

interface EnvironmentalControlsDesignerProps {
  facilityConfig: FacilityConfig;
  onSystemUpdate?: (system: any) => void;
}

export function EnvironmentalControlsDesigner({ 
  facilityConfig, 
  onSystemUpdate 
}: EnvironmentalControlsDesignerProps) {
  const [designMode, setDesignMode] = useState<'overview' | 'zones' | 'hvac' | 'ventilation' | 'monitoring' | 'ductwork' | 'analysis'>('overview');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [ductworkResults, setDuctworkResults] = useState<DuctSizingResult[] | null>(null);
  const [fanSelection, setFanSelection] = useState<FanSelectionResult[] | null>(null);
  const [energyCompliance, setEnergyCompliance] = useState<ComplianceResult | null>(null);
  const [psychrometricAnalysis, setPsychrometricAnalysis] = useState<{
    states: PsychrometricState[];
    process: PsychrometricProcess | null;
  } | null>(null);

  const [environmentalZones, setEnvironmentalZones] = useState<EnvironmentalZone[]>([
    {
      id: 'zone-propagation',
      name: 'Propagation Area',
      area: 800,
      targetTemp: { min: 72, max: 78 },
      targetHumidity: { min: 70, max: 85 },
      targetCO2: 800,
      ventilationRate: 150,
      currentConditions: {
        temperature: 74.2,
        humidity: 78.5,
        co2: 850,
        pressure: 14.6
      }
    },
    {
      id: 'zone-vegetative',
      name: 'Vegetative Growth',
      area: 1200,
      targetTemp: { min: 70, max: 75 },
      targetHumidity: { min: 60, max: 75 },
      targetCO2: 1000,
      ventilationRate: 200,
      currentConditions: {
        temperature: 72.8,
        humidity: 68.2,
        co2: 980,
        pressure: 14.7
      }
    },
    {
      id: 'zone-flowering',
      name: 'Flowering Room',
      area: 2000,
      targetTemp: { min: 65, max: 72 },
      targetHumidity: { min: 45, max: 60 },
      targetCO2: 1200,
      ventilationRate: 300,
      currentConditions: {
        temperature: 68.5,
        humidity: 52.3,
        co2: 1180,
        pressure: 14.5
      }
    }
  ]);

  const [hvacEquipment, setHvacEquipment] = useState<HVACEquipment[]>([
    {
      id: 'heater-main',
      type: 'heater',
      name: 'Main Heating Unit',
      capacity: 150000, // BTU/hr
      position: [20, 10],
      zone: 'zone-vegetative',
      status: 'active',
      specifications: {
        power: 8500,
        efficiency: 92,
        automation: true
      }
    },
    {
      id: 'cooler-main',
      type: 'cooler',
      name: 'Primary Cooling System',
      capacity: 120000, // BTU/hr
      position: [40, 10],
      zone: 'zone-flowering',
      status: 'active',
      specifications: {
        power: 12000,
        efficiency: 16, // SEER
        automation: true
      }
    },
    {
      id: 'dehumidifier-1',
      type: 'dehumidifier',
      name: 'Dehumidifier Unit 1',
      capacity: 150, // pints/day
      position: [30, 20],
      zone: 'zone-flowering',
      status: 'active',
      specifications: {
        power: 800,
        efficiency: 2.1,
        automation: true
      }
    },
    {
      id: 'fan-circulation-1',
      type: 'fan',
      name: 'Circulation Fan 1',
      capacity: 1200, // CFM
      position: [15, 25],
      zone: 'zone-propagation',
      status: 'active',
      specifications: {
        power: 150,
        airflow: 1200,
        automation: true
      }
    },
    {
      id: 'exhaust-fan-1',
      type: 'exhaust_fan',
      name: 'Exhaust Fan 1',
      capacity: 2500, // CFM
      position: [50, 30],
      zone: 'zone-flowering',
      status: 'active',
      specifications: {
        power: 400,
        airflow: 2500,
        automation: true
      }
    },
    {
      id: 'co2-generator-1',
      type: 'co2_generator',
      name: 'CO₂ Generator 1',
      capacity: 24, // lbs/day
      position: [25, 35],
      zone: 'zone-vegetative',
      status: 'active',
      specifications: {
        power: 500,
        automation: true
      }
    }
  ]);

  const [ventilationSystem, setVentilationSystem] = useState<VentilationSystem>({
    type: 'hybrid',
    airExchangeRate: 1.5,
    intakeArea: 120,
    exhaustArea: 140,
    fans: hvacEquipment.filter(eq => eq.type === 'fan' || eq.type === 'exhaust_fan')
  });

  const [ductNetwork, setDuctNetwork] = useState<DuctSection[]>([
    {
      id: 'main-supply',
      type: 'supply',
      shape: 'rectangular',
      length: 100,
      airflow: 5000,
      dimensions: { width: 24, height: 18 },
      material: { type: 'galvanized', gauge: 22, roughness: 0.0003 },
      fittings: [
        { type: 'elbow', angle: 90, radius: 1.5 },
        { type: 'transition' }
      ]
    },
    {
      id: 'zone-supply-1',
      type: 'supply',
      shape: 'rectangular',
      length: 50,
      airflow: 1500,
      dimensions: { width: 14, height: 10 },
      material: { type: 'galvanized', gauge: 24, roughness: 0.0003 },
      fittings: [
        { type: 'tee', branch: true },
        { type: 'damper' }
      ],
      downstream: ['diffuser-1', 'diffuser-2']
    },
    {
      id: 'return-main',
      type: 'return',
      shape: 'rectangular',
      length: 80,
      airflow: 4800,
      dimensions: { width: 22, height: 16 },
      material: { type: 'galvanized', gauge: 22, roughness: 0.0003 },
      fittings: [
        { type: 'elbow', angle: 45 }
      ]
    }
  ]);

  const systemMetrics = useMemo(() => {
    const totalPower = hvacEquipment.reduce((sum, eq) => sum + (eq.specifications.power || 0), 0);
    const totalCFM = hvacEquipment
      .filter(eq => eq.type === 'fan' || eq.type === 'exhaust_fan')
      .reduce((sum, eq) => sum + (eq.specifications.airflow || 0), 0);
    
    const avgTemp = environmentalZones.reduce((sum, zone) => sum + zone.currentConditions.temperature, 0) / environmentalZones.length;
    const avgHumidity = environmentalZones.reduce((sum, zone) => sum + zone.currentConditions.humidity, 0) / environmentalZones.length;
    const avgCO2 = environmentalZones.reduce((sum, zone) => sum + zone.currentConditions.co2, 0) / environmentalZones.length;

    return {
      totalPower: totalPower / 1000, // kW
      totalCFM,
      avgTemp,
      avgHumidity,
      avgCO2,
      systemEfficiency: 89.7,
      energyUsageToday: 147.3, // kWh
      activeEquipment: hvacEquipment.filter(eq => eq.status === 'active').length
    };
  }, [hvacEquipment, environmentalZones]);

  // Perform ductwork analysis
  const performDuctworkAnalysis = useCallback(() => {
    const criteria: DuctDesignCriteria = {
      method: 'equalFriction',
      maxVelocity: {
        main: 1200,
        branch: 800,
        final: 600
      },
      frictionRate: 0.08, // inches w.g. per 100 ft
      noiseClass: 'RC'
    };

    const totalStaticPressure = 1.5; // inches w.g. available
    const results = DuctworkDesigner.designSystem(ductNetwork, criteria, totalStaticPressure);
    setDuctworkResults(results);
  }, [ductNetwork]);

  // Perform fan selection
  const performFanSelection = useCallback(() => {
    const totalFlow = ductNetwork.reduce((sum, duct) => {
      return duct.type === 'supply' ? sum + duct.airflow : sum;
    }, 0);

    const systemPressure = ductworkResults ? 
      Math.max(...ductworkResults.map(r => r.pressureLoss)) : 1.5;

    const criteria: FanSelectionCriteria = {
      designFlow: totalFlow,
      designPressure: systemPressure,
      altitude: 0,
      temperature: 70,
      application: 'supplyAir',
      acousticRequirement: 60, // dB
      efficiency: 65
    };

    const systemCurve = FanSelector.generateSystemCurve(totalFlow, systemPressure);
    const results = FanSelector.selectFan(criteria, systemCurve);
    setFanSelection(results);
  }, [ductNetwork, ductworkResults]);

  // Perform energy compliance check
  const performEnergyCompliance = useCallback(() => {
    const envelope: BuildingEnvelope = {
      climate: { zone: '4A', hdd65: 4500, cdd65: 1200, moisture: 'moist' },
      area: facilityConfig.dimensions.length * facilityConfig.dimensions.width,
      volume: facilityConfig.dimensions.length * facilityConfig.dimensions.width * facilityConfig.dimensions.height,
      walls: [
        { area: 2000, uValue: 0.084, mass: 'medium', adjacentTo: 'exterior' },
        { area: 2000, uValue: 0.084, mass: 'medium', adjacentTo: 'exterior' }
      ],
      roof: [
        { area: 4600, uValue: 0.032, mass: 'light', adjacentTo: 'exterior' }
      ],
      floor: [
        { area: 4600, uValue: 0.051, mass: 'heavy', adjacentTo: 'ground' }
      ],
      fenestration: [
        { area: 200, uValue: 0.42, shgc: 0.40, vlt: 0.60, orientation: 'south' }
      ],
      infiltration: 0.25
    };

    const hvacSystems: HVACSystem[] = hvacEquipment
      .filter(eq => eq.type === 'cooler' || eq.type === 'heater')
      .map(eq => ({
        type: 'split',
        efficiency: {
          cooling: eq.type === 'cooler' ? { value: 16, metric: 'SEER' as const } : undefined,
          heating: eq.type === 'heater' ? { value: 0.95, metric: 'AFUE' as const } : undefined
        },
        capacity: {
          cooling: eq.type === 'cooler' ? eq.capacity / 12000 : undefined,
          heating: eq.type === 'heater' ? eq.capacity : undefined
        },
        controls: [
          { type: 'economizer', enabled: true },
          { type: 'variableSpeed', enabled: true }
        ]
      }));

    const lighting: LightingSystem = {
      spaces: environmentalZones.map(zone => ({
        type: 'cultivation' as const,
        area: zone.area,
        installedPower: zone.area * 35, // 35W/sf for cannabis
        lpd: 35,
        fixtures: []
      })),
      controls: [
        { type: 'multilevel', spaces: [], savings: 10 },
        { type: 'timeclock', spaces: [], savings: 5 }
      ],
      totalPower: environmentalZones.reduce((sum, zone) => sum + zone.area * 35, 0),
      totalArea: environmentalZones.reduce((sum, zone) => sum + zone.area, 0)
    };

    const result = EnergyCodeAnalyzer.analyzeCompliance(envelope, lighting, hvacSystems);
    setEnergyCompliance(result);
  }, [facilityConfig, hvacEquipment, environmentalZones]);

  // Perform psychrometric analysis
  const performPsychrometricAnalysis = useCallback(() => {
    const states: PsychrometricState[] = [];
    
    // Analyze each zone's current conditions
    environmentalZones.forEach(zone => {
      const state = PsychrometricCalculator.calculateFromDBandRH(
        zone.currentConditions.temperature,
        zone.currentConditions.humidity / 100
      );
      states.push({
        ...state,
        name: `${zone.name} - Current`,
        zone: zone.id
      });
    });

    // Calculate a typical cooling process for the flowering room
    const floweringZone = environmentalZones.find(z => z.id === 'zone-flowering');
    if (floweringZone) {
      const outsideAir = PsychrometricCalculator.calculateFromDBandRH(95, 0.60);
      const returnAir = PsychrometricCalculator.calculateFromDBandRH(
        floweringZone.currentConditions.temperature,
        floweringZone.currentConditions.humidity / 100
      );
      
      // Mixed air (20% outside air)
      const mixedAir = PsychrometricCalculator.mixAir(
        outsideAir, 0.2,
        returnAir, 0.8
      );
      
      // Cooling and dehumidification process
      const supplyAir = {
        ...mixedAir,
        dryBulb: 55, // Supply air temperature
        wetBulb: 54, // Assuming 95% RH at coil
      };
      
      const coolingState = PsychrometricCalculator.calculateFromDBandWB(
        supplyAir.dryBulb,
        supplyAir.wetBulb
      );
      
      const process: PsychrometricProcess = {
        name: 'Flowering Room Cooling Process',
        states: [
          { ...outsideAir, name: 'Outside Air' },
          { ...returnAir, name: 'Return Air' },
          { ...mixedAir, name: 'Mixed Air' },
          { ...coolingState, name: 'Supply Air' }
        ],
        load: {
          sensible: PsychrometricCalculator.calculateSensibleLoad(
            1000, // CFM
            mixedAir.dryBulb,
            coolingState.dryBulb
          ),
          latent: PsychrometricCalculator.calculateLatentLoad(
            1000, // CFM
            mixedAir.humidityRatio,
            coolingState.humidityRatio
          ),
          total: 0 // Will be calculated
        }
      };
      
      process.load.total = process.load.sensible + process.load.latent;
      
      setPsychrometricAnalysis({
        states,
        process
      });
    }
  }, [environmentalZones]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Average Temperature</span>
            <Thermometer className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-white">{systemMetrics.avgTemp.toFixed(1)}°F</p>
          <p className="text-xs text-green-400">Within optimal range</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Average Humidity</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">{systemMetrics.avgHumidity.toFixed(1)}%</p>
          <p className="text-xs text-yellow-400">Monitor flowering zone</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Average CO₂</span>
            <Cloud className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">{systemMetrics.avgCO2.toFixed(0)} ppm</p>
          <p className="text-xs text-green-400">Optimal levels</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Power Consumption</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-white">{systemMetrics.totalPower.toFixed(1)} kW</p>
          <p className="text-xs text-gray-400">Active equipment: {systemMetrics.activeEquipment}</p>
        </div>
      </div>

      {/* Environmental Zones Layout */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Environmental Zones</h3>
        <div className="relative bg-gray-800 rounded-lg h-96 overflow-hidden">
          <svg 
            viewBox={`0 0 ${facilityConfig.dimensions.length} ${facilityConfig.dimensions.width}`}
            className="w-full h-full"
          >
            {/* Facility outline */}
            <rect
              x={0}
              y={0}
              width={facilityConfig.dimensions.length}
              height={facilityConfig.dimensions.width}
              fill="none"
              stroke="#4B5563"
              strokeWidth={0.5}
            />
            
            {/* Environmental zones */}
            {environmentalZones.map((zone, index) => {
              const x = (index * 25) + 5;
              const y = 5;
              const width = 20;
              const height = facilityConfig.dimensions.width - 10;
              
              // Color based on temperature variance from target
              const tempVariance = Math.abs(zone.currentConditions.temperature - ((zone.targetTemp.min + zone.targetTemp.max) / 2));
              const zoneColor = tempVariance < 2 ? '#10B981' : tempVariance < 4 ? '#F59E0B' : '#EF4444';
              
              return (
                <g key={zone.id}>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={zoneColor}
                    opacity={0.2}
                    className="cursor-pointer"
                    onClick={() => setSelectedZone(zone.id)}
                  />
                  <text
                    x={x + width/2}
                    y={y + 5}
                    fill="#E5E7EB"
                    fontSize="2"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {zone.name}
                  </text>
                  <text
                    x={x + width/2}
                    y={y + 8}
                    fill="#E5E7EB"
                    fontSize="1.5"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {zone.currentConditions.temperature.toFixed(1)}°F
                  </text>
                </g>
              );
            })}
            
            {/* HVAC Equipment */}
            {hvacEquipment.map((equipment) => (
              <g key={equipment.id}>
                <circle
                  cx={equipment.position[0]}
                  cy={equipment.position[1]}
                  r={2}
                  fill={equipment.status === 'active' ? '#10B981' : '#6B7280'}
                  className="cursor-pointer"
                  onClick={() => setSelectedEquipment(equipment.id)}
                />
                <text
                  x={equipment.position[0]}
                  y={equipment.position[1] - 3}
                  fill="#E5E7EB"
                  fontSize="1.5"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {equipment.type === 'heater' ? 'H' :
                   equipment.type === 'cooler' ? 'C' :
                   equipment.type === 'fan' ? 'F' :
                   equipment.type === 'dehumidifier' ? 'D' :
                   equipment.type === 'humidifier' ? 'M' :
                   equipment.type === 'co2_generator' ? 'CO₂' :
                   'E'}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Zone Status Grid */}
      <div className="grid grid-cols-3 gap-4">
        {environmentalZones.map((zone) => (
          <div 
            key={zone.id}
            className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all ${
              selectedZone === zone.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedZone(zone.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">{zone.name}</h4>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  Math.abs(zone.currentConditions.temperature - ((zone.targetTemp.min + zone.targetTemp.max) / 2)) < 2 
                    ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400">Temperature</p>
                <p className="text-white font-medium">{zone.currentConditions.temperature}°F</p>
              </div>
              <div>
                <p className="text-gray-400">Humidity</p>
                <p className="text-white font-medium">{zone.currentConditions.humidity}%</p>
              </div>
              <div>
                <p className="text-gray-400">CO₂</p>
                <p className="text-white font-medium">{zone.currentConditions.co2} ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Airflow</p>
                <p className="text-white font-medium">{zone.ventilationRate} CFM</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDuctwork = () => (
    <div className="space-y-6">
      {/* Ductwork Analysis Controls */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Ductwork Design & Analysis</h3>
          <button
            onClick={performDuctworkAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Analyze Ductwork
          </button>
        </div>
      </div>

      {/* Duct Network Table */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Duct Network Specifications</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="pb-2 text-gray-400 font-medium">Section ID</th>
                <th className="pb-2 text-gray-400 font-medium">Type</th>
                <th className="pb-2 text-gray-400 font-medium">Size</th>
                <th className="pb-2 text-gray-400 font-medium">Flow (CFM)</th>
                <th className="pb-2 text-gray-400 font-medium">Length (ft)</th>
                <th className="pb-2 text-gray-400 font-medium">Material</th>
              </tr>
            </thead>
            <tbody>
              {ductNetwork.map((duct) => (
                <tr key={duct.id} className="border-b border-gray-600">
                  <td className="py-2 text-white">{duct.id}</td>
                  <td className="py-2 text-gray-300 capitalize">{duct.type}</td>
                  <td className="py-2 text-gray-300">
                    {duct.shape === 'rectangular' 
                      ? `${duct.dimensions.width}"x${duct.dimensions.height}"`
                      : `${duct.dimensions.diameter}" Ø`}
                  </td>
                  <td className="py-2 text-gray-300">{duct.airflow}</td>
                  <td className="py-2 text-gray-300">{duct.length}</td>
                  <td className="py-2 text-gray-300 capitalize">{duct.material.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ductwork Results */}
      {ductworkResults && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ductwork Analysis Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="pb-2 text-gray-400 font-medium">Section</th>
                  <th className="pb-2 text-gray-400 font-medium">Velocity (fpm)</th>
                  <th className="pb-2 text-gray-400 font-medium">Friction Loss</th>
                  <th className="pb-2 text-gray-400 font-medium">Total Loss</th>
                  <th className="pb-2 text-gray-400 font-medium">Noise (NC)</th>
                  <th className="pb-2 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ductworkResults.map((result) => (
                  <tr key={result.section.id} className="border-b border-gray-600">
                    <td className="py-2 text-white">{result.section.id}</td>
                    <td className="py-2 text-gray-300">{result.velocity.toFixed(0)}</td>
                    <td className="py-2 text-gray-300">{result.frictionLoss.toFixed(3)} in.w.g./100ft</td>
                    <td className="py-2 text-gray-300">{result.pressureLoss.toFixed(2)} in.w.g.</td>
                    <td className="py-2 text-gray-300">NC-{result.noiseLevel}</td>
                    <td className="py-2">
                      {result.velocity > 1200 ? (
                        <span className="text-yellow-400">High Velocity</span>
                      ) : result.noiseLevel > 40 ? (
                        <span className="text-orange-400">Noisy</span>
                      ) : (
                        <span className="text-green-400">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fan Selection */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Fan Selection</h3>
          <button
            onClick={performFanSelection}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Fan className="w-4 h-4" />
            Select Fans
          </button>
        </div>
      </div>

      {fanSelection && fanSelection.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recommended Fans</h3>
          <div className="grid grid-cols-1 gap-4">
            {fanSelection.slice(0, 3).map((result, idx) => (
              <div key={idx} className="bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">
                    {result.fan.manufacturer} {result.fan.model}
                  </h4>
                  <span className="text-sm text-gray-400">Score: {result.score.toFixed(0)}/100</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Operating Point</p>
                    <p className="text-white">{result.operatingPoint.flow.toFixed(0)} CFM @ {result.operatingPoint.staticPressure.toFixed(2)}" w.g.</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Efficiency</p>
                    <p className="text-white">{result.operatingPoint.efficiency.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Motor Power</p>
                    <p className="text-white">{result.operatingPoint.motorPower} HP</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Sound Level</p>
                    <p className="text-white">{result.operatingPoint.soundPower} dB</p>
                  </div>
                </div>
                {result.issues.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <p className="text-yellow-400 text-xs">{result.issues.join(', ')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      {/* Energy Analysis Controls */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Energy & Code Compliance Analysis</h3>
          <div className="flex gap-2">
            <button
              onClick={performPsychrometricAnalysis}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Droplets className="w-4 h-4" />
              Psychrometric
            </button>
            <button
              onClick={performEnergyCompliance}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Check Compliance
            </button>
          </div>
        </div>
      </div>

      {/* Energy Compliance Results */}
      {energyCompliance && (
        <>
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {energyCompliance.standard} {energyCompliance.version} Compliance
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                energyCompliance.passes ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {energyCompliance.passes ? 'PASS' : 'FAIL'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${
                energyCompliance.envelope.passes ? 'bg-green-600/20' : 'bg-red-600/20'
              }`}>
                <h4 className="text-white font-medium mb-2">Envelope</h4>
                <p className="text-2xl font-bold text-white">
                  {energyCompliance.envelope.margin > 0 ? '+' : ''}{energyCompliance.envelope.margin.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-300">
                  {energyCompliance.envelope.passes ? 'Compliant' : 'Non-compliant'}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${
                energyCompliance.lighting.passes ? 'bg-green-600/20' : 'bg-red-600/20'
              }`}>
                <h4 className="text-white font-medium mb-2">Lighting</h4>
                <p className="text-2xl font-bold text-white">
                  {energyCompliance.lighting.actualValue.toFixed(1)} W/sf
                </p>
                <p className="text-sm text-gray-300">
                  Max: {energyCompliance.lighting.requiredValue.toFixed(1)} W/sf
                </p>
              </div>

              <div className={`p-4 rounded-lg ${
                energyCompliance.hvac.passes ? 'bg-green-600/20' : 'bg-red-600/20'
              }`}>
                <h4 className="text-white font-medium mb-2">HVAC</h4>
                <p className="text-2xl font-bold text-white">
                  {energyCompliance.hvac.margin > 0 ? '+' : ''}{energyCompliance.hvac.margin.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-300">
                  {energyCompliance.hvac.passes ? 'Compliant' : 'Non-compliant'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-600 rounded-lg">
              <h4 className="text-white font-medium mb-2">Overall Score</h4>
              <div className="w-full bg-gray-500 rounded-full h-4 mb-2">
                <div 
                  className={`h-full rounded-full ${
                    energyCompliance.score >= 80 ? 'bg-green-500' :
                    energyCompliance.score >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${energyCompliance.score}%` }}
                />
              </div>
              <p className="text-white text-center font-bold">{energyCompliance.score}/100</p>
            </div>
          </div>

          {/* Recommendations */}
          {energyCompliance.recommendations.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Energy Saving Recommendations</h3>
              <div className="space-y-4">
                {energyCompliance.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-medium">{rec.component}: {rec.issue}</h4>
                        <p className="text-gray-300 text-sm mt-1">{rec.recommendation}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-medium">{rec.savings.toFixed(0)} kWh/yr</p>
                        <p className="text-gray-400 text-sm">{rec.payback.toFixed(1)} yr payback</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-500">
                      <p className="text-gray-400 text-sm">
                        Estimated cost: ${rec.cost.toFixed(0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Details */}
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Compliance Details</h3>
            <div className="space-y-3 text-sm">
              {energyCompliance.envelope.details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">{detail}</span>
                </div>
              ))}
              {energyCompliance.lighting.details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">{detail}</span>
                </div>
              ))}
              {energyCompliance.hvac.details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Psychrometric Analysis Results */}
      {psychrometricAnalysis && (
        <>
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Zone Air Properties</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="pb-2 text-gray-400 font-medium">Zone</th>
                    <th className="pb-2 text-gray-400 font-medium">Dry Bulb</th>
                    <th className="pb-2 text-gray-400 font-medium">Wet Bulb</th>
                    <th className="pb-2 text-gray-400 font-medium">Dew Point</th>
                    <th className="pb-2 text-gray-400 font-medium">RH</th>
                    <th className="pb-2 text-gray-400 font-medium">Humidity Ratio</th>
                    <th className="pb-2 text-gray-400 font-medium">Enthalpy</th>
                    <th className="pb-2 text-gray-400 font-medium">Specific Vol</th>
                  </tr>
                </thead>
                <tbody>
                  {psychrometricAnalysis.states.map((state, idx) => (
                    <tr key={idx} className="border-b border-gray-600">
                      <td className="py-2 text-white">{state.name}</td>
                      <td className="py-2 text-gray-300">{state.dryBulb.toFixed(1)}°F</td>
                      <td className="py-2 text-gray-300">{state.wetBulb?.toFixed(1)}°F</td>
                      <td className="py-2 text-gray-300">{state.dewPoint?.toFixed(1)}°F</td>
                      <td className="py-2 text-gray-300">{((state.relativeHumidity || 0) * 100).toFixed(0)}%</td>
                      <td className="py-2 text-gray-300">{state.humidityRatio?.toFixed(4)} lb/lb</td>
                      <td className="py-2 text-gray-300">{state.enthalpy?.toFixed(1)} BTU/lb</td>
                      <td className="py-2 text-gray-300">{state.specificVolume?.toFixed(2)} ft³/lb</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cooling Process Analysis */}
          {psychrometricAnalysis.process && (
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {psychrometricAnalysis.process.name}
              </h3>
              
              {/* Process States */}
              <div className="mb-6">
                <h4 className="text-gray-300 font-medium mb-3">Process States</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {psychrometricAnalysis.process.states.map((state, idx) => (
                    <div key={idx} className="bg-gray-600 rounded-lg p-3">
                      <p className="text-gray-400 text-sm mb-1">{state.name}</p>
                      <p className="text-white font-medium">{state.dryBulb.toFixed(1)}°F</p>
                      <p className="text-gray-300 text-sm">RH: {((state.relativeHumidity || 0) * 100).toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Loads */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <p className="text-gray-400 text-sm">Sensible Load</p>
                  </div>
                  <p className="text-white text-lg font-medium">
                    {(psychrometricAnalysis.process.load.sensible / 12000).toFixed(1)} tons
                  </p>
                  <p className="text-gray-400 text-sm">
                    {psychrometricAnalysis.process.load.sensible.toFixed(0)} BTU/hr
                  </p>
                </div>
                
                <div className="bg-gray-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <p className="text-gray-400 text-sm">Latent Load</p>
                  </div>
                  <p className="text-white text-lg font-medium">
                    {(psychrometricAnalysis.process.load.latent / 12000).toFixed(1)} tons
                  </p>
                  <p className="text-gray-400 text-sm">
                    {psychrometricAnalysis.process.load.latent.toFixed(0)} BTU/hr
                  </p>
                </div>
                
                <div className="bg-gray-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <p className="text-gray-400 text-sm">Total Load</p>
                  </div>
                  <p className="text-white text-lg font-medium">
                    {(psychrometricAnalysis.process.load.total / 12000).toFixed(1)} tons
                  </p>
                  <p className="text-gray-400 text-sm">
                    {psychrometricAnalysis.process.load.total.toFixed(0)} BTU/hr
                  </p>
                </div>
              </div>

              {/* Sensible Heat Ratio */}
              <div className="mt-4 bg-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Sensible Heat Ratio (SHR)</p>
                    <p className="text-white text-lg font-medium">
                      {(psychrometricAnalysis.process.load.sensible / psychrometricAnalysis.process.load.total).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Equipment SHR Target</p>
                    <p className="text-white text-lg font-medium">0.70 - 0.80</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderHVACDesign = () => (
    <div className="space-y-6">
      {/* HVAC Equipment Inventory */}
      <div className="bg-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">HVAC Equipment</h3>
          <button className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">
            Add Equipment
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hvacEquipment.map((equipment) => (
            <div 
              key={equipment.id}
              className={`bg-gray-600 rounded-lg p-4 cursor-pointer transition-all ${
                selectedEquipment === equipment.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedEquipment(equipment.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    equipment.type === 'heater' ? 'bg-red-500' :
                    equipment.type === 'cooler' ? 'bg-blue-500' :
                    equipment.type === 'fan' ? 'bg-gray-500' :
                    equipment.type === 'dehumidifier' ? 'bg-cyan-500' :
                    equipment.type === 'humidifier' ? 'bg-teal-500' :
                    equipment.type === 'co2_generator' ? 'bg-green-500' :
                    'bg-purple-500'
                  }`}>
                    {equipment.type === 'heater' && <Sun className="w-4 h-4 text-white" />}
                    {equipment.type === 'cooler' && <Snowflake className="w-4 h-4 text-white" />}
                    {equipment.type === 'fan' && <Fan className="w-4 h-4 text-white" />}
                    {equipment.type === 'dehumidifier' && <Droplets className="w-4 h-4 text-white" />}
                    {equipment.type === 'humidifier' && <Droplets className="w-4 h-4 text-white" />}
                    {equipment.type === 'co2_generator' && <Cloud className="w-4 h-4 text-white" />}
                    {equipment.type === 'exhaust_fan' && <Wind className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{equipment.name}</h4>
                    <p className="text-gray-400 text-sm capitalize">{equipment.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  equipment.status === 'active' ? 'bg-green-500' :
                  equipment.status === 'standby' ? 'bg-yellow-500' :
                  equipment.status === 'error' ? 'bg-red-500' :
                  'bg-orange-500'
                }`} />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Capacity:</span>
                  <span className="text-white">{equipment.capacity.toLocaleString()}</span>
                </div>
                {equipment.specifications.power && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Power:</span>
                    <span className="text-white">{equipment.specifications.power}W</span>
                  </div>
                )}
                {equipment.specifications.airflow && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Airflow:</span>
                    <span className="text-white">{equipment.specifications.airflow} CFM</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Performance */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Performance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Energy Efficiency</h4>
            <p className="text-2xl font-bold text-green-400">{systemMetrics.systemEfficiency}%</p>
            <p className="text-xs text-gray-400">System efficiency rating</p>
          </div>
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Total Airflow</h4>
            <p className="text-2xl font-bold text-blue-400">{systemMetrics.totalCFM.toLocaleString()}</p>
            <p className="text-xs text-gray-400">CFM total capacity</p>
          </div>
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Daily Usage</h4>
            <p className="text-2xl font-bold text-yellow-400">{systemMetrics.energyUsageToday}</p>
            <p className="text-xs text-gray-400">kWh today</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
            <Thermometer className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Environmental Controls Designer</h2>
            <p className="text-gray-400">Climate control, ventilation, and air quality management</p>
          </div>
        </div>
        
        {/* Mode selector */}
        <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview', icon: Activity },
            { key: 'zones', label: 'Zones', icon: Grid },
            { key: 'hvac', label: 'HVAC', icon: Settings },
            { key: 'ventilation', label: 'Ventilation', icon: Wind },
            { key: 'monitoring', label: 'Monitor', icon: Gauge },
            { key: 'ductwork', label: 'Ductwork', icon: Ruler },
            { key: 'analysis', label: 'Analysis', icon: Calculator }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setDesignMode(key as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                designMode === key
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on design mode */}
      {designMode === 'overview' && renderOverview()}
      {designMode === 'hvac' && renderHVACDesign()}
      {designMode === 'zones' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Zone Configuration</h3>
          <p className="text-gray-400">Zone management tools coming soon...</p>
        </div>
      )}
      {designMode === 'ventilation' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ventilation System Design</h3>
          <p className="text-gray-400">Ventilation design tools coming soon...</p>
        </div>
      )}
      {designMode === 'monitoring' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Real-time Monitoring</h3>
          <p className="text-gray-400">Monitoring dashboard coming soon...</p>
        </div>
      )}
      {designMode === 'ductwork' && renderDuctwork()}
      {designMode === 'analysis' && renderAnalysis()}
    </div>
  );
}

export default EnvironmentalControlsDesigner;