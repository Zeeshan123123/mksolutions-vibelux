// Advanced panels with comprehensive 3D visualization
import React from 'react';
import { X } from 'lucide-react';
import { FacilityVisualization3D } from './FacilityVisualization3D';

interface PanelProps {
  onClose: () => void;
}

export const Advanced3DVisualizationPanel = ({ onClose }: PanelProps) => (
  <FacilityVisualization3D onClose={onClose} />
);

export const AdvancedPPFDMappingPanel = ({ onClose }: PanelProps) => {
  const [height, setHeight] = React.useState(3); // feet
  const [resolution, setResolution] = React.useState(2); // feet
  const [showValues, setShowValues] = React.useState(true);
  const [colorScale, setColorScale] = React.useState<'viridis' | 'heat' | 'cool'>('viridis');

  // Mock PPFD calculation - in real implementation, would use useDesigner context
  const generatePPFDGrid = () => {
    const grid = [];
    const roomWidth = 20;
    const roomLength = 30;
    
    for (let x = 0; x < roomWidth; x += resolution) {
      for (let y = 0; y < roomLength; y += resolution) {
        // Simulate PPFD values with some variation
        const centerX = roomWidth / 2;
        const centerY = roomLength / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const ppfd = Math.max(200, 800 - distance * 20 + Math.random() * 100);
        grid.push({ x, y, ppfd: Math.round(ppfd) });
      }
    }
    return grid;
  };

  const getPPFDColor = (ppfd: number) => {
    const normalized = Math.min(1, Math.max(0, (ppfd - 200) / 600));
    
    if (colorScale === 'viridis') {
      // Viridis color scale
      const r = Math.round(68 + normalized * (253 - 68));
      const g = Math.round(1 + normalized * (231 - 1));
      const b = Math.round(84 + normalized * (37 - 84));
      return `rgb(${r}, ${g}, ${b})`;
    } else if (colorScale === 'heat') {
      // Heat color scale
      if (normalized < 0.5) {
        const t = normalized * 2;
        return `rgb(${Math.round(255 * t)}, ${Math.round(255 * t)}, 0)`;
      } else {
        const t = (normalized - 0.5) * 2;
        return `rgb(255, ${Math.round(255 * (1 - t))}, 0)`;
      }
    } else {
      // Cool color scale
      const r = Math.round(normalized * 255);
      const g = Math.round((1 - normalized) * 255);
      const b = 255;
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const grid = generatePPFDGrid();
  const avgPPFD = Math.round(grid.reduce((sum, cell) => sum + cell.ppfd, 0) / grid.length);
  const minPPFD = Math.min(...grid.map(cell => cell.ppfd));
  const maxPPFD = Math.max(...grid.map(cell => cell.ppfd));
  const uniformity = (minPPFD / avgPPFD).toFixed(2);

  return (
    <div className="fixed inset-y-0 right-0 w-[800px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Advanced PPFD Mapping</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Controls */}
        <div className="p-4 border-b border-gray-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Height (feet)</label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-white">{height} ft</span>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Grid Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(parseFloat(e.target.value))}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg w-full"
              >
                <option value="1">1 ft</option>
                <option value="2">2 ft</option>
                <option value="3">3 ft</option>
                <option value="4">4 ft</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={showValues}
                onChange={(e) => setShowValues(e.target.checked)}
                className="rounded"
              />
              Show PPFD values
            </label>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Color scale:</span>
              <select
                value={colorScale}
                onChange={(e) => setColorScale(e.target.value as any)}
                className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
              >
                <option value="viridis">Viridis</option>
                <option value="heat">Heat</option>
                <option value="cool">Cool</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="p-4 border-b border-gray-700">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-2xl font-bold text-white">{avgPPFD}</div>
              <div className="text-xs text-gray-400">Avg PPFD</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-2xl font-bold text-white">{minPPFD}</div>
              <div className="text-xs text-gray-400">Min PPFD</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-2xl font-bold text-white">{maxPPFD}</div>
              <div className="text-xs text-gray-400">Max PPFD</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-2xl font-bold text-white">{uniformity}</div>
              <div className="text-xs text-gray-400">Uniformity</div>
            </div>
          </div>
        </div>

        {/* PPFD Grid Visualization */}
        <div className="p-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-10 gap-1">
              {grid.map((cell, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: getPPFDColor(cell.ppfd) }}
                >
                  {showValues && (
                    <span className={cell.ppfd > 500 ? 'text-black' : 'text-white'}>
                      {cell.ppfd}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Color Scale Legend */}
          <div className="mt-4 bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">PPFD Scale (μmol/m²/s)</div>
            <div className="flex items-center gap-2">
              <span className="text-white">200</span>
              <div className="flex-1 h-6 rounded" style={{
                background: `linear-gradient(to right, ${getPPFDColor(200)}, ${getPPFDColor(500)}, ${getPPFDColor(800)})`
              }}></div>
              <span className="text-white">800+</span>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Export as Image
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              Export as CSV
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              Add to Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LEDThermalManagementPanel = ({ onClose }: PanelProps) => (
  <div className="fixed inset-y-0 right-0 w-[800px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-white">LED Thermal Management</h2>
        <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">Q1 2025</span>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
        <X className="w-5 h-5 text-gray-400" />
      </button>
    </div>
    <div className="flex-1 p-6">
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔥</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Advanced Thermal Analysis</h3>
        <p className="text-gray-400 mb-4">
          Coming in Q1 2025: LED junction temperature monitoring, thermal load calculations, 
          and cooling system optimization for maximum fixture longevity.
        </p>
        <div className="text-sm text-gray-500">
          Features will include:
          • Junction temperature modeling
          • Heat distribution analysis  
          • Cooling capacity calculations
          • Fixture degradation predictions
        </div>
      </div>
    </div>
  </div>
);

export const PlantBiologyIntegrationPanel = ({ onClose }: PanelProps) => (
  <div className="fixed inset-y-0 right-0 w-[800px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-white">Plant Biology Integration</h2>
        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Q2 2025</span>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
        <X className="w-5 h-5 text-gray-400" />
      </button>
    </div>
    <div className="flex-1 p-6">
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🌱</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Plant-Specific Optimization</h3>
        <p className="text-gray-400 mb-4">
          Coming in Q2 2025: Integrate your crop selection with lighting design for 
          stage-specific PPFD targets and spectrum optimization.
        </p>
        <div className="text-sm text-gray-500">
          Features will include:
          • Growth stage light recipes
          • Crop-specific PPFD targets
          • Photoperiod automation
          • Spectrum tuning recommendations
        </div>
      </div>
    </div>
  </div>
);

export const MultiZoneControlSystemPanel = ({ onClose }: PanelProps) => {
  const [zones, setZones] = React.useState([
    { id: 1, name: 'Veg Zone', color: '#22c55e', ppfdTarget: 400, schedule: '18/6', intensity: 75 },
    { id: 2, name: 'Flower Zone A', color: '#3b82f6', ppfdTarget: 700, schedule: '12/12', intensity: 100 },
    { id: 3, name: 'Flower Zone B', color: '#8b5cf6', ppfdTarget: 650, schedule: '12/12', intensity: 90 },
    { id: 4, name: 'Mother Plants', color: '#f59e0b', ppfdTarget: 300, schedule: '16/8', intensity: 60 }
  ]);
  const [selectedZone, setSelectedZone] = React.useState(zones[0]);
  const [showGrid, setShowGrid] = React.useState(true);

  const updateZone = (id: number, updates: any) => {
    setZones(zones.map(z => z.id === id ? { ...z, ...updates } : z));
    if (selectedZone.id === id) {
      setSelectedZone({ ...selectedZone, ...updates });
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[800px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Multi-Zone Control System</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Zone Overview */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Zone Overview</h3>
            <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
              + Add Zone
            </button>
          </div>
          
          {/* Zone Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedZone.id === zone.id 
                    ? 'border-purple-500 bg-gray-800' 
                    : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: zone.color }}
                    ></div>
                    <h4 className="font-semibold text-white">{zone.name}</h4>
                  </div>
                  <span className="text-sm text-gray-400">{zone.schedule}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Target:</span>
                    <span className="text-white ml-1">{zone.ppfdTarget} μmol</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Power:</span>
                    <span className="text-white ml-1">{zone.intensity}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Visual Zone Map */}
          {showGrid && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-4 gap-2 aspect-[4/3]">
                {[...Array(12)].map((_, idx) => {
                  const zoneIndex = idx < 3 ? 0 : idx < 6 ? 1 : idx < 9 ? 2 : 3;
                  const zone = zones[zoneIndex];
                  return (
                    <div
                      key={idx}
                      className="rounded flex items-center justify-center text-xs font-medium"
                      style={{ 
                        backgroundColor: zone.color + '40',
                        borderColor: zone.color,
                        borderWidth: '2px',
                        borderStyle: 'solid'
                      }}
                    >
                      {zone.name.charAt(0)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Zone Controls */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Zone Settings: {selectedZone.name}
          </h3>
          
          <div className="space-y-4">
            {/* Zone Name */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">Zone Name</label>
              <input
                type="text"
                value={selectedZone.name}
                onChange={(e) => updateZone(selectedZone.id, { name: e.target.value })}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg"
              />
            </div>
            
            {/* PPFD Target */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">
                PPFD Target (μmol/m²/s): {selectedZone.ppfdTarget}
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={selectedZone.ppfdTarget}
                onChange={(e) => updateZone(selectedZone.id, { ppfdTarget: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            
            {/* Intensity */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">
                Light Intensity: {selectedZone.intensity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={selectedZone.intensity}
                onChange={(e) => updateZone(selectedZone.id, { intensity: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            
            {/* Schedule */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">Light Schedule</label>
              <select
                value={selectedZone.schedule}
                onChange={(e) => updateZone(selectedZone.id, { schedule: e.target.value })}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg"
              >
                <option value="24/0">24/0 - Always On</option>
                <option value="18/6">18/6 - Vegetative</option>
                <option value="16/8">16/8 - Mother Plants</option>
                <option value="12/12">12/12 - Flowering</option>
                <option value="10/14">10/14 - Late Flower</option>
              </select>
            </div>
            
            {/* Zone Color */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">Zone Color</label>
              <div className="flex gap-2">
                {['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateZone(selectedZone.id, { color })}
                    className={`w-8 h-8 rounded ${
                      selectedZone.color === color ? 'ring-2 ring-white' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Advanced Settings</h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-white">
              <input type="checkbox" className="rounded" defaultChecked />
              Enable sunrise/sunset ramping
            </label>
            <label className="flex items-center gap-2 text-white">
              <input type="checkbox" className="rounded" defaultChecked />
              Temperature-based dimming
            </label>
            <label className="flex items-center gap-2 text-white">
              <input type="checkbox" className="rounded" />
              CO₂-synchronized intensity
            </label>
            <label className="flex items-center gap-2 text-white">
              <input type="checkbox" className="rounded" defaultChecked />
              Emergency lighting mode
            </label>
          </div>
          
          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Apply to Fixtures
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              Export Schedule
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              Load Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResearchPropagationToolsPanel = ({ onClose }: PanelProps) => (
  <div className="fixed inset-y-0 right-0 w-[800px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-white">Research Propagation Tools</h2>
        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">Q4 2025</span>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
        <X className="w-5 h-5 text-gray-400" />
      </button>
    </div>
    <div className="flex-1 p-6">
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔬</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Research-Grade Tools</h3>
        <p className="text-gray-400 mb-4">
          Coming in Q4 2025: Specialized tools for research facilities including 
          experimental design layouts and statistical analysis integration.
        </p>
        <div className="text-sm text-gray-500">
          Features will include:
          • Randomized block designs
          • Replication pattern layouts
          • Statistical power analysis
          • Data export for R/Python
        </div>
      </div>
    </div>
  </div>
);

export const GPURayTracingPanel = ({ onClose }: PanelProps) => (
  <div className="fixed inset-y-0 right-0 w-[800px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-white">GPU Ray Tracing</h2>
        <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">Q3 2025</span>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
        <X className="w-5 h-5 text-gray-400" />
      </button>
    </div>
    <div className="flex-1 p-6">
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚡</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">High-Performance Ray Tracing</h3>
        <p className="text-gray-400 mb-4">
          Coming in Q3 2025: GPU-accelerated photon simulation for ultra-accurate 
          light distribution modeling and reflection analysis.
        </p>
        <div className="text-sm text-gray-500">
          Features will include:
          • WebGL compute shader acceleration
          • Advanced reflection modeling
          • Photorealistic rendering
          • Sub-second calculation times
        </div>
      </div>
    </div>
  </div>
);