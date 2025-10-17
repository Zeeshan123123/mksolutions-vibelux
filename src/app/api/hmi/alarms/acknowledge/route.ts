import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { facilityId, equipmentId, message, notes } = body || {}
  if (!facilityId || !message) return NextResponse.json({ error: 'facilityId and message required' }, { status: 400 })
  const ack = await prisma.hMIAlarmAcknowledgement.create({
    data: {
      facilityId,
      equipmentId,
      message,
      notes,
      acknowledgedBy: userId,
    }
  })
  return NextResponse.json(ack)
}

