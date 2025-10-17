// invoice-generation service

import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { logger } from '@/lib/logging/production-logger';
import { sendEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
});

export class InvoiceGenerationService {
  private static instance: InvoiceGenerationService;

  private constructor() {}

  static getInstance(): InvoiceGenerationService {
    if (!InvoiceGenerationService.instance) {
      InvoiceGenerationService.instance = new InvoiceGenerationService();
    }
    return InvoiceGenerationService.instance;
  }

  async initialize(): Promise<void> {
    // Initialize service
  }

  async generateInvoice(subscriptionId: string): Promise<Stripe.Invoice> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Create invoice for the subscription
    const invoice = await stripe.invoices.create({
      customer: subscription.customer as string,
      subscription: subscriptionId,
      auto_advance: true, // Automatically finalize
    });
    
    return invoice;
  }

  async execute(params: any): Promise<any> {
    // Execute service logic
    return { success: true, data: params };
  }
}

// Export singleton instance
export const invoiceGeneration = InvoiceGenerationService.getInstance();
export default invoiceGeneration;

// Export processAutomatedBilling function for cron job
export async function processAutomatedBilling(): Promise<{
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}> {
  let processed = 0;
  let failed = 0;
  const errors: string[] = [];
  
  try {
    // 1. Get all active subscriptions from database
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: {
          lte: new Date() // Due for billing
        }
      },
      include: {
        user: true
      }
    });
    
    // 2. Process each subscription
    for (const subscription of activeSubscriptions) {
      try {
        // Skip if no Stripe subscription ID
        if (!subscription.stripeSubscriptionId) {
          errors.push(`No Stripe ID for subscription ${subscription.id}`);
          failed++;
          continue;
        }
        
        // 3. Create invoice in Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId
        );
        
        // Stripe automatically creates invoices for subscriptions
        // We just need to ensure it's paid
        const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          subscription: subscription.stripeSubscriptionId
        });
        
        // 4. Finalize and pay the invoice
        if (upcomingInvoice && upcomingInvoice.status === 'draft') {
          await stripe.invoices.finalizeInvoice(upcomingInvoice.id);
          await stripe.invoices.pay(upcomingInvoice.id);
        }
        
        // 5. Update billing record in database
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            lastBillingDate: new Date(),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            updatedAt: new Date()
          }
        });
        
        // 6. Create billing history record
        await prisma.billingHistory.create({
          data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            amount: upcomingInvoice.amount_due / 100, // Convert from cents
            currency: upcomingInvoice.currency,
            stripeInvoiceId: upcomingInvoice.id,
            status: 'PAID',
            billedAt: new Date()
          }
        });
        
        // 7. Send invoice email (if email service is configured)
        if (subscription.user.email && process.env.SENDGRID_API_KEY) {
          await sendEmail({
            to: subscription.user.email,
            subject: 'Your VibeLux Invoice',
            html: `
              <h1>Invoice Paid</h1>
              <p>Thank you for your continued subscription to VibeLux.</p>
              <p>Amount: $${(upcomingInvoice.amount_due / 100).toFixed(2)}</p>
              <p>Invoice ID: ${upcomingInvoice.id}</p>
            `
          }).catch((emailError) => {
            logger.error('api', 'Failed to send invoice email:', emailError);
            // Don't fail the billing process for email errors
          });
        }
        
        processed++;
      } catch (subscriptionError) {
        failed++;
        errors.push(
          `Failed to process subscription ${subscription.id}: ${
            subscriptionError instanceof Error ? subscriptionError.message : 'Unknown error'
          }`
        );
        logger.error('api', 'Subscription billing error:', subscriptionError);
      }
    }
    
    return {
      success: true,
      processed,
      failed,
      errors
    };
  } catch (error) {
    return {
      success: false,
      processed,
      failed: failed + 1,
      errors: [...errors, error instanceof Error ? error.message : 'Unknown error']
    };
  }
}
