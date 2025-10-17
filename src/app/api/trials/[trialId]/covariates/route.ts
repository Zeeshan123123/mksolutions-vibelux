import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withResearch } from '@/lib/auth/api-protection'
export const dynamic = 'force-dynamic'

export const POST = withResearch(async (req: NextRequest) => {
  const url = new URL(req.url)
  const trialId = url.pathname.split('/').filter(Boolean).slice(-2)[0]
  const body = await req.json()
  const id = `cov_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  await prisma.$executeRawUnsafe(
    `INSERT INTO "Covariate" (id, trialId, unitId, timestamp, name, value, unit)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    id, trialId, body.unitId || null, body.timestamp || new Date(), body.name, body.value, body.unit || null
  )
  return NextResponse.json({ success: true, id })
})

export const GET = withResearch(async (req: NextRequest) => {
  const search = req.nextUrl.searchParams
  const name = search.get('name')
  const trialId = req.nextUrl.pathname.split('/').filter(Boolean).slice(-2)[0]
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT * FROM "Covariate" WHERE "trialId"=$1 ${name ? 'AND name=$2' : ''} ORDER BY timestamp DESC LIMIT 1000`,
    ...(name ? [trialId, name] : [trialId]) as any
  )
  return NextResponse.json({ covariates: rows })
})


