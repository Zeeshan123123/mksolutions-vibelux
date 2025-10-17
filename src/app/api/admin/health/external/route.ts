import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Test external APIs that are critical to the system
    const externalServices = [
      {
        name: 'OpenWeather API',
        url: 'https://api.openweathermap.org/data/2.5/weather?q=london&appid=demo', // Demo endpoint
        critical: false
      },
      {
        name: 'NREL API',
        url: 'https://developer.nrel.gov/api/pvwatts/v6.json?api_key=DEMO_KEY&lat=40&lon=-105&system_capacity=4&azimuth=180&tilt=40&array_type=1&module_type=1&losses=10',
        critical: false
      },
      {
        name: 'GitHub API',
        url: 'https://api.github.com',
        critical: false
      }
    ];

    const testResults = await Promise.allSettled(
      externalServices.map(async (service) => {
        const testStart = Date.now();
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
          
          const response = await fetch(service.url, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'User-Agent': 'VibeLux-HealthCheck/1.0' }
          });
          
          clearTimeout(timeoutId);
          
          return {
            name: service.name,
            status: response.status < 500 ? 'healthy' : 'degraded',
            responseTime: Date.now() - testStart,
            critical: service.critical,
            httpStatus: response.status
          };
        } catch (error) {
          return {
            name: service.name,
            status: 'down',
            responseTime: Date.now() - testStart,
            critical: service.critical,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const results = testResults.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: 'Unknown Service',
          status: 'down',
          responseTime: -1,
          critical: false,
          error: result.reason?.message || 'Test failed'
        };
      }
    });

    const healthyServices = results.filter(r => r.status === 'healthy').length;
    const criticalServices = results.filter(r => r.critical);
    const healthyCritical = criticalServices.filter(r => r.status === 'healthy').length;
    
    // If all critical services are healthy, or no critical services exist, system is healthy
    const overallStatus = criticalServices.length === 0 || healthyCritical === criticalServices.length ? 
      'healthy' : 'degraded';
    
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: overallStatus,
      responseTime,
      details: `${healthyServices}/${results.length} external services responding (${healthyCritical}/${criticalServices.length} critical)`,
      metrics: {
        totalServices: results.length,
        healthyServices,
        criticalServices: criticalServices.length,
        healthyCritical,
        averageResponseTime: results.reduce((sum, r) => sum + Math.max(0, r.responseTime), 0) / results.length,
        services: results
      }
    });

  } catch (error) {
    logger.error('system', 'External API health check failed:', error);
    
    return NextResponse.json({
      status: 'down',
      error: error instanceof Error ? error.message : 'External services health check failed',
      details: 'Unable to test external services'
    }, { status: 500 });
  }
}