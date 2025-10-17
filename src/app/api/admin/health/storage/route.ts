import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const results: any[] = [];

    // Test AWS S3 if configured (perform a lightweight HeadBucket)
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION && process.env.AWS_S3_BUCKET) {
      try {
        const { S3Client, HeadBucketCommand } = await import('@aws-sdk/client-s3')
        const s3 = new S3Client({ region: process.env.AWS_REGION })
        await s3.send(new HeadBucketCommand({ Bucket: process.env.AWS_S3_BUCKET }))
        results.push({
          service: 'AWS S3',
          status: 'healthy',
          details: 'Bucket accessible',
          bucket: process.env.AWS_S3_BUCKET
        })
      } catch (error) {
        results.push({
          service: 'AWS S3',
          status: 'down',
          error: error instanceof Error ? error.message : 'AWS S3 bucket check failed',
          bucket: process.env.AWS_S3_BUCKET
        })
      }
    } else if (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SECRET_ACCESS_KEY) {
      results.push({
        service: 'AWS S3',
        status: 'unconfigured',
        details: 'Missing AWS_REGION and/or AWS_S3_BUCKET'
      })
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