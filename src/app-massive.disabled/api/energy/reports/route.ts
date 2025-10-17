import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { logger } from '@/lib/logging/production-logger';

// Validation schema
const reportGenerationSchema = z.object({
  facilityId: z.string(),
  reportType: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  includeDetails: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = reportGenerationSchema.parse(body);

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Get facility details
    const facility = await prisma.energy_optimization_config.findUnique({
      where: { facility_id: validatedData.facilityId },
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Get energy readings for the period
    const readings = await prisma.energyReading.findMany({
      where: {
        facilityId: validatedData.facilityId,
        timestamp: {
          gte: validatedData.startDate,
          lte: validatedData.endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Calculate report metrics
    const totalKwh = readings.reduce((sum, r) => sum + (r.value || 0), 0);
    const totalCost = readings.reduce((sum, r) => 
      sum + ((r.cost || 0)), 0
    );
    const avgPowerKw = readings.length > 0 
      ? readings.reduce((sum, r) => sum + r.value, 0) / readings.length 
      : 0;
    const peakPowerKw = readings.length > 0
      ? Math.max(...readings.map(r => r.value))
      : 0;

    // Calculate estimated savings (simplified calculation)
    const baselineKwh = totalKwh * 1.15; // Assume 15% savings
    const totalSavedKwh = Math.max(0, baselineKwh - totalKwh);
    const totalSavedCost = totalSavedKwh * 0.12; // $0.12 per kWh
    const totalCo2Avoided = totalSavedKwh * 0.0004; // 0.4 kg CO2 per kWh

    // Generate hourly breakdown if requested
    const hourlyBreakdown: any[] = [];
    if (validatedData.includeDetails) {
      const hourlyData = new Map();
      
      readings.forEach(reading => {
        const hour = new Date(reading.timestamp).getHours();
        if (!hourlyData.has(hour)) {
          hourlyData.set(hour, { 
            count: 0, 
            totalKwh: 0, 
            totalCost: 0,
            avgPower: 0,
          });
        }
        
        const data = hourlyData.get(hour);
        data.count++;
        data.totalKwh += reading.value || 0;
        data.totalCost += reading.cost || 0;
        data.avgPower += reading.value;
      });
      
      for (const [hour, data] of hourlyData) {
        hourlyBreakdown.push({
          hour,
          avgKwh: data.totalKwh / data.count,
          avgCost: data.totalCost / data.count,
          avgPowerKw: data.avgPower / data.count,
        });
      }
      
      hourlyBreakdown.sort((a, b) => a.hour - b.hour);
    }

    const report = {
      facilityId: validatedData.facilityId,
      facilityName: facility.facility_name,
      reportType: validatedData.reportType,
      periodStart: validatedData.startDate,
      periodEnd: validatedData.endDate,
      generatedAt: new Date(),
      
      consumption: {
        totalKwh,
        totalCost,
        avgPowerKw,
        peakPowerKw,
        dataPoints: readings.length,
      },
      
      savings: {
        kwhSaved: totalSavedKwh,
        costSaved: totalSavedCost,
        co2AvoidedTons: totalCo2Avoided,
        savingsPercentage: totalKwh > 0 ? (totalSavedKwh / (totalKwh + totalSavedKwh)) * 100 : 0,
      },
      
      hourlyBreakdown: validatedData.includeDetails ? hourlyBreakdown : undefined,
      
      recommendations: generateRecommendations(readings, []),
    };

    return NextResponse.json(report);
  } catch (error) {
    logger.error('api', 'Error generating report:', error );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function generateRecommendations(readings: any[], savings: any[]) {
  const recommendations: any[] = [];
  
  // Analyze peak usage patterns
  const peakHours = new Map();
  readings.forEach(reading => {
    const hour = new Date(reading.timestamp).getHours();
    if (hour >= 16 && hour < 21) { // Peak hours
      if (!peakHours.has(hour)) {
        peakHours.set(hour, []);
      }
      peakHours.get(hour).push(reading.power_kw);
    }
  });
  
  // Check for high peak usage
  let highPeakUsage = false;
  for (const [hour, powers] of peakHours) {
    const avgPower = powers.reduce((sum: number, p: number) => sum + p, 0) / powers.length;
    if (avgPower > 100) { // Threshold in kW
      highPeakUsage = true;
      break;
    }
  }
  
  if (highPeakUsage) {
    recommendations.push({
      type: 'peak_reduction',
      priority: 'high',
      title: 'High Peak Usage Detected',
      description: 'Consider implementing additional load shedding during peak hours (4-9 PM) to reduce demand charges.',
      potentialSavings: '$2,000-$5,000/month',
    });
  }
  
  // Check for consistent overnight usage
  const overnightReadings = readings.filter(r => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= 0 && hour < 6;
  });
  
  if (overnightReadings.length > 0) {
    const avgOvernightPower = overnightReadings.reduce((sum, r) => sum + r.power_kw, 0) / overnightReadings.length;
    if (avgOvernightPower > 50) {
      recommendations.push({
        type: 'schedule_optimization',
        priority: 'medium',
        title: 'Overnight Usage Optimization',
        description: 'High energy usage detected during super off-peak hours. Review equipment schedules to ensure only essential systems are running.',
        potentialSavings: '$500-$1,500/month',
      });
    }
  }
  
  // Check savings trend
  if (savings.length >= 3) {
    const recentSavings = savings.slice(-3);
    const savingsTrend = recentSavings[2].kwh_saved - recentSavings[0].kwh_saved;
    
    if (savingsTrend < 0) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: 'Declining Savings Trend',
        description: 'Energy savings have decreased over the past 3 months. Consider reviewing and updating optimization strategies.',
        action: 'Schedule optimization review',
      });
    }
  }
  
  return recommendations;
}