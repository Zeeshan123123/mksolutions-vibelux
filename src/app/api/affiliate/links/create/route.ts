import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId }
    });

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate account not found' }, { status: 404 });
    }

    // Generate unique short code
    const shortCode = await generateUniqueShortCode();

    // Create the affiliate link
    const link = await prisma.affiliateLink.create({
      data: {
        affiliateId: affiliate.id,
        originalUrl: url,
        shortCode,
        clicks: 0,
        uniqueClicks: 0,
        conversions: 0,
        revenue: 0,
        isActive: true,
        utmSource: 'affiliate',
        utmMedium: 'referral',
        utmCampaign: affiliate.code
      }
    });

    return NextResponse.json({
      link: {
        id: link.id,
        url: link.originalUrl,
        shortCode: link.shortCode,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        createdAt: link.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating affiliate link:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

async function generateUniqueShortCode(): Promise<string> {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let attempts = 0;
  
  while (attempts < 10) {
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if code already exists
    const existing = await prisma.affiliateLink.findUnique({
      where: { shortCode: code }
    });
    
    if (!existing) {
      return code;
    }
    
    attempts++;
  }
  
  // Fallback to timestamp-based code
  return `vb${Date.now().toString(36)}`;
}