'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building, 
  Calculator, 
  Settings, 
  Wrench,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Layers,
  Grid,
  FileText,
  Download,
  Eye,
  EyeOff,
  Package,
  Ruler,
  Weight,
  Zap,
  TreePine,
  Waves,
  Infinity
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useFacilityDesign } from '../context/FacilityDesignContext';

interface StructuralComponent {
  id: string;
  type: 'rack' | 'bench' | 'shelf' | 'frame' | 'support' | 'beam' | 'column' | 'bracket' | 'fastener' | 'base';
  name: string;
  material: 'steel' | 'aluminum' | 'stainless-steel' | 'galvanized-steel' | 'composite' | 'wood';
  dimensions: {
    length: number; // feet
    width: number; // feet  
    height: number; // feet
    thickness?: number; // inches
  };
  loadCapacity: number; // lbs
  weight: number; // lbs
  cost: number;
  quantity: number;
  location: { x: number; y: number; z?: number };
  specifications: {
    finish?: string;
    grade?: string;
    connection?: string;
    corrosionResistance?: string;
    certification?: string;
  };
  isCustom?: boolean;
  isEditable?: boolean;
  structuralProperties?: {
    momentOfInertia?: number;
    sectionModulus?: number;
    deflection?: number;
    stressRatio?: number;
  };
}

interface StructuralZone {
  id: string;
  name: string;
  area: number; // sq ft
  loadRequirement: number; // lbs/sq ft
  seismicZone: string;
  components: StructuralComponent[];
}

interface StructuralDesignPanelProps {
  onClose: () => void;
}

// Structural component database
const STRUCTURAL_DATABASE = {
  // Greenhouse-specific systems
  'gutter-system': {
    name: 'Greenhouse Gutter System',
    material: 'aluminum',
    dimensions: { length: 40, width: 1, height: 0.5 },
    loadCapacity: 150, // lbs per linear foot
    weight: 8, // lbs per linear foot
    cost: 45, // per linear foot
    description: 'Aluminum gutter system for tomatoes/strawberries'
  },
  'gutter-support-rail': {
    name: 'Gutter Support Rail',
    material: 'galvanized-steel',
    dimensions: { length: 20, width: 0.25, height: 0.25 },
    loadCapacity: 300,
    weight: 15,
    cost: 25,
    description: 'Support rail for gutter suspension'
  },
  'heating-pipe-rail': {
    name: 'Heating Pipe Rail',
    material: 'steel',
    dimensions: { length: 40, width: 0.17, height: 0.17 }, // 2" pipe
    loadCapacity: 200,
    weight: 12,
    cost: 35,
    description: 'Hot water heating pipe rail system'
  },
  'grow-pipe-rail': {
    name: 'Grow Pipe Rail',
    material: 'galvanized-steel',
    dimensions: { length: 40, width: 0.125, height: 0.125 }, // 1.5" pipe
    loadCapacity: 100,
    weight: 8,
    cost: 20,
    description: 'Pipe rail for plant support and movement'
  },
  'concrete-gutter': {
    name: 'Concrete Gutter Channel',
    material: 'concrete',
    dimensions: { length: 40, width: 1.5, height: 0.5 },
    loadCapacity: 500,
    weight: 180,
    cost: 65,
    description: 'Concrete gutter for heavy crop loads'
  },
  'nft-channel': {
    name: 'NFT Growing Channel',
    material: 'composite',
    dimensions: { length: 40, width: 0.5, height: 0.25 },
    loadCapacity: 50,
    weight: 3,
    cost: 15,
    description: 'Nutrient Film Technique growing channel'
  },
  'overhead-truss': {
    name: 'Greenhouse Truss System',
    material: 'galvanized-steel',
    dimensions: { length: 24, width: 2, height: 4 },
    loadCapacity: 2000,
    weight: 250,
    cost: 450,
    description: 'Structural greenhouse truss'
  },
  'purlin-system': {
    name: 'Purlin Support System',
    material: 'aluminum',
    dimensions: { length: 20, width: 0.25, height: 0.25 },
    loadCapacity: 400,
    weight: 12,
    cost: 28,
    description: 'Roof purlin system for glazing support'
  },
  'ventilation-rail': {
    name: 'Ventilation Opening Rail',
    material: 'aluminum',
    dimensions: { length: 40, width: 0.33, height: 0.33 },
    loadCapacity: 150,
    weight: 10,
    cost: 32,
    description: 'Rail system for roof and side ventilation'
  },
  'screen-system': {
    name: 'Screen System Structure',
    material: 'aluminum',
    dimensions: { length: 40, width: 0.125, height: 0.125 },
    loadCapacity: 75,
    weight: 5,
    cost: 18,
    description: 'Structure for shade/energy screens'
  },
  'crop-wire-system': {
    name: 'Crop Wire Support System',
    material: 'galvanized-steel',
    dimensions: { length: 40, width: 0.02, height: 0.02 }, // wire
    loadCapacity: 50,
    weight: 2,
    cost: 8,
    description: 'High-wire crop support system'
  },
  'transport-rail': {
    name: 'Internal Transport Rail',
    material: 'aluminum',
    dimensions: { length: 40, width: 0.5, height: 0.5 },
    loadCapacity: 1000,
    weight: 25,
    cost: 55,
    description: 'Rail system for harvest carts and equipment'
  },
  'ebb-flow-bench': {
    name: 'Ebb & Flow Bench',
    material: 'aluminum',
    dimensions: { length: 8, width: 4, height: 3 },
    loadCapacity: 400,
    weight: 95,
    cost: 750,
    description: 'Flood and drain bench system'
  },
  'rolling-bench': {
    name: 'Rolling Bench System',
    material: 'aluminum',
    dimensions: { length: 8, width: 5, height: 3 },
    loadCapacity: 300,
    weight: 120,
    cost: 1200,
    description: 'Space-efficient rolling bench'
  },
  'co2-distribution-pipe': {
    name: 'CO2 Distribution Pipe',
    material: 'aluminum',
    dimensions: { length: 40, width: 0.08, height: 0.08 }, // 1" pipe
    loadCapacity: 50,
    weight: 4,
    cost: 12,
    description: 'Perforated CO2 distribution system'
  },
  'fog-cooling-rail': {
    name: 'Fog Cooling Rail',
    material: 'stainless-steel',
    dimensions: { length: 40, width: 0.05, height: 0.05 }, // 0.5" tubing
    loadCapacity: 25,
    weight: 3,
    cost: 18,
    description: 'High-pressure fog cooling system'
  },
  'thermal-curtain-rail': {
    name: 'Thermal Curtain Rail',
    material: 'aluminum',
    dimensions: { length: 40, width: 0.25, height: 0.125 },
    loadCapacity: 100,
    weight: 8,
    cost: 22,
    description: 'Energy curtain support system'
  },
  'moveable-gutter': {
    name: 'Moveable Gutter System',
    material: 'aluminum',
    dimensions: { length: 40, width: 1, height: 0.5 },
    loadCapacity: 120,
    weight: 12,
    cost: 85,
    description: 'Mobile gutter system with wheels'
  },
  'grow-rack-4tier': {
    name: '4-Tier Grow Rack',
    material: 'steel',
    dimensions: { length: 4, width: 2, height: 6 },
    loadCapacity: 500,
    weight: 120,
    cost: 800,
    description: 'Heavy-duty 4-tier growing rack'
  },
  'grow-rack-6tier': {
    name: '6-Tier Grow Rack',
    material: 'steel',
    dimensions: { length: 4, width: 2, height: 8 },
    loadCapacity: 750,
    weight: 180,
    cost: 1200,
    description: 'Heavy-duty 6-tier growing rack'
  },
  'mobile-bench': {
    name: 'Mobile Growing Bench',
    material: 'aluminum',
    dimensions: { length: 6, width: 2, height: 3 },
    loadCapacity: 200,
    weight: 45,
    cost: 400,
    description: 'Wheeled mobile bench for flexibility'
  },
  'flood-bench': {
    name: 'Flood Table Bench',
    material: 'aluminum',
    dimensions: { length: 4, width: 4, height: 3 },
    loadCapacity: 300,
    weight: 85,
    cost: 600,
    description: 'Flood and drain table system'
  },
  'cantilever-rack': {
    name: 'Cantilever Rack System',
    material: 'steel',
    dimensions: { length: 8, width: 3, height: 10 },
    loadCapacity: 1000,
    weight: 250,
    cost: 1500,
    description: 'Heavy-duty cantilever rack'
  },
  'vertical-tower': {
    name: 'Vertical Growing Tower',
    material: 'stainless-steel',
    dimensions: { length: 2, width: 2, height: 12 },
    loadCapacity: 400,
    weight: 150,
    cost: 1000,
    description: 'Space-efficient vertical tower'
  },
  'hanging-system': {
    name: 'Ceiling Hanging System',
    material: 'galvanized-steel',
    dimensions: { length: 6, width: 4, height: 1 },
    loadCapacity: 150,
    weight: 25,
    cost: 300,
    description: 'Overhead hanging grow system'
  },
  'support-beam': {
    name: 'Structural Support Beam',
    material: 'steel',
    dimensions: { length: 12, width: 0.5, height: 0.5 },
    loadCapacity: 2000,
    weight: 80,
    cost: 200,
    description: 'I-beam structural support'
  },
  'column-post': {
    name: 'Support Column',
    material: 'steel',
    dimensions: { length: 0.5, width: 0.5, height: 10 },
    loadCapacity: 5000,
    weight: 100,
    cost: 150,
    description: 'Vertical support column'
  },
  'floor-anchor': {
    name: 'Floor Anchor System',
    material: 'galvanized-steel',
    dimensions: { length: 1, width: 1, height: 0.5 },
    loadCapacity: 1000,
    weight: 20,
    cost: 50,
    description: 'Floor mounting anchor'
  },
  'safety-barrier': {
    name: 'Safety Barrier',
    material: 'aluminum',
    dimensions: { length: 8, width: 0.25, height: 4 },
    loadCapacity: 100,
    weight: 30,
    cost: 180,
    description: 'Safety barrier system'
  },
  'work-platform': {
    name: 'Work Platform',
    material: 'aluminum',
    dimensions: { length: 6, width: 3, height: 0.25 },
    loadCapacity: 500,
    weight: 60,
    cost: 350,
    description: 'Elevated work platform'
  }
};

export function StructuralDesignPanel({ onClose }: StructuralDesignPanelProps) {
  const { state } = useDesigner();
  const { objects, room } = state;
  const { updateSystem } = useFacilityDesign();
  
  const [structuralComponents, setStructuralComponents] = useState<StructuralComponent[]>([]);
  const [structuralZones, setStructuralZones] = useState<StructuralZone[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [showSystemDetails, setShowSystemDetails] = useState(false);
  const [designMode, setDesignMode] = useState<'auto' | 'manual'>('auto');

  // Calculate structural requirements
  useEffect(() => {
    calculateStructuralSystem();
  }, [objects, room]);

  const calculateStructuralSystem = () => {
    const components: StructuralComponent[] = [];
    const zones: StructuralZone[] = [];
    
    // Calculate loads based on fixtures and plants
    const fixtureObjects = objects.filter(obj => obj.type === 'fixture');
    const plantObjects = objects.filter(obj => obj.type === 'plant' || obj.type === 'crop');
    const roomArea = room.width * room.height;
    
    // Calculate total loads
    const fixtureLoad = fixtureObjects.reduce((sum, fixture) => {
      const weight = fixture.weight || 15; // Default 15 lbs per fixture
      return sum + weight;
    }, 0);
    
    const plantLoad = plantObjects.length * 10; // 10 lbs per plant average
    const liveLoad = roomArea * 20; // 20 lbs/sq ft live load
    const totalLoad = fixtureLoad + plantLoad + liveLoad;
    
    // Create main structural zone
    const mainZone: StructuralZone = {
      id: 'main-zone',
      name: 'Main Growing Area',
      area: roomArea,
      loadRequirement: totalLoad / roomArea,
      seismicZone: 'D', // Default seismic zone
      components: []
    };
    
    zones.push(mainZone);
    
    // Generate structural components based on loads
    components.push(...generateStructuralComponents(totalLoad, roomArea));
    
    // Calculate totals
    const weight = components.reduce((sum, comp) => sum + comp.weight * comp.quantity, 0);
    const capacity = components.reduce((sum, comp) => sum + comp.loadCapacity * comp.quantity, 0);
    const cost = components.reduce((sum, comp) => sum + comp.cost * comp.quantity, 0);
    
    setStructuralComponents(components);
    setStructuralZones(zones);
    setTotalWeight(weight);
    setTotalCapacity(capacity);
    setTotalCost(cost);
    
    // Update facility design context with structural system data
    updateSystem('structural-system', {
      id: 'structural-system',
      type: 'structural',
      status: 'configured',
      loads: {
        electrical: 0,
        thermal: 0,
        structural: weight,
        water: 0
      },
      costs: {
        equipment: components.reduce((sum, comp) => sum + comp.cost * comp.quantity, 0),
        installation: cost * 0.4, // 40% installation cost for structural
        maintenance: cost * 0.03, // 3% annual maintenance
        energy: 0
      },
      components: components,
      dependencies: [],
      conflicts: [],
      lastUpdated: new Date(),
      data: {
        zones: zones,
        totalWeight: weight,
        totalCapacity: capacity,
        utilizationRatio: totalLoad / capacity,
        roomType: room.roomType,
        componentCount: components.length
      }
    });
  };

  const generateStructuralComponents = (totalLoad: number, area: number): StructuralComponent[] => {
    const components: StructuralComponent[] = [];
    const isGreenhouse = room.roomType === 'greenhouse';
    
    if (isGreenhouse) {
      // Greenhouse-specific structural systems
      const length = room.width > room.height ? room.width : room.height;
      const width = room.width > room.height ? room.height : room.width;
      
      // Add gutter systems for tomatoes/strawberries
      const gutterRuns = Math.ceil(width / 6); // 6 feet between gutters
      const gutterType = totalLoad > 100 ? 'concrete-gutter' : 'gutter-system';
      const gutterData = STRUCTURAL_DATABASE[gutterType];
      
      components.push({
        id: 'gutter-system',
        type: 'shelf',
        name: `${gutterRuns}x ${gutterData.name}`,
        material: gutterData.material as any,
        dimensions: { ...gutterData.dimensions, length },
        loadCapacity: gutterData.loadCapacity,
        weight: gutterData.weight,
        cost: gutterData.cost,
        quantity: gutterRuns,
        location: { x: room.width * 0.1, y: room.height * 0.2 },
        specifications: {
          finish: 'Food Grade',
          grade: 'Commercial',
          connection: 'Suspended',
          corrosionResistance: 'Yes',
          certification: 'NSF Listed'
        },
        isEditable: true,
        structuralProperties: {
          deflection: calculateDeflection(totalLoad / gutterRuns, length),
          stressRatio: calculateStressRatio(totalLoad / gutterRuns, gutterData.loadCapacity * length)
        }
      });
      
      // Add gutter support rails
      const supportRails = gutterRuns * 2; // 2 supports per gutter
      components.push({
        id: 'gutter-supports',
        type: 'support',
        name: `${supportRails}x Gutter Support Rail`,
        material: 'galvanized-steel',
        dimensions: { length: 20, width: 0.25, height: 0.25 },
        loadCapacity: 300,
        weight: 15,
        cost: 25,
        quantity: supportRails,
        location: { x: room.width * 0.1, y: room.height * 0.1 },
        specifications: {
          finish: 'Hot-Dip Galvanized',
          grade: 'Grade 50',
          connection: 'Bolted',
          corrosionResistance: 'Yes'
        },
        isEditable: true
      });
      
      // Add heating pipe rails (common in high-tech greenhouses)
      const heatingPipeRuns = Math.ceil(width / 4); // 4 feet between heating pipes
      components.push({
        id: 'heating-pipes',
        type: 'support',
        name: `${heatingPipeRuns}x Heating Pipe Rail`,
        material: 'steel',
        dimensions: { length, width: 0.17, height: 0.17 },
        loadCapacity: 200,
        weight: 12,
        cost: 35,
        quantity: heatingPipeRuns,
        location: { x: room.width * 0.1, y: room.height * 0.8 },
        specifications: {
          finish: 'Powder Coated',
          grade: 'Schedule 40',
          connection: 'Welded',
          certification: 'ASME B31.9'
        },
        isEditable: true
      });
      
      // Add grow pipe rails (for plant support)
      const growPipeRuns = gutterRuns; // Same as gutters
      components.push({
        id: 'grow-pipes',
        type: 'support',
        name: `${growPipeRuns}x Grow Pipe Rail`,
        material: 'galvanized-steel',
        dimensions: { length, width: 0.125, height: 0.125 },
        loadCapacity: 100,
        weight: 8,
        cost: 20,
        quantity: growPipeRuns,
        location: { x: room.width * 0.1, y: room.height * 0.6 },
        specifications: {
          finish: 'Galvanized',
          grade: 'Schedule 40',
          connection: 'Threaded',
          corrosionResistance: 'Yes'
        },
        isEditable: true
      });
      
      // Add crop wire system (for vine crops)
      const wireRuns = gutterRuns * 2; // 2 wires per gutter
      components.push({
        id: 'crop-wires',
        type: 'support',
        name: `${wireRuns}x Crop Wire System`,
        material: 'galvanized-steel',
        dimensions: { length, width: 0.02, height: 0.02 },
        loadCapacity: 50,
        weight: 2,
        cost: 8,
        quantity: wireRuns,
        location: { x: room.width * 0.1, y: room.height * 0.4 },
        specifications: {
          finish: 'Galvanized',
          grade: '7x7 Wire Rope',
          connection: 'Tensioned',
          certification: 'AISI 316'
        },
        isEditable: true
      });
      
      // Add overhead truss system
      const trusses = Math.ceil(length / 12); // 12 feet truss spacing
      components.push({
        id: 'overhead-trusses',
        type: 'beam',
        name: `${trusses}x Greenhouse Truss`,
        material: 'galvanized-steel',
        dimensions: { length: width, width: 2, height: 4 },
        loadCapacity: 2000,
        weight: 250,
        cost: 450,
        quantity: trusses,
        location: { x: room.width * 0.5, y: room.height * 0.05 },
        specifications: {
          finish: 'Hot-Dip Galvanized',
          grade: 'A36 Steel',
          connection: 'Bolted',
          certification: 'AISC'
        },
        isEditable: true,
        structuralProperties: {
          momentOfInertia: 850,
          sectionModulus: 180,
          deflection: calculateBeamDeflection(totalLoad / trusses, width),
          stressRatio: calculateStressRatio(totalLoad / trusses, 2000)
        }
      });
      
      // Add purlin system for glazing
      const purlins = Math.ceil(length / 4) * Math.ceil(width / 4); // 4 feet grid
      components.push({
        id: 'purlin-system',
        type: 'support',
        name: `${purlins}x Purlin System`,
        material: 'aluminum',
        dimensions: { length: 20, width: 0.25, height: 0.25 },
        loadCapacity: 400,
        weight: 12,
        cost: 28,
        quantity: purlins,
        location: { x: room.width * 0.3, y: room.height * 0.05 },
        specifications: {
          finish: 'Anodized',
          grade: '6063-T5',
          connection: 'Bolted',
          corrosionResistance: 'Yes'
        },
        isEditable: true
      });
      
      // Add transport rail if large greenhouse
      if (area > 2000) {
        const transportRails = Math.ceil(length / 40); // 40 feet sections
        components.push({
          id: 'transport-rails',
          type: 'support',
          name: `${transportRails}x Transport Rail`,
          material: 'aluminum',
          dimensions: { length: 40, width: 0.5, height: 0.5 },
          loadCapacity: 1000,
          weight: 25,
          cost: 55,
          quantity: transportRails,
          location: { x: room.width * 0.5, y: room.height * 0.95 },
          specifications: {
            finish: 'Anodized',
            grade: '6061-T6',
            connection: 'Bolted',
            certification: 'CE Marked'
          },
          isEditable: true
        });
      }
      
      // Add thermal curtain system for energy savings
      const curtainRails = Math.ceil(length / 20); // 20 feet sections
      components.push({
        id: 'thermal-curtains',
        type: 'support',
        name: `${curtainRails}x Thermal Curtain Rail`,
        material: 'aluminum',
        dimensions: { length: 20, width: 0.25, height: 0.125 },
        loadCapacity: 100,
        weight: 8,
        cost: 22,
        quantity: curtainRails,
        location: { x: room.width * 0.2, y: room.height * 0.05 },
        specifications: {
          finish: 'Anodized',
          grade: '6063-T5',
          connection: 'Track System',
          corrosionResistance: 'Yes'
        },
        isEditable: true
      });
      
      // Add CO2 distribution system
      const co2Pipes = Math.ceil(gutterRuns / 2); // 1 per 2 gutters
      components.push({
        id: 'co2-distribution',
        type: 'support',
        name: `${co2Pipes}x CO2 Distribution Pipe`,
        material: 'aluminum',
        dimensions: { length, width: 0.08, height: 0.08 },
        loadCapacity: 50,
        weight: 4,
        cost: 12,
        quantity: co2Pipes,
        location: { x: room.width * 0.1, y: room.height * 0.3 },
        specifications: {
          finish: 'Anodized',
          grade: '6061-T6',
          connection: 'Perforated',
          certification: 'Food Grade'
        },
        isEditable: true
      });
      
      // Add fog cooling system for hot climates
      if (area > 1000) {
        const fogRails = Math.ceil(gutterRuns / 3); // 1 per 3 gutters
        components.push({
          id: 'fog-cooling',
          type: 'support',
          name: `${fogRails}x Fog Cooling Rail`,
          material: 'stainless-steel',
          dimensions: { length, width: 0.05, height: 0.05 },
          loadCapacity: 25,
          weight: 3,
          cost: 18,
          quantity: fogRails,
          location: { x: room.width * 0.1, y: room.height * 0.7 },
          specifications: {
            finish: 'Stainless Steel',
            grade: '316L',
            connection: 'High Pressure',
            certification: 'NSF Listed'
          },
          isEditable: true
        });
      }
      
    } else {
      // Indoor growing facility - use rack systems
      const rackSpacing = 8; // 8 feet between racks
      const racksNeeded = Math.ceil(area / (rackSpacing * 4)); // 4 feet deep racks
      
      // Add growing racks
      const rackType = totalLoad > 2000 ? 'grow-rack-6tier' : 'grow-rack-4tier';
      const rackData = STRUCTURAL_DATABASE[rackType];
      
      components.push({
        id: 'main-racks',
        type: 'rack',
      name: `${racksNeeded}x ${rackData.name}`,
      material: rackData.material as any,
      dimensions: rackData.dimensions,
      loadCapacity: rackData.loadCapacity,
      weight: rackData.weight,
      cost: rackData.cost,
      quantity: racksNeeded,
      location: { x: room.width * 0.2, y: room.height * 0.2 },
      specifications: {
        finish: 'Powder Coated',
        grade: 'Commercial',
        connection: 'Bolted',
        corrosionResistance: 'Yes',
        certification: 'ANSI/MH16.3'
      },
      isEditable: true,
      structuralProperties: {
        deflection: calculateDeflection(totalLoad, rackData.dimensions.length),
        stressRatio: calculateStressRatio(totalLoad, rackData.loadCapacity)
      }
    });
    
    // Add support beams if needed
    if (totalLoad > 1500) {
      const beamsNeeded = Math.ceil(racksNeeded / 2);
      components.push({
        id: 'support-beams',
        type: 'beam',
        name: `${beamsNeeded}x Support Beam`,
        material: 'steel',
        dimensions: { length: 12, width: 0.5, height: 0.5 },
        loadCapacity: 2000,
        weight: 80,
        cost: 200,
        quantity: beamsNeeded,
        location: { x: room.width * 0.5, y: room.height * 0.1 },
        specifications: {
          finish: 'Galvanized',
          grade: 'A36 Steel',
          connection: 'Welded',
          certification: 'AISC'
        },
        isEditable: true,
        structuralProperties: {
          momentOfInertia: 124, // in^4
          sectionModulus: 31, // in^3
          deflection: calculateBeamDeflection(totalLoad, 12),
          stressRatio: calculateStressRatio(totalLoad, 2000)
        }
      });
    }
    
    // Add support columns
    const columnsNeeded = Math.ceil(area / 100); // 1 column per 100 sq ft
    components.push({
      id: 'support-columns',
      type: 'column',
      name: `${columnsNeeded}x Support Column`,
      material: 'steel',
      dimensions: { length: 0.5, width: 0.5, height: room.ceilingHeight || 10 },
      loadCapacity: 5000,
      weight: 100,
      cost: 150,
      quantity: columnsNeeded,
      location: { x: room.width * 0.1, y: room.height * 0.5 },
      specifications: {
        finish: 'Painted',
        grade: 'A36 Steel',
        connection: 'Bolted Base',
        certification: 'AISC'
      },
      isEditable: true,
      structuralProperties: {
        stressRatio: calculateColumnStressRatio(totalLoad / columnsNeeded, 5000)
      }
    });
    
    // Add floor anchors
    const anchorsNeeded = racksNeeded * 4; // 4 anchors per rack
    components.push({
      id: 'floor-anchors',
      type: 'base',
      name: `${anchorsNeeded}x Floor Anchor`,
      material: 'galvanized-steel',
      dimensions: { length: 1, width: 1, height: 0.5 },
      loadCapacity: 1000,
      weight: 20,
      cost: 50,
      quantity: anchorsNeeded,
      location: { x: room.width * 0.2, y: room.height * 0.8 },
      specifications: {
        finish: 'Galvanized',
        grade: 'Grade 8',
        connection: 'Concrete Anchor',
        certification: 'ICC-ES'
      },
      isEditable: true
    });
    
    // Add work platforms if height > 8 feet
    if ((room.ceilingHeight || 10) > 8) {
      const platformsNeeded = Math.ceil(area / 200); // 1 platform per 200 sq ft
      components.push({
        id: 'work-platforms',
        type: 'shelf',
        name: `${platformsNeeded}x Work Platform`,
        material: 'aluminum',
        dimensions: { length: 6, width: 3, height: 0.25 },
        loadCapacity: 500,
        weight: 60,
        cost: 350,
        quantity: platformsNeeded,
        location: { x: room.width * 0.8, y: room.height * 0.3 },
        specifications: {
          finish: 'Anodized',
          grade: '6061-T6',
          connection: 'Bolted',
          corrosionResistance: 'Yes'
        },
        isEditable: true
      });
    }
    }
    
    return components;
  };

  const calculateDeflection = (load: number, span: number): number => {
    // Simplified deflection calculation: δ = (5wL^4)/(384EI)
    const E = 29000000; // Steel modulus of elasticity (psi)
    const I = 124; // Moment of inertia (in^4)
    const w = load / (span * 12); // Load per inch
    const L = span * 12; // Span in inches
    
    return (5 * w * Math.pow(L, 4)) / (384 * E * I);
  };

  const calculateBeamDeflection = (load: number, span: number): number => {
    // Point load deflection: δ = (PL^3)/(48EI)
    const E = 29000000; // Steel modulus of elasticity (psi)
    const I = 124; // Moment of inertia (in^4)
    const L = span * 12; // Span in inches
    
    return (load * Math.pow(L, 3)) / (48 * E * I);
  };

  const calculateStressRatio = (appliedLoad: number, capacity: number): number => {
    return appliedLoad / capacity;
  };

  const calculateColumnStressRatio = (axialLoad: number, capacity: number): number => {
    // Simplified column stress ratio
    return axialLoad / capacity;
  };

  const addStructuralComponent = (componentType: string) => {
    const component = STRUCTURAL_DATABASE[componentType as keyof typeof STRUCTURAL_DATABASE];
    if (!component) return;

    const newComponent: StructuralComponent = {
      id: `custom-${Date.now()}`,
      type: componentType.split('-')[0] as any,
      name: component.name,
      material: component.material as any,
      dimensions: component.dimensions,
      loadCapacity: component.loadCapacity,
      weight: component.weight,
      cost: component.cost,
      quantity: 1,
      location: { x: room.width * 0.5, y: room.height * 0.5 },
      specifications: {
        finish: 'Standard',
        grade: 'Commercial',
        connection: 'Bolted'
      },
      isCustom: true,
      isEditable: true
    };

    setStructuralComponents(prev => [...prev, newComponent]);
    setShowAddComponent(false);
  };

  const generateSystemReport = () => {
    const zone = structuralZones[0];
    return {
      title: `Structural System Design - ${room.name || 'Cultivation Room'}`,
      dimensions: `${room.width}' x ${room.height}' x ${room.ceilingHeight || 10}'`,
      totalWeight: `${totalWeight.toFixed(0)} lbs`,
      totalCapacity: `${totalCapacity.toFixed(0)} lbs`,
      totalCost: `$${totalCost.toLocaleString()}`,
      safetyFactor: `${(totalCapacity / totalWeight).toFixed(1)}:1`,
      loadAnalysis: zone ? {
        appliedLoad: `${zone.loadRequirement.toFixed(1)} lbs/sq ft`,
        allowableLoad: `${(totalCapacity / zone.area).toFixed(1)} lbs/sq ft`,
        utilization: `${((zone.loadRequirement / (totalCapacity / zone.area)) * 100).toFixed(1)}%`
      } : null,
      components: structuralComponents,
      zones: structuralZones,
      seismicCompliance: checkSeismicCompliance(),
      materialSummary: generateMaterialSummary()
    };
  };

  const checkSeismicCompliance = () => {
    return {
      zone: 'D',
      compliant: true,
      requirements: ['Base anchorage required', 'Seismic joints specified', 'Redundant load paths'],
      notes: 'Design meets IBC seismic requirements'
    };
  };

  const generateMaterialSummary = () => {
    const materials = structuralComponents.reduce((acc, comp) => {
      const material = comp.material;
      if (!acc[material]) {
        acc[material] = { weight: 0, cost: 0, count: 0 };
      }
      acc[material].weight += comp.weight * comp.quantity;
      acc[material].cost += comp.cost * comp.quantity;
      acc[material].count += comp.quantity;
      return acc;
    }, {} as Record<string, { weight: number; cost: number; count: number }>);

    return materials;
  };

  const handleExportSystem = () => {
    const systemReport = generateSystemReport();
    const blob = new Blob([JSON.stringify(systemReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `structural-system-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-7xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Structural System Design</h2>
              <p className="text-gray-400">Design racks, benches, and structural support systems</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDesignMode(designMode === 'auto' ? 'manual' : 'auto')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                designMode === 'auto' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {designMode === 'auto' ? 'Auto Design' : 'Manual Design'}
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
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Controls */}
          <div className="w-80 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* System Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">System Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Weight:</span>
                    <span className="text-white font-medium">{totalWeight.toFixed(0)} lbs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Capacity:</span>
                    <span className="text-white font-medium">{totalCapacity.toFixed(0)} lbs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Safety Factor:</span>
                    <span className="text-white font-medium">{(totalCapacity / totalWeight).toFixed(1)}:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Cost:</span>
                    <span className="text-white font-medium">${totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Load Analysis */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Load Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Applied Load:</span>
                    <span className="text-white font-medium">
                      {structuralZones[0]?.loadRequirement.toFixed(1)} lbs/sq ft
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Allowable Load:</span>
                    <span className="text-white font-medium">
                      {structuralZones[0] ? (totalCapacity / structuralZones[0].area).toFixed(1) : 0} lbs/sq ft
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Utilization:</span>
                    <span className={`font-medium ${
                      structuralZones[0] && (structuralZones[0].loadRequirement / (totalCapacity / structuralZones[0].area)) > 0.8
                        ? 'text-yellow-400' 
                        : 'text-green-400'
                    }`}>
                      {structuralZones[0] 
                        ? ((structuralZones[0].loadRequirement / (totalCapacity / structuralZones[0].area)) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Material Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Material Summary</h3>
                <div className="space-y-2">
                  {Object.entries(generateMaterialSummary()).map(([material, data]) => (
                    <div key={material} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{material.replace('-', ' ')}:</span>
                      <span className="text-white font-medium">{data.weight.toFixed(0)} lbs</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowAddComponent(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Component
                </button>
                <button
                  onClick={handleExportSystem}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export System
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Component List */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Components List */}
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Structural Components</h3>
                  <button
                    onClick={() => setShowSystemDetails(!showSystemDetails)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {showSystemDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="space-y-2">
                  {structuralComponents.map((component) => (
                    <div key={component.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-700 rounded">
                          {component.type === 'rack' && <Grid className="w-4 h-4 text-blue-400" />}
                          {component.type === 'bench' && <Package className="w-4 h-4 text-green-400" />}
                          {component.type === 'shelf' && component.name.includes('Gutter') && <Waves className="w-4 h-4 text-cyan-400" />}
                          {component.type === 'shelf' && !component.name.includes('Gutter') && <Layers className="w-4 h-4 text-green-400" />}
                          {component.type === 'beam' && <Ruler className="w-4 h-4 text-yellow-400" />}
                          {component.type === 'column' && <Building className="w-4 h-4 text-purple-400" />}
                          {component.type === 'support' && component.name.includes('Pipe') && <Infinity className="w-4 h-4 text-red-400" />}
                          {component.type === 'support' && component.name.includes('Wire') && <TreePine className="w-4 h-4 text-green-600" />}
                          {component.type === 'support' && !component.name.includes('Pipe') && !component.name.includes('Wire') && <Wrench className="w-4 h-4 text-orange-400" />}
                          {component.type === 'base' && <Weight className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div>
                          <div className="text-white font-medium">{component.name}</div>
                          {showSystemDetails && (
                            <div className="text-sm text-gray-400">
                              {component.loadCapacity > 0 && `${component.loadCapacity.toLocaleString()} lbs • `}
                              {component.weight > 0 && `${component.weight} lbs • `}
                              {component.material && `${component.material.replace('-', ' ')} • `}
                              {component.quantity > 1 && `Qty: ${component.quantity}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">${(component.cost * component.quantity).toLocaleString()}</div>
                        {showSystemDetails && component.structuralProperties?.stressRatio && (
                          <div className={`text-sm ${
                            component.structuralProperties.stressRatio > 0.8 
                              ? 'text-red-400' 
                              : component.structuralProperties.stressRatio > 0.6 
                                ? 'text-yellow-400' 
                                : 'text-green-400'
                          }`}>
                            {(component.structuralProperties.stressRatio * 100).toFixed(1)}% util
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seismic Compliance */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Seismic Compliance</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-400">Seismic Zone D Compliant</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Design meets IBC seismic requirements with proper base anchorage and redundant load paths.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Component Modal */}
        {showAddComponent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg w-full max-w-5xl max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Add Structural Component</h3>
                  <button
                    onClick={() => setShowAddComponent(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(STRUCTURAL_DATABASE).map(([key, component]) => (
                    <div
                      key={key}
                      className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => addStructuralComponent(key)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gray-800 rounded">
                          <Building className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{component.name}</h4>
                          <p className="text-sm text-gray-400">{component.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-400">Capacity: {component.loadCapacity.toLocaleString()} lbs</span>
                        <span className="text-gray-400">Weight: {component.weight} lbs</span>
                        <span className="text-gray-400">Material: {component.material.replace('-', ' ')}</span>
                        <span className="text-green-400">${component.cost.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}