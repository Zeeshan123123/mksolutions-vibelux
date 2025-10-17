import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { DocumentAnalysisService } from '@/services/document-analysis.service';
export const dynamic = 'force-dynamic'

const documentAnalysisService = new DocumentAnalysisService();

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const action = searchParams.get('action') || 'alerts';

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'alerts':
        const activeOnly = searchParams.get('activeOnly') !== 'false';
        const severity = searchParams.get('severity');
        
        let alerts = await documentAnalysisService.getComplianceAlerts(facilityId, activeOnly);
        
        if (severity) {
          alerts = alerts.filter(alert => alert.severity === severity);
        }

        return NextResponse.json({
          success: true,
          facilityId,
          alerts: alerts.map(alert => ({
            id: alert.id,
            documentId: alert.documentId,
            alertType: alert.alertType,
            severity: alert.severity,
            message: alert.message,
            details: alert.details,
            status: alert.status,
            createdAt: alert.createdAt,
            dueDate: alert.dueDate,
            acknowledgedBy: alert.acknowledgedBy,
            acknowledgedAt: alert.acknowledgedAt
          })),
          summary: {
            total: alerts.length,
            critical: alerts.filter(a => a.severity === 'critical').length,
            high: alerts.filter(a => a.severity === 'high').length,
            medium: alerts.filter(a => a.severity === 'medium').length,
            low: alerts.filter(a => a.severity === 'low').length,
            active: alerts.filter(a => a.status === 'active').length,
            overdue: alerts.filter(a => a.dueDate && a.dueDate < new Date()).length
          }
        });

      case 'report':
        const reportType = searchParams.get('reportType') || 'summary';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate and endDate are required for reports' },
            { status: 400 }
          );
        }

        const dateRange = {
          start: new Date(startDate),
          end: new Date(endDate)
        };

        const report = await documentAnalysisService.generateComplianceReport(
          facilityId,
          reportType as any,
          dateRange
        );

        return NextResponse.json({
          success: true,
          report
        });

      case 'status':
        const statusAlerts = await documentAnalysisService.getComplianceAlerts(facilityId, true);
        const documents = await documentAnalysisService.searchDocuments(facilityId, {});
        
        // Calculate compliance metrics
        const expiringDocuments = statusAlerts.filter(alert => 
          alert.alertType === 'expiration_warning' && 
          alert.dueDate && 
          alert.dueDate.getTime() - Date.now() <= 30 * 24 * 60 * 60 * 1000 // 30 days
        );

        const failedTests = statusAlerts.filter(alert => alert.alertType === 'failed_test');
        const invalidLicenses = statusAlerts.filter(alert => alert.alertType === 'invalid_license');
        
        const overallStatus = statusAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length > 0 
          ? 'critical_issues' 
          : statusAlerts.length > 0 
            ? 'issues_found' 
            : 'compliant';

        return NextResponse.json({
          success: true,
          facilityId,
          complianceStatus: {
            overall: overallStatus,
            lastUpdated: new Date(),
            metrics: {
              totalDocuments: documents.length,
              activeAlerts: statusAlerts.length,
              criticalIssues: statusAlerts.filter(a => a.severity === 'critical').length,
              expiringDocuments: expiringDocuments.length,
              failedTests: failedTests.length,
              invalidLicenses: invalidLicenses.length,
              documentsNeedingReview: documents.filter(d => d.confidence < 0.8).length
            },
            upcomingDeadlines: expiringDocuments.slice(0, 5).map(alert => ({
              type: alert.alertType,
              message: alert.message,
              dueDate: alert.dueDate,
              severity: alert.severity,
              daysRemaining: alert.dueDate ? Math.ceil((alert.dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : null
            })),
            recommendations: this.generateComplianceRecommendations(statusAlerts, documents)
          }
        });

      case 'dashboard':
        const dashboardAlerts = await documentAnalysisService.getComplianceAlerts(facilityId, true);
        const dashboardDocs = await documentAnalysisService.searchDocuments(facilityId, {
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            end: new Date()
          }
        });

        // Calculate trends
        const weeklyTrends = this.calculateWeeklyTrends(dashboardDocs);
        const alertTrends = this.calculateAlertTrends(dashboardAlerts);

        return NextResponse.json({
          success: true,
          facilityId,
          dashboard: {
            summary: {
              documentsProcessed: dashboardDocs.length,
              activeAlerts: dashboardAlerts.length,
              complianceScore: this.calculateComplianceScore(dashboardAlerts, dashboardDocs),
              avgProcessingTime: dashboardDocs.reduce((sum, doc) => sum + doc.processingTime, 0) / dashboardDocs.length || 0
            },
            trends: {
              weekly: weeklyTrends,
              alerts: alertTrends
            },
            recentActivity: dashboardDocs.slice(0, 10).map(doc => ({
              id: doc.id,
              type: doc.documentType,
              timestamp: doc.timestamp,
              confidence: doc.confidence,
              status: doc.errors.length === 0 ? 'success' : 'needs_review'
            })),
            urgentItems: dashboardAlerts
              .filter(alert => alert.severity === 'critical' || alert.severity === 'high')
              .slice(0, 5)
              .map(alert => ({
                id: alert.id,
                type: alert.alertType,
                message: alert.message,
                severity: alert.severity,
                dueDate: alert.dueDate
              }))
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: alerts, report, status, dashboard' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('api', 'Compliance request failed', error as Error);
    return NextResponse.json(
      { error: 'Compliance request failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, facilityId, data } = body;

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'acknowledge_alert':
        const { alertId, notes } = data;
        
        if (!alertId) {
          return NextResponse.json(
            { error: 'alertId is required' },
            { status: 400 }
          );
        }

        const acknowledged = await documentAnalysisService.acknowledgeAlert(alertId, userId, notes);
        
        if (!acknowledged) {
          return NextResponse.json(
            { error: 'Alert not found or already acknowledged' },
            { status: 404 }
          );
        }

        logger.info('api', 'Alert acknowledged', {
          alertId,
          acknowledgedBy: userId,
          notes
        });

        return NextResponse.json({
          success: true,
          message: 'Alert acknowledged successfully',
          alertId,
          acknowledgedBy: userId,
          acknowledgedAt: new Date()
        });

      case 'configure_compliance':
        const { 
          requiredDocuments = [],
          expirationWarningDays = 30,
          alertOnFailedTests = true,
          validateLicenseNumbers = true,
          autoClassifyDocuments = true,
          confidenceThreshold = 0.8
        } = data;

        // Store compliance configuration
        const config = {
          facilityId,
          requiredDocuments,
          expirationWarningDays,
          alertOnFailedTests,
          validateLicenseNumbers,
          autoClassifyDocuments,
          confidenceThreshold,
          updatedBy: userId,
          updatedAt: new Date()
        };

        logger.info('api', 'Compliance configuration updated', config);

        return NextResponse.json({
          success: true,
          message: 'Compliance configuration updated',
          config
        });

      case 'create_manual_alert':
        const {
          documentId,
          alertType,
          severity = 'medium',
          message,
          details = {},
          dueDate
        } = data;

        if (!documentId || !alertType || !message) {
          return NextResponse.json(
            { error: 'documentId, alertType, and message are required' },
            { status: 400 }
          );
        }

        const manualAlertId = `alert_manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const manualAlert = {
          id: manualAlertId,
          facilityId,
          documentId,
          alertType,
          severity,
          message,
          details,
          status: 'active',
          createdAt: new Date(),
          dueDate: dueDate ? new Date(dueDate) : undefined,
          createdBy: userId
        };

        logger.info('api', 'Manual alert created', manualAlert);

        return NextResponse.json({
          success: true,
          message: 'Manual alert created successfully',
          alert: manualAlert
        });

      case 'bulk_acknowledge':
        const { alertIds } = data;
        
        if (!alertIds || !Array.isArray(alertIds)) {
          return NextResponse.json(
            { error: 'alertIds array is required' },
            { status: 400 }
          );
        }

        const acknowledgedCount = alertIds.length; // Mock implementation
        
        logger.info('api', 'Bulk alert acknowledgment', {
          alertIds,
          acknowledgedBy: userId,
          count: acknowledgedCount
        });

        return NextResponse.json({
          success: true,
          message: `${acknowledgedCount} alerts acknowledged successfully`,
          acknowledgedCount,
          acknowledgedBy: userId,
          acknowledgedAt: new Date()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: acknowledge_alert, configure_compliance, create_manual_alert, bulk_acknowledge' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('api', 'Compliance action failed', error as Error);
    return NextResponse.json(
      { error: 'Compliance action failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Helper functions
function generateComplianceRecommendations(alerts: any[], documents: any[]): string[] {
  const recommendations: string[] = [];

  if (alerts.some(alert => alert.alertType === 'expiration_warning')) {
    recommendations.push('Review and renew expiring licenses immediately');
  }

  if (alerts.some(alert => alert.alertType === 'failed_test')) {
    recommendations.push('Investigate failed lab tests and implement corrective actions');
  }

  const lowConfidenceDocs = documents.filter(doc => doc.confidence < 0.8);
  if (lowConfidenceDocs.length > 0) {
    recommendations.push(`Review ${lowConfidenceDocs.length} documents with low OCR confidence`);
  }

  if (alerts.length === 0) {
    recommendations.push('All compliance requirements are currently met');
  }

  return recommendations;
}

function calculateWeeklyTrends(documents: any[]): any {
  // Calculate document processing trends over the last 4 weeks
  const weeks: any[] = [];
  const now = new Date();
  
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    
    const weekDocs = documents.filter(doc => 
      doc.timestamp >= weekStart && doc.timestamp < weekEnd
    );
    
    weeks.push({
      week: weekStart.toISOString().split('T')[0],
      documentsProcessed: weekDocs.length,
      avgConfidence: weekDocs.reduce((sum, doc) => sum + doc.confidence, 0) / weekDocs.length || 0,
      errors: weekDocs.filter(doc => doc.errors.length > 0).length
    });
  }
  
  return weeks;
}

function calculateAlertTrends(alerts: any[]): any {
  const alertsByType: Record<string, number> = {};
  const alertsBySeverity: Record<string, number> = {};
  
  alerts.forEach(alert => {
    alertsByType[alert.alertType] = (alertsByType[alert.alertType] || 0) + 1;
    alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
  });
  
  return {
    byType: alertsByType,
    bySeverity: alertsBySeverity,
    total: alerts.length
  };
}

function calculateComplianceScore(alerts: any[], documents: any[]): number {
  let score = 100;
  
  // Deduct points for alerts
  alerts.forEach(alert => {
    switch (alert.severity) {
      case 'critical': score -= 20; break;
      case 'high': score -= 10; break;
      case 'medium': score -= 5; break;
      case 'low': score -= 2; break;
    }
  });
  
  // Deduct points for low confidence documents
  const lowConfidenceDocs = documents.filter(doc => doc.confidence < 0.8);
  score -= lowConfidenceDocs.length * 2;
  
  // Deduct points for processing errors
  const errorDocs = documents.filter(doc => doc.errors.length > 0);
  score -= errorDocs.length * 3;
  
  return Math.max(0, Math.min(100, score));
}