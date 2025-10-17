import { z } from 'zod';

// Common schemas
export const idSchema = z.string().min(1).max(100);
export const emailSchema = z.string().email().max(255);
export const urlSchema = z.string().url().max(2048);
export const dateSchema = z.string().datetime();
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// User-related schemas
export const userCreateSchema = z.object({
  email: emailSchema,
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'admin']).default('user'),
  metadata: z.record(z.unknown()).optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: emailSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Project-related schemas
export const projectCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['indoor', 'greenhouse', 'vertical']).default('indoor'),
  settings: z.object({
    units: z.enum(['metric', 'imperial']).default('metric'),
    currency: z.string().length(3).default('USD'),
  }).optional(),
});

export const projectUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  settings: z.record(z.unknown()).optional(),
});

// Design-related schemas
export const fixtureSchema = z.object({
  id: idSchema,
  x: z.number(),
  y: z.number(),
  z: z.number(),
  rotation: z.number().min(0).max(360).default(0),
  model: z.string().max(100),
  power: z.number().positive(),
  ppfd: z.number().positive().optional(),
});

export const roomSchema = z.object({
  width: z.number().positive().max(1000),
  height: z.number().positive().max(100),
  length: z.number().positive().max(1000),
  reflectivity: z.number().min(0).max(1).default(0.7),
});

export const designSaveSchema = z.object({
  projectId: idSchema,
  name: z.string().min(1).max(200),
  room: roomSchema,
  fixtures: z.array(fixtureSchema).max(10000),
  metadata: z.record(z.unknown()).optional(),
});

// API-specific schemas
export const aiGenerateSchema = z.object({
  prompt: z.string().min(10).max(1000),
  context: z.object({
    room: roomSchema.optional(),
    cropType: z.string().max(100).optional(),
    budget: z.number().positive().optional(),
  }).optional(),
  options: z.object({
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().int().min(100).max(4000).default(1000),
  }).optional(),
});

export const fileUploadSchema = z.object({
  filename: z.string().max(255),
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  size: z.number().int().positive().max(10 * 1024 * 1024), // 10MB max
});

// Calculation schemas
export const ppfdCalculationSchema = z.object({
  fixtures: z.array(fixtureSchema),
  room: roomSchema,
  gridSize: z.number().positive().max(10).default(1),
  height: z.number().positive().max(100),
});

export const costAnalysisSchema = z.object({
  fixtures: z.array(z.object({
    id: idSchema,
    quantity: z.number().int().positive(),
    unitCost: z.number().positive(),
    powerConsumption: z.number().positive(),
  })),
  electricity: z.object({
    rate: z.number().positive(),
    hours: z.number().positive().max(24),
    days: z.number().int().positive().max(365),
  }),
  labor: z.object({
    installationHours: z.number().positive(),
    hourlyRate: z.number().positive(),
  }).optional(),
});

// Export all schemas
export const schemas = {
  common: {
    id: idSchema,
    email: emailSchema,
    url: urlSchema,
    date: dateSchema,
    pagination: paginationSchema,
  },
  user: {
    create: userCreateSchema,
    update: userUpdateSchema,
  },
  project: {
    create: projectCreateSchema,
    update: projectUpdateSchema,
  },
  design: {
    fixture: fixtureSchema,
    room: roomSchema,
    save: designSaveSchema,
  },
  api: {
    aiGenerate: aiGenerateSchema,
    fileUpload: fileUploadSchema,
  },
  calculation: {
    ppfd: ppfdCalculationSchema,
    cost: costAnalysisSchema,
  },
};

// Helper function to validate request body
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return { data: null, error: errors.join(', ') };
    }
    
    return { data: result.data, error: null };
  } catch (e) {
    return { data: null, error: 'Invalid JSON body' };
  }
}

// Helper function to validate query parameters
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { data: T | null; error: string | null } {
  const params = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(params);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    return { data: null, error: errors.join(', ') };
  }
  
  return { data: result.data, error: null };
}