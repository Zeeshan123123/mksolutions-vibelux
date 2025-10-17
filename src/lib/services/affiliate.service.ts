/**
 * Comprehensive Affiliate/Referral Program Service
 * Handles all affiliate operations including tracking, commissions, and payouts
 */

import { prisma } from '@/lib/prisma';
import { 
  AffiliateStatus, 
  AffiliateTier, 
  ReferralStatus, 
  CommissionStatus,
  PayoutStatus,
  ConversionType
} from '@prisma/client';
import { generateId } from '@/lib/utils';
import { stripe } from '@/lib/stripe';

interface CreateAffiliateParams {
  userId: string;
  code?: string;
  tier?: AffiliateTier;
  baseCommission?: number;
  lifetimeCommission?: boolean;
}

interface TrackClickParams {
  affiliateCode: string;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  landingPage?: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
}

interface CreateReferralParams {
  affiliateId: string;
  referredEmail: string;
  clickId?: string;
  metadata?: any;
}

interface ProcessConversionParams {
  referredEmail: string;
  userId: string;
  conversionType: ConversionType;
  amount: number;
  subscriptionTier?: string;
}

interface CalculateCommissionParams {
  affiliateId: string;
  referralId: string;
  amount: number;
  type: 'initial' | 'recurring' | 'upgrade' | 'addon';
  description?: string;
}

export class AffiliateService {
  private static instance: AffiliateService;

  private constructor() {}

  static getInstance(): AffiliateService {
    if (!AffiliateService.instance) {
      AffiliateService.instance = new AffiliateService();
    }
    return AffiliateService.instance;
  }

  /**
   * Create a new affiliate account
   */
  async createAffiliate(params: CreateAffiliateParams) {
    const { userId, code, tier = 'BRONZE', baseCommission = 25, lifetimeCommission = true } = params;

    // Check if user already has an affiliate account
    const existing = await prisma.affiliate.findUnique({
      where: { userId }
    });

    if (existing) {
      throw new Error('User already has an affiliate account');
    }

    // Generate unique affiliate code if not provided
    const affiliateCode = code || await this.generateUniqueCode(userId);

    const affiliate = await prisma.affiliate.create({
      data: {
        userId,
        code: affiliateCode,
        tier,
        status: 'PENDING', // Requires admin approval
        baseCommission,
        bonusCommission: 0,
        lifetimeCommission,
        customRates: this.getDefaultCommissionSchedule(tier)
      },
      include: {
        user: true
      }
    });

    // Send notification to admin for approval
    await this.notifyAdminNewAffiliate(affiliate);

    // Process signup bonus after approval (in production, trigger this when admin approves)
    if (affiliate.status === 'ACTIVE') {
      await this.processSignupBonus(affiliate.id);
    }

    return affiliate;
  }

  /**
   * Track affiliate link clicks
   */
  async trackClick(params: TrackClickParams) {
    const { affiliateCode, ipAddress, userAgent, referrer, landingPage, utmParams } = params;

    // Find affiliate by code
    const affiliate = await prisma.affiliate.findUnique({
      where: { code: affiliateCode }
    });

    if (!affiliate || affiliate.status !== 'ACTIVE') {
      return null; // Don't track inactive affiliates
    }

    // Parse user agent for device info
    const deviceInfo = this.parseUserAgent(userAgent);

    // Get geolocation from IP
    const geoInfo = await this.getGeolocation(ipAddress);

    // Create click record
    const click = await prisma.affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        clickId: generateId(),
        ipAddress,
        userAgent,
        deviceType: deviceInfo.deviceType,
        country: geoInfo?.country,
        city: geoInfo?.city,
        referrer,
        landingPage,
        utmSource: utmParams?.source,
        utmMedium: utmParams?.medium,
        utmCampaign: utmParams?.campaign,
        utmContent: utmParams?.content,
        utmTerm: utmParams?.term
      }
    });

    // Update affiliate stats
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalClicks: { increment: 1 },
        lastClickAt: new Date()
      }
    });

    // Set tracking cookie
    return {
      clickId: click.clickId,
      affiliateCode,
      cookieData: {
        aff: affiliateCode,
        cid: click.clickId,
        exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
      }
    };
  }

  /**
   * Create a referral when user signs up
   */
  async createReferral(params: CreateReferralParams) {
    const { affiliateId, referredEmail, clickId, metadata } = params;

    // Check if referral already exists
    const existing = await prisma.affiliateReferral.findFirst({
      where: {
        affiliateId,
        referredEmail
      }
    });

    if (existing) {
      return existing;
    }

    const referral = await prisma.affiliateReferral.create({
      data: {
        affiliateId,
        referredEmail,
        status: 'PENDING',
        signedUpAt: new Date()
      }
    });

    // Update affiliate stats
    await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        totalReferrals: { increment: 1 }
      }
    });

    return referral;
  }

  /**
   * Process conversion when referred user makes a purchase
   */
  async processConversion(params: ProcessConversionParams) {
    const { referredEmail, userId, conversionType, amount, subscriptionTier } = params;

    // Find the referral
    const referral = await prisma.affiliateReferral.findFirst({
      where: {
        referredEmail,
        status: { in: ['PENDING', 'SIGNED_UP'] }
      },
      include: {
        affiliate: true
      }
    });

    if (!referral) {
      return null; // No referral found
    }

    // Update referral status
    const updatedReferral = await prisma.affiliateReferral.update({
      where: { id: referral.id },
      data: {
        status: 'CONVERTED',
        firstPurchaseAt: referral.firstPurchaseAt || new Date(),
        totalPurchases: { increment: amount }
      }
    });

    // Create conversion record
    const conversion = await prisma.affiliateConversion.create({
      data: {
        affiliateId: referral.affiliateId,
        userId,
        referralCode: referral.affiliate.code,
        conversionType,
        conversionValue: amount,
        subscriptionTier,
        timeToConvert: referral.signedUpAt 
          ? Math.floor((Date.now() - referral.signedUpAt.getTime()) / 60000) // minutes
          : null,
        firstMonthValue: amount,
        predictedLTV: this.calculatePredictedLTV(amount, subscriptionTier)
      }
    });

    // Calculate and create commission
    const commission = await this.calculateCommission({
      affiliateId: referral.affiliateId,
      referralId: referral.id,
      amount,
      type: 'initial',
      description: `Initial conversion - ${subscriptionTier || 'One-time'}`
    });

    // Update affiliate stats
    await prisma.affiliate.update({
      where: { id: referral.affiliateId },
      data: {
        activeReferrals: { increment: 1 },
        totalRevenue: { increment: amount },
        totalCommission: { increment: commission.amount }
      }
    });

    return {
      referral: updatedReferral,
      conversion,
      commission
    };
  }

  /**
   * Calculate commission for a transaction
   */
  async calculateCommission(params: CalculateCommissionParams) {
    const { affiliateId, referralId, amount, type, description } = params;

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId }
    });

    if (!affiliate || affiliate.status !== 'ACTIVE') {
      throw new Error('Invalid or inactive affiliate');
    }

    let commissionRate: number;

    // Use lifetime commission schedule if enabled
    if (affiliate.lifetimeCommission && type === 'recurring') {
      commissionRate = await this.getLifetimeCommissionRate(affiliateId, referralId);
    } else {
      // Use standard tier-based commission
      commissionRate = affiliate.baseCommission + affiliate.bonusCommission;
      
      // Apply tier bonuses for initial commissions
      if (affiliate.tier === 'SILVER') {
        commissionRate += 5; // +5% for silver
      } else if (affiliate.tier === 'GOLD') {
        commissionRate += 10; // +10% for gold
      } else if (affiliate.tier === 'PLATINUM') {
        commissionRate += 15; // +15% for platinum
      } else if (affiliate.tier === 'VIP') {
        commissionRate += 20; // +20% for VIP
      }

      // Apply type multipliers for non-lifetime commissions
      if (type === 'recurring' && !affiliate.lifetimeCommission) {
        commissionRate *= 0.5; // 50% for standard recurring
      } else if (type === 'upgrade') {
        commissionRate *= 0.75; // 75% for upgrades
      }
    }

    const commissionAmount = (amount * commissionRate) / 100;

    const commission = await prisma.affiliateCommission.create({
      data: {
        affiliateId,
        referralId,
        amount: commissionAmount,
        baseAmount: amount,
        commissionRate,
        type: type.toUpperCase() as any,
        status: 'PENDING',
        tier: affiliate.tier,
        description
      }
    });

    // Update referral commission total
    await prisma.affiliateReferral.update({
      where: { id: referralId },
      data: {
        totalCommission: { increment: commissionAmount }
      }
    });

    return commission;
  }

  /**
   * Get lifetime commission rate based on the month since first conversion
   */
  private async getLifetimeCommissionRate(affiliateId: string, referralId: string): Promise<number> {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId }
    });

    const referral = await prisma.affiliateReferral.findUnique({
      where: { id: referralId }
    });

    if (!affiliate || !referral || !referral.firstPurchaseAt) {
      return affiliate?.baseCommission || 20; // Fallback to base rate
    }

    // Calculate months since first purchase
    const monthsSinceConversion = Math.floor(
      (Date.now() - referral.firstPurchaseAt.getTime()) / (30 * 24 * 60 * 60 * 1000)
    ) + 1; // +1 because month 1 starts immediately

    // Get custom rates or default schedule
    const schedule = affiliate.customRates || this.getDefaultCommissionSchedule(affiliate.tier);
    
    // Find the rate for the current month
    const monthRate = schedule.months?.find((m: any) => m.month === monthsSinceConversion);
    
    if (monthRate) {
      return monthRate.rate;
    }

    // If beyond the schedule, use the last rate (typically minimal)
    const lastRate = schedule.months?.[schedule.months.length - 1];
    return lastRate?.rate || 1; // 1% minimum for lifetime
  }

  /**
   * Process recurring commissions
   */
  async processRecurringCommissions() {
    // Find all active referrals with recurring subscriptions
    const activeReferrals = await prisma.affiliateReferral.findMany({
      where: {
        status: 'CONVERTED',
        totalPurchases: { gt: 0 }
      },
      include: {
        affiliate: true
      }
    });

    const commissions = [];

    for (const referral of activeReferrals) {
      // Check if eligible for recurring commission
      const monthsSinceConversion = referral.firstPurchaseAt
        ? Math.floor((Date.now() - referral.firstPurchaseAt.getTime()) / (30 * 24 * 60 * 60 * 1000))
        : 0;

      if (monthsSinceConversion > 0 && monthsSinceConversion <= 12) {
        // Process recurring commission
        const commission = await this.calculateCommission({
          affiliateId: referral.affiliateId,
          referralId: referral.id,
          amount: 50, // Example monthly amount
          type: 'recurring',
          description: `Recurring commission - Month ${monthsSinceConversion}`
        });

        commissions.push(commission);
      }
    }

    return commissions;
  }

  /**
   * Request payout for an affiliate
   */
  async requestPayout(affiliateId: string) {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: {
        commissions: {
          where: {
            status: 'APPROVED',
            paidAt: null
          }
        }
      }
    });

    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    const totalPending = affiliate.commissions.reduce((sum, c) => sum + c.amount, 0);

    if (totalPending < 50) {
      throw new Error('Minimum payout amount is $50');
    }

    // Create payout record
    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateId,
        amount: totalPending,
        status: 'PENDING',
        period: new Date().toISOString().slice(0, 7) // YYYY-MM
      }
    });

    // Mark commissions as paid
    await prisma.affiliateCommission.updateMany({
      where: {
        affiliateId,
        status: 'APPROVED',
        paidAt: null
      },
      data: {
        payoutId: payout.id,
        status: 'PAID',
        paidAt: new Date()
      }
    });

    // Process payout via Stripe
    if (affiliate.paymentMethod === 'stripe' && affiliate.paymentDetails) {
      await this.processStripePayout(affiliate, payout);
    }

    return payout;
  }

  /**
   * Process payout via Stripe
   */
  private async processStripePayout(affiliate: any, payout: any) {
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(payout.amount * 100), // Convert to cents
        currency: 'usd',
        destination: affiliate.paymentDetails.stripeAccountId,
        description: `Affiliate payout for ${payout.period}`,
        metadata: {
          affiliateId: affiliate.id,
          payoutId: payout.id
        }
      });

      await prisma.affiliatePayout.update({
        where: { id: payout.id },
        data: {
          status: 'COMPLETED',
          transactionId: transfer.id,
          paidAt: new Date()
        }
      });

      return transfer;
    } catch (error) {
      await prisma.affiliatePayout.update({
        where: { id: payout.id },
        data: {
          status: 'FAILED'
        }
      });
      throw error;
    }
  }

  /**
   * Update affiliate tier based on performance
   */
  async updateAffiliateTiers() {
    const affiliates = await prisma.affiliate.findMany({
      where: { status: 'ACTIVE' }
    });

    for (const affiliate of affiliates) {
      let newTier: AffiliateTier = 'BRONZE';

      // Determine tier based on active referrals and total revenue
      if (affiliate.activeReferrals >= 100 && affiliate.totalRevenue >= 100000) {
        newTier = 'VIP';
      } else if (affiliate.activeReferrals >= 51) {
        newTier = 'PLATINUM';
      } else if (affiliate.activeReferrals >= 21) {
        newTier = 'GOLD';
      } else if (affiliate.activeReferrals >= 6) {
        newTier = 'SILVER';
      }

      if (newTier !== affiliate.tier) {
        // Update tier
        await prisma.affiliate.update({
          where: { id: affiliate.id },
          data: { 
            tier: newTier,
            customRates: this.getDefaultCommissionSchedule(newTier)
          }
        });

        // Process tier upgrade bonus
        await this.processTierBonus(affiliate.id, newTier);

        // Notify affiliate of tier change
        await this.notifyTierChange(affiliate, newTier);

        // Special VIP privileges
        if (newTier === 'VIP') {
          await this.grantVipPrivileges(affiliate.id);
        }
      }
    }
  }

  /**
   * Grant special privileges for VIP affiliates
   */
  private async grantVipPrivileges(affiliateId: string): Promise<void> {
    // Create VIP sales assets
    const vipAssets = [
      {
        affiliateId,
        type: 'WHITE_LABEL_DEMO' as any,
        title: 'Custom VibeLux Demo',
        description: 'Personalized demo environment with your branding',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/demo/vip/${affiliateId}`,
        isActive: true
      },
      {
        affiliateId,
        type: 'CUSTOM_LANDING_PAGE' as any,
        title: 'VIP Landing Page',
        description: 'Custom landing page with your messaging',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/vip/${affiliateId}`,
        isActive: true
      },
      {
        affiliateId,
        type: 'DEDICATED_SUPPORT' as any,
        title: 'Dedicated Support Line',
        description: 'Direct line to our sales team for your referrals',
        url: 'support@vibelux.com',
        isActive: true
      }
    ];

    // Create sales assets
    for (const asset of vipAssets) {
      await prisma.affiliateSalesAsset.create({
        data: asset
      });
    }

    // Grant special commission overrides for VIP
    await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        bonusCommission: 5, // Extra 5% bonus for VIP
        customRates: this.getDefaultCommissionSchedule('VIP')
      }
    });

    logger.info('api', `VIP privileges granted to affiliate ${affiliateId}`);
  }

  /**
   * Get affiliate dashboard data
   */
  async getAffiliateDashboard(affiliateId: string) {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: {
        referrals: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        commissions: {
          orderBy: { earnedAt: 'desc' },
          take: 10
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        clicks: {
          orderBy: { clickedAt: 'desc' },
          take: 100
        }
      }
    });

    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    // Calculate metrics
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentClicks = await prisma.affiliateClick.count({
      where: {
        affiliateId,
        clickedAt: { gte: last30Days }
      }
    });

    const recentConversions = await prisma.affiliateReferral.count({
      where: {
        affiliateId,
        firstPurchaseAt: { gte: last30Days }
      }
    });

    const pendingCommissions = await prisma.affiliateCommission.aggregate({
      where: {
        affiliateId,
        status: 'APPROVED',
        paidAt: null
      },
      _sum: { amount: true }
    });

    const conversionRate = recentClicks > 0 
      ? (recentConversions / recentClicks) * 100 
      : 0;

    // Get performance chart data
    const performanceData = await this.getPerformanceChartData(affiliateId);

    return {
      profile: {
        ...affiliate,
        pendingBalance: pendingCommissions._sum.amount || 0
      },
      metrics: {
        last30Days: {
          clicks: recentClicks,
          conversions: recentConversions,
          conversionRate: conversionRate.toFixed(2),
          revenue: affiliate.totalRevenue
        },
        lifetime: {
          referrals: affiliate.totalReferrals,
          activeReferrals: affiliate.activeReferrals,
          totalEarnings: affiliate.totalCommission,
          totalClicks: affiliate.totalClicks
        }
      },
      charts: performanceData,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${affiliate.code}`,
      marketingAssets: this.getMarketingAssets(affiliate)
    };
  }

  /**
   * Get performance chart data
   */
  private async getPerformanceChartData(affiliateId: string) {
    const last12Months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const [clicks, conversions, revenue] = await Promise.all([
        prisma.affiliateClick.count({
          where: {
            affiliateId,
            clickedAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        prisma.affiliateReferral.count({
          where: {
            affiliateId,
            firstPurchaseAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        prisma.affiliateCommission.aggregate({
          where: {
            affiliateId,
            earnedAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: { amount: true }
        })
      ]);

      last12Months.push({
        month: startDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        clicks,
        conversions,
        revenue: revenue._sum.amount || 0
      });
    }

    return last12Months;
  }

  /**
   * Get marketing assets for affiliate
   */
  private getMarketingAssets(affiliate: any) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const refLink = `${baseUrl}?ref=${affiliate.code}`;

    return {
      links: {
        homepage: refLink,
        pricing: `${refLink}&utm_source=affiliate&utm_medium=link&utm_campaign=pricing`,
        features: `${refLink}&utm_source=affiliate&utm_medium=link&utm_campaign=features`,
        demo: `${refLink}&utm_source=affiliate&utm_medium=link&utm_campaign=demo`
      },
      banners: [
        {
          size: '728x90',
          url: `${baseUrl}/api/affiliate/banner?size=728x90&code=${affiliate.code}`
        },
        {
          size: '300x250',
          url: `${baseUrl}/api/affiliate/banner?size=300x250&code=${affiliate.code}`
        },
        {
          size: '160x600',
          url: `${baseUrl}/api/affiliate/banner?size=160x600&code=${affiliate.code}`
        }
      ],
      emailTemplates: [
        {
          name: 'Introduction Email',
          subject: 'Transform Your Indoor Growing with VibeLux',
          preview: 'Introducing the most advanced lighting design platform...'
        },
        {
          name: 'Case Study Email',
          subject: 'How Growers Increased Yield by 40% with VibeLux',
          preview: 'Real results from real growers...'
        }
      ],
      socialMedia: {
        twitter: `Check out @VibeLux - the future of indoor growing! ${refLink}`,
        linkedin: `I've been using VibeLux for lighting design and the results are incredible. ${refLink}`,
        facebook: `Transform your grow operation with VibeLux's advanced lighting platform. ${refLink}`
      }
    };
  }

  /**
   * Generate unique affiliate code
   */
  private async generateUniqueCode(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const baseCode = user?.name
      ? user.name.toLowerCase().replace(/\s+/g, '')
      : `aff${Date.now()}`;

    let code = baseCode;
    let suffix = 1;

    while (await prisma.affiliate.findUnique({ where: { code } })) {
      code = `${baseCode}${suffix}`;
      suffix++;
    }

    return code;
  }

  /**
   * Parse user agent for device info
   */
  private parseUserAgent(userAgent: string) {
    // Simple parsing - in production use a library like ua-parser-js
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
    const isTablet = /iPad|Tablet/i.test(userAgent);
    
    return {
      deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      browser: userAgent.includes('Chrome') ? 'Chrome' : 
               userAgent.includes('Safari') ? 'Safari' : 
               userAgent.includes('Firefox') ? 'Firefox' : 'Other',
      os: userAgent.includes('Windows') ? 'Windows' :
          userAgent.includes('Mac') ? 'macOS' :
          userAgent.includes('Linux') ? 'Linux' :
          userAgent.includes('Android') ? 'Android' :
          userAgent.includes('iOS') ? 'iOS' : 'Other'
    };
  }

  /**
   * Get geolocation from IP
   */
  private async getGeolocation(ipAddress: string) {
    // In production, use a service like ipstack or maxmind
    // For now, return mock data
    return {
      country: 'US',
      region: 'CA',
      city: 'San Francisco'
    };
  }

  /**
   * Calculate predicted lifetime value
   */
  private calculatePredictedLTV(amount: number, tier?: string): number {
    // Simple LTV calculation - in production use more sophisticated models
    const monthlyValue = amount;
    const avgLifetimeMonths = tier?.includes('enterprise') ? 36 : 
                             tier?.includes('professional') ? 24 : 12;
    
    return monthlyValue * avgLifetimeMonths;
  }

  /**
   * Notify admin of new affiliate application
   */
  private async notifyAdminNewAffiliate(affiliate: any) {
    // Send notification to admin
    logger.info('api', `New affiliate application from ${affiliate.user.email}`);
  }

  /**
   * Get default commission schedule for lifetime commissions
   */
  private getDefaultCommissionSchedule(tier: AffiliateTier): any {
    const schedules = {
      BRONZE: {
        months: [
          { month: 1, rate: 20 },
          { month: 2, rate: 18 },
          { month: 3, rate: 16 },
          { month: 4, rate: 14 },
          { month: 5, rate: 12 },
          { month: 6, rate: 10 },
          { month: 7, rate: 8 },
          { month: 8, rate: 6 },
          { month: 9, rate: 4 },
          { month: 10, rate: 2 },
          { month: 11, rate: 1 },
          { month: 12, rate: 1 }
        ]
      },
      SILVER: {
        months: [
          { month: 1, rate: 25 },
          { month: 2, rate: 23 },
          { month: 3, rate: 21 },
          { month: 4, rate: 19 },
          { month: 5, rate: 17 },
          { month: 6, rate: 15 },
          { month: 7, rate: 13 },
          { month: 8, rate: 11 },
          { month: 9, rate: 9 },
          { month: 10, rate: 7 },
          { month: 11, rate: 5 },
          { month: 12, rate: 3 }
        ]
      },
      GOLD: {
        months: [
          { month: 1, rate: 30 },
          { month: 2, rate: 28 },
          { month: 3, rate: 26 },
          { month: 4, rate: 24 },
          { month: 5, rate: 22 },
          { month: 6, rate: 20 },
          { month: 7, rate: 18 },
          { month: 8, rate: 16 },
          { month: 9, rate: 14 },
          { month: 10, rate: 12 },
          { month: 11, rate: 10 },
          { month: 12, rate: 8 }
        ]
      },
      PLATINUM: {
        months: [
          { month: 1, rate: 35 },
          { month: 2, rate: 33 },
          { month: 3, rate: 31 },
          { month: 4, rate: 29 },
          { month: 5, rate: 27 },
          { month: 6, rate: 25 },
          { month: 7, rate: 23 },
          { month: 8, rate: 21 },
          { month: 9, rate: 19 },
          { month: 10, rate: 17 },
          { month: 11, rate: 15 },
          { month: 12, rate: 13 }
        ]
      },
      VIP: {
        months: [
          { month: 1, rate: 40 },
          { month: 2, rate: 38 },
          { month: 3, rate: 36 },
          { month: 4, rate: 34 },
          { month: 5, rate: 32 },
          { month: 6, rate: 30 },
          { month: 7, rate: 28 },
          { month: 8, rate: 26 },
          { month: 9, rate: 24 },
          { month: 10, rate: 22 },
          { month: 11, rate: 20 },
          { month: 12, rate: 18 }
        ]
      }
    };

    return schedules[tier] || schedules.BRONZE;
  }

  /**
   * Process signup bonus for new affiliate
   */
  async processSignupBonus(affiliateId: string): Promise<void> {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId }
    });

    if (!affiliate || affiliate.signupBonusEarned > 0) {
      return; // Already processed or affiliate not found
    }

    const bonusAmount = this.getSignupBonusAmount(affiliate.tier);
    
    if (bonusAmount > 0) {
      // Create bonus record
      await prisma.affiliateBonus.create({
        data: {
          affiliateId,
          type: 'SIGNUP',
          amount: bonusAmount,
          description: `Welcome bonus for ${affiliate.tier} tier`,
          earnedAt: new Date()
        }
      });

      // Update affiliate record
      await prisma.affiliate.update({
        where: { id: affiliateId },
        data: {
          signupBonusEarned: bonusAmount,
          totalCommission: { increment: bonusAmount }
        }
      });

      // Send notification
      await this.notifyBonusEarned(affiliate, 'signup', bonusAmount);
    }
  }

  /**
   * Process tier upgrade bonus
   */
  async processTierBonus(affiliateId: string, newTier: AffiliateTier): Promise<void> {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId }
    });

    if (!affiliate) return;

    const bonusAmount = this.getTierUpgradeBonus(affiliate.tier, newTier);
    
    if (bonusAmount > 0) {
      // Create bonus record
      await prisma.affiliateBonus.create({
        data: {
          affiliateId,
          type: 'TIER_UPGRADE',
          amount: bonusAmount,
          description: `Tier upgrade bonus: ${affiliate.tier} → ${newTier}`,
          earnedAt: new Date()
        }
      });

      // Update affiliate record
      await prisma.affiliate.update({
        where: { id: affiliateId },
        data: {
          tierBonusEarned: { increment: bonusAmount },
          totalCommission: { increment: bonusAmount }
        }
      });

      // Send notification
      await this.notifyBonusEarned(affiliate, 'tier_upgrade', bonusAmount);
    }
  }

  /**
   * Get signup bonus amount based on tier
   */
  private getSignupBonusAmount(tier: AffiliateTier): number {
    const bonuses = {
      BRONZE: 100,
      SILVER: 250,
      GOLD: 500,
      PLATINUM: 1000,
      VIP: 2500
    };
    return bonuses[tier] || 0;
  }

  /**
   * Get tier upgrade bonus amount
   */
  private getTierUpgradeBonus(oldTier: AffiliateTier, newTier: AffiliateTier): number {
    const tierValues = {
      BRONZE: 1,
      SILVER: 2,
      GOLD: 3,
      PLATINUM: 4,
      VIP: 5
    };

    const oldValue = tierValues[oldTier] || 1;
    const newValue = tierValues[newTier] || 1;

    if (newValue <= oldValue) return 0;

    const bonuses = {
      2: 500,  // Bronze → Silver
      3: 1000, // Silver → Gold
      4: 2500, // Gold → Platinum
      5: 5000  // Platinum → VIP
    };

    return bonuses[newValue] || 0;
  }

  /**
   * Process monthly contest bonuses
   */
  async processMonthlyContests(): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Check if contest already processed for this month
    const existingContest = await prisma.affiliateLeaderboard.findFirst({
      where: {
        period: currentMonth,
        type: 'MONTHLY_CONTEST'
      }
    });

    if (existingContest) return; // Already processed

    // Get top performers for the month
    const topPerformers = await this.getMonthlyTopPerformers();

    // Award contest bonuses
    const contestBonuses = [
      { place: 1, bonus: 5000, description: '1st Place - Monthly Contest' },
      { place: 2, bonus: 3000, description: '2nd Place - Monthly Contest' },
      { place: 3, bonus: 2000, description: '3rd Place - Monthly Contest' },
      { place: 4, bonus: 1000, description: '4th Place - Monthly Contest' },
      { place: 5, bonus: 500, description: '5th Place - Monthly Contest' }
    ];

    for (let i = 0; i < Math.min(topPerformers.length, contestBonuses.length); i++) {
      const performer = topPerformers[i];
      const contestBonus = contestBonuses[i];

      // Create bonus record
      await prisma.affiliateBonus.create({
        data: {
          affiliateId: performer.affiliateId,
          type: 'MONTHLY_CONTEST',
          amount: contestBonus.bonus,
          description: contestBonus.description,
          earnedAt: new Date()
        }
      });

      // Update affiliate total
      await prisma.affiliate.update({
        where: { id: performer.affiliateId },
        data: {
          totalCommission: { increment: contestBonus.bonus }
        }
      });

      // Create leaderboard entry
      await prisma.affiliateLeaderboard.create({
        data: {
          affiliateId: performer.affiliateId,
          period: currentMonth,
          type: 'MONTHLY_CONTEST',
          position: contestBonus.place,
          metric: 'revenue',
          value: performer.monthlyRevenue,
          bonus: contestBonus.bonus
        }
      });
    }
  }

  /**
   * Get monthly top performers
   */
  private async getMonthlyTopPerformers() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Get affiliates with their monthly performance
    const affiliates = await prisma.affiliate.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        commissions: {
          where: {
            earnedAt: {
              gte: startOfMonth,
              lte: endOfMonth
            },
            status: 'APPROVED'
          }
        }
      }
    });

    // Calculate monthly revenue and sort
    const performers = affiliates
      .map(affiliate => ({
        affiliateId: affiliate.id,
        monthlyRevenue: affiliate.commissions.reduce((sum, comm) => sum + comm.amount, 0),
        monthlyConversions: affiliate.commissions.length
      }))
      .filter(p => p.monthlyRevenue > 0)
      .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

    return performers;
  }

  /**
   * Notify affiliate of bonus earned
   */
  private async notifyBonusEarned(affiliate: any, bonusType: string, amount: number) {
    logger.info('api', `Affiliate ${affiliate.code} earned ${bonusType} bonus: $${amount}`);
    // In production, send email notification
  }

  /**
   * Notify affiliate of tier change
   */
  private async notifyTierChange(affiliate: any, newTier: AffiliateTier) {
    // Send notification to affiliate
    logger.info('api', `Affiliate ${affiliate.code} upgraded to ${newTier} tier`);
  }
}

// Export singleton instance
export const affiliateService = AffiliateService.getInstance();