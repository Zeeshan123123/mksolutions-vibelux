import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

const mockLightRecipes = [
  {
    id: 'recipe1',
    name: 'Vegetative Growth',
    type: 'vegetative',
    description: 'Optimized spectrum for vegetative growth phase',
    spectrum: {
      red: 25,
      blue: 35,
      green: 20,
      farRed: 10,
      white: 10
    },
    intensity: 400,
    photoperiod: 18,
    ppfd: 400,
    dli: 25.92
  },
  {
    id: 'recipe2',
    name: 'Flowering Boost',
    type: 'flower',
    description: 'Enhanced red spectrum for flowering phase',
    spectrum: {
      red: 45,
      blue: 20,
      green: 15,
      farRed: 15,
      white: 5
    },
    intensity: 600,
    photoperiod: 12,
    ppfd: 600,
    dli: 25.92
  },
  {
    id: 'recipe3',
    name: 'Clone/Seedling',
    type: 'propagation',
    description: 'Gentle spectrum for young plants',
    spectrum: {
      red: 15,
      blue: 45,
      green: 25,
      farRed: 5,
      white: 10
    },
    intensity: 200,
    photoperiod: 20,
    ppfd: 200,
    dli: 14.4
  }
];

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get('type');
    
    let filteredRecipes = mockLightRecipes;
    if (type) {
      filteredRecipes = mockLightRecipes.filter(recipe => recipe.type === type);
    }

    return NextResponse.json({
      recipes: filteredRecipes,
      total: filteredRecipes.length
    });
  } catch (error) {
    logger.error('api', 'Error getting light recipes:', error );
    return NextResponse.json(
      { error: 'Failed to get light recipes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, description, spectrum, intensity, photoperiod } = body;

    if (!name || !type || !spectrum) {
      return NextResponse.json(
        { error: 'Name, type, and spectrum are required' },
        { status: 400 }
      );
    }

    const newRecipe = {
      id: `recipe${Date.now()}`,
      name,
      type,
      description: description || '',
      spectrum,
      intensity: intensity || 400,
      photoperiod: photoperiod || 18,
      ppfd: intensity || 400,
      dli: ((intensity || 400) * (photoperiod || 18) * 3600) / 1000000
    };

    return NextResponse.json({
      success: true,
      recipe: newRecipe
    });
  } catch (error) {
    logger.error('api', 'Error creating light recipe:', error );
    return NextResponse.json(
      { error: 'Failed to create light recipe' },
      { status: 500 }
    );
  }
}