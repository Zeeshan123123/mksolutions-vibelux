import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withResearch } from '@/lib/auth/api-protection'
import { userHasTrialAccess } from '@/lib/marketplace/entitlements'
export const dynamic = 'force-dynamic'

export const GET = withResearch(async (_req, { userId }: { userId: string }) => {
  const id = _req.nextUrl.pathname.split('/').pop() as string
  const [trial]: any[] = await prisma.$queryRawUnsafe(`SELECT id, name, crop, description, startDate, endDate, createdAt FROM "Trial" WHERE id=$1`, id)
  if (!trial) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const hasAccess = await userHasTrialAccess(userId, id)
  const treatments: any[] = await prisma.$queryRawUnsafe(`SELECT id, name, factor, level FROM "Treatment" WHERE "trialId"=$1`, id)
  const blocks: any[] = await prisma.$queryRawUnsafe(`SELECT id, name FROM "TrialBlock" WHERE "trialId"=$1 ORDER BY name`, id)
  const units: any[] = await prisma.$queryRawUnsafe(`SELECT id, zone, replicate, "treatmentId", "blockId" FROM "TrialUnit" WHERE "trialId"=$1`, id)
  const obsCounts: any[] = await prisma.$queryRawUnsafe(`SELECT metric, COUNT(*)::int as n FROM "Observation" WHERE "trialId"=$1 GROUP BY metric`, id)

  // If the user doesn't have entitlement, return limited public fields (no raw observations)
  if (!hasAccess) {
    return NextResponse.json({ trial: { ...trial, restricted: true }, treatments, blocks, units, observations: obsCounts })
  }

  return NextResponse.json({ trial, treatments, blocks, units, observations: obsCounts })
})


