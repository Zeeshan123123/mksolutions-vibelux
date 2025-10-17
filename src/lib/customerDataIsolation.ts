/**
 * Customer Data Isolation and Privacy Protection
 * Ensures customers cannot see other customers' data
 */

export interface DataAccessRequest {
  requestingUserId: string;
  requestingUserRole: string;
  targetUserId?: string;
  dataType: 'document_access' | 'analytics' | 'user_info' | 'usage_stats';
  scope: 'own' | 'organizational' | 'admin_only';
}

export class CustomerDataIsolation {
  
  /**
   * Validate if user can access requested data
   */
  static validateDataAccess(request: DataAccessRequest): { 
    allowed: boolean; 
    reason?: string;
    filteredScope?: string;
  } {
    const { requestingUserId, requestingUserRole, targetUserId, dataType, scope } = request;

    // Users can always access their own data
    if (scope === 'own' && targetUserId === requestingUserId) {
      return { allowed: true };
    }

    // Only admins can access aggregated analytics (no customer details)
    if (dataType === 'analytics' && scope === 'admin_only') {
      if (requestingUserRole === 'admin' || requestingUserRole === 'staff') {
        return { allowed: true, filteredScope: 'aggregated_only' };
      }
      return { 
        allowed: false, 
        reason: 'Analytics access requires admin privileges' 
      };
    }

    // Organizational data (within same company/facility) - if implemented
    if (scope === 'organizational') {
      // You could implement organization-level access here if needed
      // For now, we'll be conservative and not allow cross-user access
      return { 
        allowed: false, 
        reason: 'Cross-customer data access not permitted' 
      };
    }

    // Default deny for any other cross-customer access
    if (targetUserId && targetUserId !== requestingUserId) {
      return { 
        allowed: false, 
        reason: 'Cannot access other customers\' data' 
      };
    }

    return { allowed: true };
  }

  /**
   * Sanitize data for customer privacy
   */
  static sanitizeCustomerData<T extends Record<string, any>>(
    data: T[], 
    requestingUserId: string,
    userRole: string
  ): T[] {
    // If admin, return aggregated data without personal identifiers
    if (userRole === 'admin' || userRole === 'staff') {
      return data.map(item => {
        const sanitized = { ...item };
        
        // Remove personal identifiers for privacy
        delete sanitized.userEmail;
        delete sanitized.ipAddress;
        delete sanitized.userAgent;
        
        // Keep only aggregated/statistical data
        if (sanitized.userId) {
          sanitized.userId = 'user_' + this.hashUserId(sanitized.userId);
        }
        
        return sanitized;
      });
    }

    // For regular users, only return their own data
    return data.filter(item => 
      item.userId === requestingUserId || 
      item.requestingUserId === requestingUserId
    );
  }

  /**
   * Hash user ID for privacy in admin reports
   */
  private static hashUserId(userId: string): string {
    // Simple hash for anonymization (use crypto.subtle in production)
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  /**
   * Log privacy-sensitive data access attempts
   */
  static async logDataAccessAttempt(request: DataAccessRequest & {
    success: boolean;
    reason?: string;
    ipAddress: string;
    timestamp: Date;
  }): Promise<void> {
    // Log for security monitoring
    console.log('DATA_ACCESS_ATTEMPT:', {
      type: 'CUSTOMER_DATA_ACCESS',
      requestingUser: request.requestingUserId,
      targetUser: request.targetUserId,
      dataType: request.dataType,
      scope: request.scope,
      success: request.success,
      reason: request.reason,
      timestamp: request.timestamp.toISOString(),
      // IP for security but don't store long-term for privacy
      ipAddress: request.ipAddress
    });

    // Alert on suspicious cross-customer access attempts
    if (!request.success && request.targetUserId && 
        request.targetUserId !== request.requestingUserId) {
      await this.alertSuspiciousCrossCustomerAccess(request);
    }
  }

  /**
   * Alert on suspicious cross-customer data access attempts
   */
  private static async alertSuspiciousCrossCustomerAccess(
    request: DataAccessRequest & { ipAddress: string; timestamp: Date }
  ): Promise<void> {
    const alert = {
      type: 'SUSPICIOUS_CROSS_CUSTOMER_ACCESS',
      severity: 'HIGH',
      message: `User ${request.requestingUserId} attempted to access data belonging to user ${request.targetUserId}`,
      metadata: {
        requestingUser: request.requestingUserId,
        targetUser: request.targetUserId,
        dataType: request.dataType,
        ipAddress: request.ipAddress,
        timestamp: request.timestamp.toISOString(),
        userAgent: 'logged_separately' // Don't include in alert for privacy
      }
    };

    // Send to security monitoring system
    console.error('SECURITY_ALERT:', alert);
    
    // In production, integrate with your security monitoring:
    // - Send to security team
    // - Log to SIEM system
    // - Potentially block user if repeated attempts
  }

  /**
   * Generate privacy-compliant user activity summary
   */
  static generateUserActivitySummary(userId: string, activities: any[]): {
    totalDocumentsAccessed: number;
    documentsAccessedToday: number;
    documentsAccessedThisWeek: number;
    documentsAccessedThisMonth: number;
    lastActivityDate: string;
    // No other user data included
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const userActivities = activities.filter(activity => activity.userId === userId);

    return {
      totalDocumentsAccessed: userActivities.length,
      documentsAccessedToday: userActivities.filter(a => 
        new Date(a.timestamp) >= today
      ).length,
      documentsAccessedThisWeek: userActivities.filter(a => 
        new Date(a.timestamp) >= weekAgo
      ).length,
      documentsAccessedThisMonth: userActivities.filter(a => 
        new Date(a.timestamp) >= monthAgo
      ).length,
      lastActivityDate: userActivities.length > 0 
        ? userActivities[0].timestamp 
        : 'No activity'
    };
  }

  /**
   * Check if users belong to same organization (if multi-tenant)
   */
  static async areUsersInSameOrganization(
    userId1: string, 
    userId2: string
  ): Promise<boolean> {
    // Implement if you have multi-tenant organization structure
    // For now, we'll be conservative and return false
    // 
    // const org1 = await getUserOrganization(userId1);
    // const org2 = await getUserOrganization(userId2);
    // return org1 && org2 && org1.id === org2.id;
    
    return false;
  }
}

/**
 * Middleware decorator for customer data isolation
 */
export function withCustomerDataIsolation(
  dataType: DataAccessRequest['dataType'],
  scope: DataAccessRequest['scope'] = 'own'
) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const request = args[0];
      const requestingUserId = request.user?.id;
      const requestingUserRole = request.user?.role || 'user';
      const targetUserId = request.params?.userId || request.body?.userId;

      // Validate access
      const accessCheck = CustomerDataIsolation.validateDataAccess({
        requestingUserId,
        requestingUserRole,
        targetUserId,
        dataType,
        scope
      });

      if (!accessCheck.allowed) {
        // Log the attempt
        await CustomerDataIsolation.logDataAccessAttempt({
          requestingUserId,
          requestingUserRole,
          targetUserId,
          dataType,
          scope,
          success: false,
          reason: accessCheck.reason,
          ipAddress: request.ip || 'unknown',
          timestamp: new Date()
        });

        throw new Error(accessCheck.reason || 'Access denied');
      }

      // Execute the method
      const result = await method.apply(this, args);

      // Sanitize result for customer privacy
      if (Array.isArray(result) && result.length > 0) {
        const sanitizedResult = CustomerDataIsolation.sanitizeCustomerData(
          result,
          requestingUserId,
          requestingUserRole
        );

        // Log successful access
        await CustomerDataIsolation.logDataAccessAttempt({
          requestingUserId,
          requestingUserRole,
          targetUserId,
          dataType,
          scope,
          success: true,
          ipAddress: request.ip || 'unknown',
          timestamp: new Date()
        });

        return sanitizedResult;
      }

      return result;
    };
  };
}