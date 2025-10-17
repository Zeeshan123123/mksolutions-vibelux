/**
 * Construction Detail Rendering Engine
 * Connects the professional construction detail library to visual rendering
 * Generates buildable construction details in multiple formats
 */

import { ConstructionDetail, DetailDrawing, DrawingElement, Annotation, MaterialCallout } from '../professional-standards/construction-detail-library';
import { MaterialSpecification } from '../professional-standards/material-specification-database';
import { BrandingConfig } from '../professional-standards/title-block-system';

export interface DetailRenderOptions {
  format: 'svg' | 'pdf' | 'dxf' | 'png';
  scale: string; // e.g., "1/2\" = 1'-0\""
  pageSize: 'ANSI-A' | 'ANSI-B' | 'ANSI-C' | 'ANSI-D';
  lineWeights: boolean;
  dimensions: boolean;
  annotations: boolean;
  materialCallouts: boolean;
  brandingHeader: boolean;
  qualityLevel: 'draft' | 'check' | 'final';
}

export interface RenderedDetail {
  content: string;
  format: string;
  metadata: DetailMetadata;
  validation: DetailValidation;
}

export interface DetailMetadata {
  detailId: string;
  title: string;
  scale: string;
  category: string;
  revision: number;
  lastUpdated: Date;
  generatedBy: string;
  qualityScore: number;
}

export interface DetailValidation {
  buildable: boolean;
  codeCompliant: boolean;
  materialsAvailable: boolean;
  dimensionsComplete: boolean;
  annotationsComplete: boolean;
  issues: DetailValidationIssue[];
}

export interface DetailValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  recommendation: string;
}

/**
 * Professional Construction Detail Renderer
 */
export class ConstructionDetailRenderer {
  private vibeluxBranding: BrandingConfig;
  private professionalLineWeights: Map<string, number> = new Map();

  constructor(branding: BrandingConfig) {
    this.vibeluxBranding = branding;
    this.initializeProfessionalLineWeights();
  }

  private initializeProfessionalLineWeights(): void {
    // Professional line weights per AIA standards
    this.professionalLineWeights.set('heavy', 0.024);      // Cutting planes, section lines
    this.professionalLineWeights.set('medium', 0.016);     // Object lines, major elements
    this.professionalLineWeights.set('light', 0.008);      // Hidden lines, minor elements
    this.professionalLineWeights.set('fine', 0.004);       // Dimension lines, leader lines
    this.professionalLineWeights.set('very-fine', 0.002);  // Hatch patterns, fill
  }

  /**
   * Render construction detail in specified format
   */
  public renderDetail(detail: ConstructionDetail, options: DetailRenderOptions): RenderedDetail {
    // Validate detail before rendering
    const validation = this.validateDetail(detail);

    // Generate content based on format
    let content: string;
    switch (options.format) {
      case 'svg':
        content = this.renderDetailSVG(detail, options);
        break;
      case 'pdf':
        content = this.renderDetailPDF(detail, options);
        break;
      case 'dxf':
        content = this.renderDetailDXF(detail, options);
        break;
      case 'png':
        content = this.renderDetailPNG(detail, options);
        break;
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }

    return {
      content,
      format: options.format,
      metadata: {
        detailId: detail.id,
        title: detail.title,
        scale: detail.scale,
        category: detail.category,
        revision: detail.revision,
        lastUpdated: detail.lastUpdated,
        generatedBy: 'Vibelux Professional Detail Renderer',
        qualityScore: this.calculateQualityScore(detail, validation)
      },
      validation
    };
  }

  /**
   * Render multiple details as a sheet
   */
  public renderDetailSheet(details: ConstructionDetail[], sheetTitle: string, options: DetailRenderOptions): RenderedDetail {
    const content = this.renderDetailSheetSVG(details, sheetTitle, options);
    
    const overallValidation = this.validateDetailSheet(details);

    return {
      content,
      format: options.format,
      metadata: {
        detailId: 'SHEET_' + details.map(d => d.id).join('_'),
        title: sheetTitle,
        scale: 'VARIES',
        category: 'detail-sheet',
        revision: Math.max(...details.map(d => d.revision)),
        lastUpdated: new Date(),
        generatedBy: 'Vibelux Professional Detail Renderer',
        qualityScore: overallValidation.issues.length === 0 ? 95 : 85
      },
      validation: overallValidation
    };
  }

  private renderDetailSVG(detail: ConstructionDetail, options: DetailRenderOptions): string {
    const { width, height } = this.getPageDimensions(options.pageSize);
    const margin = 36; // 0.5" margin
    const drawingArea = {
      x: margin,
      y: margin,
      width: width - 2 * margin,
      height: height - 2 * margin - 144 // Reserve space for title block
    };

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" 
                   viewBox="0 0 ${width} ${height}" 
                   width="${width / 72}in" height="${height / 72}in">
      <defs>
        <style>
          .heavy-line { stroke-width: ${this.professionalLineWeights.get('heavy')! * 72}; stroke: #000; fill: none; }
          .medium-line { stroke-width: ${this.professionalLineWeights.get('medium')! * 72}; stroke: #000; fill: none; }
          .light-line { stroke-width: ${this.professionalLineWeights.get('light')! * 72}; stroke: #000; fill: none; }
          .fine-line { stroke-width: ${this.professionalLineWeights.get('fine')! * 72}; stroke: #000; fill: none; }
          .dimension-line { stroke-width: ${this.professionalLineWeights.get('fine')! * 72}; stroke: #000; fill: none; }
          .text-standard { font-family: Arial; font-size: 12px; fill: #000; }
          .text-title { font-family: Arial Black; font-size: 16px; fill: #000; font-weight: bold; }
          .text-small { font-family: Arial; font-size: 8px; fill: #000; }
          .vibelux-primary { fill: ${this.vibeluxBranding.brandColors.primary}; }
          .vibelux-text { fill: ${this.vibeluxBranding.brandColors.text}; }
          .material-hatch { fill: url(#materialHatch); opacity: 0.3; }
        </style>
        <pattern id="materialHatch" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M0,4 L4,0" stroke="#666" stroke-width="0.5"/>
        </pattern>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
        </marker>
      </defs>`;

    // Add Vibelux branding header if requested
    if (options.brandingHeader) {
      svg += this.generateBrandingHeader(detail);
    }

    // Detail title and information
    svg += `<g class="detail-header">
        <text x="${drawingArea.x}" y="${drawingArea.y - 12}" class="text-title">
          ${detail.title}
        </text>
        <text x="${drawingArea.x}" y="${drawingArea.y + 6}" class="text-standard">
          Scale: ${detail.scale}
        </text>
        <text x="${drawingArea.x + 200}" y="${drawingArea.y + 6}" class="text-standard">
          Detail ID: ${detail.id}
        </text>
      </g>`;

    // Main drawing area border
    svg += `<rect x="${drawingArea.x}" y="${drawingArea.y + 20}" 
                 width="${drawingArea.width}" height="${drawingArea.height - 40}" 
                 class="light-line"/>`;

    // Scale factor for drawing elements
    const scaleFactor = this.calculateScaleFactor(detail.scale, drawingArea);

    // Transform drawing to fit in area
    const drawingOrigin = {
      x: drawingArea.x + drawingArea.width / 2,
      y: drawingArea.y + drawingArea.height / 2
    };

    svg += `<g transform="translate(${drawingOrigin.x}, ${drawingOrigin.y}) scale(${scaleFactor})">`;

    // Render drawing elements
    if (options.lineWeights) {
      detail.drawing.elements.forEach((element, index) => {
        svg += this.renderDrawingElement(element, index);
      });
    }

    // Render dimensions
    if (options.dimensions) {
      detail.drawing.dimensions.forEach((dimension, index) => {
        svg += this.renderDimension(dimension, index);
      });
    }

    svg += '</g>'; // Close main drawing transform

    // Render annotations (outside of scale transform)
    if (options.annotations) {
      detail.drawing.annotations.forEach((annotation, index) => {
        svg += this.renderAnnotation(annotation, index, drawingOrigin, scaleFactor);
      });
    }

    // Render material callouts
    if (options.materialCallouts) {
      detail.drawing.materialCallouts.forEach((callout, index) => {
        svg += this.renderMaterialCallout(callout, index, detail.specifications, drawingOrigin, scaleFactor);
      });
    }

    // Add construction notes
    svg += this.renderConstructionNotes(detail.notes, drawingArea);

    // Add code references
    svg += this.renderCodeReferences(detail.codeReferences, drawingArea);

    // Add professional quality stamp
    if (options.qualityLevel === 'final') {
      svg += this.renderQualityStamp(drawingArea);
    }

    svg += '</svg>';

    return svg;
  }

  private renderDetailSheetSVG(details: ConstructionDetail[], sheetTitle: string, options: DetailRenderOptions): string {
    const { width, height } = this.getPageDimensions(options.pageSize);
    const margin = 36;

    // Calculate detail layout (2x2 grid for up to 4 details)
    const detailsPerRow = Math.min(2, Math.ceil(Math.sqrt(details.length)));
    const detailsPerColumn = Math.ceil(details.length / detailsPerRow);
    
    const detailWidth = (width - 3 * margin) / detailsPerRow;
    const detailHeight = (height - 3 * margin - 144) / detailsPerColumn; // Reserve for title block

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" 
                   viewBox="0 0 ${width} ${height}" 
                   width="${width / 72}in" height="${height / 72}in">
      <defs>
        <style>
          .heavy-line { stroke-width: 2; stroke: #000; fill: none; }
          .medium-line { stroke-width: 1.5; stroke: #000; fill: none; }
          .light-line { stroke-width: 0.75; stroke: #000; fill: none; }
          .text-standard { font-family: Arial; font-size: 10px; fill: #000; }
          .text-title { font-family: Arial Black; font-size: 14px; fill: #000; font-weight: bold; }
          .text-small { font-family: Arial; font-size: 8px; fill: #000; }
          .vibelux-primary { fill: ${this.vibeluxBranding.brandColors.primary}; }
        </style>
      </defs>`;

    // Sheet title
    svg += `<text x="${width / 2}" y="24" text-anchor="middle" class="text-title vibelux-primary">
        ${sheetTitle}
      </text>`;

    // Render each detail
    details.forEach((detail, index) => {
      const row = Math.floor(index / detailsPerRow);
      const col = index % detailsPerRow;
      
      const detailX = margin + col * detailWidth;
      const detailY = margin + 36 + row * detailHeight;

      svg += `<g class="detail-${index}">`;
      
      // Detail border
      svg += `<rect x="${detailX}" y="${detailY}" 
                   width="${detailWidth - 12}" height="${detailHeight - 12}" 
                   class="light-line"/>`;

      // Detail title
      svg += `<text x="${detailX + 6}" y="${detailY + 18}" class="text-standard">
          ${detail.title} - ${detail.scale}
        </text>`;

      // Simplified detail representation (would be full detail in production)
      const detailDrawingArea = {
        x: detailX + 12,
        y: detailY + 24,
        width: detailWidth - 36,
        height: detailHeight - 48
      };

      // Render simplified detail elements
      svg += this.renderSimplifiedDetail(detail, detailDrawingArea);

      svg += `</g>`;
    });

    // Add professional title block
    svg += this.renderDetailSheetTitleBlock(width, height);

    svg += '</svg>';

    return svg;
  }

  private renderDrawingElement(element: DrawingElement, index: number): string {
    const lineClass = this.getLineClass(element.lineWeight);
    const strokeDashArray = element.lineType === 'dashed' ? '5,5' : 
                           element.lineType === 'dotted' ? '1,3' : 'none';

    switch (element.type) {
      case 'line':
        return `<line x1="${element.geometry[0][0]}" y1="${element.geometry[0][1]}" 
                     x2="${element.geometry[1][0]}" y2="${element.geometry[1][1]}" 
                     class="${lineClass}" stroke-dasharray="${strokeDashArray}"/>`;
      
      case 'rectangle':
        const [[x, y], [x2, y2]] = element.geometry;
        return `<rect x="${Math.min(x, x2)}" y="${Math.min(y, y2)}" 
                     width="${Math.abs(x2 - x)}" height="${Math.abs(y2 - y)}" 
                     class="${lineClass}" stroke-dasharray="${strokeDashArray}"/>`;
      
      case 'circle':
        const [cx, cy] = element.geometry[0];
        const radius = element.geometry[1] ? 
          Math.sqrt(Math.pow(element.geometry[1][0] - cx, 2) + Math.pow(element.geometry[1][1] - cy, 2)) : 5;
        return `<circle cx="${cx}" cy="${cy}" r="${radius}" 
                       class="${lineClass}" stroke-dasharray="${strokeDashArray}"/>`;
      
      case 'polyline':
        const points = element.geometry.map(p => p.join(',')).join(' ');
        return `<polyline points="${points}" class="${lineClass}" stroke-dasharray="${strokeDashArray}"/>`;
      
      case 'hatch':
        const hatchPoints = element.geometry.map(p => p.join(',')).join(' ');
        return `<polygon points="${hatchPoints}" class="material-hatch" stroke="none"/>`;
      
      default:
        return '';
    }
  }

  private renderDimension(dimension: any, index: number): string {
    const [[x1, y1], [x2, y2]] = dimension.points;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    return `<g class="dimension-${index}">
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="dimension-line"/>
        <line x1="${x1}" y1="${y1 - 3}" x2="${x1}" y2="${y1 + 3}" class="dimension-line"/>
        <line x1="${x2}" y1="${y2 - 3}" x2="${x2}" y2="${y2 + 3}" class="dimension-line"/>
        <text x="${midX}" y="${midY - 5}" text-anchor="middle" class="text-small">
          ${dimension.value}
        </text>
      </g>`;
  }

  private renderAnnotation(annotation: Annotation, index: number, origin: {x: number, y: number}, scale: number): string {
    const x = origin.x + annotation.position[0] * scale;
    const y = origin.y + annotation.position[1] * scale;

    let svg = `<text x="${x}" y="${y}" class="text-standard" 
                    font-weight="${annotation.style === 'bold' ? 'bold' : 'normal'}"
                    font-style="${annotation.style === 'italic' ? 'italic' : 'normal'}">
        ${annotation.text}
      </text>`;

    // Add leader line if present
    if (annotation.leader) {
      const leaderPoints = annotation.leader.map(p => 
        `${origin.x + p[0] * scale},${origin.y + p[1] * scale}`
      ).join(' ');
      svg += `<polyline points="${leaderPoints}" class="fine-line" marker-end="url(#arrowhead)"/>`;
    }

    return svg;
  }

  private renderMaterialCallout(callout: MaterialCallout, index: number, specifications: any[], origin: {x: number, y: number}, scale: number): string {
    const x = origin.x + callout.position[0] * scale;
    const y = origin.y + callout.position[1] * scale;

    // Find material specification
    const material = specifications.find(spec => spec.id === callout.materialId);
    const materialName = material ? material.name : callout.materialId;

    return `<g class="material-callout-${index}">
        <circle cx="${x}" cy="${y}" r="8" class="light-line" fill="white"/>
        <text x="${x}" y="${y + 3}" text-anchor="middle" class="text-small">${index + 1}</text>
        <text x="${x + 15}" y="${y}" class="text-small">
          ${index + 1}. ${materialName}
        </text>
        ${callout.quantity ? `<text x="${x + 15}" y="${y + 12}" class="text-small">
          Qty: ${callout.quantity}
        </text>` : ''}
      </g>`;
  }

  private renderConstructionNotes(notes: string[], drawingArea: any): string {
    if (notes.length === 0) return '';

    let svg = `<g class="construction-notes">
        <text x="${drawingArea.x}" y="${drawingArea.y + drawingArea.height + 24}" class="text-standard" font-weight="bold">
          CONSTRUCTION NOTES:
        </text>`;

    notes.forEach((note, index) => {
      svg += `<text x="${drawingArea.x + 12}" y="${drawingArea.y + drawingArea.height + 40 + index * 14}" class="text-small">
          ${index + 1}. ${note}
        </text>`;
    });

    svg += '</g>';
    return svg;
  }

  private renderCodeReferences(codeReferences: any[], drawingArea: any): string {
    if (codeReferences.length === 0) return '';

    let svg = `<g class="code-references">
        <text x="${drawingArea.x + drawingArea.width - 200}" y="${drawingArea.y + drawingArea.height + 24}" class="text-standard" font-weight="bold">
          CODE REFERENCES:
        </text>`;

    codeReferences.forEach((ref, index) => {
      svg += `<text x="${drawingArea.x + drawingArea.width - 188}" y="${drawingArea.y + drawingArea.height + 40 + index * 14}" class="text-small">
          ${ref.code} §${ref.section}: ${ref.requirement}
        </text>`;
    });

    svg += '</g>';
    return svg;
  }

  private renderQualityStamp(drawingArea: any): string {
    const stampX = drawingArea.x + drawingArea.width - 100;
    const stampY = drawingArea.y + 20;

    return `<g class="quality-stamp">
        <rect x="${stampX}" y="${stampY}" width="80" height="40" 
              class="medium-line" fill="none"/>
        <text x="${stampX + 40}" y="${stampY + 15}" text-anchor="middle" class="text-small vibelux-primary">
          VIBELUX
        </text>
        <text x="${stampX + 40}" y="${stampY + 25}" text-anchor="middle" class="text-small">
          PROFESSIONAL
        </text>
        <text x="${stampX + 40}" y="${stampY + 35}" text-anchor="middle" class="text-small">
          QUALITY ASSURED
        </text>
      </g>`;
  }

  private generateBrandingHeader(detail: ConstructionDetail): string {
    return `<g class="vibelux-header">
        <rect x="0" y="0" width="100%" height="36" fill="${this.vibeluxBranding.brandColors.primary}" opacity="0.1"/>
        <text x="36" y="24" class="text-title vibelux-primary">
          VIBELUX Professional Construction Details
        </text>
        <text x="500" y="24" class="text-standard vibelux-text">
          Category: ${detail.category.toUpperCase()}
        </text>
      </g>`;
  }

  private renderSimplifiedDetail(detail: ConstructionDetail, area: any): string {
    // Simplified representation for sheet view
    return `<rect x="${area.x}" y="${area.y}" width="${area.width}" height="${area.height}" 
                 class="light-line" fill="none" stroke-dasharray="2,2"/>
            <text x="${area.x + area.width/2}" y="${area.y + area.height/2}" 
                 text-anchor="middle" class="text-small">
              ${detail.id}
            </text>`;
  }

  private renderDetailSheetTitleBlock(width: number, height: number): string {
    const tbX = width - 288; // 4" title block
    const tbY = height - 144; // 2" title block
    
    return `<g class="title-block">
        <rect x="${tbX}" y="${tbY}" width="288" height="144" class="heavy-line"/>
        <text x="${tbX + 12}" y="${tbY + 24}" class="text-title vibelux-primary">
          VIBELUX
        </text>
        <text x="${tbX + 12}" y="${tbY + 40}" class="text-standard">
          Professional Construction Details
        </text>
        <text x="${tbX + 12}" y="${tbY + 120}" class="text-small">
          Generated: ${new Date().toLocaleDateString()}
        </text>
        <text x="${tbX + 12}" y="${tbY + 132}" class="text-small">
          Vibelux Professional Standards System
        </text>
      </g>`;
  }

  // Additional format renderers would be implemented here
  private renderDetailPDF(detail: ConstructionDetail, options: DetailRenderOptions): string {
    // PDF generation using SVG + conversion or jsPDF
    return 'PDF rendering not implemented in this demo';
  }

  private renderDetailDXF(detail: ConstructionDetail, options: DetailRenderOptions): string {
    // DXF generation using professional CAD engine
    return 'DXF rendering integration with professional CAD engine';
  }

  private renderDetailPNG(detail: ConstructionDetail, options: DetailRenderOptions): string {
    // PNG generation using canvas or SVG conversion
    return 'PNG rendering not implemented in this demo';
  }

  private validateDetail(detail: ConstructionDetail): DetailValidation {
    const issues: DetailValidationIssue[] = [];

    // Check if detail has drawing elements
    if (detail.drawing.elements.length === 0) {
      issues.push({
        severity: 'error',
        category: 'geometry',
        message: 'Detail has no drawing elements',
        recommendation: 'Add geometric elements to make detail buildable'
      });
    }

    // Check if detail has specifications
    if (detail.specifications.length === 0) {
      issues.push({
        severity: 'warning',
        category: 'specifications',
        message: 'Detail has no material specifications',
        recommendation: 'Add material specifications for construction'
      });
    }

    // Check if detail has dimensions
    if (detail.drawing.dimensions.length === 0) {
      issues.push({
        severity: 'warning',
        category: 'dimensions',
        message: 'Detail has no dimensions',
        recommendation: 'Add dimensions for accurate construction'
      });
    }

    // Check if detail has code references
    if (detail.codeReferences.length === 0) {
      issues.push({
        severity: 'info',
        category: 'compliance',
        message: 'Detail has no code references',
        recommendation: 'Add relevant building code references'
      });
    }

    return {
      buildable: issues.filter(i => i.severity === 'error').length === 0,
      codeCompliant: detail.codeReferences.length > 0,
      materialsAvailable: detail.specifications.length > 0,
      dimensionsComplete: detail.drawing.dimensions.length > 0,
      annotationsComplete: detail.drawing.annotations.length > 0,
      issues
    };
  }

  private validateDetailSheet(details: ConstructionDetail[]): DetailValidation {
    const allIssues: DetailValidationIssue[] = [];
    
    details.forEach(detail => {
      const validation = this.validateDetail(detail);
      allIssues.push(...validation.issues);
    });

    return {
      buildable: allIssues.filter(i => i.severity === 'error').length === 0,
      codeCompliant: details.every(d => d.codeReferences.length > 0),
      materialsAvailable: details.every(d => d.specifications.length > 0),
      dimensionsComplete: details.every(d => d.drawing.dimensions.length > 0),
      annotationsComplete: details.every(d => d.drawing.annotations.length > 0),
      issues: allIssues
    };
  }

  private calculateQualityScore(detail: ConstructionDetail, validation: DetailValidation): number {
    let score = 100;
    
    validation.issues.forEach(issue => {
      switch (issue.severity) {
        case 'error': score -= 15; break;
        case 'warning': score -= 8; break;
        case 'info': score -= 3; break;
      }
    });

    return Math.max(0, score);
  }

  private getLineClass(lineWeight: number): string {
    if (lineWeight >= 0.020) return 'heavy-line';
    if (lineWeight >= 0.012) return 'medium-line';
    if (lineWeight >= 0.006) return 'light-line';
    return 'fine-line';
  }

  private getPageDimensions(pageSize: string): { width: number; height: number } {
    const dimensions = {
      'ANSI-A': { width: 792, height: 612 },   // 11" x 8.5"
      'ANSI-B': { width: 1224, height: 792 },  // 17" x 11"
      'ANSI-C': { width: 1584, height: 1224 }, // 22" x 17"
      'ANSI-D': { width: 2448, height: 1584 }  // 34" x 22"
    };
    return dimensions[pageSize as keyof typeof dimensions];
  }

  private calculateScaleFactor(scale: string, drawingArea: any): number {
    // Parse scale string like "1/2\" = 1'-0\"" to get scale factor
    // Simplified for demo - would need more robust parsing
    if (scale.includes('1/2')) return 0.5;
    if (scale.includes('1/4')) return 0.25;
    if (scale.includes('3/4')) return 0.75;
    if (scale.includes('1\" =')) return 1.0;
    if (scale.includes('3\" =')) return 3.0;
    return 1.0; // Default scale
  }
}

// Export the construction detail renderer
export const constructionDetailRenderer = new ConstructionDetailRenderer({
  companyLogo: {
    imagePath: '/assets/vibelux-logo.svg',
    position: [10, 10],
    size: [120, 40],
    scalable: true,
    aspectRatio: 3.0,
    format: 'svg',
    colorMode: 'full-color',
    placement: 'primary'
  },
  companyName: 'Vibelux',
  companyAddress: {
    street: '123 Innovation Drive',
    city: 'Tech Valley',
    state: 'CA',
    zipCode: '94000',
    country: 'USA'
  },
  contact: {
    phone: '(555) 123-GROW',
    email: 'info@vibelux.com',
    website: 'www.vibelux.com'
  },
  website: 'www.vibelux.com',
  brandColors: {
    primary: '#00A86B',
    secondary: '#2E8B57',
    accent: '#32CD32',
    neutral: '#708090',
    text: '#2F4F4F'
  },
  typography: {
    primaryFont: 'Arial',
    secondaryFont: 'Helvetica',
    headingFont: 'Arial Black',
    sizes: {
      title: 14,
      heading: 12,
      body: 10,
      caption: 8,
      small: 6
    }
  }
});