/**
 * Document Analysis API
 * AI-powered document processing and data extraction
 */
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { documentAnalysisService } from '@/lib/document-analysis.service';
import { logger } from '@/lib/logging/production-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilityId, documentType, documentUrl, documentContent, analysisType } = body;

    if (!facilityId || !documentType || (!documentUrl && !documentContent)) {
      return NextResponse.json({
        error: 'Missing required fields: facilityId, documentType, and either documentUrl or documentContent'
      }, { status: 400 });
    }

    const analysisRequest = {
      facilityId,
      documentType,
      documentUrl,
      documentContent,
      analysisType: analysisType || 'extract_data'
    };

    const result = await documentAnalysisService.analyzeDocument(analysisRequest);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('api', 'Document analysis failed:', error);

    return NextResponse.json({
      error: 'Failed to analyze document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({
        error: 'facilityId parameter is required'
      }, { status: 400 });
    }

    // Return supported document types and analysis options
    const supportedFeatures = {
      documentTypes: {
        invoice: {
          name: 'Invoice Processing',
          description: 'Extract invoice data, vendor information, line items, and totals',
          extractedFields: ['invoiceNumber', 'date', 'vendor', 'total', 'tax', 'items']
        },
        compliance_report: {
          name: 'Compliance Reports',
          description: 'Analyze regulatory compliance and identify violations',
          extractedFields: ['reportType', 'inspectionDate', 'violations', 'complianceScore']
        },
        energy_bill: {
          name: 'Energy Bills',
          description: 'Extract utility usage data and cost breakdowns',
          extractedFields: ['accountNumber', 'totalKwh', 'peakDemand', 'energyCharges', 'totalAmount']
        },
        maintenance_log: {
          name: 'Maintenance Logs',
          description: 'Process maintenance records and equipment service data',
          extractedFields: ['equipmentId', 'datePerformed', 'workPerformed', 'partsReplaced', 'totalCost']
        },
        sensor_report: {
          name: 'Sensor Reports',
          description: 'Analyze sensor data and environmental measurements',
          extractedFields: ['sensorType', 'temperature', 'humidity', 'co2Level', 'alerts']
        },
        financial_statement: {
          name: 'Financial Statements',
          description: 'Extract financial data and key performance indicators',
          extractedFields: ['revenue', 'expenses', 'netIncome', 'assets', 'liabilities']
        }
      },
      analysisTypes: {
        extract_data: 'Basic data extraction and field identification',
        compliance_check: 'Compliance validation and violation detection',
        cost_analysis: 'Financial analysis and cost optimization insights',
        performance_metrics: 'KPI extraction and performance analysis',
        predictive_insights: 'Trend analysis and future predictions'
      },
      supportedFormats: ['pdf', 'jpg', 'png', 'tiff', 'docx'],
      maxFileSize: '10MB',
      processingTime: '2-10 seconds depending on document complexity'
    };

    return NextResponse.json({
      success: true,
      data: {
        facilityId,
        supportedFeatures,
        modelVersions: {
          ocr_engine: 'enhanced_ocr_v2.1',
          nlp_extraction: 'document_nlp_v3.0',
          compliance_checker: 'compliance_ai_v1.8'
        }
      }
    });

  } catch (error) {
    logger.error('api', 'Failed to get document analysis info:', error);

    return NextResponse.json({
      error: 'Failed to retrieve document analysis information'
    }, { status: 500 });
  }
}