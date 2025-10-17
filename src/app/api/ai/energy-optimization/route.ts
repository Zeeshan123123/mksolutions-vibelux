import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, rateLimitHeaders } from '@/lib/security/rate-limit'
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

interface EnergyData {
  powerConsumption: number[];
  costs: number[];
  timestamps: string[];
  rate: number;
  peakHours: { start: string; end: string }[];
  equipment: {
    lighting: number;
    hvac: number;
    other: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rl = await rateLimit(`ai-energy:${ip}`, 120, 10 * 60 * 1000)
    if (!rl.ok) {
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: rateLimitHeaders(rl, 120) })
    }
    const { facilityId, energyData, facilityType, operatingSchedule, timeframe, analysisType } = await request.json();

    if (!facilityId || !energyData) {
      return NextResponse.json(
        { error: 'Facility ID and energy data are required' },
        { status: 400 }
      );
    }

    // Check if Claude API is available
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    const useClaudeAPI = claudeApiKey && claudeApiKey !== 'sk-ant-api-dev-placeholder-key-for-development';

    let optimizations;

    if (useClaudeAPI) {
      try {
        optimizations = await generateClaudeOptimizations(energyData, facilityType, operatingSchedule, timeframe);
      } catch (error) {
        logger.warn('api', 'Claude API failed, using rule-based optimization:', error);
        optimizations = generateRuleBasedOptimizations(energyData, facilityType, operatingSchedule);
      }
    } else {
      optimizations = generateRuleBasedOptimizations(energyData, facilityType, operatingSchedule);
    }

    return NextResponse.json({
      success: true,
      optimizations,
      analysisType: useClaudeAPI ? 'claude_ai' : 'rule_based',
      facilityId,
      timeframe,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('api', 'Energy optimization API error:', error );
    return NextResponse.json(
      { error: 'Failed to generate energy optimizations' },
      { status: 500 }
    );
  }
}

async function generateClaudeOptimizations(
  energyData: EnergyData, 
  facilityType: string, 
  operatingSchedule: any, 
  timeframe: string
) {
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  
  // Calculate energy statistics
  const stats = calculateEnergyStatistics(energyData);
  
  const prompt = `You are an expert energy efficiency consultant specializing in cannabis cultivation facilities. Analyze this facility's energy consumption and provide optimization recommendations.

**Facility Profile:**
- Type: ${facilityType}
- Lighting Schedule: ${operatingSchedule.lightingHours.on} to ${operatingSchedule.lightingHours.off}
- Operating Days: ${operatingSchedule.operatingDays.join(', ')}
- Analysis Period: ${timeframe}

**Energy Consumption Data:**
- Average Power: ${stats.avgPower.toFixed(1)} kW
- Peak Power: ${stats.peakPower.toFixed(1)} kW
- Total Consumption: ${stats.totalConsumption.toFixed(1)} kWh
- Average Cost: $${stats.avgCost.toFixed(2)}/day
- Electricity Rate: $${energyData.rate}/kWh

**Equipment Breakdown:**
- Lighting: ${energyData.equipment.lighting} kW (${((energyData.equipment.lighting / stats.avgPower) * 100).toFixed(1)}%)
- HVAC: ${energyData.equipment.hvac} kW (${((energyData.equipment.hvac / stats.avgPower) * 100).toFixed(1)}%)
- Other: ${energyData.equipment.other} kW (${((energyData.equipment.other / stats.avgPower) * 100).toFixed(1)}%)

**Peak Rate Periods:**
${energyData.peakHours.map(period => `- ${period.start} to ${period.end}`).join('\n')}

**Analysis Guidelines:**
Consider these optimization strategies:
1. **Load Shifting**: Moving non-critical loads to off-peak hours
2. **Demand Management**: Reducing peak demand to lower demand charges
3. **Equipment Efficiency**: Upgrading to more efficient equipment
4. **Smart Controls**: Implementing intelligent control systems
5. **Rate Optimization**: Optimizing for time-of-use rates

Provide exactly 4 optimization recommendations in this JSON format:
{
  "optimizations": [
    {
      "id": "unique-id",
      "category": "lighting|hvac|scheduling|equipment|rate_optimization",
      "type": "immediate|scheduled|long_term",
      "priority": "low|medium|high|critical",
      "title": "Optimization title",
      "description": "Detailed description of the optimization",
      "currentConsumption": 2400,
      "optimizedConsumption": 2100,
      "potentialSavings": {
        "daily": 89.50,
        "monthly": 2685,
        "annual": 32220
      },
      "implementationCost": 2500,
      "paybackPeriod": 6,
      "confidence": 88,
      "difficulty": "easy|medium|complex",
      "requirements": ["Requirement 1", "Requirement 2"],
      "steps": [
        {
          "id": "step-id",
          "title": "Step title",
          "description": "Step description",
          "estimatedTime": "4 hours",
          "cost": 500,
          "completed": false
        }
      ],
      "impact": {
        "energy": 15,
        "cost": 18,
        "carbon": 15
      },
      "timeframe": "Implementation timeframe",
      "detectedAt": "${new Date().toISOString()}"
    }
  ]
}

Focus on:
- High-impact, cost-effective optimizations
- Cannabis cultivation-specific considerations
- Realistic implementation costs and timelines
- Measurable energy and cost savings
- Equipment and operational constraints`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': claudeApiKey!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0].text;
  
  // Extract JSON from Claude's response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const result = JSON.parse(jsonMatch[0]);
    return result.optimizations || [];
  }
  
  throw new Error('Failed to parse Claude response');
}

function generateRuleBasedOptimizations(energyData: EnergyData, facilityType: string, operatingSchedule: any) {
  const optimizations: any[] = [];
  const stats = calculateEnergyStatistics(energyData);

  // Peak hour optimization
  if (energyData.peakHours.length > 0) {
    const peakOverlap = checkLightingPeakOverlap(operatingSchedule.lightingHours, energyData.peakHours);
    if (peakOverlap > 0) {
      optimizations.push({
        id: 'peak-shift',
        category: 'scheduling',
        type: 'immediate',
        priority: 'high',
        title: 'Avoid Peak Rate Hours',
        description: `Shift lighting schedule to avoid ${peakOverlap} hours of peak rates, reducing costs`,
        currentConsumption: stats.avgPower * 24,
        optimizedConsumption: stats.avgPower * 24,
        potentialSavings: {
          daily: stats.avgCost * 0.18,
          monthly: stats.avgCost * 0.18 * 30,
          annual: stats.avgCost * 0.18 * 365
        },
        implementationCost: 0,
        paybackPeriod: 0,
        confidence: 92,
        difficulty: 'easy',
        requirements: ['Timer reprogramming', 'Schedule coordination'],
        steps: [
          {
            id: 'analyze-overlap',
            title: 'Analyze Peak Hour Overlap',
            description: 'Identify optimal lighting schedule to minimize peak rate exposure',
            estimatedTime: '2 hours',
            cost: 0,
            completed: false
          },
          {
            id: 'reprogram-schedule',
            title: 'Reprogram Lighting Schedule',
            description: 'Adjust lighting timers to avoid peak rate periods',
            estimatedTime: '3 hours',
            cost: 0,
            completed: false
          }
        ],
        impact: {
          energy: 0,
          cost: 18,
          carbon: 0
        },
        timeframe: 'Immediate implementation',
        detectedAt: new Date().toISOString()
      });
    }
  }

  // HVAC optimization
  if (energyData.equipment.hvac > stats.avgPower * 0.3) {
    optimizations.push({
      id: 'hvac-optimization',
      category: 'hvac',
      type: 'scheduled',
      priority: 'medium',
      title: 'Smart HVAC Control System',
      description: 'Install smart thermostats and zone controls to reduce HVAC consumption',
      currentConsumption: energyData.equipment.hvac * 24,
      optimizedConsumption: energyData.equipment.hvac * 24 * 0.78,
      potentialSavings: {
        daily: energyData.equipment.hvac * 24 * 0.22 * energyData.rate,
        monthly: energyData.equipment.hvac * 24 * 0.22 * energyData.rate * 30,
        annual: energyData.equipment.hvac * 24 * 0.22 * energyData.rate * 365
      },
      implementationCost: 3500,
      paybackPeriod: Math.ceil(3500 / (energyData.equipment.hvac * 24 * 0.22 * energyData.rate * 30)),
      confidence: 85,
      difficulty: 'medium',
      requirements: ['Smart thermostats', 'Zone sensors', 'Installation'],
      steps: [
        {
          id: 'hvac-audit',
          title: 'HVAC System Audit',
          description: 'Assess current HVAC efficiency and control capabilities',
          estimatedTime: '4 hours',
          cost: 200,
          completed: false
        },
        {
          id: 'install-controls',
          title: 'Install Smart Controls',
          description: 'Deploy smart thermostats and zone control system',
          estimatedTime: '2 days',
          cost: 3300,
          completed: false
        }
      ],
      impact: {
        energy: 22,
        cost: 22,
        carbon: 22
      },
      timeframe: '1-2 weeks implementation',
      detectedAt: new Date().toISOString()
    });
  }

  // LED upgrade opportunity
  if (energyData.equipment.lighting > stats.avgPower * 0.4) {
    const currentEfficiency = 1.8; // Assume HPS efficiency
    const newEfficiency = 2.7; // LED efficiency
    const energySavings = 1 - (currentEfficiency / newEfficiency);
    
    optimizations.push({
      id: 'led-upgrade',
      category: 'equipment',
      type: 'long_term',
      priority: 'medium',
      title: 'LED Lighting Upgrade',
      description: `Upgrade to high-efficiency LEDs for significant lighting energy reduction`,
      currentConsumption: energyData.equipment.lighting * 24,
      optimizedConsumption: energyData.equipment.lighting * 24 * (1 - energySavings),
      potentialSavings: {
        daily: energyData.equipment.lighting * 24 * energySavings * energyData.rate,
        monthly: energyData.equipment.lighting * 24 * energySavings * energyData.rate * 30,
        annual: energyData.equipment.lighting * 24 * energySavings * energyData.rate * 365
      },
      implementationCost: energyData.equipment.lighting * 800, // $800 per kW
      paybackPeriod: Math.ceil((energyData.equipment.lighting * 800) / (energyData.equipment.lighting * 24 * energySavings * energyData.rate * 30)),
      confidence: 90,
      difficulty: 'complex',
      requirements: ['LED fixtures', 'Electrical work', 'Installation crew'],
      steps: [
        {
          id: 'lighting-design',
          title: 'LED Lighting Design',
          description: 'Design optimal LED layout for current growing areas',
          estimatedTime: '1 week',
          cost: energyData.equipment.lighting * 50,
          completed: false
        },
        {
          id: 'fixture-installation',
          title: 'Install LED Fixtures',
          description: 'Professional installation of new LED lighting system',
          estimatedTime: '3-5 days',
          cost: energyData.equipment.lighting * 750,
          completed: false
        }
      ],
      impact: {
        energy: Math.round(energySavings * 100),
        cost: Math.round(energySavings * 100),
        carbon: Math.round(energySavings * 100)
      },
      timeframe: '1-3 months planning + installation',
      detectedAt: new Date().toISOString()
    });
  }

  // Demand management
  if (stats.peakPower > stats.avgPower * 1.3) {
    const demandReduction = stats.peakPower - (stats.avgPower * 1.2);
    optimizations.push({
      id: 'demand-management',
      category: 'rate_optimization',
      type: 'immediate',
      priority: 'high',
      title: 'Peak Demand Management',
      description: `Reduce peak demand by ${demandReduction.toFixed(1)} kW through intelligent load shedding`,
      currentConsumption: stats.avgPower * 24,
      optimizedConsumption: stats.avgPower * 24,
      potentialSavings: {
        daily: demandReduction * 15 * energyData.rate, // Assume $15/kW demand charge
        monthly: demandReduction * 15 * energyData.rate * 30,
        annual: demandReduction * 15 * energyData.rate * 365
      },
      implementationCost: 1500,
      paybackPeriod: Math.ceil(1500 / (demandReduction * 15 * energyData.rate * 30)),
      confidence: 88,
      difficulty: 'medium',
      requirements: ['Demand monitoring', 'Load controllers', 'Smart switches'],
      steps: [
        {
          id: 'demand-monitor',
          title: 'Install Demand Monitoring',
          description: 'Real-time monitoring of facility power demand',
          estimatedTime: '4 hours',
          cost: 800,
          completed: false
        },
        {
          id: 'load-shed-system',
          title: 'Implement Load Shedding',
          description: 'Automated shedding of non-critical loads during peak demand',
          estimatedTime: '8 hours',
          cost: 700,
          completed: false
        }
      ],
      impact: {
        energy: 5,
        cost: 20,
        carbon: 5
      },
      timeframe: '1-2 days implementation',
      detectedAt: new Date().toISOString()
    });
  }

  return optimizations.slice(0, 4); // Return top 4 optimizations
}

function calculateEnergyStatistics(energyData: EnergyData) {
  const consumption = energyData.powerConsumption;
  const costs = energyData.costs;
  
  return {
    avgPower: consumption.reduce((sum, val) => sum + val, 0) / consumption.length,
    peakPower: Math.max(...consumption),
    minPower: Math.min(...consumption),
    totalConsumption: consumption.reduce((sum, val) => sum + val, 0),
    avgCost: costs.reduce((sum, val) => sum + val, 0) / costs.length,
    totalCost: costs.reduce((sum, val) => sum + val, 0)
  };
}

function checkLightingPeakOverlap(lightingHours: any, peakHours: any[]) {
  // Simplified overlap calculation
  const lightStart = parseInt(lightingHours.on.split(':')[0]);
  const lightEnd = parseInt(lightingHours.off.split(':')[0]);
  
  let overlapHours = 0;
  
  peakHours.forEach(peak => {
    const peakStart = parseInt(peak.start.split(':')[0]);
    const peakEnd = parseInt(peak.end.split(':')[0]);
    
    const overlapStart = Math.max(lightStart, peakStart);
    const overlapEnd = Math.min(lightEnd, peakEnd);
    
    if (overlapStart < overlapEnd) {
      overlapHours += overlapEnd - overlapStart;
    }
  });
  
  return overlapHours;
}