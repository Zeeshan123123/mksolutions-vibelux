/**
 * PDF Report Generator for VibeLux
 * Generates professional PDF reports for greenhouse operations
 */

import PDFDocument from 'pdfkit';

export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  logo?: string | Buffer;
  headerColor?: string;
  fontSize?: number;
}

export interface ReportSection {
  title: string;
  content: ReportContent[];
}

export type ReportContent = 
  | { type: 'text'; value: string; style?: TextStyle }
  | { type: 'heading'; value: string; level: 1 | 2 | 3 }
  | { type: 'table'; headers: string[]; rows: string[][]; style?: TableStyle }
  | { type: 'chart'; imageBuffer: Buffer; width?: number; height?: number }
  | { type: 'image'; src: string | Buffer; caption?: string; width?: number }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'pageBreak' }
  | { type: 'spacer'; height?: number };

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
}

export interface TableStyle {
  headerColor?: string;
  borderColor?: string;
  alternateRows?: boolean;
}

export class PDFReportGenerator {
  private doc: PDFKit.PDFDocument;
  private defaultOptions: PDFReportOptions = {
    title: 'VibeLux Report',
    headerColor: '#4CAF50',
    fontSize: 12,
  };

  constructor(options: PDFReportOptions = {}) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
    this.doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
      info: {
        Title: this.defaultOptions.title,
        Author: this.defaultOptions.author || 'VibeLux System',
        Subject: this.defaultOptions.subject,
        Keywords: this.defaultOptions.keywords?.join(', '),
      },
    });
  }

  async generateReport(
    sections: ReportSection[],
    outputPath: string
  ): Promise<string> {
    // Dynamic import to avoid bundling 'fs' in client builds
    const { createWriteStream } = await import('fs');
    return new Promise((resolve, reject) => {
      try {
        // Create write stream
        const stream = createWriteStream(outputPath);
        this.doc.pipe(stream);

        // Add header
        this.addHeader();

        // Add sections
        sections.forEach((section, index) => {
          if (index > 0) {
            this.doc.moveDown(2);
          }
          this.addSection(section);
        });

        // Add footer
        this.addFooter();

        // Finalize PDF
        this.doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  generateBuffer(sections: ReportSection[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const chunks: Buffer[] = [];
        
        this.doc.on('data', (chunk) => chunks.push(chunk));
        this.doc.on('end', () => resolve(Buffer.concat(chunks)));
        this.doc.on('error', reject);

        // Add header
        this.addHeader();

        // Add sections
        sections.forEach((section, index) => {
          if (index > 0) {
            this.doc.moveDown(2);
          }
          this.addSection(section);
        });

        // Add footer
        this.addFooter();

        // Finalize PDF
        this.doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader() {
    const { title, subtitle, logo, headerColor } = this.defaultOptions;

    // Add logo if provided
    if (logo) {
      this.doc.image(logo, 50, 45, { width: 50 });
      this.doc.moveDown();
    }

    // Add title
    this.doc
      .fillColor(headerColor || '#000000')
      .fontSize(24)
      .text(title, { align: 'center' });

    if (subtitle) {
      this.doc
        .fontSize(16)
        .fillColor('#666666')
        .text(subtitle, { align: 'center' });
    }

    // Add generation date
    this.doc
      .fontSize(10)
      .fillColor('#999999')
      .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });

    // Add separator line
    this.doc
      .moveDown()
      .strokeColor(headerColor || '#000000')
      .lineWidth(2)
      .moveTo(50, this.doc.y)
      .lineTo(545, this.doc.y)
      .stroke();

    this.doc.moveDown(2);
  }

  private addFooter() {
    const pages = this.doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      this.doc.switchToPage(i);
      
      // Add page number
      this.doc
        .fontSize(10)
        .fillColor('#999999')
        .text(
          `Page ${i + 1} of ${pages.count}`,
          50,
          this.doc.page.height - 50,
          { align: 'center' }
        );
    }
  }

  private addSection(section: ReportSection) {
    // Section title
    this.doc
      .fontSize(18)
      .fillColor(this.defaultOptions.headerColor || '#000000')
      .text(section.title);
    
    this.doc.moveDown();

    // Section content
    section.content.forEach(content => {
      this.renderContent(content);
    });
  }

  private renderContent(content: ReportContent) {
    switch (content.type) {
      case 'text':
        this.renderText(content.value, content.style);
        break;
      case 'heading':
        this.renderHeading(content.value, content.level);
        break;
      case 'table':
        this.renderTable(content.headers, content.rows, content.style);
        break;
      case 'chart':
        this.renderChart(content.imageBuffer, content.width, content.height);
        break;
      case 'image':
        this.renderImage(content.src, content.caption, content.width);
        break;
      case 'list':
        this.renderList(content.items, content.ordered);
        break;
      case 'pageBreak':
        this.doc.addPage();
        break;
      case 'spacer':
        this.doc.moveDown(content.height ? content.height / 12 : 1);
        break;
    }
  }

  private renderText(text: string, style?: TextStyle) {
    const fontSize = style?.fontSize || this.defaultOptions.fontSize || 12;
    
    this.doc
      .fontSize(fontSize)
      .fillColor(style?.color || '#000000')
      .font(style?.bold ? 'Helvetica-Bold' : 'Helvetica')
      .text(text, {
        align: style?.align || 'left',
        continued: false,
      });
    
    this.doc.moveDown();
  }

  private renderHeading(text: string, level: 1 | 2 | 3) {
    const sizes = { 1: 20, 2: 16, 3: 14 };
    const fontSize = sizes[level];
    
    this.doc
      .fontSize(fontSize)
      .fillColor(this.defaultOptions.headerColor || '#000000')
      .font('Helvetica-Bold')
      .text(text);
    
    this.doc.moveDown();
  }

  private renderTable(headers: string[], rows: string[][], style?: TableStyle) {
    const columnWidth = (this.doc.page.width - 100) / headers.length;
    const startX = 50;
    let currentY = this.doc.y;

    // Headers
    this.doc
      .fillColor(style?.headerColor || this.defaultOptions.headerColor || '#000000')
      .fontSize(10)
      .font('Helvetica-Bold');

    headers.forEach((header, i) => {
      this.doc.text(header, startX + i * columnWidth, currentY, {
        width: columnWidth,
        align: 'center',
      });
    });

    currentY += 20;

    // Header line
    this.doc
      .strokeColor(style?.borderColor || '#cccccc')
      .lineWidth(1)
      .moveTo(startX, currentY)
      .lineTo(startX + headers.length * columnWidth, currentY)
      .stroke();

    currentY += 5;

    // Rows
    this.doc.font('Helvetica').fontSize(9);
    
    rows.forEach((row, rowIndex) => {
      // Alternate row background
      if (style?.alternateRows && rowIndex % 2 === 1) {
        this.doc
          .fillColor('#f5f5f5')
          .rect(startX, currentY - 2, headers.length * columnWidth, 20)
          .fill();
      }

      // Row data
      row.forEach((cell, i) => {
        this.doc
          .fillColor('#000000')
          .text(cell, startX + i * columnWidth, currentY, {
            width: columnWidth,
            align: 'center',
          });
      });

      currentY += 20;
    });

    this.doc.y = currentY + 10;
  }

  private renderChart(imageBuffer: Buffer, width?: number, height?: number) {
    const imgWidth = width || 400;
    const imgHeight = height || 300;
    const x = (this.doc.page.width - imgWidth) / 2;
    
    this.doc.image(imageBuffer, x, this.doc.y, {
      width: imgWidth,
      height: imgHeight,
    });
    
    this.doc.y += imgHeight + 20;
  }

  private renderImage(src: string | Buffer, caption?: string, width?: number) {
    const imgWidth = width || 300;
    const x = (this.doc.page.width - imgWidth) / 2;
    
    this.doc.image(src, x, this.doc.y, { width: imgWidth });
    
    if (caption) {
      this.doc
        .fontSize(10)
        .fillColor('#666666')
        .text(caption, { align: 'center' });
    }
    
    this.doc.moveDown();
  }

  private renderList(items: string[], ordered?: boolean) {
    const startX = 70;
    
    items.forEach((item, index) => {
      const bullet = ordered ? `${index + 1}.` : '•';
      
      this.doc
        .fontSize(this.defaultOptions.fontSize || 12)
        .fillColor('#000000')
        .text(bullet, 50, this.doc.y)
        .text(item, startX, this.doc.y - 12);
    });
    
    this.doc.moveDown();
  }

  // Predefined report templates
  static async generateClimateReport(data: any, outputPath: string): Promise<string> {
    const generator = new PDFReportGenerator({
      title: 'Climate Control Report',
      subtitle: data.facilityName,
      headerColor: '#2196F3',
    });

    const sections: ReportSection[] = [
      {
        title: 'Executive Summary',
        content: [
          { type: 'text', value: data.summary },
        ],
      },
      {
        title: 'Climate Metrics',
        content: [
          {
            type: 'table',
            headers: ['Zone', 'Avg Temp (°C)', 'Avg Humidity (%)', 'VPD (kPa)', 'CO2 (ppm)'],
            rows: data.zones.map((zone: any) => [
              zone.name,
              zone.avgTemp.toFixed(1),
              zone.avgHumidity.toFixed(1),
              zone.avgVPD.toFixed(2),
              zone.avgCO2.toFixed(0),
            ]),
          },
        ],
      },
      {
        title: 'Temperature Trends',
        content: [
          { type: 'chart', imageBuffer: data.tempChartBuffer },
        ],
      },
      {
        title: 'Recommendations',
        content: [
          { type: 'list', items: data.recommendations },
        ],
      },
    ];

    return generator.generateReport(sections, outputPath);
  }
}

export const pdfGenerator = new PDFReportGenerator();