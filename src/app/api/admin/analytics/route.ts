import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get real analytics data from database
    const [
      totalUsers,
      recentUsers,
      totalRevenue,
      recentRevenue,
      activeSubscriptions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.user.count({
        where: {
          subscriptionStatus: 'active'
        }
      })
    ]);

    // Calculate growth rates (simplified)
    const previousUsers = totalUsers - recentUsers;
    const userGrowth = previousUsers > 0 ? ((recentUsers / previousUsers) * 100) : 0;
    
    const analytics = {
      overview: {
        totalRevenue: (totalRevenue._sum.amount || 0) / 100, // Convert from cents
        revenueGrowth: recentRevenue._sum.amount ? 
          (((recentRevenue._sum.amount || 0) / Math.max((totalRevenue._sum.amount || 1) - (recentRevenue._sum.amount || 0), 1)) * 100) : 0,
        totalUsers,
        userGrowth,
        activeUsers: activeSubscriptions,
        conversionRate: totalUsers > 0 ? ((activeSubscriptions / totalUsers) * 100) : 0,
        avgRevenuePerUser: totalUsers > 0 ? ((totalRevenue._sum.amount || 0) / 100 / totalUsers) : 0,
        churnRate: 0 // Would need more complex calculation with historical data
      },
      status: 'success',
      timestamp: new Date().toISOString(),
      note: 'Real analytics data from database - additional metrics can be added as needed'
    }

    return NextResponse.json(analytics)

  } catch (error) {
    logger.error('api', 'Error in analytics API:', error )
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}