import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const facilityId = req.nextUrl.searchParams.get('facilityId')
  if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })
  const zones = await prisma.hMIZone.findMany({ where: { facilityId }, orderBy: { name: 'asc' } })
  return NextResponse.json(zones)
}

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { facilityId, name, enabled = true, equipment = [] } = body || {}
  if (!facilityId || !name) {
    return NextResponse.json({ error: 'facilityId and name required' }, { status: 400 })
  }
  const zone = await prisma.hMIZone.upsert({
    where: { facilityId_name: { facilityId, name } },
    create: { facilityId, name, enabled, equipment },
    update: { enabled, equipment },
  })
  return NextResponse.json(zone)
}

