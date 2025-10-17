/**
 * Commercial-Grade Motor Starting and Protection Calculations
 * Implements NEC Article 430, motor starting analysis, and protection coordination
 */

export interface MotorSpecification {
  id: string;
  hp: number; // horsepower
  voltage: number; // volts
  phases: 1 | 3;
  frequency: number; // Hz
  poles: number;
  rpm: number;
  efficiency: number; // percentage
  powerFactor: number; // decimal
  serviceFactori: number;
  enclosure: 'TEFC' | 'ODP' | 'TENV' | 'Explosion-Proof';
  insulation: 'A' | 'B' | 'F' | 'H';
  designLetter: 'A' | 'B' | 'C' | 'D' | 'E';
  code: string; // NEMA code letter for locked rotor kVA
}

export interface MotorStartingAnalysis {
  motor: MotorSpecification;
  startingMethod: StartingMethod;
  lockedRotorCurrent: number; // A
  startingCurrent: number; // A (with starter)
  startingTime: number; // seconds
  startingTorque: number; // % of full load
  voltageDip: number; // % at motor terminals
  accelerationTorque: number; // % of full load
  thermalLimit: boolean; // passes thermal damage curve
}

export interface StartingMethod {
  type: 'acrossTheLine' | 'reducedVoltage' | 'softStarter' | 'vfd' | 
        'starDelta' | 'autotransformer' | 'partWinding' | 'resistor';
  settings?: {
    tapSetting?: number; // % for autotransformer
    rampTime?: number; // seconds for soft starter
    initialVoltage?: number; // % for soft starter
    resistanceSteps?: number; // for resistor starter
  };
}

export interface MotorProtection {
  overloadRelay: {
    type: 'thermal' | 'electronic' | 'solidState';
    rating: number; // A
    tripClass: 10 | 20 | 30; // seconds to trip at 6x
    setting: number; // A
  };
  shortCircuitProtection: {
    type: 'fuse' | 'breaker' | 'mcp';
    rating: number; // A
    instantaneous: number; // A
  };
  groundFault?: {
    enabled: boolean;
    setting: number; // A
    delay: number; // ms
  };
}

// NEC Table 430.248 - Full Load Currents (3-phase AC motors)
const FLC_TABLE_3PHASE = {
  208: {
    0.5: 2.4, 0.75: 3.5, 1: 4.6, 1.5: 6.6, 2: 7.5, 3: 10.6,
    5: 16.7, 7.5: 24.2, 10: 30.8, 15: 46.2, 20: 59.4, 25: 74.8,
    30: 88, 40: 114, 50: 143, 60: 169, 75: 211, 100: 273,
    125: 343, 150: 396, 200: 528
  },
  230: {
    0.5: 2.2, 0.75: 3.2, 1: 4.2, 1.5: 6, 2: 6.8, 3: 9.6,
    5: 15.2, 7.5: 22, 10: 28, 15: 42, 20: 54, 25: 68,
    30: 80, 40: 104, 50: 130, 60: 154, 75: 192, 100: 248,
    125: 312, 150: 360, 200: 480
  },
  460: {
    0.5: 1.1, 0.75: 1.6, 1: 2.1, 1.5: 3, 2: 3.4, 3: 4.8,
    5: 7.6, 7.5: 11, 10: 14, 15: 21, 20: 27, 25: 34,
    30: 40, 40: 52, 50: 65, 60: 77, 75: 96, 100: 124,
    125: 156, 150: 180, 200: 240
  },
  575: {
    0.5: 0.9, 0.75: 1.3, 1: 1.7, 1.5: 2.4, 2: 2.7, 3: 3.9,
    5: 6.1, 7.5: 9, 10: 11, 15: 17, 20: 22, 25: 27,
    30: 32, 40: 41, 50: 52, 60: 62, 75: 77, 100: 99,
    125: 125, 150: 144, 200: 192
  }
};

// NEMA Code Letters for Locked Rotor kVA/HP
const NEMA_CODE_MULTIPLIERS = {
  A: 3.15, B: 3.55, C: 4.0, D: 4.5, E: 5.0, F: 5.6,
  G: 6.3, H: 7.1, J: 8.0, K: 9.0, L: 10.0, M: 11.2,
  N: 12.5, P: 14.0, R: 16.0, S: 18.0, T: 20.0, U: 22.4,
  V: 25.0
};

// Motor acceleration time constants
const MOTOR_INERTIA_CONSTANTS = {
  fan: { wk2PerHP: 30, loadTorque: 'quadratic' },
  pump: { wk2PerHP: 20, loadTorque: 'quadratic' },
  compressor: { wk2PerHP: 50, loadTorque: 'constant' },
  conveyor: { wk2PerHP: 100, loadTorque: 'linear' },
  crusher: { wk2PerHP: 200, loadTorque: 'constant' }
};

export class MotorCalculator {
  /**
   * Get motor full load current from NEC tables
   */
  static getFullLoadCurrent(
    hp: number,
    voltage: number,
    phases: number
  ): number {
    if (phases === 3) {
      const voltageTable = FLC_TABLE_3PHASE[voltage];
      if (voltageTable && voltageTable[hp]) {
        return voltageTable[hp];
      }
    }
    
    // Calculate if not in table
    const efficiency = 0.9; // Assume 90%
    const pf = 0.85; // Assume 0.85 power factor
    
    if (phases === 3) {
      return (hp * 746) / (Math.sqrt(3) * voltage * efficiency * pf);
    } else {
      return (hp * 746) / (voltage * efficiency * pf);
    }
  }

  /**
   * Calculate locked rotor current
   */
  static getLockedRotorCurrent(motor: MotorSpecification): number {
    // Using NEMA code letter
    const multiplier = NEMA_CODE_MULTIPLIERS[motor.code] || 
                      NEMA_CODE_MULTIPLIERS['G']; // Default to G
    
    const lrKVA = motor.hp * multiplier;
    
    if (motor.phases === 3) {
      return (lrKVA * 1000) / (Math.sqrt(3) * motor.voltage);
    } else {
      return (lrKVA * 1000) / motor.voltage;
    }
  }

  /**
   * Analyze motor starting with selected method
   */
  static analyzeStarting(
    motor: MotorSpecification,
    startingMethod: StartingMethod,
    sourceImpedance: { r: number, x: number }, // per-unit on motor base
    loadType: 'fan' | 'pump' | 'compressor' | 'conveyor' | 'crusher' = 'pump'
  ): MotorStartingAnalysis {
    const flc = this.getFullLoadCurrent(motor.hp, motor.voltage, motor.phases);
    const lrc = this.getLockedRotorCurrent(motor);
    
    // Calculate starting current based on method
    let startingCurrent = lrc;
    let startingTorque = 100; // % of LRT
    
    switch (startingMethod.type) {
      case 'acrossTheLine':
        startingCurrent = lrc;
        startingTorque = 150; // Typical for Design B
        break;
        
      case 'starDelta':
        startingCurrent = lrc / 3;
        startingTorque = 150 / 3;
        break;
        
      case 'autotransformer':
        const tap = (startingMethod.settings?.tapSetting || 80) / 100;
        startingCurrent = lrc * Math.pow(tap, 2);
        startingTorque = 150 * Math.pow(tap, 2);
        break;
        
      case 'softStarter':
        const initialV = (startingMethod.settings?.initialVoltage || 30) / 100;
        startingCurrent = lrc * initialV;
        startingTorque = 150 * Math.pow(initialV, 2);
        break;
        
      case 'vfd':
        startingCurrent = flc * 1.1; // VFD limits current
        startingTorque = 150; // Full torque available
        break;
        
      case 'resistor':
        startingCurrent = lrc * 0.65; // Typical
        startingTorque = 150 * 0.65;
        break;
        
      case 'partWinding':
        startingCurrent = lrc * 0.65;
        startingTorque = 150 * 0.5;
        break;
        
      case 'reducedVoltage':
        startingCurrent = lrc * 0.64; // 80% voltage
        startingTorque = 150 * 0.64;
        break;
    }
    
    // Calculate voltage dip
    const motorImpedance = this.calculateMotorImpedance(motor);
    const totalImpedance = {
      r: sourceImpedance.r + motorImpedance.r,
      x: sourceImpedance.x + motorImpedance.x
    };
    
    const zTotal = Math.sqrt(Math.pow(totalImpedance.r, 2) + 
                            Math.pow(totalImpedance.x, 2));
    
    const voltageDip = (startingCurrent / flc) * zTotal * 100;
    
    // Calculate acceleration time
    const loadConstants = MOTOR_INERTIA_CONSTANTS[loadType];
    const wk2 = motor.hp * loadConstants.wk2PerHP;
    
    const accelerationTime = this.calculateAccelerationTime(
      motor,
      wk2,
      startingTorque,
      loadType
    );
    
    // Calculate acceleration torque
    const loadTorque = this.getLoadTorque(loadType, 0.5); // At 50% speed
    const accelerationTorque = startingTorque - loadTorque;
    
    // Check thermal limit (I²t)
    const thermalLimit = this.checkThermalLimit(
      startingCurrent,
      accelerationTime,
      motor
    );
    
    return {
      motor,
      startingMethod,
      lockedRotorCurrent: lrc,
      startingCurrent,
      startingTime: accelerationTime,
      startingTorque,
      voltageDip,
      accelerationTorque,
      thermalLimit
    };
  }

  /**
   * Calculate motor impedance
   */
  static calculateMotorImpedance(motor: MotorSpecification): { r: number, x: number } {
    // Simplified - typical values
    const xdpp = 0.17; // Subtransient reactance
    const rStator = 0.02; // Stator resistance
    
    return { r: rStator, x: xdpp };
  }

  /**
   * Calculate acceleration time
   */
  static calculateAccelerationTime(
    motor: MotorSpecification,
    wk2: number, // lb-ft²
    startingTorque: number, // %
    loadType: string
  ): number {
    const n = motor.rpm;
    const hp = motor.hp;
    
    // Average accelerating torque
    let avgTorque = startingTorque;
    
    // Adjust for load torque curve
    switch (loadType) {
      case 'fan':
      case 'pump':
        avgTorque = startingTorque * 0.75; // Quadratic load
        break;
      case 'conveyor':
        avgTorque = startingTorque * 0.5; // Linear load
        break;
      case 'compressor':
      case 'crusher':
        avgTorque = startingTorque * 0.3; // Constant torque
        break;
    }
    
    // t = (WK² × n) / (308 × HP × Ta)
    const accelerationTime = (wk2 * n) / (308 * hp * (avgTorque / 100));
    
    return accelerationTime;
  }

  /**
   * Get load torque at given speed
   */
  static getLoadTorque(loadType: string, speedRatio: number): number {
    switch (loadType) {
      case 'fan':
      case 'pump':
        return 100 * Math.pow(speedRatio, 2); // Quadratic
      case 'conveyor':
        return 100 * speedRatio; // Linear
      case 'compressor':
      case 'crusher':
        return 100; // Constant
      default:
        return 100 * speedRatio;
    }
  }

  /**
   * Check thermal damage limit
   */
  static checkThermalLimit(
    startingCurrent: number,
    time: number,
    motor: MotorSpecification
  ): boolean {
    // Simplified I²t calculation
    const flc = this.getFullLoadCurrent(motor.hp, motor.voltage, motor.phases);
    const ratio = startingCurrent / flc;
    
    // Typical motor can withstand 6x current for 10 seconds
    const allowableTime = 10 * Math.pow(6 / ratio, 2);
    
    return time < allowableTime;
  }

  /**
   * Select motor protection
   */
  static selectProtection(
    motor: MotorSpecification,
    startingAnalysis: MotorStartingAnalysis
  ): MotorProtection {
    const flc = this.getFullLoadCurrent(motor.hp, motor.voltage, motor.phases);
    
    // Overload relay - NEC 430.32
    const overloadRating = flc * 1.15; // 115% for 1.15 SF motor
    const tripClass = startingAnalysis.startingTime > 10 ? 20 : 10;
    
    // Short circuit protection - NEC 430.52
    let scMultiplier = 2.5; // Inverse time breaker
    
    if (startingAnalysis.startingMethod.type === 'acrossTheLine') {
      scMultiplier = 2.5;
    } else if (startingAnalysis.startingMethod.type === 'vfd') {
      scMultiplier = 1.5; // Semiconductor protection
    }
    
    const scRating = this.nextStandardSize(flc * scMultiplier, 'breaker');
    
    // Instantaneous setting
    const instantaneous = Math.max(
      startingAnalysis.startingCurrent * 1.1,
      flc * 8
    );
    
    return {
      overloadRelay: {
        type: 'electronic',
        rating: this.nextStandardSize(overloadRating, 'overload'),
        tripClass,
        setting: overloadRating
      },
      shortCircuitProtection: {
        type: 'breaker',
        rating: scRating,
        instantaneous
      },
      groundFault: motor.voltage > 1000 ? {
        enabled: true,
        setting: flc * 0.25,
        delay: 100
      } : undefined
    };
  }

  /**
   * Calculate conductor size for motor
   */
  static calculateConductorSize(
    motor: MotorSpecification,
    length: number, // feet
    conduitType: 'pvc' | 'steel' = 'steel',
    ambientTemp: number = 30 // °C
  ): {
    size: string;
    ampacity: number;
    voltageDrop: number;
  } {
    const flc = this.getFullLoadCurrent(motor.hp, motor.voltage, motor.phases);
    
    // NEC 430.22 - 125% of FLC
    const requiredAmpacity = flc * 1.25;
    
    // Select conductor from NEC Table 310.15(B)(16)
    const conductor = this.selectConductor(
      requiredAmpacity,
      motor.voltage,
      ambientTemp
    );
    
    // Calculate voltage drop
    const vd = this.calculateVoltageDrop(
      flc,
      length,
      conductor.size,
      motor.voltage,
      motor.phases,
      motor.powerFactor
    );
    
    return {
      size: conductor.size,
      ampacity: conductor.ampacity,
      voltageDrop: vd
    };
  }

  /**
   * Select conductor from ampacity tables
   */
  static selectConductor(
    requiredAmpacity: number,
    voltage: number,
    ambientTemp: number
  ): { size: string, ampacity: number } {
    // NEC Table 310.15(B)(16) - 75°C copper
    const ampacityTable = [
      { size: '14', ampacity: 20 },
      { size: '12', ampacity: 25 },
      { size: '10', ampacity: 35 },
      { size: '8', ampacity: 50 },
      { size: '6', ampacity: 65 },
      { size: '4', ampacity: 85 },
      { size: '3', ampacity: 100 },
      { size: '2', ampacity: 115 },
      { size: '1', ampacity: 130 },
      { size: '1/0', ampacity: 150 },
      { size: '2/0', ampacity: 175 },
      { size: '3/0', ampacity: 200 },
      { size: '4/0', ampacity: 230 },
      { size: '250', ampacity: 255 },
      { size: '300', ampacity: 285 },
      { size: '350', ampacity: 310 },
      { size: '400', ampacity: 335 },
      { size: '500', ampacity: 380 }
    ];
    
    // Temperature correction factor
    let tempCorrection = 1.0;
    if (ambientTemp > 30) {
      tempCorrection = 0.88; // 40°C correction
    }
    
    for (const conductor of ampacityTable) {
      if (conductor.ampacity * tempCorrection >= requiredAmpacity) {
        return conductor;
      }
    }
    
    return { size: '500', ampacity: 380 };
  }

  /**
   * Calculate voltage drop
   */
  static calculateVoltageDrop(
    current: number,
    length: number,
    conductorSize: string,
    voltage: number,
    phases: number,
    powerFactor: number
  ): number {
    // Simplified - would use actual conductor impedance
    const r = 0.2; // ohms per 1000 ft
    const x = 0.05; // ohms per 1000 ft
    
    const z = Math.sqrt(Math.pow(r * powerFactor, 2) + 
                       Math.pow(x * Math.sin(Math.acos(powerFactor)), 2));
    
    const k = phases === 3 ? Math.sqrt(3) : 2;
    const vd = (k * current * z * length) / (1000 * voltage) * 100;
    
    return vd;
  }

  /**
   * Get next standard size
   */
  static nextStandardSize(value: number, type: 'breaker' | 'fuse' | 'overload'): number {
    const breakerSizes = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100,
                         110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450,
                         500, 600, 700, 800, 900, 1000, 1200, 1600, 2000, 2500];
    
    for (const size of breakerSizes) {
      if (size >= value) {
        return size;
      }
    }
    
    return Math.ceil(value / 100) * 100;
  }

  /**
   * Calculate power factor correction
   */
  static calculatePowerFactorCorrection(
    motor: MotorSpecification,
    targetPF: number = 0.95
  ): {
    kvar: number;
    capacitorSize: number;
    improvement: number;
  } {
    const kw = motor.hp * 0.746 / motor.efficiency;
    const currentPF = motor.powerFactor;
    
    // Calculate current and target angles
    const currentAngle = Math.acos(currentPF);
    const targetAngle = Math.acos(targetPF);
    
    // Required kVAR
    const kvar = kw * (Math.tan(currentAngle) - Math.tan(targetAngle));
    
    // Standard capacitor size
    const standardSizes = [2.5, 5, 7.5, 10, 12.5, 15, 20, 25, 30, 35, 40, 45, 50];
    let capacitorSize = 0;
    
    for (const size of standardSizes) {
      if (size >= kvar) {
        capacitorSize = size;
        break;
      }
    }
    
    if (capacitorSize === 0) {
      capacitorSize = Math.ceil(kvar / 5) * 5;
    }
    
    return {
      kvar,
      capacitorSize,
      improvement: (targetPF - currentPF) * 100
    };
  }
}