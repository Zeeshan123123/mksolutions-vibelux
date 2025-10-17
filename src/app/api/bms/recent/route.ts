import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET /api/bms/recent?facilityId=...&hours=24
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    const hours = Math.max(1, Math.min(168, Number(sp.get('hours') || 24)))
    if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })

    const since = new Date()
    since.setHours(since.getHours() - hours)

    const rows = await prisma.energyReading.findMany({
      where: { facilityId, timestamp: { gte: since } },
      orderBy: { timestamp: 'desc' },
      take: 1000,
      select: { readingType: true, value: true, unit: true, timestamp: true }
    })

    return NextResponse.json({ facilityId, hours, rows })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch readings' }, { status: 500 })
  }
}


