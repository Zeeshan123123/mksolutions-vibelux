import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';

const UpdateRecipeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  strainName: z.string().min(1).optional(),
  strainType: z.enum(['INDICA', 'SATIVA', 'HYBRID', 'AUTOFLOWER', 'CBD_DOMINANT', 'HIGH_THC', 'BALANCED']).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  lighting: z.object({}).passthrough().optional(),
  nutrients: z.object({}).passthrough().optional(),
  environment: z.object({}).passthrough().optional(),
  training: z.object({}).passthrough().optional(),
  harvestTiming: z.object({}).passthrough().optional(),
  drying: z.object({}).passthrough().optional(),
  curing: z.object({}).passthrough().optional(),
  results: z.object({}).passthrough().optional(),
  pricing: z.object({}).passthrough().optional(),
  verification: z.object({}).passthrough().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

// ====================================================================
// GET SINGLE RECIPE
// ====================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const recipe = await prisma.cultivationRecipe.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
              }
            },
            execution: {
              select: {
                id: true,
                status: true,
                adherenceScore: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        executions: {
          select: {
            id: true,
            status: true,
            startDate: true,
            adherenceScore: true,
            actualResults: true,
          },
          where: {
            status: 'COMPLETED'
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        correlations: {
          orderBy: {
            confidence: 'desc'
          }
        },
        _count: {
          select: {
            purchases: true,
            executions: true,
            favorites: true,
            reviews: true,
          }
        }
      }
    });
    
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    // Check if recipe is public or user owns it
    const user = await currentUser();
    const isOwner = user && recipe.creator.id === user.id;
    
    if (!recipe.isPublic && !isOwner) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    // Calculate metrics
    const averageRating = recipe.reviews.length > 0 
      ? recipe.reviews.reduce((sum, r) => sum + r.rating, 0) / recipe.reviews.length
      : 0;
    
    const completedExecutions = recipe.executions.filter(e => e.status === 'COMPLETED');
    const averageAdherence = completedExecutions.length > 0
      ? completedExecutions.reduce((sum, e) => sum + (e.adherenceScore || 0), 0) / completedExecutions.length
      : 0;
    
    // Calculate success rate from completed executions
    const successfulExecutions = completedExecutions.filter(e => 
      e.actualResults && 
      (e.actualResults as any).yield?.gramsPerSqft >= (recipe.results as any).yield?.gramsPerSqft * 0.8
    );
    const successRate = completedExecutions.length > 0 
      ? successfulExecutions.length / completedExecutions.length 
      : 0;
    
    const enrichedRecipe = {
      ...recipe,
      metrics: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: recipe._count.reviews,
        totalPurchases: recipe._count.purchases,
        totalExecutions: recipe._count.executions,
        totalFavorites: recipe._count.favorites,
        averageAdherence: Math.round(averageAdherence * 10) / 10,
        successRate: Math.round(successRate * 100),
        completedRuns: completedExecutions.length,
      },
      _count: undefined,
    };
    
    return NextResponse.json(enrichedRecipe);
    
  } catch (error) {
    logger.error('api', 'Recipe fetch error:', error );
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

// ====================================================================
// UPDATE RECIPE
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
    
    const { id } = params;
    
    // Check if user owns the recipe
    const existingRecipe = await prisma.cultivationRecipe.findUnique({
      where: { id },
      include: {
        creator: {
          select: { clerkId: true }
        }
      }
    });
    
    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    if (existingRecipe.creator.clerkId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const updateData = UpdateRecipeSchema.parse(body);
    
    const updatedRecipe = await prisma.cultivationRecipe.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    
    return NextResponse.json(updatedRecipe);
    
  } catch (error) {
    logger.error('api', 'Recipe update error:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

// ====================================================================
// DELETE RECIPE
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
    
    const { id } = params;
    
    // Check if user owns the recipe
    const existingRecipe = await prisma.cultivationRecipe.findUnique({
      where: { id },
      include: {
        creator: {
          select: { clerkId: true }
        },
        _count: {
          select: {
            purchases: true,
            executions: true,
          }
        }
      }
    });
    
    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    if (existingRecipe.creator.clerkId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Prevent deletion if recipe has been purchased or executed
    if (existingRecipe._count.purchases > 0 || existingRecipe._count.executions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete recipe with existing purchases or executions' },
        { status: 400 }
      );
    }
    
    await prisma.cultivationRecipe.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    logger.error('api', 'Recipe deletion error:', error );
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}