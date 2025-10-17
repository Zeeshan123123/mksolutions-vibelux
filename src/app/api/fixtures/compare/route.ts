/**
 * Fixture Comparison API
 * Provides advanced comparison and analysis of LED grow lights
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
export const dynamic = 'force-dynamic'
import { logger } from '@/lib/logging/production-logger';
import { FixtureAnalyzer, AnalysisParams } from '@/lib/analysis/fixture-analyzer'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fixtureIds, analysisParams } = body

    if (!Array.isArray(fixtureIds) || fixtureIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 fixture IDs are required for comparison' },
        { status: 400 }
      )
    }

    if (fixtureIds.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 fixtures can be compared at once' },
        { status: 400 }
      )
    }

    // Get fixtures from database
    const fixtures = await prisma.fixture.findMany({
      where: {
        id: {
          in: fixtureIds
        }
      }
    })

    if (fixtures.length !== fixtureIds.length) {
      return NextResponse.json(
        { error: 'One or more fixtures not found' },
        { status: 404 }
      )
    }

    // Prepare fixtures data for analysis
    const fixturesForAnalysis = fixtures.map(fixture => ({
      id: fixture.id,
      name: fixture.model, // Use model as name since name field doesn't exist
      brand: fixture.manufacturer,
      model: fixture.model,
      wattage: fixture.power, // Use power since wattage doesn't exist
      ppfd: (fixture as any).ppfd || 0, // Add fallback since field doesn't exist
      price: (fixture as any).price || 0, // Add fallback since field doesn't exist
      coverageArea: (fixture as any).coverageArea || 0, // Add fallback since field doesn't exist
      efficiency: (fixture as any).efficiency || 0, // Add fallback since field doesn't exist
      spectrum: {
        fullSpectrum: true, // Default assumption
        peakWavelengths: [450, 660, 730], // Default peaks
        redBlueRatio: 1.2
      },
      dimmable: (fixture as any).dimmable || false,
      cooling: (fixture as any).cooling || 'Passive',
      warranty: (fixture as any).warranty || 3,
      weight: (fixture as any).weight || 15,
      features: (fixture as any).features || ['Full Spectrum', 'Energy Efficient']
    }))

    // Set default analysis parameters if not provided
    const defaultParams: AnalysisParams = {
      growStage: 'all',
      spaceSize: 16, // 4x4 default
      budget: 500,
      priority: 'efficiency',
      experience: 'intermediate'
    }

    const params = { ...defaultParams, ...analysisParams }

    // Perform comparison analysis
    const comparisonResult = FixtureAnalyzer.compareFixtures(fixturesForAnalysis, params)

    // Calculate additional metrics
    const metrics = {
      averageEfficiency: fixturesForAnalysis.reduce((sum, f) => sum + (f.ppfd / f.wattage), 0) / fixturesForAnalysis.length,
      priceRange: {
        min: Math.min(...fixturesForAnalysis.map(f => f.price)),
        max: Math.max(...fixturesForAnalysis.map(f => f.price))
      },
      powerRange: {
        min: Math.min(...fixturesForAnalysis.map(f => f.wattage)),
        max: Math.max(...fixturesForAnalysis.map(f => f.wattage))
      },
      coverageRange: {
        min: Math.min(...fixturesForAnalysis.map(f => f.coverageArea)),
        max: Math.max(...fixturesForAnalysis.map(f => f.coverageArea))
      }
    }

    // Generate recommendations
    const recommendations = {
      bestEfficiency: fixturesForAnalysis.reduce((best, current) =>
        (current.ppfd / current.wattage) > (best.ppfd / best.wattage) ? current : best
      ),
      bestValue: fixturesForAnalysis.reduce((best, current) =>
        (current.price / current.ppfd) < (best.price / best.ppfd) ? current : best
      ),
      largestCoverage: fixturesForAnalysis.reduce((best, current) =>
        current.coverageArea > best.coverageArea ? current : best
      )
    }

    return NextResponse.json({
      comparison: comparisonResult,
      fixtures: fixturesForAnalysis,
      metrics,
      recommendations,
      analysisParams: params,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('api', 'Fixture comparison error:', error )

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to compare fixtures' },
      { status: 500 }
    )
  }
}

// Get comparison presets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'popular'

    let whereClause = {}

    switch (category) {
      case 'budget':
        whereClause = {
          price: {
            lte: 300
          }
        }
        break
      case 'premium':
        whereClause = {
          price: {
            gte: 500
          }
        }
        break
      case 'efficient':
        whereClause = {
          efficiency: {
            gte: 2.5
          }
        }
        break
      case 'commercial':
        whereClause = {
          wattage: {
            gte: 400
          }
        }
        break
      default:
        // Popular fixtures
        whereClause = {}
    }

    const fixtures = await prisma.fixture.findMany({
      where: whereClause,
      orderBy: [
        { power: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 12
    })

    // Create suggested comparison sets
    const comparisonSets: any[] = []

    // Budget comparison
    if (category === 'budget' || category === 'popular') {
      const budgetFixtures = fixtures
        .filter(f => (f as any).price <= 300)
        .slice(0, 3)

      if (budgetFixtures.length >= 2) {
        comparisonSets.push({
          name: 'Budget Champions',
          description: 'Best value fixtures under $300',
          fixtures: budgetFixtures.map(f => ({
            id: f.id,
            name: f.model,
            price: (f as any).price,
            wattage: f.power,
            ppfd: (f as any).ppfd
          }))
        })
      }
    }

    // High-efficiency comparison
    const efficientFixtures = fixtures
      .sort((a, b) => (((a as any).ppfd || 0) / a.power) - (((b as any).ppfd || 0) / b.power))
      .slice(0, 3)

    if (efficientFixtures.length >= 2) {
      comparisonSets.push({
        name: 'Efficiency Leaders',
        description: 'Most efficient PPFD per watt',
        fixtures: efficientFixtures.map(f => ({
          id: f.id,
          name: f.model,
          price: (f as any).price || 0,
          wattage: f.power,
          ppfd: (f as any).ppfd || 0,
          efficiency: ((f as any).ppfd || 0) / f.power
        }))
      })
    }

    // Coverage comparison
    const coverageFixtures = fixtures
      .sort((a, b) => ((b as any).coverageArea || 0) - ((a as any).coverageArea || 0))
      .slice(0, 3)

    if (coverageFixtures.length >= 2) {
      comparisonSets.push({
        name: 'Coverage Kings',
        description: 'Largest coverage areas',
        fixtures: coverageFixtures.map(f => ({
          id: f.id,
          name: f.model,
          price: (f as any).price || 0,
          wattage: f.power,
          coverageArea: (f as any).coverageArea || 0
        }))
      })
    }

    return NextResponse.json({
      category,
      comparisonSets,
      totalFixtures: fixtures.length
    })

  } catch (error) {
    logger.error('api', 'Comparison presets error:', error )
    return NextResponse.json(
      { error: 'Failed to load comparison presets' },
      { status: 500 }
    )
  }
}