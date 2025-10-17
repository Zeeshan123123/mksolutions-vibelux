import { db } from '@/lib/db';

export interface DocumentAccess {
  id: string;
  userId: string;
  userEmail: string;
  documentPath: string;
  documentTitle: string;
  accessLevel: 'public' | 'authenticated' | 'premium' | 'enterprise' | 'internal';
  accessType: 'view' | 'download' | 'print' | 'copy';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  sessionId?: string;
  referrer?: string;
}

export interface DocumentWatermark {
  userId: string;
  userEmail: string;
  timestamp: Date;
  documentId: string;
}

export class DocumentTracker {
  
  /**
   * Track document access with detailed logging
   */
  static async trackAccess(params: {
    userId: string;
    userEmail: string;
    documentPath: string;
    documentTitle: string;
    accessLevel: DocumentAccess['accessLevel'];
    accessType: DocumentAccess['accessType'];
    ipAddress: string;
    userAgent: string;
    sessionId?: string;
    referrer?: string;
  }): Promise<void> {
    try {
      const accessRecord: Omit<DocumentAccess, 'id'> = {
        ...params,
        timestamp: new Date(),
      };

      // Log to database
      await db.documentAccess.create({
        data: accessRecord
      });

      // Log high-risk access to security monitoring
      if (params.accessLevel === 'enterprise' || params.accessLevel === 'internal') {
        await this.logSecurityEvent({
          type: 'HIGH_RISK_DOC_ACCESS',
          userId: params.userId,
          details: {
            document: params.documentPath,
            accessLevel: params.accessLevel,
            ipAddress: params.ipAddress
          }
        });
      }

      // Track download attempts
      if (params.accessType === 'download') {
        await this.alertOnSensitiveDownload(params);
      }

    } catch (error) {
      console.error('Failed to track document access:', error);
      // Don't block user access if tracking fails
    }
  }

  /**
   * Generate watermark data for document
   */
  static generateWatermark(params: {
    userId: string;
    userEmail: string;
    documentId: string;
  }): DocumentWatermark {
    return {
      ...params,
      timestamp: new Date(),
    };
  }

  /**
   * Get watermark text for display
   */
  static getWatermarkText(watermark: DocumentWatermark): string {
    const date = watermark.timestamp.toISOString().split('T')[0];
    const time = watermark.timestamp.toTimeString().split(' ')[0];
    
    return `CONFIDENTIAL - ${watermark.userEmail} - ${date} ${time} - Doc ID: ${watermark.documentId}`;
  }

  /**
   * Check if user has access to document level
   */
  static async checkDocumentAccess(
    userId: string, 
    subscriptionTier: string, 
    accessLevel: DocumentAccess['accessLevel']
  ): Promise<boolean> {
    const accessMatrix = {
      public: ['free', 'starter', 'professional', 'business', 'enterprise'],
      authenticated: ['starter', 'professional', 'business', 'enterprise'],
      premium: ['professional', 'business', 'enterprise'],
      enterprise: ['enterprise'],
      internal: [] // Only for staff
    };

    // Check if subscription tier allows access
    const allowedTiers = accessMatrix[accessLevel] || [];
    if (!allowedTiers.includes(subscriptionTier)) {
      await this.logAccessDenied(userId, accessLevel, subscriptionTier);
      return false;
    }

    return true;
  }

  /**
   * DEPRECATED: Use getUserOwnAccessHistory instead for privacy compliance
   */

  /**
   * Get document access analytics (ADMIN ONLY - aggregated data without customer details)
   */
  static async getDocumentAnalytics(documentPath: string, requestingUserId: string, userRole: string) {
    // Only admins can see aggregated analytics
    if (userRole !== 'admin' && userRole !== 'staff') {
      throw new Error('Unauthorized: Insufficient privileges for analytics access');
    }

    const totalAccess = await db.documentAccess.count({
      where: { documentPath }
    });

    const uniqueUsers = await db.documentAccess.groupBy({
      by: ['userId'],
      where: { documentPath },
      _count: true
    });

    const accessByType = await db.documentAccess.groupBy({
      by: ['accessType'],
      where: { documentPath },
      _count: true
    });

    // NO customer identifying information - only aggregated stats
    return {
      totalAccess,
      uniqueUsers: uniqueUsers.length,
      accessByType: accessByType.map(item => ({
        type: item.accessType,
        count: item._count
      })),
      // Remove any customer-identifying data
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get user's OWN document access history (user can only see their own data)
   */
  static async getUserOwnAccessHistory(
    requestingUserId: string,
    targetUserId: string,
    limit: number = 50
  ): Promise<DocumentAccess[]> {
    // Users can ONLY see their own access history
    if (requestingUserId !== targetUserId) {
      throw new Error('Unauthorized: Users can only access their own document history');
    }

    return await db.documentAccess.findMany({
      where: { userId: targetUserId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        documentPath: true,
        documentTitle: true,
        accessType: true,
        timestamp: true,
        // Remove other users' identifying information
        userId: true,
        userEmail: true,
        accessLevel: true,
        // IP and user agent for user's own security awareness
        ipAddress: true,
        userAgent: true
      }
    });
  }

  /**
   * Alert on sensitive document downloads
   */
  private static async alertOnSensitiveDownload(params: {
    userId: string;
    userEmail: string;
    documentPath: string;
    accessLevel: DocumentAccess['accessLevel'];
    ipAddress: string;
  }): Promise<void> {
    if (params.accessLevel === 'enterprise' || params.accessLevel === 'internal') {
      // Send real-time alert to security team
      await this.sendSecurityAlert({
        type: 'SENSITIVE_DOCUMENT_DOWNLOAD',
        message: `User ${params.userEmail} downloaded ${params.accessLevel} document: ${params.documentPath}`,
        metadata: {
          userId: params.userId,
          documentPath: params.documentPath,
          ipAddress: params.ipAddress,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Log access denied attempts
   */
  private static async logAccessDenied(
    userId: string, 
    requestedLevel: DocumentAccess['accessLevel'],
    userTier: string
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'DOC_ACCESS_DENIED',
      userId,
      details: {
        requestedLevel,
        userTier,
        reason: 'insufficient_subscription_tier'
      }
    });
  }

  /**
   * Log security events
   */
  private static async logSecurityEvent(event: {
    type: string;
    userId: string;
    details: any;
  }): Promise<void> {
    await db.securityEvent.create({
      data: {
        type: event.type,
        userId: event.userId,
        details: event.details,
        timestamp: new Date()
      }
    });
  }

  /**
   * Send security alerts
   */
  private static async sendSecurityAlert(alert: {
    type: string;
    message: string;
    metadata: any;
  }): Promise<void> {
    // Integration with your notification system
    console.log('SECURITY ALERT:', alert);
    
    // Could integrate with:
    // - Slack notifications
    // - Email alerts to security team
    // - SMS alerts for critical events
    // - Security incident management system
  }

  /**
   * Cleanup old access logs (run periodically)
   */
  static async cleanupOldLogs(retentionDays: number = 365): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    await db.documentAccess.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });
  }
}

/**
 * Middleware for document access tracking
 */
export function withDocumentTracking<T extends any[]>(
  documentPath: string,
  documentTitle: string,
  accessLevel: DocumentAccess['accessLevel']
) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: T) {
      // Extract request info (adapt based on your framework)
      const req = args[0]; // Assuming first arg is request
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      if (userId && userEmail) {
        await DocumentTracker.trackAccess({
          userId,
          userEmail,
          documentPath,
          documentTitle,
          accessLevel,
          accessType: 'view',
          ipAddress,
          userAgent,
          sessionId: req.sessionID,
          referrer: req.headers.referer
        });
      }

      return method.apply(this, args);
    };
  };
}