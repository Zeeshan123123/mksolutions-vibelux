/**
 * Electrical System Designer
 * Generates code-compliant electrical designs with single-line diagrams
 */

import { CONSTRUCTION_COMPONENTS } from './component-database';

export interface ElectricalLoad {
  id: string;
  name: string;
  voltage: number;
  amperage: number;
  phase: 'single' | 'three';
  continuousDuty: boolean;
  powerFactor: number;
  location: { zone: string; x: number; y: number };
  fixtureCount?: number;
}

export interface Circuit {
  id: string;
  number: number;
  name: string;
  breaker: {
    amperage: number;
    poles: number;
    type: 'standard' | 'GFCI' | 'AFCI';
  };
  wire: {
    gauge: string;
    type: 'THHN' | 'THWN-2' | 'MC';
    conductors: number;
    length: number; // feet
  };
  conduit: {
    type: 'EMT' | 'PVC' | 'MC' | 'Flex';
    size: string; // e.g., "3/4"
  };
  loads: ElectricalLoad[];
  voltage: number;
  actualLoad: number; // calculated amps
  percentLoad: number; // percentage of breaker rating
}

export interface Panel {
  id: string;
  name: string;
  type: 'main' | 'sub';
  location: string;
  specs: {
    amperage: number;
    voltage: string;
    phase: 'single' | 'three';
    spaces: number;
    mounting: 'surface' | 'flush';
  };
  feeder?: {
    fromPanel: string;
    breaker: number;
    wire: string;
    conduit: string;
    length: number;
  };
  circuits: Circuit[];
  totalLoad: number;
  demandLoad: number;
  percentCapacity: number;
}

export interface ElectricalSystem {
  service: {
    utilityVoltage: string;
    serviceSize: number;
    meterLocation: string;
    transformer?: {
      kva: number;
      primary: string;
      secondary: string;
    };
  };
  panels: Panel[];
  totalConnectedLoad: number;
  totalDemandLoad: number;
  voltageDropCalculations: VoltageDropCalc[];
  loadSchedule: LoadScheduleEntry[];
  singleLineDiagram: SingleLineDiagram;
}

export interface VoltageDropCalc {
  circuitId: string;
  length: number;
  load: number;
  wireSize: string;
  voltageDrop: number;
  percentDrop: number;
  acceptable: boolean;
}

export interface LoadScheduleEntry {
  panel: string;
  circuit: number;
  description: string;
  load: number;
  breaker: string;
  wire: string;
  notes: string;
}

export interface SingleLineDiagram {
  elements: DiagramElement[];
  connections: DiagramConnection[];
  annotations: DiagramAnnotation[];
}

export interface DiagramElement {
  id: string;
  type: 'service' | 'meter' | 'panel' | 'breaker' | 'load' | 'transformer' | 'disconnect';
  label: string;
  specs: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface DiagramConnection {
  from: string;
  to: string;
  wire: string;
  conduit: string;
  label?: string;
}

export interface DiagramAnnotation {
  type: 'note' | 'dimension' | 'legend';
  text: string;
  position: { x: number; y: number };
}

export interface DetailedPanelSchedule {
  panelId: string;
  panelName: string;
  panelType: 'main' | 'sub';
  location: string;
  specifications: PanelSpecifications;
  feederInfo?: FeederInfo;
  circuitSchedule: CircuitScheduleEntry[];
  loadSummary: LoadSummary;
  nec2020Compliance: NECCompliance;
}

export interface PanelSpecifications {
  manufacturer: string;
  series: string;
  catalog: string;
  mainBreaker: number;
  voltage: string;
  phase: 'single' | 'three';
  spaces: number;
  mounting: 'surface' | 'flush';
  busRating: number;
  shortCircuitRating: string;
  enclosure: string;
}

export interface FeederInfo {
  fromPanel: string;
  breakerSize: number;
  wireSize: string;
  conduitSize: string;
  length: number;
  voltageDrop: number;
  ampacity: number;
}

export interface CircuitScheduleEntry {
  circuitNumber: number;
  phaseA: number;
  phaseB: number;
  phaseC: number;
  description: string;
  loadType: string;
  breaker: BreakerInfo;
  wire: WireInfo;
  conduit: ConduitInfo;
  protection: ProtectionInfo;
  connectionDetails: ConnectionInfo;
}

export interface BreakerInfo {
  amperage: number;
  poles: number;
  type: 'standard' | 'GFCI' | 'AFCI';
  manufacturer: string;
  catalog: string;
}

export interface WireInfo {
  size: string;
  type: string;
  conductors: number;
  length: number;
  voltageDrop: number;
  ampacity: number;
}

export interface ConduitInfo {
  type: string;
  size: string;
  fill: number;
  length: number;
}

export interface ProtectionInfo {
  gfci: boolean;
  afci: boolean;
  surgeProtection: boolean;
}

export interface ConnectionInfo {
  fromLug: string;
  toLug: string;
  torque: string;
}

export interface LoadSummary {
  totalConnectedLoad: number;
  demandLoad: number;
  demandFactor: number;
  phaseALoad: number;
  phaseBLoad: number;
  phaseCLoad: number;
  neutralLoad: number;
  loadBalance: number;
  utilizationFactor: number;
  spareCapacity: number;
  spareCircuits: number;
}

export interface NECCompliance {
  article210: ComplianceCheck;
  article220: ComplianceCheck;
  article408: ComplianceCheck;
  article240: ComplianceCheck;
}

export interface ComplianceCheck {
  compliant: boolean;
  notes: string[];
  requirements: string[];
}

export interface ElectricalSpecifications {
  generalRequirements: {
    codes: string[];
    workmanship: string;
    testing: string;
    warranty: string;
  };
  service: {
    utilityCoordination: string;
    meteringRequirements: string;
    grounding: string;
    bonding: string;
  };
  panelboards: {
    construction: string;
    busRating: string;
    breakers: string;
    labeling: string;
  };
  wiring: {
    methods: string;
    wireNuts: string;
    boxes: string;
    supports: string;
  };
  installation: {
    rough: string;
    trim: string;
    testing: string;
    cleanup: string;
  };
  qualityControl: {
    inspection: string;
    testing: string;
    documentation: string;
    training: string;
  };
}

export class ElectricalSystemDesigner {
  private system: ElectricalSystem;
  
  constructor() {
    this.system = {
      service: {
        utilityVoltage: '480Y/277V',
        serviceSize: 800,
        meterLocation: 'Exterior North Wall'
      },
      panels: [],
      totalConnectedLoad: 0,
      totalDemandLoad: 0,
      voltageDropCalculations: [],
      loadSchedule: [],
      singleLineDiagram: {
        elements: [],
        connections: [],
        annotations: []
      }
    };
  }

  /**
   * Add main service panel
   */
  addMainPanel(name: string, amperage: number, spaces: number): Panel {
    const panel: Panel = {
      id: `panel-${Date.now()}`,
      name,
      type: 'main',
      location: 'Electrical Room',
      specs: {
        amperage,
        voltage: '480Y/277V',
        phase: 'three',
        spaces,
        mounting: 'surface'
      },
      circuits: [],
      totalLoad: 0,
      demandLoad: 0,
      percentCapacity: 0
    };

    this.system.panels.push(panel);
    return panel;
  }

  /**
   * Add sub panel fed from main
   */
  addSubPanel(
    name: string,
    amperage: number,
    spaces: number,
    fromPanel: string,
    feederBreaker: number
  ): Panel {
    const panel: Panel = {
      id: `panel-${Date.now()}`,
      name,
      type: 'sub',
      location: 'Growing Area',
      specs: {
        amperage,
        voltage: '208Y/120V',
        phase: 'three',
        spaces,
        mounting: 'surface'
      },
      feeder: {
        fromPanel,
        breaker: feederBreaker,
        wire: this.calculateFeederWire(feederBreaker),
        conduit: this.calculateConduitSize(feederBreaker),
        length: 100 // feet
      },
      circuits: [],
      totalLoad: 0,
      demandLoad: 0,
      percentCapacity: 0
    };

    this.system.panels.push(panel);
    return panel;
  }

  /**
   * Add circuit to panel
   */
  addCircuit(
    panelId: string,
    name: string,
    loads: ElectricalLoad[],
    voltage: number = 277
  ): Circuit {
    const panel = this.system.panels.find(p => p.id === panelId);
    if (!panel) throw new Error('Panel not found');

    // Calculate circuit load
    const totalLoad = loads.reduce((sum, load) => {
      const factor = load.continuousDuty ? 1.25 : 1.0;
      return sum + (load.amperage * factor);
    }, 0);

    // Size breaker (next standard size up)
    const breakerSize = this.selectBreakerSize(totalLoad);
    
    // Calculate wire size
    const wireSize = this.calculateWireSize(breakerSize, voltage, 100); // assume 100ft run

    const circuit: Circuit = {
      id: `circuit-${Date.now()}`,
      number: panel.circuits.length + 1,
      name,
      breaker: {
        amperage: breakerSize,
        poles: voltage > 240 ? 2 : 1,
        type: 'standard'
      },
      wire: {
        gauge: wireSize,
        type: 'THHN',
        conductors: voltage > 240 ? 3 : 2,
        length: 100
      },
      conduit: {
        type: 'EMT',
        size: this.calculateConduitSize(breakerSize)
      },
      loads,
      voltage,
      actualLoad: totalLoad,
      percentLoad: (totalLoad / breakerSize) * 100
    };

    panel.circuits.push(circuit);
    this.updatePanelLoads(panelId);
    
    return circuit;
  }

  /**
   * Generate lighting circuits for grow room
   */
  generateLightingCircuits(
    panelId: string,
    fixtures: Array<{ id: string; wattage: number; voltage: number; quantity: number }>
  ): Circuit[] {
    const circuits: Circuit[] = [];
    const voltage = 277; // Commercial voltage for lighting
    const maxCircuitLoad = 16; // 80% of 20A breaker

    let currentCircuitLoads: ElectricalLoad[] = [];
    let currentCircuitLoad = 0;
    let circuitNumber = 1;

    for (const fixture of fixtures) {
      const fixtureAmperage = fixture.wattage / voltage;
      
      for (let i = 0; i < fixture.quantity; i++) {
        const load: ElectricalLoad = {
          id: `${fixture.id}-${i}`,
          name: `Grow Light ${circuitNumber}-${currentCircuitLoads.length + 1}`,
          voltage,
          amperage: fixtureAmperage,
          phase: 'single',
          continuousDuty: true, // Lights run > 3 hours
          powerFactor: 0.95,
          location: { zone: `Zone ${circuitNumber}`, x: 0, y: 0 }
        };

        // Check if adding this load exceeds circuit capacity
        const loadWithFactor = fixtureAmperage * 1.25; // 125% for continuous duty
        
        if (currentCircuitLoad + loadWithFactor > maxCircuitLoad) {
          // Create circuit with current loads
          if (currentCircuitLoads.length > 0) {
            const circuit = this.addCircuit(
              panelId,
              `Lighting Circuit ${circuitNumber}`,
              currentCircuitLoads,
              voltage
            );
            circuits.push(circuit);
            circuitNumber++;
          }
          
          // Start new circuit
          currentCircuitLoads = [load];
          currentCircuitLoad = loadWithFactor;
        } else {
          currentCircuitLoads.push(load);
          currentCircuitLoad += loadWithFactor;
        }
      }
    }

    // Add final circuit
    if (currentCircuitLoads.length > 0) {
      const circuit = this.addCircuit(
        panelId,
        `Lighting Circuit ${circuitNumber}`,
        currentCircuitLoads,
        voltage
      );
      circuits.push(circuit);
    }

    return circuits;
  }

  /**
   * Calculate voltage drop for all circuits
   */
  calculateVoltageDrops(): void {
    this.system.voltageDropCalculations = [];

    for (const panel of this.system.panels) {
      for (const circuit of panel.circuits) {
        const vd = this.calculateVoltageDrop(
          circuit.voltage,
          circuit.actualLoad,
          circuit.wire.length,
          circuit.wire.gauge
        );

        this.system.voltageDropCalculations.push({
          circuitId: circuit.id,
          length: circuit.wire.length,
          load: circuit.actualLoad,
          wireSize: circuit.wire.gauge,
          voltageDrop: vd.drop,
          percentDrop: vd.percent,
          acceptable: vd.percent <= 3 // NEC recommendation
        });
      }
    }
  }

  /**
   * Generate single-line diagram
   */
  generateSingleLineDiagram(): SingleLineDiagram {
    const diagram: SingleLineDiagram = {
      elements: [],
      connections: [],
      annotations: []
    };

    const yOffset = 100;

    // Add service entrance
    const serviceId = 'service-main';
    diagram.elements.push({
      id: serviceId,
      type: 'service',
      label: 'Utility Service',
      specs: `${this.system.service.utilityVoltage} ${this.system.service.serviceSize}A`,
      position: { x: 400, y: 50 },
      size: { width: 100, height: 50 }
    });

    // Add meter
    const meterId = 'meter-main';
    diagram.elements.push({
      id: meterId,
      type: 'meter',
      label: 'Main Meter',
      specs: `${this.system.service.serviceSize}A`,
      position: { x: 400, y: 150 },
      size: { width: 80, height: 80 }
    });

    diagram.connections.push({
      from: serviceId,
      to: meterId,
      wire: this.calculateFeederWire(this.system.service.serviceSize),
      conduit: '4"'
    });

    // Add panels
    let xOffset = 200;
    for (const panel of this.system.panels) {
      const panelY = panel.type === 'main' ? 300 : 450;
      
      diagram.elements.push({
        id: panel.id,
        type: 'panel',
        label: panel.name,
        specs: `${panel.specs.amperage}A ${panel.specs.voltage}`,
        position: { x: xOffset, y: panelY },
        size: { width: 150, height: 200 }
      });

      if (panel.type === 'main') {
        diagram.connections.push({
          from: meterId,
          to: panel.id,
          wire: this.calculateFeederWire(panel.specs.amperage),
          conduit: '3"'
        });
      } else if (panel.feeder) {
        diagram.connections.push({
          from: panel.feeder.fromPanel,
          to: panel.id,
          wire: panel.feeder.wire,
          conduit: panel.feeder.conduit,
          label: `${panel.feeder.breaker}A`
        });
      }

      xOffset += 200;
    }

    // Add load summary annotation
    diagram.annotations.push({
      type: 'note',
      text: `Total Connected Load: ${this.system.totalConnectedLoad.toFixed(0)}A\nDemand Load: ${this.system.totalDemandLoad.toFixed(0)}A`,
      position: { x: 50, y: 550 }
    });

    this.system.singleLineDiagram = diagram;
    return diagram;
  }

  /**
   * Generate detailed panel schedule for construction documents
   */
  generateDetailedPanelSchedule(panelId: string): DetailedPanelSchedule {
    const panel = this.system.panels.find(p => p.id === panelId);
    if (!panel) throw new Error('Panel not found');

    // Generate circuit-by-circuit schedule
    const circuitSchedule: CircuitScheduleEntry[] = [];
    
    panel.circuits.forEach((circuit, index) => {
      // Calculate wire and conduit fills
      const wireData = this.getWireData(circuit.wire.gauge);
      const conduitFill = this.calculateConduitFill(circuit);
      
      circuitSchedule.push({
        circuitNumber: circuit.number,
        phaseA: circuit.number % 3 === 1 ? circuit.actualLoad : 0,
        phaseB: circuit.number % 3 === 2 ? circuit.actualLoad : 0,
        phaseC: circuit.number % 3 === 0 ? circuit.actualLoad : 0,
        description: circuit.name,
        loadType: this.getLoadType(circuit),
        breaker: {
          amperage: circuit.breaker.amperage,
          poles: circuit.breaker.poles,
          type: circuit.breaker.type,
          manufacturer: 'Square D',
          catalog: `QO${circuit.breaker.amperage}`
        },
        wire: {
          size: circuit.wire.gauge,
          type: circuit.wire.type,
          conductors: circuit.wire.conductors,
          length: circuit.wire.length,
          voltageDrop: this.calculateCircuitVoltageDrop(circuit),
          ampacity: wireData.ampacity
        },
        conduit: {
          type: circuit.conduit.type,
          size: circuit.conduit.size,
          fill: conduitFill,
          length: circuit.wire.length
        },
        protection: {
          gfci: circuit.breaker.type === 'GFCI',
          afci: circuit.breaker.type === 'AFCI',
          surgeProtection: false
        },
        connectionDetails: {
          fromLug: this.getLugSize(circuit.actualLoad),
          toLug: this.getLugSize(circuit.actualLoad),
          torque: this.getTorqueSpec(circuit.wire.gauge)
        }
      });
    });

    // Calculate panel totals and load analysis
    const totalConnectedLoad = panel.circuits.reduce((sum, c) => sum + c.actualLoad, 0);
    const phaseLoads = this.calculatePhaseLoads(panel);
    const demandLoad = this.calculateDemandLoad(totalConnectedLoad, panel.circuits.length);
    
    return {
      panelId: panel.id,
      panelName: panel.name,
      panelType: panel.type,
      location: panel.location,
      specifications: {
        manufacturer: 'Square D',
        series: 'NF',
        catalog: `NF${panel.specs.amperage}ML`,
        mainBreaker: panel.specs.amperage,
        voltage: panel.specs.voltage,
        phase: panel.specs.phase,
        spaces: panel.specs.spaces,
        mounting: panel.specs.mounting,
        busRating: panel.specs.amperage,
        shortCircuitRating: '22,000A RMS',
        enclosure: 'NEMA 1'
      },
      feederInfo: panel.feeder ? {
        fromPanel: panel.feeder.fromPanel,
        breakerSize: panel.feeder.breaker,
        wireSize: panel.feeder.wire,
        conduitSize: panel.feeder.conduit,
        length: panel.feeder.length,
        voltageDrop: this.calculateFeederVoltageDrop(panel.feeder),
        ampacity: this.getWireData(panel.feeder.wire).ampacity
      } : undefined,
      circuitSchedule,
      loadSummary: {
        totalConnectedLoad,
        demandLoad,
        demandFactor: demandLoad / totalConnectedLoad,
        phaseALoad: phaseLoads.A,
        phaseBLoad: phaseLoads.B,
        phaseCLoad: phaseLoads.C,
        neutralLoad: Math.max(phaseLoads.A, phaseLoads.B, phaseLoads.C),
        loadBalance: this.calculateLoadBalance(phaseLoads),
        utilizationFactor: totalConnectedLoad / panel.specs.amperage,
        spareCapacity: panel.specs.amperage - demandLoad,
        spareCircuits: panel.specs.spaces - panel.circuits.length
      },
      nec2020Compliance: {
        article210: this.checkArticle210Compliance(panel),
        article220: this.checkArticle220Compliance(panel),
        article408: this.checkArticle408Compliance(panel),
        article240: this.checkArticle240Compliance(panel)
      }
    };
  }

  /**
   * Generate load schedule for all panels
   */
  generateLoadSchedule(): LoadScheduleEntry[] {
    const schedule: LoadScheduleEntry[] = [];

    for (const panel of this.system.panels) {
      for (const circuit of panel.circuits) {
        schedule.push({
          panel: panel.name,
          circuit: circuit.number,
          description: circuit.name,
          load: circuit.actualLoad,
          breaker: `${circuit.breaker.amperage}A ${circuit.breaker.poles}P`,
          wire: `${circuit.wire.gauge} ${circuit.wire.type}`,
          notes: circuit.percentLoad > 80 ? 'High Load' : 'OK'
        });
      }
    }

    this.system.loadSchedule = schedule;
    return schedule;
  }

  /**
   * Generate electrical specifications for construction documents
   */
  generateElectricalSpecifications(): ElectricalSpecifications {
    return {
      generalRequirements: {
        codes: ['2020 NEC', '2021 IBC', 'Local codes'],
        workmanship: 'NECA 1',
        testing: 'NETA ATS',
        warranty: '1 year parts and labor'
      },
      service: {
        utilityCoordination: 'Coordinate with local utility for service connection',
        meteringRequirements: 'Provide meter socket per utility requirements',
        grounding: 'Install grounding electrode system per NEC Article 250',
        bonding: 'Bond all metallic systems per NEC Article 250'
      },
      panelboards: {
        construction: 'Dead front safety switches, NEMA 1 enclosure',
        busRating: 'Minimum 10,000A short circuit rating',
        breakers: 'Molded case circuit breakers, 10,000A interrupting capacity',
        labeling: 'Engrave circuit directory with permanent labels'
      },
      wiring: {
        methods: 'EMT conduit with THWN-2 conductors',
        wireNuts: 'Listed wire connectors for all splices',
        boxes: 'Steel outlet boxes, minimum 4" square',
        supports: 'Support conduit per NEC Table 344.30(B)(2)'
      },
      installation: {
        rough: 'Install all conduit and boxes prior to drywall',
        trim: 'Install devices and fixtures after painting',
        testing: 'Test all circuits for continuity and proper operation',
        cleanup: 'Remove all construction debris and clean fixtures'
      },
      qualityControl: {
        inspection: 'Electrical contractor to inspect all work',
        testing: 'NETA qualified technician to perform acceptance testing',
        documentation: 'Provide as-built drawings and test reports',
        training: 'Train owner personnel on system operation'
      }
    };
  }

  /**
   * Private helper methods
   */
  private selectBreakerSize(load: number): number {
    const standardSizes = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200];
    for (const size of standardSizes) {
      if (size >= load) return size;
    }
    return 200; // Max standard size
  }

  private calculateWireSize(amperage: number, voltage: number, length: number): string {
    // Simplified wire sizing - in reality would use NEC tables
    const wireTable: Array<{ maxAmps: number; gauge: string }> = [
      { maxAmps: 15, gauge: '14 AWG' },
      { maxAmps: 20, gauge: '12 AWG' },
      { maxAmps: 30, gauge: '10 AWG' },
      { maxAmps: 40, gauge: '8 AWG' },
      { maxAmps: 55, gauge: '6 AWG' },
      { maxAmps: 70, gauge: '4 AWG' },
      { maxAmps: 85, gauge: '3 AWG' },
      { maxAmps: 95, gauge: '2 AWG' },
      { maxAmps: 110, gauge: '1 AWG' },
      { maxAmps: 125, gauge: '1/0 AWG' },
      { maxAmps: 145, gauge: '2/0 AWG' },
      { maxAmps: 165, gauge: '3/0 AWG' },
      { maxAmps: 195, gauge: '4/0 AWG' },
      { maxAmps: 215, gauge: '250 kcmil' },
      { maxAmps: 240, gauge: '300 kcmil' },
      { maxAmps: 260, gauge: '350 kcmil' },
      { maxAmps: 280, gauge: '400 kcmil' },
      { maxAmps: 320, gauge: '500 kcmil' }
    ];

    for (const entry of wireTable) {
      if (amperage <= entry.maxAmps) return entry.gauge;
    }
    return '500 kcmil';
  }

  private calculateConduitSize(amperage: number): string {
    // Simplified conduit sizing
    if (amperage <= 20) return '1/2"';
    if (amperage <= 30) return '3/4"';
    if (amperage <= 60) return '1"';
    if (amperage <= 100) return '1-1/4"';
    if (amperage <= 200) return '2"';
    if (amperage <= 400) return '3"';
    return '4"';
  }

  private calculateFeederWire(amperage: number): string {
    // For feeders, typically use larger wire for voltage drop
    return this.calculateWireSize(amperage * 1.25, 480, 200);
  }

  private calculateVoltageDrop(
    voltage: number,
    current: number,
    length: number,
    wireGauge: string
  ): { drop: number; percent: number } {
    // Simplified voltage drop calculation
    // In reality would use actual conductor resistance values
    const resistancePerFoot: Record<string, number> = {
      '12 AWG': 0.00193,
      '10 AWG': 0.00121,
      '8 AWG': 0.000764,
      '6 AWG': 0.000481,
      '4 AWG': 0.000303,
      '2 AWG': 0.000191,
      '1/0 AWG': 0.000095,
      '2/0 AWG': 0.000076
    };

    const resistance = resistancePerFoot[wireGauge] || 0.001;
    const totalResistance = resistance * length * 2; // Round trip
    const drop = current * totalResistance;
    const percent = (drop / voltage) * 100;

    return { drop, percent };
  }

  private updatePanelLoads(panelId: string): void {
    const panel = this.system.panels.find(p => p.id === panelId);
    if (!panel) return;

    // Calculate total connected load
    panel.totalLoad = panel.circuits.reduce((sum, circuit) => sum + circuit.actualLoad, 0);
    
    // Apply demand factors (simplified)
    let demandFactor = 1.0;
    if (panel.circuits.length > 10) demandFactor = 0.8;
    if (panel.circuits.length > 20) demandFactor = 0.7;
    
    panel.demandLoad = panel.totalLoad * demandFactor;
    panel.percentCapacity = (panel.demandLoad / panel.specs.amperage) * 100;

    // Update system totals
    this.system.totalConnectedLoad = this.system.panels.reduce((sum, p) => sum + p.totalLoad, 0);
    this.system.totalDemandLoad = this.system.panels.reduce((sum, p) => sum + p.demandLoad, 0);
  }

  /**
   * Helper methods for detailed panel schedule generation
   */
  private getWireData(gauge: string): { ampacity: number; resistance: number } {
    const wireData: Record<string, { ampacity: number; resistance: number }> = {
      '14 AWG': { ampacity: 15, resistance: 0.00193 },
      '12 AWG': { ampacity: 20, resistance: 0.00193 },
      '10 AWG': { ampacity: 30, resistance: 0.00121 },
      '8 AWG': { ampacity: 40, resistance: 0.000764 },
      '6 AWG': { ampacity: 55, resistance: 0.000481 },
      '4 AWG': { ampacity: 70, resistance: 0.000303 },
      '3 AWG': { ampacity: 85, resistance: 0.000241 },
      '2 AWG': { ampacity: 95, resistance: 0.000191 },
      '1 AWG': { ampacity: 110, resistance: 0.000152 },
      '1/0 AWG': { ampacity: 125, resistance: 0.000120 },
      '2/0 AWG': { ampacity: 145, resistance: 0.000095 },
      '3/0 AWG': { ampacity: 165, resistance: 0.000076 },
      '4/0 AWG': { ampacity: 195, resistance: 0.000060 }
    };
    return wireData[gauge] || { ampacity: 20, resistance: 0.002 };
  }

  private calculateConduitFill(circuit: Circuit): number {
    // Simplified conduit fill calculation
    const wireArea = this.getWireArea(circuit.wire.gauge);
    const totalWireArea = wireArea * circuit.wire.conductors;
    const conduitArea = this.getConduitArea(circuit.conduit.size);
    return (totalWireArea / conduitArea) * 100;
  }

  private getWireArea(gauge: string): number {
    const wireAreas: Record<string, number> = {
      '14 AWG': 0.0097,  // sq in
      '12 AWG': 0.0133,
      '10 AWG': 0.0211,
      '8 AWG': 0.0366,
      '6 AWG': 0.0507,
      '4 AWG': 0.0824,
      '3 AWG': 0.0973,
      '2 AWG': 0.1158,
      '1 AWG': 0.1562,
      '1/0 AWG': 0.1855,
      '2/0 AWG': 0.2223,
      '3/0 AWG': 0.2679,
      '4/0 AWG': 0.3237
    };
    return wireAreas[gauge] || 0.02;
  }

  private getConduitArea(size: string): number {
    const conduitAreas: Record<string, number> = {
      '1/2"': 0.304,  // sq in internal area
      '3/4"': 0.533,
      '1"': 0.864,
      '1-1/4"': 1.496,
      '1-1/2"': 2.036,
      '2"': 3.356,
      '2-1/2"': 5.858,
      '3"': 8.846,
      '4"': 15.205
    };
    return conduitAreas[size] || 1.0;
  }

  private getLoadType(circuit: Circuit): string {
    if (circuit.name.toLowerCase().includes('lighting')) return 'Lighting';
    if (circuit.name.toLowerCase().includes('receptacle')) return 'Receptacle';
    if (circuit.name.toLowerCase().includes('motor')) return 'Motor';
    if (circuit.name.toLowerCase().includes('hvac')) return 'HVAC';
    return 'General';
  }

  private calculateCircuitVoltageDrop(circuit: Circuit): number {
    const wireData = this.getWireData(circuit.wire.gauge);
    const resistance = wireData.resistance * circuit.wire.length * 2; // Round trip
    return circuit.actualLoad * resistance;
  }

  private calculateFeederVoltageDrop(feeder: any): number {
    const wireData = this.getWireData(feeder.wire);
    const resistance = wireData.resistance * feeder.length * 2;
    const current = feeder.breaker * 0.8; // Assume 80% load
    return current * resistance;
  }

  private calculatePhaseLoads(panel: Panel): { A: number; B: number; C: number } {
    const phaseLoads = { A: 0, B: 0, C: 0 };
    
    panel.circuits.forEach(circuit => {
      switch (circuit.number % 3) {
        case 1: phaseLoads.A += circuit.actualLoad; break;
        case 2: phaseLoads.B += circuit.actualLoad; break;
        case 0: phaseLoads.C += circuit.actualLoad; break;
      }
    });
    
    return phaseLoads;
  }

  private calculateDemandLoad(connectedLoad: number, circuitCount: number): number {
    // Apply demand factors per NEC Article 220
    let demandFactor = 1.0;
    
    if (circuitCount > 10) demandFactor = 0.85;
    if (circuitCount > 20) demandFactor = 0.75;
    if (circuitCount > 40) demandFactor = 0.65;
    
    return connectedLoad * demandFactor;
  }

  private calculateLoadBalance(phaseLoads: { A: number; B: number; C: number }): number {
    const max = Math.max(phaseLoads.A, phaseLoads.B, phaseLoads.C);
    const min = Math.min(phaseLoads.A, phaseLoads.B, phaseLoads.C);
    const avg = (phaseLoads.A + phaseLoads.B + phaseLoads.C) / 3;
    
    return avg > 0 ? ((max - min) / avg) * 100 : 0;
  }

  private getLugSize(load: number): string {
    if (load <= 15) return '#14-#10';
    if (load <= 30) return '#12-#8';
    if (load <= 60) return '#10-#4';
    if (load <= 100) return '#8-#2';
    return '#6-#4/0';
  }

  private getTorqueSpec(wireGauge: string): string {
    const torqueSpecs: Record<string, string> = {
      '14 AWG': '12 in-lb',
      '12 AWG': '12 in-lb',
      '10 AWG': '25 in-lb',
      '8 AWG': '25 in-lb',
      '6 AWG': '35 in-lb',
      '4 AWG': '35 in-lb',
      '3 AWG': '40 in-lb',
      '2 AWG': '40 in-lb',
      '1 AWG': '50 in-lb',
      '1/0 AWG': '50 in-lb'
    };
    return torqueSpecs[wireGauge] || '25 in-lb';
  }

  private checkArticle210Compliance(panel: Panel): ComplianceCheck {
    const notes: string[] = [];
    const requirements: string[] = [
      'Branch circuits shall not exceed 20A for lighting',
      'GFCI protection required in wet locations',
      'AFCI protection required for dwelling units'
    ];
    
    let compliant = true;
    
    panel.circuits.forEach(circuit => {
      if (this.getLoadType(circuit) === 'Lighting' && circuit.breaker.amperage > 20) {
        notes.push(`Circuit ${circuit.number}: Lighting circuit exceeds 20A`);
        compliant = false;
      }
    });
    
    return { compliant, notes, requirements };
  }

  private checkArticle220Compliance(panel: Panel): ComplianceCheck {
    const notes: string[] = [];
    const requirements: string[] = [
      'Load calculations per NEC Article 220',
      'Demand factors applied correctly',
      'Neutral load calculated properly'
    ];
    
    const totalLoad = panel.circuits.reduce((sum, c) => sum + c.actualLoad, 0);
    const demandLoad = this.calculateDemandLoad(totalLoad, panel.circuits.length);
    
    if (demandLoad > panel.specs.amperage * 0.8) {
      notes.push('Panel load exceeds 80% of rating');
    }
    
    return { 
      compliant: notes.length === 0, 
      notes, 
      requirements 
    };
  }

  private checkArticle408Compliance(panel: Panel): ComplianceCheck {
    const notes: string[] = [];
    const requirements: string[] = [
      'Panelboard rating shall exceed calculated load',
      'Circuit directory shall be provided',
      'Proper identification required'
    ];
    
    if (panel.circuits.length > panel.specs.spaces) {
      notes.push('Number of circuits exceeds panel spaces');
    }
    
    return { 
      compliant: notes.length === 0, 
      notes, 
      requirements 
    };
  }

  private checkArticle240Compliance(panel: Panel): ComplianceCheck {
    const notes: string[] = [];
    const requirements: string[] = [
      'Overcurrent protection per Article 240',
      'Breaker ratings match conductor ampacity',
      'Proper coordination maintained'
    ];
    
    panel.circuits.forEach(circuit => {
      const wireData = this.getWireData(circuit.wire.gauge);
      if (circuit.breaker.amperage > wireData.ampacity) {
        notes.push(`Circuit ${circuit.number}: Breaker exceeds wire ampacity`);
      }
    });
    
    return { 
      compliant: notes.length === 0, 
      notes, 
      requirements 
    };
  }

  /**
   * Export system design
   */
  exportDesign(): ElectricalSystem {
    this.calculateVoltageDrops();
    this.generateLoadSchedule();
    this.generateSingleLineDiagram();
    return this.system;
  }
}