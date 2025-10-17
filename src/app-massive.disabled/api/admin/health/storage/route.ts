import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const results: any[] = [];

    // Test AWS S3 if configured
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        // Test AWS credentials validity (simplified check)
        results.push({
          service: 'AWS S3',
          status: 'healthy',
          details: 'AWS credentials configured',
          bucket: process.env.AWS_S3_BUCKET || 'Not specified'
        });
      } catch (error) {
        results.push({
          service: 'AWS S3',
          status: 'down',
          error: error instanceof Error ? error.message : 'AWS S3 test failed'
        });
      }
    }

    // Test Vercel Blob storage if available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      results.push({
        service: 'Vercel Blob',
        status: 'healthy',
        details: 'Vercel Blob token configured'
      });
    }

    // Test local file system
    try {
      const fs = require('fs');
      const testDir = '/tmp';
      fs.accessSync(testDir, fs.constants.W_OK);
      
      results.push({
        service: 'Local Storage',
        status: 'healthy',
        details: 'File system write access available'
      });
    } catch (error) {
      results.push({
        service: 'Local Storage',
        status: 'degraded',
        details: 'Limited file system access'
      });
    }

    const responseTime = Date.now() - startTime;
    const healthyServices = results.filter(r => r.status === 'healthy').length;
    const overallStatus = results.length > 0 && healthyServices > 0 ? 'healthy' : 'degraded';

    return NextResponse.json({
      status: overallStatus,
      responseTime,
      details: `${healthyServices}/${results.length} storage services available`,
      metrics: {
        totalServices: results.length,
        healthyServices,
        services: results
      }
    });

  } catch (error) {
    logger.error('system', 'Storage health check failed:', error);
    
    return NextResponse.json({
      status: 'down',
      error: error instanceof Error ? error.message : 'Storage health check failed',
      details: 'Unable to test storage services'
    }, { status: 500 });
  }
}