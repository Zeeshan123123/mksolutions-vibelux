/**
 * Professional Voltage Drop Calculations for Electrical Systems
 * Implements NEC Chapter 9 Table 8 & 9 conductor properties
 * Supports AC and DC calculations with temperature corrections
 */

export interface ConductorRun {
  id: string;
  fromPanel: string;
  toLoad: string;
  length: number; // feet (one-way)
  conduitType: 'steel' | 'pvc' | 'aluminum' | 'cable_tray';
  conductorMaterial: 'copper' | 'aluminum';
  conductorSize: string; // AWG or kcmil
  insulation: '60C' | '75C' | '90C';
  sets: number; // parallel sets
  loadCurrent: number; // amperes
  loadVoltage: number; // volts
  phases: 1 | 3;
  powerFactor?: number; // for AC loads
  ambientTemp?: number; // °C
}

export interface VoltageDropResult {
  conductorId: string;
  voltageDrop: number; // volts
  percentDrop: number; // percentage
  endVoltage: number; // volts at load
  powerLoss: number; // watts
  nec210_19_compliant: boolean; // 3% branch, 5% total
  nec215_2_compliant: boolean; // 3% feeder, 5% total
  recommendations?: string[];
}

// NEC Chapter 9 Table 8 - Conductor Properties (Copper)
const COPPER_PROPERTIES = {
  // Size: { resistance_dc_ohms_per_1000ft, reactance_ohms_per_1000ft }
  '14': { dc: 3.07, xl_pvc: 0.058, xl_steel: 0.073 },
  '12': { dc: 1.93, xl_pvc: 0.054, xl_steel: 0.068 },
  '10': { dc: 1.21, xl_pvc: 0.050, xl_steel: 0.063 },
  '8': { dc: 0.764, xl_pvc: 0.052, xl_steel: 0.065 },
  '6': { dc: 0.491, xl_pvc: 0.051, xl_steel: 0.064 },
  '4': { dc: 0.308, xl_pvc: 0.048, xl_steel: 0.060 },
  '3': { dc: 0.245, xl_pvc: 0.047, xl_steel: 0.059 },
  '2': { dc: 0.194, xl_pvc: 0.045, xl_steel: 0.057 },
  '1': { dc: 0.154, xl_pvc: 0.046, xl_steel: 0.057 },
  '1/0': { dc: 0.122, xl_pvc: 0.044, xl_steel: 0.055 },
  '2/0': { dc: 0.0967, xl_pvc: 0.043, xl_steel: 0.054 },
  '3/0': { dc: 0.0766, xl_pvc: 0.042, xl_steel: 0.052 },
  '4/0': { dc: 0.0608, xl_pvc: 0.041, xl_steel: 0.051 },
  '250': { dc: 0.0515, xl_pvc: 0.041, xl_steel: 0.052 },
  '300': { dc: 0.0429, xl_pvc: 0.041, xl_steel: 0.051 },
  '350': { dc: 0.0367, xl_pvc: 0.040, xl_steel: 0.050 },
  '400': { dc: 0.0321, xl_pvc: 0.040, xl_steel: 0.049 },
  '500': { dc: 0.0258, xl_pvc: 0.039, xl_steel: 0.048 },
  '600': { dc: 0.0214, xl_pvc: 0.039, xl_steel: 0.048 },
  '750': { dc: 0.0171, xl_pvc: 0.038, xl_steel: 0.048 },
  '1000': { dc: 0.0129, xl_pvc: 0.037, xl_steel: 0.046 }
};

// NEC Chapter 9 Table 8 - Conductor Properties (Aluminum)
const ALUMINUM_PROPERTIES = {
  '12': { dc: 3.18, xl_pvc: 0.054, xl_steel: 0.068 },
  '10': { dc: 2.00, xl_pvc: 0.050, xl_steel: 0.063 },
  '8': { dc: 1.26, xl_pvc: 0.052, xl_steel: 0.065 },
  '6': { dc: 0.808, xl_pvc: 0.051, xl_steel: 0.064 },
  '4': { dc: 0.508, xl_pvc: 0.048, xl_steel: 0.060 },
  '3': { dc: 0.403, xl_pvc: 0.047, xl_steel: 0.059 },
  '2': { dc: 0.319, xl_pvc: 0.045, xl_steel: 0.057 },
  '1': { dc: 0.253, xl_pvc: 0.046, xl_steel: 0.057 },
  '1/0': { dc: 0.201, xl_pvc: 0.044, xl_steel: 0.055 },
  '2/0': { dc: 0.159, xl_pvc: 0.043, xl_steel: 0.054 },
  '3/0': { dc: 0.126, xl_pvc: 0.042, xl_steel: 0.052 },
  '4/0': { dc: 0.100, xl_pvc: 0.041, xl_steel: 0.051 },
  '250': { dc: 0.0847, xl_pvc: 0.041, xl_steel: 0.052 },
  '300': { dc: 0.0707, xl_pvc: 0.041, xl_steel: 0.051 },
  '350': { dc: 0.0605, xl_pvc: 0.040, xl_steel: 0.050 },
  '400': { dc: 0.0529, xl_pvc: 0.040, xl_steel: 0.049 },
  '500': { dc: 0.0424, xl_pvc: 0.039, xl_steel: 0.048 },
  '600': { dc: 0.0353, xl_pvc: 0.039, xl_steel: 0.048 },
  '750': { dc: 0.0282, xl_pvc: 0.038, xl_steel: 0.048 },
  '1000': { dc: 0.0212, xl_pvc: 0.037, xl_steel: 0.046 }
};

export class VoltageDropCalculator {
  /**
   * Calculate voltage drop for a conductor run
   */
  static calculate(conductor: ConductorRun): VoltageDropResult {
    // Get conductor properties
    const properties = this.getConductorProperties(
      conductor.conductorMaterial,
      conductor.conductorSize,
      conductor.conduitType
    );

    if (!properties) {
      throw new Error(`Invalid conductor size: ${conductor.conductorSize}`);
    }

    // Temperature correction factor
    const tempCorrection = this.getTemperatureCorrection(
      conductor.conductorMaterial,
      conductor.ambientTemp || 30
    );

    // Corrected resistance
    const resistance = properties.dc * tempCorrection / conductor.sets;
    const reactance = properties.xl / conductor.sets;

    // Calculate voltage drop based on system type
    let voltageDrop: number;
    let powerLoss: number;

    if (conductor.phases === 1) {
      voltageDrop = this.calculateSinglePhaseVD(
        conductor.loadCurrent,
        conductor.length,
        resistance,
        reactance,
        conductor.powerFactor || 1.0
      );
      powerLoss = 2 * conductor.loadCurrent * conductor.loadCurrent * 
                  resistance * conductor.length / 1000;
    } else {
      voltageDrop = this.calculateThreePhaseVD(
        conductor.loadCurrent,
        conductor.length,
        resistance,
        reactance,
        conductor.powerFactor || 0.85
      );
      powerLoss = 3 * conductor.loadCurrent * conductor.loadCurrent * 
                  resistance * conductor.length / 1000;
    }

    const percentDrop = (voltageDrop / conductor.loadVoltage) * 100;
    const endVoltage = conductor.loadVoltage - voltageDrop;

    // Check NEC compliance
    const necCompliance = this.checkNECCompliance(percentDrop, conductor);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      percentDrop,
      conductor,
      necCompliance
    );

    return {
      conductorId: conductor.id,
      voltageDrop,
      percentDrop,
      endVoltage,
      powerLoss,
      nec210_19_compliant: necCompliance.branch,
      nec215_2_compliant: necCompliance.feeder,
      recommendations
    };
  }

  /**
   * Calculate single-phase voltage drop
   * VD = 2 × I × (R cos θ + X sin θ) × L / 1000
   */
  private static calculateSinglePhaseVD(
    current: number,
    length: number,
    resistance: number,
    reactance: number,
    powerFactor: number
  ): number {
    const theta = Math.acos(powerFactor);
    const sinTheta = Math.sin(theta);
    
    return 2 * current * (resistance * powerFactor + reactance * sinTheta) * 
           length / 1000;
  }

  /**
   * Calculate three-phase voltage drop
   * VD = √3 × I × (R cos θ + X sin θ) × L / 1000
   */
  private static calculateThreePhaseVD(
    current: number,
    length: number,
    resistance: number,
    reactance: number,
    powerFactor: number
  ): number {
    const theta = Math.acos(powerFactor);
    const sinTheta = Math.sin(theta);
    
    return Math.sqrt(3) * current * (resistance * powerFactor + reactance * sinTheta) * 
           length / 1000;
  }

  /**
   * Get conductor properties from tables
   */
  private static getConductorProperties(
    material: 'copper' | 'aluminum',
    size: string,
    conduitType: string
  ): { dc: number; xl: number } | null {
    const table = material === 'copper' ? COPPER_PROPERTIES : ALUMINUM_PROPERTIES;
    const props = table[size];
    
    if (!props) return null;

    const xl = conduitType === 'steel' ? props.xl_steel : props.xl_pvc;
    
    return { dc: props.dc, xl };
  }

  /**
   * Temperature correction factor per NEC Table 8 Note 2
   */
  private static getTemperatureCorrection(
    material: 'copper' | 'aluminum',
    ambientTemp: number
  ): number {
    // Resistance at temperature T2 = R1 × [1 + α(T2 - T1)]
    // α = 0.00393 for copper, 0.00403 for aluminum at 75°C
    const alpha = material === 'copper' ? 0.00393 : 0.00403;
    const baseTemp = 75; // °C
    
    return 1 + alpha * (ambientTemp - baseTemp);
  }

  /**
   * Check NEC compliance for voltage drop
   */
  private static checkNECCompliance(
    percentDrop: number,
    conductor: ConductorRun
  ): { branch: boolean; feeder: boolean } {
    // NEC 210.19(A)(1) - Branch circuits: 3% max
    // NEC 215.2(A)(1) - Feeders: 3% max
    // Combined: 5% max
    
    const isBranch = conductor.fromPanel.includes('sub') || 
                     conductor.toLoad.includes('receptacle') ||
                     conductor.toLoad.includes('light');
    
    if (isBranch) {
      return {
        branch: percentDrop <= 3,
        feeder: true // Not applicable
      };
    } else {
      return {
        branch: true, // Not applicable
        feeder: percentDrop <= 3
      };
    }
  }

  /**
   * Generate recommendations for voltage drop issues
   */
  private static generateRecommendations(
    percentDrop: number,
    conductor: ConductorRun,
    necCompliance: { branch: boolean; feeder: boolean }
  ): string[] {
    const recommendations: string[] = [];

    if (percentDrop > 5) {
      recommendations.push('Voltage drop exceeds 5% - violates NEC recommendations');
    }

    if (!necCompliance.branch || !necCompliance.feeder) {
      recommendations.push('Consider increasing conductor size to meet 3% requirement');
      
      // Suggest next size up
      const nextSize = this.getNextConductorSize(conductor.conductorSize);
      if (nextSize) {
        recommendations.push(`Try ${nextSize} ${conductor.conductorMaterial}`);
      }
    }

    if (percentDrop > 3 && conductor.sets === 1) {
      recommendations.push('Consider parallel conductors to reduce voltage drop');
    }

    if (conductor.length > 200 && percentDrop > 2) {
      recommendations.push('Consider relocating panel closer to load center');
    }

    if (conductor.powerFactor && conductor.powerFactor < 0.9) {
      recommendations.push('Power factor correction could reduce voltage drop');
    }

    return recommendations;
  }

  /**
   * Get next standard conductor size
   */
  private static getNextConductorSize(currentSize: string): string | null {
    const sizes = ['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', 
                   '2/0', '3/0', '4/0', '250', '300', '350', '400', '500', 
                   '600', '750', '1000'];
    
    const index = sizes.indexOf(currentSize);
    if (index === -1 || index === sizes.length - 1) return null;
    
    return sizes[index + 1];
  }

  /**
   * Calculate voltage drop for entire system
   */
  static calculateSystemVoltageDrop(
    conductors: ConductorRun[]
  ): {
    totalDrop: number;
    worstCase: VoltageDropResult;
    systemCompliant: boolean;
    criticalPaths: VoltageDropResult[];
  } {
    const results = conductors.map(c => this.calculate(c));
    
    // Find paths from source to loads
    const paths = this.tracePaths(conductors);
    const pathDrops = paths.map(path => {
      const totalDrop = path.reduce((sum, conductorId) => {
        const result = results.find(r => r.conductorId === conductorId);
        return sum + (result?.percentDrop || 0);
      }, 0);
      return { path, totalDrop };
    });

    const worstPath = pathDrops.reduce((max, p) => 
      p.totalDrop > max.totalDrop ? p : max
    );

    const criticalPaths = results.filter(r => r.percentDrop > 3);

    return {
      totalDrop: worstPath.totalDrop,
      worstCase: results.find(r => r.percentDrop === Math.max(...results.map(res => res.percentDrop)))!,
      systemCompliant: worstPath.totalDrop <= 5,
      criticalPaths
    };
  }

  /**
   * Trace electrical paths from source to loads
   */
  private static tracePaths(conductors: ConductorRun[]): string[][] {
    // Simplified path tracing - would need graph traversal for complex systems
    const paths: string[][] = [];
    
    // Find all end loads
    const loads = [...new Set(conductors.map(c => c.toLoad))];
    
    for (const load of loads) {
      const path: string[] = [];
      let current = load;
      
      // Trace back to source
      while (current) {
        const conductor = conductors.find(c => c.toLoad === current);
        if (conductor) {
          path.unshift(conductor.id);
          current = conductor.fromPanel;
          if (current.includes('main')) break;
        } else {
          break;
        }
      }
      
      if (path.length > 0) paths.push(path);
    }
    
    return paths;
  }

  /**
   * Optimize conductor sizing for cost vs voltage drop
   */
  static optimizeConductorSize(
    conductor: ConductorRun,
    maxVoltageDrop: number = 3,
    copperCostPerLb: number = 4.50
  ): {
    optimalSize: string;
    voltageDrop: number;
    materialCost: number;
    paybackPeriod: number;
  } {
    const sizes = ['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', 
                   '2/0', '3/0', '4/0', '250', '300', '350', '400', '500'];
    
    const results = sizes.map(size => {
      const testConductor = { ...conductor, conductorSize: size };
      const vdResult = this.calculate(testConductor);
      
      // Skip if doesn't meet requirement
      if (vdResult.percentDrop > maxVoltageDrop) return null;
      
      // Calculate material cost
      const weight = this.getConductorWeight(size, conductor.length);
      const cost = weight * copperCostPerLb;
      
      // Calculate annual energy savings from reduced losses
      const annualSavings = vdResult.powerLoss * 0.12 * 8760 / 1000; // $0.12/kWh
      
      return {
        size,
        voltageDrop: vdResult.percentDrop,
        cost,
        annualSavings,
        payback: cost / annualSavings
      };
    }).filter(r => r !== null);

    // Find optimal based on 5-year payback
    const optimal = results.reduce((best, current) => {
      if (!best) return current;
      if (current!.payback < 5 && current!.cost < best.cost) return current;
      return best;
    });

    return {
      optimalSize: optimal!.size,
      voltageDrop: optimal!.voltageDrop,
      materialCost: optimal!.cost,
      paybackPeriod: optimal!.payback
    };
  }

  /**
   * Get conductor weight for cost calculations
   */
  private static getConductorWeight(size: string, length: number): number {
    // Simplified weight calculation - lbs per 1000 ft
    const weights = {
      '14': 12.4, '12': 19.8, '10': 31.4, '8': 50.0, '6': 79.5,
      '4': 126, '2': 201, '1/0': 319, '2/0': 403, '3/0': 508,
      '4/0': 641, '250': 765, '350': 1070, '500': 1530
    };
    
    return (weights[size] || 100) * length / 1000;
  }
}