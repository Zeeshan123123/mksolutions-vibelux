import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
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
      return NextResponse.json([]);
    }

    // Get payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    // Get default payment method
    const customer = await stripe.customers.retrieve(user.stripeCustomerId) as any;
    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;

    // Format payment methods
    const formattedMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      card: {
        brand: pm.card?.brand || 'unknown',
        last4: pm.card?.last4 || '****',
        exp_month: pm.card?.exp_month || 0,
        exp_year: pm.card?.exp_year || 0,
      },
      is_default: pm.id === defaultPaymentMethodId
    }));

    return NextResponse.json(formattedMethods);
  } catch (error) {
    logger.error('api', 'Get payment methods error:', error );
    return new NextResponse('Internal error', { status: 500 });
  }
}