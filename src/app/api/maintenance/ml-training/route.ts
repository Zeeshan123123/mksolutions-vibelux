import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { MLTrainingService, TrainingData, ModelParameters } from '@/lib/ml-training-service';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

// Initialize ML Training Service
const mlTrainingService = new MLTrainingService();

// Validation schemas
const TrainingDataSchema = z.object({
  timestamp: z.string().transform(str => new Date(str)),
  equipmentId: z.string(),
  sensorData: z.object({
    temperature: z.number(),
    vibration: z.number(),
    current: z.number(),
    runtime: z.number(),
    efficiency: z.number(),
  }),
  maintenanceEvents: z.array(z.object({
    type: z.enum(['preventive', 'corrective', 'failure']),
    date: z.string().transform(str => new Date(str)),
    component: z.string().optional(),
    cost: z.number().optional(),
  })),
  environmentalFactors: z.object({
    ambientTemp: z.number(),
    humidity: z.number(),
    dustLevel: z.number(),
  }),
});

const TrainModelSchema = z.object({
  trainingData: z.array(TrainingDataSchema),
  parameters: z.object({
    algorithm: z.enum(['random-forest', 'gradient-boosting', 'neural-network', 'lstm']).optional(),
    hyperparameters: z.record(z.any()).optional(),
    validationSplit: z.number().min(0).max(1).optional(),
  }).optional(),
});

const UpdateModelSchema = z.object({
  modelId: z.string(),
  newData: z.array(TrainingDataSchema),
});

const ExportModelSchema = z.object({
  modelId: z.string(),
});

// GET endpoint - Retrieve trained models and performance history
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');
    const includeHistory = searchParams.get('includeHistory') === 'true';

    // If modelId is provided, get specific model with performance history
    if (modelId) {
      const modelPerformance = mlTrainingService.getModelPerformanceHistory(modelId);
      
      if (!modelPerformance || modelPerformance.length === 0) {
        return NextResponse.json(
          { error: 'Model not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        modelId,
        performanceHistory: modelPerformance,
      });
    }

    // Otherwise, return all available models
    // In a real implementation, this would query from database
    const models = [
      {
        modelId: 'model-default-1',
        version: '1.0.0',
        algorithm: 'gradient-boosting',
        trainedAt: new Date().toISOString(),
        accuracy: 0.92,
        status: 'active',
      }
    ];

    if (includeHistory) {
      const modelsWithHistory = models.map(model => ({
        ...model,
        performanceHistory: mlTrainingService.getModelPerformanceHistory(model.modelId),
      }));
      return NextResponse.json({ models: modelsWithHistory });
    }

    return NextResponse.json({ models });
  } catch (error) {
    logger.error('api', 'Error fetching ML models:', error );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint - Train new models or update existing ones
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Handle model export
    if (action === 'export') {
      const validation = ExportModelSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid request data', details: validation.error.errors },
          { status: 400 }
        );
      }

      try {
        const exportedModel = await mlTrainingService.exportModel(validation.data.modelId);
        
        // Convert ArrayBuffer to base64 for JSON response
        const base64Data = Buffer.from(exportedModel.data).toString('base64');
        
        return NextResponse.json({
          format: exportedModel.format,
          data: base64Data,
          metadata: exportedModel.metadata,
        });
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Export failed' },
          { status: 404 }
        );
      }
    }

    // Handle model update (incremental learning)
    if (action === 'update') {
      const validation = UpdateModelSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid request data', details: validation.error.errors },
          { status: 400 }
        );
      }

      try {
        const updatedModel = await mlTrainingService.updateModel(
          validation.data.modelId,
          validation.data.newData as TrainingData[]
        );
        
        return NextResponse.json({
          success: true,
          model: updatedModel,
        });
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Update failed' },
          { status: 404 }
        );
      }
    }

    // Default action: train new model
    const validation = TrainModelSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    try {
      const trainingResult = await mlTrainingService.trainModel(
        validation.data.trainingData as TrainingData[],
        validation.data.parameters as Partial<ModelParameters>
      );

      return NextResponse.json({
        success: true,
        model: trainingResult,
      }, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Training failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error('api', 'Error in ML training endpoint:', error );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint - Deactivate a model
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');

    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would mark the model as inactive in the database
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: `Model ${modelId} has been deactivated`,
    });
  } catch (error) {
    logger.error('api', 'Error deactivating model:', error );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}