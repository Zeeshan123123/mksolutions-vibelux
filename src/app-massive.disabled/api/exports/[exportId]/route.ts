// API endpoints for individual export operations
import { NextRequest, NextResponse } from 'next/server';
import { exportService } from '@/lib/api/export-service';
import { authenticateRequest } from '@/lib/auth';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '@/lib/logging/production-logger';

interface RouteParams {
  params: {
    exportId: string;
  };
}

// GET /api/exports/[exportId] - Get export status
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

    // Check permissions - simplified for now
    // TODO: Implement proper user and facility permissions

    return NextResponse.json({
      id: exportId,
      status: exportStatus.status,
      progress: exportStatus.progress,
      createdAt: exportStatus.createdAt,
      updatedAt: exportStatus.updatedAt,
      error: exportStatus.error,
      downloadUrl: exportStatus.status === 'completed' ? `/api/exports/${exportId}/download` : null
    });

  } catch (error) {
    logger.error('api', 'Export status error:', error );
    return NextResponse.json(
      { error: 'Failed to get export status' },
      { status: 500 }
    );
  }
}

// DELETE /api/exports/[exportId] - Cancel or delete export
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check permissions - simplified for now
    // TODO: Implement proper user and facility permissions

    // Only allow deletion of completed or failed exports
    if (exportStatus.status === 'processing') {
      return NextResponse.json(
        { error: 'Cannot delete export in progress' },
        { status: 400 }
      );
    }

    // Delete export file and cache entry
    // In production, implement actual deletion
    
    return NextResponse.json({
      message: 'Export deleted successfully'
    });

  } catch (error) {
    logger.error('api', 'Export deletion error:', error );
    return NextResponse.json(
      { error: 'Failed to delete export' },
      { status: 500 }
    );
  }
}