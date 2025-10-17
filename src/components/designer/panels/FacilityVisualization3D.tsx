'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { 
  X, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Eye, 
  EyeOff,
  Layers,
  Grid3x3,
  Sun,
  Wind,
  Droplets,
  Building,
  Lightbulb,
  Settings,
  Camera,
  Download,
  Play,
  Pause,
  SkipForward
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';

// Lazy load React Three Fiber components
const Canvas = React.lazy(() => import('@react-three/fiber').then(module => ({ default: module.Canvas })));
const OrbitControls = React.lazy(() => import('@react-three/drei').then(module => ({ default: module.OrbitControls })));
const Grid = React.lazy(() => import('@react-three/drei').then(module => ({ default: module.Grid })));
const Environment = React.lazy(() => import('@react-three/drei').then(module => ({ default: module.Environment })));

interface FacilityVisualization3DProps {
  onClose: () => void;
}

interface VisualizationSettings {
  showStructural: boolean;
  showHVAC: boolean;
  showElectrical: boolean;
  showIrrigation: boolean;
  showLighting: boolean;
  showPlants: boolean;
  showEnvironmental: boolean;
  wireframe: boolean;
  transparency: number;
  viewMode: 'realistic' | 'schematic' | 'analysis';
  animation: boolean;
}

interface Component3D {
  id: string;
  type: 'rack' | 'gutter' | 'hvac' | 'fixture' | 'pipe' | 'sensor' | 'plant';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  visible: boolean;
  system: 'structural' | 'hvac' | 'electrical' | 'irrigation' | 'environmental';
  metadata: any;
}

// Basic 3D components
function Room3D({ room }: { room: any }) {
  const width = room.width || 20;
  const height = room.height || 15;
  const ceilingHeight = room.ceilingHeight || 10;

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#444444" transparent opacity={0.8} />
      </mesh>
      
      {/* Walls */}
      <mesh position={[-width/2, ceilingHeight/2, 0]}>
        <boxGeometry args={[0.2, ceilingHeight, height]} />
        <meshStandardMaterial color="#666666" transparent opacity={0.6} />
      </mesh>
      <mesh position={[width/2, ceilingHeight/2, 0]}>
        <boxGeometry args={[0.2, ceilingHeight, height]} />
        <meshStandardMaterial color="#666666" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, ceilingHeight/2, -height/2]}>
        <boxGeometry args={[width, ceilingHeight, 0.2]} />
        <meshStandardMaterial color="#666666" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, ceilingHeight/2, height/2]}>
        <boxGeometry args={[width, ceilingHeight, 0.2]} />
        <meshStandardMaterial color="#666666" transparent opacity={0.6} />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, ceilingHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#777777" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function Rack3D({ position, scale, color, visible }: { position: [number, number, number], scale: [number, number, number], color: string, visible: boolean }) {
  if (!visible) return null;
  
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry args={[1, 2, 0.5]} />
      <meshStandardMaterial color={color} />
      {/* Shelves */}
      {[0.4, 0.8, 1.2, 1.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[0.9, 0.05, 0.4]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      ))}
    </mesh>
  );
}

function Gutter3D({ position, scale, color, visible }: { position: [number, number, number], scale: [number, number, number], color: string, visible: boolean }) {
  if (!visible) return null;
  
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry args={[8, 0.2, 0.3]} />
      <meshStandardMaterial color={color} />
      {/* Support posts */}
      <mesh position={[-3, -0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1]} />
        <meshStandardMaterial color="#999999" />
      </mesh>
      <mesh position={[3, -0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1]} />
        <meshStandardMaterial color="#999999" />
      </mesh>
    </mesh>
  );
}

function HVACUnit3D({ position, scale, color, visible }: { position: [number, number, number], scale: [number, number, number], color: string, visible: boolean }) {
  if (!visible) return null;
  
  return (
    <group position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[1.5, 1, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Fan representation */}
      <mesh position={[0, 0.5, 0.45]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
}

function LightFixture3D({ position, scale, color, visible }: { position: [number, number, number], scale: [number, number, number], color: string, visible: boolean }) {
  if (!visible) return null;
  
  return (
    <group position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[2, 0.2, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {/* Light beam representation */}
      <mesh position={[0, -1, 0]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#ffff88" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function Plant3D({ position, scale, visible }: { position: [number, number, number], scale: [number, number, number], visible: boolean }) {
  if (!visible) return null;
  
  return (
    <group position={position} scale={scale}>
      {/* Simple plant representation */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color="#22aa22" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

function Pipe3D({ start, end, color, visible }: { start: [number, number, number], end: [number, number, number], color: string, visible: boolean }) {
  if (!visible) return null;
  
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + 
    Math.pow(end[1] - start[1], 2) + 
    Math.pow(end[2] - start[2], 2)
  );
  
  const midpoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2
  ];
  
  return (
    <mesh position={midpoint}>
      <cylinderGeometry args={[0.05, 0.05, length]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Scene3D({ components, settings, room }: { components: Component3D[], settings: VisualizationSettings, room: any }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.4} />
      
      <Room3D room={room} />
      
      {components.map((component) => {
        const visible = settings[`show${component.system.charAt(0).toUpperCase() + component.system.slice(1)}` as keyof VisualizationSettings] as boolean;
        
        switch (component.type) {
          case 'rack':
            return (
              <Rack3D
                key={component.id}
                position={component.position}
                scale={component.scale}
                color={component.color}
                visible={visible && component.visible}
              />
            );
          case 'gutter':
            return (
              <Gutter3D
                key={component.id}
                position={component.position}
                scale={component.scale}
                color={component.color}
                visible={visible && component.visible}
              />
            );
          case 'hvac':
            return (
              <HVACUnit3D
                key={component.id}
                position={component.position}
                scale={component.scale}
                color={component.color}
                visible={visible && component.visible}
              />
            );
          case 'fixture':
            return (
              <LightFixture3D
                key={component.id}
                position={component.position}
                scale={component.scale}
                color={component.color}
                visible={visible && component.visible}
              />
            );
          case 'plant':
            return (
              <Plant3D
                key={component.id}
                position={component.position}
                scale={component.scale}
                visible={visible && component.visible}
              />
            );
          default:
            return null;
        }
      })}
      
      <Suspense fallback={null}>
        <Grid infiniteGrid fadeDistance={50} fadeStrength={5} />
        <Environment preset="warehouse" />
      </Suspense>
    </>
  );
}

export function FacilityVisualization3D({ onClose }: FacilityVisualization3DProps) {
  const { state } = useDesigner();
  const { objects, room } = state;
  
  const [settings, setSettings] = useState<VisualizationSettings>({
    showStructural: true,
    showHVAC: true,
    showElectrical: true,
    showIrrigation: true,
    showLighting: true,
    showPlants: true,
    showEnvironmental: true,
    wireframe: false,
    transparency: 0.8,
    viewMode: 'realistic',
    animation: false
  });
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([15, 15, 15]);
  const [components3D, setComponents3D] = useState<Component3D[]>([]);
  
  // Convert 2D objects to 3D components
  useEffect(() => {
    const components: Component3D[] = [];
    
    objects.forEach((obj, index) => {
      const baseHeight = obj.type === 'fixture' ? (room.ceilingHeight || 10) - 2 : 1;
      
      switch (obj.type) {
        case 'fixture':
          components.push({
            id: obj.id,
            type: 'fixture',
            position: [obj.x - (room.width || 20)/2, baseHeight, obj.y - (room.height || 15)/2],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            color: '#ffaa00',
            visible: true,
            system: 'electrical',
            metadata: obj
          });
          break;
        case 'plant':
        case 'crop':
          components.push({
            id: obj.id,
            type: 'plant',
            position: [obj.x - (room.width || 20)/2, 0.2, obj.y - (room.height || 15)/2],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            color: '#22aa22',
            visible: true,
            system: 'environmental',
            metadata: obj
          });
          break;
        default:
          break;
      }
    });
    
    // Add synthetic structural components for greenhouse
    if (room.roomType === 'greenhouse') {
      // Add gutters
      const gutterCount = Math.ceil((room.width || 20) / 6);
      for (let i = 0; i < gutterCount; i++) {
        const x = (-((room.width || 20) / 2) + (i + 1) * 6) - (room.width || 20)/2;
        components.push({
          id: `gutter-${i}`,
          type: 'gutter',
          position: [x, 3, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          color: '#cccccc',
          visible: true,
          system: 'structural',
          metadata: { type: 'gutter', index: i }
        });
      }
      
      // Add HVAC units
      components.push({
        id: 'hvac-main',
        type: 'hvac',
        position: [-(room.width || 20)/4, 1, -(room.height || 15)/4],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        color: '#4444aa',
        visible: true,
        system: 'hvac',
        metadata: { type: 'hvac-unit' }
      });
    } else {
      // Add racks for indoor facility
      const rackCount = Math.ceil(((room.width || 20) * (room.height || 15)) / 32);
      for (let i = 0; i < rackCount; i++) {
        const x = (-((room.width || 20) / 2) + (i % 4) * 4) + 2;
        const z = (-((room.height || 15) / 2) + Math.floor(i / 4) * 4) + 2;
        components.push({
          id: `rack-${i}`,
          type: 'rack',
          position: [x, 1, z],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          color: '#666666',
          visible: true,
          system: 'structural',
          metadata: { type: 'rack', index: i }
        });
      }
    }
    
    setComponents3D(components);
  }, [objects, room]);
  
  const toggleSetting = (key: keyof VisualizationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const resetView = () => {
    setCameraPosition([15, 15, 15]);
  };
  
  const exportView = () => {
    // Implementation for exporting 3D view as image
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `facility-3d-view-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };
  
  const systemColors = {
    structural: '#888888',
    hvac: '#4444aa',
    electrical: '#ffaa00',
    irrigation: '#0088cc',
    environmental: '#22aa22'
  };

  return (
    <div className={`fixed bg-gray-900 border border-gray-700 shadow-2xl z-50 flex flex-col ${
      isFullscreen ? 'inset-0' : 'inset-4'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">3D Facility Visualization</h2>
            <p className="text-gray-400">Interactive 3D view of facility design</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <Maximize className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={exportView}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Export View"
          >
            <Download className="w-4 h-4" />
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
      <div className="flex-1 flex overflow-hidden">
        {/* Controls Panel */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* System Visibility */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">System Visibility</h3>
              <div className="space-y-2">
                {Object.entries(systemColors).map(([system, color]) => (
                  <label key={system} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[`show${system.charAt(0).toUpperCase() + system.slice(1)}` as keyof VisualizationSettings] as boolean}
                      onChange={() => toggleSetting(`show${system.charAt(0).toUpperCase() + system.slice(1)}` as keyof VisualizationSettings)}
                      className="w-4 h-4"
                    />
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm text-gray-300 capitalize">{system}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* View Mode */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">View Mode</h3>
              <div className="space-y-1">
                {['realistic', 'schematic', 'analysis'].map((mode) => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="viewMode"
                      checked={settings.viewMode === mode}
                      onChange={() => setSettings(prev => ({ ...prev, viewMode: mode as any }))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-300 capitalize">{mode}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => toggleSetting('wireframe')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    settings.wireframe 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  Wireframe
                </button>
                <button
                  onClick={() => toggleSetting('animation')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    settings.animation 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {settings.animation ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  Animation
                </button>
              </div>
            </div>
            
            {/* Camera Presets */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Camera Views</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setCameraPosition([15, 15, 15])}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Isometric
                </button>
                <button
                  onClick={() => setCameraPosition([0, 20, 0])}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Top View
                </button>
                <button
                  onClick={() => setCameraPosition([25, 5, 0])}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Side View
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 3D Viewport */}
        <div className="flex-1 relative">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="text-white">Loading 3D visualization...</div>
            </div>
          }>
            <Canvas
              camera={{ position: cameraPosition, fov: 50 }}
              shadows
              className="w-full h-full"
            >
              <Scene3D 
                components={components3D}
                settings={settings}
                room={room}
              />
              <Suspense fallback={null}>
                <OrbitControls enablePan enableZoom enableRotate />
              </Suspense>
            </Canvas>
          </Suspense>
          
          {/* Overlay Info */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-3 text-white">
            <div className="text-sm">
              <div>Room: {room.width || 20}' × {room.height || 15}' × {room.ceilingHeight || 10}'</div>
              <div>Components: {components3D.length}</div>
              <div>Systems: {Object.values(systemColors).length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}