import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';

interface AnalyticsData {
  temperature: number[];
  humidity: number[];
  co2: number[];
  vpd: number[];
  dli: number[];
  power: number[];
  timestamps: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { data, facilityId, timeRange, analysisType } = await request.json();

    if (!data || !facilityId) {
      return NextResponse.json(
        { error: 'Analytics data and facility ID are required' },
        { status: 400 }
      );
    }

    // Check if Claude API is available
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    const useClaudeAPI = claudeApiKey && claudeApiKey !== 'sk-ant-api-dev-placeholder-key-for-development';

    let insights;

    if (useClaudeAPI) {
      try {
        insights = await generateClaudeInsights(data, facilityId, timeRange);
      } catch (error) {
        logger.warn('api', 'Claude API failed, using rule-based analysis:', error);
        insights = generateRuleBasedInsights(data, timeRange);
      }
    } else {
      insights = generateRuleBasedInsights(data, timeRange);
    }

    return NextResponse.json({
      success: true,
      insights,
      analysisType: useClaudeAPI ? 'claude_ai' : 'rule_based',
      facilityId,
      timeRange,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('api', 'Analytics insights API error:', error );
    return NextResponse.json(
      { error: 'Failed to generate analytics insights' },
      { status: 500 }
    );
  }
}

async function generateClaudeInsights(data: AnalyticsData, facilityId: string, timeRange: string) {
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  
  // Calculate basic statistics
  const stats = calculateDataStatistics(data);
  
  const prompt = `You are an expert cannabis cultivation facility analyst with deep knowledge of environmental controls, energy optimization, and plant health. Analyze this facility data and provide actionable insights.

**Facility Data Summary (${timeRange}):**
- Temperature: Avg ${stats.temperature.avg.toFixed(1)}°F, Range ${stats.temperature.min.toFixed(1)}-${stats.temperature.max.toFixed(1)}°F
- Humidity: Avg ${stats.humidity.avg.toFixed(1)}%, Range ${stats.humidity.min.toFixed(1)}-${stats.humidity.max.toFixed(1)}%
- CO₂: Avg ${stats.co2.avg.toFixed(0)} ppm, Range ${stats.co2.min.toFixed(0)}-${stats.co2.max.toFixed(0)} ppm
- VPD: Avg ${stats.vpd.avg.toFixed(2)} kPa, Range ${stats.vpd.min.toFixed(2)}-${stats.vpd.max.toFixed(2)} kPa
- DLI: Avg ${stats.dli.avg.toFixed(1)} mol/m²/day
- Power: Avg ${stats.power.avg.toFixed(0)} kW, Peak ${stats.power.max.toFixed(0)} kW

**Analysis Context:**
- Optimal cannabis cultivation ranges:
  - Temperature: 70-78°F (lights on), 65-70°F (lights off)
  - Humidity: 40-60% (flowering), 50-70% (vegetative)
  - CO₂: 1000-1500 ppm during lights on
  - VPD: 0.8-1.2 kPa (optimal transpiration)
  - DLI: 35-65 mol/m²/day (depending on growth stage)

Analyze for:
1. **Anomalies**: Values significantly outside optimal ranges
2. **Optimization opportunities**: Ways to improve efficiency or yields
3. **Predictions**: Likely future issues based on trends
4. **Energy optimization**: Ways to reduce power consumption

Provide exactly 3 insights in this JSON format:
{
  "insights": [
    {
      "id": "unique-id",
      "type": "anomaly|optimization|prediction|opportunity",
      "severity": "low|medium|high|critical",
      "title": "Brief descriptive title",
      "description": "Detailed description of the finding",
      "confidence": 85,
      "impact": "low|medium|high",
      "metric": "temperature|humidity|co2|vpd|dli|power",
      "currentValue": 84.2,
      "expectedValue": 76.0,
      "trend": "up|down|stable",
      "timeframe": "Description of when this occurs",
      "recommendations": [
        "Specific actionable recommendation 1",
        "Specific actionable recommendation 2",
        "Specific actionable recommendation 3"
      ],
      "relatedMetrics": ["humidity", "vpd"],
      "detectedAt": "${new Date().toISOString()}"
    }
  ]
}

Focus on practical, actionable insights that can improve facility performance, reduce costs, or prevent problems.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': claudeApiKey!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
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

  const claudeData = await response.json();
  const content = claudeData.content[0].text;
  
  // Extract JSON from Claude's response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const result = JSON.parse(jsonMatch[0]);
    return result.insights || [];
  }
  
  throw new Error('Failed to parse Claude response');
}

function generateRuleBasedInsights(data: AnalyticsData, timeRange: string) {
  const insights: any[] = [];
  const stats = calculateDataStatistics(data);

  // Temperature analysis
  if (stats.temperature.avg > 80) {
    insights.push({
      id: `temp-high-${Date.now()}`,
      type: 'anomaly',
      severity: stats.temperature.avg > 85 ? 'high' : 'medium',
      title: 'Elevated Temperature Detected',
      description: `Average temperature of ${stats.temperature.avg.toFixed(1)}°F exceeds optimal range for cannabis cultivation`,
      confidence: 90,
      impact: 'high',
      metric: 'temperature',
      currentValue: stats.temperature.avg,
      expectedValue: 76,
      trend: 'up',
      timeframe: `Consistent over ${timeRange}`,
      recommendations: [
        'Increase exhaust fan speed or upgrade HVAC capacity',
        'Check for heat leaks from lighting systems',
        'Monitor plants for heat stress symptoms',
        'Consider adjusting light schedule to avoid peak heat hours'
      ],
      relatedMetrics: ['humidity', 'vpd', 'power'],
      detectedAt: new Date().toISOString()
    });
  }

  // Humidity analysis
  if (stats.humidity.avg < 40 || stats.humidity.avg > 70) {
    const isLow = stats.humidity.avg < 40;
    insights.push({
      id: `humidity-${isLow ? 'low' : 'high'}-${Date.now()}`,
      type: 'anomaly',
      severity: 'medium',
      title: `${isLow ? 'Low' : 'High'} Humidity Detected`,
      description: `Humidity at ${stats.humidity.avg.toFixed(1)}% is ${isLow ? 'below' : 'above'} optimal range`,
      confidence: 85,
      impact: 'medium',
      metric: 'humidity',
      currentValue: stats.humidity.avg,
      expectedValue: isLow ? 50 : 55,
      trend: isLow ? 'down' : 'up',
      timeframe: `Average over ${timeRange}`,
      recommendations: isLow ? [
        'Add humidifiers or increase watering frequency',
        'Reduce ventilation during dry periods',
        'Monitor for signs of plant stress'
      ] : [
        'Increase ventilation and air circulation',
        'Add dehumidifiers if necessary',
        'Monitor for mold and mildew development'
      ],
      relatedMetrics: ['temperature', 'vpd'],
      detectedAt: new Date().toISOString()
    });
  }

  // CO2 optimization
  if (stats.co2.avg < 1000) {
    insights.push({
      id: `co2-optimization-${Date.now()}`,
      type: 'optimization',
      severity: 'low',
      title: 'CO₂ Enhancement Opportunity',
      description: `CO₂ levels averaging ${stats.co2.avg.toFixed(0)} ppm could be increased for better photosynthesis`,
      confidence: 80,
      impact: 'medium',
      metric: 'co2',
      currentValue: stats.co2.avg,
      expectedValue: 1200,
      trend: 'stable',
      timeframe: 'During light periods',
      recommendations: [
        'Increase CO₂ injection to 1200-1400 ppm during lights-on',
        'Ensure proper sealing to retain CO₂',
        'Time CO₂ injection with peak photosynthesis periods'
      ],
      relatedMetrics: ['dli', 'temperature'],
      detectedAt: new Date().toISOString()
    });
  }

  // VPD analysis
  if (stats.vpd.avg < 0.8 || stats.vpd.avg > 1.2) {
    const isLow = stats.vpd.avg < 0.8;
    insights.push({
      id: `vpd-${isLow ? 'low' : 'high'}-${Date.now()}`,
      type: 'anomaly',
      severity: 'medium',
      title: `VPD ${isLow ? 'Too Low' : 'Too High'}`,
      description: `VPD at ${stats.vpd.avg.toFixed(2)} kPa affects optimal transpiration rates`,
      confidence: 88,
      impact: 'medium',
      metric: 'vpd',
      currentValue: stats.vpd.avg,
      expectedValue: 1.0,
      trend: isLow ? 'down' : 'up',
      timeframe: `Consistent pattern over ${timeRange}`,
      recommendations: isLow ? [
        'Increase temperature or decrease humidity',
        'Improve air circulation around plants',
        'Monitor for slow growth or nutrient uptake issues'
      ] : [
        'Decrease temperature or increase humidity',
        'Ensure adequate watering',
        'Watch for signs of plant stress or wilting'
      ],
      relatedMetrics: ['temperature', 'humidity'],
      detectedAt: new Date().toISOString()
    });
  }

  // Power efficiency analysis
  const powerEfficiencyThreshold = 3.0; // kW per m² rough threshold
  if (stats.power.avg > powerEfficiencyThreshold * 100) { // Assuming 100m² facility
    insights.push({
      id: `power-efficiency-${Date.now()}`,
      type: 'optimization',
      severity: 'low',
      title: 'Energy Efficiency Opportunity',
      description: `Power consumption at ${stats.power.avg.toFixed(0)} kW suggests potential for efficiency improvements`,
      confidence: 75,
      impact: 'high',
      metric: 'power',
      currentValue: stats.power.avg,
      expectedValue: stats.power.avg * 0.85,
      trend: 'stable',
      timeframe: 'Daily average',
      recommendations: [
        'Audit lighting systems for LED upgrade opportunities',
        'Implement smart scheduling for non-critical equipment',
        'Optimize HVAC runtime based on occupancy and needs',
        'Consider time-of-use electricity rate optimization'
      ],
      relatedMetrics: ['temperature', 'dli'],
      detectedAt: new Date().toISOString()
    });
  }

  return insights.slice(0, 5); // Limit to 5 insights
}

function calculateDataStatistics(data: AnalyticsData) {
  const calculateStats = (values: number[]) => {
    if (values.length === 0) return { avg: 0, min: 0, max: 0, std: 0 };
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length);
    
    return { avg, min, max, std };
  };

  return {
    temperature: calculateStats(data.temperature),
    humidity: calculateStats(data.humidity),
    co2: calculateStats(data.co2),
    vpd: calculateStats(data.vpd),
    dli: calculateStats(data.dli),
    power: calculateStats(data.power)
  };
}