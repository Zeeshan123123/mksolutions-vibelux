import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { stripe } from '@/lib/stripe';
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if customer exists or create one
    let customerId: string;
    
    // Search for existing customer by email
    const email = session.sessionClaims?.email as string;
    if (email) {
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1
      });
      
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email,
          metadata: {
            userId: session.userId,
          }
        });
        customerId = customer.id;
      }
    } else {
      // Create customer without email
      const customer = await stripe.customers.create({
        metadata: {
          userId: session.userId,
        }
      });
      customerId = customer.id;
    }

    // Create Setup Intent for collecting payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session', // Can charge later without customer present
      metadata: {
        userId: session.userId,
        purpose: 'free_trial_collection'
      }
    });

    logger.info('api', 'Setup intent created for payment method collection', {
      userId: session.userId,
      customerId,
      setupIntentId: setupIntent.id
    });

    return NextResponse.json({ 
      clientSecret: setupIntent.client_secret,
      customerId 
    });
  } catch (error) {
    logger.error('api', 'Payment method collection error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}