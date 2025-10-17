import { z } from 'zod';
import {
  cuidSchema,
  nameSchema,
  descriptionSchema,
  phoneSchema,
  emailSchema,
  coordinatesSchema,
  trimString,
  safeHtml,
  optionalNullable,
  temperatureSchema,
  humiditySchema,
  co2Schema,
  vpdSchema
} from './common';

// Facility creation and update schemas
export const facilityCreateSchema = z.object({
  name: nameSchema,
  description: optionalNullable(descriptionSchema),
  type: z.enum(['GREENHOUSE', 'INDOOR', 'VERTICAL_FARM', 'HYBRID']),
  address: z.object({
    street: trimString.max(200),
    city: trimString.max(100),
    state: trimString.max(100),
    postalCode: trimString.max(20),
    country: trimString.max(100)
  }),
  location: coordinatesSchema.optional(),
  contactInfo: z.object({
    primaryContact: nameSchema.optional(),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    emergencyContact: z.object({
      name: nameSchema,
      phone: phoneSchema,
      relationship: trimString.max(50)
    }).optional()
  }).optional(),
  specifications: z.object({
    totalArea: z.number().positive().max(1000000), // in square meters
    growingArea: z.number().positive().max(1000000),
    zones: z.number().int().positive().max(1000).optional(),
    maxCapacity: z.number().int().positive().optional(),
    climateZone: trimString.max(50).optional()
  }),
  operationalSettings: z.object({
    operatingHours: z.object({
      monday: z.object({ open: z.string(), close: z.string() }).optional(),
      tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
      wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
      thursday: z.object({ open: z.string(), close: z.string() }).optional(),
      friday: z.object({ open: z.string(), close: z.string() }).optional(),
      saturday: z.object({ open: z.string(), close: z.string() }).optional(),
      sunday: z.object({ open: z.string(), close: z.string() }).optional()
    }).optional(),
    maintenanceSchedule: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
    securityLevel: z.enum(['basic', 'standard', 'high']).optional()
  }).optional()
});

export const facilityUpdateSchema = facilityCreateSchema.partial();

// Facility user management
export const facilityUserAddSchema = z.object({
  facilityId: cuidSchema,
  userId: cuidSchema,
  role: z.enum(['OWNER', 'MANAGER', 'TECHNICIAN', 'VIEWER']),
  permissions: z.array(z.enum([
    'view_facility',
    'edit_facility',
    'manage_users',
    'control_environment',
    'view_analytics',
    'manage_inventory',
    'schedule_maintenance'
  ])).optional(),
  accessAreas: z.array(trimString.max(100)).optional()
});

// Environmental control schemas
export const environmentalTargetsSchema = z.object({
  facilityId: cuidSchema,
  zoneId: trimString.max(50).optional(),
  targets: z.object({
    temperature: z.object({
      day: temperatureSchema,
      night: temperatureSchema,
      tolerance: z.number().positive().max(5)
    }).optional(),
    humidity: z.object({
      min: humiditySchema,
      max: humiditySchema,
      optimal: humiditySchema.optional()
    }).optional(),
    co2: z.object({
      min: co2Schema,
      max: co2Schema,
      enrichmentTarget: co2Schema.optional()
    }).optional(),
    vpd: z.object({
      min: vpdSchema,
      max: vpdSchema,
      growthStageTargets: z.record(z.string(), vpdSchema).optional()
    }).optional(),
    lighting: z.object({
      photoperiod: z.number().min(0).max(24),
      ppfd: z.number().min(0).max(2000),
      dli: z.number().min(0).max(100)
    }).optional()
  }),
  schedules: z.array(z.object({
    name: nameSchema,
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    daysOfWeek: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])),
    targets: z.record(z.string(), z.number())
  })).optional()
});

// Sensor configuration
export const sensorConfigSchema = z.object({
  facilityId: cuidSchema,
  sensorId: trimString.max(100),
  type: z.enum(['temperature', 'humidity', 'co2', 'light', 'ph', 'ec', 'flow', 'pressure']),
  manufacturer: trimString.max(100).optional(),
  model: trimString.max(100).optional(),
  location: z.object({
    zone: trimString.max(50),
    position: coordinatesSchema.optional(),
    height: z.number().optional(),
    description: safeHtml.max(200).optional()
  }),
  calibration: z.object({
    lastCalibrated: z.string().datetime().optional(),
    calibrationInterval: z.number().positive().optional(), // days
    offset: z.number().optional(),
    scale: z.number().positive().optional()
  }).optional(),
  alertThresholds: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    rateOfChange: z.number().optional()
  }).optional()
});

// Maintenance scheduling
export const maintenanceTaskSchema = z.object({
  facilityId: cuidSchema,
  title: nameSchema,
  description: optionalNullable(descriptionSchema),
  type: z.enum(['routine', 'preventive', 'corrective', 'emergency']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assignedTo: cuidSchema.optional(),
  dueDate: z.string().datetime(),
  estimatedDuration: z.number().positive().max(480), // minutes
  equipmentId: trimString.max(100).optional(),
  checklist: z.array(z.object({
    item: safeHtml.max(200),
    completed: z.boolean().optional()
  })).optional(),
  recurringSchedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually']),
    interval: z.number().positive().optional(),
    endDate: z.string().datetime().optional()
  }).optional()
});

// Inventory management
export const inventoryItemSchema = z.object({
  facilityId: cuidSchema,
  category: z.enum(['seeds', 'nutrients', 'pesticides', 'equipment', 'supplies', 'other']),
  name: nameSchema,
  sku: trimString.max(50).optional(),
  quantity: z.number().int().min(0),
  unit: trimString.max(20),
  location: trimString.max(100).optional(),
  reorderPoint: z.number().int().min(0).optional(),
  reorderQuantity: z.number().int().positive().optional(),
  supplier: z.object({
    name: nameSchema,
    contactEmail: emailSchema.optional(),
    contactPhone: phoneSchema.optional()
  }).optional(),
  costPerUnit: z.number().min(0).optional(),
  expirationDate: z.string().datetime().optional(),
  batchNumber: trimString.max(50).optional(),
  notes: optionalNullable(safeHtml.max(500))
});

// Resource usage tracking
export const resourceUsageSchema = z.object({
  facilityId: cuidSchema,
  resourceType: z.enum(['water', 'electricity', 'gas', 'nutrients', 'co2']),
  amount: z.number().positive(),
  unit: trimString.max(20),
  timestamp: z.string().datetime().optional(),
  cost: z.number().min(0).optional(),
  zone: trimString.max(50).optional(),
  metadata: z.record(z.any()).optional()
});

// Facility analytics query
export const facilityAnalyticsQuerySchema = z.object({
  facilityId: cuidSchema,
  metrics: z.array(z.enum([
    'environmental_summary',
    'resource_consumption',
    'yield_performance',
    'cost_analysis',
    'equipment_efficiency',
    'labor_productivity'
  ])).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  groupBy: z.enum(['hour', 'day', 'week', 'month']).optional(),
  zones: z.array(trimString.max(50)).optional()
});

// Compliance and certification
export const complianceRecordSchema = z.object({
  facilityId: cuidSchema,
  type: z.enum(['organic', 'gap', 'globalg.a.p', 'sqf', 'haccp', 'custom']),
  certificationBody: nameSchema,
  certificateNumber: trimString.max(100),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  status: z.enum(['active', 'pending', 'expired', 'revoked']),
  documents: z.array(z.object({
    name: trimString.max(200),
    url: z.string().url(),
    uploadedAt: z.string().datetime()
  })).optional(),
  auditSchedule: z.array(z.object({
    scheduledDate: z.string().datetime(),
    auditorName: nameSchema.optional(),
    type: z.enum(['initial', 'surveillance', 'recertification'])
  })).optional()
});