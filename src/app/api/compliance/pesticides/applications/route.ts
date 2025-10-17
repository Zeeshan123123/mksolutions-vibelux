import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

function isHarvestBlocked(appDate: Date, phiDays?: number | null): boolean {
  if (!phiDays || phiDays <= 0) return false
  const now = new Date()
  const unlock = new Date(appDate.getTime())
  unlock.setDate(unlock.getDate() + phiDays)
  return now < unlock
}

// GET /api/compliance/pesticides/applications?facilityId=...&days=30
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    const days = Math.max(1, Math.min(365, Number(sp.get('days') || 30)))
    if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })

    const since = new Date()
    since.setDate(since.getDate() - days)

    const apps = await prisma.pesticideApplication.findMany({
      where: { facilityId, applicationDate: { gte: since } },
      orderBy: { applicationDate: 'desc' },
      include: { inventoryItem: true, operator: true }
    })

    const enriched = apps.map(a => ({
      ...a,
      harvestBlocked: isHarvestBlocked(a.applicationDate, a.preHarvestIntervalDays)
    }))
    return NextResponse.json(enriched)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load applications' }, { status: 500 })
  }
}

// POST /api/compliance/pesticides/applications
// Body: { facilityId, productName, dose, doseUnit?, area?, operatorUserId?, preHarvestIntervalDays?, inventoryItemId? }
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { facilityId, productName, dose } = body || {}
    if (!facilityId || !productName || dose == null) {
      return NextResponse.json({ error: 'facilityId, productName, and dose required' }, { status: 400 })
    }
    const rec = await prisma.pesticideApplication.create({
      data: {
        facilityId,
        productName,
        dose: Number(dose),
        doseUnit: body.doseUnit ?? 'ml/L',
        area: body.area ?? null,
        operatorUserId: body.operatorUserId ?? null,
        preHarvestIntervalDays: body.preHarvestIntervalDays != null ? Number(body.preHarvestIntervalDays) : null,
        inventoryItemId: body.inventoryItemId ?? null,
        notes: body.notes ?? null,
      }
    })
    return NextResponse.json(rec, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create application' }, { status: 500 })
  }
}


