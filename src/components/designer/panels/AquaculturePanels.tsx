'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Fish, 
  Droplets, 
  GitBranch,
  Filter,
  Wind,
  Gauge,
  Plus,
  Settings,
  AlertCircle,
  Calculator,
  Layers
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import type { Point3D } from '@/lib/aquaculture/piping-system';

interface TankObject {
  id: string;
  type: 'tank';
  shape: 'circular' | 'rectangular' | 'raceway';
  position: Point3D;
  dimensions: {
    diameter?: number;
    length?: number;
    width?: number;
    height: number;
  };
  volume: number;
  species?: string;
  stockingDensity?: number;
}

interface PipeObject {
  id: string;
  type: 'pipe';
  pipeType: 'supply' | 'drain' | 'aeration' | 'recirculation' | 'waste';
  points: Point3D[];
  diameter: number;
  material: 'PVC' | 'HDPE' | 'SS316';
  flowRate?: number;
}

interface FilterObject {
  id: string;
  type: 'filter';
  filterType: 'drum' | 'biofilter' | 'protein-skimmer' | 'degasser' | 'oxygen-cone';
  position: Point3D;
  dimensions: Point3D;
  capacity: number;
}

export function AquacultureTankPanel() {
  const { dispatch, state } = useDesigner();
  const [tankShape, setTankShape] = useState<'circular' | 'rectangular' | 'raceway'>('circular');
  const [tankDimensions, setTankDimensions] = useState({
    diameter: 4,
    length: 6,
    width: 4,
    height: 1.5
  });
  const [species, setSpecies] = useState('tilapia');
  const [stockingDensity, setStockingDensity] = useState(30);

  const addTank = () => {
    const volume = tankShape === 'circular' 
      ? Math.PI * Math.pow(tankDimensions.diameter / 2, 2) * tankDimensions.height
      : tankDimensions.length * tankDimensions.width * tankDimensions.height;

    const newTank: TankObject = {
      id: `tank-${Date.now()}`,
      type: 'tank',
      shape: tankShape,
      position: { x: 0, y: 0, z: 0 },
      dimensions: tankShape === 'circular' 
        ? { diameter: tankDimensions.diameter, height: tankDimensions.height }
        : { 
            length: tankDimensions.length, 
            width: tankDimensions.width, 
            height: tankDimensions.height 
          },
      volume,
      species,
      stockingDensity
    };

    // Add to designer state (would need to extend the designer context to handle aquaculture objects)
    dispatch({ type: 'ADD_OBJECT', payload: newTank as any });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Fish className="h-5 w-5" />
          Tank Design
        </CardTitle>
        <CardDescription>Add and configure fish tanks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tank Shape</Label>
          <Select value={tankShape} onValueChange={(v: any) => setTankShape(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="circular">Circular Tank</SelectItem>
              <SelectItem value="rectangular">Rectangular Tank</SelectItem>
              <SelectItem value="raceway">Raceway System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {tankShape === 'circular' ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Diameter (m)</Label>
              <Input
                type="number"
                value={tankDimensions.diameter}
                onChange={(e) => setTankDimensions(prev => ({ ...prev, diameter: parseFloat(e.target.value) }))}
                step="0.5"
              />
            </div>
            <div className="space-y-2">
              <Label>Height (m)</Label>
              <Input
                type="number"
                value={tankDimensions.height}
                onChange={(e) => setTankDimensions(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                step="0.1"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Length (m)</Label>
              <Input
                type="number"
                value={tankDimensions.length}
                onChange={(e) => setTankDimensions(prev => ({ ...prev, length: parseFloat(e.target.value) }))}
                step="0.5"
              />
            </div>
            <div className="space-y-2">
              <Label>Width (m)</Label>
              <Input
                type="number"
                value={tankDimensions.width}
                onChange={(e) => setTankDimensions(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                step="0.5"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Height (m)</Label>
              <Input
                type="number"
                value={tankDimensions.height}
                onChange={(e) => setTankDimensions(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                step="0.1"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Species</Label>
          <Select value={species} onValueChange={setSpecies}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tilapia">Tilapia</SelectItem>
              <SelectItem value="salmon">Salmon</SelectItem>
              <SelectItem value="trout">Rainbow Trout</SelectItem>
              <SelectItem value="catfish">Catfish</SelectItem>
              <SelectItem value="shrimp">Shrimp</SelectItem>
              <SelectItem value="barramundi">Barramundi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Stocking Density</Label>
            <span className="text-sm text-muted-foreground">{stockingDensity} kg/m³</span>
          </div>
          <Slider
            value={[stockingDensity]}
            onValueChange={([v]) => setStockingDensity(v)}
            min={10}
            max={100}
            step={5}
          />
        </div>

        <div className="bg-muted rounded-lg p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Volume:</span>
            <span className="font-medium">
              {(tankShape === 'circular' 
                ? Math.PI * Math.pow(tankDimensions.diameter / 2, 2) * tankDimensions.height
                : tankDimensions.length * tankDimensions.width * tankDimensions.height
              ).toFixed(1)} m³
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Biomass:</span>
            <span className="font-medium">
              {(stockingDensity * (tankShape === 'circular' 
                ? Math.PI * Math.pow(tankDimensions.diameter / 2, 2) * tankDimensions.height
                : tankDimensions.length * tankDimensions.width * tankDimensions.height
              )).toFixed(0)} kg
            </span>
          </div>
        </div>

        <Button onClick={addTank} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Tank
        </Button>
      </CardContent>
    </Card>
  );
}

export function AquaculturePipingPanel() {
  const { dispatch } = useDesigner();
  const [pipeType, setPipeType] = useState<PipeObject['pipeType']>('supply');
  const [pipeMaterial, setPipeMaterial] = useState<'PVC' | 'HDPE' | 'SS316'>('PVC');
  const [autoPiping, setAutoPiping] = useState(false);

  const PIPE_COLORS = {
    supply: '#2196F3',
    drain: '#795548',
    aeration: '#00BCD4',
    recirculation: '#4CAF50',
    waste: '#F44336'
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Piping System
        </CardTitle>
        <CardDescription>Design water circulation network</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Pipe Type</Label>
          <Select value={pipeType} onValueChange={(v: any) => setPipeType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supply">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIPE_COLORS.supply }} />
                  Supply Water
                </div>
              </SelectItem>
              <SelectItem value="drain">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIPE_COLORS.drain }} />
                  Drain/Waste
                </div>
              </SelectItem>
              <SelectItem value="aeration">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIPE_COLORS.aeration }} />
                  Air Lines
                </div>
              </SelectItem>
              <SelectItem value="recirculation">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIPE_COLORS.recirculation }} />
                  Recirculation
                </div>
              </SelectItem>
              <SelectItem value="waste">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIPE_COLORS.waste }} />
                  Waste Discharge
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Pipe Material</Label>
          <Select value={pipeMaterial} onValueChange={(v: any) => setPipeMaterial(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PVC">PVC - Standard</SelectItem>
              <SelectItem value="HDPE">HDPE - Flexible</SelectItem>
              <SelectItem value="SS316">Stainless Steel 316</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-piping">Auto-Route Piping</Label>
            <input
              id="auto-piping"
              type="checkbox"
              checked={autoPiping}
              onChange={(e) => setAutoPiping(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Automatically calculate optimal pipe routes between tanks and equipment
          </p>
        </div>

        <Button className="w-full" variant="outline">
          <Calculator className="h-4 w-4 mr-2" />
          Calculate Pipe Sizes
        </Button>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Drawing Mode</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline">Click Points</Button>
            <Button size="sm" variant="outline">Drag Path</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AquacultureEquipmentPanel() {
  const { dispatch } = useDesigner();
  const [activeTab, setActiveTab] = useState('filters');

  const addEquipment = (type: FilterObject['filterType']) => {
    const newFilter: FilterObject = {
      id: `filter-${Date.now()}`,
      type: 'filter',
      filterType: type,
      position: { x: 0, y: 0, z: 0 },
      dimensions: { x: 2, y: 2, z: 3 },
      capacity: 1000
    };

    dispatch({ type: 'ADD_OBJECT', payload: newFilter as any });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Water Treatment Equipment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="aeration">Aeration</TabsTrigger>
            <TabsTrigger value="pumps">Pumps</TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-2 mt-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => addEquipment('drum')}
            >
              <div className="w-8 h-8 bg-gray-100 rounded mr-3 flex items-center justify-center text-xl">
                🥁
              </div>
              <div className="text-left">
                <div className="font-medium">Drum Filter</div>
                <div className="text-xs text-muted-foreground">Mechanical filtration</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => addEquipment('biofilter')}
            >
              <div className="w-8 h-8 bg-gray-100 rounded mr-3 flex items-center justify-center text-xl">
                🦠
              </div>
              <div className="text-left">
                <div className="font-medium">Biofilter</div>
                <div className="text-xs text-muted-foreground">Biological filtration</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => addEquipment('protein-skimmer')}
            >
              <div className="w-8 h-8 bg-gray-100 rounded mr-3 flex items-center justify-center text-xl">
                🌊
              </div>
              <div className="text-left">
                <div className="font-medium">Protein Skimmer</div>
                <div className="text-xs text-muted-foreground">Marine systems</div>
              </div>
            </Button>
          </TabsContent>

          <TabsContent value="aeration" className="space-y-2 mt-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => addEquipment('degasser')}
            >
              <div className="w-8 h-8 bg-gray-100 rounded mr-3 flex items-center justify-center text-xl">
                💨
              </div>
              <div className="text-left">
                <div className="font-medium">Degasser</div>
                <div className="text-xs text-muted-foreground">CO₂ removal</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => addEquipment('oxygen-cone')}
            >
              <div className="w-8 h-8 bg-gray-100 rounded mr-3 flex items-center justify-center text-xl">
                ⭕
              </div>
              <div className="text-left">
                <div className="font-medium">Oxygen Cone</div>
                <div className="text-xs text-muted-foreground">O₂ injection</div>
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Wind className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">Air Blower</div>
                <div className="text-xs text-muted-foreground">Aeration system</div>
              </div>
            </Button>
          </TabsContent>

          <TabsContent value="pumps" className="space-y-2 mt-4">
            <Button variant="outline" className="w-full justify-start">
              <Gauge className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">Centrifugal Pump</div>
                <div className="text-xs text-muted-foreground">Main circulation</div>
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Gauge className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">Airlift Pump</div>
                <div className="text-xs text-muted-foreground">Low head applications</div>
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">Peristaltic Pump</div>
                <div className="text-xs text-muted-foreground">Chemical dosing</div>
              </div>
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function AquacultureSystemAnalysis() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          System Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total System Volume</span>
            <Badge variant="outline">201.2 m³</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Biomass Capacity</span>
            <Badge variant="outline">6,036 kg</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Required Flow Rate</span>
            <Badge variant="outline">300 m³/hr</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Oxygen Demand</span>
            <Badge variant="outline">25 kg/day</Badge>
          </div>
        </div>

        <div className="pt-3 border-t space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            System Warnings
          </h4>
          <div className="space-y-1">
            <p className="text-xs text-yellow-600">
              • Biofilter undersized for current biomass
            </p>
            <p className="text-xs text-yellow-600">
              • Add backup pump for redundancy
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline">
            <Calculator className="h-4 w-4 mr-1" />
            Full Analysis
          </Button>
          <Button size="sm" variant="outline">
            <Layers className="h-4 w-4 mr-1" />
            Export BOM
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}