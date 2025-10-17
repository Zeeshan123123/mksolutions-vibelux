'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Grid,
  Environment,
  Text,
  Box,
  Plane
} from '@react-three/drei';
import { Vector3 } from 'three';
import {
  CultivationLayout,
  TablePlacement,
  LightPlacement,
  HVACPlacement,
  WorkflowPath
} from '@/lib/drawing/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  EyeOff,
  Maximize,
  Settings,
  Download,
  RefreshCw,
  Layers,
  Box as BoxIcon,
  Lightbulb,
  Wind,
  Route
} from 'lucide-react';

interface Layout3DVisualizerProps {
  layout: CultivationLayout;
  onEditInDesigner?: () => void;
  onExport?: () => void;
}

interface LayerVisibility {
  tables: boolean;
  lights: boolean;
  hvac: boolean;
  irrigation: boolean;
  electrical: boolean;
  workflow: boolean;
}

// 3D Components
function RoomWalls({ room }: { room: CultivationLayout['room'] }) {
  const { width, height } = room.dimensions;
  const wallHeight = 10; // 10 ft ceiling
  const wallThickness = 0.5;

  return (
    <>
      {/* Floor */}
      <Plane 
        args={[width, height]} 
        rotation={[-Math.PI / 2, 0, 0]}
        position={[width / 2, 0, height / 2]}
      >
        <meshStandardMaterial color="#333333" />
      </Plane>

      {/* Walls */}
      {/* North Wall */}
      <Box 
        args={[width, wallHeight, wallThickness]}
        position={[width / 2, wallHeight / 2, 0]}
      >
        <meshStandardMaterial color="#e5e5e5" />
      </Box>

      {/* South Wall */}
      <Box 
        args={[width, wallHeight, wallThickness]}
        position={[width / 2, wallHeight / 2, height]}
      >
        <meshStandardMaterial color="#e5e5e5" />
      </Box>

      {/* East Wall */}
      <Box 
        args={[wallThickness, wallHeight, height]}
        position={[width, wallHeight / 2, height / 2]}
      >
        <meshStandardMaterial color="#e5e5e5" />
      </Box>

      {/* West Wall */}
      <Box 
        args={[wallThickness, wallHeight, height]}
        position={[0, wallHeight / 2, height / 2]}
      >
        <meshStandardMaterial color="#e5e5e5" />
      </Box>

      {/* Room Label */}
      <Text
        position={[width / 2, 0.1, height / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2}
        color="white"
      >
        {room.name || 'Cultivation Room'}
      </Text>
    </>
  );
}

function Table3D({ table }: { table: TablePlacement }) {
  const tableHeight = table.dimensions.height;
  const tableTop = 0.2;
  
  return (
    <group position={[
      table.position.x + table.dimensions.width / 2,
      table.position.z + tableHeight / 2,
      table.position.y + table.dimensions.depth / 2
    ]}>
      {/* Table Frame */}
      <Box args={[
        table.dimensions.width,
        tableHeight,
        table.dimensions.depth
      ]}>
        <meshStandardMaterial color="#666666" wireframe />
      </Box>

      {/* Table Top */}
      <Box 
        args={[
          table.dimensions.width - 0.2,
          tableTop,
          table.dimensions.depth - 0.2
        ]}
        position={[0, tableHeight / 2, 0]}
      >
        <meshStandardMaterial color="#8B4513" />
      </Box>

      {/* Plant Canopy (simplified) */}
      <Box 
        args={[
          table.dimensions.width - 0.4,
          1,
          table.dimensions.depth - 0.4
        ]}
        position={[0, tableHeight / 2 + 0.5, 0]}
      >
        <meshStandardMaterial color="#228B22" transparent opacity={0.8} />
      </Box>

      {/* Table ID */}
      <Text
        position={[0, tableHeight + 1, 0]}
        fontSize={0.5}
        color="white"
      >
        {table.id}
      </Text>
    </group>
  );
}

function Light3D({ light }: { light: LightPlacement }) {
  return (
    <group position={[
      light.position.x,
      light.position.z,
      light.position.y
    ]}>
      {/* Light Fixture */}
      <Box args={[2, 0.5, 2]}>
        <meshStandardMaterial 
          color={light.fixture.type === 'led' ? '#ffff00' : '#ff9900'} 
          emissive={light.fixture.type === 'led' ? '#ffff00' : '#ff9900'}
          emissiveIntensity={0.5}
        />
      </Box>

      {/* Light Cone */}
      <spotLight
        position={[0, 0, 0]}
        angle={0.8}
        penumbra={0.5}
        intensity={1}
        castShadow
        target-position={[0, -10, 0]}
      />

      {/* Light Info */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color="yellow"
      >
        {light.fixture.wattage}W
      </Text>
    </group>
  );
}

function HVAC3D({ unit }: { unit: HVACPlacement }) {
  const getUnitColor = () => {
    switch (unit.type) {
      case 'ac': return '#4169e1';
      case 'dehumidifier': return '#9370db';
      case 'fan': return '#20b2aa';
      case 'exhaust': return '#ff6347';
      default: return '#808080';
    }
  };

  const getUnitSize = () => {
    switch (unit.type) {
      case 'ac': return [3, 3, 2];
      case 'dehumidifier': return [1.5, 2, 1.5];
      case 'fan': return [2, 2, 0.5];
      case 'exhaust': return [1, 1, 1];
      default: return [1, 1, 1];
    }
  };

  return (
    <group position={[
      unit.position.x,
      unit.position.z,
      unit.position.y
    ]}>
      <Box args={getUnitSize() as [number, number, number]}>
        <meshStandardMaterial color={getUnitColor()} />
      </Box>
      
      <Text
        position={[0, 2, 0]}
        fontSize={0.4}
        color="white"
      >
        {unit.type.toUpperCase()}
      </Text>
    </group>
  );
}

function WorkflowPath3D({ path }: { path: WorkflowPath }) {
  const getPathColor = () => {
    switch (path.type) {
      case 'primary': return '#00ff00';
      case 'secondary': return '#ffff00';
      case 'emergency': return '#ff0000';
      default: return '#ffffff';
    }
  };

  return (
    <>
      {path.points.map((point, index) => {
        if (index === 0) return null;
        
        const prevPoint = path.points[index - 1];
        const distance = Math.sqrt(
          Math.pow(point.x - prevPoint.x, 2) +
          Math.pow(point.y - prevPoint.y, 2)
        );

        return (
          <Box
            key={`${path.id}-${index}`}
            args={[distance, 0.1, path.width]}
            position={[
              (point.x + prevPoint.x) / 2,
              0.05,
              (point.y + prevPoint.y) / 2
            ]}
            rotation={[0, Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x), 0]}
          >
            <meshStandardMaterial 
              color={getPathColor()} 
              transparent 
              opacity={0.5}
            />
          </Box>
        );
      })}
    </>
  );
}

export function Layout3DVisualizer({ 
  layout, 
  onEditInDesigner,
  onExport 
}: Layout3DVisualizerProps) {
  const [layers, setLayers] = useState<LayerVisibility>({
    tables: true,
    lights: true,
    hvac: true,
    irrigation: false,
    electrical: false,
    workflow: true
  });

  const [viewMode, setViewMode] = useState<'3d' | 'top'>('3d');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const toggleLayer = (layer: keyof LayerVisibility) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const getCameraPosition = (): [number, number, number] => {
    const { width, height } = layout.room.dimensions;
    if (viewMode === 'top') {
      return [width / 2, 30, height / 2];
    }
    return [width * 1.5, 20, height * 1.5];
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>3D Layout Visualization</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === '3d' ? 'top' : '3d')}
              >
                <Eye className="w-4 h-4 mr-1" />
                {viewMode === '3d' ? 'Top View' : '3D View'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onEditInDesigner}
              >
                <Settings className="w-4 h-4 mr-1" />
                Edit in Designer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Layer Controls */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant={layers.tables ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleLayer('tables')}
            >
              <BoxIcon className="w-3 h-3 mr-1" />
              Tables ({layout.tables.length})
            </Badge>
            <Badge
              variant={layers.lights ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleLayer('lights')}
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              Lights ({layout.lights.length})
            </Badge>
            <Badge
              variant={layers.hvac ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleLayer('hvac')}
            >
              <Wind className="w-3 h-3 mr-1" />
              HVAC ({layout.hvac.length})
            </Badge>
            <Badge
              variant={layers.workflow ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleLayer('workflow')}
            >
              <Route className="w-3 h-3 mr-1" />
              Paths ({layout.workflow.length})
            </Badge>
          </div>

          {/* Metrics Display */}
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div className="bg-gray-100 p-2 rounded">
              <div className="font-medium">Plant Capacity</div>
              <div className="text-lg">{layout.metrics.plantCapacity.toLocaleString()}</div>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <div className="font-medium">Canopy Area</div>
              <div className="text-lg">{layout.metrics.canopyArea.toLocaleString()} sq ft</div>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <div className="font-medium">PPFD Average</div>
              <div className="text-lg">{layout.metrics.ppfdAverage} μmol</div>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <div className="font-medium">Power Density</div>
              <div className="text-lg">{layout.metrics.powerDensity.toFixed(1)} W/sq ft</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3D Viewport */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[600px] w-full">
            <Canvas shadows>
              <PerspectiveCamera
                makeDefault
                position={getCameraPosition()}
                fov={50}
              />
              
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={viewMode === '3d'}
                target={[
                  layout.room.dimensions.width / 2,
                  0,
                  layout.room.dimensions.height / 2
                ]}
              />

              {/* Lighting */}
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

              {/* Environment */}
              <Environment preset="warehouse" />

              {/* Grid */}
              <Grid
                args={[100, 100]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#666666"
                sectionSize={10}
                sectionThickness={1}
                sectionColor="#888888"
                fadeDistance={100}
                fadeStrength={1}
                position={[50, 0, 50]}
                rotation={[-Math.PI / 2, 0, 0]}
              />

              {/* Room */}
              <RoomWalls room={layout.room} />

              {/* Tables */}
              {layers.tables && layout.tables.map(table => (
                <Table3D key={table.id} table={table} />
              ))}

              {/* Lights */}
              {layers.lights && layout.lights.map(light => (
                <Light3D key={light.id} light={light} />
              ))}

              {/* HVAC */}
              {layers.hvac && layout.hvac.map(unit => (
                <HVAC3D key={unit.id} unit={unit} />
              ))}

              {/* Workflow Paths */}
              {layers.workflow && layout.workflow.map(path => (
                <WorkflowPath3D key={path.id} path={path} />
              ))}
            </Canvas>
          </div>
        </CardContent>
      </Card>

      {/* Selected Item Details */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>Selected: {selectedItem.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs">
              {JSON.stringify(selectedItem, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}