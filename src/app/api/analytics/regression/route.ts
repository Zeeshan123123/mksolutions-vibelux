import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

function linearRegression(xs: number[], ys: number[]) {
  const n = xs.length
  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0)
  const sumXX = xs.reduce((a, x) => a + x * x, 0)
  const denom = n * sumXX - sumX * sumX
  if (denom === 0) return { m: 0, b: 0, r2: 0 }
  const m = (n * sumXY - sumX * sumY) / denom
  const b = (sumY - m * sumX) / n
  const yhat = xs.map(x => m * x + b)
  const ssTot = ys.reduce((a, y) => a + Math.pow(y - sumY / n, 2), 0)
  const ssRes = ys.reduce((a, y, i) => a + Math.pow(y - yhat[i], 2), 0)
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0
  return { m, b, r2 }
}

// GET /api/analytics/regression?facilityId=...&x=readingType:temperature&y=readingType:electricity
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sp = req.nextUrl.searchParams
    const facilityId = sp.get('facilityId')
    const xSpec = sp.get('x') || 'readingType:electricity'
    const ySpec = sp.get('y') || 'readingType:gas'
    if (!facilityId) return NextResponse.json({ error: 'facilityId required' }, { status: 400 })

    const xReadingType = xSpec.split(':')[1] || 'electricity'
    const yReadingType = ySpec.split(':')[1] || 'gas'

    // Pull recent readings (last 30 days)
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT readingType, value, EXTRACT(EPOCH FROM DATE_TRUNC('hour', "timestamp"))::bigint as bucket
       FROM "EnergyReading"
       WHERE "facilityId"=$1 AND "timestamp">=$2 AND readingType IN ($3,$4)`,
      facilityId, since, xReadingType, yReadingType
    )

    // Align by hourly bucket
    const byBucket: Record<string, Record<string, number>> = {}
    for (const r of rows) {
      const key = String(r.bucket)
      byBucket[key] = byBucket[key] || {}
      // node-postgres returns lowercase column names by default
      const typeKey = (r as any).readingtype || (r as any).readingType
      byBucket[key][typeKey] = Number(r.value)
    }
    const xs: number[] = []
    const ys: number[] = []
    for (const k of Object.keys(byBucket)) {
      const o = byBucket[k]
      if (o[xReadingType] != null && o[yReadingType] != null) {
        xs.push(o[xReadingType])
        ys.push(o[yReadingType])
      }
    }
    if (xs.length < 3) return NextResponse.json({ error: 'Insufficient paired data' }, { status: 400 })

    const { m, b, r2 } = linearRegression(xs, ys)
    return NextResponse.json({ n: xs.length, slope: m, intercept: b, r2 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Regression failed' }, { status: 500 })
  }
}