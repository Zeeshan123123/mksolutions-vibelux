import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId }
    });

    if (!affiliate) {
      return NextResponse.json({ links: [] });
    }

    const links = await prisma.affiliateLink.findMany({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Format links for frontend
    const formattedLinks = links.map(link => ({
      id: link.id,
      url: link.originalUrl,
      shortCode: link.shortCode,
      clicks: link.clicks,
      conversions: link.conversions,
      revenue: link.revenue,
      createdAt: link.createdAt
    }));

    return NextResponse.json({ links: formattedLinks });

  } catch (error) {
    console.error('Error fetching affiliate links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}