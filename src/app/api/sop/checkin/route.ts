import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SOPService } from '@/lib/sop/sop-service'
export const dynamic = 'force-dynamic'

// GET /api/sop/checkin - Get check-in history
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const sopId = searchParams.get('sopId') || undefined
    const facilityId = searchParams.get('facilityId') || undefined
    const status = searchParams.get('status') || undefined
    
    const checkIns = await SOPService.getCheckIns({
      userId,
      sopId,
      facilityId,
      status
    })
    
    return NextResponse.json(checkIns)
    
  } catch (error) {
    console.error('Failed to fetch check-ins:', error)
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    )
  }
}

// POST /api/sop/checkin - Start a new check-in
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const { sopId, facilityId, locationId, batchId } = body
    
    if (!sopId) {
      return NextResponse.json(
        { error: 'SOP ID is required' },
        { status: 400 }
      )
    }
    
    const checkIn = await SOPService.startCheckIn({
      sopId,
      userId,
      facilityId,
      locationId,
      batchId,
      clientIp: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined
    })
    
    if (!checkIn) {
      return NextResponse.json(
        { error: 'Failed to start check-in' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(checkIn)
    
  } catch (error) {
    console.error('Failed to start check-in:', error)
    return NextResponse.json(
      { error: 'Failed to start check-in' },
      { status: 500 }
    )
  }
}

// PUT /api/sop/checkin - Update check-in progress
export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const { id, completedSteps, notes, issues, completionRate } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Check-in ID is required' },
        { status: 400 }
      )
    }
    
    const checkIn = await SOPService.updateCheckIn(id, {
      completedSteps,
      notes,
      issues,
      completionRate
    })
    
    if (!checkIn) {
      return NextResponse.json(
        { error: 'Failed to update check-in' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(checkIn)
    
  } catch (error) {
    console.error('Failed to update check-in:', error)
    return NextResponse.json(
      { error: 'Failed to update check-in' },
      { status: 500 }
    )
  }
}

// PATCH /api/sop/checkin - Complete check-in
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const { id, notes, issues } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Check-in ID is required' },
        { status: 400 }
      )
    }
    
    const checkIn = await SOPService.completeCheckIn(id, {
      notes,
      issues
    })
    
    if (!checkIn) {
      return NextResponse.json(
        { error: 'Failed to complete check-in' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(checkIn)
    
  } catch (error) {
    console.error('Failed to complete check-in:', error)
    return NextResponse.json(
      { error: 'Failed to complete check-in' },
      { status: 500 }
    )
  }
}