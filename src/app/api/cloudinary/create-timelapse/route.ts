import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import { createGrowthTimelapse } from '@/lib/cloudinary';
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { imageUrls, plantInfo } = await request.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 image URLs are required for time-lapse creation' },
        { status: 400 }
      );
    }

    // Create growth time-lapse with Cloudinary
    const timelapseResult = await createGrowthTimelapse(imageUrls);

    // Create metadata for the time-lapse
    const timelapseMetadata = {
      plantInfo: plantInfo || {},
      frameCount: imageUrls.length,
      duration: `${imageUrls.length * 0.5}s`, // 0.5 seconds per frame
      createdAt: new Date().toISOString(),
      zone: plantInfo?.zone || 'unknown'
    };

    return NextResponse.json({
      success: true,
      videoUrl: timelapseResult.videoUrl,
      frames: timelapseResult.frames,
      metadata: timelapseMetadata,
      message: `Time-lapse created from ${imageUrls.length} plant growth images`
    });

  } catch (error) {
    logger.error('api', 'Time-lapse creation API error:', error );
    return NextResponse.json(
      { error: 'Failed to create growth time-lapse' },
      { status: 500 }
    );
  }
}