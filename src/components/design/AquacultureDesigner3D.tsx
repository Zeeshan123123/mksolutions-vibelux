'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line, Box, Cylinder, Sphere } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Fish, 
  Droplets, 
  Wind, 
  Filter,
  Plus,
  Minus,
  Move3D,
  Palette,
  GitBranch,
  Gauge
} from 'lucide-react';

interface Tank {
  id: string;
  type: 'circular' | 'rectangular' | 'raceway';
  position: [number, number, number];
  dimensions: {
    diameter?: number;
    length?: number;
    width?: number;
    height: number;
  };
  volume: number;
  species?: string;
}

interface Pipe {
  id: string;
  type: 'supply' | 'drain' | 'aeration' | 'recirculation' | 'waste';
  diameter: number;
  points: [number, number, number][];
  flowRate?: number;
  color: string;
}

interface FilterUnit {
  id: string;
  type: 'drum' | 'biofilter' | 'protein-skimmer' | 'degasser' | 'oxygen-cone';
  position: [number, number, number];
  size: [number, number, number];
  capacity: number;
}

const PIPE_COLORS = {
  supply: '#2196F3',      // Blue - fresh/supply water
  drain: '#795548',       // Brown - waste water
  aeration: '#00BCD4',    // Cyan - air lines
  recirculation: '#4CAF50', // Green - recirculated water
  waste: '#F44336'        // Red - waste discharge
};

const PIPE_DIAMETERS = {
  main: 0.3,      // 300mm main lines
  secondary: 0.2, // 200mm secondary
  branch: 0.1,    // 100mm branches
  air: 0.05       // 50mm air lines
};

// Tank Component
function TankModel({ tank, selected, onSelect }: { 
  tank: Tank; 
  selected: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && selected) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  if (tank.type === 'circular') {
    return (
      <group position={tank.position}>
        <Cylinder
          ref={meshRef}
          args={[tank.dimensions.diameter! / 2, tank.dimensions.diameter! / 2, tank.dimensions.height]}
          onClick={onSelect}
        >
          <meshStandardMaterial 
            color={selected ? '#FFD700' : '#E0E0E0'} 
            metalness={0.7}
            roughness={0.3}
            transparent
            opacity={0.9}
          />
        </Cylinder>
        {/* Water level indicator */}
        <Cylinder
          args={[
            (tank.dimensions.diameter! / 2) - 0.1, 
            (tank.dimensions.diameter! / 2) - 0.1, 
            tank.dimensions.height * 0.8
          ]}
          position={[0, -tank.dimensions.height * 0.1, 0]}
        >
          <meshStandardMaterial 
            color="#4FC3F7" 
            transparent
            opacity={0.5}
          />
        </Cylinder>
        <Text
          position={[0, tank.dimensions.height / 2 + 0.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {tank.species || 'Tank'} - {tank.volume.toFixed(0)}m³
        </Text>
      </group>
    );
  }
  
  return null;
}

// Pipe Component with flow animation
function PipeModel({ pipe }: { pipe: Pipe }) {
  const points = pipe.points.map(p => new THREE.Vector3(...p));
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (tubeRef.current && pipe.flowRate && pipe.flowRate > 0) {
      const material = tubeRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <mesh ref={tubeRef}>
      <tubeGeometry args={[curve, 64, pipe.diameter / 2, 8, false]} />
      <meshStandardMaterial 
        color={pipe.color}
        metalness={0.8}
        roughness={0.2}
        emissive={pipe.color}
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

// Filter Unit Component
function FilterModel({ filter }: { filter: FilterUnit }) {
  const iconMap = {
    drum: '🥁',
    biofilter: '🦠',
    'protein-skimmer': '🌊',
    degasser: '💨',
    'oxygen-cone': '⭕'
  };

  return (
    <group position={filter.position}>
      <Box args={filter.size}>
        <meshStandardMaterial 
          color="#9E9E9E" 
          metalness={0.6}
          roughness={0.4}
        />
      </Box>
      <Text
        position={[0, filter.size[1] / 2 + 0.3, 0]}
        fontSize={0.5}
        anchorX="center"
        anchorY="middle"
      >
        {iconMap[filter.type]}
      </Text>
      <Text
        position={[0, -filter.size[1] / 2 - 0.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {filter.type}
      </Text>
    </group>
  );
}

// Main Scene Component
function AquacultureScene({ tanks, pipes, filters, selectedTank, onSelectTank }: {
  tanks: Tank[];
  pipes: Pipe[];
  filters: FilterUnit[];
  selectedTank: string | null;
  onSelectTank: (id: string) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-10, 10, 5]} intensity={0.5} />
      
      {/* Grid floor */}
      <gridHelper args={[50, 50]} />
      
      {/* Tanks */}
      {tanks.map(tank => (
        <TankModel 
          key={tank.id}
          tank={tank} 
          selected={selectedTank === tank.id}
          onSelect={() => onSelectTank(tank.id)}
        />
      ))}
      
      {/* Pipes */}
      {pipes.map(pipe => (
        <PipeModel key={pipe.id} pipe={pipe} />
      ))}
      
      {/* Filter Units */}
      {filters.map(filter => (
        <FilterModel key={filter.id} filter={filter} />
      ))}
      
      <OrbitControls />
    </>
  );
}

export default function AquacultureDesigner3D() {
  const [tanks, setTanks] = useState<Tank[]>([
    {
      id: '1',
      type: 'circular',
      position: [-10, 2, 0],
      dimensions: { diameter: 4, height: 4 },
      volume: 50.3,
      species: 'Tilapia'
    },
    {
      id: '2',
      type: 'circular',
      position: [-5, 2, 0],
      dimensions: { diameter: 4, height: 4 },
      volume: 50.3,
      species: 'Tilapia'
    },
    {
      id: '3',
      type: 'circular',
      position: [0, 2, 0],
      dimensions: { diameter: 4, height: 4 },
      volume: 50.3,
      species: 'Tilapia'
    },
    {
      id: '4',
      type: 'circular',
      position: [5, 2, 0],
      dimensions: { diameter: 4, height: 4 },
      volume: 50.3,
      species: 'Tilapia'
    }
  ]);

  const [pipes, setPipes] = useState<Pipe[]>([
    {
      id: 'supply-main',
      type: 'supply',
      diameter: PIPE_DIAMETERS.main,
      points: [[-15, 3, 0], [-10, 3, 0], [-5, 3, 0], [0, 3, 0], [5, 3, 0], [10, 3, 0]],
      flowRate: 100,
      color: PIPE_COLORS.supply
    },
    {
      id: 'drain-main',
      type: 'drain',
      diameter: PIPE_DIAMETERS.main,
      points: [[-10, 0.5, 0], [-5, 0.5, 0], [0, 0.5, 0], [5, 0.5, 0], [10, 0.5, 0], [15, 0.5, -5]],
      flowRate: 100,
      color: PIPE_COLORS.drain
    },
    {
      id: 'air-main',
      type: 'aeration',
      diameter: PIPE_DIAMETERS.air,
      points: [[-15, 4, 2], [-10, 4, 2], [-5, 4, 2], [0, 4, 2], [5, 4, 2], [10, 4, 2]],
      flowRate: 50,
      color: PIPE_COLORS.aeration
    },
    // Tank connections
    ...[-10, -5, 0, 5].map((x, i) => ({
      id: `supply-drop-${i}`,
      type: 'supply' as const,
      diameter: PIPE_DIAMETERS.branch,
      points: [[x, 3, 0], [x, 4, 0]] as [number, number, number][],
      flowRate: 25,
      color: PIPE_COLORS.supply
    })),
    ...[-10, -5, 0, 5].map((x, i) => ({
      id: `drain-rise-${i}`,
      type: 'drain' as const,
      diameter: PIPE_DIAMETERS.branch,
      points: [[x, 0, 0], [x, 0.5, 0]] as [number, number, number][],
      flowRate: 25,
      color: PIPE_COLORS.drain
    }))
  ]);

  const [filters, setFilters] = useState<FilterUnit[]>([
    {
      id: 'drum-1',
      type: 'drum',
      position: [12, 1.5, -5],
      size: [2, 3, 2],
      capacity: 1000
    },
    {
      id: 'biofilter-1',
      type: 'biofilter',
      position: [12, 1.5, -10],
      size: [3, 3, 3],
      capacity: 2000
    },
    {
      id: 'degasser-1',
      type: 'degasser',
      position: [12, 1.5, -15],
      size: [1.5, 3, 1.5],
      capacity: 500
    }
  ]);

  const [selectedTank, setSelectedTank] = useState<string | null>(null);
  const [designMode, setDesignMode] = useState<'view' | 'tanks' | 'pipes' | 'filters'>('view');
  const [pipeType, setPipeType] = useState<Pipe['type']>('supply');
  const [newPipePoints, setNewPipePoints] = useState<[number, number, number][]>([]);

  const addTank = () => {
    const newTank: Tank = {
      id: `tank-${Date.now()}`,
      type: 'circular',
      position: [tanks.length * 5 - 10, 2, 0],
      dimensions: { diameter: 4, height: 4 },
      volume: 50.3,
      species: 'New Tank'
    };
    setTanks([...tanks, newTank]);
  };

  const addPipePoint = (point: [number, number, number]) => {
    setNewPipePoints([...newPipePoints, point]);
    
    if (newPipePoints.length >= 1) {
      const newPipe: Pipe = {
        id: `pipe-${Date.now()}`,
        type: pipeType,
        diameter: PIPE_DIAMETERS.secondary,
        points: [...newPipePoints, point],
        flowRate: 50,
        color: PIPE_COLORS[pipeType]
      };
      setPipes([...pipes, newPipe]);
      setNewPipePoints([]);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
        {/* 3D Viewport */}
        <div className="lg:col-span-3 h-[600px] relative">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fish className="h-5 w-5" />
                  <CardTitle>Aquaculture System Designer</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={designMode === 'view' ? 'default' : 'outline'}
                    onClick={() => setDesignMode('view')}
                  >
                    <Move3D className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={designMode === 'tanks' ? 'default' : 'outline'}
                    onClick={() => setDesignMode('tanks')}
                  >
                    <Fish className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={designMode === 'pipes' ? 'default' : 'outline'}
                    onClick={() => setDesignMode('pipes')}
                  >
                    <GitBranch className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={designMode === 'filters' ? 'default' : 'outline'}
                    onClick={() => setDesignMode('filters')}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-60px)]">
              <Canvas camera={{ position: [20, 15, 20], fov: 50 }}>
                <AquacultureScene 
                  tanks={tanks}
                  pipes={pipes}
                  filters={filters}
                  selectedTank={selectedTank}
                  onSelectTank={setSelectedTank}
                />
              </Canvas>
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">System Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Tanks:</span>
                <span className="font-medium">{tanks.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Volume:</span>
                <span className="font-medium">
                  {tanks.reduce((sum, t) => sum + t.volume, 0).toFixed(0)} m³
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pipe Network:</span>
                <span className="font-medium">{pipes.length} segments</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Filter Units:</span>
                <span className="font-medium">{filters.length}</span>
              </div>
            </CardContent>
          </Card>

          {designMode === 'tanks' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tank Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={addTank} 
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tank
                </Button>
                {selectedTank && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label>Selected Tank</Label>
                    <Input value={selectedTank} disabled />
                    <Label>Species</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tilapia">Tilapia</SelectItem>
                        <SelectItem value="salmon">Salmon</SelectItem>
                        <SelectItem value="shrimp">Shrimp</SelectItem>
                        <SelectItem value="catfish">Catfish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {designMode === 'pipes' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Pipe Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label>Pipe Type</Label>
                <Select value={pipeType} onValueChange={(v) => setPipeType(v as Pipe['type'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supply">Supply Water (Blue)</SelectItem>
                    <SelectItem value="drain">Drain/Waste (Brown)</SelectItem>
                    <SelectItem value="aeration">Air Lines (Cyan)</SelectItem>
                    <SelectItem value="recirculation">Recirculation (Green)</SelectItem>
                    <SelectItem value="waste">Waste Discharge (Red)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="space-y-2">
                  <Label>Pipe Legend</Label>
                  {Object.entries(PIPE_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm capitalize">{type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {designMode === 'filters' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Filter Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button size="sm" variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Drum Filter
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Biofilter
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Protein Skimmer
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Degasser
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Flow Rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Flow</span>
                  <span className="font-medium">300 m³/hr</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Oxygen Injection</span>
                  <span className="font-medium">25 kg/hr</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}