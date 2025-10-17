import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { isActive } = await request.json();

    // TODO: Fix promo code model name in database schema
    // const promoCode = await prisma.promoCode.update({
    //   where: { id: params.id },
    //   data: { isActive }
    // });

    return NextResponse.json({
      success: true,
      message: 'Promo code toggle temporarily disabled - needs database schema fix'
    });

  } catch (error) {
    logger.error('api', 'Error toggling promo code status:', error );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}