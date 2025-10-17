import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
import { RecipeSearchFilters } from '@/types/recipe-marketplace';

// ====================================================================
// VALIDATION SCHEMAS
// ====================================================================

const CreateRecipeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  strainName: z.string().min(1),
  strainType: z.enum(['INDICA', 'SATIVA', 'HYBRID', 'AUTOFLOWER', 'CBD_DOMINANT', 'HIGH_THC', 'BALANCED']),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('INTERMEDIATE'),
  lighting: z.object({}).passthrough(), // Allow any structure for JSON
  nutrients: z.object({}).passthrough(),
  environment: z.object({}).passthrough(),
  training: z.object({}).passthrough(),
  harvestTiming: z.object({}).passthrough(),
  drying: z.object({}).passthrough(),
  curing: z.object({}).passthrough(),
  results: z.object({}).passthrough(),
  pricing: z.object({}).passthrough(),
  verification: z.object({}).passthrough().optional(),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
});

const SearchFiltersSchema = z.object({
  strainType: z.array(z.string()).optional(),
  difficulty: z.array(z.string()).optional(),
  thcRange: z.tuple([z.number(), z.number()]).optional(),
  cbdRange: z.tuple([z.number(), z.number()]).optional(),
  yieldRange: z.tuple([z.number(), z.number()]).optional(),
  priceRange: z.tuple([z.number(), z.number()]).optional(),
  verified: z.boolean().optional(),
  terpenes: z.array(z.string()).optional(),
  techniques: z.array(z.string()).optional(),
  creator: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().min(1).max(50).default(20),
  sortBy: z.enum(['created', 'updated', 'rating', 'price', 'yield']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ====================================================================
// GET RECIPES (SEARCH & FILTER)
// ====================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const params = Object.fromEntries(searchParams.entries());
    
    // Convert arrays from comma-separated strings
    if (params.strainType) (params as any).strainType = params.strainType.split(',');
    if (params.difficulty) (params as any).difficulty = params.difficulty.split(',');
    if (params.terpenes) (params as any).terpenes = params.terpenes.split(',');
    if (params.techniques) (params as any).techniques = params.techniques.split(',');
    if (params.tags) (params as any).tags = params.tags.split(',');
    
    // Parse number ranges
    if (params.thcRange) {
      const [min, max] = params.thcRange.split(',').map(Number);
      (params as any).thcRange = [min, max];
    }
    if (params.cbdRange) {
      const [min, max] = params.cbdRange.split(',').map(Number);
      (params as any).cbdRange = [min, max];
    }
    if (params.yieldRange) {
      const [min, max] = params.yieldRange.split(',').map(Number);
      (params as any).yieldRange = [min, max];
    }
    if (params.priceRange) {
      const [min, max] = params.priceRange.split(',').map(Number);
      (params as any).priceRange = [min, max];
    }
    
    const filters = SearchFiltersSchema.parse(params);
    
    // Build Prisma where clause
    const where: any = {
      isPublic: true, // Only show public recipes for now
    };
    
    // Apply filters
    if (filters.strainType?.length) {
      where.strainType = { in: filters.strainType };
    }
    
    if (filters.difficulty?.length) {
      where.difficulty = { in: filters.difficulty };
    }
    
    if (filters.verified !== undefined) {
      where.isVerified = filters.verified;
    }
    
    if (filters.creator) {
      where.creator = {
        name: { contains: filters.creator, mode: 'insensitive' }
      };
    }
    
    if (filters.tags?.length) {
      where.tags = { hasSome: filters.tags };
    }
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { strainName: { contains: filters.search, mode: 'insensitive' } },
        { tags: { hasSome: [filters.search] } }
      ];
    }
    
    // Handle JSON field filters (THC, CBD, yield ranges)
    if (filters.thcRange) {
      where.results = {
        path: ['quality', 'thcPercentage'],
        gte: filters.thcRange[0],
        lte: filters.thcRange[1]
      };
    }
    
    // Sort configuration
    const orderBy: any = {};
    switch (filters.sortBy) {
      case 'created':
        orderBy.createdAt = filters.sortOrder;
        break;
      case 'updated':
        orderBy.updatedAt = filters.sortOrder;
        break;
      case 'rating':
        // Note: Would need to calculate average rating
        orderBy.createdAt = filters.sortOrder; // Fallback
        break;
      case 'price':
        orderBy.pricing = {
          path: ['basePrice'],
          sort: filters.sortOrder
        };
        break;
      case 'yield':
        orderBy.results = {
          path: ['yield', 'gramsPerSqft'],
          sort: filters.sortOrder
        };
        break;
    }
    
    // Execute query with pagination
    const [recipes, totalCount] = await Promise.all([
      prisma.cultivationRecipe.findMany({
        where,
        orderBy,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              // Add reputation calculation later
            }
          },
          reviews: {
            select: {
              rating: true,
            }
          },
          _count: {
            select: {
              purchases: true,
              executions: true,
              favorites: true,
            }
          }
        }
      }),
      prisma.cultivationRecipe.count({ where })
    ]);
    
    // Calculate derived metrics
    const recipesWithMetrics = recipes.map(recipe => {
      const averageRating = recipe.reviews.length > 0 
        ? recipe.reviews.reduce((sum, r) => sum + r.rating, 0) / recipe.reviews.length
        : 0;
      
      return {
        ...recipe,
        averageRating: Math.round(averageRating * 10) / 10,
        totalPurchases: recipe._count.purchases,
        totalExecutions: recipe._count.executions,
        totalFavorites: recipe._count.favorites,
        reviews: undefined, // Remove from response
        _count: undefined,
      };
    });
    
    return NextResponse.json({
      recipes: recipesWithMetrics,
      totalCount,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(totalCount / filters.limit),
      },
      filters: {
        // Return available filter options for UI
        appliedFilters: filters,
      }
    });
    
  } catch (error) {
    logger.error('api', 'Recipe search error:', error );
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    );
  }
}

// ====================================================================
// CREATE RECIPE
// ====================================================================

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user exists in our database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const recipeData = CreateRecipeSchema.parse(body);
    
    // Create the recipe
    const recipe = await prisma.cultivationRecipe.create({
      data: {
        ...recipeData,
        creatorId: dbUser.id,
        verification: recipeData.verification || {
          status: 'unverified',
          thirdPartyValidated: false,
          replicationCount: 0,
          peerReviews: 0,
          certificationLevel: 'bronze'
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    
    return NextResponse.json(recipe, { status: 201 });
    
  } catch (error) {
    logger.error('api', 'Recipe creation error:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}