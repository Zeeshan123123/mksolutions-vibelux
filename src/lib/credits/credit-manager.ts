import { prisma } from '@/lib/prisma';
import { CREDIT_COSTS, SUBSCRIPTION_TIERS } from '@/lib/pricing/unified-pricing';

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'monthly_reset';
  amount: number;
  balance: number;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CreditBalance {
  userId: string;
  available: number;
  used: number;
  purchased: number;
  bonus: number;
  monthlyAllocation: number;
  expiresAt?: Date;
}

export class CreditManager {
  /**
   * Get user's current credit balance
   */
  static async getBalance(userId: string): Promise<CreditBalance> {
    // Validate userId
    if (!userId) {
      // Return default balance for unauthenticated users
      return {
        userId: 'anonymous',
        available: 5,
        used: 0,
        purchased: 0,
        bonus: 0,
        monthlyAllocation: 5,
      };
    }
    
    try {
      // Get user's subscription
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { 
          creditBalance: true,
          subscription: true,
        },
      });

      if (!user) {
        // User doesn't exist, initialize with default free tier
        return await this.initializeBalance(userId);
      }

      if (!user.creditBalance) {
        // Initialize credit balance if doesn't exist
        return await this.initializeBalance(userId);
      }

      // Check if monthly credits need to be refreshed
      const now = new Date();
      const lastReset = user.creditBalance.lastMonthlyReset || user.creditBalance.createdAt;
      const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceReset >= 30) {
        await this.refreshMonthlyCredits(userId);
        return await this.getBalance(userId); // Recursive call to get updated balance
      }

      return {
        userId,
        available: user.creditBalance.available,
        used: user.creditBalance.used,
        purchased: user.creditBalance.purchased,
        bonus: user.creditBalance.bonus,
        monthlyAllocation: user.creditBalance.monthlyAllocation,
        expiresAt: user.creditBalance.expiresAt,
      };
    } catch (error) {
      logger.error('api', 'Error getting credit balance:', error );
      // Return default balance on error
      return {
        userId,
        available: 5,
        used: 0,
        purchased: 0,
        bonus: 0,
        monthlyAllocation: 5,
      };
    }
  }

  /**
   * Add credits to user's account
   */
  static async addCredits(
    userId: string, 
    amount: number, 
    options: {
      type: 'bonus' | 'purchase' | 'refund';
      reason: string;
      adminId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<CreditTransaction> {
    try {
      const balance = await this.getBalance(userId);
      const newBalance = balance.available + amount;

      // Update user's credit balance
      await prisma.creditBalance.upsert({
        where: { userId },
        update: {
          available: newBalance,
          bonus: options.type === 'bonus' ? balance.bonus + amount : balance.bonus,
          purchased: options.type === 'purchase' ? balance.purchased + amount : balance.purchased,
        },
        create: {
          userId,
          available: amount,
          used: 0,
          purchased: options.type === 'purchase' ? amount : 0,
          bonus: options.type === 'bonus' ? amount : 0,
          monthlyAllocation: SUBSCRIPTION_TIERS.find(t => t.id === 'starter')?.credits.aiQueries || 100,
        }
      });

      // Create transaction record
      const transaction = await prisma.creditTransaction.create({
        data: {
          userId,
          type: options.type,
          amount,
          description: options.reason,
          metadata: options.metadata || {}
        }
      });

      return {
        id: transaction.id,
        userId,
        type: options.type,
        amount,
        balance: newBalance,
        description: options.reason,
        metadata: options.metadata,
        createdAt: transaction.createdAt
      };
    } catch (error) {
      logger.error('api', 'Error adding credits:', error );
      throw new Error('Failed to add credits');
    }
  }

  /**
   * Initialize credit balance for new user
   */
  static async initializeBalance(userId: string): Promise<CreditBalance> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      const tier = user?.subscriptionTier || 'free';
      const tierConfig = SUBSCRIPTION_TIERS[tier];
      
      // Ensure credits structure exists
      if (!tierConfig || !tierConfig.credits) {
        logger.error('api', 'Invalid tier configuration:', { tier, tierConfig });
        // Fallback to default values
        const monthlyCredits = 5;
        return await this.createCreditBalance(userId, monthlyCredits, tier);
      }
      
      const monthlyCredits = tierConfig.credits.aiDesigner || 5;
      
      return await this.createCreditBalance(userId, monthlyCredits, tier);
    } catch (error) {
      logger.error('api', 'Error initializing credit balance:', error );
      // Return default balance if database operations fail
      return {
        userId,
        available: 5,
        used: 0,
        purchased: 0,
        bonus: 0,
        monthlyAllocation: 5,
      };
    }
  }

  /**
   * Helper method to create credit balance
   */
  private static async createCreditBalance(userId: string, monthlyCredits: number, tier: string): Promise<CreditBalance> {
    try {
      const creditBalance = await prisma.creditBalance.create({
        data: {
          userId,
          available: monthlyCredits,
          monthlyAllocation: monthlyCredits,
          used: 0,
          purchased: 0,
          bonus: 0,
          lastMonthlyReset: new Date(),
        },
      });

      // Log the initialization (don't fail if logging fails)
      try {
        await this.logTransaction({
          userId,
          type: 'monthly_reset',
          amount: monthlyCredits,
          description: `Monthly credit allocation for ${tier} tier`,
        });
      } catch (logError) {
        logger.warn('api', 'Failed to log credit transaction:', { data: logError });
      }

      return {
        userId,
        available: creditBalance.available,
        used: creditBalance.used,
        purchased: creditBalance.purchased,
        bonus: creditBalance.bonus,
        monthlyAllocation: creditBalance.monthlyAllocation,
      };
    } catch (error) {
      logger.error('api', 'Error creating credit balance:', error );
      // Return default balance if database creation fails
      return {
        userId,
        available: monthlyCredits,
        used: 0,
        purchased: 0,
        bonus: 0,
        monthlyAllocation: monthlyCredits,
      };
    }
  }

  /**
   * Refresh monthly credits based on subscription
   */
  static async refreshMonthlyCredits(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    const tier = user?.subscriptionTier || 'free';
    const tierConfig = SUBSCRIPTION_TIERS[tier];
    const monthlyCredits = tierConfig?.credits.aiDesigner || 5;

    await prisma.creditBalance.update({
      where: { userId },
      data: {
        available: monthlyCredits,
        monthlyAllocation: monthlyCredits,
        used: 0,
        lastMonthlyReset: new Date(),
      },
    });

    await this.logTransaction({
      userId,
      type: 'monthly_reset',
      amount: monthlyCredits,
      description: `Monthly credit reset for ${tier} tier`,
    });
  }

  /**
   * Check if user has enough credits for an action
   */
  static async hasCredits(
    userId: string, 
    action: keyof typeof CREDIT_COSTS,
    subAction: string
  ): Promise<boolean> {
    const balance = await this.getBalance(userId);
    const cost = CREDIT_COSTS[action]?.[subAction] || 0;
    return balance.available >= cost;
  }

  /**
   * Use credits for an action
   */
  static async useCredits(
    userId: string,
    action: keyof typeof CREDIT_COSTS,
    subAction: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; balance: CreditBalance; error?: string }> {
    const balance = await this.getBalance(userId);
    const cost = CREDIT_COSTS[action]?.[subAction] || 0;

    if (balance.available < cost) {
      return {
        success: false,
        balance,
        error: `Insufficient credits. Need ${cost}, have ${balance.available}`,
      };
    }

    // Update balance
    const updatedBalance = await prisma.creditBalance.update({
      where: { userId },
      data: {
        available: { decrement: cost },
        used: { increment: cost },
      },
    });

    // Log transaction
    await this.logTransaction({
      userId,
      type: 'usage',
      amount: -cost,
      description: `Used for ${action} - ${subAction}`,
      metadata,
    });

    return {
      success: true,
      balance: {
        userId,
        available: updatedBalance.available,
        used: updatedBalance.used,
        purchased: updatedBalance.purchased,
        bonus: updatedBalance.bonus,
        monthlyAllocation: updatedBalance.monthlyAllocation,
      },
    };
  }

  /**
   * Add credits from purchase
   */
  static async addCredits(
    userId: string,
    amount: number,
    bonus: number = 0,
    description: string
  ): Promise<CreditBalance> {
    const totalCredits = amount + bonus;

    const updatedBalance = await prisma.creditBalance.update({
      where: { userId },
      data: {
        available: { increment: totalCredits },
        purchased: { increment: amount },
        bonus: { increment: bonus },
      },
    });

    // Log main transaction
    await this.logTransaction({
      userId,
      type: 'purchase',
      amount,
      description,
    });

    // Log bonus if applicable
    if (bonus > 0) {
      await this.logTransaction({
        userId,
        type: 'bonus',
        amount: bonus,
        description: `Bonus credits (${Math.round((bonus / amount) * 100)}%)`,
      });
    }

    return {
      userId,
      available: updatedBalance.available,
      used: updatedBalance.used,
      purchased: updatedBalance.purchased,
      bonus: updatedBalance.bonus,
      monthlyAllocation: updatedBalance.monthlyAllocation,
    };
  }

  /**
   * Get credit usage history
   */
  static async getHistory(
    userId: string,
    limit: number = 50
  ): Promise<CreditTransaction[]> {
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions;
  }

  /**
   * Get usage statistics
   */
  static async getUsageStats(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await prisma.creditTransaction.findMany({
      where: {
        userId,
        type: 'usage',
        createdAt: { gte: startDate },
      },
    });

    // Group by action type
    const usageByType: Record<string, number> = {};
    transactions.forEach(tx => {
      const action = tx.metadata?.action || 'unknown';
      usageByType[action] = (usageByType[action] || 0) + Math.abs(tx.amount);
    });

    return {
      totalUsed: transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
      usageByType,
      dailyAverage: Math.round(transactions.length / days),
      peakUsageDay: this.findPeakUsageDay(transactions),
    };
  }

  /**
   * Check for potential abuse patterns
   */
  static async checkForAbuse(userId: string): Promise<{
    isAbusive: boolean;
    reasons: string[];
  }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Check recent usage
    const recentTransactions = await prisma.creditTransaction.findMany({
      where: {
        userId,
        type: 'usage',
        createdAt: { gte: oneHourAgo },
      },
    });

    const dailyTransactions = await prisma.creditTransaction.findMany({
      where: {
        userId,
        type: 'usage',
        createdAt: { gte: oneDayAgo },
      },
    });

    const reasons: string[] = [];

    // Check for rapid usage
    if (recentTransactions.length > 20) {
      reasons.push('Excessive usage in the last hour');
    }

    // Check for unusual patterns
    const totalHourlyCredits = recentTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    if (totalHourlyCredits > 200) {
      reasons.push('Unusually high credit consumption rate');
    }

    // Check for repeated identical requests
    const duplicates = this.findDuplicateRequests(recentTransactions);
    if (duplicates > 5) {
      reasons.push('Multiple identical requests detected');
    }

    return {
      isAbusive: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Private helper methods
   */
  private static async logTransaction(data: {
    userId: string;
    type: CreditTransaction['type'];
    amount: number;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const balance = await prisma.creditBalance.findUnique({
      where: { userId: data.userId },
    });

    await prisma.creditTransaction.create({
      data: {
        ...data,
        balance: balance?.available || 0,
      },
    });
  }

  private static findPeakUsageDay(transactions: any[]): string {
    const usageByDay: Record<string, number> = {};
    
    transactions.forEach(tx => {
      const day = tx.createdAt.toISOString().split('T')[0];
      usageByDay[day] = (usageByDay[day] || 0) + Math.abs(tx.amount);
    });

    let peakDay = '';
    let peakUsage = 0;
    
    Object.entries(usageByDay).forEach(([day, usage]) => {
      if (usage > peakUsage) {
        peakDay = day;
        peakUsage = usage;
      }
    });

    return peakDay;
  }

  private static findDuplicateRequests(transactions: any[]): number {
    const requestMap: Record<string, number> = {};
    
    transactions.forEach(tx => {
      const key = JSON.stringify(tx.metadata || {});
      requestMap[key] = (requestMap[key] || 0) + 1;
    });

    return Object.values(requestMap).filter(count => count > 1).length;
  }
}

// Export credit check middleware
export async function requireCredits(
  action: keyof typeof CREDIT_COSTS,
  subAction: string
) {
  return async (userId: string) => {
    const hasCredits = await CreditManager.hasCredits(userId, action, subAction);
    if (!hasCredits) {
      const balance = await CreditManager.getBalance(userId);
      const cost = CREDIT_COSTS[action]?.[subAction] || 0;
      throw new Error(
        `Insufficient credits. Need ${cost} credits but only have ${balance.available}. ` +
        `Purchase more credits or upgrade your plan.`
      );
    }
    return true;
  };
}