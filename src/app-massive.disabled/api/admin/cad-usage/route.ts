import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/db';
import { CADUsageTracker } from '@/lib/cad-usage-tracker';

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get query parameters for date range
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    // Get usage statistics
    const stats = await CADUsageTracker.getUsageStats(startDate, endDate);

    // Get additional metrics
    const [
      totalUsers,
      activeUsers,
      formatBreakdown,
      failureRate,
      tierBreakdown
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active CAD users
      prisma.cadImport.groupBy({
        by: ['userId'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      // Format breakdown
      prisma.cadImport.groupBy({
        by: ['format'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: true,
        orderBy: {
          _count: {
            format: 'desc'
          }
        }
      }),
      
      // Failure rate
      prisma.cadImport.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: true
      }),
      
      // Usage by tier
      prisma.$queryRaw<Array<{subscriptionTier: string, users: number, imports: number}>>`
        SELECT u."subscriptionTier", COUNT(DISTINCT c."userId") as users, COUNT(c.id) as imports
        FROM "User" u
        LEFT JOIN "CadImport" c ON u.id = c."userId" 
          AND c."createdAt" >= ${startDate} 
          AND c."createdAt" <= ${endDate}
        GROUP BY u."subscriptionTier"
      `
    ]);

    // Calculate adoption rate
    const adoptionRate = (activeUsers.length / totalUsers) * 100;

    // Calculate success rate
    const statusCounts = failureRate.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    const successRate = statusCounts.completed 
      ? (statusCounts.completed / (statusCounts.completed + (statusCounts.failed || 0))) * 100
      : 0;

    // Get top users for monitoring
    const topUsers = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        u."subscriptionTier",
        COUNT(c.id) as import_count,
        SUM(c."tokensUsed") as total_tokens
      FROM "CadImport" c
      JOIN "User" u ON c."userId" = u.id
      WHERE c."createdAt" >= ${startDate} AND c."createdAt" <= ${endDate}
      GROUP BY u.id, u.email, u."subscriptionTier"
      ORDER BY import_count DESC
      LIMIT 10
    `;

    return NextResponse.json({
      dateRange: {
        start: startDate,
        end: endDate,
        days
      },
      overview: {
        totalImports: stats.totalImports,
        totalTokensUsed: stats.totalTokensUsed,
        estimatedCost: stats.estimatedCost,
        adoptionRate: adoptionRate.toFixed(2) + '%',
        successRate: successRate.toFixed(2) + '%',
        activeUsers: activeUsers.length,
        totalUsers
      },
      formatBreakdown: formatBreakdown.map(f => ({
        format: f.format,
        count: f._count,
        complexity: CADUsageTracker.getFormatComplexity(f.format),
        tokenCost: CADUsageTracker.getTokenCost(f.format)
      })),
      tierBreakdown,
      topUsers,
      recommendations: generateRecommendations(stats, tierBreakdown, adoptionRate)
    });

  } catch (error) {
    logger.error('api', 'CAD usage stats error:', error );
    return NextResponse.json(
      { error: 'Failed to fetch CAD usage statistics' },
      { status: 500 }
    );
  }
}

function generateRecommendations(stats: any, tierBreakdown: any[], adoptionRate: number) {
  const recommendations: Array<{type: string; priority: string; message: string}> = [];

  // Low adoption rate
  if (adoptionRate < 10) {
    recommendations.push({
      type: 'adoption',
      priority: 'high',
      message: 'CAD adoption is low. Consider email campaign to promote the feature.'
    });
  }

  // Check tier usage patterns
  tierBreakdown.forEach((tier: any) => {
    const avgImportsPerUser = tier.users > 0 ? tier.imports / tier.users : 0;
    
    if (tier.subscriptionTier === 'grower' && avgImportsPerUser > 4) {
      recommendations.push({
        type: 'limit',
        priority: 'medium',
        message: 'Grower users averaging near limit. Consider increasing to 7-8 imports.'
      });
    }
    
    if (tier.subscriptionTier === 'professional' && avgImportsPerUser > 15) {
      recommendations.push({
        type: 'limit',
        priority: 'medium',
        message: 'Professional users approaching limit. Monitor for upgrade opportunities.'
      });
    }
  });

  // Cost monitoring
  if (stats.estimatedCost > 1000) {
    recommendations.push({
      type: 'cost',
      priority: 'high',
      message: `High monthly cost ($${stats.estimatedCost.toFixed(2)}). Review heavy users and consider usage limits.`
    });
  }

  return recommendations;
}