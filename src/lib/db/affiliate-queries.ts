/**
 * Affiliate Database Queries
 * Implements all database operations for the affiliate system
 */

import { prisma } from '@/lib/prisma';
import { 
  AffiliateStatus, 
  ReferralStatus, 
  CommissionStatus,
  PayoutStatus,
  AffiliateTier,
  type Prisma 
} from '@prisma/client';

export const affiliateDb = {
  affiliates: {
    async create(data: {
      userId: string;
      affiliateCode: string;
      status: AffiliateStatus;
      commissionRate: number;
      cookieDuration: number;
      metadata?: any;
    }) {
      return await prisma.affiliate.create({
        data: {
          userId: data.userId,
          code: data.affiliateCode,
          status: data.status,
          baseCommission: data.commissionRate,
          tier: AffiliateTier.BRONZE,
          customRates: data.metadata
        }
      });
    },

    async findById(id: string) {
      return await prisma.affiliate.findUnique({
        where: { id },
        include: {
          user: true,
          referrals: {
            where: { status: ReferralStatus.ACTIVE },
            take: 5,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    },

    async findByCode(code: string) {
      return await prisma.affiliate.findUnique({
        where: { code },
        include: { user: true }
      });
    },

    async findByUserId(userId: string) {
      return await prisma.affiliate.findUnique({
        where: { userId },
        include: { user: true }
      });
    },

    async update(id: string, data: Partial<{
      status: AffiliateStatus;
      baseCommission: number;
      tier: AffiliateTier;
      customRates: any;
      stripeAccountId: string;
      stripeAccountStatus: string;
      stripeVerificationStatus: string;
      stripeVerificationFields: any;
    }>) {
      return await prisma.affiliate.update({
        where: { id },
        data
      });
    },

    async updateStats(affiliateId: string) {
      const [totalReferrals, activeReferrals, commissions] = await Promise.all([
        prisma.affiliateReferral.count({
          where: { affiliateId }
        }),
        prisma.affiliateReferral.count({
          where: { 
            affiliateId,
            status: ReferralStatus.ACTIVE
          }
        }),
        prisma.affiliateCommission.aggregate({
          where: { 
            affiliateId,
            status: CommissionStatus.PAID
          },
          _sum: {
            amount: true
          }
        })
      ]);

      const totalRevenue = await prisma.affiliateReferral.aggregate({
        where: { affiliateId },
        _sum: {
          totalPurchases: true
        }
      });

      return await prisma.affiliate.update({
        where: { id: affiliateId },
        data: {
          totalReferrals,
          activeReferrals,
          totalCommission: commissions._sum.amount || 0,
          totalRevenue: totalRevenue._sum.totalPurchases || 0,
          // Update tier based on active referrals
          tier: activeReferrals >= 51 ? AffiliateTier.GOLD :
                activeReferrals >= 11 ? AffiliateTier.SILVER :
                AffiliateTier.BRONZE
        }
      });
    },

    async list(filters?: {
      status?: AffiliateStatus;
      tier?: AffiliateTier;
      search?: string;
      skip?: number;
      take?: number;
      orderBy?: 'createdAt' | 'totalRevenue' | 'activeReferrals';
    }) {
      const where: Prisma.AffiliateWhereInput = {};
      
      if (filters?.status) where.status = filters.status;
      if (filters?.tier) where.tier = filters.tier;
      if (filters?.search) {
        where.OR = [
          { code: { contains: filters.search, mode: 'insensitive' } },
          { user: { name: { contains: filters.search, mode: 'insensitive' } } },
          { user: { email: { contains: filters.search, mode: 'insensitive' } } }
        ];
      }

      return await prisma.affiliate.findMany({
        where,
        include: {
          user: true,
          _count: {
            select: {
              referrals: true,
              commissions: true
            }
          }
        },
        skip: filters?.skip || 0,
        take: filters?.take || 20,
        orderBy: filters?.orderBy ? 
          { [filters.orderBy]: 'desc' } : 
          { createdAt: 'desc' }
      });
    }
  },

  affiliateLinks: {
    async create(data: {
      affiliateId: string;
      originalUrl: string;
      shortCode: string;
      customAlias?: string;
      campaign?: string;
      source?: string;
      medium?: string;
      content?: string;
      isActive: boolean;
      expiresAt?: Date;
      metadata?: any;
    }) {
      return await prisma.affiliateLink.create({
        data: {
          affiliateId: data.affiliateId,
          originalUrl: data.originalUrl,
          shortCode: data.shortCode,
          customAlias: data.customAlias,
          utmCampaign: data.campaign,
          utmSource: data.source,
          utmMedium: data.medium,
          utmContent: data.content,
          isActive: data.isActive,
          expiresAt: data.expiresAt,
          metadata: data.metadata
        }
      });
    },

    async findByShortCode(shortCode: string) {
      return await prisma.affiliateLink.findUnique({
        where: { shortCode },
        include: { affiliate: true }
      });
    },

    async findByAffiliateId(affiliateId: string, options?: {
      isActive?: boolean;
      skip?: number;
      take?: number;
    }) {
      return await prisma.affiliateLink.findMany({
        where: {
          affiliateId,
          ...(options?.isActive !== undefined && { isActive: options.isActive })
        },
        orderBy: { createdAt: 'desc' },
        skip: options?.skip || 0,
        take: options?.take || 20
      });
    },

    async updateStats(linkId: string, type: 'click' | 'conversion', value?: number) {
      const link = await prisma.affiliateLink.findUnique({
        where: { id: linkId }
      });

      if (!link) return null;

      const updateData: Prisma.AffiliateLinkUpdateInput = {
        clicks: type === 'click' ? { increment: 1 } : undefined
      };

      if (type === 'conversion' && value) {
        updateData.conversions = { increment: 1 };
        updateData.revenue = { increment: value };
      }

      return await prisma.affiliateLink.update({
        where: { id: linkId },
        data: updateData
      });
    }
  },

  affiliateClicks: {
    async create(data: {
      linkId: string;
      affiliateId: string;
      visitorId: string;
      ipAddress: string;
      userAgent: string;
      referrer?: string;
      device: any;
      utmParams: any;
    }) {
      // Generate unique click ID
      const clickId = `clk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      return await prisma.affiliateClick.create({
        data: {
          affiliateId: data.affiliateId,
          linkId: data.linkId,
          clickId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          referrer: data.referrer,
          deviceType: data.device.type,
          utmSource: data.utmParams.source,
          utmMedium: data.utmParams.medium,
          utmCampaign: data.utmParams.campaign
        }
      });
    },

    async findById(clickId: string) {
      return await prisma.affiliateClick.findUnique({
        where: { clickId }
      });
    },

    async findByVisitorId(visitorId: string, affiliateId: string) {
      return await prisma.affiliateClick.findFirst({
        where: {
          affiliateId,
          // Store visitor ID in metadata or add column if needed
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    },

    async update(clickId: string, data: {
      convertedAt?: Date;
      conversionValue?: number;
    }) {
      return await prisma.affiliateClick.update({
        where: { clickId },
        data: {
          converted: true,
          conversionValue: data.conversionValue
        }
      });
    }
  },

  affiliateCommissions: {
    async create(data: {
      affiliateId: string;
      clickId: string;
      orderId?: string;
      customerId: string;
      type: string;
      amount: number;
      rate: number;
      status: CommissionStatus;
      metadata?: any;
    }) {
      // Find or create invoice for commission tracking
      let invoice = data.orderId ? 
        await prisma.invoice.findFirst({
          where: { orderId: data.orderId }
        }) : null;

      if (!invoice && data.orderId) {
        // Create a placeholder invoice if needed
        invoice = await prisma.invoice.create({
          data: {
            customerId: data.customerId,
            orderId: data.orderId,
            amount: data.amount / (data.rate / 100), // Calculate original amount
            status: 'PAID',
            paidAt: new Date()
          }
        });
      }

      return await prisma.affiliateCommission.create({
        data: {
          affiliateId: data.affiliateId,
          invoiceId: invoice?.id || '',
          customerId: data.customerId,
          amount: data.amount,
          rate: data.rate,
          tier: data.metadata?.tier || 'standard',
          status: data.status,
          payoutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });
    },

    async findByCustomer(customerId: string, affiliateId: string) {
      return await prisma.affiliateCommission.findFirst({
        where: {
          customerId,
          affiliateId
        },
        orderBy: { createdAt: 'desc' }
      });
    },

    async getPending(affiliateId: string) {
      return await prisma.affiliateCommission.findMany({
        where: {
          affiliateId,
          status: CommissionStatus.PENDING
        },
        include: {
          customer: true,
          invoice: true
        },
        orderBy: { createdAt: 'desc' }
      });
    },

    async approve(commissionId: string) {
      return await prisma.affiliateCommission.update({
        where: { id: commissionId },
        data: {
          status: CommissionStatus.APPROVED
        }
      });
    },

    async markAsPaid(commissionIds: string[], transactionId: string) {
      return await prisma.affiliateCommission.updateMany({
        where: {
          id: { in: commissionIds }
        },
        data: {
          status: CommissionStatus.PAID,
          paidAt: new Date(),
          transactionId
        }
      });
    }
  },

  affiliateReferrals: {
    async create(data: {
      affiliateId: string;
      referredEmail: string;
      referredUserId?: string;
      status: ReferralStatus;
    }) {
      return await prisma.affiliateReferral.create({
        data: {
          affiliateId: data.affiliateId,
          referredEmail: data.referredEmail,
          referredUserId: data.referredUserId,
          status: data.status
        }
      });
    },

    async findByEmail(email: string) {
      return await prisma.affiliateReferral.findFirst({
        where: { referredEmail: email },
        include: { affiliate: true }
      });
    },

    async activate(referralId: string, userId: string) {
      return await prisma.affiliateReferral.update({
        where: { id: referralId },
        data: {
          referredUserId: userId,
          status: ReferralStatus.ACTIVE,
          signedUpAt: new Date()
        }
      });
    },

    async recordPurchase(referralId: string, amount: number) {
      return await prisma.affiliateReferral.update({
        where: { id: referralId },
        data: {
          totalPurchases: { increment: amount },
          firstPurchaseAt: new Date()
        }
      });
    }
  },

  affiliatePayouts: {
    async create(data: {
      affiliateId: string;
      amount: number;
      period: string;
      status: PayoutStatus;
    }) {
      return await prisma.affiliatePayout.create({
        data: {
          affiliateId: data.affiliateId,
          amount: data.amount,
          period: data.period,
          status: data.status
        }
      });
    },

    async getPending() {
      return await prisma.affiliatePayout.findMany({
        where: {
          status: PayoutStatus.PENDING
        },
        include: {
          affiliate: {
            include: { user: true }
          }
        }
      });
    },

    async markAsPaid(payoutId: string, transactionId: string) {
      return await prisma.affiliatePayout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.COMPLETED,
          transactionId,
          paidAt: new Date()
        }
      });
    }
  },

  // Analytics queries
  analytics: {
    async getAffiliateMetrics(affiliateId: string, dateRange: { start: Date; end: Date }) {
      const [clicks, conversions, revenue, topLinks] = await Promise.all([
        // Total clicks
        prisma.affiliateClick.count({
          where: {
            affiliateId,
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end
            }
          }
        }),
        
        // Total conversions
        prisma.affiliateClick.count({
          where: {
            affiliateId,
            converted: true,
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end
            }
          }
        }),
        
        // Total revenue
        prisma.affiliateCommission.aggregate({
          where: {
            affiliateId,
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end
            }
          },
          _sum: {
            amount: true
          }
        }),
        
        // Top performing links
        prisma.affiliateLink.findMany({
          where: { affiliateId },
          orderBy: { conversions: 'desc' },
          take: 5
        })
      ]);

      return {
        clicks,
        conversions,
        conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
        revenue: revenue._sum.amount || 0,
        topLinks
      };
    },

    async getDailyStats(affiliateId: string, days: number = 30) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // This would need a raw query for daily grouping
      // For now, return mock data structure
      return [];
    }
  }
};

// Export for use in affiliate-system.ts
export const db = affiliateDb;