/**
 * Detail Callout System
 * Professional detail bubble management with automatic sheet referencing
 */

export interface DetailCallout {
  id: string;
  number: string;
  sheetNumber: string;
  title: string;
  scale: string;
  boundaryPoints: { x: number; y: number }[];
  leaderPoint: { x: number; y: number };
  bubblePosition: { x: number; y: number };
  bubbleSize: number;
  showTitle: boolean;
  showScale: boolean;
  layer: string;
  viewportId?: string;
  parentDrawing: string;
  created: Date;
  lastModified: Date;
}

export interface DetailSheet {
  id: string;
  number: string;
  title: string;
  scale: string;
  details: DetailCallout[];
  drawingArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  titleBlock: {
    projectName: string;
    drawingTitle: string;
    drawnBy: string;
    checkedBy: string;
    date: Date;
    revision: string;
  };
}

export interface CalloutStyle {
  bubbleRadius: number;
  bubbleStroke: string;
  bubbleFill: string;
  textColor: string;
  textSize: number;
  textFont: string;
  leaderStroke: string;
  leaderWeight: number;
  boundaryStroke: string;
  boundaryWeight: number;
  boundaryDash: number[];
}

export class DetailCalloutSystem {
  private callouts: Map<string, DetailCallout> = new Map();
  private sheets: Map<string, DetailSheet> = new Map();
  private calloutCounter: number = 1;
  private sheetCounter: number = 1;
  
  private defaultStyle: CalloutStyle = {
    bubbleRadius: 12,
    bubbleStroke: '#000000',
    bubbleFill: '#FFFFFF',
    textColor: '#000000',
    textSize: 10,
    textFont: 'Arial',
    leaderStroke: '#000000',
    leaderWeight: 1,
    boundaryStroke: '#FF0000',
    boundaryWeight: 2,
    boundaryDash: [5, 5]
  };

  /**
   * Create a new detail callout
   */
  createCallout(
    boundaryPoints: { x: number; y: number }[],
    bubblePosition: { x: number; y: number },
    options: {
      title?: string;
      scale?: string;
      sheetNumber?: string;
      showTitle?: boolean;
      showScale?: boolean;
      layer?: string;
      parentDrawing?: string;
    } = {}
  ): DetailCallout {
    const id = `callout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const calloutNumber = this.getNextCalloutNumber();
    const sheetNumber = options.sheetNumber || this.getNextSheetNumber();
    
    // Calculate leader point (closest boundary point to bubble)
    const leaderPoint = this.findClosestBoundaryPoint(boundaryPoints, bubblePosition);
    
    const callout: DetailCallout = {
      id,
      number: calloutNumber,
      sheetNumber,
      title: options.title || `Detail ${calloutNumber}`,
      scale: options.scale || '1:10',
      boundaryPoints,
      leaderPoint,
      bubblePosition,
      bubbleSize: this.defaultStyle.bubbleRadius,
      showTitle: options.showTitle ?? true,
      showScale: options.showScale ?? true,
      layer: options.layer || 'A-ANNO-DETL',
      parentDrawing: options.parentDrawing || 'current',
      created: new Date(),
      lastModified: new Date()
    };

    this.callouts.set(id, callout);
    
    // Auto-create detail sheet if needed
    if (!this.sheets.has(sheetNumber)) {
      this.createDetailSheet(sheetNumber, callout.title);
    }
    
    this.updateSheetWithDetail(sheetNumber, callout);
    
    return callout;
  }

  /**
   * Create a new detail sheet
   */
  createDetailSheet(
    sheetNumber: string,
    title: string,
    options: {
      scale?: string;
      projectName?: string;
      drawnBy?: string;
      checkedBy?: string;
    } = {}
  ): DetailSheet {
    const sheet: DetailSheet = {
      id: `sheet_${sheetNumber}`,
      number: sheetNumber,
      title,
      scale: options.scale || '1:10',
      details: [],
      drawingArea: {
        x: 50,
        y: 50,
        width: 750,
        height: 550
      },
      titleBlock: {
        projectName: options.projectName || 'Vibelux Greenhouse Project',
        drawingTitle: title,
        drawnBy: options.drawnBy || 'VibeLux CAD',
        checkedBy: options.checkedBy || '',
        date: new Date(),
        revision: 'A'
      }
    };

    this.sheets.set(sheetNumber, sheet);
    return sheet;
  }

  /**
   * Update callout properties
   */
  updateCallout(
    id: string,
    updates: Partial<DetailCallout>
  ): DetailCallout | null {
    const callout = this.callouts.get(id);
    if (!callout) return null;

    const updatedCallout = {
      ...callout,
      ...updates,
      lastModified: new Date()
    };

    this.callouts.set(id, updatedCallout);
    
    // Update sheet reference if sheet number changed
    if (updates.sheetNumber && updates.sheetNumber !== callout.sheetNumber) {
      this.removeDetailFromSheet(callout.sheetNumber, id);
      this.updateSheetWithDetail(updates.sheetNumber, updatedCallout);
    }

    return updatedCallout;
  }

  /**
   * Delete callout
   */
  deleteCallout(id: string): boolean {
    const callout = this.callouts.get(id);
    if (!callout) return false;

    this.removeDetailFromSheet(callout.sheetNumber, id);
    this.callouts.delete(id);
    return true;
  }

  /**
   * Generate SVG for callout bubble
   */
  generateCalloutSVG(
    callout: DetailCallout,
    style: Partial<CalloutStyle> = {}
  ): string {
    const actualStyle = { ...this.defaultStyle, ...style };
    const { bubblePosition, leaderPoint, number, sheetNumber } = callout;
    
    let svg = `<g id="callout-${callout.id}" class="detail-callout">`;
    
    // Leader line
    svg += `
      <line 
        x1="${bubblePosition.x}" y1="${bubblePosition.y}"
        x2="${leaderPoint.x}" y2="${leaderPoint.y}"
        stroke="${actualStyle.leaderStroke}"
        stroke-width="${actualStyle.leaderWeight}"
        class="callout-leader"
      />`;
    
    // Bubble circle
    svg += `
      <circle 
        cx="${bubblePosition.x}" cy="${bubblePosition.y}"
        r="${actualStyle.bubbleRadius}"
        stroke="${actualStyle.bubbleStroke}"
        fill="${actualStyle.bubbleFill}"
        stroke-width="1"
        class="callout-bubble"
      />`;
    
    // Detail number (top half of bubble)
    const numberY = bubblePosition.y - 2;
    svg += `
      <text 
        x="${bubblePosition.x}" y="${numberY}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="${actualStyle.textFont}"
        font-size="${actualStyle.textSize}"
        font-weight="bold"
        fill="${actualStyle.textColor}"
        class="callout-number"
      >${number}</text>`;
    
    // Sheet number (bottom half of bubble)
    const sheetY = bubblePosition.y + 6;
    svg += `
      <text 
        x="${bubblePosition.x}" y="${sheetY}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="${actualStyle.textFont}"
        font-size="${actualStyle.textSize - 2}"
        fill="${actualStyle.textColor}"
        class="callout-sheet"
      >${sheetNumber}</text>`;
    
    // Title and scale (if enabled)
    if (callout.showTitle || callout.showScale) {
      const textY = bubblePosition.y + actualStyle.bubbleRadius + 15;
      let labelText = '';
      
      if (callout.showTitle) labelText += callout.title;
      if (callout.showTitle && callout.showScale) labelText += ' - ';
      if (callout.showScale) labelText += `SCALE: ${callout.scale}`;
      
      svg += `
        <text 
          x="${bubblePosition.x}" y="${textY}"
          text-anchor="middle"
          font-family="${actualStyle.textFont}"
          font-size="${actualStyle.textSize - 1}"
          fill="${actualStyle.textColor}"
          class="callout-label"
        >${labelText}</text>`;
    }
    
    svg += '</g>';
    return svg;
  }

  /**
   * Generate SVG for detail boundary
   */
  generateBoundarySVG(
    callout: DetailCallout,
    style: Partial<CalloutStyle> = {}
  ): string {
    const actualStyle = { ...this.defaultStyle, ...style };
    const { boundaryPoints } = callout;
    
    if (boundaryPoints.length < 3) return '';
    
    let pathData = `M ${boundaryPoints[0].x} ${boundaryPoints[0].y}`;
    for (let i = 1; i < boundaryPoints.length; i++) {
      pathData += ` L ${boundaryPoints[i].x} ${boundaryPoints[i].y}`;
    }
    pathData += ' Z'; // Close path
    
    return `
      <path 
        d="${pathData}"
        stroke="${actualStyle.boundaryStroke}"
        stroke-width="${actualStyle.boundaryWeight}"
        stroke-dasharray="${actualStyle.boundaryDash.join(',')}"
        fill="none"
        class="detail-boundary"
        id="boundary-${callout.id}"
      />`;
  }

  /**
   * Auto-arrange callouts to avoid overlaps
   */
  autoArrangeCallouts(callouts: DetailCallout[]): DetailCallout[] {
    const arranged = [...callouts];
    const minDistance = 50; // Minimum distance between bubbles
    
    for (let i = 0; i < arranged.length; i++) {
      for (let j = i + 1; j < arranged.length; j++) {
        const callout1 = arranged[i];
        const callout2 = arranged[j];
        
        const distance = Math.sqrt(
          Math.pow(callout1.bubblePosition.x - callout2.bubblePosition.x, 2) +
          Math.pow(callout1.bubblePosition.y - callout2.bubblePosition.y, 2)
        );
        
        if (distance < minDistance) {
          // Move callout2 away from callout1
          const angle = Math.atan2(
            callout2.bubblePosition.y - callout1.bubblePosition.y,
            callout2.bubblePosition.x - callout1.bubblePosition.x
          );
          
          callout2.bubblePosition.x = callout1.bubblePosition.x + Math.cos(angle) * minDistance;
          callout2.bubblePosition.y = callout1.bubblePosition.y + Math.sin(angle) * minDistance;
          
          // Update leader point
          callout2.leaderPoint = this.findClosestBoundaryPoint(
            callout2.boundaryPoints,
            callout2.bubblePosition
          );
        }
      }
    }
    
    return arranged;
  }

  /**
   * Generate detail sheet layout
   */
  generateDetailSheetSVG(
    sheetNumber: string,
    options: {
      width?: number;
      height?: number;
      showTitleBlock?: boolean;
    } = {}
  ): string {
    const sheet = this.sheets.get(sheetNumber);
    if (!sheet) return '';
    
    const width = options.width || 850;
    const height = options.height || 650;
    const showTitleBlock = options.showTitleBlock ?? true;
    
    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    
    // Drawing border
    svg += `
      <rect 
        x="25" y="25" 
        width="${width - 50}" height="${height - 50}"
        stroke="#000000" stroke-width="2" fill="none"
        class="sheet-border"
      />`;
    
    // Drawing area
    const { drawingArea } = sheet;
    svg += `
      <rect 
        x="${drawingArea.x}" y="${drawingArea.y}" 
        width="${drawingArea.width}" height="${drawingArea.height}"
        stroke="#CCCCCC" stroke-width="1" fill="none"
        stroke-dasharray="5,5"
        class="drawing-area"
      />`;
    
    // Title block
    if (showTitleBlock) {
      svg += this.generateTitleBlockSVG(sheet, width, height);
    }
    
    // Detail views (placeholder rectangles)
    let detailY = drawingArea.y + 20;
    sheet.details.forEach((detail, index) => {
      const detailWidth = 200;
      const detailHeight = 150;
      const detailX = drawingArea.x + 20 + (index % 3) * (detailWidth + 20);
      
      if (index > 0 && index % 3 === 0) {
        detailY += detailHeight + 40;
      }
      
      // Detail view border
      svg += `
        <rect 
          x="${detailX}" y="${detailY}" 
          width="${detailWidth}" height="${detailHeight}"
          stroke="#000000" stroke-width="1" fill="none"
          class="detail-view"
        />`;
      
      // Detail title
      svg += `
        <text 
          x="${detailX + detailWidth / 2}" y="${detailY + detailHeight + 15}"
          text-anchor="middle"
          font-family="Arial" font-size="10" font-weight="bold"
          class="detail-title"
        >${detail.title}</text>`;
      
      // Detail scale
      svg += `
        <text 
          x="${detailX + detailWidth / 2}" y="${detailY + detailHeight + 30}"
          text-anchor="middle"
          font-family="Arial" font-size="8"
          class="detail-scale"
        >SCALE: ${detail.scale}</text>`;
    });
    
    svg += '</svg>';
    return svg;
  }

  /**
   * Generate title block SVG
   */
  private generateTitleBlockSVG(
    sheet: DetailSheet,
    sheetWidth: number,
    sheetHeight: number
  ): string {
    const titleBlockWidth = 250;
    const titleBlockHeight = 100;
    const x = sheetWidth - titleBlockWidth - 30;
    const y = sheetHeight - titleBlockHeight - 30;
    
    let svg = `
      <g class="title-block">
        <rect 
          x="${x}" y="${y}" 
          width="${titleBlockWidth}" height="${titleBlockHeight}"
          stroke="#000000" stroke-width="1" fill="#FFFFFF"
        />`;
    
    // Title block grid
    const cellHeight = titleBlockHeight / 5;
    for (let i = 1; i < 5; i++) {
      svg += `
        <line 
          x1="${x}" y1="${y + i * cellHeight}"
          x2="${x + titleBlockWidth}" y2="${y + i * cellHeight}"
          stroke="#000000" stroke-width="0.5"
        />`;
    }
    
    // Vertical divider
    svg += `
      <line 
        x1="${x + titleBlockWidth * 0.6}" y1="${y}"
        x2="${x + titleBlockWidth * 0.6}" y2="${y + titleBlockHeight}"
        stroke="#000000" stroke-width="0.5"
      />`;
    
    // Title block text
    const textX1 = x + 10;
    const textX2 = x + titleBlockWidth * 0.6 + 10;
    
    svg += `
      <text x="${textX1}" y="${y + cellHeight * 0.7}" font-family="Arial" font-size="14" font-weight="bold">
        ${sheet.titleBlock.projectName}
      </text>
      <text x="${textX1}" y="${y + cellHeight * 1.7}" font-family="Arial" font-size="12" font-weight="bold">
        ${sheet.titleBlock.drawingTitle}
      </text>
      <text x="${textX1}" y="${y + cellHeight * 2.5}" font-family="Arial" font-size="9">
        DRAWN BY: ${sheet.titleBlock.drawnBy}
      </text>
      <text x="${textX1}" y="${y + cellHeight * 3.3}" font-family="Arial" font-size="9">
        CHECKED BY: ${sheet.titleBlock.checkedBy}
      </text>
      <text x="${textX1}" y="${y + cellHeight * 4.1}" font-family="Arial" font-size="9">
        DATE: ${sheet.titleBlock.date.toLocaleDateString()}
      </text>
      
      <text x="${textX2}" y="${y + cellHeight * 1.5}" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle">
        ${sheet.number}
      </text>
      <text x="${textX2}" y="${y + cellHeight * 2.5}" font-family="Arial" font-size="12" text-anchor="middle">
        SHEET
      </text>
      <text x="${textX2}" y="${y + cellHeight * 4.1}" font-family="Arial" font-size="10" text-anchor="middle">
        REV: ${sheet.titleBlock.revision}
      </text>`;
    
    svg += '</g>';
    return svg;
  }

  /**
   * Utility methods
   */
  private getNextCalloutNumber(): string {
    return (this.calloutCounter++).toString();
  }

  private getNextSheetNumber(): string {
    return `D${this.sheetCounter++}`;
  }

  private findClosestBoundaryPoint(
    boundaryPoints: { x: number; y: number }[],
    bubblePosition: { x: number; y: number }
  ): { x: number; y: number } {
    let closest = boundaryPoints[0];
    let minDistance = Infinity;
    
    boundaryPoints.forEach(point => {
      const distance = Math.sqrt(
        Math.pow(point.x - bubblePosition.x, 2) +
        Math.pow(point.y - bubblePosition.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closest = point;
      }
    });
    
    return closest;
  }

  private updateSheetWithDetail(sheetNumber: string, callout: DetailCallout): void {
    const sheet = this.sheets.get(sheetNumber);
    if (sheet) {
      const existingIndex = sheet.details.findIndex(d => d.id === callout.id);
      if (existingIndex >= 0) {
        sheet.details[existingIndex] = callout;
      } else {
        sheet.details.push(callout);
      }
    }
  }

  private removeDetailFromSheet(sheetNumber: string, calloutId: string): void {
    const sheet = this.sheets.get(sheetNumber);
    if (sheet) {
      sheet.details = sheet.details.filter(d => d.id !== calloutId);
    }
  }

  /**
   * Public API
   */
  getAllCallouts(): DetailCallout[] {
    return Array.from(this.callouts.values());
  }

  getCallout(id: string): DetailCallout | null {
    return this.callouts.get(id) || null;
  }

  getAllSheets(): DetailSheet[] {
    return Array.from(this.sheets.values());
  }

  getSheet(sheetNumber: string): DetailSheet | null {
    return this.sheets.get(sheetNumber) || null;
  }

  getCalloutsForSheet(sheetNumber: string): DetailCallout[] {
    return Array.from(this.callouts.values()).filter(
      callout => callout.sheetNumber === sheetNumber
    );
  }

  exportSheetData(sheetNumber: string): DetailSheet | null {
    return this.getSheet(sheetNumber);
  }

  importSheetData(sheetData: DetailSheet): boolean {
    try {
      this.sheets.set(sheetData.number, sheetData);
      sheetData.details.forEach(detail => {
        this.callouts.set(detail.id, detail);
      });
      return true;
    } catch (error) {
      console.error('Failed to import sheet data:', error);
      return false;
    }
  }

  renumberCallouts(startNumber: number = 1): void {
    const callouts = Array.from(this.callouts.values())
      .sort((a, b) => a.created.getTime() - b.created.getTime());
    
    callouts.forEach((callout, index) => {
      callout.number = (startNumber + index).toString();
      callout.lastModified = new Date();
    });
  }

  validateSheetReferences(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    this.callouts.forEach(callout => {
      if (!this.sheets.has(callout.sheetNumber)) {
        issues.push(`Callout ${callout.number} references non-existent sheet ${callout.sheetNumber}`);
      }
    });
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}

export default DetailCalloutSystem;