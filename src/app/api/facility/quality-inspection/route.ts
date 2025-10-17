import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { qualityControlAssistant } from '@/lib/vision/facility-inspection-service';
export const dynamic = 'force-dynamic'

// Quality Inspection - For finished product QC only
// NOT for monitoring growing plants
export async function POST(request: NextRequest) {
  try {
    const { 
      imageUrl, 
      imageBase64, 
      facilityId, 
      batchId,
      productType, // 'packaged-flower', 'pre-roll', 'edible'
      inspectedBy
    } = await request.json();

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Either imageUrl or imageBase64 is required' },
        { status: 400 }
      );
    }

    const image = imageUrl || Buffer.from(imageBase64, 'base64');

    // Quality control for finished products only
    const [packagingQC, labelingQC] = await Promise.all([
      qualityControlAssistant.inspectPackaging(image),
      qualityControlAssistant.verifyLabeling(image)
    ]);

    // Generate QC report
    const qcReport = {
      reportId: `QC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      facilityId,
      batchId,
      productType,
      inspectedBy,
      
      // Packaging quality
      packaging: {
        passed: packagingQC.passQC,
        issues: packagingQC.issues,
        recommendations: packagingQC.recommendations
      },
      
      // Label compliance
      labeling: {
        compliant: labelingQC.compliant,
        missingElements: labelingQC.missingElements,
        corrections: labelingQC.corrections
      },
      
      // Overall result
      overallResult: {
        passed: packagingQC.passQC && labelingQC.compliant,
        requiresAction: packagingQC.issues.length > 0 || labelingQC.missingElements.length > 0,
        actions: [
          ...packagingQC.recommendations,
          ...labelingQC.corrections
        ]
      },
      
      // Compliance notes
      complianceNotes: [
        'QC inspection completed for finished product',
        'Document results in batch records',
        'Address any issues before product release'
      ],
      
      disclaimer: 'This inspection is for finished product quality control only.'
    };

    // Log for batch records
    logger.info('api', `QC inspection completed:`, { data: {
      batchId, passed: qcReport.overallResult.passed, timestamp: new Date()
    }});

    return NextResponse.json(qcReport);

  } catch (error: any) {
    logger.error('api', 'Quality inspection error:', error );
    return NextResponse.json(
      { 
        error: 'Failed to complete quality inspection', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}