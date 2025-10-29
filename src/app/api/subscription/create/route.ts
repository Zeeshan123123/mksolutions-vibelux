// Create NEW file: /src/app/api/subscription/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any,
  typescript: true,
});

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { priceId, tier } = body; // e.g., tier: 'starter', 'professional'

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      
      customerId = customer.id;
      
      // Save customer ID to database
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // ✨ Build subscription items including metered pricing
    const subscriptionItems: Stripe.SubscriptionCreateParams.Item[] = [
      // Base plan (fixed monthly price)
      {
        price: priceId, // e.g., price_starter_39, price_professional_99
      },
      // 🔥 AI Credits (metered) - THIS IS THE KEY ADDITION
      {
        price: process.env.STRIPE_METERED_AI_CREDITS_PRICE_ID!,
      },
    ];

    // Create subscription with metered items
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: subscriptionItems,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: user.id,
        tier: tier,
      },
    });

    // ✨ Extract and save subscription item ID for AI credits
    const subscriptionItemAI = subscription.items.data.find(
      item => item.price.id === process.env.STRIPE_METERED_AI_CREDITS_PRICE_ID
    )?.id;

    // Save subscription details to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeSubscriptionStatus: subscription.status,
        subscriptionTier: tier,
        subscriptionPeriodEnd: new Date(((subscription as any).current_period_end || Date.now() / 1000) * 1000),
        // ✨ Save subscription item ID for usage reporting
        stripeSubscriptionItemAI: subscriptionItemAI,
      },
    });

    // Return client secret for payment confirmation
    const latestInvoice = subscription.latest_invoice as any;
    const paymentIntent = latestInvoice?.payment_intent as any;

    logger.info('subscription Subscription created successfully', {
      userId: user.id,
      subscriptionId: subscription.id,
      tier,
    });

    return NextResponse.json({
  subscriptionId: subscription.id,
  clientSecret: paymentIntent?.client_secret || null,
});
  } catch (error) {
    logger.error('subscription Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}