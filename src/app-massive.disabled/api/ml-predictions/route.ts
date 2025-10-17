/**
 * ML Predictions API
 * Generate AI-powered predictions for agricultural operations
 */
import { NextRequest, NextResponse } from 'next/server';
import { mlPredictionService } from '@/services/ml-prediction.service';
import { logger } from '@/lib/logging/production-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilityId, predictionType, timeHorizon, inputData } = body;

    if (!facilityId || !predictionType || !inputData) {
      return NextResponse.json({
        error: 'Missing required fields: facilityId, predictionType, inputData'
      }, { status: 400 });
    }

    const predictionRequest = {
      facilityId,
      predictionType,
      timeHorizon: timeHorizon || '30d',
      inputData
    };

    const result = await mlPredictionService.generatePrediction(predictionRequest);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('api', 'Prediction generation failed:', error);
    
    return NextResponse.json({
      error: 'Failed to generate prediction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json({
        error: 'facilityId parameter is required'
      }, { status: 400 });
    }

    // Return available prediction types and their descriptions
    const availablePredictions = {
      yield: {
        name: 'Yield Prediction',
        description: 'Predict crop yield based on environmental and plant health data',
        requiredInputs: ['cropType', 'plantingDate', 'currentGrowthStage', 'environmentalData', 'nutrientLevels', 'plantHealth'],
        timeHorizons: ['7d', '30d', '90d', '1y']
      },
      energy_consumption: {
        name: 'Energy Consumption Forecast',
        description: 'Forecast facility energy usage patterns and costs',
        requiredInputs: ['facilitySize', 'equipmentList', 'historicalUsage', 'weatherForecast', 'productionSchedule'],
        timeHorizons: ['7d', '30d', '90d']
      },
      pest_risk: {
        name: 'Pest Risk Assessment',
        description: 'Assess pest infestation risk based on environmental and historical data',
        requiredInputs: ['cropType', 'currentSeason', 'environmentalConditions', 'pestHistory'],
        timeHorizons: ['7d', '30d', '90d']
      },
      harvest_timing: {
        name: 'Optimal Harvest Timing',
        description: 'Predict optimal harvest windows for maximum quality and yield',
        requiredInputs: ['cropType', 'plantingDate', 'maturityIndicators'],
        timeHorizons: ['7d', '30d']
      },
      environmental_optimization: {
        name: 'Environmental Optimization',
        description: 'Optimize growing conditions for maximum efficiency',
        requiredInputs: ['currentConditions', 'cropRequirements', 'facilityCaps'],
        timeHorizons: ['7d', '30d']
      },
      crop_quality: {
        name: 'Crop Quality Prediction',
        description: 'Predict final crop quality and marketability',
        requiredInputs: ['cropType', 'growingConditions', 'managementPractices'],
        timeHorizons: ['30d', '90d']
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        facilityId,
        availablePredictions,
        modelVersions: {
          yield_prediction: 'v2.1',
          energy_consumption: 'v1.8',
          pest_risk_assessment: 'v3.0',
          harvest_timing: 'v2.5',
          environmental_optimization: 'v1.4',
          crop_quality: 'v2.2'
        }
      }
    });

  } catch (error) {
    logger.error('api', 'Failed to get prediction info:', error);
    
    return NextResponse.json({
      error: 'Failed to retrieve prediction information'
    }, { status: 500 });
  }
}