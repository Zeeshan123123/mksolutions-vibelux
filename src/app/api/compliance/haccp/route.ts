import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET /api/compliance/haccp?facilityId=...  -> returns plan and recent CCP records
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })

    const plan = await prisma.hACCPPlan.findFirst({ where: { facilityId }, orderBy: { lastUpdated: 'desc' } })
    const ccp = await prisma.cCPRecord.findMany({ where: { facilityId }, orderBy: { timestamp: 'desc' }, take: 100 })
    return NextResponse.json({ plan, ccp })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load HACCP' }, { status: 500 })
  }
}

// POST /api/compliance/haccp/plan  -> create/update plan
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { facilityId, plan, status, version } = body || {}
    if (!facilityId || !plan) return NextResponse.json({ error: 'facilityId and plan required' }, { status: 400 })

    const record = await prisma.hACCPPlan.create({
      data: {
        facilityId,
        plan,
        status: status ?? 'approved',
        version: version ?? '1.0',
      }
    })
    return NextResponse.json(record, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to save plan' }, { status: 500 })
  }
}


