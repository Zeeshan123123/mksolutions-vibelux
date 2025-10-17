/**
 * NEC Validation Engine - Quick Win Implementation
 * Real NEC 2020 compliance validation that can be built in 2-3 days
 */

// NEC Table 310.15(B)(16) - Actual wire ampacity ratings
export const NEC_WIRE_AMPACITY_TABLE = {
  // AWG Size: { Copper 60°C, Copper 75°C, Copper 90°C, Aluminum 75°C, Aluminum 90°C }
  '14': { cu60: 15, cu75: 20, cu90: 25, al75: 15, al90: 20 },
  '12': { cu60: 20, cu75: 25, cu90: 30, al75: 20, al90: 25 },
  '10': { cu60: 30, cu75: 35, cu90: 40, al75: 30, al90: 35 },
  '8':  { cu60: 40, cu75: 50, cu90: 55, al75: 40, al90: 45 },
  '6':  { cu60: 55, cu75: 65, cu90: 75, al75: 50, al90: 60 },
  '4':  { cu60: 70, cu75: 85, cu90: 95, al75: 65, al90: 75 },
  '3':  { cu60: 85, cu75: 100, cu90: 115, al75: 75, al90: 85 },
  '2':  { cu60: 95, cu75: 115, cu90: 130, al75: 90, al90: 100 },
  '1':  { cu60: 110, cu75: 130, cu90: 150, al75: 100, al90: 115 },
  '1/0': { cu60: 125, cu75: 150, cu90: 170, al75: 120, al90: 135 },
  '2/0': { cu60: 145, cu75: 175, cu90: 195, al75: 135, al90: 150 },
  '3/0': { cu60: 165, cu75: 200, cu90: 225, al75: 155, al90: 175 },
  '4/0': { cu60: 195, cu75: 230, cu90: 260, al75: 180, al90: 205 },
  '250': { cu60: 215, cu75: 255, cu90: 290, al75: 205, al90: 230 },
  '300': { cu60: 240, cu75: 285, cu90: 320, al75: 230, al90: 260 },
  '350': { cu60: 260, cu75: 310, cu90: 350, al75: 250, al90: 280 },
  '400': { cu60: 280, cu75: 335, cu90: 380, al75: 270, al90: 305 },
  '500': { cu60: 320, cu75: 380, cu90: 430, al75: 310, al90: 350 }
};

// NEC Table 250.66 - Grounding Electrode Conductor sizing
export const NEC_GROUNDING_CONDUCTOR_TABLE = {
  // Service conductor size : minimum grounding conductor
  '2 or smaller': '8',
  '1 or 1/0': '6',
  '2/0 or 3/0': '4',
  '4/0 to 350': '2',
  '400 to 600': '1/0',
  '700 to 1100': '2/0'
};

// NEC Article 210.19 - Voltage drop limits
export const NEC_VOLTAGE_DROP_LIMITS = {
  branch_circuit: 0.03, // 3%
  feeder: 0.03, // 3%
  combined: 0.05 // 5% total
};

// NEC Article 310.15(B)(3)(a) - Temperature derating factors
export const NEC_TEMPERATURE_DERATING = {
  '21-25': 1.08,
  '26-30': 1.00,
  '31-35': 0.91,
  '36-40': 0.82,
  '41-45': 0.71,
  '46-50': 0.58,
  '51-55': 0.41,
  '56-60': 0.00
};

// NEC Table 310.15(B)(3)(a) - Conduit fill derating
export const NEC_CONDUIT_FILL_DERATING = {
  '4-6': 0.80,   // 4-6 conductors
  '7-9': 0.70,   // 7-9 conductors  
  '10-20': 0.50, // 10-20 conductors
  '21-30': 0.45, // 21-30 conductors
  '31-40': 0.40, // 31-40 conductors
  '41+': 0.35    // 41+ conductors
};

export interface NECValidationResult {
  compliant: boolean;
  violations: NECViolation[];
  warnings: NECWarning[];
  calculations: NECCalculation[];
}

export interface NECViolation {
  code: string;
  section: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  correction: string;
}

export interface NECWarning {
  code: string;
  section: string;
  description: string;
  recommendation: string;
}

export interface NECCalculation {
  parameter: string;
  calculated: number;
  required: number;
  unit: string;
  margin: number; // percentage above minimum
}

export class NECValidationEngine {
  /**
   * Validate wire sizing per NEC Article 310
   */
  static validateWireSizing(
    load: number, // amperes
    wireSize: string,
    material: 'copper' | 'aluminum',
    temperature: number, // °C
    conductorsInConduit: number,
    length: number, // feet
    voltage: number
  ): NECValidationResult {
    const violations: NECViolation[] = [];
    const warnings: NECWarning[] = [];
    const calculations: NECCalculation[] = [];
    
    // Get base ampacity from table
    const ampacityData = NEC_WIRE_AMPACITY_TABLE[wireSize as keyof typeof NEC_WIRE_AMPACITY_TABLE];
    if (!ampacityData) {
      violations.push({
        code: 'NEC-310-15',
        section: '310.15(B)(16)',
        description: `Invalid wire size: ${wireSize}`,
        severity: 'critical',
        correction: 'Use standard AWG wire size from Table 310.15(B)(16)'
      });
      return { compliant: false, violations, warnings, calculations };
    }
    
    // Select base ampacity (assume 75°C terminations)
    const baseAmpacity = material === 'copper' ? ampacityData.cu75 : ampacityData.al75;
    
    // Apply temperature derating
    const tempKey = this.getTemperatureRange(temperature);
    const tempDerating = NEC_TEMPERATURE_DERATING[tempKey as keyof typeof NEC_TEMPERATURE_DERATING] || 1.0;
    
    // Apply conduit fill derating
    const fillDerating = this.getConduitFillDerating(conductorsInConduit);
    
    // Calculate final ampacity
    const finalAmpacity = baseAmpacity * tempDerating * fillDerating;
    
    calculations.push({
      parameter: 'Wire Ampacity',
      calculated: finalAmpacity,
      required: load,
      unit: 'A',
      margin: ((finalAmpacity - load) / load) * 100
    });
    
    // Check if wire can handle the load
    if (finalAmpacity < load) {
      violations.push({
        code: 'NEC-310-15',
        section: '310.15(B)(16)',
        description: `Wire ampacity (${finalAmpacity.toFixed(1)}A) insufficient for load (${load}A)`,
        severity: 'critical',
        correction: `Increase wire size or reduce number of conductors in conduit`
      });
    }
    
    // Check voltage drop
    const voltageDrop = this.calculateVoltageDrop(load, wireSize, material, length, voltage);
    const voltageDropPercent = (voltageDrop / voltage) * 100;
    
    calculations.push({
      parameter: 'Voltage Drop',
      calculated: voltageDropPercent,
      required: NEC_VOLTAGE_DROP_LIMITS.branch_circuit * 100,
      unit: '%',
      margin: (NEC_VOLTAGE_DROP_LIMITS.branch_circuit * 100 - voltageDropPercent) / (NEC_VOLTAGE_DROP_LIMITS.branch_circuit * 100) * 100
    });
    
    if (voltageDropPercent > NEC_VOLTAGE_DROP_LIMITS.branch_circuit * 100) {
      violations.push({
        code: 'NEC-210-19',
        section: '210.19(A)(1)',
        description: `Voltage drop (${voltageDropPercent.toFixed(2)}%) exceeds 3% limit`,
        severity: 'major',
        correction: 'Increase wire size to reduce voltage drop'
      });
    } else if (voltageDropPercent > 2.5) {
      warnings.push({
        code: 'NEC-210-19',
        section: '210.19(A)(1)',
        description: `Voltage drop (${voltageDropPercent.toFixed(2)}%) approaching 3% limit`,
        recommendation: 'Consider larger wire size for better performance'
      });
    }
    
    return {
      compliant: violations.length === 0,
      violations,
      warnings,
      calculations
    };
  }
  
  /**
   * Validate GFCI requirements per NEC Article 210.8
   */
  static validateGFCIRequirements(
    location: string,
    circuitType: 'lighting' | 'receptacle' | 'equipment',
    voltage: number,
    amperage: number
  ): NECValidationResult {
    const violations: NECViolation[] = [];
    const warnings: NECWarning[] = [];
    const calculations: NECCalculation[] = [];
    
    // GFCI required locations per NEC 210.8
    const gfciRequiredLocations = [
      'bathroom',
      'garage',
      'outdoor',
      'basement',
      'kitchen_counter',
      'laundry',
      'utility_sink',
      'wet_bar',
      'pool_area',
      'spa_area'
    ];
    
    const requiresGFCI = gfciRequiredLocations.some(loc => 
      location.toLowerCase().includes(loc.replace('_', ' '))
    );
    
    if (requiresGFCI && circuitType === 'receptacle' && voltage <= 150) {
      violations.push({
        code: 'NEC-210-8',
        section: '210.8(A)',
        description: `GFCI protection required for ${circuitType} in ${location}`,
        severity: 'critical',
        correction: 'Install GFCI circuit breaker or GFCI receptacle'
      });
    }
    
    return {
      compliant: violations.length === 0,
      violations,
      warnings,
      calculations
    };
  }
  
  /**
   * Validate panel sizing per NEC Article 408
   */
  static validatePanelSizing(
    totalLoad: number, // amperes
    panelRating: number, // amperes
    numberOfCircuits: number,
    panelSpaces: number
  ): NECValidationResult {
    const violations: NECViolation[] = [];
    const warnings: NECWarning[] = [];
    const calculations: NECCalculation[] = [];
    
    // Check panel load rating
    const loadPercent = (totalLoad / panelRating) * 100;
    
    calculations.push({
      parameter: 'Panel Loading',
      calculated: loadPercent,
      required: 80, // NEC recommends 80% maximum
      unit: '%',
      margin: (80 - loadPercent) / 80 * 100
    });
    
    if (loadPercent > 100) {
      violations.push({
        code: 'NEC-408-36',
        section: '408.36',
        description: `Panel load (${loadPercent.toFixed(1)}%) exceeds panel rating`,
        severity: 'critical',
        correction: 'Increase panel size or redistribute loads'
      });
    } else if (loadPercent > 80) {
      warnings.push({
        code: 'NEC-408-36',
        section: '408.36',
        description: `Panel load (${loadPercent.toFixed(1)}%) exceeds recommended 80%`,
        recommendation: 'Consider larger panel for future expansion'
      });
    }
    
    // Check circuit spaces
    if (numberOfCircuits > panelSpaces) {
      violations.push({
        code: 'NEC-408-15',
        section: '408.15',
        description: `Number of circuits (${numberOfCircuits}) exceeds panel spaces (${panelSpaces})`,
        severity: 'critical',
        correction: 'Use larger panel or add subpanel'
      });
    }
    
    // Recommend spare spaces (20% minimum)
    const spareSpaces = panelSpaces - numberOfCircuits;
    const sparePercent = (spareSpaces / panelSpaces) * 100;
    
    if (sparePercent < 20) {
      warnings.push({
        code: 'NEC-408-15',
        section: '408.15',
        description: `Only ${sparePercent.toFixed(1)}% spare spaces available`,
        recommendation: 'Consider panel with more spaces for future expansion'
      });
    }
    
    return {
      compliant: violations.length === 0,
      violations,
      warnings,
      calculations
    };
  }
  
  /**
   * Calculate voltage drop using NEC formulas
   */
  private static calculateVoltageDrop(
    current: number,
    wireSize: string,
    material: 'copper' | 'aluminum',
    length: number,
    voltage: number
  ): number {
    // Wire resistance per 1000 ft (ohms) - from NEC Chapter 9, Table 8
    const wireResistance = {
      copper: {
        '14': 3.07, '12': 1.93, '10': 1.21, '8': 0.764,
        '6': 0.491, '4': 0.308, '2': 0.194, '1': 0.154,
        '1/0': 0.122, '2/0': 0.097, '3/0': 0.077, '4/0': 0.061
      },
      aluminum: {
        '12': 3.18, '10': 1.99, '8': 1.26, '6': 0.808,
        '4': 0.508, '2': 0.319, '1': 0.253, '1/0': 0.201,
        '2/0': 0.159, '3/0': 0.126, '4/0': 0.100
      }
    };
    
    const resistance = wireResistance[material][wireSize as keyof typeof wireResistance[typeof material]] || 0;
    
    // Voltage drop = 2 × K × I × L × R / CM (for single phase)
    // Simplified: VD = I × R × L / 1000 × 2 (round trip)
    return (current * resistance * length * 2) / 1000;
  }
  
  /**
   * Get temperature range key for derating table
   */
  private static getTemperatureRange(temp: number): string {
    if (temp <= 25) return '21-25';
    if (temp <= 30) return '26-30';
    if (temp <= 35) return '31-35';
    if (temp <= 40) return '36-40';
    if (temp <= 45) return '41-45';
    if (temp <= 50) return '46-50';
    if (temp <= 55) return '51-55';
    return '56-60';
  }
  
  /**
   * Get conduit fill derating factor
   */
  private static getConduitFillDerating(conductors: number): number {
    if (conductors <= 3) return 1.0;
    if (conductors <= 6) return NEC_CONDUIT_FILL_DERATING['4-6'];
    if (conductors <= 9) return NEC_CONDUIT_FILL_DERATING['7-9'];
    if (conductors <= 20) return NEC_CONDUIT_FILL_DERATING['10-20'];
    if (conductors <= 30) return NEC_CONDUIT_FILL_DERATING['21-30'];
    if (conductors <= 40) return NEC_CONDUIT_FILL_DERATING['31-40'];
    return NEC_CONDUIT_FILL_DERATING['41+'];
  }
  
  /**
   * Comprehensive electrical system validation
   */
  static validateElectricalSystem(electricalSystem: any): NECValidationResult {
    const allViolations: NECViolation[] = [];
    const allWarnings: NECWarning[] = [];
    const allCalculations: NECCalculation[] = [];
    
    // Validate each circuit
    electricalSystem.circuits?.forEach((circuit: any, index: number) => {
      const result = this.validateWireSizing(
        circuit.amperage,
        circuit.wireSize || '12', // default
        circuit.material || 'copper',
        circuit.ambientTemp || 30,
        circuit.conductorsInConduit || 3,
        circuit.length || 100,
        circuit.voltage
      );
      
      // Add circuit identifier to violations
      result.violations.forEach(violation => {
        allViolations.push({
          ...violation,
          description: `Circuit ${index + 1}: ${violation.description}`
        });
      });
      
      allWarnings.push(...result.warnings);
      allCalculations.push(...result.calculations);
    });
    
    // Validate panels
    electricalSystem.panels?.forEach((panel: any, index: number) => {
      const totalLoad = panel.circuits?.reduce((sum: number, circuit: any) => sum + circuit.amperage, 0) || 0;
      
      const result = this.validatePanelSizing(
        totalLoad,
        panel.amperage,
        panel.circuits?.length || 0,
        panel.spaces
      );
      
      result.violations.forEach(violation => {
        allViolations.push({
          ...violation,
          description: `Panel ${panel.name || index + 1}: ${violation.description}`
        });
      });
      
      allWarnings.push(...result.warnings);
      allCalculations.push(...result.calculations);
    });
    
    return {
      compliant: allViolations.length === 0,
      violations: allViolations,
      warnings: allWarnings,
      calculations: allCalculations
    };
  }
}