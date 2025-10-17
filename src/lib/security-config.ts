import { logger } from '@/lib/logging/production-logger';
/**
 * Central security configuration
 * Manages access control, roles, and permissions
 */

// Environment-based configuration
export const SecurityConfig = {
  // Owner emails with full access
  ownerEmails: process.env.OWNER_EMAILS?.split(',').map(e => e.trim()) || [],
  
  // Admin emails with admin panel access
  adminEmails: process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || 
               process.env.OWNER_EMAILS?.split(',').map(e => e.trim()) || 
               [],
  
  // Feature flags
  features: {
    csrfProtection: process.env.ENABLE_CSRF_PROTECTION === 'true',
    rateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false', // Default true
    cspHeaders: process.env.ENABLE_CSP_HEADERS !== 'false', // Default true
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW || '60000'),
    maxRequests: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || process.env.CLERK_SECRET_KEY || '',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // CSRF configuration
  csrf: {
    secret: process.env.CSRF_SECRET || process.env.SESSION_SECRET || '',
  },
  
  // Security monitoring
  monitoring: {
    alertEmail: process.env.SECURITY_ALERT_EMAIL || '',
    logEvents: process.env.LOG_SECURITY_EVENTS === 'true',
  },
};

// Validate security configuration on startup
if (process.env.NODE_ENV === 'production') {
  if (SecurityConfig.ownerEmails.length === 0) {
    logger.warn('api', '[SECURITY] No owner emails configured. Set OWNER_EMAILS environment variable.');
  }
  if (!SecurityConfig.session.secret) {
    logger.error('api', '[SECURITY] SESSION_SECRET is not set. This is required for production.');
  }
  if (!SecurityConfig.csrf.secret) {
    logger.error('api', '[SECURITY] CSRF_SECRET is not set. This is required for production.');
  }
}

// Role definitions
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

// Permission definitions
export const Permissions = {
  // Dev tools access
  ACCESS_DEV_TOOLS: [UserRole.OWNER],
  
  // Admin panel access
  ACCESS_ADMIN_PANEL: [UserRole.OWNER, UserRole.ADMIN],
  
  // Control center access
  ACCESS_CONTROL_CENTER: [UserRole.OWNER, UserRole.ADMIN],
  
  // Database management
  MANAGE_DATABASE: [UserRole.OWNER],
  
  // User management
  MANAGE_USERS: [UserRole.OWNER, UserRole.ADMIN],
  
  // Analytics access
  VIEW_ANALYTICS: [UserRole.OWNER, UserRole.ADMIN],
  
  // Advanced design features
  USE_ADVANCED_DESIGN: [UserRole.OWNER, UserRole.ADMIN, UserRole.USER],
  
  // API access
  API_FULL_ACCESS: [UserRole.OWNER, UserRole.ADMIN],
  API_LIMITED_ACCESS: [UserRole.USER],
};

// Helper functions
export function getUserRole(email: string | null | undefined): UserRole {
  if (!email) return UserRole.GUEST;
  
  if (SecurityConfig.ownerEmails.includes(email)) {
    return UserRole.OWNER;
  }
  
  if (SecurityConfig.adminEmails.includes(email)) {
    return UserRole.ADMIN;
  }
  
  return UserRole.USER;
}

export function hasPermission(userRole: UserRole, permission: UserRole[]): boolean {
  return permission.includes(userRole);
}

export function checkEmailAccess(email: string | null | undefined, allowedEmails: string[]): boolean {
  return email ? allowedEmails.includes(email) : false;
}

// Logging functions
export function logSecurityEvent(event: {
  type: 'access_denied' | 'login_attempt' | 'permission_check' | 'suspicious_activity';
  user?: string;
  route?: string;
  details?: any;
}) {
  if (!SecurityConfig.monitoring.logEvents) return;
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...event,
  };
  
  logger.info('api', '[SECURITY]', { data: JSON.stringify(logEntry) });
  
  // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
  // TODO: Send email alerts for critical events
}

// Export for use in middleware and components
export default SecurityConfig;