import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logger } from '@/lib/logging/production-logger';
import { MODULES } from '@/lib/pricing/unified-pricing'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { moduleId } = await req.json()

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    // Validate module exists
    const module = MODULES[moduleId]
    if (!module) {
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 })
    }

    // In a real app, this would:
    // 1. Check if user currently has this module
    // 2. Verify user has permission to remove (not part of base subscription)
    // 3. Handle refund/credit logic if applicable
    // 4. Remove module access from user's subscription in database
    // 5. Revoke access to module features
    // 6. Send confirmation notification

    logger.info('api', `User ${userId} removed module: ${moduleId}`)

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${module.name} module`,
      module: {
        id: moduleId,
        name: module.name
      }
    })
  } catch (error) {
    logger.error('api', 'Error removing module:', error )
    return NextResponse.json(
      { error: 'Failed to remove module' },
      { status: 500 }
    )
  }
}