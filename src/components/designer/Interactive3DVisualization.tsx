"use client";
import React, { useRef, useEffect, useState, useMemo, Suspense, useCallback } from 'react';
import { Canvas, useFrame, extend, ReactThreeFiber, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera,
  Environment,
  ContactShadows,
  Text,
  Html,
  Box,
  Plane,
  Sphere,
  useHelper,
  Grid,
  Sky,
  Lightformer,
  AccumulativeShadows,
  RandomizedLight,
  BakeShadows,
  SoftShadows,
  Stats,
  PerformanceMonitor
} from '@react-three/drei';
import { EffectComposer, Bloom, SSAO, DepthOfField, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { DirectionalLightHelper } from 'three';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Layers, 
  Sun, 
  Droplets, 
  Zap, 
  Thermometer,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move3D,
  Camera,
  Download,
  Share2
} from 'lucide-react';

// Extend THREE to include custom materials if needed
extend({ DirectionalLightHelper });

interface Position {
  x: number;
  y: number;
  z: number;
}

interface Room {
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  unit: string;
}

interface FixtureModel {
  name: string;
  specifications?: {
    power?: number;
    ppf?: number;
  };
}

interface Fixture {
  id: string;
  position: Position;
  model?: FixtureModel;
  rotation?: number;
}

interface ViewSettings {
  showStructure: boolean;
  showHVAC: boolean;
  showIrrigation: boolean;
  showLighting: boolean;
  showBenches: boolean;
  showDimensions: boolean;
  showShadows: boolean;
  showPPFD: boolean;
  wireframe: boolean;
  enableSSAO: boolean;
  enableBloom: boolean;
  qualityLevel: 'low' | 'medium' | 'high';
  environmentPreset: 'sunset' | 'dawn' | 'night' | 'studio';
}

interface GreenhouseConfig {
  type: 'venlo' | 'gutter_connected' | 'freestanding';
  count: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    gutterHeight: number;
  };
  peaks: number;
  glazing: 'glass' | 'polycarbonate' | 'film';
  frame: 'aluminum' | 'steel' | 'wood';
}

interface Interactive3DVisualizationProps {
  fixtures: Fixture[];
  room: Room;
  selectedFixture?: Fixture | null;
  onFixtureSelect?: (fixture: Fixture) => void;
  onFixtureUpdate?: (id: string, updates: Partial<Fixture>) => void;
  onFixtureAdd?: (model: FixtureModel) => void;
  showPPFD?: boolean;
  showShadows?: boolean;
  quality?: 'low' | 'medium' | 'high';
  gridEnabled?: boolean;
  greenhouseConfig?: GreenhouseConfig;
  viewSettings?: Partial<ViewSettings>;
  onViewSettingsChange?: (settings: ViewSettings) => void;
}

// Loading component
const LoadingSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
    <div className="text-white flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      <span>Loading 3D Environment...</span>
    </div>
  </div>
);

// Professional Materials
const GlassMaterial = ({ transmission = 0.9, thickness = 0.02 }: { transmission?: number; thickness?: number }) => (
  <meshPhysicalMaterial
    transmission={transmission}
    thickness={thickness}
    roughness={0}
    metalness={0}
    clearcoat={1}
    clearcoatRoughness={0}
    color="#ffffff"
    envMapIntensity={0.4}
    transparent
    opacity={0.8}
  />
);

const AluminumMaterial = () => (
  <meshStandardMaterial
    color="#c0c0c0"
    metalness={0.8}
    roughness={0.2}
    envMapIntensity={1.2}
  />
);

// Venlo Greenhouse Structure Component
function VenloGreenhouseStructure({ 
  config, 
  viewSettings 
}: { 
  config: GreenhouseConfig; 
  viewSettings: ViewSettings;
}) {
  const { dimensions, peaks, glazing, frame } = config;
  const scale = 0.3048; // Convert feet to meters
  
  const width = dimensions.width * scale;
  const length = dimensions.length * scale;
  const height = dimensions.height * scale;
  const gutterHeight = dimensions.gutterHeight * scale;
  
  const peakWidth = width / peaks;
  const peakHeight = (height - gutterHeight) * 0.5;
  
  return (
    <group>
      {viewSettings.showStructure && (
        <>
          {/* Foundation */}
          <Box 
            args={[width + 2, 0.5, length + 2]} 
            position={[0, -0.25, 0]}
            receiveShadow
          >
            <meshStandardMaterial color="#333333" roughness={0.9} metalness={0.1} />
          </Box>
          
          {/* Structural Frame */}
          {Array.from({ length: Math.floor(length / 5) + 1 }).map((_, i) => {
            const z = (i * 5 - length / 2) * scale;
            return (
              <group key={`frame-${i}`}>
                {/* Vertical Posts */}
                {Array.from({ length: peaks + 1 }).map((_, p) => {
                  const x = (p * peakWidth - width / 2);
                  return (
                    <Box
                      key={`post-${p}`}
                      args={[0.15, gutterHeight, 0.15]}
                      position={[x, gutterHeight / 2, z]}
                      castShadow
                    >
                      <AluminumMaterial />
                    </Box>
                  );
                })}
                
                {/* Roof Trusses for each peak */}
                {Array.from({ length: peaks }).map((_, p) => {
                  const xLeft = p * peakWidth - width / 2;
                  const xRight = (p + 1) * peakWidth - width / 2;
                  const xCenter = (xLeft + xRight) / 2;
                  
                  return (
                    <group key={`truss-${p}`}>
                      {/* Left roof beam */}
                      <Box
                        args={[peakWidth / 2 + 0.2, 0.1, 0.15]}
                        position={[xLeft + peakWidth / 4, gutterHeight + peakHeight / 2, z]}
                        rotation={[0, 0, Math.atan(peakHeight / (peakWidth / 2))]}
                        castShadow
                      >
                        <AluminumMaterial />
                      </Box>
                      
                      {/* Right roof beam */}
                      <Box
                        args={[peakWidth / 2 + 0.2, 0.1, 0.15]}
                        position={[xRight - peakWidth / 4, gutterHeight + peakHeight / 2, z]}
                        rotation={[0, 0, -Math.atan(peakHeight / (peakWidth / 2))]}
                        castShadow
                      >
                        <AluminumMaterial />
                      </Box>
                      
                      {/* Ridge beam */}
                      <Box
                        args={[0.2, 0.15, 0.15]}
                        position={[xCenter, gutterHeight + peakHeight, z]}
                        castShadow
                      >
                        <AluminumMaterial />
                      </Box>
                    </group>
                  );
                })}
                
                {/* Gutter */}
                <Box
                  args={[width, 0.3, 0.3]}
                  position={[0, gutterHeight, z]}
                  castShadow
                >
                  <AluminumMaterial />
                </Box>
              </group>
            );
          })}
          
          {/* Glass Panels */}
          {glazing === 'glass' && !viewSettings.wireframe && (
            <>
              {/* Roof Glass Panels */}
              {Array.from({ length: peaks }).map((_, p) => {
                const xLeft = p * peakWidth - width / 2;
                const xRight = (p + 1) * peakWidth - width / 2;
                const xCenter = (xLeft + xRight) / 2;
                
                return (
                  <group key={`glass-${p}`}>
                    {/* Left roof glass */}
                    <Plane
                      args={[peakWidth / 2, length]}
                      position={[xLeft + peakWidth / 4, gutterHeight + peakHeight / 2, 0]}
                      rotation={[Math.atan(peakHeight / (peakWidth / 2)), 0, 0]}
                    >
                      <GlassMaterial transmission={0.85} />
                    </Plane>
                    
                    {/* Right roof glass */}
                    <Plane
                      args={[peakWidth / 2, length]}
                      position={[xRight - peakWidth / 4, gutterHeight + peakHeight / 2, 0]}
                      rotation={[-Math.atan(peakHeight / (peakWidth / 2)), 0, 0]}
                    >
                      <GlassMaterial transmission={0.85} />
                    </Plane>
                  </group>
                );
              })}
              
              {/* Side Wall Glass */}
              <Plane
                args={[length, gutterHeight]}
                position={[-width / 2, gutterHeight / 2, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <GlassMaterial transmission={0.9} />
              </Plane>
              
              <Plane
                args={[length, gutterHeight]}
                position={[width / 2, gutterHeight / 2, 0]}
                rotation={[0, -Math.PI / 2, 0]}
              >
                <GlassMaterial transmission={0.9} />
              </Plane>
              
              {/* End Wall Glass */}
              <Plane
                args={[width, gutterHeight + peakHeight]}
                position={[0, (gutterHeight + peakHeight) / 2, -length / 2]}
              >
                <GlassMaterial transmission={0.9} />
              </Plane>
              
              <Plane
                args={[width, gutterHeight + peakHeight]}
                position={[0, (gutterHeight + peakHeight) / 2, length / 2]}
                rotation={[0, Math.PI, 0]}
              >
                <GlassMaterial transmission={0.9} />
              </Plane>
            </>
          )}
        </>
      )}
    </group>
  );
}

// Enhanced Room Structure with Professional Features
function RoomStructure({ 
  room, 
  greenhouseConfig, 
  viewSettings 
}: { 
  room: Room; 
  greenhouseConfig?: GreenhouseConfig;
  viewSettings: ViewSettings;
}) {
  const { dimensions, unit } = room;
  const scale = unit === 'meters' ? 1 : 0.3048;
  
  const roomWidth = dimensions.width * scale;
  const roomLength = dimensions.length * scale;
  const roomHeight = dimensions.height * scale;
  
  // If greenhouse config provided, use that instead of basic room
  if (greenhouseConfig) {
    return <VenloGreenhouseStructure config={greenhouseConfig} viewSettings={viewSettings} />;
  }
  
  return (
    <group>
      {/* Enhanced Floor with Pattern */}
      <Plane 
        args={[roomWidth, roomLength]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#2d3748" 
          roughness={0.8} 
          metalness={0.1}
        />
      </Plane>
      
      {/* Professional Grid */}
      {viewSettings.showStructure && (
        <Grid
          args={[roomWidth, roomLength]}
          cellSize={1}
          cellThickness={1}
          cellColor="#4a5568"
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor="#718096"
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />
      )}
      
      {/* Walls */}
      {viewSettings.showStructure && (
        <>
          {/* Back wall */}
          <Plane 
            args={[roomWidth, roomHeight]} 
            position={[0, roomHeight / 2, -roomLength / 2]}
          >
            <meshStandardMaterial color="#4a5568" roughness={0.7} metalness={0.3} />
          </Plane>
          
          {/* Front wall */}
          <Plane 
            args={[roomWidth, roomHeight]} 
            position={[0, roomHeight / 2, roomLength / 2]}
            rotation={[0, Math.PI, 0]}
          >
            <meshStandardMaterial color="#4a5568" roughness={0.7} metalness={0.3} />
          </Plane>
          
          {/* Left wall */}
          <Plane 
            args={[roomLength, roomHeight]} 
            position={[-roomWidth / 2, roomHeight / 2, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <meshStandardMaterial color="#4a5568" roughness={0.7} metalness={0.3} />
          </Plane>
          
          {/* Right wall */}
          <Plane 
            args={[roomLength, roomHeight]} 
            position={[roomWidth / 2, roomHeight / 2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <meshStandardMaterial color="#4a5568" roughness={0.7} metalness={0.3} />
          </Plane>
        </>
      )}
    </group>
  );
}

// HVAC System Components
function HVACSystem({ 
  room, 
  viewSettings 
}: { 
  room: Room; 
  viewSettings: ViewSettings; 
}) {
  if (!viewSettings.showHVAC) return null;
  
  const scale = 0.3048;
  const roomWidth = room.dimensions.width * scale;
  const roomLength = room.dimensions.length * scale;
  const roomHeight = room.dimensions.height * scale;
  
  return (
    <group>
      {/* Main HVAC Duct */}
      <Box
        args={[roomWidth * 0.8, 0.4, 0.4]}
        position={[0, roomHeight - 0.5, 0]}
        castShadow
      >
        <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.4} />
      </Box>
      
      {/* Supply Vents */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          key={`vent-${i}`}
          args={[0.6, 0.1, 0.6]}
          position={[
            (i - 2.5) * (roomWidth / 6), 
            roomHeight - 0.8, 
            0
          ]}
          castShadow
        >
          <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
        </Box>
      ))}
      
      {/* HAF Fans */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`fan-${i}`}>
          <Box
            args={[0.8, 0.2, 0.8]}
            position={[
              (i - 1.5) * (roomWidth / 4), 
              roomHeight * 0.7, 
              roomLength * 0.3
            ]}
            castShadow
          >
            <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
          </Box>
          {/* Fan Blades */}
          <Box
            args={[0.6, 0.05, 0.6]}
            position={[
              (i - 1.5) * (roomWidth / 4), 
              roomHeight * 0.7, 
              roomLength * 0.3
            ]}
          >
            <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} />
          </Box>
        </group>
      ))}
    </group>
  );
}

// Irrigation System Components
function IrrigationSystem({ 
  room, 
  viewSettings 
}: { 
  room: Room; 
  viewSettings: ViewSettings; 
}) {
  if (!viewSettings.showIrrigation) return null;
  
  const scale = 0.3048;
  const roomWidth = room.dimensions.width * scale;
  const roomLength = room.dimensions.length * scale;
  const roomHeight = room.dimensions.height * scale;
  
  return (
    <group>
      {/* Main Water Line */}
      <Box
        args={[0.1, 0.1, roomLength * 0.9]}
        position={[-roomWidth * 0.4, 2, 0]}
        castShadow
      >
        <meshStandardMaterial color="#0066cc" metalness={0.7} roughness={0.3} />
      </Box>
      
      {/* Distribution Lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          key={`water-line-${i}`}
          args={[roomWidth * 0.8, 0.05, 0.05]}
          position={[
            0, 
            1.8, 
            (i - 2.5) * (roomLength / 6)
          ]}
          castShadow
        >
          <meshStandardMaterial color="#0099ff" metalness={0.6} roughness={0.4} />
        </Box>
      ))}
      
      {/* Nutrient Tank */}
      <group position={[-roomWidth * 0.45, 1, -roomLength * 0.4]}>
        <Box args={[1.5, 2, 1.5]} castShadow>
          <meshStandardMaterial color="#004499" metalness={0.5} roughness={0.5} />
        </Box>
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          NUTRIENT
        </Text>
      </group>
      
      {/* Pumps */}
      <Box
        args={[0.8, 0.6, 0.8]}
        position={[-roomWidth * 0.4, 0.3, -roomLength * 0.35]}
        castShadow
      >
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </Box>
    </group>
  );
}

// Professional Grow Light Components
function GrowLightFixtures({ 
  fixtures, 
  viewSettings,
  onFixtureSelect 
}: { 
  fixtures: Fixture[]; 
  viewSettings: ViewSettings;
  onFixtureSelect?: (fixture: Fixture) => void;
}) {
  if (!viewSettings.showLighting) return null;
  
  const scale = 0.3048;
  
  return (
    <group>
      {fixtures.map((fixture) => (
        <group
          key={fixture.id}
          position={[
            fixture.position.x * scale,
            fixture.position.z * scale,
            fixture.position.y * scale
          ]}
          onClick={() => onFixtureSelect?.(fixture)}
        >
          {/* Fixture Housing */}
          <Box args={[1.2, 0.2, 0.4]} castShadow>
            <meshStandardMaterial 
              color="#ffff00" 
              emissive="#ffff00"
              emissiveIntensity={0.3}
              metalness={0.8} 
              roughness={0.2} 
            />
          </Box>
          
          {/* LED Array */}
          <Box args={[1.0, 0.05, 0.3]} position={[0, -0.125, 0]}>
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffddaa"
              emissiveIntensity={0.5}
            />
          </Box>
          
          {/* Mounting Hardware */}
          <Box args={[0.1, 0.5, 0.1]} position={[0, 0.35, 0]} castShadow>
            <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.1} />
          </Box>
          
          {/* Light Effect */}
          <pointLight
            position={[0, -0.2, 0]}
            intensity={0.5}
            distance={8}
            decay={2}
            color="#ffddaa"
            castShadow
          />
          
          {/* Power Rating Label */}
          {fixture.model?.specifications?.power && (
            <Text
              position={[0, 0.4, 0]}
              fontSize={0.15}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {fixture.model.specifications.power}W
            </Text>
          )}
        </group>
      ))}
    </group>
  );
}

// Growing Benches/Tables
function GrowingBenches({ 
  room, 
  viewSettings 
}: { 
  room: Room; 
  viewSettings: ViewSettings; 
}) {
  if (!viewSettings.showBenches) return null;
  
  const scale = 0.3048;
  const roomWidth = room.dimensions.width * scale;
  const roomLength = room.dimensions.length * scale;
  
  const benchWidth = 1.2;
  const benchLength = roomLength * 0.8;
  const benchHeight = 0.8;
  const benchesPerRow = Math.floor(roomWidth / (benchWidth + 0.8));
  
  return (
    <group>
      {Array.from({ length: benchesPerRow }).map((_, i) => (
        <group key={`bench-${i}`}>
          {/* Bench Surface */}
          <Box
            args={[benchWidth, 0.05, benchLength]}
            position={[
              (i - (benchesPerRow - 1) / 2) * (benchWidth + 0.8),
              benchHeight,
              0
            ]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#8B4513" roughness={0.8} metalness={0.1} />
          </Box>
          
          {/* Bench Legs */}
          {Array.from({ length: 4 }).map((_, j) => (
            <Box
              key={`leg-${j}`}
              args={[0.05, benchHeight, 0.05]}
              position={[
                (i - (benchesPerRow - 1) / 2) * (benchWidth + 0.8) + 
                (j % 2 === 0 ? -benchWidth/2 + 0.1 : benchWidth/2 - 0.1),
                benchHeight / 2,
                (j < 2 ? -benchLength/2 + 0.2 : benchLength/2 - 0.2)
              ]}
              castShadow
            >
              <meshStandardMaterial color="#666666" metalness={0.6} roughness={0.4} />
            </Box>
          ))}
          
          {/* Plants/Crops Simulation */}
          {Array.from({ length: 20 }).map((_, p) => (
            <Sphere
              key={`plant-${p}`}
              args={[0.1]}
              position={[
                (i - (benchesPerRow - 1) / 2) * (benchWidth + 0.8) + 
                (Math.random() - 0.5) * benchWidth * 0.8,
                benchHeight + 0.15,
                (Math.random() - 0.5) * benchLength * 0.8
              ]}
            >
              <meshStandardMaterial color="#228B22" roughness={0.9} />
            </Sphere>
          ))}
        </group>
      ))}
    </group>
  );
}
// Professional Control Interface
function VisualizationControls({ 
  viewSettings, 
  onViewSettingsChange 
}: { 
  viewSettings: ViewSettings; 
  onViewSettingsChange: (settings: ViewSettings) => void; 
}) {
  const updateSetting = useCallback((key: keyof ViewSettings, value: any) => {
    onViewSettingsChange({
      ...viewSettings,
      [key]: value
    });
  }, [viewSettings, onViewSettingsChange]);

  return (
    <Card className="absolute top-4 left-4 w-80 bg-gray-900/95 border-gray-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5" />
          Visualization Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Visibility */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            System Layers
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={viewSettings.showStructure ? "default" : "outline"}
              size="sm"
              onClick={() => updateSetting('showStructure', !viewSettings.showStructure)}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Structure
            </Button>
            <Button
              variant={viewSettings.showHVAC ? "default" : "outline"}
              size="sm"
              onClick={() => updateSetting('showHVAC', !viewSettings.showHVAC)}
              className="text-xs"
            >
              <Thermometer className="w-3 h-3 mr-1" />
              HVAC
            </Button>
            <Button
              variant={viewSettings.showIrrigation ? "default" : "outline"}
              size="sm"
              onClick={() => updateSetting('showIrrigation', !viewSettings.showIrrigation)}
              className="text-xs"
            >
              <Droplets className="w-3 h-3 mr-1" />
              Irrigation
            </Button>
            <Button
              variant={viewSettings.showLighting ? "default" : "outline"}
              size="sm"
              onClick={() => updateSetting('showLighting', !viewSettings.showLighting)}
              className="text-xs"
            >
              <Sun className="w-3 h-3 mr-1" />
              Lighting
            </Button>
            <Button
              variant={viewSettings.showBenches ? "default" : "outline"}
              size="sm"
              onClick={() => updateSetting('showBenches', !viewSettings.showBenches)}
              className="text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              Benches
            </Button>
            <Button
              variant={viewSettings.showDimensions ? "default" : "outline"}
              size="sm"
              onClick={() => updateSetting('showDimensions', !viewSettings.showDimensions)}
              className="text-xs"
            >
              📏 Dimensions
            </Button>
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Visual Effects */}
        <div>
          <h4 className="text-sm font-medium mb-2">Visual Effects</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs">Shadows</label>
              <Button
                variant={viewSettings.showShadows ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('showShadows', !viewSettings.showShadows)}
                className="h-6 px-2"
              >
                {viewSettings.showShadows ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs">SSAO</label>
              <Button
                variant={viewSettings.enableSSAO ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('enableSSAO', !viewSettings.enableSSAO)}
                className="h-6 px-2"
              >
                {viewSettings.enableSSAO ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs">Bloom</label>
              <Button
                variant={viewSettings.enableBloom ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('enableBloom', !viewSettings.enableBloom)}
                className="h-6 px-2"
              >
                {viewSettings.enableBloom ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs">Wireframe</label>
              <Button
                variant={viewSettings.wireframe ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('wireframe', !viewSettings.wireframe)}
                className="h-6 px-2"
              >
                {viewSettings.wireframe ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              <Camera className="w-3 h-3 mr-1" />
              Screenshot
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Share2 className="w-3 h-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Advanced Lighting and Environment
function AdvancedLighting({ 
  viewSettings 
}: { 
  viewSettings: ViewSettings; 
}) {
  return (
    <>
      {/* Main Directional Light (Sun) */}
      <directionalLight
        position={[50, 50, 50]}
        intensity={1.2}
        castShadow={viewSettings.showShadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={0.1}
        shadow-camera-far={200}
        color="#ffffff"
      />
      
      {/* Ambient Light */}
      <ambientLight intensity={0.4} color="#404040" />
      
      {/* Hemisphere Light for Sky/Ground Color */}
      <hemisphereLight
        skyColor="#87CEEB"
        groundColor="#545454"
        intensity={0.6}
      />
      
      {/* Fill Light */}
      <directionalLight
        position={[-30, 20, 30]}
        intensity={0.3}
        color="#a8c8ec"
      />
      
      {/* Environment Map */}
      <Environment
        preset={viewSettings.environmentPreset}
        background={false}
        environmentIntensity={0.5}
      />
    </>
  );
}

// Main Scene Component
function Scene({ 
  fixtures, 
  room, 
  selectedFixture, 
  onFixtureSelect,
  greenhouseConfig,
  viewSettings 
}: {
  fixtures: Fixture[];
  room: Room;
  selectedFixture?: Fixture | null;
  onFixtureSelect?: (fixture: Fixture) => void;
  greenhouseConfig?: GreenhouseConfig;
  viewSettings: ViewSettings;
}) {
  return (
    <>
      {/* Advanced Lighting */}
      <AdvancedLighting viewSettings={viewSettings} />
      
      {/* Professional shadows */}
      {viewSettings.showShadows && (
        <AccumulativeShadows
          temporal
          frames={100}
          color="#000000"
          colorBlend={2}
          alphaTest={0.85}
          scale={50}
          position={[0, -0.01, 0]}
        >
          <RandomizedLight
            amount={8}
            radius={10}
            ambient={0.5}
            intensity={1}
            position={[10, 10, 5]}
            bias={0.001}
          />
        </AccumulativeShadows>
      )}
      
      {/* Room/Greenhouse Structure */}
      <RoomStructure 
        room={room} 
        greenhouseConfig={greenhouseConfig}
        viewSettings={viewSettings}
      />
      
      {/* System Components */}
      <HVACSystem room={room} viewSettings={viewSettings} />
      <IrrigationSystem room={room} viewSettings={viewSettings} />
      <GrowingBenches room={room} viewSettings={viewSettings} />
      
      {/* Lighting Fixtures */}
      <GrowLightFixtures 
        fixtures={fixtures} 
        viewSettings={viewSettings}
        onFixtureSelect={onFixtureSelect}
      />
      
      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={[100, 20, 100]}
        inclination={0}
        azimuth={0.25}
      />
    </>
  );
}

// Performance Monitor Component
function PerformanceStats() {
  return (
    <div className="absolute top-4 right-4">
      <Stats />
    </div>
  );
}

export default Interactive3DVisualization;