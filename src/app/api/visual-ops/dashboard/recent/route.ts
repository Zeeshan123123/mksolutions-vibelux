import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const facilityId = searchParams.get('facilityId') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    const [photos, quality] = await Promise.all([
      prisma.photoReport.findMany({
        where: { ...(facilityId ? { facilityId } : {}) },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),
      prisma.qualityReport.findMany({
        where: { ...(facilityId ? { facilityId } : {}) },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    ]);

    return NextResponse.json({
      success: true,
      status: 'active',
      data: {
        reports: {
          photoReports: photos,
          qualityReports: quality
        },
        total: photos.length + quality.length
      }
    });
  } catch (error) {
    logger.error('api', 'Visual Ops recent error', error as Error);
    return NextResponse.json({ success: false, status: 'error', message: 'Failed to load reports' }, { status: 500 });
  }
}