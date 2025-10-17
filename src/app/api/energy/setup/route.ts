import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const facilityName = body.facilityName || 'My Facility'

  // Ensure app user exists
  const appUser = await prisma.user.findFirst({ where: { clerkId: userId } })
  if (!appUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Idempotent: find or create a facility shell and baseline placeholders
  let facility = await prisma.facility.findFirst({ where: { ownerId: appUser.id }, orderBy: { createdAt: 'desc' } })
  if (!facility) {
    facility = await prisma.facility.create({
      data: {
        name: facilityName,
        type: 'GREENHOUSE',
        ownerId: appUser.id,
      }
    })
  }

  // Seed current month baselines if none exist (Prisma EnergyBaseline model)
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  end.setHours(23, 59, 59, 999)

  const existing = await prisma.energyBaseline.findFirst({ where: { facilityId: facility.id, periodStart: start, periodEnd: end } })
  if (!existing) {
    await prisma.$transaction([
      prisma.energyBaseline.create({
        data: {
          facilityId: facility.id,
          baselineType: 'monthly',
          readingType: 'electricity',
          value: 0,
          unit: 'kWh',
          periodStart: start,
          periodEnd: end,
        }
      }),
      prisma.energyBaseline.create({
        data: {
          facilityId: facility.id,
          baselineType: 'monthly',
          readingType: 'demand',
          value: 0,
          unit: 'kW',
          periodStart: start,
          periodEnd: end,
        }
      }),
      prisma.energyBaseline.create({
        data: {
          facilityId: facility.id,
          baselineType: 'monthly',
          readingType: 'rate',
          value: 0.12,
          unit: 'USD/kWh',
          periodStart: start,
          periodEnd: end,
        }
      }),
    ])
  }

  return NextResponse.json({ success: true, facilityId: facility.id })
}


