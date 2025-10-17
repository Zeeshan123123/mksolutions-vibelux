import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const facilityId = req.nextUrl.searchParams.get('facilityId')
  const roomId = req.nextUrl.searchParams.get('roomId')
  if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })
  const layout = await prisma.hMILayout.findUnique({ where: { facilityId_roomId: { facilityId, roomId: roomId || '' } } })
  return NextResponse.json(layout || null)
}

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { facilityId, roomId, positions } = body || {}
  if (!facilityId || !positions) return NextResponse.json({ error: 'facilityId and positions required' }, { status: 400 })
  const layout = await prisma.hMILayout.upsert({
    where: { facilityId_roomId: { facilityId, roomId: roomId || '' } },
    create: { facilityId, roomId, positions },
    update: { positions },
  })
  return NextResponse.json(layout)
}

