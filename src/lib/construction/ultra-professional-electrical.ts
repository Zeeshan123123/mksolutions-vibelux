import { jsPDF } from 'jspdf';
import type { ElectricalSystem } from './electrical-system-designer';

/**
 * Ultra-Professional Electrical Drawing Module
 * Generates dense, detailed electrical plans matching industry standards
 */
export class UltraProfessionalElectrical {
  private pdf: jsPDF;
  
  // Electrical symbols library
  private readonly SYMBOLS = {
    DUPLEX_RECEPTACLE: (x: number, y: number) => {
      this.pdf.circle(x, y, 0.04);
      this.pdf.circle(x - 0.015, y, 0.008, 'F');
      this.pdf.circle(x + 0.015, y, 0.008, 'F');
    },
    QUAD_RECEPTACLE: (x: number, y: number) => {
      this.pdf.rect(x - 0.04, y - 0.04, 0.08, 0.08);
      this.pdf.circle(x - 0.02, y - 0.02, 0.006, 'F');
      this.pdf.circle(x + 0.02, y - 0.02, 0.006, 'F');
      this.pdf.circle(x - 0.02, y + 0.02, 0.006, 'F');
      this.pdf.circle(x + 0.02, y + 0.02, 0.006, 'F');
    },
    GFCI_RECEPTACLE: (x: number, y: number) => {
      this.pdf.rect(x - 0.04, y - 0.04, 0.08, 0.08);
      this.pdf.circle(x, y, 0.03);
      this.pdf.setFontSize(4);
      this.pdf.text('GFI', x, y, { align: 'center' });
    },
    DISCONNECT: (x: number, y: number) => {
      this.pdf.rect(x - 0.04, y - 0.04, 0.08, 0.08);
      this.pdf.line(x - 0.02, y - 0.02, x + 0.02, y + 0.02);
      this.pdf.line(x - 0.02, y + 0.02, x + 0.02, y - 0.02);
    },
    MOTOR: (x: number, y: number) => {
      this.pdf.circle(x, y, 0.05);
      this.pdf.setFontSize(6);
      this.pdf.text('M', x, y, { align: 'center' });
    },
    VFD: (x: number, y: number) => {
      this.pdf.rect(x - 0.05, y - 0.05, 0.1, 0.1);
      this.pdf.setFontSize(5);
      this.pdf.text('VFD', x, y, { align: 'center' });
    },
    TRANSFORMER: (x: number, y: number) => {
      this.pdf.circle(x, y - 0.03, 0.025);
      this.pdf.circle(x, y + 0.03, 0.025);
    },
    PANEL: (x: number, y: number, width: number = 0.3, height: number = 0.5) => {
      this.pdf.rect(x - width/2, y - height/2, width, height);
      this.pdf.setFillColor(50, 50, 50);
      this.pdf.rect(x - width/2 + 0.02, y - height/2 + 0.02, width - 0.04, height - 0.04, 'F');
      this.pdf.setFillColor(255, 255, 255);
    },
    LED_FIXTURE: (x: number, y: number, type: string = 'A') => {
      this.pdf.rect(x - 0.06, y - 0.03, 0.12, 0.06);
      this.pdf.setFontSize(5);
      this.pdf.text(type, x, y, { align: 'center' });
    },
    EMERGENCY_LIGHT: (x: number, y: number) => {
      this.pdf.rect(x - 0.04, y - 0.025, 0.08, 0.05, 'F');
      this.pdf.setFillColor(255, 0, 0);
      this.pdf.circle(x - 0.02, y, 0.01, 'F');
      this.pdf.circle(x + 0.02, y, 0.01, 'F');
      this.pdf.setFillColor(255, 255, 255);
    },
    EXIT_SIGN: (x: number, y: number) => {
      this.pdf.setFillColor(255, 0, 0);
      this.pdf.rect(x - 0.05, y - 0.025, 0.1, 0.05, 'F');
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.setFontSize(5);
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.text('EXIT', x, y, { align: 'center' });
      this.pdf.setTextColor(0, 0, 0);
    },
    JUNCTION_BOX: (x: number, y: number) => {
      this.pdf.rect(x - 0.03, y - 0.03, 0.06, 0.06);
      this.pdf.line(x - 0.02, y - 0.02, x + 0.02, y + 0.02);
      this.pdf.line(x - 0.02, y + 0.02, x + 0.02, y - 0.02);
    }
  };

  constructor(pdf: jsPDF) {
    this.pdf = pdf;
  }

  /**
   * Generate complete electrical plan
   */
  public generateElectricalPlan(electrical: ElectricalSystem, x: number, y: number): void {
    const scale = 1/96;
    const width = 144 * scale;
    const length = 480 * scale;
    
    // Layer 1: Building outline and grid
    this.drawBuildingOutline(x, y, length, width);
    
    // Layer 2: Electrical rooms and panels
    this.drawElectricalRooms(x, y, length, width, electrical);
    
    // Layer 3: Lighting layout with circuits
    this.drawCompleteLightingLayout(x, y, length, width, electrical);
    
    // Layer 4: Power receptacles and equipment
    this.drawPowerLayout(x, y, length, width, electrical);
    
    // Layer 5: Conduit and cable tray
    this.drawConduitLayout(x, y, length, width, electrical);
    
    // Layer 6: Emergency and life safety
    this.drawEmergencySystems(x, y, length, width);
    
    // Layer 7: Control and low voltage
    this.drawControlSystems(x, y, length, width);
    
    // Layer 8: Grounding system
    this.drawGroundingSystem(x, y, length, width);
    
    // Layer 9: Circuit identification
    this.drawCircuitIdentification(x, y, length, width, electrical);
    
    // Layer 10: Electrical notes and legend
    this.drawElectricalNotes(x + length + 0.5, y);
    this.drawElectricalLegend(x + length + 0.5, y + 8);
    this.drawPanelScheduleSummary(x + length + 0.5, y + 12);
  }

  /**
   * Draw building outline with column grid
   */
  private drawBuildingOutline(x: number, y: number, length: number, width: number): void {
    this.pdf.setLineWidth(0.016);
    this.pdf.rect(x, y, length, width);
    
    // Show column locations for coordination
    this.pdf.setLineWidth(0.004);
    this.pdf.setDrawColor(200, 200, 200);
    
    const baySpacing = 24 * (1/96);
    for (let i = 0; i <= Math.floor(length / baySpacing); i++) {
      for (let j = 0; j <= Math.floor(width / baySpacing); j++) {
        const colX = x + i * baySpacing;
        const colY = y + j * baySpacing;
        this.pdf.circle(colX, colY, 0.02);
      }
    }
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  /**
   * Draw electrical rooms and main distribution
   */
  private drawElectricalRooms(x: number, y: number, length: number, width: number, electrical: ElectricalSystem): void {
    // Main electrical room
    const elecRoomX = x + length - 1.5;
    const elecRoomY = y + width/2 - 1;
    
    this.pdf.setLineWidth(0.016);
    this.pdf.rect(elecRoomX, elecRoomY, 1.2, 2);
    
    // Hatch pattern for room
    this.pdf.setLineWidth(0.002);
    for (let i = 0; i < 60; i++) {
      const hatchX = elecRoomX + i * 0.02;
      if (hatchX < elecRoomX + 1.2) {
        this.pdf.line(hatchX, elecRoomY, hatchX, elecRoomY + 2);
      }
    }
    
    // Room label
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('MAIN ELEC', elecRoomX + 0.6, elecRoomY + 0.8, { align: 'center' });
    this.pdf.text('ROOM', elecRoomX + 0.6, elecRoomY + 1.0, { align: 'center' });
    
    // Main distribution panel
    this.SYMBOLS.PANEL(elecRoomX + 0.3, elecRoomY + 0.5, 0.4, 0.6);
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('MDP', elecRoomX + 0.3, elecRoomY + 0.5, { align: 'center' });
    this.pdf.setFontSize(6);
    this.pdf.text(`${electrical.serviceSize}A`, elecRoomX + 0.3, elecRoomY + 0.65, { align: 'center' });
    
    // Transformers
    this.SYMBOLS.TRANSFORMER(elecRoomX + 0.7, elecRoomY + 0.5);
    this.pdf.setFontSize(6);
    this.pdf.text('T-1', elecRoomX + 0.7, elecRoomY + 0.3);
    this.pdf.text('500KVA', elecRoomX + 0.7, elecRoomY + 0.7);
    
    // Distribution panels throughout building
    const panelLocations = [
      { x: x + length * 0.15, y: y + width + 0.3, name: 'LP-1' },
      { x: x + length * 0.35, y: y + width + 0.3, name: 'LP-2' },
      { x: x + length * 0.55, y: y + width + 0.3, name: 'LP-3' },
      { x: x + length * 0.75, y: y + width + 0.3, name: 'LP-4' },
      { x: x + length * 0.15, y: y - 0.5, name: 'PP-1' },
      { x: x + length * 0.55, y: y - 0.5, name: 'PP-2' }
    ];
    
    panelLocations.forEach(panel => {
      this.SYMBOLS.PANEL(panel.x, panel.y, 0.25, 0.4);
      this.pdf.setFontSize(7);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(panel.name, panel.x, panel.y, { align: 'center' });
      this.pdf.setFontSize(5);
      this.pdf.text('400A', panel.x, panel.y + 0.1, { align: 'center' });
    });
  }

  /**
   * Draw complete lighting layout
   */
  private drawCompleteLightingLayout(x: number, y: number, length: number, width: number, electrical: ElectricalSystem): void {
    // LED fixture grid - realistic density
    const fixtureSpacingX = 0.375; // 30' spacing = high density
    const fixtureSpacingY = 0.25;  // 20' spacing
    
    const fixtureTypes = ['A', 'B', 'C', 'D']; // Different fixture types
    let fixtureCount = 0;
    
    for (let row = 0; row < width / fixtureSpacingY - 1; row++) {
      for (let col = 0; col < length / fixtureSpacingX - 1; col++) {
        const fixtureX = x + (col + 1) * fixtureSpacingX;
        const fixtureY = y + (row + 1) * fixtureSpacingY;
        
        // Determine fixture type based on zone
        const zone = Math.floor(col / (length / fixtureSpacingX / 4));
        const fixtureType = fixtureTypes[zone % 4];
        
        // Draw fixture
        this.SYMBOLS.LED_FIXTURE(fixtureX, fixtureY, fixtureType);
        
        // Circuit number every 4th fixture
        if (fixtureCount % 4 === 0) {
          this.pdf.setFontSize(4);
          const circuit = `${Math.floor(zone) + 1}-${Math.floor(fixtureCount / 4) % 20 + 1}`;
          this.pdf.text(circuit, fixtureX, fixtureY + 0.05);
        }
        
        fixtureCount++;
      }
    }
    
    // Emergency lighting
    const emergSpacing = 1.5; // 120' spacing
    for (let i = 0; i < length / emergSpacing; i++) {
      for (let j = 0; j < 2; j++) {
        const emergX = x + (i + 0.5) * emergSpacing;
        const emergY = y + (j + 0.5) * width / 2;
        this.SYMBOLS.EMERGENCY_LIGHT(emergX, emergY);
        
        // Circuit tag
        this.pdf.setFontSize(4);
        this.pdf.text('EM', emergX, emergY + 0.04);
      }
    }
    
    // Exit signs at all doors
    const exitLocations = [
      { x: x, y: y + width/2 },
      { x: x + length, y: y + width/2 },
      { x: x + length/3, y: y },
      { x: x + 2*length/3, y: y },
      { x: x + length/3, y: y + width },
      { x: x + 2*length/3, y: y + width }
    ];
    
    exitLocations.forEach(loc => {
      this.SYMBOLS.EXIT_SIGN(loc.x, loc.y);
    });
  }

  /**
   * Draw power layout with receptacles and equipment
   */
  private drawPowerLayout(x: number, y: number, length: number, width: number, electrical: ElectricalSystem): void {
    // Perimeter receptacles
    const receptSpacing = 0.25; // 20' spacing per code
    
    // North wall
    for (let i = 0; i < length / receptSpacing; i++) {
      const recX = x + (i + 0.5) * receptSpacing;
      const recY = y - 0.1;
      this.SYMBOLS.DUPLEX_RECEPTACLE(recX, recY);
      
      // Circuit identification
      if (i % 4 === 0) {
        this.pdf.setFontSize(4);
        this.pdf.text(`PP-1-${Math.floor(i/4) + 1}`, recX + 0.05, recY);
      }
    }
    
    // South wall
    for (let i = 0; i < length / receptSpacing; i++) {
      const recX = x + (i + 0.5) * receptSpacing;
      const recY = y + width + 0.1;
      this.SYMBOLS.DUPLEX_RECEPTACLE(recX, recY);
      
      if (i % 4 === 0) {
        this.pdf.setFontSize(4);
        this.pdf.text(`PP-2-${Math.floor(i/4) + 1}`, recX + 0.05, recY);
      }
    }
    
    // Equipment connections
    const equipment = [
      { x: x + 2, y: y + 1, type: 'MOTOR', hp: '5HP', circuit: 'PP-1-15' },
      { x: x + 4, y: y + 1, type: 'VFD', hp: '10HP', circuit: 'PP-1-17' },
      { x: x + 6, y: y + 1, type: 'MOTOR', hp: '7.5HP', circuit: 'PP-1-19' },
      { x: x + 2, y: y + width - 1, type: 'DISCONNECT', rating: '60A', circuit: 'PP-2-15' }
    ];
    
    equipment.forEach(eq => {
      this.SYMBOLS[eq.type](eq.x, eq.y);
      this.pdf.setFontSize(5);
      this.pdf.text(eq.hp || eq.rating, eq.x, eq.y + 0.08);
      this.pdf.text(eq.circuit, eq.x, eq.y - 0.08);
    });
    
    // GFCI receptacles in wet areas
    const gfciLocations = [
      { x: x + 1, y: y + width/2 },
      { x: x + length - 1, y: y + width/2 },
      { x: x + length/2, y: y + 1 },
      { x: x + length/2, y: y + width - 1 }
    ];
    
    gfciLocations.forEach(loc => {
      this.SYMBOLS.GFCI_RECEPTACLE(loc.x, loc.y);
      this.pdf.setFontSize(4);
      this.pdf.text('WP', loc.x, loc.y + 0.06);
    });
  }

  /**
   * Draw conduit and cable tray layout
   */
  private drawConduitLayout(x: number, y: number, length: number, width: number, electrical: ElectricalSystem): void {
    this.pdf.setLineWidth(0.012);
    
    // Main feeders from electrical room
    const elecRoomX = x + length - 0.75;
    const elecRoomY = y + width/2;
    
    // Feeder conduits to panels
    this.pdf.setDrawColor(255, 0, 0);
    const panelX = [
      x + length * 0.15,
      x + length * 0.35,
      x + length * 0.55,
      x + length * 0.75
    ];
    
    panelX.forEach((pX, i) => {
      // Horizontal run
      this.pdf.line(elecRoomX, elecRoomY, elecRoomX, y + width + 0.5);
      this.pdf.line(elecRoomX, y + width + 0.5, pX, y + width + 0.5);
      // Drop to panel
      this.pdf.line(pX, y + width + 0.5, pX, y + width + 0.3);
      
      // Conduit size annotation
      this.pdf.setFontSize(5);
      this.pdf.text(`4-4"C`, pX + 0.05, y + width + 0.4);
    });
    
    // Cable tray for lighting circuits
    this.pdf.setDrawColor(0, 150, 0);
    this.pdf.setLineWidth(0.02);
    
    // Main cable tray runs
    this.pdf.line(x, y + 0.5, x + length, y + 0.5);
    this.pdf.line(x, y + width - 0.5, x + length, y + width - 0.5);
    
    // Cross trays
    for (let i = 1; i < 6; i++) {
      const trayX = x + i * (length / 6);
      this.pdf.line(trayX, y + 0.5, trayX, y + width - 0.5);
      
      // Tray size
      this.pdf.setFontSize(5);
      this.pdf.text('18"CT', trayX + 0.02, y + 0.45);
    }
    
    // Branch conduits from tray to fixtures (show samples)
    this.pdf.setLineWidth(0.004);
    this.pdf.setDrawColor(0, 100, 0);
    
    for (let i = 0; i < 5; i++) {
      const branchX = x + 1 + i * 0.5;
      this.pdf.line(branchX, y + 0.5, branchX, y + 1);
      this.pdf.text('¾"', branchX + 0.01, y + 0.75);
    }
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  /**
   * Draw emergency and life safety systems
   */
  private drawEmergencySystems(x: number, y: number, length: number, width: number): void {
    // Fire alarm devices
    const faDevices = [
      { type: 'PULL', x: x + 0.2, y: y + width/2, label: 'FS-1' },
      { type: 'PULL', x: x + length - 0.2, y: y + width/2, label: 'FS-2' },
      { type: 'HORN', x: x + length/3, y: y + 0.2, label: 'AV-1' },
      { type: 'HORN', x: x + 2*length/3, y: y + width - 0.2, label: 'AV-2' },
      { type: 'SMOKE', x: x + length/2, y: y + width/2, label: 'SD-1' }
    ];
    
    faDevices.forEach(device => {
      this.drawFireAlarmDevice(device.x, device.y, device.type);
      this.pdf.setFontSize(4);
      this.pdf.text(device.label, device.x + 0.05, device.y);
    });
    
    // Emergency panel
    const emergPanelX = x - 0.5;
    const emergPanelY = y + width/2;
    
    this.pdf.setFillColor(255, 100, 100);
    this.pdf.rect(emergPanelX - 0.15, emergPanelY - 0.2, 0.3, 0.4, 'F');
    this.pdf.setFillColor(255, 255, 255);
    
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('FACP', emergPanelX, emergPanelY - 0.05, { align: 'center' });
    this.pdf.text('FIRE', emergPanelX, emergPanelY + 0.05, { align: 'center' });
    this.pdf.text('ALARM', emergPanelX, emergPanelY + 0.15, { align: 'center' });
  }

  /**
   * Draw control and low voltage systems
   */
  private drawControlSystems(x: number, y: number, length: number, width: number): void {
    // Control panel location
    const ctrlPanelX = x + length - 0.3;
    const ctrlPanelY = y - 0.5;
    
    this.pdf.setFillColor(200, 200, 200);
    this.pdf.rect(ctrlPanelX - 0.2, ctrlPanelY - 0.15, 0.4, 0.3, 'F');
    this.pdf.setFillColor(255, 255, 255);
    
    this.pdf.setFontSize(6);
    this.pdf.text('BAS', ctrlPanelX, ctrlPanelY, { align: 'center' });
    this.pdf.text('PANEL', ctrlPanelX, ctrlPanelY + 0.1, { align: 'center' });
    
    // Control wiring (dashed lines)
    this.pdf.setLineWidth(0.004);
    this.pdf.setLineDashPattern([0.05, 0.05], 0);
    this.pdf.setDrawColor(255, 0, 255);
    
    // To lighting zones
    for (let i = 0; i < 4; i++) {
      const zoneX = x + (i + 0.5) * (length / 4);
      this.pdf.line(ctrlPanelX, ctrlPanelY, zoneX, y + 0.5);
      
      // Control device
      this.pdf.circle(zoneX, y + 0.5, 0.03);
      this.pdf.setFontSize(4);
      this.pdf.text(`LC-${i + 1}`, zoneX, y + 0.4);
    }
    
    this.pdf.setLineDashPattern([], 0);
    this.pdf.setDrawColor(0, 0, 0);
  }

  /**
   * Draw grounding system
   */
  private drawGroundingSystem(x: number, y: number, length: number, width: number): void {
    // Ground ring around building
    this.pdf.setLineWidth(0.008);
    this.pdf.setDrawColor(0, 200, 0);
    this.pdf.setLineDashPattern([0.1, 0.1], 0);
    
    this.pdf.rect(x - 0.2, y - 0.2, length + 0.4, width + 0.4);
    
    // Ground rods
    const groundRods = [
      { x: x, y: y },
      { x: x + length, y: y },
      { x: x, y: y + width },
      { x: x + length, y: y + width },
      { x: x + length/2, y: y },
      { x: x + length/2, y: y + width }
    ];
    
    groundRods.forEach((rod, i) => {
      this.pdf.circle(rod.x, rod.y, 0.04);
      this.pdf.setFontSize(5);
      this.pdf.text(`GR-${i + 1}`, rod.x + 0.05, rod.y);
    });
    
    this.pdf.setLineDashPattern([], 0);
    this.pdf.setDrawColor(0, 0, 0);
  }

  /**
   * Draw circuit identification
   */
  private drawCircuitIdentification(x: number, y: number, length: number, width: number, electrical: ElectricalSystem): void {
    // Home run arrows
    this.pdf.setLineWidth(0.004);
    
    // Sample home runs from zones to panels
    const zones = 4;
    for (let i = 0; i < zones; i++) {
      const zoneX = x + (i + 0.5) * (length / zones);
      const panelX = x + length * (0.15 + i * 0.2);
      const panelY = y + width + 0.3;
      
      // Draw home run
      this.pdf.setLineDashPattern([0.1, 0.05], 0);
      this.pdf.line(zoneX, y + width - 0.5, panelX, panelY);
      
      // Arrow
      this.drawArrowHead(panelX, panelY, 'up');
      
      // Circuit count
      this.pdf.setFontSize(5);
      this.pdf.text(`(12)#12`, zoneX, y + width - 0.6);
    }
    
    this.pdf.setLineDashPattern([], 0);
  }

  /**
   * Draw fire alarm device
   */
  private drawFireAlarmDevice(x: number, y: number, type: string): void {
    this.pdf.setFillColor(255, 0, 0);
    
    switch(type) {
      case 'PULL':
        this.pdf.rect(x - 0.03, y - 0.03, 0.06, 0.06, 'F');
        this.pdf.setFillColor(255, 255, 255);
        this.pdf.setFontSize(4);
        this.pdf.text('P', x, y, { align: 'center' });
        break;
      case 'HORN':
        this.pdf.circle(x, y, 0.04, 'F');
        this.pdf.setFillColor(255, 255, 255);
        this.pdf.text('H/S', x, y, { align: 'center' });
        break;
      case 'SMOKE':
        this.pdf.circle(x, y, 0.04);
        this.pdf.text('S', x, y, { align: 'center' });
        break;
    }
    
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setTextColor(0, 0, 0);
  }

  /**
   * Draw arrow head
   */
  private drawArrowHead(x: number, y: number, direction: string): void {
    const size = 0.05;
    
    switch(direction) {
      case 'up':
        this.pdf.line(x, y, x - size/2, y + size);
        this.pdf.line(x, y, x + size/2, y + size);
        break;
      // Add other directions as needed
    }
  }

  /**
   * Draw electrical notes
   */
  private drawElectricalNotes(x: number, y: number): void {
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('ELECTRICAL NOTES:', x, y);
    
    const notes = [
      '1. ALL WORK SHALL COMPLY WITH NEC 2020 AND LOCAL CODES.',
      '2. PROVIDE GFCI PROTECTION PER NEC 210.8 REQUIREMENTS.',
      '3. MAINTAIN 3% VOLTAGE DROP ON BRANCH CIRCUITS.',
      '4. ALL FIXTURES SHALL BE SUITABLE FOR WET LOCATIONS.',
      '5. PROVIDE SURGE PROTECTION AT ALL PANELS.',
      '6. EMERGENCY LIGHTING SHALL HAVE 90-MIN BATTERY.',
      '7. COORDINATE ALL PENETRATIONS WITH STRUCTURAL.',
      '8. ALL CONDUIT IN GREENHOUSE SHALL BE PVC SCH 40.',
      '9. PROVIDE EQUIPMENT GROUNDING PER NEC 250.',
      '10. LIGHTING CONTROLS SHALL INTEGRATE WITH BAS.'
    ];
    
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'normal');
    notes.forEach((note, i) => {
      this.pdf.text(note, x, y + 0.3 + i * 0.15);
    });
  }

  /**
   * Draw electrical legend
   */
  private drawElectricalLegend(x: number, y: number): void {
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('ELECTRICAL LEGEND:', x, y);
    
    const items = [
      { symbol: () => this.SYMBOLS.DUPLEX_RECEPTACLE(x, y + 0.5), desc: 'DUPLEX RECEPTACLE' },
      { symbol: () => this.SYMBOLS.GFCI_RECEPTACLE(x, y + 0.8), desc: 'GFCI RECEPTACLE' },
      { symbol: () => this.SYMBOLS.LED_FIXTURE(x, y + 1.1, 'A'), desc: 'LED FIXTURE TYPE A' },
      { symbol: () => this.SYMBOLS.EMERGENCY_LIGHT(x, y + 1.4), desc: 'EMERGENCY LIGHT' },
      { symbol: () => this.SYMBOLS.EXIT_SIGN(x, y + 1.7), desc: 'EXIT SIGN' },
      { symbol: () => this.SYMBOLS.JUNCTION_BOX(x, y + 2.0), desc: 'JUNCTION BOX' }
    ];
    
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'normal');
    
    items.forEach((item, i) => {
      item.symbol();
      this.pdf.text(item.desc, x + 0.3, y + 0.5 + i * 0.3);
    });
  }

  /**
   * Draw panel schedule summary
   */
  private drawPanelScheduleSummary(x: number, y: number): void {
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PANEL SUMMARY:', x, y);
    
    const panels = [
      { name: 'MDP', voltage: '480/277V', amps: '3000A', kva: '2250' },
      { name: 'LP-1', voltage: '277V', amps: '400A', kva: '111' },
      { name: 'LP-2', voltage: '277V', amps: '400A', kva: '111' },
      { name: 'LP-3', voltage: '277V', amps: '400A', kva: '111' },
      { name: 'LP-4', voltage: '277V', amps: '400A', kva: '111' },
      { name: 'PP-1', voltage: '480V', amps: '200A', kva: '166' },
      { name: 'PP-2', voltage: '480V', amps: '200A', kva: '166' }
    ];
    
    // Table headers
    this.pdf.setFontSize(6);
    this.pdf.text('PANEL', x, y + 0.3);
    this.pdf.text('VOLTAGE', x + 0.5, y + 0.3);
    this.pdf.text('AMPS', x + 1.0, y + 0.3);
    this.pdf.text('KVA', x + 1.4, y + 0.3);
    
    // Table data
    this.pdf.setFont('helvetica', 'normal');
    panels.forEach((panel, i) => {
      const rowY = y + 0.5 + i * 0.15;
      this.pdf.text(panel.name, x, rowY);
      this.pdf.text(panel.voltage, x + 0.5, rowY);
      this.pdf.text(panel.amps, x + 1.0, rowY);
      this.pdf.text(panel.kva, x + 1.4, rowY);
    });
  }
}