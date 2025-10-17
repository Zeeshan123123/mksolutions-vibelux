/**
 * Professional Hydraulic Calculations for Irrigation Systems
 * Industry-standard engineering calculations for pressure and flow analysis
 * Compliant with commercial design standards
 */

export interface PipeSegment {
  id: string;
  diameter: number; // inches
  length: number; // feet
  material: 'PVC' | 'CPVC' | 'HDPE' | 'Copper' | 'Steel';
  flowRate: number; // GPM
  elevation: number; // feet
  fittings: Fitting[];
}

export interface Fitting {
  type: 'elbow90' | 'elbow45' | 'tee' | 'valve' | 'reducer' | 'coupling' | 'check';
  size: number; // inches
  kFactor?: number; // loss coefficient
}

export interface PumpCurve {
  flowPoints: number[]; // GPM
  headPoints: number[]; // feet
  efficiency: number[]; // percentage
  npshRequired: number[]; // feet
  powerPoints: number[]; // HP
}

export interface SystemPoint {
  flowRate: number; // GPM
  totalHead: number; // feet
  velocity: number; // fps
  pressure: number; // psi
}

// Material flow coefficients for pressure calculations
const MATERIAL_FLOW_COEFFICIENTS = {
  PVC: 150,
  CPVC: 150,
  HDPE: 140,
  Copper: 130,
  Steel: 120,
  'Cast Iron': 100,
  'Concrete': 110
};

// Fitting loss coefficients (K factors)
const FITTING_K_FACTORS = {
  elbow90: { threaded: 1.5, flanged: 0.3, welded: 0.9 },
  elbow45: { threaded: 0.7, flanged: 0.2, welded: 0.4 },
  tee: { throughFlow: 0.6, branchFlow: 1.8 },
  valve: { gate: 0.2, globe: 10, ball: 0.05, butterfly: 0.3 },
  reducer: { gradual: 0.5, sudden: 1.0 },
  coupling: 0.05,
  check: { swing: 2.5, lift: 12.0 }
};

// Pipe roughness for Darcy-Weisbach (feet)
const PIPE_ROUGHNESS = {
  PVC: 0.000005,
  CPVC: 0.000005,
  HDPE: 0.000007,
  Copper: 0.000005,
  Steel: 0.00015,
  'Cast Iron': 0.00085,
  'Concrete': 0.003
};

export class HydraulicCalculator {
  /**
   * Calculate pressure loss using industry-standard flow equations
   * Professional hydraulic analysis for system design
   */
  static calculatePressureLoss(
    flowRate: number, // GPM
    diameter: number, // inches
    length: number, // feet
    material: string
  ): number {
    const C = MATERIAL_FLOW_COEFFICIENTS[material] || 120;
    const Q = flowRate;
    const d = diameter;
    const L = length;
    
    // Industry-standard pressure loss calculation
    const headLoss = 10.67 * Math.pow(Q, 1.852) * L / 
                     (Math.pow(C, 1.852) * Math.pow(d, 4.8655));
    
    return headLoss; // feet
  }

  /**
   * Calculate pressure loss using alternative flow analysis method
   * Advanced hydraulic calculations for complex systems
   */
  static alternativePressureLoss(
    flowRate: number, // GPM
    diameter: number, // inches
    length: number, // feet
    material: string,
    temperature: number = 68 // °F
  ): number {
    const d = diameter / 12; // convert to feet
    const area = Math.PI * Math.pow(d / 2, 2); // ft²
    const velocity = (flowRate / 449) / area; // fps (449 converts GPM to ft³/s)
    const reynolds = this.reynoldsNumber(velocity, d, temperature);
    const roughness = PIPE_ROUGHNESS[material] || 0.00015;
    const f = this.frictionFactor(reynolds, roughness, d);
    
    const headLoss = f * (length / d) * (Math.pow(velocity, 2) / (2 * 32.174));
    
    return headLoss; // feet
  }

  /**
   * Calculate Reynolds number for flow regime determination
   */
  static reynoldsNumber(
    velocity: number, // fps
    diameter: number, // feet
    temperature: number = 68 // °F
  ): number {
    // Kinematic viscosity of water (ft²/s) at different temperatures
    const viscosityTable = {
      32: 1.931e-5,
      40: 1.664e-5,
      50: 1.407e-5,
      60: 1.217e-5,
      68: 1.083e-5,
      70: 1.059e-5,
      80: 9.30e-6,
      90: 8.26e-6,
      100: 7.38e-6
    };
    
    const viscosity = viscosityTable[temperature] || 1.083e-5;
    return (velocity * diameter) / viscosity;
  }

  /**
   * Calculate friction factor using Colebrook-White equation (iterative)
   */
  static frictionFactor(
    reynolds: number,
    roughness: number, // feet
    diameter: number // feet
  ): number {
    if (reynolds < 2000) {
      // Laminar flow
      return 64 / reynolds;
    }
    
    // Turbulent flow - use Swamee-Jain approximation
    const relativeRoughness = roughness / diameter;
    const A = Math.pow(relativeRoughness / 3.7, 1.11) + Math.pow(6.9 / reynolds, 0.9);
    const f = 0.25 / Math.pow(Math.log10(A), 2);
    
    return f;
  }

  /**
   * Calculate velocity in pipe
   */
  static velocity(flowRate: number, diameter: number): number {
    const area = Math.PI * Math.pow(diameter / 24, 2); // ft² (diameter in inches)
    return (flowRate / 449) / area; // fps
  }

  /**
   * Calculate fitting losses using K-factor method
   */
  static fittingLoss(fitting: Fitting, velocity: number): number {
    let kFactor = fitting.kFactor;
    
    if (!kFactor) {
      // Use standard K factors
      switch (fitting.type) {
        case 'elbow90':
          kFactor = FITTING_K_FACTORS.elbow90.threaded;
          break;
        case 'elbow45':
          kFactor = FITTING_K_FACTORS.elbow45.threaded;
          break;
        case 'tee':
          kFactor = FITTING_K_FACTORS.tee.throughFlow;
          break;
        case 'valve':
          kFactor = FITTING_K_FACTORS.valve.gate;
          break;
        case 'reducer':
          kFactor = FITTING_K_FACTORS.reducer.gradual;
          break;
        case 'coupling':
          kFactor = FITTING_K_FACTORS.coupling;
          break;
        case 'check':
          kFactor = FITTING_K_FACTORS.check.swing;
          break;
        default:
          kFactor = 0.5;
      }
    }
    
    return kFactor * Math.pow(velocity, 2) / (2 * 32.174); // feet
  }

  /**
   * Calculate total system head for a pipe network
   */
  static systemHead(segments: PipeSegment[]): SystemPoint {
    let totalStaticHead = 0;
    let totalFrictionHead = 0;
    let totalVelocityHead = 0;
    let totalMinorLosses = 0;
    
    for (const segment of segments) {
      // Static head (elevation change)
      if (segments.indexOf(segment) > 0) {
        const prevSegment = segments[segments.indexOf(segment) - 1];
        totalStaticHead += segment.elevation - prevSegment.elevation;
      }
      
      // Friction losses
      const frictionLoss = this.hazenWilliamsPressureLoss(
        segment.flowRate,
        segment.diameter,
        segment.length,
        segment.material
      );
      totalFrictionHead += frictionLoss;
      
      // Velocity
      const velocity = this.velocity(segment.flowRate, segment.diameter);
      
      // Minor losses (fittings)
      for (const fitting of segment.fittings) {
        totalMinorLosses += this.fittingLoss(fitting, velocity);
      }
      
      // Velocity head at discharge
      if (segments.indexOf(segment) === segments.length - 1) {
        totalVelocityHead = Math.pow(velocity, 2) / (2 * 32.174);
      }
    }
    
    const totalHead = totalStaticHead + totalFrictionHead + 
                     totalMinorLosses + totalVelocityHead;
    
    // Convert to pressure (psi)
    const pressure = totalHead * 0.433; // 1 ft of head = 0.433 psi
    
    // Get flow rate (assuming same throughout)
    const flowRate = segments[0]?.flowRate || 0;
    const finalVelocity = segments.length > 0 ? 
      this.velocity(segments[segments.length - 1].flowRate, segments[segments.length - 1].diameter) : 0;
    
    return {
      flowRate,
      totalHead,
      velocity: finalVelocity,
      pressure
    };
  }

  /**
   * Find pump operating point (intersection of pump curve and system curve)
   */
  static pumpOperatingPoint(
    pumpCurve: PumpCurve,
    systemCurve: SystemPoint[]
  ): {
    flowRate: number;
    head: number;
    efficiency: number;
    power: number;
    npsh: number;
  } | null {
    // Interpolate pump curve at system curve points
    for (let i = 0; i < systemCurve.length - 1; i++) {
      const sys1 = systemCurve[i];
      const sys2 = systemCurve[i + 1];
      
      // Find pump head at these flow rates
      const pump1 = this.interpolatePumpCurve(pumpCurve, sys1.flowRate);
      const pump2 = this.interpolatePumpCurve(pumpCurve, sys2.flowRate);
      
      // Check if curves intersect
      if ((pump1.head >= sys1.totalHead && pump2.head <= sys2.totalHead) ||
          (pump1.head <= sys1.totalHead && pump2.head >= sys2.totalHead)) {
        
        // Linear interpolation to find intersection
        const m1 = (sys2.totalHead - sys1.totalHead) / (sys2.flowRate - sys1.flowRate);
        const m2 = (pump2.head - pump1.head) / (sys2.flowRate - sys1.flowRate);
        
        const flowRate = sys1.flowRate + 
          (pump1.head - sys1.totalHead) / (m1 - m2);
        
        const operatingPoint = this.interpolatePumpCurve(pumpCurve, flowRate);
        return {
          flowRate,
          head: operatingPoint.head,
          efficiency: operatingPoint.efficiency,
          power: operatingPoint.power,
          npsh: operatingPoint.npsh
        };
      }
    }
    
    return null;
  }

  /**
   * Interpolate pump curve data at specific flow rate
   */
  static interpolatePumpCurve(curve: PumpCurve, flowRate: number) {
    const { flowPoints, headPoints, efficiency, npshRequired, powerPoints } = curve;
    
    // Find surrounding points
    let i = 0;
    while (i < flowPoints.length - 1 && flowPoints[i + 1] < flowRate) {
      i++;
    }
    
    if (i >= flowPoints.length - 1) {
      // Extrapolate from last two points
      i = flowPoints.length - 2;
    }
    
    const x1 = flowPoints[i];
    const x2 = flowPoints[i + 1];
    const ratio = (flowRate - x1) / (x2 - x1);
    
    return {
      head: headPoints[i] + ratio * (headPoints[i + 1] - headPoints[i]),
      efficiency: efficiency[i] + ratio * (efficiency[i + 1] - efficiency[i]),
      power: powerPoints[i] + ratio * (powerPoints[i + 1] - powerPoints[i]),
      npsh: npshRequired[i] + ratio * (npshRequired[i + 1] - npshRequired[i])
    };
  }

  /**
   * Calculate Net Positive Suction Head Available (NPSHA)
   */
  static npshAvailable(
    atmosphericPressure: number = 14.7, // psia
    vaporPressure: number = 0.36, // psia at 68°F
    suctionHead: number, // feet (positive for flooded, negative for lift)
    suctionLosses: number // feet
  ): number {
    const atmosphericHead = atmosphericPressure * 2.31; // convert psi to feet
    const vaporHead = vaporPressure * 2.31;
    
    return atmosphericHead - vaporHead + suctionHead - suctionLosses;
  }

  /**
   * Water hammer pressure surge calculation (Joukowsky equation)
   */
  static waterHammerPressure(
    velocity: number, // fps
    pipeLength: number, // feet
    valveClosureTime: number, // seconds
    bulkModulus: number = 300000, // psi for water
    pipeElasticity: number = 400000 // psi for PVC
  ): number {
    // Wave speed in pipe
    const fluidDensity = 1.94; // slugs/ft³
    const a = Math.sqrt(bulkModulus / fluidDensity); // fps
    
    // Critical closure time
    const tc = 2 * pipeLength / a;
    
    // Pressure surge
    let pressureSurge: number;
    if (valveClosureTime < tc) {
      // Rapid closure
      pressureSurge = (fluidDensity * a * velocity) / 144; // psi
    } else {
      // Slow closure
      pressureSurge = (fluidDensity * a * velocity * tc / valveClosureTime) / 144; // psi
    }
    
    return pressureSurge;
  }
}