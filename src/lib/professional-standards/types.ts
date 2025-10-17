/**
 * Professional Standards - Core Types and Interfaces
 * Shared types across all professional systems
 */

// Professional Drawing Standards
export interface ProfessionalStandard {
  id: string;
  name: string;
  organization: 'ANSI' | 'ISO' | 'AIA' | 'NIST' | 'ASTM' | 'IEEE' | 'IBC' | 'NEC' | 'ASCE' | 'NGMA';
  version: string;
  effectiveDate: Date;
  requirements: StandardRequirement[];
  applicability: StandardApplicability;
  complianceLevel: 'mandatory' | 'recommended' | 'optional';
  lastUpdated: Date;
}

export interface StandardRequirement {
  id: string;
  section: string;
  title: string;
  description: string;
  specification: string;
  tolerances?: {
    dimension: number;
    angle: number;
    location: number;
  };
  references: string[];
  notes?: string[];
}

export interface StandardApplicability {
  buildingTypes: string[];
  constructionPhases: string[];
  disciplines: string[];
  regions: string[];
  exceptions: string[];
}

// Professional Drawing Components
export interface DrawingElement {
  id: string;
  type: 'line' | 'arc' | 'circle' | 'text' | 'dimension' | 'symbol' | 'hatch' | 'block';
  layer: string;
  geometry: ElementGeometry;
  style: ElementStyle;
  annotations: ElementAnnotation[];
  metadata: ElementMetadata;
}

export interface ElementGeometry {
  coordinates: Point2D[];
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    radius?: number;
    angle?: number;
  };
  boundingBox: BoundingBox;
}

export interface ElementStyle {
  lineType: 'continuous' | 'dashed' | 'dotted' | 'center' | 'hidden';
  lineWeight: number;
  color: string;
  fill?: {
    type: 'solid' | 'hatch' | 'gradient';
    pattern?: string;
    opacity: number;
  };
  textStyle?: {
    font: string;
    size: number;
    bold: boolean;
    italic: boolean;
  };
}

export interface ElementAnnotation {
  id: string;
  type: 'dimension' | 'note' | 'label' | 'symbol' | 'callout';
  content: string;
  position: Point2D;
  leader?: {
    startPoint: Point2D;
    endPoint: Point2D;
    style: 'arrow' | 'dot' | 'none';
  };
  formatting: TextFormatting;
}

export interface ElementMetadata {
  partNumber?: string;
  specification?: string;
  material?: string;
  finish?: string;
  notes?: string[];
  compliance?: ComplianceTag[];
  customProperties: Record<string, any>;
}

// Professional Title Block
export interface TitleBlockInfo {
  projectName: string;
  projectNumber: string;
  sheetTitle: string;
  sheetNumber: string;
  totalSheets: number;
  revision: string;
  date: Date;
  drawnBy: string;
  checkedBy: string;
  approvedBy: string;
  scale: string;
  client: {
    name: string;
    address: string;
    logo?: string;
  };
  consultant: {
    name: string;
    address: string;
    license?: string;
    logo?: string;
  };
  stamps: ProfessionalStamp[];
}

export interface ProfessionalStamp {
  id: string;
  type: 'professional_engineer' | 'architect' | 'surveyor' | 'contractor';
  professional: {
    name: string;
    license: string;
    state: string;
    expiration: Date;
  };
  signature: {
    digital: boolean;
    imageUrl: string;
    timestamp: Date;
    cryptographicHash?: string;
  };
  position: Point2D;
  size: { width: number; height: number };
}

// Geometric Primitives
export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export interface BoundingBox {
  min: Point2D;
  max: Point2D;
}

export interface TextFormatting {
  font: string;
  size: number;
  color: string;
  alignment: 'left' | 'center' | 'right' | 'justify';
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

// Compliance and Quality
export interface ComplianceTag {
  standard: string;
  section: string;
  status: 'compliant' | 'non_compliant' | 'not_applicable' | 'requires_review';
  notes?: string;
  verifiedBy?: string;
  verifiedDate?: Date;
}

export interface QualityMetric {
  id: string;
  name: string;
  category: 'completeness' | 'accuracy' | 'presentation' | 'coordination';
  score: number; // 0-100
  weight: number; // Importance weighting
  criteria: QualityCriterion[];
  lastEvaluated: Date;
}

export interface QualityCriterion {
  id: string;
  description: string;
  requirement: string;
  evaluation: 'pass' | 'fail' | 'warning';
  impact: 'critical' | 'major' | 'minor';
  recommendation?: string;
}

// Material Specifications
export interface MaterialCategory {
  id: string;
  name: string;
  parent?: string;
  standards: string[];
  properties: string[];
  testMethods: string[];
}

export interface PhysicalProperties {
  density: number; // kg/m³
  specificGravity: number;
  porosity?: number; // %
  permeability?: number; // m²
  color: string;
  texture: string;
  finish: string;
}

export interface MechanicalProperties {
  tensileStrength: number; // MPa
  compressiveStrength: number; // MPa
  flexuralStrength?: number; // MPa
  modulusOfElasticity: number; // GPa
  poissonsRatio: number;
  hardness?: number;
  fatigueLimit?: number; // MPa
}

export interface ThermalProperties {
  thermalConductivity: number; // W/m·K
  specificHeat: number; // J/kg·K
  thermalExpansion: number; // /K
  meltingPoint?: number; // °C
  maxServiceTemp: number; // °C
  minServiceTemp: number; // °C
}

export interface ElectricalProperties {
  resistivity?: number; // Ω·m
  dielectricStrength?: number; // kV/mm
  dielectricConstant?: number;
  conductivity?: number; // S/m
}

export interface ChemicalProperties {
  corrosionResistance: string;
  chemicalCompatibility: string[];
  phLevel?: number;
  oxidationResistance?: string;
}

export interface EnvironmentalProperties {
  uvResistance: string;
  weatherResistance: string;
  fireRating?: string;
  recycledContent?: number; // %
  embodiedCarbon?: number; // kg CO₂/unit
  voc?: number; // g/L
}

// Construction Details
export interface ConstructionPhase {
  id: string;
  name: string;
  sequence: number;
  description: string;
  duration: number; // days
  dependencies: string[];
  resources: PhaseResource[];
  deliverables: string[];
  qualityChecks: QualityCheck[];
}

export interface PhaseResource {
  type: 'labor' | 'equipment' | 'material';
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface QualityCheck {
  id: string;
  type: 'visual' | 'dimensional' | 'functional' | 'material' | 'safety';
  description: string;
  criteria: string[];
  frequency: string;
  responsibility: string;
  documentation: string[];
}

// CAD Integration
export interface CADLayer {
  name: string;
  description: string;
  color: string;
  lineType: string;
  lineWeight: number;
  visible: boolean;
  locked: boolean;
  plotStyle: string;
  elements: string[]; // Element IDs
}

export interface CADBlock {
  id: string;
  name: string;
  description: string;
  insertionPoint: Point2D;
  scale: { x: number; y: number };
  rotation: number; // degrees
  attributes: CADAttribute[];
  elements: DrawingElement[];
}

export interface CADAttribute {
  tag: string;
  value: string;
  position: Point2D;
  formatting: TextFormatting;
  visible: boolean;
}

// Professional Workflow
export interface ReviewCycle {
  id: string;
  type: 'internal' | 'client' | 'authority' | 'peer';
  phase: string;
  reviewer: {
    name: string;
    role: string;
    credentials?: string;
  };
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'requires_changes';
  submittedDate: Date;
  reviewDate?: Date;
  comments: ReviewComment[];
  conditions?: string[];
}

export interface ReviewComment {
  id: string;
  type: 'general' | 'specific' | 'markup';
  severity: 'info' | 'warning' | 'error' | 'critical';
  location?: {
    sheet: string;
    coordinates: Point2D;
    element?: string;
  };
  comment: string;
  recommendation?: string;
  status: 'open' | 'addressed' | 'resolved' | 'deferred';
  created: Date;
  resolved?: Date;
}

// Export formats and options
export interface ExportOptions {
  format: 'PDF' | 'DWG' | 'DXF' | 'PNG' | 'JPEG' | 'SVG' | 'TIFF';
  version?: string; // For CAD formats
  scale: number;
  paperSize: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'B1' | 'ARCH_D' | 'ARCH_E' | 'CUSTOM';
  customSize?: { width: number; height: number };
  resolution?: number; // DPI for raster formats
  colorMode: 'RGB' | 'CMYK' | 'Grayscale' | 'Monochrome';
  layers?: string[]; // Specific layers to export
  plotStyle?: string;
  margins: { top: number; right: number; bottom: number; left: number };
  watermark?: {
    text: string;
    opacity: number;
    position: 'center' | 'corner';
  };
}

// Validation Results
export interface ValidationResult {
  id: string;
  elementId?: string;
  type: 'error' | 'warning' | 'info';
  category: 'geometry' | 'annotation' | 'standards' | 'completeness';
  message: string;
  description: string;
  recommendation: string;
  severity: 'critical' | 'major' | 'minor';
  autoFixAvailable: boolean;
  location?: Point2D;
  affectedElements: string[];
}

// Professional Calculations
export interface CalculationReference {
  id: string;
  type: 'structural' | 'mechanical' | 'electrical' | 'thermal' | 'hydraulic';
  standard: string;
  formula: string;
  variables: CalculationVariable[];
  result: CalculationResult;
  assumptions: string[];
  references: string[];
  verifiedBy?: string;
  verifiedDate?: Date;
}

export interface CalculationVariable {
  symbol: string;
  description: string;
  value: number;
  unit: string;
  source: 'user_input' | 'code_requirement' | 'manufacturer_data' | 'calculated';
}

export interface CalculationResult {
  value: number;
  unit: string;
  status: 'acceptable' | 'marginal' | 'unacceptable';
  safetyFactor?: number;
  notes?: string[];
}

// Utility Types
export type Coordinates2D = [number, number];
export type Coordinates3D = [number, number, number];
export type Matrix2D = [number, number, number, number, number, number];
export type Matrix3D = number[][];

// Constants
export const PROFESSIONAL_STANDARDS = {
  DRAWING_SCALES: ['1:1', '1:2', '1:5', '1:10', '1:20', '1:50', '1:100', '1:200', '1:500'],
  PAPER_SIZES: {
    A0: { width: 841, height: 1189 },
    A1: { width: 594, height: 841 },
    A2: { width: 420, height: 594 },
    A3: { width: 297, height: 420 },
    A4: { width: 210, height: 297 },
    ARCH_D: { width: 610, height: 914 },
    ARCH_E: { width: 914, height: 1219 }
  },
  LINE_WEIGHTS: [0.13, 0.18, 0.25, 0.35, 0.5, 0.7, 1.0, 1.4, 2.0],
  TEXT_SIZES: [1.5, 2.0, 2.5, 3.0, 3.5, 5.0, 7.0, 10.0]
} as const;

export default {
  ProfessionalStandard,
  StandardRequirement,
  DrawingElement,
  TitleBlockInfo,
  ProfessionalStamp,
  ComplianceTag,
  QualityMetric,
  MaterialCategory,
  ConstructionPhase,
  ReviewCycle,
  ValidationResult,
  CalculationReference,
  PROFESSIONAL_STANDARDS
};