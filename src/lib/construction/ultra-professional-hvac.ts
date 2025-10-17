import { jsPDF } from 'jspdf';
import type { HVACDesignSystem } from '../hvac/hvac-construction-designer';

/**
 * Ultra-Professional HVAC Drawing Module
 * Generates dense, detailed HVAC plans with full ductwork, piping, and equipment
 */
export class UltraProfessionalHVAC {
  private pdf: jsPDF;
  
  // HVAC symbols library
  private readonly SYMBOLS = {
    AHU: (x: number, y: number, size: number = 0.5) => {
      // Detailed AHU representation
      this.pdf.rect(x - size/2, y - size/3, size, size*2/3);
      
      // Fan wheel
      this.pdf.circle(x - size/4, y, size/6);
      for (let angle = 0; angle < 360; angle += 45) {
        const rad = angle * Math.PI / 180;
        const x1 = x - size/4 + Math.cos(rad) * size/8;
        const y1 = y + Math.sin(rad) * size/8;
        this.pdf.line(x - size/4, y, x1, y1);
      }
      
      // Coils
      this.pdf.rect(x, y - size/4, size/6, size/2);
      for (let i = 0; i < 4; i++) {
        this.pdf.line(x, y - size/4 + i * size/8, x + size/6, y - size/4 + i * size/8);
      }
      
      // Filters
      this.pdf.rect(x - size/3, y - size/4, size/12, size/2);
      this.pdf.line(x - size/3, y - size/4, x - size/3 + size/12, y + size/4);
    },
    
    CHILLER: (x: number, y: number, tons: number) => {
      const size = 0.6;
      this.pdf.rect(x - size/2, y - size/3, size, size*2/3);
      
      // Evaporator
      this.pdf.circle(x - size/3, y, size/6);
      // Compressor
      this.pdf.rect(x - size/12, y - size/6, size/6, size/3);
      // Condenser
      this.pdf.circle(x + size/3, y, size/6);
      
      // Connecting lines
      this.pdf.line(x - size/6, y, x + size/6, y);
    },
    
    BOILER: (x: number, y: number) => {
      const size = 0.5;
      this.pdf.rect(x - size/2, y - size/2, size, size);
      
      // Burner symbol
      this.pdf.rect(x - size/3, y + size/3, size*2/3, size/6);
      
      // Tubes representation
      for (let i = 0; i < 3; i++) {
        this.pdf.line(x - size/3, y - size/3 + i * size/3, x + size/3, y - size/3 + i * size/3);
      }
    },
    
    PUMP: (x: number, y: number) => {
      this.pdf.circle(x, y, 0.06);
      this.pdf.circle(x, y, 0.04, 'F');
      
      // Impeller
      this.pdf.line(x - 0.03, y - 0.03, x + 0.03, y + 0.03);
      this.pdf.line(x - 0.03, y + 0.03, x + 0.03, y - 0.03);
    },
    
    FAN: (x: number, y: number, size: number = 0.1) => {
      this.pdf.circle(x, y, size);
      // Fan blades
      for (let angle = 0; angle < 360; angle += 60) {
        const rad = angle * Math.PI / 180;
        const x1 = x + Math.cos(rad) * size * 0.8;
        const y1 = y + Math.sin(rad) * size * 0.8;
        this.pdf.line(x, y, x1, y1);
        
        // Blade curve
        const x2 = x + Math.cos(rad + 20 * Math.PI / 180) * size * 0.9;
        const y2 = y + Math.sin(rad + 20 * Math.PI / 180) * size * 0.9;
        this.pdf.line(x1, y1, x2, y2);
      }
    },
    
    VAV: (x: number, y: number) => {
      this.pdf.rect(x - 0.08, y - 0.05, 0.16, 0.1);
      // Damper blade
      this.pdf.line(x - 0.06, y, x + 0.06, y);
      // Actuator
      this.pdf.circle(x, y - 0.05, 0.02);
    },
    
    DIFFUSER: (x: number, y: number, type: string = 'square') => {
      if (type === 'square') {
        this.pdf.rect(x - 0.04, y - 0.04, 0.08, 0.08);
        // Four-way throw
        this.pdf.line(x - 0.03, y, x + 0.03, y);
        this.pdf.line(x, y - 0.03, x, y + 0.03);
        this.pdf.line(x - 0.02, y - 0.02, x + 0.02, y + 0.02);
        this.pdf.line(x - 0.02, y + 0.02, x + 0.02, y - 0.02);
      } else if (type === 'linear') {
        this.pdf.rect(x - 0.06, y - 0.02, 0.12, 0.04);
        for (let i = 0; i < 4; i++) {
          this.pdf.line(x - 0.05 + i * 0.03, y - 0.015, x - 0.05 + i * 0.03, y + 0.015);
        }
      }
    },
    
    GRILLE: (x: number, y: number, type: string = 'return') => {
      this.pdf.rect(x - 0.05, y - 0.03, 0.1, 0.06);
      // Louvers
      for (let i = 0; i < 4; i++) {
        this.pdf.line(x - 0.04, y - 0.02 + i * 0.015, x + 0.04, y - 0.02 + i * 0.015);
      }
    },
    
    THERMOSTAT: (x: number, y: number) => {
      this.pdf.rect(x - 0.03, y - 0.03, 0.06, 0.06);
      this.pdf.circle(x, y, 0.02);
      this.pdf.setFontSize(4);
      this.pdf.text('T', x, y, { align: 'center' });
    },
    
    HUMIDISTAT: (x: number, y: number) => {
      this.pdf.rect(x - 0.03, y - 0.03, 0.06, 0.06);
      this.pdf.circle(x, y, 0.02);
      this.pdf.setFontSize(4);
      this.pdf.text('H', x, y, { align: 'center' });
    }
  };

  constructor(pdf: jsPDF) {
    this.pdf = pdf;
  }

  /**
   * Generate complete HVAC plan
   */
  public generateHVACPlan(hvac: HVACDesignSystem, x: number, y: number): void {
    const scale = 1/96;
    const width = 144 * scale;
    const length = 480 * scale;
    
    // Layer 1: Building outline
    this.drawBuildingOutline(x, y, length, width);
    
    // Layer 2: HVAC zones
    this.drawHVACZones(x, y, length, width);
    
    // Layer 3: Major equipment
    this.drawMajorEquipment(x, y, length, width, hvac);
    
    // Layer 4: Air handling units
    this.drawAirHandlingUnits(x, y, length, width, hvac);
    
    // Layer 5: Ductwork system
    this.drawDuctworkSystem(x, y, length, width);
    
    // Layer 6: Piping systems
    this.drawPipingSystems(x, y, length, width);
    
    // Layer 7: Air distribution devices
    this.drawAirDistribution(x, y, length, width);
    
    // Layer 8: Controls and sensors
    this.drawControlsAndSensors(x, y, length, width);
    
    // Layer 9: Exhaust systems
    this.drawExhaustSystems(x, y, length, width);
    
    // Notes and schedules
    this.drawHVACNotes(x + length + 0.5, y);
    this.drawHVACLegend(x + length + 0.5, y + 8);
    this.drawEquipmentSchedule(x + length + 0.5, y + 14);
  }

  /**
   * Draw building outline
   */
  private drawBuildingOutline(x: number, y: number, length: number, width: number): void {
    this.pdf.setLineWidth(0.016);
    this.pdf.rect(x, y, length, width);
    
    // Show structural grid for coordination
    this.pdf.setLineWidth(0.004);
    this.pdf.setDrawColor(200, 200, 200);
    
    const baySpacing = 24 * (1/96);
    for (let i = 0; i <= Math.floor(length / baySpacing); i++) {
      this.pdf.line(x + i * baySpacing, y, x + i * baySpacing, y + width);
    }
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  /**
   * Draw HVAC zones with detailed information
   */
  private drawHVACZones(x: number, y: number, length: number, width: number): void {
    this.pdf.setLineWidth(0.008);
    this.pdf.setDrawColor(0, 0, 255);
    this.pdf.setLineDashPattern([0.1, 0.05], 0);
    
    // Divide into 6 zones
    const zoneCount = 6;
    const zoneWidth = length / zoneCount;
    
    for (let i = 1; i < zoneCount; i++) {
      const zoneX = x + i * zoneWidth;
      this.pdf.line(zoneX, y, zoneX, y + width);
    }
    
    // Zone labels with conditions
    this.pdf.setLineDashPattern([], 0);
    this.pdf.setDrawColor(0, 0, 0);
    
    for (let i = 0; i < zoneCount; i++) {
      const zoneX = x + (i + 0.5) * zoneWidth;
      const zoneY = y + width / 2;
      
      // Zone box
      this.pdf.setFillColor(240, 240, 255);
      this.pdf.rect(zoneX - 0.4, zoneY - 0.3, 0.8, 0.6, 'FD');
      this.pdf.setFillColor(255, 255, 255);
      
      // Zone information
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`ZONE ${i + 1}`, zoneX, zoneY - 0.1, { align: 'center' });
      
      this.pdf.setFontSize(7);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text('75°F ± 2°F', zoneX, zoneY + 0.05, { align: 'center' });
      this.pdf.text('60% RH ± 5%', zoneX, zoneY + 0.15, { align: 'center' });
      this.pdf.text(`${Math.round(7200 / zoneCount)} CFM`, zoneX, zoneY + 0.25, { align: 'center' });
    }
  }

  /**
   * Draw major mechanical equipment
   */
  private drawMajorEquipment(x: number, y: number, length: number, width: number, hvac: HVACDesignSystem): void {
    // Mechanical room
    const mechRoomX = x - 1.5;
    const mechRoomY = y + width/2 - 1.5;
    
    this.pdf.setLineWidth(0.016);
    this.pdf.rect(mechRoomX, mechRoomY, 1.2, 3);
    
    // Room label
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('MECH', mechRoomX + 0.6, mechRoomY + 1.3, { align: 'center' });
    this.pdf.text('ROOM', mechRoomX + 0.6, mechRoomY + 1.5, { align: 'center' });
    
    // Chiller
    this.SYMBOLS.CHILLER(mechRoomX + 0.6, mechRoomY + 0.5, 150);
    this.pdf.setFontSize(8);
    this.pdf.text('CH-1', mechRoomX + 0.6, mechRoomY + 0.2, { align: 'center' });
    this.pdf.setFontSize(6);
    this.pdf.text('150 TON', mechRoomX + 0.6, mechRoomY + 0.8, { align: 'center' });
    
    // Boiler
    this.SYMBOLS.BOILER(mechRoomX + 0.6, mechRoomY + 2.5);
    this.pdf.setFontSize(8);
    this.pdf.text('B-1', mechRoomX + 0.6, mechRoomY + 2.2, { align: 'center' });
    this.pdf.setFontSize(6);
    this.pdf.text('2000 MBH', mechRoomX + 0.6, mechRoomY + 2.9, { align: 'center' });
    
    // Pumps
    this.SYMBOLS.PUMP(mechRoomX + 0.2, mechRoomY + 1.2);
    this.pdf.setFontSize(5);
    this.pdf.text('CWP-1', mechRoomX + 0.2, mechRoomY + 1.1);
    
    this.SYMBOLS.PUMP(mechRoomX + 0.2, mechRoomY + 1.5);
    this.pdf.text('CWP-2', mechRoomX + 0.2, mechRoomY + 1.4);
    
    this.SYMBOLS.PUMP(mechRoomX + 0.2, mechRoomY + 2.2);
    this.pdf.text('HWP-1', mechRoomX + 0.2, mechRoomY + 2.1);
  }

  /**
   * Draw air handling units throughout building
   */
  private drawAirHandlingUnits(x: number, y: number, length: number, width: number, hvac: HVACDesignSystem): void {
    const zoneCount = 6;
    const zoneWidth = length / zoneCount;
    
    for (let i = 0; i < zoneCount; i++) {
      const ahuX = x + (i + 0.5) * zoneWidth;
      const ahuY = y + width * 0.15;
      
      // Draw detailed AHU
      this.SYMBOLS.AHU(ahuX, ahuY, 0.4);
      
      // AHU label
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`AHU-${i + 1}`, ahuX, ahuY - 0.3, { align: 'center' });
      
      this.pdf.setFontSize(6);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text('25 TON', ahuX, ahuY + 0.3, { align: 'center' });
      this.pdf.text('10,000 CFM', ahuX, ahuY + 0.4, { align: 'center' });
      
      // Supply/return connections
      this.pdf.setLineWidth(0.02);
      this.pdf.setDrawColor(255, 0, 0); // Supply
      this.pdf.line(ahuX + 0.2, ahuY, ahuX + 0.4, ahuY);
      
      this.pdf.setDrawColor(0, 0, 255); // Return
      this.pdf.line(ahuX - 0.2, ahuY, ahuX - 0.4, ahuY);
      
      this.pdf.setDrawColor(0, 0, 0);
    }
  }

  /**
   * Draw complete ductwork system
   */
  private drawDuctworkSystem(x: number, y: number, length: number, width: number): void {
    // Main supply ducts
    this.pdf.setLineWidth(0.024);
    this.pdf.setDrawColor(255, 0, 0);
    
    // Primary supply headers
    this.pdf.line(x, y + width * 0.25, x + length, y + width * 0.25);
    this.pdf.line(x, y + width * 0.75, x + length, y + width * 0.75);
    
    // Duct size annotations
    this.pdf.setFontSize(7);
    this.pdf.text('60"×30" SA', x + length/2, y + width * 0.23);
    this.pdf.text('60"×30" SA', x + length/2, y + width * 0.73);
    
    // Branch ducts
    this.pdf.setLineWidth(0.016);
    const branchSpacing = 0.5; // 40' spacing
    
    for (let i = 0; i < length / branchSpacing; i++) {
      const branchX = x + (i + 0.5) * branchSpacing;
      
      // North branches
      this.pdf.line(branchX, y + width * 0.25, branchX, y);
      this.pdf.setFontSize(5);
      this.pdf.text('24"×12"', branchX + 0.02, y + width * 0.12, { angle: 90 });
      
      // South branches
      this.pdf.line(branchX, y + width * 0.75, branchX, y + width);
      this.pdf.text('24"×12"', branchX + 0.02, y + width * 0.88, { angle: 90 });
      
      // Cross branches
      if (i % 3 === 0) {
        this.pdf.line(branchX, y + width * 0.25, branchX, y + width * 0.75);
        this.pdf.text('36"×18"', branchX + 0.02, y + width * 0.5);
      }
    }
    
    // Return air ducts
    this.pdf.setLineWidth(0.024);
    this.pdf.setDrawColor(0, 0, 255);
    
    // Main returns
    this.pdf.line(x, y + width * 0.35, x + length, y + width * 0.35);
    this.pdf.line(x, y + width * 0.65, x + length, y + width * 0.65);
    
    this.pdf.setFontSize(7);
    this.pdf.text('48"×24" RA', x + length/2, y + width * 0.33);
    this.pdf.text('48"×24" RA', x + length/2, y + width * 0.63);
    
    // VAV boxes
    this.pdf.setDrawColor(0, 0, 0);
    const vavSpacing = 1.0; // 80' spacing
    
    for (let i = 0; i < length / vavSpacing; i++) {
      const vavX = x + (i + 0.5) * vavSpacing;
      
      // North zone VAVs
      this.SYMBOLS.VAV(vavX, y + width * 0.15);
      this.pdf.setFontSize(5);
      this.pdf.text(`VAV-N${i + 1}`, vavX, y + width * 0.1);
      this.pdf.text('800 CFM', vavX, y + width * 0.22);
      
      // South zone VAVs
      this.SYMBOLS.VAV(vavX, y + width * 0.85);
      this.pdf.text(`VAV-S${i + 1}`, vavX, y + width * 0.8);
      this.pdf.text('800 CFM', vavX, y + width * 0.92);
    }
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  /**
   * Draw piping systems
   */
  private drawPipingSystems(x: number, y: number, length: number, width: number): void {
    // Chilled water piping
    this.pdf.setLineWidth(0.016);
    this.pdf.setDrawColor(0, 0, 255);
    
    // Main headers from mechanical room
    const mechRoomX = x - 0.5;
    const mechRoomY = y + width/2;
    
    // Chilled water supply
    this.pdf.setLineDashPattern([0.15, 0.05], 0);
    this.pdf.line(mechRoomX, mechRoomY - 0.3, x + length, mechRoomY - 0.3);
    this.pdf.setFontSize(6);
    this.pdf.text('6" CWS', x + 0.5, mechRoomY - 0.35);
    
    // Chilled water return
    this.pdf.setLineDashPattern([0.08, 0.08], 0);
    this.pdf.line(mechRoomX, mechRoomY - 0.4, x + length, mechRoomY - 0.4);
    this.pdf.text('6" CWR', x + 0.5, mechRoomY - 0.45);
    
    // Hot water piping
    this.pdf.setDrawColor(255, 0, 0);
    
    // Hot water supply
    this.pdf.setLineDashPattern([0.15, 0.05], 0);
    this.pdf.line(mechRoomX, mechRoomY + 0.3, x + length, mechRoomY + 0.3);
    this.pdf.text('4" HWS', x + 0.5, mechRoomY + 0.25);
    
    // Hot water return
    this.pdf.setLineDashPattern([0.08, 0.08], 0);
    this.pdf.line(mechRoomX, mechRoomY + 0.4, x + length, mechRoomY + 0.4);
    this.pdf.text('4" HWR', x + 0.5, mechRoomY + 0.45);
    
    this.pdf.setLineDashPattern([], 0);
    
    // Connections to AHUs
    const zoneCount = 6;
    const zoneWidth = length / zoneCount;
    
    for (let i = 0; i < zoneCount; i++) {
      const ahuX = x + (i + 0.5) * zoneWidth;
      const ahuY = y + width * 0.15;
      
      // CW connections
      this.pdf.setDrawColor(0, 0, 255);
      this.pdf.line(ahuX, mechRoomY - 0.3, ahuX, ahuY);
      this.pdf.text('2"', ahuX + 0.02, ahuY + 0.5);
      
      // HW connections
      this.pdf.setDrawColor(255, 0, 0);
      this.pdf.line(ahuX + 0.1, mechRoomY + 0.3, ahuX + 0.1, ahuY);
      this.pdf.text('1½"', ahuX + 0.12, ahuY + 0.5);
    }
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  /**
   * Draw air distribution devices
   */
  private drawAirDistribution(x: number, y: number, length: number, width: number): void {
    // Supply diffusers
    const diffuserSpacingX = 0.3; // 24' spacing
    const diffuserSpacingY = 0.3;
    
    for (let row = 0; row < width / diffuserSpacingY - 1; row++) {
      for (let col = 0; col < length / diffuserSpacingX - 1; col++) {
        const diffX = x + (col + 1) * diffuserSpacingX;
        const diffY = y + (row + 1) * diffuserSpacingY;
        
        // Alternate between square and linear diffusers
        if (row % 2 === 0) {
          this.SYMBOLS.DIFFUSER(diffX, diffY, 'square');
          
          // CFM annotation every 3rd
          if (col % 3 === 0) {
            this.pdf.setFontSize(4);
            this.pdf.text('425', diffX + 0.05, diffY);
          }
        } else {
          this.SYMBOLS.DIFFUSER(diffX, diffY, 'linear');
          
          if (col % 3 === 0) {
            this.pdf.setFontSize(4);
            this.pdf.text('L-600', diffX + 0.08, diffY);
          }
        }
      }
    }
    
    // Return grilles
    const returnSpacing = 1.2; // 96' spacing
    
    for (let i = 0; i < length / returnSpacing; i++) {
      const returnX = x + (i + 0.5) * returnSpacing;
      
      // North wall returns
      this.SYMBOLS.GRILLE(returnX, y + 0.1, 'return');
      this.pdf.setFontSize(5);
      this.pdf.text('48"×24"', returnX, y + 0.05);
      this.pdf.text('2400 CFM', returnX, y + 0.18);
      
      // South wall returns
      this.SYMBOLS.GRILLE(returnX, y + width - 0.1, 'return');
      this.pdf.text('48"×24"', returnX, y + width - 0.15);
      this.pdf.text('2400 CFM', returnX, y + width - 0.02);
    }
  }

  /**
   * Draw controls and sensors
   */
  private drawControlsAndSensors(x: number, y: number, length: number, width: number): void {
    const zoneCount = 6;
    const zoneWidth = length / zoneCount;
    
    // DDC panel
    const ddcX = x + length - 0.5;
    const ddcY = y - 0.5;
    
    this.pdf.setFillColor(200, 200, 200);
    this.pdf.rect(ddcX - 0.2, ddcY - 0.15, 0.4, 0.3, 'F');
    this.pdf.setFillColor(255, 255, 255);
    
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('DDC-1', ddcX, ddcY, { align: 'center' });
    this.pdf.text('BAS PANEL', ddcX, ddcY + 0.1, { align: 'center' });
    
    // Zone sensors
    for (let i = 0; i < zoneCount; i++) {
      const zoneX = x + (i + 0.5) * zoneWidth;
      const zoneY = y + width / 2;
      
      // Temperature sensor
      this.SYMBOLS.THERMOSTAT(zoneX - 0.1, zoneY);
      this.pdf.setFontSize(5);
      this.pdf.text(`ZT-${i + 1}`, zoneX - 0.1, zoneY - 0.05);
      
      // Humidity sensor
      this.SYMBOLS.HUMIDISTAT(zoneX + 0.1, zoneY);
      this.pdf.text(`ZH-${i + 1}`, zoneX + 0.1, zoneY - 0.05);
      
      // CO2 sensor
      this.pdf.rect(zoneX - 0.03, zoneY + 0.2, 0.06, 0.06);
      this.pdf.setFontSize(4);
      this.pdf.text('CO2', zoneX, zoneY + 0.23, { align: 'center' });
      this.pdf.setFontSize(5);
      this.pdf.text(`ZC-${i + 1}`, zoneX, zoneY + 0.15);
      
      // Control wiring (dashed)
      this.pdf.setLineWidth(0.004);
      this.pdf.setLineDashPattern([0.05, 0.05], 0);
      this.pdf.setDrawColor(255, 0, 255);
      
      this.pdf.line(ddcX, ddcY, zoneX, zoneY);
      
      this.pdf.setLineDashPattern([], 0);
      this.pdf.setDrawColor(0, 0, 0);
    }
  }

  /**
   * Draw exhaust systems
   */
  private drawExhaustSystems(x: number, y: number, length: number, width: number): void {
    // Exhaust fans
    const exhaustSpacing = 1.5; // 120' spacing
    
    for (let i = 0; i < length / exhaustSpacing; i++) {
      const fanX = x + (i + 0.5) * exhaustSpacing;
      const fanY = y - 0.3;
      
      // Roof exhaust fan
      this.SYMBOLS.FAN(fanX, fanY, 0.12);
      
      this.pdf.setFontSize(6);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`EF-${i + 1}`, fanX, fanY - 0.2, { align: 'center' });
      
      this.pdf.setFontSize(5);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text('3000 CFM', fanX, fanY + 0.2, { align: 'center' });
      
      // Exhaust duct
      this.pdf.setLineWidth(0.012);
      this.pdf.setDrawColor(255, 150, 0);
      this.pdf.line(fanX, fanY, fanX, y + width * 0.8);
      
      // Exhaust grilles
      for (let j = 0; j < 3; j++) {
        const grillY = y + width * 0.2 + j * width * 0.3;
        this.SYMBOLS.GRILLE(fanX, grillY, 'exhaust');
        this.pdf.setFontSize(4);
        this.pdf.text('1000', fanX + 0.06, grillY);
      }
    }
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  /**
   * Draw HVAC notes
   */
  private drawHVACNotes(x: number, y: number): void {
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('HVAC NOTES:', x, y);
    
    const notes = [
      '1. ALL WORK SHALL COMPLY WITH IMC 2021 AND ASHRAE.',
      '2. DESIGN CONDITIONS: 75°F DB, 60% RH INDOOR.',
      '3. OUTDOOR: 95°F DB / 75°F WB SUMMER, 20°F WINTER.',
      '4. ALL DUCTWORK SHALL BE GALVANIZED STEEL.',
      '5. INSULATE ALL SUPPLY DUCTS WITH R-8 MINIMUM.',
      '6. PROVIDE BALANCING DAMPERS AT ALL BRANCHES.',
      '7. TEST AND BALANCE PER ASHRAE 111.',
      '8. INTEGRATE ALL CONTROLS WITH BAS SYSTEM.',
      '9. PROVIDE SEISMIC RESTRAINTS PER ASCE 7-16.',
      '10. COMMISSION ALL SYSTEMS PER ASHRAE 202.'
    ];
    
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'normal');
    notes.forEach((note, i) => {
      this.pdf.text(note, x, y + 0.3 + i * 0.15);
    });
  }

  /**
   * Draw HVAC legend
   */
  private drawHVACLegend(x: number, y: number): void {
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('HVAC LEGEND:', x, y);
    
    // Legend items with symbols
    const items = [
      { draw: () => this.drawDuctSymbol(x, y + 0.5, 'supply'), desc: 'SUPPLY AIR DUCT' },
      { draw: () => this.drawDuctSymbol(x, y + 0.8, 'return'), desc: 'RETURN AIR DUCT' },
      { draw: () => this.drawPipeSymbol(x, y + 1.1, 'CWS'), desc: 'CHILLED WATER SUPPLY' },
      { draw: () => this.drawPipeSymbol(x, y + 1.4, 'CWR'), desc: 'CHILLED WATER RETURN' },
      { draw: () => this.SYMBOLS.DIFFUSER(x, y + 1.7, 'square'), desc: 'SUPPLY DIFFUSER' },
      { draw: () => this.SYMBOLS.GRILLE(x, y + 2.0, 'return'), desc: 'RETURN GRILLE' }
    ];
    
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'normal');
    
    items.forEach((item) => {
      item.draw();
      const yPos = y + 0.5 + items.indexOf(item) * 0.3;
      this.pdf.text(item.desc, x + 0.3, yPos);
    });
  }

  /**
   * Draw equipment schedule
   */
  private drawEquipmentSchedule(x: number, y: number): void {
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('EQUIPMENT SCHEDULE:', x, y);
    
    const equipment = [
      { tag: 'CH-1', desc: 'CHILLER', cap: '150 TON', model: 'YK-150' },
      { tag: 'B-1', desc: 'BOILER', cap: '2000 MBH', model: 'CB-200' },
      { tag: 'AHU-1', desc: 'AIR HANDLER', cap: '10,000 CFM', model: 'M39-100' },
      { tag: 'CWP-1', desc: 'CW PUMP', cap: '300 GPM', model: 'B&G 1510' },
      { tag: 'EF-1', desc: 'EXHAUST FAN', cap: '3000 CFM', model: 'GB-30' }
    ];
    
    // Table headers
    this.pdf.setFontSize(6);
    const headers = ['TAG', 'DESCRIPTION', 'CAPACITY', 'MODEL'];
    const colX = [x, x + 0.4, x + 1.2, x + 2.0];
    
    headers.forEach((header, i) => {
      this.pdf.text(header, colX[i], y + 0.3);
    });
    
    // Table data
    this.pdf.setFont('helvetica', 'normal');
    equipment.forEach((eq, i) => {
      const rowY = y + 0.5 + i * 0.15;
      this.pdf.text(eq.tag, colX[0], rowY);
      this.pdf.text(eq.desc, colX[1], rowY);
      this.pdf.text(eq.cap, colX[2], rowY);
      this.pdf.text(eq.model, colX[3], rowY);
    });
  }

  /**
   * Helper method to draw duct symbol
   */
  private drawDuctSymbol(x: number, y: number, type: string): void {
    this.pdf.setLineWidth(0.016);
    
    if (type === 'supply') {
      this.pdf.setDrawColor(255, 0, 0);
      this.pdf.line(x, y, x + 0.2, y);
    } else {
      this.pdf.setDrawColor(0, 0, 255);
      this.pdf.line(x, y, x + 0.2, y);
    }
    
    this.pdf.setDrawColor(0, 0, 0);
  }

  /**
   * Helper method to draw pipe symbol
   */
  private drawPipeSymbol(x: number, y: number, type: string): void {
    this.pdf.setLineWidth(0.012);
    
    if (type === 'CWS' || type === 'HWS') {
      this.pdf.setLineDashPattern([0.1, 0.05], 0);
    } else {
      this.pdf.setLineDashPattern([0.05, 0.05], 0);
    }
    
    if (type.includes('CW')) {
      this.pdf.setDrawColor(0, 0, 255);
    } else {
      this.pdf.setDrawColor(255, 0, 0);
    }
    
    this.pdf.line(x, y, x + 0.2, y);
    
    this.pdf.setLineDashPattern([], 0);
    this.pdf.setDrawColor(0, 0, 0);
  }
}