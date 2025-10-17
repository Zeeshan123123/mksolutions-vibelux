import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// List crops for facility
export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const facility = await prisma.facility.findFirst({ where: { users: { some: { userId } } }, select: { id: true } })
  if (!facility) return NextResponse.json({ crops: [] })
  const crops = await prisma.crop.findMany({ where: { facilityId: facility.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ crops })
}

// Create crop
export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const facility = await prisma.facility.findFirst({ where: { users: { some: { userId, role: { in: ['OWNER','ADMIN','MANAGER'] } } } }, select: { id: true } })
  if (!facility) return NextResponse.json({ error: 'No facility' }, { status: 404 })
  const body = await req.json()
  const crop = await prisma.crop.create({ data: { facilityId: facility.id, name: body.name, variety: body.variety, cycleDays: body.cycleDays, notes: body.notes } })
  return NextResponse.json({ crop })
}


