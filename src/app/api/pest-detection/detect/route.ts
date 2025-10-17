/**
 * Pest Detection API
 * AI-powered image analysis for pest identification
 */

import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import { pestDetectionService } from '@/services/pest-detection.service';
import { logger } from '@/lib/logging/production-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { facilityId, zoneId, imageData, detectionMethod, metadata } = body;

    // Validate required fields
    if (!facilityId || !imageData) {
      return NextResponse.json(
        { error: 'facilityId and imageData are required' },
        { status: 400 }
      );
    }

    // Validate image data format
    if (!imageData.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format. Must be base64 encoded image.' },
        { status: 400 }
      );
    }

    // Run pest detection
    const result = await pestDetectionService.detectPests({
      facilityId,
      zoneId,
      imageData,
      detectionMethod: detectionMethod || 'manual',
      timestamp: new Date(),
      metadata
    });

    logger.info('api', `Pest detection completed for facility ${facilityId}`, {
      pestsDetected: result.pestsDetected.length,
      riskLevel: result.overallRisk,
      confidence: result.confidenceScore
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('api', 'Pest detection API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('quality') ? 400 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    const history = await pestDetectionService.getDetectionHistory(facilityId, days);
    const statistics = await pestDetectionService.getPestStatistics(facilityId, days);

    return NextResponse.json({
      success: true,
      data: {
        history,
        statistics,
        period: `${days} days`
      }
    });

  } catch (error) {
    logger.error('api', 'Pest detection history API error:', error);

    return NextResponse.json(
      { error: 'Failed to retrieve pest detection history' },
      { status: 500 }
    );
  }
}