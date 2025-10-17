import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withResearch } from '@/lib/auth/api-protection'
export const dynamic = 'force-dynamic'

export const POST = withResearch(async (req: NextRequest, { userId }: { userId: string }) => {
  const url = new URL(req.url)
  const trialId = url.pathname.split('/').filter(Boolean).slice(-2)[0]
  const body = await req.json()
  const id = `obs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  await prisma.$executeRawUnsafe(
    `INSERT INTO "Observation" (id, trialId, unitId, timestamp, metric, value, unit, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    id, trialId, body.unitId || null, body.timestamp || new Date(), body.metric, body.value, body.unit || null, JSON.stringify(body.metadata || {})
  )
  return NextResponse.json({ success: true, id })
})

export const GET = withResearch(async (req: NextRequest) => {
  const search = req.nextUrl.searchParams
  const metric = search.get('metric')
  const trialId = req.nextUrl.pathname.split('/').filter(Boolean).slice(-2)[0]
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT * FROM "Observation" WHERE "trialId"=$1 ${metric ? 'AND metric=$2' : ''} ORDER BY timestamp DESC LIMIT 1000`,
    ...(metric ? [trialId, metric] : [trialId]) as any
  )
  return NextResponse.json({ observations: rows })
})


