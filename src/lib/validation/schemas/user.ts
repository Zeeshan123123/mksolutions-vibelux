import { z } from 'zod';
import {
  cuidSchema,
  emailSchema,
  nameSchema,
  phoneSchema,
  urlSchema,
  passwordSchema,
  userRoleSchema,
  subscriptionTierSchema,
  trimString,
  safeHtml,
  optionalNullable
} from './common';

// User registration schema
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: nameSchema.optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// User profile update schema
export const userProfileUpdateSchema = z.object({
  name: optionalNullable(nameSchema),
  firstName: optionalNullable(trimString.max(50)),
  lastName: optionalNullable(trimString.max(50)),
  company: optionalNullable(trimString.max(100)),
  phone: optionalNullable(phoneSchema),
  bio: optionalNullable(safeHtml.max(500)),
  website: optionalNullable(urlSchema),
  timezone: optionalNullable(z.string().regex(/^[A-Za-z_]+\/[A-Za-z_]+$/, 'Invalid timezone format')),
  profileImage: optionalNullable(urlSchema)
});

// User settings schema
export const userSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['en', 'es', 'fr', 'de']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
    marketing: z.boolean().optional()
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'connections']).optional(),
    showEmail: z.boolean().optional(),
    showPhone: z.boolean().optional()
  }).optional(),
  units: z.object({
    temperature: z.enum(['celsius', 'fahrenheit']).optional(),
    area: z.enum(['sqft', 'sqm']).optional(),
    volume: z.enum(['gallons', 'liters']).optional(),
    weight: z.enum(['lbs', 'kg']).optional()
  }).optional()
});

// User authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"]
});

// User role management
export const userRoleUpdateSchema = z.object({
  userId: cuidSchema,
  role: userRoleSchema
});

// User subscription management
export const userSubscriptionUpdateSchema = z.object({
  userId: cuidSchema,
  subscriptionTier: subscriptionTierSchema,
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  subscriptionStatus: z.enum(['active', 'canceled', 'past_due', 'trialing']).optional(),
  subscriptionPeriodEnd: z.string().datetime().optional()
});

// User search/filter schema
export const userSearchSchema = z.object({
  search: trimString.optional(),
  role: userRoleSchema.optional(),
  subscriptionTier: subscriptionTierSchema.optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional()
});

// Session validation
export const sessionCreateSchema = z.object({
  userId: cuidSchema,
  deviceInfo: z.object({
    userAgent: z.string().max(500),
    ip: z.string().ip().optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
    device: z.string().optional()
  }).optional(),
  expiresAt: z.string().datetime().optional()
});

// API key management
export const apiKeyCreateSchema = z.object({
  name: nameSchema,
  description: safeHtml.max(200).optional(),
  permissions: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional()
});

// Notification preferences
export const notificationPreferencesSchema = z.object({
  alertTypes: z.object({
    systemAlerts: z.boolean(),
    environmentalAlerts: z.boolean(),
    healthAlerts: z.boolean(),
    maintenanceAlerts: z.boolean(),
    billingAlerts: z.boolean()
  }),
  channels: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    inApp: z.boolean()
  }),
  frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']),
  quietHours: z.object({
    enabled: z.boolean(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
    timezone: z.string()
  }).optional()
});

// Two-factor authentication
export const twoFactorSetupSchema = z.object({
  method: z.enum(['authenticator', 'sms', 'email']),
  phoneNumber: phoneSchema.optional().refine((phone, ctx) => {
    const method = ctx.parent.method;
    if (method === 'sms' && !phone) {
      return false;
    }
    return true;
  }, 'Phone number is required for SMS authentication')
});

export const twoFactorVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
  rememberDevice: z.boolean().optional()
});

// User activity/audit log query
export const userActivityQuerySchema = z.object({
  userId: cuidSchema.optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  ipAddress: z.string().ip().optional()
});