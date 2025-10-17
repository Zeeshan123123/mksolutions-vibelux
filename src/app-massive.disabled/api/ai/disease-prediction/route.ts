import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma';
import { diseasePrediction } from '@/lib/ai/disease-prediction-service';
import { requireAccess } from '@/lib/auth/access-control';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check access and credits
    const accessCheck = await requireAccess('ai-disease-prediction', {
      module: 'advanced-analytics',
      credits: { type: 'reports', amount: 25 }, // 25 credits per prediction
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
    const { facilityId, cropType, growthStage } = body;

    if (!facilityId || !cropType) {
      return NextResponse.json(
        { error: 'Facility ID and crop type are required' },
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
      }
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found or access denied' },
        { status: 403 }
      );
    }

    // Get latest environmental conditions
    const latestReadings = await prisma.sensorReading.findMany({
      where: {
        facilityId,
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    if (latestReadings.length === 0) {
      return NextResponse.json(
        { error: 'No recent sensor data available. Please ensure sensors are active.' },
        { status: 400 }
      );
    }

    // Calculate environmental averages
    const environmentalConditions = {
      temperature: getAverage(latestReadings.filter(r => r.sensorType === 'temperature')),
      humidity: getAverage(latestReadings.filter(r => r.sensorType === 'humidity')),
      vpd: calculateVPD(
        getAverage(latestReadings.filter(r => r.sensorType === 'temperature')),
        getAverage(latestReadings.filter(r => r.sensorType === 'humidity'))
      ),
      airflow: getAverage(latestReadings.filter(r => r.sensorType === 'airflow')) || 0.3,
      co2: getAverage(latestReadings.filter(r => r.sensorType === 'co2')),
      lightIntensity: getAverage(latestReadings.filter(r => r.sensorType === 'ppfd')),
      ph: getAverage(latestReadings.filter(r => r.sensorType === 'ph')),
      ec: getAverage(latestReadings.filter(r => r.sensorType === 'ec')),
    };

    // Get disease predictions
    const predictions = await diseasePrediction.predictDiseases(
      userId,
      facilityId,
      environmentalConditions,
      cropType,
      growthStage || 'vegetative'
    );

    // TODO: Fix alert database schema
    // if (predictions.riskScore > 70) {
    //   await prisma.alert.create({
    //     data: {
    //       facilityId,
    //       type: 'disease_risk',
    //       severity: predictions.riskScore > 85 ? 'critical' : 'high',
    //       title: 'High Disease Risk Detected',
    //       message: `Risk score: ${predictions.riskScore}%. ${predictions.criticalActions.join('. ')}`,
    //       data: {
    //         predictions: predictions.predictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical'),
    //         actions: predictions.criticalActions
    //       }
    //     }
    //   });
    // }

    return NextResponse.json({
      success: true,
      ...predictions,
      environmentalConditions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('api', 'Disease prediction error:', error );
    return NextResponse.json(
      { error: 'Failed to generate disease predictions' },
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

    if (!facilityId) {
      return NextResponse.json(
        { error: 'Facility ID is required' },
        { status: 400 }
      );
    }

    // Get real-time monitoring data
    const monitoringData = await diseasePrediction.monitorDiseaseRisk(
      facilityId,
      await getCurrentConditions(facilityId)
    );

    // TODO: Fix DiseasePrediction database schema
    const recentPredictions: any[] = [];
    // const recentPredictions = await prisma.diseasePrediction.findMany({
    //   where: { facilityId },
    //   orderBy: { createdAt: 'desc' },
    //   take: 10,
    //   select: {
    //     id: true,
    //     createdAt: true,
    //     riskScore: true,
    //     predictions: true
    //   }
    // });

    // TODO: Fix diseaseAlert database schema
    const activeAlerts: any[] = [];
    // const activeAlerts = await prisma.diseaseAlert.findMany({
    //   where: {
    //     facilityId,
    //     expiresAt: { gte: new Date() },
    //     acknowledged: false
    //   },
    //   orderBy: { createdAt: 'desc' }
    // });

    return NextResponse.json({
      monitoring: monitoringData,
      history: recentPredictions.map(p => ({
        ...p,
        predictions: JSON.parse(p.predictions as string)
      })),
      activeAlerts,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    logger.error('api', 'Error fetching disease monitoring data:', error );
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
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
  // Saturation vapor pressure at temperature
  const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  // Actual vapor pressure
  const avp = (rh / 100) * svp;
  // VPD in kPa
  return svp - avp;
}

async function getCurrentConditions(facilityId: string) {
  const readings = await prisma.sensorReading.findMany({
    where: {
      facilityId,
      timestamp: {
        gte: new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
      }
    }
  });

  return {
    temperature: getAverage(readings.filter(r => r.sensorType === 'temperature')),
    humidity: getAverage(readings.filter(r => r.sensorType === 'humidity')),
    vpd: calculateVPD(
      getAverage(readings.filter(r => r.sensorType === 'temperature')),
      getAverage(readings.filter(r => r.sensorType === 'humidity'))
    ),
    airflow: getAverage(readings.filter(r => r.sensorType === 'airflow')) || 0.3,
  };
}