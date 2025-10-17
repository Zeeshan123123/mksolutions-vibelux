// API endpoints for data exports
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { exportService } from '@/lib/api/export-service';
export const dynamic = 'force-dynamic'
import { authenticateRequest } from '@/lib/auth';

// POST /api/exports - Create new export request
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      dataTypes,
      dateRange,
      format = 'xlsx',
      includePhotos = false,
      includePersonalData = false
    } = body;

    // Validate request
    if (!dataTypes || !Array.isArray(dataTypes) || dataTypes.length === 0) {
      return NextResponse.json(
        { error: 'Data types are required' },
        { status: 400 }
      );
    }

    if (!dateRange?.start || !dateRange?.end) {
      return NextResponse.json(
        { error: 'Date range is required' },
        { status: 400 }
      );
    }

    // Check permissions for personal data - simplified for now
    // TODO: Implement proper role-based permissions

    // Create export request
    const exportId = await exportService.createExportRequest({
      facilityId: 'facility-1', // TODO: Get from user context
      dataTypes,
      dateRange: {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      },
      format,
      includePhotos,
      includePersonalData,
      requestedBy: auth.userId!
    });

    return NextResponse.json({
      exportId,
      status: 'pending',
      message: 'Export request created successfully'
    });

  } catch (error) {
    logger.error('api', 'Export creation error:', error );
    return NextResponse.json(
      { error: 'Failed to create export request' },
      { status: 500 }
    );
  }
}

// GET /api/exports - List export requests
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityFilter = searchParams.get('facility');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Admin can view all exports, others only their facility - simplified for now
    // TODO: Implement proper role-based filtering
    const facilityIds = facilityFilter ? [facilityFilter] : ['all'];

    // In production, query from database
    const mockExports = [
      {
        id: 'exp-001',
        facilityId: 'facility-1',
        facilityName: 'Sample Facility',
        requestedBy: auth.userId!,
        requestedByName: 'User',
        exportType: 'full',
        dataTypes: ['photo_reports', 'harvest_data', 'environmental_data'],
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        format: 'xlsx',
        status: 'completed',
        fileSize: 15728640,
        downloadUrl: `/api/exports/exp-001/download`,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      }
    ];

    const filteredExports = mockExports.filter(exp => {
      if (status && exp.status !== status) return false;
      if (facilityFilter && facilityFilter !== 'all' && exp.facilityId !== facilityFilter) return false;
      // TODO: Implement proper permission checking
      return true;
    });

    return NextResponse.json({
      exports: filteredExports.slice(0, limit),
      total: filteredExports.length,
      hasMore: filteredExports.length > limit
    });

  } catch (error) {
    logger.error('api', 'Export listing error:', error );
    return NextResponse.json(
      { error: 'Failed to list exports' },
      { status: 500 }
    );
  }
}