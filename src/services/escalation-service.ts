// Escalation Service for Alert Management
// Handles unacknowledged AlertLog entries and escalates to appropriate personnel

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logging/production-logger';
import { getNotificationService } from '@/lib/notifications/notification-service';
import { EventEmitter } from 'events';

export interface EscalationLevel {
  level: number;
  delayMinutes: number;
}

export interface EscalationConfig {
  enabled: boolean;
  levels: {
    CRITICAL: number[];  // [10, 20] = escalate at 10 min, then 20 min
    HIGH: number[];      // [15, 30]
    MEDIUM: number[];    // [30, 60]
    LOW: number[];       // [60]
  };
  recipients?: string[]; // User IDs to notify
}

export interface ResponseTimeStats {
  alertId: string;
  createdAt: Date;
  acknowledgedAt: Date;
  responseTimeMinutes: number;
}

const DEFAULT_ESCALATION_CONFIG: EscalationConfig = {
  enabled: true,
  levels: {
    CRITICAL: [10, 20],
    HIGH: [15, 30],
    MEDIUM: [30, 60],
    LOW: [60]
  }
};

export class EscalationService extends EventEmitter {
  private static instance: EscalationService;

  private constructor() {
    super();
  }

  static getInstance(): EscalationService {
    if (!EscalationService.instance) {
      EscalationService.instance = new EscalationService();
    }
    return EscalationService.instance;
  }

  /**
   * Check for unacknowledged alerts and escalate if necessary
   */
  async checkUnacknowledgedAlerts(): Promise<void> {
    try {
      logger.info('escalation', 'Starting unacknowledged alert check');

      // Get all active, unacknowledged alerts
      const alerts = await prisma.alertLog.findMany({
        where: {
          status: 'ACTIVE',
          acknowledgedAt: null
        },
        include: {
          facility: true,
          sensor: true,
          alertConfig: true
        }
      });

      logger.info('escalation', `Found ${alerts.length} unacknowledged alerts`);

      for (const alert of alerts) {
        await this.processAlertEscalation(alert);
      }

      this.emit('escalation:check:complete', { alertsChecked: alerts.length });
    } catch (error) {
      logger.error('escalation', 'Error checking unacknowledged alerts', error as Error);
      this.emit('escalation:check:error', error);
    }
  }

  /**
   * Process escalation for a single alert
   */
  private async processAlertEscalation(alert: any): Promise<void> {
    const facilityId = alert.facilityId;
    if (!facilityId) {
      logger.warn('escalation', `Alert ${alert.id} has no associated facility`);
      return;
    }

    // Get escalation configuration for the facility
    const escalationConfig = await this.getEscalationConfig(facilityId);
    
    if (!escalationConfig.enabled) {
      return;
    }

    // Check if alert should be escalated
    const shouldEscalate = this.shouldEscalate(alert, escalationConfig);
    
    if (shouldEscalate.escalate) {
      await this.escalateAlert(alert, shouldEscalate.level!, escalationConfig);
    }
  }

  /**
   * Check if alert should be escalated based on age and severity
   */
  shouldEscalate(alert: any, config: EscalationConfig): { escalate: boolean; level?: number } {
    const alertAgeMinutes = this.calculateAlertAge(alert.createdAt);
    const escalationLevels = config.levels[alert.severity as keyof typeof config.levels];

    if (!escalationLevels || escalationLevels.length === 0) {
      return { escalate: false };
    }

    // Get current escalations from metadata
    const metadata = alert.metadata || {};
    const escalations = metadata.escalations || [];

    // Find the next escalation level
    for (let i = 0; i < escalationLevels.length; i++) {
      const levelThreshold = escalationLevels[i];
      
      // Check if already escalated at this level
      const alreadyEscalated = escalations.some((e: any) => e.level === i + 1);
      
      if (!alreadyEscalated && alertAgeMinutes >= levelThreshold) {
        return { escalate: true, level: i + 1 };
      }
    }

    return { escalate: false };
  }

  /**
   * Escalate an alert to the specified level
   */
  async escalateAlert(alert: any, level: number, config: EscalationConfig): Promise<void> {
    try {
      logger.info('escalation', `Escalating alert ${alert.id} to level ${level}`);

      // Get escalation recipients
      const recipients = await this.getEscalationRecipients(alert.facilityId, config);

      if (recipients.length === 0) {
        logger.warn('escalation', `No recipients found for facility ${alert.facilityId}`);
        return;
      }

      // Update alert metadata with escalation info
      const metadata = alert.metadata || {};
      const escalations = metadata.escalations || [];
      escalations.push({
        level,
        escalatedAt: new Date().toISOString(),
        recipientCount: recipients.length
      });

      await prisma.alertLog.update({
        where: { id: alert.id },
        data: {
          metadata: {
            ...metadata,
            escalations
          }
        }
      });

      // Send notifications to all recipients
      const notificationService = getNotificationService();
      
      for (const recipient of recipients) {
        await notificationService.sendAlert(
          {
            id: alert.id,
            type: 'critical',
            severity: alert.severity.toLowerCase(),
            title: `ESCALATION (Level ${level}): ${alert.alertType.replace(/_/g, ' ')}`,
            message: `${alert.message}\n\nThis alert has been unacknowledged for ${this.calculateAlertAge(alert.createdAt)} minutes.\n\nSensor: ${alert.sensorName}\nLocation: ${alert.location}\nValue: ${alert.triggeredValue} ${alert.unit}`,
            source: alert.sensorName || 'Unknown Sensor',
            projectId: alert.facilityId,
            sensorId: alert.sensorId,
            value: alert.triggeredValue,
            threshold: alert.thresholdValue,
            timestamp: alert.createdAt,
            metadata: {
              escalationLevel: level,
              originalAlertTime: alert.createdAt,
              alertLogId: alert.id
            }
          },
          [recipient.id]
        );
      }

      logger.info('escalation', `Alert ${alert.id} escalated to ${recipients.length} recipients at level ${level}`);
      this.emit('alert:escalated', { 
        alertId: alert.id, 
        level, 
        recipients: recipients.length,
        facilityId: alert.facilityId
      });

    } catch (error) {
      logger.error('escalation', `Error escalating alert ${alert.id}`, error as Error);
      throw error;
    }
  }

  /**
   * Get escalation configuration for a facility
   */
  async getEscalationConfig(facilityId: string): Promise<EscalationConfig> {
    try {
      const facility = await prisma.facility.findUnique({
        where: { id: facilityId },
        select: { settings: true }
      });

      if (facility?.settings && typeof facility.settings === 'object') {
        const settings = facility.settings as any;
        if (settings.alertEscalation) {
          return settings.alertEscalation as EscalationConfig;
        }
      }

      return DEFAULT_ESCALATION_CONFIG;
    } catch (error) {
      logger.error('escalation', 'Error getting escalation config', error as Error);
      return DEFAULT_ESCALATION_CONFIG;
    }
  }

  /**
   * Get escalation recipients based on facility and config
   */
  async getEscalationRecipients(facilityId: string, config: EscalationConfig): Promise<any[]> {
    try {
      // If specific recipients are configured, use them
      if (config.recipients && config.recipients.length > 0) {
        const users = await prisma.user.findMany({
          where: {
            id: { in: config.recipients }
          }
        });
        return users;
      }

      // Otherwise, get all facility users with MANAGER or higher role
      const facilityUsers = await prisma.facilityUser.findMany({
        where: {
          facilityId,
          role: { in: ['MANAGER', 'ADMIN', 'OWNER'] }
        },
        include: {
          user: true
        }
      });

      return facilityUsers.map(fu => fu.user);
    } catch (error) {
      logger.error('escalation', 'Error getting escalation recipients', error as Error);
      return [];
    }
  }

  /**
   * Calculate response time for an alert
   */
  calculateResponseTime(alert: any): ResponseTimeStats | null {
    if (!alert.acknowledgedAt) {
      return null;
    }

    const responseTimeMs = new Date(alert.acknowledgedAt).getTime() - new Date(alert.createdAt).getTime();
    const responseTimeMinutes = Math.round(responseTimeMs / 60000);

    return {
      alertId: alert.id,
      createdAt: alert.createdAt,
      acknowledgedAt: alert.acknowledgedAt,
      responseTimeMinutes
    };
  }

  /**
   * Calculate alert age in minutes
   */
  private calculateAlertAge(createdAt: Date): number {
    const now = new Date();
    const ageMs = now.getTime() - new Date(createdAt).getTime();
    return Math.floor(ageMs / 60000);
  }

  /**
   * Get escalation statistics
   */
  async getEscalationStats(facilityId?: string): Promise<any> {
    try {
      const where: any = {};
      if (facilityId) {
        where.facilityId = facilityId;
      }

      // Get alerts with escalations in metadata
      const alerts = await prisma.alertLog.findMany({
        where: {
          ...where,
          metadata: {
            path: ['escalations'],
            not: null
          }
        },
        select: {
          metadata: true
        }
      });

      let totalEscalations = 0;
      let level1Count = 0;
      let level2Count = 0;
      let avgLevel = 0;

      alerts.forEach(alert => {
        const escalations = (alert.metadata as any)?.escalations || [];
        totalEscalations += escalations.length;
        
        escalations.forEach((esc: any) => {
          if (esc.level === 1) level1Count++;
          if (esc.level === 2) level2Count++;
          avgLevel += esc.level;
        });
      });

      return {
        totalEscalations,
        level1Escalations: level1Count,
        level2Escalations: level2Count,
        averageEscalationLevel: totalEscalations > 0 ? avgLevel / totalEscalations : 0
      };
    } catch (error) {
      logger.error('escalation', 'Error getting escalation stats', error as Error);
      return null;
    }
  }
}

// Export singleton instance
export const escalationService = EscalationService.getInstance();

