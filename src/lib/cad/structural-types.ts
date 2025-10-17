/**
 * Shared Structural Analysis Types
 * Extracted to break circular dependencies
 */

export type LoadType = 'dead' | 'live' | 'wind' | 'snow' | 'seismic' | 'thermal' | 'equipment';

export interface LoadCondition {
  id: string;
  type: LoadType;
  magnitude: number;
  direction: {
    x: number;
    y: number;
    z: number;
  };
  distributionType: 'point' | 'distributed' | 'uniform';
  area?: string; // Reference to component/area
}

export interface MaterialProperties {
  density: number; // kg/m³
  elasticModulus: number; // GPa
  poissonRatio: number;
  yieldStrength: number; // MPa
  ultimateStrength: number; // MPa
  thermalExpansion: number; // 1/°C
}

export interface AdvancedAnalysisOptions {
  analysisType: 'static' | 'dynamic' | 'buckling' | 'modal' | 'thermal' | 'nonlinear';
  meshSize: 'coarse' | 'medium' | 'fine' | 'extra_fine';
  solverType: 'direct' | 'iterative' | 'modal';
  convergenceTolerance: number;
  maxIterations: number;
  includeGeometricNonlinearity: boolean;
  includeMaterialNonlinearity: boolean;
  includeContactAnalysis: boolean;
  dampingRatio?: number;
  frequencyRange?: { min: number; max: number };
  timeSteps?: number;
  timeStep?: number;
}

export interface AnalysisReport {
  id: string;
  timestamp: Date;
  analysisType: string;
  summary: {
    maxStress: number;
    maxDeflection: number;
    safetyFactor: number;
    totalWeight: number;
    materialCost: number;
  };
  details: any;
  recommendations: string[];
  warnings: string[];
  codeCompliance: {
    passed: boolean;
    standard: string;
    violations: string[];
  };
}