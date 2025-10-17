import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function POST(
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

    // Update customer's default payment method
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: params.id,
      },
    });

    // Also attach this payment method if not already attached
    if (!paymentMethod.customer) {
      await stripe.paymentMethods.attach(params.id, {
        customer: user.stripeCustomerId,
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('api', 'Set default payment method error:', error );
    return new NextResponse('Internal error', { status: 500 });
  }
}