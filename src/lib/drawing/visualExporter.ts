/**
 * Visual export system for lighting designs
 * Generates PDF reports and JPG renders
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { CultivationLayout, LightPlacement } from './types';
import { fluenceLights } from './lightingSpecs';

interface ExportOptions {
  format: 'pdf' | 'jpg' | 'png';
  quality?: number;
  includeSpecs?: boolean;
  include3D?: boolean;
  includeMeasurements?: boolean;
}

export class VisualExporter {
  private static instance: VisualExporter;

  static getInstance(): VisualExporter {
    if (!VisualExporter.instance) {
      VisualExporter.instance = new VisualExporter();
    }
    return VisualExporter.instance;
  }

  /**
   * Generate PDF lighting plan
   */
  async generateLightingPDF(
    layout: CultivationLayout,
    fixtureModel: string = 'SPYDR 2p'
  ): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: 'letter'
    });

    const fixture = fluenceLights[fixtureModel];
    const pageWidth = 11;
    const pageHeight = 8.5;
    const margin = 0.5;

    // Title Page
    pdf.setFontSize(24);
    pdf.text('Lighting Design Plan', pageWidth / 2, 1, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text(`${layout.room.name || 'Cultivation Room'}`, pageWidth / 2, 1.5, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`${layout.room.dimensions.width}' × ${layout.room.dimensions.height}'`, pageWidth / 2, 2, { align: 'center' });
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 2.5, { align: 'center' });

    // Room Overview
    pdf.setFontSize(14);
    pdf.text('Room Specifications', margin, 3.5);
    
    pdf.setFontSize(10);
    pdf.text(`Total Area: ${layout.room.area.toLocaleString()} sq ft`, margin, 4);
    pdf.text(`Table Count: ${layout.tables.length}`, margin, 4.3);
    pdf.text(`Plant Capacity: ${layout.metrics.plantCapacity.toLocaleString()}`, margin, 4.6);
    pdf.text(`Canopy Area: ${layout.metrics.canopyArea.toLocaleString()} sq ft`, margin, 4.9);

    // Lighting Specifications
    pdf.text('Lighting Specifications', 4, 3.5);
    pdf.text(`Fixture: Fluence ${fixtureModel}`, 4, 4);
    pdf.text(`Count: ${layout.lights.length} fixtures`, 4, 4.3);
    pdf.text(`Total Power: ${(layout.lights.length * fixture.wattage).toLocaleString()}W`, 4, 4.6);
    pdf.text(`Avg PPFD: ${layout.metrics.ppfdAverage} μmol/m²/s`, 4, 4.9);

    // Financial Summary
    pdf.text('Financial Analysis', 7, 3.5);
    pdf.text(`Equipment Cost: $${(layout.lights.length * fixture.price).toLocaleString()}`, 7, 4);
    pdf.text(`Power Density: ${layout.metrics.powerDensity.toFixed(1)} W/sq ft`, 7, 4.3);
    pdf.text(`Annual Energy: ${((layout.lights.length * fixture.wattage * 12 * 365) / 1000).toLocaleString()} kWh`, 7, 4.6);
    pdf.text(`ROI Period: See detailed analysis`, 7, 4.9);

    // Add new page for layout
    pdf.addPage();
    
    // Draw lighting layout
    this.drawLightingLayout(pdf, layout, margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

    // Add fixture specifications page
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('Fixture Specifications', pageWidth / 2, 1, { align: 'center' });
    
    // Add fixture image placeholder
    pdf.rect(margin, 1.5, 3, 2);
    pdf.text('[Fluence SPYDR 2p Image]', margin + 1.5, 2.5, { align: 'center' });

    // Specifications table
    pdf.setFontSize(10);
    const specs = [
      ['Manufacturer', 'Fluence'],
      ['Model', fixtureModel],
      ['Wattage', `${fixture.wattage}W`],
      ['PPF Output', `${fixture.ppf} μmol/s`],
      ['Efficacy', `${fixture.efficacy} μmol/J`],
      ['Coverage', `${Math.sqrt(fixture.coverage).toFixed(0)}' × ${Math.sqrt(fixture.coverage).toFixed(0)}'`],
      ['Dimensions', `${fixture.dimensions.length}" × ${fixture.dimensions.width}" × ${fixture.dimensions.height}"`],
      ['Weight', `${fixture.weight} lbs`],
      ['Lifespan', `${fixture.lifespan.toLocaleString()} hours`],
      ['Spectrum', fixture.spectrum],
      ['Dimming', fixture.dimming ? '0-100%' : 'No'],
      ['IP Rating', fixture.waterproof ? 'IP66' : 'Not rated']
    ];

    let yPos = 2;
    specs.forEach(([label, value]) => {
      pdf.text(label + ':', 4.5, yPos);
      pdf.text(value, 6.5, yPos);
      yPos += 0.3;
    });

    return pdf.output('blob');
  }

  /**
   * Draw lighting layout on PDF
   */
  private drawLightingLayout(
    pdf: jsPDF,
    layout: CultivationLayout,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const room = layout.room;
    const scaleX = width / room.dimensions.width;
    const scaleY = height / room.dimensions.height;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave margin

    const offsetX = x + (width - room.dimensions.width * scale) / 2;
    const offsetY = y + (height - room.dimensions.height * scale) / 2;

    // Draw room outline
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.02);
    pdf.rect(offsetX, offsetY, room.dimensions.width * scale, room.dimensions.height * scale);

    // Draw grid lines
    pdf.setDrawColor(200);
    pdf.setLineWidth(0.005);
    
    // Vertical grid lines every 10 feet
    for (let i = 10; i < room.dimensions.width; i += 10) {
      pdf.line(
        offsetX + i * scale,
        offsetY,
        offsetX + i * scale,
        offsetY + room.dimensions.height * scale
      );
    }
    
    // Horizontal grid lines every 10 feet
    for (let i = 10; i < room.dimensions.height; i += 10) {
      pdf.line(
        offsetX,
        offsetY + i * scale,
        offsetX + room.dimensions.width * scale,
        offsetY + i * scale
      );
    }

    // Draw tables
    pdf.setFillColor(220, 220, 220);
    pdf.setDrawColor(100);
    pdf.setLineWidth(0.01);
    
    layout.tables.forEach(table => {
      const tableX = offsetX + table.position.x * scale;
      const tableY = offsetY + table.position.y * scale;
      const tableWidth = table.dimensions.width * scale;
      const tableHeight = table.dimensions.depth * scale;
      
      pdf.rect(tableX, tableY, tableWidth, tableHeight, 'FD');
      
      // Table label
      pdf.setFontSize(6);
      pdf.text(
        table.id.replace('table_', 'T'),
        tableX + tableWidth / 2,
        tableY + tableHeight / 2,
        { align: 'center' }
      );
    });

    // Draw lights
    pdf.setFillColor(255, 255, 0);
    pdf.setDrawColor(255, 200, 0);
    pdf.setLineWidth(0.01);
    
    layout.lights.forEach((light, index) => {
      const lightX = offsetX + light.position.x * scale;
      const lightY = offsetY + light.position.y * scale;
      const size = 0.15; // 0.15 inch squares for lights
      
      pdf.rect(lightX - size / 2, lightY - size / 2, size, size, 'FD');
      
      // Light number (only for first 20 to avoid clutter)
      if (index < 20) {
        pdf.setFontSize(4);
        pdf.text(
          (index + 1).toString(),
          lightX,
          lightY + 0.02,
          { align: 'center' }
        );
      }
    });

    // Draw dimensions
    pdf.setFontSize(8);
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.01);
    
    // Width dimension
    pdf.line(offsetX, offsetY - 0.2, offsetX + room.dimensions.width * scale, offsetY - 0.2);
    pdf.text(
      `${room.dimensions.width}'`,
      offsetX + room.dimensions.width * scale / 2,
      offsetY - 0.3,
      { align: 'center' }
    );
    
    // Height dimension
    pdf.line(offsetX - 0.2, offsetY, offsetX - 0.2, offsetY + room.dimensions.height * scale);
    pdf.save();
    pdf.text(
      `${room.dimensions.height}'`,
      offsetX - 0.4,
      offsetY + room.dimensions.height * scale / 2,
      { angle: 90 }
    );
    pdf.restore();

    // Legend
    const legendX = offsetX + room.dimensions.width * scale + 0.5;
    let legendY = offsetY;
    
    pdf.setFontSize(10);
    pdf.text('Legend:', legendX, legendY);
    
    legendY += 0.3;
    pdf.setFillColor(220, 220, 220);
    pdf.rect(legendX, legendY - 0.1, 0.2, 0.2, 'F');
    pdf.text('Rolling Table', legendX + 0.3, legendY + 0.05);
    
    legendY += 0.3;
    pdf.setFillColor(255, 255, 0);
    pdf.rect(legendX, legendY - 0.1, 0.2, 0.2, 'F');
    pdf.text('SPYDR 2p', legendX + 0.3, legendY + 0.05);
    
    // Scale
    legendY += 0.5;
    pdf.text(`Scale: 1" = ${(1 / scale).toFixed(0)}'`, legendX, legendY);
  }

  /**
   * Generate JPG render from canvas element
   */
  async generateLightingJPG(
    canvasElement: HTMLCanvasElement,
    filename: string = 'lighting_design'
  ): Promise<Blob> {
    return new Promise((resolve) => {
      canvasElement.toBlob(
        (blob) => {
          if (blob) resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  }

  /**
   * Capture 3D view as image
   */
  async capture3DView(
    containerElement: HTMLElement,
    options: ExportOptions = { format: 'jpg', quality: 0.95 }
  ): Promise<Blob> {
    const canvas = await html2canvas(containerElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      logging: false
    });

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
        },
        `image/${options.format === 'jpg' ? 'jpeg' : options.format}`,
        options.quality || 0.95
      );
    });
  }

  /**
   * Generate complete lighting report with visuals
   */
  async generateCompleteReport(
    layout: CultivationLayout,
    visualElements: {
      topView?: HTMLCanvasElement;
      view3D?: HTMLElement;
    }
  ): Promise<{
    pdf: Blob;
    topViewJPG?: Blob;
    view3DJPG?: Blob;
  }> {
    const results: any = {};

    // Generate PDF
    results.pdf = await this.generateLightingPDF(layout);

    // Generate top view JPG if canvas provided
    if (visualElements.topView) {
      results.topViewJPG = await this.generateLightingJPG(visualElements.topView, 'top_view');
    }

    // Generate 3D view JPG if element provided
    if (visualElements.view3D) {
      results.view3DJPG = await this.capture3DView(visualElements.view3D, { format: 'jpg' });
    }

    return results;
  }
}

// Export singleton instance
export const visualExporter = VisualExporter.getInstance();