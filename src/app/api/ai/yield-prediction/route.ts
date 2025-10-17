import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
import { yieldPrediction } from '@/lib/ai/yield-prediction-service';
import { requireAccess } from '@/lib/auth/access-control';
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check access and credits
    const accessCheck = await requireAccess('ai-yield-prediction', {
      module: 'advanced-analytics',
      credits: { type: 'reports', amount: 30 }, // 30 credits per prediction
      userId: userId
    });
    
    if (!accessCheck.allowed) {
      return NextResponse.json({
        error: 'Access denied',
        message: accessCheck.reason,
        upgradeRequired: accessCheck.upgradeRequired
      }, { status: 403 });
    }

    const body = await req.json();
    const { facilityId, zoneId } = body;

    if (!facilityId) {
      return NextResponse.json(
        { error: 'Facility ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to facility
    const facility = await prisma.facility.findFirst({
      where: {
        id: facilityId,
        users: {
          some: { userId }
        }
      },
      // TODO: Fix zones database schema
      // include: {
      //   zones: zoneId ? {
      //     where: { id: zoneId }
      //   } : true
      // }
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found or access denied' },
        { status: 403 }
      );
    }

    // TODO: Fix zones and cropBatch database schema
    // const zone = zoneId ? facility.zones.find(z => z.id === zoneId) : facility.zones[0];
    // if (!zone) {
    //   return NextResponse.json(
    //     { error: 'Zone not found' },
    //     { status: 404 }
    //   );
    // }

    // Get crop batch information
    const cropBatch = null;
    // const cropBatch = await prisma.cropBatch.findFirst({
    //   where: {
    //     zoneId: zone.id,
    //     status: 'active'
    //   },
    //   orderBy: { plantingDate: 'desc' }
    // });

    if (!cropBatch) {
      return NextResponse.json(
        { error: 'No active crop batch found in this zone' },
        { status: 400 }
      );
    }

    // Get environmental data (last 7 days average)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sensorReadings = await prisma.sensorReading.findMany({
      where: {
        facilityId,
        timestamp: { gte: weekAgo }
      }
    });

    // Calculate environmental averages
    const environmentalAverages = {
      temperature: getAverage(sensorReadings.filter(r => r.sensorType === 'temperature')),
      humidity: getAverage(sensorReadings.filter(r => r.sensorType === 'humidity')),
      ppfd: getAverage(sensorReadings.filter(r => r.sensorType === 'ppfd')),
      co2: getAverage(sensorReadings.filter(r => r.sensorType === 'co2')) || 400,
      vpd: calculateVPD(
        getAverage(sensorReadings.filter(r => r.sensorType === 'temperature')),
        getAverage(sensorReadings.filter(r => r.sensorType === 'humidity'))
      ),
      photoperiod: 18,
      dli: calculateDLI(
        getAverage(sensorReadings.filter(r => r.sensorType === 'ppfd')),
        18
      ),
      ec: getAverage(sensorReadings.filter(r => r.sensorType === 'ec')),
      ph: getAverage(sensorReadings.filter(r => r.sensorType === 'ph')),
    };

    // Prepare prediction input with default values
    const predictionInput = {
      facilityId,
      cropType: 'cannabis',
      area: 100,
      plantCount: 100,
      plantingDate: new Date(),
      currentStage: 'vegetative' as any,
      cultivar: 'generic',
    };

    // Get yield prediction
    const prediction = await yieldPrediction.predictYield(
      userId,
      predictionInput,
      environmentalAverages
    );

    // TODO: Fix yieldPredictionLog database schema
    // await prisma.yieldPredictionLog.create({
    //   data: {
    //     facilityId,
    //     zoneId: zone.id,
    //     cropBatchId: cropBatch.id,
    //     userId,
    //     prediction: prediction.prediction,
    //     factors: prediction.factors,
    //     optimization: prediction.optimization,
    //     environmentalData: environmentalAverages,
    //     confidence: prediction.prediction.confidence,
    //   }
    // });

    // Create notification if yield is below expectations
    const yieldPerSqFt = prediction.prediction.yieldPerSqFt;
    const comparison = prediction.comparison;
    
    if (comparison.percentile < 40) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'yield_alert',
          title: 'Below Average Yield Projected',
          message: `Current yield projection (${yieldPerSqFt.toFixed(2)} lbs/sq ft) is below industry average. ${prediction.optimization.improvements[0]?.action || 'Review optimization suggestions.'}`,
          data: JSON.stringify({
            facilityId,
            zoneId: 'temp',
            prediction: prediction.prediction,
            topImprovement: prediction.optimization.improvements[0]
          })
        }
      });
    }

    return NextResponse.json({
      success: true,
      ...prediction,
      facilityData: {
        facilityId,
        zoneId: 'temp',
        cropBatch: {
          id: 'temp',
          type: 'cannabis',
          cultivar: 'generic',
          plantingDate: new Date(),
          currentStage: 'vegetative'
        }
      },
      environmentalAverages,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('api', 'Yield prediction error:', error );
    return NextResponse.json(
      { error: 'Failed to generate yield predictions' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { facilityId, actualYield, harvestDate, cropBatchId } = body;

    if (!facilityId || !actualYield || !harvestDate) {
      return NextResponse.json(
        { error: 'Facility ID, actual yield, and harvest date are required' },
        { status: 400 }
      );
    }

    // Track yield progress
    const result = await yieldPrediction.trackYieldProgress(
      facilityId,
      actualYield,
      new Date(harvestDate)
    );

    // TODO: Fix cropBatch database schema
    // if (cropBatchId) {
    //   await prisma.cropBatch.update({
    //     where: { id: cropBatchId },
    //     data: {
    //       actualYield,
    //       harvestDate: new Date(harvestDate),
    //       status: 'harvested'
    //     }
    //   });
    // }

    // TODO: Fix harvest database schema
    // await prisma.harvest.create({
    //   data: {
    //     facilityId,
    //     cropBatchId,
    //     actualYield,
    //     harvestDate: new Date(harvestDate),
    //     quality: body.quality || 'A',
    //     notes: body.notes,
    //     userId
    //   }
    // });

    return NextResponse.json({
      success: true,
      accuracy: result.accuracy,
      learnings: result.learnings,
      message: `Yield tracking complete. Prediction accuracy: ${result.accuracy.toFixed(1)}%`
    });

  } catch (error) {
    logger.error('api', 'Error tracking yield:', error );
    return NextResponse.json(
      { error: 'Failed to track yield progress' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const facilityId = searchParams.get('facilityId');
    const cropType = searchParams.get('cropType');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'Facility ID is required' },
        { status: 400 }
      );
    }

    // TODO: Fix yieldPredictionLog database schema
    const predictions: any[] = [];
    // const predictions = await prisma.yieldPredictionLog.findMany({
    //   where: {
    //     facilityId,
    //     ...(cropType && { cropBatch: { cropType } })
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   take: 20,
    //   include: {
    //     cropBatch: true
    //   }
    // });

    // TODO: Fix harvest database schema
    const harvests: any[] = [];
    // const harvests = await prisma.harvest.findMany({
    //   where: {
    //     facilityId,
    //     ...(cropType && { cropBatch: { cropType } })
    //   },
    //   orderBy: { harvestDate: 'desc' },
    //   take: 20,
    //   include: {
    //     cropBatch: true
    //   }
    // });

    // Calculate accuracy trends
    const accuracyData = predictions
      .filter(p => p.actualYield)
      .map(p => ({
        date: p.createdAt,
        predicted: p.prediction.expectedYield,
        actual: p.actualYield,
        accuracy: p.accuracy || 0,
        cropType: p.cropBatch?.cropType
      }));

    // Get current predictions
    const activePredictions = predictions.filter(p => !p.actualYield);

    return NextResponse.json({
      activePredictions,
      historicalPredictions: predictions,
      harvests,
      accuracyTrends: accuracyData,
      statistics: {
        averageAccuracy: accuracyData.length > 0 
          ? accuracyData.reduce((sum, d) => sum + d.accuracy, 0) / accuracyData.length 
          : null,
        totalHarvests: harvests.length,
        averageYield: harvests.length > 0
          ? harvests.reduce((sum, h) => sum + h.actualYield, 0) / harvests.length
          : null
      }
    });

  } catch (error) {
    logger.error('api', 'Error fetching yield data:', error );
    return NextResponse.json(
      { error: 'Failed to fetch yield data' },
      { status: 500 }
    );
  }
}

// Helper functions
function getAverage(readings: any[]): number {
  if (readings.length === 0) return 0;
  return readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
}

function calculateVPD(tempC: number, rh: number): number {
  const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  const avp = (rh / 100) * svp;
  return svp - avp;
}

function calculateDLI(ppfd: number, photoperiod: number): number {
  // DLI = PPFD × photoperiod × 3600 / 1,000,000
  return (ppfd * photoperiod * 3600) / 1000000;
}