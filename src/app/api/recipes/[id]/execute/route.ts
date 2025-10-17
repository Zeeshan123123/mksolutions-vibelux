import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

const StartExecutionSchema = z.object({
  startDate: z.string().transform((str) => new Date(str)),
  expectedHarvestDate: z.string().transform((str) => new Date(str)).optional(),
  notes: z.string().optional(),
});

const UpdateExecutionSchema = z.object({
  status: z.enum([
    'PLANNING', 'GERMINATION', 'SEEDLING', 'VEGETATIVE', 
    'PRE_FLOWER', 'FLOWERING', 'HARVEST', 'DRYING', 
    'CURING', 'COMPLETED', 'ABANDONED'
  ]).optional(),
  adherenceScore: z.number().min(0).max(100).optional(),
  deviations: z.array(z.object({
    parameter: z.string(),
    targetValue: z.union([z.number(), z.string()]),
    actualValue: z.union([z.number(), z.string()]),
    week: z.number(),
    impact: z.enum(['low', 'medium', 'high']),
    reason: z.string().optional(),
  })).optional(),
  environmentalLogs: z.array(z.object({
    timestamp: z.string().transform((str) => new Date(str)),
    temperature: z.number(),
    humidity: z.number(),
    vpd: z.number(),
    co2: z.number(),
    ppfd: z.number(),
    spectrum: z.object({
      blue: z.number(),
      green: z.number(),
      red: z.number(),
      farRed: z.number(),
      uvA: z.number(),
      uvB: z.number(),
    }).optional(),
  })).optional(),
  actualResults: z.object({
    yield: z.object({
      totalGrams: z.number(),
      gramsPerWatt: z.number(),
      gramsPerSqft: z.number(),
      dryWeight: z.number(),
      wetWeight: z.number(),
    }),
    quality: z.object({
      thcPercentage: z.number(),
      cbdPercentage: z.number(),
      totalCannabinoids: z.number(),
      terpeneProfile: z.array(z.object({
        name: z.string(),
        percentage: z.number(),
        preservationScore: z.number(),
      })),
      visualQuality: z.number().min(1).max(10),
      aromaIntensity: z.number().min(1).max(10),
    }),
  }).optional(),
  actualHarvestDate: z.string().transform((str) => new Date(str)).optional(),
  labResultsUrl: z.string().url().optional(),
  notes: z.string().optional(),
  feedbackToCreator: z.string().optional(),
});

// ====================================================================
// START RECIPE EXECUTION
// ====================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const { id: recipeId } = params;
    const body = await request.json();
    const executionData = StartExecutionSchema.parse(body);
    
    // Verify recipe exists and user has access
    const recipe = await prisma.cultivationRecipe.findUnique({
      where: { id: recipeId },
      include: {
        creator: true,
      }
    });
    
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    // Check if user has purchased the recipe or owns it
    const isOwner = recipe.creatorId === dbUser.id;
    const hasPurchased = !isOwner && await prisma.recipePurchase.findFirst({
      where: {
        recipeId,
        buyerId: dbUser.id,
      }
    });
    
    if (!isOwner && !hasPurchased && !recipe.isPublic) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Create execution record
    const execution = await prisma.recipeExecution.create({
      data: {
        recipeId,
        executorId: dbUser.id,
        purchaseId: hasPurchased ? hasPurchased.id : null,
        status: 'PLANNING',
        startDate: executionData.startDate,
        expectedHarvestDate: executionData.expectedHarvestDate,
        notes: executionData.notes,
      },
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
            strainName: true,
          }
        },
        executor: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    
    return NextResponse.json(execution, { status: 201 });
    
  } catch (error) {
    logger.error('api', 'Recipe execution start error:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to start execution' },
      { status: 500 }
    );
  }
}

// ====================================================================
// GET RECIPE EXECUTIONS (for the recipe owner to see how their recipe is performing)
// ====================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const { id: recipeId } = params;
    
    // Verify recipe exists and user owns it
    const recipe = await prisma.cultivationRecipe.findUnique({
      where: { 
        id: recipeId,
        creatorId: dbUser.id, // Only recipe creator can see all executions
      }
    });
    
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found or access denied' }, { status: 404 });
    }
    
    // Get executions with aggregated data
    const executions = await prisma.recipeExecution.findMany({
      where: { recipeId },
      include: {
        executor: {
          select: {
            id: true,
            name: true,
          }
        },
        purchase: {
          select: {
            id: true,
            usageRights: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Calculate performance metrics
    const completedExecutions = executions.filter(e => e.status === 'COMPLETED');
    const avgAdherence = completedExecutions.length > 0
      ? completedExecutions.reduce((sum, e) => sum + (e.adherenceScore || 0), 0) / completedExecutions.length
      : 0;
    
    // Calculate success rate (comparing actual vs expected results)
    const expectedYield = (recipe.results as any)?.yield?.gramsPerSqft || 0;
    const successfulRuns = completedExecutions.filter(e => {
      const actualYield = (e.actualResults as any)?.yield?.gramsPerSqft || 0;
      return actualYield >= expectedYield * 0.8; // 80% of expected is considered successful
    });
    
    const performanceMetrics = {
      totalExecutions: executions.length,
      completedExecutions: completedExecutions.length,
      successRate: completedExecutions.length > 0 
        ? (successfulRuns.length / completedExecutions.length) * 100 
        : 0,
      averageAdherence: Math.round(avgAdherence * 10) / 10,
      activeExecutions: executions.filter(e => 
        !['COMPLETED', 'ABANDONED'].includes(e.status)
      ).length,
    };
    
    return NextResponse.json({
      executions,
      performanceMetrics,
    });
    
  } catch (error) {
    logger.error('api', 'Recipe executions fetch error:', error );
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}