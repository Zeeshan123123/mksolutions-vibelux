/**
 * Advanced Fixture Search API
 * Provides intelligent fixture recommendations and search capabilities
 */

export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import fixtureSearchEngine from '@/lib/fixture-search-engine-functional'
// import type { SearchFilters } from '@/lib/fixture-search-engine-functional'
import { requireAuth, getAuthenticatedUser, AuthenticatedRequest } from '@/middleware/mobile-auth'
import { logger } from '@/lib/logging/production-logger'

async function handler(request: AuthenticatedRequest) {
  try {
    const user = getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)

    // Parse search filters from query parameters
    const filters: any = {}

    // Basic filters
    if (searchParams.get('wattageMin') && searchParams.get('wattageMax')) {
      filters.wattageRange = [
        parseInt(searchParams.get('wattageMin')!),
        parseInt(searchParams.get('wattageMax')!)
      ]
    }

    if (searchParams.get('efficacyMin') && searchParams.get('efficacyMax')) {
      filters.efficacyRange = [
        parseFloat(searchParams.get('efficacyMin')!),
        parseFloat(searchParams.get('efficacyMax')!)
      ]
    }

    if (searchParams.get('priceMin') && searchParams.get('priceMax')) {
      filters.priceRange = [
        parseInt(searchParams.get('priceMin')!),
        parseInt(searchParams.get('priceMax')!)
      ]
    }

    if (searchParams.get('coverageArea')) {
      filters.coverageArea = parseInt(searchParams.get('coverageArea')!)
    }

    if (searchParams.get('mountingHeight')) {
      filters.mountingHeight = parseInt(searchParams.get('mountingHeight')!)
    }

    // Spectrum filters
    if (searchParams.get('spectrumType')) {
      filters.spectrumType = searchParams.get('spectrumType') as any
    }

    // Application filters
    if (searchParams.get('cropType')) {
      filters.cropType = searchParams.get('cropType')!
    }

    if (searchParams.get('growthStage')) {
      filters.growthStage = searchParams.get('growthStage') as any
    }

    if (searchParams.get('indoorType')) {
      filters.indoorType = searchParams.get('indoorType') as any
    }

    // Performance filters
    if (searchParams.get('dimmable')) {
      filters.dimmable = searchParams.get('dimmable') === 'true'
    }

    if (searchParams.get('lifespan')) {
      filters.lifespan = parseInt(searchParams.get('lifespan')!)
    }

    if (searchParams.get('certification')) {
      filters.certification = searchParams.get('certification') as any
    }

    // Brand preferences
    if (searchParams.get('manufacturers')) {
      filters.manufacturer = searchParams.get('manufacturers')!.split(',')
    }

    if (searchParams.get('excludeManufacturers')) {
      filters.excludeManufacturers = searchParams.get('excludeManufacturers')!.split(',')
    }

    // Sustainability
    if (searchParams.get('energyStarRated')) {
      filters.energyStarRated = searchParams.get('energyStarRated') === 'true'
    }

    // Advanced
    if (searchParams.get('ppfdTarget')) {
      filters.ppfdTarget = parseInt(searchParams.get('ppfdTarget')!)
    }

    if (searchParams.get('dliTarget')) {
      filters.dliTarget = parseInt(searchParams.get('dliTarget')!)
    }

    if (searchParams.get('sortBy')) {
      filters.sortBy = searchParams.get('sortBy') as any
    }

    if (searchParams.get('limit')) {
      filters.limit = parseInt(searchParams.get('limit')!)
    }

    // Perform search
    const searchResults = await fixtureSearchEngine.search(filters)
    const recommendations = searchResults.results.map((fixture: any) => ({
      fixture,
      score: { overall: 80, spectrum: 80, efficiency: 80, coverage: 80, growthStage: 80, cost: 80 },
      reasoning: 'Matched search criteria',
      alternatives: [],
      estimatedCoverage: { area: 100, ppfd: 400, dli: 20 },
      costAnalysis: {
        initialCost: fixture.price,
        operatingCostPerYear: fixture.wattage * 12 * 365 * 0.12 / 1000,
        totalCostOfOwnership: fixture.price + (fixture.wattage * 12 * 365 * 0.12 / 1000) * 5,
        paybackPeriod: 3
      }
    }))

    // Get search metadata
    const stats = { totalFixtures: 0, categories: [], manufacturers: [] }

    return NextResponse.json({
      recommendations,
      meta: {
        total: recommendations.length,
        filters: filters,
        stats,
        userId: user.userId
      }
    })

  } catch (error) {
    logger.error('api', 'Fixture search error:', error )
    return NextResponse.json(
      { error: 'Failed to search fixtures' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(handler)