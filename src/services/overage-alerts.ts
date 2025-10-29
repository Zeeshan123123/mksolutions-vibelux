/**
 * Usage Overage Alert System
 * Manages email alerts for usage threshold violations with 24-hour cooldown
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
import { sendEmail } from '@/lib/email/sendgrid-service';
import { UsageEventType } from './real-time-tracker';

export type AlertType = 'warning_80' | 'warning_90' | 'exceeded_100';

export interface OverageAlertParams {
  userId: string;
  alertType: AlertType;
  eventType: UsageEventType;
  currentUsage: number;
  limit: number;
  percentage: number;
  planTier: string;
}

/**
 * Check if an alert is in cooldown period
 */
async function isInCooldown(
  userId: string,
  alertType: AlertType,
  billingPeriod: string
): Promise<boolean> {
  try {
    const existingAlert = await prisma.usageOverageAlert.findFirst({
      where: {
        userId,
        alertType,
        billingPeriod,
        cooldownUntil: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return !!existingAlert;
  } catch (error) {
    logger.error('api', 'Failed to check alert cooldown', { error, userId, alertType });
    return false; // On error, allow alert
  }
}

/**
 * Get user email and name
 */
async function getUserInfo(userId: string): Promise<{ email: string; name: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  return {
    email: user.email,
    name: user.name || 'User',
  };
}

/**
 * Get billing period in YYYY-MM format
 */
function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Format event type for display
 */
function formatEventType(eventType: UsageEventType): string {
  const labels: Record<UsageEventType, string> = {
    apiCalls: 'API Calls',
    aiQueries: 'AI Queries',
    exports: 'Exports',
    roomsCreated: 'Rooms Created',
    fixturesAdded: 'Fixtures Added',
    designsCreated: 'Designs Created',
    mlPredictions: 'ML Predictions',
    facilityDashboards: 'Facility Dashboards',
  };
  return labels[eventType] || eventType;
}

/**
 * Get alert template and subject based on alert type
 */
function getAlertEmailContent(params: OverageAlertParams): {
  subject: string;
  html: string;
  text: string;
} {
  const { alertType, eventType, currentUsage, limit, percentage, planTier } = params;
  const eventLabel = formatEventType(eventType);
  const percentageRounded = Math.round(percentage);

  let subject: string;
  let title: string;
  let message: string;
  let ctaText: string;
  let urgency: string;

  switch (alertType) {
    case 'warning_80':
      subject = `Usage Alert: ${percentageRounded}% of your ${eventLabel} limit reached`;
      title = '⚠️ Usage Warning: 80% Limit Reached';
      message = `You've used ${currentUsage} of your ${limit} ${eventLabel} for this billing period (${percentageRounded}%).`;
      ctaText = 'View Usage Dashboard';
      urgency = 'warning';
      break;

    case 'warning_90':
      subject = `⚠️ Urgent: ${percentageRounded}% of your ${eventLabel} limit reached`;
      title = '⚠️ Critical Usage Warning: 90% Limit Reached';
      message = `You've used ${currentUsage} of your ${limit} ${eventLabel} for this billing period (${percentageRounded}%). You're approaching your limit!`;
      ctaText = 'Upgrade Your Plan';
      urgency = 'critical';
      break;

    case 'exceeded_100':
      subject = `🚨 Limit Exceeded: ${eventLabel} usage over ${limit}`;
      title = '🚨 Usage Limit Exceeded';
      message = `You've exceeded your ${eventLabel} limit! You've used ${currentUsage} of your ${limit} allowed for this billing period. Your service will continue with a grace period, but please upgrade to avoid any disruption.`;
      ctaText = 'Upgrade Now';
      urgency = 'critical';
      break;

    default:
      subject = `Usage Alert: ${eventLabel}`;
      title = 'Usage Alert';
      message = `Your ${eventLabel} usage is ${currentUsage} of ${limit}.`;
      ctaText = 'View Dashboard';
      urgency = 'info';
  }

  const upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.app'}/settings/billing`;
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.app'}/admin/billing`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
      color: ${urgency === 'critical' ? '#dc2626' : urgency === 'warning' ? '#ea580c' : '#333'};
    }
    .message {
      font-size: 16px;
      margin-bottom: 20px;
      color: #555;
    }
    .stats {
      background-color: #f9fafb;
      border-left: 4px solid ${urgency === 'critical' ? '#dc2626' : urgency === 'warning' ? '#ea580c' : '#3b82f6'};
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .stat-label {
      font-weight: 600;
      color: #666;
    }
    .stat-value {
      color: #333;
      font-weight: 700;
    }
    .progress-bar {
      width: 100%;
      height: 24px;
      background-color: #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      margin: 15px 0;
    }
    .progress-fill {
      height: 100%;
      background: ${urgency === 'critical' ? 'linear-gradient(90deg, #dc2626, #ef4444)' : urgency === 'warning' ? 'linear-gradient(90deg, #ea580c, #f97316)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)'};
      width: ${Math.min(percentage, 100)}%;
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
    .plan-tier {
      display: inline-block;
      background-color: #f3f4f6;
      color: #374151;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">${title}</div>
      <div class="plan-tier">Plan: ${planTier}</div>
    </div>
    
    <div class="message">
      ${message}
    </div>
    
    <div class="stats">
      <div class="stat-row">
        <span class="stat-label">Metric:</span>
        <span class="stat-value">${eventLabel}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Current Usage:</span>
        <span class="stat-value">${currentUsage.toLocaleString()}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Plan Limit:</span>
        <span class="stat-value">${limit.toLocaleString()}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Usage Percentage:</span>
        <span class="stat-value">${percentageRounded}%</span>
      </div>
      
      <div class="progress-bar">
        <div class="progress-fill">${percentageRounded}%</div>
      </div>
    </div>
    
    <div style="text-align: center;">
      <a href="${upgradeUrl}" class="cta-button">${ctaText}</a>
    </div>
    
    <div class="message" style="margin-top: 20px; font-size: 14px;">
      ${alertType === 'exceeded_100' 
        ? 'Your service will continue without interruption during the grace period, but we recommend upgrading your plan to ensure uninterrupted access.'
        : 'Consider upgrading your plan to get more capacity and advanced features.'
      }
    </div>
    
    <div class="footer">
      <p>View detailed usage statistics in your <a href="${dashboardUrl}" style="color: #667eea;">billing dashboard</a>.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p style="margin-top: 10px;">© ${new Date().getFullYear()} VibeLux. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  const text = `
${title}

${message}

Metric: ${eventLabel}
Current Usage: ${currentUsage.toLocaleString()}
Plan Limit: ${limit.toLocaleString()}
Usage Percentage: ${percentageRounded}%
Plan Tier: ${planTier}

${ctaText}: ${upgradeUrl}

View your usage dashboard: ${dashboardUrl}

© ${new Date().getFullYear()} VibeLux
`;

  return { subject, html, text };
}

/**
 * Send overage alert email to user
 */
export async function sendOverageAlert(params: OverageAlertParams): Promise<boolean> {
  const { userId, alertType, eventType, currentUsage, limit, percentage, planTier } = params;
  const billingPeriod = getCurrentBillingPeriod();

  try {
    // Check if alert is in cooldown
    const inCooldown = await isInCooldown(userId, alertType, billingPeriod);
    if (inCooldown) {
      logger.info('api', 'Alert in cooldown, skipping', {
        userId,
        alertType,
        eventType,
      });
      return false;
    }

    // Get user information
    const userInfo = await getUserInfo(userId);

    // Generate email content
    const emailContent = getAlertEmailContent(params);

    // Send email
    const emailResult = await sendEmail({
      to: userInfo.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      categories: ['usage-alert', alertType, eventType],
    });

    // Record the alert with 24-hour cooldown
    const cooldownUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.usageOverageAlert.create({
      data: {
        userId,
        alertType,
        eventType,
        currentUsage,
        limit,
        percentage,
        billingPeriod,
        sent: true,
        sentAt: new Date(),
        emailId: emailResult.messageId || null,
        cooldownUntil,
      },
    });

    logger.info('api', 'Overage alert sent successfully', {
      userId,
      alertType,
      eventType,
      email: userInfo.email,
      cooldownUntil,
    });

    return true;
  } catch (error) {
    logger.error('api', 'Failed to send overage alert', {
      error,
      userId,
      alertType,
      eventType,
    });

    // Record failed alert attempt
    try {
      await prisma.usageOverageAlert.create({
        data: {
          userId,
          alertType,
          eventType,
          currentUsage,
          limit,
          percentage,
          billingPeriod,
          sent: false,
          sentAt: null,
        },
      });
    } catch (dbError) {
      logger.error('api', 'Failed to record failed alert', { dbError });
    }

    return false;
  }
}

/**
 * Trigger alert based on overage check result
 */
export async function triggerAlertIfNeeded(
  userId: string,
  eventType: UsageEventType,
  overageCheck: {
    threshold?: AlertType;
    currentUsage: number;
    limit: number;
    percentage: number;
    planTier: string;
  }
): Promise<void> {
  if (!overageCheck.threshold) {
    return; // No threshold crossed
  }

  await sendOverageAlert({
    userId,
    alertType: overageCheck.threshold,
    eventType,
    currentUsage: overageCheck.currentUsage,
    limit: overageCheck.limit,
    percentage: overageCheck.percentage,
    planTier: overageCheck.planTier,
  });
}

/**
 * Get alert history for a user
 */
export async function getAlertHistory(
  userId: string,
  options: {
    billingPeriod?: string;
    limit?: number;
  } = {}
): Promise<any[]> {
  const { billingPeriod, limit = 50 } = options;

  try {
    const where: any = { userId };
    if (billingPeriod) {
      where.billingPeriod = billingPeriod;
    }

    const alerts = await prisma.usageOverageAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return alerts;
  } catch (error) {
    logger.error('api', 'Failed to get alert history', { error, userId });
    return [];
  }
}

/**
 * Clear cooldown for a specific alert (admin function)
 */
export async function clearAlertCooldown(
  userId: string,
  alertType: AlertType,
  billingPeriod: string
): Promise<void> {
  try {
    await prisma.usageOverageAlert.updateMany({
      where: {
        userId,
        alertType,
        billingPeriod,
      },
      data: {
        cooldownUntil: new Date(0), // Set to past date
      },
    });

    logger.info('api', 'Alert cooldown cleared', { userId, alertType, billingPeriod });
  } catch (error) {
    logger.error('api', 'Failed to clear alert cooldown', { error, userId, alertType });
    throw error;
  }
}

