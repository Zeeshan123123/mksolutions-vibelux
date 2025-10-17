import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// List plantings for facility (optionally by cropId)
export async function GET(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const facility = await prisma.facility.findFirst({ where: { users: { some: { userId } } }, select: { id: true } })
  if (!facility) return NextResponse.json({ plantings: [] })
  const cropId = new URL(req.url).searchParams.get('cropId') || undefined
  const plantings = await prisma.planting.findMany({
    where: { crop: { facilityId: facility.id }, ...(cropId ? { cropId } : {}) },
    orderBy: { startDate: 'desc' },
    include: { crop: true }
  })
  return NextResponse.json({ plantings })
}

// Create planting
export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  // Validate crop belongs to user's facility
  const crop = await prisma.crop.findFirst({ where: { id: body.cropId, facility: { users: { some: { userId } } } }, select: { id: true } })
  if (!crop) return NextResponse.json({ error: 'Invalid crop' }, { status: 400 })
  const planting = await prisma.planting.create({ data: { cropId: body.cropId, startDate: new Date(body.startDate), expectedHarvestDate: body.expectedHarvestDate ? new Date(body.expectedHarvestDate) : null, quantity: body.quantity, location: body.location } })
  return NextResponse.json({ planting })
}


