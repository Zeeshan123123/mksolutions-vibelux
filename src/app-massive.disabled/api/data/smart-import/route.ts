import { NextRequest, NextResponse } from 'next/server';
import { enhancedExcelParser, type ParsedSheet, type WorkbookMetadata } from '@/lib/enhanced-excel-parser';
import { intelligentDataCleaner, type CleaningResult } from '@/lib/intelligent-data-cleaner';
import { logger } from '@/lib/client-logger';

export interface SmartImportRequest {
  file: Buffer;
  filename: string;
  options: ImportOptions;
}

export interface ImportOptions {
  autoClean: boolean;
  preserveOriginal: boolean;
  cultivationContext: CultivationContext;
  qualityThreshold: number; // 0-100
  previewMode: boolean;
}

export interface CultivationContext {
  cropType?: string;
  facilityType?: 'greenhouse' | 'indoor' | 'outdoor';
  equipmentVendor?: string;
  measurementUnits?: 'metric' | 'imperial' | 'mixed';
  timeZone?: string;
}

export interface SmartImportResult {
  success: boolean;
  data: ProcessedData[];
  metadata: ImportMetadata;
  recommendations: Recommendation[];
  issues: ImportIssue[];
  previewData?: PreviewData;
}

export interface ProcessedData {
  sheetName: string;
  headers: string[];
  rows: any[][];
  originalRowCount: number;
  cleanedRowCount: number;
  confidence: number;
  transformations: string[];
}

export interface ImportMetadata {
  filename: string;
  fileSize: number;
  totalSheets: number;
  totalRows: number;
  processingTime: number;
  qualityScore: number;
  complexity: 'low' | 'medium' | 'high' | 'very_high';
  equipmentDetected?: string;
  cultivationParameters: string[];
}

export interface Recommendation {
  type: 'data_quality' | 'structure' | 'equipment' | 'cultivation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  automated: boolean;
}

export interface ImportIssue {
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'parsing' | 'data_quality' | 'structure' | 'conversion';
  message: string;
  location: string;
  suggestion: string;
  autoFixable: boolean;
}

export interface PreviewData {
  sampleRows: any[][];
  detectedFields: DetectedField[];
  suggestedMappings: FieldMapping[];
  qualityAssessment: QualityAssessment;
}

export interface DetectedField {
  originalName: string;
  suggestedName: string;
  dataType: string;
  confidence: number;
  cultivationParameter: boolean;
  units?: string;
  sampleValues: any[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  confidence: number;
}

export interface QualityAssessment {
  overall: number;
  completeness: number;
  consistency: number;
  validity: number;
  issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const optionsStr = formData.get('options') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const options: ImportOptions = optionsStr ? JSON.parse(optionsStr) : {
      autoClean: true,
      preserveOriginal: true,
      cultivationContext: {},
      qualityThreshold: 70,
      previewMode: false
    };

    logger.info('api', 'Smart import processing file', { 
      data: {
        filename: file.name, 
        size: buffer.length,
        options 
      }
    });

    // Phase 1: Parse the file structure
    const parseResult = await enhancedExcelParser.parseMultiSheetWorkbook(buffer);
    
    logger.info('api', 'Parse result', {
      data: {
        sheets: parseResult.sheets.length,
        complexity: parseResult.workbookMetadata.processingComplexity
      }
    });

    // Phase 2: Intelligent data cleaning (if enabled)
    const processedSheets: ProcessedData[] = [];
    const allRecommendations: Recommendation[] = [];
    const allIssues: ImportIssue[] = [];

    for (const sheet of parseResult.sheets) {
      const processedSheet = await processSheet(sheet, options);
      processedSheets.push(processedSheet.data);
      allRecommendations.push(...processedSheet.recommendations);
      allIssues.push(...processedSheet.issues);
    }

    // Phase 3: Generate comprehensive metadata
    const metadata = generateImportMetadata(
      file.name,
      buffer.length,
      parseResult,
      processedSheets,
      Date.now() - startTime
    );

    // Phase 4: Generate final recommendations
    const finalRecommendations = generateSmartRecommendations(
      parseResult,
      processedSheets,
      options.cultivationContext
    );

    // Phase 5: Create preview data (if requested)
    let previewData: PreviewData | undefined;
    if (options.previewMode) {
      previewData = generatePreviewData(processedSheets);
    }

    const result: SmartImportResult = {
      success: true,
      data: processedSheets,
      metadata,
      recommendations: [...allRecommendations, ...finalRecommendations],
      issues: allIssues,
      previewData
    };

    logger.info('api', 'Processing complete', {
      data: {
        processingTime: Date.now() - startTime,
        qualityScore: metadata.qualityScore,
        sheetsProcessed: processedSheets.length
      }
    });

    return NextResponse.json(result);

  } catch (error) {
    logger.error('api', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      data: [],
      metadata: {
        filename: '',
        fileSize: 0,
        totalSheets: 0,
        totalRows: 0,
        processingTime: Date.now() - startTime,
        qualityScore: 0,
        complexity: 'very_high' as const,
        cultivationParameters: []
      },
      recommendations: [],
      issues: [{
        severity: 'critical' as const,
        category: 'parsing' as const,
        message: `Import failed: ${error.message}`,
        location: 'File processing',
        suggestion: 'Check file format and try again',
        autoFixable: false
      }]
    } as SmartImportResult, { status: 500 });
  }
}

async function processSheet(
  sheet: ParsedSheet, 
  options: ImportOptions
): Promise<{
  data: ProcessedData;
  recommendations: Recommendation[];
  issues: ImportIssue[];
}> {
  const recommendations: Recommendation[] = [];
  const issues: ImportIssue[] = [];
  
  let processedRows = sheet.data;
  const transformations: string[] = [];
  let confidence = 1.0;

  // Convert sheet issues to import issues
  sheet.metadata.dataQuality.issues.forEach(issue => {
    issues.push({
      severity: issue.severity === 'critical' ? 'critical' : 
                issue.severity === 'high' ? 'error' :
                issue.severity === 'medium' ? 'warning' : 'info',
      category: 'data_quality',
      message: issue.description,
      location: `Sheet: ${sheet.name}, ${issue.location}`,
      suggestion: issue.suggestion,
      autoFixable: ['missing_values', 'merged_cells'].includes(issue.type)
    });
  });

  // Apply intelligent cleaning if enabled
  if (options.autoClean && sheet.data.length > 0) {
    try {
      // Process each column
      const cleanedColumns: any[][] = [];
      const headers = sheet.headers;
      
      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        const columnValues = sheet.data.map(row => row[colIndex]);
        
        // Detect and clean this column
        const cleaningResult: CleaningResult = await intelligentDataCleaner.cleanMixedTypeColumn(columnValues);
        
        cleanedColumns.push(cleaningResult.cleanedValues);
        confidence = Math.min(confidence, cleaningResult.confidence);
        
        // Add transformation descriptions
        cleaningResult.transformations.forEach(transform => {
          transformations.push(`${headers[colIndex]}: ${transform.description}`);
        });
        
        // Convert cleaning issues to import issues
        cleaningResult.issues.forEach(issue => {
          issues.push({
            severity: issue.severity === 'error' ? 'error' : 'warning',
            category: 'conversion',
            message: issue.description,
            location: `Sheet: ${sheet.name}, Column: ${headers[colIndex]}`,
            suggestion: issue.recommendation,
            autoFixable: false
          });
        });
      }
      
      // Transpose cleaned columns back to rows
      if (cleanedColumns.length > 0) {
        processedRows = [];
        const maxRows = Math.max(...cleanedColumns.map(col => col.length));
        
        for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
          const row: any[] = [];
          for (let colIndex = 0; colIndex < cleanedColumns.length; colIndex++) {
            row.push(cleanedColumns[colIndex][rowIndex] ?? null);
          }
          processedRows.push(row);
        }
      }
      
    } catch (error) {
      logger.error('api', 'Error processing sheet', new Error(`Sheet ${sheet.name}: ${error}`));
      issues.push({
        severity: 'error',
        category: 'conversion',
        message: `Data cleaning failed: ${error.message}`,
        location: `Sheet: ${sheet.name}`,
        suggestion: 'Manual data review recommended',
        autoFixable: false
      });
    }
  }

  // Generate sheet-specific recommendations
  if (sheet.metadata.dataQuality.completeness < 80) {
    recommendations.push({
      type: 'data_quality',
      priority: 'high',
      title: 'Incomplete Data Detected',
      description: `Sheet "${sheet.name}" has ${sheet.metadata.dataQuality.completeness}% data completeness`,
      action: 'Consider data imputation or request complete dataset',
      automated: options.autoClean
    });
  }

  if (sheet.metadata.hasMergedCells) {
    recommendations.push({
      type: 'structure',
      priority: 'medium',
      title: 'Merged Cells Found',
      description: 'Merged cells can complicate data processing',
      action: 'Unmerge cells and duplicate values where needed',
      automated: true
    });
  }

  return {
    data: {
      sheetName: sheet.name,
      headers: sheet.headers,
      rows: processedRows,
      originalRowCount: sheet.data.length,
      cleanedRowCount: processedRows.length,
      confidence,
      transformations
    },
    recommendations,
    issues
  };
}

function generateImportMetadata(
  filename: string,
  fileSize: number,
  parseResult: { sheets: ParsedSheet[]; workbookMetadata: WorkbookMetadata },
  processedSheets: ProcessedData[],
  processingTime: number
): ImportMetadata {
  
  const totalRows = processedSheets.reduce((sum, sheet) => sum + sheet.cleanedRowCount, 0);
  const averageConfidence = processedSheets.reduce((sum, sheet) => sum + sheet.confidence, 0) / processedSheets.length;
  
  // Detect cultivation parameters
  const cultivationParameters: string[] = [];
  const cultivationKeywords = ['temperature', 'humidity', 'co2', 'ppfd', 'ph', 'ec', 'vpd', 'dli'];
  
  processedSheets.forEach(sheet => {
    sheet.headers.forEach(header => {
      const normalizedHeader = header.toLowerCase();
      cultivationKeywords.forEach(keyword => {
        if (normalizedHeader.includes(keyword) && !cultivationParameters.includes(keyword)) {
          cultivationParameters.push(keyword);
        }
      });
    });
  });

  // Equipment detection based on patterns
  let equipmentDetected: string | undefined;
  const allHeaders = processedSheets.flatMap(sheet => sheet.headers).join(' ').toLowerCase();
  
  if (allHeaders.includes('priva') || allHeaders.includes('greenhouse')) {
    equipmentDetected = 'Priva Greenhouse Controls';
  } else if (allHeaders.includes('argus') || allHeaders.includes('zone')) {
    equipmentDetected = 'Argus Controls';
  } else if (allHeaders.includes('trol') || allHeaders.includes('vpd')) {
    equipmentDetected = 'TrolMaster';
  }

  return {
    filename,
    fileSize,
    totalSheets: processedSheets.length,
    totalRows,
    processingTime,
    qualityScore: Math.round(parseResult.workbookMetadata.averageQuality * averageConfidence),
    complexity: parseResult.workbookMetadata.processingComplexity,
    equipmentDetected,
    cultivationParameters
  };
}

function generateSmartRecommendations(
  parseResult: { sheets: ParsedSheet[]; workbookMetadata: WorkbookMetadata },
  processedSheets: ProcessedData[],
  context: CultivationContext
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Equipment-specific recommendations
  if (context.equipmentVendor) {
    recommendations.push({
      type: 'equipment',
      priority: 'medium',
      title: 'Equipment-Specific Processing Available',
      description: `Optimized parsing for ${context.equipmentVendor} systems`,
      action: 'Apply equipment-specific data transformations',
      automated: true
    });
  }

  // Cultivation context recommendations
  if (context.cropType) {
    recommendations.push({
      type: 'cultivation',
      priority: 'medium',
      title: 'Crop-Specific Validation',
      description: `Apply ${context.cropType}-specific parameter ranges`,
      action: 'Validate data against crop-specific optimal ranges',
      automated: true
    });
  }

  // Multi-sheet workflow recommendations
  if (processedSheets.length > 1) {
    recommendations.push({
      type: 'structure',
      priority: 'high',
      title: 'Multi-Sheet Integration',
      description: 'Multiple sheets detected with potential relationships',
      action: 'Consider creating unified dataset or time-series alignment',
      automated: false
    });
  }

  // Data quality recommendations
  const avgQuality = parseResult.workbookMetadata.averageQuality;
  if (avgQuality < 70) {
    recommendations.push({
      type: 'data_quality',
      priority: 'critical',
      title: 'Data Quality Improvement Required',
      description: `Overall data quality: ${avgQuality}%`,
      action: 'Apply advanced data cleaning and validation',
      automated: true
    });
  }

  return recommendations;
}

function generatePreviewData(processedSheets: ProcessedData[]): PreviewData {
  // Take first sheet for preview
  const firstSheet = processedSheets[0];
  if (!firstSheet) {
    return {
      sampleRows: [],
      detectedFields: [],
      suggestedMappings: [],
      qualityAssessment: {
        overall: 0,
        completeness: 0,
        consistency: 0,
        validity: 0,
        issues: { critical: 0, high: 0, medium: 0, low: 0 }
      }
    };
  }

  // Sample rows (first 5)
  const sampleRows = firstSheet.rows.slice(0, 5);

  // Detected fields
  const detectedFields: DetectedField[] = firstSheet.headers.map((header, index) => {
    const columnValues = firstSheet.rows.map(row => row[index]).filter(v => v !== null && v !== undefined);
    const sampleValues = columnValues.slice(0, 3);
    
    // Simple type detection
    const isNumeric = columnValues.every(v => !isNaN(Number(v)));
    const isDate = columnValues.every(v => !isNaN(Date.parse(v)));
    
    let dataType = 'text';
    if (isNumeric) dataType = 'number';
    else if (isDate) dataType = 'date';
    
    // Check if it's a cultivation parameter
    const cultivationKeywords = ['temp', 'humid', 'co2', 'ppfd', 'ph', 'ec'];
    const isCultivationParam = cultivationKeywords.some(keyword => 
      header.toLowerCase().includes(keyword)
    );

    return {
      originalName: header,
      suggestedName: header.replace(/[^\w]/g, '_').toLowerCase(),
      dataType,
      confidence: 0.8,
      cultivationParameter: isCultivationParam,
      sampleValues
    };
  });

  // Quality assessment
  const qualityAssessment: QualityAssessment = {
    overall: Math.round(firstSheet.confidence * 100),
    completeness: 85, // Placeholder
    consistency: 90, // Placeholder
    validity: 80, // Placeholder
    issues: {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3
    }
  };

  return {
    sampleRows,
    detectedFields,
    suggestedMappings: [], // Would be generated based on target schema
    qualityAssessment
  };
}