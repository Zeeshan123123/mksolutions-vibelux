import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logger } from '@/lib/logging/production-logger';
import { etlPipeline } from '@/lib/analytics/etl-pipeline'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, facilityId, dataType, data, source, config } = body

    if (!action || !facilityId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, facilityId' },
        { status: 400 }
      )
    }

    let result;

    switch (action) {
      case 'process_sensor_data':
        if (!data || !Array.isArray(data)) {
          return NextResponse.json(
            { error: 'Sensor data array is required' },
            { status: 400 }
          )
        }
        result = await etlPipeline.processSensorData(facilityId, data)
        break

      case 'process_harvest_data':
        if (!data || !Array.isArray(data)) {
          return NextResponse.json(
            { error: 'Harvest data array is required' },
            { status: 400 }
          )
        }
        result = await etlPipeline.processHarvestData(facilityId, data)
        break

      case 'process_external_api':
        if (!source || !config) {
          return NextResponse.json(
            { error: 'Source and API config are required for external API processing' },
            { status: 400 }
          )
        }
        result = await etlPipeline.processExternalAPIData(facilityId, source, config)
        break

      case 'run_scheduled_jobs':
        await etlPipeline.runScheduledJobs()
        result = {
          jobName: 'scheduled_jobs_runner',
          status: 'success',
          message: 'Scheduled jobs execution completed'
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: process_sensor_data, process_harvest_data, process_external_api, run_scheduled_jobs' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      result,
      processedAt: new Date().toISOString()
    })
  } catch (error) {
    logger.error('api', 'ETL Pipeline error:', error )
    return NextResponse.json(
      { error: 'ETL pipeline processing failed', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const facilityId = searchParams.get('facilityId')
    const jobType = searchParams.get('type') || 'all'

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 })
    }

    // TODO: Fix etlJob and etlExecution database schema
    const jobs: any[] = [];
    // const jobs = await prisma.etlJob.findMany({
    //   where: {
    //     ...(jobType !== 'all' && { name: { contains: jobType } })
    //   },
    //   orderBy: { updatedAt: 'desc' },
    //   take: 50
    // })

    // Get recent job executions
    const recentExecutions: any[] = [];
    // const recentExecutions = await prisma.etlExecution.findMany({
    //   where: {
    //     facilityId,
    //     createdAt: {
    //       gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    //     }
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   take: 100
    // })

    // Calculate summary statistics
    const totalExecutions = recentExecutions.length
    const successfulExecutions = recentExecutions.filter(e => e.status === 'success').length
    const failedExecutions = recentExecutions.filter(e => e.status === 'failure').length
    const avgDuration = recentExecutions.length > 0 
      ? recentExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) / recentExecutions.length
      : 0

    const avgThroughput = recentExecutions.length > 0
      ? recentExecutions.reduce((sum, e) => sum + (e.recordsProcessed || 0), 0) / totalExecutions
      : 0

    return NextResponse.json({
      success: true,
      summary: {
        totalJobs: jobs.length,
        enabledJobs: jobs.filter(j => j.enabled).length,
        recentExecutions: {
          total: totalExecutions,
          successful: successfulExecutions,
          failed: failedExecutions,
          successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0
        },
        performance: {
          averageDuration: Math.round(avgDuration),
          averageThroughput: Math.round(avgThroughput)
        }
      },
      jobs: jobs.map(job => ({
        id: job.id,
        name: job.name,
        enabled: job.enabled,
        status: job.status,
        lastRun: job.lastRun,
        lastError: job.lastError,
        config: job.config
      })),
      recentExecutions: recentExecutions.map(exec => ({
        id: exec.id,
        jobName: exec.jobName,
        status: exec.status,
        recordsProcessed: exec.recordsProcessed,
        recordsSuccessful: exec.recordsSuccessful,
        recordsFailed: exec.recordsFailed,
        duration: exec.duration,
        startTime: exec.startTime,
        endTime: exec.endTime,
        errors: exec.errors,
        warnings: exec.warnings
      }))
    })
  } catch (error) {
    logger.error('api', 'Error fetching ETL status:', error )
    return NextResponse.json(
      { error: 'Failed to fetch ETL status' },
      { status: 500 }
    )
  }
}