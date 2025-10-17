/**
 * HVAC Construction Designer
 * Professional HVAC system design for construction documentation
 * Includes ductwork layout, piping design, and equipment scheduling
 */

export interface HVACDesignSystem {
  projectId: string;
  facilityType: 'greenhouse' | 'indoor-farm' | 'processing' | 'hybrid';
  
  // System configuration
  systemType: 'all-air' | 'air-water' | 'all-water' | 'packaged' | 'split' | 'vrf';
  zoningStrategy: 'single-zone' | 'multi-zone' | 'vav' | 'dedicated-zones';
  
  // Environmental requirements
  designConditions: {
    outdoor: {
      summerDB: number; // °F dry bulb
      summerWB: number; // °F wet bulb
      winterDB: number; // °F
      altitude: number; // ft
    };
    indoor: {
      summerDB: number;
      summerRH: number; // %
      winterDB: number;
      winterRH: number; // %
      airChangesPerHour: number;
    };
  };
  
  // Equipment selection
  equipment: {
    airHandlers: AirHandlerUnit[];
    chillers: ChillerUnit[];
    boilers: BoilerUnit[];
    fans: FanUnit[];
    pumps: PumpUnit[];
    terminals: TerminalUnit[];
  };
  
  // Distribution systems
  ductwork: DuctworkSystem;
  piping: PipingSystem;
  controls: ControlSystem;
}

export interface AirHandlerUnit {
  id: string;
  tag: string; // AHU-1, AHU-2, etc.
  location: { x: number; y: number; z: number };
  
  // Capacity
  cfm: number;
  coolingCapacity: number; // tons
  heatingCapacity: number; // MBH
  
  // Components
  components: {
    supplyFan: {
      type: 'centrifugal' | 'axial' | 'plug';
      hp: number;
      staticPressure: number; // inches w.c.
      efficiency: number;
    };
    returnFan?: {
      type: 'centrifugal' | 'axial';
      hp: number;
      cfm: number;
    };
    cooling: {
      type: 'dx' | 'chilled-water' | 'evaporative';
      stages: number;
      capacity: number;
    };
    heating: {
      type: 'electric' | 'hot-water' | 'steam' | 'gas';
      stages: number;
      capacity: number;
    };
    filters: {
      preFilter: string; // MERV rating
      finalFilter: string;
    };
    economizer: boolean;
    energyRecovery?: {
      type: 'wheel' | 'plate' | 'heat-pipe';
      effectiveness: number;
    };
  };
  
  // Electrical
  electrical: {
    voltage: number;
    phase: 1 | 3;
    mca: number; // minimum circuit ampacity
    mop: number; // maximum overcurrent protection
  };
  
  // Physical
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  
  // Connections
  connections: {
    ductwork: {
      supply: DuctConnection;
      return: DuctConnection;
      outsideAir?: DuctConnection;
      exhaust?: DuctConnection;
    };
    piping?: {
      chilledWaterSupply?: PipeConnection;
      chilledWaterReturn?: PipeConnection;
      hotWaterSupply?: PipeConnection;
      hotWaterReturn?: PipeConnection;
      condensateDrain: PipeConnection;
    };
  };
}

export interface DuctworkSystem {
  material: 'galvanized' | 'aluminum' | 'fiberglass' | 'fabric';
  insulation: {
    type: 'internal' | 'external' | 'none';
    thickness: number; // inches
    rValue: number;
  };
  
  // Main distribution
  mains: DuctSection[];
  branches: DuctSection[];
  
  // Terminals
  diffusers: AirTerminal[];
  grilles: AirTerminal[];
  
  // Accessories
  dampers: Damper[];
  accessories: DuctAccessory[];
  
  // Pressure calculations
  pressureAnalysis: {
    criticalPath: string[];
    totalStaticPressure: number;
    frictionRate: number; // inches/100ft
  };
}

export interface DuctSection {
  id: string;
  tag: string;
  
  // Geometry
  shape: 'rectangular' | 'round' | 'oval';
  dimensions: {
    width?: number; // inches
    height?: number; // inches
    diameter?: number; // inches
  };
  length: number; // feet
  
  // Flow
  cfm: number;
  velocity: number; // fpm
  
  // Route
  startPoint: { x: number; y: number; z: number };
  endPoint: { x: number; y: number; z: number };
  fittings: DuctFitting[];
  
  // Pressure
  frictionLoss: number; // inches w.c.
  velocityPressure: number;
}

export interface DuctFitting {
  type: 'elbow' | 'tee' | 'wye' | 'transition' | 'takeoff';
  angle?: number; // degrees for elbows
  radius?: number; // for elbows
  pressureLoss: number;
}

export interface PipingSystem {
  // Systems
  chilledWater?: PipingCircuit;
  hotWater?: PipingCircuit;
  condensate?: PipingCircuit;
  refrigerant?: RefrigerantPiping;
  
  // Insulation
  insulation: {
    type: 'fiberglass' | 'rubber' | 'polyethylene';
    thickness: number;
    vaporBarrier: boolean;
  };
}

export interface PipingCircuit {
  fluid: 'water' | 'glycol-mix' | 'steam';
  
  // Design parameters
  flowRate: number; // gpm
  supplyTemp: number; // °F
  returnTemp: number; // °F
  designPressure: number; // psi
  
  // Piping
  mains: PipeSection[];
  branches: PipeSection[];
  
  // Components
  valves: Valve[];
  specialties: PipeSpecialty[];
  
  // Hydraulics
  pumpHead: number; // ft
  pressureDrop: number; // psi
  criticalPath: string[];
}

export interface PipeSection {
  id: string;
  tag: string;
  
  // Size
  nominalSize: number; // inches
  material: 'copper' | 'steel' | 'pvc' | 'pex';
  schedule?: '40' | '80' | 'L' | 'M';
  
  // Flow
  flowRate: number; // gpm
  velocity: number; // fps
  
  // Route
  startPoint: { x: number; y: number; z: number };
  endPoint: { x: number; y: number; z: number };
  fittings: PipeFitting[];
  
  // Pressure
  frictionLoss: number; // ft/100ft
  totalPressureDrop: number; // psi
}

// HVAC Design Calculator
export class HVACConstructionDesigner {
  private system: HVACDesignSystem;
  
  constructor(system: HVACDesignSystem) {
    this.system = system;
  }
  
  /**
   * Size ductwork using equal friction method
   */
  sizeDuctwork(cfm: number, maxVelocity: number = 1000): DuctSection {
    // Calculate duct size based on velocity
    const area = cfm / maxVelocity; // sq ft
    const areaInches = area * 144; // sq in
    
    // For rectangular, use 2:1 aspect ratio
    const height = Math.sqrt(areaInches / 2);
    const width = height * 2;
    
    // Round to standard sizes
    const standardHeight = this.roundToStandardDuctSize(height);
    const standardWidth = this.roundToStandardDuctSize(width);
    
    // Recalculate actual velocity
    const actualArea = (standardHeight * standardWidth) / 144;
    const actualVelocity = cfm / actualArea;
    
    return {
      id: `duct-${Date.now()}`,
      tag: '',
      shape: 'rectangular',
      dimensions: {
        width: standardWidth,
        height: standardHeight
      },
      length: 0,
      cfm,
      velocity: actualVelocity,
      startPoint: { x: 0, y: 0, z: 0 },
      endPoint: { x: 0, y: 0, z: 0 },
      fittings: [],
      frictionLoss: this.calculateDuctFriction(cfm, standardWidth, standardHeight),
      velocityPressure: (actualVelocity / 4005) ** 2
    };
  }
  
  /**
   * Calculate duct friction loss using Darcy-Weisbach equation
   */
  private calculateDuctFriction(cfm: number, width: number, height: number): number {
    const hydraulicDiameter = (2 * width * height) / (width + height);
    const area = (width * height) / 144;
    const velocity = cfm / area;
    
    // Friction factor for galvanized steel
    const f = 0.02;
    
    // Friction loss per 100 ft
    const frictionLoss = (f * (velocity / 4005) ** 2 * 100) / (hydraulicDiameter / 12);
    
    return frictionLoss;
  }
  
  /**
   * Size piping using fixture unit method or gpm
   */
  sizePipe(flowRate: number, maxVelocity: number = 8): number {
    // Size based on velocity limit (8 fps typical for noise)
    const area = flowRate / (maxVelocity * 60 * 7.48); // sq ft
    const diameter = Math.sqrt(area * 4 / Math.PI) * 12; // inches
    
    // Round up to standard pipe size
    const standardSizes = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12];
    return standardSizes.find(size => size >= diameter) || diameter;
  }
  
  /**
   * Calculate pump head requirements
   */
  calculatePumpHead(circuit: PipingCircuit): number {
    let totalHead = 0;
    
    // Friction losses
    circuit.mains.forEach(pipe => {
      totalHead += pipe.totalPressureDrop * 2.31; // psi to ft
    });
    
    // Equipment pressure drops
    totalHead += 15; // Typical chiller drop
    totalHead += 10; // Typical coil drop
    
    // Elevation change
    totalHead += 20; // Assume 20 ft elevation
    
    // Control valve pressure drop (25% of friction)
    totalHead *= 1.25;
    
    // Safety factor
    totalHead *= 1.1;
    
    return Math.round(totalHead);
  }
  
  /**
   * Generate equipment schedule for drawings
   */
  generateEquipmentSchedule(): EquipmentSchedule[] {
    const schedule: EquipmentSchedule[] = [];
    
    // Air handlers
    this.system.equipment.airHandlers.forEach(ahu => {
      schedule.push({
        tag: ahu.tag,
        equipment: 'Air Handling Unit',
        manufacturer: 'Basis of Design',
        model: 'As Scheduled',
        capacity: `${ahu.cfm} CFM, ${ahu.coolingCapacity} Tons`,
        electrical: `${ahu.electrical.voltage}V-${ahu.electrical.phase}PH, ${ahu.electrical.mca}A MCA`,
        weight: `${ahu.dimensions.weight} lbs`,
        notes: 'See specifications for details'
      });
    });
    
    return schedule;
  }
  
  /**
   * Generate detailed ductwork design for construction documents
   */
  generateDetailedDuctworkDesign(): DetailedDuctworkDesign {
    const mainDucts: DetailedDuctSection[] = [];
    const branches: DetailedDuctSection[] = [];
    const terminals: DetailedTerminal[] = [];
    
    // Generate main supply ductwork
    this.system.equipment.airHandlers.forEach((ahu, index) => {
      // Main supply trunk
      const trunkDuct: DetailedDuctSection = {
        id: `SD-${index + 1}`,
        tag: `SUPPLY DUCT ${index + 1}`,
        type: 'supply-main',
        shape: 'rectangular',
        dimensions: this.sizeDuctwork(ahu.cfm, 1200),
        material: this.system.ductwork.material,
        insulation: this.system.ductwork.insulation,
        route: {
          startPoint: { x: ahu.location.x, y: ahu.location.y, z: ahu.location.z },
          endPoint: { x: ahu.location.x + 100, y: ahu.location.y, z: ahu.location.z },
          length: 100,
          elevation: ahu.location.z + 2
        },
        airflow: {
          cfm: ahu.cfm,
          velocity: this.calculateVelocity(ahu.cfm, this.sizeDuctwork(ahu.cfm, 1200).dimensions),
          staticPressure: 2.0
        },
        construction: {
          gauge: '22 GA',
          reinforcement: 'Class 1 per SMACNA',
          joints: 'Standing seam',
          supports: 'Clevis hangers @ 8\' O.C.'
        },
        accessories: [
          { type: 'motorized-damper', location: 10, size: this.sizeDuctwork(ahu.cfm, 1200).dimensions },
          { type: 'access-door', location: 25, size: { width: 12, height: 8 } },
          { type: 'flexible-connector', location: 5, size: this.sizeDuctwork(ahu.cfm, 1200).dimensions }
        ],
        pressureCalculation: {
          frictionLoss: this.calculateDuctFriction(ahu.cfm, this.sizeDuctwork(ahu.cfm, 1200).dimensions.width || 0, this.sizeDuctwork(ahu.cfm, 1200).dimensions.height || 0),
          fittingLosses: 0.5,
          totalLoss: 1.2
        }
      };
      
      mainDucts.push(trunkDuct);
      
      // Generate branch ducts
      const branchCount = Math.ceil(ahu.cfm / 2000); // 2000 CFM per branch
      for (let b = 0; b < branchCount; b++) {
        const branchCfm = Math.min(2000, ahu.cfm - (b * 2000));
        
        const branchDuct: DetailedDuctSection = {
          id: `BD-${index + 1}-${b + 1}`,
          tag: `BRANCH DUCT ${index + 1}-${b + 1}`,
          type: 'supply-branch',
          shape: 'rectangular',
          dimensions: this.sizeDuctwork(branchCfm, 1000),
          material: this.system.ductwork.material,
          insulation: this.system.ductwork.insulation,
          route: {
            startPoint: { x: ahu.location.x + 20 + (b * 20), y: ahu.location.y, z: ahu.location.z },
            endPoint: { x: ahu.location.x + 20 + (b * 20), y: ahu.location.y + 50, z: ahu.location.z },
            length: 50,
            elevation: ahu.location.z + 2
          },
          airflow: {
            cfm: branchCfm,
            velocity: this.calculateVelocity(branchCfm, this.sizeDuctwork(branchCfm, 1000).dimensions),
            staticPressure: 1.5
          },
          construction: {
            gauge: '24 GA',
            reinforcement: 'Class 2 per SMACNA',
            joints: 'Pittsburgh seam',
            supports: 'Strap hangers @ 6\' O.C.'
          },
          accessories: [
            { type: 'volume-damper', location: 5, size: this.sizeDuctwork(branchCfm, 1000).dimensions }
          ],
          pressureCalculation: {
            frictionLoss: this.calculateDuctFriction(branchCfm, this.sizeDuctwork(branchCfm, 1000).dimensions.width || 0, this.sizeDuctwork(branchCfm, 1000).dimensions.height || 0),
            fittingLosses: 0.3,
            totalLoss: 0.8
          }
        };
        
        branches.push(branchDuct);
        
        // Generate terminals for this branch
        const terminalCount = Math.ceil(branchCfm / 400); // 400 CFM per terminal
        for (let t = 0; t < terminalCount; t++) {
          const terminalCfm = Math.min(400, branchCfm - (t * 400));
          
          const terminal: DetailedTerminal = {
            id: `SD-${index + 1}-${b + 1}-${t + 1}`,
            tag: `SUPPLY DIFFUSER ${index + 1}-${b + 1}-${t + 1}`,
            type: 'supply-diffuser',
            style: 'square-perforated',
            manufacturer: 'Krueger',
            model: 'SPEX',
            size: this.selectDiffuserSize(terminalCfm),
            cfm: terminalCfm,
            throwPattern: {
              throw: this.calculateThrow(terminalCfm, this.selectDiffuserSize(terminalCfm)),
              drop: 3,
              spread: 15
            },
            location: {
              x: ahu.location.x + 20 + (b * 20) + (t * 8),
              y: ahu.location.y + 40,
              z: ahu.location.z - 2,
              mounting: 'ceiling'
            },
            connection: {
              ductSize: this.calculateDiffuserNeck(terminalCfm),
              type: 'round-neck',
              length: 2
            },
            performance: {
              noiseCriteria: this.calculateNC(terminalCfm, this.selectDiffuserSize(terminalCfm)),
              pressureDrop: this.calculateTerminalPressureDrop(terminalCfm, this.selectDiffuserSize(terminalCfm))
            }
          };
          
          terminals.push(terminal);
        }
      }
    });
    
    return {
      projectId: this.system.projectId,
      designCriteria: {
        velocityLimits: {
          mainDucts: 1200,
          branches: 1000,
          risers: 800
        },
        pressureLimits: {
          maxStatic: 4.0,
          maxVelocity: 0.5
        },
        noiseCriteria: {
          occupied: 'NC-40',
          unoccupied: 'NC-45'
        }
      },
      ductworkSystems: {
        supply: {
          mains: mainDucts.filter(d => d.type === 'supply-main'),
          branches: branches,
          material: this.system.ductwork.material,
          insulation: this.system.ductwork.insulation
        },
        return: {
          mains: [], // Generated separately
          branches: [],
          material: this.system.ductwork.material,
          insulation: { type: 'none', thickness: 0, rValue: 0 }
        },
        exhaust: {
          mains: [],
          branches: [],
          material: 'galvanized',
          insulation: { type: 'none', thickness: 0, rValue: 0 }
        }
      },
      terminals: {
        supply: terminals.filter(t => t.type === 'supply-diffuser'),
        return: [], // Generated separately
        exhaust: []
      },
      accessories: this.generateAccessories(),
      pressureAnalysis: this.calculateSystemPressures(mainDucts, branches),
      specifications: this.generateDuctworkSpecifications()
    };
  }

  /**
   * Generate detailed piping design
   */
  generateDetailedPipingDesign(): DetailedPipingDesign {
    const chilledWaterPiping: DetailedPipingSystem = {
      type: 'chilled-water',
      fluid: 'water',
      designConditions: {
        supplyTemp: 44,  // °F
        returnTemp: 56,  // °F
        flowRate: this.calculateChilledWaterFlow(),
        pressure: 125,   // psi design
        glycol: false
      },
      mains: this.generateChilledWaterMains(),
      branches: this.generateChilledWaterBranches(),
      specialties: this.generatePipingSpecialties(),
      insulation: {
        type: 'closed-cell-foam',
        thickness: 1.0,
        vaporBarrier: true,
        finish: 'All-service-jacket'
      },
      supports: this.generatePipeSupports(),
      testing: {
        hydrostaticPressure: 150, // psi
        duration: 2, // hours
        leakageRate: 0.05 // gpm
      }
    };
    
    const hotWaterPiping: DetailedPipingSystem = {
      type: 'hot-water',
      fluid: 'water',
      designConditions: {
        supplyTemp: 180, // °F
        returnTemp: 160, // °F
        flowRate: this.calculateHotWaterFlow(),
        pressure: 125,   // psi design
        glycol: false
      },
      mains: this.generateHotWaterMains(),
      branches: this.generateHotWaterBranches(),
      specialties: this.generatePipingSpecialties(),
      insulation: {
        type: 'mineral-fiber',
        thickness: 2.0,
        vaporBarrier: false,
        finish: 'Aluminum-jacket'
      },
      supports: this.generatePipeSupports(),
      testing: {
        hydrostaticPressure: 150,
        duration: 2,
        leakageRate: 0.05
      }
    };
    
    return {
      projectId: this.system.projectId,
      systems: {
        chilledWater: chilledWaterPiping,
        hotWater: hotWaterPiping,
        condensate: this.generateCondensateSystem()
      },
      pumpingAnalysis: this.calculatePumpingRequirements(),
      specifications: this.generatePipingSpecifications()
    };
  }

  /**
   * Generate control sequence of operations
   */
  generateControlSequence(): string {
    return `
SEQUENCE OF OPERATIONS - ${this.system.systemType.toUpperCase()} SYSTEM

1. GENERAL
   The HVAC system shall maintain space conditions as follows:
   - Summer: ${this.system.designConditions.indoor.summerDB}°F DB, ${this.system.designConditions.indoor.summerRH}% RH
   - Winter: ${this.system.designConditions.indoor.winterDB}°F DB, ${this.system.designConditions.indoor.winterRH}% RH
   
2. OCCUPIED MODE
   A. Supply air temperature shall reset based on zone requirements
   B. Minimum ventilation shall be maintained at all times
   C. Economizer shall operate when outdoor conditions are favorable
   
3. UNOCCUPIED MODE
   A. System shall operate in setback mode
   B. Night purge shall be enabled when appropriate
   
4. SAFETY INTERLOCKS
   A. Freeze protection shall shut down system below 35°F
   B. High static pressure shall stop supply fan
   C. Smoke detection shall shut down system
    `;
  }

  /**
   * Generate HVAC specifications for construction documents
   */
  generateHVACSpecifications(): HVACSpecifications {
    return {
      general: {
        codes: ['2021 IMC', '2021 IPC', 'ASHRAE 90.1-2019', 'Local codes'],
        standards: ['ASHRAE 62.1', 'ASHRAE 55', 'SMACNA HVAC Duct Construction Standards'],
        workmanship: 'SMACNA standards',
        testing: 'NEBB certified technicians',
        warranty: '1 year parts and labor, 5 years compressor'
      },
      equipment: {
        airHandlers: 'Factory assembled, cased coil units with supply and return fans',
        chillers: 'Air-cooled screw compressor, R-410A refrigerant',
        boilers: 'High efficiency condensing, natural gas fired',
        pumps: 'Base mounted centrifugal with mechanical seals',
        controls: 'Direct digital control system with web-based interface'
      },
      ductwork: {
        material: 'Galvanized steel per SMACNA standards',
        construction: 'Rectangular and round as shown on drawings',
        insulation: 'Duct wrap, R-6 minimum, foil faced vapor barrier',
        supports: 'Steel hangers and supports per SMACNA guidelines',
        sealing: 'All joints sealed with UL181 tape or mastic'
      },
      piping: {
        chilledWater: 'Type L copper with brazed joints',
        hotWater: 'Type L copper with brazed joints',
        condensate: 'PVC Schedule 40 with solvent welded joints',
        insulation: 'Closed cell foam on chilled water, mineral fiber on hot water',
        supports: 'Adjustable steel hangers per MSS SP-58'
      },
      controls: {
        system: 'BACnet protocol, web-based operator interface',
        sensors: 'Space temperature, humidity, and CO2 sensors',
        actuators: 'Electric spring return for dampers, floating for valves',
        programming: 'Energy management sequences per ASHRAE 90.1',
        commissioning: 'Functional testing per ASHRAE Guideline 0'
      },
      testing: {
        ductwork: 'Test all ductwork per SMACNA HVAC Air Duct Leakage Test Manual',
        piping: 'Hydrostatic test all piping at 150% of operating pressure',
        controls: 'Functional testing of all control sequences',
        balancing: 'Test and balance per NEBB standards',
        commissioning: 'Systems commissioning per ASHRAE Guideline 1'
      }
    };
  }
  
  private roundToStandardDuctSize(size: number): number {
    const standardSizes = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 40, 44, 48];
    return standardSizes.find(s => s >= size) || Math.ceil(size);
  }

  // Helper methods for detailed HVAC design
  private calculateVelocity(cfm: number, dimensions: any): number {
    let area: number;
    if (dimensions.diameter) {
      area = Math.PI * (dimensions.diameter / 12) ** 2 / 4; // sq ft
    } else {
      area = (dimensions.width * dimensions.height) / 144; // sq ft
    }
    return cfm / area; // fpm
  }

  private selectDiffuserSize(cfm: number): string {
    if (cfm <= 100) return '6x6';
    if (cfm <= 200) return '8x8';
    if (cfm <= 300) return '10x10';
    if (cfm <= 400) return '12x12';
    if (cfm <= 600) return '14x14';
    if (cfm <= 800) return '16x16';
    return '18x18';
  }

  private calculateThrow(cfm: number, size: string): number {
    // Simplified throw calculation
    const sizeNum = parseInt(size.split('x')[0]);
    return cfm / sizeNum * 0.1; // feet
  }

  private calculateDiffuserNeck(cfm: number): number {
    // Round neck size in inches
    if (cfm <= 150) return 6;
    if (cfm <= 250) return 8;
    if (cfm <= 400) return 10;
    if (cfm <= 600) return 12;
    return 14;
  }

  private calculateNC(cfm: number, size: string): string {
    // Simplified noise criteria calculation
    const baseNC = 35;
    const cfmFactor = cfm / 400;
    const nc = Math.round(baseNC + (cfmFactor * 5));
    return `NC-${Math.min(nc, 50)}`;
  }

  private calculateTerminalPressureDrop(cfm: number, size: string): number {
    // Simplified pressure drop calculation
    const sizeNum = parseInt(size.split('x')[0]);
    const velocity = cfm / (sizeNum * sizeNum / 144);
    return (velocity / 4005) ** 2 * 0.5; // inches w.c.
  }

  private generateAccessories(): DuctAccessoryDetail[] {
    return [
      { type: 'fire-damper', location: 0, size: { width: 24, height: 24 } },
      { type: 'smoke-damper', location: 0, size: { width: 24, height: 24 } },
      { type: 'access-door', location: 0, size: { width: 12, height: 8 } }
    ];
  }

  private calculateSystemPressures(mains: DetailedDuctSection[], branches: DetailedDuctSection[]): SystemPressureAnalysis {
    const equipmentPressure = 2.0;
    const ductworkPressure = mains.reduce((sum, d) => sum + d.pressureCalculation.totalLoss, 0);
    const fittingPressure = 1.0;
    const terminalPressure = 0.5;

    return {
      criticalPath: ['AHU-1', 'SD-1', 'BD-1-1', 'Terminal'],
      totalSystemPressure: equipmentPressure + ductworkPressure + fittingPressure + terminalPressure,
      componentBreakdown: {
        equipment: equipmentPressure,
        ductwork: ductworkPressure,
        fittings: fittingPressure,
        terminals: terminalPressure
      }
    };
  }

  private generateDuctworkSpecifications(): DuctworkSpecifications {
    return {
      materials: ['Galvanized steel per SMACNA standards'],
      construction: ['Rectangular and round ducts as shown'],
      insulation: ['R-6 duct wrap with foil vapor barrier'],
      testing: ['Duct leakage test per SMACNA standards']
    };
  }

  private calculateChilledWaterFlow(): number {
    // Calculate based on cooling load
    const totalCoolingLoad = this.system.equipment.airHandlers.reduce((sum, ahu) => sum + ahu.coolingCapacity, 0);
    return totalCoolingLoad * 2.4; // gpm (2.4 gpm per ton typical)
  }

  private calculateHotWaterFlow(): number {
    // Calculate based on heating load
    const totalHeatingLoad = this.system.equipment.airHandlers.reduce((sum, ahu) => sum + ahu.heatingCapacity, 0);
    return totalHeatingLoad * 0.01; // gpm (10 MBH per gpm typical)
  }

  private generateChilledWaterMains(): DetailedPipeSection[] {
    return [
      {
        id: 'CWS-1',
        tag: 'CHILLED WATER SUPPLY MAIN',
        nominalSize: 8,
        material: 'Type L Copper',
        flowRate: this.calculateChilledWaterFlow(),
        velocity: 6, // fps
        route: {
          startPoint: { x: 0, y: 0, z: 0 },
          endPoint: { x: 100, y: 0, z: 0 },
          length: 100
        },
        pressureDrop: 2.5, // psi
        insulation: true,
        supports: ['Clevis hangers @ 8\' O.C.']
      }
    ];
  }

  private generateChilledWaterBranches(): DetailedPipeSection[] {
    return [
      {
        id: 'CWS-B1',
        tag: 'CHILLED WATER BRANCH 1',
        nominalSize: 3,
        material: 'Type L Copper',
        flowRate: this.calculateChilledWaterFlow() / 3,
        velocity: 5, // fps
        route: {
          startPoint: { x: 25, y: 0, z: 0 },
          endPoint: { x: 25, y: 50, z: 0 },
          length: 50
        },
        pressureDrop: 1.2, // psi
        insulation: true,
        supports: ['Strap hangers @ 6\' O.C.']
      }
    ];
  }

  private generateHotWaterMains(): DetailedPipeSection[] {
    return [
      {
        id: 'HWS-1',
        tag: 'HOT WATER SUPPLY MAIN',
        nominalSize: 6,
        material: 'Type L Copper',
        flowRate: this.calculateHotWaterFlow(),
        velocity: 6, // fps
        route: {
          startPoint: { x: 0, y: 0, z: 0 },
          endPoint: { x: 100, y: 0, z: 0 },
          length: 100
        },
        pressureDrop: 2.8, // psi
        insulation: true,
        supports: ['Clevis hangers @ 8\' O.C.']
      }
    ];
  }

  private generateHotWaterBranches(): DetailedPipeSection[] {
    return [
      {
        id: 'HWS-B1',
        tag: 'HOT WATER BRANCH 1',
        nominalSize: 2,
        material: 'Type L Copper',
        flowRate: this.calculateHotWaterFlow() / 3,
        velocity: 5, // fps
        route: {
          startPoint: { x: 25, y: 0, z: 0 },
          endPoint: { x: 25, y: 50, z: 0 },
          length: 50
        },
        pressureDrop: 1.5, // psi
        insulation: true,
        supports: ['Strap hangers @ 6\' O.C.']
      }
    ];
  }

  private generatePipingSpecialties(): PipingSpecialtyDetail[] {
    return [
      {
        type: 'Balancing Valve',
        size: 3,
        location: 'Each branch',
        manufacturer: 'Belimo',
        model: 'R3015'
      },
      {
        type: 'Check Valve',
        size: 8,
        location: 'Main header',
        manufacturer: 'Watts',
        model: 'LF719'
      }
    ];
  }

  private generatePipeSupports(): PipeSupportDetail[] {
    return [
      {
        type: 'Clevis Hanger',
        spacing: 8, // feet
        material: 'Steel',
        load: 250 // pounds
      },
      {
        type: 'Strap Hanger',
        spacing: 6, // feet
        material: 'Steel',
        load: 150 // pounds
      }
    ];
  }

  private generateCondensateSystem(): DetailedPipingSystem {
    return {
      type: 'condensate',
      fluid: 'water',
      designConditions: {
        supplyTemp: 55,
        returnTemp: 55,
        flowRate: 5, // gpm
        pressure: 30, // psi
        glycol: false
      },
      mains: [],
      branches: [],
      specialties: [],
      insulation: {
        type: 'none',
        thickness: 0,
        vaporBarrier: false,
        finish: 'none'
      },
      supports: [],
      testing: {
        hydrostaticPressure: 45,
        duration: 1,
        leakageRate: 0.01
      }
    };
  }

  private calculatePumpingRequirements(): PumpingAnalysis {
    return {
      pumps: [
        {
          tag: 'CWP-1',
          type: 'Base Mounted Centrifugal',
          flowRate: this.calculateChilledWaterFlow(),
          head: 85, // feet
          efficiency: 82, // percent
          power: 15, // hp
          npsh: 8 // feet
        }
      ],
      systemCurve: [0, 25, 50, 75, 100],
      operatingPoint: {
        flow: this.calculateChilledWaterFlow(),
        head: 85
      }
    };
  }

  private generatePipingSpecifications(): PipingSpecifications {
    return {
      materials: ['Type L copper tubing per ASTM B88'],
      joining: ['Brazed joints with BCuP-3 alloy'],
      insulation: ['Closed cell foam on chilled water'],
      testing: ['Hydrostatic test at 150% operating pressure'],
      supports: ['Adjustable hangers per MSS SP-58']
    };
  }
}

// Supporting interfaces
export interface ChillerUnit {
  id: string;
  tag: string;
  type: 'air-cooled' | 'water-cooled' | 'evaporative';
  capacity: number; // tons
  efficiency: number; // EER or COP
  refrigerant: string;
  compressorType: 'scroll' | 'screw' | 'centrifugal';
  electrical: ElectricalRequirements;
}

export interface BoilerUnit {
  id: string;
  tag: string;
  type: 'hot-water' | 'steam' | 'condensing';
  fuel: 'gas' | 'oil' | 'electric';
  capacity: number; // MBH
  efficiency: number; // %
  electrical: ElectricalRequirements;
}

export interface FanUnit {
  id: string;
  tag: string;
  type: 'exhaust' | 'supply' | 'return' | 'relief';
  cfm: number;
  staticPressure: number;
  hp: number;
  location: { x: number; y: number; z: number };
}

export interface PumpUnit {
  id: string;
  tag: string;
  type: 'inline' | 'base-mounted' | 'close-coupled';
  flowRate: number; // gpm
  head: number; // ft
  hp: number;
  electrical: ElectricalRequirements;
}

export interface TerminalUnit {
  id: string;
  tag: string;
  type: 'vav' | 'fan-coil' | 'unit-heater' | 'radiant-panel';
  capacity: {
    cooling?: number;
    heating?: number;
    airflow?: number;
  };
  location: { x: number; y: number; z: number };
}

export interface DuctConnection {
  size: { width: number; height: number } | { diameter: number };
  location: 'top' | 'side' | 'bottom';
  offset: { x: number; y: number };
}

export interface PipeConnection {
  size: number; // inches
  type: 'threaded' | 'soldered' | 'flanged' | 'grooved';
  location: { x: number; y: number; z: number };
}

export interface AirTerminal {
  id: string;
  tag: string;
  type: 'supply' | 'return' | 'exhaust';
  style: 'square' | 'round' | 'linear' | 'perforated';
  size: string; // e.g., "24x24", "12" dia"
  cfm: number;
  neckSize: { width: number; height: number } | { diameter: number };
  location: { x: number; y: number; z: number };
}

export interface Damper {
  id: string;
  tag: string;
  type: 'manual' | 'motorized' | 'fire' | 'smoke' | 'backdraft';
  size: { width: number; height: number } | { diameter: number };
  location: string; // duct section ID
}

export interface DuctAccessory {
  type: 'access-door' | 'flexible-connector' | 'turning-vane' | 'sound-attenuator';
  location: string; // duct section ID
}

export interface PipeFitting {
  type: 'elbow' | 'tee' | 'reducer' | 'union' | 'coupling';
  angle?: number;
  kFactor: number; // pressure loss coefficient
}

export interface Valve {
  id: string;
  tag: string;
  type: 'gate' | 'globe' | 'ball' | 'butterfly' | 'check' | 'control' | 'balancing';
  size: number;
  cv?: number; // flow coefficient for control valves
  location: string; // pipe section ID
}

export interface PipeSpecialty {
  type: 'strainer' | 'expansion-joint' | 'air-separator' | 'pressure-gauge' | 'thermometer';
  location: string; // pipe section ID
}

export interface RefrigerantPiping {
  refrigerant: 'R410A' | 'R32' | 'R134a' | 'CO2';
  circuits: {
    suction: PipeSection[];
    liquid: PipeSection[];
    hotGas?: PipeSection[];
  };
  oilReturn: boolean;
  insulation: {
    suction: boolean;
    liquid: boolean;
  };
}

export interface ControlSystem {
  type: 'pneumatic' | 'electric' | 'ddc' | 'hybrid';
  manufacturer: string;
  
  // Points
  sensors: ControlPoint[];
  actuators: ControlPoint[];
  controllers: Controller[];
  
  // Integration
  protocol: 'bacnet' | 'lonworks' | 'modbus' | 'proprietary';
  webAccess: boolean;
  trending: boolean;
  alarms: boolean;
}

export interface ControlPoint {
  id: string;
  tag: string;
  type: string;
  location: string;
  range?: string;
  signal?: '4-20ma' | '0-10v' | 'digital' | 'pneumatic';
}

export interface Controller {
  id: string;
  tag: string;
  type: 'vav' | 'ahu' | 'zone' | 'plant';
  points: number;
  location: string;
}

export interface ElectricalRequirements {
  voltage: number;
  phase: 1 | 3;
  frequency: 50 | 60;
  fla: number; // full load amps
  mca: number; // minimum circuit ampacity
  mop: number; // maximum overcurrent protection
  powerFactor?: number;
}

export interface EquipmentSchedule {
  tag: string;
  equipment: string;
  manufacturer: string;
  model: string;
  capacity: string;
  electrical: string;
  weight: string;
  notes: string;
}

// Enhanced interfaces for detailed HVAC design
export interface DetailedDuctworkDesign {
  projectId: string;
  designCriteria: {
    velocityLimits: {
      mainDucts: number;
      branches: number;
      risers: number;
    };
    pressureLimits: {
      maxStatic: number;
      maxVelocity: number;
    };
    noiseCriteria: {
      occupied: string;
      unoccupied: string;
    };
  };
  ductworkSystems: {
    supply: DuctworkSystemDetail;
    return: DuctworkSystemDetail;
    exhaust: DuctworkSystemDetail;
  };
  terminals: {
    supply: DetailedTerminal[];
    return: DetailedTerminal[];
    exhaust: DetailedTerminal[];
  };
  accessories: DuctAccessoryDetail[];
  pressureAnalysis: SystemPressureAnalysis;
  specifications: DuctworkSpecifications;
}

export interface DuctworkSystemDetail {
  mains: DetailedDuctSection[];
  branches: DetailedDuctSection[];
  material: string;
  insulation: {
    type: string;
    thickness: number;
    rValue: number;
  };
}

export interface DetailedDuctSection {
  id: string;
  tag: string;
  type: 'supply-main' | 'supply-branch' | 'return-main' | 'return-branch' | 'exhaust';
  shape: 'rectangular' | 'round' | 'oval';
  dimensions: {
    width?: number;
    height?: number;
    diameter?: number;
  };
  material: string;
  insulation: {
    type: string;
    thickness: number;
    rValue: number;
  };
  route: {
    startPoint: { x: number; y: number; z: number };
    endPoint: { x: number; y: number; z: number };
    length: number;
    elevation: number;
  };
  airflow: {
    cfm: number;
    velocity: number;
    staticPressure: number;
  };
  construction: {
    gauge: string;
    reinforcement: string;
    joints: string;
    supports: string;
  };
  accessories: DuctAccessoryDetail[];
  pressureCalculation: {
    frictionLoss: number;
    fittingLosses: number;
    totalLoss: number;
  };
}

export interface DetailedTerminal {
  id: string;
  tag: string;
  type: 'supply-diffuser' | 'return-grille' | 'exhaust-grille';
  style: string;
  manufacturer: string;
  model: string;
  size: string;
  cfm: number;
  throwPattern: {
    throw: number;
    drop: number;
    spread: number;
  };
  location: {
    x: number;
    y: number;
    z: number;
    mounting: string;
  };
  connection: {
    ductSize: number;
    type: string;
    length: number;
  };
  performance: {
    noiseCriteria: string;
    pressureDrop: number;
  };
}

export interface DuctAccessoryDetail {
  type: string;
  location: number;
  size: any;
}

export interface SystemPressureAnalysis {
  criticalPath: string[];
  totalSystemPressure: number;
  componentBreakdown: {
    equipment: number;
    ductwork: number;
    fittings: number;
    terminals: number;
  };
}

export interface DuctworkSpecifications {
  materials: string[];
  construction: string[];
  insulation: string[];
  testing: string[];
}

export interface DetailedPipingDesign {
  projectId: string;
  systems: {
    chilledWater: DetailedPipingSystem;
    hotWater: DetailedPipingSystem;
    condensate: DetailedPipingSystem;
  };
  pumpingAnalysis: PumpingAnalysis;
  specifications: PipingSpecifications;
}

export interface DetailedPipingSystem {
  type: string;
  fluid: string;
  designConditions: {
    supplyTemp: number;
    returnTemp: number;
    flowRate: number;
    pressure: number;
    glycol: boolean;
  };
  mains: DetailedPipeSection[];
  branches: DetailedPipeSection[];
  specialties: PipingSpecialtyDetail[];
  insulation: {
    type: string;
    thickness: number;
    vaporBarrier: boolean;
    finish: string;
  };
  supports: PipeSupportDetail[];
  testing: {
    hydrostaticPressure: number;
    duration: number;
    leakageRate: number;
  };
}

export interface DetailedPipeSection {
  id: string;
  tag: string;
  nominalSize: number;
  material: string;
  flowRate: number;
  velocity: number;
  route: {
    startPoint: { x: number; y: number; z: number };
    endPoint: { x: number; y: number; z: number };
    length: number;
  };
  pressureDrop: number;
  insulation: boolean;
  supports: string[];
}

export interface PipingSpecialtyDetail {
  type: string;
  size: number;
  location: string;
  manufacturer: string;
  model: string;
}

export interface PipeSupportDetail {
  type: string;
  spacing: number;
  material: string;
  load: number;
}

export interface PumpingAnalysis {
  pumps: DetailedPump[];
  systemCurve: number[];
  operatingPoint: { flow: number; head: number };
}

export interface DetailedPump {
  tag: string;
  type: string;
  flowRate: number;
  head: number;
  efficiency: number;
  power: number;
  npsh: number;
}

export interface PipingSpecifications {
  materials: string[];
  joining: string[];
  insulation: string[];
  testing: string[];
  supports: string[];
}

export interface HVACSpecifications {
  general: {
    codes: string[];
    standards: string[];
    workmanship: string;
    testing: string;
    warranty: string;
  };
  equipment: {
    airHandlers: string;
    chillers: string;
    boilers: string;
    pumps: string;
    controls: string;
  };
  ductwork: {
    material: string;
    construction: string;
    insulation: string;
    supports: string;
    sealing: string;
  };
  piping: {
    chilledWater: string;
    hotWater: string;
    condensate: string;
    insulation: string;
    supports: string;
  };
  controls: {
    system: string;
    sensors: string;
    actuators: string;
    programming: string;
    commissioning: string;
  };
  testing: {
    ductwork: string;
    piping: string;
    controls: string;
    balancing: string;
    commissioning: string;
  };
}