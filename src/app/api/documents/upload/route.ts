import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { DocumentAnalysisService } from '@/services/document-analysis.service';
export const dynamic = 'force-dynamic'

const documentAnalysisService = new DocumentAnalysisService();

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const facilityId = formData.get('facilityId') as string;
    const documentType = formData.get('documentType') as string;
    const tags = formData.get('tags') as string;

    if (!file || !facilityId) {
      return NextResponse.json(
        { error: 'File and facilityId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/tiff',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload JPEG, PNG, TIFF, or PDF files.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create document upload object
    const upload = {
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename: `${Date.now()}_${file.name}`,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      buffer,
      uploadedBy: userId,
      uploadedAt: new Date(),
      documentType: documentType || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined,
      metadata: {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    };

    // Start processing
    const job = await documentAnalysisService.processDocument(upload, facilityId);

    logger.info('api', 'Document uploaded and processing started', {
      uploadId: upload.id,
      jobId: job.id,
      facilityId,
      filename: file.name,
      size: file.size,
      documentType,
      uploadedBy: userId
    });

    return NextResponse.json({
      success: true,
      upload: {
        id: upload.id,
        filename: upload.originalName,
        size: upload.size,
        documentType: upload.documentType,
        uploadedAt: upload.uploadedAt
      },
      job: {
        id: job.id,
        status: job.status,
        priority: job.priority,
        createdAt: job.createdAt
      },
      message: 'Document uploaded successfully and processing started'
    });

  } catch (error) {
    logger.error('api', 'Document upload failed', error as Error);
    return NextResponse.json(
      { error: 'Document upload failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      uploadLimits: {
        maxFileSize: '10MB',
        allowedTypes: ['JPEG', 'PNG', 'TIFF', 'PDF'],
        maxFilesPerBatch: 10,
        processingTimeEstimate: '30-120 seconds per document'
      },
      supportedDocumentTypes: [
        {
          type: 'lab_report',
          description: 'Cannabis lab testing certificates and reports',
          expectedFields: ['Sample ID', 'THC %', 'CBD %', 'Test Results', 'Lab Name']
        },
        {
          type: 'license',
          description: 'Cannabis business licenses and permits',
          expectedFields: ['License Number', 'License Type', 'Expiration Date', 'Business Name']
        },
        {
          type: 'manifest',
          description: 'Transport manifests and delivery documents',
          expectedFields: ['Manifest Number', 'Shipper', 'Receiver', 'Package Details']
        },
        {
          type: 'inspection',
          description: 'Regulatory inspection reports and compliance documents',
          expectedFields: ['Inspection ID', 'Inspector', 'Date', 'Violations', 'Status']
        },
        {
          type: 'invoice',
          description: 'Invoices, receipts, and financial documents',
          expectedFields: ['Invoice Number', 'Date', 'Total Amount', 'Vendor']
        },
        {
          type: 'inventory',
          description: 'Inventory reports and tracking documents',
          expectedFields: ['Product Names', 'Quantities', 'Batch Numbers', 'Locations']
        },
        {
          type: 'permit',
          description: 'Building permits and regulatory approvals',
          expectedFields: ['Permit Number', 'Issue Date', 'Expiration', 'Type']
        }
      ],
      processingFlow: [
        'Document upload and validation',
        'OCR processing and text extraction',
        'Document type classification',
        'Structured data extraction',
        'Compliance validation',
        'Alert generation (if needed)',
        'Results available for review'
      ]
    });

  } catch (error) {
    logger.error('api', 'Failed to get upload info', error as Error);
    return NextResponse.json(
      { error: 'Failed to get upload information' },
      { status: 500 }
    );
  }
}