/**
 * Cannabis AI Knowledge Engine API
 * Specialized cannabis cultivation intelligence
 * Revenue tier: Premium Cannabis ($200K-1M/year)
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
import CannabisKnowledgeEngine, { CannabisGrowCycle, CannabisStrain } from '@/lib/ai/cannabis-knowledge-engine';

// Global cannabis engine instance
let cannabisEngine: CannabisKnowledgeEngine | null = null;

function getCannabisEngine() {
  if (!cannabisEngine) {
    cannabisEngine = new CannabisKnowledgeEngine();
  }
  return cannabisEngine;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const engine = getCannabisEngine();

    switch (action) {
      case 'register_cycle':
        return await handleRegisterCycle(engine, data);
      
      case 'analyze_cycle':
        return await handleAnalyzeCycle(engine, data);
      
      case 'diagnose_issue':
        return await handleDiagnoseIssue(engine, data);
      
      case 'optimize_stage':
        return await handleOptimizeStage(engine, data);
      
      case 'compliance_report':
        return await handleComplianceReport(engine, data);
      
      case 'calculate_roi':
        return await handleCalculateROI(engine, data);
      
      case 'strain_recommendation':
        return await handleStrainRecommendation(engine, data);
      
      default:
        return NextResponse.json({
          error: 'Invalid action',
          availableActions: [
            'register_cycle', 'analyze_cycle', 'diagnose_issue', 
            'optimize_stage', 'compliance_report', 'calculate_roi', 'strain_recommendation'
          ]
        }, { status: 400 });
    }

  } catch (error) {
    logger.error('api', 'Cannabis AI API error:', error );
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleRegisterCycle(engine: CannabisKnowledgeEngine, data: any) {
  const { cycle } = data;

  if (!cycle || !cycle.cycleId || !cycle.strain) {
    return NextResponse.json({
      error: 'Missing required fields: cycle with cycleId and strain'
    }, { status: 400 });
  }

  try {
    engine.registerGrowCycle(cycle as CannabisGrowCycle);

    return NextResponse.json({
      success: true,
      message: `Cannabis grow cycle ${cycle.cycleId} registered successfully`,
      cycle: {
        id: cycle.cycleId,
        strain: cycle.strain.name,
        stage: cycle.currentStage,
        week: cycle.currentWeek,
        plantCount: cycle.plantCount
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to register grow cycle',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleAnalyzeCycle(engine: CannabisKnowledgeEngine, data: any) {
  const { cycleId } = data;

  if (!cycleId) {
    return NextResponse.json({
      error: 'Missing required field: cycleId'
    }, { status: 400 });
  }

  try {
    const optimization = await engine.analyzeGrowCycle(cycleId);

    return NextResponse.json({
      success: true,
      cycleId,
      optimization,
      message: 'Cannabis cycle analysis completed',
      projectedImpacts: optimization.projectedImpacts,
      recommendations: {
        lighting: optimization.recommendations.lighting.length,
        environmental: optimization.recommendations.environmental.length,
        nutrients: optimization.recommendations.nutrients.length,
        training: optimization.recommendations.training.length,
        harvest: optimization.recommendations.harvest.length
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to analyze cannabis cycle',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleDiagnoseIssue(engine: CannabisKnowledgeEngine, data: any) {
  const { cycleId, symptoms, images } = data;

  if (!cycleId || !symptoms || !Array.isArray(symptoms)) {
    return NextResponse.json({
      error: 'Missing required fields: cycleId and symptoms array'
    }, { status: 400 });
  }

  try {
    const issue = await engine.diagnoseIssue(cycleId, symptoms, images);

    return NextResponse.json({
      success: true,
      cycleId,
      issue,
      message: `Cannabis issue diagnosed: ${issue.type} (${issue.severity} severity)`,
      diagnosis: {
        confidence: issue.diagnosis.confidence,
        primaryCause: issue.diagnosis.possibleCauses[0],
        treatment: issue.diagnosis.treatmentOptions[0],
        timeToResolve: issue.resolution.timeToResolve
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to diagnose cannabis issue',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleOptimizeStage(engine: CannabisKnowledgeEngine, data: any) {
  const { cycleId, targetStage } = data;

  if (!cycleId || !targetStage) {
    return NextResponse.json({
      error: 'Missing required fields: cycleId and targetStage'
    }, { status: 400 });
  }

  const validStages = ['clone', 'seedling', 'vegetative', 'pre_flower', 'flower', 'harvest', 'dry', 'cure'];
  if (!validStages.includes(targetStage)) {
    return NextResponse.json({
      error: `Invalid targetStage. Must be one of: ${validStages.join(', ')}`
    }, { status: 400 });
  }

  try {
    const optimization = await engine.optimizeForStage(cycleId, targetStage);

    return NextResponse.json({
      success: true,
      cycleId,
      targetStage,
      optimization,
      message: `Cannabis cycle optimized for ${targetStage} stage`,
      keyRecommendations: optimization.recommendations.lighting.slice(0, 3).map((rec: any) => rec.action)
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to optimize cannabis stage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleComplianceReport(engine: CannabisKnowledgeEngine, data: any) {
  const { cycleId, stateRegulation } = data;

  if (!cycleId || !stateRegulation) {
    return NextResponse.json({
      error: 'Missing required fields: cycleId and stateRegulation'
    }, { status: 400 });
  }

  const supportedStates = ['CA', 'CO', 'WA', 'OR', 'MI', 'IL', 'NV', 'AZ', 'NJ', 'NY'];
  if (!supportedStates.includes(stateRegulation)) {
    return NextResponse.json({
      error: `Unsupported state regulation. Supported states: ${supportedStates.join(', ')}`
    }, { status: 400 });
  }

  try {
    const complianceReport = await engine.generateComplianceReport(cycleId, stateRegulation);

    return NextResponse.json({
      success: true,
      cycleId,
      stateRegulation,
      complianceReport,
      message: `Compliance report generated for ${stateRegulation}`,
      summary: {
        complianceScore: complianceReport.complianceScore,
        actionItems: complianceReport.actionItems.length,
        nextReview: complianceReport.nextReview
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to generate compliance report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleCalculateROI(engine: CannabisKnowledgeEngine, data: any) {
  const { cycleId, marketPrice } = data;

  if (!cycleId || !marketPrice || marketPrice <= 0) {
    return NextResponse.json({
      error: 'Missing required fields: cycleId and marketPrice (must be > 0)'
    }, { status: 400 });
  }

  try {
    const roiAnalysis = await engine.calculateROI(cycleId, marketPrice);

    return NextResponse.json({
      success: true,
      cycleId,
      marketPrice,
      roiAnalysis,
      message: `ROI analysis completed for cycle ${cycleId}`,
      summary: {
        roi: roiAnalysis.roi.toFixed(1) + '%',
        profitPerGram: '$' + roiAnalysis.profitPerGram.toFixed(2),
        profitPerSqFt: '$' + roiAnalysis.profitPerSqFt.toFixed(2),
        breakEven: roiAnalysis.roi > 0 ? 'Profitable' : 'Loss'
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to calculate ROI',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleStrainRecommendation(engine: CannabisKnowledgeEngine, data: any) {
  const { goals, environment, experience, market } = data;

  if (!goals || !environment) {
    return NextResponse.json({
      error: 'Missing required fields: goals and environment'
    }, { status: 400 });
  }

  try {
    const allStrains = engine.getAllStrains();
    
    // Score strains based on criteria
    const scoredStrains = allStrains.map(strain => {
      let score = 0;
      
      // Yield goals
      if (goals.priority === 'yield') {
        score += strain.characteristics.yieldsPerSqFt.max * 2;
      }
      
      // Quality goals
      if (goals.priority === 'quality') {
        score += strain.characteristics.thcRange.max * 3;
      }
      
      // Experience level
      if (experience === 'beginner') {
        score += strain.characteristics.floweringTime < 9 ? 20 : 0; // Shorter flowering = easier
      }
      
      // Environmental match
      if (environment.co2 && environment.co2 > 1000) {
        score += 15; // CO2 enrichment bonus
      }
      
      return { strain, score };
    });

    // Sort by score and take top 5
    const recommendations = scoredStrains
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ strain, score }) => ({
        name: strain.name,
        type: strain.type,
        score: score.toFixed(1),
        characteristics: {
          floweringTime: strain.characteristics.floweringTime,
          yieldRange: strain.characteristics.yieldsPerSqFt,
          thcRange: strain.characteristics.thcRange,
          difficulty: strain.characteristics.floweringTime < 9 ? 'Easy' : 'Moderate'
        },
        reasoning: generateStrainReasoning(strain, goals)
      }));

    return NextResponse.json({
      success: true,
      recommendations,
      message: `${recommendations.length} strain recommendations generated`,
      criteria: { goals, environment, experience, market }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to generate strain recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateStrainReasoning(strain: CannabisStrain, goals: any): string {
  const reasons: string[] = [];
  
  if (goals.priority === 'yield' && strain.characteristics.yieldsPerSqFt.max > 50) {
    reasons.push('High yield potential');
  }
  
  if (goals.priority === 'quality' && strain.characteristics.thcRange.max > 22) {
    reasons.push('Premium potency levels');
  }
  
  if (strain.characteristics.floweringTime <= 8) {
    reasons.push('Fast flowering cycle');
  }
  
  if (strain.type === 'hybrid') {
    reasons.push('Balanced growth characteristics');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'Well-suited for commercial cultivation';
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const cycleId = url.searchParams.get('cycleId');
    const strainName = url.searchParams.get('strain');

    const engine = getCannabisEngine();

    switch (action) {
      case 'active_cycles':
        const activeCycles = engine.getActiveCycles();
        return NextResponse.json({
          success: true,
          activeCycles: activeCycles.map(cycle => ({
            cycleId: cycle.cycleId,
            strain: cycle.strain.name,
            stage: cycle.currentStage,
            week: cycle.currentWeek,
            plantCount: cycle.plantCount,
            complianceScore: cycle.metrics.complianceScore
          }))
        });

      case 'strain_info':
        if (!strainName) {
          return NextResponse.json({
            error: 'Missing required parameter: strain'
          }, { status: 400 });
        }
        
        const strain = engine.getStrain(strainName);
        if (!strain) {
          return NextResponse.json({
            error: `Strain '${strainName}' not found in database`
          }, { status: 404 });
        }
        
        return NextResponse.json({
          success: true,
          strain
        });

      case 'all_strains':
        const allStrains = engine.getAllStrains();
        return NextResponse.json({
          success: true,
          strains: allStrains.map(s => ({
            name: s.name,
            type: s.type,
            floweringTime: s.characteristics.floweringTime,
            yieldRange: s.characteristics.yieldsPerSqFt,
            thcRange: s.characteristics.thcRange
          })),
          total: allStrains.length
        });

      default:
        return NextResponse.json({
          error: 'Invalid or missing action parameter',
          availableActions: ['active_cycles', 'strain_info', 'all_strains']
        }, { status: 400 });
    }

  } catch (error) {
    logger.error('api', 'Cannabis AI GET error:', error );
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}