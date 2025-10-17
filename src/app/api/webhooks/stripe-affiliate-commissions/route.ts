import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
  }
  if (!stripe) throw new Error('Stripe is not configured');
  return stripe;
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    if (!webhookSecret) {
      logger.error('api', 'Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }
    const signature = headers().get('stripe-signature') as string;
    const raw = await request.text();

    const stripe = getStripe();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(raw, signature, webhookSecret);
    } catch (err) {
      logger.error('api', 'Affiliate webhook signature verification failed', err as Error);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Placeholder: correlate event to affiliate conversion, compute commission, persist
    logger.info('api', `Affiliate event: ${event.type}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('api', 'Affiliate webhook error', error as Error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}