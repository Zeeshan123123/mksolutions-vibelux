/**
 * Excel Report Generator for VibeLux
 * Generates Excel reports with charts and formatting
 */

import ExcelJS from 'exceljs';
import { Readable } from 'stream';

export interface ExcelReportOptions {
  title: string;
  author?: string;
  company?: string;
  description?: string;
  theme?: 'standard' | 'colorful' | 'professional';
}

export interface WorksheetData {
  name: string;
  headers: string[];
  rows: any[][];
  totals?: any[];
  charts?: ChartConfig[];
  formatting?: ColumnFormatting[];
  autoFilter?: boolean;
  freezePanes?: { row: number; column: number };
}

export interface ChartConfig {
  type: 'line' | 'column' | 'pie' | 'area' | 'scatter';
  title: string;
  dataRange: string;
  categoryRange: string;
  position: { row: number; column: number };
  size?: { width: number; height: number };
}

export interface ColumnFormatting {
  column: number | string;
  format?: string;
  width?: number;
  style?: Partial<ExcelJS.Style>;
}

export class ExcelReportGenerator {
  private workbook: ExcelJS.Workbook;
  private defaultOptions: ExcelReportOptions;
  private themeColors = {
    standard: {
      primary: 'FF4CAF50',
      secondary: 'FF2196F3',
      accent: 'FFFF9800',
      header: 'FF37474F',
    },
    colorful: {
      primary: 'FF00BCD4',
      secondary: 'FF9C27B0',
      accent: 'FFFF5722',
      header: 'FF3F51B5',
    },
    professional: {
      primary: 'FF1976D2',
      secondary: 'FF455A64',
      accent: 'FF757575',
      header: 'FF263238',
    },
  };

  constructor(options: ExcelReportOptions = { title: 'VibeLux Report' }) {
    this.defaultOptions = options;
    this.workbook = new ExcelJS.Workbook();
    this.initializeWorkbook();
  }

  private initializeWorkbook() {
    this.workbook.creator = this.defaultOptions.author || 'VibeLux System';
    this.workbook.lastModifiedBy = this.defaultOptions.author || 'VibeLux System';
    this.workbook.created = new Date();
    this.workbook.modified = new Date();
    this.workbook.properties.date1904 = true;
    
    if (this.defaultOptions.company) {
      this.workbook.company = this.defaultOptions.company;
    }
    
    if (this.defaultOptions.description) {
      this.workbook.description = this.defaultOptions.description;
    }
  }

  async generateReport(
    worksheets: WorksheetData[],
    outputPath?: string
  ): Promise<Buffer | string> {
    // Add cover sheet
    this.addCoverSheet();

    // Add data worksheets
    worksheets.forEach(wsData => {
      this.addWorksheet(wsData);
    });

    // Save or return buffer
    if (outputPath) {
      await this.workbook.xlsx.writeFile(outputPath);
      return outputPath;
    } else {
      const buffer = await this.workbook.xlsx.writeBuffer();
      return buffer as Buffer;
    }
  }

  private addCoverSheet() {
    const coverSheet = this.workbook.addWorksheet('Report Info');
    const theme = this.themeColors[this.defaultOptions.theme || 'standard'];

    // Title
    coverSheet.getCell('B2').value = this.defaultOptions.title;
    coverSheet.getCell('B2').font = {
      name: 'Arial',
      size: 24,
      bold: true,
      color: { argb: theme.primary },
    };

    // Metadata
    const metadata = [
      ['Generated Date:', new Date().toLocaleDateString()],
      ['Generated Time:', new Date().toLocaleTimeString()],
      ['Author:', this.defaultOptions.author || 'VibeLux System'],
      ['Company:', this.defaultOptions.company || 'VibeLux'],
      ['Description:', this.defaultOptions.description || 'Automated Report'],
    ];

    metadata.forEach((row, index) => {
      coverSheet.getCell(`B${4 + index}`).value = row[0];
      coverSheet.getCell(`B${4 + index}`).font = { bold: true };
      coverSheet.getCell(`C${4 + index}`).value = row[1];
    });

    // Styling
    coverSheet.getColumn('B').width = 20;
    coverSheet.getColumn('C').width = 40;

    // Add logo placeholder
    coverSheet.getCell('E2').value = 'VibeLux';
    coverSheet.getCell('E2').font = {
      name: 'Arial Black',
      size: 36,
      color: { argb: theme.primary },
    };
  }

  private addWorksheet(data: WorksheetData) {
    const worksheet = this.workbook.addWorksheet(data.name);
    const theme = this.themeColors[this.defaultOptions.theme || 'standard'];

    // Add headers
    const headerRow = worksheet.addRow(data.headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: theme.header },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add data rows
    data.rows.forEach((row, index) => {
      const dataRow = worksheet.addRow(row);
      
      // Alternate row coloring
      if (index % 2 === 1) {
        dataRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' },
        };
      }
    });

    // Add totals row if provided
    if (data.totals) {
      const totalsRow = worksheet.addRow(data.totals);
      totalsRow.font = { bold: true };
      totalsRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    }

    // Apply formatting
    if (data.formatting) {
      data.formatting.forEach(fmt => {
        const column = worksheet.getColumn(fmt.column);
        
        if (fmt.width) {
          column.width = fmt.width;
        }
        
        if (fmt.format) {
          column.numFmt = fmt.format;
        }
        
        if (fmt.style) {
          column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
            if (rowNumber > 1) { // Skip header
              Object.assign(cell, fmt.style);
            }
          });
        }
      });
    }

    // Auto-fit columns if no specific width set
    data.headers.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1);
      if (!column.width) {
        const maxLength = Math.max(
          header.length,
          ...data.rows.map(row => String(row[index] || '').length)
        );
        column.width = Math.min(maxLength + 2, 30);
      }
    });

    // Add borders to all cells with data
    const lastRow = worksheet.lastRow?.number || 1;
    const lastCol = data.headers.length;
    
    for (let row = 1; row <= lastRow; row++) {
      for (let col = 1; col <= lastCol; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    }

    // Add auto-filter
    if (data.autoFilter) {
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: lastCol },
      };
    }

    // Freeze panes
    if (data.freezePanes) {
      worksheet.views = [{
        state: 'frozen',
        xSplit: data.freezePanes.column,
        ySplit: data.freezePanes.row,
      }];
    }

    // Add charts (simplified - ExcelJS has limited chart support)
    if (data.charts) {
      // Chart implementation would require additional libraries
      // For now, add a placeholder
      data.charts.forEach(chart => {
        const chartRow = worksheet.getRow(chart.position.row);
        chartRow.getCell(chart.position.column).value = `[${chart.type.toUpperCase()} CHART: ${chart.title}]`;
        chartRow.getCell(chart.position.column).font = {
          italic: true,
          color: { argb: theme.accent },
        };
      });
    }
  }

  // Predefined report generators
  static async generateProductionReport(
    data: any,
    outputPath?: string
  ): Promise<Buffer | string> {
    const generator = new ExcelReportGenerator({
      title: 'Production Report',
      author: 'VibeLux Production System',
      company: data.facilityName,
      description: `Production report for ${data.dateRange}`,
      theme: 'professional',
    });

    const worksheets: WorksheetData[] = [
      {
        name: 'Summary',
        headers: ['Metric', 'Value', 'Target', 'Variance', 'Status'],
        rows: [
          ['Total Yield (kg)', data.totalYield, data.targetYield, data.yieldVariance, data.yieldStatus],
          ['Quality Score', data.qualityScore, 95, data.qualityVariance, data.qualityStatus],
          ['Efficiency (%)', data.efficiency, 85, data.efficiencyVariance, data.efficiencyStatus],
          ['Cycle Time (days)', data.cycleTime, data.targetCycleTime, data.cycleVariance, data.cycleStatus],
        ],
        formatting: [
          { column: 2, format: '#,##0.00' },
          { column: 3, format: '#,##0.00' },
          { column: 4, format: '+#,##0.00;-#,##0.00' },
        ],
      },
      {
        name: 'Daily Production',
        headers: ['Date', 'Zone', 'Crop', 'Yield (kg)', 'Quality', 'Labor Hours', 'Notes'],
        rows: data.dailyProduction,
        totals: ['Total', '', '', data.totalYield, data.avgQuality, data.totalLabor, ''],
        autoFilter: true,
        freezePanes: { row: 1, column: 0 },
        formatting: [
          { column: 1, format: 'mm/dd/yyyy' },
          { column: 4, format: '#,##0.00' },
          { column: 5, format: '0.0' },
          { column: 6, format: '#,##0' },
        ],
      },
      {
        name: 'Zone Analysis',
        headers: ['Zone', 'Area (m²)', 'Plants', 'Yield/m²', 'Revenue/m²', 'Efficiency'],
        rows: data.zoneAnalysis,
        formatting: [
          { column: 2, format: '#,##0' },
          { column: 3, format: '#,##0' },
          { column: 4, format: '#,##0.00' },
          { column: 5, format: '$#,##0.00' },
          { column: 6, format: '0.0%' },
        ],
        charts: [
          {
            type: 'column',
            title: 'Yield by Zone',
            dataRange: 'D2:D10',
            categoryRange: 'A2:A10',
            position: { row: 15, column: 2 },
          },
        ],
      },
    ];

    return generator.generateReport(worksheets, outputPath);
  }

  static async generateFinancialReport(
    data: any,
    outputPath?: string
  ): Promise<Buffer | string> {
    const generator = new ExcelReportGenerator({
      title: 'Financial Report',
      author: 'VibeLux Finance',
      theme: 'standard',
    });

    const worksheets: WorksheetData[] = [
      {
        name: 'P&L Summary',
        headers: ['Category', 'Current Month', 'Previous Month', 'YTD', 'Budget', 'Variance'],
        rows: data.profitLoss,
        formatting: [
          { column: 2, format: '$#,##0.00' },
          { column: 3, format: '$#,##0.00' },
          { column: 4, format: '$#,##0.00' },
          { column: 5, format: '$#,##0.00' },
          { column: 6, format: '$#,##0.00;[Red]($#,##0.00)' },
        ],
      },
      {
        name: 'Cash Flow',
        headers: ['Week', 'Income', 'Expenses', 'Net Cash', 'Cumulative'],
        rows: data.cashFlow,
        formatting: [
          { column: 2, format: '$#,##0' },
          { column: 3, format: '$#,##0' },
          { column: 4, format: '$#,##0;[Red]($#,##0)' },
          { column: 5, format: '$#,##0' },
        ],
        autoFilter: true,
      },
    ];

    return generator.generateReport(worksheets, outputPath);
  }
}

export const excelGenerator = new ExcelReportGenerator();