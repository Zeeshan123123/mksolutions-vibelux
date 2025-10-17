import { z } from 'zod';
import {
  cuidSchema,
  nameSchema,
  descriptionSchema,
  spaceTypeSchema,
  experimentStatusSchema,
  growthStageSchema,
  trimString,
  safeHtml,
  optionalNullable,
  coordinatesSchema,
  emailSchema
} from './common';

// Project schemas
export const projectCreateSchema = z.object({
  name: trimString.min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').regex(/^[a-zA-Z0-9\s\-\.']+$/, 'Name contains invalid characters'),
  description: optionalNullable(safeHtml.max(1000)),
  settings: z.object({
    defaultUnits: z.object({
      temperature: z.enum(['celsius', 'fahrenheit']).optional(),
      area: z.enum(['sqft', 'sqm']).optional(),
      volume: z.enum(['gallons', 'liters']).optional()
    }).optional(),
    // Relaxed at build time to avoid zod method collisions during prerender
    alertThresholds: z.object({
      temperature: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }).optional(),
      humidity: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }).optional()
    }).optional()
  }).optional()
});

export const projectUpdateSchema = projectCreateSchema.partial();

// Space schemas
export const spaceCreateSchema = z.object({
  name: nameSchema,
  type: spaceTypeSchema,
  area: z.number().positive('Area must be positive').max(100000, 'Area too large'),
  height: z.number().positive('Height must be positive').max(100, 'Height too large'),
  projectId: cuidSchema,
  location: coordinatesSchema.optional(),
  environmentalSettings: z.object({
    targetTemperature: z.number().min(10).max(40).optional(),
    targetHumidity: z.number().min(0).max(100).optional(),
    targetCO2: z.number().min(200).max(2000).optional(),
    targetVPD: z.number().min(0).max(5).optional()
  }).optional()
});

export const spaceUpdateSchema = spaceCreateSchema.partial().omit({ projectId: true });

// Fixture schemas
export const fixtureCreateSchema = z.object({
  model: trimString.max(100),
  manufacturer: trimString.max(100),
  power: z.number().positive('Power must be positive').max(2000, 'Power too high'),
  spaceId: cuidSchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }),
  spectralCharacteristics: z.object({
    uvb280_315: z.number().min(0).optional(),
    uva315_400: z.number().min(0).optional(),
    blue400_500: z.number().min(0).optional(),
    green500_600: z.number().min(0).optional(),
    red600_700: z.number().min(0).optional(),
    farRed700_800: z.number().min(0).optional()
  }).optional(),
  controlSettings: z.object({
    dimmable: z.boolean().optional(),
    minDimLevel: z.number().min(0).max(100).optional(),
    maxDimLevel: z.number().min(0).max(100).optional(),
    controllable: z.boolean().optional()
  }).optional()
});

export const fixtureUpdateSchema = fixtureCreateSchema.partial().omit({ spaceId: true });

// Experiment schemas
export const experimentCreateSchema = z.object({
  name: nameSchema,
  description: optionalNullable(descriptionSchema),
  projectId: cuidSchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  hypothesis: optionalNullable(safeHtml.max(1000)),
  methodology: optionalNullable(safeHtml.max(2000)),
  targetMetrics: z.array(z.object({
    metric: z.string(),
    targetValue: z.number(),
    unit: z.string()
  })).optional(),
  controlGroups: z.array(z.object({
    name: nameSchema,
    description: optionalNullable(safeHtml.max(500)),
    size: z.number().int().positive()
  })).optional()
}).refine(data => {
  if (data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, 'End date must be after start date');

export const experimentUpdateSchema = z.object({
  name: optionalNullable(nameSchema),
  description: optionalNullable(descriptionSchema),
  endDate: z.string().datetime().optional(),
  status: experimentStatusSchema.optional(),
  results: optionalNullable(safeHtml.max(5000)),
  conclusions: optionalNullable(safeHtml.max(2000))
});

// Measurement schemas
export const measurementCreateSchema = z.object({
  experimentId: cuidSchema,
  timestamp: z.string().datetime().optional(), // Optional, defaults to now
  metricType: z.enum(['HEIGHT', 'WEIGHT', 'YIELD', 'QUALITY', 'CUSTOM']),
  value: z.number(),
  unit: trimString.max(20),
  notes: optionalNullable(safeHtml.max(500)),
  metadata: z.record(z.any()).optional()
});

export const measurementBatchCreateSchema = z.object({
  experimentId: cuidSchema,
  measurements: z.array(z.object({
    timestamp: z.string().datetime().optional(),
    metricType: z.enum(['HEIGHT', 'WEIGHT', 'YIELD', 'QUALITY', 'CUSTOM']),
    value: z.number(),
    unit: trimString.max(20),
    plantId: z.string().optional(),
    notes: optionalNullable(safeHtml.max(500))
  })).min(1, 'At least one measurement is required').max(1000, 'Too many measurements in batch')
});

// Saved design schemas
export const savedDesignCreateSchema = z.object({
  name: nameSchema,
  description: optionalNullable(descriptionSchema),
  projectId: cuidSchema,
  designData: z.object({
    spaces: z.array(z.any()),
    fixtures: z.array(z.any()),
    layout: z.any()
  }),
  tags: z.array(trimString.max(50)).max(20).optional(),
  isTemplate: z.boolean().optional(),
  shareSettings: z.object({
    isPublic: z.boolean().optional(),
    allowClone: z.boolean().optional(),
    allowComments: z.boolean().optional()
  }).optional()
});

export const savedDesignUpdateSchema = savedDesignCreateSchema.partial().omit({ projectId: true });

// Project collaboration
export const projectCollaboratorAddSchema = z.object({
  projectId: cuidSchema,
  email: emailSchema,
  role: z.enum(['viewer', 'editor', 'admin']),
  permissions: z.array(z.enum([
    'view_project',
    'edit_project',
    'delete_project',
    'manage_collaborators',
    'view_experiments',
    'create_experiments',
    'edit_experiments',
    'delete_experiments'
  ])).optional()
});

// Project analytics query
export const projectAnalyticsQuerySchema = z.object({
  projectId: cuidSchema,
  metrics: z.array(z.enum([
    'yield_trends',
    'environmental_averages',
    'resource_usage',
    'cost_analysis',
    'growth_rates'
  ])).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional()
});

// Project export schema
export const projectExportSchema = z.object({
  projectId: cuidSchema,
  format: z.enum(['json', 'csv', 'excel', 'pdf']),
  includeData: z.object({
    projectDetails: z.boolean().optional(),
    spaces: z.boolean().optional(),
    fixtures: z.boolean().optional(),
    experiments: z.boolean().optional(),
    measurements: z.boolean().optional(),
    analytics: z.boolean().optional()
  }).optional(),
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  }).optional()
});