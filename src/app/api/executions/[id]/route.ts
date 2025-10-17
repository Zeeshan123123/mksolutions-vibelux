import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

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
// GET EXECUTION DETAILS
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
    
    const { id: executionId } = params;
    
    const execution = await prisma.recipeExecution.findUnique({
      where: { id: executionId },
      include: {
        recipe: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
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
            territory: true,
          }
        }
      }
    });
    
    if (!execution) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }
    
    // Check access: user owns execution or created the recipe
    const isExecutor = execution.executorId === dbUser.id;
    const isRecipeCreator = execution.recipe.creatorId === dbUser.id;
    
    if (!isExecutor && !isRecipeCreator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Calculate progress metrics
    const weeksSinceStart = Math.floor(
      (Date.now() - execution.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    
    // Calculate adherence score based on deviations
    const deviations = (execution.deviations as any[]) || [];
    const criticalDeviations = deviations.filter(d => d.impact === 'high').length;
    const adherenceImpact = Math.min(criticalDeviations * 10, 30); // Max -30% for deviations
    const calculatedAdherence = Math.max(0, 100 - adherenceImpact);
    
    const enrichedExecution = {
      ...execution,
      progressMetrics: {
        weeksSinceStart,
        calculatedAdherence,
        totalDeviations: deviations.length,
        criticalDeviations,
        currentWeek: weeksSinceStart + 1,
      }
    };
    
    return NextResponse.json(enrichedExecution);
    
  } catch (error) {
    logger.error('api', 'Execution fetch error:', error );
    return NextResponse.json(
      { error: 'Failed to fetch execution' },
      { status: 500 }
    );
  }
}

// ====================================================================
// UPDATE EXECUTION
// ====================================================================

export async function PATCH(
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
    
    const { id: executionId } = params;
    
    // Verify user owns this execution
    const existingExecution = await prisma.recipeExecution.findUnique({
      where: { 
        id: executionId,
        executorId: dbUser.id, // Only executor can update
      },
      include: {
        recipe: {
          select: {
            id: true,
            results: true,
          }
        }
      }
    });
    
    if (!existingExecution) {
      return NextResponse.json({ error: 'Execution not found or access denied' }, { status: 404 });
    }
    
    const body = await request.json();
    const updateData = UpdateExecutionSchema.parse(body);
    
    // Merge environmental logs (append new ones)
    let mergedEnvironmentalLogs = existingExecution.environmentalLogs as any[];
    if (updateData.environmentalLogs) {
      mergedEnvironmentalLogs = [
        ...(mergedEnvironmentalLogs || []),
        ...updateData.environmentalLogs
      ];
      // Sort by timestamp
      mergedEnvironmentalLogs.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }
    
    // Merge deviations (append new ones)
    let mergedDeviations = existingExecution.deviations as any[];
    if (updateData.deviations) {
      mergedDeviations = [
        ...(mergedDeviations || []),
        ...updateData.deviations
      ];
    }
    
    // Calculate yield and quality variance if results are provided
    let yieldVariance: number | null = null;
    let qualityVariance: number | null = null;
    
    if (updateData.actualResults && existingExecution.recipe.results) {
      const expectedResults = existingExecution.recipe.results as any;
      const actualResults = updateData.actualResults;
      
      // Calculate yield variance
      if (expectedResults.yield?.gramsPerSqft && actualResults.yield?.gramsPerSqft) {
        yieldVariance = ((actualResults.yield.gramsPerSqft - expectedResults.yield.gramsPerSqft) / expectedResults.yield.gramsPerSqft) * 100;
      }
      
      // Calculate quality variance (THC percentage)
      if (expectedResults.quality?.thcPercentage && actualResults.quality?.thcPercentage) {
        qualityVariance = ((actualResults.quality.thcPercentage - expectedResults.quality.thcPercentage) / expectedResults.quality.thcPercentage) * 100;
      }
    }
    
    const updatedExecution = await prisma.recipeExecution.update({
      where: { id: executionId },
      data: {
        ...updateData,
        environmentalLogs: mergedEnvironmentalLogs,
        deviations: mergedDeviations,
        yieldVariance,
        qualityVariance,
        updatedAt: new Date(),
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
    
    // If execution is completed, create/update correlations
    if (updateData.status === 'COMPLETED' && updateData.actualResults) {
      await updateRecipeCorrelations(existingExecution.recipeId, updatedExecution);
    }
    
    return NextResponse.json(updatedExecution);
    
  } catch (error) {
    logger.error('api', 'Execution update error:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update execution' },
      { status: 500 }
    );
  }
}

// ====================================================================
// DELETE EXECUTION
// ====================================================================

export async function DELETE(
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
    
    const { id: executionId } = params;
    
    // Verify user owns this execution and it's not completed
    const existingExecution = await prisma.recipeExecution.findUnique({
      where: { 
        id: executionId,
        executorId: dbUser.id,
      }
    });
    
    if (!existingExecution) {
      return NextResponse.json({ error: 'Execution not found or access denied' }, { status: 404 });
    }
    
    if (existingExecution.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete completed execution' },
        { status: 400 }
      );
    }
    
    await prisma.recipeExecution.delete({
      where: { id: executionId }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    logger.error('api', 'Execution deletion error:', error );
    return NextResponse.json(
      { error: 'Failed to delete execution' },
      { status: 500 }
    );
  }
}

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

async function updateRecipeCorrelations(recipeId: string, execution: any) {
  try {
    // This would implement correlation discovery logic
    // For now, just create placeholder correlations
    
    const actualResults = execution.actualResults;
    const environmentalLogs = execution.environmentalLogs || [];
    
    if (!actualResults || environmentalLogs.length === 0) return;
    
    // Calculate average environmental conditions
    const avgConditions = environmentalLogs.reduce((acc: any, log: any) => {
      acc.temperature += log.temperature;
      acc.humidity += log.humidity;
      acc.vpd += log.vpd;
      acc.co2 += log.co2;
      acc.ppfd += log.ppfd;
      if (log.spectrum) {
        acc.spectrum.red += log.spectrum.red;
        acc.spectrum.blue += log.spectrum.blue;
        acc.spectrum.farRed += log.spectrum.farRed;
      }
      return acc;
    }, {
      temperature: 0,
      humidity: 0,
      vpd: 0,
      co2: 0,
      ppfd: 0,
      spectrum: { red: 0, blue: 0, farRed: 0 }
    });
    
    const logCount = environmentalLogs.length;
    Object.keys(avgConditions).forEach(key => {
      if (key === 'spectrum') {
        Object.keys(avgConditions.spectrum).forEach(specKey => {
          avgConditions.spectrum[specKey] /= logCount;
        });
      } else {
        avgConditions[key] /= logCount;
      }
    });
    
    // Create sample correlations (in production, use proper statistical analysis)
    const correlations = [
      {
        correlationType: 'SPECTRUM_CANNABINOID' as const,
        parameter: 'red_light_percentage',
        outcome: 'thc_percentage',
        correlation: 0.72, // This would be calculated
        confidence: 0.85,
        sampleSize: 1,
      },
      {
        correlationType: 'ENVIRONMENT_YIELD' as const,
        parameter: 'average_vpd',
        outcome: 'grams_per_sqft',
        correlation: 0.68,
        confidence: 0.78,
        sampleSize: 1,
      }
    ];
    
    // Save correlations (would normally check for existing ones and update)
    for (const correlation of correlations) {
      await prisma.recipeCorrelation.create({
        data: {
          recipeId,
          ...correlation,
        }
      });
    }
    
  } catch (error) {
    logger.error('api', 'Correlation update error:', error );
    // Don't throw - correlations are nice-to-have
  }
}