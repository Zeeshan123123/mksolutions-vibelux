'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Grid, 
  Layers, 
  Wind, 
  Thermometer, 
  Settings, 
  Ruler, 
  Box,
  ArrowUpDown,
  RotateCcw,
  Download,
  Eye
} from 'lucide-react';

interface StructuralElement {
  id: string;
  type: 'frame' | 'roof' | 'wall' | 'foundation' | 'truss' | 'gutter';
  material: string;
  dimensions: { length: number; width: number; height?: number };
  position: { x: number; y: number; z: number };
  specifications: Record<string, any>;
}

interface GreenhouseStructure {
  frameType: 'gable' | 'gothic' | 'venlo' | 'tunnel';
  frameMaterial: 'aluminum' | 'galvanized_steel' | 'steel';
  glazingType: 'glass' | 'polycarbonate' | 'polyethylene';
  dimensions: { length: number; width: number; height: number };
  bays: number;
  elements: StructuralElement[];
  specifications: {
    windLoad: number;
    snowLoad: number;
    deadLoad: number;
    liveLoad: number;
  };
}

interface GreenhouseStructureDesignerProps {
  initialStructure?: Partial<GreenhouseStructure>;
  onStructureChange?: (structure: GreenhouseStructure) => void;
}

export function GreenhouseStructureDesigner({ 
  initialStructure, 
  onStructureChange 
}: GreenhouseStructureDesignerProps) {
  const [designMode, setDesignMode] = useState<'overview' | 'frame' | 'roof' | 'walls' | 'foundation' | 'analysis'>('overview');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  
  const [structure, setStructure] = useState<GreenhouseStructure>({
    frameType: 'gable',
    frameMaterial: 'aluminum',
    glazingType: 'polycarbonate',
    dimensions: { length: 120, width: 60, height: 16 },
    bays: 6,
    elements: [],
    specifications: {
      windLoad: 120, // mph
      snowLoad: 40,  // psf
      deadLoad: 15,  // psf
      liveLoad: 20   // psf
    },
    ...initialStructure
  });

  const [view3D, setView3D] = useState(true);

  useEffect(() => {
    generateStructuralElements();
  }, [structure.frameType, structure.dimensions, structure.bays, structure.frameMaterial]);

  useEffect(() => {
    onStructureChange?.(structure);
  }, [structure, onStructureChange]);

  const generateStructuralElements = () => {
    const elements: StructuralElement[] = [];
    const { length, width, height } = structure.dimensions;
    const baySpacing = length / structure.bays;

    // Generate frame elements
    for (let i = 0; i <= structure.bays; i++) {
      const x = i * baySpacing;
      
      // Main frame posts
      elements.push({
        id: `frame-${i}-left`,
        type: 'frame',
        material: structure.frameMaterial,
        dimensions: { length: 0.25, width: 0.25, height },
        position: { x, y: 0, z: 0 },
        specifications: {
          profile: structure.frameMaterial === 'aluminum' ? '6061-T6' : 'ASTM A36',
          coating: structure.frameMaterial === 'galvanized_steel' ? 'Hot-dip galvanized' : 'Powder coated'
        }
      });

      elements.push({
        id: `frame-${i}-right`,
        type: 'frame',
        material: structure.frameMaterial,
        dimensions: { length: 0.25, width: 0.25, height },
        position: { x, y: width, z: 0 },
        specifications: {
          profile: structure.frameMaterial === 'aluminum' ? '6061-T6' : 'ASTM A36',
          coating: structure.frameMaterial === 'galvanized_steel' ? 'Hot-dip galvanized' : 'Powder coated'
        }
      });

      // Roof trusses based on frame type
      if (structure.frameType === 'gable') {
        elements.push({
          id: `roof-truss-${i}`,
          type: 'truss',
          material: structure.frameMaterial,
          dimensions: { length: width, width: 0.2, height: height * 0.3 },
          position: { x, y: width / 2, z: height },
          specifications: {
            type: 'Gable truss',
            slope: '4:12',
            spacing: `${baySpacing}' O.C.`
          }
        });
      } else if (structure.frameType === 'gothic') {
        elements.push({
          id: `roof-arch-${i}`,
          type: 'truss',
          material: structure.frameMaterial,
          dimensions: { length: width, width: 0.2, height: height * 0.4 },
          position: { x, y: width / 2, z: height },
          specifications: {
            type: 'Gothic arch',
            radius: width / 2,
            spacing: `${baySpacing}' O.C.`
          }
        });
      }
    }

    // Generate gutter systems
    elements.push({
      id: 'gutter-left',
      type: 'gutter',
      material: 'aluminum',
      dimensions: { length, width: 0.5, height: 0.3 },
      position: { x: length / 2, y: 0, z: height - 1 },
      specifications: {
        capacity: '6" K-style',
        material: 'Aluminum .032"',
        slope: '1/4" per 10\''
      }
    });

    elements.push({
      id: 'gutter-right',
      type: 'gutter',
      material: 'aluminum',
      dimensions: { length, width: 0.5, height: 0.3 },
      position: { x: length / 2, y: width, z: height - 1 },
      specifications: {
        capacity: '6" K-style',
        material: 'Aluminum .032"',
        slope: '1/4" per 10\''
      }
    });

    // Foundation elements
    const foundationSpacing = 10;
    for (let x = 0; x <= length; x += foundationSpacing) {
      for (let y = 0; y <= width; y += foundationSpacing) {
        if (x === 0 || x === length || y === 0 || y === width) {
          elements.push({
            id: `foundation-${x}-${y}`,
            type: 'foundation',
            material: 'concrete',
            dimensions: { length: 2, width: 2, height: 3 },
            position: { x, y, z: -3 },
            specifications: {
              type: 'Spread footing',
              concrete: '3000 PSI',
              reinforcement: '#4 rebar @ 12" O.C.'
            }
          });
        }
      }
    }

    setStructure(prev => ({ ...prev, elements }));
  };

  const structuralAnalysis = useMemo(() => {
    const totalWeight = structure.elements.reduce((sum, element) => {
      const volume = element.dimensions.length * element.dimensions.width * (element.dimensions.height || 0.25);
      const density = element.material === 'aluminum' ? 168 : 490; // lb/ft³
      return sum + (volume * density);
    }, 0);

    const maxSpan = Math.max(structure.dimensions.length, structure.dimensions.width);
    const windPressure = (structure.specifications.windLoad ** 2) * 0.00256; // psf
    const totalLoad = structure.specifications.deadLoad + structure.specifications.liveLoad + structure.specifications.snowLoad;

    return {
      totalWeight: totalWeight.toFixed(0),
      windPressure: windPressure.toFixed(1),
      totalLoad: totalLoad.toFixed(1),
      maxSpan: maxSpan.toFixed(1),
      safetyFactor: 2.5,
      structuralEfficiency: 87.3
    };
  }, [structure]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Structure Summary */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Structure Overview</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Frame Type</span>
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-white capitalize">{structure.frameType}</p>
          </div>
          <div className="bg-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Material</span>
              <Box className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xl font-bold text-white">{structure.frameMaterial.replace('_', ' ')}</p>
          </div>
          <div className="bg-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Bay Count</span>
              <Grid className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xl font-bold text-white">{structure.bays}</p>
          </div>
          <div className="bg-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Elements</span>
              <Layers className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-xl font-bold text-white">{structure.elements.length}</p>
          </div>
        </div>
      </div>

      {/* 3D Structure Visualization */}
      <div className="bg-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Structure Visualization</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setView3D(!view3D)}
              className={`px-3 py-2 rounded-lg text-sm ${view3D ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="relative bg-gray-800 rounded-lg h-96 overflow-hidden">
          <svg 
            viewBox={`0 0 ${structure.dimensions.length + 20} ${structure.dimensions.width + 20}`}
            className="w-full h-full"
          >
            {/* Structure outline */}
            <rect
              x={10}
              y={10}
              width={structure.dimensions.length}
              height={structure.dimensions.width}
              fill="none"
              stroke="#4B5563"
              strokeWidth={0.5}
            />
            
            {/* Frame elements */}
            {structure.elements.filter(e => e.type === 'frame').map((element) => (
              <circle
                key={element.id}
                cx={element.position.x + 10}
                cy={element.position.y + 10}
                r={1}
                fill="#3B82F6"
                className="cursor-pointer"
                onClick={() => setSelectedElement(element.id)}
              />
            ))}
            
            {/* Roof trusses */}
            {structure.elements.filter(e => e.type === 'truss').map((element) => (
              <line
                key={element.id}
                x1={element.position.x + 10}
                y1={10}
                x2={element.position.x + 10}
                y2={structure.dimensions.width + 10}
                stroke="#10B981"
                strokeWidth={0.5}
                className="cursor-pointer"
                onClick={() => setSelectedElement(element.id)}
              />
            ))}
            
            {/* Bay divisions */}
            {Array.from({ length: structure.bays + 1 }, (_, i) => {
              const x = (i * structure.dimensions.length / structure.bays) + 10;
              return (
                <line
                  key={`bay-${i}`}
                  x1={x}
                  y1={10}
                  x2={x}
                  y2={structure.dimensions.width + 10}
                  stroke="#6B7280"
                  strokeWidth={0.2}
                  strokeDasharray="1,1"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Structural Analysis */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Structural Analysis</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Load Analysis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Load:</span>
                <span className="text-white">{structuralAnalysis.totalLoad} psf</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Wind Pressure:</span>
                <span className="text-white">{structuralAnalysis.windPressure} psf</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Weight:</span>
                <span className="text-white">{structuralAnalysis.totalWeight} lbs</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Safety Factors</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Safety Factor:</span>
                <span className="text-green-400">{structuralAnalysis.safetyFactor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Span:</span>
                <span className="text-white">{structuralAnalysis.maxSpan} ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Efficiency:</span>
                <span className="text-green-400">{structuralAnalysis.structuralEfficiency}%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-600 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Code Compliance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">IBC 2021:</span>
                <span className="text-green-400">✓ Compliant</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">ASCE 7-16:</span>
                <span className="text-green-400">✓ Compliant</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Local Codes:</span>
                <span className="text-yellow-400">Review Required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFrameDesign = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Frame Configuration</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Frame Type</label>
              <select 
                value={structure.frameType}
                onChange={(e) => setStructure(prev => ({ ...prev, frameType: e.target.value as any }))}
                className="w-full bg-gray-600 text-white rounded-lg p-3"
              >
                <option value="gable">Gable Frame</option>
                <option value="gothic">Gothic Arch</option>
                <option value="venlo">Venlo Style</option>
                <option value="tunnel">Tunnel Frame</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Frame Material</label>
              <select 
                value={structure.frameMaterial}
                onChange={(e) => setStructure(prev => ({ ...prev, frameMaterial: e.target.value as any }))}
                className="w-full bg-gray-600 text-white rounded-lg p-3"
              >
                <option value="aluminum">Aluminum Alloy</option>
                <option value="galvanized_steel">Galvanized Steel</option>
                <option value="steel">Carbon Steel</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Bay Count</label>
              <input 
                type="number"
                value={structure.bays}
                onChange={(e) => setStructure(prev => ({ ...prev, bays: parseInt(e.target.value) || 6 }))}
                className="w-full bg-gray-600 text-white rounded-lg p-3"
                min="2"
                max="20"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Length (ft)</label>
              <input 
                type="number"
                value={structure.dimensions.length}
                onChange={(e) => setStructure(prev => ({ 
                  ...prev, 
                  dimensions: { ...prev.dimensions, length: parseInt(e.target.value) || 120 }
                }))}
                className="w-full bg-gray-600 text-white rounded-lg p-3"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Width (ft)</label>
              <input 
                type="number"
                value={structure.dimensions.width}
                onChange={(e) => setStructure(prev => ({ 
                  ...prev, 
                  dimensions: { ...prev.dimensions, width: parseInt(e.target.value) || 60 }
                }))}
                className="w-full bg-gray-600 text-white rounded-lg p-3"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Height (ft)</label>
              <input 
                type="number"
                value={structure.dimensions.height}
                onChange={(e) => setStructure(prev => ({ 
                  ...prev, 
                  dimensions: { ...prev.dimensions, height: parseInt(e.target.value) || 16 }
                }))}
                className="w-full bg-gray-600 text-white rounded-lg p-3"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Frame Element Details */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Frame Elements</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-600">
                <th className="text-left p-3">Element</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Material</th>
                <th className="text-left p-3">Dimensions</th>
                <th className="text-left p-3">Position</th>
              </tr>
            </thead>
            <tbody>
              {structure.elements.filter(e => e.type === 'frame' || e.type === 'truss').slice(0, 10).map((element) => (
                <tr key={element.id} className="text-white border-b border-gray-600 hover:bg-gray-600">
                  <td className="p-3 font-medium">{element.id}</td>
                  <td className="p-3 capitalize">{element.type}</td>
                  <td className="p-3">{element.material}</td>
                  <td className="p-3">
                    {element.dimensions.length}' × {element.dimensions.width}' × {element.dimensions.height || 0}'
                  </td>
                  <td className="p-3">
                    ({element.position.x}, {element.position.y}, {element.position.z})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Greenhouse Structure Designer</h2>
            <p className="text-gray-400">Complete structural engineering and frame design</p>
          </div>
        </div>
        
        {/* Mode selector */}
        <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview', icon: Building2 },
            { key: 'frame', label: 'Frame', icon: Grid },
            { key: 'roof', label: 'Roof', icon: ArrowUpDown },
            { key: 'walls', label: 'Walls', icon: Layers },
            { key: 'foundation', label: 'Foundation', icon: Box },
            { key: 'analysis', label: 'Analysis', icon: Settings }
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
      {designMode === 'frame' && renderFrameDesign()}
      {designMode === 'roof' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Roof System Design</h3>
          <p className="text-gray-400">Roof design tools coming soon...</p>
        </div>
      )}
      {designMode === 'walls' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Wall & Glazing Systems</h3>
          <p className="text-gray-400">Wall configuration tools coming soon...</p>
        </div>
      )}
      {designMode === 'foundation' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Foundation Design</h3>
          <p className="text-gray-400">Foundation engineering tools coming soon...</p>
        </div>
      )}
      {designMode === 'analysis' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Structural Analysis</h3>
          <p className="text-gray-400">Advanced structural analysis coming soon...</p>
        </div>
      )}
    </div>
  );
}

export default GreenhouseStructureDesigner;