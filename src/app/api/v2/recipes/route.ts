import { NextRequest, NextResponse } from 'next/server'
import { validateAPIKey, generateAPIResponse, generateErrorResponse } from '@/middleware/api-auth'
import apiService from '@/services/public-api-service'
import recipeService from '@/services/recipe-sharing-service'
import { z } from 'zod'
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiKey = req.headers.get('X-API-Key')
    if (!apiKey) {
      return generateErrorResponse('API key required', 401)
    }

    const validation = await apiService.validateRequest(apiKey, '/api/v2/recipes')
    if (!validation.valid) {
      return generateErrorResponse(validation.error || 'Invalid API key', 401)
    }

    // Parse request body
    const body = await req.json()

    // Create recipe
    const result = await recipeService.createRecipe(
      validation.keyData!.id, // Use API key ID as user ID
      body
    )

    return generateAPIResponse({
      id: result.id,
      version: result.version,
      message: 'Recipe created successfully'
    }, {
      endpoint: '/api/v2/recipes',
      rateLimitRemaining: validation.remaining
    })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return generateErrorResponse(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400)
    }
    logger.error('api', 'Recipe creation error:', error )
    return generateErrorResponse(error.message || 'Internal server error', 500)
  }
}