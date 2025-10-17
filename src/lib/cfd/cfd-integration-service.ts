/**
 * CFD Integration Service
 * Connects the real CFD physics engine to UI components
 */

import { CFDEngine } from './cfd-engine';
import type { 
  CFDConfig, 
  BoundaryCondition, 
  HeatSource, 
  CFDResult 
} from './cfd-engine';

export interface CFDSetupData {
  domain: {
    dimensions: {
      length: number;  // meters
      width: number;   // meters
      height: number;  // meters
    };
  };
  meshSettings: {
    cellSize: number;  // meters
    refinementLevel: number;
  };
  solverSettings: {
    iterations: number;
    timeStep: number;
    convergenceCriteria: {
      continuity: number;
      momentum: number;
      energy: number;
    };
  };
  physics: {
    turbulenceModel: 'laminar' | 'k-epsilon' | 'k-omega';
    gravity: boolean;
    buoyancy: boolean;
    radiation: boolean;
  };
  hvacUnits: Array<{
    position: { x: number; y: number; z: number };
    airflow: number;  // CFM
    supplyTemperature: number;  // Celsius
    type: 'supply' | 'return' | 'exhaust';
  }>;
  fans: Array<{
    position: { x: number; y: number; z: number };
    airflow: number;  // CFM
    direction: { x: number; y: number; z: number };
  }>;
  lights: Array<{
    position: { x: number; y: number; z: number };
    wattage: number;
    efficiency: number;  // 0-1 (PPE)
  }>;
  plants?: Array<{
    position: { x: number; y: number; z: number };
    size: { width: number; height: number; depth: number };
    transpiration: number;  // kg/hr water
  }>;
}

export interface CFDSimulationResult {
  velocityField: {
    magnitude: number[][][];
    vectors: { u: number; v: number; w: number }[][][];
  };
  temperatureField: number[][][];
  pressureField: number[][][];
  humidityField?: number[][][];
  turbulenceField?: {
    k: number[][][];      // Turbulent kinetic energy
    epsilon: number[][][]; // Dissipation rate
    intensity: number[][][];
  };
  statistics: {
    velocity: {
      min: number;
      max: number;
      avg: number;
      uniformityIndex: number;
    };
    temperature: {
      min: number;
      max: number;
      avg: number;
      uniformityIndex: number;
    };
    pressure: {
      min: number;
      max: number;
      avg: number;
    };
    airChangeRate: number;
    ventilationEffectiveness: number;
  };
  convergenceHistory: {
    iteration: number[];
    continuity: number[];
    momentum: number[];
    energy: number[];
    turbulence: number[];
  };
  recommendations: Array<{
    category: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    action: string;
  }>;
}

export class CFDIntegrationService {
  private engine: CFDEngine | null = null;
  private setupData: CFDSetupData | null = null;
  
  /**
   * Initialize CFD engine with setup data
   */
  async initialize(setup: CFDSetupData): Promise<void> {
    this.setupData = setup;
    
    // Calculate grid size based on domain and cell size
    const gridSizeX = Math.ceil(setup.domain.dimensions.length / setup.meshSettings.cellSize);
    const gridSizeY = Math.ceil(setup.domain.dimensions.width / setup.meshSettings.cellSize);
    const gridSizeZ = Math.ceil(setup.domain.dimensions.height / setup.meshSettings.cellSize);
    
    // Create CFD configuration
    const config: CFDConfig = {
      gridSizeX,
      gridSizeY,
      gridSizeZ,
      cellSize: setup.meshSettings.cellSize,
      airDensity: 1.225,  // kg/m³ at sea level
      airViscosity: setup.physics.turbulenceModel === 'laminar' ? 1.8e-5 : 1.5e-5,
      thermalDiffusivity: 2.2e-5,  // m²/s for air
      timeStep: setup.solverSettings.timeStep || 0.1,
      iterations: setup.solverSettings.iterations || 1000,
      convergenceTolerance: setup.solverSettings.convergenceCriteria.continuity || 1e-4,
      ambientTemperature: 20,  // Default ambient temp
      ambientPressure: 101325  // Pa
    };
    
    // Create engine instance
    this.engine = new CFDEngine(config);
    
    // Add boundary conditions from HVAC units
    this.addHVACBoundaries();
    
    // Add fan boundaries
    this.addFanBoundaries();
    
    // Add heat sources from lights
    this.addLightHeatSources();
    
    // Add plant transpiration if applicable
    if (setup.plants && setup.plants.length > 0) {
      this.addPlantEffects();
    }
  }
  
  /**
   * Convert CFM to m/s velocity based on area
   */
  private cfmToVelocity(cfm: number, area: number): number {
    const cubicMetersPerSecond = cfm * 0.000471947;  // Convert CFM to m³/s
    return cubicMetersPerSecond / area;  // Velocity = flow rate / area
  }
  
  /**
   * Add HVAC unit boundary conditions
   */
  private addHVACBoundaries(): void {
    if (!this.engine || !this.setupData) return;
    
    for (const unit of this.setupData.hvacUnits) {
      // Estimate vent area based on typical commercial diffuser
      const ventArea = 0.3 * 0.3;  // 0.09 m² (roughly 1ft x 1ft)
      const velocity = this.cfmToVelocity(unit.airflow, ventArea);
      
      let type: 'inlet' | 'outlet' | 'wall' = 'inlet';
      let velocityVector = { x: 0, y: 0, z: -1 };  // Default downward
      
      if (unit.type === 'return' || unit.type === 'exhaust') {
        type = 'outlet';
        velocityVector = { x: 0, y: 0, z: 1 };  // Upward for return
      }
      
      const boundary: BoundaryCondition = {
        type,
        position: unit.position,
        properties: {
          velocity: Math.abs(velocity),
          temperature: unit.supplyTemperature,
          direction: velocityVector
        }
      };
      
      this.engine.addBoundary(boundary);
    }
  }
  
  /**
   * Add fan boundary conditions
   */
  private addFanBoundaries(): void {
    if (!this.engine || !this.setupData) return;
    
    for (const fan of this.setupData.fans) {
      // Estimate fan area based on typical sizes
      const fanArea = Math.PI * 0.3 * 0.3;  // ~0.28 m² (24" diameter fan)
      const velocity = this.cfmToVelocity(fan.airflow, fanArea);
      
      const boundary: BoundaryCondition = {
        type: 'inlet',
        position: fan.position,
        properties: {
          velocity,
          temperature: 20,  // Ambient temp for circulation fans
          direction: fan.direction
        }
      };
      
      this.engine.addBoundary(boundary);
    }
  }
  
  /**
   * Add heat sources from lighting fixtures
   */
  private addLightHeatSources(): void {
    if (!this.engine || !this.setupData) return;
    
    for (const light of this.setupData.lights) {
      // Calculate heat generation (watts not converted to PAR)
      const heatGeneration = light.wattage * (1 - light.efficiency);
      
      const heatSource: HeatSource = {
        position: light.position,
        size: {
          width: 1.2,   // Typical LED fixture width
          height: 0.1,  // Typical LED fixture height
          depth: 0.6    // Typical LED fixture depth
        },
        power: heatGeneration
      };
      
      this.engine.addHeatSource(heatSource);
    }
  }
  
  /**
   * Add plant transpiration effects
   */
  private addPlantEffects(): void {
    if (!this.engine || !this.setupData?.plants) return;
    
    for (const plant of this.setupData.plants) {
      // Plants act as moisture sources and slight heat sinks
      // Transpiration cooling effect: ~2,260 kJ/kg of water
      const coolingPower = -(plant.transpiration * 2260000 / 3600);  // Convert to watts (negative = cooling)
      
      const plantEffect: HeatSource = {
        position: plant.position,
        size: plant.size,
        power: coolingPower
      };
      
      this.engine.addHeatSource(plantEffect);
    }
  }
  
  /**
   * Run the CFD simulation
   */
  async runSimulation(
    onProgress?: (progress: number, iteration: number) => void
  ): Promise<CFDSimulationResult> {
    if (!this.engine) {
      throw new Error('CFD engine not initialized. Call initialize() first.');
    }
    
    // Run simulation with progress callback
    const result = await this.engine.simulate(onProgress);
    
    // Convert engine result to UI-friendly format
    return this.convertResult(result);
  }
  
  /**
   * Convert CFD engine result to UI format
   */
  private convertResult(engineResult: CFDResult): CFDSimulationResult {
    const { velocity, temperature, pressure } = engineResult;
    
    // Calculate field dimensions
    const dims = {
      x: velocity.u.length,
      y: velocity.u[0]?.length || 0,
      z: velocity.u[0]?.[0]?.length || 0
    };
    
    // Initialize 3D arrays for fields
    const velocityMagnitude: number[][][] = [];
    const velocityVectors: { u: number; v: number; w: number }[][][] = [];
    const tempField: number[][][] = [];
    const pressureField: number[][][] = [];
    
    // Convert flat arrays to 3D arrays and calculate magnitude
    for (let i = 0; i < dims.x; i++) {
      velocityMagnitude[i] = [];
      velocityVectors[i] = [];
      tempField[i] = [];
      pressureField[i] = [];
      
      for (let j = 0; j < dims.y; j++) {
        velocityMagnitude[i][j] = [];
        velocityVectors[i][j] = [];
        tempField[i][j] = [];
        pressureField[i][j] = [];
        
        for (let k = 0; k < dims.z; k++) {
          const u = velocity.u[i]?.[j]?.[k] || 0;
          const v = velocity.v[i]?.[j]?.[k] || 0;
          const w = velocity.w[i]?.[j]?.[k] || 0;
          
          velocityMagnitude[i][j][k] = Math.sqrt(u*u + v*v + w*w);
          velocityVectors[i][j][k] = { u, v, w };
          tempField[i][j][k] = temperature.values[i]?.[j]?.[k] || 20;
          pressureField[i][j][k] = pressure.values[i]?.[j]?.[k] || 101325;
        }
      }
    }
    
    // Calculate statistics
    const flatVelocity = velocityMagnitude.flat(3);
    const flatTemp = tempField.flat(3);
    const flatPressure = pressureField.flat(3);
    
    const stats = {
      velocity: {
        min: Math.min(...flatVelocity),
        max: Math.max(...flatVelocity),
        avg: flatVelocity.reduce((a, b) => a + b, 0) / flatVelocity.length,
        uniformityIndex: this.calculateUniformityIndex(flatVelocity)
      },
      temperature: {
        min: Math.min(...flatTemp),
        max: Math.max(...flatTemp),
        avg: flatTemp.reduce((a, b) => a + b, 0) / flatTemp.length,
        uniformityIndex: this.calculateUniformityIndex(flatTemp)
      },
      pressure: {
        min: Math.min(...flatPressure),
        max: Math.max(...flatPressure),
        avg: flatPressure.reduce((a, b) => a + b, 0) / flatPressure.length
      },
      airChangeRate: this.calculateAirChangeRate(),
      ventilationEffectiveness: this.calculateVentilationEffectiveness(velocityMagnitude)
    };
    
    // Generate recommendations based on results
    const recommendations = this.generateRecommendations(stats);
    
    return {
      velocityField: {
        magnitude: velocityMagnitude,
        vectors: velocityVectors
      },
      temperatureField: tempField,
      pressureField: pressureField,
      statistics: stats,
      convergenceHistory: engineResult.convergenceHistory || {
        iteration: [],
        continuity: [],
        momentum: [],
        energy: [],
        turbulence: []
      },
      recommendations
    };
  }
  
  /**
   * Calculate uniformity index (0-1, where 1 is perfectly uniform)
   */
  private calculateUniformityIndex(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;  // Coefficient of variation
    return Math.max(0, 1 - cv);  // Convert to uniformity (1 = uniform, 0 = highly variable)
  }
  
  /**
   * Calculate air change rate (ACH)
   */
  private calculateAirChangeRate(): number {
    if (!this.setupData) return 0;
    
    const roomVolume = 
      this.setupData.domain.dimensions.length *
      this.setupData.domain.dimensions.width *
      this.setupData.domain.dimensions.height;
    
    const totalAirflow = this.setupData.hvacUnits.reduce((sum, unit) => {
      return unit.type === 'supply' ? sum + unit.airflow : sum;
    }, 0);
    
    // Convert CFM to m³/hr and calculate ACH
    const airflowCubicMetersPerHour = totalAirflow * 0.000471947 * 3600;
    return airflowCubicMetersPerHour / roomVolume;
  }
  
  /**
   * Calculate ventilation effectiveness
   */
  private calculateVentilationEffectiveness(velocityField: number[][][]): number {
    // Simplified calculation based on velocity distribution
    // Good ventilation has moderate, uniform velocities (0.2-0.5 m/s)
    const idealRange = { min: 0.2, max: 0.5 };
    let goodCells = 0;
    let totalCells = 0;
    
    for (const plane of velocityField) {
      for (const row of plane) {
        for (const velocity of row) {
          if (velocity >= idealRange.min && velocity <= idealRange.max) {
            goodCells++;
          }
          totalCells++;
        }
      }
    }
    
    return goodCells / totalCells;
  }
  
  /**
   * Generate recommendations based on CFD results
   */
  private generateRecommendations(
    stats: CFDSimulationResult['statistics']
  ): CFDSimulationResult['recommendations'] {
    const recommendations: CFDSimulationResult['recommendations'] = [];
    
    // Temperature uniformity
    const tempRange = stats.temperature.max - stats.temperature.min;
    if (tempRange > 5) {
      recommendations.push({
        category: 'Temperature Uniformity',
        severity: tempRange > 8 ? 'high' : 'medium',
        message: `Temperature variation of ${tempRange.toFixed(1)}°C detected`,
        action: 'Consider adjusting air distribution patterns or adding circulation fans'
      });
    }
    
    // Average temperature
    if (stats.temperature.avg > 28) {
      recommendations.push({
        category: 'Cooling',
        severity: stats.temperature.avg > 30 ? 'high' : 'medium',
        message: `Average temperature ${stats.temperature.avg.toFixed(1)}°C exceeds optimal range`,
        action: 'Increase cooling capacity or improve heat removal'
      });
    } else if (stats.temperature.avg < 18) {
      recommendations.push({
        category: 'Heating',
        severity: stats.temperature.avg < 15 ? 'high' : 'medium',
        message: `Average temperature ${stats.temperature.avg.toFixed(1)}°C below optimal range`,
        action: 'Consider adding heating or reducing ventilation rate'
      });
    }
    
    // Air velocity
    if (stats.velocity.max > 1.0) {
      recommendations.push({
        category: 'Air Velocity',
        severity: stats.velocity.max > 2.0 ? 'high' : 'medium',
        message: `High air velocity of ${stats.velocity.max.toFixed(2)} m/s detected`,
        action: 'Reduce fan speeds or adjust diffuser settings to prevent plant stress'
      });
    }
    
    if (stats.velocity.avg < 0.1) {
      recommendations.push({
        category: 'Air Circulation',
        severity: 'medium',
        message: 'Insufficient air movement detected',
        action: 'Add circulation fans to prevent stagnant air zones'
      });
    }
    
    // Ventilation effectiveness
    if (stats.ventilationEffectiveness < 0.6) {
      recommendations.push({
        category: 'Ventilation',
        severity: stats.ventilationEffectiveness < 0.4 ? 'high' : 'medium',
        message: `Ventilation effectiveness only ${(stats.ventilationEffectiveness * 100).toFixed(0)}%`,
        action: 'Optimize diffuser placement or add mixing fans'
      });
    }
    
    // Air change rate
    if (stats.airChangeRate < 10) {
      recommendations.push({
        category: 'Air Exchange',
        severity: stats.airChangeRate < 5 ? 'high' : 'low',
        message: `Low air change rate of ${stats.airChangeRate.toFixed(1)} ACH`,
        action: 'Consider increasing ventilation rate for better air quality'
      });
    } else if (stats.airChangeRate > 60) {
      recommendations.push({
        category: 'Air Exchange',
        severity: 'low',
        message: `High air change rate of ${stats.airChangeRate.toFixed(1)} ACH`,
        action: 'Consider reducing ventilation to save energy'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Stop simulation if running
   */
  stop(): void {
    if (this.engine) {
      // The engine will check for stop condition in its iteration loop
      // This could be enhanced with a proper cancellation mechanism
    }
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    this.engine = null;
    this.setupData = null;
  }
}

// Export singleton instance
export const cfdService = new CFDIntegrationService();