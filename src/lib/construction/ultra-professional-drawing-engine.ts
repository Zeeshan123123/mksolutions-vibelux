import { jsPDF } from 'jspdf';
import type { ElectricalSystem } from './electrical-system-designer';
import type { StructuralDesignSystem } from './structural-designer';
import type { HVACDesignSystem } from '../hvac/hvac-construction-designer';

/**
 * Ultra-Professional Drawing Engine
 * Generates truly professional, dense, detailed construction documents
 * that match real-world MEP drawing standards
 */
export class UltraProfessionalDrawingEngine {
  private pdf: jsPDF;
  private currentPage: number = 0;
  
  // Professional line weights (in inches)
  private readonly LINE_WEIGHTS = {
    EXTRA_THIN: 0.002,   // 0.05mm - Dimension lines, hatching
    THIN: 0.004,         // 0.10mm - Grid lines, hidden lines
    MEDIUM: 0.008,       // 0.20mm - Object lines, text
    THICK: 0.016,        // 0.40mm - Major equipment, borders
    EXTRA_THICK: 0.024   // 0.60mm - Cut lines, match lines
  };

  // Professional colors (RGB)
  private readonly COLORS = {
    BLACK: [0, 0, 0],
    RED: [255, 0, 0],
    GREEN: [0, 150, 0],
    BLUE: [0, 0, 255],
    GRAY_LIGHT: [200, 200, 200],
    GRAY_MEDIUM: [150, 150, 150],
    GRAY_DARK: [100, 100, 100],
    YELLOW: [255, 255, 0],
    CYAN: [0, 255, 255],
    MAGENTA: [255, 0, 255]
  };

  constructor() {
    this.pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [36, 24] // ANSI D size
    });
  }

  /**
   * Generate ultra-professional structural plan
   */
  public generateStructuralPlan(structural: StructuralDesignSystem): void {
    this.addNewSheet();
    const scale = 1/96; // 1/8" = 1'-0"
    
    // Draw in this order for proper layering
    this.drawStructuralGrid(2, 3, structural);
    this.drawFoundationPlan(2, 3, structural);
    this.drawStructuralFraming(2, 3, structural);
    this.drawStructuralDimensions(2, 3, structural);
    this.drawStructuralDetails(2, 3, structural);
    this.drawStructuralNotes(28, 3);
    this.drawStructuralLegend(28, 10);
    this.drawStructuralSchedule(28, 14);
  }

  /**
   * Draw professional structural grid with bubbles
   */
  private drawStructuralGrid(x: number, y: number, structural: StructuralDesignSystem): void {
    const scale = 1/96;
    const width = (structural.dimensions?.width || 144) * scale;
    const length = (structural.dimensions?.length || 480) * scale;
    
    // Grid lines
    this.setLineWeight('THIN');
    this.setColor('GRAY_MEDIUM');
    
    const baySpacing = 24 * scale; // 24' typical
    const bays = Math.floor(length / baySpacing);
    
    // Vertical grids with professional bubbles
    for (let i = 0; i <= bays; i++) {
      const gridX = x + i * baySpacing;
      
      // Extended grid lines
      this.pdf.line(gridX, y - 0.5, gridX, y + width + 0.5);
      
      // Grid bubbles (top and bottom)
      this.drawGridBubble(gridX, y - 0.3, String.fromCharCode(65 + i));
      this.drawGridBubble(gridX, y + width + 0.3, String.fromCharCode(65 + i));
    }
    
    // Horizontal grids
    const frames = Math.floor(width / baySpacing);
    for (let i = 0; i <= frames; i++) {
      const gridY = y + i * baySpacing;
      
      this.pdf.line(x - 0.5, gridY, x + length + 0.5, gridY);
      
      // Grid bubbles (left and right)
      this.drawGridBubble(x - 0.3, gridY, (i + 1).toString());
      this.drawGridBubble(x + length + 0.3, gridY, (i + 1).toString());
    }
  }

  /**
   * Draw detailed foundation plan
   */
  private drawFoundationPlan(x: number, y: number, structural: StructuralDesignSystem): void {
    const scale = 1/96;
    const width = (structural.dimensions?.width || 144) * scale;
    const length = (structural.dimensions?.length || 480) * scale;
    
    // Foundation footings with proper symbols
    const baySpacing = 24 * scale;
    const bays = Math.floor(length / baySpacing);
    const frames = Math.floor(width / baySpacing);
    
    for (let i = 0; i <= bays; i++) {
      for (let j = 0; j <= frames; j++) {
        const footingX = x + i * baySpacing;
        const footingY = y + j * baySpacing;
        
        // Draw detailed footing
        this.drawFootingSymbol(footingX, footingY, i === 0 || i === bays || j === 0 || j === frames);
      }
    }
    
    // Foundation walls
    this.setLineWeight('THICK');
    this.setColor('BLACK');
    
    // Perimeter foundation walls
    this.pdf.rect(x, y, length, width);
    
    // Interior grade beams
    this.setLineWeight('MEDIUM');
    this.pdf.setLineDashPattern([0.1, 0.05], 0);
    
    for (let i = 1; i < frames; i++) {
      this.pdf.line(x, y + i * baySpacing, x + length, y + i * baySpacing);
    }
    
    this.pdf.setLineDashPattern([], 0);
  }

  /**
   * Draw structural framing with all members
   */
  private drawStructuralFraming(x: number, y: number, structural: StructuralDesignSystem): void {
    const scale = 1/96;
    const width = (structural.dimensions?.width || 144) * scale;
    const length = (structural.dimensions?.length || 480) * scale;
    
    // Columns at grid intersections
    this.drawStructuralColumns(x, y, length, width, scale);
    
    // Primary beams
    this.drawPrimaryBeams(x, y, length, width, scale);
    
    // Secondary framing
    this.drawSecondaryFraming(x, y, length, width, scale);
    
    // Bracing systems
    this.drawBracingSystems(x, y, length, width, scale);
    
    // Roof framing
    this.drawRoofFraming(x, y, length, width, scale);
  }

  /**
   * Draw columns with proper symbols and tags
   */
  private drawStructuralColumns(x: number, y: number, length: number, width: number, scale: number): void {
    const baySpacing = 24 * scale;
    const bays = Math.floor(length / baySpacing);
    const frames = Math.floor(width / baySpacing);
    
    this.setLineWeight('THICK');
    this.setColor('BLACK');
    
    for (let i = 0; i <= bays; i++) {
      for (let j = 0; j <= frames; j++) {
        const colX = x + i * baySpacing;
        const colY = y + j * baySpacing;
        
        // Determine column type
        const isCorner = (i === 0 || i === bays) && (j === 0 || j === frames);
        const isEdge = (i === 0 || i === bays) || (j === 0 || j === frames);
        
        // Draw column symbol
        if (isCorner) {
          // Corner columns - larger
          this.pdf.rect(colX - 0.05, colY - 0.05, 0.1, 0.1);
          this.pdf.rect(colX - 0.04, colY - 0.04, 0.08, 0.08, 'F');
        } else if (isEdge) {
          // Edge columns - medium
          this.pdf.rect(colX - 0.04, colY - 0.04, 0.08, 0.08);
          this.pdf.rect(colX - 0.03, colY - 0.03, 0.06, 0.06, 'F');
        } else {
          // Interior columns - standard
          this.pdf.circle(colX, colY, 0.03);
          this.pdf.circle(colX, colY, 0.025, 'F');
        }
        
        // Column mark
        this.pdf.setFontSize(5);
        const colMark = `C${String.fromCharCode(65 + i)}${j + 1}`;
        this.pdf.text(colMark, colX + 0.08, colY - 0.05);
      }
    }
  }

  /**
   * Draw primary structural beams
   */
  private drawPrimaryBeams(x: number, y: number, length: number, width: number, scale: number): void {
    const baySpacing = 24 * scale;
    const frames = Math.floor(width / baySpacing);
    
    this.setLineWeight('THICK');
    this.setColor('RED');
    
    // Main frames
    for (let i = 0; i <= frames; i++) {
      const frameY = y + i * baySpacing;
      
      // Draw as double lines to show beam depth
      this.pdf.line(x, frameY - 0.02, x + length, frameY - 0.02);
      this.pdf.line(x, frameY + 0.02, x + length, frameY + 0.02);
      
      // Beam designation at midspan
      if (i > 0 && i < frames) {
        this.pdf.setFontSize(6);
        this.pdf.text('W21×44', x + length/2, frameY - 0.05);
      }
    }
    
    // Perimeter beams
    this.setColor('BLUE');
    
    // North/South beams
    this.pdf.line(x - 0.02, y, x - 0.02, y + width);
    this.pdf.line(x + 0.02, y, x + 0.02, y + width);
    this.pdf.text('W18×35', x + 0.1, y + width/2);
    
    this.pdf.line(x + length - 0.02, y, x + length - 0.02, y + width);
    this.pdf.line(x + length + 0.02, y, x + length + 0.02, y + width);
  }

  /**
   * Draw secondary framing members
   */
  private drawSecondaryFraming(x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('MEDIUM');
    this.setColor('GREEN');
    
    const baySpacing = 24 * scale;
    const purlinSpacing = 8 * scale; // 8' O.C.
    
    // Roof purlins
    for (let i = 0; i < length / purlinSpacing; i++) {
      const purlinX = x + i * purlinSpacing;
      this.pdf.line(purlinX, y, purlinX, y + width);
      
      // Purlin designation every 3rd
      if (i % 3 === 0) {
        this.pdf.setFontSize(5);
        this.pdf.text('C10×15.3', purlinX + 0.02, y + 0.2);
      }
    }
    
    // Girts on walls
    const girtHeight = [4, 8, 12].map(h => h * scale);
    this.setColor('CYAN');
    
    girtHeight.forEach(h => {
      this.pdf.line(x, y + h, x + length, y + h);
      this.pdf.line(x, y + width - h, x + length, y + width - h);
    });
  }

  /**
   * Draw bracing systems
   */
  private drawBracingSystems(x: number, y: number, length: number, width: number, scale: number): void {
    this.setLineWeight('MEDIUM');
    this.setColor('MAGENTA');
    this.pdf.setLineDashPattern([0.05, 0.05], 0);
    
    const baySpacing = 24 * scale;
    
    // X-bracing in end bays and every 4th bay
    for (let i = 0; i <= Math.floor(length / baySpacing); i += 4) {
      if (i === 0 || i === Math.floor(length / baySpacing) - 1 || i % 4 === 0) {
        const braceX = x + i * baySpacing;
        
        // X-brace
        this.pdf.line(braceX, y, braceX + baySpacing, y + baySpacing);
        this.pdf.line(braceX + baySpacing, y, braceX, y + baySpacing);
        
        // Brace designation
        this.pdf.setFontSize(5);
        this.pdf.text('2L4×4×3/8', braceX + baySpacing/2, y + baySpacing/2);
      }
    }
    
    this.pdf.setLineDashPattern([], 0);
  }

  /**
   * Draw professional dimensions
   */
  private drawStructuralDimensions(x: number, y: number, structural: StructuralDesignSystem): void {
    const scale = 1/96;
    const width = (structural.dimensions?.width || 144) * scale;
    const length = (structural.dimensions?.length || 480) * scale;
    
    this.setLineWeight('EXTRA_THIN');
    this.setColor('BLACK');
    
    // Overall dimensions
    this.drawDimensionString(x, y - 0.5, x + length, y - 0.5, 
      `${structural.dimensions?.length || 480}'-0"`, 'horizontal');
    
    this.drawDimensionString(x - 0.5, y, x - 0.5, y + width,
      `${structural.dimensions?.width || 144}'-0"`, 'vertical');
    
    // Bay dimensions
    const baySpacing = 24 * scale;
    const bays = Math.floor(length / baySpacing);
    
    for (let i = 0; i < bays; i++) {
      const dimX1 = x + i * baySpacing;
      const dimX2 = x + (i + 1) * baySpacing;
      this.drawDimensionString(dimX1, y - 0.8, dimX2, y - 0.8, "24'-0\"", 'horizontal');
    }
  }

  /**
   * Draw detail callouts
   */
  private drawStructuralDetails(x: number, y: number, structural: StructuralDesignSystem): void {
    // Detail bubbles with references
    const details = [
      { x: x + 2, y: y + 1, number: '1', sheet: 'S-501', title: 'BASE PLATE' },
      { x: x + 4, y: y + 2, number: '2', sheet: 'S-501', title: 'MOMENT CONN' },
      { x: x + 6, y: y + 1, number: '3', sheet: 'S-502', title: 'BRACE CONN' }
    ];
    
    details.forEach(detail => {
      this.drawDetailBubble(detail.x, detail.y, detail.number, detail.sheet);
      
      // Leader line
      this.setLineWeight('THIN');
      this.pdf.line(detail.x + 0.15, detail.y, detail.x + 0.3, detail.y - 0.2);
      
      // Detail title
      this.pdf.setFontSize(5);
      this.pdf.text(detail.title, detail.x + 0.35, detail.y - 0.2);
    });
  }

  /**
   * Draw professional grid bubble
   */
  private drawGridBubble(x: number, y: number, label: string): void {
    this.setLineWeight('MEDIUM');
    this.setColor('BLACK');
    this.pdf.setFillColor(255, 255, 255);
    
    this.pdf.circle(x, y, 0.12, 'FD');
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(label, x, y, { align: 'center' });
  }

  /**
   * Draw footing symbol
   */
  private drawFootingSymbol(x: number, y: number, isPerimeter: boolean): void {
    this.setLineWeight('THICK');
    this.setColor('BLACK');
    
    if (isPerimeter) {
      // Larger perimeter footing
      this.pdf.rect(x - 0.08, y - 0.08, 0.16, 0.16);
      
      // Concrete hatch pattern
      this.drawConcreteHatch(x - 0.08, y - 0.08, 0.16, 0.16);
      
      // Rebar symbols
      this.pdf.circle(x - 0.04, y - 0.04, 0.01, 'F');
      this.pdf.circle(x + 0.04, y - 0.04, 0.01, 'F');
      this.pdf.circle(x - 0.04, y + 0.04, 0.01, 'F');
      this.pdf.circle(x + 0.04, y + 0.04, 0.01, 'F');
      
      // Footing tag
      this.pdf.setFontSize(5);
      this.pdf.text('F1', x + 0.1, y - 0.1);
    } else {
      // Standard interior footing
      this.pdf.rect(x - 0.06, y - 0.06, 0.12, 0.12);
      this.drawConcreteHatch(x - 0.06, y - 0.06, 0.12, 0.12);
      
      // Rebar
      this.pdf.circle(x - 0.02, y - 0.02, 0.01, 'F');
      this.pdf.circle(x + 0.02, y - 0.02, 0.01, 'F');
      this.pdf.circle(x - 0.02, y + 0.02, 0.01, 'F');
      this.pdf.circle(x + 0.02, y + 0.02, 0.01, 'F');
      
      // Tag
      this.pdf.setFontSize(5);
      this.pdf.text('F2', x + 0.08, y - 0.08);
    }
  }

  /**
   * Draw concrete hatch pattern
   */
  private drawConcreteHatch(x: number, y: number, width: number, height: number): void {
    this.setLineWeight('EXTRA_THIN');
    this.setColor('GRAY_LIGHT');
    
    const spacing = 0.02;
    const lines = Math.floor(width / spacing);
    
    for (let i = 0; i < lines; i++) {
      const lineX = x + i * spacing;
      this.pdf.line(lineX, y, lineX + spacing/2, y + height);
    }
  }

  /**
   * Draw dimension string with arrows
   */
  private drawDimensionString(x1: number, y1: number, x2: number, y2: number, 
                               text: string, orientation: 'horizontal' | 'vertical'): void {
    this.setLineWeight('EXTRA_THIN');
    
    if (orientation === 'horizontal') {
      // Dimension line
      this.pdf.line(x1, y1, x2, y2);
      
      // Extension lines
      this.pdf.line(x1, y1 - 0.05, x1, y1 + 0.05);
      this.pdf.line(x2, y2 - 0.05, x2, y2 + 0.05);
      
      // Arrows
      this.drawArrow(x1, y1, 'right');
      this.drawArrow(x2, y2, 'left');
      
      // Text
      this.pdf.setFontSize(7);
      this.pdf.text(text, (x1 + x2) / 2, y1 - 0.05, { align: 'center' });
    } else {
      // Vertical dimension
      this.pdf.line(x1, y1, x2, y2);
      
      // Extension lines
      this.pdf.line(x1 - 0.05, y1, x1 + 0.05, y1);
      this.pdf.line(x2 - 0.05, y2, x2 + 0.05, y2);
      
      // Arrows
      this.drawArrow(x1, y1, 'down');
      this.drawArrow(x2, y2, 'up');
      
      // Text
      this.pdf.setFontSize(7);
      this.pdf.text(text, x1 - 0.05, (y1 + y2) / 2, { align: 'center', angle: 90 });
    }
  }

  /**
   * Draw dimension arrow
   */
  private drawArrow(x: number, y: number, direction: 'up' | 'down' | 'left' | 'right'): void {
    const size = 0.04;
    
    switch (direction) {
      case 'right':
        this.pdf.line(x, y, x + size, y - size/2);
        this.pdf.line(x, y, x + size, y + size/2);
        break;
      case 'left':
        this.pdf.line(x, y, x - size, y - size/2);
        this.pdf.line(x, y, x - size, y + size/2);
        break;
      case 'up':
        this.pdf.line(x, y, x - size/2, y - size);
        this.pdf.line(x, y, x + size/2, y - size);
        break;
      case 'down':
        this.pdf.line(x, y, x - size/2, y + size);
        this.pdf.line(x, y, x + size/2, y + size);
        break;
    }
  }

  /**
   * Draw detail bubble
   */
  private drawDetailBubble(x: number, y: number, number: string, sheet: string): void {
    this.setLineWeight('THICK');
    this.setColor('BLACK');
    
    // Outer circle
    this.pdf.circle(x, y, 0.15);
    
    // Dividing line
    this.pdf.line(x - 0.15, y, x + 0.15, y);
    
    // Detail number (top)
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(number, x, y - 0.05, { align: 'center' });
    
    // Sheet reference (bottom)
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(sheet, x, y + 0.08, { align: 'center' });
  }

  /**
   * Draw structural notes
   */
  private drawStructuralNotes(x: number, y: number): void {
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('STRUCTURAL NOTES:', x, y);
    
    const notes = [
      '1. ALL STRUCTURAL STEEL SHALL CONFORM TO ASTM A992, Fy = 50 KSI.',
      '2. ALL HSS SECTIONS SHALL CONFORM TO ASTM A500 GRADE B.',
      '3. ALL BOLTS SHALL BE ASTM A325-N IN STANDARD HOLES U.N.O.',
      '4. ALL WELDING SHALL BE E70XX ELECTRODES, PER AWS D1.1.',
      '5. ALL STEEL SHALL BE HOT-DIP GALVANIZED PER ASTM A123.',
      '6. CONCRETE SHALL BE 3000 PSI @ 28 DAYS, NORMAL WEIGHT.',
      '7. REINFORCING STEEL SHALL BE ASTM A615 GRADE 60.',
      '8. SPECIAL INSPECTION REQUIRED PER IBC CHAPTER 17.',
      '9. WIND: 115 MPH, EXPOSURE C, RISK CATEGORY II.',
      '10. SEISMIC: SDC D, Ss=1.5g, S1=0.6g, SITE CLASS D.'
    ];
    
    this.pdf.setFontSize(6);
    this.pdf.setFont('helvetica', 'normal');
    notes.forEach((note, i) => {
      this.pdf.text(note, x, y + 0.3 + i * 0.15);
    });
  }

  /**
   * Draw structural legend
   */
  private drawStructuralLegend(x: number, y: number): void {
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('LEGEND:', x, y);
    
    const legendItems = [
      { symbol: '━━━', desc: 'BEAM ABOVE', color: 'RED' },
      { symbol: '┅┅┅', desc: 'BEAM BELOW', color: 'RED' },
      { symbol: '●', desc: 'COLUMN', color: 'BLACK' },
      { symbol: '□', desc: 'FOOTING', color: 'BLACK' },
      { symbol: '╳', desc: 'BRACING', color: 'MAGENTA' }
    ];
    
    this.pdf.setFontSize(6);
    legendItems.forEach((item, i) => {
      const itemY = y + 0.3 + i * 0.2;
      
      // Draw symbol
      this.setColor(item.color as any);
      this.pdf.text(item.symbol, x, itemY);
      
      // Description
      this.setColor('BLACK');
      this.pdf.text(item.desc, x + 0.5, itemY);
    });
  }

  /**
   * Draw structural schedule
   */
  private drawStructuralSchedule(x: number, y: number): void {
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('BEAM SCHEDULE:', x, y);
    
    // Table headers
    this.pdf.setFontSize(6);
    const headers = ['MARK', 'SIZE', 'LENGTH', 'CAMBER'];
    const colX = [x, x + 0.5, x + 1.5, x + 2.5];
    
    headers.forEach((header, i) => {
      this.pdf.text(header, colX[i], y + 0.3);
    });
    
    // Table data
    const beams = [
      ['B1', 'W21×44', "24'-0\"", '1"'],
      ['B2', 'W18×35', "24'-0\"", '3/4"'],
      ['B3', 'W16×31', "20'-0\"", '1/2"'],
      ['G1', 'C10×15.3', "24'-0\"", 'NONE']
    ];
    
    this.pdf.setFont('helvetica', 'normal');
    beams.forEach((beam, i) => {
      const rowY = y + 0.5 + i * 0.15;
      beam.forEach((cell, j) => {
        this.pdf.text(cell, colX[j], rowY);
      });
    });
  }

  /**
   * Helper methods
   */
  private setLineWeight(weight: keyof typeof this.LINE_WEIGHTS): void {
    this.pdf.setLineWidth(this.LINE_WEIGHTS[weight]);
  }

  private setColor(color: keyof typeof this.COLORS): void {
    const rgb = this.COLORS[color];
    this.pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
    this.pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
  }

  private addNewSheet(): void {
    if (this.currentPage > 0) {
      this.pdf.addPage([36, 24], 'landscape');
    }
    this.currentPage++;
    
    // Draw border
    this.setLineWeight('THICK');
    this.setColor('BLACK');
    this.pdf.rect(0.5, 0.5, 35, 23);
  }

  /**
   * Draw roof framing plan overlay
   */
  private drawRoofFraming(x: number, y: number, length: number, width: number, scale: number): void {
    // Show roof slope and drainage
    this.setLineWeight('THIN');
    this.setColor('CYAN');
    this.pdf.setLineDashPattern([0.1, 0.1], 0);
    
    // Ridge lines
    this.pdf.line(x, y + width/2, x + length, y + width/2);
    
    // Slope arrows
    for (let i = 0; i < 10; i++) {
      const arrowX = x + (i + 1) * (length / 11);
      this.drawSlopeArrow(arrowX, y + width/4, 'down');
      this.drawSlopeArrow(arrowX, y + 3*width/4, 'up');
    }
    
    // Roof slope notation
    this.pdf.setFontSize(6);
    this.pdf.text('SLOPE 1/4":12"', x + length/2, y + width/4);
    
    this.pdf.setLineDashPattern([], 0);
  }

  /**
   * Draw slope arrow for roof
   */
  private drawSlopeArrow(x: number, y: number, direction: 'up' | 'down'): void {
    const length = 0.3;
    const dir = direction === 'up' ? -1 : 1;
    
    this.pdf.line(x, y, x, y + dir * length);
    this.pdf.line(x, y + dir * length, x - 0.05, y + dir * (length - 0.05));
    this.pdf.line(x, y + dir * length, x + 0.05, y + dir * (length - 0.05));
  }

  /**
   * Get the generated PDF
   */
  public getOutput(): Blob {
    return this.pdf.output('blob');
  }
}