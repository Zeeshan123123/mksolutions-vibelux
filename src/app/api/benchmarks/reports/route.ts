import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const search = req.nextUrl.searchParams;
    const facilityId = search.get('facilityId');
    if (!facilityId) {
      return NextResponse.json({ reports: [] });
    }

    // Ensure the user has access to this facility
    const hasAccess = await prisma.facilityUser.findFirst({
      where: { userId, facilityId },
      select: { id: true },
    });
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch recent market data as a basis to synthesize report entries
    const since = new Date();
    since.setMonth(since.getMonth() - 1); // last 30 days

    const data = await prisma.marketData.findMany({
      where: {
        facilityId,
        saleDate: { gte: since },
      },
      orderBy: { saleDate: 'desc' },
      take: 1,
      select: {
        saleDate: true,
        facility: { select: { id: true, name: true } },
      },
    });

    const latest = data[0];
    const createdAt = latest?.saleDate || new Date();

    const reports = [
      {
        id: `report_${facilityId}_${createdAt.getTime()}`,
        reportType: 'market-analytics',
        period: 'monthly',
        createdAt,
        facility: {
          id: latest?.facility?.id || facilityId,
          name: latest?.facility?.name || 'Facility',
        },
      },
    ];

    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}


