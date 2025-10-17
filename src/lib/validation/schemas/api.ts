import { z } from 'zod';
import {
  cuidSchema,
  paginationSchema,
  dateRangeSchema,
  temperatureSchema,
  humiditySchema,
  co2Schema,
  ppfdSchema,
  phSchema,
  ecSchema,
  vpdSchema,
  trimString,
  apiKeySchema
} from './common';

// API Authentication schemas
export const apiAuthSchema = z.object({
  apiKey: apiKeySchema,
  timestamp: z.number().refine(val => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return Math.abs(now - val) < fiveMinutes;
  }, 'Request timestamp is too old'),
  signature: z.string().optional()
});

// Sensor data submission schemas
export const sensorDataSubmitSchema = z.object({
  deviceId: trimString.max(100),
  readings: z.array(z.object({
    timestamp: z.string().datetime().optional(),
    temperature: temperatureSchema.optional(),
    humidity: humiditySchema.optional(),
    co2: co2Schema.optional(),
    light: ppfdSchema.optional(),
    ph: phSchema.optional(),
    ec: ecSchema.optional(),
    vpd: vpdSchema.optional(),
    customMetrics: z.record(z.number()).optional()
  })).min(1).max(1000, 'Too many readings in batch'),
  location: z.object({
    facilityId: cuidSchema,
    zone: trimString.max(50).optional(),
    position: z.object({
      x: z.number().optional(),
      y: z.number().optional(),
      z: z.number().optional()
    }).optional()
  })
});

// Environmental data query schemas
export const environmentalDataQuerySchema = z.object({
  facilityId: cuidSchema,
  zones: z.array(trimString.max(50)).optional(),
  metrics: z.array(z.enum([
    'temperature',
    'humidity',
    'co2',
    'light',
    'ph',
    'ec',
    'vpd'
  ])).optional(),
  aggregation: z.enum(['raw', 'minute', 'hour', 'day', 'week']).optional(),
  includeStats: z.boolean().optional()
}).merge(dateRangeSchema).merge(paginationSchema);

// Alert configuration schemas
export const alertConfigSchema = z.object({
  facilityId: cuidSchema,
  name: trimString.max(100),
  type: z.enum(['threshold', 'anomaly', 'pattern', 'system']),
  conditions: z.array(z.object({
    metric: z.string(),
    operator: z.enum(['gt', 'gte', 'lt', 'lte', 'eq', 'neq', 'between']),
    value: z.number(),
    value2: z.number().optional(), // For 'between' operator
    duration: z.number().optional() // Minutes the condition must persist
  })).min(1),
  actions: z.array(z.object({
    type: z.enum(['email', 'sms', 'webhook', 'push', 'control']),
    target: z.string(),
    message: trimString.max(500).optional(),
    controlAction: z.object({
      deviceId: z.string(),
      command: z.string(),
      parameters: z.record(z.any())
    }).optional()
  })).min(1),
  enabled: z.boolean().default(true),
  cooldown: z.number().min(0).max(1440).optional() // Minutes before alert can trigger again
});

// Lighting control API schemas
export const lightingControlSchema = z.object({
  fixtureId: trimString.max(100),
  commands: z.object({
    power: z.boolean().optional(),
    intensity: z.number().min(0).max(100).optional(),
    spectrum: z.object({
      red: z.number().min(0).max(100).optional(),
      green: z.number().min(0).max(100).optional(),
      blue: z.number().min(0).max(100).optional(),
      white: z.number().min(0).max(100).optional(),
      farRed: z.number().min(0).max(100).optional(),
      uv: z.number().min(0).max(100).optional()
    }).optional(),
    schedule: z.object({
      startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      rampTime: z.number().min(0).max(60).optional() // Minutes
    }).optional()
  })
});

// Batch operations schemas
export const batchOperationSchema = z.object({
  operations: z.array(z.object({
    id: z.string(),
    method: z.enum(['POST', 'PUT', 'PATCH', 'DELETE']),
    path: z.string().regex(/^\/api\/v\d+\/[\w\/\-]+$/, 'Invalid API path'),
    body: z.any().optional()
  })).min(1).max(100, 'Too many operations in batch'),
  transactional: z.boolean().default(false)
});

// Webhook configuration schemas
export const webhookConfigSchema = z.object({
  url: z.string().url().refine(url => {
    const u = new URL(url);
    return u.protocol === 'https:';
  }, 'Webhook URL must use HTTPS'),
  events: z.array(z.enum([
    'sensor.data_received',
    'alert.triggered',
    'alert.resolved',
    'system.maintenance',
    'facility.status_change',
    'experiment.milestone',
    'harvest.ready',
    'compliance.audit_due'
  ])).min(1),
  headers: z.record(z.string()).optional(),
  secret: z.string().min(32).optional(),
  retryPolicy: z.object({
    maxAttempts: z.number().int().min(1).max(10).default(3),
    backoffMultiplier: z.number().min(1).max(5).default(2)
  }).optional(),
  filters: z.object({
    facilities: z.array(cuidSchema).optional(),
    severities: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional()
  }).optional()
});

// Data export schemas
export const dataExportRequestSchema = z.object({
  dataType: z.enum([
    'sensor_readings',
    'alerts',
    'facility_metrics',
    'experiment_data',
    'financial_records'
  ]),
  format: z.enum(['json', 'csv', 'excel', 'parquet']),
  filters: z.object({
    facilityIds: z.array(cuidSchema).optional(),
    experimentIds: z.array(cuidSchema).optional(),
    metrics: z.array(z.string()).optional()
  }).optional(),
  compression: z.enum(['none', 'gzip', 'zip']).default('none'),
  includeMetadata: z.boolean().default(true),
  chunkSize: z.number().int().min(1000).max(100000).optional()
}).merge(dateRangeSchema);

// AI/ML model inference schemas
export const modelInferenceRequestSchema = z.object({
  modelId: z.enum(['yield_prediction', 'disease_detection', 'growth_optimization']),
  inputs: z.object({
    environmental: z.object({
      temperature: temperatureSchema,
      humidity: humiditySchema,
      co2: co2Schema,
      ppfd: ppfdSchema,
      vpd: vpdSchema.optional()
    }),
    plantData: z.object({
      species: z.string(),
      cultivar: z.string().optional(),
      growthStage: z.enum(['seedling', 'vegetative', 'flowering', 'harvest']),
      daysFromSeed: z.number().int().positive()
    }).optional(),
    images: z.array(z.object({
      url: z.string().url(),
      type: z.enum(['rgb', 'nir', 'thermal', 'multispectral'])
    })).optional()
  }),
  confidence: z.number().min(0).max(1).default(0.8)
});

// Rate limiting headers validation
export const rateLimitHeadersSchema = z.object({
  'x-ratelimit-limit': z.string().regex(/^\d+$/),
  'x-ratelimit-remaining': z.string().regex(/^\d+$/),
  'x-ratelimit-reset': z.string().regex(/^\d+$/)
});

// API error response schema
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    timestamp: z.string().datetime(),
    requestId: z.string()
  })
});

// API key management schemas
export const apiKeyCreateRequestSchema = z.object({
  name: trimString.max(100),
  description: trimString.max(500).optional(),
  permissions: z.array(z.enum([
    'read:sensors',
    'write:sensors',
    'read:facilities',
    'write:facilities',
    'read:experiments',
    'write:experiments',
    'control:lighting',
    'control:environment',
    'manage:alerts',
    'export:data'
  ])).min(1),
  expiresAt: z.string().datetime().optional(),
  ipWhitelist: z.array(z.string().ip()).optional(),
  rateLimit: z.object({
    requests: z.number().int().positive(),
    window: z.enum(['second', 'minute', 'hour', 'day'])
  }).optional()
});

// GraphQL query validation (if using GraphQL)
export const graphqlRequestSchema = z.object({
  query: z.string().min(1),
  variables: z.record(z.any()).optional(),
  operationName: z.string().optional()
});