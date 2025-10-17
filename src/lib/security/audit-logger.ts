/**
 * Security Audit Logger
 * Tracks all access to confidential customer utility information
 * Required for utility compliance
 */

import { sql } from '@/lib/db';

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export enum AuditAction {
  // Data Access
  VIEW_UTILITY_DATA = 'VIEW_UTILITY_DATA',
  EXPORT_UTILITY_DATA = 'EXPORT_UTILITY_DATA',
  
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  MFA_CHALLENGE = 'MFA_CHALLENGE',
  
  // Authorization
  AUTHORIZE_UTILITY = 'AUTHORIZE_UTILITY',
  REVOKE_UTILITY = 'REVOKE_UTILITY',
  
  // Data Modification
  UPDATE_FACILITY = 'UPDATE_FACILITY',
  DELETE_FACILITY = 'DELETE_FACILITY',
  
  // Administrative
  CHANGE_USER_ROLE = 'CHANGE_USER_ROLE',
  ACCESS_ADMIN_PANEL = 'ACCESS_ADMIN_PANEL',
  
  // Security Events
  FAILED_LOGIN = 'FAILED_LOGIN',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

export class AuditLogger {
  /**
   * Log an audit event
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      await sql`
        INSERT INTO audit_logs (
          user_id,
          action,
          resource,
          resource_id,
          details,
          ip_address,
          user_agent,
          success,
          error_message,
          timestamp
        ) VALUES (
          ${entry.userId},
          ${entry.action},
          ${entry.resource},
          ${entry.resourceId || null},
          ${JSON.stringify(entry.details || {})},
          ${entry.ipAddress || null},
          ${entry.userAgent || null},
          ${entry.success},
          ${entry.errorMessage || null},
          NOW()
        )
      `;
    } catch (error) {
      // Log to console if database fails - never lose audit logs
      logger.error('api', '[AUDIT_LOG_FAILED]', {
        entry, error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Log successful data access
   */
  static async logDataAccess(
    userId: string,
    resource: string,
    resourceId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.VIEW_UTILITY_DATA,
      resource,
      resourceId,
      details,
      success: true
    });
  }

  /**
   * Log security incident
   */
  static async logSecurityIncident(
    userId: string,
    action: AuditAction,
    details: Record<string, any>,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'security',
      details,
      ipAddress,
      success: false
    });

    // For critical incidents, also alert
    if (action === AuditAction.SUSPICIOUS_ACTIVITY) {
      await this.alertSecurityTeam(userId, details);
    }
  }

  /**
   * Get audit logs for review
   */
  static async getAuditLogs(filters: {
    userId?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any[]> {
    let query = sql`
      SELECT * FROM audit_logs
      WHERE 1=1
    `;

    if (filters.userId) {
      query = sql`${query} AND user_id = ${filters.userId}`;
    }
    if (filters.action) {
      query = sql`${query} AND action = ${filters.action}`;
    }
    if (filters.startDate) {
      query = sql`${query} AND timestamp >= ${filters.startDate}`;
    }
    if (filters.endDate) {
      query = sql`${query} AND timestamp <= ${filters.endDate}`;
    }

    query = sql`${query} ORDER BY timestamp DESC`;

    if (filters.limit) {
      query = sql`${query} LIMIT ${filters.limit}`;
    }

    return await query;
  }

  /**
   * Alert security team for critical incidents
   */
  private static async alertSecurityTeam(
    userId: string,
    details: Record<string, any>
  ): Promise<void> {
    // In production, this would send to:
    // - Email to security@vibelux.com
    // - Slack security channel
    // - PagerDuty for critical alerts
    
    logger.error('api', '[SECURITY_ALERT]', {
      userId, details, timestamp: new Date().toISOString()
    });
  }

  /**
   * Check for suspicious patterns
   */
  static async checkSuspiciousActivity(userId: string): Promise<boolean> {
    // Check for multiple failed logins
    const recentFailures = await sql`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE user_id = ${userId}
      AND action = ${AuditAction.FAILED_LOGIN}
      AND timestamp > NOW() - INTERVAL '15 minutes'
    `;

    if (recentFailures[0].count > 5) {
      await this.logSecurityIncident(
        userId,
        AuditAction.SUSPICIOUS_ACTIVITY,
        { reason: 'Multiple failed login attempts', count: recentFailures[0].count }
      );
      return true;
    }

    // Check for unusual access patterns
    const unusualAccess = await sql`
      SELECT COUNT(DISTINCT ip_address) as ip_count
      FROM audit_logs
      WHERE user_id = ${userId}
      AND timestamp > NOW() - INTERVAL '1 hour'
    `;

    if (unusualAccess[0].ip_count > 5) {
      await this.logSecurityIncident(
        userId,
        AuditAction.SUSPICIOUS_ACTIVITY,
        { reason: 'Multiple IP addresses', count: unusualAccess[0].ip_count }
      );
      return true;
    }

    return false;
  }
}

// Middleware helper for API routes
export function withAuditLogging(
  handler: (req: any, res: any) => Promise<void>
) {
  return async (req: any, res: any) => {
    const startTime = Date.now();
    const originalJson = res.json;
    let responseData: any;
    const statusCode: number = 200;

    // Capture response
    res.json = function(data: any) {
      responseData = data;
      return originalJson.call(this, data);
    };

    try {
      await handler(req, res);
      
      // Log successful API access
      if (req.auth?.userId) {
        await AuditLogger.log({
          userId: req.auth.userId,
          action: AuditAction.VIEW_UTILITY_DATA,
          resource: req.url,
          details: {
            method: req.method,
            duration: Date.now() - startTime,
            statusCode
          },
          ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          success: true
        });
      }
    } catch (error) {
      // Log failed access
      if (req.auth?.userId) {
        await AuditLogger.log({
          userId: req.auth.userId,
          action: AuditAction.UNAUTHORIZED_ACCESS,
          resource: req.url,
          details: {
            method: req.method,
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      throw error;
    }
  };
}