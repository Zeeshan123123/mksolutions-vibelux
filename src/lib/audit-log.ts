/**
 * Simple audit logging service
 * Logs important security events for SOC 2 compliance preparation
 */

export type AuditEventType = 
  | 'user.login'
  | 'user.logout'
  | 'user.failed_login'
  | 'data.access'
  | 'data.create'
  | 'data.update'
  | 'data.delete'
  | 'settings.change'
  | 'api.access'
  | 'permission.change';

export interface AuditLogEntry {
  id?: string;
  timestamp: Date;
  userId: string | null;
  userEmail: string | null;
  eventType: AuditEventType;
  resource?: string;
  resourceId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  success: boolean;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];

  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const logEntry: AuditLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    // In production, this would write to a database
    // For now, we'll store in memory and console log
    this.logs.push(logEntry);
    
    if (process.env.NODE_ENV === 'development') {
      logger.info('api', '[AUDIT]', { data: {
        type: logEntry.eventType, user: logEntry.userEmail || logEntry.userId || 'anonymous', action: logEntry.action, success: logEntry.success, details: logEntry.details, } });
    }

    // TODO: In production, send to database or log aggregation service
    // await db.auditLogs.create({ data: logEntry });
  }

  // Helper methods for common events
  async logLogin(userId: string, email: string, ipAddress?: string, success: boolean = true): Promise<void> {
    await this.log({
      userId,
      userEmail: email,
      eventType: success ? 'user.login' : 'user.failed_login',
      action: success ? 'User logged in' : 'Failed login attempt',
      ipAddress,
      success,
    });
  }

  async logDataAccess(
    userId: string | null, 
    resource: string, 
    resourceId: string, 
    action: 'view' | 'download' | 'export'
  ): Promise<void> {
    await this.log({
      userId,
      userEmail: null,
      eventType: 'data.access',
      resource,
      resourceId,
      action: `User ${action} ${resource}`,
      success: true,
    });
  }

  async logDataChange(
    userId: string | null,
    resource: string,
    resourceId: string,
    action: 'create' | 'update' | 'delete',
    details?: Record<string, any>
  ): Promise<void> {
    const eventType = `data.${action}` as AuditEventType;
    await this.log({
      userId,
      userEmail: null,
      eventType,
      resource,
      resourceId,
      action: `User ${action}d ${resource}`,
      details,
      success: true,
    });
  }

  async logApiAccess(
    endpoint: string,
    method: string,
    userId?: string | null,
    ipAddress?: string,
    success: boolean = true
  ): Promise<void> {
    await this.log({
      userId: userId || null,
      userEmail: null,
      eventType: 'api.access',
      resource: endpoint,
      action: `${method} ${endpoint}`,
      ipAddress,
      success,
    });
  }

  // Get recent logs (for development/debugging)
  getRecentLogs(limit: number = 100): AuditLogEntry[] {
    return this.logs.slice(-limit);
  }

  // Clear logs (for testing)
  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const auditLog = new AuditLogger();

// Middleware helper for API routes
export function withAuditLog(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const startTime = Date.now();
    const url = new URL(req.url);
    
    try {
      const response = await handler(req);
      
      // Log successful API access
      await auditLog.logApiAccess(
        url.pathname,
        req.method,
        null, // TODO: Extract user ID from auth
        req.headers.get('x-forwarded-for') || undefined,
        response.ok
      );
      
      return response;
    } catch (error) {
      // Log failed API access
      await auditLog.logApiAccess(
        url.pathname,
        req.method,
        null,
        req.headers.get('x-forwarded-for') || undefined,
        false
      );
      
      throw error;
    }
  };
}