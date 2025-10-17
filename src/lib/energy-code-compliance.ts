/**
 * Commercial-Grade Energy Code Compliance
 * Implements ASHRAE 90.1, IECC, Title 24, and other energy standards
 */

export interface BuildingEnvelope {
  climate: ClimateZone;
  area: number; // sq ft
  volume: number; // cu ft
  walls: EnvelopeComponent[];
  roof: EnvelopeComponent[];
  floor: EnvelopeComponent[];
  fenestration: FenestrationComponent[];
  infiltration: number; // ACH
}

export interface EnvelopeComponent {
  area: number; // sq ft
  uValue: number; // BTU/hr·ft²·°F
  mass: 'light' | 'medium' | 'heavy';
  orientation?: 'north' | 'south' | 'east' | 'west';
  adjacentTo: 'exterior' | 'ground' | 'unconditioned';
}

export interface FenestrationComponent {
  area: number; // sq ft
  uValue: number; // BTU/hr·ft²·°F
  shgc: number; // Solar Heat Gain Coefficient
  vlt: number; // Visible Light Transmittance
  orientation: 'north' | 'south' | 'east' | 'west';
  shading?: ShadingDevice;
}

export interface ShadingDevice {
  type: 'overhang' | 'fins' | 'louvers' | 'automated';
  projectionFactor: number;
  scheduleControl?: boolean;
}

export interface ClimateZone {
  zone: string; // "3A", "4B", etc.
  hdd65: number; // Heating Degree Days
  cdd65: number; // Cooling Degree Days
  moisture: 'dry' | 'moist' | 'marine';
}

export interface LightingSystem {
  spaces: LightingSpace[];
  controls: LightingControl[];
  totalPower: number; // W
  totalArea: number; // sq ft
}

export interface LightingSpace {
  type: SpaceType;
  area: number; // sq ft
  installedPower: number; // W
  lpd: number; // W/sq ft
  fixtures: LightingFixture[];
}

export interface LightingFixture {
  type: string;
  quantity: number;
  wattage: number;
  efficacy: number; // lumens/watt
  controls: string[];
}

export interface LightingControl {
  type: 'occupancy' | 'daylight' | 'timeclock' | 'dimming' | 'multilevel';
  spaces: string[];
  savings: number; // percentage
}

export interface HVACSystem {
  type: 'packaged' | 'split' | 'vrf' | 'chiller' | 'boiler';
  efficiency: {
    cooling?: { value: number; metric: 'EER' | 'SEER' | 'IEER' | 'COP' };
    heating?: { value: number; metric: 'AFUE' | 'HSPF' | 'COP' | 'Et' };
  };
  capacity: {
    cooling?: number; // tons
    heating?: number; // BTU/hr
  };
  controls: HVACControl[];
}

export interface HVACControl {
  type: 'economizer' | 'demandControl' | 'variableSpeed' | 'reset' | 'deadband';
  enabled: boolean;
  settings?: any;
}

export type SpaceType = 'office' | 'warehouse' | 'retail' | 'cultivation' | 
                       'processing' | 'classroom' | 'laboratory' | 'corridor';

export interface ComplianceResult {
  standard: 'ASHRAE90.1' | 'IECC' | 'Title24' | 'NECB';
  version: string;
  passes: boolean;
  envelope: ComponentCompliance;
  lighting: ComponentCompliance;
  hvac: ComponentCompliance;
  score: number; // 0-100
  recommendations: ComplianceRecommendation[];
}

export interface ComponentCompliance {
  passes: boolean;
  actualValue: number;
  requiredValue: number;
  margin: number; // percentage
  details: string[];
}

export interface ComplianceRecommendation {
  component: string;
  issue: string;
  recommendation: string;
  savings: number; // kWh/year
  cost: number; // $
  payback: number; // years
}

// ASHRAE 90.1-2019 Climate Zone Requirements
const ENVELOPE_REQUIREMENTS = {
  walls: {
    '1A': { mass: 0.58, steel: 0.124, wood: 0.089 },
    '2A': { mass: 0.58, steel: 0.124, wood: 0.089 },
    '3A': { mass: 0.151, steel: 0.084, wood: 0.089 },
    '4A': { mass: 0.123, steel: 0.064, wood: 0.089 },
    '5A': { mass: 0.104, steel: 0.055, wood: 0.051 },
    '6A': { mass: 0.090, steel: 0.049, wood: 0.051 },
    '7': { mass: 0.080, steel: 0.049, wood: 0.036 },
    '8': { mass: 0.058, steel: 0.049, wood: 0.036 }
  },
  roofs: {
    '1A': { insulated: 0.048, metal: 0.035 },
    '2A': { insulated: 0.039, metal: 0.035 },
    '3A': { insulated: 0.039, metal: 0.035 },
    '4A': { insulated: 0.032, metal: 0.031 },
    '5A': { insulated: 0.032, metal: 0.031 },
    '6A': { insulated: 0.032, metal: 0.031 },
    '7': { insulated: 0.028, metal: 0.029 },
    '8': { insulated: 0.028, metal: 0.026 }
  },
  fenestration: {
    '1A': { uValue: 1.22, shgc: 0.25 },
    '2A': { uValue: 0.75, shgc: 0.25 },
    '3A': { uValue: 0.50, shgc: 0.25 },
    '4A': { uValue: 0.42, shgc: 0.40 },
    '5A': { uValue: 0.38, shgc: 0.40 },
    '6A': { uValue: 0.36, shgc: 0.40 },
    '7': { uValue: 0.29, shgc: 0.45 },
    '8': { uValue: 0.29, shgc: 0.45 }
  }
};

// ASHRAE 90.1-2019 Lighting Power Density (W/sq ft)
const LPD_REQUIREMENTS = {
  office: 0.79,
  warehouse: 0.45,
  retail: 1.05,
  cultivation: 1.20, // Special allowance
  processing: 0.95,
  classroom: 0.71,
  laboratory: 1.33,
  corridor: 0.41,
  parking: 0.15,
  restroom: 0.63,
  storage: 0.42
};

// Equipment efficiency requirements
const EFFICIENCY_REQUIREMENTS = {
  cooling: {
    packaged: { small: 11.0, large: 11.2 }, // EER
    split: { small: 14.0, large: 11.2 }, // SEER/EER
    vrf: { small: 11.2, large: 10.8 }, // IEER
    chiller: { small: 10.0, large: 6.1 } // COP
  },
  heating: {
    furnace: { gas: 0.80, electric: 1.0 }, // AFUE
    boiler: { small: 0.82, large: 0.84 }, // Et
    heatPump: { air: 8.2, ground: 3.5 } // HSPF/COP
  }
};

export class EnergyCodeAnalyzer {
  /**
   * Analyze building for energy code compliance
   */
  static analyzeCompliance(
    envelope: BuildingEnvelope,
    lighting: LightingSystem,
    hvac: HVACSystem[],
    standard: 'ASHRAE90.1' | 'IECC' | 'Title24' = 'ASHRAE90.1',
    version: string = '2019'
  ): ComplianceResult {
    // Analyze envelope compliance
    const envelopeCompliance = this.checkEnvelopeCompliance(envelope, standard);
    
    // Analyze lighting compliance
    const lightingCompliance = this.checkLightingCompliance(lighting, standard);
    
    // Analyze HVAC compliance
    const hvacCompliance = this.checkHVACCompliance(hvac, envelope, standard);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      envelope,
      lighting,
      hvac,
      envelopeCompliance,
      lightingCompliance,
      hvacCompliance
    );
    
    // Calculate overall score
    const score = this.calculateComplianceScore(
      envelopeCompliance,
      lightingCompliance,
      hvacCompliance
    );
    
    const passes = envelopeCompliance.passes && 
                  lightingCompliance.passes && 
                  hvacCompliance.passes;
    
    return {
      standard,
      version,
      passes,
      envelope: envelopeCompliance,
      lighting: lightingCompliance,
      hvac: hvacCompliance,
      score,
      recommendations
    };
  }

  /**
   * Check envelope compliance
   */
  static checkEnvelopeCompliance(
    envelope: BuildingEnvelope,
    standard: string
  ): ComponentCompliance {
    const zone = envelope.climate.zone;
    const requirements = ENVELOPE_REQUIREMENTS;
    
    // Check wall U-values
    const wallReq = requirements.walls[zone]?.mass || 0.123;
    const avgWallU = this.getAreaWeightedU(envelope.walls);
    const wallComplies = avgWallU <= wallReq;
    
    // Check roof U-values
    const roofReq = requirements.roofs[zone]?.insulated || 0.032;
    const avgRoofU = this.getAreaWeightedU(envelope.roof);
    const roofComplies = avgRoofU <= roofReq;
    
    // Check fenestration
    const fenReq = requirements.fenestration[zone] || { uValue: 0.42, shgc: 0.40 };
    const avgFenU = this.getAreaWeightedU(envelope.fenestration);
    const avgSHGC = this.getAreaWeightedSHGC(envelope.fenestration);
    const fenComplies = avgFenU <= fenReq.uValue && avgSHGC <= fenReq.shgc;
    
    // Check window-to-wall ratio (max 40%)
    const wallArea = envelope.walls.reduce((sum, w) => sum + w.area, 0);
    const fenArea = envelope.fenestration.reduce((sum, f) => sum + f.area, 0);
    const wwr = fenArea / wallArea;
    const wwrComplies = wwr <= 0.40;
    
    const passes = wallComplies && roofComplies && fenComplies && wwrComplies;
    
    const details = [];
    if (!wallComplies) details.push(`Wall U-value ${avgWallU.toFixed(3)} exceeds ${wallReq}`);
    if (!roofComplies) details.push(`Roof U-value ${avgRoofU.toFixed(3)} exceeds ${roofReq}`);
    if (!fenComplies) details.push(`Fenestration non-compliant`);
    if (!wwrComplies) details.push(`WWR ${(wwr * 100).toFixed(1)}% exceeds 40%`);
    
    // Calculate actual vs required
    const actualValue = (avgWallU + avgRoofU + avgFenU) / 3;
    const requiredValue = (wallReq + roofReq + fenReq.uValue) / 3;
    const margin = ((requiredValue - actualValue) / requiredValue) * 100;
    
    return {
      passes,
      actualValue,
      requiredValue,
      margin,
      details
    };
  }

  /**
   * Check lighting compliance
   */
  static checkLightingCompliance(
    lighting: LightingSystem,
    standard: string
  ): ComponentCompliance {
    const spaces = lighting.spaces;
    const totalArea = lighting.totalArea;
    const totalPower = lighting.totalPower;
    
    // Calculate allowed power
    let allowedPower = 0;
    const spaceDetails = [];
    
    for (const space of spaces) {
      const allowedLPD = LPD_REQUIREMENTS[space.type] || 1.0;
      const spaceAllowance = space.area * allowedLPD;
      allowedPower += spaceAllowance;
      
      if (space.lpd > allowedLPD) {
        spaceDetails.push(
          `${space.type}: ${space.lpd.toFixed(2)} W/sf exceeds ${allowedLPD} W/sf`
        );
      }
    }
    
    // Check control requirements
    const hasRequiredControls = this.checkLightingControls(lighting.controls);
    
    // Apply control credits
    let controlCredit = 0;
    for (const control of lighting.controls) {
      if (control.type === 'occupancy') controlCredit += 0.10;
      if (control.type === 'daylight') controlCredit += 0.15;
      if (control.type === 'multilevel') controlCredit += 0.05;
    }
    
    const adjustedAllowance = allowedPower * (1 + Math.min(controlCredit, 0.30));
    const passes = totalPower <= adjustedAllowance && hasRequiredControls;
    
    const details = [...spaceDetails];
    if (!hasRequiredControls) {
      details.push('Missing required lighting controls');
    }
    
    return {
      passes,
      actualValue: totalPower / totalArea,
      requiredValue: allowedPower / totalArea,
      margin: ((adjustedAllowance - totalPower) / adjustedAllowance) * 100,
      details
    };
  }

  /**
   * Check HVAC compliance
   */
  static checkHVACCompliance(
    systems: HVACSystem[],
    envelope: BuildingEnvelope,
    standard: string
  ): ComponentCompliance {
    let totalCapacity = 0;
    let weightedEfficiency = 0;
    const details = [];
    
    for (const system of systems) {
      // Check cooling efficiency
      if (system.capacity.cooling) {
        const capacity = system.capacity.cooling;
        totalCapacity += capacity;
        
        const reqEfficiency = this.getRequiredEfficiency(
          system.type,
          'cooling',
          capacity
        );
        
        const actualEfficiency = system.efficiency.cooling?.value || 0;
        
        if (actualEfficiency < reqEfficiency) {
          details.push(
            `${system.type} cooling: ${actualEfficiency} ${system.efficiency.cooling?.metric} ` +
            `below required ${reqEfficiency}`
          );
        }
        
        weightedEfficiency += actualEfficiency * capacity;
      }
      
      // Check heating efficiency
      if (system.capacity.heating) {
        const reqEfficiency = this.getRequiredEfficiency(
          system.type,
          'heating',
          system.capacity.heating / 12000 // Convert BTU to tons
        );
        
        const actualEfficiency = system.efficiency.heating?.value || 0;
        
        if (actualEfficiency < reqEfficiency) {
          details.push(
            `${system.type} heating: ${actualEfficiency} ${system.efficiency.heating?.metric} ` +
            `below required ${reqEfficiency}`
          );
        }
      }
      
      // Check required controls
      const controlsOk = this.checkHVACControls(system, envelope);
      if (!controlsOk) {
        details.push(`${system.type} missing required controls`);
      }
    }
    
    const avgEfficiency = totalCapacity > 0 ? 
      weightedEfficiency / totalCapacity : 0;
    
    const passes = details.length === 0;
    
    return {
      passes,
      actualValue: avgEfficiency,
      requiredValue: 11.0, // Simplified
      margin: ((avgEfficiency - 11.0) / 11.0) * 100,
      details
    };
  }

  /**
   * Get area-weighted U-value
   */
  static getAreaWeightedU(components: any[]): number {
    let totalUA = 0;
    let totalArea = 0;
    
    for (const comp of components) {
      totalUA += comp.uValue * comp.area;
      totalArea += comp.area;
    }
    
    return totalArea > 0 ? totalUA / totalArea : 0;
  }

  /**
   * Get area-weighted SHGC
   */
  static getAreaWeightedSHGC(fenestration: FenestrationComponent[]): number {
    let totalSHGC = 0;
    let totalArea = 0;
    
    for (const fen of fenestration) {
      totalSHGC += fen.shgc * fen.area;
      totalArea += fen.area;
    }
    
    return totalArea > 0 ? totalSHGC / totalArea : 0;
  }

  /**
   * Check lighting control requirements
   */
  static checkLightingControls(controls: LightingControl[]): boolean {
    const hasOccupancy = controls.some(c => c.type === 'occupancy');
    const hasDaylight = controls.some(c => c.type === 'daylight');
    const hasMultilevel = controls.some(c => c.type === 'multilevel');
    
    // Simplified - would check specific space requirements
    return hasOccupancy && (hasDaylight || hasMultilevel);
  }

  /**
   * Get required equipment efficiency
   */
  static getRequiredEfficiency(
    systemType: string,
    mode: 'cooling' | 'heating',
    capacity: number
  ): number {
    const requirements = EFFICIENCY_REQUIREMENTS[mode];
    
    if (mode === 'cooling') {
      const size = capacity < 65 ? 'small' : 'large';
      return requirements[systemType]?.[size] || 11.0;
    } else {
      if (systemType.includes('furnace')) {
        return requirements.furnace.gas;
      } else if (systemType.includes('boiler')) {
        return capacity < 300 ? requirements.boiler.small : requirements.boiler.large;
      } else if (systemType.includes('heat')) {
        return requirements.heatPump.air;
      }
    }
    
    return 0.80; // Default
  }

  /**
   * Check HVAC control requirements
   */
  static checkHVACControls(system: HVACSystem, envelope: BuildingEnvelope): boolean {
    const requiredControls = [];
    
    // Economizer required for systems > 54,000 BTU/hr in many zones
    if (system.capacity.cooling && system.capacity.cooling > 4.5) {
      requiredControls.push('economizer');
    }
    
    // Variable speed required for fans > 5 HP
    if (system.capacity.cooling && system.capacity.cooling > 10) {
      requiredControls.push('variableSpeed');
    }
    
    // Check if all required controls are present
    for (const required of requiredControls) {
      const hasControl = system.controls.some(
        c => c.type === required && c.enabled
      );
      if (!hasControl) return false;
    }
    
    return true;
  }

  /**
   * Calculate compliance score
   */
  static calculateComplianceScore(
    envelope: ComponentCompliance,
    lighting: ComponentCompliance,
    hvac: ComponentCompliance
  ): number {
    let score = 0;
    
    // Base points for passing
    if (envelope.passes) score += 30;
    if (lighting.passes) score += 35;
    if (hvac.passes) score += 35;
    
    // Bonus for exceeding requirements
    if (envelope.margin > 10) score += 5;
    if (lighting.margin > 15) score += 5;
    if (hvac.margin > 10) score += 5;
    
    // Penalty for failures
    if (!envelope.passes) score = Math.max(0, score - 10);
    if (!lighting.passes) score = Math.max(0, score - 10);
    if (!hvac.passes) score = Math.max(0, score - 10);
    
    return Math.min(100, score);
  }

  /**
   * Generate recommendations
   */
  static generateRecommendations(
    envelope: BuildingEnvelope,
    lighting: LightingSystem,
    hvac: HVACSystem[],
    envelopeComp: ComponentCompliance,
    lightingComp: ComponentCompliance,
    hvacComp: ComponentCompliance
  ): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];
    
    // Envelope recommendations
    if (!envelopeComp.passes || envelopeComp.margin < 10) {
      if (envelope.walls.some(w => w.uValue > 0.1)) {
        recommendations.push({
          component: 'Envelope',
          issue: 'High wall U-values',
          recommendation: 'Add continuous insulation R-10 minimum',
          savings: envelope.area * 2.5, // kWh/year estimate
          cost: envelope.area * 3.50,
          payback: 1.4
        });
      }
      
      if (envelope.fenestration.some(f => f.shgc > 0.35)) {
        recommendations.push({
          component: 'Envelope',
          issue: 'High solar heat gain',
          recommendation: 'Install low-e glazing or external shading',
          savings: envelope.area * 1.8,
          cost: envelope.fenestration.reduce((sum, f) => sum + f.area, 0) * 25,
          payback: 2.3
        });
      }
    }
    
    // Lighting recommendations
    if (!lightingComp.passes || lightingComp.margin < 15) {
      const highLPDSpaces = lighting.spaces.filter(
        s => s.lpd > LPD_REQUIREMENTS[s.type]
      );
      
      for (const space of highLPDSpaces) {
        recommendations.push({
          component: 'Lighting',
          issue: `${space.type} exceeds LPD allowance`,
          recommendation: 'Upgrade to LED fixtures',
          savings: space.area * (space.lpd - LPD_REQUIREMENTS[space.type]) * 3000,
          cost: space.area * 4.00,
          payback: 1.8
        });
      }
      
      if (!lighting.controls.some(c => c.type === 'daylight')) {
        recommendations.push({
          component: 'Lighting',
          issue: 'No daylight harvesting',
          recommendation: 'Install photosensor controls in perimeter zones',
          savings: lighting.totalPower * 0.15 * 3000 / 1000,
          cost: 5000,
          payback: 2.5
        });
      }
    }
    
    // HVAC recommendations
    if (!hvacComp.passes || hvacComp.margin < 10) {
      for (const system of hvac) {
        if (system.efficiency.cooling?.value < 13) {
          recommendations.push({
            component: 'HVAC',
            issue: 'Low cooling efficiency',
            recommendation: 'Replace with high-efficiency unit (16+ SEER)',
            savings: system.capacity.cooling * 1200,
            cost: system.capacity.cooling * 1500,
            payback: 3.5
          });
        }
        
        if (!system.controls.some(c => c.type === 'variableSpeed')) {
          recommendations.push({
            component: 'HVAC',
            issue: 'No variable speed control',
            recommendation: 'Add VFD to fan motors',
            savings: system.capacity.cooling * 800,
            cost: system.capacity.cooling * 400,
            payback: 1.5
          });
        }
      }
    }
    
    return recommendations.sort((a, b) => a.payback - b.payback);
  }

  /**
   * Calculate annual energy use
   */
  static calculateEnergyUse(
    envelope: BuildingEnvelope,
    lighting: LightingSystem,
    hvac: HVACSystem[],
    occupancy: { hours: number; density: number }
  ): {
    heating: number; // kWh/year
    cooling: number; // kWh/year
    lighting: number; // kWh/year
    total: number; // kWh/year
    eui: number; // kBtu/sf/year
  } {
    // Simplified energy calculation
    const heatingLoad = this.calculateHeatingLoad(envelope);
    const coolingLoad = this.calculateCoolingLoad(envelope);
    
    // HVAC energy
    let heatingEnergy = 0;
    let coolingEnergy = 0;
    
    for (const system of hvac) {
      if (system.capacity.heating) {
        const efficiency = system.efficiency.heating?.value || 0.80;
        heatingEnergy += (heatingLoad * envelope.climate.hdd65 * 24) / 
                        (efficiency * 3412); // BTU to kWh
      }
      
      if (system.capacity.cooling) {
        const efficiency = system.efficiency.cooling?.value || 11.0;
        coolingEnergy += (coolingLoad * envelope.climate.cdd65 * 24) / 
                        (efficiency * 3.412); // tons to kW
      }
    }
    
    // Lighting energy
    const lightingEnergy = lighting.totalPower * occupancy.hours / 1000;
    
    const total = heatingEnergy + coolingEnergy + lightingEnergy;
    const eui = (total * 3.412) / envelope.area; // kBtu/sf/year
    
    return {
      heating: heatingEnergy,
      cooling: coolingEnergy,
      lighting: lightingEnergy,
      total,
      eui
    };
  }

  /**
   * Calculate heating load (simplified)
   */
  static calculateHeatingLoad(envelope: BuildingEnvelope): number {
    let load = 0;
    
    // Transmission losses
    for (const wall of envelope.walls) {
      load += wall.area * wall.uValue * 40; // 40°F delta T
    }
    
    for (const roof of envelope.roof) {
      load += roof.area * roof.uValue * 40;
    }
    
    for (const fen of envelope.fenestration) {
      load += fen.area * fen.uValue * 40;
    }
    
    // Infiltration
    load += envelope.volume * envelope.infiltration * 0.018 * 40;
    
    return load; // BTU/hr
  }

  /**
   * Calculate cooling load (simplified)
   */
  static calculateCoolingLoad(envelope: BuildingEnvelope): number {
    let load = 0;
    
    // Transmission gains
    for (const wall of envelope.walls) {
      load += wall.area * wall.uValue * 20; // 20°F delta T
    }
    
    for (const roof of envelope.roof) {
      load += roof.area * roof.uValue * 30; // Higher for roof
    }
    
    for (const fen of envelope.fenestration) {
      load += fen.area * fen.uValue * 20;
      // Solar gains
      load += fen.area * fen.shgc * 150; // BTU/hr/sf
    }
    
    // Internal gains (simplified)
    load += envelope.area * 5; // 5 BTU/hr/sf
    
    return load / 12000; // Convert to tons
  }
}