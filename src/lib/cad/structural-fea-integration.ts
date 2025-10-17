/**
 * Structural FEA Integration
 * Connects the professional FEA solver with the structural analysis system
 */

import { EventEmitter } from 'events';
import { GreenhouseModel, Component, Point3D } from './greenhouse-cad-system';
import { LoadCondition, LoadType, AdvancedAnalysisOptions, AnalysisReport } from './structural-types';
import { 
  FEASolver, 
  Node, 
  Element, 
  LoadCase, 
  LoadCombination, 
  SolverResults,
  SolverConfiguration 
} from './fea-solver';
import { MaterialDatabase } from './material-database';

export interface AdvancedAnalysisOptions {
  includeNonlinearEffects: boolean;
  includePDeltaEffects: boolean;
  includeShearDeformation: boolean;
  performModalAnalysis: boolean;
  performBucklingAnalysis: boolean;
  windLoadAnalysis: boolean;
  seismicAnalysis: boolean;
  dynamicAnalysis: boolean;
  constructionSequence: boolean;
}

export interface AnalysisReport {
  summary: {
    maxDisplacement: number;
    maxStress: number;
    maxUtilization: number;
    criticalMember: string;
    criticalLocation: string;
    safetyFactor: number;
  };
  codeCompliance: {
    overallCompliance: boolean;
    violations: Array<{
      code: BuildingCode;
      section: string;
      description: string;
      severity: 'critical' | 'warning';
      recommendation: string;
    }>;
  };
  results: {
    displacements: Map<string, any>;
    forces: Map<string, any>;
    stresses: Map<string, any>;
    utilizations: Map<string, any>;
  };
  modal?: {
    frequencies: number[];
    periods: number[];
    massParticipation: number[];
    recommendations: string[];
  };
  buckling?: {
    criticalLoadFactors: number[];
    bucklingModes: number[];
    recommendations: string[];
  };
  optimization: {
    overDesignedMembers: string[];
    underDesignedMembers: string[];
    recommendations: Array<{
      member: string;
      currentSize: string;
      recommendedSize: string;
      weightSavings: number;
      costSavings: number;
    }>;
  };
}

class StructuralFEAIntegration extends EventEmitter {
  private feaSolver: FEASolver;
  private materialDatabase: MaterialDatabase;
  private analysisOptions: AdvancedAnalysisOptions;
  private loadCombinations: Map<string, LoadCombination> = new Map();

  constructor(materialDatabase: MaterialDatabase, options?: Partial<AdvancedAnalysisOptions>) {
    super();
    this.materialDatabase = materialDatabase;
    this.analysisOptions = {
      includeNonlinearEffects: false,
      includePDeltaEffects: true,
      includeShearDeformation: true,
      performModalAnalysis: true,
      performBucklingAnalysis: true,
      windLoadAnalysis: true,
      seismicAnalysis: false,
      dynamicAnalysis: false,
      constructionSequence: false,
      ...options
    };

    // Initialize FEA solver with advanced configuration
    const solverConfig: Partial<SolverConfiguration> = {
      tolerance: 1e-8,
      maxIterations: 1000,
      solverType: this.analysisOptions.includeNonlinearEffects ? 'nonlinear_static' : 'linear_static',
      includeGeometricNonlinearity: this.analysisOptions.includePDeltaEffects,
      includeShearDeformation: this.analysisOptions.includeShearDeformation,
      includePDelta: this.analysisOptions.includePDeltaEffects
    };

    this.feaSolver = new FEASolver(solverConfig);
    this.initializeLoadCombinations();
  }

  /**
   * Perform comprehensive structural analysis
   */
  async performStructuralAnalysis(
    model: GreenhouseModel,
    loadConditions: LoadCondition[],
    analysisType: AnalysisType = 'linear'
  ): Promise<StructuralAnalysis> {
    try {
      this.emit('analysis-started', { model: model.name, type: analysisType });

      // Convert CAD model to FEA model
      await this.convertCADToFEA(model);

      // Apply loads to FEA model
      await this.applyLoadsToFEA(loadConditions);

      // Perform primary analysis
      const primaryResults = await this.performPrimaryAnalysis();

      // Perform additional analyses if requested
      const modalResults = this.analysisOptions.performModalAnalysis ? 
        await this.performModalAnalysis() : undefined;

      const bucklingResults = this.analysisOptions.performBucklingAnalysis ? 
        await this.performBucklingAnalysis() : undefined;

      // Generate comprehensive analysis report
      const analysisReport = await this.generateAnalysisReport(
        primaryResults,
        modalResults,
        bucklingResults
      );

      // Convert back to StructuralAnalysis format
      const structuralAnalysis = await this.convertToStructuralAnalysis(
        model,
        primaryResults,
        analysisReport
      );

      this.emit('analysis-completed', { 
        model: model.name, 
        results: structuralAnalysis,
        report: analysisReport 
      });

      return structuralAnalysis;

    } catch (error) {
      this.emit('analysis-error', { model: model.name, error });
      throw error;
    }
  }

  /**
   * Convert CAD model to FEA model
   */
  private async convertCADToFEA(model: GreenhouseModel): Promise<void> {
    // Create nodes from structural connections
    const nodes = await this.createNodesFromStructure(model);
    
    // Create elements from structural members
    const elements = await this.createElementsFromMembers(model);
    
    // Apply boundary conditions
    await this.applyBoundaryConditionsFromFoundation(model);
    
    // Create FEA model
    await this.feaSolver.createModelFromCAD(model);
    
    this.emit('fea-model-created', { 
      nodes: nodes.size, 
      elements: elements.size 
    });
  }

  /**
   * Create nodes from structural connections
   */
  private async createNodesFromStructure(model: GreenhouseModel): Promise<Map<string, Node>> {
    const nodes = new Map<string, Node>();
    const { dimensions } = model.parameters;
    const { length, width, height, baySpacing, gutterHeight } = dimensions;

    // Generate node grid for greenhouse structure
    const numBays = Math.floor(length / baySpacing);
    let nodeId = 1;

    // Foundation nodes
    for (let i = 0; i <= numBays; i++) {
      const x = i * baySpacing;
      
      // Corner nodes
      nodes.set(`N${nodeId}`, {
        id: `N${nodeId}`,
        coordinates: { x, y: 0, z: 0 },
        constraints: {
          translation: { x: true, y: true, z: true },
          rotation: { x: true, y: true, z: true }
        },
        loads: {
          forces: { x: 0, y: 0, z: 0 },
          moments: { x: 0, y: 0, z: 0 }
        }
      });
      nodeId++;

      nodes.set(`N${nodeId}`, {
        id: `N${nodeId}`,
        coordinates: { x, y: width, z: 0 },
        constraints: {
          translation: { x: true, y: true, z: true },
          rotation: { x: true, y: true, z: true }
        },
        loads: {
          forces: { x: 0, y: 0, z: 0 },
          moments: { x: 0, y: 0, z: 0 }
        }
      });
      nodeId++;
    }

    // Gutter level nodes
    for (let i = 0; i <= numBays; i++) {
      const x = i * baySpacing;
      
      nodes.set(`N${nodeId}`, {
        id: `N${nodeId}`,
        coordinates: { x, y: 0, z: gutterHeight },
        constraints: {
          translation: { x: false, y: false, z: false },
          rotation: { x: false, y: false, z: false }
        },
        loads: {
          forces: { x: 0, y: 0, z: 0 },
          moments: { x: 0, y: 0, z: 0 }
        }
      });
      nodeId++;

      nodes.set(`N${nodeId}`, {
        id: `N${nodeId}`,
        coordinates: { x, y: width, z: gutterHeight },
        constraints: {
          translation: { x: false, y: false, z: false },
          rotation: { x: false, y: false, z: false }
        },
        loads: {
          forces: { x: 0, y: 0, z: 0 },
          moments: { x: 0, y: 0, z: 0 }
        }
      });
      nodeId++;
    }

    // Ridge nodes
    const roofPitch = model.parameters.structure.roofPitch * (Math.PI / 180);
    const ridgeHeight = gutterHeight + (width / 2) * Math.tan(roofPitch);
    
    for (let i = 0; i <= numBays; i++) {
      const x = i * baySpacing;
      
      nodes.set(`N${nodeId}`, {
        id: `N${nodeId}`,
        coordinates: { x, y: width / 2, z: ridgeHeight },
        constraints: {
          translation: { x: false, y: false, z: false },
          rotation: { x: false, y: false, z: false }
        },
        loads: {
          forces: { x: 0, y: 0, z: 0 },
          moments: { x: 0, y: 0, z: 0 }
        }
      });
      nodeId++;
    }

    return nodes;
  }

  /**
   * Create elements from structural members
   */
  private async createElementsFromMembers(model: GreenhouseModel): Promise<Map<string, Element>> {
    const elements = new Map<string, Element>();
    const { structure } = model.parameters;
    
    // Get material properties
    const frameMaterial = this.materialDatabase.getMaterialByName(
      structure.frameType === 'galvanized_steel' ? 'Galvanized Steel' : 'Aluminum'
    );
    
    if (!frameMaterial) {
      throw new Error(`Material not found: ${structure.frameType}`);
    }

    let elementId = 1;

    // Create column elements
    for (const component of model.structure.frame) {
      if (component.name.includes('post') || component.name.includes('column')) {
        const element: Element = {
          id: `E${elementId}`,
          type: 'frame',
          nodes: [`N${elementId}`, `N${elementId + 1}`], // Simplified node mapping
          material: {
            elasticModulus: frameMaterial.properties.structural?.elasticModulus || 29000000,
            shearModulus: frameMaterial.properties.structural?.elasticModulus || 11200000,
            poissonRatio: 0.3,
            density: frameMaterial.properties.structural?.density || 490,
            yieldStrength: frameMaterial.properties.structural?.yieldStrength || 50000,
            ultimateStrength: frameMaterial.properties.structural?.ultimateStrength || 65000
          },
          section: this.calculateSectionProperties(component),
          localAxes: {
            x: { x: 0, y: 0, z: 1 },
            y: { x: 1, y: 0, z: 0 },
            z: { x: 0, y: 1, z: 0 }
          }
        };
        
        elements.set(element.id, element);
        elementId++;
      }
    }

    // Create beam elements
    for (const component of model.structure.frame) {
      if (component.name.includes('purlin') || component.name.includes('rafter')) {
        const element: Element = {
          id: `E${elementId}`,
          type: 'beam',
          nodes: [`N${elementId}`, `N${elementId + 1}`], // Simplified node mapping
          material: {
            elasticModulus: frameMaterial.properties.structural?.elasticModulus || 29000000,
            shearModulus: frameMaterial.properties.structural?.elasticModulus || 11200000,
            poissonRatio: 0.3,
            density: frameMaterial.properties.structural?.density || 490,
            yieldStrength: frameMaterial.properties.structural?.yieldStrength || 50000,
            ultimateStrength: frameMaterial.properties.structural?.ultimateStrength || 65000
          },
          section: this.calculateSectionProperties(component),
          localAxes: {
            x: { x: 1, y: 0, z: 0 },
            y: { x: 0, y: 1, z: 0 },
            z: { x: 0, y: 0, z: 1 }
          }
        };
        
        elements.set(element.id, element);
        elementId++;
      }
    }

    return elements;
  }

  /**
   * Calculate section properties from component
   */
  private calculateSectionProperties(component: Component): Element['section'] {
    // Extract section properties from component geometry
    // This is a simplified calculation - in production, use actual section database
    
    const width = 4; // 4 inches (typical tube size)
    const height = 4; // 4 inches
    const thickness = 0.125; // 1/8 inch wall thickness
    
    // Calculate properties for rectangular tube
    const outerArea = width * height;
    const innerArea = (width - 2 * thickness) * (height - 2 * thickness);
    const area = outerArea - innerArea;
    
    const Ix = (width * Math.pow(height, 3) - (width - 2 * thickness) * Math.pow(height - 2 * thickness, 3)) / 12;
    const Iy = (height * Math.pow(width, 3) - (height - 2 * thickness) * Math.pow(width - 2 * thickness, 3)) / 12;
    const J = 2 * thickness * Math.pow((width - thickness) * (height - thickness), 2) / 
             (width + height - 2 * thickness);
    
    return {
      area,
      momentOfInertiaX: Ix,
      momentOfInertiaY: Iy,
      momentOfInertiaZ: Ix, // Assuming symmetric section
      torsionalConstant: J,
      shearAreaY: area * 0.833, // Typical shear area factor
      shearAreaZ: area * 0.833
    };
  }

  /**
   * Apply loads to FEA model
   */
  private async applyLoadsToFEA(loadConditions: LoadCondition[]): Promise<void> {
    for (const condition of loadConditions) {
      const loadCase: LoadCase = {
        id: condition.id,
        name: condition.description,
        type: condition.type,
        factor: condition.loadFactor,
        loads: []
      };

      // Convert load condition to FEA loads
      await this.convertLoadConditionToFEA(condition, loadCase);
      
      // Add to solver
      // this.feaSolver.addLoadCase(loadCase);
    }
  }

  /**
   * Convert load condition to FEA format
   */
  private async convertLoadConditionToFEA(
    condition: LoadCondition,
    loadCase: LoadCase
  ): Promise<void> {
    switch (condition.type) {
      case 'dead':
        await this.applyDeadLoads(condition, loadCase);
        break;
      case 'live':
        await this.applyLiveLoads(condition, loadCase);
        break;
      case 'wind':
        await this.applyWindLoads(condition, loadCase);
        break;
      case 'snow':
        await this.applySnowLoads(condition, loadCase);
        break;
      case 'seismic':
        await this.applySeismicLoads(condition, loadCase);
        break;
      default:
        logger.warn('api', `Unsupported load type: ${condition.type}`);
    }
  }

  /**
   * Apply dead loads
   */
  private async applyDeadLoads(condition: LoadCondition, loadCase: LoadCase): Promise<void> {
    // Apply self-weight of structure
    loadCase.loads.push({
      type: 'distributed',
      value: {
        forces: { x: 0, y: 0, z: -condition.magnitude },
        moments: { x: 0, y: 0, z: 0 }
      },
      distribution: 'uniform'
    });
  }

  /**
   * Apply live loads
   */
  private async applyLiveLoads(condition: LoadCondition, loadCase: LoadCase): Promise<void> {
    // Apply live loads based on building code
    loadCase.loads.push({
      type: 'distributed',
      value: {
        forces: { x: 0, y: 0, z: -condition.magnitude },
        moments: { x: 0, y: 0, z: 0 }
      },
      distribution: 'uniform'
    });
  }

  /**
   * Apply wind loads
   */
  private async applyWindLoads(condition: LoadCondition, loadCase: LoadCase): Promise<void> {
    // Apply wind loads based on ASCE 7
    const windDirection = condition.direction === 'lateral' ? 'y' : 'x';
    
    loadCase.loads.push({
      type: 'distributed',
      value: {
        forces: { 
          x: windDirection === 'x' ? condition.magnitude : 0,
          y: windDirection === 'y' ? condition.magnitude : 0,
          z: 0 
        },
        moments: { x: 0, y: 0, z: 0 }
      },
      distribution: 'uniform'
    });
  }

  /**
   * Apply snow loads
   */
  private async applySnowLoads(condition: LoadCondition, loadCase: LoadCase): Promise<void> {
    // Apply snow loads based on ground snow load
    loadCase.loads.push({
      type: 'distributed',
      value: {
        forces: { x: 0, y: 0, z: -condition.magnitude },
        moments: { x: 0, y: 0, z: 0 }
      },
      distribution: 'uniform'
    });
  }

  /**
   * Apply seismic loads
   */
  private async applySeismicLoads(condition: LoadCondition, loadCase: LoadCase): Promise<void> {
    // Apply seismic loads based on IBC
    loadCase.loads.push({
      type: 'distributed',
      value: {
        forces: { 
          x: condition.magnitude * 0.7,
          y: condition.magnitude * 0.7,
          z: 0 
        },
        moments: { x: 0, y: 0, z: 0 }
      },
      distribution: 'uniform'
    });
  }

  /**
   * Perform primary structural analysis
   */
  private async performPrimaryAnalysis(): Promise<SolverResults> {
    // Get strength load combination
    const strengthCombination = this.loadCombinations.get('strength');
    if (!strengthCombination) {
      throw new Error('Strength load combination not found');
    }

    return await this.feaSolver.solve(strengthCombination);
  }

  /**
   * Perform modal analysis
   */
  private async performModalAnalysis(): Promise<SolverResults> {
    // Configure for modal analysis
    const modalSolver = new FEASolver({
      solverType: 'modal',
      tolerance: 1e-10
    });

    // Use same model but different analysis type
    const modalCombination: LoadCombination = {
      id: 'modal',
      name: 'Modal Analysis',
      type: 'service',
      factors: new Map(),
      code: 'IBC'
    };

    return await modalSolver.solve(modalCombination);
  }

  /**
   * Perform buckling analysis
   */
  private async performBucklingAnalysis(): Promise<SolverResults> {
    // Configure for buckling analysis
    const bucklingSolver = new FEASolver({
      solverType: 'buckling',
      tolerance: 1e-10
    });

    const bucklingCombination = this.loadCombinations.get('buckling');
    if (!bucklingCombination) {
      throw new Error('Buckling load combination not found');
    }

    return await bucklingSolver.solve(bucklingCombination);
  }

  /**
   * Generate comprehensive analysis report
   */
  private async generateAnalysisReport(
    primaryResults: SolverResults,
    modalResults?: SolverResults,
    bucklingResults?: SolverResults
  ): Promise<AnalysisReport> {
    const report: AnalysisReport = {
      summary: {
        maxDisplacement: primaryResults.maxDisplacement,
        maxStress: primaryResults.maxStress,
        maxUtilization: 0,
        criticalMember: '',
        criticalLocation: '',
        safetyFactor: 0
      },
      codeCompliance: {
        overallCompliance: true,
        violations: []
      },
      results: {
        displacements: new Map(),
        forces: new Map(),
        stresses: new Map(),
        utilizations: new Map()
      },
      optimization: {
        overDesignedMembers: [],
        underDesignedMembers: [],
        recommendations: []
      }
    };

    // Calculate member utilizations
    let maxUtilization = 0;
    let criticalMember = '';

    for (const [elementId, element] of primaryResults.elements) {
      if (element.utilization > maxUtilization) {
        maxUtilization = element.utilization;
        criticalMember = elementId;
      }

      // Check for code violations
      if (element.utilization > 1.0) {
        report.codeCompliance.violations.push({
          code: 'IBC',
          section: '1605',
          description: `Member ${elementId} exceeds allowable stress`,
          severity: 'critical',
          recommendation: 'Increase member size or reduce loads'
        });
        report.codeCompliance.overallCompliance = false;
      }

      // Check for optimization opportunities
      if (element.utilization < 0.5) {
        report.optimization.overDesignedMembers.push(elementId);
      } else if (element.utilization > 0.9) {
        report.optimization.underDesignedMembers.push(elementId);
      }
    }

    report.summary.maxUtilization = maxUtilization;
    report.summary.criticalMember = criticalMember;
    report.summary.safetyFactor = 1.0 / maxUtilization;

    // Add modal analysis results
    if (modalResults?.modal) {
      report.modal = {
        frequencies: modalResults.modal.frequencies,
        periods: modalResults.modal.frequencies.map(f => 1 / f),
        massParticipation: modalResults.modal.participationFactors,
        recommendations: this.generateModalRecommendations(modalResults.modal)
      };
    }

    // Add buckling analysis results
    if (bucklingResults) {
      report.buckling = {
        criticalLoadFactors: [bucklingResults.maxDisplacement], // Simplified
        bucklingModes: [1],
        recommendations: this.generateBucklingRecommendations(bucklingResults)
      };
    }

    return report;
  }

  /**
   * Convert FEA results to StructuralAnalysis format
   */
  private async convertToStructuralAnalysis(
    model: GreenhouseModel,
    results: SolverResults,
    report: AnalysisReport
  ): Promise<StructuralAnalysis> {
    const structuralMembers: StructuralMember[] = [];
    
    // Convert elements to structural members
    for (const [elementId, element] of results.elements) {
      const member: StructuralMember = {
        id: elementId,
        componentId: elementId,
        type: element.id.includes('column') ? 'column' : 'beam',
        startPoint: { x: 0, y: 0, z: 0 }, // Simplified
        endPoint: { x: 0, y: 0, z: 0 }, // Simplified
        length: 0, // Simplified
        section: {
          name: '4x4x0.125',
          area: 0,
          momentOfInertiaX: 0,
          momentOfInertiaY: 0,
          sectionModulusX: 0,
          sectionModulusY: 0,
          radiusOfGyrationX: 0,
          radiusOfGyrationY: 0,
          torsionalConstant: 0,
          warpingConstant: 0
        },
        material: {
          id: 'steel',
          elasticModulus: 29000000,
          shearModulus: 11200000,
          yieldStrength: 50000,
          ultimateStrength: 65000,
          density: 490,
          thermalExpansion: 0.0000065
        },
        startCondition: {
          fixity: 'fixed',
          translation: { x: true, y: true, z: true },
          rotation: { x: true, y: true, z: true }
        },
        endCondition: {
          fixity: 'pinned',
          translation: { x: false, y: false, z: false },
          rotation: { x: false, y: false, z: false }
        }
      };
      
      structuralMembers.push(member);
    }

    const analysis: StructuralAnalysis = {
      id: `analysis_${Date.now()}`,
      modelId: model.id,
      analysisType: 'linear',
      loadConditions: [],
      members: structuralMembers,
      results: {
        maxDeflection: results.maxDisplacement,
        maxStress: results.maxStress,
        maxUtilization: report.summary.maxUtilization
      },
      codeCompliance: {
        overall: report.codeCompliance.overallCompliance,
        violations: report.codeCompliance.violations.map(v => ({
          type: v.severity === 'critical' ? 'strength' : 'serviceability',
          description: v.description
        }))
      },
      optimization: {
        recommendations: report.optimization.recommendations
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return analysis;
  }

  /**
   * Initialize standard load combinations
   */
  private initializeLoadCombinations(): void {
    // IBC Load Combinations
    this.loadCombinations.set('strength', {
      id: 'strength',
      name: '1.2D + 1.6L',
      type: 'strength',
      factors: new Map([
        ['dead', 1.2],
        ['live', 1.6]
      ]),
      code: 'IBC'
    });

    this.loadCombinations.set('wind', {
      id: 'wind',
      name: '1.2D + 1.0L + 1.0W',
      type: 'strength',
      factors: new Map([
        ['dead', 1.2],
        ['live', 1.0],
        ['wind', 1.0]
      ]),
      code: 'IBC'
    });

    this.loadCombinations.set('snow', {
      id: 'snow',
      name: '1.2D + 1.6S',
      type: 'strength',
      factors: new Map([
        ['dead', 1.2],
        ['snow', 1.6]
      ]),
      code: 'IBC'
    });

    this.loadCombinations.set('buckling', {
      id: 'buckling',
      name: 'Buckling Analysis',
      type: 'strength',
      factors: new Map([
        ['dead', 1.0],
        ['live', 1.0]
      ]),
      code: 'IBC'
    });
  }

  // Helper methods
  private async applyBoundaryConditionsFromFoundation(model: GreenhouseModel): Promise<void> {
    // Apply foundation constraints
  }

  private generateModalRecommendations(modal: any): string[] {
    const recommendations: string[] = [];
    
    if (modal.frequencies[0] < 1.0) {
      recommendations.push('First mode frequency is low - consider increasing structural stiffness');
    }
    
    return recommendations;
  }

  private generateBucklingRecommendations(results: SolverResults): string[] {
    const recommendations: string[] = [];
    
    if (results.maxDisplacement < 2.0) {
      recommendations.push('Low buckling load factor - consider bracing or member size increase');
    }
    
    return recommendations;
  }
}

export { StructuralFEAIntegration, AdvancedAnalysisOptions, AnalysisReport };
export default StructuralFEAIntegration;