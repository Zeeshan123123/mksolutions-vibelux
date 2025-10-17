'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Grid3X3,
  Plus,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Move,
  Square,
  Circle,
  Pentagon,
  Lightbulb,
  Map,
  Layers,
  Settings,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Copy,
  Palette,
  MousePointer,
  Hand,
  Edit3,
  Check,
  X,
  Info,
  AlertCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface Fixture {
  id: string;
  name: string;
  x: number; // percentage
  y: number; // percentage
  rotation: number;
  model: {
    brand: string;
    model: string;
    wattage: number;
    ppf: number;
    width: number; // meters
    height: number; // meters
  };
  zoneId?: string;
  enabled: boolean;
  hlpDeviceId?: string;
  status: 'online' | 'offline' | 'error';
}

interface Zone {
  id: string;
  name: string;
  color: string;
  points: { x: number; y: number }[]; // Polygon points as percentages
  type: 'rectangle' | 'polygon' | 'circle';
  fixtures: string[]; // fixture IDs
  isLocked: boolean;
  visible: boolean;
  settings: {
    maxFixtures?: number;
    minSpacing?: number; // meters
    allowOverlap: boolean;
    autoAlign: boolean;
  };
}

interface LayoutSettings {
  facilityWidth: number; // meters
  facilityHeight: number; // meters
  gridSize: number; // meters
  snapToGrid: boolean;
  showMeasurements: boolean;
  showFixtureLabels: boolean;
  showZoneLabels: boolean;
  backgroundImage?: string;
  scale: number; // pixels per meter
}

const MOCK_FIXTURES: Fixture[] = [
  {
    id: 'f1',
    name: 'LED Panel 1',
    x: 25,
    y: 30,
    rotation: 0,
    model: { brand: 'VibeLux', model: 'Pro-400', wattage: 400, ppf: 1000, width: 1.2, height: 0.6 },
    zoneId: 'zone-1',
    enabled: true,
    hlpDeviceId: 'hlp-001',
    status: 'online'
  },
  {
    id: 'f2',
    name: 'LED Panel 2',
    x: 45,
    y: 30,
    rotation: 0,
    model: { brand: 'VibeLux', model: 'Pro-400', wattage: 400, ppf: 1000, width: 1.2, height: 0.6 },
    zoneId: 'zone-1',
    enabled: true,
    hlpDeviceId: 'hlp-002',
    status: 'online'
  },
  {
    id: 'f3',
    name: 'LED Strip 1',
    x: 75,
    y: 60,
    rotation: 90,
    model: { brand: 'VibeLux', model: 'Strip-200', wattage: 200, ppf: 500, width: 2.0, height: 0.1 },
    zoneId: 'zone-2',
    enabled: true,
    hlpDeviceId: 'hlp-003',
    status: 'online'
  }
];

const MOCK_ZONES: Zone[] = [
  {
    id: 'zone-1',
    name: 'Vegetative Growth',
    color: '#10b981',
    points: [{ x: 10, y: 10 }, { x: 60, y: 10 }, { x: 60, y: 50 }, { x: 10, y: 50 }],
    type: 'rectangle',
    fixtures: ['f1', 'f2'],
    isLocked: false,
    visible: true,
    settings: { maxFixtures: 8, minSpacing: 1.5, allowOverlap: false, autoAlign: true }
  },
  {
    id: 'zone-2',
    name: 'Flowering Room',
    color: '#8b5cf6',
    points: [{ x: 65, y: 40 }, { x: 90, y: 40 }, { x: 90, y: 80 }, { x: 65, y: 80 }],
    type: 'rectangle',
    fixtures: ['f3'],
    isLocked: false,
    visible: true,
    settings: { maxFixtures: 12, minSpacing: 1.0, allowOverlap: false, autoAlign: true }
  }
];

export function AdvancedFixtureLayoutDesigner() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>(MOCK_FIXTURES);
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [selectedTool, setSelectedTool] = useState<'select' | 'move' | 'zone' | 'fixture'>('select');
  const [selectedFixtures, setSelectedFixtures] = useState<string[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    facilityWidth: 20,
    facilityHeight: 15,
    gridSize: 1,
    snapToGrid: true,
    showMeasurements: true,
    showFixtureLabels: true,
    showZoneLabels: true,
    scale: 50
  });
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [newZonePoints, setNewZonePoints] = useState<{ x: number; y: number }[]>([]);
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);

  // Convert screen coordinates to layout percentages
  const screenToLayout = (screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const relativeX = (screenX - rect.left - panOffset.x) / zoom;
    const relativeY = (screenY - rect.top - panOffset.y) / zoom;
    
    return {
      x: (relativeX / rect.width) * 100,
      y: (relativeY / rect.height) * 100
    };
  };

  // Snap to grid if enabled
  const snapToGrid = (x: number, y: number) => {
    if (!layoutSettings.snapToGrid) return { x, y };
    
    const gridSizePercent = (layoutSettings.gridSize / layoutSettings.facilityWidth) * 100;
    return {
      x: Math.round(x / gridSizePercent) * gridSizePercent,
      y: Math.round(y / gridSizePercent) * gridSizePercent
    };
  };

  // Handle fixture drag
  const handleFixtureDrag = (fixtureId: string, newX: number, newY: number) => {
    const snapped = snapToGrid(newX, newY);
    
    setFixtures(prev => prev.map(f => 
      f.id === fixtureId ? { ...f, x: snapped.x, y: snapped.y } : f
    ));

    // Auto-assign to zone if fixture is moved into one
    if (layoutSettings.snapToGrid) {
      const zone = zones.find(z => isPointInZone(snapped, z));
      if (zone && zone.id !== fixtures.find(f => f.id === fixtureId)?.zoneId) {
        assignFixtureToZone(fixtureId, zone.id);
      }
    }
  };

  // Check if point is inside zone
  const isPointInZone = (point: { x: number; y: number }, zone: Zone): boolean => {
    if (zone.type === 'rectangle' && zone.points.length >= 2) {
      const [topLeft, bottomRight] = zone.points;
      return point.x >= topLeft.x && point.x <= bottomRight.x &&
             point.y >= topLeft.y && point.y <= bottomRight.y;
    }
    
    // For polygons, use ray casting algorithm
    if (zone.type === 'polygon') {
      let inside = false;
      const points = zone.points;
      
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        if (((points[i].y > point.y) !== (points[j].y > point.y)) &&
            (point.x < (points[j].x - points[i].x) * (point.y - points[i].y) / (points[j].y - points[i].y) + points[i].x)) {
          inside = !inside;
        }
      }
      return inside;
    }
    
    return false;
  };

  // Assign fixture to zone
  const assignFixtureToZone = (fixtureId: string, zoneId: string) => {
    setFixtures(prev => prev.map(f => 
      f.id === fixtureId ? { ...f, zoneId } : f
    ));
    
    setZones(prev => prev.map(z => ({
      ...z,
      fixtures: z.id === zoneId 
        ? [...z.fixtures.filter(id => id !== fixtureId), fixtureId]
        : z.fixtures.filter(id => id !== fixtureId)
    })));
  };

  // Create new zone
  const createZone = (points: { x: number; y: number }[]) => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: `Zone ${zones.length + 1}`,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      points,
      type: points.length === 2 ? 'rectangle' : 'polygon',
      fixtures: [],
      isLocked: false,
      visible: true,
      settings: { maxFixtures: 10, minSpacing: 1.0, allowOverlap: false, autoAlign: true }
    };
    
    setZones(prev => [...prev, newZone]);
    setIsCreatingZone(false);
    setNewZonePoints([]);
  };

  // Group selected fixtures into new zone
  const groupSelectedFixtures = () => {
    if (selectedFixtures.length === 0) return;
    
    const selectedFixtureObjects = fixtures.filter(f => selectedFixtures.includes(f.id));
    
    // Calculate bounding box
    const minX = Math.min(...selectedFixtureObjects.map(f => f.x)) - 5;
    const maxX = Math.max(...selectedFixtureObjects.map(f => f.x)) + 5;
    const minY = Math.min(...selectedFixtureObjects.map(f => f.y)) - 5;
    const maxY = Math.max(...selectedFixtureObjects.map(f => f.y)) + 5;
    
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: `Zone ${zones.length + 1}`,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      points: [
        { x: minX, y: minY },
        { x: maxX, y: maxY }
      ],
      type: 'rectangle',
      fixtures: selectedFixtures,
      isLocked: false,
      visible: true,
      settings: { maxFixtures: 20, minSpacing: 1.0, allowOverlap: false, autoAlign: true }
    };
    
    // Update fixtures with new zone assignment
    setFixtures(prev => prev.map(f => 
      selectedFixtures.includes(f.id) ? { ...f, zoneId: newZone.id } : f
    ));
    
    setZones(prev => [...prev, newZone]);
    setSelectedFixtures([]);
  };

  // Auto-arrange fixtures in zone
  const autoArrangeZone = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone || zone.fixtures.length === 0) return;

    const zoneFixtures = fixtures.filter(f => zone.fixtures.includes(f.id));
    const [topLeft, bottomRight] = zone.points;
    
    const rows = Math.ceil(Math.sqrt(zoneFixtures.length));
    const cols = Math.ceil(zoneFixtures.length / rows);
    
    const width = bottomRight.x - topLeft.x;
    const height = bottomRight.y - topLeft.y;
    
    const spacingX = width / (cols + 1);
    const spacingY = height / (rows + 1);
    
    const updatedFixtures = zoneFixtures.map((fixture, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      return {
        ...fixture,
        x: topLeft.x + spacingX * (col + 1),
        y: topLeft.y + spacingY * (row + 1)
      };
    });
    
    setFixtures(prev => prev.map(f => {
      const updated = updatedFixtures.find(uf => uf.id === f.id);
      return updated || f;
    }));
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent) => {
    const point = screenToLayout(e.clientX, e.clientY);
    
    if (isCreatingZone) {
      setNewZonePoints(prev => [...prev, point]);
      
      // Complete rectangle zone with 2 points
      if (newZonePoints.length === 1) {
        createZone([newZonePoints[0], point]);
      }
    } else {
      // Deselect all if clicking empty space
      if (selectedTool === 'select') {
        setSelectedFixtures([]);
        setSelectedZone(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Advanced Fixture Layout Designer</h1>
            <p className="text-sm text-gray-400 mt-1">
              Visual fixture positioning and zone management with drag-and-drop grouping
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Layout
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Tool Selection */}
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              {[
                { id: 'select', icon: MousePointer, label: 'Select' },
                { id: 'move', icon: Hand, label: 'Pan' },
                { id: 'zone', icon: Square, label: 'Create Zone' },
                { id: 'fixture', icon: Lightbulb, label: 'Add Fixture' }
              ].map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id as any)}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
                    selectedTool === tool.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title={tool.label}
                >
                  <tool.icon className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">{tool.label}</span>
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-gray-700" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={groupSelectedFixtures}
                disabled={selectedFixtures.length === 0}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Layers className="w-4 h-4" />
                Group Zone
              </button>
              
              <button
                onClick={() => setIsCreatingZone(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Zone
              </button>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-400 min-w-[4rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.3))}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-700" />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg transition-colors ${
                  showGrid ? 'text-purple-400 bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowLayersPanel(!showLayersPanel)}
                className={`p-2 rounded-lg transition-colors ${
                  showLayersPanel ? 'text-purple-400 bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Layers Panel */}
        {showLayersPanel && (
          <div className="w-80 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Zones Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Map className="w-5 h-5 text-purple-400" />
                  Zones ({zones.length})
                </h3>
                <div className="space-y-2">
                  {zones.map(zone => (
                    <div
                      key={zone.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedZone === zone.id
                          ? 'border-purple-500 bg-purple-900/20'
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                      }`}
                      onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: zone.color }}
                          />
                          <span className="text-white font-medium">{zone.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              autoArrangeZone(zone.id);
                            }}
                            className="p-1 text-gray-400 hover:text-white rounded"
                            title="Auto-arrange fixtures"
                          >
                            <Grid3X3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setZones(prev => prev.map(z => 
                                z.id === zone.id ? { ...z, visible: !z.visible } : z
                              ));
                            }}
                            className={`p-1 rounded ${
                              zone.visible ? 'text-gray-400 hover:text-white' : 'text-red-400'
                            }`}
                            title={zone.visible ? 'Hide zone' : 'Show zone'}
                          >
                            {zone.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        {zone.fixtures.length} fixtures • {zone.type}
                      </div>
                      
                      {zone.settings.maxFixtures && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Capacity</span>
                            <span>{zone.fixtures.length}/{zone.settings.maxFixtures}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1">
                            <div 
                              className="bg-purple-500 h-1 rounded-full transition-all"
                              style={{ 
                                width: `${Math.min((zone.fixtures.length / zone.settings.maxFixtures) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fixtures Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Fixtures ({fixtures.length})
                </h3>
                <div className="space-y-2">
                  {fixtures.map(fixture => (
                    <div
                      key={fixture.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedFixtures.includes(fixture.id)
                          ? 'border-yellow-500 bg-yellow-900/20'
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                      }`}
                      onClick={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                          setSelectedFixtures(prev => 
                            prev.includes(fixture.id)
                              ? prev.filter(id => id !== fixture.id)
                              : [...prev, fixture.id]
                          );
                        } else {
                          setSelectedFixtures([fixture.id]);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            fixture.status === 'online' ? 'bg-green-400' :
                            fixture.status === 'offline' ? 'bg-gray-400' : 'bg-red-400'
                          }`} />
                          <span className="text-white font-medium">{fixture.name}</span>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          fixture.enabled ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'
                        }`}>
                          {fixture.enabled ? 'ON' : 'OFF'}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        {fixture.model.brand} {fixture.model.model}
                      </div>
                      <div className="text-xs text-gray-500">
                        {fixture.model.wattage}W • {fixture.model.ppf} PPF
                      </div>
                      
                      {fixture.zoneId && (
                        <div className="mt-2 flex items-center gap-1">
                          <div 
                            className="w-2 h-2 rounded"
                            style={{ 
                              backgroundColor: zones.find(z => z.id === fixture.zoneId)?.color || '#gray' 
                            }}
                          />
                          <span className="text-xs text-gray-500">
                            {zones.find(z => z.id === fixture.zoneId)?.name || 'Unknown Zone'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full bg-gray-950 relative cursor-crosshair"
            onClick={handleCanvasClick}
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: 'top left'
            }}
          >
            {/* Grid */}
            {showGrid && (
              <div className="absolute inset-0">
                <svg width="100%" height="100%" className="text-gray-800">
                  <defs>
                    <pattern
                      id="grid"
                      width={layoutSettings.scale}
                      height={layoutSettings.scale}
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d={`M ${layoutSettings.scale} 0 L 0 0 0 ${layoutSettings.scale}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        opacity="0.3"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            )}

            {/* Zones */}
            {zones.filter(z => z.visible).map(zone => (
              <div key={zone.id} className="absolute inset-0">
                {zone.type === 'rectangle' && zone.points.length >= 2 && (
                  <div
                    className={`absolute border-2 border-dashed transition-all ${
                      selectedZone === zone.id ? 'border-white' : 'border-current'
                    }`}
                    style={{
                      left: `${zone.points[0].x}%`,
                      top: `${zone.points[0].y}%`,
                      width: `${zone.points[1].x - zone.points[0].x}%`,
                      height: `${zone.points[1].y - zone.points[0].y}%`,
                      backgroundColor: `${zone.color}20`,
                      borderColor: zone.color
                    }}
                  >
                    {layoutSettings.showZoneLabels && (
                      <div
                        className="absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: zone.color }}
                      >
                        {zone.name}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Fixtures */}
            {fixtures.map(fixture => (
              <div
                key={fixture.id}
                className={`absolute transition-all duration-200 ${
                  selectedFixtures.includes(fixture.id) ? 'z-50' : 'z-10'
                }`}
                style={{
                  left: `${fixture.x}%`,
                  top: `${fixture.y}%`,
                  transform: `translate(-50%, -50%) rotate(${fixture.rotation}deg)`,
                  cursor: selectedTool === 'select' ? 'grab' : 'default'
                }}
                onMouseDown={(e) => {
                  if (selectedTool === 'select') {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (!selectedFixtures.includes(fixture.id)) {
                      setSelectedFixtures([fixture.id]);
                    }
                    
                    setIsDragging(true);
                    const point = screenToLayout(e.clientX, e.clientY);
                    setDragStart(point);
                  }
                }}
              >
                {/* Fixture Body */}
                <div
                  className={`relative rounded-lg transition-all duration-200 ${
                    fixture.enabled 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg shadow-yellow-500/50' 
                      : 'bg-gray-600'
                  } ${
                    selectedFixtures.includes(fixture.id) 
                      ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-950' 
                      : ''
                  }`}
                  style={{
                    width: `${fixture.model.width * layoutSettings.scale / zoom}px`,
                    height: `${fixture.model.height * layoutSettings.scale / zoom}px`,
                    minWidth: '16px',
                    minHeight: '16px'
                  }}
                >
                  <Lightbulb className={`absolute inset-0 m-auto w-4 h-4 ${
                    fixture.enabled ? 'text-white' : 'text-gray-400'
                  }`} />
                  
                  {/* Status indicator */}
                  <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                    fixture.status === 'online' ? 'bg-green-400' :
                    fixture.status === 'offline' ? 'bg-gray-400' : 'bg-red-400'
                  }`} />
                </div>

                {/* Label */}
                {layoutSettings.showFixtureLabels && (
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {fixture.name}
                  </div>
                )}
              </div>
            ))}

            {/* New zone preview */}
            {isCreatingZone && newZonePoints.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {newZonePoints.map((point, index) => (
                  <div
                    key={index}
                    className="absolute w-2 h-2 bg-purple-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">Layout Info</span>
              </div>
              <div className="text-gray-400 space-y-1">
                <div>Dimensions: {layoutSettings.facilityWidth}m × {layoutSettings.facilityHeight}m</div>
                <div>Fixtures: {fixtures.length} total</div>
                <div>Zones: {zones.length} defined</div>
                <div>Selected: {selectedFixtures.length} fixtures</div>
              </div>
              
              {selectedFixtures.length > 0 && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="text-white font-medium mb-1">Selection Actions</div>
                  <div className="flex gap-2">
                    <button
                      onClick={groupSelectedFixtures}
                      className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                    >
                      Group Zone
                    </button>
                    <button
                      onClick={() => setSelectedFixtures([])}
                      className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
              
              {isCreatingZone && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="text-yellow-400 font-medium mb-1">Creating Zone</div>
                  <div className="text-gray-400 text-xs">
                    Click to set {newZonePoints.length === 0 ? 'first' : 'second'} corner
                  </div>
                  <button
                    onClick={() => {
                      setIsCreatingZone(false);
                      setNewZonePoints([]);
                    }}
                    className="mt-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}