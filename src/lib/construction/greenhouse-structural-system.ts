/**
 * Greenhouse Structural System Designer
 * Professional greenhouse construction specifications matching industry standards
 */

export interface GreenhouseStructure {
  type: GreenhouseType;
  dimensions: GreenhouseDimensions;
  structural: StructuralSystem;
  covering: CoveringSystem;
  ventilation: VentilationSystem;
  heating: HeatingSystem;
  cooling: CoolingSystem;
  irrigation: IrrigationSystem;
  climate: ClimateControlSystem;
  energy: EnergySystem;
  loadCalculations: StructuralLoads;
  compliance: ComplianceRequirements;
}

export type GreenhouseType = 
  | 'venlo'
  | 'widespan'
  | 'polytunnel'
  | 'gothic-arch'
  | 'sawtooth'
  | 'multispan-gutter-connected';

export interface GreenhouseDimensions {
  // Standard Venlo measurements
  bayWidth: number; // typically 6.4m, 8m, or 9.6m
  bayLength: number; // typically 4m or 5m
  numberOfBays: number;
  gutterHeight: number; // typically 4-8m
  ridgeHeight: number; // calculated from roof pitch
  totalArea: number; // m²
  growingArea: number; // m² (excluding technical areas)
  roofPitch: number; // degrees (typically 22-25°)
}

export interface StructuralSystem {
  foundation: FoundationDesign;
  columns: ColumnSpecification;
  trusses: TrussSpecification;
  gutters: GutterSystem;
  purlins: PurlinSpecification;
  connections: ConnectionDetails;
  materials: MaterialSpecifications;
}

export interface FoundationDesign {
  type: 'concrete-pad' | 'pile' | 'continuous-footing' | 'slab';
  depth: number; // meters
  width: number; // meters
  reinforcement: ReinforcementSpec;
  soilBearingCapacity: number; // kN/m²
  frostDepth: number; // meters
  drainage: DrainageSpec;
}

export interface ColumnSpecification {
  profile: string; // e.g., "IPE 200", "HEA 180"
  material: 'galvanized-steel' | 'aluminum' | 'stainless-steel';
  spacing: number; // meters
  height: number; // meters
  baseplate: BaseplateSpec;
  corrosionProtection: string;
  loadCapacity: number; // kN
}

export interface TrussSpecification {
  type: 'lattice' | 'warren' | 'pratt' | 'howe';
  span: number; // meters
  profile: string; // member profiles
  spacing: number; // meters
  loadCapacity: number; // kN/m²
  connections: 'bolted' | 'welded';
  finish: string;
}

export interface GutterSystem {
  profile: 'aluminum-extrusion' | 'steel-formed' | 'composite';
  width: number; // mm
  depth: number; // mm
  thickness: number; // mm
  drainage: GutterDrainage;
  walkway: boolean;
  loadCapacity: number; // water + maintenance loads
}

export interface GutterDrainage {
  slope: number; // percentage
  downspouts: DownspoutSpec;
  capacity: number; // liters/minute/m²
  overflow: OverflowProtection;
}

export interface CoveringSystem {
  type: 'glass' | 'polycarbonate' | 'poly-film' | 'rigid-plastic';
  specification: CoveringSpec;
  installation: InstallationMethod;
  thermalProperties: ThermalProperties;
  lightTransmission: LightProperties;
  maintenance: MaintenanceRequirements;
}

export interface CoveringSpec {
  // For glass
  glassType?: 'float' | 'tempered' | 'low-iron' | 'diffused' | 'ar-coated';
  thickness?: number; // mm (typically 4mm)
  size?: { width: number; length: number }; // mm
  
  // For polycarbonate
  pcType?: 'twin-wall' | 'triple-wall' | 'solid';
  pcThickness?: number; // mm (8-16mm typical)
  
  // Common properties
  uValue: number; // W/m²K
  lightTransmission: number; // percentage
  hazeHactor: number; // percentage
  warranty: number; // years
}

export interface VentilationSystem {
  naturalVentilation: NaturalVentilation;
  forcedVentilation?: ForcedVentilation;
  airExchangeRate: number; // air changes per hour
  controls: VentilationControls;
}

export interface NaturalVentilation {
  roofVents: RoofVentSpec;
  sideVents?: SideVentSpec;
  gableVents?: GableVentSpec;
  totalVentArea: number; // percentage of floor area
  stackEffect: boolean;
}

export interface RoofVentSpec {
  type: 'continuous-ridge' | 'rack-pinion' | 'push-rod';
  width: number; // meters
  openingAngle: number; // degrees (typically 45-65°)
  mechanism: 'rack-pinion' | 'push-rod' | 'cable-drum';
  motor: VentMotorSpec;
  windProtection: 'standard' | 'storm-resistant';
  insectScreen: boolean;
}

export interface HeatingSystem {
  type: 'hot-water' | 'hot-air' | 'radiant' | 'combined';
  capacity: number; // kW
  distribution: HeatingDistribution;
  boiler?: BoilerSpec;
  backup: boolean;
  efficiency: number; // percentage
}

export interface HeatingDistribution {
  // Pipe rail heating (most common in Venlo)
  pipeRails?: {
    diameter: number; // mm (typically 51mm)
    circuits: number;
    layout: 'perimeter' | 'under-gutter' | 'grow-pipes' | 'combined';
    material: 'steel' | 'aluminum';
    spacing: number; // mm
  };
  
  // Under bench heating
  underBench?: {
    pipeSize: number;
    spacing: number;
    zones: number;
  };
  
  // Snow melting in gutters
  gutterHeating?: boolean;
}

export interface CoolingSystem {
  type: 'pad-fan' | 'fog' | 'roof-sprinklers' | 'mechanical';
  capacity: number; // kW or temperature reduction
  evaporativeCooling?: EvaporativeCooling;
  shading?: ShadingSystem;
}

export interface EvaporativeCooling {
  padArea: number; // m²
  padThickness: number; // mm
  airflow: number; // m³/hour
  waterConsumption: number; // liters/hour
  efficiency: number; // percentage cooling efficiency
}

export interface ShadingSystem {
  type: 'energy-screen' | 'shade-cloth' | 'whitewash' | 'electrochromic';
  shadingPercentage: number;
  energySaving?: number; // percentage
  mechanism: 'cable-drive' | 'rack-pinion' | 'manual';
  controls: 'automatic' | 'manual' | 'climate-integrated';
}

export interface ClimateControlSystem {
  computer: ClimateComputer;
  sensors: SensorArray;
  integration: SystemIntegration;
  alarms: AlarmSystem;
  dataLogging: DataLogging;
}

export interface ClimateComputer {
  brand: 'Priva' | 'Hoogendoorn' | 'Ridder' | 'Argus';
  model: string;
  capabilities: string[];
  zones: number;
  weatherStation: boolean;
  remoteAccess: boolean;
  cloudConnected: boolean;
}

export interface StructuralLoads {
  deadLoad: number; // kg/m²
  liveLoad: number; // kg/m² (maintenance, equipment)
  snowLoad: number; // kg/m² (location specific)
  windLoad: WindLoadCalculation;
  cropLoad: number; // kg/m² (hanging crops)
  equipmentLoad: number; // kg/m² (lights, irrigation)
  seismicZone?: string;
  totalDesignLoad: number; // kg/m²
}

export interface WindLoadCalculation {
  basicWindSpeed: number; // m/s
  exposureCategory: 'A' | 'B' | 'C' | 'D';
  importanceFactor: number;
  designPressure: number; // kN/m²
  upliftPressure: number; // kN/m²
}

export interface ComplianceRequirements {
  buildingCode: string; // e.g., "IBC 2021", "Eurocode"
  snowLoadStandard: string; // e.g., "ASCE 7-16"
  windLoadStandard: string;
  seismicStandard?: string;
  energyCode?: string;
  certifications: string[]; // e.g., "CE Mark", "UL Listed"
}

export class GreenhouseStructuralDesigner {
  /**
   * Design a Venlo-style greenhouse to Dutch standards
   */
  static designVenloGreenhouse(
    area: number, // m²
    location: { latitude: number; snowLoad: number; windSpeed: number },
    cropType: 'tomatoes' | 'cucumbers' | 'peppers' | 'cannabis' | 'leafy-greens'
  ): GreenhouseStructure {
    // Standard Venlo bay dimensions
    const bayWidth = 8; // meters (can be 6.4, 8, or 9.6)
    const bayLength = 5; // meters (can be 4 or 5)
    const gutterHeight = this.calculateGutterHeight(cropType);
    const roofPitch = 23; // degrees (optimal for condensation)
    
    // Calculate number of bays
    const baysWide = Math.ceil(Math.sqrt(area) / bayWidth);
    const baysLong = Math.ceil(area / (baysWide * bayWidth * bayLength) * bayLength / bayLength);
    const actualArea = baysWide * bayWidth * baysLong * bayLength;

    const structure: GreenhouseStructure = {
      type: 'venlo',
      dimensions: {
        bayWidth,
        bayLength,
        numberOfBays: baysWide * baysLong,
        gutterHeight,
        ridgeHeight: gutterHeight + (bayWidth / 2) * Math.tan(roofPitch * Math.PI / 180),
        totalArea: actualArea,
        growingArea: actualArea * 0.92, // 92% typical growing area
        roofPitch
      },
      structural: this.designStructuralSystem(bayWidth, bayLength, gutterHeight, location),
      covering: this.selectCoveringSystem(cropType),
      ventilation: this.designVentilationSystem(actualArea, cropType),
      heating: this.designHeatingSystem(actualArea, location, cropType),
      cooling: this.designCoolingSystem(actualArea, location),
      irrigation: this.designIrrigationSystem(actualArea, cropType),
      climate: this.designClimateControl(baysWide * baysLong),
      energy: this.designEnergySystem(actualArea),
      loadCalculations: this.calculateStructuralLoads(location, cropType),
      compliance: {
        buildingCode: 'Eurocode EN 13031-1',
        snowLoadStandard: 'EN 1991-1-3',
        windLoadStandard: 'EN 1991-1-4',
        energyCode: 'EN 16258',
        certifications: ['CE Mark', 'NEN 3859', 'Kassenbouw Nederland']
      }
    };

    return structure;
  }

  /**
   * Calculate optimal gutter height based on crop
   */
  private static calculateGutterHeight(cropType: string): number {
    switch (cropType) {
      case 'tomatoes':
        return 6.0; // High-wire tomatoes need 6-7m
      case 'cucumbers':
        return 5.5; // High-wire cucumbers
      case 'cannabis':
        return 4.5; // Controlled height
      case 'leafy-greens':
        return 4.0; // Lower height acceptable
      default:
        return 5.0;
    }
  }

  /**
   * Design structural steel system
   */
  private static designStructuralSystem(
    bayWidth: number,
    bayLength: number,
    gutterHeight: number,
    location: any
  ): StructuralSystem {
    return {
      foundation: {
        type: 'concrete-pad',
        depth: 1.2, // meters (below frost line)
        width: 0.8, // meters
        reinforcement: {
          type: 'rebar-cage',
          mainBars: '4x16mm',
          stirrups: '8mm@200mm'
        },
        soilBearingCapacity: 150, // kN/m²
        frostDepth: 1.0, // meters
        drainage: {
          type: 'french-drain',
          depth: 0.3,
          aggregate: '20mm'
        }
      },
      columns: {
        profile: 'IPE 200', // Standard for 6m gutter height
        material: 'galvanized-steel',
        spacing: bayLength,
        height: gutterHeight,
        baseplate: {
          size: '300x300x20mm',
          bolts: '4xM20',
          grout: 'non-shrink'
        },
        corrosionProtection: 'hot-dip-galvanized-85μm',
        loadCapacity: 150 // kN
      },
      trusses: {
        type: 'lattice',
        span: bayWidth,
        profile: 'L50x50x5',
        spacing: bayLength,
        loadCapacity: 1.5, // kN/m²
        connections: 'bolted',
        finish: 'galvanized'
      },
      gutters: {
        profile: 'aluminum-extrusion',
        width: 250, // mm
        depth: 180, // mm
        thickness: 3, // mm
        drainage: {
          slope: 0.3, // percentage
          downspouts: {
            diameter: 110, // mm
            spacing: 50, // meters
            material: 'PVC'
          },
          capacity: 150, // liters/minute/m²
          overflow: {
            type: 'side-overflow',
            height: 150 // mm
          }
        },
        walkway: true,
        loadCapacity: 1.5 // kN/m
      },
      purlins: {
        profile: 'Z150x50x20x2',
        material: 'galvanized-steel',
        spacing: 1.25, // meters
        connections: 'clipped'
      },
      connections: {
        columnBase: 'bolted-baseplate',
        trussToColumn: 'bolted-cleat',
        purlinToTruss: 'clipped',
        gutterToColumn: 'bolted-bracket'
      },
      materials: {
        steel: 'S235JR',
        galvanizing: 'ISO1461',
        bolts: '8.8-grade',
        welds: 'E70XX'
      }
    };
  }

  /**
   * Select appropriate covering system
   */
  private static selectCoveringSystem(cropType: string): CoveringSystem {
    // For high-value crops, use glass
    const useGlass = ['tomatoes', 'cucumbers', 'peppers'].includes(cropType);

    if (useGlass) {
      return {
        type: 'glass',
        specification: {
          glassType: 'low-iron',
          thickness: 4, // mm
          size: { width: 1650, length: 1670 }, // Standard Venlo glass size
          uValue: 5.8, // W/m²K (single glass)
          lightTransmission: 90, // percentage
          hazeHactor: 0, // percentage
          warranty: 10 // years
        },
        installation: {
          method: 'dry-glazing',
          sealant: 'EPDM-gaskets',
          clips: 'aluminum-continuous'
        },
        thermalProperties: {
          uValue: 5.8,
          gValue: 0.85, // solar heat gain
          condensation: 'controlled-drip'
        },
        lightTransmission: {
          par: 90,
          diffusion: 0,
          spectrum: 'full'
        },
        maintenance: {
          cleaning: 'bi-annual',
          resealing: '10-years',
          replacement: '25-years'
        }
      };
    } else {
      // Use polycarbonate for cannabis/leafy greens
      return {
        type: 'polycarbonate',
        specification: {
          pcType: 'twin-wall',
          pcThickness: 16, // mm
          uValue: 2.5, // W/m²K (better insulation)
          lightTransmission: 82, // percentage
          hazeHactor: 15, // percentage (some diffusion)
          warranty: 10 // years
        },
        installation: {
          method: 'h-profile-system',
          sealant: 'silicone',
          expansion: 'floating-system'
        },
        thermalProperties: {
          uValue: 2.5,
          gValue: 0.75,
          condensation: 'channel-drainage'
        },
        lightTransmission: {
          par: 82,
          diffusion: 15,
          spectrum: 'full'
        },
        maintenance: {
          cleaning: 'annual',
          resealing: '5-years',
          replacement: '15-years'
        }
      };
    }
  }

  /**
   * Design ventilation system
   */
  private static designVentilationSystem(
    area: number,
    cropType: string
  ): VentilationSystem {
    const ventPercentage = cropType === 'cannabis' ? 40 : 30; // Higher for cannabis

    return {
      naturalVentilation: {
        roofVents: {
          type: 'continuous-ridge',
          width: 1.5, // meters
          openingAngle: 62, // degrees
          mechanism: 'rack-pinion',
          motor: {
            type: 'electric-24v',
            power: 0.37, // kW
            speed: 'variable',
            feedback: 'potentiometer'
          },
          windProtection: 'storm-resistant',
          insectScreen: true
        },
        sideVents: {
          height: 1.5, // meters
          type: 'roll-up',
          mechanism: 'gear-motor',
          insectScreen: true
        },
        totalVentArea: ventPercentage,
        stackEffect: true
      },
      forcedVentilation: cropType === 'cannabis' ? {
        fans: {
          type: 'horizontal-airflow',
          capacity: 10, // m³/hour/m²
          spacing: 40, // meters
          power: 0.75 // kW per fan
        },
        circulation: 'continuous',
        controls: 'vfd-controlled'
      } : undefined,
      airExchangeRate: 60, // air changes per hour
      controls: {
        type: 'climate-computer',
        sensors: ['temperature', 'humidity', 'CO2', 'wind'],
        algorithms: ['temperature-integration', 'humidity-deficit', 'wind-compensation']
      }
    };
  }

  /**
   * Design heating system
   */
  private static designHeatingSystem(
    area: number,
    location: any,
    cropType: string
  ): HeatingSystem {
    // Calculate heating requirement (rough estimate)
    const outsideTemp = -10; // °C design temperature
    const insideTemp = cropType === 'cannabis' ? 25 : 20; // °C
    const deltaT = insideTemp - outsideTemp;
    const uValue = 5.8; // W/m²K for glass
    const capacity = area * uValue * deltaT / 1000; // kW

    return {
      type: 'hot-water',
      capacity: capacity * 1.2, // 20% safety factor
      distribution: {
        pipeRails: {
          diameter: 51, // mm
          circuits: 4, // grow pipes + perimeter
          layout: 'combined',
          material: 'steel',
          spacing: 1600 // mm (one per bay)
        },
        underBench: cropType === 'cannabis' ? {
          pipeSize: 32, // mm
          spacing: 400, // mm
          zones: 4
        } : undefined,
        gutterHeating: location.snowLoad > 1.0 // kN/m²
      },
      boiler: {
        type: 'condensing-gas',
        efficiency: 95, // percentage
        capacity: capacity * 1.2,
        fuel: 'natural-gas',
        backup: 'second-boiler'
      },
      backup: true,
      efficiency: 95
    };
  }

  /**
   * Design cooling system
   */
  private static designCoolingSystem(
    area: number,
    location: any
  ): CoolingSystem {
    return {
      type: 'pad-fan',
      capacity: 20, // °C temperature reduction
      evaporativeCooling: {
        padArea: area * 0.01, // 1% of floor area
        padThickness: 150, // mm
        airflow: area * 150, // m³/hour (150 m³/hour/m²)
        waterConsumption: area * 5, // liters/hour
        efficiency: 80 // percentage
      },
      shading: {
        type: 'energy-screen',
        shadingPercentage: 75,
        energySaving: 40, // percentage
        mechanism: 'cable-drive',
        controls: 'climate-integrated'
      }
    };
  }

  /**
   * Design irrigation system
   */
  private static designIrrigationSystem(
    area: number,
    cropType: string
  ): IrrigationSystem {
    return {
      type: 'drip-irrigation',
      waterSource: 'rainwater-primary',
      storage: {
        capacity: area * 0.1, // m³ (100L/m²)
        type: 'concrete-basin',
        location: 'underground'
      },
      distribution: {
        mainLines: 'PVC-110mm',
        subMains: 'PE-63mm',
        laterals: 'PE-16mm',
        emitters: {
          type: 'pressure-compensating',
          flowRate: 2, // liters/hour
          spacing: cropType === 'cannabis' ? 0.3 : 0.5 // meters
        }
      },
      fertilizer: {
        type: 'venturi-injection',
        tanks: 4,
        capacity: 1000, // liters each
        mixing: 'automatic'
      },
      drainage: {
        collection: 'gutter-system',
        recycling: true,
        disinfection: 'UV-treatment'
      },
      controls: {
        type: 'computer-controlled',
        sensors: ['EC', 'pH', 'flow', 'pressure'],
        programs: 20
      }
    };
  }

  /**
   * Design climate control system
   */
  private static designClimateControl(zones: number): ClimateControlSystem {
    return {
      computer: {
        brand: 'Priva',
        model: 'Connext',
        capabilities: [
          'multi-zone-control',
          'weather-compensation',
          'energy-optimization',
          'crop-registration',
          'remote-access'
        ],
        zones,
        weatherStation: true,
        remoteAccess: true,
        cloudConnected: true
      },
      sensors: {
        greenhouse: [
          { type: 'temperature', quantity: zones * 2 },
          { type: 'humidity', quantity: zones * 2 },
          { type: 'CO2', quantity: zones },
          { type: 'PAR-light', quantity: zones }
        ],
        outside: [
          { type: 'temperature', quantity: 1 },
          { type: 'humidity', quantity: 1 },
          { type: 'wind-speed', quantity: 1 },
          { type: 'wind-direction', quantity: 1 },
          { type: 'rain', quantity: 1 },
          { type: 'solar-radiation', quantity: 1 }
        ]
      },
      integration: {
        heating: 'modbus',
        ventilation: 'analog-0-10v',
        screening: 'motor-control',
        irrigation: 'ethernet',
        lighting: 'dali'
      },
      alarms: {
        types: ['temperature', 'humidity', 'power-failure', 'pump-failure', 'screen-failure'],
        notification: ['sms', 'email', 'app-push'],
        backup: 'cellular-modem'
      },
      dataLogging: {
        interval: 5, // minutes
        storage: 'cloud',
        retention: 5, // years
        export: ['csv', 'api']
      }
    };
  }

  /**
   * Design energy system
   */
  private static designEnergySystem(area: number): EnergySystem {
    return {
      cogeneration: {
        type: 'natural-gas-CHP',
        electricalCapacity: area * 0.05, // kW (50W/m²)
        thermalCapacity: area * 0.15, // kW (150W/m²)
        efficiency: {
          electrical: 42,
          thermal: 45,
          total: 87
        }
      },
      heatStorage: {
        type: 'insulated-tank',
        capacity: area * 0.2, // m³ (200L/m²)
        temperature: 95, // °C
        insulation: 'mineral-wool-200mm'
      },
      co2Recovery: {
        source: 'flue-gas',
        capacity: area * 0.05, // kg/hour/m²
        storage: 'liquid-tank',
        distribution: 'perforated-tube'
      },
      renewable: {
        solar: {
          type: 'semi-transparent-PV',
          capacity: area * 0.02, // kW (20W/m²)
          integration: 'roof-integrated'
        }
      }
    };
  }

  /**
   * Calculate structural loads
   */
  private static calculateStructuralLoads(
    location: any,
    cropType: string
  ): StructuralLoads {
    const cropLoads: Record<string, number> = {
      'tomatoes': 35, // kg/m²
      'cucumbers': 30,
      'peppers': 25,
      'cannabis': 15,
      'leafy-greens': 5
    };

    return {
      deadLoad: 15, // kg/m² (structure + covering)
      liveLoad: 25, // kg/m² (maintenance)
      snowLoad: location.snowLoad * 100, // kg/m²
      windLoad: {
        basicWindSpeed: location.windSpeed,
        exposureCategory: 'B',
        importanceFactor: 1.0,
        designPressure: 0.8, // kN/m²
        upliftPressure: 1.2 // kN/m²
      },
      cropLoad: cropLoads[cropType] || 20,
      equipmentLoad: 10, // kg/m² (lights, etc.)
      totalDesignLoad: 15 + 25 + (location.snowLoad * 100) + cropLoads[cropType] + 10
    };
  }
}

// Supporting interfaces
interface IrrigationSystem {
  type: string;
  waterSource: string;
  storage: any;
  distribution: any;
  fertilizer: any;
  drainage: any;
  controls: any;
}

interface EnergySystem {
  cogeneration?: any;
  heatStorage?: any;
  co2Recovery?: any;
  renewable?: any;
}

interface ReinforcementSpec {
  type: string;
  mainBars: string;
  stirrups: string;
}

interface DrainageSpec {
  type: string;
  depth: number;
  aggregate: string;
}

interface BaseplateSpec {
  size: string;
  bolts: string;
  grout: string;
}

interface PurlinSpecification {
  profile: string;
  material: string;
  spacing: number;
  connections: string;
}

interface ConnectionDetails {
  columnBase: string;
  trussToColumn: string;
  purlinToTruss: string;
  gutterToColumn: string;
}

interface MaterialSpecifications {
  steel: string;
  galvanizing: string;
  bolts: string;
  welds: string;
}

interface DownspoutSpec {
  diameter: number;
  spacing: number;
  material: string;
}

interface OverflowProtection {
  type: string;
  height: number;
}

interface InstallationMethod {
  method: string;
  sealant: string;
  clips?: string;
  expansion?: string;
}

interface ThermalProperties {
  uValue: number;
  gValue: number;
  condensation: string;
}

interface LightProperties {
  par: number;
  diffusion: number;
  spectrum: string;
}

interface MaintenanceRequirements {
  cleaning: string;
  resealing: string;
  replacement: string;
}

interface ForcedVentilation {
  fans: any;
  circulation: string;
  controls: string;
}

interface VentilationControls {
  type: string;
  sensors: string[];
  algorithms: string[];
}

interface SideVentSpec {
  height: number;
  type: string;
  mechanism: string;
  insectScreen: boolean;
}

interface GableVentSpec {
  area: number;
  type: string;
  controls: string;
}

interface VentMotorSpec {
  type: string;
  power: number;
  speed: string;
  feedback: string;
}

interface BoilerSpec {
  type: string;
  efficiency: number;
  capacity: number;
  fuel: string;
  backup: string;
}

interface SensorArray {
  greenhouse: Array<{ type: string; quantity: number }>;
  outside: Array<{ type: string; quantity: number }>;
}

interface SystemIntegration {
  heating: string;
  ventilation: string;
  screening: string;
  irrigation: string;
  lighting: string;
}

interface AlarmSystem {
  types: string[];
  notification: string[];
  backup: string;
}

interface DataLogging {
  interval: number;
  storage: string;
  retention: number;
  export: string[];
}