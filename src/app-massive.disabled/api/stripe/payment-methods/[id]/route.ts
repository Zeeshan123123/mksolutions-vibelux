import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's stripe customer ID
    const user = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: { stripeCustomerId: true }
    });

    if (!user?.stripeCustomerId) {
      return new NextResponse('No customer found', { status: 404 });
    }

    // Verify the payment method belongs to this customer
    const paymentMethod = await stripe.paymentMethods.retrieve(params.id);
    if (paymentMethod.customer !== user.stripeCustomerId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // Detach payment method
    await stripe.paymentMethods.detach(params.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('api', 'Delete payment method error:', error );
    return new NextResponse('Internal error', { status: 500 });
  }
}