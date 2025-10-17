import * as XLSX from 'xlsx';
import { logger } from '@/lib/client-logger';

export interface ParsedSheet {
  name: string;
  data: any[][];
  headers: string[];
  dataStartRow: number;
  metadata: SheetMetadata;
}

export interface SheetMetadata {
  totalRows: number;
  totalColumns: number;
  hasFormulas: boolean;
  hasMergedCells: boolean;
  dateColumns: number[];
  numericColumns: number[];
  textColumns: number[];
  emptyRows: number[];
  dataQuality: DataQualityScore;
}

export interface DataQualityScore {
  completeness: number; // 0-100
  consistency: number; // 0-100
  validity: number; // 0-100
  issues: QualityIssue[];
}

export interface QualityIssue {
  type: 'missing_values' | 'inconsistent_format' | 'invalid_range' | 'duplicate_headers' | 'merged_cells' | 'formula_errors';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  suggestion: string;
}

export interface LayoutStructure {
  headerRow: number;
  dataStartRow: number;
  dataEndRow: number;
  columnMapping: Map<string, number>;
  irregularities: LayoutIrregularity[];
}

export interface LayoutIrregularity {
  type: 'merged_cells' | 'empty_header' | 'multi_line_header' | 'irregular_spacing';
  location: string;
  impact: 'low' | 'medium' | 'high';
  autoFixable: boolean;
}

export interface CultivationDataPattern {
  parameter: string;
  confidence: number;
  units: string[];
  expectedRange: [number, number];
  seasonalPattern?: boolean;
  relatedParameters?: string[];
}

export class EnhancedExcelParser {
  private cultivationPatterns: Map<string, CultivationDataPattern> = new Map();

  constructor() {
    this.initializeCultivationPatterns();
  }

  private initializeCultivationPatterns() {
    // Define cultivation-specific data patterns
    const patterns: CultivationDataPattern[] = [
      {
        parameter: 'temperature',
        confidence: 0.9,
        units: ['°C', '°F', 'celsius', 'fahrenheit'],
        expectedRange: [15, 35], // °C
        seasonalPattern: true,
        relatedParameters: ['humidity', 'vpd']
      },
      {
        parameter: 'humidity',
        confidence: 0.9,
        units: ['%', 'rh', 'relative humidity'],
        expectedRange: [30, 90],
        seasonalPattern: true,
        relatedParameters: ['temperature', 'vpd']
      },
      {
        parameter: 'ppfd',
        confidence: 0.95,
        units: ['μmol/m²/s', 'umol', 'ppfd', 'par'],
        expectedRange: [200, 2000],
        seasonalPattern: false,
        relatedParameters: ['dli', 'photoperiod']
      },
      {
        parameter: 'ph',
        confidence: 0.9,
        units: ['ph', 'ph level'],
        expectedRange: [4.5, 8.5],
        seasonalPattern: false,
        relatedParameters: ['ec', 'nutrients']
      },
      {
        parameter: 'ec',
        confidence: 0.85,
        units: ['ec', 'electrical conductivity', 'ms/cm', 'us/cm', 'ppm'],
        expectedRange: [0.5, 3.5], // mS/cm
        seasonalPattern: false,
        relatedParameters: ['ph', 'nutrients']
      },
      {
        parameter: 'co2',
        confidence: 0.9,
        units: ['ppm', 'co2', 'carbon dioxide'],
        expectedRange: [300, 1500],
        seasonalPattern: false,
        relatedParameters: ['ventilation', 'photosynthesis']
      },
      {
        parameter: 'dli',
        confidence: 0.85,
        units: ['mol/m²/day', 'dli', 'daily light integral'],
        expectedRange: [20, 65],
        seasonalPattern: false,
        relatedParameters: ['ppfd', 'photoperiod']
      },
      {
        parameter: 'yield',
        confidence: 0.8,
        units: ['g', 'kg', 'lbs', 'oz', 'grams', 'pounds'],
        expectedRange: [10, 2000], // grams per plant
        seasonalPattern: true,
        relatedParameters: ['harvest_date', 'plant_count']
      }
    ];

    patterns.forEach(pattern => {
      this.cultivationPatterns.set(pattern.parameter, pattern);
    });
  }

  async parseMultiSheetWorkbook(file: Buffer): Promise<{
    sheets: ParsedSheet[];
    workbookMetadata: WorkbookMetadata;
    relationships: SheetRelationship[];
  }> {
    try {
      const workbook = XLSX.read(file, { 
        type: 'buffer',
        cellFormula: true,
        cellStyles: true,
        cellDates: true,
        dateNF: 'yyyy-mm-dd'
      });

      const sheets: ParsedSheet[] = [];
      const relationships: SheetRelationship[] = [];

      // Parse each sheet
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const parsedSheet = await this.parseWorksheet(worksheet, sheetName);
        sheets.push(parsedSheet);
      }

      // Detect relationships between sheets
      const detectedRelationships = this.detectSheetRelationships(sheets);
      relationships.push(...detectedRelationships);

      const workbookMetadata = this.generateWorkbookMetadata(sheets, relationships);

      return {
        sheets,
        workbookMetadata,
        relationships
      };

    } catch (error) {
      logger.error('api', error);
      throw new Error(`Excel parsing failed: ${error.message}`);
    }
  }

  private async parseWorksheet(worksheet: XLSX.WorkSheet, sheetName: string): Promise<ParsedSheet> {
    // Convert worksheet to 2D array
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: null,
      raw: false
    }) as any[][];

    // Detect layout structure
    const layout = this.detectLayoutStructure(rawData);
    
    // Extract clean headers
    const headers = this.extractHeaders(rawData, layout);
    
    // Generate metadata
    const metadata = this.generateSheetMetadata(rawData, headers, worksheet);
    
    // Clean and normalize data
    const cleanData = this.cleanSheetData(rawData, layout, headers);

    return {
      name: sheetName,
      data: cleanData,
      headers,
      dataStartRow: layout.dataStartRow,
      metadata
    };
  }

  private detectLayoutStructure(data: any[][]): LayoutStructure {
    if (!data || data.length === 0) {
      throw new Error('Empty worksheet data');
    }

    let headerRow = 0;
    let dataStartRow = 1;
    let dataEndRow = data.length - 1;
    const irregularities: LayoutIrregularity[] = [];

    // Find the actual header row (may not be row 0)
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i] || [];
      const nonEmptyCount = row.filter(cell => cell !== null && cell !== '').length;
      const textCount = row.filter(cell => typeof cell === 'string' && cell.trim().length > 0).length;
      
      // Likely header if mostly text and has good coverage
      if (textCount >= nonEmptyCount * 0.7 && nonEmptyCount >= row.length * 0.5) {
        headerRow = i;
        dataStartRow = i + 1;
        break;
      }
    }

    // Detect data end (remove empty trailing rows)
    for (let i = data.length - 1; i >= dataStartRow; i--) {
      const row = data[i] || [];
      if (row.some(cell => cell !== null && cell !== '')) {
        dataEndRow = i;
        break;
      }
    }

    // Create column mapping
    const headers = data[headerRow] || [];
    const columnMapping = new Map<string, number>();
    headers.forEach((header, index) => {
      if (header && typeof header === 'string') {
        columnMapping.set(header.trim().toLowerCase(), index);
      }
    });

    // Check for irregularities
    if (headerRow > 0) {
      irregularities.push({
        type: 'irregular_spacing',
        location: `Header found at row ${headerRow + 1} instead of row 1`,
        impact: 'medium',
        autoFixable: true
      });
    }

    // Check for empty headers
    headers.forEach((header, index) => {
      if (!header || header.toString().trim() === '') {
        irregularities.push({
          type: 'empty_header',
          location: `Column ${String.fromCharCode(65 + index)} (${index + 1})`,
          impact: 'high',
          autoFixable: true
        });
      }
    });

    return {
      headerRow,
      dataStartRow,
      dataEndRow,
      columnMapping,
      irregularities
    };
  }

  private extractHeaders(data: any[][], layout: LayoutStructure): string[] {
    const rawHeaders = data[layout.headerRow] || [];
    const cleanHeaders: string[] = [];

    rawHeaders.forEach((header, index) => {
      if (header && typeof header === 'string') {
        const cleanHeader = header.trim()
          .toLowerCase()
          .replace(/[^\w\s]/g, '') // Remove special characters
          .replace(/\s+/g, '_'); // Replace spaces with underscores
        
        // Ensure unique headers
        let counter = 1;
        let uniqueHeader = cleanHeader;
        while (cleanHeaders.includes(uniqueHeader)) {
          uniqueHeader = `${cleanHeader}_${counter}`;
          counter++;
        }
        
        cleanHeaders.push(uniqueHeader);
      } else {
        // Generate name for empty headers
        cleanHeaders.push(`column_${String.fromCharCode(65 + index).toLowerCase()}`);
      }
    });

    return cleanHeaders;
  }

  private generateSheetMetadata(data: any[][], headers: string[], worksheet: XLSX.WorkSheet): SheetMetadata {
    const totalRows = data.length;
    const totalColumns = Math.max(...data.map(row => row.length));
    
    // Analyze column types
    const dateColumns: number[] = [];
    const numericColumns: number[] = [];
    const textColumns: number[] = [];
    const emptyRows: number[] = [];

    // Check each column for data types
    for (let col = 0; col < totalColumns; col++) {
      const columnData = data.slice(1).map(row => row[col]).filter(cell => cell !== null && cell !== '');
      
      if (columnData.length === 0) continue;

      const numericCount = columnData.filter(cell => !isNaN(Number(cell))).length;
      const dateCount = columnData.filter(cell => this.isDateLike(cell)).length;
      
      const numericRatio = numericCount / columnData.length;
      const dateRatio = dateCount / columnData.length;

      if (dateRatio > 0.7) {
        dateColumns.push(col);
      } else if (numericRatio > 0.7) {
        numericColumns.push(col);
      } else {
        textColumns.push(col);
      }
    }

    // Find empty rows
    for (let row = 1; row < data.length; row++) {
      const rowData = data[row] || [];
      if (rowData.every(cell => cell === null || cell === '')) {
        emptyRows.push(row);
      }
    }

    // Check for formulas and merged cells
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    let hasFormulas = false;
    let hasMergedCells = false;

    // Check for formulas
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellRef];
        if (cell && cell.f) {
          hasFormulas = true;
          break;
        }
      }
      if (hasFormulas) break;
    }

    // Check for merged cells
    if (worksheet['!merges'] && worksheet['!merges'].length > 0) {
      hasMergedCells = true;
    }

    // Generate data quality score
    const dataQuality = this.assessDataQuality(data, headers, {
      hasFormulas,
      hasMergedCells,
      emptyRows,
      dateColumns,
      numericColumns
    });

    return {
      totalRows,
      totalColumns,
      hasFormulas,
      hasMergedCells,
      dateColumns,
      numericColumns,
      textColumns,
      emptyRows,
      dataQuality
    };
  }

  private assessDataQuality(data: any[][], headers: string[], metadata: any): DataQualityScore {
    const issues: QualityIssue[] = [];
    let completeness = 100;
    let consistency = 100;
    let validity = 100;

    // Calculate completeness
    const totalCells = (data.length - 1) * headers.length; // Exclude header row
    let emptyCells = 0;

    for (let row = 1; row < data.length; row++) {
      const rowData = data[row] || [];
      for (let col = 0; col < headers.length; col++) {
        if (!rowData[col] || rowData[col] === '') {
          emptyCells++;
        }
      }
    }

    completeness = Math.max(0, 100 - (emptyCells / totalCells) * 100);

    if (completeness < 80) {
      issues.push({
        type: 'missing_values',
        severity: completeness < 60 ? 'high' : 'medium',
        description: `${emptyCells} empty cells found (${(emptyCells/totalCells*100).toFixed(1)}% missing data)`,
        location: 'Throughout spreadsheet',
        suggestion: 'Consider data imputation or request complete dataset from grower'
      });
    }

    // Check for merged cells
    if (metadata.hasMergedCells) {
      issues.push({
        type: 'merged_cells',
        severity: 'medium',
        description: 'Merged cells detected which may complicate data parsing',
        location: 'Various locations',
        suggestion: 'Unmerge cells and duplicate values where appropriate'
      });
      consistency -= 10;
    }

    // Check for duplicate headers
    const headerCounts = new Map<string, number>();
    headers.forEach(header => {
      headerCounts.set(header, (headerCounts.get(header) || 0) + 1);
    });

    const duplicateHeaders = Array.from(headerCounts.entries()).filter(([_, count]) => count > 1);
    if (duplicateHeaders.length > 0) {
      issues.push({
        type: 'duplicate_headers',
        severity: 'high',
        description: `Duplicate column headers found: ${duplicateHeaders.map(([header]) => header).join(', ')}`,
        location: 'Header row',
        suggestion: 'Rename duplicate headers to be unique'
      });
      validity -= 20;
    }

    // Check cultivation parameter validity
    headers.forEach((header, index) => {
      const pattern = this.findCultivationPattern(header);
      if (pattern) {
        const columnData = data.slice(1)
          .map(row => row[index])
          .filter(cell => cell !== null && cell !== '' && !isNaN(Number(cell)))
          .map(cell => Number(cell));

        if (columnData.length > 0) {
          const outOfRange = columnData.filter(value => 
            value < pattern.expectedRange[0] || value > pattern.expectedRange[1]
          );

          if (outOfRange.length > columnData.length * 0.1) { // More than 10% out of range
            issues.push({
              type: 'invalid_range',
              severity: 'medium',
              description: `${outOfRange.length} values in ${header} column are outside expected range (${pattern.expectedRange[0]}-${pattern.expectedRange[1]})`,
              location: `Column ${header}`,
              suggestion: `Verify units and data accuracy. Expected range for ${pattern.parameter}: ${pattern.expectedRange[0]}-${pattern.expectedRange[1]} ${pattern.units[0]}`
            });
            validity -= 5;
          }
        }
      }
    });

    return {
      completeness: Math.round(completeness),
      consistency: Math.round(consistency),
      validity: Math.round(validity),
      issues
    };
  }

  private findCultivationPattern(header: string): CultivationDataPattern | null {
    const normalizedHeader = header.toLowerCase().replace(/[^\w]/g, '');
    
    for (const [parameter, pattern] of this.cultivationPatterns) {
      if (normalizedHeader.includes(parameter) || 
          pattern.units.some(unit => normalizedHeader.includes(unit.replace(/[^\w]/g, '')))) {
        return pattern;
      }
    }
    
    return null;
  }

  private cleanSheetData(data: any[][], layout: LayoutStructure, headers: string[]): any[][] {
    const cleanData: any[][] = [];
    
    // Start from data rows, skip header
    for (let row = layout.dataStartRow; row <= layout.dataEndRow; row++) {
      const originalRow = data[row] || [];
      const cleanRow: any[] = [];
      
      for (let col = 0; col < headers.length; col++) {
        let cellValue = originalRow[col];
        
        // Clean cell value
        if (cellValue !== null && cellValue !== undefined) {
          // Handle dates
          if (this.isDateLike(cellValue)) {
            cellValue = this.parseDate(cellValue);
          }
          // Handle numbers with units
          else if (typeof cellValue === 'string' && /^\d+\.?\d*\s*[a-zA-Z%°]+$/.test(cellValue.trim())) {
            const numericPart = cellValue.match(/^\d+\.?\d*/);
            if (numericPart) {
              cellValue = parseFloat(numericPart[0]);
            }
          }
          // Handle boolean-like values
          else if (typeof cellValue === 'string') {
            const lowerValue = cellValue.toLowerCase().trim();
            if (['yes', 'true', '1', 'on', 'enabled'].includes(lowerValue)) {
              cellValue = true;
            } else if (['no', 'false', '0', 'off', 'disabled'].includes(lowerValue)) {
              cellValue = false;
            }
          }
        }
        
        cleanRow.push(cellValue);
      }
      
      // Only include rows that have some data
      if (cleanRow.some(cell => cell !== null && cell !== '')) {
        cleanData.push(cleanRow);
      }
    }
    
    return cleanData;
  }

  private isDateLike(value: any): boolean {
    if (!value) return false;
    
    const dateString = value.toString().trim();
    
    // Common date patterns
    const datePatterns = [
      /^\d{4}-\d{1,2}-\d{1,2}/, // YYYY-MM-DD
      /^\d{1,2}\/\d{1,2}\/\d{4}/, // MM/DD/YYYY
      /^\d{1,2}-\d{1,2}-\d{4}/, // MM-DD-YYYY
      /^\d{4}\/\d{1,2}\/\d{1,2}/, // YYYY/MM/DD
    ];
    
    return datePatterns.some(pattern => pattern.test(dateString)) || !isNaN(Date.parse(dateString));
  }

  private parseDate(value: any): Date | null {
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  private detectSheetRelationships(sheets: ParsedSheet[]): SheetRelationship[] {
    const relationships: SheetRelationship[] = [];
    
    // Look for common patterns in sheet relationships
    for (let i = 0; i < sheets.length; i++) {
      for (let j = i + 1; j < sheets.length; j++) {
        const sheet1 = sheets[i];
        const sheet2 = sheets[j];
        
        // Check for common column names (potential foreign keys)
        const commonHeaders = sheet1.headers.filter(h => sheet2.headers.includes(h));
        
        if (commonHeaders.length > 0) {
          relationships.push({
            sourceSheet: sheet1.name,
            targetSheet: sheet2.name,
            type: 'foreign_key',
            keyColumns: commonHeaders,
            confidence: commonHeaders.length / Math.max(sheet1.headers.length, sheet2.headers.length)
          });
        }
      }
    }
    
    return relationships;
  }

  private generateWorkbookMetadata(sheets: ParsedSheet[], relationships: SheetRelationship[]): WorkbookMetadata {
    const totalRows = sheets.reduce((sum, sheet) => sum + sheet.metadata.totalRows, 0);
    const totalColumns = sheets.reduce((sum, sheet) => sum + sheet.metadata.totalColumns, 0);
    const averageQuality = sheets.reduce((sum, sheet) => 
      sum + (sheet.metadata.dataQuality.completeness + sheet.metadata.dataQuality.consistency + sheet.metadata.dataQuality.validity) / 3, 0
    ) / sheets.length;

    const allIssues = sheets.flatMap(sheet => sheet.metadata.dataQuality.issues);
    const criticalIssues = allIssues.filter(issue => issue.severity === 'critical').length;
    const highIssues = allIssues.filter(issue => issue.severity === 'high').length;

    return {
      totalSheets: sheets.length,
      totalRows,
      totalColumns,
      relationships: relationships.length,
      averageQuality: Math.round(averageQuality),
      processingComplexity: this.calculateComplexity(sheets),
      recommendedActions: this.generateRecommendations(sheets, allIssues),
      criticalIssues,
      highIssues
    };
  }

  private calculateComplexity(sheets: ParsedSheet[]): 'low' | 'medium' | 'high' | 'very_high' {
    let complexityScore = 0;
    
    // Factors that increase complexity
    complexityScore += sheets.length * 10; // Multiple sheets
    complexityScore += sheets.filter(s => s.metadata.hasFormulas).length * 15; // Formulas
    complexityScore += sheets.filter(s => s.metadata.hasMergedCells).length * 10; // Merged cells
    complexityScore += sheets.reduce((sum, s) => sum + s.metadata.dataQuality.issues.length, 0) * 5; // Issues
    
    if (complexityScore < 50) return 'low';
    if (complexityScore < 100) return 'medium';
    if (complexityScore < 200) return 'high';
    return 'very_high';
  }

  private generateRecommendations(sheets: ParsedSheet[], issues: QualityIssue[]): string[] {
    const recommendations: string[] = [];
    
    if (issues.some(i => i.type === 'merged_cells')) {
      recommendations.push('Unmerge cells and duplicate values to improve data structure');
    }
    
    if (issues.some(i => i.type === 'missing_values' && i.severity === 'high')) {
      recommendations.push('Address missing data through imputation or request complete dataset');
    }
    
    if (issues.some(i => i.type === 'duplicate_headers')) {
      recommendations.push('Rename duplicate column headers to ensure uniqueness');
    }
    
    if (sheets.some(s => s.metadata.hasFormulas)) {
      recommendations.push('Convert formulas to values to prevent calculation dependencies');
    }
    
    const lowQualitySheets = sheets.filter(s => 
      (s.metadata.dataQuality.completeness + s.metadata.dataQuality.consistency + s.metadata.dataQuality.validity) / 3 < 70
    );
    
    if (lowQualitySheets.length > 0) {
      recommendations.push(`Review data quality in sheets: ${lowQualitySheets.map(s => s.name).join(', ')}`);
    }
    
    return recommendations;
  }
}

// Supporting interfaces
export interface SheetRelationship {
  sourceSheet: string;
  targetSheet: string;
  type: 'foreign_key' | 'lookup' | 'summary';
  keyColumns: string[];
  confidence: number;
}

export interface WorkbookMetadata {
  totalSheets: number;
  totalRows: number;
  totalColumns: number;
  relationships: number;
  averageQuality: number;
  processingComplexity: 'low' | 'medium' | 'high' | 'very_high';
  recommendedActions: string[];
  criticalIssues: number;
  highIssues: number;
}

// Export singleton instance
export const enhancedExcelParser = new EnhancedExcelParser();