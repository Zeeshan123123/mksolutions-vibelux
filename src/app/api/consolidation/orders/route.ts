import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

// GET consolidation orders for user
export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const orders = await prisma.consolidationOrder.findMany({
      where: { buyerId: dbUser.id },
      include: {
        consolidationCenter: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: orders
    });
  } catch (error) {
    logger.error('api', 'Error fetching orders:', error );
    return NextResponse.json(
      { error: 'Failed to fetch consolidation orders' },
      { status: 500 }
    );
  }
}

// POST create consolidation order
export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate center exists
    const center = await prisma.consolidationCenter.findUnique({
      where: { id: body.consolidationCenterId }
    });

    if (!center) {
      return NextResponse.json(
        { error: 'Consolidation center not found' },
        { status: 404 }
      );
    }

    // Calculate costs
    const productTotal = body.sourceOrders.reduce((sum: number, order: any) => 
      sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.totalPrice, 0), 0
    );
    
    // Simplified fee calculation
    const consolidationFees = 50 * body.sourceOrders.length;
    const storageFees = 25 * body.sourceOrders.length * 2; // 2 days estimated
    const deliveryFees = body.deliveryFees || 200;

    // Create consolidation order
    const order = await prisma.consolidationOrder.create({
      data: {
        buyerId: dbUser.id,
        consolidationCenterId: body.consolidationCenterId,
        status: 'pending',
        totalWeight: body.totalWeight || 0,
        totalValue: productTotal + consolidationFees + storageFees + deliveryFees,
        scheduledPickup: body.requestedDeliveryDate ? new Date(body.requestedDeliveryDate) : null
      },
      include: {
        consolidationCenter: true
      }
    });

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error('api', 'Error creating order:', error );
    return NextResponse.json(
      { error: 'Failed to create consolidation order' },
      { status: 500 }
    );
  }
}