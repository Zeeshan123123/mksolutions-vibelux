/**
 * Commercial-Grade Pump Selection and Analysis
 * Implements pump curve analysis, NPSH calculations, and efficiency optimization
 */

import { HydraulicCalculator, PumpCurve, SystemPoint } from './hydraulic-calculations';

export interface PumpSpecification {
  manufacturer: string;
  model: string;
  size: string;
  speed: number; // RPM
  stages: number;
  impellerDiameter: number; // inches
  curve: PumpCurve;
  motorHP: number;
  price: number;
}

export interface PumpSelectionCriteria {
  designFlow: number; // GPM
  designHead: number; // feet
  npshAvailable: number; // feet
  fluidType: 'water' | 'nutrient' | 'chemical';
  temperature: number; // °F
  specificGravity: number;
  viscosity: number; // cP
  solidsContent: number; // percentage
}

export interface PumpPerformance {
  pump: PumpSpecification;
  operatingPoint: {
    flow: number;
    head: number;
    efficiency: number;
    power: number;
    npsh: number;
  };
  adequateNPSH: boolean;
  percentBEP: number; // percentage of Best Efficiency Point
  annualEnergyCost: number;
  score: number; // selection score
}

// Standard pump manufacturers and models
export const PUMP_DATABASE: PumpSpecification[] = [
  {
    manufacturer: 'Grundfos',
    model: 'CR 32-4',
    size: '2"',
    speed: 3450,
    stages: 4,
    impellerDiameter: 5.5,
    curve: {
      flowPoints: [0, 50, 100, 150, 200, 250, 300],
      headPoints: [328, 312, 280, 236, 180, 112, 32],
      efficiency: [0, 45, 68, 75, 72, 60, 35],
      npshRequired: [8, 8.5, 9, 10, 12, 15, 20],
      powerPoints: [15, 18, 20, 22, 23, 22, 18]
    },
    motorHP: 25,
    price: 4500
  },
  {
    manufacturer: 'Goulds',
    model: 'e-SV 10SV06',
    size: '1.5"',
    speed: 3500,
    stages: 6,
    impellerDiameter: 4.5,
    curve: {
      flowPoints: [0, 20, 40, 60, 80, 100, 120],
      headPoints: [450, 440, 420, 380, 320, 240, 140],
      efficiency: [0, 40, 62, 70, 68, 58, 40],
      npshRequired: [6, 6.5, 7, 8, 10, 13, 18],
      powerPoints: [10, 12, 14, 15, 16, 15, 12]
    },
    motorHP: 20,
    price: 3800
  },
  {
    manufacturer: 'Pentair',
    model: 'Berkeley B4TPMS',
    size: '4"',
    speed: 1750,
    stages: 1,
    impellerDiameter: 10.5,
    curve: {
      flowPoints: [0, 200, 400, 600, 800, 1000, 1200],
      headPoints: [140, 138, 132, 122, 108, 90, 68],
      efficiency: [0, 50, 70, 78, 76, 68, 55],
      npshRequired: [10, 11, 12, 14, 17, 22, 30],
      powerPoints: [25, 30, 35, 40, 42, 41, 38]
    },
    motorHP: 50,
    price: 8200
  }
];

export class PumpSelector {
  /**
   * Select optimal pump based on system requirements
   */
  static selectPump(
    criteria: PumpSelectionCriteria,
    availablePumps: PumpSpecification[] = PUMP_DATABASE
  ): PumpPerformance[] {
    const performances: PumpPerformance[] = [];
    
    for (const pump of availablePumps) {
      // Generate system curve points around design point
      const systemCurve = this.generateSystemCurve(
        criteria.designFlow,
        criteria.designHead,
        pump.curve.flowPoints
      );
      
      // Find operating point
      const operatingPoint = HydraulicCalculator.pumpOperatingPoint(
        pump.curve,
        systemCurve
      );
      
      if (!operatingPoint) continue;
      
      // Check NPSH margin (typically want 3-5 ft margin)
      const npshMargin = criteria.npshAvailable - operatingPoint.npsh;
      const adequateNPSH = npshMargin >= 3;
      
      // Find Best Efficiency Point (BEP)
      const bepIndex = pump.curve.efficiency.indexOf(
        Math.max(...pump.curve.efficiency)
      );
      const bepFlow = pump.curve.flowPoints[bepIndex];
      const percentBEP = (operatingPoint.flowRate / bepFlow) * 100;
      
      // Calculate annual energy cost
      const annualEnergyCost = this.calculateEnergyCost(
        operatingPoint.power,
        operatingPoint.efficiency,
        8760, // hours per year
        0.12 // $/kWh
      );
      
      // Score pump selection (0-100)
      const score = this.scorePumpSelection(
        operatingPoint,
        criteria,
        percentBEP,
        adequateNPSH,
        pump.price
      );
      
      performances.push({
        pump,
        operatingPoint,
        adequateNPSH,
        percentBEP,
        annualEnergyCost,
        score
      });
    }
    
    // Sort by score (highest first)
    return performances.sort((a, b) => b.score - a.score);
  }

  /**
   * Generate system curve points
   */
  static generateSystemCurve(
    designFlow: number,
    designHead: number,
    flowPoints: number[]
  ): SystemPoint[] {
    // Assume system curve follows H = Hs + k*Q²
    // Where Hs is static head and k is friction coefficient
    const staticHead = designHead * 0.3; // Assume 30% static head
    const k = (designHead - staticHead) / Math.pow(designFlow, 2);
    
    return flowPoints.map(flow => ({
      flowRate: flow,
      totalHead: staticHead + k * Math.pow(flow, 2),
      velocity: 0, // Not needed for curve matching
      pressure: 0 // Not needed for curve matching
    }));
  }

  /**
   * Calculate annual energy cost
   */
  static calculateEnergyCost(
    power: number, // HP
    efficiency: number, // percentage
    hours: number,
    electricRate: number // $/kWh
  ): number {
    const kW = (power * 0.746) / (efficiency / 100); // Convert HP to kW
    return kW * hours * electricRate;
  }

  /**
   * Score pump selection (0-100)
   */
  static scorePumpSelection(
    operatingPoint: any,
    criteria: PumpSelectionCriteria,
    percentBEP: number,
    adequateNPSH: boolean,
    pumpPrice: number
  ): number {
    let score = 0;
    
    // Flow match (20 points)
    const flowError = Math.abs(operatingPoint.flowRate - criteria.designFlow) / 
                     criteria.designFlow;
    score += Math.max(0, 20 - flowError * 100);
    
    // Head match (20 points)
    const headError = Math.abs(operatingPoint.head - criteria.designHead) / 
                     criteria.designHead;
    score += Math.max(0, 20 - headError * 100);
    
    // Efficiency (25 points)
    score += operatingPoint.efficiency * 0.25;
    
    // BEP proximity (15 points) - best at 80-110% of BEP
    if (percentBEP >= 80 && percentBEP <= 110) {
      score += 15;
    } else if (percentBEP >= 70 && percentBEP <= 120) {
      score += 10;
    } else if (percentBEP >= 60 && percentBEP <= 130) {
      score += 5;
    }
    
    // NPSH margin (10 points)
    if (adequateNPSH) {
      score += 10;
    }
    
    // Price consideration (10 points) - normalize to $10k max
    score += Math.max(0, 10 - (pumpPrice / 1000));
    
    return Math.min(100, score);
  }

  /**
   * Apply affinity laws for speed or impeller changes
   */
  static affinityLaws(
    originalCurve: PumpCurve,
    originalSpeed: number,
    newSpeed: number,
    originalDiameter?: number,
    newDiameter?: number
  ): PumpCurve {
    const speedRatio = newSpeed / originalSpeed;
    const diameterRatio = newDiameter && originalDiameter ? 
                         newDiameter / originalDiameter : 1;
    
    return {
      flowPoints: originalCurve.flowPoints.map(q => 
        q * speedRatio * diameterRatio
      ),
      headPoints: originalCurve.headPoints.map(h => 
        h * Math.pow(speedRatio, 2) * Math.pow(diameterRatio, 2)
      ),
      efficiency: [...originalCurve.efficiency], // Efficiency stays ~same
      npshRequired: originalCurve.npshRequired.map(n => 
        n * Math.pow(speedRatio, 2)
      ),
      powerPoints: originalCurve.powerPoints.map(p => 
        p * Math.pow(speedRatio, 3) * Math.pow(diameterRatio, 3)
      )
    };
  }

  /**
   * Parallel pump operation
   */
  static parallelPumps(
    pumps: PumpCurve[],
    systemCurve: SystemPoint[]
  ): SystemPoint {
    // For parallel pumps, add flows at same head
    const combinedCurve: PumpCurve = {
      flowPoints: [],
      headPoints: [],
      efficiency: [],
      npshRequired: [],
      powerPoints: []
    };
    
    // Get unique head points
    const allHeads = new Set<number>();
    pumps.forEach(pump => pump.headPoints.forEach(h => allHeads.add(h)));
    const sortedHeads = Array.from(allHeads).sort((a, b) => b - a);
    
    // Sum flows at each head
    for (const head of sortedHeads) {
      let totalFlow = 0;
      let totalPower = 0;
      let avgEfficiency = 0;
      let maxNPSH = 0;
      
      for (const pump of pumps) {
        const point = HydraulicCalculator.interpolatePumpCurve(pump, head);
        totalFlow += point.head >= head ? 
          this.interpolateFlow(pump, head) : 0;
        totalPower += point.power;
        avgEfficiency += point.efficiency;
        maxNPSH = Math.max(maxNPSH, point.npsh);
      }
      
      combinedCurve.headPoints.push(head);
      combinedCurve.flowPoints.push(totalFlow);
      combinedCurve.powerPoints.push(totalPower);
      combinedCurve.efficiency.push(avgEfficiency / pumps.length);
      combinedCurve.npshRequired.push(maxNPSH);
    }
    
    // Find operating point with combined curve
    const operatingPoint = HydraulicCalculator.pumpOperatingPoint(
      combinedCurve,
      systemCurve
    );
    
    return {
      flowRate: operatingPoint?.flowRate || 0,
      totalHead: operatingPoint?.head || 0,
      velocity: 0,
      pressure: (operatingPoint?.head || 0) * 0.433
    };
  }

  /**
   * Series pump operation
   */
  static seriesPumps(
    pumps: PumpCurve[],
    systemCurve: SystemPoint[]
  ): SystemPoint {
    // For series pumps, add heads at same flow
    const combinedCurve: PumpCurve = {
      flowPoints: pumps[0].flowPoints,
      headPoints: [],
      efficiency: [],
      npshRequired: [],
      powerPoints: []
    };
    
    // Sum heads at each flow point
    for (let i = 0; i < combinedCurve.flowPoints.length; i++) {
      let totalHead = 0;
      let totalPower = 0;
      let avgEfficiency = 0;
      const npsh = pumps[0].npshRequired[i]; // Only first pump NPSH matters
      
      for (const pump of pumps) {
        totalHead += pump.headPoints[i];
        totalPower += pump.powerPoints[i];
        avgEfficiency += pump.efficiency[i];
      }
      
      combinedCurve.headPoints.push(totalHead);
      combinedCurve.powerPoints.push(totalPower);
      combinedCurve.efficiency.push(avgEfficiency / pumps.length);
      combinedCurve.npshRequired.push(npsh);
    }
    
    // Find operating point
    const operatingPoint = HydraulicCalculator.pumpOperatingPoint(
      combinedCurve,
      systemCurve
    );
    
    return {
      flowRate: operatingPoint?.flowRate || 0,
      totalHead: operatingPoint?.head || 0,
      velocity: 0,
      pressure: (operatingPoint?.head || 0) * 0.433
    };
  }

  /**
   * Helper to interpolate flow at given head
   */
  private static interpolateFlow(curve: PumpCurve, targetHead: number): number {
    const { flowPoints, headPoints } = curve;
    
    // Find surrounding points
    for (let i = 0; i < headPoints.length - 1; i++) {
      if (headPoints[i] >= targetHead && headPoints[i + 1] <= targetHead) {
        const ratio = (targetHead - headPoints[i]) / 
                     (headPoints[i + 1] - headPoints[i]);
        return flowPoints[i] + ratio * (flowPoints[i + 1] - flowPoints[i]);
      }
    }
    
    return 0;
  }
}