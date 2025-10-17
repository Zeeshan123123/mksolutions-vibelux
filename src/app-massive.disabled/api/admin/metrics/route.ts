import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Get user metrics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    // Calculate uptime (simplified - based on when server started)
    const uptimeMs = process.uptime() * 1000;
    const uptimeDays = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
    const uptimeHours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const uptime = `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`;

    // Get system performance metrics
    const responseTime = Date.now() - startTime;
    
    // Simulate API call metrics (in a real system, you'd track these)
    const apiCalls = Math.floor(Math.random() * 1000) + 500; // Placeholder
    const errorRate = Math.random() * 2; // Placeholder error rate 0-2%

    const metrics = {
      totalUsers,
      activeUsers,
      apiCalls,
      errorRate,
      averageResponseTime: responseTime,
      uptime,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        pid: process.pid,
        uptime: Math.floor(process.uptime())
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(metrics);

  } catch (error) {
    logger.error('system', 'Metrics collection failed:', error);
    
    return NextResponse.json({
      error: 'Failed to collect metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}