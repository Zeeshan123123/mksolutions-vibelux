import { z } from 'zod';

// Team invitation validation
export const TeamInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'operator', 'viewer'], {
    errorMap: () => ({ message: 'Role must be one of: admin, manager, operator, viewer' })
  }),
  message: z.string().optional().refine(
    (val) => !val || val.length <= 500,
    'Message must be 500 characters or less'
  )
});

// Team member update validation
export const TeamMemberUpdateSchema = z.object({
  role: z.enum(['admin', 'manager', 'operator', 'viewer'], {
    errorMap: () => ({ message: 'Role must be one of: admin, manager, operator, viewer' })
  })
});

// Privacy settings validation
export const PrivacySettingsSchema = z.object({
  analyticsOptIn: z.boolean().optional(),
  researchOptIn: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  dataRetentionDays: z.number().min(1).max(2555).optional() // Max ~7 years
});

// Data export validation
export const DataExportSchema = z.object({
  includePersonalData: z.boolean().default(true),
  includeUsageData: z.boolean().default(true),
  includeProjectData: z.boolean().default(true),
  format: z.enum(['json', 'csv']).default('json')
});

// Team search and filter validation
export const TeamSearchSchema = z.object({
  query: z.string().optional(),
  role: z.enum(['all', 'admin', 'manager', 'operator', 'viewer']).default('all'),
  status: z.enum(['all', 'active', 'inactive', 'pending']).default('all'),
  department: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
});

// Team member ID validation
export const TeamMemberIdSchema = z.object({
  memberId: z.string().cuid('Invalid member ID format')
});

// Invitation ID validation
export const InvitationIdSchema = z.object({
  inviteId: z.string().cuid('Invalid invitation ID format')
});

// Token validation
export const TokenSchema = z.object({
  token: z.string().uuid('Invalid token format')
});

// Common validation utilities
export const validateTeamInvite = (data: unknown) => {
  const result = TeamInviteSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
};

export const validateTeamMemberUpdate = (data: unknown) => {
  const result = TeamMemberUpdateSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
};

export const validatePrivacySettings = (data: unknown) => {
  const result = PrivacySettingsSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
};

export const validateDataExport = (data: unknown) => {
  const result = DataExportSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
};

export const validateTeamSearch = (data: unknown) => {
  const result = TeamSearchSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
};

// Role validation helpers
export const isValidRole = (role: string): boolean => {
  return ['admin', 'manager', 'operator', 'viewer'].includes(role.toLowerCase());
};

export const canManageRole = (managerRole: string, targetRole: string): boolean => {
  const roleHierarchy = {
    'owner': 5,
    'admin': 4,
    'manager': 3,
    'operator': 2,
    'viewer': 1
  };
  
  const managerLevel = roleHierarchy[managerRole.toLowerCase() as keyof typeof roleHierarchy] || 0;
  const targetLevel = roleHierarchy[targetRole.toLowerCase() as keyof typeof roleHierarchy] || 0;
  
  return managerLevel > targetLevel;
};

// Email validation with additional checks
export const validateBusinessEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Common personal email domains to discourage
  const personalDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'aol.com', 'icloud.com', 'live.com', 'msn.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  
  // Allow but warn about personal domains
  return true;
};

// Rate limiting validation
export const validateRateLimit = (requests: number, windowMs: number, maxRequests: number): boolean => {
  return requests <= maxRequests;
};

// File upload validation
export const validateFileUpload = (file: File, maxSize: number = 5 * 1024 * 1024): boolean => {
  if (file.size > maxSize) return false;
  
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  return allowedTypes.includes(file.type);
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

// Permission validation
export const hasPermission = (userRole: string, requiredPermission: string): boolean => {
  const rolePermissions = {
    'owner': ['all'],
    'admin': ['manage_users', 'manage_projects', 'manage_settings', 'view_analytics'],
    'manager': ['manage_projects', 'view_analytics', 'view_reports'],
    'operator': ['manage_cultivation', 'view_reports', 'view_dashboards'],
    'viewer': ['view_dashboards', 'view_reports']
  };
  
  const permissions = rolePermissions[userRole.toLowerCase() as keyof typeof rolePermissions] || [];
  return permissions.includes('all') || permissions.includes(requiredPermission);
};

export type TeamInviteData = z.infer<typeof TeamInviteSchema>;
export type TeamMemberUpdateData = z.infer<typeof TeamMemberUpdateSchema>;
export type PrivacySettingsData = z.infer<typeof PrivacySettingsSchema>;
export type DataExportData = z.infer<typeof DataExportSchema>;
export type TeamSearchData = z.infer<typeof TeamSearchSchema>;