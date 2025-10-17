import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's stripe customer ID
    const user = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: { stripeCustomerId: true, email: true }
    });

    let customerId = user?.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email || session.sessionClaims?.email as string,
        metadata: {
          userId: session.userId
        }
      });

      // Update user with stripe customer ID
      await prisma.user.update({
        where: { clerkId: session.userId },
        data: { stripeCustomerId: customer.id }
      });

      customerId = customer.id;
    }

    // Create setup intent for adding payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        userId: session.userId
      }
    });

    return NextResponse.json({ 
      clientSecret: setupIntent.client_secret 
    });
  } catch (error) {
    logger.error('api', 'Setup intent error:', error );
    return new NextResponse('Internal error', { status: 500 });
  }
}