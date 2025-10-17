import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

function toCsv(rows: any[]): string {
  if (!rows.length) return 'id,timestamp,facilityId,userId,issueType,severity,zone,latitude,longitude,notes,photosCount,actionRequired,assignedTo\n';
  const header = ['id','timestamp','facilityId','userId','issueType','severity','zone','latitude','longitude','notes','photosCount','actionRequired','assignedTo'];
  const csv = [header.join(',')];
  for (const r of rows) {
    const line = [
      r.id,
      r.timestamp.toISOString(),
      r.facilityId || '',
      r.userId,
      r.issueType,
      r.severity,
      r.zone || '',
      String(r.latitude),
      String(r.longitude),
      (r.notes || '').replace(/\n/g, ' ').replace(/,/g, ';'),
      String((r.photos || []).length),
      r.actionRequired ? 'true' : 'false',
      r.assignedTo || ''
    ];
    csv.push(line.map(v => v == null ? '' : String(v)).join(','));
  }
  return csv.join('\n') + '\n';
}

// GET /api/scouting/export?facilityId=...&from=...&to=...&format=csv
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const facilityId = searchParams.get('facilityId') || undefined;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const format = (searchParams.get('format') || 'csv').toLowerCase();

    const where: any = {};
    if (facilityId) where.facilityId = facilityId;
    if (from || to) {
      where.timestamp = {} as any;
      if (from) where.timestamp.gte = new Date(from);
      if (to) where.timestamp.lte = new Date(to);
    }

    const records = await prisma.scoutingRecord.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    });

    if (format === 'csv') {
      const csv = toCsv(records);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="scouting-export-${Date.now()}.csv"`
        }
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error) {
    logger.error('api: Scouting export failed', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}


