import { z } from 'zod';
import { AlertCondition, AlertSeverity, AlertStatus } from '@prisma/client';

export const alertConfigurationSchema = z.object({
  id: z.string().optional(),
  facilityId: z.string().uuid('Invalid facility ID'),
  sensorId: z.string().uuid('Invalid sensor ID'),
  name: z.string().min(1, 'Name is required').max(255),
  alertType: z.string().min(1, 'Alert type is required'),
  condition: z.nativeEnum(AlertCondition),
  threshold: z.number(),
  thresholdMax: z.number().nullable().optional(),
  severity: z.nativeEnum(AlertSeverity),
  duration: z.number().int().min(0).nullable().optional(),
  cooldownMinutes: z.number().int().min(1, 'Cooldown must be at least 1 minute').default(15),
  actions: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
    webhook: z.boolean().default(false)
  }).optional(),
  notificationMessage: z.string().max(1000).optional(),
  enabled: z.boolean().default(true)
}).refine(
  (data) => {
    // If condition is BETWEEN, thresholdMax must be provided and greater than threshold
    if (data.condition === 'BETWEEN') {
      return data.thresholdMax != null && data.thresholdMax > data.threshold;
    }
    return true;
  },
  {
    message: 'For BETWEEN condition, maximum threshold must be greater than minimum threshold',
    path: ['thresholdMax']
  }
);

export const acknowledgeAlertSchema = z.object({
  alertId: z.string().uuid('Invalid alert ID')
});

export const resolveAlertSchema = z.object({
  alertId: z.string().uuid('Invalid alert ID'),
  resolutionNotes: z.string().min(1, 'Resolution notes are required').max(1000)
});

export const alertFilterSchema = z.object({
  facilityId: z.string().uuid().optional(),
  status: z.nativeEnum(AlertStatus).optional(),
  severity: z.nativeEnum(AlertSeverity).optional(),
  sensorId: z.string().uuid().optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50)
});

export const escalationConfigSchema = z.object({
  facilityId: z.string().uuid('Invalid facility ID'),
  config: z.object({
    enabled: z.boolean(),
    levels: z.object({
      CRITICAL: z.array(z.number().int().min(1)).length(2),
      HIGH: z.array(z.number().int().min(1)).length(2),
      MEDIUM: z.array(z.number().int().min(1)).length(2),
      LOW: z.array(z.number().int().min(1)).length(1)
    }),
    recipients: z.array(z.string().uuid())
  })
});

export type AlertConfigurationInput = z.infer<typeof alertConfigurationSchema>;
export type AcknowledgeAlertInput = z.infer<typeof acknowledgeAlertSchema>;
export type ResolveAlertInput = z.infer<typeof resolveAlertSchema>;
export type AlertFilterInput = z.infer<typeof alertFilterSchema>;
export type EscalationConfigInput = z.infer<typeof escalationConfigSchema>;
