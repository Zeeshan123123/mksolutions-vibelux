import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const facilityId = searchParams.get('facilityId');
    const days = parseInt(searchParams.get('days') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Build where clause
    const whereClause = {
      ...(facilityId && { facilityId }),
      createdAt: { gte: startDate }
    };
    
    // Get photo reports stats
    const [
      totalPhotoReports,
      unresolvedIssues,
      criticalIssues,
      photoReportsByType
    ] = await Promise.all([
      prisma.photoReport.count({ where: whereClause }),
      prisma.photoReport.count({ 
        where: { 
          ...whereClause, 
          resolved: false 
        } 
      }),
      prisma.photoReport.count({ 
        where: { 
          ...whereClause, 
          severity: 'critical',
          resolved: false
        } 
      }),
      prisma.photoReport.groupBy({
        by: ['issueType'],
        where: whereClause,
        _count: true
      })
    ]);
    
    // Get quality reports stats
    const [
      totalQualityReports,
      passedQA,
      failedQA,
      qualityTrend
    ] = await Promise.all([
      prisma.qualityReport.count({ where: whereClause }),
      prisma.qualityReport.count({ 
        where: { 
          ...whereClause, 
          passedQA: true 
        } 
      }),
      prisma.qualityReport.count({ 
        where: { 
          ...whereClause, 
          passedQA: false 
        } 
      }),
      prisma.qualityReport.groupBy({
        by: ['reportType'],
        where: whereClause,
        _count: true,
        _avg: {
          overallScore: true
        }
      })
    ]);
    
    // Get production batch stats
    const [
      activeBatches,
      completedBatches,
      averageYield
    ] = await Promise.all([
      prisma.productionBatch.count({
        where: {
          ...whereClause,
          status: 'active'
        }
      }),
      prisma.productionBatch.count({
        where: {
          ...whereClause,
          status: 'harvested'
        }
      }),
      prisma.productionBatch.aggregate({
        where: {
          ...whereClause,
          actualYield: { not: null }
        },
        _avg: {
          actualYield: true
        }
      })
    ]);
    
    // Calculate trends (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentIssues = await prisma.photoReport.groupBy({
      by: ['severity'],
      where: {
        ...whereClause,
        createdAt: { gte: weekAgo }
      },
      _count: true
    });
    
    const qualityScores = await prisma.qualityReport.aggregate({
      where: {
        ...whereClause,
        createdAt: { gte: weekAgo }
      },
      _avg: {
        overallScore: true
      },
      _count: true
    });
    
    return NextResponse.json({
      success: true,
      status: 'active',
      data: {
        // Photo Reports
        photoReports: {
          total: totalPhotoReports,
          unresolved: unresolvedIssues,
          critical: criticalIssues,
          byType: photoReportsByType.reduce((acc, item) => {
            acc[item.issueType || 'unknown'] = item._count;
            return acc;
          }, {} as Record<string, number>)
        },
        
        // Quality Reports
        qualityReports: {
          total: totalQualityReports,
          passed: passedQA,
          failed: failedQA,
          passRate: totalQualityReports > 0 
            ? (passedQA / totalQualityReports * 100).toFixed(1) 
            : 0,
          byType: qualityTrend.map(item => ({
            type: item.reportType,
            count: item._count,
            avgScore: item._avg.overallScore?.toFixed(1) || 0
          }))
        },
        
        // Production Stats
        production: {
          activeBatches,
          completedBatches,
          averageYield: averageYield._avg.actualYield?.toFixed(2) || 0
        },
        
        // Trends
        trends: {
          recentIssues: recentIssues.map(item => ({
            severity: item.severity,
            count: item._count
          })),
          qualityScore: {
            average: qualityScores._avg.overallScore?.toFixed(1) || 0,
            reports: qualityScores._count
          },
          period: `Last ${days} days`
        }
      }
    });
    
  } catch (error) {
    logger.error('api', 'Visual Ops stats error', error as Error);
    
    // Return graceful degradation if models don't exist yet
    return NextResponse.json({
      success: true,
      status: 'partial',
      message: 'Some visual ops features are being initialized',
      data: {
        photoReports: { total: 0, unresolved: 0, critical: 0, byType: {} },
        qualityReports: { total: 0, passed: 0, failed: 0, passRate: 0, byType: [] },
        production: { activeBatches: 0, completedBatches: 0, averageYield: 0 },
        trends: { recentIssues: [], qualityScore: { average: 0, reports: 0 }, period: 'Last 30 days' }
      }
    });
  }
}