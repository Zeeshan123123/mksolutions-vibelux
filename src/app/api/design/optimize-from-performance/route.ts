import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
export const dynamic = 'force-dynamic'

// Validation schemas
const optimizeBodySchema = z.object({
  facilityId: z.string().uuid(),
  performanceGoals: z.object({
    primaryGoal: z.enum(['yield', 'efficiency', 'quality', 'cost', 'roi']).optional(),
    targetMetrics: z.record(z.number()).optional(),
  }).optional().default({}),
  constraints: z.object({
    maxInvestment: z.number().positive().optional(),
    maxPaybackMonths: z.number().positive().max(120).optional(),
    excludeCategories: z.array(z.string()).optional(),
    difficultyLevel: z.enum(['easy_only', 'easy_medium', 'all']).optional(),
  }).optional().default({}),
});

const optimizeQuerySchema = z.object({
  facilityId: z.string().uuid(),
});

// POST handler - temporarily disabled for debugging
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Performance optimization temporarily unavailable',
      message: 'This feature is currently being updated. Please try again later.',
      status: 'maintenance'
    },
    { status: 503 }
  );
}

// GET handler - temporarily disabled for debugging  
export async function GET(req: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Performance optimization temporarily unavailable',
      message: 'This feature is currently being updated. Please try again later.',
      status: 'maintenance'
    },
    { status: 503 }
  );
}

// Helper functions temporarily removed - route is in maintenance mode