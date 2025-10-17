import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withResearch } from '@/lib/auth/api-protection'
import { auth } from '@clerk/nextjs/server'
export const dynamic = 'force-dynamic'

export const POST = withResearch(async (req: NextRequest) => {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const id = `trial_${Date.now()}`
  const facilityId = body.facilityId || null

  await prisma.$transaction(async (tx) => {
    // Ensure columns for tenancy exist
    await tx.$executeRawUnsafe(`ALTER TABLE "Trial" ADD COLUMN IF NOT EXISTS "facilityId" TEXT`)
    await tx.$executeRawUnsafe(`ALTER TABLE "Trial" ADD COLUMN IF NOT EXISTS "createdBy" TEXT`)

    await tx.$executeRawUnsafe(
      `INSERT INTO "Trial" (id, name, crop, "facilityId", "createdBy", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
      id, body.name, body.crop || null, facilityId, userId
    )

    const tA = `treatment_${Date.now()}_a`
    const tB = `treatment_${Date.now()}_b`
    await tx.$executeRawUnsafe(`INSERT INTO "Treatment" (id, "trialId", name, factor, level, metadata) VALUES ($1, $2, $3, $4, $5, $6)`, tA, id, body.levelA || body.treatments?.[0]?.name || 'A', 'light', body.levelA || body.treatments?.[0]?.level || 'A', JSON.stringify({}))
    await tx.$executeRawUnsafe(`INSERT INTO "Treatment" (id, "trialId", name, factor, level, metadata) VALUES ($1, $2, $3, $4, $5, $6)`, tB, id, body.levelB || body.treatments?.[1]?.name || 'B', 'light', body.levelB || body.treatments?.[1]?.level || 'B', JSON.stringify({}))

    // Blocks
    for (let b = 1; b <= (body.blocks || 1); b++) {
      const blockId = `block_${id}_${b}`
      await tx.$executeRawUnsafe(`INSERT INTO "TrialBlock" (id, "trialId", name, "createdAt") VALUES ($1, $2, $3, NOW())`, blockId, id, `Block ${b}`)
    }

    // Units by zones
    const zones: Array<{ id: string; treatment: string }> = body.zones || []
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i]
      const unitId = `unit_${id}_${i + 1}`
      const treatmentId = z.treatment === (body.levelA || body.treatments?.[0]?.name) ? tA : tB
      await tx.$executeRawUnsafe(
        `INSERT INTO "TrialUnit" (id, "trialId", "blockId", "treatmentId", zone, replicate, metadata, "createdAt") VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
        unitId, id, `block_${id}_${(i % (body.blocks || 1)) + 1}`, treatmentId, z.id, Math.floor(i / 2) + 1, JSON.stringify({})
      )
    }
  })

  return NextResponse.json({ success: true, id })
})


