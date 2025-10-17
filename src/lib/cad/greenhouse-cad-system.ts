/**
 * Greenhouse CAD System
 * Comprehensive 3D modeling, material specification, and BOM generation
 */

import { prisma } from '../prisma';
import { redis } from '../redis';
import { EventEmitter } from 'events';
import * as THREE from 'three';
import { BufferGeometry, Vector3, Matrix4 } from 'three';
import { GeometryEngine } from './3d-geometry-engine';
export * from './types';

export type StructureType = 'gutter_connected' | 'freestanding' | 'lean_to' | 'multi_span' | 'gothic' | 'quonset';
export type FrameMaterial = 'galvanized_steel' | 'aluminum' | 'wood' | 'composite';
export type GlazingType = 'polycarbonate' | 'tempered_glass' | 'acrylic' | 'polyethylene_film';
export type FoundationType = 'concrete_slab' | 'concrete_footings' | 'gravel_pad' | 'permanent_foundation';
export type VentilationType = 'roof_vents' | 'side_vents' | 'exhaust_fans' | 'natural_ventilation';
export type ComponentType = 'structural' | 'glazing' | 'ventilation' | 'electrical' | 'plumbing' | 'hvac' | 'automation';
export type MaterialCategory = 'metal' | 'glass' | 'plastic' | 'concrete' | 'wood' | 'composite' | 'hardware' | 'sealant';
export type UnitType = 'linear_feet' | 'square_feet' | 'cubic_feet' | 'each' | 'pound' | 'gallon' | 'square_meter' | 'cubic_meter';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface GreenhouseParameters {
  id: string;
  name: string;
  
  // Basic Dimensions
  dimensions: {
    length: number; // feet
    width: number; // feet
    height: number; // feet
    baySpacing: number; // feet
    gutterHeight: number; // feet
  };
  
  // Structure Configuration
  structure: {
    type: StructureType;
    frameType: FrameMaterial;
    foundationType: FoundationType;
    roofPitch: number; // degrees
    endwallHeight: number; // feet
  };
  
  // Glazing Configuration
  glazing: {
    roofType: GlazingType;
    sidewallType: GlazingType;
    endwallType: GlazingType;
    thickness: number; // mm
    uValue: number; // thermal transmittance
    lightTransmission: number; // percentage
  };
  
  // Ventilation Configuration
  ventilation: {
    roofVents: {
      enabled: boolean;
      spacing: number; // feet
      size: { width: number; length: number };
    };
    sideVents: {
      enabled: boolean;
      height: number; // feet
      coverage: number; // percentage
    };
    exhaustFans: {
      enabled: boolean;
      count: number;
      cfm: number;
    };
  };
  
  // Environmental Systems
  systems: {
    heating: {
      type: 'radiant' | 'forced_air' | 'hydronic' | 'none';
      capacity: number; // BTU/hr
    };
    cooling: {
      type: 'evaporative' | 'refrigerated' | 'natural' | 'none';
      capacity: number; // BTU/hr
    };
    irrigation: {
      type: 'overhead' | 'drip' | 'flood_floor' | 'none';
      zones: number;
    };
  };
  
  // Location and Environment
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
    climate_zone: string;
    wind_load: number; // psf
    snow_load: number; // psf
  };
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface Material {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  category: MaterialCategory;
  
  // Physical Properties
  properties: {
    thermal: {
      uValue?: number; // BTU/hr-ft²-°F
      rValue?: number; // hr-ft²-°F/BTU
      thermalExpansion?: number; // in/in/°F
    };
    structural: {
      tensileStrength?: number; // psi
      compressiveStrength?: number; // psi
      elasticModulus?: number; // psi
      density?: number; // lb/ft³
    };
    optical: {
      lightTransmission?: number; // percentage
      solarHeatGain?: number; // coefficient
      uvTransmission?: number; // percentage
    };
    environmental: {
      weatherResistance?: number; // years
      fireRating?: string;
      recycledContent?: number; // percentage
    };
  };
  
  // Specifications
  specifications: {
    dimensions: {
      length?: number;
      width?: number;
      thickness?: number;
      diameter?: number;
    };
    finish: string;
    color: string;
    warranty: number; // years
  };
  
  // Availability
  availability: {
    regions: string[];
    leadTime: number; // days
    minimumOrder: number;
    priceBreaks: Array<{
      quantity: number;
      unit: UnitType;
      price: number;
    }>;
  };
  
  // Suppliers
  suppliers: Array<{
    name: string;
    contact: string;
    website: string;
    certifications: string[];
  }>;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface Component {
  id: string;
  name: string;
  type: ComponentType;
  category: string;
  
  // Geometry
  geometry: {
    type: 'box' | 'cylinder' | 'plane' | 'custom';
    dimensions: {
      length: number;
      width: number;
      height: number;
      radius?: number;
    };
    position: Point3D;
    rotation: Point3D;
  };
  
  // Material Assignment
  materialId: string;
  material?: Material;
  
  // Properties
  properties: {
    quantity: number;
    unit: UnitType;
    weight: number; // lbs
    cost: number; // USD
  };
  
  // Connections
  connections: Array<{
    componentId: string;
    connectionType: 'bolt' | 'weld' | 'screw' | 'clip' | 'adhesive';
    hardware: string[];
  }>;
  
  // Assembly Information
  assembly: {
    sequence: number;
    prerequisites: string[];
    tools: string[];
    laborHours: number;
    skillLevel: 'basic' | 'intermediate' | 'advanced';
    instructions: string;
  };
  
  // Layer Assignment
  layer: string;
  subLayer?: string;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface GreenhouseModel {
  id: string;
  name: string;
  parameters: GreenhouseParameters;
  
  // Components by Category
  structure: {
    foundation: Component[];
    frame: Component[];
    glazing: Component[];
    doors: Component[];
    hardware: Component[];
  };
  
  systems: {
    ventilation: Component[];
    electrical: Component[];
    plumbing: Component[];
    hvac: Component[];
    automation: Component[];
  };
  
  // 3D Geometry
  geometry: {
    vertices: Point3D[];
    faces: number[][];
    normals: Point3D[];
    boundingBox: {
      min: Point3D;
      max: Point3D;
    };
  };
  
  // Layers
  layers: {
    name: string;
    components: string[];
    visible: boolean;
    color: string;
    lineWeight: number;
  }[];
  
  // Bill of Materials
  bom: BillOfMaterials;
  
  // Drawings
  drawings: TechnicalDrawing[];
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface BillOfMaterials {
  id: string;
  greenhouseId: string;
  
  // Summary
  summary: {
    totalComponents: number;
    totalWeight: number;
    totalCost: number;
    totalLaborHours: number;
  };
  
  // Categories
  categories: Array<{
    name: string;
    components: number;
    weight: number;
    cost: number;
    percentage: number;
  }>;
  
  // Line Items
  lineItems: Array<{
    id: string;
    componentId: string;
    itemNumber: string;
    description: string;
    materialId: string;
    quantity: number;
    unit: UnitType;
    unitCost: number;
    totalCost: number;
    weight: number;
    supplier: string;
    leadTime: number;
    notes?: string;
  }>;
  
  // Assembly Sequences
  assemblies: Array<{
    name: string;
    sequence: number;
    components: string[];
    laborHours: number;
    tools: string[];
    materials: string[];
  }>;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface TechnicalDrawing {
  id: string;
  type: 'plan' | 'elevation' | 'section' | 'detail' | 'isometric' | '3d';
  name: string;
  description: string;
  
  // Drawing Properties
  scale: number;
  units: 'feet' | 'meters' | 'inches';
  paperSize: 'A4' | 'A3' | 'A2' | 'A1' | 'A0' | 'ANSI_A' | 'ANSI_B' | 'ANSI_C' | 'ANSI_D';
  
  // Geometry
  elements: Array<{
    type: 'line' | 'arc' | 'circle' | 'text' | 'dimension' | 'hatch';
    geometry: any;
    layer: string;
    style: {
      color: string;
      lineWeight: number;
      lineType: 'solid' | 'dashed' | 'dotted';
    };
  }>;
  
  // Annotations
  dimensions: Array<{
    type: 'linear' | 'angular' | 'radial';
    points: Point3D[];
    value: number;
    unit: string;
    text: string;
  }>;
  
  notes: Array<{
    position: Point3D;
    text: string;
    fontSize: number;
    leader: boolean;
  }>;
  
  // Export Data
  exportData: {
    svg?: string;
    dxf?: string;
    pdf?: Buffer;
  };
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

class GreenhouseCADSystem extends EventEmitter {
  private scene: THREE.Scene;
  private geometryEngine: GeometryEngine;
  private materials: Map<string, Material> = new Map();
  private components: Map<string, Component> = new Map();
  private models: Map<string, GreenhouseModel> = new Map();

  constructor() {
    super();
    this.scene = new THREE.Scene();
    this.geometryEngine = new GeometryEngine(this.scene);
    this.initializeSystem();
  }

  /**
   * Initialize the CAD system
   */
  private async initializeSystem(): Promise<void> {
    try {
      await this.loadMaterialDatabase();
      await this.loadComponentLibrary();
      logger.info('api', 'Greenhouse CAD System initialized');
    } catch (error) {
      logger.error('api', 'Failed to initialize CAD system:', error );
    }
  }

  /**
   * Create a new greenhouse model
   */
  async createGreenhouseModel(
    parameters: Omit<GreenhouseParameters, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<GreenhouseModel> {
    try {
      const greenhouseParams: GreenhouseParameters = {
        id: this.generateId('gh'),
        ...parameters,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Generate 3D model
      const model = await this.generateGreenhouseGeometry(greenhouseParams);
      
      // Generate components
      await this.generateComponents(model);
      
      // Generate BOM
      model.bom = await this.generateBOM(model);
      
      // Generate drawings
      model.drawings = await this.generateTechnicalDrawings(model);
      
      this.models.set(model.id, model);
      await this.saveModel(model);
      
      this.emit('model-created', model);
      logger.info('api', `Created greenhouse model: ${model.name}`);
      
      return model;
    } catch (error) {
      logger.error('api', 'Failed to create greenhouse model:', error );
      throw error;
    }
  }

  /**
   * Generate 3D geometry for greenhouse
   */
  private async generateGreenhouseGeometry(
    parameters: GreenhouseParameters
  ): Promise<GreenhouseModel> {
    const { dimensions, structure } = parameters;
    
    const model: GreenhouseModel = {
      id: parameters.id,
      name: parameters.name,
      parameters,
      structure: {
        foundation: [],
        frame: [],
        glazing: [],
        doors: [],
        hardware: []
      },
      systems: {
        ventilation: [],
        electrical: [],
        plumbing: [],
        hvac: [],
        automation: []
      },
      geometry: {
        vertices: [],
        faces: [],
        normals: [],
        boundingBox: {
          min: { x: 0, y: 0, z: 0 },
          max: { x: dimensions.length, y: dimensions.width, z: dimensions.height }
        }
      },
      layers: [],
      bom: {} as BillOfMaterials,
      drawings: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Generate geometry based on structure type
    switch (structure.type) {
      case 'gutter_connected':
        await this.generateGutterConnectedGeometry(model);
        break;
      case 'freestanding':
        await this.generateFreestandingGeometry(model);
        break;
      case 'gothic':
        await this.generateGothicGeometry(model);
        break;
      case 'multi_span':
        await this.generateMultiSpanGeometry(model);
        break;
      case 'lean_to':
        await this.generateLeanToGeometry(model);
        break;
      case 'quonset':
        await this.generateQuonsetGeometry(model);
        break;
      default:
        throw new Error(`Unsupported structure type: ${structure.type}`);
    }

    // Generate foundation
    await this.generateFoundation(model);
    
    // Generate frame system
    await this.generateFrameSystem(model);
    
    // Generate glazing system  
    await this.generateGlazingSystem(model);
    
    // Generate doors
    await this.generateDoors(model);
    
    // Generate systems
    await this.generateSystems(model);
    
    // Calculate final geometry
    await this.calculateGeometry(model);
    
    return model;
  }

  /**
   * Generate gutter-connected greenhouse geometry
   */
  private async generateGutterConnectedGeometry(model: GreenhouseModel): Promise<void> {
    const { dimensions, structure, glazing } = model.parameters;
    const { length, width, height, baySpacing, gutterHeight } = dimensions;
    
    // Calculate number of bays
    const numBays = Math.floor(length / baySpacing);
    
    // Generate main frame posts
    for (let i = 0; i <= numBays; i++) {
      const x = i * baySpacing;
      
      // Left side posts
      const leftPost = this.geometryEngine.createFramePost({
        position: { x, y: 0, z: 0 },
        height: gutterHeight,
        profile: '4x4x0.125',
        material: structure.frameType
      });
      
      const leftPostComponent = await this.createComponentFromMesh(leftPost, 'frame_post', model.id);
      model.structure.frame.push(leftPostComponent);
      this.scene.add(leftPost);
      
      // Right side posts
      const rightPost = this.geometryEngine.createFramePost({
        position: { x, y: width, z: 0 },
        height: gutterHeight,
        profile: '4x4x0.125',
        material: structure.frameType
      });
      
      const rightPostComponent = await this.createComponentFromMesh(rightPost, 'frame_post', model.id);
      model.structure.frame.push(rightPostComponent);
      this.scene.add(rightPost);
    }
    
    // Generate roof structure
    await this.generateRoofStructure(model, numBays);
    
    // Generate side walls
    await this.generateSideWalls(model, numBays);
    
    // Generate end walls
    await this.generateEndWalls(model);
  }

  /**
   * Generate other greenhouse types
   */
  private async generateFreestandingGeometry(model: GreenhouseModel): Promise<void> {
    // Similar to gutter-connected but with different frame configuration
    await this.generateGutterConnectedGeometry(model);
  }

  private async generateGothicGeometry(model: GreenhouseModel): Promise<void> {
    const { dimensions, structure } = model.parameters;
    const { length, width, height, baySpacing } = dimensions;
    
    // Generate arched roof structure
    const numBays = Math.floor(length / baySpacing);
    const archRadius = width / 2;
    
    for (let i = 0; i <= numBays; i++) {
      const x = i * baySpacing;
      
      // Generate arch ribs
      const ribPoints: Point3D[] = [];
      const segments = 16;
      
      for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * Math.PI;
        const y = archRadius * Math.cos(angle) + width / 2;
        const z = archRadius * Math.sin(angle);
        ribPoints.push({ x, y, z });
      }
      
      // Create arch rib structure
      for (let j = 0; j < ribPoints.length - 1; j++) {
        const purlin = this.geometryEngine.createPurlin({
          start: ribPoints[j],
          end: ribPoints[j + 1],
          profile: '2x4x0.125',
          material: structure.frameType
        });
        
        const purlinComponent = await this.createComponentFromMesh(purlin, 'arch_rib', model.id);
        model.structure.frame.push(purlinComponent);
        this.scene.add(purlin);
      }
    }
  }

  private async generateMultiSpanGeometry(model: GreenhouseModel): Promise<void> {
    const { dimensions, structure } = model.parameters;
    const { length, width, height, baySpacing } = dimensions;
    
    // Generate multiple spans
    const spanWidth = width / 2; // Two spans for example
    const spans = 2;
    
    for (let span = 0; span < spans; span++) {
      const spanOffset = span * spanWidth;
      
      // Create a sub-model for each span
      const spanModel = { ...model };
      spanModel.parameters.dimensions.width = spanWidth;
      
      // Generate each span
      await this.generateGutterConnectedGeometry(spanModel);
      
      // Offset the components
      spanModel.structure.frame.forEach(component => {
        if (component.geometry.position) {
          component.geometry.position.y += spanOffset;
        }
      });
      
      model.structure.frame.push(...spanModel.structure.frame);
    }
  }

  private async generateLeanToGeometry(model: GreenhouseModel): Promise<void> {
    const { dimensions, structure } = model.parameters;
    const { length, width, height, baySpacing } = dimensions;
    
    // Generate sloped roof structure
    const numBays = Math.floor(length / baySpacing);
    const roofSlope = structure.roofPitch * (Math.PI / 180);
    
    for (let i = 0; i <= numBays; i++) {
      const x = i * baySpacing;
      
      // Low side post
      const lowPost = this.geometryEngine.createFramePost({
        position: { x, y: 0, z: 0 },
        height: height * 0.7,
        profile: '4x4x0.125',
        material: structure.frameType
      });
      
      const lowPostComponent = await this.createComponentFromMesh(lowPost, 'frame_post', model.id);
      model.structure.frame.push(lowPostComponent);
      this.scene.add(lowPost);
      
      // High side post
      const highPost = this.geometryEngine.createFramePost({
        position: { x, y: width, z: 0 },
        height: height,
        profile: '4x4x0.125',
        material: structure.frameType
      });
      
      const highPostComponent = await this.createComponentFromMesh(highPost, 'frame_post', model.id);
      model.structure.frame.push(highPostComponent);
      this.scene.add(highPost);
      
      // Roof rafter
      const rafter = this.geometryEngine.createPurlin({
        start: { x, y: 0, z: height * 0.7 },
        end: { x, y: width, z: height },
        profile: '2x6x0.125',
        material: structure.frameType
      });
      
      const rafterComponent = await this.createComponentFromMesh(rafter, 'rafter', model.id);
      model.structure.frame.push(rafterComponent);
      this.scene.add(rafter);
    }
  }

  private async generateQuonsetGeometry(model: GreenhouseModel): Promise<void> {
    const { dimensions, structure } = model.parameters;
    const { length, width, height, baySpacing } = dimensions;
    
    // Generate curved frame structure
    const numBays = Math.floor(length / baySpacing);
    const archRadius = width / 2;
    
    for (let i = 0; i <= numBays; i++) {
      const x = i * baySpacing;
      
      // Generate curved frame
      const framePoints: Point3D[] = [];
      const segments = 20;
      
      for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * Math.PI;
        const y = archRadius * Math.cos(angle) + width / 2;
        const z = archRadius * Math.sin(angle);
        framePoints.push({ x, y, z });
      }
      
      // Create curved frame structure
      for (let j = 0; j < framePoints.length - 1; j++) {
        const frameSegment = this.geometryEngine.createPurlin({
          start: framePoints[j],
          end: framePoints[j + 1],
          profile: '2x4x0.125',
          material: structure.frameType
        });
        
        const segmentComponent = await this.createComponentFromMesh(frameSegment, 'frame_segment', model.id);
        model.structure.frame.push(segmentComponent);
        this.scene.add(frameSegment);
      }
    }
  }

  /**
   * Generate foundation system
   */
  private async generateFoundation(model: GreenhouseModel): Promise<void> {
    const { dimensions, structure } = model.parameters;
    const { length, width } = dimensions;
    
    // Create foundation outline
    const foundationOutline: Point3D[] = [
      { x: 0, y: 0, z: 0 },
      { x: length, y: 0, z: 0 },
      { x: length, y: width, z: 0 },
      { x: 0, y: width, z: 0 }
    ];
    
    const foundation = this.geometryEngine.createFoundationSlab({
      outline: foundationOutline,
      thickness: 6, // 6 inches
      depth: 4 // 4 inches below grade
    });
    
    const foundationComponent = await this.createComponentFromMesh(foundation, 'foundation_slab', model.id);
    model.structure.foundation.push(foundationComponent);
    this.scene.add(foundation);
  }

  /**
   * Generate roof structure
   */
  private async generateRoofStructure(model: GreenhouseModel, numBays: number): Promise<void> {
    const { dimensions, structure } = model.parameters;
    const { length, width, baySpacing, gutterHeight } = dimensions;
    const roofPitch = structure.roofPitch * (Math.PI / 180);
    const roofHeight = (width / 2) * Math.tan(roofPitch);
    
    // Generate roof purlins
    for (let i = 0; i <= numBays; i++) {
      const x = i * baySpacing;
      
      // Left roof purlin
      const leftRafter = this.geometryEngine.createPurlin({
        start: { x, y: 0, z: gutterHeight },
        end: { x, y: width / 2, z: gutterHeight + roofHeight },
        profile: '2x6x0.125',
        material: structure.frameType
      });
      
      const leftRafterComponent = await this.createComponentFromMesh(leftRafter, 'rafter', model.id);
      model.structure.frame.push(leftRafterComponent);
      this.scene.add(leftRafter);
      
      // Right roof purlin
      const rightRafter = this.geometryEngine.createPurlin({
        start: { x, y: width / 2, z: gutterHeight + roofHeight },
        end: { x, y: width, z: gutterHeight },
        profile: '2x6x0.125',
        material: structure.frameType
      });
      
      const rightRafterComponent = await this.createComponentFromMesh(rightRafter, 'rafter', model.id);
      model.structure.frame.push(rightRafterComponent);
      this.scene.add(rightRafter);
    }
  }

  /**
   * Generate side walls
   */
  private async generateSideWalls(model: GreenhouseModel, numBays: number): Promise<void> {
    const { dimensions, structure, glazing } = model.parameters;
    const { length, width, baySpacing, gutterHeight } = dimensions;
    
    // Left side wall
    for (let i = 0; i < numBays; i++) {
      const x = i * baySpacing;
      
      const leftWallPanel = this.geometryEngine.createGlazingPanel({
        corners: [
          { x, y: 0, z: 0 },
          { x: x + baySpacing, y: 0, z: 0 },
          { x: x + baySpacing, y: 0, z: gutterHeight },
          { x, y: 0, z: gutterHeight }
        ],
        thickness: glazing.thickness,
        material: glazing.sidewallType as any
      });
      
      const leftWallComponent = await this.createComponentFromMesh(leftWallPanel, 'sidewall_panel', model.id);
      model.structure.glazing.push(leftWallComponent);
      this.scene.add(leftWallPanel);
    }
    
    // Right side wall
    for (let i = 0; i < numBays; i++) {
      const x = i * baySpacing;
      
      const rightWallPanel = this.geometryEngine.createGlazingPanel({
        corners: [
          { x, y: width, z: 0 },
          { x: x + baySpacing, y: width, z: 0 },
          { x: x + baySpacing, y: width, z: gutterHeight },
          { x, y: width, z: gutterHeight }
        ],
        thickness: glazing.thickness,
        material: glazing.sidewallType as any
      });
      
      const rightWallComponent = await this.createComponentFromMesh(rightWallPanel, 'sidewall_panel', model.id);
      model.structure.glazing.push(rightWallComponent);
      this.scene.add(rightWallPanel);
    }
  }

  /**
   * Generate end walls
   */
  private async generateEndWalls(model: GreenhouseModel): Promise<void> {
    const { dimensions, structure, glazing } = model.parameters;
    const { length, width, gutterHeight } = dimensions;
    const roofPitch = structure.roofPitch * (Math.PI / 180);
    const roofHeight = (width / 2) * Math.tan(roofPitch);
    
    // Front end wall
    const frontWall = this.geometryEngine.createGlazingPanel({
      corners: [
        { x: 0, y: 0, z: 0 },
        { x: 0, y: width, z: 0 },
        { x: 0, y: width, z: gutterHeight },
        { x: 0, y: width / 2, z: gutterHeight + roofHeight },
        { x: 0, y: 0, z: gutterHeight }
      ],
      thickness: glazing.thickness,
      material: glazing.endwallType as any
    });
    
    const frontWallComponent = await this.createComponentFromMesh(frontWall, 'endwall_panel', model.id);
    model.structure.glazing.push(frontWallComponent);
    this.scene.add(frontWall);
    
    // Back end wall
    const backWall = this.geometryEngine.createGlazingPanel({
      corners: [
        { x: length, y: 0, z: 0 },
        { x: length, y: width, z: 0 },
        { x: length, y: width, z: gutterHeight },
        { x: length, y: width / 2, z: gutterHeight + roofHeight },
        { x: length, y: 0, z: gutterHeight }
      ],
      thickness: glazing.thickness,
      material: glazing.endwallType as any
    });
    
    const backWallComponent = await this.createComponentFromMesh(backWall, 'endwall_panel', model.id);
    model.structure.glazing.push(backWallComponent);
    this.scene.add(backWall);
  }

  /**
   * Generate frame system
   */
  private async generateFrameSystem(model: GreenhouseModel): Promise<void> {
    // Frame system is generated in the geometry-specific methods
    // This method can add additional frame elements if needed
  }

  /**
   * Generate glazing system
   */
  private async generateGlazingSystem(model: GreenhouseModel): Promise<void> {
    // Glazing system is generated in the geometry-specific methods
    // This method can add additional glazing elements if needed
  }

  /**
   * Generate doors
   */
  private async generateDoors(model: GreenhouseModel): Promise<void> {
    const { dimensions, structure } = model.parameters;
    const { width, gutterHeight } = dimensions;
    
    // Add door in front end wall
    const door = this.geometryEngine.createDoorFrame({
      width: 3, // 3 feet wide
      height: 7, // 7 feet tall
      thickness: 0.5,
      position: { x: 0, y: width / 2 - 1.5, z: 0 }, // Centered in front wall
      material: structure.frameType
    });
    
    const doorComponent = await this.createComponentFromMesh(door, 'door_frame', model.id);
    model.structure.doors.push(doorComponent);
    this.scene.add(door);
  }

  /**
   * Generate environmental systems
   */
  private async generateSystems(model: GreenhouseModel): Promise<void> {
    const { dimensions, ventilation } = model.parameters;
    const { length, width, gutterHeight } = dimensions;
    
    // Generate roof vents
    if (ventilation.roofVents.enabled) {
      const numVents = Math.floor(length / ventilation.roofVents.spacing);
      
      for (let i = 0; i < numVents; i++) {
        const x = (i + 0.5) * ventilation.roofVents.spacing;
        
        const roofVent = this.geometryEngine.createVentilationVent({
          width: ventilation.roofVents.size.width,
          height: ventilation.roofVents.size.length,
          position: { x, y: width / 2, z: gutterHeight + 2 },
          type: 'roof'
        });
        
        const ventComponent = await this.createComponentFromMesh(roofVent, 'roof_vent', model.id);
        model.systems.ventilation.push(ventComponent);
        this.scene.add(roofVent);
      }
    }
    
    // Generate side vents
    if (ventilation.sideVents.enabled) {
      const ventHeight = ventilation.sideVents.height;
      const numVents = Math.floor(length / 8); // Every 8 feet
      
      for (let i = 0; i < numVents; i++) {
        const x = (i + 0.5) * 8;
        
        const sideVent = this.geometryEngine.createVentilationVent({
          width: 6,
          height: ventHeight,
          position: { x, y: -0.1, z: 2 },
          type: 'side'
        });
        
        const ventComponent = await this.createComponentFromMesh(sideVent, 'side_vent', model.id);
        model.systems.ventilation.push(ventComponent);
        this.scene.add(sideVent);
      }
    }
  }

  /**
   * Calculate final geometry
   */
  private async calculateGeometry(model: GreenhouseModel): Promise<void> {
    const allComponents = [
      ...model.structure.foundation,
      ...model.structure.frame,
      ...model.structure.glazing,
      ...model.structure.doors,
      ...model.structure.hardware,
      ...model.systems.ventilation,
      ...model.systems.electrical,
      ...model.systems.plumbing,
      ...model.systems.hvac,
      ...model.systems.automation
    ];
    
    // Calculate vertices, faces, and normals from all components
    const vertices: number[] = [];
    const faces: number[] = [];
    const normals: number[] = [];
    
    let vertexOffset = 0;
    
    for (const component of allComponents) {
      if (component.geometry.vertices) {
        vertices.push(...component.geometry.vertices);
        
        if (component.geometry.faces) {
          // Offset face indices
          const offsetFaces = component.geometry.faces.map(face => face + vertexOffset);
          faces.push(...offsetFaces);
        }
        
        if (component.geometry.normals) {
          normals.push(...component.geometry.normals);
        }
        
        vertexOffset += component.geometry.vertices.length / 3;
      }
    }
    
    model.geometry.vertices = vertices;
    model.geometry.faces = faces;
    model.geometry.normals = normals;
    
    // Update bounding box
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    for (let i = 0; i < vertices.length; i += 3) {
      minX = Math.min(minX, vertices[i]);
      minY = Math.min(minY, vertices[i + 1]);
      minZ = Math.min(minZ, vertices[i + 2]);
      maxX = Math.max(maxX, vertices[i]);
      maxY = Math.max(maxY, vertices[i + 1]);
      maxZ = Math.max(maxZ, vertices[i + 2]);
    }
    
    model.geometry.boundingBox = {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ }
    };
  }

  /**
   * Create component from THREE.js mesh
   */
  private async createComponentFromMesh(
    mesh: THREE.Object3D,
    componentType: string,
    modelId: string
  ): Promise<Component> {
    const geometry = mesh instanceof THREE.Mesh ? mesh.geometry : new THREE.BufferGeometry();
    const material = mesh instanceof THREE.Mesh ? mesh.material : new THREE.MeshStandardMaterial();
    
    // Extract geometry data
    const vertices = geometry.attributes.position?.array || [];
    const faces = geometry.index?.array || [];
    const normals = geometry.attributes.normal?.array || [];
    
    return {
      id: this.generateId(componentType),
      name: mesh.name || componentType,
      type: 'structural',
      category: componentType,
      geometry: {
        type: 'complex',
        vertices: Array.from(vertices),
        faces: Array.from(faces),
        normals: Array.from(normals),
        position: {
          x: mesh.position.x,
          y: mesh.position.y,
          z: mesh.position.z
        },
        rotation: {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z
        }
      },
      materialId: 'default',
      material: {} as any,
      properties: {
        quantity: 1,
        unit: 'each',
        weight: 0,
        cost: 0
      },
      connections: [],
      assembly: {
        sequence: 1,
        prerequisites: [],
        tools: [],
        laborHours: 0.5,
        skillLevel: 'intermediate',
        instructions: ''
      },
      layer: 'structure',
      subLayer: componentType,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generate frame components
   */
  private async generateFrameComponents(model: GreenhouseModel, numBays: number): Promise<void> {
    const { dimensions, structure } = model.parameters;
    const { length, width, height, baySpacing } = dimensions;
    
    // Main frame posts
    for (let i = 0; i <= numBays; i++) {
      const x = i * baySpacing;
      
      // Left side posts
      const leftPost = await this.createFramePost({
        position: { x, y: 0, z: 0 },
        height: height,
        material: structure.frameType
      });
      model.structure.frame.push(leftPost);
      
      // Right side posts
      const rightPost = await this.createFramePost({
        position: { x, y: width, z: 0 },
        height: height,
        material: structure.frameType
      });
      model.structure.frame.push(rightPost);
    }
    
    // Roof purlins
    for (let i = 0; i < numBays; i++) {
      const x = i * baySpacing;
      
      // Left purlin
      const leftPurlin = await this.createPurlin({
        start: { x, y: 0, z: height },
        end: { x: x + baySpacing, y: 0, z: height },
        material: structure.frameType
      });
      model.structure.frame.push(leftPurlin);
      
      // Right purlin
      const rightPurlin = await this.createPurlin({
        start: { x, y: width, z: height },
        end: { x: x + baySpacing, y: width, z: height },
        material: structure.frameType
      });
      model.structure.frame.push(rightPurlin);
      
      // Cross purlins
      const crossPurlin = await this.createPurlin({
        start: { x, y: 0, z: height },
        end: { x, y: width, z: height },
        material: structure.frameType
      });
      model.structure.frame.push(crossPurlin);
    }
  }

  /**
   * Create frame post component
   */
  private async createFramePost(config: {
    position: Point3D;
    height: number;
    material: FrameMaterial;
  }): Promise<Component> {
    const material = await this.getFrameMaterial(config.material);
    
    return {
      id: this.generateId('post'),
      name: 'Frame Post',
      type: 'structural',
      category: 'frame',
      geometry: {
        type: 'box',
        dimensions: {
          length: 4, // 4" x 4" post
          width: 4,
          height: config.height * 12 // convert to inches
        },
        position: config.position,
        rotation: { x: 0, y: 0, z: 0 }
      },
      materialId: material.id,
      material,
      properties: {
        quantity: 1,
        unit: 'each',
        weight: this.calculatePostWeight(config.height, material),
        cost: this.calculatePostCost(config.height, material)
      },
      connections: [],
      assembly: {
        sequence: 1,
        prerequisites: ['foundation'],
        tools: ['drill', 'level', 'wrench'],
        laborHours: 0.5,
        skillLevel: 'intermediate',
        instructions: 'Anchor post to foundation with base plate and bolts'
      },
      layer: 'structure',
      subLayer: 'frame',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Create purlin component
   */
  private async createPurlin(config: {
    start: Point3D;
    end: Point3D;
    material: FrameMaterial;
  }): Promise<Component> {
    const material = await this.getFrameMaterial(config.material);
    const length = this.calculateDistance(config.start, config.end);
    
    return {
      id: this.generateId('purlin'),
      name: 'Purlin',
      type: 'structural',
      category: 'frame',
      geometry: {
        type: 'box',
        dimensions: {
          length: length * 12, // convert to inches
          width: 2,
          height: 4
        },
        position: {
          x: (config.start.x + config.end.x) / 2,
          y: (config.start.y + config.end.y) / 2,
          z: (config.start.z + config.end.z) / 2
        },
        rotation: { x: 0, y: 0, z: 0 }
      },
      materialId: material.id,
      material,
      properties: {
        quantity: 1,
        unit: 'each',
        weight: this.calculatePurlinWeight(length, material),
        cost: this.calculatePurlinCost(length, material)
      },
      connections: [],
      assembly: {
        sequence: 2,
        prerequisites: ['posts'],
        tools: ['drill', 'level', 'screwdriver'],
        laborHours: 0.25,
        skillLevel: 'intermediate',
        instructions: 'Attach purlin to posts with structural screws'
      },
      layer: 'structure',
      subLayer: 'frame',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generate glazing components
   */
  private async generateGlazingComponents(model: GreenhouseModel): Promise<void> {
    const { dimensions, glazing } = model.parameters;
    const { length, width, height } = dimensions;
    
    // Roof glazing panels
    await this.generateRoofGlazing(model);
    
    // Sidewall glazing panels
    await this.generateSidewallGlazing(model);
    
    // Endwall glazing panels
    await this.generateEndwallGlazing(model);
  }

  /**
   * Generate roof glazing
   */
  private async generateRoofGlazing(model: GreenhouseModel): Promise<void> {
    const { dimensions, glazing } = model.parameters;
    const material = await this.getGlazingMaterial(glazing.roofType);
    
    // Calculate panel dimensions (standard 4' x 8' panels)
    const panelWidth = 4;
    const panelLength = 8;
    const panelsPerRow = Math.ceil(dimensions.width / panelWidth);
    const panelsPerColumn = Math.ceil(dimensions.length / panelLength);
    
    for (let row = 0; row < panelsPerColumn; row++) {
      for (let col = 0; col < panelsPerRow; col++) {
        const panel = await this.createGlazingPanel({
          position: {
            x: row * panelLength + panelLength / 2,
            y: col * panelWidth + panelWidth / 2,
            z: dimensions.height
          },
          dimensions: {
            length: panelLength,
            width: panelWidth,
            thickness: glazing.thickness / 25.4 // convert mm to inches
          },
          material: glazing.roofType,
          location: 'roof'
        });
        
        model.structure.glazing.push(panel);
      }
    }
  }

  /**
   * Create glazing panel component
   */
  private async createGlazingPanel(config: {
    position: Point3D;
    dimensions: { length: number; width: number; thickness: number };
    material: GlazingType;
    location: 'roof' | 'sidewall' | 'endwall';
  }): Promise<Component> {
    const material = await this.getGlazingMaterial(config.material);
    
    return {
      id: this.generateId('glazing'),
      name: `${config.location} Glazing Panel`,
      type: 'glazing',
      category: 'glazing',
      geometry: {
        type: 'plane',
        dimensions: {
          length: config.dimensions.length,
          width: config.dimensions.width,
          height: config.dimensions.thickness
        },
        position: config.position,
        rotation: { x: 0, y: 0, z: 0 }
      },
      materialId: material.id,
      material,
      properties: {
        quantity: 1,
        unit: 'each',
        weight: this.calculateGlazingWeight(config.dimensions, material),
        cost: this.calculateGlazingCost(config.dimensions, material)
      },
      connections: [],
      assembly: {
        sequence: 3,
        prerequisites: ['frame'],
        tools: ['drill', 'glazing_tape', 'sealant_gun'],
        laborHours: 0.5,
        skillLevel: 'intermediate',
        instructions: 'Install glazing with structural glazing tape and sealant'
      },
      layer: 'glazing',
      subLayer: config.location,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Generate foundation components
   */
  private async generateFoundationComponents(model: GreenhouseModel): Promise<void> {
    const { dimensions, structure } = model.parameters;
    
    switch (structure.foundationType) {
      case 'concrete_slab':
        await this.generateConcreteSlab(model);
        break;
      case 'concrete_footings':
        await this.generateConcreteFootings(model);
        break;
      case 'gravel_pad':
        await this.generateGravelPad(model);
        break;
      default:
        await this.generateBasicFoundation(model);
    }
  }

  /**
   * Generate concrete slab foundation
   */
  private async generateConcreteSlab(model: GreenhouseModel): Promise<void> {
    const { dimensions } = model.parameters;
    const concreteMaterial = await this.getMaterial('concrete_4000psi');
    
    const slab: Component = {
      id: this.generateId('slab'),
      name: 'Concrete Slab',
      type: 'structural',
      category: 'foundation',
      geometry: {
        type: 'box',
        dimensions: {
          length: dimensions.length * 12,
          width: dimensions.width * 12,
          height: 4 // 4" thick slab
        },
        position: {
          x: dimensions.length / 2,
          y: dimensions.width / 2,
          z: -0.33 // 4" below grade
        },
        rotation: { x: 0, y: 0, z: 0 }
      },
      materialId: concreteMaterial.id,
      material: concreteMaterial,
      properties: {
        quantity: this.calculateConcreteVolume(dimensions),
        unit: 'cubic_feet',
        weight: this.calculateConcreteWeight(dimensions),
        cost: this.calculateConcreteCost(dimensions)
      },
      connections: [],
      assembly: {
        sequence: 0,
        prerequisites: ['site_preparation'],
        tools: ['concrete_mixer', 'screed', 'float'],
        laborHours: 8,
        skillLevel: 'advanced',
        instructions: 'Pour and level concrete slab with proper reinforcement'
      },
      layer: 'foundation',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    model.structure.foundation.push(slab);
  }

  /**
   * Generate BOM from model
   */
  private async generateBOM(model: GreenhouseModel): Promise<BillOfMaterials> {
    const bom: BillOfMaterials = {
      id: this.generateId('bom'),
      greenhouseId: model.id,
      summary: {
        totalComponents: 0,
        totalWeight: 0,
        totalCost: 0,
        totalLaborHours: 0
      },
      categories: [],
      lineItems: [],
      assemblies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Collect all components
    const allComponents = this.getAllComponents(model);
    
    // Generate line items
    for (const component of allComponents) {
      const lineItem = {
        id: this.generateId('line'),
        componentId: component.id,
        itemNumber: this.generateItemNumber(component),
        description: `${component.name} - ${component.material?.name || 'Unknown'}`,
        materialId: component.materialId,
        quantity: component.properties.quantity,
        unit: component.properties.unit,
        unitCost: component.properties.cost / component.properties.quantity,
        totalCost: component.properties.cost,
        weight: component.properties.weight,
        supplier: component.material?.suppliers[0]?.name || 'TBD',
        leadTime: component.material?.availability.leadTime || 14,
        notes: component.assembly.instructions
      };
      
      bom.lineItems.push(lineItem);
      
      // Update summary
      bom.summary.totalComponents += component.properties.quantity;
      bom.summary.totalWeight += component.properties.weight;
      bom.summary.totalCost += component.properties.cost;
      bom.summary.totalLaborHours += component.assembly.laborHours;
    }
    
    // Generate categories
    bom.categories = this.generateBOMCategories(allComponents);
    
    // Generate assemblies
    bom.assemblies = this.generateAssemblySequences(allComponents);
    
    return bom;
  }

  /**
   * Generate technical drawings
   */
  private async generateTechnicalDrawings(model: GreenhouseModel): Promise<TechnicalDrawing[]> {
    const drawings: TechnicalDrawing[] = [];
    
    // Plan view
    const planView = await this.generatePlanView(model);
    drawings.push(planView);
    
    // Elevation views
    const frontElevation = await this.generateElevation(model, 'front');
    const sideElevation = await this.generateElevation(model, 'side');
    drawings.push(frontElevation, sideElevation);
    
    // Sections
    const crossSection = await this.generateSection(model, 'cross');
    drawings.push(crossSection);
    
    // Details
    const connectionDetails = await this.generateConnectionDetails(model);
    drawings.push(...connectionDetails);
    
    return drawings;
  }

  /**
   * Generate plan view drawing
   */
  private async generatePlanView(model: GreenhouseModel): Promise<TechnicalDrawing> {
    const drawing: TechnicalDrawing = {
      id: this.generateId('drawing'),
      type: 'plan',
      name: 'Floor Plan',
      description: 'Top view showing layout and dimensions',
      scale: 1/4, // 1/4" = 1'
      units: 'feet',
      paperSize: 'ANSI_D',
      elements: [],
      dimensions: [],
      notes: [],
      exportData: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add foundation outline
    drawing.elements.push({
      type: 'line',
      geometry: this.createRectangle(
        { x: 0, y: 0, z: 0 },
        model.parameters.dimensions.length,
        model.parameters.dimensions.width
      ),
      layer: 'foundation',
      style: {
        color: 'black',
        lineWeight: 2,
        lineType: 'solid'
      }
    });
    
    // Add structural grid
    const baySpacing = model.parameters.dimensions.baySpacing;
    const numBays = Math.floor(model.parameters.dimensions.length / baySpacing);
    
    for (let i = 1; i < numBays; i++) {
      const x = i * baySpacing;
      drawing.elements.push({
        type: 'line',
        geometry: {
          start: { x, y: 0, z: 0 },
          end: { x, y: model.parameters.dimensions.width, z: 0 }
        },
        layer: 'structure',
        style: {
          color: 'blue',
          lineWeight: 1,
          lineType: 'dashed'
        }
      });
    }
    
    // Add dimensions
    drawing.dimensions.push({
      type: 'linear',
      points: [
        { x: 0, y: 0, z: 0 },
        { x: model.parameters.dimensions.length, y: 0, z: 0 }
      ],
      value: model.parameters.dimensions.length,
      unit: 'ft',
      text: `${model.parameters.dimensions.length}'-0"`
    });
    
    drawing.dimensions.push({
      type: 'linear',
      points: [
        { x: 0, y: 0, z: 0 },
        { x: 0, y: model.parameters.dimensions.width, z: 0 }
      ],
      value: model.parameters.dimensions.width,
      unit: 'ft',
      text: `${model.parameters.dimensions.width}'-0"`
    });
    
    return drawing;
  }

  // Helper methods
  
  private async loadMaterialDatabase(): Promise<void> {
    // Load standard materials
    await this.loadStandardMaterials();
  }
  
  private async loadStandardMaterials(): Promise<void> {
    // Galvanized steel frame
    const galvanizedSteel: Material = {
      id: 'mat_galv_steel_001',
      name: 'Galvanized Steel Tube',
      manufacturer: 'Generic',
      model: '4x4x0.125',
      category: 'metal',
      properties: {
        thermal: {
          thermalExpansion: 0.0000065
        },
        structural: {
          tensileStrength: 58000,
          elasticModulus: 29000000,
          density: 490
        },
        optical: {},
        environmental: {
          weatherResistance: 25,
          fireRating: 'Non-combustible'
        }
      },
      specifications: {
        dimensions: {
          length: 20,
          width: 4,
          thickness: 0.125
        },
        finish: 'Hot-dip galvanized',
        color: 'Galvanized',
        warranty: 25
      },
      availability: {
        regions: ['US', 'CA'],
        leadTime: 7,
        minimumOrder: 1,
        priceBreaks: [
          { quantity: 1, unit: 'each', price: 45.00 },
          { quantity: 10, unit: 'each', price: 40.00 },
          { quantity: 50, unit: 'each', price: 35.00 }
        ]
      },
      suppliers: [
        {
          name: 'Steel Supply Co.',
          contact: 'sales@steelsupply.com',
          website: 'www.steelsupply.com',
          certifications: ['AISC', 'ASTM']
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.materials.set(galvanizedSteel.id, galvanizedSteel);
    
    // Polycarbonate glazing
    const polycarbonate: Material = {
      id: 'mat_poly_glz_001',
      name: 'Twin-wall Polycarbonate',
      manufacturer: 'Palram',
      model: 'Suntuf 8mm',
      category: 'plastic',
      properties: {
        thermal: {
          uValue: 0.55,
          rValue: 1.8
        },
        structural: {
          tensileStrength: 9000,
          density: 75
        },
        optical: {
          lightTransmission: 80,
          solarHeatGain: 0.65,
          uvTransmission: 0.1
        },
        environmental: {
          weatherResistance: 15,
          fireRating: 'Class A'
        }
      },
      specifications: {
        dimensions: {
          length: 96,
          width: 48,
          thickness: 0.315
        },
        finish: 'Clear',
        color: 'Clear',
        warranty: 10
      },
      availability: {
        regions: ['US', 'CA'],
        leadTime: 3,
        minimumOrder: 1,
        priceBreaks: [
          { quantity: 1, unit: 'each', price: 85.00 },
          { quantity: 10, unit: 'each', price: 75.00 },
          { quantity: 50, unit: 'each', price: 65.00 }
        ]
      },
      suppliers: [
        {
          name: 'Greenhouse Supply',
          contact: 'orders@greenhousesupply.com',
          website: 'www.greenhousesupply.com',
          certifications: ['ICC', 'ASTM']
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.materials.set(polycarbonate.id, polycarbonate);
  }
  
  private async loadComponentLibrary(): Promise<void> {
    // Load standard components
  }
  
  private async getFrameMaterial(frameType: FrameMaterial): Promise<Material> {
    // Return appropriate material based on frame type
    return this.materials.get('mat_galv_steel_001')!;
  }
  
  private async getGlazingMaterial(glazingType: GlazingType): Promise<Material> {
    // Return appropriate material based on glazing type
    return this.materials.get('mat_poly_glz_001')!;
  }
  
  private async getMaterial(materialId: string): Promise<Material> {
    return this.materials.get(materialId)!;
  }
  
  private calculateDistance(point1: Point3D, point2: Point3D): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  private calculatePostWeight(height: number, material: Material): number {
    const volume = (4/12) * (4/12) * height; // cubic feet
    return volume * (material.properties.structural.density || 490) / 1728;
  }
  
  private calculatePostCost(height: number, material: Material): number {
    const basePrice = material.availability.priceBreaks[0].price;
    return basePrice * (height / 20); // pro-rate based on 20' standard length
  }
  
  private calculatePurlinWeight(length: number, material: Material): number {
    const volume = (2/12) * (4/12) * length; // cubic feet
    return volume * (material.properties.structural.density || 490) / 1728;
  }
  
  private calculatePurlinCost(length: number, material: Material): number {
    const basePrice = material.availability.priceBreaks[0].price;
    return basePrice * (length / 20); // pro-rate based on 20' standard length
  }
  
  private calculateGlazingWeight(
    dimensions: { length: number; width: number; thickness: number },
    material: Material
  ): number {
    const area = dimensions.length * dimensions.width; // square feet
    const thickness = dimensions.thickness / 12; // convert to feet
    const volume = area * thickness;
    return volume * (material.properties.structural.density || 75);
  }
  
  private calculateGlazingCost(
    dimensions: { length: number; width: number; thickness: number },
    material: Material
  ): number {
    const area = dimensions.length * dimensions.width; // square feet
    const standardArea = 4 * 8; // 32 sq ft per panel
    const panels = Math.ceil(area / standardArea);
    return panels * material.availability.priceBreaks[0].price;
  }
  
  private calculateConcreteVolume(dimensions: { length: number; width: number }): number {
    return dimensions.length * dimensions.width * (4/12); // 4" thick slab
  }
  
  private calculateConcreteWeight(dimensions: { length: number; width: number }): number {
    const volume = this.calculateConcreteVolume(dimensions);
    return volume * 150; // 150 lbs per cubic foot
  }
  
  private calculateConcreteCost(dimensions: { length: number; width: number }): number {
    const volume = this.calculateConcreteVolume(dimensions);
    const yards = volume / 27; // convert to cubic yards
    return yards * 120; // $120 per cubic yard
  }
  
  private getAllComponents(model: GreenhouseModel): Component[] {
    const components: Component[] = [];
    
    // Collect all structural components
    components.push(...model.structure.foundation);
    components.push(...model.structure.frame);
    components.push(...model.structure.glazing);
    components.push(...model.structure.doors);
    components.push(...model.structure.hardware);
    
    // Collect all system components
    components.push(...model.systems.ventilation);
    components.push(...model.systems.electrical);
    components.push(...model.systems.plumbing);
    components.push(...model.systems.hvac);
    components.push(...model.systems.automation);
    
    return components;
  }
  
  private generateItemNumber(component: Component): string {
    const prefix = component.type.substring(0, 3).toUpperCase();
    const category = component.category.substring(0, 3).toUpperCase();
    const sequence = component.id.substring(component.id.length - 3);
    return `${prefix}-${category}-${sequence}`;
  }
  
  private generateBOMCategories(components: Component[]): BillOfMaterials['categories'] {
    const categoryMap = new Map<string, { components: number; weight: number; cost: number }>();
    
    for (const component of components) {
      const category = component.category;
      const existing = categoryMap.get(category) || { components: 0, weight: 0, cost: 0 };
      
      existing.components += component.properties.quantity;
      existing.weight += component.properties.weight;
      existing.cost += component.properties.cost;
      
      categoryMap.set(category, existing);
    }
    
    const totalCost = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.cost, 0);
    
    return Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      ...data,
      percentage: (data.cost / totalCost) * 100
    }));
  }
  
  private generateAssemblySequences(components: Component[]): BillOfMaterials['assemblies'] {
    const sequenceMap = new Map<number, Component[]>();
    
    // Group components by assembly sequence
    for (const component of components) {
      const seq = component.assembly.sequence;
      const existing = sequenceMap.get(seq) || [];
      existing.push(component);
      sequenceMap.set(seq, existing);
    }
    
    return Array.from(sequenceMap.entries()).map(([sequence, comps]) => ({
      name: this.getAssemblyName(sequence),
      sequence,
      components: comps.map(c => c.id),
      laborHours: comps.reduce((sum, c) => sum + c.assembly.laborHours, 0),
      tools: [...new Set(comps.flatMap(c => c.assembly.tools))],
      materials: [...new Set(comps.map(c => c.materialId))]
    }));
  }
  
  private getAssemblyName(sequence: number): string {
    const names = {
      0: 'Foundation',
      1: 'Frame Posts',
      2: 'Frame Purlins',
      3: 'Glazing Installation',
      4: 'Doors and Hardware',
      5: 'Ventilation Systems',
      6: 'Electrical Systems',
      7: 'Plumbing Systems',
      8: 'HVAC Systems',
      9: 'Automation Systems'
    };
    return names[sequence as keyof typeof names] || `Assembly ${sequence}`;
  }
  
  private createRectangle(origin: Point3D, length: number, width: number): any {
    return {
      type: 'rectangle',
      origin,
      length,
      width
    };
  }
  
  private async generateFreestandingGeometry(model: GreenhouseModel): Promise<void> {
    // Implement freestanding greenhouse geometry
    await this.generateBasicGeometry(model);
  }
  
  private async generateGothicGeometry(model: GreenhouseModel): Promise<void> {
    // Implement gothic arch greenhouse geometry
    await this.generateBasicGeometry(model);
  }
  
  private async generateBasicGeometry(model: GreenhouseModel): Promise<void> {
    // Basic rectangular greenhouse
    await this.generateGutterConnectedGeometry(model);
  }
  
  private async generateComponents(model: GreenhouseModel): Promise<void> {
    // Components are generated during geometry creation
  }
  
  private async generateSidewallGlazing(model: GreenhouseModel): Promise<void> {
    // Implement sidewall glazing generation
  }
  
  private async generateEndwallGlazing(model: GreenhouseModel): Promise<void> {
    // Implement endwall glazing generation
  }
  
  private async generateVentilationComponents(model: GreenhouseModel): Promise<void> {
    // Implement ventilation component generation
  }
  
  private async generateDoorComponents(model: GreenhouseModel): Promise<void> {
    // Implement door component generation
  }
  
  private async generateConcreteFootings(model: GreenhouseModel): Promise<void> {
    // Implement concrete footings generation
  }
  
  private async generateGravelPad(model: GreenhouseModel): Promise<void> {
    // Implement gravel pad generation
  }
  
  private async generateBasicFoundation(model: GreenhouseModel): Promise<void> {
    // Implement basic foundation generation
  }
  
  private async generateElevation(model: GreenhouseModel, view: string): Promise<TechnicalDrawing> {
    // Implement elevation drawing generation
    return {} as TechnicalDrawing;
  }
  
  private async generateSection(model: GreenhouseModel, type: string): Promise<TechnicalDrawing> {
    // Implement section drawing generation
    return {} as TechnicalDrawing;
  }
  
  private async generateConnectionDetails(model: GreenhouseModel): Promise<TechnicalDrawing[]> {
    // Implement connection detail generation
    return [];
  }
  
  private async saveModel(model: GreenhouseModel): Promise<void> {
    // Save model to database
    await prisma.greenhouseModel.create({
      data: {
        id: model.id,
        name: model.name,
        parameters: model.parameters,
        geometry: model.geometry,
        bom: model.bom,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt
      }
    });
  }
  
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { GreenhouseCADSystem };
export default GreenhouseCADSystem;