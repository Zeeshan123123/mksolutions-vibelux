/**
 * Commercial-Grade Ductwork Design and Sizing
 * Implements ASHRAE and ACCA Manual D methodologies
 * Includes equal friction, static regain, and T-method sizing
 */

export interface DuctSection {
  id: string;
  type: 'supply' | 'return' | 'exhaust';
  shape: 'rectangular' | 'round' | 'oval';
  length: number; // feet
  airflow: number; // CFM
  dimensions: DuctDimensions;
  material: DuctMaterial;
  insulation?: InsulationSpec;
  fittings: DuctFitting[];
  downstream?: string[]; // connected sections
}

export interface DuctDimensions {
  width?: number; // inches (rectangular)
  height?: number; // inches (rectangular)
  diameter?: number; // inches (round)
  majorAxis?: number; // inches (oval)
  minorAxis?: number; // inches (oval)
}

export interface DuctMaterial {
  type: 'galvanized' | 'aluminum' | 'fiberglass' | 'flexible';
  gauge?: number;
  roughness: number; // absolute roughness in feet
}

export interface InsulationSpec {
  type: 'internal' | 'external';
  thickness: number; // inches
  rValue: number;
}

export interface DuctFitting {
  type: 'elbow' | 'tee' | 'wye' | 'transition' | 'damper' | 'takeoff';
  angle?: number; // degrees for elbows
  radius?: number; // radius/width ratio
  branch?: boolean; // for tees
  dimensions?: DuctDimensions;
}

export interface DuctDesignCriteria {
  method: 'equalFriction' | 'staticRegain' | 'tMethod';
  maxVelocity: VelocityLimits;
  frictionRate?: number; // inches w.g. per 100 ft
  noiseClass?: 'A' | 'B' | 'C' | 'RC';
  minBranchVelocity?: number; // fpm
}

export interface VelocityLimits {
  main: number; // fpm
  branch: number; // fpm
  final: number; // fpm at diffuser
}

export interface DuctSizingResult {
  section: DuctSection;
  velocity: number; // fpm
  frictionLoss: number; // inches w.g. per 100 ft
  pressureLoss: number; // inches w.g. total
  equivalentDiameter: number; // inches
  aspectRatio?: number; // width/height
  reynoldsNumber: number;
  noiseLevel: number; // NC rating
}

// ASHRAE recommended velocities (fpm)
const VELOCITY_RECOMMENDATIONS = {
  residential: {
    main: 700,
    branch: 600,
    final: 500
  },
  commercial: {
    main: 1200,
    branch: 800,
    final: 600
  },
  industrial: {
    main: 2000,
    branch: 1500,
    final: 1000
  }
};

// Fitting loss coefficients
const FITTING_COEFFICIENTS = {
  elbow: {
    smooth: { 90: 0.25, 45: 0.15 },
    mitered: { 90: 1.3, 45: 0.65 },
    vaned: { 90: 0.15, 45: 0.08 }
  },
  tee: {
    straight: 0.3,
    branch: 1.0,
    conical: 0.5
  },
  transition: {
    gradual: 0.15,
    abrupt: 0.5
  },
  damper: {
    open: 0.05,
    halfOpen: 2.0,
    butterfly: 0.3
  }
};

export class DuctworkDesigner {
  /**
   * Size duct system using selected method
   */
  static designSystem(
    sections: DuctSection[],
    criteria: DuctDesignCriteria,
    totalStaticPressure: number // inches w.g. available
  ): DuctSizingResult[] {
    const results: DuctSizingResult[] = [];
    
    switch (criteria.method) {
      case 'equalFriction':
        return this.equalFrictionMethod(sections, criteria);
      case 'staticRegain':
        return this.staticRegainMethod(sections, criteria, totalStaticPressure);
      case 'tMethod':
        return this.tMethod(sections, criteria, totalStaticPressure);
      default:
        return this.equalFrictionMethod(sections, criteria);
    }
  }

  /**
   * Equal friction method - constant pressure drop per unit length
   */
  static equalFrictionMethod(
    sections: DuctSection[],
    criteria: DuctDesignCriteria
  ): DuctSizingResult[] {
    const results: DuctSizingResult[] = [];
    const frictionRate = criteria.frictionRate || 0.08; // default 0.08" w.g./100 ft
    
    for (const section of sections) {
      // Calculate required diameter for friction rate
      const diameter = this.sizeForFriction(
        section.airflow,
        frictionRate,
        section.material.roughness
      );
      
      // Convert to actual dimensions based on shape
      const dimensions = this.convertToDimensions(
        diameter,
        section.shape,
        section.airflow
      );
      
      // Update section dimensions
      section.dimensions = dimensions;
      
      // Calculate actual performance
      const velocity = this.calculateVelocity(section.airflow, dimensions);
      const actualFriction = this.calculateFrictionLoss(
        section.airflow,
        dimensions,
        section.material.roughness
      );
      
      // Calculate total pressure loss including fittings
      const fittingLoss = this.calculateFittingLosses(
        section.fittings,
        velocity
      );
      
      const totalLoss = (actualFriction * section.length / 100) + fittingLoss;
      
      // Check noise criteria
      const noiseLevel = this.estimateNoiseLevel(velocity, dimensions);
      
      results.push({
        section,
        velocity,
        frictionLoss: actualFriction,
        pressureLoss: totalLoss,
        equivalentDiameter: diameter,
        aspectRatio: dimensions.width && dimensions.height ? 
          dimensions.width / dimensions.height : undefined,
        reynoldsNumber: this.calculateReynolds(velocity, diameter),
        noiseLevel
      });
    }
    
    return results;
  }

  /**
   * Static regain method - maintain static pressure at branches
   */
  static staticRegainMethod(
    sections: DuctSection[],
    criteria: DuctDesignCriteria,
    availableStaticPressure: number
  ): DuctSizingResult[] {
    const results: DuctSizingResult[] = [];
    let remainingPressure = availableStaticPressure;
    
    // Process main trunk first
    const mainSections = sections.filter(s => s.downstream && s.downstream.length > 0);
    const branchSections = sections.filter(s => !s.downstream || s.downstream.length === 0);
    
    for (const section of mainSections) {
      // Size for velocity reduction to regain static pressure
      const upstreamVelocity = criteria.maxVelocity.main;
      const downstreamSections = sections.filter(s => 
        section.downstream?.includes(s.id)
      );
      
      const downstreamFlow = downstreamSections.reduce(
        (sum, s) => sum + s.airflow, 0
      );
      
      // Calculate velocity for static regain
      const velocityRatio = Math.sqrt(downstreamFlow / section.airflow);
      const targetVelocity = upstreamVelocity * velocityRatio;
      
      // Size duct for target velocity
      const area = section.airflow / targetVelocity;
      const diameter = Math.sqrt(4 * area / Math.PI) * 12; // inches
      
      const dimensions = this.convertToDimensions(
        diameter,
        section.shape,
        section.airflow
      );
      
      section.dimensions = dimensions;
      
      // Calculate pressure regain
      const regain = this.calculateStaticRegain(
        upstreamVelocity,
        targetVelocity
      );
      
      const frictionLoss = this.calculateFrictionLoss(
        section.airflow,
        dimensions,
        section.material.roughness
      );
      
      const fittingLoss = this.calculateFittingLosses(
        section.fittings,
        targetVelocity
      );
      
      const netLoss = (frictionLoss * section.length / 100) + 
                     fittingLoss - regain;
      
      remainingPressure -= netLoss;
      
      results.push({
        section,
        velocity: targetVelocity,
        frictionLoss,
        pressureLoss: netLoss,
        equivalentDiameter: diameter,
        aspectRatio: dimensions.width && dimensions.height ? 
          dimensions.width / dimensions.height : undefined,
        reynoldsNumber: this.calculateReynolds(targetVelocity, diameter),
        noiseLevel: this.estimateNoiseLevel(targetVelocity, dimensions)
      });
    }
    
    // Size branches with remaining pressure
    for (const branch of branchSections) {
      const result = this.sizeBranchDuct(branch, remainingPressure, criteria);
      results.push(result);
    }
    
    return results;
  }

  /**
   * T-Method - optimized for first cost and operating cost
   */
  static tMethod(
    sections: DuctSection[],
    criteria: DuctDesignCriteria,
    totalStaticPressure: number
  ): DuctSizingResult[] {
    // Implementation would include economic optimization
    // For now, use modified equal friction
    const economicFriction = this.calculateEconomicFriction(totalStaticPressure);
    criteria.frictionRate = economicFriction;
    return this.equalFrictionMethod(sections, criteria);
  }

  /**
   * Calculate duct diameter for target friction rate
   */
  static sizeForFriction(
    airflow: number, // CFM
    frictionRate: number, // inches w.g. per 100 ft
    roughness: number // feet
  ): number {
    // Using Darcy-Weisbach with Colebrook approximation
    // Iterative solution for diameter
    let diameter = Math.sqrt(airflow / 400); // Initial guess
    
    for (let i = 0; i < 10; i++) {
      const velocity = (airflow * 144) / (Math.PI * Math.pow(diameter, 2) / 4);
      const reynolds = this.calculateReynolds(velocity * 60, diameter);
      const f = this.darcyFriction(reynolds, roughness, diameter / 12);
      
      const calculatedFriction = (12 * f * Math.pow(velocity, 2)) / 
                                (diameter / 12 * 2 * 32.2 * 0.075);
      
      const error = calculatedFriction - frictionRate;
      
      if (Math.abs(error) < 0.001) break;
      
      // Adjust diameter
      diameter *= Math.sqrt(calculatedFriction / frictionRate);
    }
    
    return diameter;
  }

  /**
   * Convert equivalent diameter to actual duct dimensions
   */
  static convertToDimensions(
    equivalentDiameter: number,
    shape: string,
    airflow: number
  ): DuctDimensions {
    if (shape === 'round') {
      return { diameter: Math.ceil(equivalentDiameter) };
    }
    
    if (shape === 'rectangular') {
      // Use aspect ratio constraints (max 4:1)
      const area = Math.PI * Math.pow(equivalentDiameter / 2, 2);
      
      // Standard duct sizes
      const standardWidths = [6, 8, 10, 12, 14, 16, 18, 20, 24, 30, 36, 42, 48];
      const standardHeights = [6, 8, 10, 12, 14, 16, 18, 20, 24, 30, 36];
      
      let bestMatch = { width: 12, height: 12, deviation: Infinity };
      
      for (const width of standardWidths) {
        for (const height of standardHeights) {
          if (width / height > 4 || height / width > 4) continue;
          
          const ductArea = width * height;
          const deviation = Math.abs(ductArea - area);
          
          if (deviation < bestMatch.deviation) {
            bestMatch = { width, height, deviation };
          }
        }
      }
      
      return { width: bestMatch.width, height: bestMatch.height };
    }
    
    if (shape === 'oval') {
      // Flat oval with 2:1 ratio
      const area = Math.PI * Math.pow(equivalentDiameter / 2, 2);
      const minorAxis = Math.sqrt(area / (2 * Math.PI));
      const majorAxis = minorAxis * 2;
      
      return { 
        majorAxis: Math.ceil(majorAxis), 
        minorAxis: Math.ceil(minorAxis) 
      };
    }
    
    return { diameter: equivalentDiameter };
  }

  /**
   * Calculate air velocity in duct
   */
  static calculateVelocity(
    airflow: number, // CFM
    dimensions: DuctDimensions
  ): number {
    let area: number;
    
    if (dimensions.diameter) {
      area = Math.PI * Math.pow(dimensions.diameter / 2, 2);
    } else if (dimensions.width && dimensions.height) {
      area = dimensions.width * dimensions.height;
    } else if (dimensions.majorAxis && dimensions.minorAxis) {
      area = Math.PI * dimensions.majorAxis * dimensions.minorAxis / 4;
    } else {
      area = 144; // Default 1 sq ft
    }
    
    return (airflow * 144) / area; // fpm
  }

  /**
   * Calculate friction loss using Darcy-Weisbach
   */
  static calculateFrictionLoss(
    airflow: number,
    dimensions: DuctDimensions,
    roughness: number
  ): number {
    const velocity = this.calculateVelocity(airflow, dimensions);
    const hydraulicDiameter = this.hydraulicDiameter(dimensions);
    const reynolds = this.calculateReynolds(velocity, hydraulicDiameter);
    const f = this.darcyFriction(reynolds, roughness, hydraulicDiameter / 12);
    
    // Pressure loss in inches w.g. per 100 ft
    const loss = (12 * f * 100 * Math.pow(velocity / 60, 2)) / 
                (hydraulicDiameter / 12 * 2 * 32.2 * 0.075);
    
    return loss;
  }

  /**
   * Calculate hydraulic diameter
   */
  static hydraulicDiameter(dimensions: DuctDimensions): number {
    if (dimensions.diameter) {
      return dimensions.diameter;
    }
    
    if (dimensions.width && dimensions.height) {
      const perimeter = 2 * (dimensions.width + dimensions.height);
      const area = dimensions.width * dimensions.height;
      return 4 * area / perimeter;
    }
    
    if (dimensions.majorAxis && dimensions.minorAxis) {
      // Approximation for oval
      const a = dimensions.majorAxis / 2;
      const b = dimensions.minorAxis / 2;
      const perimeter = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
      const area = Math.PI * a * b;
      return 4 * area / perimeter;
    }
    
    return 12; // Default
  }

  /**
   * Calculate Reynolds number
   */
  static calculateReynolds(velocity: number, diameter: number): number {
    // Standard air properties at 70°F
    const kinematicViscosity = 16.15e-5; // ft²/s
    return (velocity / 60) * (diameter / 12) / kinematicViscosity;
  }

  /**
   * Darcy friction factor
   */
  static darcyFriction(
    reynolds: number,
    roughness: number,
    diameter: number
  ): number {
    if (reynolds < 2300) {
      return 64 / reynolds;
    }
    
    // Colebrook equation approximation
    const relRoughness = roughness / diameter;
    const a = -2 * Math.log10(relRoughness / 3.7 + 2.51 / (reynolds * Math.sqrt(0.01)));
    return 1 / Math.pow(a, 2);
  }

  /**
   * Calculate fitting pressure losses
   */
  static calculateFittingLosses(
    fittings: DuctFitting[],
    velocity: number
  ): number {
    let totalLoss = 0;
    const velocityPressure = Math.pow(velocity / 4005, 2);
    
    for (const fitting of fittings) {
      let coefficient = 0;
      
      switch (fitting.type) {
        case 'elbow':
          const angle = fitting.angle || 90;
          const radius = fitting.radius || 1.5;
          coefficient = radius > 1 ? 
            FITTING_COEFFICIENTS.elbow.smooth[angle] :
            FITTING_COEFFICIENTS.elbow.mitered[angle];
          break;
        case 'tee':
          coefficient = fitting.branch ? 
            FITTING_COEFFICIENTS.tee.branch :
            FITTING_COEFFICIENTS.tee.straight;
          break;
        case 'transition':
          coefficient = FITTING_COEFFICIENTS.transition.gradual;
          break;
        case 'damper':
          coefficient = FITTING_COEFFICIENTS.damper.open;
          break;
        default:
          coefficient = 0.5;
      }
      
      totalLoss += coefficient * velocityPressure;
    }
    
    return totalLoss;
  }

  /**
   * Calculate static pressure regain
   */
  static calculateStaticRegain(
    upstreamVelocity: number,
    downstreamVelocity: number
  ): number {
    const upstreamVP = Math.pow(upstreamVelocity / 4005, 2);
    const downstreamVP = Math.pow(downstreamVelocity / 4005, 2);
    return 0.75 * (upstreamVP - downstreamVP); // 75% recovery factor
  }

  /**
   * Estimate noise level
   */
  static estimateNoiseLevel(
    velocity: number,
    dimensions: DuctDimensions
  ): number {
    // Simplified noise prediction
    const baseNC = 10 * Math.log10(velocity / 100);
    const sizeCorrection = dimensions.diameter ? 
      -10 * Math.log10(dimensions.diameter / 12) :
      -10 * Math.log10(this.hydraulicDiameter(dimensions) / 12);
    
    return Math.round(baseNC + sizeCorrection + 25);
  }

  /**
   * Calculate economic friction rate
   */
  static calculateEconomicFriction(availablePressure: number): number {
    // Rule of thumb: use 25-40% of available static for supply duct
    return availablePressure * 0.3 / 500; // Assume 500 ft equivalent length
  }

  /**
   * Size branch duct
   */
  static sizeBranchDuct(
    branch: DuctSection,
    availablePressure: number,
    criteria: DuctDesignCriteria
  ): DuctSizingResult {
    // Size for available pressure
    const targetFriction = availablePressure / (branch.length / 100);
    const diameter = this.sizeForFriction(
      branch.airflow,
      targetFriction,
      branch.material.roughness
    );
    
    const dimensions = this.convertToDimensions(
      diameter,
      branch.shape,
      branch.airflow
    );
    
    branch.dimensions = dimensions;
    
    const velocity = this.calculateVelocity(branch.airflow, dimensions);
    const frictionLoss = this.calculateFrictionLoss(
      branch.airflow,
      dimensions,
      branch.material.roughness
    );
    
    const fittingLoss = this.calculateFittingLosses(branch.fittings, velocity);
    const totalLoss = (frictionLoss * branch.length / 100) + fittingLoss;
    
    return {
      section: branch,
      velocity,
      frictionLoss,
      pressureLoss: totalLoss,
      equivalentDiameter: diameter,
      aspectRatio: dimensions.width && dimensions.height ? 
        dimensions.width / dimensions.height : undefined,
      reynoldsNumber: this.calculateReynolds(velocity, diameter),
      noiseLevel: this.estimateNoiseLevel(velocity, dimensions)
    };
  }
}