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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: session.userId }
    });

    if (!user || !user.stripeCustomerId) {
      return new NextResponse('No Stripe customer found', { status: 404 });
    }

    // Create a Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.vercel.app'}/dashboard?portal=success`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    logger.error('api', 'Stripe customer portal error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}