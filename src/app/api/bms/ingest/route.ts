import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// POST /api/bms/ingest
// Body: { facilityId: string, readings: Array<{ readingType: string; value: number; unit: string; cost?: number; timestamp?: string }> }
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body || !body.facilityId || !Array.isArray(body.readings)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const facility = await prisma.facility.findUnique({ where: { id: body.facilityId } })
    if (!facility) return NextResponse.json({ error: 'Facility not found' }, { status: 404 })

    // Insert readings
    const data = body.readings.map((r: any) => ({
      facilityId: body.facilityId,
      readingType: String(r.readingType || 'electricity'),
      value: Number(r.value || 0),
      unit: String(r.unit || 'kWh'),
      cost: r.cost != null ? Number(r.cost) : null,
      timestamp: r.timestamp ? new Date(r.timestamp) : new Date(),
    }))

    // Batch insert
    for (const row of data) {
      await prisma.energyReading.create({ data: row })
    }

    return NextResponse.json({ success: true, inserted: data.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Ingest failed' }, { status: 500 })
  }
}


