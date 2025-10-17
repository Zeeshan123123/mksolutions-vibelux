import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ScoutingService } from '@/services/scouting.service';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

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
    
    // Validate required fields
    if (!body.location || !body.issueType || !body.severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const scoutingService = ScoutingService.getInstance();
    
    const reportId = await scoutingService.createScoutingReport({
      facilityId: body.facilityId || 'DEFAULT-FACILITY',
      employeeId: userId,
      location: body.location,
      issueType: body.issueType,
      severity: body.severity,
      photos: body.photos || [],
      notes: body.notes || '',
      timestamp: new Date(),
      status: 'submitted',
      metadata: {
        deviceInfo: request.headers.get('user-agent') || undefined,
        cropStage: body.cropStage,
        affectedArea: body.affectedArea
      }
    });

    logger.info('api', 'Scouting report created', { reportId, userId });

    return NextResponse.json({
      success: true,
      reportId,
      message: 'Scouting report submitted successfully'
    });
  } catch (error) {
    logger.error('api', 'Failed to create scouting report', error as Error);
    return NextResponse.json(
      { error: 'Failed to create scouting report' },
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

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId') || 'DEFAULT-FACILITY';
    
    const scoutingService = ScoutingService.getInstance();
    
    const history = await scoutingService.getScoutingHistory(facilityId, {
      employeeId: userId,
      dateFrom: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
      dateTo: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
      issueType: searchParams.get('type') || undefined,
      severity: searchParams.get('severity') || undefined
    });

    return NextResponse.json({
      success: true,
      reports: history
    });
  } catch (error) {
    logger.error('api', 'Failed to get scouting history', error as Error);
    return NextResponse.json(
      { error: 'Failed to get scouting history' },
      { status: 500 }
    );
  }
}