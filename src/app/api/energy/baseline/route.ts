import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// Helper to get current month period
function getCurrentMonthRange(reference?: Date) {
  const now = reference ? new Date(reference) : new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  // Normalize end to 23:59:59
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { facilityId, ratePerKwh, averageMonthlyKwh, demandKw, periodStart, periodEnd } = body || {}
  if (!facilityId) return NextResponse.json({ error: 'Missing facilityId' }, { status: 400 })

  const facility = await prisma.facility.findUnique({ where: { id: facilityId } })
  if (!facility) return NextResponse.json({ error: 'Facility not found' }, { status: 404 })

  const { start, end } = periodStart && periodEnd
    ? { start: new Date(periodStart), end: new Date(periodEnd) }
    : getCurrentMonthRange()

  // We will persist three baseline records for the current period, mapping legacy inputs
  // 1) Electricity energy (kWh)
  // 2) Peak demand (kW)
  // 3) Energy rate (USD/kWh)
  const ops: Array<Promise<any>> = []

  if (typeof averageMonthlyKwh === 'number') {
    ops.push((async () => {
      const existing = await prisma.energyBaseline.findFirst({
        where: { facilityId, readingType: 'electricity', baselineType: 'monthly', periodStart: start, periodEnd: end }
      })
      if (existing) {
        await prisma.energyBaseline.update({ where: { id: existing.id }, data: { value: averageMonthlyKwh, unit: 'kWh' } })
      } else {
        await prisma.energyBaseline.create({
          data: {
            facilityId,
            baselineType: 'monthly',
            readingType: 'electricity',
            value: averageMonthlyKwh,
            unit: 'kWh',
            periodStart: start,
            periodEnd: end,
          }
        })
      }
    })())
  }

  if (typeof demandKw === 'number') {
    ops.push((async () => {
      const existing = await prisma.energyBaseline.findFirst({
        where: { facilityId, readingType: 'demand', baselineType: 'monthly', periodStart: start, periodEnd: end }
      })
      if (existing) {
        await prisma.energyBaseline.update({ where: { id: existing.id }, data: { value: demandKw, unit: 'kW' } })
      } else {
        await prisma.energyBaseline.create({
          data: {
            facilityId,
            baselineType: 'monthly',
            readingType: 'demand',
            value: demandKw,
            unit: 'kW',
            periodStart: start,
            periodEnd: end,
          }
        })
      }
    })())
  }

  if (typeof ratePerKwh === 'number') {
    ops.push((async () => {
      const existing = await prisma.energyBaseline.findFirst({
        where: { facilityId, readingType: 'rate', baselineType: 'monthly', periodStart: start, periodEnd: end }
      })
      if (existing) {
        await prisma.energyBaseline.update({ where: { id: existing.id }, data: { value: ratePerKwh, unit: 'USD/kWh' } })
      } else {
        await prisma.energyBaseline.create({
          data: {
            facilityId,
            baselineType: 'monthly',
            readingType: 'rate',
            value: ratePerKwh,
            unit: 'USD/kWh',
            periodStart: start,
            periodEnd: end,
          }
        })
      }
    })())
  }

  await Promise.all(ops)

  return NextResponse.json({ success: true, facilityId, periodStart: start.toISOString(), periodEnd: end.toISOString() })
}


