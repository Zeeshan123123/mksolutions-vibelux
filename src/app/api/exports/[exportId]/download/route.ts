// API endpoint for downloading export files
import { NextRequest, NextResponse } from 'next/server';
import { exportService } from '@/lib/api/export-service';
import { authenticateRequest } from '@/lib/auth';
import { userHasTrialAccess } from '@/lib/marketplace/entitlements';
import { readFileSync, existsSync, statSync } from 'fs';
import { basename } from 'path';
export const dynamic = 'force-dynamic'
import { logger } from '@/lib/logging/production-logger';

interface RouteParams {
  params: {
    exportId: string;
  };
}

// GET /api/exports/[exportId]/download - Download export file
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }
    const { exportId } = params;

    const exportStatus = await exportService.getExportStatus(exportId);

    if (!exportStatus) {
      return NextResponse.json(
        { error: 'Export not found' },
        { status: 404 }
      );
    }

    // Optional entitlement guard: if export is tied to a trial/listing, enforce buyer access
    if (exportStatus.trialId) {
      const allowed = await userHasTrialAccess(auth.userId!, exportStatus.trialId)
      if (!allowed) {
        return NextResponse.json({ error: 'Entitlement required' }, { status: 403 });
      }
    }

    // Check if export is completed
    if (exportStatus.status !== 'completed') {
      return NextResponse.json(
        { error: 'Export not ready for download' },
        { status: 400 }
      );
    }

    // Check if file exists
    const filePath = exportStatus.filePath;
    if (!filePath || !existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Export file not found' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = readFileSync(filePath);
    const fileStats = statSync(filePath);
    const fileName = basename(filePath);

    // Determine content type based on file extension
    const contentType = getContentType(fileName);

    // Create response with file
    const response = new NextResponse(fileBuffer);

    // Set headers for file download
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    response.headers.set('Content-Length', fileStats.size.toString());
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Log download for audit
    logger.info('api', `Export downloaded: ${exportId} by user ${auth.userId}`);

    return response;

  } catch (error) {
    logger.error('api', 'Export download error:', error );
    return NextResponse.json(
      { error: 'Failed to download export' },
      { status: 500 }
    );
  }
}

function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'csv':
      return 'text/csv';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'json':
      return 'application/json';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}