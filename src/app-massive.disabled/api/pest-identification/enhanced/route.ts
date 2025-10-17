import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { enhancedPestIdentification } from '@/lib/ai/enhanced-pest-identification';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      imageBase64,
      imageUrl,
      facilityId,
      zoneId,
      cropType,
      growthStage,
      environmentalData,
      suspectedPest,
      symptoms,
      location
    } = await request.json();

    // Validate required fields
    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: 'Either imageBase64 or imageUrl is required' },
        { status: 400 }
      );
    }

    // Convert imageUrl to base64 if needed
    let processedImageBase64 = imageBase64;
    if (imageUrl && !imageBase64) {
      try {
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        processedImageBase64 = Buffer.from(buffer).toString('base64');
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to fetch image from URL' },
          { status: 400 }
        );
      }
    }

    // Verify facility access if facilityId provided
    if (facilityId) {
      const facilityAccess = await prisma.facilityUser.findFirst({
        where: {
          facilityId,
          userId: userId,
        }
      });

      if (!facilityAccess) {
        return NextResponse.json(
          { error: 'Access denied to facility' },
          { status: 403 }
        );
      }
    }

    // Perform enhanced pest identification
    const identificationResult = await enhancedPestIdentification.identifyPest({
      imageBase64: processedImageBase64,
      imageUrl,
      facilityId,
      zoneId,
      cropType,
      growthStage,
      environmentalData,
      suspectedPest,
      symptoms,
      location
    });

    // Log the analysis for tracking
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PEST_IDENTIFICATION',
        entityType: 'PEST_ANALYSIS',
        entityId: identificationResult.metadata.analysisId,
        details: {
          facilityId,
          confidence: identificationResult.identification.confidence,
          species: identificationResult.identification.taxonomy.scientificName,
          requiresReview: identificationResult.metadata.requiresExpertReview
        }
      }
    });

    // Generate alert if critical pest detected
    if (identificationResult.damage.severity === 'critical' || 
        identificationResult.damage.economicThreshold.treatmentRecommended) {
      
      await prisma.notification.create({
        data: {
          userId,
          title: 'Critical Pest Detection Alert',
          message: `${identificationResult.identification.taxonomy.commonName} detected with ${identificationResult.damage.severity} severity. Immediate action recommended.`,
          type: 'PEST_ALERT',
          read: false,
          data: {
            analysisId: identificationResult.metadata.analysisId,
            species: identificationResult.identification.taxonomy.scientificName,
            facilityId,
            zoneId
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      analysis: identificationResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('api', 'Enhanced pest identification error:', error );
    
    return NextResponse.json(
      { 
        error: 'Pest identification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const facilityId = url.searchParams.get('facilityId');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build query conditions
    const where: any = {};
    if (facilityId) {
      // Verify facility access
      const facilityAccess = await prisma.facilityUser.findFirst({
        where: {
          facilityId,
          userId: userId,
        }
      });

      if (!facilityAccess) {
        return NextResponse.json(
          { error: 'Access denied to facility' },
          { status: 403 }
        );
      }

      where.facilityId = facilityId;
    }

    // Get recent pest analyses
    const analyses = await prisma.pestAnalysis.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        facility: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const total = await prisma.pestAnalysis.count({ where });

    return NextResponse.json({
      analyses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    logger.error('api', 'Failed to fetch pest analyses:', error );
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}