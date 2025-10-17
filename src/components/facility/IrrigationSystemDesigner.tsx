'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Droplets, 
  Settings, 
  Zap, 
  Gauge, 
  Beaker, 
  Waves,
  MapPin,
  Route,
  Database,
  Filter,
  Thermometer,
  Activity,
  Calculator,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { HydraulicCalculator, PipeSegment as HydraulicPipeSegment, PumpCurve, SystemPoint } from '@/lib/hydraulic-calculations';
import { PumpSelector, PumpSelectionCriteria, PumpPerformance } from '@/lib/pump-selection';

interface IrrigationZone {
  id: string;
  name: string;
  area: number; // sq ft
  cropType: 'propagation' | 'vegetative' | 'flowering' | 'mother';
  flowRate: number; // GPM
  pressure: number; // PSI
  scheduleActive: boolean;
  lastWatering: string;
  soilMoisture: number; // percentage
  ph: number;
  ec: number; // electrical conductivity
}

interface PipeSegment {
  id: string;
  startPoint: [number, number];
  endPoint: [number, number];
  diameter: number; // inches
  material: 'PVC' | 'CPVC' | 'Steel' | 'Copper' | 'HDPE';
  pressure: number; // PSI
  flowRate: number; // GPM
  length?: number; // feet
  elevation?: number; // feet
  velocity?: number; // fps
  frictionLoss?: number; // psi/100ft
  fittings?: Array<{
    type: 'elbow90' | 'elbow45' | 'tee' | 'valve' | 'reducer';
    quantity: number;
  }>;
}

interface IrrigationEquipment {
  type: 'pump' | 'tank' | 'filter' | 'injector' | 'valve' | 'sensor';
  id: string;
  name: string;
  position: [number, number];
  specifications: {
    capacity?: number;
    pressure?: number;
    flowRate?: number;
    material?: string;
    automation?: boolean;
  };
  status: 'active' | 'standby' | 'maintenance' | 'error';
}

interface FacilityConfig {
  dimensions: { length: number; width: number; height: number };
}

interface IrrigationSystemDesignerProps {
  facilityConfig: FacilityConfig;
  onSystemUpdate?: (system: any) => void;
}

export function IrrigationSystemDesigner({ facilityConfig, onSystemUpdate }: IrrigationSystemDesignerProps) {
  const [designMode, setDesignMode] = useState<'overview' | 'layout' | 'equipment' | 'zones' | 'monitoring' | 'hydraulics'>('overview');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [hydraulicResults, setHydraulicResults] = useState<any>(null);
  const [pumpSelection, setPumpSelection] = useState<PumpPerformance | null>(null);
  const [showHydraulicAnalysis, setShowHydraulicAnalysis] = useState(false);

  const [irrigationZones, setIrrigationZones] = useState<IrrigationZone[]>([
    {
      id: 'zone-1',
      name: 'Propagation Area A',
      area: 800,
      cropType: 'propagation',
      flowRate: 12.5,
      pressure: 25,
      scheduleActive: true,
      lastWatering: '2 hours ago',
      soilMoisture: 78,
      ph: 6.2,
      ec: 1.8
    },
    {
      id: 'zone-2', 
      name: 'Vegetative Area B',
      area: 1200,
      cropType: 'vegetative',
      flowRate: 18.2,
      pressure: 30,
      scheduleActive: true,
      lastWatering: '45 minutes ago',
      soilMoisture: 65,
      ph: 5.9,
      ec: 2.1
    },
    {
      id: 'zone-3',
      name: 'Flowering Room 1',
      area: 2000,
      cropType: 'flowering',
      flowRate: 25.8,
      pressure: 35,
      scheduleActive: true,
      lastWatering: '1 hour ago',
      soilMoisture: 72,
      ph: 6.0,
      ec: 2.4
    },
    {
      id: 'zone-4',
      name: 'Mother Plant Area',
      area: 600,
      cropType: 'mother',
      flowRate: 8.4,
      pressure: 28,
      scheduleActive: true,
      lastWatering: '3 hours ago',
      soilMoisture: 82,
      ph: 6.1,
      ec: 1.9
    }
  ]);

  const [equipment, setEquipment] = useState<IrrigationEquipment[]>([
    {
      type: 'tank',
      id: 'tank-main',
      name: 'Main Nutrient Tank A',
      position: [10, 10],
      specifications: {
        capacity: 500, // gallons
        material: 'HDPE',
        automation: true
      },
      status: 'active'
    },
    {
      type: 'tank',
      id: 'tank-secondary',
      name: 'Secondary Tank B',
      position: [15, 10],
      specifications: {
        capacity: 500,
        material: 'HDPE',
        automation: true
      },
      status: 'active'
    },
    {
      type: 'pump',
      id: 'pump-main',
      name: 'Primary Circulation Pump',
      position: [12.5, 15],
      specifications: {
        flowRate: 85, // GPM
        pressure: 60, // PSI
        automation: true
      },
      status: 'active'
    },
    {
      type: 'filter',
      id: 'filter-main',
      name: 'Main Filtration System',
      position: [12.5, 20],
      specifications: {
        flowRate: 85,
        material: 'Stainless Steel'
      },
      status: 'active'
    },
    {
      type: 'injector',
      id: 'injector-nutrients',
      name: 'Nutrient Injection System',
      position: [12.5, 25],
      specifications: {
        automation: true
      },
      status: 'active'
    }
  ]);

  const [pipeNetwork, setPipeNetwork] = useState<PipeSegment[]>([
    {
      id: 'main-line',
      startPoint: [12.5, 25],
      endPoint: [50, 25],
      diameter: 4,
      material: 'PVC',
      pressure: 45,
      flowRate: 75,
      length: 150,
      elevation: 0
    },
    {
      id: 'zone-1-line',
      startPoint: [20, 25],
      endPoint: [20, 40],
      diameter: 2,
      material: 'PVC',
      pressure: 25,
      flowRate: 12.5,
      length: 75,
      elevation: 2,
      fittings: [{ type: 'elbow90', quantity: 1 }, { type: 'valve', quantity: 1 }]
    },
    {
      id: 'zone-2-line',
      startPoint: [30, 25],
      endPoint: [30, 45],
      diameter: 2.5,
      material: 'PVC',
      pressure: 30,
      flowRate: 18.2,
      length: 100,
      elevation: 2,
      fittings: [{ type: 'elbow90', quantity: 1 }, { type: 'valve', quantity: 1 }]
    },
    {
      id: 'zone-3-line',
      startPoint: [40, 25],
      endPoint: [40, 50],
      diameter: 3,
      material: 'PVC',
      pressure: 35,
      flowRate: 25.8,
      length: 125,
      elevation: 2,
      fittings: [{ type: 'elbow90', quantity: 2 }, { type: 'tee', quantity: 1 }, { type: 'valve', quantity: 1 }]
    }
  ]);

  const systemMetrics = useMemo(() => {
    const totalFlowRate = irrigationZones.reduce((sum, zone) => sum + zone.flowRate, 0);
    const totalArea = irrigationZones.reduce((sum, zone) => sum + zone.area, 0);
    const avgSoilMoisture = irrigationZones.reduce((sum, zone) => sum + zone.soilMoisture, 0) / irrigationZones.length;
    const avgPh = irrigationZones.reduce((sum, zone) => sum + zone.ph, 0) / irrigationZones.length;
    
    return {
      totalFlowRate,
      totalArea,
      avgSoilMoisture,
      avgPh,
      efficiency: 87.3,
      activeZones: irrigationZones.filter(z => z.scheduleActive).length,
      waterUsageToday: 2847 // gallons
    };
  }, [irrigationZones]);

  // Perform hydraulic calculations
  const performHydraulicAnalysis = useCallback(() => {
    // Convert pipe network to hydraulic segments
    const hydraulicSegments: HydraulicPipeSegment[] = pipeNetwork.map(pipe => ({
      id: pipe.id,
      diameter: pipe.diameter,
      length: pipe.length || 100,
      material: pipe.material as any,
      flowRate: pipe.flowRate,
      elevation: pipe.elevation || 0,
      fittings: pipe.fittings?.map(f => ({
        type: f.type as any,
        size: pipe.diameter,
        kFactor: undefined
      })) || []
    }));

    // Calculate system head
    const systemPoint = HydraulicCalculator.systemHead(hydraulicSegments);
    
    // Calculate velocities and friction losses
    const updatedPipes = pipeNetwork.map(pipe => {
      const velocity = HydraulicCalculator.velocity(pipe.flowRate, pipe.diameter);
      const frictionLoss = HydraulicCalculator.hazenWilliamsPressureLoss(
        pipe.flowRate,
        pipe.diameter,
        pipe.length || 100,
        pipe.material
      );
      
      return {
        ...pipe,
        velocity,
        frictionLoss: frictionLoss / (pipe.length || 100) * 100 // per 100 ft
      };
    });

    setPipeNetwork(updatedPipes);
    
    // Perform pump selection
    const criteria: PumpSelectionCriteria = {
      designFlow: systemMetrics.totalFlowRate,
      designPressure: systemPoint.pressure,
      altitude: 0,
      temperature: 68,
      application: 'supplyAir',
      efficiency: 70
    };

    const pumps = PumpSelector.selectPump(criteria);
    if (pumps.length > 0) {
      setPumpSelection(pumps[0]);
    }

    setHydraulicResults({
      systemHead: systemPoint,
      pumpOptions: pumps.slice(0, 3),
      velocities: updatedPipes.map(p => ({ id: p.id, velocity: p.velocity })),
      npshAvailable: HydraulicCalculator.npshAvailable(14.7, 0.36, 5, 2),
      criticalPoints: identifyCriticalPoints(updatedPipes)
    });
  }, [pipeNetwork, systemMetrics]);

  const identifyCriticalPoints = (pipes: PipeSegment[]) => {
    const issues = [];
    
    pipes.forEach(pipe => {
      if (pipe.velocity && pipe.velocity > 7) {
        issues.push({
          type: 'high_velocity',
          location: pipe.id,
          value: pipe.velocity,
          recommendation: 'Increase pipe diameter to reduce velocity below 7 fps'
        });
      }
      
      if (pipe.frictionLoss && pipe.frictionLoss > 5) {
        issues.push({
          type: 'high_friction',
          location: pipe.id,
          value: pipe.frictionLoss,
          recommendation: 'Increase pipe diameter to reduce friction loss'
        });
      }
    });
    
    return issues;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Flow Rate</span>
            <Waves className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">{systemMetrics.totalFlowRate.toFixed(1)} GPM</p>
          <p className="text-xs text-green-400">+2.3% from yesterday</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Coverage Area</span>
            <MapPin className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">{systemMetrics.totalArea.toLocaleString()} sq ft</p>
          <p className="text-xs text-gray-400">Across {irrigationZones.length} zones</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">System Efficiency</span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-white">{systemMetrics.efficiency}%</p>
          <p className="text-xs text-green-400">Excellent</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Daily Usage</span>
            <Database className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-white">{systemMetrics.waterUsageToday}</p>
          <p className="text-xs text-gray-400">gallons today</p>
        </div>
      </div>

      {/* System Layout Preview */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Irrigation System Layout</h3>
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
            
            {/* Pipe network */}
            {pipeNetwork.map((pipe) => (
              <line
                key={pipe.id}
                x1={pipe.startPoint[0]}
                y1={pipe.startPoint[1]}
                x2={pipe.endPoint[0]}
                y2={pipe.endPoint[1]}
                stroke="#3B82F6"
                strokeWidth={pipe.diameter / 2}
                opacity={0.8}
              />
            ))}
            
            {/* Equipment */}
            {equipment.map((item) => (
              <g key={item.id}>
                <circle
                  cx={item.position[0]}
                  cy={item.position[1]}
                  r={2}
                  fill={item.status === 'active' ? '#10B981' : '#F59E0B'}
                  className="cursor-pointer"
                  onClick={() => setSelectedEquipment(item.id)}
                />
                <text
                  x={item.position[0]}
                  y={item.position[1] - 3}
                  fill="#E5E7EB"
                  fontSize="2"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {item.type.charAt(0).toUpperCase()}
                </text>
              </g>
            ))}
            
            {/* Irrigation zones */}
            {irrigationZones.map((zone, index) => {
              const x = 20 + (index * 20);
              const y = 35;
              const width = 15;
              const height = 20;
              
              return (
                <g key={zone.id}>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={zone.scheduleActive ? '#10B981' : '#6B7280'}
                    opacity={0.3}
                    className="cursor-pointer"
                    onClick={() => setSelectedZone(zone.id)}
                  />
                  <text
                    x={x + width/2}
                    y={y + height/2}
                    fill="#E5E7EB"
                    fontSize="2"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {zone.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Zone Status Grid */}
      <div className="grid grid-cols-2 gap-4">
        {irrigationZones.map((zone) => (
          <div 
            key={zone.id}
            className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all ${
              selectedZone === zone.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedZone(zone.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">{zone.name}</h4>
              <div className={`w-3 h-3 rounded-full ${zone.scheduleActive ? 'bg-green-500' : 'bg-gray-500'}`} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-400">Flow Rate</p>
                <p className="text-white font-medium">{zone.flowRate} GPM</p>
              </div>
              <div>
                <p className="text-gray-400">Moisture</p>
                <p className="text-white font-medium">{zone.soilMoisture}%</p>
              </div>
              <div>
                <p className="text-gray-400">pH</p>
                <p className="text-white font-medium">{zone.ph.toFixed(1)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLayoutDesign = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Pipe Network Design</h3>
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">
              Add Main Line
            </button>
            <button className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">
              Add Branch
            </button>
            <button className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm">
              Auto Route
            </button>
          </div>
        </div>
        
        {/* Pipe Specifications Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-600">
                <th className="text-left p-3">Pipe ID</th>
                <th className="text-left p-3">Diameter</th>
                <th className="text-left p-3">Material</th>
                <th className="text-left p-3">Flow Rate</th>
                <th className="text-left p-3">Pressure</th>
                <th className="text-left p-3">Length</th>
              </tr>
            </thead>
            <tbody>
              {pipeNetwork.map((pipe) => {
                const length = Math.sqrt(
                  Math.pow(pipe.endPoint[0] - pipe.startPoint[0], 2) + 
                  Math.pow(pipe.endPoint[1] - pipe.startPoint[1], 2)
                ).toFixed(1);
                
                return (
                  <tr key={pipe.id} className="text-white border-b border-gray-700 hover:bg-gray-600">
                    <td className="p-3 font-medium">{pipe.id}</td>
                    <td className="p-3">{pipe.diameter}"</td>
                    <td className="p-3">{pipe.material}</td>
                    <td className="p-3">{pipe.flowRate} GPM</td>
                    <td className="p-3">{pipe.pressure} PSI</td>
                    <td className="p-3">{length} ft</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hydraulic Calculations */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Hydraulic Analysis</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">System Pressure</h4>
            <p className="text-2xl font-bold text-blue-400">45 PSI</p>
            <p className="text-xs text-gray-400">Main line pressure</p>
          </div>
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Head Loss</h4>
            <p className="text-2xl font-bold text-yellow-400">12.3 ft</p>
            <p className="text-xs text-gray-400">Total system loss</p>
          </div>
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Pump Capacity</h4>
            <p className="text-2xl font-bold text-green-400">85 GPM</p>
            <p className="text-xs text-gray-400">@ 60 PSI</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEquipmentDesign = () => (
    <div className="space-y-6">
      {/* Equipment Inventory */}
      <div className="bg-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">System Equipment</h3>
          <button className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">
            Add Equipment
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((item) => (
            <div 
              key={item.id}
              className={`bg-gray-600 rounded-lg p-4 cursor-pointer transition-all ${
                selectedEquipment === item.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedEquipment(item.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    item.type === 'pump' ? 'bg-blue-500' :
                    item.type === 'tank' ? 'bg-green-500' :
                    item.type === 'filter' ? 'bg-purple-500' :
                    item.type === 'injector' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`}>
                    {item.type === 'pump' && <Zap className="w-4 h-4 text-white" />}
                    {item.type === 'tank' && <Database className="w-4 h-4 text-white" />}
                    {item.type === 'filter' && <Filter className="w-4 h-4 text-white" />}
                    {item.type === 'injector' && <Beaker className="w-4 h-4 text-white" />}
                    {(item.type === 'valve' || item.type === 'sensor') && <Settings className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{item.name}</h4>
                    <p className="text-gray-400 text-sm capitalize">{item.type}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  item.status === 'active' ? 'bg-green-500' :
                  item.status === 'standby' ? 'bg-yellow-500' :
                  item.status === 'error' ? 'bg-red-500' :
                  'bg-orange-500'
                }`} />
              </div>
              
              <div className="space-y-2 text-sm">
                {item.specifications.capacity && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Capacity:</span>
                    <span className="text-white">{item.specifications.capacity} gal</span>
                  </div>
                )}
                {item.specifications.flowRate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Flow Rate:</span>
                    <span className="text-white">{item.specifications.flowRate} GPM</span>
                  </div>
                )}
                {item.specifications.pressure && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pressure:</span>
                    <span className="text-white">{item.specifications.pressure} PSI</span>
                  </div>
                )}
                {item.specifications.automation && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Automation:</span>
                    <span className="text-green-400">Enabled</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Specifications */}
      {selectedEquipment && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Equipment Details</h3>
          {(() => {
            const item = equipment.find(e => e.id === selectedEquipment);
            if (!item) return null;
            
            return (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Equipment Name</label>
                    <input 
                      type="text" 
                      value={item.name}
                      className="w-full bg-gray-600 text-white rounded-lg p-3"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Position (X, Y)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="number" 
                        value={item.position[0]}
                        className="bg-gray-600 text-white rounded-lg p-3"
                        readOnly
                      />
                      <input 
                        type="number" 
                        value={item.position[1]}
                        className="bg-gray-600 text-white rounded-lg p-3"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Status</label>
                    <select className="w-full bg-gray-600 text-white rounded-lg p-3">
                      <option value="active">Active</option>
                      <option value="standby">Standby</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Automation</label>
                    <select className="w-full bg-gray-600 text-white rounded-lg p-3">
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      {/* Real-time monitoring dashboard */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">System Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">System Pressure</span>
              <span className="text-white font-bold">45 PSI</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Flow Rate</span>
              <span className="text-white font-bold">{systemMetrics.totalFlowRate.toFixed(1)} GPM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Average pH</span>
              <span className="text-white font-bold">{systemMetrics.avgPh.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Soil Moisture</span>
              <span className="text-white font-bold">{systemMetrics.avgSoilMoisture.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Alerts & Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-400 text-sm">Zone 2 pressure slightly low</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-sm">All pumps operating normally</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-blue-400 text-sm">Scheduled maintenance in 3 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHydraulics = () => (
    <div className="space-y-6">
      {/* Hydraulic Analysis Controls */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Hydraulic Analysis</h3>
          <button
            onClick={performHydraulicAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Run Analysis
          </button>
        </div>
        
        {hydraulicResults && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-600 rounded-lg p-3">
              <p className="text-gray-400 text-sm">System Head</p>
              <p className="text-xl font-bold text-white">{hydraulicResults.systemHead.totalHead.toFixed(1)} ft</p>
              <p className="text-sm text-gray-400">({hydraulicResults.systemHead.pressure.toFixed(1)} PSI)</p>
            </div>
            <div className="bg-gray-600 rounded-lg p-3">
              <p className="text-gray-400 text-sm">NPSH Available</p>
              <p className="text-xl font-bold text-white">{hydraulicResults.npshAvailable.toFixed(1)} ft</p>
            </div>
            <div className="bg-gray-600 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Critical Points</p>
              <p className="text-xl font-bold text-white">{hydraulicResults.criticalPoints.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Pipe Analysis */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Pipe Network Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="pb-2 text-gray-400 font-medium">Pipe ID</th>
                <th className="pb-2 text-gray-400 font-medium">Diameter</th>
                <th className="pb-2 text-gray-400 font-medium">Flow Rate</th>
                <th className="pb-2 text-gray-400 font-medium">Velocity</th>
                <th className="pb-2 text-gray-400 font-medium">Friction Loss</th>
                <th className="pb-2 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {pipeNetwork.map(pipe => (
                <tr key={pipe.id} className="border-b border-gray-600">
                  <td className="py-2 text-white">{pipe.id}</td>
                  <td className="py-2 text-gray-300">{pipe.diameter}"</td>
                  <td className="py-2 text-gray-300">{pipe.flowRate} GPM</td>
                  <td className="py-2 text-gray-300">
                    {pipe.velocity ? `${pipe.velocity.toFixed(1)} fps` : '-'}
                  </td>
                  <td className="py-2 text-gray-300">
                    {pipe.frictionLoss ? `${pipe.frictionLoss.toFixed(2)} psi/100ft` : '-'}
                  </td>
                  <td className="py-2">
                    {pipe.velocity && pipe.velocity > 7 ? (
                      <span className="text-yellow-400">High Velocity</span>
                    ) : pipe.frictionLoss && pipe.frictionLoss > 5 ? (
                      <span className="text-orange-400">High Friction</span>
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

      {/* Pump Selection */}
      {pumpSelection && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Recommended Pump</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Selected Pump</p>
              <p className="text-white font-medium">{pumpSelection.pump.manufacturer} {pumpSelection.pump.model}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Operating Point</p>
              <p className="text-white">{pumpSelection.operatingPoint.flow.toFixed(1)} GPM @ {pumpSelection.operatingPoint.head.toFixed(1)} ft</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Efficiency</p>
              <p className="text-white">{pumpSelection.operatingPoint.efficiency.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Motor Power</p>
              <p className="text-white">{pumpSelection.operatingPoint.power.toFixed(1)} HP</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Annual Energy Cost</p>
              <p className="text-white">${pumpSelection.annualEnergyCost.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Selection Score</p>
              <p className="text-white">{pumpSelection.score.toFixed(0)}/100</p>
            </div>
          </div>
        </div>
      )}

      {/* Critical Issues */}
      {hydraulicResults?.criticalPoints.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Critical Issues Found</h3>
          </div>
          <div className="space-y-2">
            {hydraulicResults.criticalPoints.map((issue: any, idx: number) => (
              <div key={idx} className="text-sm">
                <p className="text-red-300">
                  {issue.type === 'high_velocity' ? 'High Velocity' : 'High Friction Loss'} at {issue.location}
                </p>
                <p className="text-gray-400">{issue.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
            <Droplets className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Irrigation System Designer</h2>
            <p className="text-gray-400">Complete irrigation layout and control system</p>
          </div>
        </div>
        
        {/* Mode selector */}
        <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview', icon: Activity },
            { key: 'layout', label: 'Layout', icon: Route },
            { key: 'equipment', label: 'Equipment', icon: Settings },
            { key: 'monitoring', label: 'Monitor', icon: Gauge },
            { key: 'hydraulics', label: 'Hydraulics', icon: Calculator }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setDesignMode(key as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                designMode === key
                  ? 'bg-blue-600 text-white'
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
      {designMode === 'layout' && renderLayoutDesign()}
      {designMode === 'equipment' && renderEquipmentDesign()}
      {designMode === 'monitoring' && renderMonitoring()}
      {designMode === 'hydraulics' && renderHydraulics()}
    </div>
  );
}

export default IrrigationSystemDesigner;