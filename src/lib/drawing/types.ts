/**
 * Types for drawing import and parsing system
 */

export interface DrawingDimensions {
  width: number;
  height: number;
  unit: 'ft' | 'in' | 'm' | 'cm';
}

export interface RoomSpecification {
  id: string;
  name: string;
  dimensions: DrawingDimensions;
  area: number;
  perimeter: number;
  walls: WallSegment[];
  doors: DoorSpecification[];
  windows: WindowSpecification[];
  obstacles: ObstacleSpecification[];
  metadata: {
    facility?: string;
    roomType?: string;
    phase?: string;
    createdAt: Date;
    source: 'pdf' | 'cad' | 'manual' | 'image';
  };
}

export interface WallSegment {
  id: string;
  startPoint: Point2D;
  endPoint: Point2D;
  thickness: number;
  height: number;
  type: 'exterior' | 'interior' | 'partition';
}

export interface DoorSpecification {
  id: string;
  position: Point2D;
  width: number;
  height: number;
  orientation: 'north' | 'south' | 'east' | 'west';
  type: 'single' | 'double' | 'sliding' | 'rollup';
}

export interface WindowSpecification {
  id: string;
  position: Point2D;
  width: number;
  height: number;
  sillHeight: number;
  orientation: 'north' | 'south' | 'east' | 'west';
}

export interface ObstacleSpecification {
  id: string;
  type: 'column' | 'beam' | 'equipment' | 'other';
  position: Point2D;
  dimensions: {
    width: number;
    depth: number;
    height?: number;
  };
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export interface ParsedDrawing {
  rooms: RoomSpecification[];
  scale: number;
  unit: 'ft' | 'in' | 'm' | 'cm';
  totalArea: number;
  boundingBox: {
    min: Point2D;
    max: Point2D;
  };
  extractedText: ExtractedText[];
  confidence: number;
}

export interface ExtractedText {
  text: string;
  position: Point2D;
  type: 'dimension' | 'label' | 'annotation' | 'title';
  confidence: number;
}

export interface CultivationLayout {
  room: RoomSpecification;
  tables: TablePlacement[];
  lights: LightPlacement[];
  hvac: HVACPlacement[];
  irrigation: IrrigationPlacement[];
  electrical: ElectricalPlacement[];
  workflow: WorkflowPath[];
  metrics: LayoutMetrics;
}

export interface TablePlacement {
  id: string;
  position: Point3D;
  rotation: number;
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  type: 'rolling' | 'fixed' | 'vertical';
  capacity: number;
  strain?: string;
}

export interface LightPlacement {
  id: string;
  position: Point3D;
  fixture: {
    type: 'led' | 'hps' | 'cmh';
    wattage: number;
    coverage: number;
    ppfd: number;
  };
  mounting: 'ceiling' | 'adjustable' | 'vertical';
}

export interface HVACPlacement {
  id: string;
  type: 'ac' | 'dehumidifier' | 'fan' | 'exhaust';
  position: Point3D;
  capacity: number;
  coverage: number;
}

export interface IrrigationPlacement {
  id: string;
  type: 'drip' | 'flood' | 'ebb-flow' | 'spray';
  mainLines: Point3D[];
  outlets: Point3D[];
  capacity: number;
}

export interface ElectricalPlacement {
  id: string;
  type: 'panel' | 'outlet' | 'junction';
  position: Point3D;
  voltage: number;
  amperage: number;
  circuits: string[];
}

export interface WorkflowPath {
  id: string;
  type: 'primary' | 'secondary' | 'emergency';
  points: Point3D[];
  width: number;
  clearance: number;
}

export interface LayoutMetrics {
  tableCount: number;
  plantCapacity: number;
  canopyArea: number;
  aisleArea: number;
  utilizationRate: number;
  ppfdAverage: number;
  powerDensity: number;
  hvacCoverage: number;
  complianceScore: number;
}

export interface DrawingParseOptions {
  unit?: 'ft' | 'in' | 'm' | 'cm';
  scale?: number;
  detectTables?: boolean;
  detectDimensions?: boolean;
  detectText?: boolean;
  pageNumber?: number;
  enhanceContrast?: boolean;
  rotation?: number;
}

export interface DrawingValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: LayoutSuggestion[];
}

export interface ValidationError {
  code: string;
  message: string;
  location?: Point2D;
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  code: string;
  message: string;
  location?: Point2D;
  severity: 'warning' | 'info';
}

export interface LayoutSuggestion {
  type: 'optimization' | 'compliance' | 'efficiency';
  message: string;
  impact: 'high' | 'medium' | 'low';
  implementation: string;
}