import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SOPService } from '@/lib/sop/sop-service'
export const dynamic = 'force-dynamic'

// GET /api/sop - Get all SOPs
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || undefined
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined
    const facilityId = searchParams.get('facilityId') || undefined
    
    const sops = await SOPService.getSOPs({
      category,
      status,
      search,
      facilityId
    })
    
    return NextResponse.json(sops)
    
  } catch (error) {
    console.error('Failed to fetch SOPs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SOPs' },
      { status: 500 }
    )
  }
}

// POST /api/sop - Create new SOP
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    
    const sop = await SOPService.createSOP(body, userId)
    
    if (!sop) {
      return NextResponse.json(
        { error: 'Failed to create SOP' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(sop)
    
  } catch (error) {
    console.error('Failed to create SOP:', error)
    return NextResponse.json(
      { error: 'Failed to create SOP' },
      { status: 500 }
    )
  }
}

// PUT /api/sop - Update SOP
export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const { id, ...data } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'SOP ID is required' },
        { status: 400 }
      )
    }
    
    const sop = await SOPService.updateSOP(id, data, userId)
    
    if (!sop) {
      return NextResponse.json(
        { error: 'Failed to update SOP' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(sop)
    
  } catch (error) {
    console.error('Failed to update SOP:', error)
    return NextResponse.json(
      { error: 'Failed to update SOP' },
      { status: 500 }
    )
  }
}

// DELETE /api/sop - Delete (archive) SOP
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'SOP ID is required' },
        { status: 400 }
      )
    }
    
    const success = await SOPService.deleteSOP(id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete SOP' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Failed to delete SOP:', error)
    return NextResponse.json(
      { error: 'Failed to delete SOP' },
      { status: 500 }
    )
  }
}