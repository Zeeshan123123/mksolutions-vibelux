/**
 * Document Security and Classification System
 * Handles IP protection, access control, and compliance tracking
 */

export interface DocumentClassification {
  id: string;
  title: string;
  accessLevel: 'public' | 'authenticated' | 'premium' | 'enterprise' | 'internal';
  requiredTiers: string[];
  sensitivityLevel: 'low' | 'medium' | 'high' | 'critical';
  allowDownload: boolean;
  allowPrint: boolean;
  allowCopy: boolean;
  watermarkRequired: boolean;
  ndaRequired?: boolean;
  expirationDate?: Date;
  geographicRestrictions?: string[];
}

/**
 * Master document classification registry
 * This centralizes all document access controls
 */
export const DOCUMENT_REGISTRY: Record<string, DocumentClassification> = {
  // Public Documentation
  'quick-start-guide': {
    id: 'quick-start-guide',
    title: 'Quick Start Guide',
    accessLevel: 'public',
    requiredTiers: ['free', 'starter', 'professional', 'business', 'enterprise'],
    sensitivityLevel: 'low',
    allowDownload: true,
    allowPrint: true,
    allowCopy: true,
    watermarkRequired: false
  },

  'enhanced-faq': {
    id: 'enhanced-faq',
    title: 'FAQ Documentation',
    accessLevel: 'authenticated',
    requiredTiers: ['starter', 'professional', 'business', 'enterprise'],
    sensitivityLevel: 'low',
    allowDownload: false,
    allowPrint: true,
    allowCopy: true,
    watermarkRequired: true
  },

  // Premium Documentation
  'user-guide-advanced': {
    id: 'user-guide-advanced',
    title: 'Advanced User Guide',
    accessLevel: 'premium',
    requiredTiers: ['professional', 'business', 'enterprise'],
    sensitivityLevel: 'medium',
    allowDownload: true,
    allowPrint: true,
    allowCopy: false,
    watermarkRequired: true
  },

  'ml-capabilities': {
    id: 'ml-capabilities',
    title: 'Machine Learning Capabilities',
    accessLevel: 'premium',
    requiredTiers: ['professional', 'business', 'enterprise'],
    sensitivityLevel: 'medium',
    allowDownload: false,
    allowPrint: true,
    allowCopy: false,
    watermarkRequired: true
  },

  // Enterprise Documentation
  'api-documentation': {
    id: 'api-documentation',
    title: 'API Documentation',
    accessLevel: 'enterprise',
    requiredTiers: ['enterprise'],
    sensitivityLevel: 'high',
    allowDownload: true,
    allowPrint: true,
    allowCopy: false,
    watermarkRequired: true,
    ndaRequired: true
  },

  'admin-guide': {
    id: 'admin-guide',
    title: 'Administrator Guide',
    accessLevel: 'enterprise',
    requiredTiers: ['enterprise'],
    sensitivityLevel: 'high',
    allowDownload: false,
    allowPrint: true,
    allowCopy: false,
    watermarkRequired: true
  },

  'integration-architecture': {
    id: 'integration-architecture',
    title: 'Integration Architecture',
    accessLevel: 'enterprise',
    requiredTiers: ['enterprise'],
    sensitivityLevel: 'high',
    allowDownload: false,
    allowPrint: false,
    allowCopy: false,
    watermarkRequired: true,
    ndaRequired: true
  },

  // Internal Documentation
  'system-architecture': {
    id: 'system-architecture',
    title: 'System Architecture',
    accessLevel: 'internal',
    requiredTiers: ['internal'],
    sensitivityLevel: 'critical',
    allowDownload: false,
    allowPrint: false,
    allowCopy: false,
    watermarkRequired: true,
    ndaRequired: true
  },

  'implementation-roadmap': {
    id: 'implementation-roadmap',
    title: 'Implementation Roadmap',
    accessLevel: 'internal',
    requiredTiers: ['internal'],
    sensitivityLevel: 'critical',
    allowDownload: false,
    allowPrint: false,
    allowCopy: false,
    watermarkRequired: true,
    ndaRequired: true
  },

  'competitive-analysis': {
    id: 'competitive-analysis',
    title: 'Competitive Analysis',
    accessLevel: 'internal',
    requiredTiers: ['internal'],
    sensitivityLevel: 'critical',
    allowDownload: false,
    allowPrint: false,
    allowCopy: false,
    watermarkRequired: true,
    ndaRequired: true
  }
};

/**
 * Security compliance checker
 */
export class DocumentSecurity {
  
  /**
   * Get document classification
   */
  static getDocumentClassification(documentId: string): DocumentClassification | null {
    return DOCUMENT_REGISTRY[documentId] || null;
  }

  /**
   * Check if user can access document
   */
  static canAccessDocument(
    documentId: string,
    userTier: string,
    userRole: string = 'user'
  ): { canAccess: boolean; reason?: string } {
    const doc = this.getDocumentClassification(documentId);
    
    if (!doc) {
      return { canAccess: false, reason: 'Document not found' };
    }

    // Internal documents require staff role
    if (doc.accessLevel === 'internal' && userRole !== 'staff') {
      return { canAccess: false, reason: 'Insufficient role privileges' };
    }

    // Check tier requirements
    if (!doc.requiredTiers.includes(userTier)) {
      return { 
        canAccess: false, 
        reason: `Requires ${doc.accessLevel} subscription or higher` 
      };
    }

    return { canAccess: true };
  }

  /**
   * Generate security headers for document
   */
  static getSecurityHeaders(documentId: string): Record<string, string> {
    const doc = this.getDocumentClassification(documentId);
    
    if (!doc) return {};

    const headers: Record<string, string> = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    // Add stricter headers for sensitive content
    if (doc.sensitivityLevel === 'high' || doc.sensitivityLevel === 'critical') {
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
      headers['X-Download-Options'] = 'noopen';
    }

    // Prevent right-click for critical documents
    if (doc.sensitivityLevel === 'critical') {
      headers['X-Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
    }

    return headers;
  }

  /**
   * Log compliance event
   */
  static async logComplianceEvent(event: {
    type: 'ACCESS' | 'DOWNLOAD' | 'PRINT' | 'COPY' | 'VIOLATION';
    documentId: string;
    userId: string;
    userEmail: string;
    ipAddress: string;
    userAgent: string;
    details?: any;
  }): Promise<void> {
    const doc = this.getDocumentClassification(event.documentId);
    
    if (!doc) return;

    // Enhanced logging for sensitive documents
    if (doc.sensitivityLevel === 'high' || doc.sensitivityLevel === 'critical') {
      await this.sendComplianceAlert({
        ...event,
        classification: doc,
        timestamp: new Date().toISOString()
      });
    }

    // Store in audit log
    await this.storeAuditLog(event);
  }

  /**
   * Check for suspicious access patterns
   */
  static async detectSuspiciousActivity(
    userId: string,
    documentId: string,
    ipAddress: string
  ): Promise<{ suspicious: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    // Check rapid sequential access
    const recentAccess = await this.getRecentAccess(userId, documentId, 5); // Last 5 minutes
    if (recentAccess.length > 10) {
      reasons.push('Rapid sequential access detected');
    }

    // Check IP address changes
    const recentIPs = await this.getRecentIPAddresses(userId, 60); // Last hour
    if (recentIPs.length > 5) {
      reasons.push('Multiple IP addresses in short timeframe');
    }

    // Check unusual hours
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      const userProfile = await this.getUserAccessProfile(userId);
      if (!userProfile.typicalNightAccess) {
        reasons.push('Access during unusual hours');
      }
    }

    return {
      suspicious: reasons.length > 0,
      reasons
    };
  }

  /**
   * Generate Terms of Service clauses for IP protection
   */
  static getIPProtectionClauses(): string[] {
    return [
      "All documentation, guides, and technical materials provided through this platform contain proprietary and confidential information owned by VibeLux.",
      
      "Users are strictly prohibited from reproducing, distributing, or sharing any documentation with unauthorized parties without prior written consent.",
      
      "Any violation of these terms may result in immediate account termination and legal action for damages, including but not limited to lost profits and legal fees.",
      
      "Users acknowledge that unauthorized distribution of proprietary documentation may cause irreparable harm to VibeLux and agree to liquidated damages of $10,000 per incident.",
      
      "All document access is logged and monitored. Users consent to tracking of their document viewing, downloading, and sharing activities.",
        
      "Users agree to implement reasonable safeguards to prevent unauthorized access to VibeLux documentation and to promptly notify VibeLux of any suspected breaches.",
      
      "Enterprise users may be required to execute separate Non-Disclosure Agreements (NDAs) for access to sensitive technical documentation."
    ];
  }

  // Private helper methods
  private static async sendComplianceAlert(event: any): Promise<void> {
    // Implementation for sending alerts to security team
    console.log('COMPLIANCE ALERT:', event);
  }

  private static async storeAuditLog(event: any): Promise<void> {
    // Implementation for storing in audit database
    console.log('AUDIT LOG:', event);
  }

  private static async getRecentAccess(userId: string, documentId: string, minutes: number): Promise<any[]> {
    // Implementation to get recent access records
    return [];
  }

  private static async getRecentIPAddresses(userId: string, minutes: number): Promise<string[]> {
    // Implementation to get recent IP addresses
    return [];
  }

  private static async getUserAccessProfile(userId: string): Promise<any> {
    // Implementation to get user's typical access patterns
    return { typicalNightAccess: false };
  }
}

/**
 * Compliance monitoring decorator
 */
export function withComplianceMonitoring(documentId: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const startTime = Date.now();
      let error: Error | null = null;

      try {
        const result = await method.apply(this, args);
        
        // Log successful access
        await DocumentSecurity.logComplianceEvent({
          type: 'ACCESS',
          documentId,
          userId: args[0]?.user?.id || 'unknown',
          userEmail: args[0]?.user?.email || 'unknown',
          ipAddress: args[0]?.ip || 'unknown',
          userAgent: args[0]?.headers?.['user-agent'] || 'unknown',
          details: {
            duration: Date.now() - startTime,
            success: true
          }
        });

        return result;
      } catch (err) {
        error = err as Error;
        
        // Log failed access attempt
        await DocumentSecurity.logComplianceEvent({
          type: 'VIOLATION',
          documentId,
          userId: args[0]?.user?.id || 'unknown',
          userEmail: args[0]?.user?.email || 'unknown',
          ipAddress: args[0]?.ip || 'unknown',
          userAgent: args[0]?.headers?.['user-agent'] || 'unknown',
          details: {
            duration: Date.now() - startTime,
            error: error.message,
            success: false
          }
        });

        throw error;
      }
    };
  };
}