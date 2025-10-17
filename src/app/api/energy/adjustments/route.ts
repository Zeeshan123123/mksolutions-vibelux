import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const facilityId = req.nextUrl.searchParams.get('facilityId')
  if (!facilityId) return NextResponse.json({ adjustments: [] })
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT * FROM "EnergyAdjustment" WHERE "facilityId"=$1 ORDER BY "effectiveStart" DESC`,
    facilityId
  )
  return NextResponse.json({ adjustments: rows })
}

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const id = `eadj_${Date.now()}`
  await prisma.$executeRawUnsafe(
    `INSERT INTO "EnergyAdjustment" (id, "facilityId", "effectiveStart", "effectiveEnd", "kwhDelta", "demandKwDelta", "ratePerKwh", "demandChargeRate", reason, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    id,
    body.facilityId,
    body.effectiveStart ? new Date(body.effectiveStart) : new Date(),
    body.effectiveEnd ? new Date(body.effectiveEnd) : null,
    Number(body.kwhDelta || 0),
    Number(body.demandKwDelta || 0),
    body.ratePerKwh != null ? Number(body.ratePerKwh) : null,
    body.demandChargeRate != null ? Number(body.demandChargeRate) : null,
    body.reason || null,
    body.notes || null
  )
  return NextResponse.json({ success: true, id })
}


