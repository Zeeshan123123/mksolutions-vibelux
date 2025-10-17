// NEC Code Compliance Calculations for Electrical Design
// Based on NFPA 70 National Electrical Code

export interface NECCompliance {
  article: string;
  section: string;
  requirement: string;
  isCompliant: boolean;
  notes?: string;
}

export interface ElectricalEquipment {
  type: string;
  power: number; // watts
  voltage: number;
  current: number;
  phases: number;
  isMotor?: boolean;
  isContinuous?: boolean;
  isWetLocation?: boolean;
  isHazardousLocation?: boolean;
}

export interface CircuitDesign {
  wireGauge: string;
  ampacity: number;
  breaker: string;
  conduit: string;
  gfciRequired: boolean;
  arcFaultRequired: boolean;
}

export class NECComplianceChecker {
  
  // NEC 210.20(A) - Branch Circuit Loading
  static checkBranchCircuitLoading(equipment: ElectricalEquipment): NECCompliance {
    const continuousLoadFactor = equipment.isContinuous ? 1.25 : 1.0;
    const requiredAmpacity = equipment.current * continuousLoadFactor;
    
    return {
      article: "210",
      section: "210.20(A)",
      requirement: `Branch circuit ampacity must be ≥ ${requiredAmpacity.toFixed(1)}A for ${equipment.isContinuous ? 'continuous' : 'non-continuous'} load`,
      isCompliant: true, // Will be validated against actual circuit
      notes: equipment.isContinuous ? "Continuous loads require 125% ampacity per NEC" : undefined
    };
  }

  // NEC 250.122 - Equipment Grounding Conductor Sizing
  static getEquipmentGroundingConductor(overcurrentDevice: number): string {
    const groundingTable: Record<number, string> = {
      15: "14 AWG",
      20: "12 AWG",
      30: "10 AWG",
      40: "10 AWG",
      60: "10 AWG",
      100: "8 AWG",
      200: "6 AWG",
      300: "4 AWG",
      400: "3 AWG",
      500: "2 AWG",
      600: "1 AWG",
      800: "1/0 AWG",
      1000: "2/0 AWG",
      1200: "3/0 AWG",
      1600: "4/0 AWG",
      2000: "250 kcmil",
      2500: "350 kcmil",
      3000: "400 kcmil",
      4000: "500 kcmil",
      5000: "700 kcmil",
      6000: "800 kcmil"
    };

    // Find the appropriate grounding conductor size
    const sizes = Object.keys(groundingTable).map(Number).sort((a, b) => a - b);
    const requiredSize = sizes.find(size => size >= overcurrentDevice) || sizes[sizes.length - 1];
    
    return groundingTable[requiredSize];
  }

  // NEC 430.22 - Motor Circuit Conductors
  static checkMotorCircuitConductors(equipment: ElectricalEquipment): NECCompliance {
    if (!equipment.isMotor) {
      return {
        article: "430",
        section: "430.22",
        requirement: "Not applicable - not a motor load",
        isCompliant: true
      };
    }

    const requiredAmpacity = equipment.current * 1.25; // 125% of full-load current
    
    return {
      article: "430",
      section: "430.22",
      requirement: `Motor circuit conductors must have ampacity ≥ ${requiredAmpacity.toFixed(1)}A (125% of FLC)`,
      isCompliant: true,
      notes: "Motor loads require 125% conductor ampacity per NEC 430.22"
    };
  }

  // NEC 440.32 - Air Conditioning Equipment Protection
  static checkACEquipmentProtection(equipment: ElectricalEquipment): NECCompliance {
    const isACEquipment = ['hvac', 'chiller', 'dehumidifier'].includes(equipment.type);
    
    if (!isACEquipment) {
      return {
        article: "440",
        section: "440.32",
        requirement: "Not applicable - not A/C equipment",
        isCompliant: true
      };
    }

    // For hermetic motor-compressors, overcurrent protection shall not exceed 175% of nameplate current
    const maxOvercurrentProtection = equipment.current * 1.75;
    
    return {
      article: "440",
      section: "440.32",
      requirement: `A/C equipment overcurrent protection must not exceed ${maxOvercurrentProtection.toFixed(1)}A (175% of rated current)`,
      isCompliant: true,
      notes: "Air conditioning equipment has special overcurrent protection requirements"
    };
  }

  // NEC 210.8 - GFCI Protection Requirements
  static checkGFCIRequirements(equipment: ElectricalEquipment): NECCompliance {
    const gfciRequired = equipment.isWetLocation || 
                        ['irrigation', 'dehumidifier', 'humidifier'].includes(equipment.type);
    
    return {
      article: "210",
      section: "210.8",
      requirement: gfciRequired ? "GFCI protection required for wet location/equipment" : "GFCI protection not required",
      isCompliant: gfciRequired,
      notes: gfciRequired ? "Equipment in wet locations requires GFCI protection per NEC 210.8" : undefined
    };
  }

  // NEC 310.15 - Ampacity Correction and Adjustment
  static calculateAmpacityCorrection(
    baseAmpacity: number,
    ambientTemp: number = 30, // °C
    conductorsInRaceway: number = 3,
    terminalRating: number = 75 // °C
  ): { correctedAmpacity: number; temperatureCorrection: number; adjustmentFactor: number } {
    
    // Temperature correction factors for 75°C conductors (NEC Table 310.15(B)(1))
    const tempCorrectionFactors: Record<number, number> = {
      21: 1.08, 22: 1.08, 23: 1.08, 24: 1.08, 25: 1.08,
      26: 1.04, 27: 1.04, 28: 1.04, 29: 1.04, 30: 1.00,
      31: 0.96, 32: 0.96, 33: 0.96, 34: 0.96, 35: 0.91,
      36: 0.87, 37: 0.87, 38: 0.87, 39: 0.87, 40: 0.82,
      41: 0.76, 42: 0.76, 43: 0.76, 44: 0.76, 45: 0.71,
      46: 0.65, 47: 0.65, 48: 0.65, 49: 0.65, 50: 0.58
    };

    // Adjustment factors for number of conductors (NEC Table 310.15(B)(3)(a))
    const adjustmentFactors: Record<number, number> = {
      3: 1.00, 4: 0.80, 5: 0.80, 6: 0.80,
      7: 0.70, 8: 0.70, 9: 0.70,
      10: 0.50, 11: 0.50, 12: 0.50, 13: 0.50, 14: 0.50, 15: 0.50,
      16: 0.45, 17: 0.45, 18: 0.45, 19: 0.45, 20: 0.45
    };

    const temperatureCorrection = tempCorrectionFactors[Math.min(50, Math.max(21, ambientTemp))] || 0.58;
    const adjustmentFactor = adjustmentFactors[Math.min(20, conductorsInRaceway)] || 0.45;
    
    const correctedAmpacity = baseAmpacity * temperatureCorrection * adjustmentFactor;
    
    return { correctedAmpacity, temperatureCorrection, adjustmentFactor };
  }

  // NEC Chapter 9 - Conduit Fill Calculations
  static calculateConduitFill(wireGauge: string, wireCount: number, conduitType: string = "EMT"): {
    conduitSize: string;
    fillPercentage: number;
    isCompliant: boolean;
  } {
    // Wire areas in square inches (THWN-2 insulation)
    const wireAreas: Record<string, number> = {
      "14 AWG": 0.0097,
      "12 AWG": 0.0133,
      "10 AWG": 0.0211,
      "8 AWG": 0.0366,
      "6 AWG": 0.0507,
      "4 AWG": 0.0824,
      "3 AWG": 0.0973,
      "2 AWG": 0.1158,
      "1 AWG": 0.1562,
      "1/0 AWG": 0.1855,
      "2/0 AWG": 0.2223,
      "3/0 AWG": 0.2679,
      "4/0 AWG": 0.3237
    };

    // EMT conduit internal areas (40% fill for 3+ conductors)
    const conduitAreas: Record<string, number> = {
      "1/2\"": 0.304 * 0.40,
      "3/4\"": 0.533 * 0.40,
      "1\"": 0.864 * 0.40,
      "1-1/4\"": 1.496 * 0.40,
      "1-1/2\"": 2.036 * 0.40,
      "2\"": 3.356 * 0.40,
      "2-1/2\"": 5.858 * 0.40,
      "3\"": 8.688 * 0.40,
      "3-1/2\"": 11.545 * 0.40,
      "4\"": 14.753 * 0.40
    };

    const wireArea = wireAreas[wireGauge] || 0.0097;
    const totalWireArea = wireArea * wireCount;

    // Find minimum conduit size
    const conduitSizes = Object.keys(conduitAreas);
    const suitableConduit = conduitSizes.find(size => conduitAreas[size] >= totalWireArea);
    
    const conduitSize = suitableConduit || "4\"";
    const fillPercentage = (totalWireArea / (conduitAreas[conduitSize] / 0.40)) * 100;
    
    return {
      conduitSize,
      fillPercentage,
      isCompliant: fillPercentage <= 40
    };
  }

  // NEC 215.2 - Voltage Drop Calculations
  static calculateVoltageDropPercentage(
    current: number,
    distance: number, // feet
    wireGauge: string,
    voltage: number,
    phases: number = 1,
    powerFactor: number = 1.0
  ): { voltageDropPercentage: number; isCompliant: boolean; notes: string } {
    
    // Resistance values for copper conductors (ohms per 1000 feet at 75°C)
    const resistanceValues: Record<string, number> = {
      "14 AWG": 3.07,
      "12 AWG": 1.93,
      "10 AWG": 1.21,
      "8 AWG": 0.764,
      "6 AWG": 0.491,
      "4 AWG": 0.308,
      "3 AWG": 0.245,
      "2 AWG": 0.194,
      "1 AWG": 0.154,
      "1/0 AWG": 0.122,
      "2/0 AWG": 0.0967,
      "3/0 AWG": 0.0766,
      "4/0 AWG": 0.0608
    };

    const resistance = resistanceValues[wireGauge] || 3.07;
    const voltageDrop = phases === 1 
      ? 2 * current * distance * resistance / 1000 // Single phase
      : Math.sqrt(3) * current * distance * resistance / 1000; // Three phase

    const voltageDropPercentage = (voltageDrop / voltage) * 100;
    
    // NEC recommends voltage drop not exceed 3% for branch circuits, 5% total
    const isCompliant = voltageDropPercentage <= 3.0;
    
    return {
      voltageDropPercentage,
      isCompliant,
      notes: isCompliant 
        ? `Voltage drop ${voltageDropPercentage.toFixed(2)}% is within NEC recommended 3% limit`
        : `Voltage drop ${voltageDropPercentage.toFixed(2)}% exceeds NEC recommended 3% limit - consider larger conductor`
    };
  }

  // Comprehensive NEC compliance check for equipment
  static performCompleteComplianceCheck(
    equipment: ElectricalEquipment,
    circuitDistance: number = 100
  ): NECCompliance[] {
    const checks: NECCompliance[] = [];
    
    // Branch circuit loading
    checks.push(this.checkBranchCircuitLoading(equipment));
    
    // Motor circuit requirements
    if (equipment.isMotor) {
      checks.push(this.checkMotorCircuitConductors(equipment));
    }
    
    // A/C equipment protection
    if (['hvac', 'chiller', 'dehumidifier'].includes(equipment.type)) {
      checks.push(this.checkACEquipmentProtection(equipment));
    }
    
    // GFCI requirements
    checks.push(this.checkGFCIRequirements(equipment));
    
    // Voltage drop check
    const voltageDropCheck = this.calculateVoltageDropPercentage(
      equipment.current,
      circuitDistance,
      "12 AWG", // Default wire size
      equipment.voltage,
      equipment.phases
    );
    
    checks.push({
      article: "215",
      section: "215.2(A)(1)",
      requirement: "Voltage drop should not exceed 3% for branch circuits",
      isCompliant: voltageDropCheck.isCompliant,
      notes: voltageDropCheck.notes
    });
    
    return checks;
  }
}