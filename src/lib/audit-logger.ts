/**
 * Audit Logger Service
 * Tracks all security-relevant events for compliance and monitoring
 */

import { logger } from '@/lib/logging/production-logger';

// Alias for backward compatibility
export enum AuditAction {
  // Authentication events
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  
  // Authorization events
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_REMOVED = 'ROLE_REMOVED',
  
  // Data events
  DATA_ACCESSED = 'DATA_ACCESSED',
  DATA_CREATED = 'DATA_CREATED',
  DATA_UPDATED = 'DATA_UPDATED',
  DATA_DELETED = 'DATA_DELETED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  
  // Payment events
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED = 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',
  AFFILIATE_UPDATE = 'AFFILIATE_UPDATE',
  
  // Integration events
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  WEBHOOK_CONFIGURED = 'WEBHOOK_CONFIGURED',
  INTEGRATION_CONNECTED = 'INTEGRATION_CONNECTED',
  INTEGRATION_DISCONNECTED = 'INTEGRATION_DISCONNECTED',
  
  // Admin events
  CONFIG_CHANGED = 'CONFIG_CHANGED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  
  // Security events
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  SECURITY_ALERT = 'SECURITY_ALERT'
}

export enum AuditEventType {
  // Authentication events
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  
  // Authorization events
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_REMOVED = 'ROLE_REMOVED',
  
  // Data events
  DATA_ACCESSED = 'DATA_ACCESSED',
  DATA_CREATED = 'DATA_CREATED',
  DATA_UPDATED = 'DATA_UPDATED',
  DATA_DELETED = 'DATA_DELETED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  
  // Payment events
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_ISSUED = 'REFUND_ISSUED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',
  
  // Utility connection events
  UTILITY_CONNECTED = 'UTILITY_CONNECTED',
  UTILITY_DISCONNECTED = 'UTILITY_DISCONNECTED',
  UTILITY_DATA_SYNCED = 'UTILITY_DATA_SYNCED',
  UTILITY_AUTH_FAILED = 'UTILITY_AUTH_FAILED',
  
  // System events
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  SECURITY_ALERT = 'SECURITY_ALERT',
  CONFIG_CHANGED = 'CONFIG_CHANGED',
}

export enum AuditEventSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

interface AuditEventData {
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  result?: 'success' | 'failure';
  metadata?: Record<string, any>;
  errorMessage?: string;
}

class AuditLogger {
  private static instance: AuditLogger;
  private queue: AuditLogEntry[] = [];
  
  private constructor() {}
  
  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }
  
  async log(
    eventType: AuditEventType,
    severity: AuditEventSeverity,
    data: AuditEventData
  ): Promise<void> {
    const entry: AuditLogEntry = {
      eventType,
      severity,
      timestamp: new Date(),
      userId: data.userId,
      userEmail: data.userEmail,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      action: data.action,
      result: data.result,
      metadata: data.metadata,
      errorMessage: data.errorMessage,
    };
    
    // In production, write to database or external logging service
    // For now, log to console in structured format
    if (process.env.NODE_ENV === 'production') {
      logger.info('api', JSON.stringify({
        audit: true,
        ...entry
      }));
    }
    
    // Add to queue for batch processing
    this.queue.push(entry);
  }
  
  // Helper methods for common audit events
  
  async logLogin(userId: string, email: string, ipAddress: string, userAgent: string, success: boolean) {
    await this.log(
      success ? AuditEventType.USER_LOGIN : AuditEventType.LOGIN_FAILED,
      success ? AuditEventSeverity.INFO : AuditEventSeverity.WARNING,
      {
        userId: success ? userId : undefined,
        userEmail: email,
        ipAddress,
        userAgent,
        result: success ? 'success' : 'failure'
      }
    );
  }
  
  async logDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    ipAddress?: string
  ) {
    await this.log(AuditEventType.DATA_ACCESSED, AuditEventSeverity.INFO, {
      userId,
      resourceType,
      resourceId,
      action,
      ipAddress,
      result: 'success'
    });
  }
  
  async logPayment(
    userId: string,
    amount: number,
    currency: string,
    success: boolean,
    metadata?: Record<string, any>
  ) {
    await this.log(
      success ? AuditEventType.PAYMENT_PROCESSED : AuditEventType.PAYMENT_FAILED,
      success ? AuditEventSeverity.INFO : AuditEventSeverity.WARNING,
      {
        userId,
        metadata: {
          amount,
          currency,
          ...metadata
        },
        result: success ? 'success' : 'failure'
      }
    );
  }
  
  async logSecurityAlert(
    message: string,
    severity: AuditEventSeverity = AuditEventSeverity.WARNING,
    metadata?: Record<string, any>
  ) {
    await this.log(AuditEventType.SECURITY_ALERT, severity, {
      errorMessage: message,
      metadata
    });
  }
}

// Interfaces
interface AuditLogEntry {
  eventType: AuditEventType;
  severity: AuditEventSeverity;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  result?: 'success' | 'failure';
  metadata?: Record<string, any>;
  errorMessage?: string;
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

// Export convenience functions
export const audit = {
  login: (userId: string, email: string, ip: string, ua: string, success: boolean) =>
    auditLogger.logLogin(userId, email, ip, ua, success),
    
  dataAccess: (userId: string, type: string, id: string, action: string, ip?: string) =>
    auditLogger.logDataAccess(userId, type, id, action, ip),
    
  payment: (userId: string, amount: number, currency: string, success: boolean, meta?: any) =>
    auditLogger.logPayment(userId, amount, currency, success, meta),
    
  security: (message: string, severity?: AuditEventSeverity, meta?: any) =>
    auditLogger.logSecurityAlert(message, severity, meta),
    
  custom: (type: AuditEventType, severity: AuditEventSeverity, data: AuditEventData) =>
    auditLogger.log(type, severity, data)
};