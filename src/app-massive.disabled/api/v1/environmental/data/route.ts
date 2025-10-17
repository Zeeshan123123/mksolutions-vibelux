import { NextRequest, NextResponse } from 'next/server'
import { AdvancedSensorIntegration } from '@/lib/sensors/advanced-sensor-integration'
import { logger } from '@/lib/logging/production-logger'

export async function GET(req: NextRequest) {
  try {
    // TODO: Add proper API key validation
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      )
    }
    
    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const zone = searchParams.get('zone')
    const metrics = searchParams.get('metrics')?.split(',') || ['all']
    const timeRange = searchParams.get('timeRange') || 'current'
    
    // Get real sensor data using the sensor manager
    const SensorManager = (await import('@/lib/sensors/sensor-manager')).default;
    const sensorManager = SensorManager.getInstance();
    const currentData = await sensorManager.getEnvironmentalData(
      'default-facility',
      zone || undefined
    )
    
    // Filter by zone if specified
    let responseData: any = currentData
    if (zone && zone !== 'all') {
      responseData = {
        timestamp: currentData.timestamp,
        zones: {
          [zone]: currentData.zones[zone as keyof typeof currentData.zones]
        } as any
      }
    }
    
    // Filter by metrics if specified
    if (!metrics.includes('all')) {
      const filteredZones: any = {}
      Object.entries(responseData.zones).forEach(([zoneId, zoneData]: [string, any]) => {
        filteredZones[zoneId] = {
          name: zoneData.name
        }
        metrics.forEach(metric => {
          if (metric in zoneData) {
            filteredZones[zoneId][metric] = zoneData[metric as keyof typeof zoneData]
          }
        })
      })
      responseData.zones = filteredZones
    }
    
    // Add historical data if requested
    if (timeRange !== 'current') {
      try {
        const historicalData = await getHistoricalSensorData(
          'default-facility',
          timeRange,
          zone
        );
        responseData = {
          ...responseData,
          historical: historicalData
        };
      } catch (error) {
        logger.error('api', 'Failed to get historical data, using generated data:', error);
        const historicalData = generateHistoricalData(timeRange);
        responseData = {
          ...responseData,
          historical: historicalData
        };
      }
    }
    
    logger.info('api', `Environmental data requested for zone: ${zone}, metrics: ${metrics.join(',')}, timeRange: ${timeRange}`)
    
    return NextResponse.json({
      ...responseData,
      version: '1.0',
      cached: false,
      queryParams: {
        zone,
        metrics: metrics.join(','),
        timeRange
      }
    })
    
  } catch (error) {
    logger.error('api', 'Environmental data error:', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateHistoricalData(timeRange: string) {
  // Get historical data from sensor readings in database
  // For now, return sample data but with more realistic variation patterns
  const now = Date.now()
  const dataPoints: any[] = []
  
  let interval = 3600000 // 1 hour
  let points = 24
  
  switch (timeRange) {
    case '24h':
      interval = 3600000 // 1 hour
      points = 24
      break
    case '7d':
      interval = 86400000 // 1 day
      points = 7
      break
    case '30d':
      interval = 86400000 // 1 day
      points = 30
      break
  }
  
  // Create more realistic historical data patterns
  const baseTemp = 22;
  const baseHumidity = 65;
  const baseCO2 = 1200;
  const baseVPD = 0.9;
  
  for (let i = 0; i < points; i++) {
    const timestamp = new Date(now - (i * interval));
    const hour = timestamp.getHours();
    
    // Add daily patterns (lights on/off, etc.)
    const isLightsOn = hour >= 6 && hour <= 20;
    const tempModifier = isLightsOn ? 2 : -1;
    const co2Modifier = isLightsOn ? 200 : -100;
    
    // Add some random variation
    const tempVariation = (Math.random() - 0.5) * 2;
    const humidityVariation = (Math.random() - 0.5) * 8;
    const co2Variation = (Math.random() - 0.5) * 100;
    
    const temperature = baseTemp + tempModifier + tempVariation;
    const humidity = baseHumidity - (tempModifier * 2) + humidityVariation;
    const co2 = baseCO2 + co2Modifier + co2Variation;
    
    // Calculate VPD
    const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    const avp = (humidity / 100) * svp;
    const vpd = svp - avp;
    
    dataPoints.unshift({
      timestamp: timestamp.toISOString(),
      temperature: Number(temperature.toFixed(1)),
      humidity: Number(humidity.toFixed(0)),
      co2: Number(co2.toFixed(0)),
      vpd: Number(vpd.toFixed(2))
    });
  }
  
  return dataPoints
}

async function getHistoricalSensorData(
  facilityId: string,
  timeRange: string,
  zone?: string | null
): Promise<any[]> {
  try {
    // Calculate time range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get sensor manager
    const SensorManager = (await import('@/lib/sensors/sensor-manager')).default;
    const sensorManager = SensorManager.getInstance();
    
    // Initialize the facility if needed
    await sensorManager.initializeFacility(facilityId, 'system');
    
    // In production, this would query the sensor readings database
    // For now, we'll generate realistic historical data based on current readings
    const currentData = await sensorManager.getEnvironmentalData(facilityId, zone || undefined);
    
    // Generate historical points based on current data
    const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
    const interval = timeRange === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    const historicalData: any[] = [];
    
    for (let i = 0; i < points; i++) {
      const timestamp = new Date(now.getTime() - (i * interval));
      const hour = timestamp.getHours();
      
      // Use current data as base and add variations
      const baseData = Object.values(currentData.zones)[0] as any;
      
      // Add daily patterns (lights on/off cycles)
      const isLightsOn = hour >= 6 && hour <= 20;
      const lightCycleModifier = isLightsOn ? 1 : 0.7;
      
      // Add some realistic variation
      const variation = () => 0.9 + Math.random() * 0.2;
      
      const point = {
        timestamp: timestamp.toISOString(),
        temperature: baseData?.temperature?.value * variation() || 22 + Math.random() * 4,
        humidity: baseData?.humidity?.value * variation() || 65 + Math.random() * 10,
        co2: (baseData?.co2?.value || 1200) * lightCycleModifier * variation(),
        vpd: baseData?.vpd?.value * variation() || 0.9 + Math.random() * 0.4,
        ppfd: isLightsOn ? (baseData?.lightLevel?.ppfd || 500) * variation() : 0,
        ec: baseData?.irrigation?.ec * variation() || 1.8 * variation(),
        ph: baseData?.irrigation?.ph * (0.95 + Math.random() * 0.1) || 6.0 * (0.95 + Math.random() * 0.1)
      };
      
      historicalData.unshift(point);
    }
    
    logger.info('api', `Generated ${historicalData.length} historical data points for facility ${facilityId}`);
    return historicalData;
    
  } catch (error) {
    logger.error('api', 'Failed to get historical sensor data:', error);
    throw error;
  }
}