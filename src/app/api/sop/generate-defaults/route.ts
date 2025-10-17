import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SOPService } from '@/lib/sop/sop-service'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const { facilityId } = body
    
    // Generate default SOPs for the facility
    await SOPService.generateDefaultSOPs(facilityId || 'default', userId)
    
    return NextResponse.json({ 
      success: true,
      message: 'Default SOPs generated successfully'
    })
    
  } catch (error) {
    console.error('Failed to generate default SOPs:', error)
    return NextResponse.json(
      { error: 'Failed to generate default SOPs' },
      { status: 500 }
    )
  }
}