import { prisma } from '@/lib/db';
import { PRICING_PLANS } from '@/lib/stripe';

export interface CADUsageStats {
  used: number;
  limit: number;
  remaining: number;
  resetDate: Date;
  formats: string[];
}

export class CADUsageTracker {
  /**
   * Get CAD import usage for a user
   */
  static async getUsage(userId: string, subscriptionTier: string): Promise<CADUsageStats> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Count CAD imports this month
    const imports = await prisma.cadImport.count({
      where: {
        userId,
        createdAt: {
          gte: currentMonth,
          lt: nextMonth
        }
      }
    });

    // Get tier limits
    const plan = PRICING_PLANS[subscriptionTier.toLowerCase() as keyof typeof PRICING_PLANS];
    const limit = plan?.limitations?.cadImports || 0;
    const formats = plan?.limitations?.cadFormats || [];

    return {
      used: imports,
      limit: limit === -1 ? Infinity : limit,
      remaining: limit === -1 ? Infinity : Math.max(0, limit - imports),
      resetDate: nextMonth,
      formats: Array.isArray(formats) ? formats : formats === 'all' ? ['all'] : []
    };
  }

  /**
   * Check if user can import a CAD file
   */
  static async canImport(
    userId: string, 
    subscriptionTier: string, 
    fileExtension: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const usage = await this.getUsage(userId, subscriptionTier);

    // Check if user has imports remaining
    if (usage.remaining <= 0) {
      return {
        allowed: false,
        reason: `Monthly CAD import limit reached (${usage.limit} imports). Resets on ${usage.resetDate.toLocaleDateString()}.`
      };
    }

    // Check if format is supported for their tier
    const plan = PRICING_PLANS[subscriptionTier.toLowerCase() as keyof typeof PRICING_PLANS];
    const allowedFormats = plan?.limitations?.cadFormats;

    if (allowedFormats === 'all' || allowedFormats === undefined) {
      return { allowed: true };
    }

    if (Array.isArray(allowedFormats)) {
      const isFormatAllowed = allowedFormats.includes(fileExtension.toLowerCase());
      if (!isFormatAllowed) {
        return {
          allowed: false,
          reason: `File format .${fileExtension} not supported in ${plan.name} tier. Supported formats: ${allowedFormats.join(', ')}`
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Track a CAD import
   */
  static async trackImport(
    userId: string,
    fileName: string,
    fileSize: number,
    format: string,
    autodesk: {
      urn?: string;
      jobId?: string;
      status: string;
      complexity: 'simple' | 'complex';
      tokensUsed: number;
    }
  ): Promise<void> {
    await prisma.cadImport.create({
      data: {
        userId,
        fileName,
        fileSize,
        format: format.toLowerCase(),
        autodeskUrn: autodesk.urn,
        autodeskJobId: autodesk.jobId,
        status: autodesk.status,
        complexity: autodesk.complexity,
        tokensUsed: autodesk.tokensUsed,
        createdAt: new Date()
      }
    });
  }

  /**
   * Get usage statistics for admin dashboard
   */
  static async getUsageStats(startDate?: Date, endDate?: Date) {
    const where = {
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      })
    };

    const [totalImports, tokensUsed, userStats] = await Promise.all([
      prisma.cadImport.count({ where }),
      prisma.cadImport.aggregate({
        where,
        _sum: { tokensUsed: true }
      }),
      prisma.cadImport.groupBy({
        by: ['userId'],
        where,
        _count: true,
        _sum: { tokensUsed: true }
      })
    ]);

    return {
      totalImports,
      totalTokensUsed: tokensUsed._sum.tokensUsed || 0,
      estimatedCost: (tokensUsed._sum.tokensUsed || 0) * 3, // $3 per token estimate
      userStats: userStats.map(stat => ({
        userId: stat.userId,
        imports: stat._count,
        tokensUsed: stat._sum.tokensUsed || 0
      }))
    };
  }

  /**
   * Get formats by complexity for cost estimation
   */
  static getFormatComplexity(format: string): 'simple' | 'complex' {
    const complexFormats = ['rvt', 'rfa', 'rte', 'ifc', 'nwd', 'nwc'];
    return complexFormats.includes(format.toLowerCase()) ? 'complex' : 'simple';
  }

  /**
   * Calculate token cost for a format
   */
  static getTokenCost(format: string): number {
    return this.getFormatComplexity(format) === 'complex' ? 0.5 : 0.1;
  }
}