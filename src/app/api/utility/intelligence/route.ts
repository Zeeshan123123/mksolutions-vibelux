/**
 * API Route: Utility Intelligence
 * Provides comprehensive utility intelligence including carbon intensity,
 * solar potential, rate optimization, and energy recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
export const dynamic = 'force-dynamic'
import { logger } from '@/lib/logging/production-logger';
import { sql } from '@/lib/db';
import { UtilityIntelligenceService, FacilityProfile } from '@/lib/utility-integration/utility-intelligence-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'Facility ID required' },
        { status: 400 }
      );
    }

    // Get facility data from database
    const facilityResults = await sql`
      SELECT
        f.*,
        eo.target_reduction,
        eo.baseline_kwh,
        uc.provider_id as current_utility,
        STRING_AGG(ub.rate_schedule, ', ') as current_rates
      FROM facilities f
      LEFT JOIN energy_optimization_config eo ON f.id = eo.facility_id
      LEFT JOIN utility_connections uc ON f.id = uc.facility_id AND uc.connection_status = 'active'
      LEFT JOIN utility_bills ub ON uc.id = ub.connection_id
      WHERE f.id = ${facilityId}
      AND f.user_id = ${userId}
      GROUP BY f.id, eo.target_reduction, eo.baseline_kwh, uc.provider_id
    `;

    const facility = (facilityResults as any[])[0];

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Get historical usage data
    const usageDataResults = await sql`
      SELECT
        EXTRACT(MONTH FROM bill_date) as month,
        AVG(usage_amount) as avg_usage,
        MAX(demand_amount) as peak_demand
      FROM utility_bills ub
      JOIN utility_connections uc ON ub.connection_id = uc.id
      WHERE uc.facility_id = ${facilityId}
      AND ub.bill_date >= NOW() - INTERVAL '12 months'
      GROUP BY EXTRACT(MONTH FROM bill_date)
      ORDER BY month
    `;

    const usageData = usageDataResults as any[];

    // Create facility profile
    const facilityProfile: FacilityProfile = {
      facilityId: facility.id,
      lat: parseFloat(facility.latitude || '37.7749'), // Default to SF
      lng: parseFloat(facility.longitude || '-122.4194'),
      annualUsage: facility.baseline_kwh || 100000, // Default 100k kWh
      monthlyUsage: Array(12).fill(0).map((_, i) => {
        const monthData = usageData.find((u: any) => u.month === i + 1);
        return monthData?.avg_usage || facility.baseline_kwh / 12 || 8333;
      }),
      peakDemand: Math.max(...usageData.map((u: any) => u.peak_demand || 0)) || 100,
      operatingHours: {
        start: 6,
        end: 22,
        weekdays: true,
        weekends: true
      },
      currentUtility: facility.current_utility || 'unknown',
      currentRate: facility.current_rates?.split(', ')[0],
      hasBackupGeneration: false, // Could be in facility data
      hasBatteryStorage: false,
      solarInstalled: false, // Could be in facility data
      solarCapacity: 0
    };

    // Initialize utility intelligence service
    const intelligenceService = new UtilityIntelligenceService({
      wattTimeToken: process.env.WATTTIME_API_TOKEN,
      electricityMapsToken: process.env.ELECTRICITY_MAPS_API_TOKEN,
      googleSolarApiKey: process.env.GOOGLE_SOLAR_API_KEY!,
      nrelApiKey: process.env.NREL_API_KEY!
    });

    // Get comprehensive intelligence
    const intelligence = await intelligenceService.getUtilityIntelligence(facilityProfile);

    return NextResponse.json({
      facility: {
        id: facility.id,
        name: facility.name,
        location: intelligence.location
      },
      intelligence: {
        ...intelligence,
        // Add computed insights
        insights: {
          carbonEfficiency: intelligence.carbonIntensity ?
            this.calculateCarbonEfficiency(intelligence.carbonIntensity.intensity) : null,
          solarViability: intelligence.solarPotential ?
            this.calculateSolarViability(intelligence.solarPotential) : null,
          costSavingsPotential: intelligence.costOptimization.potentialSavings,
          emissionReductionPotential: intelligence.carbonOptimization.emissionReduction,
          overallScore: this.calculateOverallScore(intelligence)
        }
      }
    });

  } catch (error) {
    logger.error('api', 'Utility intelligence error:', error );
    return NextResponse.json(
      { error: 'Failed to generate utility intelligence' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { facilityId, lat, lng, annualUsage, peakDemand, operatingHours } = body;

    if (!facilityId || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create custom facility profile
    const facilityProfile: FacilityProfile = {
      facilityId,
      lat,
      lng,
      annualUsage: annualUsage || 100000,
      monthlyUsage: Array(12).fill(annualUsage / 12 || 8333),
      peakDemand: peakDemand || 100,
      operatingHours: operatingHours || {
        start: 6,
        end: 22,
        weekdays: true,
        weekends: true
      },
      currentUtility: 'unknown',
      hasBackupGeneration: false,
      hasBatteryStorage: false,
      solarInstalled: false,
      solarCapacity: 0
    };

    // Initialize service
    const intelligenceService = new UtilityIntelligenceService({
      wattTimeToken: process.env.WATTTIME_API_TOKEN,
      electricityMapsToken: process.env.ELECTRICITY_MAPS_API_TOKEN,
      googleSolarApiKey: process.env.GOOGLE_SOLAR_API_KEY!,
      nrelApiKey: process.env.NREL_API_KEY!
    });

    // Get intelligence
    const intelligence = await intelligenceService.getUtilityIntelligence(facilityProfile);

    return NextResponse.json({
      facilityProfile,
      intelligence
    });

  } catch (error) {
    logger.error('api', 'Custom intelligence analysis error:', error );
    return NextResponse.json(
      { error: 'Failed to analyze custom facility' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateCarbonEfficiency(intensity: number): {
  rating: string;
  score: number;
  benchmark: string;
} {
  let rating = 'Poor';
  let benchmark = '';

  if (intensity < 100) {
    rating = 'Excellent';
    benchmark = 'Hydro/Nuclear dominant grid';
  } else if (intensity < 200) {
    rating = 'Very Good';
    benchmark = 'High renewable penetration';
  } else if (intensity < 300) {
    rating = 'Good';
    benchmark = 'Mixed renewable/gas grid';
  } else if (intensity < 500) {
    rating = 'Fair';
    benchmark = 'Natural gas dominant';
  } else {
    rating = 'Poor';
    benchmark = 'Coal/fossil fuel heavy';
  }

  const score = Math.max(0, Math.min(100, ((600 - intensity) / 500) * 100));

  return { rating, score, benchmark };
}

function calculateSolarViability(solar: any): {
  rating: string;
  score: number;
  recommendation: string;
} {
  const payback = solar.financialAnalysis.paybackPeriod;
  const roi = solar.financialAnalysis.roi;

  let rating = 'Poor';
  let recommendation = '';

  if (payback < 5 && roi > 15) {
    rating = 'Excellent';
    recommendation = 'Highly recommended - exceptional returns';
  } else if (payback < 7 && roi > 10) {
    rating = 'Very Good';
    recommendation = 'Recommended - good financial returns';
  } else if (payback < 10 && roi > 5) {
    rating = 'Good';
    recommendation = 'Consider installation - positive returns';
  } else if (payback < 15) {
    rating = 'Fair';
    recommendation = 'Marginal - evaluate other priorities';
  } else {
    rating = 'Poor';
    recommendation = 'Not recommended - poor financial returns';
  }

  const score = Math.max(0, Math.min(100, ((20 - payback) / 15) * 100));

  return { rating, score, recommendation };
}

function calculateOverallScore(intelligence: any): number {
  let score = 0;
  let factors = 0;

  // Carbon efficiency (25%)
  if (intelligence.carbonIntensity) {
    const carbonScore = calculateCarbonEfficiency(intelligence.carbonIntensity.intensity).score;
    score += carbonScore * 0.25;
    factors += 0.25;
  }

  // Solar potential (25%)
  if (intelligence.solarPotential) {
    const solarScore = calculateSolarViability(intelligence.solarPotential).score;
    score += solarScore * 0.25;
    factors += 0.25;
  }

  // Cost optimization (25%)
  const costSavingsPercent = Math.min(50, intelligence.costOptimization.potentialSavings / 1000) * 2;
  score += costSavingsPercent * 0.25;
  factors += 0.25;

  // Carbon optimization (25%)
  const carbonReductionPercent = intelligence.carbonOptimization.reductionPercentage;
  score += Math.min(100, carbonReductionPercent * 2) * 0.25;
  factors += 0.25;

  return factors > 0 ? score / factors : 50;
}