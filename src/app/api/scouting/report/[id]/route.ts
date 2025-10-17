import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

// GET /api/scouting/report/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rec = await prisma.scoutingRecord.findFirst({
      where: { id: params.id, userId },
    });

    if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      id: rec.id,
      timestamp: rec.timestamp,
      issueType: rec.issueType,
      severity: rec.severity,
      zone: rec.zone,
      notes: rec.notes,
      photos: rec.photos || [],
      location: { latitude: rec.latitude, longitude: rec.longitude },
      actionRequired: rec.actionRequired,
      assignedTo: rec.assignedTo,
    });
  } catch (error) {
    logger.error('api: Failed to fetch scouting report', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// PUT /api/scouting/report/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data: any = {};
    if (typeof body.notes === 'string') data.notes = body.notes;
    if (typeof body.assignedTo === 'string' || body.assignedTo === null) data.assignedTo = body.assignedTo || null;
    if (typeof body.actionRequired === 'boolean') data.actionRequired = body.actionRequired;

    // Basic status via actionRequired/assignedTo
    const updated = await prisma.scoutingRecord.update({
      where: { id: params.id },
      data,
    });

    // If high/critical and actionRequired, notify assigned user (if any)
    try {
      if (updated.actionRequired && updated.assignedTo) {
        await prisma.notification.create({
          data: {
            userId: updated.assignedTo,
            type: 'scouting_alert',
            title: `Scouting: ${updated.issueType.toUpperCase()} - ${updated.severity}`,
            message: updated.notes || 'A scouting issue requires your attention',
            data: { scoutingRecordId: updated.id }
          }
        });
      }
    } catch (e) {
      logger.error('api: Failed to create notification', e);
    }

    return NextResponse.json({ success: true, id: updated.id });
  } catch (error) {
    logger.error('api: Failed to update scouting report', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}


