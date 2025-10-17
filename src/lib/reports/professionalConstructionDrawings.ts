/**
 * Professional Construction Drawing Generator
 * Creates industry-standard, CAD-quality construction documents
 */

import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ConstructionConfig } from './constructionDrawingGenerator';

export class ProfessionalDrawingGenerator {
  private pdf: jsPDF;
  private currentSheet = 1;
  private totalSheets = 0;
  private projectInfo: any;

  constructor(config: ConstructionConfig, totalSheets: number) {
    this.pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [36, 24] // D-size
    });
    
    this.totalSheets = totalSheets;
    this.projectInfo = config.project;
    
    // Set default drawing properties
    this.pdf.setFont('helvetica');
    this.setDefaultLineProperties();
  }

  private setDefaultLineProperties() {
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setLineWidth(0.01); // Very thin default
  }

  // Professional title block with proper formatting
  addProfessionalTitleBlock(sheetNumber: string, sheetTitle: string, scale: string = '') {
    // Main border - heavy line weight
    this.pdf.setLineWidth(0.03);
    this.pdf.rect(0.5, 0.5, 35, 23);
    
    // Drawing area border - medium line weight
    this.pdf.setLineWidth(0.015);
    this.pdf.rect(1, 1, 26.5, 21.5);
    
    // Title block - heavy line weight
    this.pdf.setLineWidth(0.02);
    const titleBlockX = 27.5;
    const titleBlockY = 17;
    const titleBlockW = 8;
    const titleBlockH = 6.5;
    
    this.pdf.rect(titleBlockX, titleBlockY, titleBlockW, titleBlockH);
    
    // Title block subdivisions
    this.pdf.setLineWidth(0.01);
    
    // Company logo area
    this.pdf.rect(titleBlockX, titleBlockY, titleBlockW, 1.5);
    
    // Project info area
    this.pdf.rect(titleBlockX, titleBlockY + 1.5, titleBlockW, 3);
    
    // Drawing info area
    this.pdf.rect(titleBlockX, titleBlockY + 4.5, titleBlockW, 2);
    
    // Vertical dividers
    this.pdf.line(titleBlockX + 3, titleBlockY + 1.5, titleBlockX + 3, titleBlockY + titleBlockH);
    this.pdf.line(titleBlockX + 6, titleBlockY + 4.5, titleBlockX + 6, titleBlockY + titleBlockH);
    
    // Horizontal dividers in project area
    this.pdf.line(titleBlockX, titleBlockY + 2.5, titleBlockX + titleBlockW, titleBlockY + 2.5);
    this.pdf.line(titleBlockX, titleBlockY + 3.5, titleBlockX + titleBlockW, titleBlockY + 3.5);
    
    // Company name and logo
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('VIBELUX', titleBlockX + titleBlockW/2, titleBlockY + 0.8, { align: 'center' });
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('GREENHOUSE DESIGN & ENGINEERING', titleBlockX + titleBlockW/2, titleBlockY + 1.2, { align: 'center' });
    
    // Project information
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PROJECT:', titleBlockX + 0.1, titleBlockY + 1.8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(this.projectInfo.name.toUpperCase().substring(0, 35), titleBlockX + 1, titleBlockY + 1.8);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('CLIENT:', titleBlockX + 0.1, titleBlockY + 2.2);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(this.projectInfo.client.substring(0, 35), titleBlockX + 1, titleBlockY + 2.2);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('LOCATION:', titleBlockX + 0.1, titleBlockY + 2.8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(this.projectInfo.location.substring(0, 30), titleBlockX + 1, titleBlockY + 2.8);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PROJECT NO:', titleBlockX + 0.1, titleBlockY + 3.2);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(this.projectInfo.number, titleBlockX + 1.5, titleBlockY + 3.2);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('DATE:', titleBlockX + 4, titleBlockY + 3.2);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(format(this.projectInfo.date, 'MM/dd/yyyy'), titleBlockX + 4.7, titleBlockY + 3.2);
    
    // Drawing information
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(sheetTitle, titleBlockX + titleBlockW/2, titleBlockY + 5.2, { align: 'center' });
    
    if (scale) {
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`SCALE: ${scale}`, titleBlockX + titleBlockW/2, titleBlockY + 5.7, { align: 'center' });
    }
    
    // Sheet number
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('SHEET', titleBlockX + 6.2, titleBlockY + 5.8);
    
    this.pdf.setFontSize(24);
    this.pdf.text(sheetNumber, titleBlockX + 6.2, titleBlockY + 6.2);
    
    this.pdf.setFontSize(8);
    this.pdf.text(`OF ${this.totalSheets}`, titleBlockX + 6.2, titleBlockY + 6.4);
    
    // Revision block
    this.pdf.setLineWidth(0.01);
    this.pdf.rect(27.5, 15, 8, 2);
    this.pdf.line(27.5, 15.5, 35.5, 15.5);
    this.pdf.line(28.5, 15, 28.5, 17);
    this.pdf.line(31, 15, 31, 17);
    this.pdf.line(33.5, 15, 33.5, 17);
    
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('REV', 27.7, 15.3);
    this.pdf.text('DESCRIPTION', 29.5, 15.3);
    this.pdf.text('DATE', 31.2, 15.3);
    this.pdf.text('BY', 33.7, 15.3);
    
    // Construction document stamp
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('ISSUED FOR CONSTRUCTION', 27.5, 14.5);
    
    // North arrow (simple)
    this.drawNorthArrow(2, 22);
    
    this.currentSheet++;
  }

  private drawNorthArrow(x: number, y: number) {
    const size = 0.5;
    
    // Circle
    this.pdf.setLineWidth(0.015);
    this.pdf.circle(x, y, size);
    
    // Arrow pointing up
    this.pdf.setLineWidth(0.02);
    this.pdf.line(x, y - size * 0.7, x, y + size * 0.7);
    
    // Arrow head
    this.pdf.line(x, y + size * 0.7, x - size * 0.3, y + size * 0.4);
    this.pdf.line(x, y + size * 0.7, x + size * 0.3, y + size * 0.4);
    
    // N label
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('N', x, y - size * 1.2, { align: 'center' });
  }

  // Professional floor plan with proper line weights and symbols
  drawFloorPlan(config: ConstructionConfig, startX: number = 2, startY: number = 3, scale: number = 1/96) {
    const scaledWidth = config.dimensions.width * scale;
    const scaledLength = config.dimensions.length * scale;
    
    // Building outline - heavy line weight
    this.pdf.setLineWidth(0.03);
    this.pdf.rect(startX, startY, scaledLength, scaledWidth);
    
    // Interior walls - medium line weight
    this.pdf.setLineWidth(0.02);
    this.pdf.rect(startX + 0.25, startY + 0.25, scaledLength - 0.5, scaledWidth - 0.5);
    
    // Grid system - light line weight  
    this.pdf.setLineWidth(0.005);
    // Note: jsPDF doesn't support setLineDash, so we'll use solid lines
    
    const baySpacing = 26.25 * scale; // Standard greenhouse bay
    const numBaysLength = Math.floor(config.dimensions.length / 26.25);
    const numBaysWidth = Math.floor(config.dimensions.width / 26.25);
    
    // Structural grid lines
    for (let i = 0; i <= numBaysLength; i++) {
      const x = startX + i * baySpacing;
      if (x <= startX + scaledLength) {
        this.pdf.line(x, startY, x, startY + scaledWidth);
        
        // Grid bubble
        // this.pdf.setLineDash([]);
        this.pdf.setLineWidth(0.01);
        this.pdf.circle(x, startY - 0.3, 0.15);
        
        this.pdf.setFontSize(8);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text(String.fromCharCode(65 + i), x, startY - 0.25, { align: 'center' });
        
        // this.pdf.setLineDash([0.1, 0.05]);
        this.pdf.setLineWidth(0.005);
      }
    }
    
    for (let i = 0; i <= numBaysWidth; i++) {
      const y = startY + i * baySpacing;
      if (y <= startY + scaledWidth) {
        this.pdf.line(startX, y, startX + scaledLength, y);
        
        // Grid bubble
        // this.pdf.setLineDash([]);
        this.pdf.setLineWidth(0.01);
        this.pdf.circle(startX - 0.3, y, 0.15);
        
        this.pdf.setFontSize(8);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text((i + 1).toString(), startX - 0.3, y + 0.05, { align: 'center' });
        
        // this.pdf.setLineDash([0.1, 0.05]);
        this.pdf.setLineWidth(0.005);
      }
    }
    
    // this.pdf.setLineDash([]);
    
    // Zone divisions with proper line weight
    this.pdf.setLineWidth(0.015);
    for (let i = 1; i < config.zones; i++) {
      const x = startX + i * (scaledLength / config.zones);
      this.pdf.line(x, startY, x, startY + scaledWidth);
      
      // Zone labels
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      const zoneX = startX + (i - 0.5) * (scaledLength / config.zones);
      this.pdf.text(`ZONE ${i}`, zoneX, startY + scaledWidth/2, { align: 'center' });
    }
    
    // Last zone
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    const lastZoneX = startX + (config.zones - 0.5) * (scaledLength / config.zones);
    this.pdf.text(`ZONE ${config.zones}`, lastZoneX, startY + scaledWidth/2, { align: 'center' });
    
    // Dimensions with proper extension lines
    this.drawDimension(
      startX, startY - 0.7, 
      startX + scaledLength, startY - 0.7,
      `${config.dimensions.length}'-0"`,
      false
    );
    
    this.drawDimension(
      startX - 0.7, startY,
      startX - 0.7, startY + scaledWidth,
      `${config.dimensions.width}'-0"`,
      true
    );
    
    // Add doors and entrances
    this.drawDoor(startX + scaledLength/2, startY, 3 * scale, 'MAIN ENTRANCE');
    this.drawDoor(startX, startY + scaledWidth/2, 3 * scale, 'SERVICE DOOR', true);
  }

  private drawDoor(x: number, y: number, width: number, label: string, side: boolean = false) {
    this.pdf.setLineWidth(0.02);
    
    if (side) {
      // Side door (on left wall)
      this.pdf.line(x, y - width/2, x, y + width/2);
      
      // Door swing arc
      this.pdf.setLineWidth(0.01);
      this.drawArc(x + 0.1, y, width/2, 0, 90);
      
      // Label
      this.pdf.setFontSize(6);
      this.pdf.text(label, x + 0.2, y - width/2 - 0.1);
    } else {
      // Front door (on bottom wall)
      this.pdf.line(x - width/2, y, x + width/2, y);
      
      // Door swing arc
      this.pdf.setLineWidth(0.01);
      this.drawArc(x, y - 0.1, width/2, 0, 90);
      
      // Label
      this.pdf.setFontSize(6);
      this.pdf.text(label, x, y - 0.3, { align: 'center' });
    }
  }

  private drawArc(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
    // Approximate arc with line segments
    const steps = 10;
    const angleStep = (endAngle - startAngle) / steps;
    
    for (let i = 0; i < steps; i++) {
      const angle1 = (startAngle + i * angleStep) * Math.PI / 180;
      const angle2 = (startAngle + (i + 1) * angleStep) * Math.PI / 180;
      
      const x1 = centerX + radius * Math.cos(angle1);
      const y1 = centerY + radius * Math.sin(angle1);
      const x2 = centerX + radius * Math.cos(angle2);
      const y2 = centerY + radius * Math.sin(angle2);
      
      this.pdf.line(x1, y1, x2, y2);
    }
  }

  private drawDimension(x1: number, y1: number, x2: number, y2: number, text: string, vertical: boolean = false) {
    this.pdf.setLineWidth(0.01);
    
    if (vertical) {
      // Extension lines
      this.pdf.line(x1 - 0.15, y1, x1 + 0.15, y1);
      this.pdf.line(x1 - 0.15, y2, x1 + 0.15, y2);
      
      // Dimension line
      this.pdf.line(x1, y1, x1, y2);
      
      // Arrowheads
      this.drawArrowhead(x1, y1, 90);
      this.drawArrowhead(x1, y2, 270);
      
      // Text
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(text, x1 - 0.4, (y1 + y2) / 2, { align: 'center', angle: 90 });
    } else {
      // Extension lines
      this.pdf.line(x1, y1 - 0.15, x1, y1 + 0.15);
      this.pdf.line(x2, y1 - 0.15, x2, y1 + 0.15);
      
      // Dimension line
      this.pdf.line(x1, y1, x2, y1);
      
      // Arrowheads
      this.drawArrowhead(x1, y1, 180);
      this.drawArrowhead(x2, y1, 0);
      
      // Text
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(text, (x1 + x2) / 2, y1 - 0.25, { align: 'center' });
    }
  }

  private drawArrowhead(x: number, y: number, angle: number) {
    const size = 0.05;
    const rad = angle * Math.PI / 180;
    
    const x1 = x + size * Math.cos(rad + 150 * Math.PI / 180);
    const y1 = y + size * Math.sin(rad + 150 * Math.PI / 180);
    const x2 = x + size * Math.cos(rad - 150 * Math.PI / 180);
    const y2 = y + size * Math.sin(rad - 150 * Math.PI / 180);
    
    this.pdf.line(x, y, x1, y1);
    this.pdf.line(x, y, x2, y2);
  }

  // Professional electrical plan with proper symbols
  drawElectricalPlan(config: ConstructionConfig, electricalSystem: any, startX: number = 2, startY: number = 3, scale: number = 1/96) {
    // Building outline
    this.pdf.setLineWidth(0.02);
    const scaledWidth = config.dimensions.width * scale;
    const scaledLength = config.dimensions.length * scale;
    
    this.pdf.rect(startX, startY, scaledLength, scaledWidth);
    
    // Panel locations with professional symbols
    electricalSystem.panels.filter((p: any) => p.name.startsWith('LP')).forEach((panel: any, idx: number) => {
      const panelX = startX + (idx + 0.5) * (scaledLength / config.zones);
      const panelY = startY + scaledWidth + 0.5;
      
      this.drawElectricalPanel(panelX, panelY, panel.name, panel.specs.amperage);
      
      // Panel schedule reference
      this.pdf.setFontSize(6);
      this.pdf.text(`SEE PANEL SCHEDULE`, panelX, panelY + 0.4, { align: 'center' });
      this.pdf.text(`SHEET E-201`, panelX, panelY + 0.5, { align: 'center' });
    });
    
    // Lighting fixtures with circuit information
    const fixturesPerZone = Math.floor(config.fixtures.length / config.zones);
    
    electricalSystem.panels.filter((p: any) => p.name.startsWith('LP')).forEach((panel: any, panelIdx: number) => {
      const zoneX = startX + panelIdx * (scaledLength / config.zones);
      const zoneWidth = scaledLength / config.zones;
      
      panel.circuits.forEach((circuit: any, circuitIdx: number) => {
        const color = this.getCircuitColor(circuit.number);
        this.pdf.setDrawColor(color[0], color[1], color[2]);
        this.pdf.setLineWidth(0.02);
        
        // Draw fixtures for this circuit
        const fixturesOnCircuit = Math.min(circuit.fixtures.length, 20);
        const cols = Math.ceil(Math.sqrt(fixturesOnCircuit));
        const rows = Math.ceil(fixturesOnCircuit / cols);
        
        for (let f = 0; f < fixturesOnCircuit; f++) {
          const col = f % cols;
          const row = Math.floor(f / cols);
          
          const fx = zoneX + 0.5 + col * (zoneWidth - 1) / cols;
          const fy = startY + 0.5 + row * (scaledWidth - 1) / rows;
          
          this.drawLightFixture(fx, fy, circuit.number);
          
          // Homerun to panel (show every 4th fixture)
          if (f % 4 === 0) {
            const panelX = startX + (panelIdx + 0.5) * (scaledLength / config.zones);
            const panelY = startY + scaledWidth + 0.5;
            
            // this.pdf.setLineDash([0.05, 0.05]);
            this.pdf.line(fx, fy, panelX, panelY);
            // this.pdf.setLineDash([]);
          }
        }
      });
    });
    
    this.pdf.setDrawColor(0, 0, 0);
    
    // Electrical legend
    this.drawElectricalLegend(startX + scaledLength + 1, startY);
  }

  private drawElectricalPanel(x: number, y: number, name: string, amperage: number) {
    // Panel symbol - filled rectangle with border
    this.pdf.setLineWidth(0.02);
    this.pdf.setFillColor(50, 50, 50);
    this.pdf.rect(x - 0.2, y - 0.15, 0.4, 0.3, 'FD');
    
    // Panel identification
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(name, x, y - 0.25, { align: 'center' });
    this.pdf.text(`${amperage}A`, x, y + 0.4, { align: 'center' });
    
    // Connection point
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.circle(x, y, 0.03, 'F');
  }

  private drawLightFixture(x: number, y: number, circuitNumber: number) {
    // HPS fixture symbol
    this.pdf.setLineWidth(0.01);
    this.pdf.rect(x - 0.04, y - 0.08, 0.08, 0.16);
    
    // Cross inside fixture
    this.pdf.line(x - 0.04, y - 0.08, x + 0.04, y + 0.08);
    this.pdf.line(x - 0.04, y + 0.08, x + 0.04, y - 0.08);
    
    // Circuit number
    this.pdf.setFontSize(4);
    this.pdf.text(circuitNumber.toString(), x + 0.06, y);
  }

  drawElectricalLegend(x: number, y: number) {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('ELECTRICAL LEGEND', x, y);
    
    let yPos = y + 0.5;
    
    // Panel symbol
    this.drawElectricalPanel(x + 0.3, yPos, 'LP', 400);
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('LIGHTING PANEL', x + 0.8, yPos + 0.05);
    
    yPos += 0.8;
    
    // Fixture symbol
    this.drawLightFixture(x + 0.3, yPos, 1);
    this.pdf.text('HPS 1000W FIXTURE', x + 0.8, yPos + 0.05);
    
    yPos += 0.5;
    
    // Homerun symbol
    // this.pdf.setLineDash([0.05, 0.05]);
    this.pdf.line(x + 0.2, yPos, x + 0.4, yPos);
    // this.pdf.setLineDash([]);
    this.pdf.text('HOMERUN TO PANEL', x + 0.8, yPos + 0.05);
    
    yPos += 0.5;
    
    // Circuit colors
    this.pdf.setFontSize(7);
    this.pdf.text('CIRCUIT COLORS:', x, yPos);
    
    for (let i = 1; i <= 8; i++) {
      yPos += 0.3;
      const color = this.getCircuitColor(i);
      this.pdf.setDrawColor(color[0], color[1], color[2]);
      this.pdf.setLineWidth(0.03);
      this.pdf.line(x + 0.1, yPos, x + 0.3, yPos);
      this.pdf.setDrawColor(0, 0, 0);
      this.pdf.text(`CIRCUIT ${i}`, x + 0.4, yPos + 0.02);
    }
  }

  private getCircuitColor(circuitNumber: number): [number, number, number] {
    const colors: [number, number, number][] = [
      [0, 0, 0],       // Black
      [255, 0, 0],     // Red
      [0, 0, 255],     // Blue
      [255, 165, 0],   // Orange
      [255, 255, 0],   // Yellow
      [0, 255, 0],     // Green
      [128, 0, 128],   // Purple
      [165, 42, 42],   // Brown
      [255, 192, 203], // Pink
    ];
    return colors[circuitNumber % colors.length];
  }

  // Professional panel schedule table
  generatePanelSchedule(panel: any, startX: number = 2, startY: number = 3) {
    // Panel header
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`PANEL ${panel.name} SCHEDULE`, 18, startY, { align: 'center' });
    
    // Panel information box
    this.pdf.setLineWidth(0.02);
    this.pdf.rect(startX, startY + 0.5, 32, 1.5);
    this.pdf.line(startX + 8, startY + 0.5, startX + 8, startY + 2);
    this.pdf.line(startX + 16, startY + 0.5, startX + 16, startY + 2);
    this.pdf.line(startX + 24, startY + 0.5, startX + 24, startY + 2);
    
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PANEL DESIGNATION:', startX + 0.2, startY + 0.9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(panel.name, startX + 0.2, startY + 1.3);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('VOLTAGE:', startX + 8.2, startY + 0.9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`${panel.specs.voltage}V`, startX + 8.2, startY + 1.3);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('MAIN BREAKER:', startX + 16.2, startY + 0.9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`${panel.specs.amperage}A`, startX + 16.2, startY + 1.3);
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('LOCATION:', startX + 24.2, startY + 0.9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(panel.location || 'SEE PLAN', startX + 24.2, startY + 1.3);
    
    // Table headers
    const tableStartY = startY + 3;
    const rowHeight = 0.4;
    const colWidths = [1.5, 6, 2, 1.5, 2, 2, 2, 2, 1.5, 6, 2, 1.5];
    const colHeaders = [
      'CKT', 'DESCRIPTION', 'LOAD (A)', 'BKR', 'WIRE', 'CONDUIT', 'LENGTH', 'NOTES',
      'BKR', 'WIRE', 'LOAD (A)', 'DESCRIPTION', 'CKT'
    ];
    
    // Draw table structure
    this.pdf.setLineWidth(0.02);
    let currentX = startX;
    
    // Outer border
    this.pdf.rect(startX, tableStartY, 32, rowHeight * (panel.circuits.length / 2 + 2));
    
    // Header row
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.rect(startX, tableStartY, 32, rowHeight, 'F');
    
    // Vertical lines for columns
    currentX = startX;
    for (let i = 0; i < colWidths.length; i++) {
      if (i === 8) { // Skip middle divider
        this.pdf.setLineWidth(0.03);
        this.pdf.line(currentX, tableStartY, currentX, tableStartY + rowHeight * (panel.circuits.length / 2 + 2));
        this.pdf.setLineWidth(0.01);
      } else {
        this.pdf.line(currentX, tableStartY, currentX, tableStartY + rowHeight * (panel.circuits.length / 2 + 2));
      }
      currentX += colWidths[i];
    }
    
    // Header text
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'bold');
    currentX = startX;
    for (let i = 0; i < colHeaders.length; i++) {
      this.pdf.text(colHeaders[i], currentX + colWidths[i]/2, tableStartY + 0.25, { align: 'center' });
      currentX += colWidths[i];
    }
    
    // Circuit rows (odd circuits on left, even on right)
    let yPos = tableStartY + rowHeight;
    const circuitsPerSide = Math.ceil(panel.circuits.length / 2);
    
    for (let row = 0; row < circuitsPerSide; row++) {
      // Horizontal line
      this.pdf.setLineWidth(0.01);
      this.pdf.line(startX, yPos, startX + 32, yPos);
      
      // Left side (odd circuits)
      const leftCircuit = panel.circuits[row * 2];
      if (leftCircuit) {
        this.fillCircuitRow(leftCircuit, startX, yPos, colWidths, true);
      }
      
      // Right side (even circuits)
      const rightCircuit = panel.circuits[row * 2 + 1];
      if (rightCircuit) {
        this.fillCircuitRow(rightCircuit, startX + 16, yPos, colWidths.slice(8), false);
      }
      
      yPos += rowHeight;
    }
    
    // Panel summary
    yPos += 0.5;
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('PANEL SUMMARY:', startX, yPos);
    
    yPos += 0.4;
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    
    const totalLoad = panel.circuits.reduce((sum: number, c: any) => sum + c.actualLoad, 0);
    const summary = [
      `Total Connected Load: ${totalLoad.toFixed(1)} A`,
      `Number of Circuits: ${panel.circuits.length}`,
      `Spare Circuits: ${panel.specs.circuits - panel.circuits.length}`,
      `Panel Utilization: ${((totalLoad / panel.specs.amperage) * 100).toFixed(1)}%`
    ];
    
    summary.forEach(line => {
      this.pdf.text(line, startX, yPos);
      yPos += 0.3;
    });
  }

  private fillCircuitRow(circuit: any, startX: number, yPos: number, colWidths: number[], isLeft: boolean) {
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'normal');
    
    let currentX = startX;
    
    if (isLeft) {
      // Left side format: CKT, DESC, LOAD, BKR, WIRE, CONDUIT, LENGTH, NOTES
      this.pdf.text(circuit.number.toString(), currentX + colWidths[0]/2, yPos + 0.25, { align: 'center' });
      currentX += colWidths[0];
      
      this.pdf.text(circuit.name.substring(0, 35), currentX + 0.1, yPos + 0.25);
      currentX += colWidths[1];
      
      this.pdf.text(circuit.actualLoad.toFixed(1), currentX + colWidths[2]/2, yPos + 0.25, { align: 'center' });
      currentX += colWidths[2];
      
      this.pdf.text(`${circuit.breaker.amperage}A`, currentX + colWidths[3]/2, yPos + 0.25, { align: 'center' });
      currentX += colWidths[3];
      
      this.pdf.text(circuit.wire.gauge, currentX + colWidths[4]/2, yPos + 0.25, { align: 'center' });
      currentX += colWidths[4];
      
      this.pdf.text(circuit.conduit.size, currentX + colWidths[5]/2, yPos + 0.25, { align: 'center' });
      currentX += colWidths[5];
      
      this.pdf.text(`${circuit.wire.length}'`, currentX + colWidths[6]/2, yPos + 0.25, { align: 'center' });
      currentX += colWidths[6];
      
      this.pdf.text(`${circuit.fixtures.length} FIXTURES`, currentX + 0.1, yPos + 0.25);
    } else {
      // Right side format: BKR, WIRE, LOAD, DESC, CKT
      this.pdf.text(`${circuit.breaker.amperage}A`, currentX + colWidths[0]/2, yPos + 0.25, { align: 'center' });
      currentX += colWidths[0];
      
      this.pdf.text(circuit.wire.gauge, currentX + colWidths[1]/2, yPos + 0.25, { align: 'center' });
      currentX += colWidths[1];
      
      this.pdf.text(circuit.actualLoad.toFixed(1), currentX + colWidths[2]/2, yPos + 0.25, { align: 'center' });
      currentX += colWidths[2];
      
      this.pdf.text(circuit.name.substring(0, 35), currentX + 0.1, yPos + 0.25);
      currentX += colWidths[3];
      
      this.pdf.text(circuit.number.toString(), currentX + colWidths[4]/2, yPos + 0.25, { align: 'center' });
    }
  }

  getPDF(): jsPDF {
    return this.pdf;
  }

  getBlob(): Blob {
    return this.pdf.output('blob');
  }
}