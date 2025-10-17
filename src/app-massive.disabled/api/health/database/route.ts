import { NextRequest, NextResponse } from 'next/server'
import { performHealthCheck, getMonitoringData, prisma } from '@/lib/database'

// Health check endpoint for database monitoring
export async function GET(request: NextRequest) {
  try {
    // Check if monitoring is enabled
    const isMonitoringEnabled = process.env.ENABLE_DB_MONITORING === 'true'
    
    // Perform basic health check
    const healthCheck = await performHealthCheck(prisma)
    
    // Basic response for health check
    if (!isMonitoringEnabled) {
      return NextResponse.json({
        status: healthCheck.isHealthy ? 'healthy' : 'unhealthy',
        timestamp: healthCheck.timestamp,
        latency: healthCheck.latency,
      })
    }
    
    // Detailed monitoring data for production
    const monitoringData = getMonitoringData()
    
    return NextResponse.json({
      status: healthCheck.isHealthy ? 'healthy' : 'unhealthy',
      health: healthCheck,
      metrics: monitoringData,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isServerless: !!process.env.VERCEL,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: (error as Error).message,
        timestamp: new Date(),
      },
      { status: 500 }
    )
  }
}