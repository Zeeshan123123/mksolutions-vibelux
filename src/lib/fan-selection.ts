/**
 * Commercial-Grade Fan Selection and System Curve Analysis
 * Implements fan laws, system effect factors, and performance optimization
 */

export interface FanSpecification {
  manufacturer: string;
  model: string;
  type: FanType;
  diameter: number; // inches
  speed: number; // RPM
  curves: FanPerformanceCurves;
  motor: {
    hp: number;
    efficiency: number; // %
    voltage: number;
    phases: 1 | 3;
  };
  construction: {
    arrangement: FanArrangement;
    discharge: DischargeType;
    rotation: 'CW' | 'CCW';
    drive: 'direct' | 'belt';
  };
  acoustics: AcousticData;
  price: number;
}

export type FanType = 'centrifugal' | 'axial' | 'mixed' | 'propeller' | 
                     'inline' | 'plenum' | 'tubular';

export type FanArrangement = 'SWSI' | 'DWDI' | 'SWDI' | 'DWSI' | // centrifugal
                            'direct' | 'belt' | 'tubular'; // axial

export type DischargeType = 'topHorizontal' | 'topUpBlast' | 'downBlast' | 
                           'bottomHorizontal' | 'topAngular' | 'inline';

export interface FanPerformanceCurves {
  flowPoints: number[]; // CFM
  staticPressure: number[]; // inches w.g.
  totalPressure: number[]; // inches w.g.
  efficiency: number[]; // %
  power: number[]; // BHP
  soundPower: number[]; // dB
}

export interface SystemCurve {
  flowPoints: number[]; // CFM
  pressurePoints: number[]; // inches w.g.
  systemEffect: number; // inches w.g.
}

export interface FanSelectionCriteria {
  designFlow: number; // CFM
  designPressure: number; // inches w.g.
  altitude: number; // feet
  temperature: number; // °F
  application: ApplicationType;
  acousticRequirement?: number; // max dB
  efficiency?: number; // min %
  redundancy?: boolean;
}

export type ApplicationType = 'supplyAir' | 'returnAir' | 'exhaust' | 
                             'makeupAir' | 'processExhaust' | 'smokeControl';

export interface FanOperatingPoint {
  flow: number; // CFM
  staticPressure: number; // inches w.g.
  totalPressure: number; // inches w.g.
  efficiency: number; // %
  power: number; // BHP
  motorPower: number; // HP
  speed: number; // RPM
  soundPower: number; // dB
}

export interface FanSelectionResult {
  fan: FanSpecification;
  operatingPoint: FanOperatingPoint;
  score: number; // 0-100
  issues: string[];
  alternateSpeed?: FanOperatingPoint; // VFD option
}

export interface AcousticData {
  overallSoundPower: number; // dB
  octaveBands: {
    '63Hz': number;
    '125Hz': number;
    '250Hz': number;
    '500Hz': number;
    '1kHz': number;
    '2kHz': number;
    '4kHz': number;
    '8kHz': number;
  };
}

// System effect factors (inches w.g.)
const SYSTEM_EFFECT_FACTORS = {
  inlet: {
    ideal: 0,
    oneElbow: 0.33,
    twoElbow: 0.67,
    obstruction: 1.0,
    spinning: 1.5
  },
  outlet: {
    ideal: 0,
    abruptExpansion: 0.5,
    noStraight: 0.75,
    elbow: 1.0
  }
};

// Fan law exponents
const FAN_LAWS = {
  flow: { speed: 1, diameter: 3 },
  pressure: { speed: 2, diameter: 2 },
  power: { speed: 3, diameter: 5 }
};

// Standard fan database (simplified)
export const FAN_DATABASE: FanSpecification[] = [
  {
    manufacturer: 'Greenheck',
    model: 'AFSQ-20',
    type: 'centrifugal',
    diameter: 20,
    speed: 1750,
    curves: {
      flowPoints: [0, 2000, 4000, 6000, 8000, 10000, 12000],
      staticPressure: [4.0, 3.9, 3.6, 3.1, 2.4, 1.5, 0.4],
      totalPressure: [4.0, 4.1, 4.0, 3.7, 3.2, 2.5, 1.6],
      efficiency: [0, 45, 65, 72, 68, 55, 35],
      power: [2.5, 3.0, 3.8, 4.5, 5.0, 5.2, 5.0],
      soundPower: [85, 87, 89, 91, 93, 95, 97]
    },
    motor: { hp: 7.5, efficiency: 92, voltage: 460, phases: 3 },
    construction: {
      arrangement: 'SWSI',
      discharge: 'topHorizontal',
      rotation: 'CW',
      drive: 'belt'
    },
    acoustics: {
      overallSoundPower: 91,
      octaveBands: {
        '63Hz': 80, '125Hz': 84, '250Hz': 87, '500Hz': 89,
        '1kHz': 88, '2kHz': 85, '4kHz': 81, '8kHz': 77
      }
    },
    price: 3500
  }
];

export class FanSelector {
  /**
   * Select optimal fan for system requirements
   */
  static selectFan(
    criteria: FanSelectionCriteria,
    systemCurve: SystemCurve,
    availableFans: FanSpecification[] = FAN_DATABASE
  ): FanSelectionResult[] {
    const results: FanSelectionResult[] = [];
    
    // Adjust for altitude and temperature
    const densityCorrection = this.getDensityCorrection(
      criteria.altitude,
      criteria.temperature
    );
    
    const correctedFlow = criteria.designFlow / densityCorrection;
    const correctedPressure = criteria.designPressure / densityCorrection;
    
    for (const fan of availableFans) {
      // Check if fan can meet requirements
      const maxFlow = Math.max(...fan.curves.flowPoints);
      const maxPressure = Math.max(...fan.curves.staticPressure);
      
      if (correctedFlow > maxFlow * 1.2 || correctedPressure > maxPressure * 1.2) {
        continue; // Fan too small
      }
      
      // Find operating point
      const operatingPoint = this.findOperatingPoint(
        fan.curves,
        systemCurve,
        densityCorrection
      );
      
      if (!operatingPoint) continue;
      
      // Check constraints
      const issues = this.checkConstraints(
        operatingPoint,
        criteria,
        fan
      );
      
      // Calculate selection score
      const score = this.calculateScore(
        operatingPoint,
        criteria,
        fan,
        issues
      );
      
      // Check VFD option
      let alternateSpeed;
      if (criteria.application !== 'smokeControl') {
        alternateSpeed = this.calculateVFDOption(
          fan,
          criteria.designFlow,
          criteria.designPressure,
          densityCorrection
        );
      }
      
      results.push({
        fan,
        operatingPoint,
        score,
        issues,
        alternateSpeed
      });
    }
    
    // Sort by score
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Find fan operating point
   */
  static findOperatingPoint(
    fanCurves: FanPerformanceCurves,
    systemCurve: SystemCurve,
    densityCorrection: number
  ): FanOperatingPoint | null {
    // Find intersection of fan and system curves
    for (let i = 0; i < systemCurve.flowPoints.length - 1; i++) {
      const q1 = systemCurve.flowPoints[i];
      const q2 = systemCurve.flowPoints[i + 1];
      const p1 = systemCurve.pressurePoints[i];
      const p2 = systemCurve.pressurePoints[i + 1];
      
      // Get fan pressure at these flows
      const fp1 = this.interpolateCurve(fanCurves.flowPoints, fanCurves.staticPressure, q1);
      const fp2 = this.interpolateCurve(fanCurves.flowPoints, fanCurves.staticPressure, q2);
      
      // Check for intersection
      if ((fp1 >= p1 && fp2 <= p2) || (fp1 <= p1 && fp2 >= p2)) {
        // Linear interpolation to find exact point
        const t = (fp1 - p1) / ((fp1 - p1) - (fp2 - p2));
        const flow = q1 + t * (q2 - q1);
        const staticPressure = p1 + t * (p2 - p1);
        
        // Get other parameters at operating point
        const totalPressure = this.interpolateCurve(
          fanCurves.flowPoints,
          fanCurves.totalPressure,
          flow
        );
        
        const efficiency = this.interpolateCurve(
          fanCurves.flowPoints,
          fanCurves.efficiency,
          flow
        );
        
        const power = this.interpolateCurve(
          fanCurves.flowPoints,
          fanCurves.power,
          flow
        );
        
        const soundPower = this.interpolateCurve(
          fanCurves.flowPoints,
          fanCurves.soundPower,
          flow
        );
        
        // Apply density correction
        const correctedPower = power * densityCorrection;
        const motorPower = this.selectMotorSize(correctedPower);
        
        return {
          flow: flow * densityCorrection,
          staticPressure: staticPressure * densityCorrection,
          totalPressure: totalPressure * densityCorrection,
          efficiency,
          power: correctedPower,
          motorPower,
          speed: 1750, // Default
          soundPower
        };
      }
    }
    
    return null;
  }

  /**
   * Apply fan laws for different speed/size
   */
  static applyFanLaws(
    original: FanPerformanceCurves,
    originalSpeed: number,
    newSpeed: number,
    originalDiameter?: number,
    newDiameter?: number
  ): FanPerformanceCurves {
    const speedRatio = newSpeed / originalSpeed;
    const diameterRatio = newDiameter && originalDiameter ? 
                         newDiameter / originalDiameter : 1;
    
    return {
      flowPoints: original.flowPoints.map(q => 
        q * Math.pow(speedRatio, FAN_LAWS.flow.speed) * 
            Math.pow(diameterRatio, FAN_LAWS.flow.diameter)
      ),
      staticPressure: original.staticPressure.map(p => 
        p * Math.pow(speedRatio, FAN_LAWS.pressure.speed) * 
            Math.pow(diameterRatio, FAN_LAWS.pressure.diameter)
      ),
      totalPressure: original.totalPressure.map(p => 
        p * Math.pow(speedRatio, FAN_LAWS.pressure.speed) * 
            Math.pow(diameterRatio, FAN_LAWS.pressure.diameter)
      ),
      efficiency: [...original.efficiency], // Efficiency ~constant
      power: original.power.map(hp => 
        hp * Math.pow(speedRatio, FAN_LAWS.power.speed) * 
             Math.pow(diameterRatio, FAN_LAWS.power.diameter)
      ),
      soundPower: original.soundPower.map(db => 
        db + 50 * Math.log10(speedRatio) + 70 * Math.log10(diameterRatio || 1)
      )
    };
  }

  /**
   * Calculate system effect
   */
  static calculateSystemEffect(
    fanType: FanType,
    inletCondition: keyof typeof SYSTEM_EFFECT_FACTORS.inlet,
    outletCondition: keyof typeof SYSTEM_EFFECT_FACTORS.outlet
  ): number {
    const inletEffect = SYSTEM_EFFECT_FACTORS.inlet[inletCondition];
    const outletEffect = SYSTEM_EFFECT_FACTORS.outlet[outletCondition];
    
    // Centrifugal fans more sensitive to inlet conditions
    const inletFactor = fanType === 'centrifugal' ? 1.0 : 0.7;
    const outletFactor = fanType === 'axial' ? 1.0 : 0.7;
    
    return inletEffect * inletFactor + outletEffect * outletFactor;
  }

  /**
   * Generate system curve
   */
  static generateSystemCurve(
    designFlow: number,
    designPressure: number,
    systemType: 'fixed' | 'variable' = 'variable'
  ): SystemCurve {
    const flows = [];
    const pressures = [];
    
    // Generate points from 0 to 130% of design
    for (let i = 0; i <= 130; i += 10) {
      const flow = designFlow * i / 100;
      flows.push(flow);
      
      if (systemType === 'fixed') {
        // Fixed resistance (damper control)
        pressures.push(designPressure);
      } else {
        // Variable resistance (follows square law)
        const pressure = designPressure * Math.pow(i / 100, 2);
        pressures.push(pressure);
      }
    }
    
    // Estimate system effect
    const systemEffect = this.calculateSystemEffect(
      'centrifugal',
      'oneElbow',
      'ideal'
    );
    
    return {
      flowPoints: flows,
      pressurePoints: pressures,
      systemEffect
    };
  }

  /**
   * Density correction factor
   */
  static getDensityCorrection(altitude: number, temperature: number): number {
    // Standard conditions: sea level, 70°F
    const stdPressure = 14.696; // psia
    const stdTemp = 530; // °R
    
    // Altitude correction (simplified)
    const pressure = stdPressure * Math.pow((1 - 0.0000068755 * altitude), 5.2559);
    const temp = temperature + 459.67; // °R
    
    return (pressure / stdPressure) * (stdTemp / temp);
  }

  /**
   * Interpolate fan curve data
   */
  static interpolateCurve(x: number[], y: number[], xi: number): number {
    // Find surrounding points
    let i = 0;
    while (i < x.length - 1 && x[i + 1] < xi) i++;
    
    if (i >= x.length - 1) {
      // Extrapolate
      i = x.length - 2;
    }
    
    const x1 = x[i];
    const x2 = x[i + 1];
    const y1 = y[i];
    const y2 = y[i + 1];
    
    return y1 + (xi - x1) * (y2 - y1) / (x2 - x1);
  }

  /**
   * Check operating constraints
   */
  static checkConstraints(
    operatingPoint: FanOperatingPoint,
    criteria: FanSelectionCriteria,
    fan: FanSpecification
  ): string[] {
    const issues: string[] = [];
    
    // Check flow tolerance (±10%)
    const flowError = Math.abs(operatingPoint.flow - criteria.designFlow) / 
                     criteria.designFlow;
    if (flowError > 0.10) {
      issues.push(`Flow ${flowError > 0 ? 'exceeds' : 'below'} design by ${(flowError * 100).toFixed(1)}%`);
    }
    
    // Check efficiency
    if (criteria.efficiency && operatingPoint.efficiency < criteria.efficiency) {
      issues.push(`Efficiency ${operatingPoint.efficiency}% below required ${criteria.efficiency}%`);
    }
    
    // Check acoustics
    if (criteria.acousticRequirement && 
        operatingPoint.soundPower > criteria.acousticRequirement) {
      issues.push(`Sound power ${operatingPoint.soundPower} dB exceeds limit`);
    }
    
    // Check motor size
    if (operatingPoint.motorPower > fan.motor.hp) {
      issues.push(`Requires ${operatingPoint.motorPower} HP motor, fan has ${fan.motor.hp} HP`);
    }
    
    // Check operating region
    const bep = Math.max(...fan.curves.efficiency);
    const bepFlow = fan.curves.flowPoints[fan.curves.efficiency.indexOf(bep)];
    const percentBEP = (operatingPoint.flow / bepFlow) * 100;
    
    if (percentBEP < 60 || percentBEP > 120) {
      issues.push(`Operating at ${percentBEP.toFixed(0)}% of BEP (best 80-110%)`);
    }
    
    return issues;
  }

  /**
   * Calculate selection score
   */
  static calculateScore(
    operatingPoint: FanOperatingPoint,
    criteria: FanSelectionCriteria,
    fan: FanSpecification,
    issues: string[]
  ): number {
    let score = 100;
    
    // Deduct for issues
    score -= issues.length * 10;
    
    // Efficiency bonus
    if (operatingPoint.efficiency > 70) {
      score += (operatingPoint.efficiency - 70) * 0.5;
    }
    
    // Sound penalty
    if (operatingPoint.soundPower > 90) {
      score -= (operatingPoint.soundPower - 90) * 2;
    }
    
    // First cost consideration
    const priceFactor = Math.min(fan.price / 10000, 1);
    score -= priceFactor * 10;
    
    // Application-specific factors
    if (criteria.application === 'processExhaust' && fan.type === 'centrifugal') {
      score += 5; // Prefer centrifugal for process
    }
    
    if (criteria.redundancy && fan.construction.drive === 'belt') {
      score += 3; // Belt drive easier for redundancy
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate VFD operating option
   */
  static calculateVFDOption(
    fan: FanSpecification,
    targetFlow: number,
    targetPressure: number,
    densityCorrection: number
  ): FanOperatingPoint | undefined {
    // Find speed to meet design point
    const nominalFlow = targetFlow / densityCorrection;
    
    // Estimate required speed (iterative)
    let speed = fan.speed;
    
    for (let iter = 0; iter < 10; iter++) {
      const speedRatio = speed / fan.speed;
      const adjustedCurves = this.applyFanLaws(
        fan.curves,
        fan.speed,
        speed
      );
      
      const pressure = this.interpolateCurve(
        adjustedCurves.flowPoints,
        adjustedCurves.staticPressure,
        nominalFlow
      );
      
      const error = (pressure - targetPressure) / targetPressure;
      
      if (Math.abs(error) < 0.02) break;
      
      // Adjust speed
      speed *= Math.sqrt((targetPressure / pressure));
      speed = Math.max(fan.speed * 0.3, Math.min(fan.speed, speed));
    }
    
    // Calculate performance at VFD speed
    const speedRatio = speed / fan.speed;
    const adjustedCurves = this.applyFanLaws(fan.curves, fan.speed, speed);
    
    const efficiency = this.interpolateCurve(
      adjustedCurves.flowPoints,
      adjustedCurves.efficiency,
      nominalFlow
    );
    
    const power = this.interpolateCurve(
      adjustedCurves.flowPoints,
      adjustedCurves.power,
      nominalFlow
    ) * densityCorrection;
    
    const soundPower = this.interpolateCurve(
      adjustedCurves.flowPoints,
      adjustedCurves.soundPower,
      nominalFlow
    );
    
    return {
      flow: targetFlow,
      staticPressure: targetPressure,
      totalPressure: targetPressure * 1.1, // Estimate
      efficiency,
      power,
      motorPower: this.selectMotorSize(power),
      speed,
      soundPower
    };
  }

  /**
   * Select standard motor size
   */
  static selectMotorSize(bhp: number): number {
    const standardSizes = [0.5, 0.75, 1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 
                          25, 30, 40, 50, 60, 75, 100, 125, 150, 200];
    
    // Add 15% service factor
    const required = bhp * 1.15;
    
    for (const size of standardSizes) {
      if (size >= required) return size;
    }
    
    return Math.ceil(required / 50) * 50;
  }

  /**
   * Parallel fan operation
   */
  static parallelFans(
    fans: FanSpecification[],
    systemCurve: SystemCurve
  ): FanOperatingPoint {
    // For parallel fans, add flows at same pressure
    // This is simplified - full implementation would combine curves
    
    const totalFlow = fans.length * systemCurve.flowPoints[5]; // Mid-point
    const pressure = systemCurve.pressurePoints[5];
    const avgEfficiency = 65; // Typical
    const totalPower = fans.reduce((sum, f) => sum + f.motor.hp, 0) * 0.7;
    
    return {
      flow: totalFlow,
      staticPressure: pressure,
      totalPressure: pressure * 1.1,
      efficiency: avgEfficiency,
      power: totalPower,
      motorPower: totalPower * 1.15,
      speed: fans[0].speed,
      soundPower: fans[0].acoustics.overallSoundPower + 3 // +3dB for two fans
    };
  }

  /**
   * Series fan operation
   */
  static seriesFans(
    fans: FanSpecification[],
    systemCurve: SystemCurve
  ): FanOperatingPoint {
    // For series fans, add pressures at same flow
    const flow = systemCurve.flowPoints[5];
    const totalPressure = fans.length * systemCurve.pressurePoints[5];
    
    return {
      flow,
      staticPressure: totalPressure * 0.9,
      totalPressure,
      efficiency: 60, // Typically lower for series
      power: fans.reduce((sum, f) => sum + f.motor.hp, 0) * 0.8,
      motorPower: fans.reduce((sum, f) => sum + f.motor.hp, 0),
      speed: fans[0].speed,
      soundPower: fans[0].acoustics.overallSoundPower + 6 // Higher for series
    };
  }
}