'use client';

import React, { useState, useMemo } from 'react';
import { 
  Leaf, 
  Scissors, 
  Package, 
  ArrowRight, 
  Clock, 
  Scale,
  Thermometer,
  Droplets,
  FlaskConical,
  Archive,
  Truck,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface CultivationArea {
  id: string;
  name: string;
  type: 'propagation' | 'vegetative' | 'flowering' | 'drying' | 'curing' | 'trimming' | 'packaging' | 'storage' | 'quarantine';
  area: number; // sq ft
  capacity: number; // plants or units
  position: [number, number];
  dimensions: { length: number; width: number };
  currentOccupancy: number;
  workstations: number;
  equipment: string[];
  environmental: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    lightingSchedule: string;
  };
}

interface WorkflowStage {
  id: string;
  name: string;
  duration: number; // days
  area: string;
  requirements: {
    staffing: number;
    equipment: string[];
    environmental: Record<string, any>;
  };
  nextStage?: string;
  qualityChecks: string[];
}

interface ProductionBatch {
  id: string;
  strain: string;
  quantity: number;
  currentStage: string;
  startDate: string;
  estimatedHarvest: string;
  status: 'active' | 'delayed' | 'completed' | 'quarantine';
  progress: number; // percentage
}

interface FacilityConfig {
  dimensions: { length: number; width: number; height: number };
}

interface CultivationWorkflowDesignerProps {
  facilityConfig: FacilityConfig;
  onSystemUpdate?: (system: any) => void;
}

export function CultivationWorkflowDesigner({ 
  facilityConfig, 
  onSystemUpdate 
}: CultivationWorkflowDesignerProps) {
  const [designMode, setDesignMode] = useState<'overview' | 'areas' | 'workflow' | 'production' | 'quality'>('overview');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  const [cultivationAreas, setCultivationAreas] = useState<CultivationArea[]>([
    {
      id: 'prop-area-1',
      name: 'Propagation Room 1',
      type: 'propagation',
      area: 400,
      capacity: 2000,
      position: [5, 5],
      dimensions: { length: 20, width: 20 },
      currentOccupancy: 1750,
      workstations: 4,
      equipment: ['Clone Dome', 'Heat Mats', 'T5 Fluorescent', 'Humidity Controller'],
      environmental: {
        temperature: { min: 72, max: 78 },
        humidity: { min: 70, max: 85 },
        lightingSchedule: '18/6'
      }
    },
    {
      id: 'veg-area-1',
      name: 'Vegetative Area 1',
      type: 'vegetative',
      area: 800,
      capacity: 500,
      position: [30, 5],
      dimensions: { length: 40, width: 20 },
      currentOccupancy: 425,
      workstations: 6,
      equipment: ['MH Lights', 'Circulation Fans', 'Fertigation System'],
      environmental: {
        temperature: { min: 70, max: 75 },
        humidity: { min: 60, max: 75 },
        lightingSchedule: '18/6'
      }
    },
    {
      id: 'flower-room-1',
      name: 'Flowering Room 1',
      type: 'flowering',
      area: 1200,
      capacity: 300,
      position: [5, 30],
      dimensions: { length: 60, width: 20 },
      currentOccupancy: 285,
      workstations: 8,
      equipment: ['LED Lights', 'Dehumidifiers', 'CO2 Generator', 'SCROG Nets'],
      environmental: {
        temperature: { min: 65, max: 72 },
        humidity: { min: 45, max: 60 },
        lightingSchedule: '12/12'
      }
    },
    {
      id: 'dry-room-1',
      name: 'Drying Room 1',
      type: 'drying',
      area: 300,
      capacity: 200,
      position: [75, 5],
      dimensions: { length: 15, width: 20 },
      currentOccupancy: 150,
      workstations: 2,
      equipment: ['Drying Racks', 'Environmental Controller', 'Air Circulation'],
      environmental: {
        temperature: { min: 60, max: 70 },
        humidity: { min: 45, max: 55 },
        lightingSchedule: 'Dark'
      }
    },
    {
      id: 'trim-area-1',
      name: 'Trimming & Processing',
      type: 'trimming',
      area: 600,
      capacity: 100,
      position: [75, 30],
      dimensions: { length: 30, width: 20 },
      currentOccupancy: 75,
      workstations: 12,
      equipment: ['Trim Tables', 'Vacuum Sealer', 'Scales', 'Storage Containers'],
      environmental: {
        temperature: { min: 65, max: 72 },
        humidity: { min: 45, max: 55 },
        lightingSchedule: 'Normal'
      }
    },
    {
      id: 'storage-vault',
      name: 'Secure Storage Vault',
      type: 'storage',
      area: 200,
      capacity: 1000,
      position: [95, 40],
      dimensions: { length: 10, width: 20 },
      currentOccupancy: 650,
      workstations: 2,
      equipment: ['Climate Control', 'Security System', 'Inventory Management'],
      environmental: {
        temperature: { min: 60, max: 65 },
        humidity: { min: 55, max: 62 },
        lightingSchedule: 'Dark'
      }
    }
  ]);

  const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([
    {
      id: 'stage-propagation',
      name: 'Propagation',
      duration: 14,
      area: 'prop-area-1',
      requirements: {
        staffing: 2,
        equipment: ['Clone Dome', 'Heat Mats'],
        environmental: { temperature: 75, humidity: 80 }
      },
      nextStage: 'stage-vegetative',
      qualityChecks: ['Root Development', 'Health Assessment', 'Size Requirements']
    },
    {
      id: 'stage-vegetative',
      name: 'Vegetative Growth',
      duration: 28,
      area: 'veg-area-1',
      requirements: {
        staffing: 3,
        equipment: ['MH Lights', 'Fertigation'],
        environmental: { temperature: 72, humidity: 65 }
      },
      nextStage: 'stage-flowering',
      qualityChecks: ['Height Requirements', 'Node Development', 'Pest Inspection']
    },
    {
      id: 'stage-flowering',
      name: 'Flowering',
      duration: 63,
      area: 'flower-room-1',
      requirements: {
        staffing: 4,
        equipment: ['LED Lights', 'Dehumidifiers'],
        environmental: { temperature: 68, humidity: 50 }
      },
      nextStage: 'stage-harvest',
      qualityChecks: ['Trichome Development', 'Pistil Color', 'Bud Density']
    },
    {
      id: 'stage-harvest',
      name: 'Harvest',
      duration: 1,
      area: 'flower-room-1',
      requirements: {
        staffing: 6,
        equipment: ['Trimming Scissors', 'Harvest Bins'],
        environmental: { temperature: 70, humidity: 50 }
      },
      nextStage: 'stage-drying',
      qualityChecks: ['Harvest Timing', 'Proper Cutting', 'Initial Weight']
    },
    {
      id: 'stage-drying',
      name: 'Drying',
      duration: 10,
      area: 'dry-room-1',
      requirements: {
        staffing: 1,
        equipment: ['Drying Racks', 'Environmental Controller'],
        environmental: { temperature: 65, humidity: 50 }
      },
      nextStage: 'stage-trimming',
      qualityChecks: ['Moisture Content', 'Stem Snap Test', 'Visual Inspection']
    },
    {
      id: 'stage-trimming',
      name: 'Trimming & Processing',
      duration: 5,
      area: 'trim-area-1',
      requirements: {
        staffing: 8,
        equipment: ['Trim Tables', 'Scales', 'Vacuum Sealer'],
        environmental: { temperature: 68, humidity: 50 }
      },
      nextStage: 'stage-curing',
      qualityChecks: ['Trim Quality', 'Final Weight', 'Packaging Standards']
    },
    {
      id: 'stage-curing',
      name: 'Curing & Storage',
      duration: 21,
      area: 'storage-vault',
      requirements: {
        staffing: 1,
        equipment: ['Curing Containers', 'Hygrometers'],
        environmental: { temperature: 62, humidity: 58 }
      },
      qualityChecks: ['Moisture Stabilization', 'Aroma Development', 'Final Testing']
    }
  ]);

  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([
    {
      id: 'batch-2024-001',
      strain: 'Blue Dream',
      quantity: 150,
      currentStage: 'stage-flowering',
      startDate: '2024-06-01',
      estimatedHarvest: '2024-09-15',
      status: 'active',
      progress: 75
    },
    {
      id: 'batch-2024-002',
      strain: 'OG Kush',
      quantity: 120,
      currentStage: 'stage-vegetative',
      startDate: '2024-07-01',
      estimatedHarvest: '2024-10-15',
      status: 'active',
      progress: 45
    },
    {
      id: 'batch-2024-003',
      strain: 'Sour Diesel',
      quantity: 180,
      currentStage: 'stage-drying',
      startDate: '2024-05-15',
      estimatedHarvest: '2024-08-30',
      status: 'active',
      progress: 95
    }
  ]);

  const operationalMetrics = useMemo(() => {
    const totalCapacity = cultivationAreas.reduce((sum, area) => sum + area.capacity, 0);
    const totalOccupancy = cultivationAreas.reduce((sum, area) => sum + area.currentOccupancy, 0);
    const utilizationRate = (totalOccupancy / totalCapacity) * 100;
    
    const activeBatches = productionBatches.filter(b => b.status === 'active').length;
    const totalWorkstations = cultivationAreas.reduce((sum, area) => sum + area.workstations, 0);
    
    const avgProgress = productionBatches.reduce((sum, batch) => sum + batch.progress, 0) / productionBatches.length;

    return {
      totalCapacity,
      totalOccupancy,
      utilizationRate: utilizationRate.toFixed(1),
      activeBatches,
      totalWorkstations,
      avgProgress: avgProgress.toFixed(1),
      estimatedYield: 12500, // lbs/year
      harvestsPerYear: 6.5
    };
  }, [cultivationAreas, productionBatches]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Operational Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Facility Utilization</span>
            <Leaf className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">{operationalMetrics.utilizationRate}%</p>
          <p className="text-xs text-gray-400">{operationalMetrics.totalOccupancy}/{operationalMetrics.totalCapacity} capacity</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Batches</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">{operationalMetrics.activeBatches}</p>
          <p className="text-xs text-green-400">Avg progress: {operationalMetrics.avgProgress}%</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Workstations</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-white">{operationalMetrics.totalWorkstations}</p>
          <p className="text-xs text-gray-400">Across all areas</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Annual Yield</span>
            <Scale className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-white">{operationalMetrics.estimatedYield.toLocaleString()}</p>
          <p className="text-xs text-gray-400">lbs/year projected</p>
        </div>
      </div>

      {/* Facility Layout */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cultivation Facility Layout</h3>
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
            
            {/* Cultivation areas */}
            {cultivationAreas.map((area) => {
              const utilizationColor = 
                area.currentOccupancy / area.capacity > 0.9 ? '#EF4444' :
                area.currentOccupancy / area.capacity > 0.7 ? '#F59E0B' :
                '#10B981';
              
              return (
                <g key={area.id}>
                  <rect
                    x={area.position[0]}
                    y={area.position[1]}
                    width={area.dimensions.length}
                    height={area.dimensions.width}
                    fill={utilizationColor}
                    opacity={0.3}
                    stroke={utilizationColor}
                    strokeWidth={0.5}
                    className="cursor-pointer"
                    onClick={() => setSelectedArea(area.id)}
                  />
                  <text
                    x={area.position[0] + area.dimensions.length/2}
                    y={area.position[1] + area.dimensions.width/2}
                    fill="#E5E7EB"
                    fontSize="2"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {area.name}
                  </text>
                  <text
                    x={area.position[0] + area.dimensions.length/2}
                    y={area.position[1] + area.dimensions.width/2 + 3}
                    fill="#E5E7EB"
                    fontSize="1.5"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {area.currentOccupancy}/{area.capacity}
                  </text>
                </g>
              );
            })}
            
            {/* Workflow arrows */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
              </marker>
            </defs>
            
            {/* Propagation to Vegetative */}
            <line
              x1={25}
              y1={15}
              x2={30}
              y2={15}
              stroke="#3B82F6"
              strokeWidth={1}
              markerEnd="url(#arrowhead)"
            />
            
            {/* Vegetative to Flowering */}
            <line
              x1={50}
              y1={25}
              x2={35}
              y2={30}
              stroke="#3B82F6"
              strokeWidth={1}
              markerEnd="url(#arrowhead)"
            />
            
            {/* Flowering to Drying */}
            <line
              x1={65}
              y1={40}
              x2={75}
              y2={25}
              stroke="#3B82F6"
              strokeWidth={1}
              markerEnd="url(#arrowhead)"
            />
            
            {/* Drying to Trimming */}
            <line
              x1={82.5}
              y1={25}
              x2={82.5}
              y2={30}
              stroke="#3B82F6"
              strokeWidth={1}
              markerEnd="url(#arrowhead)"
            />
          </svg>
        </div>
      </div>

      {/* Production Batches Status */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Active Production Batches</h3>
        <div className="space-y-3">
          {productionBatches.map((batch) => (
            <div 
              key={batch.id}
              className={`bg-gray-600 rounded-lg p-4 cursor-pointer transition-all ${
                selectedBatch === batch.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedBatch(batch.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{batch.strain}</h4>
                  <p className="text-gray-400 text-sm">{batch.id} • {batch.quantity} plants</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    batch.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    batch.status === 'delayed' ? 'bg-yellow-500/20 text-yellow-400' :
                    batch.status === 'quarantine' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {batch.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Current Stage</p>
                  <p className="text-white">{workflowStages.find(s => s.id === batch.currentStage)?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-500 rounded-full">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${batch.progress}%` }}
                      />
                    </div>
                    <span className="text-white">{batch.progress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400">Est. Harvest</p>
                  <p className="text-white">{batch.estimatedHarvest}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWorkflowDesign = () => (
    <div className="space-y-6">
      {/* Workflow Stages */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cultivation Workflow Stages</h3>
        <div className="space-y-4">
          {workflowStages.map((stage, index) => (
            <div key={stage.id} className="bg-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{stage.name}</h4>
                    <p className="text-gray-400 text-sm">{stage.duration} days duration</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-white">{stage.duration}d</span>
                  {stage.nextStage && <ArrowRight className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Staffing Required</p>
                  <p className="text-white">{stage.requirements.staffing} workers</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Equipment</p>
                  <p className="text-white">{stage.requirements.equipment.join(', ')}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Quality Checks</p>
                  <p className="text-white">{stage.qualityChecks.length} checkpoints</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-500">
                <p className="text-gray-400 text-sm mb-1">Quality Control Points:</p>
                <div className="flex flex-wrap gap-2">
                  {stage.qualityChecks.map((check, i) => (
                    <span key={i} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      {check}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Cultivation Workflow Designer</h2>
            <p className="text-gray-400">Production planning, workflow optimization, and quality control</p>
          </div>
        </div>
        
        {/* Mode selector */}
        <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview', icon: Leaf },
            { key: 'areas', label: 'Areas', icon: Package },
            { key: 'workflow', label: 'Workflow', icon: ArrowRight },
            { key: 'production', label: 'Production', icon: Scale },
            { key: 'quality', label: 'Quality', icon: CheckCircle }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setDesignMode(key as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                designMode === key
                  ? 'bg-green-600 text-white'
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
      {designMode === 'workflow' && renderWorkflowDesign()}
      {designMode === 'areas' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cultivation Area Management</h3>
          <div className="grid grid-cols-2 gap-4">
            {cultivationAreas.map((area) => (
              <div key={area.id} className="bg-gray-600 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">{area.name}</h4>
                <p className="text-gray-400 text-sm capitalize mb-3">{area.type} • {area.area} sq ft</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Capacity:</span>
                    <span className="text-white">{area.currentOccupancy}/{area.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Workstations:</span>
                    <span className="text-white">{area.workstations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Temperature:</span>
                    <span className="text-white">{area.environmental.temperature.min}-{area.environmental.temperature.max}°F</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {designMode === 'production' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Production Management</h3>
          <p className="text-gray-400">Production scheduling and batch tracking tools coming soon...</p>
        </div>
      )}
      {designMode === 'quality' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quality Control Systems</h3>
          <p className="text-gray-400">Quality assurance and testing protocols coming soon...</p>
        </div>
      )}
    </div>
  );
}

export default CultivationWorkflowDesigner;