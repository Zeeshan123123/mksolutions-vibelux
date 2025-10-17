import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Test critical API endpoints
    const endpointsToTest = [
      '/api/v1/sensors',
      '/api/v1/lighting/calculations',
      '/api/fixtures',
    ];

    const testResults = await Promise.allSettled(
      endpointsToTest.map(async (endpoint) => {
        const testStart = Date.now();
        const response = await fetch(
          new URL(endpoint, request.url).toString(),
          { 
            method: 'GET',
            headers: { 'User-Agent': 'VibeLux-HealthCheck/1.0' }
          }
        );
        return {
          endpoint,
          status: response.status,
          responseTime: Date.now() - testStart,
          ok: response.status < 400
        };
      })
    );

    const results = testResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          endpoint: endpointsToTest[index],
          status: 500,
          responseTime: -1,
          ok: false,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });

    const healthyEndpoints = results.filter(r => r.ok).length;
    const totalEndpoints = results.length;
    const overallHealthy = healthyEndpoints === totalEndpoints;
    
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: overallHealthy ? 'healthy' : 'degraded',
      responseTime,
      details: `${healthyEndpoints}/${totalEndpoints} API endpoints operational`,
      metrics: {
        totalEndpoints,
        healthyEndpoints,
        averageResponseTime: results.reduce((sum, r) => sum + Math.max(0, r.responseTime), 0) / results.length,
        endpointResults: results
      }
    });

  } catch (error) {
    logger.error('system', 'API health check failed:', error);
    
    return NextResponse.json({
      status: 'down',
      error: error instanceof Error ? error.message : 'API health check failed',
      details: 'Unable to test API endpoints'
    }, { status: 500 });
  }
}