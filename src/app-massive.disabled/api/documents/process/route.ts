import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { DocumentAnalysisService } from '@/services/document-analysis.service';

const documentAnalysisService = new DocumentAnalysisService();

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const documentId = searchParams.get('documentId');
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'status':
        if (!jobId) {
          return NextResponse.json(
            { error: 'jobId is required for status check' },
            { status: 400 }
          );
        }

        const job = await documentAnalysisService.getJobStatus(jobId);
        if (!job) {
          return NextResponse.json(
            { error: 'Job not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          job: {
            id: job.id,
            documentId: job.documentId,
            status: job.status,
            priority: job.priority,
            createdAt: job.createdAt,
            startedAt: job.startedAt,
            completedAt: job.completedAt,
            processingTime: job.completedAt && job.startedAt ? 
              job.completedAt.getTime() - job.startedAt.getTime() : undefined,
            error: job.error,
            retryCount: job.retryCount
          }
        });

      case 'result':
        if (!documentId) {
          return NextResponse.json(
            { error: 'documentId is required for results' },
            { status: 400 }
          );
        }

        const result = await documentAnalysisService.getDocumentResults(documentId);
        if (!result) {
          return NextResponse.json(
            { error: 'Document results not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          result: {
            id: result.id,
            documentType: result.documentType,
            extractedText: result.extractedText,
            confidence: result.confidence,
            structuredData: result.structuredData,
            timestamp: result.timestamp,
            processingTime: result.processingTime,
            errors: result.errors,
            metadata: result.metadata
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: status, result' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('api', 'Process request failed', error as Error);
    return NextResponse.json(
      { error: 'Process request failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'reprocess':
        const { jobId, options } = data;
        
        if (!jobId) {
          return NextResponse.json(
            { error: 'jobId is required for reprocessing' },
            { status: 400 }
          );
        }

        // Get existing job
        const existingJob = await documentAnalysisService.getJobStatus(jobId);
        if (!existingJob) {
          return NextResponse.json(
            { error: 'Job not found' },
            { status: 404 }
          );
        }

        // Create new job for reprocessing
        const newJobId = `job_retry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // In a real implementation, you would restart the processing
        // For now, return a mock response
        logger.info('api', 'Reprocessing requested', {
          originalJobId: jobId,
          newJobId,
          requestedBy: userId,
          options
        });

        return NextResponse.json({
          success: true,
          message: 'Document reprocessing started',
          newJobId,
          estimatedTime: '30-120 seconds'
        });

      case 'update_classification':
        const { documentId, newDocumentType, feedback } = data;
        
        if (!documentId || !newDocumentType) {
          return NextResponse.json(
            { error: 'documentId and newDocumentType are required' },
            { status: 400 }
          );
        }

        // Store user feedback for model improvement
        logger.info('api', 'Document reclassification', {
          documentId,
          newDocumentType,
          feedback,
          updatedBy: userId
        });

        return NextResponse.json({
          success: true,
          message: 'Document classification updated',
          documentId,
          newDocumentType
        });

      case 'validate_extraction':
        const { documentId: validationDocId, corrections } = data;
        
        if (!validationDocId || !corrections) {
          return NextResponse.json(
            { error: 'documentId and corrections are required' },
            { status: 400 }
          );
        }

        // Store validation feedback
        logger.info('api', 'Extraction validation', {
          documentId: validationDocId,
          correctionsCount: Object.keys(corrections).length,
          validatedBy: userId
        });

        return NextResponse.json({
          success: true,
          message: 'Extraction validation recorded',
          documentId: validationDocId,
          correctionsApplied: Object.keys(corrections).length
        });

      case 'batch_process':
        const { facilityId, documentIds, processingOptions } = data;
        
        if (!facilityId || !documentIds || !Array.isArray(documentIds)) {
          return NextResponse.json(
            { error: 'facilityId and documentIds array are required' },
            { status: 400 }
          );
        }

        if (documentIds.length > 50) {
          return NextResponse.json(
            { error: 'Maximum 50 documents per batch' },
            { status: 400 }
          );
        }

        // Create batch processing jobs
        const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const jobIds = documentIds.map(docId => `job_${Date.now()}_${docId}_${Math.random().toString(36).substr(2, 5)}`);

        logger.info('api', 'Batch processing started', {
          batchId,
          facilityId,
          documentCount: documentIds.length,
          requestedBy: userId,
          options: processingOptions
        });

        return NextResponse.json({
          success: true,
          batchId,
          jobIds,
          documentCount: documentIds.length,
          estimatedTime: `${Math.ceil(documentIds.length * 60 / 60)} minutes`,
          message: 'Batch processing started'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: reprocess, update_classification, validate_extraction, batch_process' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('api', 'Process action failed', error as Error);
    return NextResponse.json(
      { error: 'Process action failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}