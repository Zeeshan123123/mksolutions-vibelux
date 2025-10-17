import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { CREDIT_PACKAGES } from '@/lib/pricing/unified-pricing';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
import { validateRequestBody } from '@/lib/validation/api-schemas';

const getStripe = async () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  const { default: Stripe } = await import('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil',
  });
};

const purchaseSchema = z.object({
  packageId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = await getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Payment processing not configured' }, { status: 503 });
    }

    const { data, error } = await validateRequestBody(req, purchaseSchema);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.id === data?.packageId);
    if (!creditPackage) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Calculate total credits including bonus
    const totalCredits = creditPackage.credits + (creditPackage.credits * creditPackage.bonus / 100);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: creditPackage.name,
              description: `${totalCredits} credits for VibeLux platform`,
              metadata: {
                packageId: creditPackage.id,
                credits: creditPackage.credits.toString(),
                bonus: creditPackage.bonus.toString(),
              },
            },
            unit_amount: creditPackage.price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        packageId: creditPackage.id,
        credits: creditPackage.credits.toString(),
        bonus: creditPackage.bonus.toString(),
        totalCredits: totalCredits.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    logger.error('api', 'Error creating checkout session:', error );
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}