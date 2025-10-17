import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// POST /api/sop/checkin/verify { id }
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id } = body || {}
    if (!id) return NextResponse.json({ error: 'Check-in id required' }, { status: 400 })

    const updated = await prisma.sOPCheckIn.update({
      where: { id },
      data: { verified: true, verifiedBy: userId, verifiedAt: new Date() }
    })

    return NextResponse.json({ success: true, id: updated.id, verifiedBy: updated.verifiedBy, verifiedAt: updated.verifiedAt })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to verify check-in' }, { status: 500 })
  }
}


