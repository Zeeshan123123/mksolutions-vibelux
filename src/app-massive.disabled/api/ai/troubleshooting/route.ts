import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';

interface SystemData {
  environmental: {
    temperature: number[];
    humidity: number[];
    co2: number[];
    vpd: number[];
  };
  equipment: {
    lighting: any[];
    hvac: any[];
    irrigation: any[];
  };
  plantHealth: {
    healthScore: number;
    issues: any[];
  };
  energy: {
    consumption: number[];
    efficiency: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { facilityId, systemData, analysisType, includePreventiveMaintenance } = await request.json();

    if (!facilityId || !systemData) {
      return NextResponse.json(
        { error: 'Facility ID and system data are required' },
        { status: 400 }
      );
    }

    // Check if Claude API is available
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    const useClaudeAPI = claudeApiKey && claudeApiKey !== 'sk-ant-api-dev-placeholder-key-for-development';

    let diagnosticsResult;

    if (useClaudeAPI) {
      try {
        diagnosticsResult = await generateClaudeDiagnostics(systemData, facilityId, analysisType);
      } catch (error) {
        logger.warn('api', 'Claude API failed, using rule-based diagnostics:', error);
        diagnosticsResult = generateRuleBasedDiagnostics(systemData, facilityId);
      }
    } else {
      diagnosticsResult = generateRuleBasedDiagnostics(systemData, facilityId);
    }

    return NextResponse.json({
      success: true,
      ...diagnosticsResult,
      analysisType: useClaudeAPI ? 'ai_powered' : 'rule_based',
      facilityId,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('api', 'Troubleshooting API error:', error );
    return NextResponse.json(
      { error: 'Failed to run facility diagnostics' },
      { status: 500 }
    );
  }
}

async function generateClaudeDiagnostics(systemData: SystemData, facilityId: string, analysisType: string) {
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  
  // Calculate system statistics for analysis
  const stats = analyzeSystemData(systemData);
  
  const prompt = `You are an expert cannabis facility diagnostics specialist with extensive knowledge of cultivation systems, equipment troubleshooting, and preventive maintenance. Analyze this facility's operational data and identify potential issues.

**Facility Operational Data:**
- Temperature: Avg ${stats.environmental.temperature.avg.toFixed(1)}°F, Range ${stats.environmental.temperature.min.toFixed(1)}-${stats.environmental.temperature.max.toFixed(1)}°F
- Humidity: Avg ${stats.environmental.humidity.avg.toFixed(1)}%, Range ${stats.environmental.humidity.min.toFixed(1)}-${stats.environmental.humidity.max.toFixed(1)}%
- CO₂: Avg ${stats.environmental.co2.avg.toFixed(0)} ppm
- VPD: Avg ${stats.environmental.vpd.avg.toFixed(2)} kPa
- Plant Health Score: ${stats.plantHealth.healthScore}/100
- Energy Efficiency: ${stats.energy.efficiency}%
- Equipment Status: ${stats.equipment.operationalCount}/${stats.equipment.totalCount} systems operational

**Diagnostic Criteria:**
- Environmental parameters outside optimal cultivation ranges
- Equipment performance degradation indicators
- Energy consumption anomalies
- Plant health correlation with environmental factors
- Predictive maintenance requirements

**Analysis Framework:**
1. **Environmental Issues**: Temperature, humidity, CO₂, VPD deviations
2. **Equipment Problems**: HVAC, lighting, irrigation system issues
3. **Plant Health Correlation**: Environmental impact on plant development
4. **System Integration**: Multi-system interaction problems
5. **Energy Efficiency**: Power consumption optimization opportunities

Provide exactly 2 diagnostic results and 4 system statuses in this JSON format:
{
  "diagnostics": [
    {
      "id": "unique-diagnostic-id",
      "category": "environmental|equipment|plant_health|system|energy",
      "severity": "low|medium|high|critical",
      "status": "identified|investigating|resolved|recurring",
      "title": "Issue title",
      "description": "Detailed description of the problem",
      "symptoms": ["Observable symptom 1", "Observable symptom 2"],
      "possibleCauses": ["Potential cause 1", "Potential cause 2"],
      "confidence": 85,
      "detectedAt": "${new Date().toISOString()}",
      "affectedSystems": ["System 1", "System 2"],
      "solutions": [
        {
          "id": "solution-id",
          "title": "Solution title",
          "description": "Solution description",
          "steps": [
            {
              "id": "step-id",
              "order": 1,
              "title": "Step title",
              "description": "Step description",
              "warning": "Optional warning message",
              "expectedResult": "Expected outcome",
              "troubleshootingTips": ["Tip 1", "Tip 2"]
            }
          ],
          "difficulty": "easy|medium|complex",
          "estimatedTime": "2-3 hours",
          "requiredTools": ["Tool 1", "Tool 2"],
          "cost": 150,
          "successRate": 85,
          "prerequisites": ["Requirement 1", "Requirement 2"]
        }
      ],
      "relatedIssues": ["Related issue 1"],
      "preventionTips": ["Prevention tip 1", "Prevention tip 2"]
    }
  ],
  "systemStatuses": [
    {
      "system": "HVAC System",
      "status": "healthy|warning|error|offline",
      "lastCheck": "${new Date().toISOString()}",
      "metrics": {
        "performance": 94,
        "reliability": 96,
        "efficiency": 88
      }
    }
  ]
}

Focus on practical, actionable diagnostics that facility operators can understand and implement. Prioritize issues that directly impact plant health, facility safety, or operational efficiency.`;

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
    return {
      diagnostics: result.diagnostics || [],
      systemStatuses: result.systemStatuses || []
    };
  }
  
  throw new Error('Failed to parse Claude response');
}

function generateRuleBasedDiagnostics(systemData: SystemData, facilityId: string) {
  const diagnostics: any[] = [];
  const systemStatuses: any[] = [];
  const stats = analyzeSystemData(systemData);

  // Environmental diagnostics
  if (stats.environmental.temperature.avg > 80 || stats.environmental.temperature.avg < 65) {
    const isHigh = stats.environmental.temperature.avg > 80;
    diagnostics.push({
      id: `temp-${isHigh ? 'high' : 'low'}-${Date.now()}`,
      category: 'environmental',
      severity: isHigh ? 'high' : 'medium',
      status: 'identified',
      title: `${isHigh ? 'Elevated' : 'Low'} Temperature Detected`,
      description: `Average temperature of ${stats.environmental.temperature.avg.toFixed(1)}°F is outside optimal growing range`,
      symptoms: [
        `Temperature readings consistently ${isHigh ? 'above 80°F' : 'below 65°F'}`,
        `${isHigh ? 'Increased' : 'Decreased'} plant transpiration rates observed`,
        'Environmental sensors showing consistent pattern'
      ],
      possibleCauses: isHigh ? [
        'HVAC system capacity insufficient for heat load',
        'Lighting system generating excessive heat',
        'Poor ventilation or air circulation',
        'External temperature affecting indoor climate'
      ] : [
        'HVAC heating system malfunction',
        'Heat loss through building envelope',
        'Insufficient insulation in growing areas',
        'Cold drafts affecting temperature zones'
      ],
      confidence: 88,
      detectedAt: new Date().toISOString(),
      affectedSystems: ['HVAC System', 'Environmental Monitoring', 'Plant Health'],
      solutions: [{
        id: 'temp-solution-001',
        title: isHigh ? 'Temperature Reduction Protocol' : 'Heating System Enhancement',
        description: isHigh ? 'Implement cooling strategies to reduce growing area temperature' : 'Improve heating efficiency and temperature stability',
        steps: [
          {
            id: 'temp-step-001',
            order: 1,
            title: isHigh ? 'Assess HVAC Cooling Capacity' : 'Check Heating System Operation',
            description: isHigh ? 'Evaluate current cooling system performance and capacity' : 'Verify heating system functionality and efficiency',
            expectedResult: isHigh ? 'Cooling system capacity assessment complete' : 'Heating system status confirmed',
            troubleshootingTips: [
              isHigh ? 'Check air filter condition and airflow rates' : 'Verify thermostat calibration and settings',
              isHigh ? 'Measure supply and return air temperatures' : 'Check for blocked heating vents or ducts'
            ]
          }
        ],
        difficulty: 'medium',
        estimatedTime: '2-4 hours',
        requiredTools: ['Thermometer', 'Airflow meter', 'Multimeter'],
        cost: isHigh ? 300 : 200,
        successRate: 85,
        prerequisites: ['HVAC system knowledge', 'Safety equipment']
      }],
      relatedIssues: ['Humidity variations', 'Plant stress indicators'],
      preventionTips: [
        'Monitor temperature trends daily',
        'Schedule regular HVAC maintenance',
        'Install backup temperature monitoring'
      ]
    });
  }

  // Equipment diagnostics
  if (stats.equipment.operationalCount < stats.equipment.totalCount) {
    diagnostics.push({
      id: `equipment-offline-${Date.now()}`,
      category: 'equipment',
      severity: 'medium',
      status: 'identified',
      title: 'Equipment Systems Offline',
      description: `${stats.equipment.totalCount - stats.equipment.operationalCount} equipment systems are not operational`,
      symptoms: [
        'Equipment status indicators showing offline status',
        'Reduced system performance in affected areas',
        'Alert notifications from monitoring systems'
      ],
      possibleCauses: [
        'Power supply issues to equipment',
        'Communication failures with control systems',
        'Equipment maintenance mode activation',
        'Component failures requiring repair'
      ],
      confidence: 92,
      detectedAt: new Date().toISOString(),
      affectedSystems: ['Equipment Control', 'Facility Operations'],
      solutions: [{
        id: 'equipment-solution-001',
        title: 'Equipment Status Recovery Protocol',
        description: 'Systematic approach to restore offline equipment to operational status',
        steps: [
          {
            id: 'equipment-step-001',
            order: 1,
            title: 'Equipment Status Assessment',
            description: 'Identify specific equipment that is offline and assess reasons',
            expectedResult: 'Complete list of offline equipment with status details',
            troubleshootingTips: [
              'Check control panel status indicators',
              'Review equipment logs for error messages'
            ]
          }
        ],
        difficulty: 'medium',
        estimatedTime: '1-3 hours',
        requiredTools: ['Diagnostic tools', 'Equipment manuals'],
        cost: 100,
        successRate: 90,
        prerequisites: ['Equipment documentation', 'System access credentials']
      }],
      relatedIssues: ['System performance degradation'],
      preventionTips: [
        'Implement proactive equipment monitoring',
        'Schedule regular maintenance checks',
        'Maintain spare parts inventory'
      ]
    });
  }

  // Generate system statuses
  const systems = [
    {
      name: 'HVAC System',
      basePerformance: 85,
      factors: [
        stats.environmental.temperature.avg > 80 ? -15 : 0,
        stats.environmental.humidity.avg > 70 ? -10 : 0
      ]
    },
    {
      name: 'Lighting System',
      basePerformance: 90,
      factors: [
        stats.energy.efficiency < 80 ? -10 : 0
      ]
    },
    {
      name: 'Irrigation System',
      basePerformance: 95,
      factors: [
        stats.plantHealth.healthScore < 80 ? -5 : 0
      ]
    },
    {
      name: 'Environmental Monitoring',
      basePerformance: 92,
      factors: []
    }
  ];

  systems.forEach(system => {
    const performance = Math.max(50, system.basePerformance + system.factors.reduce((sum, factor) => sum + factor, 0));
    const reliability = Math.min(100, performance + 5);
    const efficiency = Math.min(100, performance - 2);
    
    const status = performance >= 90 ? 'healthy' : 
                  performance >= 75 ? 'warning' : 
                  performance >= 60 ? 'error' : 'offline';

    systemStatuses.push({
      system: system.name,
      status,
      lastCheck: new Date().toISOString(),
      metrics: {
        performance: Math.round(performance),
        reliability: Math.round(reliability),
        efficiency: Math.round(efficiency)
      }
    });
  });

  return {
    diagnostics: diagnostics.slice(0, 3),
    systemStatuses
  };
}

function analyzeSystemData(systemData: SystemData) {
  const calculateStats = (values: number[]) => {
    if (!values || values.length === 0) return { avg: 0, min: 0, max: 0 };
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { avg, min, max };
  };

  return {
    environmental: {
      temperature: calculateStats(systemData.environmental?.temperature || [75, 76, 77]),
      humidity: calculateStats(systemData.environmental?.humidity || [55, 58, 60]),
      co2: calculateStats(systemData.environmental?.co2 || [1200, 1250, 1300]),
      vpd: calculateStats(systemData.environmental?.vpd || [1.0, 1.1, 1.2])
    },
    plantHealth: {
      healthScore: systemData.plantHealth?.healthScore || 85
    },
    energy: {
      efficiency: systemData.energy?.efficiency || 78
    },
    equipment: {
      totalCount: 12,
      operationalCount: 11
    }
  };
}