'use client';

import React, { useState, useCallback } from 'react';
import { useDesigner } from '../context/DesignerContext';
import { 
  Factory, 
  Flame, 
  Zap, 
  Droplets, 
  Wind, 
  Gauge, 
  Building,
  Settings,
  Calculator,
  Download,
  FileText,
  Plus,
  Trash2,
  Move,
  RotateCw
} from 'lucide-react';

interface CogenerationComponent {
  id: string;
  type: 'cogeneration_unit' | 'boiler' | 'heat_exchanger' | 'chiller' | 'cooling_tower' | 'electrical_panel' | 'gas_meter' | 'piping' | 'ductwork';
  manufacturer: string;
  model: string;
  specifications: any;
  position: { x: number; y: number; z?: number };
  rotation: number;
  connections: {
    electrical?: string[];
    gas?: string[];
    hot_water?: string[];
    chilled_water?: string[];
    steam?: string[];
    condensate?: string[];
  };
  dimensions: {
    width: number; // inches
    depth: number; // inches  
    height: number; // inches
    weight: number; // lbs
  };
  clearances: {
    front: number; // inches
    back: number; // inches
    left: number; // inches
    right: number; // inches
    top: number; // inches
  };
  mounting: {
    type: 'floor' | 'wall' | 'ceiling' | 'suspended' | 'pad';
    requirements: string[];
  };
  utilities: {
    electrical?: {
      voltage: number;
      amperage: number;
      phase: 1 | 3;
      frequency: 50 | 60;
    };
    gas?: {
      supply: string; // "2" psig, "5" psig, etc.
      consumption: number; // BTU/hr
      connection: string; // pipe size
    };
    water?: {
      supply: string; // GPM at PSI
      drain: boolean;
      connection: string; // pipe size
    };
  };
}

// US Standard Construction Components Database
const cogenerationEquipmentDatabase = {
  cogeneration_units: [
    {
      id: 'caterpillar_cg132_8',
      manufacturer: 'Caterpillar',
      model: 'CG132-8',
      type: 'Natural Gas Engine Generator',
      electricalOutput: 130, // kW
      thermalOutput: 189, // kW
      dimensions: { width: 66, depth: 144, height: 78, weight: 8800 },
      clearances: { front: 60, back: 36, left: 36, right: 36, top: 36 },
      specifications: {
        fuel: 'Natural Gas',
        efficiency: { electrical: 35.2, thermal: 51.2, total: 86.4 },
        emissions: { nox: 0.5, co: 2.0 },
        sound: 75 // dBA at 23 feet
      },
      utilities: {
        electrical: { voltage: 480, amperage: 180, phase: 3, frequency: 60 },
        gas: { supply: '5 psig', consumption: 1066000, connection: '2"' },
        water: { supply: '15 GPM at 40 PSI', drain: true, connection: '3/4"' }
      }
    },
    {
      id: 'capstone_c200s',
      manufacturer: 'Capstone',
      model: 'C200S',
      type: 'Microturbine',
      electricalOutput: 200, // kW
      thermalOutput: 260, // kW
      dimensions: { width: 96, depth: 120, height: 84, weight: 7000 },
      clearances: { front: 72, back: 48, left: 48, right: 48, top: 48 },
      specifications: {
        fuel: 'Natural Gas',
        efficiency: { electrical: 33, thermal: 43, total: 76 },
        emissions: { nox: 9, co: 40 },
        sound: 65 // dBA at 30 feet
      }
    }
  ],
  boilers: [
    {
      id: 'cleaver_brooks_cbi_700',
      manufacturer: 'Cleaver-Brooks',
      model: 'CBI-700',
      type: 'Firetube Boiler',
      capacity: 700, // HP (24,000 lbs/hr steam)
      dimensions: { width: 108, depth: 240, height: 120, weight: 45000 },
      clearances: { front: 96, back: 60, left: 48, right: 48, top: 60 },
      specifications: {
        fuel: 'Natural Gas',
        efficiency: 82,
        pressure: 150, // PSI
        temperature: 366 // °F
      }
    },
    {
      id: 'aerco_benchmark_6000',
      manufacturer: 'AERCO',
      model: 'Benchmark 6000',
      type: 'Condensing Boiler',
      capacity: 6000, // MBH
      dimensions: { width: 88, depth: 110, height: 108, weight: 8500 },
      clearances: { front: 60, back: 36, left: 18, right: 18, top: 24 }
    }
  ],
  heat_exchangers: [
    {
      id: 'alfa_laval_m20',
      manufacturer: 'Alfa Laval',
      model: 'M20-BFG',
      type: 'Plate Heat Exchanger',
      capacity: 5000, // MBH
      dimensions: { width: 42, depth: 84, height: 72, weight: 1200 },
      clearances: { front: 48, back: 24, left: 24, right: 48, top: 12 }
    }
  ],
  chillers: [
    {
      id: 'trane_cgam_200',
      manufacturer: 'Trane',
      model: 'CGAM-200',
      type: 'Air-Cooled Screw Chiller',
      capacity: 200, // tons
      dimensions: { width: 144, depth: 192, height: 96, weight: 12000 },
      clearances: { front: 120, back: 60, left: 60, right: 60, top: 120 }
    }
  ],
  cooling_towers: [
    {
      id: 'spx_marley_nc_200',
      manufacturer: 'SPX Marley',
      model: 'NC-200',
      type: 'Induced Draft Cooling Tower',
      capacity: 200, // tons
      dimensions: { width: 120, depth: 120, height: 144, weight: 8000 },
      clearances: { front: 60, back: 60, left: 60, right: 60, top: 120 }
    }
  ]
};

export function CogenerationDesignPanel() {
  const { state, dispatch } = useDesigner();
  const [selectedCategory, setSelectedCategory] = useState<string>('cogeneration_units');
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [placementMode, setPlacementMode] = useState(false);
  const [systemLoads, setSystemLoads] = useState({
    electrical: 150, // kW
    heating: 200, // kW  
    cooling: 100, // kW
    process: 50 // kW
  });

  const categories = [
    { id: 'cogeneration_units', name: 'Cogeneration Units', icon: Factory },
    { id: 'boilers', name: 'Boilers', icon: Flame },
    { id: 'heat_exchangers', name: 'Heat Exchangers', icon: Gauge },
    { id: 'chillers', name: 'Chillers', icon: Wind },
    { id: 'cooling_towers', name: 'Cooling Towers', icon: Droplets },
    { id: 'electrical_panels', name: 'Electrical', icon: Zap },
    { id: 'piping', name: 'Piping Systems', icon: Droplets },
    { id: 'ductwork', name: 'Ductwork', icon: Wind }
  ];

  const addComponentToDesign = useCallback((component: any, position: { x: number; y: number }) => {
    const newComponent: CogenerationComponent = {
      id: `${component.id}_${Date.now()}`,
      type: selectedCategory as any,
      manufacturer: component.manufacturer,
      model: component.model,
      specifications: component.specifications || component,
      position: { x, y, z: 0 },
      rotation: 0,
      connections: {},
      dimensions: component.dimensions,
      clearances: component.clearances,
      mounting: component.mounting || { type: 'floor', requirements: [] },
      utilities: component.utilities || {}
    };

    dispatch({
      type: 'ADD_COGENERATION_COMPONENT',
      payload: newComponent
    });

    setPlacementMode(false);
    setSelectedComponent(null);
  }, [selectedCategory, dispatch]);

  const calculateSystemPerformance = () => {
    const cogenerationUnits = state.cogenerationComponents?.filter(c => c.type === 'cogeneration_unit') || [];
    
    if (cogenerationUnits.length === 0) return null;

    const totalElectrical = cogenerationUnits.reduce((sum, unit) => 
      sum + (unit.specifications.electricalOutput || 0), 0);
    const totalThermal = cogenerationUnits.reduce((sum, unit) => 
      sum + (unit.specifications.thermalOutput || 0), 0);

    return {
      electricalOutput: totalElectrical,
      thermalOutput: totalThermal,
      electricalEfficiency: totalElectrical / (totalElectrical + totalThermal) * 100,
      loadCoverage: {
        electrical: Math.min(100, (totalElectrical / systemLoads.electrical) * 100),
        thermal: Math.min(100, (totalThermal / (systemLoads.heating + systemLoads.process)) * 100)
      }
    };
  };

  const performance = calculateSystemPerformance();

  return (
    <div className="w-full max-w-none bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Factory className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cogeneration System Design</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {/* Generate proposal */}}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              <FileText className="w-4 h-4 mr-1 inline" />
              Generate Proposal
            </button>
            <button
              onClick={() => {/* Export design */}}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-1 inline" />
              Export Design
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* System Load Requirements */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            Facility Load Requirements
          </h4>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Electrical Load (kW)
              </label>
              <input
                type="number"
                value={systemLoads.electrical}
                onChange={(e) => setSystemLoads(prev => ({ ...prev, electrical: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heating Load (kW)
              </label>
              <input
                type="number"
                value={systemLoads.heating}
                onChange={(e) => setSystemLoads(prev => ({ ...prev, heating: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cooling Load (kW)
              </label>
              <input
                type="number"
                value={systemLoads.cooling}
                onChange={(e) => setSystemLoads(prev => ({ ...prev, cooling: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Process Heat (kW)
              </label>
              <input
                type="number"
                value={systemLoads.process}
                onChange={(e) => setSystemLoads(prev => ({ ...prev, process: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        {performance && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">System Performance</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {performance.electricalOutput.toFixed(0)} kW
                </div>
                <div className="text-sm text-gray-600">Electrical Output</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {performance.thermalOutput.toFixed(0)} kW
                </div>
                <div className="text-sm text-gray-600">Thermal Output</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {performance.loadCoverage.electrical.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Electrical Coverage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {performance.loadCoverage.thermal.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Thermal Coverage</div>
              </div>
            </div>
          </div>
        )}

        {/* Component Categories */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Equipment Library</h4>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center justify-center p-3 border rounded text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Component Library */}
          <div className="max-h-96 overflow-y-auto">
            {cogenerationEquipmentDatabase[selectedCategory as keyof typeof cogenerationEquipmentDatabase]?.map((component: any) => (
              <div
                key={component.id}
                className="border border-gray-200 rounded-lg p-3 mb-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedComponent(component)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {component.manufacturer} {component.model}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {component.type}
                    </div>
                    
                    {/* Component Specs */}
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Capacity:</span><br />
                        {component.capacity || component.electricalOutput || 'N/A'} 
                        {component.electricalOutput ? ' kW' : component.capacity ? ' HP' : ''}
                      </div>
                      <div>
                        <span className="font-medium">Dimensions:</span><br />
                        {component.dimensions.width}"W × {component.dimensions.depth}"D × {component.dimensions.height}"H
                      </div>
                      <div>
                        <span className="font-medium">Weight:</span><br />
                        {component.dimensions.weight.toLocaleString()} lbs
                      </div>
                    </div>

                    {/* Clearances */}
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="font-medium">Clearances:</span> 
                      {component.clearances.front}" front, {component.clearances.back}" back, {component.clearances.left}/{component.clearances.right}" sides
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedComponent(component);
                      setPlacementMode(true);
                    }}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    <Plus className="w-3 h-3 mr-1 inline" />
                    Add to Design
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Placed Components */}
        {state.cogenerationComponents && state.cogenerationComponents.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Placed Components</h4>
            <div className="space-y-2">
              {state.cogenerationComponents.map((component) => (
                <div key={component.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900">
                      {component.manufacturer} {component.model}
                    </div>
                    <div className="text-sm text-gray-600">
                      Position: ({component.position.x.toFixed(1)}, {component.position.y.toFixed(1)})
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 text-gray-600 hover:text-blue-600">
                      <Move className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-blue-600">
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Installation Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Building className="w-4 h-4 mr-2" />
            Installation Considerations
          </h4>
          <div className="text-sm text-gray-700 space-y-1">
            <div>• All dimensions shown in US customary units (inches, feet, lbs)</div>
            <div>• Clearances are minimum requirements for service access</div>
            <div>• Floor loading calculations required for heavy equipment</div>
            <div>• Utilities (gas, electrical, water) connections as specified</div>
            <div>• Local code compliance and permitting required</div>
            <div>• Professional engineering review recommended</div>
          </div>
        </div>
      </div>
    </div>
  );
}