import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET /api/compliance/haccp/ccp?facilityId=...&limit=100
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    const limit = Math.min(500, Math.max(1, Number(sp.get('limit') || 100)))
    if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })
    const rows = await prisma.cCPRecord.findMany({ where: { facilityId }, orderBy: { timestamp: 'desc' }, take: limit })
    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load CCP records' }, { status: 500 })
  }
}

// POST /api/compliance/haccp/ccp { facilityId, planId?, ccpName, value, unit?, limitMin?, limitMax?, notes? }
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { facilityId, ccpName, value } = body || {}
    if (!facilityId || !ccpName || value == null) return NextResponse.json({ error: 'facilityId, ccpName, value required' }, { status: 400 })
    const compliant = (body.limitMin == null || value >= Number(body.limitMin)) && (body.limitMax == null || value <= Number(body.limitMax))
    const row = await prisma.cCPRecord.create({
      data: {
        facilityId,
        planId: body.planId || null,
        ccpName: String(ccpName),
        value: Number(value),
        unit: body.unit || null,
        limitMin: body.limitMin != null ? Number(body.limitMin) : null,
        limitMax: body.limitMax != null ? Number(body.limitMax) : null,
        compliant,
        notes: body.notes || null
      }
    })
    return NextResponse.json(row, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to record CCP' }, { status: 500 })
  }
}


