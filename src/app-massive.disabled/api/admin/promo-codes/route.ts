import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId: adminId } = auth();
    
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // TODO: Fix promo code model name in database schema
    const codes: any[] = []; // Temporary empty array
    // const codes = await prisma.promoCode.findMany({
    //   orderBy: { createdAt: 'desc' },
    //   include: {
    //     redemptions: {
    //       select: {
    //         id: true,
    //         userId: true,
    //         redeemedAt: true
    //       }
    //     }
    //   }
    // });

    const formattedCodes = codes.map(code => ({
      id: code.id,
      code: code.code,
      description: code.description,
      credits: code.credits,
      maxUses: code.maxUses,
      currentUses: code.redemptions.length,
      expiresAt: code.expiresAt.toISOString(),
      isActive: code.isActive,
      createdAt: code.createdAt.toISOString(),
      socialPlatforms: code.socialPlatforms || [],
      trackingData: {
        clicks: code.trackingClicks || 0,
        conversions: code.redemptions.length,
        revenue: 0 // Promo codes are free
      }
    }));

    return NextResponse.json({ codes: formattedCodes });

  } catch (error) {
    logger.error('api', 'Error fetching promo codes:', error );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// TODO: Re-enable when database schema is fixed
export async function POST_DISABLED(request: NextRequest) {
  return NextResponse.json({ error: 'Promo code creation temporarily disabled' }, { status: 503 });
  /* Commented out until database schema is fixed
  try {
    const { userId: adminId } = auth();
    
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { 
      description, 
      credits, 
      maxUses, 
      expiresAt, 
      autoGenerate, 
      customCode,
      socialPlatforms 
    } = await request.json();

    if (!description || !credits || !maxUses || !expiresAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate or validate code
    let code: string;
    if (autoGenerate) {
      code = generatePromoCode();
    } else {
      if (!customCode || customCode.length < 3) {
        return NextResponse.json({ error: 'Custom code must be at least 3 characters' }, { status: 400 });
      }
      code = customCode.toUpperCase();
      
      // Check if code already exists
      const existingCode = await prisma.promoCode.findUnique({
        where: { code }
      });
      
      if (existingCode) {
        return NextResponse.json({ error: 'Code already exists' }, { status: 400 });
      }
    }

    // Ensure unique code
    let attempts = 0;
    while (attempts < 10) {
      const existingCode = await prisma.promoCode.findUnique({
        where: { code }
      });
      
      if (!existingCode) break;
      
      if (autoGenerate) {
        code = generatePromoCode();
        attempts++;
      } else {
        return NextResponse.json({ error: 'Code already exists' }, { status: 400 });
      }
    }

    if (attempts >= 10) {
      return NextResponse.json({ error: 'Unable to generate unique code' }, { status: 500 });
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code,
        description,
        credits: parseInt(credits),
        maxUses: parseInt(maxUses),
        expiresAt: new Date(expiresAt),
        socialPlatforms: socialPlatforms || [],
        createdBy: adminId,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      code: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
        credits: promoCode.credits,
        maxUses: promoCode.maxUses,
        currentUses: 0,
        expiresAt: promoCode.expiresAt.toISOString(),
        isActive: promoCode.isActive,
        createdAt: promoCode.createdAt.toISOString(),
        socialPlatforms: promoCode.socialPlatforms || [],
        trackingData: {
          clicks: 0,
          conversions: 0,
          revenue: 0
        }
      }
    });

  } catch (error) {
    logger.error('api', 'Error creating promo code:', error );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
  */
}

function generatePromoCode(): string {
  const prefixes = ['VIBELUX', 'GROW', 'AI', 'FARM', 'SMART'];
  const numbers = Math.floor(Math.random() * 900) + 100; // 100-999
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  return `${prefix}${numbers}`;
}