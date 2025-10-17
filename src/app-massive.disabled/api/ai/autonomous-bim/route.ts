import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';
import { AutonomousBIMEngine, ProjectInput } from '@/lib/ai/autonomous-bim-engine';

// Input validation schema
const projectInputSchema = z.object({
  projectType: z.enum(['vertical_cannabis', 'greenhouse_tomato', 'leafy_greens', 'cannabis_flower', 'research_facility']),
  dimensions: z.object({
    length: z.number().min(1).max(200),
    width: z.number().min(1).max(200),
    height: z.number().min(2).max(20)
  }),
  requirements: z.object({
    targetPPFD: z.number().min(50).max(2000),
    photoperiod: z.number().min(8).max(24),
    uniformityTarget: z.number().min(0.5).max(1.0).optional(),
    energyBudget: z.number().positive().optional(),
    cropStages: z.array(z.object({
      name: z.string(),
      durationDays: z.number().positive(),
      ppfdTarget: z.number().positive(),
      dliTarget: z.number().positive(),
      spectrumRequirements: z.object({
        redPercent: z.number().min(0).max(100),
        bluePercent: z.number().min(0).max(100),
        farRedPercent: z.number().min(0).max(100),
        whitePercent: z.number().min(0).max(100)
      }).optional()
    })).optional()
  }),
  constraints: z.object({
    maxFixtures: z.number().positive().optional(),
    maxPower: z.number().positive().optional(),
    aisleWidth: z.number().positive().optional(),
    rackConfiguration: z.object({
      count: z.number().positive(),
      dimensions: z.object({
        length: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive()
      }),
      spacing: z.number().positive(),
      levels: z.number().positive().optional()
    }).optional()
  }).optional(),
  outputRequirements: z.array(z.enum(['bim_model', 'lighting_sim', 'cad_export', 'bom', 'installation_docs']))
});

export async function POST(request: NextRequest) {
  try {
    logger.info('api', '🚀 Autonomous BIM API endpoint called');
    
    const body = await request.json();
    
    // Validate input
    const validationResult = projectInputSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input parameters',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const projectInput: ProjectInput = validationResult.data;
    
    // Log request for monitoring
    logger.info('api', '📊 BIM Design Request:', { data: {
      projectType: projectInput.projectType, dimensions: projectInput.dimensions, targetPPFD: projectInput.requirements.targetPPFD, outputs: projectInput.outputRequirements
    } });

    // Initialize autonomous BIM engine
    const bimEngine = new AutonomousBIMEngine();
    
    // Generate complete design
    const startTime = Date.now();
    const design = await bimEngine.generateCompleteDesign(projectInput);
    const generationTime = Date.now() - startTime;

    logger.info('api', `✅ BIM design generated in ${generationTime}ms`);

    // Prepare response with metrics
    const response = {
      success: true,
      data: design,
      metadata: {
        generationTime: `${generationTime}ms`,
        timestamp: new Date().toISOString(),
        version: '1.0',
        engine: 'VibeLux Autonomous BIM Engine',
        aiModel: 'Claude-4-Opus',
        features: {
          bimIntegration: true,
          forgeOptimization: true,
          cadExport: true,
          professionalBOM: true,
          dlcDatabase: true
        }
      },
      summary: {
        fixtureCount: design.lightingPlan?.fixtures?.length || 0,
        totalPower: design.lightingPlan?.energyAnalysis?.totalPower || 0,
        averagePPFD: design.lightingPlan?.photometrics?.averagePPFD || 0,
        uniformity: design.lightingPlan?.photometrics?.uniformity || 0,
        exportFormats: Object.keys(design.exportFiles || {}),
        deliverables: Object.keys(design.documentation || {})
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    logger.error('api', '❌ Autonomous BIM generation failed:', error );
    
    return NextResponse.json({
      success: false,
      error: 'BIM design generation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET endpoint for checking engine status and capabilities
export async function GET(request: NextRequest) {
  try {
    const capabilities = {
      engine: 'VibeLux Autonomous BIM Engine',
      version: '1.0',
      aiModel: 'Claude-4-Opus',
      integrations: {
        autodeskForge: true,
        formaOptimization: true,
        cadExport: true,
        dlcDatabase: true,
        bomGeneration: true,
        lightingSimulation: true
      },
      supportedProjectTypes: [
        'vertical_cannabis',
        'greenhouse_tomato', 
        'leafy_greens',
        'cannabis_flower',
        'research_facility'
      ],
      outputFormats: [
        'bim_model',
        'lighting_sim', 
        'cad_export',
        'bom',
        'installation_docs'
      ],
      exportFormats: ['dwg', 'ifc', 'revit', 'pdf'],
      limits: {
        maxDimensions: { length: 200, width: 200, height: 20 },
        maxPPFD: 2000,
        maxFixtures: 1000,
        maxPower: 500000 // 500kW
      },
      features: {
        autonomousDesign: true,
        multiObjectiveOptimization: true,
        realTimeValidation: true,
        professionalDocumentation: true,
        codeCompliance: ['NEC', 'IES', 'DLC'],
        cropSpecificDesign: true,
        energyOptimization: true
      }
    };

    return NextResponse.json({
      success: true,
      status: 'operational',
      capabilities,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 'error',
      error: 'Failed to retrieve engine status'
    }, { status: 500 });
  }
}

// Example usage for testing
export const EXAMPLE_REQUEST = {
  projectType: 'vertical_cannabis',
  dimensions: { length: 40, width: 20, height: 4 },
  requirements: {
    targetPPFD: 800,
    photoperiod: 18,
    uniformityTarget: 0.8,
    cropStages: [
      { name: 'vegetative', durationDays: 28, ppfdTarget: 400, dliTarget: 25 },
      { name: 'flowering', durationDays: 60, ppfdTarget: 800, dliTarget: 50 }
    ]
  },
  constraints: {
    maxPower: 50000,
    aisleWidth: 1.2,
    rackConfiguration: {
      count: 6,
      dimensions: { length: 4, width: 1.2, height: 2 },
      spacing: 2.5,
      levels: 4
    }
  },
  outputRequirements: ['bim_model', 'lighting_sim', 'cad_export', 'bom', 'installation_docs']
};