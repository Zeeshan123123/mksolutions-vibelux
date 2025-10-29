/**
 * Usage Sync Cron Jobs
 * Background jobs for syncing usage data and sending reports
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
import { syncToDatabase, getCacheStats } from './real-time-tracker';
import { sendEmail } from '@/lib/email/sendgrid-service';

/**
 * Get current billing period
 */
function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Daily usage sync - runs every 5 minutes
 * Syncs in-memory cache to database
 */
export async function dailyUsageSync(): Promise<void> {
  logger.info('cron', 'Starting daily usage sync job');
  const startTime = Date.now();

  try {
    // Get cache stats before sync
    const statsBefore = getCacheStats();
    logger.info('cron', 'Cache stats before sync', statsBefore);

    // Perform sync
    await syncToDatabase();

    // Get cache stats after sync
    const statsAfter = getCacheStats();
    logger.info('cron', 'Cache stats after sync', statsAfter);

    const duration = Date.now() - startTime;
    logger.info('cron', 'Daily usage sync completed', {
      duration,
      synced: statsBefore.dirtyCount,
    });
  } catch (error) {
    logger.error('cron', 'Daily usage sync failed', { error });
    throw error;
  }
}

/**
 * Daily summary reports - runs at midnight
 * Generates usage summaries and sends digest emails
 */
export async function dailySummaryReports(): Promise<void> {
  logger.info('cron', 'Starting daily summary reports job');
  const startTime = Date.now();

  try {
    const billingPeriod = getCurrentBillingPeriod();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all users approaching limits (80%+)
    const usersApproachingLimits = await prisma.userUsageMetrics.findMany({
      where: {
        billingPeriod,
        overageStatus: {
          in: ['warning_80', 'warning_90', 'exceeded_100'],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            subscriptionTier: true,
          },
        },
      },
    });

    logger.info('cron', `Found ${usersApproachingLimits.length} users approaching limits`);

    // Send digest emails to users
    for (const userMetrics of usersApproachingLimits) {
      try {
        await sendUsageSummaryEmail(userMetrics);
      } catch (error) {
        logger.error('cron', 'Failed to send summary email', {
          error,
          userId: userMetrics.userId,
        });
      }
    }

    // Generate admin summary
    const totalUsers = await prisma.userUsageMetrics.count({
      where: { billingPeriod },
    });

    const usageByPlan = await prisma.userUsageMetrics.groupBy({
      by: ['planTier', 'overageStatus'],
      where: { billingPeriod },
      _count: true,
    });

    const adminSummary = {
      date: today,
      totalUsers,
      usersApproachingLimits: usersApproachingLimits.length,
      usageByPlan,
    };

    // Send admin summary email
    await sendAdminSummaryEmail(adminSummary);

    const duration = Date.now() - startTime;
    logger.info('cron', 'Daily summary reports completed', {
      duration,
      emailsSent: usersApproachingLimits.length + 1,
    });
  } catch (error) {
    logger.error('cron', 'Daily summary reports failed', { error });
    throw error;
  }
}

/**
 * Check unsynced usage - runs hourly
 * Finds UsageRecords not reflected in rollups and reconciles
 */
export async function checkUnsyncedUsage(): Promise<void> {
  logger.info('cron', 'Starting check unsynced usage job');
  const startTime = Date.now();

  try {
    const billingPeriod = getCurrentBillingPeriod();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Get all users with recent usage records
    const recentRecords = await prisma.usageRecord.findMany({
      where: {
        timestamp: {
          gte: oneHourAgo,
        },
        billingMonth: billingPeriod,
      },
      select: {
        userId: true,
        eventType: true,
      },
    });

    // Group by user and event type
    const usageCounts: Record<string, Record<string, number>> = {};
    for (const record of recentRecords) {
      if (!usageCounts[record.userId]) {
        usageCounts[record.userId] = {};
      }
      if (!usageCounts[record.userId][record.eventType]) {
        usageCounts[record.userId][record.eventType] = 0;
      }
      usageCounts[record.userId][record.eventType]++;
    }

    let discrepanciesFound = 0;
    let discrepanciesFixed = 0;

    // Check each user's metrics
    for (const [userId, eventCounts] of Object.entries(usageCounts)) {
      const metrics = await prisma.userUsageMetrics.findUnique({
        where: {
          userId_billingPeriod: {
            userId,
            billingPeriod,
          },
        },
      });

      if (!metrics) {
        logger.warn('cron', 'User metrics not found, creating', { userId });
        // Metrics will be created on next sync
        continue;
      }

      // Recount from UsageRecord table
      const actualCounts = await prisma.usageRecord.groupBy({
        by: ['eventType'],
        where: {
          userId,
          billingMonth: billingPeriod,
        },
        _count: true,
      });

      const actualMetrics: Record<string, number> = {};
      for (const count of actualCounts) {
        actualMetrics[count.eventType] = count._count;
      }

      // Check for discrepancies
      const eventTypes = [
        'apiCalls',
        'aiQueries',
        'exports',
        'roomsCreated',
        'fixturesAdded',
        'designsCreated',
        'mlPredictions',
        'facilityDashboards',
      ];

      let hasDiscrepancy = false;
      const updates: Record<string, number> = {};

      for (const eventType of eventTypes) {
        const metricValue = metrics[eventType as keyof typeof metrics] as number;
        const actualValue = actualMetrics[eventType] || 0;

        if (metricValue !== actualValue) {
          hasDiscrepancy = true;
          updates[eventType] = actualValue;
          logger.warn('cron', 'Usage discrepancy found', {
            userId,
            eventType,
            metricValue,
            actualValue,
            difference: actualValue - metricValue,
          });
        }
      }

      if (hasDiscrepancy) {
        discrepanciesFound++;

        // Fix discrepancy
        try {
          await prisma.userUsageMetrics.update({
            where: {
              userId_billingPeriod: {
                userId,
                billingPeriod,
              },
            },
            data: {
              ...updates,
              lastSyncedAt: new Date(),
            },
          });
          discrepanciesFixed++;
          logger.info('cron', 'Fixed usage discrepancy', { userId, updates });
        } catch (error) {
          logger.error('cron', 'Failed to fix discrepancy', { error, userId });
        }
      }
    }

    const duration = Date.now() - startTime;
    logger.info('cron', 'Check unsynced usage completed', {
      duration,
      recordsChecked: recentRecords.length,
      discrepanciesFound,
      discrepanciesFixed,
    });

    // Alert if too many discrepancies
    if (discrepanciesFound > 10) {
      logger.error('cron', 'High number of usage discrepancies detected', {
        count: discrepanciesFound,
      });
      // TODO: Send alert to admins
    }
  } catch (error) {
    logger.error('cron', 'Check unsynced usage failed', { error });
    throw error;
  }
}

/**
 * Send usage summary email to user
 */
async function sendUsageSummaryEmail(userMetrics: any): Promise<void> {
  const user = userMetrics.user;
  const metrics = userMetrics;

  const totalUsage =
    metrics.apiCalls +
    metrics.aiQueries +
    metrics.exports +
    metrics.roomsCreated +
    metrics.fixturesAdded +
    metrics.designsCreated +
    metrics.mlPredictions +
    metrics.facilityDashboards;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your VibeLux Usage Summary</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">VibeLux Usage Summary</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your monthly usage overview</p>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #333; margin-top: 0;">Hi ${user.name || 'there'},</h2>
    
    <p>Here's your usage summary for the current billing period:</p>
    
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #667eea;">Plan: ${metrics.planTier.toUpperCase()}</h3>
      <div style="margin: 10px 0;">
        <strong>API Calls:</strong> ${metrics.apiCalls.toLocaleString()}<br>
        <strong>AI Queries:</strong> ${metrics.aiQueries.toLocaleString()}<br>
        <strong>Exports:</strong> ${metrics.exports.toLocaleString()}<br>
        <strong>Designs Created:</strong> ${metrics.designsCreated.toLocaleString()}<br>
        <strong>Rooms Created:</strong> ${metrics.roomsCreated.toLocaleString()}<br>
        <strong>Fixtures Added:</strong> ${metrics.fixturesAdded.toLocaleString()}<br>
        <strong>ML Predictions:</strong> ${metrics.mlPredictions.toLocaleString()}<br>
        <strong>Facility Dashboards:</strong> ${metrics.facilityDashboards.toLocaleString()}<br>
      </div>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
        <strong>Total Actions:</strong> ${totalUsage.toLocaleString()}
      </div>
    </div>
    
    ${
      metrics.overageStatus !== 'ok'
        ? `
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <strong style="color: #dc2626;">⚠️ Approaching or Exceeded Limits</strong>
      <p style="margin: 10px 0 0 0; color: #7f1d1d;">Some of your usage metrics are approaching or have exceeded your plan limits. Consider upgrading to avoid service interruptions.</p>
    </div>
    `
        : ''
    }
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.app'}/settings/billing" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Full Usage Report</a>
    </div>
    
    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
      This is an automated summary email. For questions, please contact support.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
    © ${new Date().getFullYear()} VibeLux. All rights reserved.
  </div>
</body>
</html>
`;

  const text = `
VibeLux Usage Summary

Hi ${user.name || 'there'},

Here's your usage summary for the current billing period:

Plan: ${metrics.planTier.toUpperCase()}

API Calls: ${metrics.apiCalls.toLocaleString()}
AI Queries: ${metrics.aiQueries.toLocaleString()}
Exports: ${metrics.exports.toLocaleString()}
Designs Created: ${metrics.designsCreated.toLocaleString()}
Rooms Created: ${metrics.roomsCreated.toLocaleString()}
Fixtures Added: ${metrics.fixturesAdded.toLocaleString()}
ML Predictions: ${metrics.mlPredictions.toLocaleString()}
Facility Dashboards: ${metrics.facilityDashboards.toLocaleString()}

Total Actions: ${totalUsage.toLocaleString()}

${
  metrics.overageStatus !== 'ok'
    ? 'WARNING: Some of your usage metrics are approaching or have exceeded your plan limits. Consider upgrading to avoid service interruptions.\n\n'
    : ''
}

View full usage report: ${process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.app'}/settings/billing

© ${new Date().getFullYear()} VibeLux
`;

  await sendEmail({
    to: user.email,
    subject: 'Your VibeLux Usage Summary',
    html,
    text,
    categories: ['usage-summary', 'billing'],
  });
}

/**
 * Send admin summary email
 */
async function sendAdminSummaryEmail(summary: any): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vibelux.app';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Platform Usage Summary</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Platform Usage Summary</h1>
  <p><strong>Date:</strong> ${summary.date.toLocaleDateString()}</p>
  
  <h2>Overview</h2>
  <ul>
    <li><strong>Total Users:</strong> ${summary.totalUsers.toLocaleString()}</li>
    <li><strong>Users Approaching Limits:</strong> ${summary.usersApproachingLimits.toLocaleString()}</li>
  </ul>
  
  <h2>Usage by Plan</h2>
  <table style="border-collapse: collapse; width: 100%;">
    <tr style="background-color: #f3f4f6;">
      <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Plan</th>
      <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Status</th>
      <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Count</th>
    </tr>
    ${summary.usageByPlan
      .map(
        (plan: any) => `
    <tr>
      <td style="border: 1px solid #e5e7eb; padding: 8px;">${plan.planTier}</td>
      <td style="border: 1px solid #e5e7eb; padding: 8px;">${plan.overageStatus}</td>
      <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${plan._count}</td>
    </tr>
    `
      )
      .join('')}
  </table>
  
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
    This is an automated admin summary report.
  </p>
</body>
</html>
`;

  await sendEmail({
    to: adminEmail,
    subject: `Platform Usage Summary - ${summary.date.toLocaleDateString()}`,
    html,
    categories: ['admin', 'usage-summary'],
  });
}

