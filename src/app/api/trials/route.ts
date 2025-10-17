import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withResearch } from '@/lib/auth/api-protection'
import { auth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export const GET = withResearch(async (req: NextRequest) => {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const facilityId = sp.get('facilityId')

  await prisma.$executeRawUnsafe(`ALTER TABLE "Trial" ADD COLUMN IF NOT EXISTS "facilityId" TEXT`)
  await prisma.$executeRawUnsafe(`ALTER TABLE "Trial" ADD COLUMN IF NOT EXISTS "createdBy" TEXT`)

  let rows: any[] = []
  if (facilityId) {
    rows = await prisma.$queryRawUnsafe(
      `SELECT t.id, t.name, t.crop, t."startDate", t."endDate", t."createdAt"
       FROM "Trial" t
       WHERE t."facilityId"=$1
       ORDER BY t."createdAt" DESC
       LIMIT 200`,
      facilityId
    )
  } else {
    rows = await prisma.$queryRawUnsafe(
      `SELECT t.id, t.name, t.crop, t."startDate", t."endDate", t."createdAt"
       FROM "Trial" t
       WHERE t."createdBy"=$1
       ORDER BY t."createdAt" DESC
       LIMIT 200`,
      userId
    )
  }

  return NextResponse.json({ trials: rows })
})


