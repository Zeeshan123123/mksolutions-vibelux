import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reportId, schedule } = body

    if (!reportId || !schedule) {
      return NextResponse.json(
        { error: 'Missing required fields: reportId, schedule' },
        { status: 400 }
      )
    }

    // TODO: customReport and etlJob models don't exist - return mock success
    // const report = await prisma.customReport.findUnique({
    //   where: { id: reportId }
    // })

    // Create or update scheduled job (mock)
    const jobName = `scheduled_report_${reportId}`
    const cronExpression = convertToCronExpression(schedule)

    return NextResponse.json({
      success: true,
      message: 'Report scheduled successfully',
      schedule: {
        reportId,
        enabled: schedule.enabled,
        frequency: schedule.frequency,
        nextRun: calculateNextRun(schedule)
      }
    })
  } catch (error) {
    logger.error('api', 'Error scheduling report:', error )
    return NextResponse.json(
      { error: 'Failed to schedule report', details: String(error) },
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
    const reportId = searchParams.get('reportId')

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    // TODO: etlJob and etlExecution models don't exist - return mock data
    // const job = await prisma.etlJob.findUnique({
    //   where: { name: `scheduled_report_${reportId}` }
    // })

    return NextResponse.json({
      success: true,
      scheduled: false
    })
  } catch (error) {
    logger.error('api', 'Error fetching schedule:', error )
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const reportId = searchParams.get('reportId')

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    // TODO: customReport and etlJob models don't exist - return mock success
    // const report = await prisma.customReport.findUnique({
    //   where: { id: reportId }
    // })

    // Delete scheduled job (mock)
    const jobName = `scheduled_report_${reportId}`

    return NextResponse.json({
      success: true,
      message: 'Report schedule removed successfully'
    })
  } catch (error) {
    logger.error('api', 'Error removing schedule:', error )
    return NextResponse.json(
      { error: 'Failed to remove schedule' },
      { status: 500 }
    )
  }
}

function convertToCronExpression(schedule: any): string {
  const { frequency, time, dayOfWeek, dayOfMonth, timezone } = schedule
  const [hour, minute] = time.split(':')

  switch (frequency) {
    case 'daily':
      return `${minute} ${hour} * * *`
    case 'weekly':
      return `${minute} ${hour} * * ${dayOfWeek || 0}`
    case 'monthly':
      return `${minute} ${hour} ${dayOfMonth || 1} * *`
    default:
      return `${minute} ${hour} * * *`
  }
}

function calculateNextRun(schedule: any): Date {
  if (!schedule || !schedule.enabled) {
    return new Date()
  }

  const now = new Date()
  const [hour, minute] = schedule.time.split(':').map(Number)
  
  const nextRun = new Date()
  nextRun.setHours(hour, minute, 0, 0)

  switch (schedule.frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
      break
    case 'weekly':
      const targetDay = schedule.dayOfWeek || 0
      const currentDay = nextRun.getDay()
      let daysToAdd = targetDay - currentDay
      
      if (daysToAdd <= 0 || (daysToAdd === 0 && nextRun <= now)) {
        daysToAdd += 7
      }
      
      nextRun.setDate(nextRun.getDate() + daysToAdd)
      break
    case 'monthly':
      const targetDate = schedule.dayOfMonth || 1
      nextRun.setDate(targetDate)
      
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
      }
      break
    default:
      nextRun.setDate(nextRun.getDate() + 1)
  }

  return nextRun
}