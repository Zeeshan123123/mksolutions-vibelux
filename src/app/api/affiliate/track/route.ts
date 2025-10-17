import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    // Find affiliate by code or short link
    let affiliate;
    
    // First check if it's an affiliate code
    affiliate = await prisma.affiliate.findUnique({
      where: { code: code.toUpperCase() }
    });

    // If not found, check if it's a short link code
    if (!affiliate) {
      const link = await prisma.affiliateLink.findUnique({
        where: { shortCode: code.toLowerCase() }
      });
      
      if (link) {
        affiliate = await prisma.affiliate.findUnique({
          where: { id: link.affiliateId }
        });

        // Update link click count
        await prisma.affiliateLink.update({
          where: { id: link.id },
          data: { 
            clicks: { increment: 1 },
            updatedAt: new Date()
          }
        });
      }
    }

    if (!affiliate) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Get IP for uniqueness check
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Record the click
    await prisma.affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || '',
        referrer: request.headers.get('referer') || '',
        landingPage: '/',
        metadata: {}
      }
    });

    // Update affiliate total clicks
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: { 
        totalClicks: { increment: 1 },
        lastClickAt: new Date()
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}