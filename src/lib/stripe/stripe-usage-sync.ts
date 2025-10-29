import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any,
  typescript: true,
});

// Types for our usage data
export interface UsageData {
  userId: string;
  aiCreditsUsed: number;
  apiCallsUsed?: number;
  renderHoursUsed?: number;
  exportsUsed?: number;
  timestamp: Date;
}

export interface UsageReportResult {
  success: boolean;
  reportedItems: string[];
  failedItems: string[];
  errors: Error[];
}

// Helper: Retry logic for API calls
export async function retryStripeCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt}/${maxRetries} failed:`, error);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}

// Get unreported usage from database
export async function getUnreportedUsage(userId: string): Promise<UsageData[]> {
  try {
    const usage = await prisma.usageLog.findMany({
      where: {
        userId: userId,
        reported: false,
        reportedToStripe: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const aggregated: UsageData = {
      userId,
      aiCreditsUsed: 0,
      apiCallsUsed: 0,
      renderHoursUsed: 0,
      exportsUsed: 0,
      timestamp: new Date(),
    };

    usage.forEach(log => {
      if (log.type === 'ai_credit') aggregated.aiCreditsUsed += log.quantity;
      if (log.type === 'api_call') aggregated.apiCallsUsed! += log.quantity;
      if (log.type === 'render_hour') aggregated.renderHoursUsed! += log.quantity;
      if (log.type === 'export') aggregated.exportsUsed! += log.quantity;
    });

    return [aggregated];
  } catch (error) {
    console.error('Error fetching unreported usage:', error);
    throw error;
  }
}

// Mark usage as reported in database
export async function markUsageAsReported(
  userId: string,
  usageType: string,
  reportedAt: Date
): Promise<void> {
  try {
    await prisma.usageLog.updateMany({
      where: {
        userId: userId,
        type: usageType,
        reported: false,
      },
      data: {
        reported: true,
        reportedToStripe: true,
        reportedAt: reportedAt,
      },
    });
  } catch (error) {
    console.error('Error marking usage as reported:', error);
    throw error;
  }
}

/**
 * Reports usage to Stripe using the new Meters API
 * @param userId - The user's ID
 * @param usageData - Usage data to report
 * @returns Result indicating success/failure
 */
export async function reportUsageToStripe(
  userId: string,
  usageData: UsageData
): Promise<UsageReportResult> {
  const result: UsageReportResult = {
    success: false,
    reportedItems: [],
    failedItems: [],
    errors: [],
  };

  try {
    // STEP 1: Get user's Stripe subscription from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeSubscriptionItemAI: true,
      },
    });

    if (!user?.stripeSubscriptionId) {
      throw new Error(`No Stripe subscription found for user ${userId}`);
    }

    if (!user.stripeCustomerId) {
      throw new Error(`No Stripe customer ID found for user ${userId}`);
    }

    // STEP 2: Verify subscription is active in Stripe
    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      throw new Error(
        `Subscription ${subscription.id} is not active (status: ${subscription.status})`
      );
    }

    // STEP 3: Report AI Credits usage using Meters API
    if (usageData.aiCreditsUsed > 0) {
      try {
        const meterId = process.env.STRIPE_METER_ID;
        
        if (!meterId) {
          throw new Error('STRIPE_METER_ID not configured in environment variables');
        }

        await retryStripeCall(async () => {
          // Report usage to meter using raw fetch (TypeScript types not updated yet)
          const timestamp = Math.floor(usageData.timestamp.getTime() / 1000);
          
          const meterEventResponse = await fetch('https://api.stripe.com/v1/billing/meter_events', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              'event_name': 'ai_credit_used',
              'payload[stripe_customer_id]': user.stripeCustomerId!,
              'payload[value]': usageData.aiCreditsUsed.toString(),
              'timestamp': timestamp.toString(),
            }),
          });

          const meterEvent = await meterEventResponse.json();
          
          if (!meterEventResponse.ok) {
            throw new Error(`Failed to report meter event: ${JSON.stringify(meterEvent)}`);
          }
          
          return meterEvent;
        });

        result.reportedItems.push('ai_credits');
        await markUsageAsReported(userId, 'ai_credit', new Date());
        
        console.log(
          `✅ Reported ${usageData.aiCreditsUsed} AI credits for user ${userId}`
        );
      } catch (error) {
        result.failedItems.push('ai_credits');
        result.errors.push(error as Error);
        console.error('❌ Failed to report AI credits:', error);
      }
    }

    // STEP 4: Store usage in database for tracking
    try {
     await prisma.usageRecord.create({
  data: {
    userId: userId,
    eventType: 'ai_credit_used',
    billingMonth: `${usageData.timestamp.getFullYear()}-${String(usageData.timestamp.getMonth() + 1).padStart(2, '0')}`,
    timestamp: usageData.timestamp,
    eventData: {
      aiCreditsUsed: usageData.aiCreditsUsed,
      apiCallsUsed: usageData.apiCallsUsed || 0,
      renderHoursUsed: usageData.renderHoursUsed || 0,
      exportsUsed: usageData.exportsUsed || 0,
    },
  },
});
    } catch (dbError) {
      console.error('Error storing usage in database:', dbError);
      // Don't fail the whole operation if DB write fails
    }

    // STEP 5: Determine overall success
    result.success = result.failedItems.length === 0;

    return result;
  } catch (error) {
    console.error('Error in reportUsageToStripe:', error);
    result.errors.push(error as Error);
    return result;
  }
}

/**
 * Gets current usage for a user from database
 */
export async function getCurrentUsage(userId: string): Promise<number> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user?.stripeSubscriptionId) {
      return 0;
    }

    // Get usage from database records
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(1); // First day of current month
    
    const records = await prisma.usageRecord.findMany({
      where: {
        userId: userId,
        recordedAt: {
          gte: currentPeriodStart,
        },
      },
    });

    return records.reduce((sum, record) => sum + record.aiCreditsUsed, 0);
  } catch (error) {
    console.error('Error getting current usage:', error);
    return 0;
  }
}

// Batch report for all users (used by cron jobs)
export async function batchReportAllUsers(): Promise<{
  successCount: number;
  failCount: number;
  errors: Array<{ userId: string; error: string }>;
}> {
  const results = {
    successCount: 0,
    failCount: 0,
    errors: [] as Array<{ userId: string; error: string }>,
  };

  try {
    const usersWithUsage = await prisma.usageLog.findMany({
      where: {
        reported: false,
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    console.log(`Found ${usersWithUsage.length} users with unreported usage`);

    for (const { userId } of usersWithUsage) {
      try {
        const usageData = await getUnreportedUsage(userId);
        
        if (usageData.length > 0) {
          const result = await reportUsageToStripe(userId, usageData[0]);
          
          if (result.success) {
            results.successCount++;
          } else {
            results.failCount++;
            results.errors.push({
              userId,
              error: result.errors.map(e => e.message).join(', '),
            });
          }
        }
      } catch (error) {
        results.failCount++;
        results.errors.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`Batch sync complete: ${results.successCount} success, ${results.failCount} failed`);
    return results;
  } catch (error) {
    console.error('Error in batch report:', error);
    throw error;
  }
}